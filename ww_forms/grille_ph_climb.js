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
var period=5; // default
var ch_sq = [];
var mask = [];
var choice_width;
var parity;

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

function turn0(){	
    var a,b;

    /* initialize mask */
    for (a=0;a<period;a++) {
        mask[a] = [];
        for (b=0;b<period;b++)
            mask[a][b] = 0;
    }
    /* put in holes */
    for (a=0;a<choice_width;a++)
        for (b=0;b<choice_width+parity;b++)
            switch(ch_sq[a][b]) {
                case 0:
                    mask[a][b] = 1;
                    break;
                case 1:
                    mask[b][period-1-a] = 1;
                    break;
                case 2:
                    mask[period-1-a][period-1-b] = 1;
                    break;
                case 3:
                    mask[period-1-b][a] = 1;
                    break;
        } /* end switch, next b,a */
} /* end turn0 */
    
function turn1() {
    var a,b;

    /* initialize mask */
    for (a=0;a<period;a++)
         for (b=0;b<period;b++)
            mask[a][b] = 0;
    /* put in holes */
    for (a=0;a<choice_width;a++)
        for (b=0;b<choice_width+parity;b++)
            switch(ch_sq[a][b]) {
                 case 3:
                        mask[a][b] = 1;
                        break;
                 case 0:
                        mask[b][period-1-a] = 1;
                        break;
                 case 1:
                        mask[period-1-a][period-1-b] = 1;
                        break;
                 case 2:
                        mask[period-1-b][a] = 1;
                        break;
        } /* end switch, next b,a */
} /* end turn1 */
 
function turn2() {
    var a,b;

    /* initialize mask */
    for (a=0;a<period;a++)
        for (b=0;b<period;b++)
             mask[a][b] = 0;
        /* put in holes */
    for (a=0;a<choice_width;a++)
        for (b=0;b<choice_width+parity;b++)
            switch(ch_sq[a][b]) {
                 case 2:
                        mask[a][b] = 1;
                        break;
                 case 3:
                        mask[b][period-1-a] = 1;
                        break;
                 case 0:
                        mask[period-1-a][period-1-b] = 1;
                        break;
                 case 1:
                        mask[period-1-b][a] = 1;
                        break;
        } /* end switch, next b,a */
} /* end turn2 */

function turn3() {
    var a,b;
    /* initialize mask */
    for (a=0;a<period;a++)
        for (b=0;b<period;b++)
             mask[a][b] = 0;

    /* put in holes */
    for (a=0;a<choice_width;a++)
        for (b=0;b<choice_width+parity;b++)
            switch(ch_sq[a][b]) {
                 case 1:
                        mask[a][b] = 1;
                        break;
                 case 2:
                        mask[b][period-1-a] = 1;
                        break;
                 case 3:
                        mask[period-1-a][period-1-b] = 1;
                        break;
                 case 0:
                        mask[period-1-b][a] = 1;
                        break;
        } /* end switch, next b,a */
} /* end turn3 */
 
    
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var col,pos;
        var c1,c2,c3,c4;

	index = 0;
    if ( parity) { /* put center character of plaintext in center of codetext*/
        plain_text[choice_width+choice_width*period]=
                                         buffer[choice_width+choice_width*period];
    }
    turn0();
    for (j=0;j<period;j++)
        for (k=0;k<period;k++)
            if ( mask[j][k] == 1 ){
                plain_text[index++] =
                    buffer[k+j*period];
                if (parity==1 && index== choice_width+choice_width*period)
                    index++;
            } 
    turn1();
    for (j=0;j<period;j++)
        for (k=0;k<period;k++)
            if ( mask[j][k] == 1){
                plain_text[index++] = buffer[k+j*period];
                if (parity ==1 && index== choice_width+choice_width*period)
                    index++;
            } 
    turn2();
    for (j=0;j<period;j++)
        for (k=0;k<period;k++)
            if ( mask[j][k] == 1){
                plain_text[index++] = buffer[k+j*period];
                if (parity ==1 && index== choice_width+choice_width*period)
                    index++;
            } 
    turn3();
    for (j=0;j<period;j++)
        for (k=0;k<period;k++)
            if ( mask[j][k] == 1){
                plain_text[index++] = buffer[k+j*period];
                if (parity ==1 && index== choice_width+choice_width*period)
                    index++;
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
        score *= 100.0;
    }
    else if (crib_flag == 2){ // floating crib
        best_match = 0;
        for ( var crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
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
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
  
	choice_width = period>>1;
	parity = period & 1;
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
    /* set up choice square */
    for (j=0;j<choice_width;j++) {
        ch_sq[j] = [];
        for (k=0;k<choice_width+parity;k++)
            ch_sq[j][k] = Math.floor(Math.random()*4);
    }
	cycle_limit = 30;
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
		n1 = Math.floor(Math.random()*choice_width);
		n2 = Math.floor(Math.random()*(choice_width+parity));
		v1 = ch_sq[n1][n2];
        ch_sq[n1][n2] = Math.floor(Math.random()*4);
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
            // for mask, set at turn 0
            turn0();
			out_str += '\nmask: ';
            for (j=0;j<period;j++){
                for (k=0;k<period;k++)
                    if(mask[j][k]==1) out_str += 'X';
                    else out_str += '-';
                out_str += ',';
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
			ch_sq[n1][n2]=v1;
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
	period = parseInt(s[3]);
	// for debugging
	// s = '2period passed is: '+period;
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