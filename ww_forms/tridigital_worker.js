// tridigital hill-climber, like trihilltet.c, wimpy hill-climbing
// but try new random digit each time instead of swapping two already there.
// analogous to javascript key phrase hill-climber.
// new branch tries both new random and swap options, 50-50 ratio.

importScripts('tet27table.js');
importScripts('bigword.js'); 

var tet27_table = [];
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ[";
var alpha27  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var whitespace="\n\t\r ',-.;=";
var digits27 = '0123456789 ';

var max_trials = 10000000;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var buffer = [];
var crib_buffer = [];
var buf_len, crib_len;
var fix_let = [];
var free_let = [];
var numb_free;
var key_array = [];
var best_score;

var inv_array = [];
var numb_inv = [];

var plain_text = [];
var word_buffer = [];
var best_word_buffer = [];
var best_word_score;

var MAX_MUTATIONS = 2000;
var word_separator;

var word_list_scoring_flag = false;

var trie = new Array();
var max_trie_index;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var CUT_OFF = 2;

//PH hil-climbing
var fudge_factor;
var cycle_length = 20;
var begin_step = 1.0;
var increment_step = 1.5;

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
	
	for (i=0;i<26;i++)
		new_trie_element(i);
	max_trie_index = 26;
	for (i in word_list)
		insert_word(word_list[i]);

}

function initialize_word_list(){
	var str,n;
	
	make_trie();
	n = word_list.length;
	str = "loaded "+n+" words using "+max_trie_index+" trie elements";// don't put zero at beginning
	//document.getElementById('output_area').value = str;	
	postMessage(str);
}

function word_search(n,buf_len){ // n is starting index in word buffer array
	var i,c,current_index;
	var cnt,len;
	
	current_index = word_buffer[n];
	if ( current_index<0 || current_index > 25) return( [0,0]); // maybe parsing an aristocrat and hit blank
	len = trie[current_index][END_OF_WORD_INDEX];
	cnt = 1;
	while( ++n< buf_len){
		c = word_buffer[n];
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



function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<27*27*27*27;i++)
		tet27_table[i] = 0.0;
	for ( c in tet27_values){
		n = alpha.indexOf(tet27_values[c].charAt(0))+	27*alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet27_table[n] = v;
	}
	// var xfer = {};
    // xfer['s2'] = 'test'
    // xfer['s1'] = 'tet table initialized';
	// postMessage(xfer);
}
initialize_tet_table();
initialize_word_list();

function make_custom_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    //s = "0making table from sring of length "+str.length;
    //postMessage(s);
    debugger;
    str = str.toUpperCase();
    // do 27 char tet table
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = 0.0;
    max_n = 0;
    max_v=0;
    state = 0;
    var spaceFlag = 0;
    for (i=0; i<str.length;i++) {
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
            tet27_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet27_table[x] > max_v) {
                max_v = tet27_table[x];
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
    for (i=0;i<27*27*27*27;i++)
        tet27_table[i] = Math.log(1+tet27_table[i]);
    
    //postMessage(s);
}


function space(c){
    var space_chars = ['-','=',' ',',','.','"']
    if (space_chars.indexOf(c) != -1)
        return(true);
    return(false)
}
    
