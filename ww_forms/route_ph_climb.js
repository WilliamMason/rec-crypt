// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default
var rwidth,rheight, route_in,route_out,flip, rev_flag, input_rev_flag;
var matrix = [];
var orig_buffer = [];
var rev_buffer = [];

var NUMB_ROUTES = 10;

function in_route( route){
        var j,k,dr;
        var index,sx,sy,wd,ht;
        var cnt;

        index = 0;
        switch(route) {
        case 0:
        for (j=0;j<rwidth;j++) for (k=0;k<rheight;k++)
                matrix[k][j] = buffer[index++];
        break;
        case 1:
        for  (k=0;k<rheight;k++)for (j=0;j<rwidth;j++)
                matrix[k][j] = buffer[index++];
        break;
        case 2: /* diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
        break;
        case 9: /* reverse diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
        break;        
        case 3: /* alternating diagonals*/
        dr = 0;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                dr ^= 1;
        }
        break;
        case 4: /* reverse alternating diagonals*/
        dr = 1;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                dr ^= 1;
        }
        break;
        case 5: /* clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( sx<wd) {
                        for (j=sx;j<wd;j++) {
                                matrix[sy][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sy+1;j<ht;j++) {
                                matrix[j][wd-1] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for(j=wd-2;j>sx-1;j--) {
                                matrix[ht-1][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                                                
                        for (j=ht-2;j>sy;j--) {
                                matrix[j][sx] = buffer[index++];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        case 6: /* alternating verticals*/
                dr = 0;
                for (j=0;j<rwidth;j++){
                        if(dr==0){
                                 for (k=0;k<rheight;k++)
                                        matrix[k][j] = buffer[index++];
                        }
                        else {
                                 for (k=0;k<rheight;k++)
                                        matrix[rheight-1-k][j] = buffer[index++];
                        }
                        dr ^= 1;
                }
                break;
        case 7: /* alternating horizontals*/
                dr = 0;
                for (k=0;k<rheight;k++){
                        if(dr==0){
                                 for (j=0;j<rwidth;j++)
                                        matrix[k][j] = buffer[index++];
                        }
                        else {
                                 for (j=0;j<rwidth;j++)
                                        matrix[k][rwidth-1-j] = buffer[index++];
                        }
                        dr ^= 1;
                }
                break;
        case 8: /* counter clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sy;j<ht;j++) {
                                matrix[j][sx] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sx+1;j<wd;j++) {
                                matrix[ht-1][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy-1;j--) {
                                matrix[j][wd-1] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for(j=wd-2;j>sx;j--) {
                                matrix[sy][j] = buffer[index++];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        } /* end switch */
} /* end in_route*/

function out_route(route){
        var j,k,index,dr;
        var wd,ht,sx,sy;
        var cnt;

        index = 0;
        switch(route) {
        case 0:
        for (j=0;j<rwidth;j++) for (k=0;k<rheight;k++)
                plain_text[index++] = matrix[k][j];
        break;
        case 1:
        for  (k=0;k<rheight;k++) for (j=0;j<rwidth;j++)
                plain_text[index++] = matrix[k][j];
        break;
        case 2: /* diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++]=matrix[k-j][j];
        break;
        case 9: /* reverse diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++]=matrix[k-j][j];
        break;        
        case 3: /* alternating diagonals*/
        dr = 0;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                dr ^= 1;
        }
        break;
        case 4: /*reverse alternating diagonals*/
        dr = 1;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                dr ^= 1;
        }
        break;
        case 5: /* clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sx;j<wd;j++) {
                                plain_text[index++] =matrix[sy][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sy+1;j<ht;j++) {
                                plain_text[index++] = matrix[j][wd-1];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for(j=wd-2;j>sx-1;j--) {
                                plain_text[index++] = matrix[ht-1][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy;j--) {
                                plain_text[index++] =matrix[j][sx];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        case 6: /* alternating verticals*/
                dr = 0;
                for (j=0;j<rwidth;j++){
                        if(dr==0){
                                 for (k=0;k<rheight;k++)
                                        plain_text[index++] = matrix[k][j];
                        }
                        else {
                                 for (k=0;k<rheight;k++)
                                        plain_text[index++] = matrix[rheight-1-k][j];
                        }
                        dr ^= 1;
                }
                break;
        case 7: /* alternating horizontals*/
                dr = 0;
                for (k=0;k<rheight;k++){
                        if(dr==0){
                                 for (j=0;j<rwidth;j++)
                                        plain_text[index++] = matrix[k][j];
                        }
                        else {
                                 for (j=0;j<rwidth;j++)
                                        plain_text[index++] = matrix[k][rwidth-1-j];
                        }
                        dr ^= 1;
                }
                break;
        case 8: /* counter clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sy;j<ht;j++) {
                                plain_text[index++] =matrix[j][sx];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sx+1;j<wd;j++) {
                                plain_text[index++] = matrix[ht-1][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy-1;j--){
                                plain_text[index++] = matrix[j][wd-1];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for(j=wd-2;j>sx;j--){
                                plain_text[index++] = matrix[sy][j];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        } /* end switch */

} /* end out_route*/

