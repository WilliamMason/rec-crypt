// search a word/phrase list for headline puzzle hats

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];
var search_pattern = [];
var decimation = [];
var inverse_decimation = [];
var c_shift = [1,3,5,7,9,11,15,17,19,21,23,25];
var start_pattern, start_let;
var key_array = [];
var inverse_key = [];
var max_hat_len;

function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsText(fname);
	
}


function getAsText(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsText(readFile);
  
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
  var fileString = evt.target.result;
  var s;
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;  
  s = "The length of the file is "+fileString.length;
  document.getElementById('output_area').value = s;

  word_list_string = fileString;
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function search_word_list(str){ // get word list array from text file
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
	
	//make_trie();
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;	
	//postMessage(s);
}


function do_search(){
	var str,c,i,n,pattern_len,j,k,x;
    var flag,index,cnt,le;
    var word_pat = [];
    var used_let = [];
	var alpha,score;
	var start_pos,d_start_pos, pos1,pos2;
	var nxt_letter,c1,c2;
    

    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
   if ( word_list_string==''){
        alert("Must Choose word list file!");
        return;
   }
   str = document.getElementById('slidable_alpha').value
   if ( str==''){
        alert("No slidable alphabet entered!");
        return;
   }
   str = str.toUpperCase();
   pattern_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        search_pattern[pattern_len++] = n;
   }
   if (pattern_len != 26){
        alert("Slidable alphabet does not have 26 letters!");
        return;
    }
	// get decimations of the slidable alphabet and their inverses
	for (i = 0; i<12;i++) {
			x = 0;
            decimation[i] = [];
            inverse_decimation[i] = [];
			for (k=0;k<26;k++) {
				decimation[i][k] = search_pattern[x];
				inverse_decimation[i][ search_pattern[x] ] = k;
				x = (x+c_shift[i]) % 26;
			}
	}
   str = document.getElementById('max_hat_len').value;
   max_hat_len = parseInt(str);
   if (max_hat_len == 0){
    alert("Maximum hat length must be greater than zero!");
    return;
   }
   //str = 'search pattern has length: '+pattern_len+'\nsearching . . .';
   //document.getElementById('output_area').value = str;	
   //alert(str);
   search_word_list(word_list_string);  // make word list array from the text file
   str = '';
   cnt = 0;
   // now search word array for matches
   for (i=0;i<word_list.length;i++) {
        // extend word i to keyed alphabet
        for (j=0;j<26;j++)
            used_let[j] = 0;
        index = 0;
        for (j=0;j<word_list[i].length;j++){
            c = word_list[i][j];
            n = l_alpha.indexOf(c);
            if (used_let[n] == 0) {
                key_array[index++] = n;
                used_let[n] = 1;
            }
        }
        for (j=0;j<26;j++)
            if ( used_let[j] == 0)
                key_array[index++] = j;
        // get inverse key
        for (j=0;j<26;j++)
            inverse_key[key_array[j]] = j;
        // does the key array match some decimation of the slidable alphabet?
        start_pattern = key_array[0];
        start_pos = inverse_key[ start_pattern ];
        for ( alpha=0;alpha<12;alpha++) {
            d_start_pos = inverse_decimation[alpha][ start_pattern ] ;
            nxt_letter = decimation[alpha][ (d_start_pos+1 ) %26 ];
            k = inverse_key[nxt_letter];
            if (k < start_pos) 
                /* nxt_letter can't be below the starting letter */
                continue;
            le = k - start_pos; /* hat length for this key and decimation*/
            if (le > max_hat_len)
                continue;
            if ( start_pos >= le ) /* start letter can't be in top row*/
                continue;
            score = 0; /* count mistakes*/
            for (j=0;j<le;j++) {
                pos1 = j;
                c1 = key_array[pos1];
                pos2 = inverse_decimation[alpha][c1];
                pos1 += le;
                pos2 = (pos2+1)%26;
                while(pos1 < 26) {
                    c1 = key_array[pos1];
                    c2 = decimation[alpha][pos2 ];
                    if ( c1 != c2) // better to just break here?
                        score--;
                    pos1 += le;
                    pos2 = (pos2+1)%26;
                }
            }
            if ( score == 0 ) { // no mistakes, this could be the key
                str += '\n'+word_list[i]+'\n';
                str += 'Hat length: '+le+'\n';
                for (j=0;j<26;j++){
                    str += l_alpha.charAt(key_array[j]);
                    if ( ((j+1)%le) == 0)
                        str += '\n';
                }
                str += '\n';
                break; // don't need to try other decimations
            }
        } // next alpha
    } // next i
    //str = 'There are '+cnt+' words that fit pattern:\n'+str;
    document.getElementById('output_area').value = str;	
        
}

onload = function() {
    document.getElementById('search_for_pattern').addEventListener("click",do_search);    
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
}    