function do_processing(str1,str2){ // str1 code, str2 crib
    var xfer;
    var space_flag, str,i,j,c,n;
    var c1,score,current_hc_score;
    var c2,c3, out_str, mut_count;
    var pos,pos2;
    var op_choice2;
	var cycle_step, current_step,numb_accepted;    
    
    // set up inverse array
    for (i=0;i<26;i++)
        inv_array[i] = [];
    
    str = str1.toUpperCase();
	// global replace of line feeds and carriage returns with blank
    str= str.replace(/[\n\r]/g,' ');
    
    buf_len = 0;
    space_flag = true;
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        if ( space(c) && space_flag)
            continue;
        if ( space(c ) ) {
            space_flag = true;
            buffer[buf_len++] = 26;
        }
        else {
            n = digits27.indexOf(c);
            if ( n == -1) continue;
            space_flag = false;
            buffer[buf_len++] = n;
        }
    }
    if ( buffer[buf_len-1] == 26) buf_len--; // dump any space at end
    str = str2.toUpperCase();
	// global replace of line feeds and carriage returns with blank
    str= str.replace(/[\n\r]/g,' ');
    
    crib_len = 0;
    space_flag = true;
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        if ( c == '-'){ // unknown crib letter
            crib_buffer[crib_len++] = -1;
            space_flag = false;
            continue;
        }
        if ( space(c) && space_flag)
            continue;
        if ( space(c ) ) {
            space_flag = true;
            crib_buffer[crib_len++] = 26;
        }
        else {
            n = alpha27.indexOf(c);
            if ( n == -1) continue;
            space_flag = false;
            crib_buffer[crib_len++] = n;
        }
    }
    if ( crib_buffer[crib_len-1] == 26) crib_len--; // dump any space at end
    if ( crib_len != buf_len){
        xfer = {};
        xfer['s1'] = 'Crib and cipher have different lengths!';
        xfer['s2'] = 10000; // make highest score
        postMessage(xfer);
        return;
    }

    for (i=0;i<26;i++) fix_let[i] = 0;
    for (i=0;i<26;i++) key_array[i] = -1;
    debugger;
	for (j=0; j< crib_len;j++) {
		c = crib_buffer[j];
		if ( c>= 0 && c <26 ) {
			c1 = buffer[j];
			if ( key_array[c] != -1 && key_array[c] != c1 ) {
                // shouldn't happen because worksheet routine checks this
				//printf("Plaintext %c has multiple meanings!\n",c+'a');
				//exit(1);
                xfer = {};
                str = 'plaintext '+alpha27.charAt(c)+' has multiple meanings!'
                xfer['s1'] = str;
                xfer['s2'] = 10000; // make highest score so this message will show
                postMessage(xfer);
                return;
			}
			key_array[c] = c1;
			fix_let[c] = 1;
		}
	} // next j
	// get free letters
	numb_free = 0;
	for (j=0;j<26;j++)
		if ( fix_let[j] == 0)
			free_let[numb_free++] = j;
    // random start
    for (i=0; i<numb_free;i++)
        key_array[ free_let[i] ] = Math.floor(Math.random()*10);
    best_score = -1000;
    debugger;
    score = current_hc_score = get_score();
    out_str = 'Plaintext\n';
    for (i=0;i<buf_len;i++)
        out_str += alpha27.charAt(plain_text[i]).toLowerCase();
    xfer = {};
    xfer['s1'] = out_str;
    xfer['s2'] = ''+score.toFixed(2);

	cycle_step = 0;
	current_step = begin_step;
	numb_accepted = 1;
   
    
    // postMessage(xfer);
    for ( trial = 0;trial<max_trials;trial++){
        op_choice2 = Math.floor(Math.random()*100);
        pos = Math.floor(Math.random()*numb_free);
        c3 = key_array[ free_let[pos] ];
        if (op_choice2 <= 50){ // new random element
            key_array[ free_let[pos] ] = Math.floor(Math.random()*10);
        }
        else { // swap two key elements
            pos2 = Math.floor(Math.random()*numb_free);
            c2 = key_array[ free_let[pos2] ];
            key_array[ free_let[pos] ] = c2;
            key_array[ free_let[pos2] ] = c3;
        }
        score = get_score();
        if ( score > best_score){
            best_score = score;
            n = score.toFixed(2);
            //out_str = "Tridigital plaintext:\n"
            out_str = '';
            for (i=0;i<buf_len;i++)
                out_str += alpha27.charAt(plain_text[i]).toLowerCase();
            out_str += '\ntridigital key\nabcdefghijklmnopqrstuvwxyz\n';
            for (i=0;i<26;i++)
                out_str += digits27.charAt(key_array[i]);
            out_str += "\nscore: "+n+" on trial: "+trial +" fudge factor: "+fudge_factor;
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
            out_str += " % accepted: "+v;
            // if ( word_scoring_flag)
                // out_str += " word scoring is ON"
            // else
                // out_str += " word scoring is OFF"
            xfer["s1"] = out_str;
            xfer["s2"] = ''+n;
            postMessage(xfer);
        }
		if ( score > current_hc_score - fudge_factor*buf_len/current_step){
			current_hc_score = score;
			numb_accepted++;
			//mut_count = 0;
		}        
        else { // restore
            mut_count++;
            key_array[ free_let[pos] ] = c3;
            if ( op_choice2 > 50) // complete rest of unswap
                key_array[ free_let[pos2] ] = c2;
        } // end else
		current_step += increment_step;
		if ( ++cycle_step > cycle_length){
			current_step = begin_step;
			cycle_step = 1;
		}
        
    } // next trial
    //xfer = {};
    xfer["s2"] = "Done";
    postMessage(xfer);
}

