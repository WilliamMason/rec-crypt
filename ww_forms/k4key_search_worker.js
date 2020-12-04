var word_pattern_string;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list = [];
var search_pattern = [];

var encrypting_alphabet = [];
var key_array = [];
var EMPTY = -1;
var key2_array = [];

function initialize_word_list(str){
	var s,n;
    var state,i,c,index;
    
    // construct word list
    str = str.toLowerCase();
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            s = c;
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += c;
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;
    s = "word list loaded"
    postMessage(s);
}


/*
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
*/

function do_search(){
	var str,c,i,n,pattern_len,j,k;
    var flag,index,cnt;
    var word_pat = [];
    var used_let = [];
    var score, best_score;
    var best_word_index;
    var best_key_array = [];
    var best_key2_array = [];

    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    

   str = word_pattern_string.toUpperCase();
   pattern_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        if ( c == '-') {
          encrypting_alphabet[pattern_len++] = EMPTY;
          continue;
        }
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        encrypting_alphabet[pattern_len++] = n;
   }
   //str = 'search pattern has length: '+pattern_len+'\nsearching . . .';
   //document.getElementById('output_area').value = str;
   //alert(str);
   //search_word_list(word_list_array);
   str = '';
   cnt = 0;
   best_score = -100;
   // now search for pattern. (could combine with search word list, but maybe clearer this way)
   for (i=0;i<word_list.length;i++) {
      // extend word i to keyed alphabet
      for (j=0;j<26;j++)
        used_let[j] = 0;
      n = 0;
      for (j=0;j<word_list[i].length;j++) {
        c = l_alpha.indexOf(word_list[i].charAt(j));
        if (used_let[c]==0){
          key_array[n++] = c;
          used_let[c] = 1;
        }
      }
      for (j=0;j<26;j++)
        if (used_let[j] == 0) key_array[n++] = j;
      score = get_score();
      if ( score > best_score){
          best_score = score;
          best_word_index = i;
          for (j=0;j<26;j++) {
            best_key_array[j] = key_array[j];
            best_key2_array[j] = key2_array[j];
          }
      }
    } // next i
    str = 'Best score: '+best_score+'\nKey: '+word_list[best_word_index]+'\n\nalphabets:\n';
    for (j=0;j<26;j++)
      str += l_alpha.charAt(best_key_array[j]);
    str += '\n';
    for (j=0;j<26;j++) {
      c = best_key2_array[j];
      if (c == EMPTY)
        str += '-';
      else  
        str += symbols.charAt(c);
    }
    str +='\n';
    //document.getElementById('output_area').value = str;
    postMessage(str);
        
}

function get_score(){ // get key2 array, return length of longest consecutive sequence in key2 array
  var i,j,k,n;
  var score, count,best_count,last;
  var inverse_key = [];
  
  for (i=0;i<26;i++)
    inverse_key[ key_array[i]] = i;
  for (i=0;i<26;i++)
    key2_array[ inverse_key[i]] = encrypting_alphabet[i];
	score  = best_count = 0;
	j = 0;
	while(j<26){
		count = 0;
		last = -1;
		for (k=j;k<j+25;k++) {
			if ( key2_array[k%26]!=EMPTY)
				last = key2_array[k%26];
			if (
				key2_array[ (k+1)%26]== EMPTY ||
				last < key2_array[ (k+1)%26 ]){
				if (key2_array[(k+1)%26] == EMPTY) last++;
				count++;
			}
			else
				break;
		}
		if ( count > best_count)
			best_count = count;
		if (count == 0) count=1;
		j += count;
	}
	score = best_count;
	return(score);
  
}

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
  if ( state == 1){ // word list
    initialize_word_list(event.data.word_list_string)
    //var word_list_array = new Uint8Array(event.data.word_list); // need to set char view of arrayBuffer that was passed
    //search_word_list(word_list_array);  // set up word list
  }
  else if (state == 2){
    word_pattern_string = event.data.str;
    do_search();
  }
}

  