function matrix_manip(x) {
        var j,k;
        var temp_matrix = [];

        if ( x==0) return; // no swaps
        for (j=0;j<rheight;j++) {
            temp_matrix[j] = [];
            for (k=0;k<rwidth;k++) 
                temp_matrix[j][k] = matrix[j][k]
        }
        switch(x) {
        // case 0: /* use original*/
                // for (j=0;j<rheight;j++)
                        // for (k=0;k<rwidth;k++)
                                // matrix[j][k] = temp_matrix[j][k];
                // break;
        case 1: /* width rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[j][rwidth-1-k];
                break;
        case 2: /* height rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[rheight-1-j][k];
                break;

        case 3: /* height & width rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[rheight-1-j][rwidth-1-k];
                break;
        } /* end switch */
} /* end matrix_manip*/


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

	
function get_trial_decrypt(){

    if (input_rev_flag == 1)
        buffer = rev_buffer;
    else
        buffer = orig_buffer;    
    in_route(route_in);
    matrix_manip(flip);
    out_route(route_out);
    if (rev_flag ==1 )
        plain_text.reverse();
}
	

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
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
    var op_choice;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			orig_buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    for (i=0;i<buf_len;i++)
        rev_buffer[i] = orig_buffer[i];
    rev_buffer.reverse();
    rheight = buf_len/rwidth;
    for (i=0;i<rheight;i++)
        matrix[i] = [];
    // random start
	// for (i=0;i<period;i++) {
		// key[i] = Math.floor( Math.random()*period);
	// }
    route_in = Math.floor( Math.random()*NUMB_ROUTES);
    route_out = Math.floor( Math.random()*NUMB_ROUTES);
    flip = Math.floor( Math.random()*4);
    rev_flag = Math.floor( Math.random()*2);
    input_rev_flag = Math.floor( Math.random()*2);
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
        op_choice = Math.floor(Math.random()*100);
        if ( op_choice <25 ){
            n1 = route_in;
            route_in = Math.floor( Math.random()*NUMB_ROUTES);
        }
        else if (op_choice < 50){
            n1 = route_out;
            route_out= Math.floor( Math.random()*NUMB_ROUTES);
        }
        else if (op_choice < 75){
            n1 = flip;
            flip= Math.floor( Math.random()*4);
        }
        else if (op_choice <87)
            input_rev_flag ^= 1;        
        else
            rev_flag ^= 1;
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
            if (input_rev_flag == 1)
                out_str += '\n(Input reversed) ';
            else
                out_str += '\n';
			out_str += 'Route in: '+route_in+' Flip type: '+flip+' Route out: '+route_out;
            if (rev_flag == 1) out_str += " (Output reversed).";
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
            if ( op_choice <25 ){
                route_in = n1;
            }
            else if (op_choice < 50){
                route_out = n1;
            }
            else if (op_choice < 75){
                flip = n1;
            }
            else if (op_choice <87)
                input_rev_flag ^= 1;
            else
                rev_flag ^= 1;
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
	rwidth = parseInt(s[3]);
	// for debugging
	// s = '2period passed is: '+period;
	// postMessage(s);
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
