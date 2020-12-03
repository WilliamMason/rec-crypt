var EMPTY = -1;
var LETTER_INDEX = 0
var END_OF_WORD_INDEX = 1
var ALT_INDEX = 2;
var NXT_INDEX = 3;
var END_SYMBOL = 27;
var trie = new Array();
var max_trie_index = -1;
var alpha = "abcdefghijklmnopqrstuvwxyz";
var plain_text = new Array();
var buf_len;
var CUT_OFF = 2;

var backtrack_lengths = new Array();

var reverse_trie_start = new Array();

var word_list = [];
var word_list_array=[];

var file_list = '';

function make_word_list(b_array){
	var s,n;
    var state,i,c,index;
    
    // construct word list
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<b_array.length;i++) {
        //c = str.charAt(i);
        n = b_array[i];
        if (n>=65 && n<(65+26)) // upper case
            n -=65;
        else if (n>=97 && n<(97+26)) // lower case
            n -= 97;
        else n = -1;
        //n = alpha.indexOf(c);
        if ( state == 0 && n >=0){
            //s = c;
            s = alpha.charAt(n);
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += alpha.charAt(n);
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;
	
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;	
	//postMessage(s);
}


function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	//str = "handle list file: "+fname.fileName;
    file_list += fname.name+' ';
	//alert(str);
	getAsArray(fname);
	
}


function getAsArray(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsArrayBuffer(readFile);
  
}

function updateProgress(evt) {
  if (evt.lengthComputable) {
    // evt.loaded and evt.total are ProgressEvent properties
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      // Increase the prog bar length
      // style.width = (loaded * 200) + "px";
    }
  }
}

function loaded(evt) {  
  // Obtain the read file data    
  var fileArray = evt.target.result;
  var s;
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;  
  

  word_list_array  = new Uint8Array(fileArray);
    s = "The length of the file is "+word_list_array.length;
  document.getElementById('output_area').value = s;
  make_word_list(word_list_array)
  make_trie();
  n = word_list.length;
  str = "loaded "+n+" words using "+max_trie_index+" forward and reverse trie elements";
  document.getElementById('output_area').value = str;		

  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


	
function new_trie_element(indx){
	var i;
	
	trie[indx] = new Array();
	trie[indx][LETTER_INDEX]= EMPTY;
	trie[indx][END_OF_WORD_INDEX]= 0;
	trie[indx][ALT_INDEX]= EMPTY;
	trie[indx][NXT_INDEX]= EMPTY;
}

function insert_word(wrd){
	var i,j,c,n;
	var current_index,next_index,next_letter;

	c = wrd.charAt(0);
	n = alpha.indexOf(c);
	if ( n == -1) return;
	current_index = n;
	if (wrd.length == 1){
		trie[n][END_OF_WORD_INDEX] = 1;
		return;
	}
	next_index = trie[current_index][NXT_INDEX];	
	for (i=1;i<wrd.length;i++){
		c = wrd.charAt(i);
		n = alpha.indexOf(c);
		if ( n == -1) continue; // skip dashes and apostophes, if they haven't already been removed
		next_letter = n;
		if (next_index == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][NXT_INDEX] = max_trie_index;
			trie[max_trie_index][LETTER_INDEX]=next_letter;
			next_index = max_trie_index;
			max_trie_index++;
		}
		else while(1){
			if (trie[next_index][LETTER_INDEX] == next_letter) break;
			current_index = next_index;
			next_index = trie[current_index][ALT_INDEX];
			if ( next_index == EMPTY){
				new_trie_element(max_trie_index);
				trie[current_index][ALT_INDEX] = max_trie_index;
				trie[max_trie_index][LETTER_INDEX]=next_letter;
				next_index = max_trie_index;
				max_trie_index++;
			}
		}
		current_index = next_index;
		if ( i== wrd.length-1)
			trie[current_index][END_OF_WORD_INDEX]=1;
		else
			next_index = trie[current_index][NXT_INDEX];
	}

}

