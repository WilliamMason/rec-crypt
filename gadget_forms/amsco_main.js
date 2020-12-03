var code
var symbols="abcdefghijklmnopqrstuvwxyz-"
var vowels="aeiou";
var c_symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZ-"
var digits = '0123456789';
//var fire_fox=!document.all;
var fire_fox = 1;
var dobj, solving_flag =0;
var key_len;

var numb_long_cols, numb_short_cols, buf_len, numb_rows;
var min_start = new Array();
var max_start  = new Array();
var max_diff = new Array();
var col_pos = new Array();
var inverse_pos = new Array();
var final_decrypt = new Array();
var columns_selected = new Array();
 // special amsco stuff
var start_numb, numb_mid_cols, min_col_len, start_top, top_index,total_rows;
var pair = [];
var work_buffer = [];
var missing_letter_flag;
var y_labels; // number of "yellow labels"


// letters to be colored
var red_let = '';
var green_let = '';
var blue_let = '';
var cyan_let='';


var cribtext='';
var crib_row = -1;

function s_compare(a,b) {
		return b[1]-a[1]
}		

function letter_count() {
	var i,n,str,s;
	var l_count = new Array();
	var s_count = new Array();

	for (i=0;i<26;i++)
		l_count[i] = 0;
		
	for (i=0;i<code.length;i++) {
			n = symbols.indexOf(code.charAt(i))
			if ( n != -1)
				l_count[n] = l_count[n]+1
	}

	for (i=0;i<26;i++)
		s_count[i] = [c_symbols.charAt(i),l_count[i] ]		
	//s_count.sort(s_compare);
	//str = 'Letter counts\n'
    str = 'Letter counts<br>'
	for (i=0;i<26;i++)
		if (s_count[i][1]>9)
			//str = str+s_count[i][0]+" "+s_count[i][1]+"\n";
            str = str+s_count[i][0]+" "+s_count[i][1]+"<br>";
		else
			//str += s_count[i][0]+" 0"+s_count[i][1]+"\n";
            str += s_count[i][0]+" 0"+s_count[i][1]+"<br>";
	//alert(str)
    s = '<span id="letter_display">'
    s += str;
    s += '<center><input type = button id="hide_letter_display3" value="OK"></center>'
    s += '</span>';
    document.getElementById('cm_display').innerHTML=s;
	document.getElementById('letter_display').style.visibility="visible";
    document.getElementById('hide_letter_display3').addEventListener("click", hide_letter_display);  

}	

function hide_letter_display(){
	document.getElementById('letter_display').style.visibility="hidden";
}    
		

function get_column_string(index, offset){
	var s,mr,ri,inx,j,n;
    var co,i,co2, parity, rows_shown;
    var min_crib_index, excess_letters;
    var remainder, condition_s;

    if ( crib_row == -1)
        min_crib_index = 10000;
    else if ( (crib_row&1) == 0)
        min_crib_index = 3*crib_row/2;
    else
        min_crib_index = 3*(crib_row-1)/2+start_top[index];
    /*
    if ( (numb_rows&1) != 0)
        y_labels = numb_long_cols;
    else
        y_labels = numb_long_cols+numb_mid_cols;    
    */
    // alternate y_labels calculation, see notes update 1-19-20
    if ( (key_len %2) == 0) // even number of columns
        excess_letters = buf_len - numb_rows*3*key_len/2;
    else if ( (numb_rows%2) == 0) // even number of rows, odd number of columns
        excess_letters = buf_len - numb_rows*3*(key_len-1)/2 - 3*numb_rows/2
    else // rows and columns both odd
        excess_letters = buf_len - numb_rows*3*(key_len-1)/2 - Math.floor(3*(numb_rows-1)/2) - start_numb;
    
    y_labels = Math.floor(2*excess_letters/3);
    remainder = excess_letters%3;
    if ( ((numb_rows%2) == 0 && start_numb == 1) || ( (numb_rows%2) == 1) && start_numb == 2)
        condition_s = true;
    else
        condition_s = false;
    if ( (remainder == 1) || ( remainder==2 && condition_s) )
        y_labels++;
    /*
	if ( index<y_labels) n=2; // allow 2 extra letters, maybe 1 too many sometimes, but won't hurt anything
	else n = 0;
    */
    n=2; // always allow
	s = '';
	inx = min_start[ col_pos[index]];
    parity = start_top[index];
    j = offset; 
    rows_shown = 0;
    while ( j<min_col_len+max_diff[ col_pos[index] ]+n ) {
        co = code.charAt(inx+j)
        if ( parity == 1) {
            if ( cribtext.indexOf(co) != -1  // color all possible crib letters, that could be in crib_row
                && j >= min_crib_index && j <= min_crib_index + max_diff[col_pos[index]]+n) 
                    co = '<font color="lime">'+co+'</font><br>';
            else if ( co == red_let)
                co = '<font color="red">'+co+'</font><br>';
            else if (co == green_let)
                co = '<font color="green">'+co+'</font><br>';
            else if (co == cyan_let)
                co = '<font color="cyan">'+co+'</font><br>';
            else if (co == blue_let)
                co = '<font color="blue">'+co+'</font><br>';
            else co = co+'<br>';
            s += co;
            parity = 2;
            j++;
         }
         else {
            co2 = code.charAt(inx+j+1);
            if ( cribtext.indexOf(co) != -1  // color all possible crib letters, that could be in crib_row
                && j >= min_crib_index && j <= min_crib_index + max_diff[col_pos[index]]+n) 
                    co = '<font color="lime">'+co+'</font>';
            else if ( co == red_let)
                co = '<font color="red">'+co+'</font>';
            else if (co == green_let)
                co = '<font color="green">'+co+'</font>';
            else if (co == cyan_let)
                co = '<font color="cyan">'+co+'</font>';
            else if (co == blue_let)
                co = '<font color="blue">'+co+'</font>';
            if ( cribtext.indexOf(co2) != -1  // color all possible crib letters, that could be in crib_row
                && j+1 >= min_crib_index && j+1 <= min_crib_index + max_diff[col_pos[index]]+n+1) 
                    co2 = '<font color="lime">'+co2+'</font>';
            else if ( co2 == red_let)
                co2 = '<font color="red">'+co2+'</font>';
            else if (co2 == green_let)
                co2 = '<font color="green">'+co2+'</font>';
            else if (co2 == cyan_let)
                co2 = '<font color="cyan">'+co2+'</font>';
            else if (co2 == blue_let)
                co2 = '<font color="blue">'+co2+'</font>';
            s += co+co2+'<br>';
            parity = 1;
            j += 2;
        }
        rows_shown++;
        if ( rows_shown == numb_rows) break;
    }
	return(s);
}

