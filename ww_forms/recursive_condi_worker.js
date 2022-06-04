var out_str;

var cipher_words;
var word_list_string = '';
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_len, skip_word_index, last_index;
var length_not_found;
var	skip_word_index ;
var sol_count;
var all_sols;
var decrypt_order;
var start_key;
const SAVE_SOL_LIMIT = 100;
var complete_chain_flag = false;
var complete_chain;
var key_posted =false;

var show_all_solutions_flag
var processed_chunk = 500;
var words_processed;

function compare(a,b){
	return(b[1]-a[1]);
}


function start_recursion(){
	var i,j,k,c,n,s;
	var current_decrypt = [];
	
	debugger;
	words_processed = 0;
	complete_chain_flag = false;
	key_posted = false;
	all_sols = [];
	/*
	var current_key = [];
	for (i=0;i<26;i++)
		current_key[i] = '-';
	*/
	var temp_key = start_key.split('');
	var current_key = [];
	n = 0;
	for (i=0;i<26;i++){
		current_key[i] = temp_key.slice(n,n+26);
		n += 26;
	}
	out_str = '';
	last_index = cipher_words.length-1;
	decrypt_order = [];
	for (i=0;i<cipher_words.length;i++){
		decrypt_order[i] = [i,cipher_words[i].length];
	}
	decrypt_order.sort(compare); // order by lengths
	
	postMessage("working");
	sol_count = 0;
	do_solve(current_decrypt,current_key, 0);
	out_str = '';
	out_str += '\ndone';
	out_str += '\nAll solutions ('+SAVE_SOL_LIMIT+' limit):\n';
	s = all_sols.join('');
	out_str += s;
	postMessage(out_str);

}


