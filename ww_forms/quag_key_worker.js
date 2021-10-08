// web worker to search quag key list
importScripts('bigword.js'); 

var logdi = new Array(
[4,7,8,7,4,6,7,5,7,3,6,8,7,9,3,7,3,9,8,9,6,7,6,5,7,4],
 [7,4,2,0,8,1,1,1,6,3,0,7,2,1,7,1,0,6,5,3,7,1,2,0,6,0],
 [8,2,5,2,7,3,2,8,7,2,7,6,2,1,8,2,2,6,4,7,6,1,3,0,4,0],
 [7,6,5,6,8,6,5,5,8,4,3,6,6,5,7,5,3,6,7,7,6,5,6,0,6,2],
 [9,7,8,8,8,7,6,6,7,4,5,8,7,9,7,7,5,9,9,8,5,7,7,6,7,3],
 [7,4,5,3,7,6,4,4,7,2,2,6,5,3,8,4,0,7,5,7,6,2,4,0,5,0],
 [7,5,5,4,7,5,5,7,7,3,2,6,5,5,7,5,2,7,6,6,6,3,5,0,5,1],
 [8,5,4,4,9,4,3,4,8,3,1,5,5,4,8,4,2,6,5,7,6,2,5,0,5,0],
 [7,5,8,7,7,7,7,4,4,2,5,8,7,9,7,6,4,7,8,8,4,7,3,5,0,5],
 [5,0,0,0,4,0,0,0,3,0,0,0,0,0,5,0,0,0,0,0,6,0,0,0,0,0],
 [5,4,3,2,7,4,2,4,6,2,2,4,3,6,5,3,1,3,6,5,3,0,4,0,5,0],
 [8,5,5,7,8,5,4,4,8,2,5,8,5,4,8,5,2,4,6,6,6,5,5,0,7,1],
 [8,6,4,3,8,4,2,4,7,1,0,4,6,4,7,6,1,3,6,5,6,1,4,0,6,0],
 [8,6,7,8,8,6,9,6,8,4,6,6,5,6,8,5,3,5,8,9,6,5,6,3,6,2],
 [6,6,7,7,6,8,6,6,6,3,6,7,8,9,7,7,3,9,7,8,9,6,8,4,5,3],
 [7,3,3,3,7,3,2,6,7,2,1,7,3,2,7,6,0,7,6,6,6,0,3,0,4,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0],
 [8,6,6,7,9,6,6,5,8,3,6,6,6,6,8,6,3,6,8,8,6,5,6,0,7,1],
 [8,6,7,6,8,6,5,7,8,4,6,6,6,6,8,7,4,5,8,9,7,4,7,0,6,2],
 [8,6,6,5,8,6,5,9,8,3,3,6,6,5,9,6,2,7,8,8,7,4,7,0,7,2],
 [6,6,7,6,6,4,6,4,6,2,3,7,7,8,5,6,0,8,8,8,3,3,4,3,4,3],
 [6,1,0,0,8,0,0,0,7,0,0,0,0,0,5,0,0,0,1,0,2,1,0,0,3,0],
 [7,3,3,4,7,3,2,8,7,2,2,4,4,6,7,3,0,5,5,5,2,1,4,0,3,1],
 [4,1,4,2,4,2,0,3,5,1,0,1,1,0,3,5,0,1,2,5,2,0,2,2,3,0],
 [6,6,6,6,6,6,5,5,6,3,3,5,6,5,8,6,3,5,7,6,4,3,6,2,4,2],
 [4,0,0,0,5,0,0,0,3,0,0,2,0,0,3,0,0,0,1,0,2,0,0,0,4,4]);
 
 function make_table(str) { // custom log di table
    var s,i,j;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var di_table = [];
//    var weighted_tet_sum, unweighted_tet_sum;    
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toLowerCase();
    alpha = 'abcdefghijklmnopqrstuvwxyz';
    // initialize tet table
    for (i=0;i<26*26;i++)
        di_table[i] = 0;
    // make di table with no blanks
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
            state = 1;
        }
        else {
            x = n1+26*n;
            di_table[x]++;
            n1 = n;
            c1 = c;
        }
        //state++;
    }    
    //s = '0there were '+max_n+' tetragraphs with greatest value of '+max_v;
    //s += ' for tet: '+mc1+mc2+mc3+mc4;
//    weighted_tet_sum = 0;
//    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26;i++){
//        n = di_table[i];
        di_table[i] = Math.log(1+di_table[i]);
        //di_table[i] = Math.sqrt( Math.sqrt(di_table[i]) );
