// hill-climber with log pentagraph and word list scoring
// version 2 allows zero letters from a word, so can skip words
// version 3 uses same pent table as trisquare solver and satisifes manifest version 2
importScripts('english_pent_base64.js'); 
importScripts('bigword.js'); 
//postMessage("tet_values loaded");
var pent_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var base_digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

var whitespace="\n\t\r ',-.;=";

var plain_text = new Array();
var key = new Array();
var max_trials;

var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

// crib stuff
var crib;
var crib_array = new Array();
var crib_len;

var words;
var key_len, max_word_len, temp_len;
var numb_letters = new Array();
var index_direction = new Array();

var pattern_len;
//void get_pattern_len(void);

var max_letters,max_key_len;
var plain_limit;

var repeated_crib_flag;

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
	str = "0loaded "+n+" words using "+max_trie_index+" trie elements";
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


initialize_pent_table();
initialize_word_list();
max_trials = 1000000;

function get_plain_text(){
	var i,j,n,ct,index;
	var s;
	
	temp_len = index = ct = 0;	

	for (i=0;i<words.length;i++){
		for (j=0;j<numb_letters[index];j++){
			if (key[ct] < words[i].length) {
				if (index_direction[ct]==1)
					plain_text[temp_len++] = words[i][key[ct]];
				else // count from end of word
					plain_text[temp_len++] = words[i][ words[i].length - 1 - key[ct]];
			}
			ct++;
			if ( ct >= pattern_len) ct = 0;
		}
		index++;
		if (index >= key_len) index = 0;
	}
}


