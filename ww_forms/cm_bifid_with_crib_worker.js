importScripts('tettable.js'); 
importScripts('routes.js'); 

var labels;
var word_list;
var buffer;
var max_label;

var tet_table = [];

var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var EMPTY = -1;
var BUFFER_ROW = 0;
var BUFFER_COL = 1;
var CRIB_ROW = 2;
var CRIB_COL = 3;

var numb_symbols = 26;

var rev_labels = [];

var left_crib_columns, left_crib_rows, right_crib_columns, right_crib_rows;
var left_right_same_row, left_right_same_column, left_right_row_column, left_right_column_row;
var period;
var plain_text;
/*
var alpha_extended="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
var plain_text = [];
var l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // left
var r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // right (top)

var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var keysquare_width = 5;
// crib key arrays
var left_crib_columns, left_crib_rows, right_crib_columns, right_crib_rows;
var left_right_same_row;
*/
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

function get_rev_labels(labels,nxt_label){
    var i,j,k,n,c;
    var s,s1,str,s2;
    
    rev_labels = [];
    for (i=0;i<nxt_label;i++)
        rev_labels[i] = [];
        
    for (i=0;i<numb_symbols;i++){
        if (labels[i][BUFFER_ROW] != EMPTY)
            rev_labels[ labels[i][BUFFER_ROW] ].push( ['buffer_row',alpha.charAt(i)] );
        if (labels[i][BUFFER_COL] != EMPTY)
            rev_labels[ labels[i][BUFFER_COL] ].push( ['buffer_col',alpha.charAt(i)] );
        if (labels[i][CRIB_ROW] != EMPTY)
            rev_labels[ labels[i][CRIB_ROW] ].push( ['crib_row',alpha.charAt(i)] );
        if (labels[i][CRIB_COL] != EMPTY)
            rev_labels[ labels[i][CRIB_COL] ].push( ['crib_col',alpha.charAt(i)] );
    }

	
}

function get_trial_decrypt(left_work_key,right_work_key){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;
		var work_array = [];
		var inverse_key = [];
		
		//convert to numerical keys
		var left_num_key = [];		
		for (i=0;i<25;i++)
			left_num_key[i] = alpha.indexOf(left_work_key[i]);
		var right_num_key = [];		
		for (i=0;i<25;i++)
			right_num_key[i] = alpha.indexOf(right_work_key[i]);
		
		plain_text = [];
        // get inverse key 
		for (i=0;i<25;i++) {
			inverse_key[ right_num_key[i] ] = i;
		}    
		index =  y = 0;
        for (x=0;x<buffer.length;x++) {
                c1 = Math.floor((inverse_key[ buffer[x] ]/5));
                c2 = (inverse_key[ buffer[x] ] %5);
                work_array[index++] = c1;
                work_array[index++] = c2;
                if ( index == 2*period) { /* array is filled */
                        for (k=0;k<index/2;k++)
                                plain_text[y++]=left_num_key[ 5*work_array[k]+
                                        work_array[k+period]];
										
                        index = 0;
                } /* end if */
        } /* next x */
        if (index !=0 ) /* finish partially filled work_array */
                for (k=0;k<index/2;k++)
                        plain_text[y++]=left_num_key[ 5*work_array[k]+
                                work_array[k+index/2]];		    
		
}