function insert_rev_word(wrd){
	var i,j,c,n,le;
	var current_index,next_index;

	le = wrd.length;
	c = wrd.charAt(le-1);// last char in word
	n = alpha.indexOf(c);
	if ( n == -1) return;
	current_index = reverse_trie_start[n];
	if (wrd.length == 1){
		trie[current_index][END_OF_WORD_INDEX] = 1;
		return;
	}
	next_index = trie[current_index][NXT_INDEX];	
	for (i=1;i<wrd.length;i++){
		c = wrd.charAt(le-1-i);
		n = alpha.indexOf(c);
		if ( n == -1) continue; // skip dashes and apostophes, if they haven't already been removed
		next_letter = n;
		if (next_index == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][NXT_INDEX] = max_trie_index;
			trie[max_trie_index][LETTER_INDEX]=next_letter;
			next_index = max_trie_index;
			max_trie_index++;
		}
		else while(1){
			if (trie[next_index][LETTER_INDEX] == next_letter) break;
			current_index = next_index;
			next_index = trie[current_index][ALT_INDEX];
			if ( next_index == EMPTY){
				new_trie_element(max_trie_index);
				trie[current_index][ALT_INDEX] = max_trie_index;
				trie[max_trie_index][LETTER_INDEX]=next_letter;
				next_index = max_trie_index;
				max_trie_index++;
			}
		}
		current_index = next_index;
		if ( i== wrd.length-1)
			trie[current_index][END_OF_WORD_INDEX]=1;
		else
			next_index = trie[current_index][NXT_INDEX];
	}
	
}


function make_trie(){ // both forward and reverse
	var i;
	
    if ( max_trie_index == -1) {
        for (i=0;i<26;i++){
            new_trie_element(i);
            trie[i][LETTER_INDEX]=i;
            new_trie_element(i+26);
            trie[i+26][LETTER_INDEX]=i;		
        }
        for (i=0;i<26;i++)
            reverse_trie_start[i] = i+26;
        max_trie_index = 26*2;
    }
	for (i=0;i<word_list.length;i++) {
		insert_word(word_list[i]);
		insert_rev_word(word_list[i]);
	}
    document.getElementById('list_area').value = file_list;
}

