// PH hill-climber with log tetragraph scoring, rat's two-rectangle version
//importScripts('tettable.js'); 
importScripts('tet27table.js'); 

//postMessage("tet_values loaded");
var tet27_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ[";	
var alpha3="ABCDEFGHIJKLMNOPQRSTUVWXYZ ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var buf_len;
var whitespace="\n\t\r ',-.;=";

var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var l_array = [];
var inv = [];
var first_crib_pos = -1;
var starting_shift;
var key_len = 12;
var key_word = [];
var used_let = [];
var numb_symbols = 24;

var word_list,word_count;


function alltrim(str) { // remove leading and trailing blanks
    return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
    return str.replace(/\s+/g, ' ');
}

function letters_only(str){ // remove everthing except letters
	str = str.toLowerCase();
	return str.replace(/[^a-z]/g,'');
}

function digits_only(str){ // remove everthing except digits
	str = str.toLowerCase();
	return str.replace(/[^0-9]/g,'');
}

function blanks_only(str) { // replace all non letters by blanks
	str = str.toLowerCase();
	return str.replace(/[^a-z]/g,' ');
}
function one_blank_separator(str){// return words separated by exactly one blank
		str = blanks_only(str);
		str = alltrim(str);
		str = condense_white_space(str)
		return(str);
}


function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = 0.0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    var spaceFlag = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = whitespace.indexOf(c);
        if ( n >= 0) {
            if (spaceFlag == 1) continue; // in the middle of a bunch of blanks
            spaceFlag = 1;
            c = ' ';
        }
        n = alpha3.indexOf(c);
        if ( n == -1) continue;
        if ( n<26) spaceFlag = 0;
        if (state = 0) {
            n1 = n;
            c1 = c;
        }
        else if (state == 1) {
            n2 = n;
            c2 = c;
        }
        else if (state == 2) {
            n3 = n;
            c3 = c;
        }
        else {
            //x = n+27*n3+27*27*n2+27*27*27*n1;
            x = n1+27*n2+27*27*n3+27*27*27*n;
            tet27_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet27_table[x] > max_v) {
                max_v = tet27_table[x];
                mc1 = c1;
                mc2 = c2;
                mc3 = c3;
                mc4 = c;
            }
            max_n++;
            c1 = c2;
            c2 = c3;
            c3 = c;
        }
        state++;
    }    
    s += '\nthere were '+max_n+' 27 char tetragraphs with greatest value of '+max_v;
    s += ' for tet: '+mc1+mc2+mc3+mc4;
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet27_table[i] = Math.log(1+tet27_table[i]);
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = Math.log(1+tet27_table[i]);
    
    postMessage(s);    
}    

function initialize_tet_table(){
	var i,c,n,v;
    
	for ( i = 0; i<27*27*27*27;i++)
		tet27_table[i] = 0.0;
	for ( c in tet27_values){
		n = alpha.indexOf(tet27_values[c].charAt(0))+	27*alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet27_table[n] = v;
	}
    
	//alert("tet_table initialized");
	postMessage("tet table initialized");
}	
initialize_tet_table();
max_trials = 1000000;

function make_word_list(str) {
	var s,n;
    var state,i,c,index;
	
    s = "making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    state = 0; //no current word
    s = '';
    index = 0;
	word_list = [];
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( state == 0 && n >=0) {
			s = c;
			state = 1;
		}
		else if (state==1){
			if ( n >=0)
				s += c;
            else {
                word_list[index++] = s;
                state = 0;
            }				
		}
	}
    if (state == 1)
        word_list[index++] = s;
	word_count = word_list.length; // global variable
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
		
    postMessage(s);    
}    


function get_next_key(key_word){
    var i,j,n,cnt;
    
	l_array = [];
	key_len = key_word.length;
    for (i=0;i<26;i++)
        used_let[i] = 0;
		if (numb_symbols == 24){
			//if ( n == 9 || n == 23) n++;
			used_let[9] = 1; // j
			used_let[23] = 1; // x 
		}
	cnt =  0;
    for (i=0;i<key_len;i++){
		if ( used_let[ key_word[i] ] == 1)
			continue;
        used_let[ key_word[i] ] = 1;
        l_array[cnt++] = key_word[i];
    }
    n = cnt;
    for (i=0;i<26;i++) // 26 OK because we set used_let to 1 for j,x if number_symbols = 24;
        if ( used_let[i] == 0)
            l_array[n++] = i;
}    

function get_trial_decrypt(){
        var i,j,k,x,y,n;
        var index, w_index;
        var offset,c;
        var inv_array = [];
		for (i=0;i<numb_symbols;i++)
			inv_array[ l_array[i] ] = i;
        index = w_index=0;
        for (j=0;j<words.length;j++) {
                offset = (j+1)%numb_symbols;
                for (x=0;x<words[j].length;x++) {
                        k = words[j][x];
						n = inv_array[k];
						plain_text[index++] = l_array[(numb_symbols-offset+n)%numb_symbols];
                        offset = (offset+1) % numb_symbols;
                } /* next x */
                plain_text[index++] = 26; /* blank symbol */
        } /* next j */
        plain_len = index;
}


function get_score(buf_len){
	var score,i,n;

    score = 0.0
	get_trial_decrypt();
		// get tetgraph score		

	for (i=0;i<plain_len-3;i++){
		n = plain_text[i]+27*plain_text[i+1]+27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
		score += tet27_table[n];
	}
	return(score);
}	

function do_search(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var word_number,key_word;
	var lower_c = 'abcdefghijklmnopqrstuvwxyz';
	
	str = str.toUpperCase();
	// global replace of line feeds and carriage returns with blank
	str = str.replace(/[\n\r]/g,' ');
    s = '';
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        //n = symbols.indexOf(c);
		n = alpha3.indexOf(c);
        if ( n >= 0)
            s += c;
    }
    s = alltrim(s);
    s = condense_white_space(s)
    // switch to indexes
    s = s.split(" ");
    words = [];
    for (i=0;i<s.length;i++){
        words[i] = [];
        for ( j=0;j<s[i].length;j++){
            c = s[i].charAt(j);
            words[i][j] = alpha.indexOf(c);
        }
    }
	
	score = 0;
	max_score = -1000;
	for (word_number = 0;word_number<word_list.length;word_number++){
		keyword = [];
	for (i=0;i<word_list[word_number].length;i++){
		c = word_list[word_number].charAt(i).toLowerCase();
		n  = lower_c.indexOf(c);		
		if (numb_symbols == 24)
			if ( n == 9 || n == 23) n++;
		if (n>=0)
			keyword[i] = n
	}
	
        get_next_key(keyword); // entend key_word to l_array

		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			//out_str = '0'; // 0 at beginning is signal to post message in output box
			out_str = '';
			//x = score.toFixed(2);
			//out_str += x+'~';
			for (i=0;i<plain_len;i++)
				out_str += alpha3.charAt(plain_text[i]).toLowerCase();
            out_str += '\nKey: ';
			out_str += word_list[word_number];
			out_str += '\nKey array: ';
			for (i=0;i<numb_symbols;i++)
				out_str += alpha3.charAt(l_array[i]);
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}


		
	} // next word number
	postMessage('~');
	
}
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,s;
  debugger;  
  var state = event.data.op_choice;
  if ( state == 1){ // word list
	str = event.data.str;
	make_word_list(str);
  }
  else if (state == 3){ // custom tet table
    str = event.data.str;
    make_table(str);
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
    str = event.data.str;
    do_search(str);
  }
};  
