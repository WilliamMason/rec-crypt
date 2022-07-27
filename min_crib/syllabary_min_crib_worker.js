// find crib of minimum length that has a unique property, default property: only one place it will fit
// or only one place with selected minimum number of repeated symbols.
// also can specify minimum percent of plaintext covered by letters in the crib.

var symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var code;
var plain =[];
var original_plain = [];
var crib = [];
var freq;
var code_array;
var minimum_repeats, min_coverage;

var skip_index; // number of letters at the beginning of plaintext to skip
var min_crib_len, min_pos, min_rep;
var starting_crib_len;

var known_keysquare_flag = false;
var caesar_shift_flag = false;
var crib_str;
var digits = '0123456789';
var EMPTY = '-1';
var FAIL = [-1,-1];


var basic_key;




function do_calc(){
	var str, alpha,out_str,c,n,cnt,i,j;
    var current_pos,crib_len,numb_positions,start_pos;
    var match_pos,nr;
    var result, cov, current_coverage;
    var caesar_shift

	alpha="abcdefghijklmnopqrstuvwxyz0123456789";
	out_str="";
    if (caesar_shift_flag){ // original_plain is caesar_shifted by 5.
        plain = [];
        caesar_shift = 5;
        // undo caesar_shift
        for (i=0;i<original_plain.length;i++){ // original plain transmitted in numerical form
            c = original_plain[i];
            //n = alpha.indexOf(c);
            if (c>=0 && c<26)
                plain[i] =  (26+c-caesar_shift)%26 ; 
            else
                plain[i] = c; // may be an ascii digit, those are in clear because of error in original caesar-shift
        }
    }
    else 
        plain = original_plain;
    min_crib_len = plain.length;
    starting_crib_len = 5;
    nr = 0;
    for ( current_pos = skip_index; current_pos < plain.length-starting_crib_len+1;current_pos++){
        for ( crib_len = starting_crib_len;crib_len< min_crib_len+1; crib_len++) {
            crib_str = ''; //global var
            for (i=0;i<crib_len;i++){
                crib_str += alpha.charAt(plain[i+current_pos]);
            }
                
            numb_positions = 0;
            for (start_pos=0;start_pos< code_array.length-Math.floor(crib_str.length/3)+1; start_pos++){
                
                result =test_pos(start_pos,crib_len);
                n = result[0];
                cov = result[1];               

                if ( n>= minimum_repeats ){
	                if (++numb_positions > 1 )// crib fits in more than one place
	                	break;
	                nr = n;// number of repeats
	                match_pos = start_pos;
                    current_coverage = Math.floor(cov);
                }
            }
            if (numb_positions == 1 && current_coverage >= min_coverage){ // OK!
	            if (crib_len<=min_crib_len){ // include same minimum length, the nearer the end of the text the better
		            min_crib_len = crib_len;
		            min_pos = current_pos;
		            min_rep = nr;
	            	temp_str = "New min crib length is "+min_crib_len+" at plain position "+min_pos+", and code position "+match_pos+", with "+nr+" repeats and "+current_coverage+" percent coverage\n==>  ";
                    for (j=min_pos;j<min_pos+min_crib_len;j++)
                        temp_str += alpha.charAt(original_plain[j]); // original plain may be caesar_shifted.
                    temp_str += "\n";
                    out_str += temp_str;
                    xfer = {};
                    xfer["s1"] = "temp";
                    xfer["s2"] = temp_str;
                    postMessage(xfer);
	            }
	            break;
            }
        }
    }
    //document.getElementById('output_area').value = out_str;
    xfer = {};
    xfer["s1"] = "final";
    xfer["s2"] = out_str;
    postMessage(xfer);
    
}

