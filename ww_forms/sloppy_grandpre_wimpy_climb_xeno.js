// PH hill-climber with log pentagraph and word/ phrase list scoring, start with just pent scoring
// wimpy to start with, maybe switch to PH later
//importScripts('bigword.js'); // for key word list

var word_list_len;
var word_list = [];
var pent_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();

var max_trials;
var key = [];
var max_symbol=0;
var min_symbol = 11;
var key_word_len;

var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var inc_limit,dec_limit;

var possible_keys, key_count;
var word_matches, match_counts;

// trie stuff
var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

// crib
var work_sent_flag = false;
var key_str;
var used_let = [];
var used_symbol = [];
var numb_free_lets, numb_free_symbols, numb_free_homs;
var free_lets = [];
var free_symbols = [];
var crib_array;

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

function initialize_pent_table(str){
	var i,c,n,v,s,v1;
    var index;
    var c, n,state;
    var n1,n2,n3,n4,x;
    var max_n,max_v,c1,c2,c3,c4,c5,mc1,mc2,mc3,mc4,mc5;
    var alpha="abcdefghijklmnopqrstuvwxyz";	    

    str = str.toLowerCase();
	for ( i = 0; i<26*26*26*26*26;i++)
		pent_table[i] = 0.0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n == -1) continue; //not a letter
        if (state == 0) {
            n1 = n;
            c1 = c;
        }
        else if (state == 1) {
            n2 = n;
            c2 = c;
        }
        else if (state == 2) {
            n3 = n;
            c3 = c;
        }
        else if (state == 3){
            n4 = n;
            c4 = c;
        }
        else {
            //x = n+26*n3+26*26*n2+26*26*26*n1;
            x = n1+26*n2+26*26*n3+26*26*26*n4+26*26*26*26*n;
            pent_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n4;
            n4 = n;
            if (pent_table[x] > max_v) {
                max_v = pent_table[x];
                mc1 = c1;
                mc2 = c2;
                mc3 = c3;
                mc4 = c4;
                mc5 = c;
            }
            max_n++;
            c1 = c2;
            c2 = c3;
            c3 = c4;
            c4 = c;
        }
        state++;
    }   
    for (i=0;i<26*26*26*26*26;i++)
        pent_table[i] = Math.log(1+pent_table[i]);
    
        
	postMessage("00~pent table initialized");
}	



max_trials = 1000000;

function get_trial_decrypt(){
       var i,j,k, index,x,n;
       var c1,c2,c3,c4;
       var row,col;

        /* get plain text */
        for (j=0;j<buf_len;j++){
	        n = buffer[j];
            row = Math.floor(n/10);
            col = (n % 10);
            if (match_counts[row]>0)
                k = word_matches[row][ key[row] ];
            else
                k = key[row];
            plain_text[j] = possible_keys[ k ][col - min_symbol];
        }
}

