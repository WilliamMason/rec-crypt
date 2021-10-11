// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();

var buffer = new Array();
var plain_text = new Array();

var max_trials;
var num_key = [];
var alpha_key = [];
var inv_key = [];
var MAX_NUMB_PERIOD = 6;
var period;
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.


var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var use_6x6 = false;

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
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
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    postMessage(s);    
}    


function initialize_tet_table(){
	var i,c,n,v;
    var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
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

	
function get_trial_decrypt(){
    var index,pos,limit,i,j;
    index = pos = 0;
    while(pos<buf_len) {
        limit=num_key[index];
        if ( pos+limit > buf_len)
            limit = buf_len - pos;
        for (j=0;j<limit;j++)
            plain_text[pos+j] =
                  alpha_key[ buffer[ pos + limit-1 - j ] ];
        pos += limit;
        index = (index+1) % period;
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
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) continue;
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
    var old_period;
    var numb_symbols,square_width;
    

	//var max_trials; // now global
	var s;
    if ( use_6x6){
        var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        numb_symbols = 36;
        square_width = 6;
        var vert_route = [0,3,6,9,14,20,
                          27,30,33,26,15,21,
                          1,4,7,10,16,22,
                          28,31,34,11,17,23,
                          2,5,8,12,18,24,
                          29,32,35,13,19,25
                          ];
    }
    else {
        var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
        var vert_route = [0,5,11,16,21,1,6,12,17,22,2,7,13,18,23,3,8,14,19,24,
                                4,10,15,20,25]; // skip over j, = 9 position.
        numb_symbols = 26;
        square_width = 5;
    }  
	str = str.toUpperCase();
    str = str.replace(/Ø/g,'0');    // in case of 6x6 with Ø for zero.
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
    for (i=0;i<numb_symbols;i++)
        alpha_key[i] = i;
	// random start;
	for (i=numb_symbols-1;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = alpha_key[j];
		alpha_key[j]=alpha_key[i];
		alpha_key[i] = c;
	}
    for (i=0;i<MAX_NUMB_PERIOD;i++)
        num_key[i] = Math.floor(Math.random()*9)+1;
    period = Math.floor(Math.random()*MAX_NUMB_PERIOD)+1;
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
	for (trial = 0;trial < max_trials;trial++){
    /*
		n1 = Math.floor(Math.random()*5);
		n2 = Math.floor(Math.random()*5);
		n3 = Math.floor(Math.random()*5);
		n4 = Math.floor(Math.random()*5);
    */
		sq_choice = Math.floor( Math.random()*3);
       	switch (sq_choice) {
	    	case 0: // change num_key
                n1 = Math.floor(Math.random()*period);
                n2 = num_key[n1];
                num_key[n1] = Math.floor(Math.random()*9)+1;
			break;
			case 1: // change period
                    old_period = period;
                    if (Math.random()*100 < 50) {
                            if (period < MAX_NUMB_PERIOD)
                                    period++;
                            else
                                    period--;
                    }
                    else {
                        if (period>1)
                            period--;
                        else
                           period++;
                    }
                    
			break;					
			case 2: // alpha key swap
                n1 = Math.floor(Math.random()*numb_symbols);
                n2 = Math.floor(Math.random()*numb_symbols);
                n3 = alpha_key[n1];
                n4 = alpha_key[n2];
                alpha_key[n2] = n3;
                alpha_key[n1] = n4;
			break;					
       	}		
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore of plaintext is "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nalpha Key: ';
			for (i=0;i<numb_symbols;i++)
				out_str += alpha.charAt(alpha_key[i]);
            out_str += '\nNumeric Key: '
            for (i=0;i<period;i++)
                out_str += num_key[i];
            for (i=0;i<numb_symbols;i++)
                inv_key[ alpha_key[i] ] = i;
			out_str += '\ninverse alpha keysquare:';
			for (i=0;i<square_width*square_width;i++){
                if ( (i%square_width)==0) out_str += '\n';            
				out_str += alpha.charAt(inv_key[vert_route[i]]);
            }
                
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
	        	case 0: // restore old num key
                    num_key[n1] = n2;
				break;
				case 1: // restore old period
                    period = old_period;
				break;					
				case 2: // restore old alpha key
                    alpha_key[n1] = n3;
                    alpha_key[n2] = n4;
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
    if ( s[3] == '1')
        use_6x6 = true;
    else
        use_6x6 = false;
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
