var buffer, crib;
var out_str;
var primer;
var chain = [];
var chain_start = [];

var prime_primers;
var sieve;
var digits = '0123456789';
var alpha="abcdefghijklmnopqrstuvwxyz";

var alpha_string;
	
// construct prime primers
  prime_primers = [];
  sieve = [];
  for (i=0;i<100000;i++)
    sieve[i] = true; // space available
    
  for (primer = 0;primer<100000;primer++){
    if (sieve[primer]) // its a prime primer
      prime_primers.push(primer);
      // delete equivalemt primers
      // multiply all digits in the primer by: 3,7,9
      c = ''+primer; // convert to string
      primer3 = primer7=primer9 = 0;
      le = c.length;
      j=5-le;
      for (i=0;i<5-j;i++){
        c1 = c.charAt(i);
        n = digits.indexOf(c1);
        n1 = (3*n)%10;
        primer3 = 10*primer3+n1;
        n1 = (7*n)%10;
        primer7 = 10*primer7+n1;
        n1 = (9*n)%10;
        primer9 = 10*primer9+n1;
      }
      sieve[primer3] = false;
      sieve[primer7] =false;
      sieve[primer9] =false;
  }



var buf_len;
var primer_len;
var digit_totals;

function get_chain(){
    var i,j,k,index,n,c;
	
	digit_totals = [];
	for (i=0;i<10;i++)
		digit_totals[i] = 0;
    index = 0;
    for (i=0;i<5;i++){
            chain[index++] = chain_start[i];
			digit_totals[ chain_start[i]]++;
    }
    for (j = 0;j<buf_len-index;j++){
       chain[j+index] = (chain[j]+chain[j+1]) % 10;
	   digit_totals[ chain[j+index] ]++;
	}
}       


function do_processing(){
    var i,j,c,n,j1,j2,j3,j4,j5;
    var xfer;
    var even_flag = false;
    buf_len = buffer.length; // global
	alpha_str = '';
	for (i=0;i<buf_len;i++)
		alpha_str += alpha.charAt( buffer[i] );
    out_str = '';
    primer_len = 5;
	process_prime_primers();
    out_str += ' done';
    xfer = {};
    xfer["s1"] = out_str;
    postMessage(xfer);
}

function process_prime_primers(){
    var i,j,c,n,c1,le;
	var p_index;

	for (p_index = 0;p_index<prime_primers.length;p_index++){
		if (p_index % 10000 == 0){
			xfer = {};
            xfer["s1"] = 'processed primers up to '+ p_index;
            postMessage(xfer);   // show progress
		}
		c = ''+prime_primers[p_index];
		le = c.length;
		j = 0;
		if ( le<5){
			n = 5-le;
			while(n>0){
				n--;
				chain_start[n] = 0
				j++;
			}
		}
		for (i=0;i<5-j;i++){
			c1 = c.charAt(i);
			chain_start[i+j] = digits.indexOf(c1);
		}
        get_chain();
        if (construct_crib() ) {
            out_str += 'OK for ';
            for (i=0;i<primer_len;i++)
                out_str += chain_start[i];
            out_str += ', ';
        }
	}
}

