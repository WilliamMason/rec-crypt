// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var alpha6="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var sq1 = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var sq2 = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var sq1_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var sq2_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var key6_flag = false;

/////////////a 1 b 2 c 3 d 4 e 5 f 6 g 7 h 8 i 9 j 0 k l m n o p q r s t u v w x y z}
xlate_pos = [0,27,1,28,2,29,3,30,4,31,5,32,6,33,7,34,8,35,9,26,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];


var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var buf_len;
var s4Flag = true;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

// doppleschach score vars, 5x5 version only
var random_score = 17
var std_eng_score = 404

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
        //tet_table[i] = Math.log(1+tet_table[i]);
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

function put_pc(c1,c2,i1) {
        var row1,col1,row2,col2;
		var tmp;

        row1=inv_row1[c1];
        col1=inv_col1[c1];
        row2=inv_row2[c2];
        col2=inv_col2[c2];
        
        if (s4Flag) {
        	// four square	        
        	tmp = 5*row1+col2;
        	if ( tmp>=9) tmp++; // skip 'j' slot
        	plain_text[i1] = tmp;
        	tmp = 5*row2+col1;
        	if ( tmp>=9) tmp++; // skip 'j' slot        
        	plain_text[i1+1]=tmp;
    	}
    	else {
	    	// two-square
        	if ( row1 == row2 ) {
        	        plain_text[i1] = c2;
        	        plain_text[i1+1] = c1;
        	        return;
        	}
        	plain_text[i1] = sq2[row1][col2];
        	plain_text[i1+1] = sq1[row2][col1];
    	}
		
}
	
function get_trial_decrypt(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;

        // get inverse key square
		for (i=0;i<5;i++) for (j=0;j<5;j++){
			inv_row1[ sq1[i][j] ] = i;
			inv_col1[ sq1[i][j] ] = j;
			inv_row2[ sq2[i][j] ] = i;
			inv_col2[ sq2[i][j] ] = j;			
		}                
        for (j=0;j<buf_len;j = j+2) {
                c1 = buffer[j];
                c2 = buffer[j+1];
				put_pc(c1,c2,j);
        }
}

function put_pc6(c1,c2,i1) {
        var row1,col1,row2,col2;
		var tmp;

        row1=inv_row1[c1];
        col1=inv_col1[c1];
        row2=inv_row2[c2];
        col2=inv_col2[c2];
        
        if (s4Flag) {
        	// four square	        
        	tmp = 6*row1+col2;
        	plain_text[i1] = xlate_pos[tmp];
        	tmp = 6*row2+col1;
        	plain_text[i1+1]=xlate_pos[tmp];
    	}
    	else {
	    	// two-square
        	if ( row1 == row2 ) {
        	        plain_text[i1] = c2;
        	        plain_text[i1+1] = c1;
        	        return;
        	}
        	plain_text[i1] = sq2_6[row1][col2];
        	plain_text[i1+1] = sq1_6[row2][col1];
    	}
		
}
	
function get_trial_decrypt6(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;

        // get inverse key square
		for (i=0;i<6;i++) for (j=0;j<6;j++){
			inv_row1[ sq1_6[i][j] ] = i;
			inv_col1[ sq1_6[i][j] ] = j;
			inv_row2[ sq2_6[i][j] ] = i;
			inv_col2[ sq2_6[i][j] ] = j;			
		}                
        for (j=0;j<buf_len;j = j+2) {
                c1 = buffer[j];
                c2 = buffer[j+1];
				put_pc6(c1,c2,j);
        }
}
	

function get_score(buf_len){
	var score,i,n,tet_score;

    if (key6_flag)
        get_trial_decrypt6();
    else
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
        score += 100.0*best_match;
    }    
    tet_score = 0;
	for (i=0;i<buf_len-3;i++){
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) {
            //score--;
            continue;
        }
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		tet_score += tet_table[n];
	}
