var out_str;
var primer;

var chain = [];
var chain_start = [];

var prime_primers;
var sieve;
var digits = '0123456789';


var alpha_string;

var buffer;
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buf_len;

var numeric_code;
var numeric_plain;
var primer;
var digits = '0123456789';

	
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

function do_processing(){
    var i,j,c,n,j1,j2,j3,j4,j5;
    var xfer;
    out_str = '';
    primer_len = 5;
	process_prime_primers();
    //out_str += '\n DONE';
    xfer = {};
    xfer["s2"] = 'DONE'
    postMessage(xfer);
}

function process_prime_primers(){
    var i,j,c,n,c1,le,str,str2,pt;
	var p_index;
	var result;
	var best_score,score;
    do_one_pass_calc = one_pass_calcs(); // returns a function and initializes scoring table
 
	out_str = '';
	best_score = 0;
	for (p_index = 0;p_index<prime_primers.length;p_index++){
		if (p_index % 5000 == 0){
			xfer = {};
            xfer["s2"] = 'processed: '+ p_index;
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
		
        //get_chain();
		result = do_one_pass_calc(numeric_code,chain_start);
		score = result[0];
		
		if ( score>best_score ) {
			best_score = score;
			key = result[1];
			pt = result[2];
			xfer = {};
			xfer["s2"] = '';
			str = chain_start.join('');
			str2 = key.join('');
            xfer["s1"] = ' best score is: '+best_score+' for primer: '+str+ ' with key: '+str2+ '\nand plaintext:\n'+pt;
			xfer["score"] = ''+best_score;
			xfer["numeric_plain"] = result[3];
            postMessage(xfer);   // show progress
			out_str = ' best score is: '+best_score+' for primer: '+str+ ' with key: '+str2+ '\nand plaintext:\n'+pt;
			
		}
		
	}
}


var one_pass_calcs = function(){
var sdd = [
[0,3,4,2,0,0,1,0,0,0,4,5,2,6,0,2,0,4,4,3,0,6,0,0,3,5],
[0,0,0,0,6,0,0,0,0,9,0,7,0,0,0,0,0,0,0,0,7,0,0,0,7,0],
[3,0,0,0,2,0,0,6,0,0,8,0,0,0,6,0,5,0,0,0,3,0,0,0,0,0],
[1,6,0,0,1,0,0,0,4,4,0,0,0,0,0,0,0,0,0,1,0,0,4,0,1,0],
[0,0,4,5,0,0,0,0,0,3,0,0,3,2,0,3,6,5,4,0,0,4,3,8,0,0],
[3,0,0,0,0,5,0,0,2,1,0,0,0,0,5,0,0,2,0,4,1,0,0,0,0,0],
[2,0,0,0,1,0,0,6,1,0,0,0,0,0,2,0,0,1,0,0,2,0,0,0,0,0],
[5,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,5,0,0,0,4,0,0,0,1,1,3,7,0,0,0,0,5,3,0,5,0,0,0,8],
[0,0,0,0,6,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,9,0,0,0,0,0],
[0,0,0,0,6,0,0,0,5,0,0,0,0,4,0,0,0,0,0,0,0,0,1,0,0,0],
[2,0,0,4,2,0,0,0,3,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
[5,5,0,0,5,0,0,0,2,0,0,0,0,0,2,6,0,0,0,0,2,0,0,0,6,0],
[0,0,4,7,0,0,8,0,0,2,2,0,0,0,0,0,3,0,0,4,0,0,0,0,0,0],
[0,2,0,0,0,8,0,0,0,0,4,0,5,5,0,2,0,4,0,0,7,4,5,0,0,0],
[3,0,0,0,3,0,0,0,0,0,0,5,0,0,5,7,0,6,0,0,3,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0],
[1,0,0,0,4,0,0,0,2,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,5,0],
[1,1,0,0,0,0,0,1,2,0,0,0,0,0,1,4,4,0,1,4,2,0,4,0,0,0],
[0,0,0,0,0,0,0,8,3,0,0,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0],
[0,4,3,0,0,0,5,0,0,0,0,6,2,3,0,6,0,6,5,3,0,0,0,0,0,6],
[0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[6,0,0,0,2,0,0,6,6,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
[3,0,7,0,1,0,0,0,2,0,0,0,0,0,0,9,0,0,0,5,0,0,0,6,0,0],
[1,6,2,0,0,2,0,0,0,6,0,0,2,0,6,2,1,0,2,1,0,0,6,0,0,0],
[2,0,0,0,8,0,0,0,0,6,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,9]
];

var chain_digit_length,chain_digraph_position,chain_digit_position;
var chain_start = [];
var chain = [];
var primer1

function get_chain(){
    var i,j,k,index,n,c;

    index = 0;
    for (i=0;i<primer1.length;i++){
        n = primer1[i];
        chain[index++] = n
    }
    for (j = 0;j<numeric_code.length-index;j++)
       chain[j+index] = (chain[j]+chain[j+1]) % 10;
}
function get_chain_digraphs(){
	var i,j,k,n,c,s,n1,n2,v1,v2;
	var p1,p2
	
	chain_digit_length = [];
	chain_digraph_position = [];
	for (i=0;i<10;i++){
		chain_digraph_position[i] = [];
		for (j = 0;j<10;j++)
			chain_digraph_position[i][j] = [];
	}
	for (i=0;i<10;i++)
		chain_digit_length[i] = 0;
	
	chain_digit_position = [];
	for (i=0;i<10;i++)
		chain_digit_position[i] = [];
	for (i=0;i<numeric_code.length;i++)
		chain_digit_position[ chain[i] ].push(i);
	for (i=0;i<numeric_code.length;i++){
		chain_digit_length[ chain[i] ]++;
	}
	
	// get chain digraphs relative to their chain_digit_position index.
	for (i=0;i<10;i++){
		for (j=0;j<chain_digit_position[i].length;j++){
			p1 = chain_digit_position[i][j];
			for (n1 = 0;n1<10;n1++)
				for (n2=0; n2<chain_digit_position[n1].length;n2++){
					p2 = chain_digit_position[n1][n2]
					if (p2 == (p1+1) )// we have a digraph
						chain_digraph_position[i][n1].push( [j,n2] );
				}
					
		}
	}
	
	
//return([chain_digit_length,chain_digraph_position,chain_digit_positions]); // made global within closure
}
function get_digraph_score(key_digit_1,key_digit_2,cipher_pos_1,cipher_pos_2) {
// cipher_pos_1 = start of key_letter_1 letters in the cipher text
var i,j,k,c,n,s;
var score = 0;
var p1,p2,v1,v2,n1,n2
var len = 0;
var len2 = 0;

len = chain_digraph_position[key_digit_1][key_digit_2].length;
if ( len>0)
for (i=0;i< len;i++){
	n1 = chain_digraph_position[key_digit_1][key_digit_2][i][0];
	//p1 = chain_digit_position[key_digit_1][n1];
	p1 = cipher_pos_1+n1; // at position n1 in ciphertext starting at cipher_pos
	n2 = chain_digraph_position[key_digit_1][key_digit_2][i][1]
	//p2 = chain_digit_position[key_digit_2][n2];
	//p2 = cipher_pos+chain_digit_length[key_digit_1]+n2;// ciphertext following key_digit_1
	p2 = cipher_pos_2 + n2;// start of key_2_letters in the ciphertext.
	v1 = numeric_code[ p1 ];
	v2 = numeric_code[ p2];
	//score += logdi[ v1 ][v2];
	score += sdd[ v1 ][v2];
}
if ( key_digit_1 == key_digit_2)
	return([score,len]);
len2 = chain_digraph_position[key_digit_2][key_digit_1].length;
if ( len2>0)
for (i=0;i< len2;i++){
	n1 = chain_digraph_position[key_digit_2][key_digit_1][i][0];
	
	p1 = cipher_pos_2+n1;// ciphertext following key_digit_2
	n2 = chain_digraph_position[key_digit_2][key_digit_1][i][1]
	p2 = cipher_pos_1+n2; // at position n1 in ciphertext starting at cipher_pos_1
	v1 = numeric_code[ p1 ];
	v2 = numeric_code[ p2];
	//score += logdi[ v1 ][v2];
	score += sdd[ v1 ][v2];
}
return( [score,len+len2] );
}

function extend_key_from_end( work_key){ // work_key is the key array that you have chosen so far, but it's reversed since we are going from end to begining of ciphertext
	var i,j,k,c,n,s,n2;
	var flag;
	var sum, cnt, result, temp_len;
	
	var end_code = numeric_code.length;	
	var score , best_score, best_sum, best_cnt, best_key;
	var key_pos = work_key.length; // get best key digit for this position
	best_score = -1;
	var ciph_pos_k = end_code; // place in ciphertextwhere next key string starts
	for (i=0;i< key_pos;i++)
		ciph_pos_k -= chain_digit_length[ work_key[ i ] ];
	
	for (k = 0;k<10;k++){
		flag = false;
		for (j=0;j<work_key.length;j++)
			if (k== work_key[j]){
				flag = true;
				break;
			}
		if ( flag) continue;// this key digit already used
		sum = 0;
		cnt = 0;
		score = 0;
		n = ciph_pos_k-chain_digit_length[k];
		result = get_digraph_score(k,k,n,n,chain_digit_length,chain_digraph_position,chain_digit_position);
		sum += result[0];
		cnt += result[1];
		temp_len = end_code;
		for (i=0;i<key_pos;i++){
			temp_len -= chain_digit_length[ work_key[i] ];		
			result = get_digraph_score(work_key[i],k,temp_len,n,chain_digit_length,chain_digraph_position,chain_digit_position);
			sum += result[0];
			cnt += result[1];

		}
		if ( cnt>0 )
			score = sum/cnt;
		if ( score > best_score){
			best_score = score;
			best_key = k;
			best_sum = sum;
			best_cnt = cnt;
		}
	}
	return( [best_key,best_sum,best_cnt ] );
}


function do_one_pass_calc(numeric_code,primer2){
	var i,j,k,c,n,s;
	primer1 = primer2; // define primer1 within the closure
    get_chain();
	get_chain_digraphs();

	var key_1,key_2, key_3;
	var best_work_key = [];
	var best_score = 0;
	best_score = -1;
	var end_code = numeric_code.length;
// try all possible positions for last three digits and expand each one.	
	var key_1,key_2, key_3;
	var best_work_key = [];
	var best_score = 0;
	best_score = -1;
	for (key_1 = 0;key_1<10;key_1++)
		for (key_2 = 0;key_2<10;key_2++){
			if ( key_1 == key_2) continue;
				sum = 0;
				cnt = 0;
				n = end_code - chain_digit_length[key_1];
				result = get_digraph_score(key_1,key_1,n,n);
				sum += result[0];
				cnt += result[1];
				n2= n-chain_digit_length[key_2];
				result = get_digraph_score(key_2,key_2,n2,n2);
				sum += result[0];
				cnt += result[1];
				result = get_digraph_score(key_1,key_2,n,n2);
				sum += result[0];
				cnt += result[1];
				work_key = [key_1,key_2];
				for (var key_pos = 2;key_pos<10;key_pos++){
					result = extend_key_from_end( work_key);
					sum += result[1];
					cnt += result[2];
					work_key.push( result[0] ); // result[0] is best key digit for position key_pos
				}
				score = sum;
				if ( cnt>0)
					score /= cnt;
				if ( score>best_score){
					best_score = score;
					//s = work_key.reverse().join(''); // reverses work key and therefore best_work_key
					best_work_key = work_key.slice(0).reverse();
				}
			
				
		}
		//out_str += '\n\nbest key is: '+s+' with a score of '+best_score;

        var plain_text = [];
		var numeric_plain = [];
        var index = 0;
        for (i=0;i<10;i++){
            k = best_work_key[i];
            for (j=0;j<numeric_code.length;j++){
                if ( chain[j] == k){
					numeric_plain[j] = numeric_code[index];
                    plain_text[j] = alpha.charAt(numeric_code[index++]);
                }
            }
        }
		
		//out_str += '\n\nplaintext:\n';
		s = plain_text.join('').toLowerCase();
		//out_str += s.toLowerCase();
		
		return( [best_score,best_work_key,s, numeric_plain] );		
	
	 //document.getElementById('output_area').value = out_str;	

}


    return (do_one_pass_calc); // return this function which can access pseudo_global variables
} // end one_pass_calcs closure function

onmessage = function(event) { //receiving a message with the string to decode. do search
    debugger;
    var str1,str2;
    numeric_code = event.data.buffer;
    do_processing();
};