function word_search(n){ // n is starting index in plain_text array
	var i,c,current_index;
	var cnt,len, numb_words,next_index, pos;

	
	numb_words = 0;
	//backtrack_lengths[n][0]=0;
	current_index = plain_text[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	if ( len==1 || plain_text[n+1]==END_SYMBOL){
		len=1;
		numb_words = 1;
		backtrack_lengths[n][numb_words]=1;
	}
	cnt = 1;
	next_index = trie[current_index][NXT_INDEX];
	pos= n+1;
	while( pos< buf_len && next_index != EMPTY){
		c = plain_text[pos];
		if (c<0 || c>25) break; // maybe parsing an aristocrat and hit blank
		if ( trie[next_index][LETTER_INDEX] == c){
			cnt++;
			if (trie[next_index][END_OF_WORD_INDEX] == 1 || plain_text[pos+1]==END_SYMBOL){
				len = cnt;
				numb_words++;
				backtrack_lengths[n][numb_words]=len;
			}
			next_index = trie[next_index][NXT_INDEX];
			pos++;
		}
		else
			next_index = trie[next_index][ALT_INDEX];
	}
	//return length of longest word, and number of words (lengths stored in backtrack_lengths array)
	return( [len,numb_words,cnt] );
}

function suffix_search(n,len){ // n is position in plain_text array, len is suffix length you are looking for
	var i,c,current_index;
	var cnt, numb_words,next_index, pos;

	pos = n;
	c = plain_text[n];
	if ( c<0 || c>25) return(0); // not a letter
	current_index = reverse_trie_start[c];
	next_index = trie[current_index][NXT_INDEX];
	cnt = 1;
	if ( cnt >=len) return(len); // long enough suffix!
	pos--; // never negative because len is known to be OK, and you will never go past that
	c = plain_text[pos]; 
	while( next_index != EMPTY){
		if ( trie[next_index][LETTER_INDEX] == c){
			cnt++;
			if ( cnt >=len) return(len); // long enough suffix!
			next_index = trie[next_index][NXT_INDEX];
			pos--; // never negative because len is known to be OK, and you will never go past that
			c = plain_text[pos]; 
		}
		else
			next_index = trie[next_index][ALT_INDEX];
	}
	return(cnt);
}
			

function rev_word_search(n){ // n is index of last letter from word in plain_text array
	var i,c,current_index;
	var cnt,len, numb_words,next_index, pos;

	numb_words = 0;
	i = plain_text[n];
	if ( i<0 || i > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	current_index = reverse_trie_start[i];
	len = trie[current_index][END_OF_WORD_INDEX];
	if ( len==1){
		numb_words = 1;
	}
	cnt = 1;
	next_index = trie[current_index][NXT_INDEX];
	pos= n-1;
	while( pos>=0 && next_index != EMPTY){
		c = plain_text[pos];
		if (c<0 || c>25) break; // maybe parsing an aristocrat and hit blank
		if ( trie[next_index][LETTER_INDEX] == c){
			cnt++;
			if (trie[next_index][END_OF_WORD_INDEX] == 1){
				len = cnt;
				numb_words++;
			}
			next_index = trie[next_index][NXT_INDEX];
			pos--;
		}
		else
			next_index = trie[next_index][ALT_INDEX];
	}
	//return length of longest word, and number of words (lengths stored in backtrack_lengths array)
	return( [len,numb_words,cnt] );
}


function do_complete_parse(){
	var i,n,str,result, numb_words, back_limit;
	var parse_flag,pos;
	var score, bad_count;
	var extended_score;
	var max_index, suffix_length;
	var word_length = new Array();
	var backtrack = new Array();
	var previous_attempt = new Array();
	var no_parses,j1,k1,l1,old_pos;
	
	back_limit = 20; // make this an option
   if ( word_list_array.length==0){
        alert("Must choose word list file!");
        return;
   }
	// get input data into plain_text array
	str = document.getElementById('input_area').value;
	str = str.toLowerCase();
	buf_len = 0;
	for (i=0;i<str.length;i++){
		n = alpha.indexOf( str.charAt(i) );
		if ( n> -1)
			plain_text[buf_len++] = n;
	}
	plain_text[buf_len] = END_SYMBOL; // don't run off the end
	for (i=0;i<buf_len;i++){
		previous_attempt[i]=0;
		backtrack_lengths[i] = new Array();
		for (n=0;n<back_limit;n++) backtrack_lengths[i][n]=0;
	}
	max_index = 0;
	no_parses = "\nUnsuccessful parse attempts:\n";
	for (suffix_length = 0; suffix_length <= buf_len;suffix_length++){
		for(i=0;i<buf_len;i++) word_length[i]=0;
		if ( suffix_length>0){
			i = suffix_length-1;
			n = suffix_search(i,suffix_length);
			if ( n == suffix_length) 
				word_length[0]=n;
			else
				continue; // try a longer suffix
		}
		for (i=0;i<buf_len;i++) backtrack[i] = 0;	
		pos = suffix_length;
		parse_flag = 1;
		while(pos<buf_len){            
            if (previous_attempt[pos]==0) { // haven't searched this position yet
                result = word_search(pos)
                n = result[0];
                numb_words = result[1];
            }
            else // already tried this position without success
                n = 0;
            if ( n>0) {
				if ( n<=back_limit && numb_words>1){
					backtrack[pos] = numb_words-1;
				}
				word_length[pos]=n;
				previous_attempt[pos]=1;
				pos += n;
				if ( pos>max_index) max_index = pos;
			}
			else { // no word found at pos, try back tracking
				old_pos = pos; // to record unsuccessful attempt
				// record previous unsuccessful attempt
				k1 = word_length[0];
				l1 = 0;
				for (i=0;i<old_pos;i++){
					no_parses += alpha[plain_text[i]];
					if (++l1 == k1){
						no_parses += ' ';
						l1 = 0;
						k1 = word_length[i+1];
					}
				}
				no_parses += ' X (suffix length: '+suffix_length+')\n';
				// back to main algorithm
				while(pos >= suffix_length){
					if ( backtrack[pos] >0) break;
					pos--;
				}
				if ( pos < suffix_length){
					parse_flag = 0;
					break;
				}
				n = backtrack_lengths[pos][backtrack[pos]]; // backtrack_lengths is global array
				backtrack[pos]--; // next backtrack even shorter, if there is a next backtrack
				word_length[pos]=n;
				for (i=pos+1;i<buf_len;i++) word_length[i]=0;
				pos += n;
				if ( pos>max_index) max_index = pos;
			}
		} // end while
		if ( parse_flag==1){
			str = '';
			n = word_length[0];
			pos = 0;
			for (i=0;i<buf_len;i++){
				str += alpha[plain_text[i]];
				if (++pos == n){
					str += ' ';
					pos = 0;
					n = word_length[i+1];
				}
			}
			str += '\n';
			/*
			str += 'suffix length is '+suffix_length;
			str += ' word lengths: ';
			for (i=0;i<buf_len;i++)
				if (word_length[i]!=0)
					str += word_length[i]+' ';
			str += '\nbacktrack_lengths\n';
			for (i=0;i<buf_len;i++)
				for (n=0;n<3;n++)
					str += backtrack_lengths[i][n]+' ';
			*/
              str += no_parses;
			
			document.getElementById('output_area').value = str;
			return;
		}
	}	// next suffix length			
					
	str = 'No parse: maximum string parsed was:\n';
	for (i=0;i<max_index;i++)
		str += alpha[plain_text[i]];
	str += '\n';
	str += no_parses;
	document.getElementById('output_area').value = str;			
}


function do_parse(){
	var i,n,str;
	var no_parse_flag,pos;
	var score, bad_count;
	var extended_score,prefix_score,cnt,result;

   if ( word_list_array.length==0){
        alert("Must choose word list file!");
        return;
   }
	// get input data into plain_text array
	str = document.getElementById('input_area').value;
	str = str.toLowerCase();
	buf_len = 0;
	for (i=0;i<str.length;i++){
		n = alpha.indexOf( str.charAt(i) );
		if ( n> -1)
			plain_text[buf_len++] = n;
	}
	plain_text[buf_len] = EMPTY; // don't run off the end
	for (i=0;i<buf_len;i++)
		backtrack_lengths[i] = new Array();
	CUT_OFF = parseInt(document.getElementById('skip_numb').value);
	// forward parse
	str = 'Forward Parse:\n';
	pos = 0;
	bad_count = 0;
	score = 0;
	extended_score = 0;
    prefix_score = 0;
	no_parse_flag = 0;
	while(pos<buf_len){
        result = word_search(pos)
        n = result[0];
        cnt = result[2];
		if ( n> CUT_OFF){
			extended_score += n*n - bad_count*bad_count;
			score += n*n - bad_count;
            prefix_score += n*n - bad_count*bad_count;
            if ( cnt > n)
                prefix_score += (cnt-n)*(cnt-n);
			if ( no_parse_flag>0)
				str += ") ";
			for (i=0;i<n;i++)
				str += alpha[ plain_text[pos+i] ];
			str += " ";
			bad_count = 0;
			pos += n;
			no_parse_flag = 0;
		}
		else {
			if ( no_parse_flag == 0){
				str += "(";
				no_parse_flag = 1;
			}
			str += alpha[ plain_text[pos] ];
			pos++;
			if ( n==0)
				bad_count++;
		}
	}
	extended_score -= bad_count*bad_count;
	score -= bad_count;
    prefix_score -= bad_count*bad_count;
	if (no_parse_flag >0)
		str += ")\n";
	else
		str += "\n";
    if (document.getElementById('show_score').checked) {
        str += "\n==> Forward word list basic score: "+score+". Extended score: "+extended_score+". Prefix score: "+prefix_score+"\n";
        str += '\nCut off of: '+CUT_OFF+'. Word list files: '+file_list;
    }
	document.getElementById('output_area').value = str;			
}

function do_reverse_parse(){
	var i,n,str,r_str;
	var no_parse_flag,pos;
	var score, bad_count;
	var extended_score,suffix_score,cnt, result;

   if ( word_list_array.length==0){
        alert("Must choose word list file!");
        return;
   }
	// get input data into plain_text array
	str = document.getElementById('input_area').value;
	str = str.toLowerCase();
	buf_len = 0;
	for (i=0;i<str.length;i++){
		n = alpha.indexOf( str.charAt(i) );
		if ( n> -1)
			plain_text[buf_len++] = n;
	}
	//plain_text[buf_len] = EMPTY; // don't run off the end
	CUT_OFF = parseInt(document.getElementById('skip_numb').value);
	// reverse parse
	str = 'Reverse Parse:\n';
	pos = buf_len-1;
	bad_count = 0;
	score = 0;
	extended_score = 0;
    suffix_score = 0;
	no_parse_flag = 0;
	r_str = '';
	while(pos >= 0){
		//n =rev_word_search(pos)[0];
        result = rev_word_search(pos);
        n = result[0];
        cnt = result[2];
		if ( n> CUT_OFF){
			extended_score += n*n - bad_count*bad_count;
			score += n*n - bad_count;
            suffix_score += n*n - bad_count*bad_count;
            if ( cnt > n)
                suffix_score += (cnt-n)*(cnt-n);
			if ( no_parse_flag>0)
				r_str += "( ";
			for (i=0;i<n;i++)
				r_str += alpha[ plain_text[pos-i] ];
			r_str += " ";
			bad_count = 0;
			pos -= n;
			no_parse_flag = 0;
		}
		else {
			if ( no_parse_flag == 0){
				r_str += ")";
				no_parse_flag = 1;
			}
			r_str += alpha[ plain_text[pos] ];
			pos--;
			if ( n==0)
				bad_count++;
		}
	}
	extended_score -= bad_count*bad_count;
	score -= bad_count;
    suffix_score -= bad_count*bad_count;
	if (no_parse_flag >0)
		r_str += "(";
	for (i=0;i<r_str.length;i++)
		str += r_str.charAt(r_str.length-i-1);
    if (document.getElementById('show_score').checked) {       
        str += "\n\n==> Reverse word list basic score: "+score+". Extended score: "+extended_score+". Suffix score: "+suffix_score+"\n";
        str += '\nCut off of: '+CUT_OFF+'. Word list files: '+file_list;        
    }
	document.getElementById('output_area').value = str;			
}

function do_clear(){
    var do_clr = confirm("Erase the current fields and files?")
    if (do_clr == false) return;

	document.getElementById('input_area').value = '';
	document.getElementById('output_area').value = '';
    document.getElementById('filename').innerHTML='Word list: <input type="file" id="input2" >';
    file_list = '';
    document.getElementById('list_area').value = '';
    max_trie_index = -1;
    word_list = [];
    word_list_array = [];
    trie = [];
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
    
}

function do_multiple_parse(){
	var i,n,str,result, numb_words, back_limit;
	var parse_flag,pos;
	var score, bad_count;
	var extended_score;
	var max_index, suffix_length;
	var word_length = new Array();
	var backtrack = new Array();
	var previous_attempt = new Array();
	var no_parses,j1,k1,l1,old_pos;
    var best_try, current_start;
    var substring_numb;
    var double_square_score;
	
	back_limit = 20; // make this an option
   if ( word_list_array.length==0){
        alert("Must choose word list file!");
        return;
   }
	// get input data into plain_text array
	str = document.getElementById('input_area').value;
	str = str.toLowerCase();
	buf_len = 0;
	for (i=0;i<str.length;i++){
		n = alpha.indexOf( str.charAt(i) );
		if ( n> -1)
			plain_text[buf_len++] = n;
	}
	plain_text[buf_len] = END_SYMBOL; // don't run off the end
    current_start = 0;
	for (i=0;i<buf_len;i++){
		previous_attempt[i]=0;
		backtrack_lengths[i] = new Array();
		for (n=0;n<back_limit;n++) backtrack_lengths[i][n]=0;
	}
    max_index = current_start;
    str = '';
    substring_numb = 1;
    bad_count = 0;
    double_square_score = 0;
    for (i=0;i<buf_len;i++) backtrack[i] = 0;
    for(i=0;i<buf_len+1;i++) word_length[i]=0;
while(max_index<buf_len){    
	for (suffix_length = 0; suffix_length <= buf_len-current_start;suffix_length++){
		if ( suffix_length>0){
			i = suffix_length-1+current_start;
			n = suffix_search(i,suffix_length);
			if ( n == suffix_length) 
                word_length[current_start]=n;
			else
				continue; // try a longer suffix
		}
		pos = suffix_length+current_start;
		parse_flag = 1;
		while(pos<buf_len){            
            if (previous_attempt[pos]==0) { // haven't searched this position yet
                result = word_search(pos)
                n = result[0];
                numb_words = result[1];
                previous_attempt[pos]=1;
            }
            else // already tried this position without success
                n = 0;
            if ( n>0) {
				if ( n<=back_limit && numb_words>1){
					backtrack[pos] = numb_words-1;
				}
				word_length[pos]=n;
				pos += n;
				if ( pos>max_index) {
                    max_index = pos;
                    best_try = '';
                    k1 = word_length[current_start];
                    score = k1*k1;
                    l1 = 0;
                    for (i=current_start;i<pos;i++){
                        best_try += alpha[plain_text[i]];
                        if (++l1 == k1){
                            best_try += ' ';
                            l1 = 0;
                            k1 = word_length[i+1];
                            score += k1*k1;
                        }
                    }
                    best_try += ' X (suffix length: '+suffix_length+', score of: '+score+')\n';
                }
			}
			else { // no word found at pos, try back tracking
				while(pos >= suffix_length+current_start){
					if ( backtrack[pos] >0) break;
					pos--;
				}
				if ( pos < suffix_length+current_start){
					parse_flag = 0;
					break;
				}
				n = backtrack_lengths[pos][backtrack[pos]]; // backtrack_lengths is global array
				backtrack[pos]--; // next backtrack even shorter, if there is a next backtrack
				word_length[pos]=n;
				//for (i=pos+1;i<buf_len;i++) word_length[i]=0; // don't need; all nonzero entries already rejected.
				pos += n;
			}
		} // end while
		if ( parse_flag==1){
			//str = '';
            str += 'substring '+substring_numb+': ';
            n = word_length[current_start];
            score = n*n;
			pos = 0;
			for (i=current_start;i<buf_len;i++){
				str += alpha[plain_text[i]];
				if (++pos == n){
					str += ' ';
					pos = 0;
					n = word_length[i+1];
                    score += n*n;
				}
			}
			str += ' ( suffix length of '+suffix_length+', score of: '+score+')\n';
            double_square_score += score*score;
            double_square_score -= bad_count*bad_count;
            str += '\nDouble square score: '+double_square_score;
            str += '\n word list files: '+file_list;
			document.getElementById('output_area').value = str;
			return;
		}
        if (current_start == 0) break; // no suffixes at beginning of string
	}	// next suffix length			
					
    str += 'substring '+substring_numb+': ';
    if ( current_start == max_index){ // nothing at current position
        max_index++;
        str += alpha[plain_text[current_start]]+' (no word, score : -1)\n';
        bad_count++;
    }
    else {
        str += best_try;
        double_square_score += score*score;
    }
    substring_numb++;
    current_start = max_index;
} // end while(max_index<buf_len)
    double_square_score -= bad_count*bad_count;
    str += '\nDouble square score: '+double_square_score;
    str += '\n word list files: '+file_list;
	document.getElementById('output_area').value = str;			

}

onload = function() {
    document.getElementById('do_parse').addEventListener("click", do_parse);         
    document.getElementById('do_clear').addEventListener("click", do_clear);             
    document.getElementById('do_reverse_parse').addEventListener("click", do_reverse_parse);             
    document.getElementById('do_complete_parse').addEventListener("click", do_complete_parse);                 
    document.getElementById('do_multiple_parse').addEventListener("click", do_multiple_parse);                     
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
}    
