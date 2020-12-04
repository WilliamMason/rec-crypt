// PH hill-climber with log tetragraph scoring, based on dgfkw.c
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ#"; // digrafid inclides # symbol
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_array=[];
var next_key = [];
var h_key = [];
var v_key = [];
var hkey_word = [];
var vkey_word = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default
var max_key_len = 10; // default
var vkey_len,hkey_len;

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

	
function get_next_hkey(n) { /* n is  key_size*/
    var index,j,k,i;

    for (i=0;i<27;i++)
        next_key[i] = 0;
    index = 0;
    for (j=0;j<n;j++) {
        k = hkey_word[j];
        if ( next_key[k] ==0 ) { /* this letter hasn't occurred yet */
            h_key[index++] = k;
            next_key[k] = 1;
        }
    } /* next j */
    /* key filled in, now put in remaining letters in alphabetical order*/
    for (j=0;j<27;j++)
        if ( next_key[j] ==0) /* not filled in yet */
            h_key[index++] = j;
} /* end get_next_hkey */
    
function get_next_vkey(n) { /* n is  key_size*/
    var index,j,k,i;

    for (i=0;i<27;i++)
        next_key[i] = 0;
    index = 0;
    for (j=0;j<n;j++) {
        k = vkey_word[j];
        if ( next_key[k] ==0 ) { /* this letter hasn't occurred yet */
            v_key[index++] = k;
            next_key[k] = 1;
        }
    } /* next j */
    /* key filled in, now put in remaining letters in alphabetical order*/
    for (j=0;j<27;j++)
        if ( next_key[j] ==0) /* not filled in yet */
            v_key[index++] = j;
} /* end get_next_hkey */
    
function pair_to_numb(c1,c2) {
    var row,col,j;
    var h,v,m;
    
    j = h_key.indexOf(c1);
    row = Math.floor(j/9);
    h = j % 9;
    j = v_key.indexOf(c2);
    col = Math.floor(j/9);
    v = j % 9;
    m =  col + 3 * row;
    return( [h,m,v] ); 
} /* end pair_to_numb */
    
function numb_to_pair(h,m,v){
    var row,col,j;

    row = Math.floor(m/3);
    col = m % 3;
    return( [ h_key[h+9*row], v_key[ v+9*col] ] );
} /* end numb_to_pair */
    
    
    
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4, result;

    get_next_hkey(hkey_len);
    get_next_vkey(vkey_len);
        
    index =  y = 0;
    for (x=0;x<buf_len;x= x+2) {
        result = pair_to_numb( buffer[x],buffer[x+1]);
        c1 = result[0];
        c2 = result[1];
        c3 = result[2];
        work_array[index++] = c1;
        work_array[index++] = c2;
        work_array[index++] = c3;
        if ( index == 3*period) { /* array is filled */
            for (k=0;k<Math.floor(index/3);k++) {
                result=numb_to_pair(work_array[k],work_array[k+period],
                                                work_array[k+2*period]);
                c1 = result[0];
                c2 = result[1];
                plain_text[y++]= c1;
                plain_text[y++]= c2;
            }
            index = 0;
        } /* end if */
    } /* next x */
    if (index !=0 ) { /* finish partially filled work_array */
        x = Math.floor(index/3);
        for (k=0;k<x;k++) {
            result=numb_to_pair(work_array[k],work_array[k+x],
                             work_array[k+2*x]);
            c1 = result[0];
            c2 = result[1];
            plain_text[y++]= c1;
            plain_text[y++]= c2;
        }
    }
}
	

function get_score(buf_len){
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
    score *= 100; // deduct a lot for # symbols in plaintext
	for (i=0;i<buf_len-3;i++){
		if ( plain_text[i]==26 || plain_text[i+1] == 26 ||
			plain_text[i+2]==26 || plain_text[i+3]==26)
				continue;
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
	var s,op_choice, old_key_len;
  
	str = str.toUpperCase();
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
	for (i=0;i<27;i++) {
		hkey_word[i] = vkey_word[i] = i;
	}
	// random start;
	for (i=26;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = hkey_word[j];
		hkey_word[j]=hkey_word[i];
		hkey_word[i] = c;
	}
	for (i=26;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = vkey_word[j];
		vkey_word[j]=vkey_word[i];
		vkey_word[i] = c;
	}
    hkey_len = Math.floor(Math.random()*(max_key_len-3))+3;
    vkey_len = Math.floor(Math.random()*(max_key_len-3))+3;

    
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
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        op_choice = Math.floor(Math.random()*4);
        if ( op_choice == 0 ){
            n1 = Math.floor(Math.random()*27);
            n2 = Math.floor(Math.random()*27);
            v1 = hkey_word[n1];
            v2 = hkey_word[n2];
            hkey_word[n1]=v2;
            hkey_word[n2]=v1;
        }
        else if ( op_choice == 1) {
            n1 = Math.floor(Math.random()*27);
            n2 = Math.floor(Math.random()*27);
            v1 = vkey_word[n1];
            v2 = vkey_word[n2];
            vkey_word[n1]=v2;
            vkey_word[n2]=v1;
        }
        else if ( op_choice == 2) {   
            old_key_len = hkey_len;
            if (Math.floor(Math.random()*100 < 50) ){
                if (hkey_len < max_key_len)
                    hkey_len++;
                else
                    hkey_len--;
            }
            else {
                if (hkey_len>3)
                    hkey_len--;
                else
                    hkey_len++;
            }
        }
        else if ( op_choice == 3) {   
            old_key_len = vkey_len;
            if (Math.floor(Math.random()*100 < 50) ) {
                if (vkey_len < max_key_len)
                    vkey_len++;
                else
                    vkey_len--;
            }
            else {
                if (vkey_len>3)
                    vkey_len--;
                else
                    vkey_len++;
            }
        }
        
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nHorizontal Key: ';
			for (i=0;i<27;i++) 
				out_str += alpha.charAt(h_key[i]);
			out_str += '\nVertical Key: ';
			for (i=0;i<27;i++) 
				out_str += alpha.charAt(v_key[i]);
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
            if ( op_choice == 0 ){        
                hkey_word[n1]=v1;
                hkey_word[n2]=v2;
            }
            else if ( op_choice == 1 ){        
                vkey_word[n1]=v1;
                vkey_word[n2]=v2;
            }
            else if ( op_choice == 2 ){        
                hkey_len = old_key_len
            }
            else if ( op_choice == 3 ){        
                vkey_len = old_key_len
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
	period = parseInt(s[3]);
    max_key_len = parseInt( s[4] );
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