function get_score(){
	var score = 0.0;
	for (i=0;i<buffer.length-3;i++){
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

function left_consistent(key){ // is this key consistent with  crib?
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

function right_consistent(key){ // is this key consistent with  crib?
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

for (i=0;i<right_crib_columns.length;i++) {
	ar = right_crib_columns[i]; // this is a sttring of upper case letters
	c = ar.charAt(0);
	for(j=1;j<ar.length;j++){
		if (  col_object[ ar.charAt(j) ]!= col_object[c]  ) // not in same key column 
			return(false);
	}
} // next i

for (i=0;i<right_crib_rows.length;i++) { // right_crib_rows.length can be zero!
	ar = right_crib_rows[i];
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

function left_right_consistent(left_work_key,right_work_key){
var i,j,k,c,n,s,r1,r2,c1,c2;

// same row
var left_object = {};
var right_object = {};
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
	c = right_work_key[i];
	right_object[c] = row;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<left_right_same_row.length;i++){
	s = left_right_same_row[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (left_object[c1] != right_object[c2] )
		return(false); // c1 ,c2 not in same row of left and right keysquare;
}
// same column
left_object = {};
right_object = {};
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = left_work_key[i];
	left_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = right_work_key[i];
	right_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<left_right_same_column.length;i++){
	s = left_right_same_column[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (left_object[c1] != right_object[c2] )
		return(false); // c1 ,c2 not in same column of left and right keysquare;
}

// same left row, right column
left_object = {};
right_object = {};
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
	c = right_work_key[i];
	right_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<left_right_row_column.length;i++){
	s = left_right_row_column[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (left_object[c1] != right_object[c2] )
		return(false); // c1 ,c2 not in same column of left and right keysquare;
}

// same left column, right row
left_object = {};
right_object = {};
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = left_work_key[i];
	left_object[c] = col;
	if ( ++col == 5){
		col = 0;
		row++
	}
}
row = 0;
col = 0;
for (i=0;i<25;i++){
	c = right_work_key[i];
	right_object[c] = row;
	if ( ++col == 5){
		col = 0;
		row++
	}
}

for ( i=0;i<left_right_column_row.length;i++){
	s = left_right_column_row[i]; // s is 2 upper case letters;
	c1 = s.charAt(0);
	c2 = s.charAt(1)
	if (left_object[c1] != right_object[c2] )
		return(false); // c1 ,c2 not in same column of left and right keysquare;
}

return(true);
}


function do_solve(){
	var i,j,k,c,n,s;
	var out_str,str;
	var s1,s2,s3,s4;

	get_rev_labels(labels,max_label)
	
	s = "test worker"
	postMessage(s);
	left_crib_rows = [];
  str = "\nleft keysquare letters in same row:\n";
  // get left square letters (have same column index)
  for (i=0;i<max_label;i++)
    if (rev_labels[i].length>1){
        s = '';
        for (v in rev_labels[i])
            if (rev_labels[i][v][0] == 'crib_row')
                s += rev_labels[i][v][1];
		if (s.length>1)
			left_crib_rows.push(s);
				
        s += '\n';
        if (s.length>2)
        str += s;
    }
	left_crib_columns = [];
	str += "\nleft keysquare letters in same column:\n";
  for (i=0;i<max_label;i++)
    if (rev_labels[i].length>1){
        s = '';
        for (v in rev_labels[i])
            if (rev_labels[i][v][0] == 'crib_col')
                s += rev_labels[i][v][1];
		if (s.length>1)
			left_crib_columns.push(s);
				
        s += '\n';
        if (s.length>2)
        str += s;
    }
	right_crib_rows = [];
	str += "\nright keysquare letters in same row:\n";
  for (i=0;i<max_label;i++)
    if (rev_labels[i].length>1){
        s = '';
        for (v in rev_labels[i])
            if (rev_labels[i][v][0] == 'buffer_row')
                s += rev_labels[i][v][1];
		if (s.length>1)
			right_crib_rows.push(s);
				
        s += '\n';
        if (s.length>2)
        str += s;
    }
	right_crib_columns = [];
	str += "\nright keysquare letters in same column:\n";
  for (i=0;i<max_label;i++)
    if (rev_labels[i].length>1){
        s = '';
        for (v in rev_labels[i])
            if (rev_labels[i][v][0] == 'buffer_col')
                s += rev_labels[i][v][1];
		if (s.length>1)
			right_crib_columns.push(s);
				
        s += '\n';
        if (s.length>2)
        str += s;
    }
	left_right_same_row=[];
	left_right_same_column=[];
	left_right_row_column=[];
	left_right_column_row = [];
	str += '\nleft and right key square combinations:\n'	
  for (i=0;i<max_label;i++){
	str+= 'label '+i+'\n';
    if (rev_labels[i].length>0){
        s1 = '';
        s2 = '';
		s3 = '';
		s4 = '';
        for (v in rev_labels[i]){
            if (rev_labels[i][v][0] == 'crib_row')
                s1 = rev_labels[i][v][1][0];
            else if (rev_labels[i][v][0] == 'buffer_row')
                s2 = rev_labels[i][v][1][0];
			else if (rev_labels[i][v][0] == 'buffer_col')
                s3 = rev_labels[i][v][1][0];
			else if (rev_labels[i][v][0] == 'crib_col')
                s4 = rev_labels[i][v][1][0];
			
			if (s1.length>0 && s2.length>0) {
				//s = s1.charAt(0) + s2.charAt(0);
				s = s1+s2;
				if (left_right_same_row.indexOf(s)  == -1){
					left_right_same_row.push(s)
					str += "same row left: "+s1+" right "+s2+", "
				}
			}
			if (s1.length>0 && s3.length>0) {
				//s = s1.charAt(0) + s2.charAt(0);
				s = s1+s3;
				if (left_right_row_column.indexOf(s) == -1){
					left_right_row_column.push(s)
					str += "row left: "+s1+" column right "+s3+", "
				}
			}
			if (s4.length>0 && s2.length>0){
				s = s4+s2;
				if (left_right_column_row.indexOf(s) == -1){
					left_right_column_row.push(s)
					str += "column left: "+s4+" row right "+s2+", "
				}
			}
			if (s4.length>0 && s3.length>0){
				s = s4+s3;
				if( left_right_same_column.indexOf(s) == -1){
					left_right_same_column.push(s)
					str += "same column left: "+s4+" right "+s3+", "
				}
			}
			
		}
			
    }
	str += '\n';
  }
	
	postMessage(str);
	//return; // for testing
	out_str = '';
	var numb_left_keys = 0;
	var left_keys = [];
	var numb_right_keys = 0;
	var right_keys = [];
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


				work_key2 = [];
				x = j+10;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				left_keys.push( new Key_Element(word_list[i], x, work_key2) );
				work_key2 = [];
				x = j+20;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				left_keys.push( new Key_Element(word_list[i], x, work_key2) );
				work_key2 = [];
				x = j+30;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				left_keys.push( new Key_Element(word_list[i], x, work_key2) );

					
			}
			if ( right_consistent(work_key) ){ // to do skip left-right flips, they are redundant
				numb_right_keys++;

				right_keys.push( new Key_Element(word_list[i], j, work_key) );
				// put in flips to allow left-key, right-key alignment.
				
				work_key2 = [];
				x = j+10;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				right_keys.push( new Key_Element(word_list[i], x, work_key2) );
				work_key2 = [];
				x = j+20;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				right_keys.push( new Key_Element(word_list[i], x, work_key2) );
				
				work_key2 = [];
				x = j+30;
				for (y = 0;y<25;y++)
					work_key2[y] = ka[ routes[x][y] ];
				right_keys.push( new Key_Element(word_list[i], x, work_key2) );
					
			}
			
			
		}
		if ( (i%10000) == 0 ){
			s = "Currently "+i+" words searched. possible keys so far: left "+numb_left_keys+" right "+numb_right_keys;
			postMessage(s);
			
		}
	} // next i 
	s = "All "+i+" words searched. possible keys: left "+numb_left_keys+" right "+numb_right_keys;
	s += "\nFinding consistent key combinations . . ."
	debugger;	
	postMessage(s);
	out_str += s+'\n\n';
	best_score = -1000;
	for (i=0;i<left_keys.length;i++){
		left_work_key = left_keys[i].work_key;
		for (j=0; j<right_keys.length;j++){
			right_work_key = right_keys[j].work_key;
			if (left_right_consistent(left_work_key,right_work_key) ) {
				get_trial_decrypt(left_work_key,right_work_key); // outputs plain_text, a global array
				score = get_score();
				if (score>= best_score){
					best_score = score;
				
					out_str += "Keys: ";
					out_str += left_keys[i].key_word+" ,with route "+route_name[left_keys[i].route]+" and "+right_keys[j].key_word+" ,with route: "+route_name[right_keys[j].route]+"\n\n";
					
					//out_str += 'plaintext\n';
					out_str += 'Plaintext (score '+score.toFixed(0) +'):\n';
					for (x=0;x<plain_text.length;x++){
                         out_str += alpha.charAt(plain_text[x]).toLowerCase();
					}
				}	
					out_str += '\n\n'
			}

				
		}
		}
		
	//document.getElementById('output_area2').value = out_str;
	out_str += '\n\ndone.'

	postMessage(out_str);

	
}

onmessage = function(event) { //receiving a message with the string to decode. do search
	debugger;
    buffer = event.data.buffer; // numerical version of cipher
	word_list = event.data.word_list;
	labels = event.data.labels;
	max_label = event.data.max_label;
	period = event.data.period;

    do_solve();
};  


