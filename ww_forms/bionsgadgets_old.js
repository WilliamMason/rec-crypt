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

function setup_shift_values(){ // get a plaintext letter and its corresponding ciphertext letter for each shift;
    var i,j,n,c;
    
    for (i=0;i<period;i++)
        indicator_values[i] = -1;
    n = 0;
    for (i=0;i<crib_buffer.length;i++){
        if (indicator_values[n] == -1 && crib_buffer[i] != 26)
            indicator_values[n] = [ crib_buffer[i],buffer[i] ];
        n++;
        if ( n == period)
            n = 0;
    }            
    // are there shift elements for each alphabet?
    for (i=0;i<period;i++)
        if ( indicator_values[i] == -1)
            return(false); // can't proceed
            
    return(true);
}

    
    
    
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

	

function get_score(buf_len){
	var score,i,n;

    get_trial_decrypt();
    // probably don't need to add scores for crib matching.
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
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
    
    //debugger;
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
    // select key and route for hor key at random
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
					score = get_score(buf_len);
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
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
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
					score = get_score(buf_len);
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
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
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
	crib_string = s[4];
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
