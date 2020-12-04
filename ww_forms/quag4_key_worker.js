// web worker to search quag key list
importScripts('bigword.js'); 
importScripts('tettable.js'); 

var period;
var buffer = [];
var key_word = [];
var inv_key = [];
var used_let = [];
var key_array = [];
var key_len;
var search_range;

var quag_array, inv_array,start_pos;
var crib = [];
var shift = [];
var simple_sub_array = [];

// plain key stuff
var plain_key_flag;
var max_trials = 100000; // max hill-climbing trials
var free_column; // columns in inv_array you can switch for hill-climbing, leaving crib alone.
var hill_climb_flag;

var tet_table = [];

function initialize_tet_table(){
	var i,c,n,v;
    var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
}	
initialize_tet_table();

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
 
function check_crib_match(){
    var errors,i,j,k,rel_shift,x,y,diff,flag;
    
    errors = 0
    shift = []; // global
    shift[0] = 0;
    for (i=1;i<period;i++)
        shift[i] = -1;
    rel_shift = []
    for (i=0;i<period-1;i++){
        rel_shift[i] = [];
        for (j=i+1;j<period;j++)
            rel_shift[i][j] = -1;
    }
    // fill in relative shifts and see if there are any inconsistent
    for (i = 0;i<period-1;i++)
        for ( j = i+1;j<period;j++)
            for (k=0;k<26;k++) {
                if (quag_array[i][k] != -1 && quag_array[j][k] != -1){ // two letters in same column, goto same plain letter
                x = key_array.indexOf(quag_array[i][k]);
                y = key_array.indexOf(quag_array[j][k]);
                diff = (26+x-y)%26;
                if (rel_shift[i][j] == -1)
                    rel_shift[i][j] = diff;
                else if (rel_shift[i][j] != diff)
                    errors++;
            }
    }               
    // now put rel shifts together into absolute shifts, shift[0] = 0 arbitrarily
    flag = 1;
    while(flag == 1 && errors == 0){
        flag = 0;
        for (i = 0;i<period-1;i++)
            for ( j = i+1;j<period;j++) {
            if (rel_shift[i][j] != -1 && shift[i] != -1){
                    diff = (26+ shift[i]+rel_shift[i][j])%26;
                    if (shift[j] == -1) {
                        shift[j] = diff;
                        flag = 1;
                    }
                    else if (shift[j] != diff)
                        errors++;
                }
            else if (rel_shift[i][j] != -1 && shift[j] != -1){
                    diff = (26+ shift[j]-rel_shift[i][j])%26;
                    if (shift[i] == -1) {
                        shift[i] = diff;
                        flag = 1;
                    }
                    else if (shift[i] != diff)
                        errors++;
                }
        }
    } // end while
    // any not filled in?
    for (i=1;i<period;i++)
        if (shift[i] == -1)
            errors++;    
    return(errors);
}    

function get_work_array(){
    var i,j, index,n,k;
    var used_let, work_array;
    
    work_array = []; 
    for (index = 0; index<period;index++){
        work_array[index] = [];
        for (i=0;i<26;i++) 
            work_array[index][i] = quag_array[index][i];
    }
    // fill in all letters for row 0
    used_let = [];
    for (i=0;i<26;i++)
        used_let[i] = 0;
    for (i=0;i<26;i++)
        if ( work_array[0][i] != -1)
            used_let[work_array[0][i]] = 1;
    //fill in letters missing from row 0 that can be deduced from letters in the same column using the shift array
    for (i=0;i<26;i++)
        if ( work_array[0][i] == -1) {// no letter in row 0. Is there a letter in the same column?
            for (index = 1; index<period;index++)
                if ( work_array[index][i] != -1) {
                    j = key_array.indexOf(work_array[index][i]);
                    j = (26+j+shift[index])%26;
                    n = key_array[j];
                    if (used_let[n] == 1) // this letter already occurs in row 0, array inconsistent!
                        return(1); // return error signal
                    used_let[n] = 1;
                    work_array[0][i] = n; // this column now filled in!
                    break;
            }
    }
    // fill in rest of row 0 aribitarily
    n = 0;
    free_column = []; // global variable
    k = 0;
    for (i=0;i<26;i++)
        if ( work_array[0][i] == -1) {
            free_column[k++] = i;
            while( used_let[n] == 1 && n<26) n++;
            work_array[0][i] = n; // don't need to set used_let[n] = 1 since won't consider n again
            n++;
    }
    // fill in rest of work_array using row 0 and shift array
    for (i=0;i<26;i++) {
        n = work_array[0][i];    
        j = key_array.indexOf(n);
        for (index = 1;index<period;index++){
            k = (26+j-shift[index])%26;
            n = key_array[k];
            if (work_array[index][i] == -1)
                work_array[index][i] = n;
            else if ( work_array[index][i] != n) // inconsistent. can this ever happen?
                return(1); // return error
        }
    }
    // construct inverse array for generating simple substitution cipher
    inv_array = []; // global
    if (plain_key_flag) { // just copy work_array
        for (index = 0;index<period;index++){
            inv_array[index] = [];
            for (i=0;i<26;i++)
                inv_array[index][ i ] = work_array[index][i] ;
        }
    }
    else {
        for (index = 0;index<period;index++){
            inv_array[index] = [];
            for (i=0;i<26;i++)
                inv_array[index][ work_array[index][i] ] = i;
        }
    }
    return(0); // no errors
            
}    