function get_score(){
	var score,i,n,j;
	var word_score,pos,bad_count;
	var w_len, max_crib;

	// decode from word array
	get_plain_text();
	if ( temp_len == 0) return(-10000);
	//if ( temp_len > plain_limit) return(-10000);
	score = 0.0;	
	if ( temp_len > plain_limit) 
		score -= (temp_len-plain_limit)*100;
	if ( crib_len>0) {
		max_crib = 0;
		for (i=0;i<temp_len-crib_len+1;i++)
			if (plain_text[i] == crib_array[0]){
				n = 0;
				for (j=0;j<crib_len;j++)
					if (plain_text[i+j] == crib_array[j]) n++;
				if ( n>max_crib) {
                    max_crib = n;
                    crib_pos = i;
                }
		}
		score += 100*max_crib;
        if ( repeated_crib_flag == '1' ) {
            max_crib = 0;
            for (i=0;i<temp_len-crib_len+1;i++)
                if (plain_text[i] == crib_array[0]){
                    n = 0;
                    for (j=0;j<crib_len;j++)
                        if (i != crib_pos && plain_text[i+j] == crib_array[j]) n++;
                    if ( n>max_crib) {
                        max_crib = n;
                    }
            }
            score += 100*max_crib;
        }
	}
	// get pentagraph score		
	for (i=0;i<temp_len-4;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
			+26*26*26*26*plain_text[i+4];
		score += pent_table[n];
	}
	// get word list score
	pos = 0;
	bad_count = 0;
	word_score = 0;
	while(pos<temp_len){
		n =word_search(pos,temp_len)[0];
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
	
	return(score);
    //return(score/temp_len);
    //return(score/(temp_len*temp_len));
}	

function get_pattern_length(){
	var i;
	
	pattern_len = 0;
	for (i=0;i<key_len;i++)
		pattern_len += numb_letters[i];
}

function random_start(){
	var i;
	
	key_len = Math.floor( Math.random()*max_key_len)+1;
	for (i=0;i<max_key_len;i++) {
		key[i] = Math.floor( Math.random()*max_word_len);
		//key[i] = Math.floor( Math.random()*max_word_len+1); // allow one longer so can skip over words
		//numb_letters[i] = Math.floor( Math.random()*max_letters)+1;
		numb_letters[i] = Math.floor( Math.random()*(max_letters+1)); // allow zero
		index_direction[i] = Math.floor( Math.random()*2);
	}
	get_pattern_length();
}	


function do_hill_climbing(str){
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,spaceFlag;
	var old_key_len;
	var current_action;
	//var max_trials; // now global
	var s,s1;
  
	str = str.toUpperCase();
	// try to get in form of each word separated by just one space, dump all punctuation
	spaceFlag = 0;
	s1 = '';
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = whitespace.indexOf(c);
		if (  n >= 0){
			if (spaceFlag == 1) continue;
			s1 += ' ';
			spaceFlag = 1;
			continue;
		}
		n = alpha.indexOf(c);
		if ( n>=0) {
			s1 += c;
			spaceFlag = 0;
		}
	}
	words = new Array();	
 	s = s1.split(' ');
 	for (i=0;i<s.length-1;i++) { // convert to indices for fast processing. don't count last "word", it's blank
	 	words[i] = new Array();
	 	for (j=0;j<s[i].length;j++){
		 	words[i][j] = alpha.indexOf(s[i].charAt(j));
	 	}
 	}
 	// fix test variables

// pattern for elcondor, AC-964
//  	key_len = 2; // number of words in pattern
//  	pattern_len = 3; // total number of letters in pattern
//  	numb_letters[0] = 1; // number of letters in first word 
//  	numb_letters[1] = 2; //number of letters in second word
//  	index_direction[0] = 1; // start from beginning on first letter
//  	index_direction[1] = 1; // start from beginning on second letter
//  	index_direction[2] = 0; // start from end on third letter
//  	key[0] = 0; // first letter in word
//  	key[1] = 0;
//  	key[2] = 1;
	
	
	// is there anything in the crib array?
	crib_len = 0;		
	if (crib !=''){
		crib = crib.toUpperCase();	
		//for (i in crib) // seems to be an irregular bug in Chrome only with this line-- deleted values show up, 
			//replacement line below works OK
		for (i=0;i<crib.length;i++)
			if (alpha.indexOf(crib.charAt(i))>=0) crib_array[crib_len++]= alpha.indexOf(crib.charAt(i));
	}
		
	max_word_len = 0;
	for (i in words)
		if (words[i].length > max_word_len) max_word_len = words[i].length;
	
	// random start;
	random_start();
	
	// debugging
// 	s = '2'; // 2 is debugging header
// 	s += 'max word len: '+max_word_len;
// 	s += ' max key length: '+max_key_len;
// 	s += ' max plaintext length: '+plain_limit;
// 	s += ' initial key length: '+key_len;
// 	s += ' crib: '+crib;
// 	postMessage(s);

	max_score = current_hc_score = score = get_score();	
	out_str = '0';
	for (i=0;i<temp_len;i++)
		out_str += l_alpha.charAt(plain_text[i]);
	x = score.toFixed(2);
	out_str += "\n Initial score of plaintext is "+x+"\n";
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;

	for (trial = 0;trial < max_trials;trial++){
		current_action = Math.floor( Math.random()*4);
		switch(current_action){
			case 0:
				n1 = Math.floor( Math.random()*pattern_len);
				v1 = key[n1];
				key[n1] = Math.floor( Math.random()*max_word_len);
				//key[n1] = Math.floor( Math.random()*max_word_len+1); // allow one longer so can skip over words
				break;
			case 1:
                old_key_len = key_len;
                if ( max_key_len>1) {
                if (Math.floor( Math.random()*100) < 50) {
                       if (key_len < max_key_len)
                                key_len++;
                        else
                                key_len--;
                 }
                 else {
                        if (key_len>1)
                                 key_len--;
                         else
                                key_len++;
                 }
                 get_pattern_length();
           	  	}
                break;
			case 2:
                 n1 = Math.floor( Math.random()*key_len);
                 v1 = numb_letters[n1];
                 //numb_letters[n1] = Math.floor( Math.random()*max_letters)+1;
                 numb_letters[n1] = Math.floor( Math.random()*(max_letters+1)); // allow zero
                 get_pattern_length();
				break;
			case 3:
                 n1 = Math.floor( Math.random()*pattern_len);
                 v1 = index_direction[n1];
                 index_direction[n1] = Math.floor( Math.random()*2);
                break;
		}   // end switch
		score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			for (i=0;i<temp_len;i++)
				out_str += l_alpha.charAt(plain_text[i]);
			x = score.toFixed(2);
			out_str += "\nscore: "+x+"\nkey: ";
			v2=0;
			while(numb_letters[v2]==0 && v2<key_len) {
				out_str += "word"+v2+" :(skip), ";
				v2++;
			}
			n2 = numb_letters[v2]-1;
			out_str += "word"+v2+" :";
			for (i=0;i<pattern_len;i++){
				out_str += key[i];
				if (index_direction[i]==1)
					out_str +='(+)';
				else
					out_str +='(-) ';
				if ( i>=n2){
					v2++; // move above skip words
					while(numb_letters[v2]==0 && v2<key_len) {
						out_str += ", word"+v2+" :(skip)";
						v2++;
					}
					n2 += numb_letters[v2];
					//v2++; // moved this above while() loop
					if ( i<pattern_len-1) out_str += " ,word"+v2+": ";
				}
			}
			while(numb_letters[v2]==0 && v2<key_len){
				out_str += ", word"+v2+" :(skip)";
				v2++;
			}
			out_str += "\n";				
			
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
		if ( score > current_hc_score){
			current_hc_score = score;
			mut_count = 0;
		}
		else {
			mut_count++;
			switch(current_action){
				case 0:
					key[n1]=v1;
					break;
				case 1:
					key_len = old_key_len;
					break;
				case 2:
					numb_letters[n1]=v1;
					break;
				case 3:
					index_direction[n1]=v1;
			}
			get_pattern_length();
			if ( mut_count > 500){
				mut_count = 0;
				current_hc_score = -10000.0
				//random_start();
				//score = current_hc_score = get_score();
			}
		}
		if ( (trial%100000)==0){
			s = out_str+"(trial: "+trial+")";
			postMessage(s);
		}
	} // next trial
}	
self.onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var str;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@'){
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	max_key_len = parseInt(s[1]);
  	max_letters = parseInt(s[2]);
    plain_limit = parseInt(s[3]);
    repeated_crib_flag = s[4];    
   	n = parseInt(s[5]);
   	Math.random(n); // seed for hill-climbing
  }
  else if (str.charAt(0)  == '~') {// crib
  	if (str.length>1)
  		crib = str.slice(1);
  	else
  		crib = '';
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
		postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
