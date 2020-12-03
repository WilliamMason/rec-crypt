// search a word/phrase list for headline puzzle keys

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list;
var start_pattern, start_let;
var key_array = [];
var inverse_key = [];
var max_hat_len;
var min_hat_len = 3;
var buffer = [];
var inv_buffer = [];
var array_len;

var temp=[]; // for temporarily extending the encrypting alphabet.
var inv_temp=[];;
var numb_top_fills, potential_fills;

var transposed_key=[];
var col_ptr = [];

var EMPTY = 26;

// stuff for slidable hill-climbing
var extended_alphabet;
var transposed_key_columns;
var numb_key_cols;
var key_col;
var k_buffer = [];
var slider = [];
var column_order;
var shifts = [];
var max_slide_tries;
//var best_shift;
var MAX_MUTATIONS = 500;


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
    
    word_list = [];
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

function get_score(hat_len,key_index) {
	var i,j,k, le,index;
	var score;
	var numb_cks; // number of consistency checks passed
	var flag,c1,c2,c, c3,c4;
	var numb_rows, numb_long_cols, break_position;
	var col,row, last,col2,row2;
	var pos,bot1,bot2;
	var top_fill_flag;
	

//  set up temporary encrypting alphabet that can be extended
	for (j=0;j<26;j++){
		temp[j] = buffer[j];
		inv_temp[j] = inv_buffer[j];
	}


	index = 0;
	// take off left to right, good as any since you don't know actual order
	for (j=0;j<hat_len;j++){
		le = hat_len+j;
		transposed_key[index++] = key_array[j];
		while (le<array_len){
			if ( key_array[le] != EMPTY) transposed_key[index++] = key_array[le];
			le += hat_len;
		}
	}
	for (j=0;j<26;j++)
		inverse_key[transposed_key[j]] = j;
	numb_rows = Math.floor(26/hat_len); // number of rows in short columns
	numb_long_cols = 26%hat_len;
	break_position = numb_long_cols*(numb_rows+1); // start of short columns in transposed key
	// set up pointers to starts of columns
	index = 0;
	for (j=0;j<hat_len;j++) {
		col_ptr[j] = index;
		index += numb_rows;
		if(j<numb_long_cols)
			index++;
	}
	numb_cks = 0;
	top_fill_flag = 0;
	numb_top_fills=0;
	potential_fills = 0;
	// step through columns and rows, checking consistency with encrypting alphabet stored in temp[]
	for (col = 0;col<hat_len;col++) {
		last = numb_rows;
		if (col<numb_long_cols) last++;
		for (row = 0;row<last;row++){
			c1 = transposed_key[col_ptr[col]+row];
			if (temp[c1] == EMPTY) continue;// c1 not in encrypting alphabet
			if ( row == last-1) bot1=1; // bottom row
			else bot1 = 0;
			c2 = temp[c1];//c2 is encryption of c1
			// locate c2 in transposed key
			pos = inverse_key[c2];
			// get row and col of pos, see notes_simgle_headline_solver.txt
			if ( pos<break_position){// in a long column
				col2 = pos/(numb_rows+1);
				row2 = pos%(numb_rows+1);
				if(row2 == numb_rows) bot2 = 1; // bottom row
				else bot2 = 0;
			}
			else { // in a short column
				col2 = numb_long_cols+( Math.floor((pos-break_position)/numb_rows));
				row2 = (pos-break_position)%numb_rows;
				if(row2 == numb_rows-1) bot2 = 1; // bottom row
				else bot2 = 0;
			}
			if (bot1==0 && bot2 == 0) {//neither c1 or c2 in bottom row
				c3 = transposed_key[col_ptr[col]+row+1]; // plaintext letter below c1
				c4 = transposed_key[pos+1]; // codetext letter below c2
				if(temp[c3]!= EMPTY && temp[c3] == c4) numb_cks++;// passed a consistency check
				else if (temp[c3]!= EMPTY && temp[c3] != c4) return(-1); //key not consistent with this hat length
				else if (inv_temp[c4] != EMPTY) return(-1);//key not consistent with this hat length
				else {// temporarily extend encrypting alphabet
					temp[c3]=c4;
					inv_temp[c4]=c3;
				}
			}
			else if (bot1 == 0){//c2 must be in bottom row
				c3 = transposed_key[col_ptr[col]+row+1]; // plaintext letter below c1
				//if (temp[c3] == -1) continue; //can't check further
				if (temp[c3]== EMPTY){ // how many places available?
					flag = 0;
					for (j=0;j<hat_len;j++){
						if (j==col2) continue;// skip column containing c2
						if ( inv_temp[ transposed_key[col_ptr[j]] ] == EMPTY){// this space available
							flag++;
							c4 = transposed_key[col_ptr[j]];
						}
					}
					if ( flag == 0) return(-1); // no legal place to put c3
					if (flag == 1) {// exactly one space available, put c3 there!
						temp[c3] = c4;
						inv_temp[c4]=c3;
						top_fill_flag = 1; // may have to loop again
						numb_top_fills++;
					}
					if ( flag>1) potential_fills++;
				}
				else { // c3 is already in encrypting alphabet
					c4 = temp[c3];// c4 is encryption of c3
					// is c4 in a top row, but not in col of c2?
					flag = 1;
					for (j=0;j<hat_len;j++){
						if (j==col2) continue;// skip column containing c2
						if ( transposed_key[col_ptr[j]] == c4){// c4 is in a top row
							flag = 0;
							numb_cks++; // passed a consistency check
							break;
						}
					}
					if ( flag) return(-1); // c4 not in a top row, except maybe col2, key not consistent with this hat len
				}
			}
			else if (bot2==0){ //c1 must be in bottom row
				c4 = transposed_key[pos+1]; // codetext letter below c2
				//if ( inv_temp[c4] == -1) continue; // can't check further
				if ( inv_temp[c4] == EMPTY) {
					flag = 0;
					for (j=0;j<hat_len;j++){
						if (j==col) continue;// skip column containing c1
						if ( temp[ transposed_key[col_ptr[j]] ] == EMPTY){// this space available
							flag++;
							c3 = transposed_key[col_ptr[j]];
						}
					}
					if ( flag == 0) return(-1); // no legal place to put c4
					if (flag == 1) {// exactly one space available, put c4 there!
						temp[c3] = c4;
						inv_temp[c4]=c3;
						top_fill_flag = 1; // may have to loop again
						numb_top_fills++;
					}
					if ( flag>1) potential_fills++;					
				}
				else {	
					c3 = inv_temp[c4]; // c3 is plaintext leter that goes to c4
					// is c3 in a top row but not in col of c1?
					flag = 1;
					for (j=0;j<hat_len;j++){
						if (j==col) continue;// skip column containing c1
						if ( transposed_key[col_ptr[j]] == c3){// c3 is in a top row
							flag = 0;
							numb_cks++; // passed a consistency check
							break;
						}
					}
					if ( flag) return(-1); // c3 not in a top row, except maybe col, key not consistent with this hat len
				}
			}
			if (row>0 && row2>0) { // both c1 and c2 have a letter above them
				c3 = transposed_key[col_ptr[col]+row-1]; // plaintext letter above c1			
				c4 = transposed_key[pos-1]; // codetext letter above c2
				if (temp[c3] == EMPTY && inv_temp[c4]!= EMPTY) return(-1); //c3 can't go to c4, key not consistent with this hat len
				if (temp[c3] == EMPTY && inv_temp[c4]== EMPTY){ // fill in, will add new info if column height was 2.
					temp[c3]=c4;
					inv_temp[c4]=c3;
				}
			}
		}// next row
	}// next col
    // success, save data for possible hill-climbing
    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-';  
    extended_alphabet[key_index] = '';
    for (j=0;j<26;j++)
        extended_alphabet[key_index] += symbols.charAt(temp[j]);
    transposed_key_columns[key_index] = '';
	col = 0;
	index = 0;
	k = numb_rows;
	if (numb_long_cols>0) k++;
	for (j=0;j<26;j++){
        transposed_key_columns[key_index] += symbols.charAt(transposed_key[j]);
        if ( ++index == k){
            transposed_key_columns[key_index] += ' ';
           	col++;
           	k = numb_rows;
           	if ( col<numb_long_cols) k++;
           	index = 0;
        }
    }
    
	return(numb_cks); // passed all consistency checks, return number of checks passed
} /* end get_score */	


