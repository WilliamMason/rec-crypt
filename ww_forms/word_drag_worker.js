var word_string;
var parse_string;


function do_main(cipher,min_plain_len,min_logdi,fixed_position,fixed_end_position,phrase_file,parse_file,output_browser,output_on,output_name,c_type,no_suffix,no_prefix,phrase_min,phrase_max,start_phrase,end_phrase){ // removed callback parameter at end


var i,j,k,n,s,c;
var ln1,wrd,ln,flag,result;

//var parsing_list_filename = 'BIGWORD';
var parsing_list_filename = 'combine_parselist.txt';
var phrase_list_filename = 'combine_phrases10.txt'
// test cipher is mycon 1246, a vigenere running key
//var cipher = 'GUBSF FFOZE JVQGT AXPWL VYGHA JMTNY WSAPT LXLOH JKLAV GOAIC QDVKI VZMND ITFPB KFEO.';

var cipher_type = 'vig';// vig,var, or bea
var cutoff_logdi_score = 750;
var min_plaintext_word_len = 6;
var starting_ciphertext_position = 0 ;
var ending_ciphertext_position ;
var min_phrase_len = 1;
var max_phrase_len = 100;
var phrase_start = [];
var phrase_end = [];
min_plaintext_word_len = parseInt(min_plain_len); // sent in by setup program
cutoff_logdi_score = parseInt(min_logdi); // sent in by setup program
if (fixed_position != '')
	starting_ciphertext_position = parseInt(fixed_position);
else if (fixed_end_position != '')
	ending_ciphertext_position = parseInt(fixed_end_position);
/*
if (phrase_file=='1'){
	//parsing_list_filename = 'BIGWORD';
	phrase_list_filename = 'BIGWORD';
}
else if (phrase_file=='2'){
	//parsing_list_filename = 'BIGWORD';
	phrase_list_filename = 'combine_parselist.txt';
}
else if (phrase_file=='3' && WINDOWS){
	//parsing_list_filename = 'BIGWORD';
	phrase_list_filename = 'C:\\DATABASES\\tiny_two_word_phrases.txt';
}

if (parse_file=='1'){
	parsing_list_filename = 'BIGWORD';
	//phrase_list_filename = 'BIGWORD';
}
*/
cipher_type = c_type;
if (phrase_min !='')
	min_phrase_len = parseInt(phrase_min);
if (phrase_max !='')
	max_phrase_len = parseInt(phrase_max);
var alpha = 'abcdefghijklmnopqrstuvwxyz';
if(start_phrase!=''){
	s=start_phrase.toLowerCase();
	for(i=0;i<s.length;i++){
		c = s.charAt(i);
		n = alpha.indexOf(c);
		if (n != -1)
			phrase_start.push(n);
	}
}
if(end_phrase!=''){
	s=end_phrase.toLowerCase();
	for(i=0;i<s.length;i++){
		c = s.charAt(i);
		n = alpha.indexOf(c);
		if (n != -1)
			phrase_end.push(n);
	}
}

var word_list = [];
/*
var data = fs.readFileSync(parsing_list_filename);
var words = data.toString();
var lines = words.split('\n');
*/
var lines = parse_file.split('\n');
str = "read in "+lines.length+" lines";
//console.log(str);
var cnt = 0;
for(i=0;i<lines.length;i++){
    ln = lines[i];
		if ( ln=='') continue;


    ln1 = ln.split(/[\W\r]/); // split at non-letter or carriage return
    wrd = ln1[0];
    word_list[cnt] = wrd;
    cnt++;
}
str = "\nNumber of words in word_list array: "+cnt;
//console.log(str);

str = 'first word is '+word_list[0]+' last word is '+word_list[word_list.length-1];
//console.log(str);

var EMPTY = -1;
var LETTER_INDEX = 0
var END_OF_WORD_INDEX = 1
var ALT_INDEX = 2;
var NXT_INDEX = 3;
var END_SYMBOL = 27;
var trie = new Array();
var max_trie_index = -1;
//var alpha = "abcdefghijklmnopqrstuvwxyz";
var plain_text = new Array();
var buf_len;
var CUT_OFF = 2;

var backtrack_lengths = new Array();

var reverse_trie_start = new Array();


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
  //  document.getElementById('list_area').value = file_list;
  var s = 'made forward and reverse trie with '+max_trie_index+' trie elements';
  //console.log(s)
}

