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

var code_key = [];
var plain_key = [];

var best_code_key = [];
var best_plain_key = [];

var buf_len;

var period;


var word_list,word_count;

var numb_seeds;

function make_word_list(str) {
	var s,n;
    var state,i,c,index;
	
    s = "making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    state = 0; //no current word
    s = '';
    index = 0;
	word_list = [];
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( state == 0 && n >=0) {
			s = c;
			state = 1;
		}
		else if (state==1){
			if ( n >=0)
				s += c;
            else {
                word_list[index++] = s;
                state = 0;
            }				
		}
	}
    if (state == 1)
        word_list[index++] = s;
	word_count = word_list.length; // global variable
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
		
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
    
var get_scoring_procedure = function() { // closure starts 

// buffer is a global variable, has ciphertext converted to digits 0=a, 1= b, etc.

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
 
 function make_table(str) { // custom log di table
    var s,i,j;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var di_table = [];
//    var weighted_tet_sum, unweighted_tet_sum;    
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toLowerCase();
    l_alpha = 'abcdefghijklmnopqrstuvwxyz';
    // initialize tet table
    for (i=0;i<26*26;i++)
        di_table[i] = 0;
    // make di table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = l_alpha.indexOf(c);
        if ( n == -1) continue; //not a letter
        if (state == 0) {
            n1 = n;
            c1 = c;
            state = 1;
        }
        else {
            x = n1+26*n;
            di_table[x]++;
            n1 = n;
            c1 = c;
        }
        //state++;
    }    
    //s = '0there were '+max_n+' tetragraphs with greatest value of '+max_v;
    //s += ' for tet: '+mc1+mc2+mc3+mc4;
//    weighted_tet_sum = 0;
//    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26;i++){
//        n = di_table[i];
        di_table[i] = Math.log(1+di_table[i]);
        //di_table[i] = Math.sqrt( Math.sqrt(di_table[i]) );
//        weighted_tet_sum += n*di_table[i];
//        unweighted_tet_sum += di_table[i];                            
    }
    // convert to logdi table form.
    logdi = [];
    for (i=0;i<26;i++)
        logdi[i] = [];
    for (i=0;i<26;i++) for (j=0;j<26;j++)
        logdi[i][j] = di_table[i+26*j];
        
    
    // global variables for this tet table
//    random_score = 100*unweighted_tet_sum / (26*26*26*26);
//    std_eng_score = 100*weighted_tet_sum / max_n;
    
    //postMessage(s);    
}    


//var period;
//var buffer = [];
var key_word = [];
var inv_key = [];
var used_let = [];
//var key_array = [];
var key_len;
var left_shift = [];
var right_shift = [];
var quag_type;
var search_range;
var inv_code_key = [];
//var code_key = [];
//var plain_key = [];

 
function best_di(col){
/* return best log_di score for all possible digraph keys in column */

        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr;
        var buf_len;
        
        best_score = 0;
        buf_len = buffer.length
        rows = Math.floor(buf_len / period);
        for (kl = 0;kl<26;kl++) for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_code_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_code_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ plain_key[pl] ] [ plain_key[pr] ];
                        ct++;
                }/* next j */
                 
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end best_di */

function extend_di(col){
/* return best log_di score for all possible extensions of digraphs */
/* keys are the same as shifts */
        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr, buf_len;
        
        best_score = 0;
        buf_len = buffer.length        
        rows = Math.floor(buf_len / period);
        kl = right_shift[col-1];// use previous best right as new left
        for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_code_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_code_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ plain_key[pl] ] [plain_key[pr] ];
                        
                        ct++;
                }/* next j */
                
                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end extend_di */
 
function get_score(){
        var score;
        var sum, col;
		var i,j,c,n,s;
        
		for (i=0;i<26;i++)
			inv_code_key[ code_key[i] ] = i;
        sum = best_di(0);
        for (col = 1;col<period;col++)
            sum += extend_di(col);
        score = sum / period;
        return(score);
} /* end get_score */

function get_plaintext(){
    var k,j,buf_len;
    var s;
    l_alpha = 'abcdefghijklmnopqrstuvwxyz';
    
    buf_len = buffer.length;
    s = 'Plaintext\n';
    k = 0;
    for (j=0;j<buf_len;j++) {
        s += l_alpha.charAt(plain_key[ (inv_code_key[buffer[j]] +left_shift[k])%26 ]);
        k = (k+1)%period;
    }
    return(s);
}

function get_vertical_key_possibilities(){
    var k,j,buf_len,c,n,s;
    var s;
    l_alpha = 'abcdefghijklmnopqrstuvwxyz';

    s = "\n\nvertical key candidates\n";
    for (j=0;j<26;j++){
        s += l_alpha.charAt(j)+": ";
		n = plain_key.indexOf(j);
        for (k=0;k<period;k++)
            s += l_alpha.charAt( code_key[(n+26-left_shift[k])%26 ]);
        s += ', ';
    }
    return(s);
}
 
 function scoring_procedure(){ // uses globals: plain_key,code_key, period
	var score, pt;
	var i,j,c,n,s;
	score = get_score();
	pt = get_plaintext();
	s = get_vertical_key_possibilities();
	return([ score,pt,s ]); 
 }	 
 