function get_inverse(){
       var j,k;
       var c;

        for (j=0;j<10;j++){
            numb_inv[j] = 0;
            for (k=0;k<26;k++)
                inv_array[j][k] = 0;
        }
        for (j=0;j<10;j++) for (k=0;k<26;k++)
                if ( key_array[k] == j ) inv_array[j][ numb_inv[j]++] = k;

} // end get_inverse

function word_score(len) {
	var j,index,n;
	var score;
	score = 0;
    //if ( len ==1 ) return(1); // no tetragraphs
    // tetragrams
    for (j=0;j<len+2-3;j++) {
        index = word_buffer[j]+27*word_buffer[j+1]
            +27*27*word_buffer[j+2]+27*27*27*word_buffer[j+3];
        score += tet27_table[index];
    }
    if ( word_list_scoring_flag){
        n = word_search(1,len+2)[0]; // word starts at pos 1, pos 0 is a blank
        if ( n == len) score += n*n; // word has correct length
    }
    return(score);
} /* end word_score */


/* get best word with length len for ciphertext starting at p.
Recursive, depth is current stack depth.
Put best word into word_buffer */
function get_word(p_index,len, depth){
    var j,k,n,sum;
	var c;
	var score;


    if (depth == 0) {
        // starting, put dummy word into buffer
        for (j=0;j<len+2;j++) {
            word_buffer[j]  = 26;
            best_word_buffer[j] = 25; // all z's
		}
		best_word_score = -1;
    }
	c = buffer[p_index + depth];
	if ( numb_inv[c]==0) {
		best_word_score = -1;
		return;
	}
    if ( depth == len-1) { // on last letter
        if (crib_buffer[p_index+depth] != -1) {
                word_buffer[depth+1] = crib_buffer[p_index+depth];
                score = word_score(len);
                if ( score > best_word_score) {
                    best_word_score = score;
                    for (k=0;k<len+2;k++)
                        best_word_buffer[k] = word_buffer[k];
                }
        }
        else {
            for (j=0;j<numb_inv[c];j++){ // try all possible letters
                word_buffer[depth+1] = inv_array[c][j];
                score = word_score(len);
                if ( score > best_word_score) {
                    best_word_score = score;
                    for (k=0;k<len+2;k++)
                        best_word_buffer[k] = word_buffer[k];
                }
            } // next j
        }
		return;
    } // end if
    // in middle of word, any possibilities for part of longer word?
    if (crib_buffer[p_index+depth] != -1) {
            word_buffer[depth+1] = crib_buffer[p_index+depth];
            get_word(p_index,len,depth+1);
    }
    else {
        for (j=0;j<numb_inv[c];j++) {
            word_buffer[depth+1] = inv_array[c][j];
            get_word(p_index,len,depth+1);
        } /* next j */
    }
} // end get_word

function get_score() {
    var p_index; // index into buffer
    var index,count,j,k,len;
    var score;
    var match,best_match,i;
	var sum;

	get_inverse();
    p_index = 0;
    index = 0;
    count = 0;
    score = 0;
    while(p_index < buf_len) {
        len = 0;
        while ( buffer[p_index+len] != 26 && p_index+len < buf_len) len++;
        get_word(p_index,len,0);
        for (j=0;j<len;j++)
            plain_text[index+j] = best_word_buffer[j+1];
        p_index += len+1;
        index += len;
        plain_text[index++] = 26;
        count++;
		score += best_word_score;
    }
	sum = 0;
	for (j=0;j<crib_len;j++)
		if ( crib_buffer[j] == plain_text[j])
			sum++;
	score += 100*sum;
    return(score);
} // end get_score




onmessage = function(event) { //receiving a message with the string to decode. do search
    var str1,str2,op_choice;
    op_choice = event.data.op_choice;
    if ( op_choice == 'solve'){
        str1 = event.data.str1;
        str2 = event.data.crib;
        max_trials = parseInt(event.data.max_trials);
        word_separator = event.data.separator;
        word_list_scoring_flag = event.data.word_scoring;
        fudge_factor = parseFloat(event.data.fudge_factor);        
        do_processing(str1,str2);
    }
    else if ( op_choice == 'make_table'){
        str1 = event.data.str1;
        make_custom_table(str1);
    }
};
