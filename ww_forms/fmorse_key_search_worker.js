importScripts('tet27table.js'); 

// frac morse key search
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];

var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
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
/* codes: 0 = dot, 1 = dash ,2 = end of letter */
var m_code= [ 'e',0,2,
        't',1,2,
        'i',0,0,2,
        'a',0,1,2,
        'n',1,0,2,
        'm',1,1,2,
        's',0,0,0,2,
        'u',0,0,1,2,
        'r',0,1,0,2,
        'w',0,1,1,2,
        'd',1,0,0,2,
        'k',1,0,1,2,
        'g',1,1,0,2,
        'o',1,1,1,2,
        'h',0,0,0,0,2,
        'v',0,0,0,1,2,
        'f',0,0,1,0,2,
        'l',0,1,0,0,2,
        'p',0,1,1,0,2,
        'j',0,1,1,1,2,
        'b',1,0,0,0,2,
        'x',1,0,0,1,2,
        'c',1,0,1,0,2,
        'y',1,0,1,1,2,
        'z',1,1,0,0,2,
        'q',1,1,0,1,2,
        '1',0,1,1,1,1,2,
        '2',0,0,1,1,1,2,
        '3',0,0,0,1,1,2,
        '4',0,0,0,0,1,2,
        '5',0,0,0,0,0,2,
        '6',1,0,0,0,0,2,
        '7',1,1,0,0,0,2,
        '8',1,1,1,0,0,2,
        '9',1,1,1,1,0,2,
        '0',1,1,1,1,1,2,
        '.',1,0,1,0,1,0,2,
        ',',1,1,0,0,1,1,2,
        '?',0,1,0,1,0,1,2,
        ':',1,1,1,0,0,0,2,
        ';',1,0,1,0,1,0,2,
        '-',1,0,0,0,0,1,2,
        '/',1,0,0,1,0,2,
        '=',1,0,0,0,1,2,
         -1 ];