//        weighted_tet_sum += n*di_table[i];
//        unweighted_tet_sum += di_table[i];                            
    }
    // convert to logdi table form.
    logdi = [];
    for (i=0;i<26;i++)
        logdi[i] = [];
    for (i=0;i<26;i++) for (j=0;j<26;j++)
        logdi[i][j] = di_table[i+26*j];
        
    
    // global variables for this tet table
//    random_score = 100*unweighted_tet_sum / (26*26*26*26);
//    std_eng_score = 100*weighted_tet_sum / max_n;
    
    //postMessage(s);    
}    


var period;
var buffer = [];
var key_word = [];
var inv_key = [];
var used_let = [];
var key_array = [];
var key_len;
var left_shift = [];
var right_shift = [];
var quag_type;
var search_range;

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
 
function best_di(col){
/* return best log_di score for all possible digraph keys in column */

        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr;
        var buf_len;
        
        best_score = 0;
        buf_len = buffer.length
        rows = Math.floor(buf_len / period);
        for (kl = 0;kl<26;kl++) for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                if (quag_type == 2){
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[pl][pr];
                        ct++;
                    }/* next j */
                }
                else if (quag_type == 3) {
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ key_array[pl] ] [key_array[pr] ];
                        ct++;
                    }/* next j */
                }
                else { // quag 1
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = cl+kl;
                        if (pl>=26) pl -= 26;
                        pr = cr+kr;
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ key_array[pl] ] [key_array[pr] ];
                        ct++;
                    }/* next j */
                }
                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end best_di */

function extend_di(col){
/* return best log_di score for all possible extensions of digraphs */
/* keys are the same as shifts */
        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr, buf_len;
        
        best_score = 0;
        buf_len = buffer.length        
        rows = Math.floor(buf_len / period);
        kl = right_shift[col-1];// use previous best right as new left
        for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                if (quag_type == 2) {
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[pl][pr];
                        ct++;
                    }/* next j */
                }
                else if (quag_type == 3) {
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = (inv_key[cl]+kl);
                        if (pl>=26) pl -= 26;
                        pr = (inv_key[cr]+kr);
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ key_array[pl] ] [key_array[pr] ];
                        
                        ct++;
                    }/* next j */
                }
                else  { // quag 1
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = cl+kl;
                        if (pl>=26) pl -= 26;
                        pr = cr+kr;
                        if ( pr >= 26) pr -= 26;
                        score += logdi[ key_array[pl] ] [key_array[pr] ];
                        
                        ct++;
                    }/* next j */
                }
                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end extend_di */
 
function get_score(){
        var score;
        var sum, col;
        
        sum = best_di(0);
        for (col = 1;col<period;col++)
            sum += extend_di(col);
        score = sum / period;
        return(score);
} /* end get_score */

function get_plaintext(){
    var k,j,buf_len;
    var s;
    alpha = 'abcdefghijklmnopqrstuvwxyz';
    
    buf_len = buffer.length;
    s = 'Plaintext\n';
    k = 0;
    for (j=0;j<buf_len;j++) {
        if (quag_type == 2)
            s += alpha.charAt((inv_key[ buffer[j] ]+left_shift[k])%26);
        else if (quag_type == 3)
            s += alpha.charAt(key_array[ (inv_key[buffer[j]] +left_shift[k])%26 ]);
        else // quag 1
            s += alpha.charAt(key_array[ (buffer[j] +left_shift[k])%26 ]);
        k = (k+1)%period;
    }
    return(s);
}

function get_vertical_key_possibilities(){
    var k,j,buf_len;
    var s;
    alpha = 'abcdefghijklmnopqrstuvwxyz';

    s = "vertical key candidates\n";
    for (j=0;j<26;j++){
        s += alpha.charAt(j)+": ";
        for (k=0;k<period;k++)
            if (quag_type == 2)
                s += alpha.charAt( key_array[ (j+26-left_shift[k])%26]  );
            else if (quag_type == 3)
                s += alpha.charAt( key_array[ (inv_key[j]+26-left_shift[k])%26] );
            else // quag 1
                s += alpha.charAt(  (inv_key[j]+26-left_shift[k])%26 );
        s += ', ';
    }
    return(s);
}
 
function do_search(ciphertext){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var s,i,indx,c,n,j,x;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    
    s = ciphertext.toLowerCase();
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
            s +='\nscore '+x;
            s+= "\nBest left shifts: ";
            for (j=0;j<period;j++)
                s += ' '+left_shift[j];
                s +="\nbest right shifts: ";
            for (j=0; j<period;j++)
                s += ' '+right_shift[j];
                s +="\n\n";
            s += get_plaintext();
            s += '\n'+get_vertical_key_possibilities();
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
    s = str.split('@'); // data separated by @ signs: quag_type, period, ciphertext
    quag_type = parseInt(s[0]);
    period = parseInt(s[1]);
    search_range = s[2];
    do_search(s[3]);
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
    
