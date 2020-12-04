// Converging key search worker
// 6x6 option not active
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ#";	
var buffer = new Array();
var plain_text = new Array();
var key = [];
var work_key = [];
var key_array = [];
var inverse_key = [];
var work_array=[];
var used_let = [];
var max_trials;

var h_key = [];
var v_key = [];
var hkey_word = [];
var vkey_word = [];

var best_h_key = [];
var best_v_key = [];

var h_hash, v_hash;

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
	for (i=0;i<buf_len-3;i++){
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) {
            //score--;
            continue;
        }
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	

function get_next_key(le){
	var i,j,k,index;
	
	for (i=0;i<27;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[key[i]] == 0){
			key_array[index++] = key[i];
			used_let[key[i]] = 1;
	}
	for (i=0;i<27;i++)
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
    var left_index, right_index;
    var best_left_index, best_right_index;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le,hash;

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
    // select key and route for hor key at random
    left_index = Math.floor( Math.random() * word_count);
    right_index = Math.floor( Math.random() * word_count);
	h_hash = Math.floor(Math.random() * 2);	
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}
	if ( h_hash == 1) key[le++] = 26;
	get_next_key(le);
    for (j=0;j<27;j++)
        best_h_key[j] = h_key[j] =key_array[ j ];  
		
    best_left_index = left_index;
    best_right_index = -1;
	v_hash = 0;
    local_best_score = best_score = -1000;
    seed_number = 0;
	while(1) {
	for (trial = 0 ; trial<100;trial++){        
			// find the best right key and route for this left key and route;
			change_flag = 0;
			//printf("Searching left key list...\n");
			for (right_index = 0;right_index<word_count;right_index++) for (hash = 0;hash<2;hash++){
					le = word_list[right_index].length;
					/* switch to a=0,b=1,c=2, etc*/
					for (i=0;i<le;i++) {
						c = word_list[right_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}
					if (hash==1) key[le++] = 26; // key with '#' appended
					get_next_key(le);//expand key to 27 chars in key_array
					for (j=0;j<27;j++)
						v_key[j] = key_array[ j ]; 						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_right_index = right_index;
						v_hash = hash;
						for (i=0;i<27;i++)
							best_v_key[i] = v_key[i];
					}
					if ( score > best_score){
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nhorizontal key: '+word_list[best_left_index];
						if (h_hash == 1) out_str += '#';
						out_str += ', vertical key: '+ word_list[right_index];
						if ( hash == 1) out_str += '#';
						out_str += ', seed: '+seed_number;
						postMessage(out_str);
						
					}
				} // next right index, next right route
	
				if ( change_flag == 0){
					//printf("\nLeft key square unchanged on trial %i! Done.\n", trial);
					//exit(0);
					s = out_str + "\nvertical key  unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best right key so far
				for (i=0;i<27;i++)
					v_key[i] = best_v_key[i];
				// now look for better left key and route
			//printf("Searching right key list...\n");    
			change_flag = 0;
			for (left_index = 0;left_index<word_count;left_index++) for (hash = 0;hash<2;hash++) {
					le = word_list[left_index].length;
					for (i=0;i<le;i++) {
						c = word_list[left_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}
					if ( hash == 1) key[le++] = 26; // append # at end
					get_next_key(le);
					for (j=0;j<27;j++)
						h_key[j] = key_array[ j ];  
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_left_index = left_index;
						h_hash = hash;
						for (i=0;i<27;i++)
							best_h_key[i] = h_key[i]; 
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
						out_str += '\nhorizontal key: '+word_list[left_index];	
						if ( hash == 1) out_str += '#';
						out_str += ', vertical key: '+ word_list[best_right_index];
						if (v_hash == 1) out_str += '#';
						out_str += ', seed: '+seed_number;
						postMessage(out_str);
 
					}
				} //next left route, next left index
				if ( change_flag == 0){
					s = out_str + "\nhorizontal key  unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best left key so far
				for (i=0;i<27;i++)
					h_key[i] = best_h_key[i];
				
	} // next trial            
	seed_number++;
	//printf ("New seed number %i\n",seed_number);
	s = out_str + "\nNew seed number "+seed_number;
	postMessage(s);	
	left_index = Math.floor(Math.random() * word_count);
	h_hash = Math.floor(Math.random() * 2);
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}
	if ( h_hash == 1) key[le++] = 26;
	get_next_key(le);
    for (j=0;j<27;j++)
        best_h_key[j] = h_key[j] = key_array[ j ];  
		
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