function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<27*27*27*27;i++)
		tet_table[i] = 0.0;
	for ( c in tet27_values){
		n = ext_alpha.indexOf(tet27_values[c].charAt(0))+	27*ext_alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*ext_alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*ext_alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	//postMessage("00~tet table initialized");
}	
function initialize_morse_code(){
	var cn,nindex,i,j,k,n;
	var c;
	
	for (i=0;i<100;i++){
		morse[i] = {};
		morse[i].nxt0 = -1;
		morse[i].nxt1 = -1;
		morse[i].letter = -1;
	}
	start0 = 0;
	start1 = 1;
	free_index = 2;		
    j = 0;
    while( (c = m_code[j++]) != -1 ) {
//                printf("%c",c);
//				li += c;
            cn = m_code[j++];
            if ( cn != 0)
                index = start1;
            else
                index = start0;
            while( (cn = m_code[j++]) != 2 ) {
                if ( cn != 0) { /* dash next */
                    nindex = morse[index].nxt1;
                    if ( nindex == -1) {
                        nindex = free_index++;
                        morse[index].nxt1 = nindex;
                    }
                }
                else        { /* dot next */
                    nindex = morse[index].nxt0;
                    if ( nindex == -1) {
                        nindex = free_index++;
                        morse[index].nxt0 = nindex;
                    }
                }
                index = nindex;
            } /* end while */
            /* end of letter */
            morse[index].letter = c;
    } /* end while, get next letter */
	// set up inverse table to speed things up
	n=0;
	for (i=0;i<3;i++) for (j=0;j<3;j++) for (k=0;k<3;k++)
		inverse_table[n++] = [i,j,k];
	//postMessage("00~morse code initialized");	
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

function tsearch(ndex) {
    var c;
    var index,nindex,x;
	
    x = ndex;
    c = work_buffer[x++];
    if ( c== END_SYMBOL) { /* end of word */
            return(' ');
    }
    if ( c != 0 )
            index = start1;
    else
            index = start0;

    while( (c=work_buffer[x++])!= END_SYMBOL && x< code_len) {
            if (c != 0) {
                nindex = morse[index].nxt1;
                if ( nindex == -1) { /* no such letter*/
                        return(ERROR_SYMBOL);
                }
            }
            else {
                nindex = morse[index].nxt0;
                if ( nindex == -1) { /* no such letter*/
                        return(ERROR_SYMBOL);
                }}
            index = nindex;
    } /* end while */
    if ( morse[index].letter == -1 ) /* no corresponding letter*/
            return(ERROR_SYMBOL);
    return(morse[index].letter);
} /* end tsearch */

	
function get_trial_decrypt(){
        var i,j,k,x,y;
        var c1,c2,c3,c4;

        // get inverse key 
	for (i=0;i<26;i++) {
		inverse_key[ key[i] ] = i;
	}    
	y = 0;
	code_len = 0;
	for (x=0;x<buf_len;x++) {
		work_buffer[code_len++] = inverse_table[ inverse_key[ buffer[x] ] ][0];
		work_buffer[code_len++] = inverse_table[ inverse_key[ buffer[x] ] ][1];
		work_buffer[code_len++] = inverse_table[ inverse_key[ buffer[x] ] ][2];
		
	} /* next x */
    if (work_buffer[code_len-1] != END_SYMBOL)
      	work_buffer[code_len++] = END_SYMBOL;
    /* now morse code translate into symbols*/
    x = plain_len = 0;
    while( x<code_len) {
            if ( work_buffer[x] == END_SYMBOL) {
                    plain_text[plain_len++] = ' ';
                    x++;
                    if ( x>= code_len)
                            break;
            }
            plain_text[ plain_len++ ] = tsearch(x);
            while( work_buffer[x++] != END_SYMBOL && x <code_len);
    } /* end while */
}

function get_score(buf_len){
	var score,i,n;

	lowerC = "abcdefghijklmnopqrstuvwxyz ";
	get_trial_decrypt();
	// convert to form we can score
	for (i=0;i<plain_len;i++) {
		c = plain_text[i];
		if ( lowerC.indexOf(c) == -1 )
			score_buffer[i] = 27;
		else
			score_buffer[i] = lowerC.indexOf(c);
	}
			
	score = 0.0;
      /* penalties */
      for (j=0;j<plain_len;j++)
              if ( plain_text[j] == ERROR_SYMBOL)
                      score--;
      /* 2 blanks in a row */
      for (j=0;j<plain_len-1;j++)
              if ( plain_text[j] == ' ' &&
                      plain_text[j+1] == ' ' )
                      score--;
      /* trippled letters */
      for (j=0;j<plain_len-2;j++)
              if ( plain_text[j] == plain_text[j+1] &&
                      plain_text[j] == plain_text[j+2])
                      score--;
      /* single letters */
      for (j=0;j<plain_len-2;j++)
                if ( plain_text[j] == ' ' &&
                        ' ' == plain_text[j+2] ) {
                        c=plain_text[j+1];
                        if ( 'b' <= c && c <= 'z' && c != 'i' )
                        score--;
       }
                        
		score *= 100;
    /* tetragrams */
    for (i=0;i<plain_len-3;i++) {
        if ( score_buffer[i] == 27 || score_buffer[i+1]==27||
        	score_buffer[i+2] == 27 || score_buffer[i+3]==27) continue;
        index = score_buffer[i]+27*score_buffer[i+1]
                            +27*27*score_buffer[i+2]+27*27*27*score_buffer[i+3];
       	score += tet_table[index];
   }
    
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
 
function do_key_search(str){
	var str,c,i,n,j,k;
    var flag,index,cnt;
    var wrd;
    var max_score,score,out_str;
    var w_index,x,y;
    

    initialize_tet_table();
    initialize_morse_code();
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
			for (i=0;i<plain_len;i++){
				out_str += plain_text[i];
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
