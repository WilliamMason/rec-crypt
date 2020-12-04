//log tetragraph scoring
importScripts('tettable.js');

var tet_table = [];
var ciphertext;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list = [];
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	


var code = [];
var key_array = [];
var EMPTY = -1;

var LOOK_AHEAD_LIMIT= 8;
var max_key_len = 8;

var plain_text = [];
var look_ahead_array = [];
var look_len, best_look_score, numb_copied, key_len, numb_to_copy;

var cipher_type;

var c_name = ['Vigenere','Beaufort','Variant'];

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
	//postMessage("00~tet table initialized");
}
initialize_tet_table();


function search_word_list(b_array){
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
        //n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            //s = c;
            s = l_alpha.charAt(n);
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += l_alpha.charAt(n);
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;
	
	//make_trie();
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;
	//postMessage(s);
}


function do_search(){
	var str,c,i,n,buf_len,j,k;
    var flag,index,cnt;
    var word_pat = [];
    var used_let = [];
    var score, best_score;
    var best_word_index;
    var best_plain_text = [];

    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    
   look_len = LOOK_AHEAD_LIMIT;
   str = ciphertext.toUpperCase();
   buf_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        code[buf_len++] = n;
   }
   str = '';
   cnt = 0;
   best_score = -100;
   // now search for pattern. (could combine with search word list, but maybe clearer this way)
   for (i=0;i<word_list.length;i++) {
      // extend word i to keyed alphabet
      if (word_list[i].length > max_key_len) continue;
      n = 0;
      key_array = [];
      for (j=0;j<word_list[i].length;j++) {
        c = l_alpha.indexOf(word_list[i].charAt(j));
        if ( c!= -1)
          key_array[n++] = c;
      }
      key_len = n; // global
      score = get_score();
      if ( score > best_score){
          best_score = score;
          best_word_index = i;
          for (j=0;j<plain_text.length;j++) {
            best_plain_text[j] = plain_text[j];
          }
      }
    } // next i
    n = best_score.toFixed(2);
    str = 'Best score: '+n+'\nKey: '+word_list[best_word_index]+', cipher type: '+c_name[cipher_type]+'\n\nPlaintext:\n';
    for (j=0;j<plain_text.length;j++)
      str += l_alpha.charAt(best_plain_text[j]);
    str +='\n';
    //document.getElementById('output_area').value = str;
    postMessage(str);
        
}

function get_score(){
  var i,j,k,n;
  var score;

	get_trial_decrypt();
	score = 0.0;
    // if ( crib_flag == 1){
    //     for (i=0;i<buf_len;i++){
    //         if (plain_text[i] == crib_buffer[i])
    //             score += 1.0
    //     }
    //     score *= 100.0;
    // }
    // else if (crib_flag == 2){ // floating crib
    //     best_match = 0;
    //     for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
    //         if ( plain_text[crib_pos] == crib_buffer[0]) {
    //                 match = 0.0;
    //                 for (y=0;y<crib_len;y++)
    //                         if ( plain_text[crib_pos+y] == crib_buffer[y]) {
    //                                 match += 1.0
    //                 }
    //                 if (match>best_match) {
    //                         best_match = match;
    //                 }
    //     }
    //     score += 100.0*best_match;
    // }
	for (i=0;i<plain_text.length-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
  
  
	return(score);
  
}

function get_trial_decrypt(){
  var i,j,k,n;
  var index;
  var bindex,buf_len,numb;
  
  buf_len = code.length;
	/* expand key to fill entire look_len array */
	index = 0;
	for (j=key_len;j<look_len;j++) {
		key_array[j] = key_array[index];
		index = (index+1) % key_len;
	}
	/* try to untangle by looking ahead */
	bindex = 0;
	do {
		best_look_score = -10;
		for (j=0;j<look_len;j++)
			look_ahead_array[j] = EMPTY;
		if ( bindex+look_len < buf_len)
			numb = look_len;
		else
			numb = buf_len-bindex;
		look(bindex,numb,0);
		bindex += numb_copied; // numb_copied is global
	} while(bindex < buf_len);
  
} // end get_trial_decrypt

function look(bindex,numb,offset){ // recursive look ahead , usually 8 bytes, choose best place to interrupt
  var j,k,score;
  
	/* choose best string to put in look ahead buffer */
	if ( offset==0) { /* this is first pass */
		numb_to_copy = numb; // global
		if ( numb_to_copy > key_len)
			numb_to_copy = key_len; /* never copy more than this
				so can restart at boundary */
	}
	for (j=0;j<numb;j++)
	
		if (cipher_type==0)
			/* vigenere*/
			look_ahead_array[j+offset] = (26+code[bindex+j+offset]-key_array[j])%26;
		else if (cipher_type==2)
			/* variant*/
			look_ahead_array[j+offset] = (26+code[bindex+j+offset]+key_array[j])%26;
		else if (cipher_type==1)
			/* beaufort*/
			look_ahead_array[j+offset] = (26-code[bindex+j+offset]+key_array[j])%26;
	score = get_look_score(bindex);
	if ( score > best_look_score) {
		numb_copied = numb_to_copy; // both globals!
		best_look_score = score;
		for (j=0;j<numb_copied;j++)
			plain_text[bindex+j] = look_ahead_array[j];
	}
	/* now do recursive step */
	for (k=numb-1;k>0;k--) {
		if ( offset==0) { /* this is first pass */
			numb_to_copy = k;
			if ( numb_to_copy > key_len)
				numb_to_copy = key_len; /* never copy more than this
					so can restart at boundary */
		}
		look(bindex,numb-k,offset+k);
	} /* next k */
  
} // end look

function get_look_score(bindex){
	var j,k, index;
	var score;
	
	score = 0;
	if ( bindex>1 ){
		if ( look_ahead_array[1] != EMPTY) {
		index = plain_text[bindex-2]+26*plain_text[bindex-1]
			+26*26*look_ahead_array[0]+26*26*26*look_ahead_array[1];
		score += tet_table[index];
		}
		if ( look_ahead_array[2] != EMPTY) {
		index = plain_text[bindex-1]+26*look_ahead_array[0]
			+26*26*look_ahead_array[1]+26*26*26*look_ahead_array[2];
		score += tet_table[index];
		}
	}
	for (j=0;j<look_len-3;j++) {
		if (look_ahead_array[j+3] == EMPTY)
			return(score);
		index = look_ahead_array[j]+26*look_ahead_array[j+1]
				+26*26*look_ahead_array[j+2]+26*26*26*look_ahead_array[j+3];
		score += tet_table[index];
	}
	return(score);
  
} // end get_look_score

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 2){
    ciphertext = event.data.str;
    cipher_type = event.data.ctype;
    max_key_len = parseInt(event.data.max_key_len)
    do_search();
  }
}

  
