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
var work_array=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default
var num_type, cipher_selected;

var VSLIDEFAIR = 0;
var BSLIDEFAIR = 1;
var VIGENERE = 2;
var VARIANT = 3;
var BEAUFORT = 4;
var VAUTOKEY = 5;
var BAUTOKEY = 6;
var VEAUTOKEY = 7;
var PORTA = 8;
var PAUTOKEY = 9;

var prog_key = false;
var prog_index;

var nicodemus_flag = false;
var offset = [];


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

function decode_slet(cl,cr,kl){
	if (num_type == VSLIDEFAIR) {
		if (cl== (26+cr-kl)%26) return ([ (cl+25)%26,(cr+25)%26 ]);
		return [ (26+cr-kl)%26,(26+cl+kl)%26]
	}
	//elif ciph_type == BSLIDEFAIR:
	else {
		if (cr == (kl-cl+26)%26)
			return ([ (cl+25)%26,(cr+1)%26]);
		return ([(kl-cr+26)%26,(kl-cl+26)%26]);
	}
	return "ERROR"
}

function slidefair_decode(){
	var col,pos,s;
	
	for (col=0;col<period;col++){
		pos = 2*col;
		kl = key[col];
		while (pos < buf_len){
			//plain[pos:pos+2] = decode_slet(code[pos],code[pos+1],kl,ciph_type=ciph_type)
			s = decode_slet(buffer[pos],buffer[pos+1],kl);
			plain_text[pos]= s[0];
			plain_text[pos+1]=s[1];
			pos += 2*period;
		}
	}
}

function decode_let(ct,ky){
	var cp;
	if (num_type == VIGENERE || num_type == VEAUTOKEY)
		cp = (26+ct-ky)%26;
	else if (num_type == VARIANT || num_type == VAUTOKEY)
		cp = (ct+ky)%26;
	else if (num_type == BEAUFORT || num_type == BAUTOKEY)
		cp = (26+ky-ct)%26;
	else { // PORTA
		ky = Math.floor(ky/2);
		cp = ct;
		if (cp < 13){
			cp += ky;
			if (cp < 13) cp += 13;
		}
		else {
			cp -= ky;
			if (cp > 12) cp -= 13;
		}
	}
	return( cp );
}	


function get_nicodemus_decrypt(){
        var c,c1,kl;
        var i,j,index;
        var count,k,flag;
        var start_pos,limit,row;        
        
        /* decode in groups of 5*period */
        start_pos = 0;
        limit = period*5;
        count = 0;
        do {
            if ( start_pos + limit > buf_len)
                    limit = buf_len - start_pos;
            /* do transposition/ substitution */
            for (index=0;index < period;index++) {
                    row = start_pos;
                    while (offset[index] + row <start_pos+limit) {
                            //c = (26 - key[ offset[index] ] + buffer[count++])%26;
                            kl = key[offset[index]];
                            c1 = buffer[count++];
                            c = decode_let(c1,kl);
                            /* transpose */
                            plain_text[ offset[index] + row ] = c;
                            row += period;
                    } /* end while */
    
            } /* next index */
            start_pos += limit;
        } while(start_pos<buf_len);

} /* end get_nicodemus_decrypt */

	
function get_trial_decrypt(){
       var i,j,k, index,x,y;
       var c1,c2,c3,c4;
	var col,pos,k1;
    var next_index;
	
	if (num_type <= BSLIDEFAIR) {
		slidefair_decode();
		return;
	}
    if ( nicodemus_flag) {
        get_nicodemus_decrypt();
        return;
    }
	for (col=0;col<period;col++){
		pos = col;
		kl = key[col];
        next_index = 0;
		while (pos < buf_len){
            c1 = buffer[pos];
            if (prog_key) c1 = (26+c1-next_index)%26;
			//plain_text[pos] = decode_let(buffer[pos],kl);
            plain_text[pos] = decode_let(c1,kl);
			if (num_type != PORTA && num_type >= VAUTOKEY)
				kl = plain_text[pos];
			pos += period;
            if (prog_key) next_index = (next_index+prog_index)%26;
		}
	}
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
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	for (i=0;i<period;i++) {
		key[i] = Math.floor(Math.random()*26);
	}
    if ( prog_key ) prog_index = Math.floor(Math.random()*26);
    if ( nicodemus_flag) {
        for (i=0;i<period;i++)
            offset[i] = i;
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
	for (trial = 0;trial < max_trials;trial++){
        op_choice = 0;
        if ( (nicodemus_flag || prog_key) && Math.random()*100 < 50)
            op_choice = 1;
        if ( op_choice == 0) {
            n1 = Math.floor(Math.random()*period);
            v1 = key[n1];
            key[n1]= Math.floor(Math.random()*26);
        }
        else {
            if (prog_key) {
                v1 = prog_index;
                prog_index= Math.floor(Math.random()*26);
            }
            else { // nicodemus
                n1 = Math.floor(Math.random()*period);
                v1 = offset[n1];
                n2 = Math.floor(Math.random()*period);
                v2 = offset[n2];
                offset[n1] = v2;
                offset[n2] = v1;
            }
        }
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += '\n'+cipher_selected;
			out_str += " score: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
			out_str += '\nKey: ';
			for (i=0;i<period;i++) 
				out_str += alpha.charAt(key[i]);
            if (prog_key)
                out_str += '  Progression index: '+prog_index;
            else if (nicodemus_flag) {
                out_str += '  Nicodemus column offsets: ';            
                for (i=0;i<period;i++)
                    out_str += offset[i]+" ";
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
            if (op_choice==0)
                key[n1]=v1;
            else {
                if(prog_key)
                    prog_index = v1;
                else { // nicodemus
                    offset[n1] = v1;
                    offset[n2] = v2;
                }
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
	var mut_count,s,s1;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
	period = parseInt(s[3]);
	s1 = s[4].split('@');
	num_type = parseInt(s1[0]);
	cipher_selected = s1[1];
    // progressive key?
    if (s[5].charAt(0) == '1')
        prog_key = true;
    else
        prog_key = false;
    // nicodemus?
    if (s[5].charAt(0) == '2')
        nicodemus_flag = true;
    else
        nicodemus_flag = false;
	// for debugging
	 //s = '2cipher passed is: '+cipher_selected;
	 //postMessage(s);
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
