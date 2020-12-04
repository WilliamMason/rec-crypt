// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 
var symbols = 'abcdefghijklmnopqrstuvwxyz0123456789';
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var work_buffer=[];

var buf_len, plain_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var english_basic_key = ["a","1","al","an","and","ar","are","as","at","ate",
"ati","b","2","be","c","3","ca","ce","co","com",
"d","4","da","de","e","5","ea","ed","en","ent",
"er","ere","ers","es","est","f","6","g","7","h",
"8","has","he","i","9","in","ing","ion","is","it",
"ive","j","0","k","l","la","le","m","me","n",
"nd","ne","nt","o","of","on","or","ou","p","q",
"r","ra","re","red","res","ri","ro","s","se","sh",
"st","sto","t","te","ted","ter","th","the","thi","thr",
"ti","to","u","v","ve","w","we","x","y","z"]

var french_basic_key = ["a","1","ai","ais","ait","an","ans","ar","as","b",
"2","c","3","ce","d","4","dan","de","del","des",
"du","e","5","ed","ede","el","ell","em","eme","en",
"ent","er","es","ese","est","eur","f","6","g","7",
"ge","h","8","i","9","ie","ion","it","j","0",
"k","l","la","le","les","lle","m","me","men","n",
"ne","no","non","ns","nt","o","on","ont","ou","oui",
"our","ous","p","par","q","qu","que","qui","r","re",
"res","s","se","sse","t","te","ti","tio","tre","tte",
"u","ui","un","une","ur","v","w","x","y","z"];

var german_basic_key = ["a","1","ab","aht","als","am","an","au","auf","b",
"2","be","ben","ber","c","3","ch","che","cht","d",
"4","da","de","den","der","des","di","die","du","e",
"5","ei","ein","el","en","end","er","f","6","g",
"7","ge","gen","h","8","ha","he","hen","i","9",
"ich","ie","in","isc","ist","it","j","0","k","l",
"m","mi","mit","n","nd","nde","ne","no","ns","nur",
"o","ob","p","q","r","rch","re","s","sch","se",
"st","t","te","ten","u","ue","um","un","und","ung",
"v","von","w","war","was","wo","x","y","z","zu"];

var italian_basic_key = ["a","1","al","an","ar","ato","b","2","c","3",
"ca","che","ci","co","d","4","da","de","di","e",
"5","el","en","er","es","et","f","6","g","7",
"gi","h","8","i","9","ia","ic","il","in","ion",
"is","it","j","0","k","l","la","le","li","ll",
"lo","m","ma","me","mi","mo","n","na","ne","ni",
"no","nte","o","ol","on","or","os","p","pa","per",
"pr","q","qu","r","ra","re","ri","ro","s","sa",
"se","si","so","ss","st","t","ta","te","ti","to",
"tr","tt","u","un","v","w","x","y","z","zio"];

var spanish_basic_key = ["a","1","ad","ado","al","aqu","ar","ara","as","b",
"2","c","3","ci","cio","co","con","d","4","de",
"del","di","e","5","ede","el","en","er","es","est",
"f","6","g","7","h","8","hay","i","9","io",
"ist","j","0","k","l","la","las","lo","los","m",
"mas","me","mi","muy","n","nei","no","non","nte","o",
"on","or","os","osa","p","per","por","q","qu","que",
"r","ra","re","res","s","sde","se","ser","si","sin",
"son","st","su","sus","t","ta","te","ti","tu","u",
"ue","un","una","uno","v","va","w","x","y","z"];

var latin_basic_key = ["a", "1", "ad", "ae", "am", "ant", "as", "at", "ati", "atu",
"b", "2", "bus", "c", "3", "con", "cum", "d", "4", "e",
"5", "em", "ent", "equ", "er", "era", "eri", "es", "et", "ex",
"f", "6", "g", "7", "h", "8", "i", "9", "ia", "ibu",
"in", "io", "ion", "is", "iss", "it", "ita", "itu", "j","0", 
"k", "l", "m", "n", "ne", "nt", "o","os","p","per", 
"pro",'q', "qua", "que", "qui", "quo", "r", "ra", "rat", "re",
"ri", "rum", "s", "se", "si", "sse", "str", "t", "ta", "tat",
"te", "ter", "ti", "tis", "to", "tum", "tur", "u","ua", "ui",
"um", "unt", "ur", "us", "ut", "v", "w", "x", "y", "z"];

var basic_key = english_basic_key;
//var basic_key = german_basic_key;
var basic_count = [];
var basic_work_key = [];
var work_key  =  [];
var cipher_type = 1; // known keysquare, unknown coordinates.
var left_col_key = [], right_col_key = [];

