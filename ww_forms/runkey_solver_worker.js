importScripts('english_pent_base64.js'); 
importScripts('bigword_plus_tiny_phrases_cvs.js'); 

var ciph_type;
var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var buffer = [];
var key_len,buf_len;
var plain_text = [];
var key = [];
var pent_table = [];
var max_trials = 10000000;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

// trie stuff
var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;
var word_scoring_flag = false;

function new_trie_element(indx){
	var i;
	
	trie[indx] = new Array();
	for ( i=0;i<26;i++)
		trie[indx][i] = EMPTY;
	trie[indx][END_OF_WORD_INDEX] = 0;
}

function insert_word(wrd){
	var i,j,c,n;
	var current_index,next_index;

	c = wrd.charAt(0);
	n = l_alpha.indexOf(c);
	if ( n == -1) return;
	current_index = n;
	if (wrd.length == 1){
		trie[n][END_OF_WORD_INDEX] = 1;
		return;
	}
	for (i=1;i<wrd.length;i++){
		c = wrd.charAt(i);
		n = l_alpha.indexOf(c);
		if ( n == -1) continue; // skip dashes and apostophes, if they haven't already been removed
		next_index = n;
		if (trie[current_index][next_index] == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][next_index] = max_trie_index;
			max_trie_index++;
		}
		current_index = trie[current_index][next_index];
	}
	trie[current_index][END_OF_WORD_INDEX] = 1;
}

function make_trie(){
	var i;
    var s;
	
	for (i=0;i<26;i++)
		new_trie_element(i);
	max_trie_index = 26;
    s = word_list.split(',');
	for (i =0;i<s.length;i++)
		insert_word(s[i]);

}

function initialize_word_list(){
	var str,n;
	
	make_trie();
	n = word_list.length;
	str = "00~loaded "+n+" words using "+max_trie_index+" trie elements";// don't put zero at beginning
	//document.getElementById('output_area').value = str;	
	postMessage(str);
}

function word_search(n,buf_len){ // n is starting index in plain_text array
	var i,c,current_index;
	var cnt,len;
	
	current_index = plain_text[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	cnt = 1;
	while( ++n< buf_len){
		c = plain_text[n];
		if (c<0 || c>25) break; // maybe parsing an aristocrat and hit blank
		if ( trie[current_index][c] == EMPTY)
			break;
		cnt++;
		current_index = trie[current_index][c];
		if ( trie[current_index][END_OF_WORD_INDEX] == 1) // found word!
			len = cnt;
	}
	return( [len,cnt] );//return length of longest word, and how many letters you could go in trie
}


var base64lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function base64Decode(s) {
 var len=s.length;
 var res = new Array();
 var index=0;
 var i=0;
 var chr1, chr2, chr3;
 var enc1, enc2, enc3, enc4;

 while(i<len) {
  enc1 = base64lookup.indexOf(s.charAt(i++));
  enc2 = base64lookup.indexOf(s.charAt(i++));
  enc3 = base64lookup.indexOf(s.charAt(i++));
  enc4 = base64lookup.indexOf(s.charAt(i++));
  res[index++] = (enc1 << 2) | (enc2 >> 4);
  res[index++] = ((enc2 & 15) << 4) | (enc3 >> 2);
  res[index++] = ((enc3 & 3) << 6) | enc4;
  
 }
 return res;
}


function initialize_pent_table(){
	var i,c,n,v,s,v1;
    var index;

	for ( i = 0; i<26*26*26*26*26;i++)
		pent_table[i] = 0.0;
    var p_values = base64Decode(pent_values);
    // p_values: 4 byte integer for pent index, followed by 2 byte log value scaled up by 100
    index = 0;
    for (i=0;i<p_values.length;i++){
        v = p_values[i];
        //if (v<0) v += 256; // unsigned integers, java needs this, don't know if javascript does, doesn't seem to.
        if(index == 0)
            n = v;
        else if (index==1) n+= 256*v;
        else if (index==2) n+= 256*256*v;
        else if (index==3) n+= 256*256*256*v;
        else if (index==4) v1=v;
        else if (index==5) {
            v1 += 256*v;
            pent_table[n] = v1/100.0; // table values already converted to logs
            index = -1;
        }
        index++;
    }

	//postMessage("00~pent table initialized");
}	
initialize_pent_table();
initialize_word_list();

function do_processing(str1,str2){
    var out_str, out_str2, xfer;
    var pos,old_val;
    var noise_level,cycle_numb,numb_accepted;
    var i,j,n,c,trial,v;
    var score,best_score,current_hc_score;
    var numb_free;
    var free_positions = [];
    
    str1 = str1.toUpperCase();
    key_len = 0;
    for (i=0;i<str1.length;i++){
        c = str1.charAt(i);
        n = alpha.indexOf(c);
        if ( n != -1)
            buffer[key_len++] = n;
    }

    buf_len = 2*key_len;
    for (i=0;i<key_len;i++)
        key[i] = Math.floor(Math.random()*26);
    // fix crib letters
    numb_free = 0;
    for (i=0;i<key_len;i++){
        if (str2.charAt(i) == '-')
            free_positions[numb_free++] = i;
        else {
            c = str2.charAt(i).toUpperCase();
            n = alpha.indexOf(c);
            key[i] = n;
        }
    }            
    score = get_score();
    current_hc_score = best_score = score;
    n = score.toFixed(2);
    //out_str = "plaintext:\n"
    out_str = '';
    for (i=0;i<buf_len;i++){
        if ( i== buf_len/2)
            out_str += '\n';
        out_str += alpha.charAt(plain_text[i]).toLowerCase();
    }
    xfer = {};        
    xfer["s1"] = out_str;
    xfer["s2"] = ''+n;
    postMessage(xfer);
	cycle_limit = 30;
	//fudge_factor = 0.5; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;    
    numb_accepted = 1;
    for ( trial = 0;trial<max_trials;trial++){
        //pos = Math.floor(Math.random()*key_len);
        n = Math.floor(Math.random()*numb_free);
        pos = free_positions[n];
        old_val = key[pos];
        key[pos] = Math.floor(Math.random()*26);
        score = get_score();
        if ( score > best_score){
            best_score = score;
            n = score.toFixed(2);
            //out_str = "Running key ("+ciph_type+" type) plaintext:\n"
            out_str = '';
            for (i=0;i<buf_len;i++){
                if ( i==buf_len/2) // align ley and plaintext vertically
                    out_str += '\n';            
                out_str += alpha.charAt(plain_text[i]).toLowerCase();
            }
            out_str += '\n\n'+ciph_type+' running key:';
            out_str += "\nscore: "+n+" on trial: "+trial+" fudge factor: "+fudge_factor;
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
            out_str += " % accepted: "+v;
            if ( word_scoring_flag)
                out_str += " word scoring is ON"
            else
                out_str += " word scoring is OFF"
            xfer["s1"] = out_str;
            xfer["s2"] = ''+n;
            postMessage(xfer);
        }
        if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {
            if ( score != current_hc_score)
                numb_accepted++;
            current_hc_score = score;
        }
        else {
            key[pos] = old_val;
        }
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v;
            /*
            if (v < dec_limit && cycle_limit>1){
                cycle_limit--;
                s += " decrementing, new cycle len: "+cycle_limit;
            }
            if (v >inc_limit){
                cycle_limit++;
                s += " incrementing, new cycle len: "+cycle_limit;
            }
            */
            s += ')';
            xfer["s1"] = s;
			postMessage(xfer);
		}        
    } // next trial
    xfer["s2"] = "Done";
    postMessage(xfer);
}

