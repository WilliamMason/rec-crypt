importScripts('routes.js'); 

var ciphertext, plaintext,left_key_right_key;

var alpha6="A1B2C3D4E5F6G7H8I9J0KLMNOPQRSTUVWXYZ-"
var	alpha="ABCDEFGHIKLMNOPQRSTUVWXYZ-";
var sq1 = [];
var sq2 = [];

function next_permutation(per,swap_array,sq_width){
    var n,c;
	//for n in range(1, 5 ):
    for (n=1;n<sq_width;n++){
		if (swap_array[n] < n){
			if ( (n & 1 )!= 0) pos = swap_array[n];
			else pos = 0;
			//per[pos],per[n] = per[n],per[pos]
            c = per[n];
            per[n] = per[pos];
            per[pos] = c;
			swap_array[n] += 1;
			return( 1);
        }
		else
            swap_array[n] = 0
    }
	return( 0);
}

function get_next_square(newsq,oldsq,key_order_row,key_order_col,sq_width){
    for (var row = 0;row<sq_width;row++) {
        newsq[row] = [];    
        for (var col = 0;col<sq_width;col++)
			newsq[row][col] = oldsq[key_order_row[row]][key_order_col[col]];
    }
}

function score_keysquare(sq,route){ // length of the maximum  sequence starting at end of route.
  var i,j,n,row,col,c,c1,score;
  var high_score;
  var inverse_rt = [];
  for (i=0;i<25;i++)
      inverse_rt[ routes[route][i] ] = i;
	var temp = [];
	var index = 0;
  for (row = 0;row<5;row++) for (col = 0;col<5;col++){
			temp[index] = sq[row][col];
			index += 1;
  }
	c = temp[inverse_rt[24]];
	if (c == '-') c = 'Z'
	high_score = score = 0;
  for (n = 24;n>-1;n--){
		c1 = temp[inverse_rt[n]];
		if (c1 == '-'){
			score += 1;
			continue;
    }
    /*
    if (alpha.indexOf(c1) > alpha.indexOf(c) )
            return(score);
		score += 1;
		*/
		if (alpha.indexOf(c1) > alpha.indexOf(c) ){
		  if (score>high_score)
		    high_score = score;
		  score = 0
		}
		else
		  score +=1;
		c = c1;
  }
	if (score>high_score)
	   high_score = score;
    
	return(high_score);
}


function score_keysquare6(sq,route){ // length of the descending sequence starting at end of 6x6 route.
    var i,j,n,row,col,c,c1,score;
    var high_score;

    var inverse_rt = [];
    for (i=0;i<36;i++)
        inverse_rt[ routes6[route][i] ] = i;
	var temp = [];
	var index = 0;
    for (row = 0;row<6;row++) for (col = 0;col<6;col++){
			temp[index] = sq[row][col];
			index += 1;
    }
	c = temp[inverse_rt[35]];
	if (c == '-') c = 'Z'
	score = high_score = 0;
    for (n = 35;n>-1;n--){
		c1 = temp[inverse_rt[n]];
		if (c1 == '-'){
			score += 1;
			continue;
        }
		if (alpha6.indexOf(c1) > alpha6.indexOf(c) ){
		  if (score>high_score)
		    high_score = score;
		  score = 0
		}
		else
		  score +=1;
		c = c1;
  }
	if (score>high_score)
	   high_score = score;
    
	return(high_score);
}

