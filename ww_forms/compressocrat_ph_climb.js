// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

var k2m_key = false;

// crib stuff
var crib_flag=0;
var crib;
var crib_buffer = [];
//var crib_len;
// allow multiple floating cribs. To be practical restrict to 3, never had more than that in the Cryptogam. 
var float_crib;
var MAX_CRIBS = 3;
var numb_cribs;


//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var lowerC= 'abcdefghijklmnopqrstuvwxyz';
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_buffer=[];
var score_buffer = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var code_len, plain_len, max_p_len;

var key_len;

var wrk_code; // make global for speed
var shifted_key_flag;
var original_key;
 
var shmoo_code = {E:'31',I:'322', P:'3212', B:'32112',
T:'12', R:'323', F:'3213', G:'32113',
A:'13', S:'112', C:'1112', V:'11111',
O:'22', H:'113', U:'1113', K:'11112',
N:'23', L:'212', M:'2111', Q:'11113',
D:'213', W:'2112', X:'321111', Y:'2113',
J:'321112', Z:'321113' };

var encoding_alphabet = [
'111','112','113','121','122','123','131','132','133',
'211','212','213','221','222','223','231','232','233',
'311','312','313','321','322','323','331','332']; // no '333'

var EMPTY = -1;
var LETTER_INDEX = 3;
var S_CODE = '123';

var trie = [];
var max_trie_index;

function new_trie_element(indx){
	var i;
	
	trie[indx] = [];
	for ( i=0;i<3;i++)
		trie[indx][i] = EMPTY;
	trie[indx][LETTER_INDEX] = EMPTY;
}

function insert_letter(letter,str){
	var i,j,c,n;
	var current_index,next_index;

    letter = alpha.indexOf(letter); // switch to indicies for fast tet scoring
	c = str.charAt(0);
	current_index = S_CODE.indexOf(c);    
	for (i=1;i<str.length;i++){
		c = str.charAt(i);
		n = S_CODE.indexOf(c);
		if ( n == -1) continue; // should never happen
		next_index = n;
		if (trie[current_index][next_index] == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][next_index] = max_trie_index;
			max_trie_index++;
		}
		current_index = trie[current_index][next_index];
	}
	trie[current_index][LETTER_INDEX] = letter;
}

function make_trie(){
	var i;
    var s;
	
	for (i=0;i<3;i++)
		new_trie_element(i);
	max_trie_index = 3;
    for ( let in shmoo_code){
        insert_letter(let,shmoo_code[let]);
    }
}


function letter_search(n){ // n is starting index in wrk_code, wrk_code now global
	var i,c,current_index,j,k;
	var cnt,let;
	
    c = wrk_code.charAt(n);
	current_index = S_CODE.indexOf(c);
	let = trie[current_index][LETTER_INDEX];
	cnt = 1;
	while( (++n<wrk_code.length) && let == EMPTY){
		c = wrk_code.charAt(n);
        j = S_CODE.indexOf(c);
		if ( trie[current_index][j] == EMPTY)
			break;
		cnt++;
		current_index = trie[current_index][j];
		let = trie[current_index][LETTER_INDEX];
	}
	return( [let,cnt] );
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
	postMessage("00~tet table initialized");
}	
initialize_tet_table();

make_trie();
max_trials = 1000000;


function get_trial_decrypt(key_shift){
    var i,j,k,x,y,n,c;
    var ar,indx;
    var work_key, work_key2;
    var used_let;
    work_key = [];
    used_let = {};
    
    debugger;
    // warning: use key_len, not key.length -- key.length is 26!
	
    if ( k2m_key){
        work_key2 = [];
        for (i=0;i<key_len;i++){
            work_key2[i] = key[i];
            used_let[ key[i] ] = 1;
        }
        j = key_len;
        for (i=0;i<26;i++){
            if( !(i in used_let) )
                work_key2[j++] = i;
        }
        work_key = [];
        indx = 0;
        for (i=0;i<26;i++){
            for (j=0;j<key_len;j++)
                if ( key[j]==i){
                        while(j<work_key2.length){
                            work_key[indx++] = work_key2[j];
                            j += key_len;
                        }
                        break;
                }
        }
    }
    else {
        for (i=0;i<key_len;i++){
            work_key[i] = key[i];
            used_let[ key[i] ] = 1;
        }
        j = key_len;
        for (i=0;i<26;i++){
            if( !(i in used_let) )
                work_key[j++] = i;
        }
    }
	if (shifted_key_flag) {
		original_key = work_key.slice(0); // originalKey is global variable;
		work_key = original_key.slice(key_shift);
		for (j=0;j<key_shift;j++)
			work_key.push(original_key[j]);
	}
	
	for (i=0;i<26;i++) {
		inverse_key[ work_key[i] ] = i;
	}    
        
    wrk_code = ''; // global  
   for (i=0;i<buffer.length;i++){
        //c = buffer.charAt(i);
        //n = key.indexOf(c);
        n = inverse_key[ buffer[i] ];
        wrk_code += encoding_alphabet[ n ];
    }
    plain_text = [];
    n = 0;
    indx = 0;
    while(n<wrk_code.length){
        ar = letter_search(n,wrk_code);
        if (ar[0] == EMPTY) break; // hit '111' at end
        //plain_text[indx++] = alpha.indexOf(ar[0]);
        plain_text[indx++] = ar[0];
        n += ar[1];
    }
} // end decrypt
    