function get_score(){
    var i,j,n,c;
    var index,score;
	var word_score,pos,bad_count; 
    var ky,v;
    
    index = 0;
    for (j=0;j<key_len;j++)
            plain_text[index++] = key[j];    
    for (j=0;j<key_len;j++) {
            // vigenere running key 
            if ( ciph_type == 'vig')
                plain_text[index++] = (26+buffer[j] - key[j]) % 26;
            else if (ciph_type == 'bea')
            // beaufort 
                plain_text[index++] = (26-buffer[j] + key[j]) % 26;
            else if (ciph_type == 'var')
            // variant 
                plain_text[index++] = (buffer[j] + key[j]) % 26;
            else { //porta
                ky = Math.floor(key[j]/2);
                v = buffer[j];
                if (v < 13){
                    v += ky;
                    if (v < 13) v += 13;
                }
                else {
                    v -= ky;
                    if (v > 12) v -= 13;
                }  
                plain_text[index++] = v;
            }
    }
	score = 0.0;
	for (i=0;i<buf_len-4;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
            +26*26*26*26*plain_text[i+4];
		score += pent_table[n];
	}
    if ( word_scoring_flag) {
        // get word list score
        pos = 0;
        bad_count = 0;
        word_score = 0;
        while(pos<buf_len){
            n =word_search(pos,buf_len)[0];
            if ( n> CUT_OFF){
                word_score += n*n - bad_count*bad_count;
                bad_count = 0;
                pos += n;
            }
            else {
                pos++;
                if ( n==0)
                    bad_count++;
            }
        }
        word_score -= bad_count*bad_count;
        score += word_score;
    }
    
    return(score);
}    


onmessage = function(event) { //receiving a message with the string to decode. do search
    var str1,str2;
    str1 = event.data.str1;
    str2 = event.data.crib;
    ciph_type = event.data.cipher_type;
    fudge_factor = parseFloat(event.data.fudge);
    max_trials = parseInt(event.data.max_trials);
    word_scoring_flag = event.data.word_scoring;
    do_processing(str1,str2);
};  

