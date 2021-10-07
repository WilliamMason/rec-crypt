// PH hill-climber with log pentagraph and (reverse) word/ phrase list suffix scoring
//postMessage("pent_values loaded");
var pent_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();

var max_trials;
var key = [];
var hom = [];
var max_symbol=0;
var numb_homophones;
var grandpreFlag=false;

var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var inc_limit,dec_limit;

// trie stuff
var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

// hill-climbing speedup stuff, indexing
var chain_start = [];
var chain = [];
var used_pent = [];
var inv_key = [];

// crib
var work_sent_flag = false;
var key_str;
var used_let = [];
var used_symbol = [];
var numb_free_lets, numb_free_symbols, numb_free_homs;
var free_lets = [];
var free_symbols = [];

function new_trie_element(indx){
	var i;
	
	trie[indx] = new Array();
	for ( i=0;i<26;i++)
		trie[indx][i] = EMPTY;
	trie[indx][END_OF_WORD_INDEX] = 0;
}

function insert_rev_word(wrd){
	var i,j,c,n;
	var current_index,next_index;
    var le;

    le = wrd.length;
	c = wrd.charAt(le-1);
	n = l_alpha.indexOf(c);
	if ( n == -1) return;
	current_index = n;
	if (le == 1){
		trie[n][END_OF_WORD_INDEX] = 1;
		return;
	}
	for (i=1;i<le;i++){
		c = wrd.charAt(le-1-i);
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


function rev_word_search(n,buf_len){ // n is starting index in plain_text array
	var i,c,current_index;
	var cnt,len;
	
	current_index = plain_text[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	cnt = 1;
	while( --n >= 0){
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
       var i,j,k, index,x;
       var c1,c2,c3,c4;

        /* get plain text */
        for (j=0;j<buf_len;j++){
	        c = key[ buffer[j] ];
	        if ( c>25) c = hom[c-26];
            plain_text[j] = c;
        }
 }
	

function get_score(){
	var score,i,n;
	var word_score,pos,bad_count;
	var w_len,max_extent,result;
    
	get_trial_decrypt();
	// get pentagraph score
	score = 0.0;
	for (i=0;i<buf_len-4;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
            +26*26*26*26*plain_text[i+4];
		score += pent_table[n];
	}

	// get word list score
	pos = buf_len-1;
	bad_count = 0;
	word_score = 0;
	while(pos >= 0){
		result = rev_word_search(pos,buf_len);
        n = result[0];
        max_extent = result[1];
		if ( n> CUT_OFF){
			word_score += n*n - bad_count*bad_count;
            if (max_extent>n)
                word_score += (max_extent-n)*(max_extent-n);
			bad_count = 0;
			pos -= n;
		}
		else {
			pos--;
			if ( n==0)
				bad_count++;
		}
	}
	word_score -= bad_count*bad_count;
	score += word_score;
    
	return(score);
}	

function get_wrd_score() {
	var i,index,n;
	var bad_count;
	var wrd_score;
    var max_extent,result;
    
    i = buf_len-1;
    bad_count = 0;
    wrd_score = 0;
    while ( i >= 0) {
	    result = rev_word_search(i,buf_len);
        n = result[0];
        max_extent = result[1];
	    if ( n>CUT_OFF) {
            wrd_score += n*n-bad_count*bad_count;
            if (max_extent>n)
               wrd_score += (max_extent-n)*(max_extent-n);
            i -= n;
            bad_count = 0;
	    }
	    else {
            if ( n==0) bad_count++;
            i -= 1;
	    }
    }
	wrd_score -= bad_count*bad_count; 
    
	return(wrd_score); 
}				


function pos_score(pos, flag) {
	// sum all pentagraphs that intersect the position "pos" 
	// except don't count those that have already been counted in a previous call, those are
	// marked in the used_pent array.
	var j;
	var index;
	var pos_sum;

	pos_sum = 0.0;
	for (j=0;j<5;j++) {
		if( pos-4+j<0 || pos+j >= buf_len || used_pent[pos-4+j] == flag) continue;
		index = plain_text[pos-4+j]+26*plain_text[pos-3+j]+26*26*plain_text[pos-2+j]+26*26*26*plain_text[pos-1+j]
			+ 26*26*26*26*plain_text[pos+j];
		pos_sum += pent_table[index];		
		used_pent[pos-4+j] = flag;
	}
	return(pos_sum);
} // end pos_score


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
	var s;
    var state;
    var no_zero_flag;
    var no_nine_flag;
    var nxt_free;    
    var used_sym = [];            
  
	str = str.toUpperCase();
	buf_len = 0;
    state = 0;
    if (max_symbol=0) max_symbol = 25;
	no_zero_flag = true;
	no_nine_flag = true;
	grandpreFlag = false;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = digits.indexOf(c);
		if ( n>=0) {
			if (n==0) no_zero_flag = false;
			else if (n==9) no_nine_flag = false;
            if (state == 0){
                n1 = n;
                state = 1;
            }
            else {
                n += 10*n1;
                buffer[buf_len++] = n;
                if ( n>max_symbol) max_symbol = n;
                state = 0;
            }
        }
	}
	if ( no_zero_flag && no_nine_flag) {// Grandpre, translate into range 00-63
		grandpreFlag = true;
		max_symbol = 63;
		for (i=0;i<buf_len;i++){
			x = buffer[i];
			n = Math.floor( (x-11)/10 );
			buffer[i] = x-11-2*n;
		}
	}
    if ( work_sent_flag) {
		nxt_free = 26;				    
		for (x=0;x<26;x++) used_let[x] = 0;
		for (x=0;x<=max_symbol;x++){
			used_symbol[x] = 0;
			key[x] = -1;
		}
		for (x=0;x< key_str.length;x++)
			if (key_str.charAt(x) != '-'){
				c1= key_str.charAt(x);
				c = l_alpha.indexOf(c1);
				if (grandpreFlag){
					n = Math.floor( (x-11)/10 );
					n = x-11-2*n;
				}
				else
					n = x;
				if ( used_let[c] == 0 ){
					used_let[c] = 1;
					used_symbol[n] = 1;
					key[n]=c;
				}
				else {// we've got a homophone for c
					used_symbol[n] = 1;
					hom[nxt_free-26] = c;
					key[n] = nxt_free;
					nxt_free++;
				}
		}
        
		numb_free_lets = 0;
		for (j=0;j<26;j++){
			if (used_let[j] == 1) continue;
			free_lets[numb_free_lets++] = j;
		}
		numb_free_symbols=0;
		for (j=0;j<=max_symbol;j++){
			if ( used_symbol[j]==1 ) continue;
			free_symbols[numb_free_symbols++] = j;
		}
        numb_free_homs = max_symbol-nxt_free+1;
		n=0;		
		k=0;
		for (j=0;j<=max_symbol;j++) {
			if ( key[j] != -1) continue; // already solved for this symbol
				if ( n<numb_free_lets)
					key[j] = free_lets[n++];
				else {
					key[j] = nxt_free+k;
					k++;
				}
		}
		if ( numb_free_symbols == 0 || numb_free_homs <=0){
			postMessage("No free symbols! Already solved?");	
			return;
		}
		for (i=numb_free_symbols-1;i>2 ; i--) {
			x = free_symbols[i];
		    k = key[x];
		    //j = r.nextInt(i);
            j = Math.floor(Math.random()*i)
		    j = free_symbols[j];
		    key[x] = key[j];
		    key[j] = k;
		}
		for (i=0;i<numb_free_homs;i++)
			//hom[nxt_free+i-26] = (char)r.nextInt(26);
            hom[nxt_free+i-26] = Math.floor(Math.random()*26);
	}
    else {
        for (j=0;j<=max_symbol;j++)
            key[j] = j;
        numb_homophones = max_symbol - 25;        	
        // random start;
        for (i = max_symbol; i > 1;i--) {
            c = key[i];
            j = Math.floor( Math.random()*i);
            key[i]=key[j];
            key[j]=c;
        }
        for (i=0;i<numb_homophones;i++)
            hom[i] = Math.floor( Math.random()*26);
    }
    
	// create chain to index cipher symbols
	for (j=0;j<100;j++) chain_start[j] = -1; // -1 stand for EMPTY
	for (j=0;j<buf_len;j++) {
		n = buffer[j];
		chain[j] = chain_start[n];
		chain_start[n] = j;
	}
	for (j=0;j<buf_len;j++) used_pent[j]=0;
    // will also need inverse key to look up symbols to which the hom[] symbols are mapped
	for (j=0;j<=max_symbol;j++)
		inv_key[ key[j] ] = j;
   
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score();	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
    old_word_score = get_wrd_score();
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		choice =  Math.floor(Math.random()*100);
		if (choice<50 || numb_homophones == 0) {
            if ( work_sent_flag) {
				//n = rand.nextInt(numb_free_symbols);
                n = Math.floor(Math.random()*numb_free_symbols);
				//x = rand.nextInt(numb_free_symbols);
                x = Math.floor(Math.random()*numb_free_symbols);
				//while ( n==x) x = rand.nextInt(numb_free_symbols);
                while ( n==x) x = Math.floor(Math.random()*numb_free_symbols);
				n1 = free_symbols[n];
				n2 = free_symbols[x];
            }
            else {
                n1 = Math.floor(Math.random()*(max_symbol+1));
                n2 = Math.floor(Math.random()*(max_symbol+1));
                while (n1==n2) n2 = Math.floor(Math.random()*(max_symbol+1));
             }
			c1 = key[n1];
			c2 = key[n2];
			if (c1 > 25) c3 = hom[c1-26];
			else c3 = c1;
			if ( c2 > 25) c4 = hom[c2-26];
			else c4 = c2;
			// get old score (score before replacement)
			pos = chain_start[n1];
			if (pos == -1)
				old_score = 0;
			else {
				old_score = pos_score(pos,1);
               	while( (pos = chain[pos]) != -1 )
                  		old_score += pos_score(pos,1);
              	}
               pos= chain_start[n2];
               if ( pos != -1) {
               	old_score += pos_score(pos,1);
               	while( (pos = chain[pos]) != -1 )
                  		old_score += pos_score(pos,1);
           	}
            // do swap
            pos = chain_start[n1];
            if ( pos != -1 ){
            	plain_text[pos] = c4;
            	while ( (pos=chain[pos]) != -1)
            		plain_text[pos] = c4;
           	}
            pos = chain_start[n2];
            if ( pos != -1) {
            	plain_text[pos] = c3;
            	while ( (pos=chain[pos]) != -1)
            		plain_text[pos] = c3;
           	}
			// get new score (score after swap)
			pos = chain_start[n1];
			if ( pos == -1)
				new_score = 0;
			else {
				new_score = pos_score(pos,0);
               	while( (pos = chain[pos]) != -1 ){
               	   	new_score += pos_score(pos,0);
              		}
           	}
            pos= chain_start[n2];
            if ( pos != -1) {
                new_score += pos_score(pos,0);
            	while( (pos = chain[pos]) != -1 ){
               	   	new_score += pos_score(pos,0);
              	}
           	}
			//key[n1] = c2;
			//key[n2] = c1;
		}
		else {
            if ( work_sent_flag){
                	n1 = Math.floor(Math.random()*numb_free_homs);
                	n1 += nxt_free-26;
            }
            else
                n1 = Math.floor(Math.random()*numb_homophones);
			c1 = hom[n1];
            c2 = Math.floor(Math.random()*26);
            while(c1 == c2) c2 = Math.floor(Math.random()*26);
            n2 = inv_key[n1+26];
            // get score before replacement
            pos= chain_start[n2];
            if (pos == -1)
            	old_score = 0;
            else {
            	old_score = pos_score(pos,1);
            	pos = chain[pos];
            	while( pos != -1 ){
            	   	old_score += pos_score(pos,1);
            	   	pos = chain[pos];
                }
           	}
			// do replacement                    
            pos = chain_start[n2];
            if ( pos != -1 ){
              		plain_text[pos] = c2;
              		while ( (pos=chain[pos]) != -1)
              			plain_text[pos] = c2;
           	}
            // get score after replacement
            pos= chain_start[n2];
            if ( pos == -1)
            	new_score = 0;
            else {
            	new_score = pos_score(pos,0);
            	while( (pos = chain[pos]) != -1 ){
            	   	new_score += pos_score(pos,0);
                }
           	}
			//hom[n1] = c2;
		}
        score = current_hc_score + (new_score - old_score);
        score -= old_word_score;
        word_score = get_wrd_score();
        score += word_score;
		//score = get_score();
       	if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {
            // new key accepted, update key and inverse key arrays
			if (choice<50 || numb_homophones == 0) {
				key[n1] = c2;
				key[n2] = c1;
				inv_key[ key[n1]]=n1;
				inv_key[ key[n2]] =n2;
			}
			else
				hom[n1] = c2;
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            old_word_score = word_score;
            // score_sum += score;
            // accepted_count++;	
            if ( score>max_score){
                max_score = score;
                out_str = '0'; // 0 at beginning is signal to post message in output box
                x = score.toFixed(2);
                out_str += x+'~';
                for (i=0;i<buf_len;i++)
                    out_str += alpha.charAt(plain_text[i]).toLowerCase();
                out_str += "\nsuffix score: "+score.toFixed(2)+" on trial: "+trial;
                out_str += ", fudge factor: "+fudge_factor;
                out_str += ", cycle len: "+cycle_limit;            
                out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                if ( work_sent_flag)
                    out_str += "\n(Using work from interactive solver.)";
                if (grandpreFlag) out_str += "\nGrandpre Key (translated to range 00-63):\n";
                else out_str += '\nKey: ';
                for (i=0;i<=max_symbol;i++)
                    out_str += i+' ';
                out_str += '\n     ';
                // only display key letters that occur in the cipher
                for (i=0;i<=max_symbol;i++) used_sym[i] = false;
                for (i=0;i<buf_len;i++)
                    used_sym[ buffer[i] ] = true;
                for (i=0;i<=max_symbol;i++){
                    n = key[i];
                    if (n>25) n = hom[n-26]
                    if ( used_sym[i] )
                        out_str += l_alpha.charAt(n)+' ';
                    else
                        out_str += '- ';
                    if (i>9) out_str += ' ';
                }                                
                out_str += '\n';
                postMessage(out_str);
            }			
		}		
		else {
            // undo substitution
            if ( choice<50 || numb_homophones ==0) {
	            //key[n1] = c1;
	            //key[n2] = c2;
	            // undo swap
           		pos = chain_start[n1];
           		if ( pos != -1){
           			plain_text[pos] = c3;
           			while ( (pos=chain[pos]) != -1)
           				plain_text[pos] = c3;
       			}
           		pos = chain_start[n2];
           		if ( pos != -1) {
           			plain_text[pos] = c4;
           			while ( (pos=chain[pos]) != -1)
           				plain_text[pos] = c4;
        	    }
            }
            else {
            	//hom[n1] = c1;
            	// undo replacement
           		pos = chain_start[n2];
           		if ( pos != -1){
           			plain_text[pos] = c1;
           			while ( (pos=chain[pos]) != -1)
           				plain_text[pos] = c1;
        		}
            }
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
            if (v < dec_limit && cycle_limit>1){
                cycle_limit--;
                s += " decrementing, new cycle len: "+cycle_limit;
            }
            if (v >inc_limit){
                cycle_limit++;
                s += " incrementing, new cycle len: "+cycle_limit;
            }
            s += ')';
			postMessage(s);
		}
			
		
	} // next trial
}	

function make_word_list(word_list_string){
	var str, alpha,out_str,c,n,i;
    var white_space = true;
    var word_list_len;
    var new_word_list = {};    
    
	var alpha="abcdefghijklmnopqrstuvwxyz";    
	word_list_string = word_list_string.toLowerCase();
    debugger;
    var wrd = ''
    word_list = [];
    word_list_len = 0;
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
                    //word_list[word_list_len++] = wrd; // also put in an array so you can sort it.
                    //insert_word(wrd); // insert word directly into trie, don't need list
                    insert_rev_word(wrd); // insert directly into reverse trie
                    
                }
                wrd = '';
            }
            white_space = true;
        }
	}
    if ( wrd != '') { // last text element is a letter, presumably ending a word.
        if (!(wrd in new_word_list)) {// new word
            //word_list[word_list_len++] = wrd; // also put in an array so you can sort it.
             //insert_word(wrd); // insert word directly into trie.
             insert_rev_word(wrd);  // insert directly into reverse trie
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