function do_search(){
	var str,c,i,n,pattern_len,j,k,x;
    var flag,index,key_index,le;
    var word_pat = [];
    var used_let = [];
	var alpha,score;
	var start_pos,d_start_pos, pos1,pos2;
	var nxt_letter,c1,c2;
    var hat_len, original_key_len;

    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-';
    extended_alphabet = [];
    transposed_key_columns = [];
    
    
   if ( word_list_string==''){
        alert("Must Choose word list file!");
        return;
   }
   str = document.getElementById('encrypting_alpha').value
   if ( str==''){
        alert("No encrypting alphabet entered!");
        return;
   }
   str = str.toUpperCase();
   pattern_len = 0;
   for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n == -1) continue;
        buffer[pattern_len++] = n;
   }
   if (pattern_len != 26){
        alert("Slidable alphabet does not have 26 entries!");
        return;
    }
	// set up inverse buffer
	for (j=0;j<26;j++) inv_buffer[j] = EMPTY;
	for (j=0;j<26;j++)
		if(buffer[j]!= EMPTY) inv_buffer[ buffer[j] ] = j;
    
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
   key_index = 0;
   // now search word array for matches
   for (i=0;i<word_list.length;i++) {
        // extend word i to keyed alphabet
        for (j=0;j<26;j++)
            used_let[j] = 0;
        index = 0;
        originial_key_len = word_list[i].length;
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
        array_len = index;
        // get inverse key
        for (j=0;j<26;j++)
            inverse_key[key_array[j]] = j;
		for (hat_len = min_hat_len;hat_len<= max_hat_len;hat_len++){
			score = get_score(hat_len,key_index);
           	if (score > -1 ) {// show all consistent keys
                j = key_index+1;
                str += 'Key #'+j+': ';
                str += word_list[i]+'\n';
                //str += 'Extended alphabet: ' +extended_alphabet[key_index]; // constructed in get_score()
                str += 'Hat length is '+hat_len+', ';
                str += 'Passed '+score+' consistency checks.\n';
               for (j=0;j<26;j++){
                    str += symbols.charAt(key_array[j]);
                    if ( ((j+1)%hat_len) == 0)
                        str += '\n';
                }
                // columns that need joining, constructed in get_score()
                //str += '\n'+transposed_key_columns[key_index]+'\n';
                str += '\n\n';
                key_index++;
              	
            }
        }
            
    } // next i
    str = 'There are '+key_index+' words that fit pattern:\n\n'+str;
    document.getElementById('output_area').value = str;	
    if (key_index>0)
        document.getElementById('slidable').disabled = false;
        
}

