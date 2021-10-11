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
var key2 = [];
var inverse_key = [];
var work_array=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default

// doppleschach score vars.
var random_score = 17
var std_eng_score = 404

var crib_flag=0;
var crib;
var crib_buffer = [];
//var crib_len;
// allow multiple floating cribs. To be practical restrict to 3, never had more than that in the Cryptogam. 
var float_crib;
var MAX_CRIBS = 3;
var numb_cribs;


var inc_limit,dec_limit;

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var weighted_tet_sum, unweighted_tet_sum;            
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    // initialize tet table
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = 0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n == -1) continue; //not a letter
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
            //x = n+26*n3+26*26*n2+26*26*26*n1;
            x = n1+26*n2+26*26*n3+26*26*26*n;
            tet_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet_table[x] > max_v) {
                max_v = tet_table[x];
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
    s = '0there were '+max_n+' tetragraphs with greatest value of '+max_v;
    s += ' for tet: '+mc1+mc2+mc3+mc4;
    weighted_tet_sum = 0;
    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
            n = tet_table[i];
            tet_table[i] = Math.log(1+tet_table[i]);
            weighted_tet_sum += n*tet_table[i];
            unweighted_tet_sum += tet_table[i];            
    }
    // global variables for this tet table
    random_score = 100*unweighted_tet_sum / (26*26*26*26);
    std_eng_score = 100*weighted_tet_sum / max_n;
    
    postMessage(s);    
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
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}	
initialize_tet_table();
max_trials = 1000000;

	
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;

        // get inverse key 
		for (i=0;i<25;i++) {
			inverse_key[ key2[i] ] = i;
		}    
		index =  y = 0;
        for (x=0;x<buf_len;x++) {
                c1 = Math.floor((inverse_key[ buffer[x] ]/5));
                c2 = (inverse_key[ buffer[x] ] %5);
                work_array[index++] = c1;
                work_array[index++] = c2;
                if ( index == 2*period) { /* array is filled */
                        for (k=0;k<index/2;k++)
                                plain_text[y++]=key[ 5*work_array[k]+
                                        work_array[k+period]];
                        index = 0;
                } /* end if */
        } /* next x */
        if (index !=0 ) /* finish partially filled work_array */
                for (k=0;k<index/2;k++)
                        plain_text[y++]=key[ 5*work_array[k]+
                                work_array[k+index/2]];		    
		
}
	

