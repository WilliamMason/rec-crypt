importScripts('tettable.js'); 

// frac morse key search
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];

var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var lowerC= 'abcdefghijklmnopqrstuvwxyz';
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var buffer = new Array();
var plain_text = new Array();

var max_trials;
var key=[];
var inverse_key = [];
var work_buffer=[];
var score_buffer = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var EMPTY = -1;
var END_SYMBOL = 2;
var ERROR_SYMBOL = '^';
var free_index, start0,start1;
var morse = [];
var code_len, plain_len;  
var inverse_table = []; // calculate just once to spped things up
var wrk_code; // make global for speed
 
var shmoo_code = {E:'31',I:'322', P:'3212', B:'32112',
T:'12', R:'323', F:'3213', G:'32113',
A:'13', S:'112', C:'1112', V:'11111',
O:'22', H:'113', U:'1113', K:'11112',
N:'23', L:'212', M:'2111', Q:'11113',
D:'213', W:'2112', X:'321111', Y:'2113',
J:'321112', Z:'321113' };

var encoding_alphabet = [
'111','112','113','121','122','123','131','132','133',
'211','212','213','221','222','223','231','232','233',
'311','312','313','321','322','323','331','332']; // no '333'

var EMPTY = -1;
var LETTER_INDEX = 3;
var S_CODE = '123';

var trie = [];
var max_trie_index;

function new_trie_element(indx){
	var i;
	
	trie[indx] = [];
	for ( i=0;i<3;i++)
		trie[indx][i] = EMPTY;
	trie[indx][LETTER_INDEX] = EMPTY;
}

function insert_letter(letter,str){
	var i,j,c,n;
	var current_index,next_index;

    letter = alpha.indexOf(letter); // switch to indicies for fast tet scoring
	c = str.charAt(0);
	current_index = S_CODE.indexOf(c);    
	for (i=1;i<str.length;i++){
		c = str.charAt(i);
		n = S_CODE.indexOf(c);
		if ( n == -1) continue; // should never happen
		next_index = n;
		if (trie[current_index][next_index] == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][next_index] = max_trie_index;
			max_trie_index++;
		}
		current_index = trie[current_index][next_index];
	}
	trie[current_index][LETTER_INDEX] = letter;
}

function make_trie(){
	var i;
    var s;
	
	for (i=0;i<3;i++)
		new_trie_element(i);
	max_trie_index = 3;
    for ( let in shmoo_code){
        insert_letter(let,shmoo_code[let]);
    }
}


// make key columns for worksheet
// var key_cols = '';
// for (var j = 0;j<3;j++){
    // for (var i = 0;i<26;i++)
        // key_cols += encoding_alphabet[i][j];
    // key_cols += '\n'
// }

function letter_search(n){ // n is starting index in wrk_code, wrk_code now global
	var i,c,current_index,j,k;
	var cnt,let;
	
    c = wrk_code.charAt(n);
	current_index = S_CODE.indexOf(c);
	let = trie[current_index][LETTER_INDEX];
	cnt = 1;
	while( (++n<wrk_code.length) && let == EMPTY){
		c = wrk_code.charAt(n);
        j = S_CODE.indexOf(c);
		if ( trie[current_index][j] == EMPTY)
			break;
		cnt++;
		current_index = trie[current_index][j];
		let = trie[current_index][LETTER_INDEX];
	}
	return( [let,cnt] );
}

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

	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;	
	//postMessage(s);
}

function get_trial_decrypt(){
    var i,j,k,x,y,n,c;
    var ar,indx;
        
	for (i=0;i<26;i++) {
		inverse_key[ key[i] ] = i;
	}    
        
    wrk_code = ''; // global  
   for (i=0;i<buffer.length;i++){
        //c = buffer.charAt(i);
        //n = key.indexOf(c);
        n = inverse_key[ buffer[i] ];
        wrk_code += encoding_alphabet[ n ];
    }
    plain_text = [];
    n = 0;
    indx = 0;
    while(n<wrk_code.length){
        ar = letter_search(n,wrk_code);
        if (ar[0] == EMPTY) break; // hit '111' at end
        //plain_text[indx++] = alpha.indexOf(ar[0]);
        plain_text[indx++] = ar[0];
        n += ar[1];
    }
} // end decrypt

function get_score(buf_len){
	var score,i,n;
	get_trial_decrypt();    
	// get tetgraph score		
	score = 0.0;
	for (i=0;i<plain_text.length-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
    //score = 100*score/plain_text.length; // will be variable length, so normalize    
    return(score);
}


function get_key_array(wrd){
        var i,j,c,n,n2;
        var indx;
        
        key = [];
        var used_indx = [];
        for (i=0;i<26;i++) used_indx[i] = 0
        indx = 0;
        for (i=0;i<wrd.length;i++){
            c = wrd.charAt(i);
            n = l_alpha.indexOf(c);
            if (  used_indx[n] == 0 ){
                key[indx++] = n;
                used_indx[n] = 1;
            }
        }
        for (i=0;i<26;i++){
            if (  used_indx[i] == 0 )
                key[indx++] = i
        }
}

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
	postMessage("00~tet table initialized");
}	

 
function do_key_search(str){
	var str,c,i,n,j,k;
    var flag,index,cnt;
    var wrd;
    var max_score,score,out_str;
    var w_index,x,y;
    

    initialize_tet_table();
    //initialize_morse_code();
    make_trie();
    cnt = 0;

    //str = document.getElementById('input_area').value;	   
    str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    max_score = -10000;
    for (w_index=0;w_index<word_list.length;w_index++) {
        wrd = word_list[w_index];
        get_key_array(wrd);
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = ''; 
			j=0;
			for (i=0;i<plain_text.length;i++){
				out_str += lowerC.charAt(plain_text[i]);
				j++;
				if ( plain_text[i] == ' ' && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2);
            out_str += "\nKey: "+wrd;
			out_str += '\nKey Array: ';
			for (i=0;i<26;i++) 
				out_str += alpha.charAt(key[i]);
			postMessage(out_str);
            //document.getElementById('output_area').value = out_str;
		}
        
    }
    postMessage("~");
//document.getElementById('debug_area').value="key search";
}

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
    str = event.data.str;
    do_key_search(str);
  }
}
