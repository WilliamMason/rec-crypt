// PH hill-climber 


var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key1=[];
var inverse_key1 = [];
var key2=[];
var inverse_key2 = [];

var k3_key_flag = false;


var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var max_key_len1= 10; // default
var max_key_len2 = 10;
var key_len1, key_len2;

var key_array1 = [];
var key_array2 = [];

var shifts = [];
var EMPTY = 26;
var single_shift_amount;

var logdi = new Array(
[4,7,8,7,4,6,7,5,7,3,6,8,7,9,3,7,3,9,8,9,6,7,6,5,7,4],
 [7,4,2,0,8,1,1,1,6,3,0,7,2,1,7,1,0,6,5,3,7,1,2,0,6,0],
 [8,2,5,2,7,3,2,8,7,2,7,6,2,1,8,2,2,6,4,7,6,1,3,0,4,0],
 [7,6,5,6,8,6,5,5,8,4,3,6,6,5,7,5,3,6,7,7,6,5,6,0,6,2],
 [9,7,8,8,8,7,6,6,7,4,5,8,7,9,7,7,5,9,9,8,5,7,7,6,7,3],
 [7,4,5,3,7,6,4,4,7,2,2,6,5,3,8,4,0,7,5,7,6,2,4,0,5,0],
 [7,5,5,4,7,5,5,7,7,3,2,6,5,5,7,5,2,7,6,6,6,3,5,0,5,1],
 [8,5,4,4,9,4,3,4,8,3,1,5,5,4,8,4,2,6,5,7,6,2,5,0,5,0],
 [7,5,8,7,7,7,7,4,4,2,5,8,7,9,7,6,4,7,8,8,4,7,3,5,0,5],
 [5,0,0,0,4,0,0,0,3,0,0,0,0,0,5,0,0,0,0,0,6,0,0,0,0,0],
 [5,4,3,2,7,4,2,4,6,2,2,4,3,6,5,3,1,3,6,5,3,0,4,0,5,0],
 [8,5,5,7,8,5,4,4,8,2,5,8,5,4,8,5,2,4,6,6,6,5,5,0,7,1],
 [8,6,4,3,8,4,2,4,7,1,0,4,6,4,7,6,1,3,6,5,6,1,4,0,6,0],
 [8,6,7,8,8,6,9,6,8,4,6,6,5,6,8,5,3,5,8,9,6,5,6,3,6,2],
 [6,6,7,7,6,8,6,6,6,3,6,7,8,9,7,7,3,9,7,8,9,6,8,4,5,3],
 [7,3,3,3,7,3,2,6,7,2,1,7,3,2,7,6,0,7,6,6,6,0,3,0,4,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0],
 [8,6,6,7,9,6,6,5,8,3,6,6,6,6,8,6,3,6,8,8,6,5,6,0,7,1],
 [8,6,7,6,8,6,5,7,8,4,6,6,6,6,8,7,4,5,8,9,7,4,7,0,6,2],
 [8,6,6,5,8,6,5,9,8,3,3,6,6,5,9,6,2,7,8,8,7,4,7,0,7,2],
 [6,6,7,6,6,4,6,4,6,2,3,7,7,8,5,6,0,8,8,8,3,3,4,3,4,3],
 [6,1,0,0,8,0,0,0,7,0,0,0,0,0,5,0,0,0,1,0,2,1,0,0,3,0],
 [7,3,3,4,7,3,2,8,7,2,2,4,4,6,7,3,0,5,5,5,2,1,4,0,3,1],
 [4,1,4,2,4,2,0,3,5,1,0,1,1,0,3,5,0,1,2,5,2,0,2,2,3,0],
 [6,6,6,6,6,6,5,5,6,3,3,5,6,5,8,6,3,5,7,6,4,3,6,2,4,2],
 [4,0,0,0,5,0,0,0,3,0,0,2,0,0,3,0,0,0,1,0,2,0,0,0,4,4]);


