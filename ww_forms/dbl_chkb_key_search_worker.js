var word_pattern_string;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list = [];
var search_pattern = [];
var word_pattern_string2;
var key_width;

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
	var str,c,i,n,pattern_len,j,k,x;
    var flag,index,cnt,min_len,sum,w1,w2,n1,n2,str2;
    var word_pat = [];

    var symbols = 'abcdefghijklmnopqrstuvwxyz';
    

   str = word_pattern_string;
   str = str.toLowerCase();
   pattern_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        search_pattern[pattern_len++] = c;
   }
   min_len = pattern_len - key_width; // must have at least this many letters to cover all cipher text
   str = '/ vertical pairs:\n';
   cnt = 0;
   // now search for words that have some of the letters needed
   var work_list = [];
   for (i=0;i<word_list.length;i++) {
        if (word_list[i].length != key_width) continue; //wrong length
        sum = 0;
        for (k=0;k<pattern_len;k++) {
            n = 0;
            for (j=0;j<key_width;j++) 
                if ( word_list[i].charAt(j) == search_pattern[k]) {
                    if (n==1) {
                        n = 2; // word has repeated key letter, can't use
                        break;
                    }
                    sum++;
                    n = 1;
            }
            if (n==2) break;
        }
        if (n==2) continue; // word has repeated key letters
		// reject word if it contains letters not in pattern_len
		for (j=0;j<key_width;j++) {
            n = 0;
                for (k=0;k<pattern_len;k++) 
                if ( word_list[i].charAt(j) == search_pattern[k]) {
                    if (n==1) {
                        n = 2; // word has repeated key letter, can't use
                        break;
                    }
                    sum++;
                    n = 1;
            }
			if (n==0) break; 
            
        }
		if (n==0) continue; 
        if ( sum >= min_len) // this word is possible
			work_list[cnt++] = i;
    } 
    // get possible pairings
    var key_count = 0;
    for ( n=0;n<cnt-1;n++){
		w1 = word_list[work_list[n]];
		for (x= n+1;x<cnt;x++){
				w2 = word_list[work_list[x]];
				sum = 0;
				for (i = 0;i<pattern_len;i++){
						n1 = w1.indexOf(search_pattern[i]);
						n2 = w2.indexOf(search_pattern[i]);
						if ( n1 != -1 || n2 != -1)
							sum++;
				}
				if ( sum != pattern_len) continue;
				// now check that any duplicate letters occur in the same place
				flag = 1;
				for (i=0;i<key_width;i++){
						c = w1.charAt(i);
						n1 = w2.indexOf(c);
						if ( n1 != -1 && n1 != i) { // same letter in different positions
								flag = 0;
								break;
						}
				}
				if ( flag == 1) { // fond possible key pair
					//str += w1+' '+w2='\n';
					for (i=0;i<key_width;i++)
						str += w1.charAt(i);
					str += ' ';
					for (i=0;i<key_width;i++)
						str += w2.charAt(i)
					str += '\n';
					key_count++;
				}
		}
	}
	str += '/ horizontal pairs:\n'
	// now repeat process for horizontal keys
   str2 = word_pattern_string2;
   str2 = str2.toLowerCase();
   pattern_len = 0;
   for (i=0;i<str2.length;i++) {
        c = str2.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        search_pattern[pattern_len++] = c;
   }
   min_len = pattern_len - key_width; // must have at least this many letters to cover all cipher text

	   cnt = 0;
   // now search for words that have some of the letters needed
   var work_list = [];
   for (i=0;i<word_list.length;i++) {
        if (word_list[i].length != key_width) continue; //wrong length
        sum = 0;
        for (k=0;k<pattern_len;k++) {
            n = 0;
            for (j=0;j<key_width;j++) 
                if ( word_list[i].charAt(j) == search_pattern[k]) {
                    if (n==1) {
                        n = 2; // word has repeated key letter, can't use
                        break;
                    }
                    sum++;
                    n = 1;
            }
            if (n==2) break;
        }
        if (n==2) continue; // word has repeated key letters
		// reject word if it contains letters not in pattern_len
		for (j=0;j<key_width;j++) {
            n = 0;
                for (k=0;k<pattern_len;k++) 
                if ( word_list[i].charAt(j) == search_pattern[k]) {
                    if (n==1) {
                        n = 2; // word has repeated key letter, can't use
                        break;
                    }
                    sum++;
                    n = 1;
            }
            if (n==0) break; 
        }
		if (n==0) continue; 
        if ( sum >= min_len) // this word is possible
			work_list[cnt++] = i;
    } 
    var key_count2 = 0;
    for ( n=0;n<cnt-1;n++){
		w1 = word_list[work_list[n]];
		for (x= n+1;x<cnt;x++){
				w2 = word_list[work_list[x]];
				sum = 0;
				for (i = 0;i<pattern_len;i++){
						n1 = w1.indexOf(search_pattern[i]);
						n2 = w2.indexOf(search_pattern[i]);
						if ( n1 != -1 || n2 != -1)
							sum++;
				}
				if ( sum != pattern_len) continue;
				// now check that any duplicate letters occur in the same place
				flag = 1;
				for (i=0;i<key_width;i++){
						c = w1.charAt(i);
						n1 = w2.indexOf(c);
						if ( n1 != -1 && n1 != i) { // same letter in different positions
								flag = 0;
								break;
						}
				}
				if ( flag == 1) { // fond possible key pair
					//str += w1+' '+w2='\n';
					for (i=0;i<key_width;i++)
						str += w1.charAt(i);
					str += ' ';
					for (i=0;i<key_width;i++)
						str += w2.charAt(i)
					str += '\n';
					key_count2++;
				}
		}
	}
	
    str = 'Found '+key_count+' vertical key pairs and '+key_count2+' horizontal key pairs.\n'+str;
    //document.getElementById('output_area').value = str;	
    postMessage(str);
        
}

onmessage = function(event) { //receiving a message
	var str,s;

debugger;
  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 2){
    word_pattern_string = event.data.str;
    word_pattern_string2 = event.data.str2;
    if (event.data.kw == 6)
        key_width = 6;
    else
        key_width = 5;
    do_search();
  }
}

  