function get_label(index) {
	var s,mr,ri,inx,j,n;

	s = c_symbols.charAt(col_pos[index]);
	return(s);
}
	
function restore_columns() {
    var j,s,n;
    for (n=0;n<key_len;n++){
        s = get_column_string(n,top_index[n]);
		document.getElementById('col'+n).innerHTML=s;
		s = get_label(n);
        if ( n < y_labels)
            document.getElementById('label'+n).style.backgroundColor = "yellow";
        document.getElementById('label'+n).innerHTML=s;
        
    }
	for (j=0;j<key_len;j++)
		document.ciphertext.colbox[j].checked = false;
}    
function start_over(){
    var i;
    
    show_box(2,"Start over?");
 }

function do_undo(){
    var i;
    close_box();
    for (i=0;i<key_len;i++) {
        col_pos[i]=i;
        top_index[i] = 0;
    }
    restore_columns();
}    

function input_ok() {
	var s='Ciphertext: (Type or paste cipher into this box, enter the key length, click Initialize button)<BR>';
	s=s+'<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
	document.getElementById('outputblock').innerHTML=s;			
	s = '<span style="font-weight:bold;">Enter key length=></span>'
	s += '<input type = text name=key_len_entry  size = 3 id="checkEnter4">';
    s += '<input type = button value="Initialize" id="do_setup4">';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '<INPUT id="get_from_disk4" type=button value="retrieve work from disk" >';
	document.getElementById('key_lenblock').innerHTML=s;	
	document.getElementById('swapblock').innerHTML= ' ';
    document.getElementById('checkEnter4').addEventListener("keypress", checkEnter);    
    document.getElementById('get_from_disk4').onclick=get_from_disk;
    document.getElementById('do_setup4').onclick=do_setup;    
}

function make_pairs(){
	var i,j,row,col;
	var count,row_start,pr;

    missing_letter_flag = 0; // in case you need to start the min_start one letter to the left of normal position.
	row_start = start_numb-1;
	count = row = 0;
	while( count < buf_len) {
        pair[row] = [];
		pr = row_start;
		row_start ^= 1;
		for (col = 0; col<key_len;col++) {
			if ( count >= buf_len)
				pr = 2;
			switch(pr) {
			case 2:
				pair[row][col]= -1;
				break;
			case 0:
				pair[row][col]= 1;
				count++;
				break;
			case 1:
				pair[row][col]= 2;
				count += 2;
				break;
			}
			pr ^= 1;
		}
		row++;
	}
	total_rows = row;
	if ( count > buf_len) {
		//printf("Last cell not full\n");
        missing_letter_flag = 1;
		j = row-1;
		for ( col= key_len-1; col> -1;col--)
			if ( pair[j][col] ==2) {
				pair[j][col]--;
				break;
		}
	}
} /* end make pairs */

function do_decrypt(){
    var c;
    var i,j,index, row,col;
    var count,cc,ct,cn;

    make_pairs();
    var key = [];
	for (j=0;j<key_len;j++) {
        key [ col_pos[j] ] = j; // really it's inverse key
	}
    work_buffer  = [];
    index = 0;
    for (i=0;i<total_rows;i++) work_buffer[i] = [];
    for (i=0;i<key_len;i++) {
		for (j=0;j<total_rows;j++)
			if ( pair[j][key[i]]==1)
                   	work_buffer[j][key[i]] = code.charAt(index++);
           	else if ( pair[j][key[i]]==2){ /* store digraph */
                   	work_buffer[j][key[i]] = code.charAt(index)+code.charAt(index+1);
                   	index += 2;
           	}
    } /*  next i */
    /* unpack work buffer into final buffer */
    final_decrypt = [];
    j = 0;
    row = col = 0;
    count = 0;
    while( count < buf_len) {
        count += work_buffer[row][col].length;
        final_decrypt[j++] = work_buffer[row][col++];
        if ( col == key_len) {
			row++;
			col = 0;
		}
    } /* end while */
	s='';
	j = 0;
	for (i=0;i<final_decrypt.length;i++){
		s += final_decrypt[i];
		if (++j == key_len){
			s += '\n';
			j = 0;
		}
	}
	s += '\n';
	s += '\nkey: '
	for (j=0;j<key_len;j++)
		s += c_symbols.charAt(col_pos[j]);
	s += '\n';
	//document.getElementById('decrypt_place').value=s;
    display_message(s);
}

