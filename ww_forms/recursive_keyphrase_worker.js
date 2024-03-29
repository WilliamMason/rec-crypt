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
const SAVE_SOL_LIMIT = 50;



function compare(a,b){
	return(b[1]-a[1]);
}


function start_recursion(){
	var i,j,k,c,n,s;
	var current_decrypt = [];
	
	all_sols = [];
	/*
	var current_key = [];
	for (i=0;i<26;i++)
		current_key[i] = '-';
	*/
	var current_key = start_key.split('');
	
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
	out_str += '\ndone';
	out_str += '\nAll solutions ('+SAVE_SOL_LIMIT+' limit):\n';
	s = all_sols.join('');
	out_str += s;
	postMessage(out_str);

}


function do_solve( current_decrypt,current_key, word_index){
	var i,j,k,c,n,s,flag,c1,p1,n1
	var new_decrypt, new_key;
	
	var le = cipher_words[decrypt_order[word_index][0] ].length;
  if (skip_word_index[decrypt_order[word_index][0]] || length_not_found[le] ){
	n = cipher_words[decrypt_order[word_index][0]].length;
	s = '';
	for (i=0;i<n;i++)
		s += '?';
    current_decrypt[ decrypt_order[word_index][0]] =  s;
    if ( word_index == last_index){
      decrypt = current_decrypt.join(' ');
      key = current_key.join('');
      //out_str += 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n\n'
	  out_str = 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n'
	  sol_count++;
	  out_str += 'number of solutions so far: '+sol_count+'\n\n';
      postMessage(out_str)
	  if ( sol_count <= SAVE_SOL_LIMIT)
		all_sols.push(out_str);
	  //document.getElementById('output_area').value = out_str; // wil switch to postMessage when this reoutine is in web_worker
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
		new_decrypt = current_decrypt.slice(0);
        new_decrypt[decrypt_order[word_index][0]] = word_len[le][i];
		new_key = current_key.slice(0);
		flag = false;
		for (j=0;j<new_decrypt[decrypt_order[word_index][0]].length;j++){
			p1 = new_decrypt[decrypt_order[word_index][0]].charAt(j);
			n1 = l_alpha.indexOf(p1);
			c1 = cipher_words[decrypt_order[word_index][0]].charAt(j);
			if (new_key[n1] != '-' && new_key[n1] != c1){
				flag = true;
				break;
			}
			new_key[n1] = c1;
		}
		if ( flag) continue;
        if (word_index == last_index){ // all decrypt positions filled
            decrypt = new_decrypt.join(' ');
            key = new_key.join('');
            //out_str += 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n\n'
            out_str = 'plaintext:\n'+decrypt + ' \nkey:\n'+l_alpha+'\n'+ key+ ' \n'			
			sol_count++;
			out_str += 'number of solutions so far: '+sol_count+'\n\n';			
            postMessage(out_str)
			if ( sol_count <= SAVE_SOL_LIMIT)
				all_sols.push(out_str);
			//document.getElementById('output_area').value = out_str; // wil switch to postMessage when this reoutine is in web_worker
            return;
          
        }
        else {
           n = word_index+1;
            do_solve(new_decrypt,new_key, n )
        }
    }
  }

}

onmessage = function(event) { //receiving a message with the string to decode. do search
	debugger;
    word_len = event.data.word_len;
    length_not_found = event.data.length_not_found;
	cipher_words = event.data.cipher_words;
	skip_word_index = event.data.skip_word_index;
	start_key = event.data.start_key;
    start_recursion();
};  
