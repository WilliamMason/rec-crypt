// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var key = [];
var ph_sq = [];
var inverse_ph_sqx = [];
var inverse_ph_sqy = [];

var cipher_type = 0;

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var inc_limit,dec_limit;

// doppleschach score vars
var random_score = 17
var std_eng_score = 404


function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var weighted_tet_sum, unweighted_tet_sum;    
    
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
    weighted_tet_sum = 0;
    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
        n = tet_table[i];
        tet_table[i] = Math.log(1+tet_table[i]);
        weighted_tet_sum += n*tet_table[i];
        unweighted_tet_sum += tet_table[i];            
    }

    // global variables for this tet table
    random_score = 100*unweighted_tet_sum / (26*26*26*26);
    std_eng_score = 100*weighted_tet_sum / max_n;
    
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
	

initialize_tet_table();
initialize_squares();
max_trials = 1000000;
	
function get_trial_decrypt(){
       var i,j,k, index,x,y;
       var c1,c2,c3,c4;
       var swap_row,row,col,cycle,rindex;
       // set up squares
       /* get key array into first square */
       index = 0;
       for (j=0;j<5;j++)
               for (k=0;k<5;k++) {
                       ph_sq[0][j][k] = key[index];
                       inverse_ph_sqx[0][ key[index] ] = k;
                       inverse_ph_sqy[0][ key[index] ] = j;
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
                       ph_sq[0][j][k] = key[index];
                       inverse_ph_sqx[0][ key[index] ] = k;
                       inverse_ph_sqy[0][ key[index] ] = j;
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
    var tet_score;

    if ( cipher_type == 0) //R (or C)
        get_trial_decrypt();
    else
        get_trial_RC_decrypt();    
	// get tetgraph score
	score = 0.0;
    if ( crib_flag == 1){
        for (i=0;i<buf_len;i++){
            if (plain_text[i] == crib_buffer[i])
                score += 1.0
        }
        score *= 100.0;
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
        score += 100.0*best_match;
    }    
    tet_score = 0; // do separately so can use in Doppleschach scoring
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		tet_score += tet_table[n];
	}
	//return(score);
    score += tet_score;
    return( [score,tet_score] );
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
    var dopp_score, norm_score;    
	var s;
    var result;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
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
    
	n = 0;
	for (i=0;i<25;i++){
		key[i] = n++;
		if (n==9) n++; // skip 'j'
	}
	// random start;
	for (x=0;x<25;x++) {
		j = Math.floor( Math.random()*25);
		c = key[x];
		key[x] = key[j];
		key[j] = c;
	}
	cycle_limit = 10;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.5
	noise_step = 2.0;
	noise_level = begin_level;
	cycle_numb = 0;
	//max_score = current_hc_score = score = get_score(buf_len);	
    result = get_score(buf_len); // index 0 is score, index 1 is pure tet_score;
    max_score = current_hc_score = score = result[0];
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
		n1 = Math.floor(Math.random()*25);
		n2 = Math.floor(Math.random()*25);
		while(n1==n2) n2 = Math.floor(Math.random()*25);
		c1 = key[n1];
		c2 = key[n2];
		key[n1]=c2;
		key[n2]=c1;
		//score = get_score(buf_len);
        result = get_score(buf_len); // array with score and pure tet_score
        score = result[0];
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
            // random_score = 17
            // std_eng_score = 404
            //norm_score = 100*score/(buf_len-3);
            norm_score = 100*result[1]/(buf_len-3); // use pure tet_score, ignore crib bonus points
            dopp_score = (norm_score - random_score)/(std_eng_score - random_score);
            out_str += ", Doppleschach score: "+dopp_score.toFixed(2);
            
            if ( crib_flag >= 1)
                out_str += ", (using crib)";            
			out_str += '\nKey: ';
			for (i=0;i<25;i++) 
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
			key[n1]=c1;
			key[n2]=c2;
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+" ";
            if (v < dec_limit && cycle_limit>1){
                cycle_limit--;
                s += " decrementing, new cycle len: "+cycle_limit;
            }
            if (v >inc_limit){
                cycle_limit++;
                s += " incrementing, new cycle len: "+cycle_limit;
            }
            s += ')';
            
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
    if (s[3]=='0')
        cipher_type = 0;
    else
        cipher_type = 1;
    dec_limit = parseFloat(s[4]);
    inc_limit = parseFloat(s[5]);
        
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
