importScripts('tettable.js'); 

//var word_list_string = '';
var word_list = [];

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ#"; // trifid inclides # symbol
var l_alpha="abcdefghijklmnopqrstuvwxyz#"; // trifid inclides # symbol
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_array=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
//    var weighted_tet_sum, unweighted_tet_sum;    
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
//    weighted_tet_sum = 0;
//    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
//        n = tet_table[i];
        tet_table[i] = Math.log(1+tet_table[i]);
        //tet_table[i] = Math.sqrt( Math.sqrt(tet_table[i]) );
//        weighted_tet_sum += n*tet_table[i];
//        unweighted_tet_sum += tet_table[i];                            
    }
    // global variables for this tet table
//    random_score = 100*unweighted_tet_sum / (26*26*26*26);
//    std_eng_score = 100*weighted_tet_sum / max_n;
    
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

function make_word_list(str) {
	var s,n;
    var state,i,c,index;
	
    s = "making table from sring of length "+str.length;
    postMessage(s);
    //str = str.toUpperCase();
	str = str.toLowerCase();
    state = 0; //no current word
    s = '';
    index = 0;
	word_list = [];
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		//if (c =='J') c = 'I'; // leave out, have to allow for 6x6
		//n = alpha.indexOf(c);
		n = l_alpha.indexOf(c);
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
    
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;

        // get inverse key 
	for (i=0;i<27;i++) {
		inverse_key[ key[i] ] = i;
	}    
	index =  y = 0;
	for (x=0;x<buf_len;x++) {
		c1 = Math.floor(inverse_key[ buffer[x] ]/9);
		c2 = Math.floor((inverse_key[ buffer[x] ] %9)/3);
		c3 = (inverse_key[ buffer[x] ] % 3);
		work_array[index++] = c1;
		work_array[index++] = c2;
		work_array[index++] = c3;
		if ( index == 3*period) { /* array is filled */
			for (k=0;k<index/3;k++)
				plain_text[y++]=key[ 9*work_array[k]+
					3*work_array[k+period]+
					work_array[k+2*period]];
			index = 0;
		} /* end if */
	} /* next x */
	if (index !=0 ) /* finish partially filled work_array */
		for (k=0;k<index/3;k++)
			plain_text[y++]=key[ 9*work_array[k]+
				3*work_array[k+index/3]+
				work_array[k+2*index/3]];
		
}

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
    /*
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
    */
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

function get_key_array(wrd){
        var i,j,c,n,n2;
        var indx;
        
        key = [];
        var used_indx = [];
        for (i=0;i<27;i++) used_indx[i] = 0
        indx = 0;
        for (i=0;i<wrd.length;i++){
            c = wrd.charAt(i);
            n = l_alpha.indexOf(c);
            if (  used_indx[n] == 0 ){
                key[indx++] = n;
                used_indx[n] = 1;
            }
        }
        for (i=0;i<27;i++){
            if (  used_indx[i] == 0 )
                key[indx++] = i
        }
}

 
function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s,cnt;
    

    //initialize_tet_table();
    cnt = 0;
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    /*
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
    */

    max_score = -10000;
    for (w_index=0;w_index<word_list.length;w_index++) {
        wrd = word_list[w_index];
        get_key_array(wrd);
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = ''; 
			for (i=0;i<buf_len;i++)
				out_str += l_alpha.charAt(plain_text[i]);
			out_str += "\nscore of plaintext: "+score.toFixed(2);
            out_str += '\nKey word: '+wrd;
			out_str += '\nKey: ';
			for (i=0;i<27;i++) 
				out_str += alpha.charAt(key[i]);
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
        // also try version of key with '#' at the end
        wrd += '#';
        get_key_array(wrd);
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = ''; 
			for (i=0;i<buf_len;i++)
				out_str += l_alpha.charAt(plain_text[i]);
			out_str += "\nscore of plaintext: "+score.toFixed(2);
            out_str += '\nKey word: '+wrd;
			out_str += '\nKey: ';
			for (i=0;i<27;i++) 
				out_str += alpha.charAt(key[i]);
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
    }
    postMessage("~");
//document.getElementById('debug_area').value="key search";
}

onmessage = function(event) { //receiving a message
	var str,s;

  debugger;  
  var state = event.data.op_choice;
  if ( state == 1){ // word list
	str = event.data.book_string2;
	make_word_list(str);
  }
  else if (state == 3){ // custom tet table
    str = event.data.str;
    make_table(str);
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
    str = event.data.str;
    period = parseInt(event.data.period);
    do_key_search(str);
  }
}