function color_letters(){
    var s;
	s = '<span id="c_display">';
    s += 'Enter up to four letters to be colored in the cipher display:<br><br>';
    s += '<font color="red">Red </font>letter <input type="text" size="2" maxlength="1" id = "redLet" value='+red_let+'> &nbsp;&nbsp;&nbsp;';
    s += '<font color="cyan">Cyan </font>letter <input type=text size="2" maxlength="1" id = "cyanLet" value='+cyan_let+'><br>';
    s += '<font color="green">Green </font>letter <input type=text size="2" maxlength="1" id = "greenLet" value='+green_let+'> &nbsp;&nbsp;&nbsp;';
    s += '<font color="blue">Blue </font>letter <input type=text size="2" maxlength="1" id = "blueLet" value='+blue_let+'> ';
	s += '<br><br><center><input value="OK" id="hide_messagec5" type="button">';
    s += ' <input value="Clear" id="clear_messagec5" type="button">';
    s += ' <input value="Cancel" id="cancel_messagec5" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('c_display').style.visibility="visible";
    document.getElementById('redLet').focus();
    document.getElementById('hide_messagec5').addEventListener("click", hide_messagec);        
    document.getElementById('clear_messagec5').addEventListener("click", clear_messagec);
    document.getElementById('cancel_messagec5').addEventListener("click", cancel_messagec);            
}

function cancel_messagec(){
	document.getElementById('c_display').style.visibility="hidden";
}


function clear_messagec(){
    document.getElementById('redLet').value = '';
    document.getElementById('cyanLet').value = '';
    document.getElementById('greenLet').value = '';
    document.getElementById('blueLet').value = '';
}

function hide_messagec(){
    red_let = document.getElementById('redLet').value;
    if (red_let != '') red_let = red_let.charAt(0).toLowerCase();
    green_let = document.getElementById('greenLet').value;
    if (green_let != '') green_let = green_let.charAt(0).toLowerCase();
    blue_let = document.getElementById('blueLet').value;
    if (blue_let != '') blue_let = blue_let.charAt(0).toLowerCase();
    cyan_let = document.getElementById('cyanLet').value;
    if (cyan_let != '') cyan_let = cyan_let.charAt(0).toLowerCase();
    
	document.getElementById('c_display').style.visibility="hidden";
    restore_columns();
}

function numb_complete_rows(cipher_len, numb_cols,start_numb){
    var numb_complete_rows, current_start,n, numb_remaining;
    if ((numb_cols&1) == 0){ //even number of columns
        numb_complete_rows = Math.floor( cipher_len/(3*numb_cols/2) ) ;
        return( numb_complete_rows);
    }
    numb_complete_rows = 0
    current_start = start_numb;
    n = Math.floor(3*(numb_cols-1)/2)+current_start ;
    numb_remaining = cipher_len;

    while (numb_remaining >= n ){
        numb_remaining -= n;
        numb_complete_rows += 1;
        if (current_start == 1)
            current_start = 2;
        else
            current_start = 1;
        n = Math.floor(3*(numb_cols-1)/2)+current_start
    }
    return( numb_complete_rows);
}

function get_short_long_cols(cipher_len, numb_cols,start_numb, numb_rows){
    var excess_letters, numb_short_short,numb_short_long,numb_long_short,numb_long_long;
    var numb_remaining,n, current_start;
    
    if ((numb_rows&1)==0){
        excess_letters = cipher_len - (3*numb_rows/2)*numb_cols ;
        numb_long_long = 0;
        numb_long_short = 0;
        numb_remaining = excess_letters;
        n = start_numb;
        while (numb_remaining > 0 ){
            numb_remaining -= n;
            if (n==1 ){
                numb_long_short += 1;
                n = 2;
            }
            else {
                numb_long_long += 1;
                n = 1;
            }
        }
        numb_short_short = numb_cols - numb_long_long-numb_long_short;
        numb_short_long = 0;
        return( [numb_short_short,numb_long_short,numb_long_long]);
    }    
    numb_short_long = 0;
    numb_short_short = 0;
    numb_remaining = cipher_len;
    current_start = start_numb;
    n = current_start + 3*(numb_rows-1)/2;
    while (numb_remaining >= n ){
        numb_remaining -= n;
        if (current_start==1 ){
            numb_short_short += 1;
            current_start = 2;
        }
        else {
            numb_short_long += 1;
            current_start = 1;
        }
        n = current_start + 3*(numb_rows-1)/2;
    }
    numb_long_short = 0;
    numb_long_long = 0;
    if (start_numb == 2)
        current_start = 1; // opposite start since odd number of complete rows.
    else
        current_start = 2;
    while (numb_remaining > 0 ){// remove long cols from short counts;
        numb_remaining -= current_start;
        if (current_start==1 ){
            numb_short_long -= 1; //in this case current = 1 corresponds to short-long
            current_start = 2;
        }
        else {
            numb_short_short -= 1 ; //in this case current = 2 corresponds to short-short
            current_start = 1 ;
        }
        numb_long_short += 1;
    }
    return ([numb_short_short,numb_short_long,numb_long_short]);
}