function get_score(){
	var score,i,n;
	var word_score,pos,bad_count;
	var w_len;
    
	get_trial_decrypt();
	// get pentagraph score
	score = 0.0;
	for (i=0;i<buf_len-4;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
            +26*26*26*26*plain_text[i+4];
		score += pent_table[n];
	}

	// // get word list score
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
    
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,choice,c1,c2;
	var numb_accepted;
    var c3,c4,old_score,new_score,pos;
    var word_score,old_word_score;
	//var max_trials; // now global
	var s,flag, old_key_index;
    var state;
    var nxt_free;
  
	str = str.toUpperCase();
	buf_len = 0;
    state = 0;
    max_symbol = 0;
    min_symbol = 11;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = digits.indexOf(c);
		if ( n>=0) {
			if (n<min_symbol) min_symbol = n;
			else if (n>max_symbol) max_symbol = n;
            if (state == 0){
                n1 = n;
                state = 1;
            }
            else {
                n += 10*n1;
                buffer[buf_len++] = n;
                state = 0;
            }
        }
	}
    key_word_len = max_symbol-min_symbol+1;
    out_str = '00~'; // 0 at beginning is signal to post message in output box
    out_str += 'key word length is '+key_word_len;
    out_str += ' minimum symbol is '+min_symbol;
    postMessage(out_str);
    // load words that have correct length
    possible_keys = [];
    key_count = 0;
    for (i=0;i<word_list.length;i++){
        if (word_list[i].length != key_word_len) continue;
        possible_keys[key_count] = []
        for (j=0;j<key_word_len;j++)
            possible_keys[key_count][j] = l_alpha.indexOf( word_list[i].charAt(j) );
        key_count++;
    }
    crib_array  = [];
    for (i=0;i<100;i++)
        crib_array[i] = -1;
    if ( work_sent_flag) {
		for (x=0;x< key_str.length;x++)
			if (key_str.charAt(x) != '-'){
				c1= key_str.charAt(x);
				n = l_alpha.indexOf(c1);
                crib_array[x] = n;
		}
    }
    // get possible keys that fit with the crib in the horizontal key slots.
    word_matches = [];
    match_counts = [];
    for (n=min_symbol;n<=max_symbol;n++){
        match_counts[n] = 0;
        word_matches[n] = [];
        for (i=0;i<key_count;i++){
            flag = true;
            for (j=0;j<key_word_len;j++){
                c = crib_array[10*n+min_symbol+j] 
                if ( c != -1 && c != possible_keys[i][j] ){
                    flag = false;
                    break;
                }
            }
            if (flag) { // word will fit in key slot n
                word_matches[n][match_counts[n]] = i;
                match_counts[n]++;
            }
        }
    }
    // start with random collection of key words that fit crib.
    for (n=min_symbol;n<=max_symbol;n++)
        if (match_counts[n]>0)
            key[n] = Math.floor(Math.random()*match_counts[n]);
        else
            key[n] = Math.floor(Math.random()*key_count);
	max_score = current_hc_score = score = get_score();	    
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += l_alpha.charAt(plain_text[i]);
	out_str += "\n score of plaintext is "+x;
	postMessage(out_str);
    // now do hill-climbing
    mut_count = 0;
    for (trial = 0;trial < max_trials;trial++){
        n = Math.floor(Math.random()*key_word_len)+min_symbol;
        old_key_index = key[n];
        if (match_counts[n] > 0 )
            key[n] = Math.floor(Math.random()*match_counts[n]);
        else
            key[n] = Math.floor(Math.random()*key_count);        
        score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += l_alpha.charAt(plain_text[i]);
			out_str += "\ngrandpre sloppy score: "+score.toFixed(2)+" on trial: "+trial;
			// out_str += ", fudge factor: "+fudge_factor;
            // out_str += ", cycle len: "+cycle_limit;
			// out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( work_sent_flag)
                out_str += "\n(Using work from interactive solver.)";
            out_str += '\n';
            for (i=min_symbol;i<=max_symbol;i++){
                if (match_counts[i] > 0)
                    k = word_matches[i][ key[i] ];
                else
                    k = key[i];
                for (j=0;j<key_word_len;j++)
                    out_str += alpha.charAt( possible_keys[k][j] )
                out_str += '\n';
            }
			out_str += '\n';
			postMessage(out_str);
		}
        if ( score > current_hc_score){
            mut_count = 0;
            current_hc_score = score;
        }
        else {
            key[n] = old_key_index;
            mut_count++;
            if ( mut_count > 500) { 
                mut_count = 0;
                current_hc_score = -10000;
            }
        }
		if ( (trial%1000000)==0){
            s = out_str+"\n(trial: "+trial+")";
			// v = 100.0*numb_accepted/(trial+1);
			// v = v.toFixed(2);
			// s = out_str+"\n\n(trial: "+trial+" % accepted: "+v;
            // if (v < dec_limit && cycle_limit>1){
                // cycle_limit--;
                // s += " decrementing, new cycle len: "+cycle_limit;
            // }
            // if (v >inc_limit){
                // cycle_limit++;
                // s += " incrementing, new cycle len: "+cycle_limit;
            // }
            // s += ')';
			postMessage(s);
		}
        
    } // next trial            
    
}    

function make_word_list(word_list_string){
	var str, alpha,out_str,c,n,i;
    var white_space = true;

    var new_word_list = {};    
    
	var alpha="abcdefghijklmnopqrstuvwxyz";    
	word_list_string = word_list_string.toLowerCase();
    debugger;
    var wrd = ''
    // word_list = [];
    // word_list_len = 0;
	for (i=0;i<word_list_string.length;i++){
		c = word_list_string.charAt(i);
        if (c=="'" || c=="") continue; // skip apostrophes, so don't for example will become dont
		n = alpha.indexOf(c);
		if ( n>=0) {
            if (white_space) { // starting new word
                wrd = c;
                white_space = false;
            }
            else // in middle of word
                wrd += c;
        }
        else { // hit white space
            if (wrd.length == 1)
                wrd = ''; //skip single letter "words".
            if ( wrd != '') { // is this a new word?
                if (!(wrd in new_word_list)) {// new word
                    new_word_list[wrd]=1;
                    if ( wrd.length >=8 && wrd.length<=10) word_list[word_list_len++] = wrd; // possible key word
                    insert_word(wrd); // insert word directly into trie, don't need list
                    
                }
                wrd = '';
            }
            white_space = true;
        }
	}
    if ( wrd != '') { // last text element is a letter, presumably ending a word.
        if (!(wrd in new_word_list)) {// new word
            if ( wrd.length >=8 && wrd.length<=10) word_list[word_list_len++] = wrd; // possible key word
             insert_word(wrd); // insert word directly into trie.
        }
    }
}

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
    var op_choice;
    var book_string = '';
    var word_list_string = '';

  debugger;
  op_choice = event.data.op_choice;  

  if (op_choice == 'setup')  {
    max_trials = parseInt(event.data.max_trials);
  	fudge_factor = parseFloat(event.data.fudge_factor);
  	n = parseInt(event.data.seed);
  	Math.random(n); // seed for hill-climbing
    dec_limit = parseFloat(event.data.bot_range);
    inc_limit = parseFloat(event.data.top_range);
  }
  else if (op_choice  == 'crib')  { // crib indicator,
    work_sent_flag = true;
    key_str = event.data.crib_string;
  }
  else if ( op_choice == 'book_string'){
   book_string = event.data.book_string;
    initialize_pent_table(book_string);
    word_list_len = 0;
    // initialize trie;
    trie = [];
	for (i=0;i<26;i++)
		new_trie_element(i);
	max_trie_index = 26;
    make_word_list(book_string);
    word_list_string = event.data.word_list_string;
    if ( word_list_string != '')
        make_word_list(word_list_string); // additional words/phrases
    
  }
  else if ( op_choice == 'solve'){
		postMessage("1working...");
        str = event.data.cipher;
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