function do_solve( current_decrypt,current_key, word_index){
	var i,j,k,c,n,s,flag,c1,p1,n1,p2,n2;
	var new_decrypt, new_key;
	var previous_plain_char, previous_index, repeated_letter;
	var previous_word, previous_word_len;
	var real_index, result;
	
	 if (key_posted) // got the key
	  return;
	 words_processed++;
	 if (words_processed > processed_chunk){
		postMessage('timer:');
		words_processed = 0;
	 }
	  
	var le = cipher_words[decrypt_order[word_index][0] ].length;
  if (skip_word_index[decrypt_order[word_index][0]] || length_not_found[le] ){
	n = cipher_words[decrypt_order[word_index][0]].length;
	s = '';
	for (i=0;i<n;i++)
		s += '?';
    current_decrypt[ decrypt_order[word_index][0]] =  s;
    if ( word_index == last_index){
	  words_processed = 0; // reset global variable;
      decrypt = current_decrypt.join(' ');
      //key = current_key.join('');
	  key = '';
	  for (k=0;k<26;k++)
		  key += l_alpha[k]+' '+current_key[k].join('')+'\n';
      //out_str += 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n\n'
	  out_str = 'plaintext:\n'+decrypt + ' \nkey:\n  '+l_alpha+'\n'+ key+ ' \n'
	if ( complete_chain_flag){
		out_str += '\ncomplete chain:\n'+complete_chain+'\n';
		console.log(out_str);
	}
	  sol_count++;
	  out_str += 'number of solutions so far: '+sol_count+'\n\n';
 	if ( show_all_solutions_flag){
		s = out_str + all_sols.join('');
		postMessage(s);				
	}
	else
		postMessage(out_str)
    if ( sol_count <= SAVE_SOL_LIMIT)
		all_sols.push(out_str);
		if (complete_chain_flag)
		  key_posted = true;
    return;
       
    }
    else{
       n = word_index+1;
       do_solve(current_decrypt,current_key, n )
    }
    return;

  }
  else {
    //for (i=0;i<numb_words_of correct_length_for_this_index;i++){
	for (i=0;i<word_len[le].length;i++){
		real_index = decrypt_order[word_index][0];
		new_decrypt = current_decrypt.slice(0);
		new_decrypt[real_index]  = word_len[le][i];
		//new_key = current_key.slice(0);
		new_key = [];
		for (j=0;j<26;j++)
			new_key[j] = current_key[j].slice(0);
		flag = false;

		if (real_index >0 && new_decrypt[real_index-1] != undefined){ // look at last plaintext letter of previous word if it exits
		    previous_word_len = new_decrypt[real_index-1].length;
				previous_plain_char = new_decrypt[real_index-1].charAt(previous_word_len-1);
				previous_index = l_alpha.indexOf(previous_plain_char);
				if ( previous_index != -1){
					p1 = new_decrypt[real_index].charAt(0);
					n1 = l_alpha.indexOf(p1);
					if ( n1 != -1){
					c1 = cipher_words[real_index].charAt(0);
					repeated_letter = new_key[previous_index].indexOf(c1);
					if ( repeated_letter != -1 && repeated_letter!= n1){ // c1 already used.
						flag = true;
						//break;
					}
					repeated_letter = new_key[n1].indexOf(c1);
					if ( repeated_letter != -1 && repeated_letter!= previous_index){ // c1 already used.
						flag = true;
						//break;
					}
					if (new_key[previous_index][n1] != '-' && new_key[previous_index][n1] != c1){
						flag = true;
						//break;
					}
					new_key[previous_index][n1] = c1;
					new_key[n1][previous_index] = c1; // key array can swap rows and columns;
					}
				}
		}
		if ( flag)
			continue;
		

		previous_plain_char = new_decrypt[ real_index ].charAt(0);
		previous_index = l_alpha.indexOf(previous_plain_char);
		for (j=1;j<new_decrypt[real_index].length;j++){
			p1 = new_decrypt[real_index].charAt(j);
			n1 = l_alpha.indexOf(p1);
			c1 = cipher_words[real_index].charAt(j);
			repeated_letter = new_key[previous_index].indexOf(c1);
			if ( repeated_letter != -1 && repeated_letter!= n1){ // c1 already used.
				flag = true;
				break;
			}
			repeated_letter = new_key[n1].indexOf(c1);
			if ( repeated_letter != -1 && repeated_letter!= previous_index){ // c1 already used.
				flag = true;
				break;
			}
			if (new_key[previous_index][n1] != '-' && new_key[previous_index][n1] != c1){
				flag = true;
				break;
			}
			new_key[previous_index][n1] = c1;
			new_key[n1][previous_index] = c1; // key array can swap rows and columns;
			previous_index = n1;
			
		}

		if (real_index < last_index && new_decrypt[real_index+1] != undefined){ // check first letter of next word, if it exists
			p1 = new_decrypt[real_index+1].charAt(0);
			n1 = l_alpha.indexOf(p1);
			if (n1 != -1){
				c1 = cipher_words[real_index+1].charAt(0);
				repeated_letter = new_key[n1].indexOf(c1);
				if ( repeated_letter != -1 && repeated_letter!= previous_index){ // c1 already used.
					flag = true;
					//break;
				}
				repeated_letter = new_key[previous_index].indexOf(c1);
				if ( repeated_letter != -1 && repeated_letter!= n1){ // c1 already used.
					flag = true;
					//break;
				}
				if (new_key[previous_index][n1] != '-' && new_key[previous_index][n1] != c1){
					flag = true;
					//break;
				}
				new_key[previous_index][n1] = c1;
				new_key[n1][previous_index] = c1; // key array can swap rows and columns;
			//previous_index = n1;
			}
		  
		}
		if ( flag) continue; // this word doesn't fit
				// do doublechain on array

		result = extend(new_key);
		if ( result[0]){
			new_key = [];
			for (j=0;j<26;j++)
				new_key[j] = result[1][j].slice(0);
			if ( result[2] != "") {// found complete chain!
				complete_chain = result[2];
				complete_chain_flag = true;
			}
			
		}
		else // found contradiction on key table
			continue;


    if (word_index == last_index){ // all decrypt positions filled
			words_processed = 0; // reset global variable;
            decrypt = new_decrypt.join(' ');
            //key = new_key.join('');
			key = '';
			for (k=0;k<26;k++)
				key += l_alpha[k]+' '+new_key[k].join('')+'\n';
			
            //out_str += 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n\n'
            out_str = 'plaintext:\n'+decrypt + ' \nkey:\n  '+l_alpha+'\n'+ key+ ' \n'
			if ( complete_chain_flag){
				out_str += '\ncomplete chain:\n'+complete_chain+'\n';
				console.log(out_str);
			}
			sol_count++;
			out_str += 'number of solutions so far: '+sol_count+'\n\n';
			if ( show_all_solutions_flag){
				s = out_str + all_sols.join('');
				postMessage(s);				
			}
			else
				postMessage(out_str)
			if ( sol_count <= SAVE_SOL_LIMIT)
				all_sols.push(out_str);
			//document.getElementById('output_area').value = out_str; // wil switch to postMessage when this reoutine is in web_worker
			if (complete_chain_flag)
				key_posted = true;
      return;
          
      }
      else {
           n = word_index+1;
            do_solve(new_decrypt,new_key, n )
      }
    }
  }

}

