// PH hill-climber with log pentagraph scoring
// version 3 handles cribs
importScripts('english_pent_base64.js'); 

//postMessage("pent_values loaded");
var pent_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var sq1 = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var sq2 = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var sq3 = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var inv_row3 = [];
var inv_col3 = [];
var buf_len;
var plain_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var crib_flag=0;
var crib;
var crib_buffer = [];

var base64lookup = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function base64Decode(s) {
 var len=s.length;
 var res = new Array();
 var index=0;
 var i=0;
 var chr1, chr2, chr3;
 var enc1, enc2, enc3, enc4;

 while(i<len) {
  enc1 = base64lookup.indexOf(s.charAt(i++));
  enc2 = base64lookup.indexOf(s.charAt(i++));
  enc3 = base64lookup.indexOf(s.charAt(i++));
  enc4 = base64lookup.indexOf(s.charAt(i++));
  res[index++] = (enc1 << 2) | (enc2 >> 4);
  res[index++] = ((enc2 & 15) << 4) | (enc3 >> 2);
  res[index++] = ((enc3 & 3) << 6) | enc4;
  
 }
 return res;
}


function initialize_pent_table(){
	var i,c,n,v,s,v1;
    var index;

	for ( i = 0; i<26*26*26*26*26;i++)
		pent_table[i] = 0.0;
    var p_values = base64Decode(pent_values);
    // p_values: 4 byte integer for pent index, followed by 2 byte log value scaled up by 100
    index = 0;
    for (i=0;i<p_values.length;i++){
        v = p_values[i];
        //if (v<0) v += 256; // unsigned integers, java needs this, don't know if javascript does, doesn't seem to.
        if(index == 0)
            n = v;
        else if (index==1) n+= 256*v;
        else if (index==2) n+= 256*256*v;
        else if (index==3) n+= 256*256*256*v;
        else if (index==4) v1=v;
        else if (index==5) {
            v1 += 256*v;
            pent_table[n] = v1/100.0; // table values already converted to logs
            index = -1;
        }
        index++;
    }

	postMessage("00~pent table initialized");
}	
initialize_pent_table();
max_trials = 1000000;

function put_pc(l,m,r,i1) {
       var row1,col1,row2,col2;
       var mrow,mcol;
	var tmp;
       
       col1=inv_col1[l];
       row2=inv_row2[r];

       mrow=inv_row3[m];
       mcol=inv_col3[m];
       
      	plain_text[i1] = sq1[mrow][ col1];
      	plain_text[i1+1] = sq2[row2][mcol];
       

	
}

                		
	
function get_trial_decrypt(){
       var i,j,k, index,x;
       var c1,c2,c3,c4;

       // get inverse key squares
	for (i=0;i<5;i++) for (j=0;j<5;j++){
		inv_row1[ sq1[i][j] ] = i;
		inv_col1[ sq1[i][j] ] = j;
		inv_row2[ sq2[i][j] ] = i;
		inv_col2[ sq2[i][j] ] = j;	
		inv_row3[ sq3[i][j] ] = i;
		inv_col3[ sq3[i][j] ] = j;	
           
	}
       index = 0;
       for (j=0;j<buf_len;j = j+3) {
               c1 = buffer[j];
               c2 = buffer[j+1];
               c3 = buffer[j+2];
			put_pc(c1,c2,c3,index);
               index += 2;
       }
 }
	

function get_score(plain_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
    if ( crib_flag == 1){
        for (i=0;i<plain_len;i++){
            if (plain_text[i] == crib_buffer[i])
                score += 1.0
        }
        score *= 100.0;
    }
	for (i=0;i<plain_len-4;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
            +26*26*26*26*plain_text[i+4];
		score += pent_table[n];
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
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    if (crib_flag == 1){
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
    plain_len = Math.floor(buf_len*2/3);
	n = 0;
	for (i=0;i<5;i++) for (j=0;j<5;j++){
        sq3[i][j] = n;
		sq1[i][j] = n;
		sq2[i][j] = n++;
		if (n==9) n++; // skip 'j'
	}
	// random start;
	for (x=0;x<5;x++)for (y=0;y<5;y++) {
		j = Math.floor( Math.random()*5);
		i = Math.floor( Math.random()*5);
		c = sq1[x][y];
		sq1[x][y] = sq1[i][j];
		sq1[i][j] = c;
	}
	for (x=0;x<5;x++)for (y=0;y<5;y++) {
		j = Math.floor( Math.random()*5);
		i = Math.floor( Math.random()*5);
		c = sq2[x][y];
		sq2[x][y] = sq2[i][j];
		sq2[i][j] = c;
	}
	for (x=0;x<5;x++)for (y=0;y<5;y++) {
		j = Math.floor( Math.random()*5);
		i = Math.floor( Math.random()*5);
		c = sq3[x][y];
		sq3[x][y] = sq3[i][j];
		sq3[i][j] = c;
	}
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score(plain_len);	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<plain_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*5);
		n2 = Math.floor(Math.random()*5);
		n3 = Math.floor(Math.random()*5);
		n4 = Math.floor(Math.random()*5);
		sq_choice = Math.floor( Math.random()*100);
		if (sq_choice<33){
            /* simple sq1 pair swap */
           	c1 = sq1[n1][n2];
           	c2 = sq1[n3][n4];
           	sq1[n1][n2] = c2;
           	sq1[n3][n4] = c1;
       	}
		else if (sq_choice<66){
            /* simple sq2 pair swap */
           	c1 = sq2[n1][n2];
           	c2 = sq2[n3][n4];
           	sq2[n1][n2] = c2;
           	sq2[n3][n4] = c1;
       	}
		else{
            /* simple sq3 pair swap */
           	c1 = sq3[n1][n2];
           	c2 = sq3[n3][n4];
           	sq3[n1][n2] = c2;
           	sq3[n3][n4] = c1;
       	}
		score = get_score(plain_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<plain_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\npent score: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( crib_flag == 1)
                out_str += ", (using crib)";
			out_str += '\nKeys: left ';
			for (i=0;i<5;i++) for(j=0;j<5;j++)
				out_str += alpha.charAt(sq1[i][j]);
			out_str += ', top ';
			for (i=0;i<5;i++) for(j=0;j<5;j++)
				out_str += alpha.charAt(sq2[i][j]);
			out_str += ', middle ';
			for (i=0;i<5;i++) for(j=0;j<5;j++)
				out_str += alpha.charAt(sq3[i][j]);
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*plain_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
			if (sq_choice<33){
                // restore sq1 pairs
                sq1[n1][n2] = c1;
                sq1[n3][n4] = c2;                	
            }
			else if (sq_choice<66){
                // restore sq2 pairs
                sq2[n1][n2] = c1;
                sq2[n3][n4] = c2;                	
            }
			else{
                // restore sq3 pairs
                sq3[n1][n2] = c1;
                sq3[n3][n4] = c2;                	
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
  
  // if (str.charAt(0)  == '@')
  	// max_trials = parseInt(str.slice(1));
  // else if (str.charAt(0)  == '~') {// redo the random seed
  	// trial = parseInt(str.slice(1));
  	// Math.random(trial);
  // }
  else if (str.charAt(0)  == ')')  { // crib indicator, then 0, no crib, 1 fixed crib,2 floating crib(to do)
    if (str.charAt(1)=='1') {
        crib_flag = 1;
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