function word_search(n){ // n is starting index in plain_text array
	var i,c,current_index;
	var cnt,len, numb_words,next_index, pos;

	
	numb_words = 0;
	//backtrack_lengths[n][0]=0;
	current_index = plain_text[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	if ( len==1 || (plain_text[n+1]==END_SYMBOL && no_prefix=='0')){
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
			if (trie[next_index][END_OF_WORD_INDEX] == 1 || (plain_text[pos+1]==END_SYMBOL && no_prefix=='0')){
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


function do_complete_parse(input_str,no_suffix_flag){
	var i,n,str,result, numb_words, back_limit;
	var parse_flag,pos;
	var score, bad_count;
	var extended_score;
	var max_index, suffix_length;
	var word_length = new Array();
	var backtrack = new Array();
	var previous_attempt = new Array();
	var no_parses,j1,k1,l1,old_pos;
	var max_word_len;
	
	back_limit = 20; // make this an option
	/*
   if ( word_list_array.length==0){
        alert("Must choose word list file!");
        return;
   }
   */
	// get input data into plain_text array
	//str = document.getElementById('input_area').value;
	str = input_str.toLowerCase();
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
			max_word_len = n;
			pos = 0;
			for (i=0;i<buf_len;i++){
				str += alpha[plain_text[i]];
				if (++pos == n){
					str += ' ';
					pos = 0;
					n = word_length[i+1];
					if (n>max_word_len)
						max_word_len = n;
				}
			}
			str += '\n';
       //  str += no_parses;
			
			//document.getElementById('output_area').value = str;
			//console.log(str);
			return([max_word_len,str]);;
		}
		if (no_suffix_flag =='1')
			break;
	}	// next suffix length
					
	str = 'No parse: maximum string parsed was:\n';
	for (i=0;i<max_index;i++)
		str += alpha[plain_text[i]];
	str += '\n';
	str += no_parses;
	//document.getElementById('output_area').value = str;
	//console.log(str);
	//console.log('no parse')
	return([0,'no parse']);
}
// main program
make_trie();
// var input_str = 'owisthetimeforallgoodmentocometotheaidoftheircoun';
 //do_complete_parse(input_str);
s = cipher.toLowerCase();
var code_buffer = [];
for (i=0;i<cipher.length;i++){
	c = s.charAt(i);
	n = alpha.indexOf(c);
	if (n!= -1)
		code_buffer.push(n);
}

 var logdi = new Array(
	[4,7,8,7,4,6,7,5,7,3,6,8,7,9,3,7,3,9,8,9,6,7,6,5,7,4],
	 [7,4,2,0,8,1,1,1,6,3,0,7,2,1,7,1,0,6,5,3,7,1,2,0,6,0],
	 [8,2,5,2,7,3,2,8,7,2,7,6,2,1,8,2,2,6,4,7,6,1,3,0,4,0],
	 [7,6,5,6,8,6,5,5,8,4,3,6,6,5,7,5,3,6,7,7,6,5,6,0,6,2],
	 [9,7,8,8,8,7,6,6,7,4,5,8,7,9,7,7,5,9,9,8,5,7,7,6,7,3],
	 [7,4,5,3,7,6,4,4,7,2,2,6,5,3,8,4,0,7,5,7,6,2,4,0,5,0],
	 [7,5,5,4,7,5,5,7,7,3,2,6,5,5,7,5,2,7,6,6,6,3,5,0,5,1],
	 [8,5,4,4,9,4,3,4,8,3,1,5,5,4,8,4,2,6,5,7,6,2,5,0,5,0],
	 [7,5,8,7,7,7,7,4,4,2,5,8,7,9,7,6,4,7,8,8,4,7,3,5,0,5],
	 [5,0,0,0,4,0,0,0,3,0,0,0,0,0,5,0,0,0,0,0,6,0,0,0,0,0],
	 [5,4,3,2,7,4,2,4,6,2,2,4,3,6,5,3,1,3,6,5,3,0,4,0,5,0],
	 [8,5,5,7,8,5,4,4,8,2,5,8,5,4,8,5,2,4,6,6,6,5,5,0,7,1],
	 [8,6,4,3,8,4,2,4,7,1,0,4,6,4,7,6,1,3,6,5,6,1,4,0,6,0],
	 [8,6,7,8,8,6,9,6,8,4,6,6,5,6,8,5,3,5,8,9,6,5,6,3,6,2],
	 [6,6,7,7,6,8,6,6,6,3,6,7,8,9,7,7,3,9,7,8,9,6,8,4,5,3],
	 [7,3,3,3,7,3,2,6,7,2,1,7,3,2,7,6,0,7,6,6,6,0,3,0,4,0],
	 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0],
	 [8,6,6,7,9,6,6,5,8,3,6,6,6,6,8,6,3,6,8,8,6,5,6,0,7,1],
	 [8,6,7,6,8,6,5,7,8,4,6,6,6,6,8,7,4,5,8,9,7,4,7,0,6,2],
	 [8,6,6,5,8,6,5,9,8,3,3,6,6,5,9,6,2,7,8,8,7,4,7,0,7,2],
	 [6,6,7,6,6,4,6,4,6,2,3,7,7,8,5,6,0,8,8,8,3,3,4,3,4,3],
	 [6,1,0,0,8,0,0,0,7,0,0,0,0,0,5,0,0,0,1,0,2,1,0,0,3,0],
	 [7,3,3,4,7,3,2,8,7,2,2,4,4,6,7,3,0,5,5,5,2,1,4,0,3,1],
	 [4,1,4,2,4,2,0,3,5,1,0,1,1,0,3,5,0,1,2,5,2,0,2,2,3,0],
	 [6,6,6,6,6,6,5,5,6,3,3,5,6,5,8,6,3,5,7,6,4,3,6,2,4,2],
	 [4,0,0,0,5,0,0,0,3,0,0,2,0,0,3,0,0,0,1,0,2,0,0,0,4,4]);

var word_buffer = [];


function decode(start_pos){
	var j,index;
	var work_buffer = [];
	index = 0;
    for (j=0;j<word_buffer.length;j++) {
		if (cipher_type=='vig')
            /* vigenere running key */
			work_buffer[index++] = (26+code_buffer[j+start_pos] - word_buffer[j]) % 26;
		else if (cipher_type == 'bea')
            /* beaufort */
			work_buffer[index++] = (26-code_buffer[j+start_pos] + word_buffer[j]) % 26;
		else
            /* variant */
            work_buffer[index++] = (code_buffer[j+start_pos] + word_buffer[j]) % 26;
    }
    //work_buffer[index] = END_SYMBOL;
	return(work_buffer);
}
	
var cnt = 0;
var score = 0;
var numb_output = 0;
var phrase_start_flag = true;
var phrase_end_flag = true;
if(output_name !='') {
	var out_stream = fs.createWriteStream(output_name, {
  	flags: 'a' // 'a' means appending (old data will be preserved)
	})
}
var out_str ='';
var phrase_lines = phrase_file.split('\n');
// lineReader.eachLine(phrase_list_filename, function(line, last) {
var line_count;
for (line_count = 0;line_count< phrase_lines.length;line_count++){	
	//console.log(line);
	line = phrase_lines[line_count];
	  li = line.split(' '); // count just 1st string in line
	  li2 = li[0];
	  li2 = li2.toLowerCase();// phrase is in lower case
	  //if(cnt<10) {
		  //console.log(li2);
		word_buffer = [];
		for(i=0;i<li2.length;i++){
			c = li2.charAt(i);
			n = alpha.indexOf(c);
			if ( n != -1)
				word_buffer.push(n);
		}
		phrase_start_flag = true;
		if (phrase_start.length>0){
			for (i=0;i<phrase_start.length;i++){
				if (phrase_start[i] != word_buffer[i]){
					phrase_start_flag = false;
					break;
				}
			}
		}
		phrase_end_flag = true;
		if (phrase_end.length>0){
			for (i=0;i<phrase_end.length;i++){
				if (phrase_end[phrase_end.length-i-1] != word_buffer[word_buffer.length-i-1]){
					phrase_end_flag = false;
					break;
				}
			}
		}

		if (fixed_end_position !='')
			starting_ciphertext_position = ending_ciphertext_position - word_buffer.length + 1;
		if(starting_ciphertext_position>=0 && phrase_end_flag && phrase_start_flag && min_phrase_len<=word_buffer.length && max_phrase_len >= word_buffer.length){
		  for (j=starting_ciphertext_position;j<code_buffer.length-word_buffer.length+1;j++){
			   work_buffer = decode(j);
			   score = 0
			   for (i=0;i<work_buffer.length-1;i++)
				   score += logdi[work_buffer[i]][work_buffer[i+1]];
				score = 100*score/(work_buffer.length-1);
				score = Math.floor(score);
				s = 'score at position '+j+' is '+score;
				//console.log(s);
				if (score > cutoff_logdi_score){
					s ='';
					for (i=0;i<work_buffer.length;i++)
						s += alpha.charAt(work_buffer[i]);
						result = do_complete_parse(s,no_suffix);
						if (result[0] >= min_plaintext_word_len) {// got complete parse
							s = "position "+j+" , max plaintext word of length: "+result[0]+"\n";
							s += 'Phrase: '+ li2;
							s += '\nPlaintext: '+result[1];
							if(output_on=='1') console.log(s);
							if(output_name!='')
								out_stream.write(s);
							if (output_on=='1' && output_browser == '1'){
								/*
								s = "position "+j+" , max plaintext word of length: "+result[0]+"<br>";
								s += 'Phrase: '+ li2 + '<br>';
								s += '\nPlaintext: '+result[1] + '<br><br>';
								*/
								out_str += s+'\n';
							}
							numb_output++;
						}
				}
				if (fixed_position !='' || fixed_end_position != '')
					break;
		  } // next j

	  } // end if min_len && max_len OK
	  cnt++;
	} // next line_count	  
	//if (last /* done */) {
	  //out_stream.end();
	  
		s = '\n\nread '+cnt+' lines';
		s += ', output '+numb_output+' parses'
		//console.log(s);
		/*
		if(output_name!='') {
			out_stream.write(s);
			out_stream.end();
		}
		*/
		if (output_browser == '1'){
			//s = '<html><body bgcolor="silver"><h3>Results:</h3>'+out_str+'<br>'+s+'</body></html>';
			//callback(s); // send results back to browser
			out_str += s;
			postMessage(out_str);
		}
	  //return false; // stop reading
	//}
  // });
} // end do_main
onmessage = function(event) { //receiving a message
	var str,s;

  debugger;  
  /*
  var state = event.data.op_choice;
  if ( state == 1){ // word list
    word_string = event.data.str;
    //search_word_list(word_list_array);  // set up word list
	postMessage("word list received")
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
	
    str = event.data.pat1;
	str += ','+event.data.pat2;
	str += ','+event.data.pat3;
	str += ','+event.data.count_only;	
	str += ','+event.data.known_letters;	
    do_search(str);
	
	do_search( event.data.pat1,event.data.pat2,event.data.pat3,event.data.count_only,event.data.known_letters );
  }
  */
  s = "received\n";
  s += event.data.cipher+'\n'
  s += event.data.min_plain_len+'\n'
  s += event.data.min_logdi+'\n'
  s += event.data.fixed_position+'\n'
  s += event.data.fixed_end_position+'\n'
  //s += event.data.phrase_file+'\n'
  //s += event.data.parse_file+'\n'
  s += event.data.output_browser+'\n' // should be 1
  s += event.data.output_on+'\n'
  s += event.data.output_name+'\n' // should be blank 
  s += event.data.c_type+'\n' ;
  s += event.data.no_suffix+'\n' ;
  s += event.data.no_prefix+'\n' ;
  s += event.data.phrase_max+'\n' ;
  s += event.data.phrase_min+'\n' ;
  s += event.data.start_phrase+'\n' ;
  s += event.data.end_phrase+'\n' ;
  //postMessage(s);
//do_main(cipher,min_plain_len,min_logdi,fixed_position,fixed_end_position,phrase_file,parse_file,output_browser,output_on,output_name,c_type,no_suffix,no_prefix,phrase_min,phrase_max,start_phrase,end_phrase)  

do_main(event.data.cipher,
event.data.min_plain_len,
event.data.min_logdi,
event.data.fixed_position,
event.data.fixed_end_position,
event.data.phrase_file,
event.data.parse_file,
event.data.output_browser,
event.data.output_on,
event.data.output_name,
event.data.c_type,
event.data.no_suffix,
event.data.no_prefix,
event.data.phrase_min,
event.data.phrase_max,
event.data.start_phrase,
event.data.end_phrase);
}

