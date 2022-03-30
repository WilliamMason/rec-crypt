importScripts('tettable.js'); 
importScripts('routes.js'); 


var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var tet_table = [];
var buffer;

var alpha_extended="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
var plain_text = [];
var l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // left
var r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // right (top)
var m_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // middle
var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var inv_row3 = [];
var inv_col3 = [];
var keysquare_width = 5;
// crib key arrays
var left_crib_columns, left_crib_rows, top_crib_columns, top_crib_rows, middle_crib_columns,middle_crib_rows;
var left_middle_same_row, top_middle_same_column;

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
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}	
initialize_tet_table();

function put_pc(l,m,r,i1) {
       var row1,col1,row2,col2;
       var mrow,mcol;
	var tmp;
       
       col1=inv_col1[l];
       row2=inv_row2[r];

       mrow=inv_row3[m];
       mcol=inv_col3[m];
       
      	plain_text[i1] = l_sqr[mrow][ col1];
      	plain_text[i1+1] = r_sqr[row2][mcol];
       

	
}

                		
	
function get_trial_decrypt(){
       var i,j,k, index,x;
       var c1,c2,c3,c4;

       // get inverse key squares
	for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++){
		inv_row1[ l_sqr[i][j] ] = i;
		inv_col1[ l_sqr[i][j] ] = j;
		inv_row2[ r_sqr[i][j] ] = i;
		inv_col2[ r_sqr[i][j] ] = j;	
		inv_row3[ m_sqr[i][j] ] = i;
		inv_col3[ m_sqr[i][j] ] = j;	
           
	}
       index = 0;
       for (j=0;j<buffer.length;j = j+3) {
               c1 = buffer[j];
               c2 = buffer[j+1];
               c3 = buffer[j+2];
			put_pc(c1,c2,c3,index);
               index += 2;
       }
 }

	
function get_squares(left_work_key,top_work_key,middle_work_key){
	var i,j,k,c,n,s;
	    // initialize all keysquares separately so no two are pointing at each other.

    l_sqr = [];
    r_sqr = [];
    m_sqr = [];
    n = 0
    for (i=0;i<keysquare_width;i++){
      l_sqr[i] = [];
      r_sqr[i] = [];
      m_sqr[i] = [];
      for (j=0;j<keysquare_width;j++){
        l_sqr[i][j] = n;
        r_sqr[i][j] = n;
        m_sqr[i][j] = n++
      }
    }
    n = 0;
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        l_sqr[i][j] = alpha.indexOf(left_work_key[n++]);
	n=0;
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        r_sqr[i][j] = alpha.indexOf(top_work_key[n++]);
	n=0;
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        m_sqr[i][j] = alpha.indexOf(middle_work_key[n++]);

}

function get_score(){
	var score,i,n;

    get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<plain_text.length-3;i++){
        if (plain_text[i] >25 || plain_text[i+1] >25 || plain_text[i+2] >25 || plain_text[i+3] >25 )
            continue;
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	



function get_next_key(key){
	var i,j,k,index,s,n;
	var key_array,used_let;
	var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
var J_index = 9;  //alpha.indexOf('J');	
	key = key.toUpperCase();
	key_array = [];
	used_let = [];
	for (i=0;i<26;i++)
		used_let[i] = 0;
	used_let[J_index] = 1;
	index = 0;
	for (i=0;i<key.length;i++){
		n = alpha.indexOf(key.charAt(i) );
		if ( used_let[n] == 0){
			key_array[index++] = n;;
			used_let[n] = 1;
	}
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			key_array[index++] = i;
	s = ''
	for (i=0;i<25;i++)
		s+= alpha.charAt( key_array[i] );
	return(s);
}			

function left_consistent(key){ // is this key consistent with left key's crib?
var i,j,k,c,n,s;
var row, col;
// get rows and columns objects
var row_object = {};
var col_object = {};


row = 0;
col = 0;
for (i=0;i<25;i++){
	c = key[i];
	row_object[c] = row;
	col_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for (i=0;i<left_crib_columns.length;i++) {
	ar = left_crib_columns[i]; // this is a sttring of upper case letters
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if (  col_object[ ar.charAt(j) ]!= col_object[c]  ) // not in same key column 
			return(false);
	}
} // next i

for (i=0;i<left_crib_rows.length;i++) { // left_crib_rows.length can be zero!
	ar = left_crib_rows[i];
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if ( row_object[ ar.charAt(j) ]!= row_object[c]  )
			return(false);
	}
} // next i
	
return(true) ; // passed consistency check	

} // end function
	
function top_consistent(key){ // is this key consistent with top key's crib?
var i,j,k,c,n,s;
var row, col;
// get rows and columns objects
var row_object = {};
var col_object = {};


row = 0;
col = 0;
for (i=0;i<25;i++){
	c = key[i];
	row_object[c] = row;
	col_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for (i=0;i<top_crib_columns.length;i++) {
	ar = top_crib_columns[i]; // this is a sttring of upper case letters
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if (  col_object[ ar.charAt(j) ]!= col_object[c]  ) // not in same key column 
			return(false);
	}
} // next i

for (i=0;i<top_crib_rows.length;i++) { // left_crib_rows.length can be zero!
	ar = top_crib_rows[i];
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if ( row_object[ ar.charAt(j) ]!= row_object[c]  )
			return(false);
	}
} // next i
	
return(true) ; // passed consistency check	

} // end function