function get_score(buf_len){
	var score,i,n;
    var best_match,match,crib_pos,y;
    var crib_start0, crib_start1,crib_len // floating cribs    

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
    if ( crib_flag == 1){
        for (i=0;i<buf_len;i++){
            if (plain_text[i] == crib_buffer[i])
                score += 1.0
        }
        score *= 100.0;
    }
    else if (crib_flag == 2){ // floating crib
        best_match = 0;
        crib_start0 = crib_start1 = -1;
        crib_len = float_crib[0].length;
        for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
            if ( plain_text[crib_pos] == float_crib[0][0]) {
                     match = 0.0;
                    for (y=0;y<crib_len;y++)
                            if ( plain_text[crib_pos+y] == float_crib[0][y]) {
                                    match += 1.0
                    }
                    if (match>best_match) {
                            best_match = match;
                            crib_start0 = crib_pos;
                    }
        }
        score += 100.0*best_match;
        if ( numb_cribs > 1) {
            best_match = 0;        
            crib_len = float_crib[1].length;        
            for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++) {
                if (crib_pos == crib_start0 ) continue;
                if ( plain_text[crib_pos] == float_crib[1][0]) {
                        match = 0.0;
                        for (y=0;y<crib_len;y++)
                                if ( plain_text[crib_pos+y] == float_crib[1][y]) {
                                        match += 1.0
                        }
                        if (match>best_match) {
                                best_match = match;
                                crib_start1 = crib_pos;
                        }
                }
            }
            score += 100.0*best_match;
        }
        if ( numb_cribs > 2) {
            best_match = 0;        
            crib_len = float_crib[2].length;        
            for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++) {
                if (crib_pos == crib_start0 || crib_pos == crib_start1 ) continue;
                if ( plain_text[crib_pos] == float_crib[2][0]) {
                        match = 0.0;
                        for (y=0;y<crib_len;y++)
                                if ( plain_text[crib_pos+y] == float_crib[2][y]) {
                                        match += 1.0
                        }
                        if (match>best_match) {
                                best_match = match;
                                crib_start1 = crib_pos;
                        }
                }
            }
            score += 100.0*best_match;
        }        
    
    }    
	for (i=0;i<buf_len-3;i++){
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) {
            score--;
            continue;
        }
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
    var op_choice;
	//var max_trials; // now global
	var s;
    var crib_len;
    var dopp_score, norm_score;    
    
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    if (crib_flag >= 1){
        crib = crib.toUpperCase();
        if ( crib_flag == 1 ){
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
        else { // crib_flag ==2, floating crib
            crib_len = 0;
            float_crib = [];
            numb_cribs = 0;
            float_crib[numb_cribs] = [];
            for (var i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if ( c == '\n'){
                    numb_cribs++;
                    float_crib[numb_cribs] = [];
                    crib_len = 0;
                    continue;
                }
                n = alpha.indexOf(c);
                if ( n>=0)
                    float_crib[numb_cribs][crib_len++] = n;
            }
            /* // this should already be checked 
            if ( numb_cribs==0 && crib_len == 0){
                alert("No crib entered!");
                return;
            }
            */ 
            while (numb_cribs>0 && float_crib[numb_cribs].length == 0) // last crib string ended in a new line, remove empty crib
                numb_cribs--;
            // but now final crib doesn't end in line feed, increment to get actual crib count.
            numb_cribs++;
            if ( numb_cribs > MAX_CRIBS) // allows 3, usually no more than 2
                numb_cribs = MAX_CRIBS;
        
        }    
    }
	n = 0;
	for (i=0;i<25;i++) {
		key[i] = n++;
		if (n==9) n++; // skip 'j'
	}
	// random start;
	for (i=24;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
	n = 0;
	for (i=0;i<25;i++) {
		key2[i] = n++;
		if (n==9) n++; // skip 'j'
	}
	// random start;
	for (i=24;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key2[j];
		key2[j]=key2[i];
		key2[i] = c;
	}
    
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
        op_choice = Math.floor(Math.random()*100);
        n1 = Math.floor(Math.random()*25);
        n2 = Math.floor(Math.random()*25);
        if ( op_choice<50) {
            v1 = key[n1];
            v2 = key[n2];
            key[n1]=v2;
            key[n2]=v1;
        }
        else {
            v1 = key2[n1];
            v2 = key2[n2];
            key2[n1]=v2;
            key2[n2]=v1;
        }
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
            norm_score = 100*score/(buf_len-3);
            dopp_score = (norm_score - random_score)/(std_eng_score - random_score);
            out_str += ", Doppleschach score: "+dopp_score.toFixed(2);
            
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nKeys: ';
			for (i=0;i<25;i++) 
				out_str += alpha.charAt(key[i]);
            out_str += '  ';
			for (i=0;i<25;i++) 
				out_str += alpha.charAt(key2[i]);
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
            if ( op_choice<50) {        
                key[n1]=v1;
                key[n2]=v2;
            }
            else {
                key2[n1]=v1;
                key2[n2]=v2;
            }
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+" ";
            if (v < dec_limit && cycle_limit>1){
                cycle_limit--;
                s += " decrementing, new cycle len: "+cycle_limit;
            }
            if (v >inc_limit){
                cycle_limit++;
                s += " incrementing, new cycle len: "+cycle_limit;
            }
            s += ')';            
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
    dec_limit = parseFloat(s[4]);
    inc_limit = parseFloat(s[5]);    
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
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }  
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
