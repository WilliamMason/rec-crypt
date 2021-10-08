// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var primer;
var chain = [];

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

// doppleschach score vars
var random_score = 17
var std_eng_score = 404

// primerless stuff
primerless_flag = '0';
primer_limit = 1500;
var PRIMER_LEN = 5;
var order;
var p_len;
 
var ksq = [];
var PRIMER = 0;
var SCORE = 1; // indices in ksq

var  even_flag = false;
var  g_flag = true; //g_flag == GIZMO flag


var chain_start = [];
//var chain = []; // already defined
var sum_rows = [];
var sum_columns = [];
var freq_m = [];

function sort_scores() {
        var i,j,k,l,m,t1;
        var c;

        order = [];
        for (i=0;i<100000;i++) order[i]=i;
        if (even_flag)
        	i = j = 3125;
		else        	
        	i=j=100000;
        i>>=1;
        while(i) {
                k=0; l=j-i;
                while(k<l) {
                        c=k;
                        while(c>=0) {
                                m=c+i;
                                if (ksq[order[m]][SCORE] > ksq[order[c]][SCORE]) {
                                        /* swap c and m */
                                        t1=order[c];
                                        order[c] = order[m];
                                        order[m] = t1;
                                }
                                else break;
                                c-=i;
                        }
                        k++;
                }
                i>>=1;
        }
} /* end sort scores */
 
 
function get_primerless_chain() {
        var i,j,k,index;
        var sum,count;
        var score,v,w;

        // reset to zero to avoid garbage collection
        //memset(sum_rows,0,sizeof(sum_rows));
        for (i=0;i<10;i++)
            sum_rows[i] = 0;
        //memset(sum_columns,0,sizeof(sum_columns)); 
        for (i=0;i<26;i++)
            sum_columns[i] = 0;        
        for (index = 0;index<p_len;index++)
                chain[index] = chain_start[index];
        for (j = 0;j<buf_len-p_len;j++)
                chain[j+p_len] = (chain[j]+chain[j+1]) % 10;
        //memset(freq_m,0,sizeof(freq_m));
        for (i=0;i<26;i++) for(j=0;j<10;j++)
            freq_m[i][j] = 0;
        for (j=0;j<buf_len;j++){
                freq_m[ buffer[j] ][ chain[j] ]++;
                sum_rows[ chain[j] ]++;
                sum_columns[ buffer[j] ]++;
        }
        index = 0;
		score = 0;
		
        for (k=0;k<10;k++) 
                for (j=0;j<26;j++) {
                	w = (sum_columns[j]*sum_rows[k])/buf_len;
                	if (w>0) {
                		v = (freq_m[j][k] - w);
                		score += v*v/w;
            		}
        }
	if ( !g_flag || chain_start[0]&1 || chain_start[1]&1 || chain_start[2]&1 || chain_start[3]&1 || chain_start[4]&1 )
        return(score);
    else
    	return(score * 1.66 );
} /* end get_primerless_chain */
 
 
function order_primers(){
    var s,i,indx,c,n,j,x,index;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    var j1,j2,j3,j4,j5;
    
    p_len = PRIMER_LEN;
    index = 0;
    for (i=0;i<26;i++)
        freq_m[i] = [];
    best_score = -10000;    
    for (j1=0;j1<10;j1++) {
            chain_start[0] = j1;
            if (even_flag && j1&1)
            	continue;
    for (j2=0;j2<10;j2++) {
            chain_start[1] = j2;
            if (even_flag && j2&1)
            	continue; 
    for (j3=0;j3<10;j3++) {
            if (even_flag && j3&1)
            	continue;
            chain_start[2] = j3;
    for (j4=0;j4<10;j4++) {
            chain_start[3] = j4;
            if (even_flag && j4&1)
            	continue;                
    for (j5=0;j5<10;j5++) {
            if (even_flag && j5&1)
            	continue;
            chain_start[4] = j5;
	ksq[index] = [];
    s = ''+chain_start[0]+chain_start[1]+chain_start[2]+chain_start[3]+chain_start[4];
    ksq[index][PRIMER] = s;
    score = get_primerless_chain();
    ksq[index++][SCORE] = score;
    }}}}}	
    sort_scores();   

}

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
       
    /*
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    */
    
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

function get_chain(){
    var i,j,k,index,n,c;

    index = 0;
    for (i=0;i<primer.length;i++){
        c = primer.charAt(i);
        n = digits.indexOf(c);
        if ( n != -1)
            chain[index++] = n
    }
    for (j = 0;j<buf_len-index;j++) 
       chain[j+index] = (chain[j]+chain[j+1]) % 10;
}       
	
function get_trial_decrypt(){
        var i,j,k, index,x,y,c;
        var c1,c2,c3,c4;

        // get inverse key 
	for (i=0;i<26;i++) {
		inverse_key[ key[i] ] = i;
	}    
    for (x=0;x<buf_len;x++) {
        c = inverse_key[buffer[x]];
        plain_text[x] = (26+c-chain[x])%26;
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
    score *= 100; // deduct a lot for # symbols in plaintext
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
    var primer_numb;
    var norm_score;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
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
   if (primerless_flag == '0')
    primer_limit=1;
   else {
        //primer_limit = 1500;, // now sent by user
        order_primers();
   }
   max_score = 0;
 for (primer_numb = 0;primer_numb<primer_limit;primer_numb++){    
	for (i=0;i<26;i++) {
		key[i] = i;
	}
	// random start;
	for (i=25;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
    if (primerless_flag == '1')
        primer = ksq[order[primer_numb]][PRIMER]
    get_chain();
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	current_hc_score = score = get_score(buf_len);	
    if ( score>max_score){
        max_score = score;
        out_str = '0';
        x = score.toFixed(2);
        out_str += x+'~';
        for (i=0;i<buf_len;i++)
            out_str += alpha.charAt(plain_text[i]).toLowerCase();
        out_str += "\n score of plaintext is "+score;
        postMessage(out_str);
    }
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*26);
		n2 = Math.floor(Math.random()*26);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
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
            
            norm_score = 100*score/(buf_len-3);
            dopp_score = (norm_score - random_score)/(std_eng_score - random_score);
            out_str += ", Doppleschach score: "+dopp_score.toFixed(2);
            
            if (primerless_flag == '1')
                out_str += '\nprimer: '+primer+', primer number: '+primer_numb+', out of: '+primer_limit;
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nKey: ';
			for (i=0;i<26;i++) 
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
			key[n1]=v1;
			key[n2]=v2;
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0 && primerless_flag =='0'){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
			
		
	} // next trial
    if ( (primer_numb%10)==0){
        s = out_str+"\n\n(primer: "+primer_numb+")";
        postMessage(s);
    }
 
  }// number primer_numb    
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
    primerless_flag = s[4];
    if ( primerless_flag == '0')
        primer = s[3];
    else
        primer_limit = parseInt(s[5]);
	// for debugging
	// s = '2primer passed is: '+primer;
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
