// hill-climber with log tetragraph scoring
//importScripts('tettable.js'); 
//importScripts('tet27table.js'); 
//importScripts('bigword.js'); 
//postMessage("tet_values loaded");
importScripts('english_pent_base64.js'); 
importScripts('bigword_plus_tiny_phrases_cvs.js'); 

var pent_table = [];

var tet_table = new Array();
var tet27_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ[";	
var alpha27  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var whitespace="\n\t\r ',-.;=";

//var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
var key = new Array();
var max_trials;
var patFlag,word_score_flag;

var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

// crib stuff
var used_let = new Array();
var free_lets = new Array();
var free_symbols = Array();
var numb_free_lets, fixed_letters_flag;
var crib_array = new Array();

// floating crib stuff
var crib_flag = 0;
var crib_buffer;

//record which cipher letters are actually there
var c_letters = new Array();

//PH hil-climbing
var fudge_factor;
var cycle_length = 20;
var begin_step = 1.0;
var increment_step = 1.5;

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
	str = "loaded "+n+" words using "+max_trie_index+" trie elements";// don't put zero at beginning
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

	postMessage("00~pent table initialized");
}	
initialize_word_list();
initialize_pent_table();


function get_score(buf_len){
	var score,i,n;
	var word_score,pos,bad_count;
	var w_len;
	var best_match,crib_pos,match,x,y;

	// decode using key
	for (i=0;i<buf_len;i++){
		//if ( buffer[i] == 26)
			//plain_text[i] = 26;
		//else
			plain_text[i] = key[ buffer[i] ];	
	}
	plain_text[buf_len] = EMPTY; // don't run off the end	
		score = 0.0;
		for (i=0;i<buf_len-4;i++){
			n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
				+26*26*26*26*plain_text[i+4];
			score += pent_table[n];
		}
			// get word list score
			pos = 0;
			bad_count = 0;
			word_score = 0;
			while(pos<buf_len){
				n =word_search(pos,buf_len)[0];
				if ( n> CUT_OFF){
					//word_score += n*n - bad_count*bad_count;
					word_score += n*n - bad_count;
					bad_count = 0;
					pos += n;
				}
				else {
					pos++;
					if ( n==0)
						bad_count++;
				}
			}
			//word_score -= bad_count*bad_count;
			word_score -= bad_count;
			score += word_score;
    if (crib_flag == 2){ // floating crib
        best_match = 0;
        for ( crib_pos=0;crib_pos<buf_len-crib_buffer.length+1;crib_pos++)
            if ( plain_text[crib_pos] == crib_buffer[0]) {
                     match = 0.0;
                    for (y=0;y<crib_buffer.length;y++)
                            if ( plain_text[crib_pos+y] == crib_buffer[y]) {
                                    match += 1.0
                    }
                    if (match>best_match) {
                            best_match = match;
                    }
        }
        score += 100.0*best_match;
    }
		
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,spaceFlag;
	var cycle_step, current_step,numb_accepted;
	//var max_trials; // now global
	var s,x;
	var inverse_array = new Array();
	str = str.toUpperCase();
	buf_len = 0;

		for ( i=0;i<str.length;i++){
			c = str.charAt(i);
			n = alpha.indexOf(c);
			if ( n>=0)
				buffer[buf_len++] = n;
				//plain_text[buf_len++] = n;
		}
	for (x=0;x<26;x++) c_letters[x] = 0; //reset in case of multiple ciphers
	for (x=0;x<buf_len;x++)
		if (buffer[x] != 26) c_letters[ buffer[x] ] = 1;
	
	// is there anything in the crib array?
	fixed_letters_flag = 0;
	for (i=0;i<26;i++) {
		used_let[i] = 0;
		key[i] = EMPTY;
		free_symbols[i] = 0;
	}
	for (i=0;i<26;i++)
		if ( crib_array.charAt(i) != '-'){
			used_let[i]=1;
			key[alpha.indexOf(crib_array.charAt(i))] = i;
			fixed_letters_flag = 1;
	}
	if ( fixed_letters_flag == 1){
		numb_free_lets = 0;
		for(i=0;i<26;i++)
			if ( used_let[i] == 0)
				free_lets[numb_free_lets++]=i;
		x=0;
		for (i=0;i<26;i++)
			if (key[i] == EMPTY){
				free_symbols[x] = i;
				key[i] = free_lets[x++];
		}
		if (numb_free_lets == 0){  // already solved interactively?
				score = get_score(buf_len);
				max_score = score;
				for (i=0;i<26;i++)
					inverse_array[ key[i] ] = i;
				x = score.toFixed(2);				
				out_str = '0'; // 0 at beginning is signal to post message in output box
				out_str += x+'~'; // will only display of global max
				for (i=0;i<buf_len;i++)
					out_str += alpha27.charAt(plain_text[i]).toLowerCase();
				//out_str += "\n\nscore of plaintext is "+x+" on trial "+trial+" fudge factor is: "+fudge_factor;
				//out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
				out_str += "\n\nscore of plaintext is "+x+" (no free symbols so no trials)"
				out_str += "\nK1 key                           K2 Key\n"+alpha.slice(0,26)+"       "+l_alpha+"\n";
				for (i=0;i<26;i++) {
					if( c_letters[i] == 1 )
						c = l_alpha.charAt(key[i]);
					else
						c = '-';
					out_str += c;
				}
				out_str += "       ";
				for (i=0;i<26;i++) {
					if( c_letters[ inverse_array[i]] == 1 )
						c = alpha.charAt(inverse_array[i]);
					else
						c = '-';
					out_str += c;
				}			
				out_str += "\n";				
				
				//document.getElementById('output_area').value = out_str;	
				postMessage(out_str);
				return;
		}
	}
	else {	
		for (i=0;i<26;i++)
			key[i] = i;
	}
	// random start;
	if (fixed_letters_flag == 1) {
		for (i=0;i<numb_free_lets;i++){
			x = free_symbols[i];
			c = key[x];
			j = Math.floor( Math.random()*numb_free_lets);
			j = free_symbols[j];
			key[x] = key[j];
			key[j] = c;
		}
	}
	else {
		for (i=25;i>0;i--) {
			j = Math.floor( Math.random()*i);
			c = key[j];
			key[j]=key[i];
			key[i] = c;
		}
	}
	max_score = current_hc_score = score = get_score(buf_len);	
	// show first decrypt right away in case crib has so many letters as to give solution.
			for (i=0;i<26;i++)
				inverse_array[ key[i] ] = i;
			x = score.toFixed(2);				
			out_str = '0'; // 0 at beginning is signal to post message in output box
			out_str += x+'~'; // will only display of global max
			for (i=0;i<buf_len;i++)
				out_str += alpha27.charAt(plain_text[i]).toLowerCase();
			out_str += "\n\nscore of plaintext is "+x+" on trial "+trial+" fudge factor is: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);            
			out_str += "\nK1 key                           K2 Key\n"+alpha.slice(0,26)+"       "+l_alpha+"\n";
			for (i=0;i<26;i++) {
				if( c_letters[i] == 1 )
					c = l_alpha.charAt(key[i]);
				else
					c = '-';
				out_str += c;
			}
			out_str += "       ";
			for (i=0;i<26;i++) {
				if( c_letters[ inverse_array[i]] == 1 )
					c = alpha.charAt(inverse_array[i]);
				else
					c = '-';
				out_str += c;
			}			
			out_str += "\n";				
			
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
	
	mut_count = 0;
	cycle_step = 0;
	current_step = begin_step;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		if ( fixed_letters_flag == 1){
			n1 = Math.floor( Math.random()*numb_free_lets);
			n1 = free_symbols[n1];
			n2 = Math.floor( Math.random()*numb_free_lets);
			n2 = free_symbols[n2];
		}
		else {
			n1 = Math.floor(Math.random()*26);
			n2 = Math.floor(Math.random()*26);
		}
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			for (i=0;i<26;i++)
				inverse_array[ key[i] ] = i;
			x = score.toFixed(2);				
			out_str = '0'; // 0 at beginning is signal to post message in output box
			out_str += x+'~'; // will only display of global max
			for (i=0;i<buf_len;i++)
				out_str += alpha27.charAt(plain_text[i]).toLowerCase();
			out_str += "\n\nscore of plaintext is "+x+" on trial "+trial+" fudge factor is: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);            
			out_str += "\nK1 key                           K2 Key\n"+alpha.slice(0,26)+"       "+l_alpha+"\n";
			for (i=0;i<26;i++) {
				if( c_letters[i] == 1 )
					c = l_alpha.charAt(key[i]);
				else
					c = '-';
				out_str += c;
			}
			out_str += "       ";
			for (i=0;i<26;i++) {
				if( c_letters[ inverse_array[i]] == 1 )
					c = alpha.charAt(inverse_array[i]);
				else
					c = '-';
				out_str += c;
			}			
			out_str += "\n";				
			
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
		if ( score > current_hc_score - fudge_factor*buf_len/current_step){
			current_hc_score = score;
			numb_accepted++;
			//mut_count = 0;
		}
		else {
			key[n1]=v1;
			key[n2]=v2;
			//mut_count++;
			//if ( mut_count > 500)
			//	current_hc_score = -10000.0
		}
		current_step += increment_step;
		if ( ++cycle_step > cycle_length){
			current_step = begin_step;
			cycle_step = 1;
		}
		if ( (trial%100000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
	} // next trial
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var str,s,n;
	var i,j,k,c;
debugger;
  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
  }
  else if (str.charAt(0)  == '~') {// set of parameters
	crib_array = str.slice(2);
  }
  else if (str.charAt(0)  == '^') { // floating crib info
	if (str.charAt(1) == '0') // no flating crib
		crib_flag = 0;
	else {
		crib_flag = 2; // floating crib
		var alpha = 'abcdefghijklmnopqrstuvwxyz';
		crib_buffer = [];
        s = str.slice(2).toLowerCase();
        j = 0;
        for (i=0;i<s.length;i++){
            c = s.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0)
               crib_buffer[j++] = n;
        }
    }
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
		postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