function move_column_up(index){
    var s,n;
    
    /*
    if (index<y_labels) n = 2;
    else n = 0;
    */
    n=2; // always allow 2 extra letters
    if (top_index[index] < max_diff[col_pos[index]]+n)
        top_index[index]++;
    s = get_column_string(index,top_index[index]);
    document.getElementById('col'+index).innerHTML=s;
    document.getElementById('col'+index).style.overflow='hidden';
}
function move_column_down(index){
    var s;
    
    if (top_index[index]>0) top_index[index]--;
    s = get_column_string(index,top_index[index]);
    document.getElementById('col'+index).innerHTML=s;
}


function setup_code_columns() {
	var i,j,n;
	var elm,s;
    var result;

    if ( document.getElementById('cipher_place') ){    	
        data = document.ciphertext.cipher_place.value;
        if (data.length<2){
            show_box(0,"No ciphertext entered!");
            return;
        }
        data = data.toLowerCase();
        state=0;
        code = '';
        for (i=0;i<data.length;i++) {
            c = data.charAt(i);
            if ( symbols.indexOf(c) >-1 && symbols.indexOf(c)< 26) {
                    code = code+c;
            }
        }
        buf_len = code.length;
    }
    //start_numb = 2;
    if ( document.getElementById('letter_pair').checked)
        start_numb = 2;
    else
        start_numb = 1;
    numb_rows = numb_complete_rows(buf_len,key_len,start_numb);
    result = get_short_long_cols(buf_len, key_len,start_numb, numb_rows);
    numb_short_cols = result[0];
    numb_mid_cols = result[1];
    numb_long_cols = result[2];
    top_index = []; // index of letter within column to put at top
    for (j=0;j<key_len;j++)
        top_index[j] = 0;
    if ( (numb_rows&1) == 0)
        min_col_len = 3*numb_rows/2;
    else
        min_col_len = 3*(numb_rows-1)/2+1;
	min_start[0] = 0;
	n = 0;
	for (j=1;j<key_len;j++) {
		if ( n<numb_short_cols) {
			min_start[j] = min_start[j-1]+min_col_len;
			n++;
		}
        else if ( n<numb_short_cols+numb_mid_cols) {
			min_start[j] = min_start[j-1]+min_col_len+1;
			n++;
		}
		else {
			min_start[j] = min_start[j-1]+min_col_len+2;
		}
	}
	max_start[0]= max_diff[0] = 0;
	n = 0;
	for (j=1;j<key_len;j++) {
		if ( n<numb_long_cols) {
			max_start[j] = max_start[j-1]+min_col_len+2;
			n++;
		}
		else if ( n<numb_long_cols+numb_mid_cols) {
			max_start[j] = max_start[j-1]+min_col_len+1;
			n++;
		}
		else {
			max_start[j] = max_start[j-1]+min_col_len;
		}
		max_diff[j] = max_start[j]-min_start[j];
	}
    // now check if a letter is missing from the final pair
    make_pairs(); // sets missing_letter flag
    if ( missing_letter_flag == 1){
        for (j=1;j<key_len;j++){
            min_start[j]--;
            max_diff[j]++;
        }
    }
    start_top = []
    n = start_numb;
    for (i=0;i<key_len;i++){
        start_top[i] = n;
        if ( n==1) n = 2;
        else n = 1;
    }
	// Use HTML table so checkboxes will align with code columns
	s = '';
    s += '<b>Transposition Block:</b>';
	s += '<table><tr>'
    n = numb_rows; 
    //i = n+1; // use number of rows+1 for height.
    i = n;
	for (j=0;j<key_len;j++){
		s += '<td valign=top>';
        s += '<div id = "col'+j+'" class="colx"';
		s += ' " style="font-family:monospace;font-size:15px; ';
        s += ' height:'+i+'em; width:3em"> </div>'; // include width because amsco needs room for letter pairs
        //
		s += '</td>';
	}
    // space for row numbers
	s += '<td>';
    s += '<div id = "row_numbs" class="coly" ';
	s += 'styLe="font-family:monospace;font-size:15px; height:'+n+'em;"> </div>';
	s += '</td>';
	// space for labels
	s +='</tr><tr>';
	for (j=0;j<key_len;j++) {
		s += '<td>'
        s += '<div id = "label'+j+'" class="colz" draggable="true" >&nbsp;&nbsp;</div>';
		s += '</td>';
	}
	// row label
	s += '<td>'
	s += '<input type="text" size=3 value = "Row" id = "row_label" >';
	s += '</td>';
    
	s +='</tr><tr>';
	for (j=0;j<key_len;j++) {
		s += '<td>'
		s += '<input type="checkbox"  align="MIDDLE" name="colbox" value='+j+' id = "colbox'+j+'" > &nbsp ';
		s += '</td>';
		columns_selected[j] = 0;
	}
	s +='</tr><tr>';    
    // add temporary space for up and down buttons
	for (j=0;j<key_len;j++) {
		s += '<td>'
		s += '<img src="up_arrow3.png" id = "upbox'+j+'" >';
		s += '<img src="down_arrow3.png"id = "downbox'+j+'" >';        
		s += '</td>';
	}

    /*
	for (j=0;j<key_len;j++) {
		s += '<td>'
		s += '<input type="button"   value="U" id = "upbox'+j+'" >';
		s += '<input type="button"   value="D" id = "downbox'+j+'" >';        
		s += '</td>';
	}
    */
	s += '</tr></table>';
	document.getElementById('outputblock').innerHTML=s;	
	for (i=0;i<key_len;i++) {
		col_pos[i]=i;
	}
	for (i=0;i<key_len;i++){
		s = get_column_string(i,0);
        document.getElementById('col'+i).innerHTML=s;
        document.getElementById('col'+i).style.overflow='hidden';
	}
    // row numbers
    s=''
    for (i=1;i<=numb_rows;i++){
        if ( i == (crib_row+1))
            s += '<font color="lime">';
        s += '<span class="r_label'+i+'" style="cursor:default;" >';
        if (i<10) s += '&nbsp;';
        s += i+'<br>';
        s += '</span>';
        if ( i == (crib_row+1))
            s += '</font>';
    }
    document.getElementById('row_numbs').innerHTML=s;	
	// put in labels
	for (i=0;i<key_len;i++){
		s = get_label(i);
        document.getElementById('label'+i).innerHTML=s;
		
	}
	show_swap();
    // add event listeners
    for (j=0;j<key_len;j++) { // move strings up and down within column, takes place of vertical sliders.
        document.getElementById('upbox'+j).addEventListener("click", function(){
            var n;
            n = parseInt(this.id.slice(5)); // number after 'upbox'
            move_column_up(n)
        });  
        document.getElementById('downbox'+j).addEventListener("click", function(){
            var n;
            n = parseInt(this.id.slice(7)); // number after 'downbox'
            move_column_down(n)
        });  
    }
    for (j=0;j<key_len;j++) {
        document.getElementById('label'+j).addEventListener('dragstart',function (event) {
            // store the ID of the element, and collect it on the drop later on
            event.dataTransfer.setData('Text', this.id);
            // for debugging
            //document.getElementById('log').textContent += this.id + '\n';    
        });
        document.getElementById('label'+j).addEventListener('dragover',  function (event) {
            var pos1,pos2;        
            // stops the browser from redirecting off to the text.
            if (event.preventDefault) {
                event.preventDefault();
            }
        });
        
        document.getElementById('label'+j).addEventListener('drop',  function (event) {
            var pos1,pos2;        
            // stops the browser from redirecting off to the text.
            if (event.preventDefault) {
                event.preventDefault();
            }

             var s =event.dataTransfer.getData('Text');
             pos1 = parseInt(s.slice(5)); // number after 'label'
             pos2 = parseInt(this.id.slice(5)) // number after 'label'
             if ( pos2 < pos1)
                insert_left(pos1,pos2);
             else if (pos1<pos2)
                insert_right(pos2,pos1);
             else // columns the same!
                restore_columns();
             // for debugging
            // document.getElementById('log').textContent += 'dropped '+s + ' at '+this.id+'\n';    
  
             return false;
        });        
    }
}	

