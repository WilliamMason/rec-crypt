// web worker to search quag key list
importScripts('bigword.js'); 
importScripts('tettable.js'); 


var tet_table = [];

function initialize_tet_table(){
	var i,c,n,v;
	var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	// left out the '[' at the end, may need for 27 char case	

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
/*	
	for ( i = 0; i<27*27*27*27;i++)
		tet27_table[i] = 0.0;
	for ( c in tet27_values){
		n = alpha.indexOf(tet27_values[c].charAt(0))+	27*alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet27_table[n] = v;
	}
*/	
	//postMessage("0tet tables initialized");
}	
initialize_tet_table();

 
 function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
	var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";			
	
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    // initialize tet table
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = 0.0;
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
    //s = 'there were '+max_n+' tetragraphs with greatest value of '+max_v;
    //s += ' for tet: '+mc1+mc2+mc3+mc4;
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
	
 }
 

var buffer = [];
var key_word = [];
var inv_key = [];
var used_let = [];
var key_array = [];
var key_len;
var left_shift = [];
var right_shift = [];
var key_type;
var search_range;

var best_shift;


function search_word_list(b_array){
	var s,n;
    var state,i,c,index;
    var l_alpha = "abcdefghijklmnopqrstuvwxyz";
    
    word_list = []; // remove old.
    // construct word list
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<b_array.length;i++) {
        //c = str.charAt(i);
        n = b_array[i];
        if (n>=65 && n<(65+26)) // upper case
            n -=65;
        else if (n>=97 && n<(97+26)) // lower case
            n -= 97;
        else n = -1;
        //n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            //s = c;
            s = l_alpha.charAt(n);
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += l_alpha.charAt(n);
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;
	

	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;	
	//postMessage(s);
}
 
 function extend_key(){
    var i,indx
    
    for (i=0;i<26;i++) used_let[i] = 0;
    indx =0;
    for (i=0;i<key_len;i++) {
        if (used_let[ key_word[i] ] ==0){
            key_array[indx++] = key_word[i];
            used_let[ key_word[i] ] = 1;
        }
    }
    for (i=0;i<26;i++)
        if (used_let[i] == 0)
            key_array[indx++] = i;
    /* set up inverse key */
    for (i=0;i<26;i++)
        inv_key[ key_array[i] ] = i;                        
}            
 
function get_score(){
        var score;
        var sum, col;
		var cl,cr,c3,c4,pl,pr,p3,p4;
		var n;
		
        best_score = 0;
        buf_len = buffer.length        
        for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                if (key_type == 2) {
                    for (j=0;j<buf_len-3;j++) {
                        cl = buffer[j];
                        cr = buffer[j+1];
                        pl = (inv_key[cl]+kr);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        c3 = buffer[j+2];
                        c4 = buffer[j+3];
                        p3 = (inv_key[c3]+kr);
                        if (p3>=26) p3 -= 26;
                        p4 = (inv_key[c4]+kr);
                        if ( p4 >= 26) p4 -= 26;
						n = pl+26*pr+26*26*p3+26*26*26*p4;
                        //score += logdi[pl][pr];
						score += tet_table[n]
                        ct++;
                    }/* next j */
                }
                else if (key_type == 3) {
                    for (j=0;j<buf_len-3;j++) {
                        cl = buffer[j];
                        cr = buffer[j+1];
                        pl = (inv_key[cl]+kr);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
						c3 = buffer[j+2];
                        c4 = buffer[j+3];
                        p3 = (inv_key[c3]+kr);
                        if (p3>=26) p3 -= 26;
                        p4 = (inv_key[c4]+kr);
                        if ( p4 >= 26) p4 -= 26;
						n = key_array[pl]+26*key_array[pr]+26*26*key_array[p3]+26*26*26*key_array[p4];
						score += tet_table[n]
    						
                        //score += logdi[ key_array[pl] ] [key_array[pr] ];
                        
                        ct++;
                    }/* next j */
                }
                else  { // k1 
                    for (j=0;j<buf_len-3;j++) {
                        cl = buffer[j];
                        cr = buffer[j+1];
                        pl = cl+kr;
                        if (pl>=26) pl -= 26;
                        pr = cr+kr;
                        if ( pr >= 26) pr -= 26;
                        //score += logdi[ key_array[pl] ] [key_array[pr] ];
						c3 = buffer[j+2];
                        c4 = buffer[j+3];
                        p3 = c3+kr;
                        if (p3>=26) p3 -= 26;
                        p4 = cr+kr;
                        if ( p4 >= 26) p4 -= 26;
						n = key_array[pl]+26*key_array[pr]+26*26*key_array[p3]+26*26*26*key_array[p4];
						score += tet_table[n]
                        
                        ct++;
                    }/* next j */
                }
                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
						best_shift = kr;
                 }
        } /* next kr,kl */
		
		
        return(best_score);
} /* end get_score */

function get_plaintext(){
    var k,j,buf_len;
    var s;
    alpha = 'abcdefghijklmnopqrstuvwxyz';
    
    buf_len = buffer.length;
    s = 'Plaintext\n';
    k = 0;
    for (j=0;j<buf_len;j++) {
        if (key_type == 2)
            s += alpha.charAt((inv_key[ buffer[j] ]+best_shift)%26);
        else if (key_type == 3)
            s += alpha.charAt(key_array[ (inv_key[buffer[j]] +best_shift)%26 ]);
        else // quag 1
            s += alpha.charAt(key_array[ (buffer[j] +best_shift)%26 ]);
    }
    return(s);
}
 
function do_search(ciphertext){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var s,i,indx,c,n,j,x;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    debugger;
    s = ciphertext.toLowerCase();
	buffer = [];
    indx = 0;
    for (i=0;i<s.length;i++){
        c = s.charAt(i);
        n = alpha.indexOf(c);
        if ( n >=0) {
            buffer[indx++] = n;
        }
    }
    if ( search_range=='1') {
        start_search = 0;
        end_search = Math.floor(word_list.length/2)+2; // make sure you go far enough
    }
    else if( search_range=='2'){
        start_search = Math.floor(word_list.length/2);
        end_search = word_list.length;
    }
    else { // search all, word list already divided
        start_search = 0;
        end_search = word_list.length;
    }
    best_score = 0;
    for (indx = start_search; indx < end_search; indx++){
        key_len = 0;
        for (i=0;i<word_list[indx].length;i++) {
            c = word_list[indx].charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0) key_word[key_len++] = n;
        }
        extend_key();
        score = get_score();
        if (score> best_score) {
            best_score = score;
            s ="New best key: "+word_list[indx];
            x = best_score.toFixed(2);
            s +='\nscore '+x+'\n';
            s += get_plaintext();
            out_str = '';
            out_str += x+'^'+s
            postMessage(out_str);
        }
    }    
    postMessage('@'); // done signal


}

onmessage = function(event) { //receiving a message with the string to decode. do search
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
    var str;
  debugger;
  var op_choice = event.data.op_choice;
  if ( op_choice==0 || op_choice == 2) {
    str = event.data.str; // string to decode
    s = str.split('@'); // data separated by @ signs: key_type, ciphertext
    key_type = parseInt(s[0]);
    //search_range = s[1];
    do_search(s[1]);
  }
  else  if ( op_choice == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf);
    search_word_list(word_list_array);  // set up word list
  }
  else if (op_choice == 3){ // custom tet table
    str = event.data.str;
    make_table(str);    
  }

};  
    