function hill_climb_plain_key(){ // plain key inv_array does not yield simple sub, so do hill-climbing to try for practical sol.
    var score, trial,n1,n2,n3,hc_score,x;
    var sum,sum2,ct,ct2,index,i,j,n,k,le;    
    var col_order = [];
    var best_col_order = [];
    var temp = [];
    var mut_count, best_score;
    
    for (i=0;i<26;i++)
        col_order[i] = best_col_order[i] = i;
    hc_score = 0;
    best_score = 0;
    mut_count = 0;
    for (trial = 0; trial<max_trials;trial++){
        n1 = Math.floor(Math.random()*free_column.length);
        n1 = free_column[n1];
        n2 = Math.floor(Math.random()*free_column.length);
        n2 = free_column[n2];
        x = col_order[n1];
        col_order[n1] = col_order[n2];
        col_order[n2] = x;
        index = 0;

        le = buffer.length;
        for (i=0;i<le;i++){
            j = buffer[i];
            n = inv_array[index][col_order[j] ];
            simple_sub_array[i] = n;
            index = (index+1)% period;
        }
        score = 0;
        for (i=0;i<le-3;i++){
            n = simple_sub_array[i]+26*simple_sub_array[i+1]+26*26*simple_sub_array[i+2]+26*26*26*simple_sub_array[i+3];
            score += tet_table[n];
        }
        
        if (score>best_score) {
            best_score = score;
            for (k=0;k<26;k++)
                best_col_order[k] = col_order[k];
        }
        if (score>hc_score) {
            hc_score = score;
            mut_count = 0;
        }
        else {
            mut_count++;
            // swap column order back the way it was
            x = col_order[n1];
            col_order[n1] = col_order[n2];
            col_order[n2] = x;
            if ( mut_count >= 500)
                hc_score = 0; // accept next swap no matter what
        }
    }
    // set inv_array to best column order
    for (index = 0;index<period;index++) {
        temp[index] = [];
        for (i = 0;i<26;i++)
            temp[index][i] = inv_array[index][i];
    }
    for (index = 0;index<period;index++) {
        for (i = 0;i<26;i++)
            inv_array[index][i] = temp[index][best_col_order[i]];;
    }
    return(best_score);

}

function hill_climb_code_key(){ // do hill-climbing on simple sub cipher to try for practical sol.
    var score, trial,n1,n2,n3,hc_score,x;
    var sum,sum2,ct,ct2,index,i,j,n,k,le;    
    var col_order = [];
    var best_col_order = [];
    var temp = [];
    var mut_count, best_score;

    index = 0;
    le = buffer.length;
    for (i=0;i<le;i++){
        j = buffer[i];
        n = inv_array[index][j];
        simple_sub_array[i] = n;
        index = (index+1)% period;
    }
    
    for (i=0;i<26;i++)
        col_order[i] = best_col_order[i] = i;
    hc_score = 0;
    best_score = 0;
    mut_count = 0;
    for (trial = 0; trial<max_trials;trial++){
        n1 = Math.floor(Math.random()*26);
        n2 = Math.floor(Math.random()*26);
        x = col_order[n1];
        col_order[n1] = col_order[n2];
        col_order[n2] = x;
        index = 0;
        for (i=0;i<le;i++){
            temp[i] = col_order[ simple_sub_array[ i ] ];
        }
        score = 0;
        for (i=0;i<le-3;i++){
            n = temp[i]+26*temp[i+1]+26*26*temp[i+2]+26*26*26*temp[i+3];
            score += tet_table[n];
        }
        
        if (score>best_score) {
            best_score = score;
            for (k=0;k<26;k++)
                best_col_order[k] = col_order[k];
        }
        if (score>hc_score) {
            hc_score = score;
            mut_count = 0;
        }
        else {
            mut_count++;
            // swap column order back the way it was
            x = col_order[n1];
            col_order[n1] = col_order[n2];
            col_order[n2] = x;
            if ( mut_count >= 500)
                hc_score = 0; // accept next swap no matter what
        }
    }
    // set simple_sub to best sol
    for (i=0;i<le;i++)
        simple_sub_array[i] = best_col_order[simple_sub_array[i] ];
    return(best_score);

}