function selectmouse(e) {
 var x,s,l,n;
  var fobj       = fire_fox ? e.target : event.srcElement;
  
	if (fobj.className.slice(0,7)=="r_label" ){
		x = fobj.className.slice(7);
        n = parseInt(x);
        crib_row = n-1;
		get_crib();
        return(false)
	}
    return(true);
}
		
document.onmousedown=selectmouse;


function get_crib() {
    var i;
    var n;
    
    var s;
	s = '<span id="c_display"><br>';
    s += 'Crib: <input type="text" size="30" id = "crib_string" value="'+cribtext+'" ><br>';
    s += 'Show possible <font color="lime"> crib letters </font> for row: <input type=text size="2"';
    n = crib_row+1;
    s += 'value="'+n+'" id = "crib_row" > ';
    s += '<br> <input type="checkbox" id = "crib_missing"  checked > Color crib letters missing from row';
	s += '<br><br><center><input value="OK" id="hide_messagecr6" type="button">';
    s += ' <input value="Clear" id="clear_messagecr6" type="button">';
    s += ' <input value="Cancel" id="cancel_messagecr6" type="button">';
    s += '<br><br>(You can pop up this box by clicking a row number)</center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('c_display').style.visibility="visible";
    document.getElementById('hide_messagecr6').addEventListener("click", hide_messagecr);        
    document.getElementById('clear_messagecr6').addEventListener("click", clear_messagecr);
    document.getElementById('cancel_messagecr6').addEventListener("click", cancel_messagecr);            
    
    document.getElementById('crib_string').focus();
}