function do_clear() {
    document.getElementById('output_area').value='';
    document.getElementById('slide_output_area').value='';
    document.getElementById('encrypting_alpha').value = '';
    document.getElementById('slidable').disabled = true;
}

function get_slider_score(){
	var i,j,k, le,index;
	var score, high_score, alpha;
	var number_shifts, final_shifts;
	var nxt_letter,c1,c2,c;
	var temp_pos, start_len;

    var inv_slider = [];
	
	// get trial slidable alphabet from current column order
	index = 0;
	for (j=0;j<numb_key_cols;j++){
		le = key_col[column_order[j]].length	
		for (i=0;i<le;i++)
			slider[index++] = key_col[ column_order[j]][i];
	}
	// get inverse of slider
	for (j=0;j<26;j++)
		inv_slider[slider[j]]=j;
	
	// score by finding shift required for each non-dashed letter of the encrypting alphabet
	// if there is the same shift for each one, that's good! otherwise score by number of shifts
    for (j=0;j<26;j++) shifts[j] = 0;
	for (j=0;j<26;j++){
		if (k_buffer[j] == EMPTY) continue; // no corresponding cipher letter
		c1 = inv_slider[j]; 
		c2 = inv_slider[k_buffer[j]]; 
		shifts[ (26+c1-c2)%26 ]++;
	}
	// how many different shifts did we get
	number_shifts = 0;
	for (j=0;j<26;j++)
		if ( shifts[j]>0) {
			number_shifts++;
			//best_shift = j; // maybe there's only one!
	}
	return(number_shifts);
}