function get_score(){
        var score;
        var sum,sum2,ct,ct2,index,i,j,n,k,le;
        
        // check for errors matching crib.
        score = -check_crib_match(); // if no errors, sets shift array
        if ( score < 0 )
            return(score); // no crib match        
        score = -get_work_array(); // if no errors sets inv_array 
        if ( score < 0 )
            return(score); // no crib match

        if (plain_key_flag)
            score = hill_climb_plain_key(); // try to find best inv_array columns
        else if (hill_climb_flag)
            score = hill_climb_code_key(); // try to find best simple sub solution.
        else { // IC+DIC scoring for speed
            ct = []; 
            ct2 = [];
            for (i=0;i<26;i++)
                ct[i] = 0;
            for (i=0;i<26*26;i++)
                ct2[i] = 0;
            index = 0;
            le = buffer.length;
            for (i=0;i<le;i++){
                j = buffer[i];
                n = inv_array[index][j];
                simple_sub_array[i] = n;
                ct[n]++;
                if ( i==0)
                    k = n;
                else {
                    ct2[k+26*n]++;
                    k = n;
                }
                index = (index+1)% period;
            }
            sum = 0; // for IC  
            for (i=0;i<26;i++)
                sum += ct[i]*(ct[i]-1);
            sum2 = 0; // for DIC
            for (i=0;i<26*26;i++)
                sum2 += ct2[i]*(ct2[i]-1);
            sum /= le*(le-1)
            sum2 /= (le-1)*(le-2);
            score = 1000*sum+10000*sum2;        
        }
        return(score);
} /* end get_score */
 
 function setup_quag_array(){
    var i,j,index;
    
    quag_array = [];
    for (i=0;i<period;i++){
        quag_array[i] = [];
        for (j=0;j<26;j++)
            quag_array[i][j] = -1
    }
    index = start_pos % period;
    if (plain_key_flag) {
        for (i=0;i<crib.length;i++){
            if (crib[i]<26) quag_array[index][ buffer[ i+ start_pos ] ] = crib[i];
            index = (index+1)%period;
        }
    }
    else{
        for (i=0;i<crib.length;i++){
            if (crib[i]<26) quag_array[index][ crib[i] ] = buffer[ i+ start_pos ];
            index = (index+1)%period;
        }
    }
}    
 
function do_search(crib_string,ciphertext){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var alpha1 = 'abcdefghijklmnopqrstuvwxyz-';
    var s,i,indx,c,n,j,x;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    
    s = ciphertext.toLowerCase();
    indx = 0;
    buffer = [];
    for (i=0;i<s.length;i++){
        c = s.charAt(i);
        n = alpha.indexOf(c);
        if ( n >=0) {
            buffer[indx++] = n;
        }
    }
    s = crib_string.toLowerCase();
    indx = 0;
    crib = [];
    for (i=0;i<s.length;i++){
        c = s.charAt(i);
        n = alpha1.indexOf(c);
        if ( n >=0) {
            crib[indx++] = n;
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
    setup_quag_array();
    best_score = -10000;
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
            if ( plain_key_flag)
                s ="Best plain key: "+word_list[indx];
            else
                s ="Best code key: "+word_list[indx];
            x = best_score.toFixed(2);
            
            if( plain_key_flag || hill_climb_flag) 
                s +='\nLog tet score '+x+'\nBest decrypt:\n';
            else
                s +='\nIC+DIC score '+x+'\nsimple sub cipher:\n';
            if (score>0) {            
                for (i=0;i<buffer.length;i++) {
                    s += alpha.charAt(simple_sub_array[i]);
                    if ( ((i+1)%80) == 0)
                        s += '\n';
                }
                // show inv_arrray
                
                s += '\n\nInverse array\nABCDEFGHIJKLMNOPQRSTUVWXYZ\n';
                for (index = 0;index<period;index++){
                    for (i=0;i<26;i++)
                        s += alpha.charAt(inv_array[index][i]);
                    s += '\n'
                }
                
            }
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
  var op_choice = event.data.op_choice;
  if ( op_choice==0 || op_choice == 2) {
    var str = event.data.str; // string to decode
    s = str.split('@'); // data separated by @ signs: period,range,start_pos,crib, ciphertext
    period = parseInt(s[0]);
    search_range = s[1];
    if (s[2] == '1')
        plain_key_flag = true;
    else 
        plain_key_flag = false;
    if (s[2] == '2')
        hill_climb_flag = true;
    else
        hill_climb_flag = false;
    start_pos = parseInt(s[3]);
    max_trials = parseInt(s[4]);
    do_search(s[5],s[6]);
  }
  else  if ( op_choice == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf);
    search_word_list(word_list_array);  // set up word list
  }

};  
    