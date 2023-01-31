// PH hill-climber with log pent plus word-list / phrase list scoring
//importScripts('tettable.js');
importScripts('english_pent_base64.js'); 
importScripts('bigword_plus_tiny_phrases_cvs.js'); 


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
var key_len;

// trie stuff
var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

var pent_table = [];


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
// for known coordinates
var basic_digit_pos = [];
var basic_a_j_pos = [];

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

var used_sym = []; // make global for work_key scoring
var key_weight = 1.5; // weight for work_key_scorint

function new_trie_element(indx){
	var i;
	
	trie[indx] = new Array();
	for ( i=0;i<26;i++)
		trie[indx][i] = EMPTY;
	trie[indx][END_OF_WORD_INDEX] = 0;
}

function insert_word(wrd){
	var i,j,c,n;
	var current_index,next_index;

	c = wrd.charAt(0);
	n = l_alpha.indexOf(c);
	if ( n == -1) return;
	current_index = n;
	if (wrd.length == 1){
		trie[n][END_OF_WORD_INDEX] = 1;
		return;
	}
	for (i=1;i<wrd.length;i++){
		c = wrd.charAt(i);
		n = l_alpha.indexOf(c);
		if ( n == -1) continue; // skip dashes and apostophes, if they haven't already been removed
		next_index = n;
		if (trie[current_index][next_index] == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][next_index] = max_trie_index;
			max_trie_index++;
		}
		current_index = trie[current_index][next_index];
	}
	trie[current_index][END_OF_WORD_INDEX] = 1;
}

function make_trie(){
	var i;
    var s;
	
	for (i=0;i<26;i++)
		new_trie_element(i);
	max_trie_index = 26;
    s = word_list.split(',');
	for (i =0;i<s.length;i++)
		insert_word(s[i]);

}

function initialize_word_list(){
	var str,n;
	
	make_trie();
	n = word_list.length;
	str = "00~loaded "+n+" words using "+max_trie_index+" trie elements";// don't put zero at beginning
	//document.getElementById('output_area').value = str;	
	postMessage(str);
}

