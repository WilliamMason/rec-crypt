importScripts('tettable.js'); 

var tet_table = [];
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var l_alpha="abcdefghijklmnopqrstuvwxyz";	
var buffer = [];
var buf_len,key_len;
var key = [];
var key_array = [];
var next_key = [];
var offset = [];
var transposed_key = [];
var chain_start = [];
var chain = [];
var plain_text = [];

var word_list = [];

function search_word_list(b_array){ // set up word_list
	var s,n;
    var state,i,c,index;
    
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
	
	postMessage({"s1":"tet tables initialized"}); // don;t put zero at beginning
}	
initialize_tet_table();

function get_next_key(le) { // extend to complete key and get key_len, which is number of non-repeated letters in key
                /* return key size less repeated letters*/
        var index,j,k;
        var ksize;

        //memset(next_key,0,26); /* zero next key array */
        for (j=0;j<26;j++) next_key[j] = 0;
        ksize = 0;
        index = 0;
        for (j=0;j<le;j++) { // must use le, not key.length because key.length may include ltters from previous keys
                k = key[j];
                if ( !next_key[k] ) { /* this letter hasn't occurred yet */
                        key_array[index++] = k;
                        next_key[k] = 1;
                        ksize++;
                }
        } /* next j */
        /* key filled in, now put in remaining letters in alphabetical order*/
        for (j=0;j<26;j++)
                if ( !next_key[j] ) /* not filled in yet */
                        key_array[index++] = j;
        return(ksize);
} /* end get_next_key */

function do_transposition() {
        var j,k,i, index;
        var c;
        var limit,x;

/* get order of columns from key */
        index = 0;
        for (i=0;i<26;i++)
                for (j=0;j<key_len;j++)
                        if ( key_array[j] == i ){
                                offset[index++] = j;
                                        break;
                }
        index = 0;
        for (i=0;i<key_len;i++) {
            j = offset[i];
            while( j<26) {
                transposed_key[index++]= key_array[ j ];
                j += key_len;
            } 
        }

}

function get_chain() {
        var j,k,index;

        /* get starting key order, which is inverse of offset array */
        for (j=0;j<key_len;j++) 
            chain_start[ offset[j] ] = j;
                        
        /* for chain start use key chars +1 */
        for (index = 0;index<key_len;index++)
                chain[index] = chain_start[index]+1;
        for (j = 0;j<buf_len-key_len;j++) 
                chain[j+key_len] = (chain[j]+chain[j+1]) % 10;
} /* end get_chain */

function get_plain_text(){
    var index,n,i,j,k;
    var c1,c2;
    
    index = n = 0;
    for (k=0;k<26;k++)
            if ( key[index] == transposed_key[k]) {
                    c2 = k;
                    break;
    }
    for (j=0;j<buf_len;j++) {
            for (k=0;k<26;k++)
                    if ( transposed_key[k] == buffer[j]) {
                            c = k;
                            break;
            }
            c1 = (52+c-chain[j]-c2)%26;
            plain_text[j] = c1;
            n++;
            if (n == key_len) {
                    n= 0;
                    index = (index+1)%key_len;
                    for (k=0;k<26;k++)
                            if ( key[index] == transposed_key[k]) {
                            c2 = k;
                            break;
                    }
    
            }
    } /* next j */
}

function get_score(){
    var score,i;
    
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
    return(score);
}


function do_processing(str1){
    var out_str, out_str2, xfer,str;
    var i,j,k,n;
    var score,best_score;
    
	str = str1.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    best_score = -1000;
    for (i=0;i<word_list.length;i++){  
        for (j=0;j<word_list[i].length;j++)
            key[j] = l_alpha.indexOf(word_list[i][j]);
        key_len = get_next_key(word_list[i].length); // extgended key put into key_array
        do_transposition();
        get_chain();
        get_plain_text();
        score = get_score();
        if ( score > best_score){
            best_score = score;
            out_str = "Key: "+word_list[i]+" ,with score of "+score.toFixed(2)+"\nplaintext\n";
            for (n=0;n<buf_len;n++)
                out_str += l_alpha.charAt(plain_text[n]);
            xfer = {};
            xfer["s1"] = out_str;
            postMessage(xfer);
        }
    }
    xfer = {};
    xfer["s1"] = out_str+'\nDONE';
    postMessage(xfer);

}

onmessage = function(event) { //receiving a message with the string to decode. do search
    var str1,str2;
    
  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else{  
    str1 = event.data.str1;
    do_processing(str1);
  }
};  

