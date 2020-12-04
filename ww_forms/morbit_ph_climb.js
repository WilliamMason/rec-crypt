// PH hill-climber with log tetragraph scoring
importScripts('tet27table.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var symbols = '123456789';
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
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
	postMessage("00~tet table initialized");
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
	for (i=0;i<3;i++) for (j=0;j<3;j++)
		inverse_table[n++] = [i,j];
	postMessage("00~morse code initialized");	
}
initialize_tet_table();
initialize_morse_code();
max_trials = 1000000;

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
	for (i=0;i<9;i++) {
		inverse_key[ key[i] ] = i;
	}    
	y = 0;
	code_len = 0;
	for (x=0;x<buf_len;x++) {
		work_buffer[code_len++] = inverse_table[ inverse_key[ buffer[x] ] ][0];
		work_buffer[code_len++] = inverse_table[ inverse_key[ buffer[x] ] ][1];
		
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

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
  
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = symbols.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	for (i=0;i<9;i++) {
		key[i] = i;
	}
	// random start;
	for (i=8;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
	cycle_limit = 25;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0 * buf_len;
	// out_str = '0';
	// x = score.toFixed(2);
	// out_str += x+'~';
	// for (i=0;i<buf_len;i++)
		// out_str += alpha.charAt(plain_text[i]).toLowerCase();
	// out_str += "\n score of plaintext is "+score;
	// //document.getElementById('output_area').value = out_str;	
	// postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*9);
		n2 = Math.floor(Math.random()*9);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<plain_len;i++){
				out_str += plain_text[i];
				j++;
				if ( plain_text[i] == ' ' && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
			out_str += '\nKey: ';
			for (i=0;i<9;i++) 
				out_str += symbols.charAt(key[i]);
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
			key[n1]=v1;
			key[n2]=v2;
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
			
		
	} // next trial
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