function slidable_climb(k_index){
	var n, i, ct,j,x,y,k;
	var c,s;
	var flag,start;
    var x1,x2,y1,y2;
    var c1,c2;
    var index;
    var  trial, mut_count,mut_flag;
    var c3,c4;
    var score, current_hc_score;
    var out_str;
    
    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-';

    key_col = []; // reset in case it was used before
    column_order = []; // reset;
    for (j=0;j<26;j++)
        k_buffer[j] = symbols.indexOf(extended_alphabet[k_index].charAt(j));
    s = transposed_key_columns[k_index].split(' '); // final string in s is empty.
    for (i=0;i<s.length-1;i++) {
        key_col[i] = [];
        for (j=0;j<s[i].length;j++)
            key_col[i][j] = symbols.indexOf(s[i].charAt(j));
    }
    numb_key_cols = key_col.length;
	for (j=0;j<numb_key_cols;j++) column_order[j]=j;
    // randomize column order
    for (i=numb_key_cols-1;i>0 ; i--) {
        x = column_order[i];
        j = Math.floor(Math.random()*i);                
        column_order[i] = column_order[j];
        column_order[j] = x;
    }
    current_hc_score = best_score = 26; // every letter wuth different shift!
    mut_count = 0;
    for (trial = 1 ;trial <max_slide_tries; trial++) { 
        /* mutate */
        n = Math.floor(Math.random()*numb_key_cols);                
        x = Math.floor(Math.random()*numb_key_cols);                
        c3 = column_order[n];
        c4 = column_order[x];
        column_order[x] = c3;
        column_order[n] = c4;
        score = get_slider_score();

        if ( score < best_score) {
            best_score = score;
            if ( score == 1 ) { // only one shift, finished!
                out_str = '';
	        	for (j=0;j<26;j++)
                    out_str += symbols.charAt(slider[j]);
                return(out_str);    
            }
        }
        if ( score<current_hc_score){
	    	 current_hc_score = score;
	    	 mut_count = 0;
        }
        else { // restore
           	column_order[x] = c4;
           	column_order[n] = c3;
           	mut_count++;
           	if ( mut_count> MAX_MUTATIONS){
	           	mut_count = 0;
               	current_hc_score = 26; // wimpy hill_climbing
            }
        }
    }// next trial

    return('No slidable alphabet found');
}


function do_slidable(){
    var k_index,n,s;
    
	var str= prompt('Enter Key number');
	if (str==' ' || str==null)
		return;
    k_index = parseInt(str);
    if (isNaN(k_index) || k_index<1){
        alert("Must enter a positive number.");
        return;
    }
    k_index--;
    if (k_index >= extended_alphabet.length){
        alert("No key with that number.");
        return;
    }
   s = document.getElementById('max_slide_tries').value;
   max_slide_tries = parseInt(s);
    
    s = slidable_climb(k_index);
    n = k_index+1;
    s = "Slidable alphabet, search result for Key #"+n+"\n"+s; 
    document.getElementById('slide_output_area').value = s;	
}

onload = function() {
    document.getElementById('search_for_pattern').addEventListener("click",do_search);    
    document.getElementById('do_clear').addEventListener("click",do_clear);        
    document.getElementById('slidable').addEventListener("click",do_slidable);            
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
}    
