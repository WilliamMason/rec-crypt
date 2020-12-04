// mysz pseudokey hill-climber 
importScripts('tet27table.js'); 

var tet27_table = [];
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ[";	
var alpha27  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var whitespace="\n\t\r ',-.;=";


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
}	
initialize_tet_table();

function make_custom_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    //s = "0making table from sring of length "+str.length;
    //postMessage(s);
    debugger;
    str = str.toUpperCase();
    // do 27 char tet table
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = 0.0;
    max_n = 0;
    max_v=0;
    state = 0;
    var spaceFlag = 0;
    for (i=0; i<str.length;i++) { 
        c = str.charAt(i);
        n = whitespace.indexOf(c);
        if ( n >= 0) {
            if (spaceFlag == 1) continue; // in the middle of a bunch of blanks
            spaceFlag = 1;
            c = ' ';
        }
        n = alpha27.indexOf(c);
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
    // s += '\nthere were '+max_n+' 27 char tetragraphs with greatest value of '+max_v;
    // s += ' for tet: '+mc1+mc2+mc3+mc4;
    // still have to convert to logs.
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = Math.log(1+tet27_table[i]);
    
    //postMessage(s);    
}    


function space(c){
    var space_chars = ['-','=',' ',',','.','"']
    if (space_chars.indexOf(c) != -1)
        return(true);
    return(false)
}    


//var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var max_index;
var key_array = [];
var word_array = [];

var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var max_hat_len= 10; // default
var max_key_len = 10;
var key_len, hat_len;

var key_pattern = [];

max_trials = 1000000;


function get_score(){
	var score,i,n,j,k,le;
    var c1,c2,c3,c4;
	var alpha,score, h_score;
	var start_pos,d_start_pos, pos1,pos2;
	var nxt_letter;
    var alpha_limit;

    key_array = [];
    for (i=0;i<=max_index;i++)
        key_array[i] = key[i];
    key_array.sort(function(a, b){return a-b});
    for (i=0;i<key_len;i++)
        word_array[i] = key_array[ key_pattern[i] ] ;
    score = 0;
    // put blank (26) in front of key word
    index = 26+27*word_array[0]+27*27*word_array[1]+27*27*27*word_array[2];
    score += tet27_table[index];
    for (j=0;j<key_len-3;j++) {
        index = word_array[j]+27*word_array[j+1]
            +27*27*word_array[j+2]+27*27*27*word_array[j+3];
        score += tet27_table[index];
    }
    // put blank (26) after key word
    index = word_array[key_len-3]+27*word_array[key_len-2]
            +27*27*word_array[key_len-1]+27*27*27*26;
    score += tet27_table[index];            
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var h_choice, old_key_len;
    var slide_index, temp_buffer;
    var letter_flag,next_index;
  
    var upper_c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	str = str.toUpperCase(); // key pattern in uppercase latters
    s = '';
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = upper_c.indexOf(c);
        if (n!= -1)
            s+=c;
    }
    // get numerical key pattern
    letter_flag = false;
    max_index = next_index = 0;
    for (i=0;i<26;i++){
        if (letter_flag) next_index++; // letter found in last pass
        letter_flag = false;
        c = upper_c.charAt(i);
        for (j=0;j<s.length;j++){
            if ( s.charAt(j) == c){
                letter_flag = true;
                key_pattern[j] = next_index;
                max_index = next_index; // max_index is global
            }
        }
    }
        
	// random start;
    for (i=0;i<26;i++)
        key[i] = i
    for (i=25;i>1 ; i--) {
        x = key[i];
        j = Math.floor(Math.random()*i);
        key[i] = key[j];
        key[j] = x;
    }
    key_len = key_pattern.length;
        
	// cycle_limit = 20;
	// //fudge_factor = 0.23; // now sent via post message
	// begin_level = 1.0
	// noise_step = 1.5;
	// noise_level = begin_level;
	// cycle_numb = 0;
	max_score = current_hc_score = score = get_score();	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<key_len;i++)
		out_str += alpha.charAt(word_array[i]).toLowerCase();
	out_str += "\n initial is "+score;
		postMessage(out_str);

	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
            n1 = Math.floor(Math.random()*(max_index+1));
            v1 = key[n1];
            n2 = Math.floor(Math.random()*(25-max_index));
            v2 = key[n2+max_index+1];
            key[n1] = v2;
            key[n2+max_index+1] = v1;
		score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<key_len;i++)
				out_str += alpha.charAt(word_array[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" out of 26 on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += '\nKey length: '+key_len;
			out_str += '\nKey Array:\n';
			for (i=0;i<26;i++) {
				out_str += alpha.charAt(key[i]);
            }
            out_str += '\n';
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
       	//if (score > current_hc_score-fudge_factor*26/(noise_level)) {				
        if (score > current_hc_score) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;
            mut_count = 0;
		}
		
		else {

                key[n1] = v1;
                key[n2+max_index+1] = v2;
                mut_count++;
                if ( mut_count > 500)
                    current_hc_score = -1000;
		}
		// noise_level += noise_step;	
		// if ( ++cycle_numb >= cycle_limit) {
			// noise_level = begin_level;
			// cycle_numb = 0;
		// }
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

  //debugger;
  var op_choice = event.data.op_choice; // string to decode
  if (op_choice=='solve')  {
  	max_trials = parseInt(event.data.max_trials);
  	//fudge_factor = parseFloat(event.data.fudge); // but maybe not use PH climbing
  	n = parseInt(event.data.seed);
  	Math.random(n); // seed for hill-climbing
	postMessage("1working...");
	do_hill_climbing(event.data.pattern);

	postMessage("1DONE"); // 1 at beginning is signal not to post in output box

  }
  else if ( op_choice == 'make_table'){
        str1 = event.data.str1;
        make_custom_table(str1);
  }  
};  