// unknown keysquare, fixed crib stuff
var used_symbols = [];
var used_indexs = [];
var free_indexs= [];
var free_symbols= [];
var free_len;
var fixed_crib_len = 0;
// general crib stuff
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


	
function get_trial_decrypt(){
        var i,j,k,x,y,n;
        var c1,c2,c3,c4;
        var n1,k1,n2,k2,index;

    plain_len = 0;
    if ( cipher_type == 1){ // known keysquare
        for (i=0;i<buf_len;i++) {
            n = buffer[i];
            n1 = Math.floor(n/10);
            k1 = left_col_key[n1];
            n2 = n%10;
            k2 = right_col_key[n2];
            n = 10*k1+k2;
            for (j=0;j<basic_count[n];j++)
                plain_text[plain_len++] = work_key[n][j];
        }
    }
    else { // unknown keysquare
        for (i=0;i<buf_len;i++) {
            n = buffer[i];
            index = work_key[n];
            for (j=0;j<basic_count[index];j++)
                plain_text[plain_len++] = basic_work_key[index][j];
        }
    }    

}
function get_score(buf_len){
	var score,i,n;
    var crib_pos,match,y, best_match;
    
	get_trial_decrypt();
	score = 0.0;
    if (crib_flag == 2){ // floating crib
        best_match = 0;
        for ( crib_pos=0;crib_pos<plain_len-crib_len+1;crib_pos++)
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
    /* tetragrams */
    for (i=0;i<plain_len-3;i++) {
        if (plain_text[i]>25 || plain_text[i+1]>25 || plain_text[i+2]>25 || plain_text[i+3]>25 )
            continue;
        index = plain_text[i]+26*plain_text[i+1]
                            +26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
       	score += tet_table[index];
   }
   score = score/(plain_len*plain_len);    
   return(10000*score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s,mut_flag,inx1,inx2,s1,k;
    var used_sym = [], extra;

    debugger;
    // get basic work key & basic v=count for langauge in question
    // to begin fix on english
    for (i=0;i<100;i++)
        basic_count[i] = basic_key[i].length;
    for (i=0;i<100;i++){
        basic_work_key[i] = [];
        for (j=0;j<basic_count[i];j++) {
            c = basic_key[i].charAt(j);
            n = symbols.indexOf(c);
            basic_work_key[i][j] = n;
        }
    }
    buf_len=0;
    var state = 0;
    for (i=0;i<str.length;i++){
   		c = str.charAt(i);
        n = digits.indexOf(c);
        if ( n == -1 ) continue;
        if (state == 0) {
            n1 = n;
            state = 1;
            continue;
        }
        x = n+10*n1;
        state = 0;
        buffer[buf_len++] = x;
    } 
    
    if ( cipher_type == 1){ // known keysquare
        for (i=0;i<100;i++) {
            work_key[i] = basic_work_key[i];
        }
        for (i=0;i<10;i++)
            left_col_key[i] = right_col_key[i] = i;
         // randomize keys
         for (j=9;j>2;j--){
            i = Math.floor(Math.random()*( (j-1)));
            n1 = left_col_key[j];
            left_col_key[j] = left_col_key[i];
            left_col_key[i] = n1;
        }
        for (j=9;j>2;j--){
            i = Math.floor(Math.random()*( (j-1)));
            n1 = right_col_key[j];
            right_col_key[j] = right_col_key[i];
            right_col_key[i] = n1;
        }
            
    }
    else { // unknown keysquare
        if (crib_flag != 1) {// no fixed crib    
            for (i=0;i<100;i++)
                work_key[i] = i;
            // randomize work key
            for (j=99;j>2;j--){
                i = Math.floor(Math.random()*( (j-1)));
                n1 = work_key[j];
                work_key[j] = work_key[i];
                work_key[i] = n1;
            }
            free_len = 100;
            for (i=0; i<free_len;i++)
                free_indexs[i] = i;
        }
        else { //fixed crib
            for (i=0;i<100;i++)
                work_key[i]= -1;
            for (i=0;i<100;i++)
                used_symbols[i]=used_indexs[i]=0;
            // decode crib string.
            //s = crib.split('\n');
            s = crib.split(',');
            fixed_crib_len = parseInt(s[0]);
            for (i=1;i<= fixed_crib_len;i++) {
                s1 = s[i].split(' ');
                n = parseInt(s1[0]);
                k = parseInt(s1[1]);
                work_key[ n ] = k;
                used_indexs[n] = 1;
                used_symbols[k]=1;
            }
            free_len = 0;
            for (i=0;i<100;i++){
                if (used_indexs[i]==1) continue;
                free_indexs[free_len++]=i;
            }
            n=0;
            for (i=0;i<100;i++){
                if (used_symbols[i]==1) continue;
                free_symbols[n++]=i;
            }
            if ( n != free_len) {
                //printf("Free indices and free symbols don't match!\n");
                postMessage("Free indices and free symbols don't match!");
                return;
            }
            n = 0;
            for (i=0;i<100;i++) {
                if ( work_key[i] == -1) {
                    work_key[i] = free_symbols[n++];
                }
            }
        } // end fixed crib        
    }
    if (crib_flag ==2 ){ // floating crib
        crib = crib.toLowerCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            n = symbols.indexOf(c);
            if ( n>=0)
               crib_buffer[crib_len++] = n;
        }
    }
	cycle_limit = 25;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.0;
	noise_step = 5.0;
	noise_level = begin_level;
	cycle_numb = 0;
	max_score = current_hc_score = score = get_score();
	mut_count = 0;
	numb_accepted = 1;
    // post intial decrypt in case crib includes entire plaintext
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<plain_len;i++){
				out_str += symbols.charAt(plain_text[i]);
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on initial trial";
			//out_str += ", fudge factor: "+fudge_factor;
			//out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( cipher_type == 1) {
                out_str += '\nLeft Key: ';
                for (i=0;i<10;i++) 
                    out_str += digits.charAt(left_col_key[i]);
                out_str += '\nRight Key: ';
                for (i=0;i<10;i++) 
                    out_str += digits.charAt(right_col_key[i]);
            }
            else { 
                out_str += "\nKey:\n   0   1   2   3   4   5   6   7   8   9   \n0  ";
                k = 1;
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
                j = 0;
                for (i=0;i<100;i++){
                    if ( used_sym[ i ] ){
                        out_str += basic_key[work_key[i]]+' ';
                        extra = 3-basic_key[work_key[i]].length;
                        if ( extra == 2)
                            out_str += '  ';
                        else if ( extra == 1)
                            out_str += ' ';
                    }
                    else
                        out_str += '-   ';
                    if (++j == 10 ){
                        out_str += '\n';                    
                        if ( k<10) out_str += k+'  ';
                        j=0;
                        k++;
                    }
                }
            }
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
    
    // now do rest of hill-climbing
	for (trial = 0;trial < max_trials;trial++){
        if ( cipher_type == 1 ) { // known keysquare
                n1 = Math.floor(Math.random()*10);
                n2 = Math.floor(Math.random()*10);
                mut_flag = Math.floor(Math.random()*100);
                if ( mut_flag < 50){
                    v1 = left_col_key[n1];
                    v2 = left_col_key[n2];
                    left_col_key[n1]=v2;
                    left_col_key[n2]=v1;
                }
                else {
                    v1 = right_col_key[n1];
                    v2 = right_col_key[n2];
                    right_col_key[n1]=v2;
                    right_col_key[n2]=v1;
                }
        }
        else { // unknown keysquare
            inx1 = Math.floor(Math.random()*free_len);
            inx2 = Math.floor(Math.random()*free_len);
            n1 = free_indexs[inx1];
            n2 = free_indexs[inx2];
            v1 = work_key[n1];
            v2 = work_key[n2];
            work_key[n1]=v2;
            work_key[n2]=v1;
        }
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			j=0;
			for (i=0;i<plain_len;i++){
				out_str += symbols.charAt(plain_text[i]);
			}
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if ( cipher_type == 1) {
                out_str += '\nLeft Key: ';
                for (i=0;i<10;i++) 
                    out_str += digits.charAt(left_col_key[i]);
                out_str += '\nRight Key: ';
                for (i=0;i<10;i++) 
                    out_str += digits.charAt(right_col_key[i]);
            }
            else { 
                out_str += "\nKey:\n   0   1   2   3   4   5   6   7   8   9   \n0  ";
                k = 1;
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
                j = 0;
                for (i=0;i<100;i++){
                    if ( used_sym[ i ] ){
                        out_str += basic_key[work_key[i]]+' ';
                        extra = 3-basic_key[work_key[i]].length;
                        if ( extra == 2)
                            out_str += '  ';
                        else if ( extra == 1)
                            out_str += ' ';
                    }
                    else
                        out_str += '-   ';
                    if (++j == 10 ){
                        out_str += '\n';                    
                        if ( k<10) out_str += k+'  ';
                        j=0;
                        k++;
                    }
                }
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
            if ( cipher_type == 1 ){
                if ( mut_flag < 50){
                    left_col_key[n1]=v1;
                    left_col_key[n2]=v2;
                }
                else {
                    right_col_key[n1]=v1;
                    right_col_key[n2]=v2;
                }
            }
            else {
                work_key[n1]=v1;
                work_key[n2]=v2;
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
    if (s[3] == '0')
        basic_key = english_basic_key;
    else if (s[3] == '1')
        basic_key = french_basic_key;    
    else if (s[3] == '2')
        basic_key = german_basic_key;    
    else if (s[3] == '3')
        basic_key = italian_basic_key; 
    else if (s[3] == '4')
        basic_key = spanish_basic_key;
    else if (s[3] == '5')
        basic_key = latin_basic_key;            
    if (s[4] == '1')
        cipher_type = 1;
    else
        cipher_type = 0;
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
