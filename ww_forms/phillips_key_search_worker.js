importScripts('tettable.js'); 
importScripts('routes.js'); 
var word_list_string = '';
var word_list = [];

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var l_alpha="abcdefghijklmnopqrstuvwxyz"; 
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;

var ph_sq = [];
var inverse_ph_sqx = [];
var inverse_ph_sqy = [];

var cipher_type = 0;

var key=[];
var inverse_key = [];
var work_key=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
//var period=5; // default
var reversed_key_flag = false;

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
function initialize_squares(){
	var i,j,k;
	
	for (i=0;i<8;i++){
		ph_sq[i] = [];
		for (j=0;j<5;j++)
			ph_sq[i][j] = [];
		inverse_ph_sqx[i] = [];
		inverse_ph_sqy[i] = [];
	}
	postMessage("00~squares initialized");	
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
	//postMessage("00~tet table initialized");
}	
initialize_tet_table();
initialize_squares();

function search_word_list(b_array){
	var s,n;
    var state,i,c,index;
    
    // construct word list
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<b_array.length;i++) {
        //c = str.charAt(i);
        n = b_array[i];
        if (n>=65 && n<(65+26)) // upper case
            n -=65;
        else if (n>=97 && n<(97+26)) // lower case
            n -= 97;
        else n = -1;
        //n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            //s = c;
            s = l_alpha.charAt(n);
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += l_alpha.charAt(n);
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;

	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;	
	//postMessage(s);
}

function get_trial_decrypt(){
       var i,j,k, index,x,y;
       var c1,c2,c3,c4;
       var swap_row,row,col,cycle,rindex;
       // set up squares
       /* get key array into first square */
       index = 0;
       for (j=0;j<5;j++)
               for (k=0;k<5;k++) {
                       ph_sq[0][j][k] = work_key[index];     
                       inverse_ph_sqx[0][ work_key[index] ] = k;
                       inverse_ph_sqy[0][ work_key[index] ] = j;
                       //ph_sq[0][j][k] = key[index];                       
                       //inverse_ph_sqx[0][ key[index] ] = k;
                       //inverse_ph_sqy[0][ key[index] ] = j;
                       index++;
       }
       // recursive fill of remaining squares
       index = 1;
       while (index < 8) {
        for (swap_row = 0;swap_row<4;swap_row++) {
       		        for (row=0;row<5;row++) {
       		                if (row == swap_row)
       		                        rindex = row+1;
       		                else if (row == swap_row+1)
       		                        rindex = row-1;
       		                else
       		                        rindex = row;
       		                for (col = 0;col<5;col++) {
       		                        ph_sq[index][row][col] =
       		                                ph_sq[index-1][rindex][col];
			                        inverse_ph_sqx[index][ph_sq[index][row][col] ] = col;
               				        inverse_ph_sqy[index][ph_sq[index][row][col] ] = row;
           				    }
       		                                
       		} /* next row*/
       		index++;
       		if (index == 8) break;
   		}/* next swap row */
	} /* end while */
	// do decoding
       index = cycle=0;
       for (x=0;x<buf_len;x++) {
               row = inverse_ph_sqy[index][ buffer[x] ];
               col = inverse_ph_sqx[index][ buffer[x] ];
               c1 = ph_sq[index][ (4+row)%5 ][ (4+col)%5 ];
               plain_text[x] = c1;
               cycle++;
               if (cycle == 5) {
                       cycle = 0;
                       index = (index+1) % 8;
               }
       } /* next x */
	
       
}
		