function middle_consistent(key){ // is this key consistent with middle key's crib?
var i,j,k,c,n,s;
var row, col;
// get rows and columns objects
var row_object = {};
var col_object = {};


row = 0;
col = 0;
for (i=0;i<25;i++){
	c = key[i];
	row_object[c] = row;
	col_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for (i=0;i<middle_crib_columns.length;i++) {
	ar = middle_crib_columns[i]; // this is a sttring of upper case letters
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if (  col_object[ ar.charAt(j) ]!= col_object[c]  ) // not in same key column 
			return(false);
	}
} // next i

for (i=0;i<middle_crib_rows.length;i++) { // left_crib_rows.length can be zero!
	ar = middle_crib_rows[i];
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if ( row_object[ ar.charAt(j) ]!= row_object[c]  )
			return(false);
	}
} // next i
	
return(true) ; // passed consistency check	

} // end function


class Key_Element {

constructor(key_word,route,work_key){
	this.key_word = key_word;
	this.route = route;
	this.work_key = work_key;
}

}


function left_middle_consistent(left_work_key,middle_work_key){
var i,j,k,c,n,s,r1,r2,c1,c2;

var left_object = {};
var middle_object = {};
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = left_work_key[i];
	left_object[c] = row;
	if ( ++col == 5){
		col = 0;
		row++
	}
}
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = middle_work_key[i];
	middle_object[c] = row;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<left_middle_same_row.length;i++){
	s = left_middle_same_row[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (left_object[c1] != middle_object[c2] )
		return(false); // c1 ,c2 not in same row of left and middle keysquare;
}
return(true);
}