function complete_the_squares(key_array,inv_array){
	var change_flag,r1,c2,i1,r2,c2,i2,r3,c3,i3,r4,c4,i4,c5,base,s;
    var n,c1;
	var b_end,b_start;
    var period = 26;
    
	change_flag = 0;
	for (r1=0;r1<period;r1++){
		for (c1=0;c1<26;c1++){
            c2 = key_array[r1][c1];
			if ( c2 != '-'){
				for ( r2=0; r2<period;r2++) {
                    if (r1==r2 ) continue;
                    // vertical extension
                    i3 = inv_array[r2][c1];
                    if ( i3 != '-'){
                        c4 = key_array[r1][i3];
                        if ( c4 != '-'){
                            c5 = key_array[r2][l_alpha.indexOf(c4)];
                            if (c5 != '-' && c5 != c2){
                                s = "Quag array inconsistent at "+c5+" and "+c2;
                                //alert(s);
                                return(-1);
                            }
                            key_array[r2][l_alpha.indexOf(c4)] = c2;
                            n = l_alpha.indexOf(c2);
                            inv_array[r2][n] = l_alpha.indexOf(c4);
                            if ( c5 == '-') change_flag++;
                        }
					}
					// horizontal extension
                    c4 = key_array[r2][l_alpha.indexOf(c2)];
					if ( c4 != '-') {
                        n = l_alpha.indexOf(c4);
                        i3 = inv_array[r1][n];
                        if ( i3 != '-'){
                            c3 = l_alpha.charAt(i3);
                            c5 = key_array[r2][c1];
							if ( c5 != '-' && c5 != c3){
								s = "Quag array not consistent at "+c5+" and "+c3;
								//alert(s);
								return(-1);
							}
                            key_array[r2][c1] = c3;
                            n = l_alpha.indexOf(c3);
                            inv_array[r2][n] = c1;
                            if ( c5 == '-') change_flag++;
						}
					}
				}
			}
		}
	}
	return (change_flag);
}


