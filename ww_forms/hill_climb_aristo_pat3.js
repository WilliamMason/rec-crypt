// hill-climber with log tetragraph scoring
importScripts('tettable.js'); 
importScripts('tet27table.js'); 
importScripts('bigword.js'); 
//postMessage("tet_values loaded");
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
	
	for (i=0;i<26;i++)
		new_trie_element(i);
	max_trie_index = 26;
	for (i in word_list)
		insert_word(word_list[i]);

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



function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	for ( i = 0; i<27*27*27*27;i++)
		tet27_table[i] = 0.0;
	for ( c in tet27_values){
		n = alpha.indexOf(tet27_values[c].charAt(0))+	27*alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet27_table[n] = v;
	}
	
	postMessage("tet tables initialized"); // don;t put zero at beginning
}	
initialize_tet_table();
initialize_word_list();
max_trials = 1000000;

function get_score(buf_len){
	var score,i,n;
	var word_score,pos,bad_count;
	var w_len;

	// decode using key
	for (i=0;i<buf_len;i++){
		if ( buffer[i] == 26)
			plain_text[i] = 26;
		else
			plain_text[i] = key[ buffer[i] ];	
	}
	plain_text[buf_len] = EMPTY; // don't run off the end	
	if ( patFlag == '1'){
		// get tetgraph score		
		score = 0.0;
		for (i=0;i<buf_len-3;i++){
			n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
			score += tet_table[n];
		}
		if ( word_score_flag == '1'){
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
		}
	}
	else {
		// get tetgraph score		
		score = 0.0;
		for (i=0;i<buf_len-3;i++){
			n = plain_text[i]+27*plain_text[i+1]+27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
			score += tet27_table[n];
		}
		if ( word_score_flag == '1'){		
        	// word list
        	word_score = 0;
        	pos = 0;
        	while ( pos<buf_len) {
	    	    while(pos<buf_len && plain_text[pos] == 26) pos++; // skip blanks
	    	    w_len = 0;
	    	    while( pos+w_len<buf_len && plain_text[pos+w_len] != 26) w_len++;
	    	    n = word_search(pos,buf_len)[0];
	    	    if ( n == w_len) word_score += n*n; // word has correct length
	    	    pos += w_len;
        	}
        	score += word_score;
    	}
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
	/*
	if ( patFlag == '1')
		fudge_factor = 0.7;
	else fudge_factor = 0.5;
	*/	  
	str = str.toUpperCase();
	buf_len = 0;
	if ( patFlag == '1'){	
		for ( i=0;i<str.length;i++){
			c = str.charAt(i);
			n = alpha.indexOf(c);
			if ( n>=0)
				buffer[buf_len++] = n;
				//plain_text[buf_len++] = n;
		}
	}
	else {
		spaceFlag = 0;
		for ( i=0;i<str.length;i++){
			c = str.charAt(i);
			n = whitespace.indexOf(c);
			if (  n >= 0){
				if (spaceFlag == 1) continue;
				buffer[buf_len++] = 26;
				spaceFlag = 1;
				continue;
			}
			n = alpha.indexOf(c);
			if ( n>=0) {
				buffer[buf_len++] = n;
				spaceFlag = 0;
			}
				//plain_text[buf_len++] = n;
		}
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
	//out_str = '0';
	//for (i=0;i<buf_len;i++)
	//	out_str += alpha27.charAt(plain_text[i]).toLowerCase();
	//x = score.toFixed(2);
	//out_str += "\n score of plaintext is "+x;
	//document.getElementById('output_area').value = out_str;	
	//postMessage(out_str);
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

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
  }
  else if (str.charAt(0)  == '~') {// set of parameters
  	//trial = parseInt(str.slice(1));
  	//Math.random(trial);
  	patFlag = str.charAt(1);
  	word_score_flag = str.charAt(2);
  	crib_array = str.slice(3);
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
		postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