function get_trial_RC_decrypt(){
       var i,j,k, index,x,y;
       var c1,c2,c3,c4;
       var swap_row,row,col,cycle,rindex;
       var cindex;
       // set up squares
       /* get key array into first square */
       index = 0;
       for (j=0;j<5;j++)
               for (k=0;k<5;k++) {
                       ph_sq[0][j][k] = work_key[index];     
                       inverse_ph_sqx[0][ work_key[index] ] = k;
                       inverse_ph_sqy[0][ work_key[index] ] = j;
                       index++;
       }
       // recursive fill of remaining squares
       index = 1;
       while (index < 8) {
        for (swap_row = 0;swap_row<4;swap_row++) {
       	    for (row=0;row<5;row++) {
       	            if (row == swap_row)
       	                    rindex = row+1;
       	            else if (row == swap_row+1)
       	                    rindex = row-1;
       	            else
       	                    rindex = row;
       	            for (col = 0;col<5;col++) {
	        		    if (col==swap_row)
	        		    	cindex = col+1;
	        		    else if (col==swap_row+1)
	        		    	cindex = col-1;
	        		    else
	        		    	cindex = col;
                        ph_sq[index][row][col] = ph_sq[index-1][rindex][cindex];
		                inverse_ph_sqx[index][ph_sq[index][row][col] ] = col;
              	        inverse_ph_sqy[index][ph_sq[index][row][col] ] = row;
           	       }
       	                            
       		} /* next row*/
       		index++;
       		if (index == 8) break;
   		}/* next swap row */
	} /* end while */
	// do decoding
       index = cycle=0;
       for (x=0;x<buf_len;x++) {
               row = inverse_ph_sqy[index][ buffer[x] ];
               col = inverse_ph_sqx[index][ buffer[x] ];
               c1 = ph_sq[index][ (4+row)%5 ][ (4+col)%5 ];
               plain_text[x] = c1;
               cycle++;
               if (cycle == 5) {
                       cycle = 0;
                       index = (index+1) % 8;
               }
       } /* next x */
	
       
}

function get_score(buf_len){
	var score,i,n;

    if ( cipher_type == '0') //R (or C)
        get_trial_decrypt();
    else
        get_trial_RC_decrypt();    
    
	//get_trial_decrypt();
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
	for (i=0;i<buf_len-3;i++){
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
        for (i=0;i<26;i++) used_indx[i] = 0
        used_indx[9] = 1; // index of 'j' is 9.
        indx = 0;
        for (i=0;i<wrd.length;i++){
            c = wrd.charAt(i);
            if ( c=='j') c = 'i';
            n = l_alpha.indexOf(c);
            if (  used_indx[n] == 0 ){
                key[indx++] = n;
                used_indx[n] = 1;
            }
        }
        for (i=0;i<26;i++){
            if (  used_indx[i] == 0 )
                key[indx++] = i
        }
		if (reversed_key_flag)
			key.reverse();
		
}

 
function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s,cnt;
    var wrd;
    

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
        for ( k = 0;k<routes.length;k++) {
            for (j=0;j<25;j++)
                work_key[j] = key[ routes[k][j] ];  
            score = get_score(buf_len);
            if ( score>max_score){
                max_score = score;
                out_str = ''; 
                for (i=0;i<buf_len;i++)
                    out_str += l_alpha.charAt(plain_text[i]);
                out_str += "\nscore of plaintext: "+score.toFixed(2);
                out_str += '\nKey word: '+wrd;
                out_str += '\nKey: ';
                for (i=0;i<25;i++) 
                    out_str += alpha.charAt(work_key[i]);
                //out_str += "\nroute: "+k+" ("+route_name[k]+")";
                //document.getElementById('output_area').value = out_str;	
				if ( reversed_key_flag)
					out_str += "\nroute: "+k+" ("+route_name[k]+" reversed)";
				else 
					out_str += "\nroute: "+k+" ("+route_name[k]+")";				
				
                postMessage(out_str);
            }
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
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 3){ // custom tet table
    str = event.data.str;
    make_table(str);
  }
  else if (state == 4){ // cipher type
    cipher_type = event.data.str;

  }  
  else if (state == 2){
    //word_pattern_string = event.data.str;
    str = event.data.str;
	reversed_key_flag = event.data.reversed_key_flag;			
    do_key_search(str);
  }
}
