var word_pattern_string;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list = [];
var search_pattern = [];


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
	var str,c,i,n,pattern_len,j,k;
    var flag,index,cnt;
    var word_pat = [];

    var symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    

   /*
   if ( word_list_array.length==0){
        alert("Must Choose word list file!");
        return;
   }
    */
   /*
   str = document.getElementById('word_pattern').value
   if ( str==''){
        alert("No search pattern entered!");
        return;
   }
   */
   str = word_pattern_string;
   pattern_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        search_pattern[pattern_len++] = n;
   }
   //str = 'search pattern has length: '+pattern_len+'\nsearching . . .';
   //document.getElementById('output_area').value = str;	
   //alert(str);
   //search_word_list(word_list_array);  
   str = '';
   cnt = 0;
   // now search for pattern. (could combine with search word list, but maybe clearer this way)
   for (i=0;i<word_list.length;i++) {
        if (word_list[i].length != pattern_len) continue; //wrong length
        // get pattern for this word from word list
        index = 0;
        for (k=0;k<26;k++) for (j=0;j<pattern_len;j++)
            if ( l_alpha.indexOf(word_list[i].charAt(j)) == k)
                word_pat[j] = index++;
        //compare to search pattern
        flag = true;
        for (j=0;j<pattern_len;j++)
            if ( word_pat[j] != search_pattern[j]) {
                flag = false;
                break;
        }
        if (flag) {
            str += word_list[i]+'\n';
            cnt++;
        }
    } // next i
    str = 'There are '+cnt+' words that fit pattern:\n'+str;
    //document.getElementById('output_area').value = str;	
    postMessage(str);
        
}

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 2){
    word_pattern_string = event.data.str;
    do_search();
  }
}

  