max_trials = 1000000;


function get_score(){
	var score,i,n,j,k,le;
    var c1,c2,c3,c4;
	var score, max_shift;
    var number_shifts;
    var ldi_score1,ldi_score2;;

    key_array1 = [];
    for (i=0;i<key_len1;i++)
        key_array1[i] = key1[i];
    index = key_len1;
    for (i=0;i<26;i++){
        j = key_array1.indexOf(i);
        if (j == -1)
            key_array1[index++] = i;
    }
    for (j=0;j<26;j++)
        inverse_key1[key_array1[j]] = j;
    key_array2 = [];
    for (i=0;i<key_len2;i++)
        key_array2[i] = key2[i];
    index = key_len2;
    for (i=0;i<26;i++){
        j = key_array2.indexOf(i);
        if (j == -1)
            key_array2[index++] = i;
    }
    for (j=0;j<26;j++)
        inverse_key2[key_array2[j]] = j;
	// score by finding shift required for each non-dashed letter of the encrypting alphabet
	// if there is the same shift for each one, that's good! otherwise score by number of shifts
    for (j=0;j<26;j++) shifts[j] = 0;
	for (j=0;j<26;j++){
		if (buffer[j] == EMPTY) continue; // no corresponding cipher letter
		c1 = inverse_key1[j]; 
		c2 = inverse_key2[buffer[j]]; 
		shifts[ (26+c1-c2)%26 ]++;
	}
	// how many different shifts did we get
	number_shifts = 0;
    max_shift = 0;
	for (j=0;j<26;j++)
		if ( shifts[j]>0) {
			number_shifts++;
            if ( shifts[j]>max_shift){
                max_shift = shifts[j];
                single_shift_amount = j; // maybe there's only one!
            }
    }
    ldi_score1 = 0.0;
    for (i=0;i<key_len1-1;i++)
        ldi_score1 += logdi[key1[i]][key1[i+1]];
    ldi_score2 = 0.0;
    for (i=0;i<key_len2-1;i++)
        ldi_score2 += logdi[key2[i]][key2[i+1]];
        
    ld1_score1 = 100*ldi_score1/(key_len1-1);
    ld1_score2 = 100*ldi_score2/(key_len2-1);
    return( [max_shift,(ld1_score1+ldi_score2)/2]);
    //return(max_shift);
}	

function get_k3_score(){
	var score,i,n,j,k,le;
    var c1,c2,c3,c4;
	var score, max_run_score, max_pos;
    var run_score, key_start, key_len;
    var ldi_score;

    var di_weight = 5/100;
    // get max ascending run
    max_run_score = 0;
    max_pos = 0;
    for(i=0;i<26;i++){
        c1 = key1[i];
        if ( c1 == EMPTY) continue;
        run_score = 0;
        for (j=i+1;j<26+i;j++){
            c2 = key1[ j%26 ] ;
            if ( c2< c1) break;
            if ( c2 == EMPTY )
                run_score++;
            else {
                run_score++;
                c1 = c2;
            }
        }
        if (run_score > max_run_score){
            max_run_score = run_score;
            max_pos = i;
        }
    }
    key_start = (max_pos+max_run_score)%26;
    key_len = 26-max_run_score;
    ldi_score = 0.0;
    for (i=key_start;i<key_start+key_len-1;i++)
        ldi_score += logdi[key1[i%26]][key1[(i+1)%26]];
    ldi_score = 100*ldi_score/(key_len-1);    
    score = max_run_score + di_weight * ldi_score;
    return(score);
}

