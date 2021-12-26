// PH hill-climber for expanding key
importScripts('english_pent_base64.js'); 
importScripts('bigword_plus_tiny_phrases_cvs.js'); 

var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var original_key=[];
var key=[];
var old_key = [];

var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var max_key_len= 15; // default
var key_len, orig_key_len;
 
var pent_table = [];
// trie stuff
var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 0;

 // Log pent plus word list prefix scoring routines
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

function word_search(n,buf_len){ // n is starting index in key array
	var i,c,current_index;
	var cnt,len;
	
	current_index = key[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	cnt = 1;
	while( ++n< key_len){
		c = key[n];
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

	postMessage("00~pent table initialized");
}	
initialize_word_list();
initialize_pent_table();

 
max_trials = 1000000;


function get_score(){
	var score,i,n,j,k,le;
    var c1,c2,c3,c4;
	var score, max_shift;
    var number_shifts;
	var word_score,pos,bad_count;
	var w_len,max_extent,result;
    
    //var ldi_score1,ldi_score2;
	// get pentagraph score
	score = 0.0;
	for (i=0;i<key_len-4;i++){
		n = key[i]+26*key[i+1]+26*26*key[i+2]+26*26*26*key[i+3]
            +26*26*26*26*key[i+4];
		score += pent_table[n];
	}

	// get word list score
	pos = 0;
	bad_count = 0;
	word_score = 0;
	while(pos<key_len){
		result =word_search(pos,key_len);
        n = result[0];
        max_extent = result[1];
		if ( n> CUT_OFF){
			word_score += n*n - bad_count*bad_count;
            if (max_extent>n)
                word_score += (max_extent-n)*(max_extent-n);
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

    //score = 100*score/(key_len*key_len);
    //score = 100*score/key_len;
	return(score);

}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var h_choice, old_key_len, perfect_score;
    var missing_lets = '';
    //var result,ldi_score, max_ldi_score;
    var old_key_len, op_choice;
    var avail_let, used_let, rep_let_pos;
    
    debugger;
	str = str.toUpperCase();
	orig_key_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			original_key[orig_key_len++] = n;
	}
	//
    for (i=0;i<orig_key_len;i++)
        key[i] = original_key[i]
    key_len = orig_key_len;
    if (max_key_len <= orig_key_len)
        max_key_len = orig_key_len+1;
	cycle_limit = 10;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
	noise_level = begin_level;
	cycle_numb = 0;
    max_score = current_hc_score = score = get_score();
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<key_len;i++)
		out_str += alpha.charAt(key[i]).toLowerCase();
        
	out_str += "\n initial is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        for (i=0;i<key_len;i++)
            old_key[i] = key[i];
        old_key_len = key_len;
        op_choice = 100*Math.random();
        if ( key_len == max_key_len){ // must delete random repeated letter
            rep_letter_pos = [];
            for (i=0;i<key_len-1;i++)
                for (j=i+1;j<key_len;j++)
                    if (key[i] == key[j])
                        rep_letter_pos.push(j);
            n = Math.floor(Math.random()*rep_letter_pos.length)
            // delete the repeated letter at position n
            for (i=rep_letter_pos[n];i<key_len-1;i++)
                key[i] = key[i+1]
                //key.pop(); // removes last element of key, maybe not to avoid garbage collection
            key_len--;
        }
        else if (key_len == orig_key_len ){ // can’t shrink any further
            //insert repeated letter at random position n
            n = Math.floor( Math.random()*key_len) +1;
            // get available letters
            avail_let = [];
            used_let = {};
            for (i=0;i<n;i++) {
                if ( key[i] in used_let ) continue;
                used_let[key[i] ] = 1;
                avail_let.push(key[i]);
            }
            x = Math.floor(Math.random()*avail_let.length)
            for (i= key_len; i>n; i--)
                key[i] = key[i-1]; // javascript automatically has space for expanded array
            key[n] = avail_let[x];	
            key_len++;
        }
        else if ( op_choice< 50 ){ // insert
            //insert repeated letter at random position n
            n = Math.floor( Math.random()*key_len) +1;
            // get available letters
            avail_let = [];
            used_let = {};
            for (i=0;i<n;i++) {
                if ( key[i] in used_let ) continue;
                used_let[key[i] ] = 1;
                avail_let.push(key[i]);
            }
            x = Math.floor(Math.random()*avail_let.length)
            for (i= key_len; i>n; i--)
                key[i] = key[i-1]; // javascript automatically has space for expanded array
            key[n] = avail_let[x];
            key_len++;		
        }
        else {// delete repeated letter
            rep_letter_pos = [];
            for (i=0;i<key_len-1;i++)
                for (j=i+1;j<key_len;j++)
                    if (key[i] == key[j])
                        rep_letter_pos.push(j);
            n = Math.floor(Math.random()*rep_letter_pos.length)
            // delete the repeated letter at position n
            for (i=rep_letter_pos[n];i<key_len-1;i++)
                key[i] = key[i+1]
            //key.pop(); // removes last element of key, try not to use to save garbage collection
            key_len--;
        }
    
		score = get_score();
		if ( score>max_score ){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<key_len;i++)
				out_str += alpha.charAt(key[i]).toLowerCase();
                
			//out_str += "\nscore: "+score+" out of "+perfect_score + ". log di score: "+Math.floor(ldi_score);
            out_str += "\nscore: "+score
            out_str += "\ntrial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += '\n';
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
            //if ( score == perfect_score ) break;
		}
       	if (score > current_hc_score-fudge_factor*26/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else { // restore old key
            for (i=0;i<old_key_len;i++)
            key[i] = old_key[i];
            key_len = old_key_len; // avoid garbage collection, don’t delete end of key unless mandatory

		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
			
		
	} // next trial
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
	max_key_len = parseInt(s[3]);
	// for debugging
	// s = '2max_hat_len passed is: '+period;
	// postMessage(s);
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