function known_keysquare_check(keysquare){
    var i,j,k,n,c,c1;
    var b_row1,b_row2,b_col1,b_col2;
    var k_row1,k_row2,k_col1,k_col2;
    var n1,n2;
    
    for (n = 0;n<99;n++){
        // find next non-eimpty keysquare entry
        k_row1 = Math.floor(n/10);
        k_col1 = n % 10;
        c = ''+k_row1+k_col1;
        if ( keysquare[c] == EMPTY)
            continue;
        // find entries to compare against this one.
        for ( k = n+1;k<100;k++){
            k_row2 = Math.floor(k/10);
            k_col2 = k % 10;
            c1 = ''+k_row2+k_col2;
            if ( keysquare[c1] == EMPTY)
                continue;
            // OK have two non-empty key entries to compare with basic key
            n1 = basic_key.indexOf( keysquare[c] );
            n2 = basic_key.indexOf( keysquare[c1] );
            b_row1 = Math.floor(n1/10);
            b_col1 = n1 % 10;
            b_row2 = Math.floor(n2/10);
            b_col2 = n2 % 10;
            if ( (k_row1 == k_row2) != (b_row1 == b_row2) )
                return(false); // keysquare and basic key rows don't match
            if ( (k_col1 == k_col2) != (b_col1 == b_col2) )
                return(false); // keysquare and basic key columns don't match
        } // next k
    } // next n
    return(true); // passed all matching tests
}