function do_6x6_calc(key1) {
	var str, out_str,c,n,i,j,k;
    var key2,best_score,score,route_num, best_route;
    var cipher1, plain1,cipher2,plain2,s;
    var op_choice;
    
    out_str="";
    n = 0;
	for (i=0;i<6;i++){
        sq1[i] = [];
        for (j=0;j<6;j++)
            sq1[i][j] = key1.charAt(n++);
    }
    /// key 2
	//str = document.getElementById('key2_area').value;
    str = right_key;
	str = str.toUpperCase();
    key2 = '';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0)
			key2 += c;
	}
    if (key2.length != 36) {
        //alert("Left Key is 6x6 but Right Key does not have 36 symbols!");
        //alert("Right Key does not have 25 symbols!");
        str = "Left Key is 6x6 but Right Key does not have 36 symbols!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    n = 0;
	for (i=0;i<6;i++){
        sq2[i] = [];
        for (j=0;j<6;j++)
            sq2[i][j] = key2.charAt(n++);
    }
	//str = document.getElementById('cipher_area').value;
    str = ciphertext;
	str = str.toUpperCase();
    s='';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.slice(0,36).indexOf(c); // don't count '-'
		if ( n>=0)
            s += c;
	}
    if ( (s.length&1)!= 0){
        //alert("Ciphertext has odd length!");
        str = "Ciphertext has odd length!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    cipher1 = []
    cipher2 = [];
    n = 0;
    for (i=0;i<s.length;i = i+2){
        cipher1[n] = s.charAt(i);
        cipher2[n] = s.charAt(i+1);
        n++;
    }
	//str = document.getElementById('plain_area').value;
    str = plaintext;
	str = str.toUpperCase();
    s='';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.slice(0,36).indexOf(c); // don't count '-'
		if ( n>=0)
            s += c;
	}
    plain1 = []
    plain2 = [];
    n = 0;
    for (i=0;i<s.length;i = i+2){
        plain1[n] = s.charAt(i);
        plain2[n] = s.charAt(i+1);
        n++;
    }
    if ( (cipher1.length != plain1.length)||(cipher2.length != plain2.length)){
        //alert("Ciphertext and Plaintext have different lengths!");
        str = "Ciphertext and Plaintext have different lengths!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    
    // remove key letters that don't appear in ciphertext or plaintext
    var missing_left = ". unused: ";
    var missing_right = ". unused: ";
    for (i=0;i<6;i++) for (j=0;j<6;j++){
		c = sq1[i][j]
		if (cipher2.indexOf(c) == -1 && plain1.indexOf(c) == -1){
			sq1[i][j] = '-'
            missing_left += c;
        }
    }
    for (i=0;i<6;i++) for (j=0;j<6;j++){
		c = sq2[i][j]
		if (cipher1.indexOf(c) == -1 && plain2.indexOf(c) == -1){
			sq2[i][j] = '-'
            missing_right += c;
        }
    }

    best_score = score_keysquare6(sq1,0)
    best_route = 0;
    // try all routes in original square
    for (route_num = 1;route_num < routes.length;route_num++){
        score = score_keysquare6(sq1,route_num);
        if (score>best_score){
            best_score = score;
            best_route = route_num;
        }
    }
    for (i=0;i<6;i++){
        for (j=0;j<6;j++)
            out_str += sq1[i][j];
        out_str += '\n';
    }
    out_str += '\nbest score for left keysquare is '+best_score+' with route '+route_name[best_route];
	//document.getElementById('output_area').value = out_str;

    var swap_array_row = [0,0,0,0,0,0];
    var key_order_row = [0,1,2,3,4,5];
    var swap_array_col;
    var key_order_col;
    var newsq = []
    var best_left_row_order;
    var best_right_row_order;
    best_left_row_order = key_order_row.slice(0);

    // now try all equivalent squares
    while( next_permutation(key_order_row,swap_array_row,6) != 0 ){	
        key_order_col = [0,1,2,3,4,5];
        swap_array_col = [0,0,0,0,0,0];
        get_next_square(newsq,sq1,key_order_row,key_order_col,6)
        for (route_num = 0;route_num < routes.length;route_num++){
            score = score_keysquare6(newsq,route_num)
            if (score > best_score){
                best_score = score
                best_route = route_num;
                out_str = '';
                for (i=0;i<6;i++){
                    for (j=0;j<6;j++)
                        out_str += newsq[i][j];
                    out_str += '\n';
                }
                out_str += '\nbest score for left keysquare is '+best_score+'\nroute: '+route_name[best_route];
                best_left_row_order = key_order_row.slice(0);
                //document.getElementById('output_area').value = out_str;
            }
        }
        while( next_permutation(key_order_col,swap_array_col,6) != 0 ){	
            get_next_square(newsq,sq1,key_order_row,key_order_col,6)
            for (route_num = 0;route_num < routes.length;route_num++){
                score = score_keysquare6(newsq,route_num)
                if (score > best_score){
                    best_score = score
                    best_route = route_num;
                    out_str = '';
                    for (i=0;i<6;i++){
                        for (j=0;j<6;j++)
                            out_str += newsq[i][j];
                        out_str += '\n';
                    }
                    out_str += '\nbest score for left keysquare is '+best_score+'\nroute: '+route_name[best_route];
                    //document.getElementById('output_area').value = out_str;
                    best_left_row_order = key_order_row.slice(0);                    
                }
            }
        }
    }
    str = out_str+missing_left;
    postMessage( {op_choice:2, str:str});
    // now do right keysquare
    var out_str2 = '';
    best_score = score_keysquare6(sq2,0)
    best_route = 0;
    // try all routes in original square
    for (route_num = 1;route_num < routes.length;route_num++){
        score = score_keysquare6(sq2,route_num);
        if (score>best_score){
            best_score = score;
            best_route = route_num;
        }
    }
    for (i=0;i<6;i++){
        for (j=0;j<6;j++)
            out_str2 += sq2[i][j];
        out_str2 += '\n';
    }
    out_str2 += '\nbest score for right keysquare is '+best_score+' with route '+route_name[best_route];
	//document.getElementById('output_area').value = out_str2;

    var swap_array_row = [0,0,0,0,0,0];
    var key_order_row = [0,1,2,3,4,5];
    var swap_array_col;
    var key_order_col;
    var newsq = [];
    best_right_row_order = key_order_row.slice(0);

    // now try all equivalent squares
    while( next_permutation(key_order_row,swap_array_row,6) != 0 ){	
        key_order_col = [0,1,2,3,4,5];
        swap_array_col = [0,0,0,0,0,0];
        get_next_square(newsq,sq2,key_order_row,key_order_col,6)
        for (route_num = 0;route_num < routes.length;route_num++){
            score = score_keysquare6(newsq,route_num)
            if (score > best_score){
                best_score = score
                best_route = route_num;
                out_str2 = '';
                for (i=0;i<6;i++){
                    for (j=0;j<6;j++)
                        out_str2 += newsq[i][j];
                    out_str2 += '\n';
                }
                out_str2 += '\nbest score for right keysquare is '+best_score+'\nroute: '+route_name[best_route];
                //document.getElementById('output_area').value = out_str2;
                best_right_row_order = key_order_row.slice(0);                
            }
        }
        while( next_permutation(key_order_col,swap_array_col,6) != 0 ){	
            get_next_square(newsq,sq2,key_order_row,key_order_col,6)
            for (route_num = 0;route_num < routes.length;route_num++){
                score = score_keysquare6(newsq,route_num)
                if (score > best_score){
                    best_score = score
                    best_route = route_num;
                    out_str2 = '';
                    for (i=0;i<6;i++){
                        for (j=0;j<6;j++)
                            out_str2 += newsq[i][j];
                        out_str2 += '\n';
                    }
                    out_str2 += '\nbest score for right keysquare is '+best_score+'\nroute: '+route_name[best_route];
                    //document.getElementById('output_area').value = out_str2;
                    best_right_row_order = key_order_row.slice(0);                                    
                }
            }
        }
    }
    //document.getElementById('output_area').value = out_str+missing_left;
    s = '';
    for (i=0;i<6;i++) 
        if (best_left_row_order[i] != best_right_row_order[i]){
            s = '\nWARNING: Left and right row orders are inconsistent';
            break;
    }
    //document.getElementById('output2_area').value = out_str2+missing_right+s;
    str = out_str2+missing_right+s;
    postMessage( {op_choice:3, str:str});
}