function hide_messagecr(){  
    var i,c;
    var s,crib;
	var mr,ri,inx,j,n;
    var co,index;
    var crib_missing_flag,cnt;
    
    var used_crib_let = [];
    var needed_crib_let = [];
    var min_crib_index,m;
    
	cribtext='';
    crib = document.getElementById('crib_string').value;
	crib = crib.toLowerCase();	
	for (i=0;i<crib.length;i++) {
		c = crib.charAt(i);
		if (symbols.indexOf(c) !=-1 ) {//allow '-' chars in crib!
			cribtext = cribtext+c;
		}
	}
    crib_row = parseInt(document.getElementById('crib_row').value);
    if (isNaN(crib_row)){
        show_box(0,"No crib row entered!");
        crib_row = -1;
    }
    else
        crib_row--; // make relative to zero
    // update row number colors
    s=''
    for (i=1;i<=numb_rows;i++){
        if ( i == (crib_row+1))
            s += '<font color="lime">';
        s += '<span class="r_label'+i+'" style="cursor:default;" >';    
        if (i<10) s += '&nbsp;';
        s += i+'<br>';
        s += '</span>';
        if ( i == (crib_row+1))
            s += '</font>';
    }
    document.getElementById('row_numbs').innerHTML=s;	
    // check for crib letters that cannot be moved to this row
    if (document.getElementById('crib_missing').checked)
        crib_missing_flag = true;
    else
        crib_missing_flag = false;
    for (i=0;i<26;i++) {
        used_crib_let[i]=0;
        needed_crib_let[i]=0;
    }
    for (index = 0;index<key_len;index++) {
        if ( index<y_labels) n=2; 
        else n = 0;
        if ( (crib_row&1) == 0)
            min_crib_index = 3*crib_row/2;
        else
            min_crib_index = 3*(crib_row-1)/2+start_top[index];
        inx = min_start[ col_pos[index] ];
        m = start_top[index]-1; // 0 or 1, must allow for possible second letter in crib row
        for (j=0;j<crib_row;j++)
            m ^= 1;
        for (j=0;j<min_col_len+max_diff[col_pos[index]]+n ; j++){
            co = code.charAt(inx+j)
            if ( cribtext.indexOf(co) != -1  // possible crib letter, that could be in crib_row
                && j >= min_crib_index && j<= min_crib_index + max_diff[col_pos[index]]+n+m) 
                used_crib_let[symbols.indexOf(co)] += 1;
        }
    }
    cnt = 0;
    if (crib_missing_flag){
        red_let = '';
        green_let='';
        cyan_let='';
        blue_let='';
    }
    s='';
    for (j=0;j<cribtext.length;j++) {
        co = cribtext.charAt(j);
        n = symbols.indexOf(co);
        needed_crib_let[n]++;
    }
    for (n=0;n<26;n++) {
        co = symbols.charAt(n);
        /* for testing
        if (needed_crib_let[n]>0){
            s += 'needed '+co+' '+needed_crib_let[n]+' present '+used_crib_let[n]+'  ';
        }
        */
        if (used_crib_let[n] < needed_crib_let[n]) {
            i = needed_crib_let[n] - used_crib_let[n];
            s += co+'('+i+') ';
            if(crib_missing_flag){
                if (cnt==0)
                    red_let = co;
                else if (cnt==1)
                    cyan_let = co;
                else if (cnt==2)
                    blue_let = co;
                else if (cnt == 3)
                    green_let = co;
                cnt++;
            }
        }
    }
    if ( s != ''){
        s = "Crib letters missing from row: "+s;
        show_box(0,s);
     }
    document.getElementById('c_display').style.visibility="hidden";
    restore_columns();     
}

function cancel_messagecr(){
    document.getElementById('c_display').style.visibility="hidden";
}    


function clear_messagecr(){
    document.getElementById('crib_string').value = '';
    document.getElementById('crib_row').value = '0';
}    

function redirect() {
	window.location="myszkowski_lowres.html";
}

function screen_check() {
	if (screen.width <1000) {
		redirect();
	}
	//make sure browser size is maximized
	top.window.moveTo(0,0); 
	if (!fire_fox) 
	    top.window.resizeTo(screen.availWidth,screen.availHeight);
	else if (document.layers || document.getElementById){ 
	   if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < 
			screen.availWidth) {
	      top.window.outerHeight = top.screen.availHeight; 
	      top.window.outerWidth = top.screen.availWidth; 
	   } 
	} 
}

function show_swap() {
	var s;
	
	//s = 'decrypt:&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s =' &nbsp;<INPUT id="do_decrypt7" type=button value="decrypt using current columns" >';    
	//s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';  
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp';    
    s +=  '&nbsp <INPUT id="color_letters7" type=button value="color letters" >';  
    s += '&nbsp  <INPUT id="get_crib7" type=button value="crib" >';    
    //s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp <INPUT id="letter_count7" type=button value="letter count" >';
	//s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp';
	document.getElementById('swapblock').innerHTML= s;
    document.getElementById('do_decrypt7').addEventListener("click", do_decrypt);            
    document.getElementById('color_letters7').addEventListener("click", color_letters);  
    document.getElementById('get_crib7').addEventListener("click", get_crib);  
    document.getElementById('letter_count7').addEventListener("click", letter_count);  
}
function setup_swap() {
	var n,j,i, col1,col2;
    var sr1,sr2;
	
	cnt = 0
	col1 = -1;
	col2 = -1;
	for (j=0;j<key_len;j++)
		if (document.ciphertext.colbox[j].checked ==true) {
			cnt +=1;
			if (col1 == -1) col1 = j;
			else col2 = j;
	}
	/*
	s = 'there are '+cnt+' boxes checked, leftmost is '+col1+' and right most is '+col2;		
	document.debug.output_area.value= s;
	*/
	if (cnt<2){
		show_box(0,"Less than 2 columns checked!");
		return
	}
	if ( cnt>2){
		show_box(0,"More than 2 columns checked!");
		return
	}
	n = col_pos[col1];
    sr1 = top_index[col1];
	col_pos[col1] = col_pos[col2];
	col_pos[col2] = n;
    top_index[col1] = top_index[col2];
    top_index[col2] = sr1;
    restore_columns();
}

function rotate_left(){
	var n,j,i, col1,col2;
    var ta,line_height,s; 
	var temp = [];
    
    for (j=0;j<key_len;j++) temp[j] = top_index[j];
	cnt = 0
    col1 = 0;
    col2 = key_len-1;
    //move leftmost column to rightmost column and shift all other columns left.
    n = col_pos[col1];
    for (j=0;j<key_len-1;j++)
        col_pos[j] = col_pos[j+1];
    col_pos[key_len-1] = n;
    n = temp[col1];
    for (j=0;j<key_len-1;j++)
        top_index[j] = temp[j+1];
    top_index[key_len-1] = n;
    move_column_up(key_len-1);
    restore_columns();
    
}

