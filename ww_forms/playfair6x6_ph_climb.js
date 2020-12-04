// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var sq = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var inv_row = [];
var inv_col = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.


var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

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

function put_pc(c1,c2,i1) {
       var row1,col1,row2,col2;

       row1=inv_row[c1];
       col1=inv_col[c1];
       row2=inv_row[c2];
       col2=inv_col[c2];

       if (row1 == row2) {
      		plain_text[i1] = sq[row1][ (col1+5)%6];
      		plain_text[i1+1] = sq[row2][ (col2+5)%6];
	}
	else if ( col1 == col2) {
      		plain_text[i1] = sq[(row1+5)%6 ][col1];
      		plain_text[i1+1] = sq[ (row2+5)%6 ][col2];
	}
       else {
       	plain_text[i1] = sq[row1][col2];
       	plain_text[i1+1] = sq[row2][col1];
	}	        
}

                		
	
function get_trial_decrypt(){
       var i,j,k, index,x;
       var c1,c2,c3,c4;

       // get inverse key square
	for (i=0;i<6;i++) for (j=0;j<6;j++){
		inv_row[ sq[i][j] ] = i;
		inv_col[ sq[i][j] ] = j;
	}        
	
       for (j=0;j<buf_len;j = j+2) {
               c1 = buffer[j];
               c2 = buffer[j+1];
			put_pc(c1,c2,j);
       }
}
	

function get_score(buf_len){
	var score,i,n;
    var best_match,match,crib_pos,y;

	get_trial_decrypt();
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
	for (i=0;i<buf_len-3;i++){
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) {
            score--;
            continue;
        }
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
    var used_symbols;

	//var max_trials; // now global
	var s;
  
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
	for (i=0;i<6;i++) for (j=0;j<6;j++){
		sq[i][j] = n++;
	}
	// random start;
	for (x=0;x<6;x++)for (y=0;y<6;y++) {
		j = Math.floor( Math.random()*6);
		i = Math.floor( Math.random()*6);
		c = sq[x][y];
		sq[x][y] = sq[i][j];
		sq[i][j] = c;
	}
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0
	noise_step = 1.5;
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
    used_symbols = [];
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*6);
		n2 = Math.floor(Math.random()*6);
		n3 = Math.floor(Math.random()*6);
		n4 = Math.floor(Math.random()*6);
		sq_choice = Math.floor( Math.random()*50);
       	switch (sq_choice) {
	    	case 0: // swap rows
				for (j=0;j<6;j++) {
					c = sq[n1][j];
					sq[n1][j] = sq[n2][j];
					sq[n2][j] = c;
				}
			break;
			case 1: // swap columns
				for (j=0;j<6;j++) {
					c = sq[j][n1];
					sq[j][n1] = sq[j][n2];
					sq[j][n2] = c;				
				}
			break;					
			case 2: // left right flip
				for (j=0;j<6;j++) {
					c = sq[j][0];
					sq[j][0] = sq[j][5];
					sq[j][5] = c;				
					c = sq[j][1];
					sq[j][1] = sq[j][4];
					sq[j][4] = c;
					c = sq[j][2];
					sq[j][2] = sq[j][3];
					sq[j][3] = c;				
				}
			break;					
        	case 3: // top bottom flip
				for (j=0;j<6;j++) {
					c = sq[0][j];
					sq[0][j] = sq[5][j];
					sq[5][j] = c;
					c = sq[1][j];
					sq[1][j] = sq[4][j];
					sq[4][j] = c;
					c = sq[2][j];
					sq[2][j] = sq[3][j];
					sq[3][j] = c;
				}
				break;
				case 4: //swap rows & columns
				for (i=0;i<4;i++) for (j=i+1;j<6;j++) {
					c = sq[i][j];
					sq[i][j] = sq[j][i];
					sq[j][i] = c;
				}
				break;
        	default:
            /* simple pair swap */
            	c1 = sq[n1][n2];
            	c2 = sq[n3][n4];
            	sq[n1][n2] = c2;
            	sq[n3][n4] = c1;
            	
           	break;
       	}
		
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
            for (i=0;i<36;i++)
                used_symbols[i] = false; 
            for (i=0;i<buf_len;i++)
                used_symbols[ buffer[i] ] = true;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++){
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
                used_symbols[ plain_text[i] ] = true;
            }
			out_str += "\nscore of plaintext is "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nRaw Key:\n';
            
			for (i=0;i<6;i++) for(j=0;j<6;j++)
				out_str += alpha.charAt(sq[i][j]);
            
            out_str += '\nEdited Key:\n';
            for (i=0;i<6;i++){
                for (j=0;j<6;j++){
                    if ( used_symbols[ sq[i][j] ])
                        out_str += alpha.charAt(sq[i][j]);
                    else
                        out_str += '-';
                }
                out_str += '\n';
            }
            out_str += '\nunused key symbols: ';
            for (i=0;i<36;i++)
                if (!used_symbols[i] )
                    out_str += alpha.charAt(i);
            out_str += '\n';
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
       		switch (sq_choice) {
	    	case 0: // swap rows back
				for (j=0;j<6;j++) {
					c = sq[n1][j];
					sq[n1][j] = sq[n2][j];
					sq[n2][j] = c;
				}
			break;
			case 1: // swap columns back
				for (j=0;j<6;j++) {
					c = sq[j][n1];
					sq[j][n1] = sq[j][n2];
					sq[j][n2] = c;				
				}
			break;					
			case 2: // left right flip
				for (j=0;j<6;j++) {
					c = sq[j][0];
					sq[j][0] = sq[j][5];
					sq[j][5] = c;				
					c = sq[j][1];
					sq[j][1] = sq[j][4];
					sq[j][4] = c;
					c = sq[j][2];
					sq[j][2] = sq[j][3];
					sq[j][3] = c;				
				}
			break;					
        	case 3: // top bottom flip
				for (j=0;j<6;j++) {
					c = sq[0][j];
					sq[0][j] = sq[5][j];
					sq[5][j] = c;
					c = sq[1][j];
					sq[1][j] = sq[4][j];
					sq[4][j] = c;
					c = sq[2][j];
					sq[2][j] = sq[3][j];
					sq[3][j] = c;
				}
				break;
				case 4: //swap rows & columns back
				for (i=0;i<4;i++) for (j=i+1;j<6;j++) {
					c = sq[i][j];
					sq[i][j] = sq[j][i];
					sq[j][i] = c;
				}
				break;
        		default:
                // restore pairs
                	sq[n1][n2] = c1;
                	sq[n3][n4] = c2;                	
               	break;
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
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }
  
  // if (str.charAt(0)  == '@')
  	// max_trials = parseInt(str.slice(1));
  // else if (str.charAt(0)  == '~') {// redo the random seed
  	// trial = parseInt(str.slice(1));
  	// Math.random(trial);
  // }
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
