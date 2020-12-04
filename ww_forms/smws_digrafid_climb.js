// PH hill-climber with log tetragraph scoring, smws algorithm
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

var h_key_array = [];
var v_key_array = [];
var h_key_buffer = [];
var v_key_buffer = [];
var best_h_key = [];
var best_v_key = [];

var used_let = [];
var max_trials;
var max_h_len;
var max_v_len;

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


function get_next_h_key(le){
	var i,j,k,index;
	
	for (i=0;i<27;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[h_key_buffer[i]] == 0){
			h_key_array[index++] = h_key_buffer[i];
			used_let[h_key_buffer[i]] = 1;
	}
	for (i=0;i<27;i++)
		if ( used_let[i] == 0)
			h_key_array[index++] = i;
}		

function get_next_v_key(le){
	var i,j,k,index;
	
	for (i=0;i<27;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[v_key_buffer[i]] == 0){
			v_key_array[index++] = v_key_buffer[i];
			used_let[v_key_buffer[i]] = 1;
	}
	for (i=0;i<27;i++)
		if ( used_let[i] == 0)
            v_key_array[index++] = i;
}		


function random_h_key(){
    var i,j,n,c;
        
    for (i=0;i<27;i++)
        h_key_buffer[i] = i;
    for (i=26;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = h_key_buffer[i];
        h_key_buffer[i] = h_key_buffer[j];
        h_key_buffer[j]= n;
    }
}

function random_v_key(){
    var i,j,n,c;
        
    for (i=0;i<27;i++)
        v_key_buffer[i] = i;
    for (i=26;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = v_key_buffer[i];
        v_key_buffer[i] = v_key_buffer[j];
        v_key_buffer[j]= n;
    }
}
    
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


function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,best_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var s;
    var code_len, plain_len;
    var best_code_len, best_plain_len;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;
    var rpt,y,z,key_carry
    
    //debugger;
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
    local_best_score = best_score = -1000;
    if (max_h_len <9 && max_v_len < 9){
        key_carry = 25;
        max_trials = 500;
    }
    else {
        max_key_len = max_h_len;
        if ( max_v_len > max_key_len)
            max_key_len = max_v_len;
        key_carry = 60*(max_key_len-8);
        max_trials = key_carry*max_key_len;
    }
   

  for(var sht = 0;sht< max_trials;sht++) {
    if ( (sht%key_carry) == 0){
        random_h_key();
        random_v_key();
        get_next_h_key(max_h_len);
        get_next_v_key(max_v_len);
    }
    else {
        random_v_key();
        get_next_v_key(max_v_len);    
    }
    local_best_score = -100;

	for (rpt = 0;rpt<16;rpt++){  
        change_flag = false;
        for (i=0;i<27;i++)
            h_key[i] = h_key_array[i];
        for (z=0;z<= max_v_len;z++) for (y=0;y<27;y++){
            for (i=0;i<27;i++)
                v_key[i] = v_key_array[i];
            c = v_key[z];
            v_key[z] = v_key[y];
            v_key[y] = c;
            for (i=0;i<27;i++)
                used_let[i] = 0;
            for (i=0;i<max_v_len;i++) used_let[v_key[i]] = 1;
            index = max_v_len;
            for (i=0;i<27;i++)
                if ( used_let[i] == 0)
                    v_key[index++] = i;
            score = get_score(buf_len);   
            if (score > local_best_score){
                local_best_score = score;
                change_flag = true;
                for (i=0;i<27;i++)
                    v_key_array[i] = v_key[i];
            }
			if ( score > best_score){
						best_score = score;
                        for(i=0;i<27;i++) {
                            best_v_key[i] = v_key[i];
                            best_h_key[i] = h_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += ', on trial '+sht;
						out_str += '\nHorizontal key: ';
                            for (i=0;i<max_h_len;i++)
                                out_str +=alpha.charAt(best_h_key[i]);
						out_str += ', Vertical key: ';
                            for (i=0;i<max_v_len;i++)
                                out_str +=alpha.charAt(best_v_key[i]);
						postMessage(out_str);
						
			}
            
        } // next y,z
        for (i=0;i<27;i++)
            v_key[i] = v_key_array[i];
        for (z=0;z<= max_h_len;z++) for (y=0;y<27;y++){
            for (i=0;i<27;i++)
                h_key[i] = h_key_array[i];
            c = h_key[z];
            h_key[z] = h_key[y];
            h_key[y] = c;
            for (i=0;i<27;i++)
                used_let[i] = 0;
            for (i=0;i<max_h_len;i++) used_let[h_key[i]] = 1;
            index = max_h_len;
            for (i=0;i<27;i++)
                if ( used_let[i] == 0)
                    h_key[index++] = i;
            score = get_score(buf_len);   
            if (score > local_best_score){
                local_best_score = score;
                change_flag = true;
                for (i=0;i<27;i++)
                    h_key_array[i] = h_key[i];
            }
			if ( score > best_score){
						best_score = score;
                        for(i=0;i<27;i++) {
                            best_v_key[i] = v_key[i];
                            best_h_key[i] = h_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += ', on trial '+sht;
						out_str += '\nHorizontal key: ';
                            for (i=0;i<max_h_len;i++)
                                out_str +=alpha.charAt(best_h_key[i]);
						out_str += ', Vertical key: ';
                            for (i=0;i<max_v_len;i++)
                                out_str +=alpha.charAt(best_v_key[i]);
						postMessage(out_str);
						
			}
            
        } // next y,z
        if (!change_flag) break;
	} // rpt           
    if ( (sht%500) == 0){
        s = out_str + "\nTrial "+sht+" out of "+max_trials;
        postMessage(s);	
     }

	} // next sht            
} // end main


onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));// dummy, always 1
  	//fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[1]);
  	Math.random(n); // seed for hill-climbing
	period = parseInt(s[2]);
    max_h_len = parseInt( s[3] );
    max_v_len = parseInt( s[4] );
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
		do_key_search(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
