// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_array=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default


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
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}	
initialize_tet_table();
max_trials = 1000000;


function decode_pair(k,c1, c2) {
        var t_flag,b_flag,t_index,b_index;
        var rvalue,sum;

        if (c1<13) t_flag = 0;
        else t_flag = 2;
        if ( c2 % 2 ) b_flag = 1;
        else b_flag = 0;
        t_index = (c1+key[k]) % 13;
        b_index = ( (c2>>1) + 13 - key[k] ) % 13;
        rvalue = [0,0];
        sum = t_flag+b_flag;
        if ( sum == 0){ // both top rows 
                if (b_index == c1) {// vertically aligned 
                        //*c3 = ((c1+key_word[k])%13)+13;
                        //*c4 = c2+1;
                        rvalue = [((c1+key[k])%13)+13,c2+1]
                }
                else { // c1,c2 form rectangle 
                        //*c3 = b_index;
                        //* c4 = 2*t_index;
                        rvalue = [b_index,2*t_index];
                }

        }
        else if (sum == 1) { // c1 top, c2 bottom 
                if (b_index == c1 ) {
                        //*c3 = ((c1 +key_word[k])%13) +13;
                        //* c4 = c2 - 1;
                        rvalue = [ ((c1 +key[k])%13) +13, c2 - 1];
                }
                else {
                        //*c3 = b_index;
                        //*c4 = 2 * t_index+1;
                        rvalue = [b_index, 2 * t_index+1];
                }
        }
        else if ( sum == 2) { //c1 bottom, c2 top
			if (c1-13 != (c2 >> 1)) // c1,c2 not verticaly aligned
				rvalue = [ (c2 >> 1)+13,(c1-13) << 1];
            else
                //*c3 = ( c1 - key_word[k] ) % 13;
                // * c4 = c2 +1;
                rvalue = [ ( c1 - key[k] ) % 13,c2 +1];

        }
        else if ( sum == 3) { //c1, c2 both bottom
			if (c1-13 != (c2>>1))// c2, c2 not vertically aligned
				rvalue = [(c2>>1)+13,( (c1-13)<<1 )+1 ]
            else
                //        *c3 = ( c1 - key_word[k] ) % 13;
                //        * c4 = c2 -1;
                rvalue = [ ( c1 - key[k] ) % 13,c2 -1];
        }
        return(rvalue);
} /* end decode_pair */


	
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;
        var big_step, remainder;
        
        big_step = 2*period;
        for (j=0;j<buf_len;j=j+big_step) 
                for (k=0;k<period;k++) {
                        c1 = buffer[j+k];
                        c2 = buffer[j+k+period];
                        if (j+k+period >= buf_len) break;
                        result = decode_pair(k,c1,c2)
                      	c3 = result[0];
                       	c4 = result[1];
                        plain_text[j+k] = c3;
                        plain_text[j+k+period]= c4;
        } /* next k,j */
        remainder = buf_len % (2*period); // left overs at end ? 
        if (remainder != 0) {
                n = buf_len - remainder;
                for (k=0;k<(remainder/2);k++) {
                        c1 = buffer[n+k];
                        c2 = buffer[n+k+(remainder/2)];
                        result = decode_pair(k,c1,c2)
                      	c3 = result[0];
                       	c4 = result[1];
                        plain_text[n+k] = c3;
                        plain_text[n+k+(remainder/2)]= c4;
                } /* next k */
        } /* end if */                        
}
	

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
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
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	// random start;
    for (i=0;i<period;i++)
        key[i] = Math.floor( Math.random()*13);
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score(buf_len);	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*period);
		v1 = key[n1];
		key[n1] = Math.floor(Math.random()*13);
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
			out_str += '\nKey: ';
			for (i=0;i<period;i++) 
				out_str += "["+alpha.charAt(2*key[i])+","+alpha.charAt(2*key[i]+1)+"]";
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
	period = parseInt(s[3]);
	// for debugging
	// s = '2period passed is: '+period;
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