//	return(score);
    score += tet_score;
    return([score,tet_score]);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
    var dopp_score, norm_score;
	//var max_trials; // now global
	var s;
    var result;
  
    if ( key6_flag){
        do_hill_climbing6(str)
        return;
    }
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
	n = 0;
	for (i=0;i<5;i++) for (j=0;j<5;j++){
		sq1[i][j] = n;
		sq2[i][j] = n++;
		if (n==9) n++; // skip 'j'
	}
	// random start;
	for (x=0;x<5;x++)for (y=0;y<5;y++) {
		j = Math.floor( Math.random()*5);
		i = Math.floor( Math.random()*5);
		c = sq1[x][y];
		sq1[x][y] = sq1[i][j];
		sq1[i][j] = c;
	}
	for (x=0;x<5;x++)for (y=0;y<5;y++) {
		j = Math.floor( Math.random()*5);
		i = Math.floor( Math.random()*5);
		c = sq2[x][y];
		sq2[x][y] = sq2[i][j];
		sq2[i][j] = c;
	}
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	//max_score = current_hc_score = score = get_score(buf_len);	
    result = get_score(buf_len);
    max_score = current_hc_score = score = result[0]; // index 0 is score including crib, index 1 is pure tet_score;
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
		n1 = Math.floor(Math.random()*5);
		n2 = Math.floor(Math.random()*5);
		n3 = Math.floor(Math.random()*5);
		n4 = Math.floor(Math.random()*5);
		sq_choice = Math.floor( Math.random()*100);
		if (sq_choice<50){
            /* simple sq1 pair swap */
           	c1 = sq1[n1][n2];
           	c2 = sq1[n3][n4];
           	sq1[n1][n2] = c2;
           	sq1[n3][n4] = c1;
       	}
		else{
            /* simple sq2 pair swap */
           	c1 = sq2[n1][n2];
           	c2 = sq2[n3][n4];
           	sq2[n1][n2] = c2;
           	sq2[n3][n4] = c1;
       	}
		//score = get_score(buf_len);
        result = get_score(buf_len);
        score = result[0]; // index 0 is score including crib, index 1 is pure tet_score;
        
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
            // random_score = 17
            // std_eng_score = 404
            //norm_score = 100*score/(buf_len-3);
            norm_score = 100*result[1]/(buf_len-3);
            dopp_score = (norm_score - random_score)/(std_eng_score - random_score);
            out_str += ", Doppleschach score: "+dopp_score.toFixed(2);
            
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			if(s4Flag) out_str += '\nS4 Keys: ';
			else out_str += '\nS2 Keys: ';
            out_str += '\n(right key) ';
			for (i=0;i<5;i++) for(j=0;j<5;j++)
				out_str += alpha.charAt(sq1[i][j]);
			out_str += '\n(left key) ';
			for (i=0;i<5;i++) for(j=0;j<5;j++)
				out_str += alpha.charAt(sq2[i][j]);
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
			if (sq_choice<50){
                // restore sq1 pairs
                sq1[n1][n2] = c1;
                sq1[n3][n4] = c2;                	
            }
			else{
                // restore sq2 pairs
                sq2[n1][n2] = c1;
                sq2[n3][n4] = c2;                	
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

function do_hill_climbing6(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var result;
  
	str = str.toUpperCase();
    //str = str.replace(/Ø/g,'0');    
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    if (crib_flag >= 1){
        crib = crib.toUpperCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            if (c == '-')
                crib_buffer[crib_len++] = -1;
            else {
                n = alpha6.indexOf(c);
                if ( n>=0)
                    crib_buffer[crib_len++] = n;
            }
        }
    }
	n = 0;
	for (i=0;i<6;i++) for (j=0;j<6;j++){
		sq1_6[i][j] = n;
		sq2_6[i][j] = n++;
	}
	// random start;
	for (x=0;x<6;x++)for (y=0;y<6;y++) {
		j = Math.floor( Math.random()*6);
		i = Math.floor( Math.random()*6);
		c = sq1_6[x][y];
		sq1_6[x][y] = sq1_6[i][j];
		sq1_6[i][j] = c;
	}
	for (x=0;x<6;x++)for (y=0;y<6;y++) {
		j = Math.floor( Math.random()*6);
		i = Math.floor( Math.random()*6);
		c = sq2_6[x][y];
		sq2_6[x][y] = sq2_6[i][j];
		sq2_6[i][j] = c;
	}
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	//max_score = current_hc_score = score = get_score(buf_len);	
    result = get_score(buf_len);
    max_score = current_hc_score = score = result[0]; // index 0 is score including crib, index 1 is pure tet_score;    
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha6.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*6);
		n2 = Math.floor(Math.random()*6);
		n3 = Math.floor(Math.random()*6);
		n4 = Math.floor(Math.random()*6);
		sq_choice = Math.floor( Math.random()*100);
		if (sq_choice<50){
            /* simple sq1 pair swap */
           	c1 = sq1_6[n1][n2];
           	c2 = sq1_6[n3][n4];
           	sq1_6[n1][n2] = c2;
           	sq1_6[n3][n4] = c1;
       	}
		else{
            /* simple sq2 pair swap */
           	c1 = sq2_6[n1][n2];
           	c2 = sq2_6[n3][n4];
           	sq2_6[n1][n2] = c2;
           	sq2_6[n3][n4] = c1;
       	}
		//score = get_score(buf_len);
        result = get_score(buf_len);
        score = result[0]; // index 0 is score including crib, index 1 is pure tet_score;
        
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha6.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			if(s4Flag) out_str += '\nS4 Keys: ';
			else out_str += '\nS2 Keys: ';
			for (i=0;i<6;i++) for(j=0;j<6;j++)
				out_str += alpha6.charAt(sq1_6[i][j]);
			out_str += '     ';
			for (i=0;i<6;i++) for(j=0;j<6;j++)
				out_str += alpha6.charAt(sq2_6[i][j]);
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
			if (sq_choice<50){
                // restore sq1 pairs
                sq1_6[n1][n2] = c1;
                sq1_6[n3][n4] = c2;                	
            }
			else{
                // restore sq2 pairs
                sq2_6[n1][n2] = c1;
                sq2_6[n3][n4] = c2;                	
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
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
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
	var mut_count,s;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
	if (s[1] == '0') s4Flag=true;
	else s4Flag = false;
  	fudge_factor = parseFloat(s[2]);
  	n = parseInt(s[3]);
  	Math.random(n); // seed for hill-climbing
	if (s[4] == '0') key6_flag = false;
	else key6_flag = true;
    dec_limit = parseFloat(s[5]);
    inc_limit = parseFloat(s[6]);
    
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
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
