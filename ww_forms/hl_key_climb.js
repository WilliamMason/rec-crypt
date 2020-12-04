// PH hill-climber 


var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];

var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var max_hat_len= 10; // default
var max_key_len = 10;
var key_len, hat_len;

var decimation = [];
var inverse_decimation = [];
var c_shift = [1,3,5,7,9,11,15,17,19,21,23,25];
var key_array = [];
var start_pattern, start_let;
var chain_type;

max_trials = 1000000;


function get_score(){
	var score,i,n,j,k,le;
    var c1,c2,c3,c4;
	var alpha,score, h_score;
	var start_pos,d_start_pos, pos1,pos2;
	var nxt_letter;
    var alpha_limit;
    var best_alpha;

    key_array = [];
    for (i=0;i<key_len;i++)
        key_array[i] = key[i];
    index = key_len;
    for (i=0;i<26;i++){
        j = key_array.indexOf(i);
        if (j == -1)
            key_array[index++] = i;
    }
    for (j=0;j<26;j++)
        inverse_key[key_array[j]] = j;
    // does the key array match some decimation of the slidable alphabet?
    start_pattern = key_array[0];
    start_pos = inverse_key[ start_pattern ];
    h_score = 26;
    best_alpha = 0;
    if ( chain_type == '1')
        alpha_limit = 12;
    else if ( chain_type == '2')
        alpha_limit = 12*13;
    for ( alpha=0;alpha<alpha_limit;alpha++) {
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
                if ( c1 != c2) // error
                    score++;
                pos1 += le;
                pos2 = (pos2+1)%26;
            }
        }
        if ( h_score > score) {
            h_score = score;
            hat_len = le;
            best_alpha = alpha;
        }
        if ( score == 0 ) { // no mistakes, this could be the key
            break; // don't need to try other decimations
        }
    } // next alpha
    score = 26-h_score; // make higher score the better score
	return([score,best_alpha]);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s,result, best_decimation;
    var h_choice, old_key_len;
    var slide_index, temp_buffer;
  
	str = str.toUpperCase();
	buf_len = 0;
    if ( chain_type == '1') {
        for ( i=0;i<str.length;i++){
            c = str.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0)
                buffer[buf_len++] = n;
                //plain_text[buf_len++] = n;
        }
        // get decimations of the slidable alphabet and their inverses
        for (i = 0; i<12;i++) {
                x = 0;
                decimation[i] = [];
                inverse_decimation[i] = [];
                for (k=0;k<26;k++) {
                    decimation[i][k] = buffer[x];
                    inverse_decimation[i][ buffer[x] ] = k;
                    x = (x+c_shift[i]) % 26;
                }
        }
    }
    else if ( chain_type == '2') { // two 13-link chains
        for ( i=0;i<str.length;i++){
            c = str.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0)
                buffer[buf_len++] = n;
                //plain_text[buf_len++] = n;
        }
        temp_buffer = [];
        for (slide_index = 0 ;slide_index<13;slide_index++) {
            for (i=0;i<13;i++) {
                temp_buffer[2*i] = buffer[i];
                temp_buffer[2*i+1] = buffer[13+( (slide_index+i)%13)];
            }
    
            /* get decimations of the slidable alphabets and their inverses*/
            for (i = 0; i<12;i++) {
                    x = 0;
                    decimation[i+12*slide_index] = [];
                    inverse_decimation[i+12*slide_index] = [];
                    for (k=0;k<26;k++) {
                        decimation[i+12*slide_index][k] = temp_buffer[x];
                        inverse_decimation[i+12*slide_index][ temp_buffer[x] ] = k;
                        x = (x+c_shift[i]) % 26;
                    }
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
    key_len = Math.floor(Math.random()*(max_key_len-3))+3; // minimum key length is 3
        
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
	noise_level = begin_level;
	cycle_numb = 0;
	//max_score = current_hc_score = score = get_score();	
    result = get_score();
    max_score = current_hc_score = score = result[0];
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<key_len;i++)
		out_str += alpha.charAt(key[i]).toLowerCase();
	out_str += "\n initial is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        h_choice = Math.floor(Math.random()*100);
        if ( h_choice < 50) {
            n1 = Math.floor(Math.random()*26);
            v1 = key[n1];
            n2 = Math.floor(Math.random()*key_len);
            v2 = key[n2];
            key[n1] = v2;
            key[n2] = v1;
        }
        else {
            old_key_len = key_len;
            if (Math.floor(Math.random()*100) < 50) {	                        
                if (key_len < max_key_len)
                    key_len++;
                else
                    key_len--;
                }
            else {
                if (key_len>3)
                    key_len--;
                else
                    key_len++;
                }
        }    
		//score = get_score();
        result = get_score();
        score = result[0];
        best_decimation = result[1];
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<key_len;i++)
				out_str += alpha.charAt(key[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" out of 26 on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += '\nKey length: '+key_len+' hat length: '+hat_len;
            out_str += '\nDecimation: ';
            for (i=0;i<26;i++)
                out_str += alpha.charAt(decimation[best_decimation][i]);
			out_str += '\nKey Array:\n';
			for (i=0;i<26;i++) {
				out_str += alpha.charAt(key_array[i]);
                if ( ((i+1)%hat_len) == 0)
                    out_str += '\n';
            }
            out_str += '\n';
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*26/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
            if ( h_choice < 50) {
                key[n1] = v1;
                key[n2] = v2;
            }
            else
                key_len = old_key_len;
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
	max_hat_len = parseInt(s[3]);
	max_key_len = parseInt(s[4]);  
    chain_type = s[5]; // '1' or '2'
	// for debugging
	// s = '2max_hat_len passed is: '+period;
	// postMessage(s);
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
