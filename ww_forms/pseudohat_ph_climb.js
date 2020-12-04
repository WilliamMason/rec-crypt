// PH hill-climber with log tetragraph scoring
importScripts('tet27table.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZ "; 
var numb_symbols = 24;
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var pattern_symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
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
var buffer = [];
var pattern = [];
var hat_len;
var place = [];
var hc_type;

var old_buffer = [];

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

	
function get_score(buf_len){
	var score,i,n,j;
    if (hc_type == '2') { // myszkowski, check that same letters don't have different pattern numbers
        for (i=0;i<hat_len-1;i++)
            for (j=i+1;j<hat_len;j++)
                if (buffer[i] == buffer[j] && pattern[i] != pattern[j])
                    return(-1000);
    }
    for (i=0;i<hat_len;i++)
        plain_text[i+1] = buffer[i]; // plain_text has blanks at beginning and end
    for (i=0;i<hat_len;i++)
        if (plain_text[i+1] < 0) plain_text[i+1] = 16; // ='q'-'a', low scoring letter
	score = 0.0;
    /* tetragrams */
    for (i=0;i<hat_len-1;i++) {
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table[index];
   }
    
    return(score);
}	

function get_next_let( last) { // sum of digits
        var i,j,numb_left;
        var c;

        numb_left = 26 - last;
        c = last;
        //while ( (random()%(numb_left+1)) >= 2) {
        while (Math.floor(Math.random()*(numb_left+1)) >= 2){
                c++;
                numb_left--;
        }
        return(c);
} // end get_next_let

function get_rev_let( last) { // sum of dogots
        var i,j,numb_left;
        var c;

	if ( last <0)
		return(-1);
        numb_left = last+1;
        c = last;
        //while ( (random()%(numb_left+1)) >= 2) {
        while (Math.floor(Math.random()*(numb_left+1)) >= 2){       
                c--;
                numb_left--;
        }
        return(c);
} // end get_rev_let


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
    hat_len = 0;
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = pattern_symbols.indexOf(c);
        if ( n >= 0)
            pattern[hat_len++] = n;
    }
    // initalize inverse array
    for (i=0;i<hat_len;i++)
        place[pattern[i]] = i;
    // test
    /*
    out_str = '0'; // 0 at beginning is signal to post message in output box 
    out_str += '100~' // fake score
    for (i=0;i<hat_len;i++)
        out_str += pattern_symbols.charAt(pattern[i]);
    out_str += ' hat length is '+hat_len;
	postMessage(out_str);    
    return;
    */
    // allow for different types of pseudohat climbing
    if ( hc_type == '0') sum_of_digits_climb();
    else if (hc_type == '1') aussie_climb();
    else if (hc_type == '2') myszkowski_climb();
 }