function top_middle_consistent(top_work_key,middle_work_key){
var i,j,k,c,n,s,r1,r2,c1,c2;

var top_object = {};
var middle_object = {};
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = top_work_key[i];
	top_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = middle_work_key[i];
	middle_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<top_middle_same_column.length;i++){
	s = top_middle_same_column[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (top_object[c1] != middle_object[c2] )
		return(false); // c1 ,c2 not in same column of top and middle keysquare;
}
return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
	var i,j,k,c,n,s;
	var key,out_str,ka,work_key, work_key2;
	var left_work_key, top_word_key, middle_work_key;
	var best_score;
    
	postMessage("working");
	var numb_left_keys = 0;
	var numb_top_keys = 0;
	var numb_middle_keys = 0;
	out_str = '';
	var left_keys = [];
	var top_keys = [];
	var middle_keys = [];
    for (i=0;i<word_list.length;i++){
		k = word_list[i];
		key = get_next_key(k);
		//out_str += ' '+key+' ';
		ka = key.split(''); //convert to array
		for (j=0;j<10 ;j++){
			work_key = [];
			for (n1 = 0;n1<25;n1++)
				work_key[n1] = ka[routes[j][n1] ]
			//out_str += work_key+'\n';
			if ( left_consistent(work_key) ){ // to do skip left-right flips, they are redundant
				numb_left_keys++;
				//out_str += 'left consistent\n';
				left_keys.push( new Key_Element(word_list[i], j, work_key) );
				// also add flip unside down route in case need it for middle key alignment
				work_key2 = [];
				x = j+10;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				left_keys.push( new Key_Element(word_list[i], x, work_key2) );
					
			}
			if ( top_consistent(work_key) ){ // to do skip up-down flips, they are redundant
				numb_top_keys++;
				//out_str += 'top consistent\n';
				top_keys.push( new Key_Element(word_list[i], j, work_key) );
				// also add flip left-right route in case need it for middle key alignment
				work_key2 = [];
				x = j+20;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				top_keys.push( new Key_Element(word_list[i], x, work_key2) );
				
			}
			if ( middle_consistent(work_key) ){
				numb_middle_keys++;
				//out_str += 'middle consistent\n';
				middle_keys.push( new Key_Element(word_list[i], j, work_key) );
			}
			
		}
		if ( (i%10000) == 0 ){
			s = "Currently "+i+" words searched. possible keys so far: left "+numb_left_keys+", top "+numb_top_keys+", middle "+numb_middle_keys;
			postMessage(s);
			
		}
	} // next i 
	s = "All "+i+" words searched. possible keys: left "+numb_left_keys+", top "+numb_top_keys+", middle "+numb_middle_keys+"\nSearching for consistent keys . . ."
	postMessage(s);
	out_str += 'number of left keys: '+numb_left_keys+', number of top keys: '+numb_top_keys+', number of middle keys: '+numb_middle_keys+'\n\n';	
	//postMessage(out_str);
	// get consistent key combinations
	var left_middle_array = [];
	for ( i=0;i<left_keys.length;i++){
		left_work_key = left_keys[i].work_key;
		for (j=0;j<middle_keys.length;j++){
			middle_work_key = middle_keys[j].work_key;
			if ( left_middle_consistent(left_work_key,middle_work_key) ) {
				out_str += 'left key: '+left_keys[i].key_word+ ' and middle key: '+middle_keys[j].key_word+' are consistent\n';
				left_middle_array.push( [i,j] );
			}
		}
	}
	var top_middle_array = [];
	for ( i=0;i<top_keys.length;i++){
		top_work_key = top_keys[i].work_key;
		for (j=0;j<middle_keys.length;j++){
			middle_work_key = middle_keys[j].work_key;
			if ( top_middle_consistent(top_work_key,middle_work_key) ) {
				out_str += 'top key: '+top_keys[i].key_word+ ' and middle key: '+middle_keys[j].key_word+' are consistent\n';
				top_middle_array.push( [i,j] );
			}
		}
	}
	//postMessage(out_str);
	out_str += '\n\n';
	best_score = -1000;
	for (i=0;i<left_middle_array.length;i++)
		for (j=0;j<top_middle_array.length;j++)
			if ( left_middle_array[i][1] == top_middle_array[j][1] ){
				get_squares(left_keys[ left_middle_array[i][0]].work_key, top_keys[ top_middle_array[j][0]].work_key,middle_keys[ left_middle_array[i][1]].work_key )
				score = get_score();
				if (score>= best_score){
					best_score = score;
				out_str += 'left key: '+left_keys[ left_middle_array[i][0]].key_word.toUpperCase()+ ' ,middle key: '+middle_keys[ left_middle_array[i][1]].key_word.toUpperCase()+' ,and top key: '+top_keys[ top_middle_array[j][0]].key_word.toUpperCase()+' are consistent\n';
				out_str += 'corresponding routes are left: '+route_name[left_keys[ left_middle_array[i][0]].route]+' ,middle: '+route_name[middle_keys[ left_middle_array[i][1]].route]+ ' ,and top: '+route_name[top_keys[ top_middle_array[j][0]].route]+' \n';
				out_str += 'Plaintext (score '+score.toFixed(0) +'):\n';
				for (x=0;x<plain_text.length;x++){
                         out_str += alpha.charAt(plain_text[x]).toLowerCase();
                }
				out_str += '\n\n';

				}
			}

	//document.getElementById('output_area2').value = out_str;
	out_str += '\n\ndone.'
	postMessage(out_str);
}


onmessage = function(event) { //receiving a message with the string to decode. do search
	debugger;
	/*
	xfer["buffer"] = buffer; // numerical version
	xfer["word_list"] = word_list;
	xfer["left_crib_columns"] = left_crib_columns;
	xfer["left_crib_rows"] = left_crib_rows;
	xfer["top_crib_columns"] = top_crib_columns;
	xfer["top_crib_rows"] = top_crib_rows;
	
	
	xfer["middle_crib_columns"] = middle_crib_columns;
	xfer["middle_crib_rows"] = middle_crib_rows
	xfer["left_middle_same_row"] = left_middle_same_row;
	xfer["top_middle_same_column"] = top_middle_same_column;
	*/
    buffer = event.data.buffer; // numerical version of cipher
	word_list = event.data.word_list;
    left_crib_columns = event.data.left_crib_columns;
	top_crib_columns = event.data.top_crib_columns;
	left_crib_rows = event.data.left_crib_rows;
	top_crib_rows = event.data.top_crib_rows;
	
    middle_crib_columns = event.data.middle_crib_columns;
	middle_crib_rows = event.data.middle_crib_rows;
	left_middle_same_row = event.data.left_middle_same_row;
	top_middle_same_column = event.data.top_middle_same_column;

    do_solve();
};  