function insert_right(right_pos,left_pos) { // partial rotate left from right_pos to left pos
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
    for (j=0;j<key_len;j++) temp[j] = top_index[j];
    //move leftmost column to rightmost column and shift all other columns left.
    n = col_pos[left_pos];
    for (j=left_pos;j<right_pos;j++)
        col_pos[j] = col_pos[j+1];
    col_pos[right_pos] = n;
    n = temp[left_pos];
    for (j=left_pos;j<right_pos;j++)
        top_index[j] = temp[j+1];
    top_index[right_pos] = n;
    restore_columns();
}


function insert_left(right_pos,left_pos) { // partial rotate right from left_pos to right pos
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
    for (j=0;j<key_len;j++) temp[j] = top_index[j];
    //move rightmost column to leftmost column and shift all other columns right.
    n = col_pos[right_pos];
    for (j=right_pos;j>left_pos;j--)
        col_pos[j] = col_pos[j-1];
    col_pos[left_pos] = n;
    n = temp[right_pos];
    for (j=right_pos;j>left_pos;j--)
        top_index[j] = temp[j-1];
    top_index[left_pos] = n;
    restore_columns();
}


function rotate_right(){
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
	for (j=0;j<key_len;j++) temp[j] = top_index[j];
	cnt = 0
    col1 = key_len-1;
    col2 = 0;

    //move rightmost column to leftmost column and shift all other columns right.
    n = col_pos[col1];
    for (j=key_len-1;j>0;j--)
        col_pos[j] = col_pos[j-1];
    col_pos[0] = n;
    n = temp[col1];
    for (j=key_len-1;j>0;j--)
        top_index[j] = temp[j-1];
    top_index[0] = n;
    move_column_down(0);
    restore_columns();

}

function show_directions() {
    var s,str;
    str = '';
    str += '<b>Directions</b><br>';
    str += 'Click button to set letter-pair or single-letter start.<br>';
	str += 'To swap columns, check the boxes below them, & click swap button.<br>'
	    str += "To move a column, drag its column label to the label where you want it to go. <br>";
	str += ' Click colored arrows to align vertically.<br> When layout looks correct, click decrypt button.';
   s = '<span id="direction_display">'
    s += str;
    s += '<br><br><center><input type = button id="hide_direction_display3" value="OK"></center>'
    s += '</span>';
    document.getElementById('cm_display').innerHTML=s;
	document.getElementById('direction_display').style.visibility="visible";
    document.getElementById('hide_direction_display3').addEventListener("click", function(){
        document.getElementById('direction_display').style.visibility="hidden";
    });

}


function initialize_buttons(){
    var s;
	s = '<br>key length: <input type = text name=key_len_entry value =' +key_len+' size = 3 id="checkEnter1" >'
	s += ' &nbsp <INPUT id="setup_swap1" type=button value="swap checked columns" >';
    s += '&nbsp <INPUT id="rotate_left1" type=button value="rotate left" >';
    s += '&nbsp <INPUT id="rotate_right1" type=button value="rotate right" >';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '<input type="radio" id="letter_pair" name="numb_start"  checked > pair start';
    s += '<input type="radio" id="single_letter" name="numb_start" > single-letter start';

    s += '<br><br> &nbsp <INPUT id="directions1" type=button value="Directions" >';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp &nbsp &nbsp ';
    s += '&nbsp  <INPUT id="start_over1" type=button value="Start over" >';
	s += '&nbsp  <INPUT id="do_clear1" type=button value="Erase" >';
       
       s+='<INPUT id="save_to_disk2" type=button value="save work to disk" >';
       s+=' <INPUT id="get_from_disk2" type=button value="retrieve work from disk" >';
       s+=' <INPUT id="clear_disk2" type=button value="clear work from disk" >';
 

	document.getElementById('key_lenblock').innerHTML=s;
    document.getElementById('checkEnter1').addEventListener("keypress", checkEnter);    
    document.getElementById('setup_swap1').addEventListener("click", setup_swap);    
    document.getElementById('rotate_left1').addEventListener("click", rotate_left);        
    document.getElementById('rotate_right1').addEventListener("click", rotate_right);    
    document.getElementById('directions1').addEventListener("click", show_directions);                
    document.getElementById('start_over1').addEventListener("click", start_over);            
    document.getElementById('do_clear1').addEventListener("click", do_clear);                
    document.getElementById('save_to_disk2').addEventListener("click", save_to_disk);                    
    document.getElementById('get_from_disk2').addEventListener("click", get_from_disk);   
    document.getElementById('clear_disk2').addEventListener("click", clear_disk); 
    document.getElementById('letter_pair').addEventListener("click", check_start_letters);        
    document.getElementById('single_letter').addEventListener("click", check_start_letters);        
}    

function do_setup(){
	key_len = parseInt(document.ciphertext.key_len_entry.value);		
    initialize_buttons();
	setup_code_columns();
    restore_columns();
}    