return(scoring_procedure);
} // closure ends

    
    
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4, result;
        var n1,n2,n3;
		
    index =  y = 0;
    for (x=0;x<buf_len;x++) {
        c1 = buffer[x];
        n1 = code_key.indexOf(c1);
        n2 = code_key.indexOf( indicator_values[index][1] );
        n3 = plain_key.indexOf(  indicator_values[index][0] );
        plain_text[x] = plain_key[ (26+n1 +n3-n2) %26 ];
        index++;
        if ( index == period) index = 0;
    } /* next x */
}

	

function get_next_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[key[i]] == 0){
			key_array[index++] = key[i];
			used_let[key[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			key_array[index++] = i;
}			

function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,best_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	//var max_trials; // now global
	var s;
    var l_index,r_index;
    var code_index, plain_index;
    var best_code_index, best_plain_index;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;
	var scoring_procedure,result;
    
    debugger;
	last_seed_number = numb_seeds;
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	scoring_procedure = get_scoring_procedure();
	
    // select key at random
    code_index = Math.floor( Math.random() * word_count);
    plain_index = Math.floor( Math.random() * word_count);

	le = word_list[code_index].length;
	for (i=0;i<le;i++) {
		c = word_list[code_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}

	get_next_key(le);
    for (j=0;j<26;j++)
        best_code_key[j] = code_key[j] =key_array[ j ];  
		
    best_code_index = code_index;
    best_plain_index = -1;

    local_best_score = best_score = -1000;
    seed_number = 0;


	
	while(1) {
	for (trial = 0 ; trial<100;trial++){        
			// find the best right key and route for this left key and route;
			change_flag = 0;
			//printf("Searching left key list...\n");
			for (plain_index = 0;plain_index<word_count;plain_index++) {
					le = word_list[plain_index].length;
					/* switch to a=0,b=1,c=2, etc*/
					for (i=0;i<le;i++) {
						c = word_list[plain_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}

					get_next_key(le);//expand key to 26 chars in key_array
					for (j=0;j<26;j++)
						plain_key[j] = key_array[ j ];
					result = scoring_procedure();					
					score = result[0];;
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_plain_index = plain_index;

						for (i=0;i<26;i++)
							best_plain_key[i] = plain_key[i];
					}
					if ( score > best_score){
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						out_str += result[1];
						out_str += result[2];
						out_str += "\nscore: "+score.toFixed(2);
						out_str += '\nCode key: '+word_list[best_code_index];

						out_str += ', Plain key: '+ word_list[plain_index];

						out_str += ', seed: '+seed_number;
						postMessage(out_str);
						
					}
				} // next right index, next right route
	
				if ( change_flag == 0){
					//printf("\nLeft key square unchanged on trial %i! Done.\n", trial);
					//exit(0);
					s = out_str + "\nPlain key  unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best right key so far
				for (i=0;i<26;i++)
					plain_key[i] = best_plain_key[i];
				// now look for better left key and route
			//printf("Searching right key list...\n");    
			change_flag = 0;
			for (code_index = 0;code_index<word_count;code_index++) {
					le = word_list[code_index].length;
					for (i=0;i<le;i++) {
						c = word_list[code_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}

					get_next_key(le);
					for (j=0;j<26;j++)
						code_key[j] = key_array[ j ]; 
					result = scoring_procedure();										
					score = result[0];
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_code_index = code_index;

						for (i=0;i<26;i++)
							best_code_key[i] = code_key[i]; 
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						out_str += result[1];
						out_str += result[2];
						out_str += "\nscore: "+score.toFixed(2);
						out_str += '\nCode key: '+word_list[code_index];	

						out_str += ', Plain key: '+ word_list[best_plain_index];

						out_str += ', seed: '+seed_number;
						postMessage(out_str);
 
					}
				} //next left route, next left index
				if ( change_flag == 0){
					s = out_str + "\nCode key  unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best left key so far
				for (i=0;i<26;i++)
					code_key[i] = best_code_key[i];
				
	} // next trial            
	seed_number++;
	//printf ("New seed number %i\n",seed_number);
	s = out_str + "\nNew seed number "+seed_number;
	postMessage(s);	
	code_index = Math.floor(Math.random() * word_count);

	le = word_list[code_index].length;
	for (i=0;i<le;i++) {
		c = word_list[code_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}

	get_next_key(le);
    for (j=0;j<26;j++)
        best_code_key[j] = code_key[j] = key_array[ j ];  
		
	local_best_score = -1000;
	if ( seed_number == last_seed_number)
					break;
	} // end while(1)            
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
	numb_seeds = parseInt(s[3]);
	//crib_string = s[4];
  }
  else if(str.charAt(0)  == '#') {// construct key table
    make_word_list(str);
  }
  else {
		postMessage("1working...");
		do_key_search(str);
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