function do_k3_climbing(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4,v3,v4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var h_choice, old_key_len,used_let;
    var missing_lets = '';
    var result,ldi_score, max_ldi_score;

    debugger;
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    // check that it's shift of 13  
    for (i=0;i<26;i++){
        n1 = buffer[i];
        if ( n1 == EMPTY) continue;
        n2 = buffer[n1];
        if ( n2 == EMPTY){ // empty, fill it in 
            n2 = i;
            continue;
        }
        if ( n2 != i){
            postMessage('K3 key not shifted by 13');  
            return;
        }
    }
    for (i=0;i<26;i++)
        if (buffer.indexOf(i) == -1)
            missing_lets += alpha.charAt(i)+' ';
    // set up key so the last 13 letters are the shifts of the first 13.
    used_let = [];
    for (i=0;i<26;i++)
        used_let[i] = 0;
    key1 = [];
    key_len1 = 0;
    for (i=0;i<26;i++){
        if ( used_let[i] == 1 || buffer[i] == EMPTY) continue;
        key1[key_len1] = i;
        used_let[i] = 1;
        key1[ key_len1+13 ] = buffer[i];
        used_let[ buffer[i] ]= 1;
        key_len1++;
    }
    out_str = '';
    if (key_len1<12){
        out_str += 'Too many missing letters: '+missing_lets;
        postMessage(out_str);
        return;
    }
    else if (key_len1 == 12){//exactly 2 missing letters, one must go to the other
        n1 = 26;
        for (i=0;i<26;i++){
            if ( used_let[i] == 0)
                if ( n1==26)
                    n1 = i;
                else {
                    n2 = i;
                    break;
                }
        }
        key1[key_len1] = n1;
        key1[key_len1+13] = n2;
        key_len1++;
    }
    /* test output
    for (i=0;i<26;i++)
        out_str += alpha.charAt(key1[i]);
    out_str += '\n';
	postMessage(out_str);
    */
    // randomize inital key order
    for (i=12;i>0;i--){
        n1 = Math.floor(Math.random()*i)
        v1 = key1[i];
        key1[i] = key1[n1];
        key1[n1] = v1;
        v1 = key1[i+13];
        key1[i+13] = key1[n1+13];
        key1[n1+13] = v1;
    }
	cycle_limit = 10;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_k3_score();
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<26;i++)
		out_str += alpha.charAt(key1[i]).toLowerCase();
	out_str += "\n initial score is "+x;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);

	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        n = Math.floor(Math.random()*100);
        // operator frequencies
        if (n < 50)
            h_choice = 0;
        else if (n<80)
            h_choice = 1;
        else if ( n < 90)
            h_choice = 2;
        else
            h_choice = 3;
        if ( h_choice ==0) { // swap left side and right side pair
            n1 = Math.floor(Math.random()*13);
            v1 = key1[n1];
            n2 = n1+13;
            v2 = key1[n2];
            key1[n1] = v2;
            key1[n2] = v1;
        }
        else if ( h_choice ==1) { // swap left side pair and corresponding right side pair
            n1 = Math.floor(Math.random()*13);
            v1 = key1[n1];
            v3 = key1[n1+13];
            n2 = Math.floor(Math.random()*13);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*13);
            v2 = key1[n2];
            v4 = key1[n2+13];
            key1[n1] = v2;
            key1[n2] = v1;
            key1[n1+13] = v4;
            key1[n2+13] = v3;
        }
        else if ( h_choice ==2) { // rotate left
            n1 = Math.floor(Math.random()*13);
            v1 = key1[n1];
            v3 = key1[n1+13];
            n2 = Math.floor(Math.random()*13);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*13);
            v2 = key1[n2];
            v4 = key1[n2+13];
            if (n2 <  n1) {
                for (j= n2;j<n1;j++){
                    key1[j] = key1[j+1];
                    key1[j+13] = key1[j+14];
                }
                key1[n1] = v2;
                key1[n1+13] = v4;
            }
            else {
                for (j= n1;j<n2;j++){
                    key1[j] = key1[j+1];
                    key1[j+13] = key1[j+14];
                }
                key1[n2] = v1;
                key1[n2+13] = v3;
            }
        }
        else if ( h_choice ==3) { // rotate right
            n1 = Math.floor(Math.random()*13);
            v1 = key1[n1];
            v3 = key1[n1+13];
            n2 = Math.floor(Math.random()*13);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*13);
            v2 = key1[n2];
            v4 = key1[n2+13];
            if (n2 <  n1) {
                for (j= n1;j>n2;j--){
                    key1[j] = key1[j-1];
                    key1[j+13] = key1[j+12];
                }
                key1[n2] = v1;
                key1[n2+13] = v3;
            }
            else {
                for (j= n2;j>n1;j--){
                    key1[j] = key1[j-1];
                    key1[j+13] = key1[j+12];
                }
                key1[n1] = v2;
                key1[n1+13] = v4;
            }
        }
            
        
        score = get_k3_score();
		if ( score>max_score ){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			//x = (score + (ldi_score/1000) ).toFixed(2);
            x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<26;i++)
				out_str += alpha.charAt(key1[i]).toLowerCase();
                
			out_str += "\nscore: "+x;
            out_str += "\ntrial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += '\n\n';            
            out_str += "Missing letters: "+missing_lets;
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
            //if ( score == perfect_score ) break;
		}
       	if (score > current_hc_score-fudge_factor*26/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
		}
		else {
            if ( h_choice ==0) {
                key1[n1] = v1;
                key1[n2] = v2;
            }
            else if ( h_choice ==1){
                key1[n1] = v1;
                key1[n2] = v2;
                key1[n1+13] = v3;
                key1[n2+13] = v4;
            }
            else if ( h_choice ==2){ // unrotate left
                if (n2 <= n1) {
                    for (j= n1;j>n2;j--){
                        key1[j] = key1[j-1];
                        key1[j+13] = key1[j+12];
                    }
                    key1[n2] = v2;
                    key1[n2+13] = v4;
                }
                else {
                    for (j= n2;j>n1;j--){
                        key1[j] = key1[j-1];
                        key1[j+13] = key1[j+12];
                    }
                    key1[n1] = v1;
                    key1[n1+13] = v3;
                }
            }
            else if ( h_choice ==3){ // unrotate rioght
                if (n2 <  n1) {
                    for (j= n2;j<n1;j++){
                        key1[j] = key1[j+1];
                        key1[j+13] = key1[j+14];
                    }
                    key1[n1] = v1;
                    key1[n1+13] = v3;
                }
                else {
                    for (j= n1;j<n2;j++){
                        key1[j] = key1[j+1];
                        key1[j+13] = key1[j+14];
                    }
                    key1[n2] = v2;
                    key1[n2+13] = v4;
                }
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
			postMessage(s);
		}
			
		
	} // next trial

    
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
    var h_choice, old_key_len, perfect_score;
    var missing_lets = '';
    var result,ldi_score, max_ldi_score;
  
    if ( k3_key_flag){
        do_k3_climbing(str);
        return;
    }
	str = str.toUpperCase();
	buf_len = 0;
    perfect_score = 26;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
            if ( n == EMPTY) 
                perfect_score--;
	}
    for (i=0;i<26;i++)
        if (buffer.indexOf(i) == -1)
            missing_lets += alpha.charAt(i)+' ';
	// random start;
    for (i=0;i<26;i++)
        key1[i] = i
    for (i=25;i>1 ; i--) {
        x = key1[i];
        j = Math.floor(Math.random()*i);
        key1[i] = key1[j];
        key1[j] = x;
    }
    key_len1 = Math.floor(Math.random()*(max_key_len1-3))+3; // minimum key length is 3
    for (i=0;i<26;i++)
        key2[i] = i
    for (i=25;i>1 ; i--) {
        x = key2[i];
        j = Math.floor(Math.random()*i);
        key2[i] = key2[j];
        key2[j] = x;
    }
    key_len2 = Math.floor(Math.random()*(max_key_len2-3))+3; // minimum key length is 3
        
	cycle_limit = 10;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
	noise_level = begin_level;
	cycle_numb = 0;
    result = get_score();
	max_score = current_hc_score = score = result[0];
    max_ldi_score	= result[1];
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<key_len1;i++)
		out_str += alpha.charAt(key1[i]).toLowerCase();
    out_str += "         ";
	for (i=0;i<key_len2;i++)
		out_str += alpha.charAt(key2[i]);
        
	out_str += "\n initial is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        n = Math.floor(Math.random()*100);
        // operator frequencies
        if (n < 20)
            h_choice = 0;
        else if (n<40)
            h_choice = 1;
        else if ( n < 60)
            h_choice = 2;
        else if ( n<80)
            h_choice = 3;
        else if (n<85) // rotates have lower frequencies
            h_choice = 4;
        else if ( n < 90)
            h_choice = 5;
        else if (n< 95)
            h_choice = 6;
        else
            h_choice = 7;

        if ( h_choice ==0) {
            n1 = Math.floor(Math.random()*26);
            v1 = key1[n1];
            n2 = Math.floor(Math.random()*key_len1);
            v2 = key1[n2];
            key1[n1] = v2;
            key1[n2] = v1;
        }
        else if (h_choice==1){
            old_key_len = key_len1;
            if (Math.floor(Math.random()*100) < 50) {	                        
                if (key_len1 < max_key_len1)
                    key_len1++;
                else
                    key_len1--;
                }
            else {
                if (key_len1>3)
                    key_len1--;
                else
                    key_len1++;
                }
        }    
        else if ( h_choice ==2) {
            n1 = Math.floor(Math.random()*26);
            v1 = key2[n1];
            n2 = Math.floor(Math.random()*key_len2);
            v2 = key2[n2];
            key2[n1] = v2;
            key2[n2] = v1;
        }
        else if ( h_choice ==3) {
            old_key_len = key_len2;
            if (Math.floor(Math.random()*100) < 50) {	                        
                if (key_len2 < max_key_len2)
                    key_len2++;
                else
                    key_len2--;
                }
            else {
                if (key_len2>3)
                    key_len2--;
                else
                    key_len2++;
                }
        }    
        
        else if ( h_choice ==4) { // rotate left
            n1 = Math.floor(Math.random()*26);
            v1 = key1[n1];
            n2 = Math.floor(Math.random()*key_len1);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*key_len1);
            v2 = key1[n2];
            if (n2 <  n1) {
                for (j= n2;j<n1;j++)
                    key1[j] = key1[j+1];
                key1[n1] = v2;
            }
            else {
                for (j= n1;j<n2;j++)
                    key1[j] = key1[j+1];
                key1[n2] = v1;
            }
        }
        else if ( h_choice ==5) { // rotate left
            n1 = Math.floor(Math.random()*26);
            v1 = key2[n1];
            n2 = Math.floor(Math.random()*key_len2);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*key_len2);
            v2 = key2[n2];
            if (n2 <  n1) {
                for (j= n2;j<n1;j++)
                    key2[j] = key2[j+1];
                key2[n1] = v2;
            }
            else {
                for (j= n1;j<n2;j++)
                    key2[j] = key2[j+1];
                key2[n2] = v1;
            }
        }
        else if ( h_choice ==6) { // rotate right
            n1 = Math.floor(Math.random()*26);
            v1 = key1[n1];
            n2 = Math.floor(Math.random()*key_len1);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*key_len1);
            v2 = key1[n2];
            if (n2 <  n1) {
                for (j= n1;j>n2;j--)
                    key1[j] = key1[j-1];
                key1[n2] = v1;
            }
            else {
                for (j= n2;j>n1;j--)
                    key1[j] = key1[j-1];
                key1[n1] = v2;
            }
        }
        else if ( h_choice ==7) { // rotate right
            n1 = Math.floor(Math.random()*26);
            v1 = key2[n1];
            n2 = Math.floor(Math.random()*key_len2);
            while (n2 == n1)
                n2 = Math.floor(Math.random()*key_len2);
            v2 = key2[n2];
            if (n2 <  n1) {
                for (j= n1;j>n2;j--)
                    key2[j] = key2[j-1];
                key2[n2] = v1;
            }
            else {
                for (j= n2;j>n1;j--)
                    key2[j] = key2[j-1];
                key2[n1] = v2;
            }
        }
        
        result = get_score();
		//score = get_score();
        score = result[0];
        ldi_score = result[1];
		if ( score>max_score || (score == max_score && ldi_score > max_ldi_score) ){
			max_score = score;
            max_ldi_score = ldi_score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = (score + (ldi_score/1000) ).toFixed(2);
			out_str += x+'~';
			for (i=0;i<key_len1;i++)
				out_str += alpha.charAt(key1[i]).toLowerCase();
            out_str += "         ";
			for (i=0;i<key_len2;i++)
				out_str += alpha.charAt(key2[i]);
                
			out_str += "\nscore: "+score+" out of "+perfect_score + ". log di score: "+Math.floor(ldi_score);
            out_str += "\ntrial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += '\nPlain Key length: '+key_len1+' Code Key length: '+key_len2;
			out_str += '\nKey Array:\n';
			for (i=0;i<26;i++) {
				out_str += alpha.charAt(key_array1[i]).toLowerCase();
            }
            out_str += '\n';
			for (i=0;i<26;i++) {
                j = key_array2[(26+i-single_shift_amount)%26]
                if ( buffer.indexOf(j) == -1)
                    out_str += '-';
                else
                    out_str += alpha.charAt(j);
            }
            out_str += '\n\n';            
            out_str += "Missing letters: "+missing_lets;
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
            //if ( score == perfect_score ) break;
		}
       	if (score > current_hc_score-fudge_factor*26/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
            if ( h_choice ==0) {
                key1[n1] = v1;
                key1[n2] = v2;
            }
            else if ( h_choice ==1)
                key_len1 = old_key_len;
            else if ( h_choice ==2) {
                key2[n1] = v1;
                key2[n2] = v2;
            }
            else if ( h_choice ==3)
                key_len2 = old_key_len;
            
            else if ( h_choice ==4) { // unrotate left
                if (n2 <= n1) {
                    for (j= n1;j>n2;j--)
                        key1[j] = key1[j-1];
                    key1[n2] = v2;
                }
                else {
                    for (j= n2;j>n1;j--)
                        key1[j] = key1[j-1];
                    key1[n1] = v1;
                }
            }
            else if ( h_choice ==5) { // unrotate left
                if (n2 <= n1) {
                    for (j= n1;j>n2;j--)
                        key2[j] = key2[j-1];
                    key2[n2] = v2;
                }
                else {
                    for (j= n2;j>n1;j--)
                        key2[j] = key2[j-1];
                    key2[n1] = v1;
                }
            }
            else if ( h_choice ==6) { // unrotate right
                if (n2 <  n1) {
                    for (j= n2;j<n1;j++)
                        key1[j] = key1[j+1];
                    key1[n1] = v1;
                }
                else {
                    for (j= n1;j<n2;j++)
                        key1[j] = key1[j+1];
                    key1[n2] = v2;
                }
            }    
            else if ( h_choice ==7) { // unrotate right
                if (n2 <  n1) {
                    for (j= n2;j<n1;j++)
                        key2[j] = key2[j+1];
                    key2[n1] = v1;
                }
                else {
                    for (j= n1;j<n2;j++)
                        key2[j] = key2[j+1];
                    key2[n2] = v2;
                }
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
	max_key_len1 = parseInt(s[3]);
	max_key_len2 = parseInt(s[4]);   
    if (s[5] == '1')
        k3_key_flag = true;
    else
        k3_key_flag = false;
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