function get_score(buf_len,key_shift){
	var score,i,n;
	get_trial_decrypt(key_shift);  
    if (plain_text.length > max_p_len) return(0);
	// get tetgraph score		
	score = 0.0;
	for (i=0;i<plain_text.length-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
    //score = 100*score/plain_text.length; // will be variable length, so normalize
    if ( crib_flag != 0) 
        score += get_crib_score();        	
    return(score);
}

function get_crib_score(){
    var score,crib_pos,match,y, best_match;
    var crib_start0, crib_start1,crib_len // floating cribs    
    score = 0;
    if (crib_flag == 2){ // floating crib
        best_match = 0;
        crib_start0 = crib_start1 = -1;
        crib_len = float_crib[0].length;
        //for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
		for ( crib_pos=0;crib_pos<plain_text.length-crib_len+1;crib_pos++)
            if ( plain_text[crib_pos] == float_crib[0][0]) {
                     match = 0.0;
                    for (y=0;y<crib_len;y++)
                            if ( plain_text[crib_pos+y] == float_crib[0][y]) {
                                    match += 1.0
                    }
                    if (match>best_match) {
                            best_match = match;
                            crib_start0 = crib_pos;
                    }
        }
        score += 100.0*best_match;
        if ( numb_cribs > 1) {
            best_match = 0;        
            crib_len = float_crib[1].length;        
            for ( crib_pos=0;crib_pos<plain_text.length-crib_len+1;crib_pos++) {
                if (crib_pos == crib_start0 ) continue;
                if ( plain_text[crib_pos] == float_crib[1][0]) {
                        match = 0.0;
                        for (y=0;y<crib_len;y++)
                                if ( plain_text[crib_pos+y] == float_crib[1][y]) {
                                        match += 1.0
                        }
                        if (match>best_match) {
                                best_match = match;
                                crib_start1 = crib_pos;
                        }
                }
            }
            score += 100.0*best_match;
        }
        if ( numb_cribs > 2) {
            best_match = 0;        
            crib_len = float_crib[2].length;        
            for ( crib_pos=0;crib_pos<plain_text.length-crib_len+1;crib_pos++) {
                if (crib_pos == crib_start0 || crib_pos == crib_start1 ) continue;
                if ( plain_text[crib_pos] == float_crib[2][0]) {
                        match = 0.0;
                        for (y=0;y<crib_len;y++)
                                if ( plain_text[crib_pos+y] == float_crib[2][y]) {
                                        match += 1.0
                        }
                        if (match>best_match) {
                                best_match = match;
                                crib_start1 = crib_pos;
                        }
                }
            }
            score += 100.0*best_match;
        }        
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
	var key_shift, old_key_shift,op_choice;	
  
    debugger;
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
            crib = crib.toLowerCase();    
         // crib_flag ==2, floating crib
            crib_len = 0;
            float_crib = [];
            numb_cribs = 0;
            float_crib[numb_cribs] = [];
            for (var i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if ( c == '\n'){
                    numb_cribs++;
                    float_crib[numb_cribs] = [];
                    crib_len = 0;
                    continue;
                }
                n = lowerC.indexOf(c);
                if ( n>=0)
                    float_crib[numb_cribs][crib_len++] = n;
            }
            /* // this should already be checked 
            if ( numb_cribs==0 && crib_len == 0){
                alert("No crib entered!");
                return;
            }
            */ 
            while (numb_cribs>0 && float_crib[numb_cribs].length == 0) // last crib string ended in a new line, remove empty crib
                numb_cribs--;
            // but now final crib doesn't end in line feed, increment to get actual crib count.
            numb_cribs++;
            if ( numb_cribs > MAX_CRIBS) // allows 3, usually no more than 2
                numb_cribs = MAX_CRIBS;
    }        
	
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
	key_shift = 0;		
	cycle_limit = 25;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0 * buf_len;
	mut_count = 0;
	numb_accepted = 1;
	var op_limit = 100*key_len/(key_len+1);	
	for (trial = 0;trial < max_trials;trial++){
		if (shifted_key_flag){
			op_choice = Math.random()*100;
		}
		else
			op_choice = 0;
		if ( op_choice<op_limit){		
			n1 = Math.floor(Math.random()*26);
			n2 = Math.floor(Math.random()*26);
			v1 = key[n1];
			v2 = key[n2];
			key[n1]=v2;
			key[n2]=v1; 
		}
		else {
			old_key_shift = key_shift;
			key_shift = Math.floor( Math.random()*26);
		}
		
		score = get_score(buf_len,key_shift);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<plain_text.length;i++){
				out_str += lowerC.charAt(plain_text[i]);
				j++;
				if ( plain_text[i] == ' ' && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += ", plain len: "+ plain_text.length;
			out_str += '\nKey: ';
			for (i=0;i<key_len;i++) 
				out_str += alpha.charAt(key[i]);
			if (shifted_key_flag){
				out_str += '\nWorkKey: ';
				// original_key is global variable
				work_key = original_key.slice(key_shift);
				for (j=0;j<key_shift;j++)
					work_key.push(original_key[j]);
				for (i=0;i< 26;i++) 
					out_str += alpha.charAt(work_key[i]);
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
		
		else if(op_choice<op_limit) {
			key[n1]=v1;
			key[n2]=v2;
		}
		else
			key_shift = old_key_shift;
		
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
    key_len = parseInt(s[3]);
    max_p_len = parseInt(s[4]);
    if (s[5]=='1')
        k2m_key = true;
    else
        k2m_key = false;
	if (s[6] == '1')
		shifted_key_flag = true;
	else
		shifted_key_flag = false;
	
  }
  else if (str.charAt(0)  == ')')  { // crib indicator, then 0, no crib, 1 fixed crib,2 floating crib
    if (str.charAt(1)=='1') { // not currently used. 
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