function do_check(cipher_start_pos,current_cipher_pos,current_crib_pos,current_keysquare){
    var i,j,k,c,n, ct,pt;
    var used_symbols, newsquare;
    var temp_str,cnt,flag,x;
    // code_array, crib_str, out_str are global
    
    if ( current_cipher_pos >= code_array.length-1) // past end of cipher!, last element in code_array is not a digit pair
        return(FAIL);
    if ( known_keysquare_flag){
      if (!known_keysquare_check(current_keysquare))
        return(FAIL); // inconsistent with basic key
    }
    ct = code_array[current_cipher_pos];
    if ( current_keysquare[ct] != EMPTY){
        pt = current_keysquare[ct];
        if ( current_crib_pos+pt.length > crib_str.length ) { // pt sticks out past crib
            var x = current_crib_pos+pt.length - crib_str.length; // reduce pt to fit within crib
            pt = pt.slice(0,pt.length-x)
        }
        if ( pt != crib_str.slice(current_crib_pos,current_crib_pos+pt.length) )
            return(FAIL); // no match
        if (current_crib_pos+pt.length >= crib_str.length) {// end of crib!
            // check for repeats
            cnt = 0;
            for (i=cipher_start_pos;i<current_cipher_pos;i++)
                for (j=i+1;j<=current_cipher_pos;j++)
                    if (code_array[i] == code_array[j])
                        cnt++;
            
            if ( cnt < minimum_repeats)
                return([cnt,0] );
            x = 0;
            for (i=0;i<10;i++) for (j=0;j<10;j++){
                c = ''+i+j; // convert to digit string
                if (current_keysquare[c] != EMPTY &&  c in freq )
                    x += freq[c];
            }
                
            return( [ cnt,100*x/code_array.length ] );
        }
        // not at end, make recursive call
        n = do_check(cipher_start_pos,current_cipher_pos+1,current_crib_pos+pt.length,current_keysquare);
        return(n);
    } // end keysquare has entry at current position
    // OK keysquare is empty at current code pos. which letters, digtraphs and trigraphs have been used?
    used_symbols = {};
    for (i=0;i<10;i++) for (j=0;j<10;j++){
        c = ''+i+j; // convert to digit string
        if (current_keysquare[c] != EMPTY)
            used_symbols[ current_keysquare[c] ] = c;
    }
    // try using single letter at current crib pos
    pt = crib_str.charAt(current_crib_pos);
    if ( !(pt in used_symbols) ){
        newsquare = [];
        for (i=0;i<10;i++) for (j=0;j<10;j++){
            c = ''+i+j; // convert to digit string
            newsquare[c] = current_keysquare[c];
        }
        newsquare[ct] = pt; // adding single letter
        // at end of crib?
        if (current_crib_pos+ 1 >= crib_str.length) {// end of crib!
            // check for repeats
            cnt = 0;
            for (i=cipher_start_pos;i<current_cipher_pos;i++)
                for (j=i+1;j<=current_cipher_pos;j++)
                    if (code_array[i] == code_array[j])
                        cnt++;
            if ( cnt<minimum_repeats)
                return([cnt,0] );
            x = 0;
            for (i=0;i<10;i++) for (j=0;j<10;j++){
                c = ''+i+j; // convert to digit string
                if (newsquare[c] != EMPTY &&  c in freq )
                    x += freq[c];
            }
                
            return( [ cnt,100*x/code_array.length ] );
                
        }
        else { // not at end of crib make recursive call
            n = do_check(cipher_start_pos,current_cipher_pos+1,current_crib_pos+1,newsquare);
            if ( n[0]>=0) return(n);
        }
    } // end pt not in used symbols
    else if (current_crib_pos+ 1 >= crib_str.length) { // at end of crib'
          // pt letter is used but maybe digraph or trigraph starting with same letter is free
          flag = true; // nothing found yet
          // may be digraphs and trigraphs stating with letter pt that can also be used at end of cipher instead
          n = basic_key.indexOf(pt);
          i = symbols.indexOf(pt);
          if ( i<=9) n++; //skip over the number next to pt in basic key if pt is less than 'k'
          n++;
          while (n<100 && basic_key[n].charAt(0) == pt ){
            if (!(basic_key[n] in used_symbols)) { // found one!
                if (flag) {// first one found
                    // check for repeats
                    cnt = 0;
                    for (i=cipher_start_pos;i<current_cipher_pos;i++)
                        for (j=i+1;j<=current_cipher_pos;j++)
                            if (code_array[i] == code_array[j])
                                cnt++;
                    if ( cnt<minimum_repeats)
                        return([cnt,0] );
                    newsquare = [];
                    for (i=0;i<10;i++) for (j=0;j<10;j++){
                        c = ''+i+j; // convert to digit string
                        newsquare[c] = current_keysquare[c];
                    }
                    newsquare[ct] = basic_key[n]; // add it to table
                        
                    x = 0;
                    for (i=0;i<10;i++) for (j=0;j<10;j++){
                        c = ''+i+j; // convert to digit string
                        if (newsquare[c] != EMPTY &&  c in freq )
                            x += freq[c];
                    }
                        
                    return( [ cnt,100*x/code_array.length ] );
                }
            }
            n++;
        }
        return(FAIL);
        
    }
    // is a digraph possible
    pt = crib_str.slice(current_crib_pos,current_crib_pos+2);
    if ( basic_key.indexOf(pt) != -1 && !(pt in used_symbols) ){
        newsquare = [];
        for (i=0;i<10;i++) for (j=0;j<10;j++){
            c = ''+i+j; // convert to digit string
            newsquare[c] = current_keysquare[c];
        }
        newsquare[ct] = pt; // adding digraph
        // at end of crib?
        if (current_crib_pos+ 2 >= crib_str.length) {// end of crib!
            // check for repeats
            cnt = 0;
            for (i=cipher_start_pos;i<current_cipher_pos;i++)
                for (j=i+1;j<=current_cipher_pos;j++)
                    if (code_array[i] == code_array[j])
                        cnt++;
            if ( cnt<minimum_repeats)
                return([cnt,0] );
            x = 0;
            for (i=0;i<10;i++) for (j=0;j<10;j++){
                c = ''+i+j; // convert to digit string
                if (newsquare[c] != EMPTY &&  c in freq )
                    x += freq[c];
            }
                        
            return( [ cnt,100*x/code_array.length ] );
        }
        else {// not at end of crib make recursive call
            n = do_check(cipher_start_pos,current_cipher_pos+1,current_crib_pos+2,newsquare);
            if ( n[0]>=0) return(n);
        }
    }
    else if (current_crib_pos+ 2 >= crib_str.length) { // at end of crib'
          // pt digraph is used but maybe  trigraph starting with same letters is free
          flag = true; // nothing found yet
          // may be trigraphs stating with digrqaph pt that can also be used at end of cipher instead
          n = basic_key.indexOf(pt);
          n++;
          while (n<100 && basic_key[n].slice(0,2) == pt ){
            if (!(basic_key[n] in used_symbols)) { // found one!
                if (flag) {// first one found
                    // check for repeats
                    cnt = 0;
                    for (i=cipher_start_pos;i<current_cipher_pos;i++)
                        for (j=i+1;j<=current_cipher_pos;j++)
                            if (code_array[i] == code_array[j])
                                cnt++;
                    if ( cnt<minimum_repeats)
                        return([cnt,0] );
                    newsquare = [];
                    for (i=0;i<10;i++) for (j=0;j<10;j++){
                        c = ''+i+j; // convert to digit string
                        newsquare[c] = current_keysquare[c];
                    }
                    newsquare[ct] = basic_key[n]; // add it to table
                        
                    x = 0;
                    for (i=0;i<10;i++) for (j=0;j<10;j++){
                        c = ''+i+j; // convert to digit string
                        if (newsquare[c] != EMPTY &&  c in freq )
                            x += freq[c];
                    }
                                
                    return( [ cnt,100*x/code_array.length ] );
                    
                }
            }
            n++;
        }
        return(FAIL);
    }
    
    // is a trigraph possible
    pt = crib_str.slice(current_crib_pos,current_crib_pos+3);
    if ( basic_key.indexOf(pt) != -1 && !(pt in used_symbols) ){
        newsquare = [];
        for (i=0;i<10;i++) for (j=0;j<10;j++){
            c = ''+i+j; // convert to digit string
            newsquare[c] = current_keysquare[c];
        }
        newsquare[ct] = pt; // adding trigraph
        // at end of crib?
        if (current_crib_pos+ 3 >= crib_str.length) {// end of crib!
            // check for repeats
            cnt = 0;
            for (i=cipher_start_pos;i<current_cipher_pos;i++)
                for (j=i+1;j<=current_cipher_pos;j++)
                    if (code_array[i] == code_array[j])
                        cnt++;
            if ( cnt<minimum_repeats)
                return([cnt,0] );
            x = 0;
            for (i=0;i<10;i++) for (j=0;j<10;j++){
                c = ''+i+j; // convert to digit string
                if (newsquare[c] != EMPTY &&  c in freq )
                    x += freq[c];
            }
                        
            return( [ cnt,100*x/code_array.length ] );
            
        }
        else {// not at end of crib make recursive call
            n = do_check(cipher_start_pos,current_cipher_pos+1,current_crib_pos+3,newsquare);
            return(n);
        }
    }
    return(FAIL);
} // end do_check