function construct_crib( ){
	var i,j,k,n,index,s1,re,m_array;
	var start_pos,flag;
	var c,c1,c2;
    var cnt;
    var row1, row2, pos;
    var c1k, c2k;
	var flag,n1,n2, flag2;
	var x,y;

    var chain_digits;
    var max_col_length;
	


	crib_len = crib.length;

    for (start_pos = 0;start_pos<buf_len - crib_len+1;start_pos++){          //n = check_text(start_pos,numb_symbols);
    var pre_crib_digits, post_crib_digits;
	var digit_crib_length_flag =[];
	var digit_ciphertext_start = [];
	var digit_ciphertext_length = [];
	var ciphertext_digit_columns = [];
    pre_crib_digits = [];
	for (i=0;i<10;i++)
		digit_crib_length_flag[i] = false;	
    for (i=0;i<10;i++)
        pre_crib_digits[i] = 0;
    for (i=0;i<start_pos;i++)
        pre_crib_digits[ chain[i] ]++;
    post_crib_digits = [];
    for (i=0;i<10;i++)
        post_crib_digits[i] = 0;
    for (i=start_pos+crib_len;i<buf_len;i++)
        post_crib_digits[ chain[i] ]++;
	
// get crib letters corresponding to chain digits
	chain_digits = [];
    for (i=0;i<10;i++)
        chain_digits[i] = [];
    for (i=0;i<crib_len;i++){
        n = crib[i];
        j = chain_digits[ chain[start_pos+i] ].length; //number of letters that already have this chain digit
        chain_digits[ chain[start_pos+i] ] [ j ] = n;
    }
    // search ciphertext for string with same chain digits as crib
    max_col_length = 0;
    for (i=0;i<10;i++){
        if (chain_digits[i].length> max_col_length)
            max_col_length = chain_digits[i].length;
        if (chain_digits[i].length>1){ // at least 2 letters with this chain digit
                n1 = chain_digits[i][0];
                flag = true;
                // n1 & letters following must be at least a digraph in ciphertext if this crib position works.
				for (k=pre_crib_digits[i];k<buf_len-post_crib_digits[i]-chain_digits[i].length+1;k++) {
                //for (k=0;k<buf_len-chain_digits[i].length+1;k++) {
                    if ( buffer[k] == n1 ) {// possible match
                        flag2 = true;
                        for (x=1;x< chain_digits[i].length;x++)
                            if ( chain_digits[i][x] != buffer[k+x] ){
                                flag2 = false; // no match
                                break;
                        }
                        if ( flag2 ) {// have match
                            flag = false;
							if ( chain_digits[i].length >3) // very unlikely more than one copy 
								digit_crib_length_flag[i] = true;
							else{ // see if only one copy in ciphertext
								s1 = alpha_str.substring(k,k+chain_digits[i].length); // string to search for
								re = new RegExp(s1,'g');// put string into regular global expression
								m_array = alpha_str.match(re);
								if (m_array.length>1) // more than one match
									digit_crib_length_flag[i] = false; //already initialized to false but doesn't hurt to emphasize it
								else
									digit_crib_length_flag[i] = true;
							}
							digit_ciphertext_start[i] = k - pre_crib_digits[i];
							digit_ciphertext_length[i] = pre_crib_digits[i]+chain_digits[i].length+post_crib_digits[i];
							
                            break;
                        }
                    }
                }
                if ( flag) // digraph or longer doesn't exist in ciphertext, this position doesn't work
					break;
					
        }
		else // one digit 'chain', skip to next chain digit
			flag = false;
		if (flag)
				break;
    } // next i
	if (flag)
		continue;
	flag = true;
	// see if any ciphertext ovelaps
	for (i=0;i<buf_len;i++)
		ciphertext_digit_columns[i] = -1; // start out empty-cells
	for (i=0;i<10;i++)
		if (digit_crib_length_flag[i]){
			for (j=0;j<digit_ciphertext_length[i];j++){
				n = digit_ciphertext_start[i]+j;
				if (ciphertext_digit_columns[n] != -1){
					//s += "\ncolumn conflict at position "+n+" between digit columns "+ciphertext_digit_columns[n]+" and "+i;
					//console.log(s);
					//return(-1);
					flag = false;
					break;
				}
				ciphertext_digit_columns[n] = i;
		}
	}
	var min_available = 10000;
	var min_odd_available = 10001;
	var available_string_lengths = [];
	for (i=0;i<10;i++)
		if (!digit_crib_length_flag[i]){
			available_string_lengths.push( digit_totals[i]) ;
			if ( digit_totals[i] < min_available)
				min_available = digit_totals[i];
			if ( (digit_totals[i] & 1) && digit_totals[i] < min_odd_available )
				min_odd_available = digit_totals[i];
		}
		
	var unknown_string_lengths = [];			
	var q_flag = false;
	x = 0;
	var min_unknown = 10000;
	var min_odd_unknown = 10001;
	for (i=0;i<	ciphertext_digit_columns.length;i++){
		if ( ciphertext_digit_columns[i] == -1 ){
			if (q_flag){
				x++
			}
			else {
				x = 1;
				q_flag = true;
			}
		}
		else {
			if (q_flag){
				unknown_string_lengths.push(x);	
				q_flag = false;
				if (x<min_unknown)
					min_unknown = x;
				if ( (x&1) && x<min_odd_unknown)
					min_odd_unknown = x;
			
		}
	}
	}
	if (q_flag){
		unknown_string_lengths.push(x);	
		if (x<min_unknown)
			min_unknown = x;
		if ( (x&1) && x<min_odd_unknown)
			min_odd_unknown = x;		
	}

	if (min_unknown < min_available){
		//s = 'minium unknown string length ('+min_unknown+') is less than any available digit string length';
		//console.log(s);
		//return(-1);
		flag = false;
	}
	else if (min_odd_unknown < min_odd_available){
		//s = 'minium odd unknown string length ('+min_odd_unknown+') is less than any available odd digit string length';
		//console.log(s);
		//return(-1);
		flag = false;
	}
	
	if (flag)
		return(true);
	}
return(false);
}


onmessage = function(event) { //receiving a message with the string to decode. do search
    debugger;
    var str1,str2;
    buffer = event.data.buffer;
    crib = event.data.crib;
    do_processing();
};

