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

function alltrim(str) { // remove leading and trailing blanks
    return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
    return str.replace(/\s+/g, ' ');
}

function reformat(st){
    var out_str,s,str;
    
	//str = document.getElementById('input_area').value;
    // remove apostophes, hyphens, and equal signs
    str = st.replace(/[\'\-\=]/g,""); 
    // replace new lines by blanks     
    str = str.replace(/[\n\r]/g,' '); 
    str = str.toLowerCase();
    // replace all non-alphabetic characters by blanks   
    str = str.replace(/[^a-z]/g,' ');
    // reduce to just one space between words
    str = alltrim(str);
    str = condense_white_space(str)
	//document.getElementById('output_area').value = out_str;
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
        if (state == 0) {
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
	postMessage("00~tet table initialized");
}	
initialize_tet_table();
max_trials = 1000000;

function get_next_key(){
    var i,j,n;
    
    for (i=0;i<26;i++)
        used_let[i] = 0;
    for (i=0;i<key_len;i++){
        used_let[ key_word[i] ] = 1;
        l_array[i] = key_word[i];
    }
    n = key_len;
    for (i=0;i<26;i++)
        if ( used_let[i] == 0)
            l_array[n++] = i;
}    
    
function get_trial_decrypt(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;
        var shift,st,score;
        /* get plain text */
        get_next_key(); // entend key_word to l_array
        for (j=0;j<26;j++)
            inv[l_array[j]] = j;

        shift = starting_shift;
        st = 0;
        if (first_crib_pos != -1) { // fill in plaintext right-to-left from first crib position
            st = first_crib_pos;
            plain_text[st] = crib_buffer[st];
            shift = inv[plain_text[st]]+1;
            n = inv[buffer[st]];
            for (j=st-1;j>=0;j--){
                if ( buffer[j] == 26)
                        plain_text[j] = 26;
                else {
                    plain_text[j] = l_array[ (26+n-shift)%26 ];
                    shift = inv[plain_text[j]]+1;
                    n = inv[buffer[j]]; 
                    if ( st == first_crib_pos) // reset st to first NON-BLANK char to left of first crib entry
                        st = j;
                }
            }
            //shift = inv[plain_text[st-1]]+1;  // reset shift for left-to-right loop below  
            shift = inv[plain_text[st]]+1; 
            // reset shift for left-to-right loop below. Redefined st because original plain[st-1] might = 26!  
            st++;
        }
        score = 0;        
        for (j=st;j<buf_len;j++) { // fill in rest of plaintext left-to-right to end of cipher
                if ( buffer[j] == 26)
                        plain_text[j] = 26;
                else {
                    n = inv[buffer[j]];
                    if ( crib_buffer[j] != -1){
                        plain_text[j] = crib_buffer[j];
                        if (plain_text[j] == l_array[ (26+n-shift)%26 ])
                            score ++;
                    }    
                    else
                        plain_text[j] = l_array[ (26+n-shift)%26 ];
                    shift = inv[plain_text[j]]+1;
                }
        }
        return(score);
}

	

function get_score(buf_len){
	var score,i,n;

    score = 0.0
    score += get_trial_decrypt(); // bonus score for matching crib.
    score = 100.0*score;
		// get tetgraph score		

	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+27*plain_text[i+1]+27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
		score += tet27_table[n];
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
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha3.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    if (crib_flag == 1){ // fixed crib
        first_crib_pos = -1;
        crib = crib.toUpperCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            if (c == '-')
                crib_buffer[crib_len++] = -1;
            else {
                n = alpha3.indexOf(c);
                if ( n>=0) {
                    if ( first_crib_pos == -1 && n<26) // first non-blank crib entry
                        first_crib_pos = crib_len;
                    crib_buffer[crib_len++] = n;
                }
            }       
        }
    }
    else // blank out crib buffer
        for (i=0;i<buf_len;i++) crib_buffer[i] = -1;
    for (i=0;i<26;i++)
        key_word[i] = i;
	// random start;
	for (x=25;x>1;x--){
		j = Math.floor( Math.random()*x);
        i = key_word[j];
        key_word[j] = key_word[x];
        key_word[x] = i
	}
    starting_shift = Math.floor( Math.random()*26);
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score(buf_len);	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha3.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*key_len);
		n2 = Math.floor(Math.random()*26);
        c1 = key_word[n1];
        c2 = key_word[n2];
        key_word[n1] = c2;
        key_word[n2] = c1;
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha3.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
            out_str += '\nKey: ';
			for (i=0;i<26;i++)
				out_str += alpha3.charAt(l_array[i]);
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
            key_word[n1] = c1;
            key_word[n2] = c2;
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
	var mut_count,s;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
  	n = parseInt(s[3]);    
    key_len = n;
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }
  
  // if (str.charAt(0)  == '@')
  	// max_trials = parseInt(str.slice(1));
  // else if (str.charAt(0)  == '~') {// redo the random seed
  	// trial = parseInt(str.slice(1));
  	// Math.random(trial);
  // }
  else if (str.charAt(0)  == ')')  { // crib indicator, then 0, no crib, 1 fixed crib,2 floating crib
    if (str.charAt(1)=='1') {
        crib_flag = 1;
        crib = str.slice(2);
    }
    else if (str.charAt(1)=='2') {
        crib_flag = 2;
        crib = str.slice(2);
    }
    else crib_flag = 0;
  }
  else {
		postMessage("1working...");
        str = reformat(str);
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