function extend(key_array){
	var s,c,chain_flag,rect_flag,q3_flag;
	var flag, total_changes;
    var i,j,k,n;
	var inv_array;
	
    // inv_array values will be index numbers, not strings
	inv_array = [];
    for (i=0;i<26;i++) {
        inv_array[i] = [];
        for (j=0;j<26;j++)
            inv_array[i][j] = '-';
    }
    for (i=0;i<26;i++) for (j=0;j<26;j++){
        if (key_array[i][j] != '-'){
            n = l_alpha.indexOf(key_array[i][j]);
            inv_array[i][n] = j;
        }
    }
    // don't need to add fixed row to bottom, because key_array is always stored in alphabetical order
    // key_array is displayed on the screen using key_order, but that doesn't change key_array itself.
	flag=1;
	total_changes = 0;
	while(flag !=0) {
		flag = complete_the_squares(key_array,inv_array);
        if (flag == -1) // array was inconsistent
               return([false,[]]);
		total_changes += flag;
		while (flag !=0){
			flag = complete_the_squares(key_array,inv_array);
            if (flag == -1) // array was inconsistent
                   return([false,[]]);
			total_changes += flag;
		}
        // leave out rectangle filling
		// make key table symmetric
		for (i=0;i<26;i++)for (j=0;j<26;j++){
		  if ( j == i) continue;
		  if (key_array[i][j]!= '-'){
		    if (key_array[j][i] == '-'){
		      key_array[j][i] = key_array[i][j];
		      n = l_alpha.indexOf(key_array[i][j]);
		      inv_array[j][n]=i;
		      flag = 1;
              total_changes += flag;
		    }
		    else if (key_array[i][j]!= key_array[i][j]){
		      alert("error! key table not symmetric")
		      return([false,[]]);
		    }
		  }
		}
	}
	/*
	s  = "there were "+total_changes+" additions to the key table";
	alert(s);
    letterblock_setup();
	xlate();
    update_keyblock();
	*/
	// is key array filled up?
	flag = false;
	for (i=0;i<26;i++){
		for (j=0;j<26;j++)
			if (key_array[i][j] == '-'){ // not filed up
				flag = true;
				break;
		}
		if ( flag)
			break;
	}
	if (flag) // key array not full
		return([true,key_array,""]);
	// get max chain
	s = max_chain(key_array);
	return([true,key_array,s]);
	

}

function max_chain(key_array){
//alert("max chain");
    var s, ch,max_ch,max_len;
    var row,n;
    var max_ch2, ch2, max_len2;
    
    max_len = 0;
    for (row = 0; row<26;row++)
        for (n=0;n<26;n++){
            ch = get_chain(n,row,key_array);
            if ( ch.length > max_len){
                max_len = ch.length;
                max_ch = ch;
            }
    }
    s = "max chain has length "+max_len+": ";
    if (max_len ==25){
        for (n=0;n<26;n++){
            if (max_ch.indexOf(l_alpha.charAt(n)) != -1)
                continue;
            max_ch[25] = l_alpha.charAt(n);
            max_len++;
            break;
        }
        s += " (added missing letter "+ max_ch[25]+ " at end)\n";
    }
    for (n=0;n<max_len;n++)
        s += max_ch[n];
    if (max_len == 26){
        s +='\nDecimations:'
        s += decimate_chain(max_ch);
    }
    // don't check for two 13-link chains because there will be plenty of odd shifts.
    //alert(s);
    //display_message(s);
	return(s);
}

function get_chain(start,row,key_array){
    var c,cs,n;
    cs = l_alpha.charAt(start)
    var chain = [cs];
    //c = quag_key[cs+period_row.charAt(row)];
    c = key_array[row][start];
    while ( c != '-' && c != cs){
        chain.push(c);
        //c = quag_key[c+period_row.charAt(row)];
        n = l_alpha.indexOf(c);
        c = key_array[row][n];
    }
    return(chain);
}

function decimate_chain(chain){
    var s,i,j,n;
    
    var shift = [1,3,5,7,9,11,15,17,19,21,23,25];
    s = '';
    for (j=0;j<shift.length;j++){
        n = shift[j];
        s += '\n';
        for (i=0;i<n*26; i=i+n)
            s += chain[ i % 26 ];
    }
    return(s);
}


onmessage = function(event) { //receiving a message with the string to decode. do search
	debugger;
    word_len = event.data.word_len;
    length_not_found = event.data.length_not_found;
	cipher_words = event.data.cipher_words;
	skip_word_index = event.data.skip_word_index;
	start_key = event.data.start_key;
	show_all_solutions_flag = event.data.all_solutions_flag;
    start_recursion();
};
