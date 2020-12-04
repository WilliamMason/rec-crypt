// Converging key search worker

importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var l_alpha = "abcdefghijklmnopqrstuvwxyz";	
var buffer = new Array();
var plain_text = new Array();
var key = [];
var work_key = [];
var key_array = [];
var inverse_key = [];
var work_array=[];
var used_let = [];
var max_trials;

var crib_string;
var indicator_values = [];
var crib_buffer = [];
var numb_indicator_values = [];

var code_key = [];
var plain_key = [];
var code_key_array = [];
var plain_key_array = [];

var best_code_key = [];
var best_plain_key = [];

var buf_len;

var period;
var max_code_len,max_plain_len;


var lc = [];
var lb = [];

//var word_list,word_count;

var code_key_buffer = [];
var plain_key_buffer = [];

var crib_score_flag = false;

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    //debugger;
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
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
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

function setup_shift_values(){ // get a plaintext letter and its corresponding ciphertext letter for each shift;
    var i,j,n,c;
    
    for (i=0;i<period;i++) {
        numb_indicator_values[i] = 0;
        indicator_values[i] = [];
    }
    n = 0;
    for (i=0;i<crib_buffer.length;i++){
        if ( crib_buffer[i] != 26)
            indicator_values[n][numb_indicator_values[n]++] = [ crib_buffer[i],buffer[i] ];
        n++;
        if ( n == period)
            n = 0;
    }            
    // are there shift elements for each alphabet?
    for (i=0;i<period;i++)
        if ( numb_indicator_values[i] == 0)
            return(false); // can't proceed
            
    return(true);
}

    
    
    
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4, result;
        var n1,n2,n3;
	var shift = [];
    for (index=0;index<period;index++){
        n2 = code_key.indexOf( lc[index] );
        n3 = plain_key.indexOf(  lb[index] );
        shift[index] = n3-n2;
     }
    index = 0;
    for (x=0;x<buf_len;x++) {
        c1 = buffer[x];
        n1 = code_key.indexOf(c1);
        // n2 = code_key.indexOf( lc[index] );
        // n3 = plain_key.indexOf(  lb[index] );
        // plain_text[x] = plain_key[ (26+n1 +n3-n2) %26 ];
        plain_text[x] = plain_key[ (26+n1 +shift[index]) %26 ];
        index++;
        if ( index == period) index = 0;
    } /* next x */
}

	

function get_score(buf_len){
	var score,i,n;

    get_trial_decrypt();
    // probably don't need to add scores for crib matching. In fact may be better without it, fewer bad local maximums
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
    if ( crib_score_flag ) {
        for (i=0;i<buf_len;i++)
            if ( plain_text[i] == crib_buffer[i] ) score += 100;
    }
	return(score);
}	