function word_search(n,buf_len){ // n is starting index in plain_text array
	var i,c,current_index;
	var cnt,len;
	
	current_index = plain_text[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	cnt = 1;
	while( ++n< buf_len){
		c = plain_text[n];
		if (c<0 || c>25) break; // maybe parsing an aristocrat and hit blank
		if ( trie[current_index][c] == EMPTY)
			break;
		cnt++;
		current_index = trie[current_index][c];
		if ( trie[current_index][END_OF_WORD_INDEX] == 1) // found word!
			len = cnt;
	}
	return( [len,cnt] );//return length of longest word, and how many letters you could go in trie
}

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
initialize_word_list();
initialize_pent_table();

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

function score_work_key(){
var i,j,k,c,n,s;
var modified_work_key = [];
// delete digit pairs that are not in ciphertext from work_key;
/*
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
*/				
                for (i=0;i<100;i++){
                    if ( used_sym[ i ] ){ // used sym now global;
                        //out_str += basic_key[work_key[i]]+' ';
						modified_work_key[i] = work_key[i];
                    }
                    else
                        modified_work_key[i] = -1; // i doesn't appear in the ciphertext 
                }
				
				//return( modified_work_key );
var row, col,score,x,y;
var processed = [];
score= 0;
for (row = 0; row<10;row++){
	for (x=0;x<10;x++)
		processed[x] = false;
	for (col = 0;col<10;col++){
		if ( processed[10*row+col] )
			continue;
		if ( modified_work_key[10*row+col] == -1){ // 10*row+col never appears in the ciphertext
			processed[10*row+col] = true; // can forget this one
			continue;
		}
		processed[10*row+col] = true;
		// see if symbols to the right of col coordinate are in same row or adjacent rows
		x = Math.floor(modified_work_key[10*row+col] / 10 ); // row number of  work_key[ 10*row+col]
		for (j = col+1;j < 10;j++){
			if ( processed[10*row+j] )
				continue;
			y = Math.floor(modified_work_key[10*row+j] / 10 ); // row number of  work_key[ 10*row+j]
			if ( y == -1)
				continue;	
			if ( y == x){ // in same row of basic key table
				processed[10*row+j] = true;
				score += 2; // 2 points for each symbol in the same row of the basic_key_table
				continue;
			}
			if ( y-1 == x || y+1 == x) // in basic key table row immediately above or immediately below row x
				score += 1; // 1 point for a symbol in the row above of below row x
		}
	}	

}

return(  score )

/*
Future possibilities:
(1) always throw out the score of the lowest scoring row, as it is likely to be the key row.
(2) Add a score for columns analogous to the score for rows. This might not add too much to the effectiveness of the algorithm because
	while the key word probably lies entirely one one row, it will certainly spread across several columns. But might be worth a 
	try if we hit a particularly hard syllabary.
*/
}


function get_score(){
	var score,i,n;
	var word_score,pos,bad_count;
	var w_len;
	var work_key_score;
    
	get_trial_decrypt();
	// get pentagraph score
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
	
	for (i=0;i<buf_len-4;i++){
		if (plain_text[i]>25 || plain_text[i+1]>25 || plain_text[i+2]>25 || plain_text[i+3]>25|| plain_text[i+4]>25 )
            continue;
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3]
            +26*26*26*26*plain_text[i+4];
		score += pent_table[n];
	}

	// get word list score
	pos = 0;
	bad_count = 0;
	word_score = 0;
	while(pos<buf_len){
		n =word_search(pos,buf_len)[0];
		if ( n> CUT_OFF){
			word_score += n*n - bad_count*bad_count;
			bad_count = 0;
			pos += n;
		}
		else {
			pos++;
			if ( n==0)
				bad_count++;
		}
	}
	word_score -= bad_count*bad_count;
	score += word_score;
   score = score/(plain_len*plain_len);   // plaintext may have variable length 
   // get work_key_score if key_weight is not zero
   if (key_weight > 0)
	   work_key_score = key_weight*score_work_key();
   else
	   work_key_score = 0;
	   
   return(10000*score+work_key_score);
   //return(10000*score);
    
//	return(score);
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
    var  extra;
	var op_choice,max_key_len;

    debugger;
    // get basic work key & basic v=count for langauge in question
    // to begin fix on english
	basic_digit_pos = [];
	basic_a_j_pos = [];
    for (i=0;i<100;i++)
        basic_count[i] = basic_key[i].length;
    for (i=0;i<100;i++){
        basic_work_key[i] = [];
        for (j=0;j<basic_count[i];j++) {
            c = basic_key[i].charAt(j);
            n = symbols.indexOf(c);
            basic_work_key[i][j] = n;
			if (n >25) {// digit
				basic_digit_pos.push(i);
				k = i-1;
				basic_a_j_pos.push(k);
			}
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
	// for work key score, only use symbols that actually appear in the ciphertext
    for (i=0;i<100;i++) used_sym[i] = false;
    for (i=0;i<buffer.length;i++)
         used_sym[ buffer[i] ] = true;
    
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
    else if ( cipher_type == 2){ // known coordinates
		//var key_len = 10;
		
        if (crib_flag != 1) {// no fixed crib    
            for (i=0;i<100;i++)
                work_key[i] = i;
            // randomize work key
			var key_array = [];
			//key_array = work_key.slice(0); // make separate from work key
			// leave digit positions out of key_array
			n = 0;
			j = basic_digit_pos[n];
			for (i=0;i<100;i++){
				if ( i == j){
					n += 1;
					j = basic_digit_pos[n]
					continue;
				}
				key_array.push(i);
			}
			if (key_array.length != 90)
				console.log('key array does not have length 90');
            for (j=key_len;j>0;j--){
                i = Math.floor(Math.random()*( (j-1)));
                n1 = key_array[j];
                key_array[j] = key_array[i];
                key_array[i] = n1;
            }
				
            free_len = 100;
            for (i=0; i<free_len;i++)
                free_indexs[i] = i;
			var used_let = [];
			var old_key_len;
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
				/*
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
				*/
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
		else if ( cipher_type == 2 ) { //known coordinates
			//max_key_len = 20;
			//op_choice = Math.floor(Math.random()*100)
			//if ( op_choice <75){
				inx1 = Math.floor(Math.random()*key_len);
				inx2 = Math.floor(Math.random()*key_array.length);
				v1 = key_array[inx1];
				v2 = key_array[inx2];
				key_array[inx1]= v2;
				key_array[inx2] = v1;
				used_let = [];
				for (i=0;i<100;i++)
					used_let[i] = 0;
				n = 0;
				for (i=0;i<key_len;i++){
					work_key[n] = key_array[i];
					used_let[ key_array[i] ] = 1;
					for (k=0;k<10;k++){
						if (work_key[n] == basic_a_j_pos[k]){
							n++;
							work_key[n] = basic_digit_pos[k];
							used_let[ work_key[n] ] = 1;
						}
					}
					n++;

				}
				//n = key_len;
				for (i=0;i<100;i++)
					if (used_let[i] == 0)
						work_key[n++] = i;
			//}
		}
        else { // unknown keysquare, unknown coordinates
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
			else if ( cipher_type == 2) {
                out_str += "\nKey:\n   0   1   2   3   4   5   6   7   8   9   \n0  ";
                k = 1;
				/*
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
				*/
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
            else { 
                out_str += "\nKey:\n   0   1   2   3   4   5   6   7   8   9   \n0  ";
                k = 1;
				/*
                for (i=0;i<100;i++) used_sym[i] = false;
                for (i=0;i<buffer.length;i++)
                    used_sym[ buffer[i] ] = true;
				*/
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
			// temporary show work_key _score
			//document.getElementById('output_area').value = out_str;	
			var work_key_score = score_work_key();
			out_str += '\nwork key score: '+work_key_score;
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
			else if ( cipher_type == 2 ) {
				//if (op_choice < 75) {
					key_array[inx1] = v1;
					key_array[inx2] = v2;
				///}
				//else
					//key_len = old_key_len;
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

	debugger;
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
	else if (s[4] == '2')
		cipher_type = 2;
    else
        cipher_type = 0;
	key_weight = parseFloat(s[5]);
	key_len = parseInt(s[6]);
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