function sum_of_digits_climb(){  
  	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var nxt, last;

    for (j=0;j<hat_len+2;j++)
         plain_text[j] = 26; /* space at start and end , using tet27 scoring*/
	// random start;
    last = 0;
    for (j=0;j<hat_len;j++) {
            if ( j==0 || place[j]>place[j-1] || last == 25)
                    nxt = get_next_let(last);
            else
                    nxt = get_next_let(last+1);
            buffer[ place[j] ] = nxt;
            last = nxt;
    }
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0;
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        /* mutate */
        for (j=0;j<hat_len;j++)
		   	old_buffer[j] = buffer[j];
        n = Math.floor(Math.random()*hat_len);
        last = buffer[ place[n] ];
        if ( Math.floor(Math.random()*100)<50) {
           	for (j=n;j<hat_len;j++) {
               	if ( j==0 || place[j]>place[j-1] || last == 25)
                   	nxt = get_next_let(last);
               	else
                   	nxt = get_next_let(last+1);
               	old_buffer[ place[j] ] = buffer[ place[j]];
               	buffer[ place[j] ] = nxt;
               	last = nxt;
           	}

		}
		else {
	     	for (j = n-1 ; j>=0; j--) {
               	if (  place[j]<place[j+1] )
                   	nxt = get_rev_let(last);
               	else
                  	nxt = get_rev_let(last-1);
               	old_buffer[ place[j] ] = buffer[ place[j]];
               	buffer[ place[j] ] = nxt;
              	last = nxt;
           	}
		}
		score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<hat_len;i++){
				out_str += symbols.charAt(buffer[i]).toLowerCase();
				j++;
				if ( plain_text[i] == 26 && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += "\n(sum of digits)";
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*hat_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
            for (i=0;i<hat_len;i++)
                buffer[i] = old_buffer[i];
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
}	// end sum of digits

function aussie_climb(){  
  	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var nxt, last;
    var multiplier, previous,k;

    for (j=0;j<hat_len+2;j++)
         plain_text[j] = 26; /* space at start and end , using tet27 scoring*/
    if ( hat_len < 10) multiplier = 3;
    else multiplier = 2;
         
	// basic start;
    for (j=0;j<hat_len;j++)
         buffer[j] = pattern[j]*multiplier;
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0;
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        /* mutate */
        n = Math.floor(Math.random()*hat_len);
        previous = buffer[ place[n]];
        if (n==0) last = 0;
        else if (place[n-1] < place[n])
            last = buffer[place[ n-1 ] ];
        else last = buffer[place[ n-1 ] ]+1;
        if ( n == hat_len-1) nxt = 25;
        else nxt = buffer[place[ n+1 ] ];
        if (nxt>last)
            k = Math.floor(Math.random()*(nxt -last))+last;
        else
            k = last;
        buffer[ place[n] ] = k;
		score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<hat_len;i++){
				out_str += symbols.charAt(buffer[i]).toLowerCase();
				j++;
				if ( plain_text[i] == 26 && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += "\n(Aussie Method)";
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*hat_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
            buffer[ place[n]] = previous;        
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
}	// end aussie method


function myszkowski_climb(){  
  	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var nxt, last;
    var hat_size;

    for (j=0;j<hat_len+2;j++)
         plain_text[j] = 26; /* space at start and end , using tet27 scoring*/
    hat_size = -1;
    for (i=0;i<hat_len;i++)
        if (pattern[i]>hat_size)
            hat_size = pattern[i];
	// random start;
    last = Math.floor(Math.random()*26);
	for (i=0;i<hat_len;i++)
		if ( pattern[i] == 0)
			buffer[i] = last;
    for (j=1;j<=hat_size;j++) {
		if (last<24)
             nxt = Math.floor(Math.random()*(25-last))+last+1;
		else nxt = last;
		for (i=0;i<hat_len;i++)
			if ( pattern[i] == j)
				buffer[i] = nxt;
        last = nxt;
    }
	cycle_limit = 30;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = -100.0;
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
        /* mutate */
        for (j=0;j<hat_len;j++)
		   	old_buffer[j] = buffer[j];
        n = Math.floor(Math.random()*hat_size);
        for (j=0;j<hat_len;j++)
		   	if (pattern[j]==n)
				break;
	    last = buffer[j];
        if ( Math.floor(Math.random()*100)<50) {
            for (j=n+1;j<=hat_size;j++) {
		       if(last<24)
	                nxt = Math.floor(Math.random()*(25-last))+last+1;
                else nxt = last; // may lead to different numbers being assigned the same letter, but hopefully, at a lower score
                for (i=0;i<hat_len;i++)
                    if ( pattern[i] == j)
                        buffer[i] = nxt;
                last = nxt;
            }
		}
		else {
            for (j=n;j>=0;j--) {
		       if(last>0)
	                nxt = Math.floor(Math.random()*last);
                else nxt = last; // may lead to different numbers being assigned the same letter, but hopefully, at a lower score
                for (i=0;i<hat_len;i++)
                    if ( pattern[i] == j)
                        buffer[i] = nxt;
                last = nxt;
            }
		}
		score = get_score();
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<hat_len;i++){
				out_str += symbols.charAt(buffer[i]).toLowerCase();
				j++;
				if ( plain_text[i] == 26 && j>80){
					out_str += '\n';
					j=0;
				}
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            out_str += "\n(Myszkowski)";
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*hat_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
            for (i=0;i<hat_len;i++)
                buffer[i] = old_buffer[i];
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
}	// end myszkowski


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
    hc_type = s[3];
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