function get_next_code_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[code_key_buffer[i]] == 0){
			code_key_array[index++] = code_key_buffer[i];
			used_let[code_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			code_key_array[index++] = i;
}		

function get_next_plain_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[plain_key_buffer[i]] == 0){
			plain_key_array[index++] = plain_key_buffer[i];
			used_let[plain_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			plain_key_array[index++] = i;
}		


function random_code_key(){
    var i,j,n,c;
        
    for (i=0;i<26;i++)
        code_key_buffer[i] = i;
    for (i=25;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = code_key_buffer[i];
        code_key_buffer[i] = code_key_buffer[j];
        code_key_buffer[j]= n;
    }
}

function random_plain_key(){
    var i,j,n,c;
        
    for (i=0;i<26;i++)
        plain_key_buffer[i] = i;
    for (i=25;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = plain_key_buffer[i];
        plain_key_buffer[i] = plain_key_buffer[j];
        plain_key_buffer[j]= n;
    }
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
    var rpt,y,z;
    
    
    //debugger;

	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    j = 0;
    for (i=0;i<crib_string.length;i++) {
        c = crib_string.charAt(i);
        n = l_alpha.indexOf(c);
        if ( n>= 0)
            crib_buffer[j++] = n;
        else if ( c == '-')
            crib_buffer[j++] = 26;
    }
    
    // put in double check for crib_buffer and buffer having same length. Should never be triggered.
    if ( buffer.length != crib_buffer.length){
        out_str = 'Crib and ciphertext have different lengths!';
        postMessage(out_str);
        return;
    }    
    if ( !setup_shift_values() ) {
        out_str = 'Not enough crib letters to set up shift values!';
        postMessage(out_str);
        return;
    }

    local_best_score = best_score = -1000;
    max_trials = 2000*(max_code_len+max_plain_len);
  for(var sht = 0;sht< max_trials;sht++) {
    if ( (sht%25) == 0){
        random_code_key();
        random_plain_key();
        get_next_code_key(max_code_len);
        get_next_plain_key(max_plain_len);
    }
    local_best_score = -100;
    // moved shift calcs out of inner loop. Seems to give better results.
    for (i=0;i<period;i++) {
        n = Math.floor(Math.random()*numb_indicator_values[i])
        lc[i] = indicator_values[i][n][1];
        lb[i] = indicator_values[i][n][0];
    }

	for (rpt = 0;rpt<16;rpt++){  
        change_flag = false;
        // for (i=0;i<period;i++) {
            // n = Math.floor(Math.random()*numb_indicator_values[i])
            // lc[i] = indicator_values[i][n][1];
            // lb[i] = indicator_values[i][n][0];
        // }
        for (i=0;i<26;i++)
            code_key[i] = code_key_array[i];
        for (z=0;z<= max_plain_len;z++) for (y=0;y<26;y++){
            for (i=0;i<26;i++)
                plain_key[i] = plain_key_array[i];
            c = plain_key[z];
            plain_key[z] = plain_key[y];
            plain_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            for (i=0;i<max_plain_len;i++) used_let[plain_key[i]] = 1;
            index = max_plain_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    plain_key[index++] = i;
            score = get_score(buf_len);   
            if (score > local_best_score){
                local_best_score = score;
                change_flag = true;
                for (i=0;i<26;i++)
                    plain_key_array[i] = plain_key[i];
            }
			if ( score > best_score){
						best_score = score;
                        for(i=0;i<26;i++) {
                            best_plain_key[i] = plain_key[i];
                            best_code_key[i] = code_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += ', on trial '+sht;
						out_str += '\nCode key: ';
                            for (i=0;i<max_code_len;i++)
                                out_str +=alpha.charAt(best_code_key[i]);
						out_str += ', Plain key: ';
                            for (i=0;i<max_plain_len;i++)
                                out_str +=alpha.charAt(best_plain_key[i]);
						postMessage(out_str);
						
			}
            
        } // next y,z
        for (i=0;i<26;i++)
            plain_key[i] = plain_key_array[i];
        for (z=0;z<= max_code_len;z++) for (y=0;y<26;y++){
            for (i=0;i<26;i++)
                code_key[i] = code_key_array[i];
            c = code_key[z];
            code_key[z] = code_key[y];
            code_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            for (i=0;i<max_code_len;i++) used_let[code_key[i]] = 1;
            index = max_code_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    code_key[index++] = i;
            score = get_score(buf_len);   
            if (score > local_best_score){
                local_best_score = score;
                change_flag = true;
                for (i=0;i<26;i++)
                    code_key_array[i] = code_key[i];
            }
			if ( score > best_score){
						best_score = score;
                        for(i=0;i<26;i++) {
                            best_plain_key[i] = plain_key[i];
                            best_code_key[i] = code_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += ', on trial '+sht;
						out_str += '\nCode key: ';
                            for (i=0;i<max_code_len;i++)
                                out_str +=alpha.charAt(best_code_key[i]);
						out_str += ', Plain key: ';
                            for (i=0;i<max_plain_len;i++)
                                out_str +=alpha.charAt(best_plain_key[i]);
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
	var mut_count,s;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
	period = parseInt(s[1]);
	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
	max_code_len = parseInt(s[3]);
	max_plain_len = parseInt(s[4]);    
	crib_string = s[5];
    if (s[6] == '1') crib_score_flag = true;
    else crib_score_flag = false;
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }  
  else {
		postMessage("1working...");
		do_key_search(str);
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
