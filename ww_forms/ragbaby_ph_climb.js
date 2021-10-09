// PH hill-climber with log tetragraph scoring
importScripts('tet27table.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZ "; 
var numb_symbols = 24;
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var words;
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len,plain_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var alpha27  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var whitespace="\n\t\r ',-.;=";

function alltrim(str) { // remove leading and trailing blanks
	return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
	return str.replace(/\s+/g, ' ');
}

function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<27*27*27*27;i++)
		tet_table[i] = 0.0;
	for ( c in tet27_values){
		n = ext_alpha.indexOf(tet27_values[c].charAt(0))+	27*ext_alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*ext_alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*ext_alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}	
initialize_tet_table();

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    for (i=0;i<27*27*27*27;i++)
        tet_table[i] = 0.0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    var spaceFlag = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = whitespace.indexOf(c);
        if ( n >= 0) {
            if (spaceFlag == 1) continue; // in the middle of a bunch of blanks
            spaceFlag = 1;
            c = ' ';
        }
        n = alpha27.indexOf(c);
        if ( n == -1) continue;
        if ( n<26) spaceFlag = 0;
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
            //x = n+27*n3+27*27*n2+27*27*27*n1;
            x = n1+27*n2+27*27*n3+27*27*27*n;
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
    s += '\nthere were '+max_n+' 27 char tetragraphs with greatest value of '+max_v;
    s += ' for tet: '+mc1+mc2+mc3+mc4;
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    for (i=0;i<27*27*27*27;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    
    postMessage(s);    
}    

max_trials = 1000000;

	
function get_trial_decrypt(){
        var i,j,k,x,y,n;
        var index, w_index;
        var offset,c;
        
        index = w_index=0;
        for (j=0;j<words.length;j++) {
                offset = (j+1)%numb_symbols;
                for (x=0;x<words[j].length;x++) {
                        k = words[j][x];
                        n = key.indexOf(k);
                        plain_text[index++] = key[(numb_symbols-offset+n)%numb_symbols];
                        offset = (offset+1) % numb_symbols;
                } /* next x */
                plain_text[index++] = 26; /* blank symbol */
        } /* next j */
        plain_len = index;
}
function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	score = 0.0;
    /* tetragrams */
    for (i=0;i<plain_len-3;i++) {
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table[index];
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
	// global replace of line feeds and carriage returns with blank
	str = str.replace(/[\n\r]/g,' ');
    s = '';
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = symbols.indexOf(c);
        if ( n >= 0)
            s += c;
    }
    s = alltrim(s);
    s = condense_white_space(s)
    // switch to indexes
    s = s.split(" ");
    words = [];
    for (i=0;i<s.length;i++){
        words[i] = [];
        for ( j=0;j<s[i].length;j++){
            c = s[i].charAt(j);
            words[i][j] = alpha.indexOf(c);
        }
    }
    n = 0;
	for (i=0;i<numb_symbols;i++) { // skip J and X
        key[i] = n++;
		if (numb_symbols == 24)
			if ( n == 9 || n == 23) n++;
	}
	// random start;
	for (i=numb_symbols-1;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0;
	// out_str = '0';
	// x = score.toFixed(2);
	// out_str += x+'~';
	// for (i=0;i<buf_len;i++)
		// out_str += alpha.charAt(plain_text[i]).toLowerCase();
	// out_str += "\n score of plaintext is "+score;
	// //document.getElementById('output_area').value = out_str;	
	// postMessage(out_str);
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*numb_symbols);
		n2 = Math.floor(Math.random()*numb_symbols);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(plain_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<plain_len;i++){
				out_str += symbols.charAt(plain_text[i]).toLowerCase();
				j++;
				if ( plain_text[i] == 26 && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
			out_str += '\nKey: ';
			for (i=0;i<numb_symbols;i++) 
				out_str += alpha.charAt(key[i]);
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
			key[n1]=v1;
			key[n2]=v2;
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
	if (s[2] == '1')
		numb_symbols = 26;
	else
		numb_symbols = 24;
  	n = parseInt(s[3]);
  	Math.random(n); // seed for hill-climbing
  }
  else if(str.charAt(0)  == '#') {// construct tet table
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