function do_calc(){
	var str, out_str,c,n,i,j,k;
    var key1,key2,best_score,score,route_num, best_route;
    var cipher1, plain1,cipher2,plain2,s;
    var op_choice;

	out_str="";
	
	//str = document.getElementById('key1_area').value;
    str = left_key;
	str = str.toUpperCase();
    key1 = '';
	for (var i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0)
			key1 += c;
	}
    if (key1.length == 36) {
        do_6x6_calc(key1);
        return;
    }

    // not 6x6, try 5x5
    key1 = '';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			key1 += c;
	}
    if (key1.length != 25) {
        //alert("Left Key does not have 25 or 36 symbols!");
        //alert("Left Key does not have 25 symbols!");
        str = "Left Key does not have 25 or 36 symbols!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    n = 0;
	for (i=0;i<5;i++){
        sq1[i] = [];
        for (j=0;j<5;j++)
            sq1[i][j] = key1.charAt(n++);
    }
    /// key 2
	//str = document.getElementById('key2_area').value;
    str = right_key;
	str = str.toUpperCase();
    key2 = '';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			key2 += c;
	}
    if (key2.length != 25) {
        //alert("Right Key does not have 25 or 36 symbols!");
        //alert("Right Key does not have 25 symbols!");
        str = "Right Key does not have 25 or 36 symbols!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    n = 0;
	for (i=0;i<5;i++){
        sq2[i] = [];
        for (j=0;j<5;j++)
            sq2[i][j] = key2.charAt(n++);
    }
	//str = document.getElementById('cipher_area').value;
    str = ciphertext;
	str = str.toUpperCase();
    s='';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.slice(0,26).indexOf(c); // don't count '-'
		if ( n>=0)
            s += c;
	}
    if ( (s.length&1)!= 0){
        //alert("Ciphertext has odd length!");
        str = "Ciphertext has odd length!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    cipher1 = []
    cipher2 = [];
    n = 0;
    for (i=0;i<s.length;i = i+2){
        cipher1[n] = s.charAt(i);
        cipher2[n] = s.charAt(i+1);
        n++;
    }
	//str = document.getElementById('plain_area').value;
    str = plaintext;
	str = str.toUpperCase();
    s='';
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.slice(0,26).indexOf(c); // don't count '-'
		if ( n>=0)
            s += c;
	}
    plain1 = []
    plain2 = [];
    n = 0;
    for (i=0;i<s.length;i = i+2){
        plain1[n] = s.charAt(i);
        plain2[n] = s.charAt(i+1);
        n++;
    }
    if ( (cipher1.length != plain1.length)||(cipher2.length != plain2.length)){
        //alert("Ciphertext and Plaintext have different lengths!");
        str = "Ciphertext and Plaintext have different lengths!"
        postMessage( {op_choice:1, str:str});
        return;
    }
    
    // remove key letters that don't appear in ciphertext or plaintext
    var missing_left = ". unused: ";
    var missing_right = ". unused: ";
    for (i=0;i<5;i++) for (j=0;j<5;j++){
		c = sq1[i][j]
		if (cipher2.indexOf(c) == -1 && plain1.indexOf(c) == -1){
			sq1[i][j] = '-'
            missing_left += c;
        }
    }
    for (i=0;i<5;i++) for (j=0;j<5;j++){
		c = sq2[i][j]
		if (cipher1.indexOf(c) == -1 && plain2.indexOf(c) == -1){
			sq2[i][j] = '-'
            missing_right += c;
        }
    }

    best_score = score_keysquare(sq1,0)
    best_route = 0;
    // try all routes in original square
    for (route_num = 1;route_num < routes.length;route_num++){
        score = score_keysquare(sq1,route_num);
        if (score>best_score){
            best_score = score;
            best_route = route_num;
        }
    }
    for (i=0;i<5;i++){
        for (j=0;j<5;j++)
            out_str += sq1[i][j];
        out_str += '\n';
    }
    out_str += '\nbest score for left keysquare is '+best_score+' with route '+route_name[best_route];
	//document.getElementById('output_area').value = out_str;

    var swap_array_row = [0,0,0,0,0];
    var key_order_row = [0,1,2,3,4];
    var swap_array_col;
    var key_order_col;
    var newsq = []
    var best_left_row_order;
    var best_right_row_order;
    best_left_row_order = key_order_row.slice(0);
    // now try all equivalent squares
    while( next_permutation(key_order_row,swap_array_row,5) != 0 ){	
        key_order_col = [0,1,2,3,4];
        swap_array_col = [0,0,0,0,0];
        get_next_square(newsq,sq1,key_order_row,key_order_col,5)
        for (route_num = 0;route_num < routes.length;route_num++){
            score = score_keysquare(newsq,route_num)
            if (score > best_score){
                best_score = score
                best_route = route_num;
                out_str = '';
                for (i=0;i<5;i++){
                    for (j=0;j<5;j++)
                        out_str += newsq[i][j];
                    out_str += '\n';
                }
                out_str += '\nbest score for left keysquare is '+best_score+'\nroute: '+route_name[best_route];
                best_left_row_order = key_order_row.slice(0);
                //document.getElementById('output_area').value = out_str;
            }
        }
        while( next_permutation(key_order_col,swap_array_col,5) != 0 ){	
            get_next_square(newsq,sq1,key_order_row,key_order_col,5)
            for (route_num = 0;route_num < routes.length;route_num++){
                score = score_keysquare(newsq,route_num)
                if (score > best_score){
                    best_score = score
                    best_route = route_num;
                    out_str = '';
                    for (i=0;i<5;i++){
                        for (j=0;j<5;j++)
                            out_str += newsq[i][j];
                        out_str += '\n';
                    }
                    out_str += '\nbest score for left keysquare is '+best_score+'\nroute: '+route_name[best_route];
                    //document.getElementById('output_area').value = out_str;
                    best_left_row_order = key_order_row.slice(0);                    
                }
            }
        }
    }
    str = out_str+missing_left;
    postMessage( {op_choice:2, str:str});
    // now do right keysquare
    var out_str2 = '';
    best_score = score_keysquare(sq2,0)
    best_route = 0;
    // try all routes in original square
    for (route_num = 1;route_num < routes.length;route_num++){
        score = score_keysquare(sq2,route_num);
        if (score>best_score){
            best_score = score;
            best_route = route_num;
        }
    }
    for (i=0;i<5;i++){
        for (j=0;j<5;j++)
            out_str2 += sq2[i][j];
        out_str2 += '\n';
    }
    out_str2 += '\nbest score for right keysquare is '+best_score+' with route '+route_name[best_route];
	//document.getElementById('output_area').value = out_str2;

    var swap_array_row = [0,0,0,0,0];
    var key_order_row = [0,1,2,3,4];
    var swap_array_col;
    var key_order_col;
    var newsq = []
    best_right_row_order = key_order_row.slice(0); 
    // now try all equivalent squares
    while( next_permutation(key_order_row,swap_array_row,5) != 0 ){	
        key_order_col = [0,1,2,3,4];
        swap_array_col = [0,0,0,0,0];
        get_next_square(newsq,sq2,key_order_row,key_order_col,5)
        for (route_num = 0;route_num < routes.length;route_num++){
            score = score_keysquare(newsq,route_num)
            if (score > best_score){
                best_score = score
                best_route = route_num;
                out_str2 = '';
                for (i=0;i<5;i++){
                    for (j=0;j<5;j++)
                        out_str2 += newsq[i][j];
                    out_str2 += '\n';
                }
                out_str2 += '\nbest score for right keysquare is '+best_score+'\nroute: '+route_name[best_route];
                //document.getElementById('output_area').value = out_str2;
                best_right_row_order = key_order_row.slice(0);                
            }
        }
        while( next_permutation(key_order_col,swap_array_col,5) != 0 ){	
            get_next_square(newsq,sq2,key_order_row,key_order_col,5)
            for (route_num = 0;route_num < routes.length;route_num++){
                score = score_keysquare(newsq,route_num)
                if (score > best_score){
                    best_score = score
                    best_route = route_num;
                    out_str2 = '';
                    for (i=0;i<5;i++){
                        for (j=0;j<5;j++)
                            out_str2 += newsq[i][j];
                        out_str2 += '\n';
                    }
                    out_str2 += '\nbest score for right keysquare is '+best_score+'\nroute: '+route_name[best_route];
                    //document.getElementById('output_area').value = out_str2;
                    best_right_row_order = key_order_row.slice(0);                                    
                }
            }
        }
    }
    //document.getElementById('output_area').value = out_str+missing_left;
    s = '';
    for (i=0;i<5;i++) 
        if (best_left_row_order[i] != best_right_row_order[i]){
            s = '\nWARNING: Left and right row orders are inconsistent';
            break;
    }
    //document.getElementById('output2_area').value = out_str2+missing_right+s;
    str = out_str2+missing_right+s;
    postMessage( {op_choice:3, str:str});

}

onmessage = function(event) { //receiving a message
  ciphertext = event.data.ciphertext;
  plaintext = event.data.plaintext;
  left_key = event.data.left_key;
  right_key = event.data.right_key;
  do_calc();
}