function test_pos(start_pos,crib_len){
    var j,k,index;
    var c,c1,c2,c3;
    var count,reps,coverage;
    var s,i,c,n;
    var cipher_start_pos, keysquare,x;

    
        keysquare = [];
        for (i=0;i<10;i++) for (j=0;j<10;j++){
            c = ''+i+j; // convert to digit string
            keysquare[c] = EMPTY
        }
        x = do_check(start_pos,start_pos,0,keysquare);
        if ( x[0]>=0) return(x);
        // check for inital letter as suffix of digraph or trigraph
        for (n in basic_key){
          k = basic_key[n].length;
          c1 = basic_key[n].charAt(k-1); // last char in string
          if (k>1 && c1 == crib_str.charAt(0)) { // found key string with first crib char as suffix
            keysquare = [];
            for (i=0;i<10;i++) for (j=0;j<10;j++){
               c = ''+i+j; // convert to digit string
                keysquare[c] = EMPTY
            }
            keysquare[ code_array[start_pos] ] = basic_key[n];
            x = do_check(start_pos,start_pos+1,1,keysquare);
            if ( x[0]>=0) return(x);
          }
        }
        // check for intial digraph as suffix for trigraph
        for (n in basic_key){
          k = basic_key[n].length;
          if(k<3) continue;
          c1 = basic_key[n].slice(1); // second digraph in string
          if (k>2 && c1 == crib_str.slice(0,2) ){ // found key string with first crib digraph as suffix
            keysquare = [];
            for (i=0;i<10;i++) for (j=0;j<10;j++){
               c = ''+i+j; // convert to digit string
                keysquare[c] = EMPTY
            }
            keysquare[ code_array[start_pos] ] = basic_key[n];
            x = do_check(start_pos,start_pos+1,2,keysquare);
            if ( x[0]>=0) return(x);
          }
        }
        return(FAIL);
}


onmessage = function(event) { //receiving a message with the string to decode. do search
    var str1,str2;
    //str1 = event.data.str1;
    //str2 = event.data.str2;
    debugger;
    basic_key = event.data.basic_key;
    code_array = event.data.code_array;
    freq = event.data.freq;
    original_plain = event.data.plain;
    known_keysquare_flag = event.data.known_keysquare_flag;
    caesar_shift_flag = event.data.caesar_shift_flag;    
    skip_index = parseInt(event.data.skip_index);
    minimum_repeats = parseInt(event.data.minimum_repeats);
    min_coverage = parseInt(event.data.min_coverage);
    do_calc();
};  
