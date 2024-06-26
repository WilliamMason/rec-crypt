// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ#"; // trifid inclides # symbol
var buffer = new Array();
var buffer2 = [];
var plain_text = new Array();
var plain_text2 = [];
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_array=[];
var buf_len,buf_len2;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default
var period2, c_start,c_start2,c_len;

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;


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

	
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;
        var work_key,used_let;
/*  leave in this routine in case you have to use key expansion on some difficult twin trifids
    var key_len = 7;   
    // get work_key
    work_key = [];
    used_let = [];
    for (i=0;i<27;i++)
        used_let[i] = 0;
    for (i=0;i<key_len;i++){
        work_key[i] = key[i];
        used_let[ key[i]] = 1;
    }
    j = key_len;
    for (i=0;i<27;i++)
        if ( used_let[i] == 0)
            work_key[j++] = i;
*/
    work_key = key; // just use regular key, seems to work OK
        // get inverse key 
	for (i=0;i<27;i++) {
		inverse_key[ work_key[i] ] = i;
	}    
	index =  y = 0;
	for (x=0;x<buf_len;x++) {
		c1 = Math.floor(inverse_key[ buffer[x] ]/9);
		c2 = Math.floor((inverse_key[ buffer[x] ] %9)/3);
		c3 = (inverse_key[ buffer[x] ] % 3);
		work_array[index++] = c1;
		work_array[index++] = c2;
		work_array[index++] = c3;
		if ( index == 3*period) { /* array is filled */
			for (k=0;k<index/3;k++)
				plain_text[y++]=work_key[ 9*work_array[k]+
					3*work_array[k+period]+
					work_array[k+2*period]];
			index = 0;
		} /* end if */
	} /* next x */
	if (index !=0 ) /* finish partially filled work_array */
		for (k=0;k<index/3;k++)
			plain_text[y++]=work_key[ 9*work_array[k]+
				3*work_array[k+index/3]+
				work_array[k+2*index/3]];
    // now decrypt second cipehrtext
	index =  y = 0;
	for (x=0;x<buf_len2;x++) {
		c1 = Math.floor(inverse_key[ buffer2[x] ]/9);
		c2 = Math.floor((inverse_key[ buffer2[x] ] %9)/3);
		c3 = (inverse_key[ buffer2[x] ] % 3);
		work_array[index++] = c1;
		work_array[index++] = c2;
		work_array[index++] = c3;
		if ( index == 3*period2) { /* array is filled */
			for (k=0;k<index/3;k++)
				plain_text2[y++]=work_key[ 9*work_array[k]+
					3*work_array[k+period2]+
					work_array[k+2*period2]];
			index = 0;
		} /* end if */
	} /* next x */
	if (index !=0 ) /* finish partially filled work_array */
		for (k=0;k<index/3;k++)
			plain_text2[y++]=work_key[ 9*work_array[k]+
				3*work_array[k+index/3]+
				work_array[k+2*index/3]];
		
}
	

function get_score(){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
    if ( crib_flag == 1){
        for (i=0;i<buf_len;i++){
            if (plain_text[i] == crib_buffer[i])
                score += 1.0
        }
        //score *= 100.0; // delay until check for 26
    }
    else if (crib_flag == 2){ // floating crib
        best_match = 0;
        for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
            if ( plain_text[crib_pos] == crib_buffer[0]) {
                     match = 0.0;
                    for (y=0;y<crib_len;y++)
                            if ( plain_text[crib_pos+y] == crib_buffer[y]) {
                                    match += 1.0
                    }
                    if (match>best_match) {
                            best_match = match;
                    }
        }
        score += best_match;  // delay multiply by 100 until check for 26
    }    
    for (i=0;i<buf_len;i++) 
       	if (plain_text[i]==26) score--;
    for (i=0;i<buf_len2;i++) 
       	if (plain_text2[i]==26) score--;
        
    // score for matches in common string
    for (i=0;i<c_len;i++)
        if (plain_text[i+c_start] == plain_text2[i+c_start2]) score++;
    score *= 100; // deduct a lot for # symbols in plaintext
	for (i=0;i<buf_len-3;i++){
		if ( plain_text[i]==26 || plain_text[i+1] == 26 ||
			plain_text[i+2]==26 || plain_text[i+3]==26)
				continue;
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	for (i=0;i<buf_len2-3;i++){
		if ( plain_text2[i]==26 || plain_text2[i+1] == 26 ||
			plain_text2[i+2]==26 || plain_text2[i+3]==26)
				continue;
		n = plain_text2[i]+26*plain_text2[i+1]+26*26*plain_text2[i+2]+26*26*26*plain_text2[i+3];
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
  
   // str is two ciphertexts separated by a colon;
	str = str.toUpperCase();
    debugger;
    s = str.split(':');
    str = s[0];
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    if (crib_flag >= 1){
        crib = crib.toUpperCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            if (c == '-')
                crib_buffer[crib_len++] = -1;
            else {
                n = alpha.indexOf(c);
                if ( n>=0)
                    crib_buffer[crib_len++] = n;
            }
        }
    }
    str = s[1]; // second ciphertext
	buf_len2 = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer2[buf_len2++] = n;
	}
    
	for (i=0;i<27;i++) {
		key[i] = i;
	}
	// random start;
	for (i=26;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score();	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
    out_str += '\n';
    for (i=0;i<buf_len2;i++)
		out_str += alpha.charAt(plain_text2[i]).toLowerCase();
        
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*27);
		n2 = Math.floor(Math.random()*27);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score();
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
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nKey: ';
			for (i=0;i<27;i++) 
				out_str += alpha.charAt(key[i]);
            out_str += '\n';
			for (i=0;i<buf_len2;i++)
				out_str += alpha.charAt(plain_text2[i]).toLowerCase();
                
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
	period = parseInt(s[3]);
    c_start = parseInt(s[4]);
    period2 = parseInt(s[5]);
    c_start2 = parseInt(s[6]);
    c_len = parseInt(s[7]);
	// for debugging
	// s = '2period passed is: '+period;
	// postMessage(s);
  }
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
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
