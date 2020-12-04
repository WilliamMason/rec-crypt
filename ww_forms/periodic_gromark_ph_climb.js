// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var primer='12345';
var chain = [];
var chain_start = [];

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

// primerless stuff
primerless_flag = '0';
//primer_limit = 1500;

var chain_start = [];
//var chain = []; // already defined

var key_len;
var key_word = [];
var max_key_len = 15; 
var min_key_len = 4;
var used_let = [];
var offset = [];

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
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

function get_chain(){
    var i,j,k,index,n,c;

    index = 0;
    for (i=0;i<primer.length;i++){
        c = primer.charAt(i);
        n = digits.indexOf(c);
        if ( n != -1)
            chain[index++] = n
    }
    for (j = 0;j<buf_len-index;j++) 
       chain[j+index] = (chain[j]+chain[j+1]) % 10;
}       
	
function get_key(){ // get extended & transposed key from key_word
        var i,j,k,c,n,index;
        var temp_key = [];
        
        for (i=0;i<26;i++)
            used_let[i] = 0;
        // extend key word
        for (i=0;i<key_len;i++){
            temp_key[i] = key_word[i];
            used_let[ key_word[i] ] = 1;
        }
        for (j=0;j<26;j++)
            if (used_let[j] == 0)
                temp_key[i++] = j;
        // get_transposed key
        /* get order of columns from key_word */
        index = 0;
        for (i=0;i<26;i++)
                for (j=0;j<key_len;j++)
                        if ( key_word[j] == i ){
                                offset[index++] = j;
                                        break;
                }
        if (primerless_flag == '1') {// no primer given, use transposition offset for primer
            /* get starting key order, which is inverse of offset array */
            for (j=0;j<key_len;j++) 
                chain_start[ offset[j] ] = j;
                            
            /* for chain start use key chars +1 */
            for (index = 0;index<key_len;index++)
                    chain[index] = chain_start[index]+1;
            for (j = 0;j<buf_len-key_len;j++) 
                    chain[j+key_len] = (chain[j]+chain[j+1]) % 10;  
        }
        index = 0;
        for (i=0;i<key_len;i++) {
            j = offset[i];
            while( j<26) {
                key[index++]= temp_key[ j ];
                j += key_len;
            } 
        }
}        
        
    
function get_trial_decrypt(){
        var i,j,k, index,x,y,c;
        var c1,c2,c3,c4,n;

    // get (transposed & extended) key from key_word
    get_key();
        // get inverse key 
	for (i=0;i<26;i++) {
		inverse_key[ key[i] ] = i;
	}  
    index = n = 0;
    c2 = inverse_key[ key_word[index] ];
    for (x=0;x<buf_len;x++) {
        c = inverse_key[buffer[x]];
        plain_text[x] = (52+c-chain[x]-c2)%26;
        n++;
        if ( n==key_len){
            n = 0;
            index = (index+1)%key_len;
            c2 = inverse_key[ key_word[index] ];
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
    score *= 100; // deduct a lot for # symbols in plaintext
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
    var old_key_len, op_choice;
  
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
    /*
   if (primerless_flag == '0')
    primer_limit=1;
   else {
        //primer_limit = 1500;, // now sent by user
        order_primers();
   }
   */
   max_score = 0;
 //for (primer_numb = 0;primer_numb<primer_limit;primer_numb++){    
	for (i=0;i<26;i++) {
		key_word[i] = i;
	}
	// random start;
	for (i=25;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key_word[j];
		key_word[j]=key_word[i];
		key_word[i] = c;
	}
    key_len = Math.floor(Math.random()*(max_key_len-min_key_len))+min_key_len;
    // if (primerless_flag == '1')
        // primer = ksq[order[primer_numb]][PRIMER]
    get_chain();
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	current_hc_score = score = get_score(buf_len);	
    if ( score>max_score){
        max_score = score;
        out_str = '0';
        x = score.toFixed(2);
        out_str += x+'~';
        for (i=0;i<buf_len;i++)
            out_str += alpha.charAt(plain_text[i]).toLowerCase();
        out_str += "\n score of plaintext is "+score;
        postMessage(out_str);
    }
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        op_choice = Math.random()*100;
        if ( op_choice<50){
            n1 = Math.floor(Math.random()*key_len);
            n2 = Math.floor(Math.random()*26);
            v1 = key_word[n1];
            v2 = key_word[n2];
            key_word[n1]=v2;
            key_word[n2]=v1;
        }
        else {
            old_key_len = key_len;
            if ( (Math.random()*100) < 50){
                if(key_len<max_key_len)
                    key_len++;
                else
                    key_len--;
            }
            else {
                if (key_len>min_key_len)
                    key_len--;
                else
                    key_len++;
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
            // if (primerless_flag == '1')
                // out_str += '\nprimer: '+primer+', primer number: '+primer_numb+', out of: '+primer_limit;
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nKey Word: ';
			for (i=0;i<key_len;i++) 
				out_str += alpha.charAt(key_word[i]);
			out_str += '\nKey: ';
			for (i=0;i<26;i++) 
				out_str += alpha.charAt(key[i]);
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
            if ( op_choice<50){
                key_word[n1]=v1;
                key_word[n2]=v2;
            }
            else
                key_len = old_key_len;
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0 && primerless_flag =='0'){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
			
		
	} // next trial
    /*
    if ( (primer_numb%10)==0){
        s = out_str+"\n\n(primer: "+primer_numb+")";
        postMessage(s);
    }
    */
//  }// number primer_numb    
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  debugger;
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
    primerless_flag = s[4];
    if ( primerless_flag == '0')
        primer = s[3];
    
    max_key_len = parseInt(s[5]);
	// for debugging
	// s = '2primer passed is: '+primer;
	// postMessage(s);
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
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