function check_start_letters(){
    var i;
    var temp = [];
    var temp2 = [];
    if ( document.getElementById('letter_pair').checked && start_numb == 2)
        return;
    if ( document.getElementById('single_letter').checked && start_numb == 1)
        return;
    for (i=0;i<key_len;i++) {
        temp[i] = col_pos[i];
        temp2[i] = top_index[i];
    }
	setup_code_columns();
    for (i=0;i<key_len;i++) {
        col_pos[i] = temp[i];
        top_index[i] = temp2[i];
    }
    restore_columns();
}    
    
        


function checkEnter(e){ //e is event object passed from function invocation by entering a new key_len
	var characterCode //literal character code will be stored in this variable

	//next 2 lines for debuging
	//s = "you pressed a key";
	//document.debug.output_area.value= s; 	
		
	if(e && e.which){ //if which property of event object is supported (NN4)
		e = e
		characterCode = e.which //character code is contained in NN4's which property
	}
	else{
		e = event
		characterCode = e.keyCode //character code is contained in IE's keyCode property
	}
	
	if(characterCode == 13){ //reset key_len
        do_setup();
		return false
	}
	else{
		return true
	}

}

function save_to_disk(){
	var i,j, str;
	
	if (typeof(localStorage) == 'undefined' ) {
		show_box(0,'Your browser does not support HTML5 localStorage. Try Chrome.');
	} 
	else {
		try {
			localStorage.setItem("amsco.cipher", code); //saves to the database, “key”, “value”
			localStorage.setItem("amsco.period", key_len);
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			show_box(0,'Quota exceeded!'); //data wasn’t successfully saved due to quota exceed so throw an error
			}
		}
	}
    str = ''+start_numb;
	localStorage.setItem("amsco.startNumb", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += col_pos[i]+':';
	}
	localStorage.setItem("amsco.colOrder", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += top_index[i]+':';
	}
	localStorage.setItem("amsco.topIndex", str);

	show_box(0,"Work saved on disk");

}

function get_from_disk(){
	var s,i,j,k;
    var temp;

	temp = localStorage.getItem("amsco.cipher");
	if (temp == undefined){
		show_box(0,"No cipher stored");
		return
	}
    code = temp;
	key_len = parseInt(localStorage.getItem("amsco.period"));
    if ( document.getElementById('cipher_place') ){    
        document.ciphertext.cipher_place.value = code;
        initialize_buttons();
        setup_code_columns();
    }
    s = localStorage.getItem("amsco.startNumb")
    i = parseInt(s);
    if ( i==2){
        document.getElementById('single_letter').checked = false;
        document.getElementById('letter_pair').checked = true;
    }
    else {
        document.getElementById('single_letter').checked = true;
        document.getElementById('letter_pair').checked = false;
    }
    setup_code_columns();
    s = localStorage.getItem("amsco.colOrder")
    s = s.split(':');
    for (i=0;i<key_len;i++)
        col_pos[i] = parseInt(s[i]);
    //  reset top index
    s = localStorage.getItem("amsco.topIndex")    
    s = s.split(':');
    for (i=0;i<key_len;i++)
        top_index[i] = parseInt(s[i]);
    restore_columns();
}

function clear_disk(){
	localStorage.removeItem("amsco.cipher");
	localStorage.removeItem("amsco.period");
    localStorage.removeItem("amsco.startNumb")
	localStorage.removeItem("amsco.colOrder");    
	localStorage.removeItem("amsco.topIndex");        
	show_box(0,"work cleared from disk");
}

function do_clear() {
    //var do_erase;
    
    show_box(1,"Erase the current cipher?")
}	

function do_erase(){
    close_box();
	input_ok();
	document.ciphertext.cipher_place.value='';
    red_let = '';
    green_let = '';
    blue_let = '';
    cyan_let='';
    cribtext='';
    crib_row = -1;
}


function display_message(message){
	var s;
	
	s = '<span id="m_display">';
	//s += message;
    s += '<textarea id="display_area" cols=50 rows=20 ></textarea>';
	s += '<br><br><center><input value="Close" id="hide_message8" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('m_display').style.visibility="visible";
    document.getElementById('display_area').value = message;
    document.getElementById('hide_message8').addEventListener("click", hide_message);  
}

function hide_message(){
	document.getElementById('m_display').style.visibility="hidden";
}


function show_box(n,message){ // n=0 1 choice, 2 for 2 choices
    var str;
    document.getElementById('light').style.display='block';
    document.getElementById('fade').style.display='block';
    str ='';
    str += message;
    str += '<br>';
    if ( n==0)
        str += '<br><input type = button id="close_box9" value="OK">'
    else if ( n==1) { // erase cipher
        str += '<br><input type = button id="do_erase9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    else if ( n==2) { // start over
        str += '<br><input type = button id="do_undo9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    document.getElementById('light').innerHTML = str;
    if ( n==0)
        document.getElementById('close_box9').addEventListener("click", close_box);  
    else if ( n==1) { // erase cipher
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_erase9').addEventListener("click", do_erase);  
    }
    else if ( n==2) { // start over
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_undo9').addEventListener("click", do_undo);  
    
    }
    
}
function close_box(){
    var s;
    document.getElementById('light').style.display='none';
    document.getElementById('fade').style.display='none';
    //s = "result was "+n;
    //document.getElementById('result').innerHTML=s;
}


onload = function() {
    document.getElementById('checkEnter2').addEventListener("keypress", checkEnter);    
    document.getElementById('get_from_disk1').onclick=get_from_disk;
    document.getElementById('do_setup1').onclick=do_setup;    
}

