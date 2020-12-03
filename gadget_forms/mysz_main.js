var code
var symbols="abcdefghijklmnopqrstuvwxyz-"
var vowels="aeiou";
var c_symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" // removed -, added lower case so can have up to 52 colum labels
digits = '0123456789';
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

var rep_index = new Array(); // to mark which columns are leftmost of repeat, rightmost of repeat, or free
var max_rep = new Array(); // tells number of repeated key letters associated with the column.

var old_top_pixel = new Array(); // so Safari web browser can tell if there has been vertical scrolling

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

function check_top_pixels() {
	var i,j,elm,s,flag;
	flag = 0;
	for (j=0;j<key_len;j++){
		elm = 'col'+j;
		if (old_top_pixel[j] !=	document.getElementById(elm).scrollTop){
			flag = 1;
			break;
		}
	}
	if (flag){
		for (j=0;j<key_len;j++){
			elm = 'col'+j;
			old_top_pixel[j] =	document.getElementById(elm).scrollTop;
		}
		do_vowel_stats();
	}
}

function do_vowel_stats() {
	var i,j,elm,s;
	var numb_letters, numb_pixels;
	var x,index,c,sum,ave,dev;
	var v_count = new Array();	
	var top_pixel,ta,line_height;

	for (j=0;j<numb_rows;j++) v_count[j]=0;	
	for (j=0;j<key_len;j++) {
		// get index of letter displayed at top of column j
		elm = "col"+j;
		ta = document.getElementById(elm)
		top_pixel = document.getElementById(elm).scrollTop;
//		numb_pixels = document.getElementById(elm).scrollHeight;
		s = get_raw_column_string(j); // raw; no format info
        numb_letters = s.length;
		//pixels per letter
        line_height = ta.clientHeight / numb_rows;
		// top visible letter
		index = Math.floor(0.5+top_pixel/line_height);	
        // snap to grid point
        document.getElementById(elm).scrollTop = index*line_height;
        old_top_pixel[j] = index*line_height;
		for (i=0;i<numb_rows;i++){
            c = s.charAt(index+i); 
			if (vowels.indexOf(c) != -1)
				v_count[i] += 1;
		}//next i
	} // next j
	s = '';
	for (i=0;i<numb_rows;i++)
        s += Math.floor(100.0*v_count[i]/key_len)+"<br>";
    document.getElementById("vowel_stats").innerHTML=s;
	sum = 0;
	for (i=0;i<numb_rows;i++)
		sum += v_count[i]/key_len;
	ave = sum/numb_rows;

	sum = 0;
	for (i=0;i<numb_rows;i++)
		sum += (ave-v_count[i]/key_len)*(ave-v_count[i]/key_len);
	dev = Math.sqrt(sum/numb_rows);
	document.getElementById("vowel_dev").value=Math.floor(100*dev);	
	
}
function get_raw_column_string(index) { // no formatting info
	var s,mr,ri,inx,j,n;
    var co;

	if ( index<numb_long_cols) n=1;
	else n = 0;
	s = '';
	mr = max_rep[ col_pos[index] ];
	ri = rep_index[ col_pos[index] ];
	inx = min_start[ col_pos[index] - (mr-ri) ]+(mr-ri);
	for (j=0;j<numb_rows+max_diff[col_pos[index]-(mr-ri)]+n ; j++){
        co = code.charAt(inx+j*mr)
        s += co;
    }
	return(s);
}
		

function get_column_string(index){
	var s,mr,ri,inx,j,n;
    var co,i;
    

	if ( index<numb_long_cols) n=1;
	else n = 0;
	s = '';
	mr = max_rep[ col_pos[index] ];
	ri = rep_index[ col_pos[index] ];
	inx = min_start[ col_pos[index] - (mr-ri) ]+(mr-ri);
	for (j=0;j<numb_rows+max_diff[col_pos[index]-(mr-ri)]+n ; j++){
        co = code.charAt(inx+j*mr)
        if ( cribtext.indexOf(co) != -1  // color all possible crib letters, that could be in crib_row
            && j >= crib_row && j<= crib_row + max_diff[col_pos[index]-(mr-ri)]+n) 
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
    }
	return(s);
}

function get_label(index) {
	var s,mr,ri,inx,j,n;

	s = '';
	mr = max_rep[ col_pos[index] ];
	ri = rep_index[ col_pos[index] ];
	if (mr==1)
		s = c_symbols.charAt(col_pos[index]);
	else {
		n = col_pos[index]-(mr-ri);
		s=c_symbols.charAt(n)+digits.charAt(mr-ri+1);	
	}
	return(s);
}
	
function restore_columns() {
    var j,s,n;
    
    for (n=0;n<key_len;n++){
		s = get_column_string(n);
		document.getElementById('col'+n).innerHTML=s;
		s = get_label(n);
        if ( n < numb_long_cols)
            document.getElementById('label'+n).style.backgroundColor = "yellow";
        document.getElementById('label'+n).innerHTML=s;
        
    }
	for (j=0;j<key_len;j++)
		document.ciphertext.colbox[j].checked = false;
	do_vowel_stats();    
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
        max_rep[i] = 1; // no columns joined 
        rep_index[i]=1; // no columns joined 
    }
    restore_columns();
}    
    
function do_join() {
	var n,j,i, col1,col2;
	var first_label,nxt;
	var numb_joined,s;
	
	numb_joined = 0
	first_label = key_len;
	for (j=0;j<key_len;j++)
		if (document.ciphertext.colbox[j].checked ==true) {
			if (max_rep[col_pos[j]]>1) {
                show_box(0,"A checked column is already part of a join. Undo previous join first!");
				return;
			}
			numb_joined +=1;
			if (col_pos[j]<first_label){
				first_label = col_pos[j];
				col1 = j;
			}
	}
	if ( numb_joined == 0){
		show_box(0,"No columns checked!");
		return;
	}

	for (j=0;j<key_len;j++)
		inverse_pos[ col_pos[j] ] = j;		
	for (j=0;j<numb_joined;j++)
		if (document.ciphertext.colbox[inverse_pos[first_label+j]].checked !=true) {
				show_box(0,"Can only join columns whose labels are consectutive letters!");
				return;
	}
	for (j=0;j<numb_joined;j++){
		max_rep[first_label+j] = numb_joined;
		rep_index[first_label+j] = numb_joined-j;
    }
    restore_columns();
}

function undo_join() {
	var n,j,i, col1,cnt;
	var first_label,nxt;
	var numb_joined,s;
	var mr,ri;

	for (j=0;j<key_len;j++)
		inverse_pos[ col_pos[j] ] = j;	
	cnt = 0;
	for (j=0;j<key_len;j++)
		if (document.ciphertext.colbox[j].checked ==true) {
			cnt++;
			mr = max_rep[col_pos[j]];
			ri = rep_index[col_pos[j]];
			n = col_pos[j] - (mr-ri); // leftmost column of join
			for (i=0;i<mr;i++){
				max_rep[n+i]=1;
				rep_index[n+i]=1;
			}
				
				
		}
        restore_columns();
		if ( cnt == 0)
			show_box(0,"No columns checked!");

} // end undo join

function input_ok() {
	var s='Ciphertext: (Type or paste cipher into this box, enter the key length, click Initialize button)<BR>';
	s=s+'<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
	document.getElementById('outputblock').innerHTML=s;			
	s = '<span style="font-weight:bold;">Enter key length=></span>'
	s += '<input type = text name=key_len_entry  size = 3 id="checkEnter4">';
    s += '<input type = button value="Initialize" id="do_setup4">';
	document.getElementById('key_lenblock').innerHTML=s;	
	document.getElementById('swapblock').innerHTML= ' ';
    document.getElementById('checkEnter4').addEventListener("keypress",checkEnter); 
    document.getElementById('do_setup4').addEventListener("click", do_setup);        
}

function do_decrypt(){
	var key = new Array();
	var inverse_key = new Array();
	var inverse_count = new Array();
	var i,j,k,n,s,count,index,offset;
	
	/* for speed, set up inverse key */
	for (j=0;j<key_len;j++) {
		inverse_key[j] = new Array();
		key[j] = col_pos[j]-(max_rep[col_pos[j]] - rep_index[col_pos[j]]);
	}
	for (j=0;j<key_len;j++) {// highest possible key entry is key_len-1
		inverse_count[j] = 0;
		for (k=0;k<key_len;k++)
			if ( key[k] == j)
				inverse_key[j][inverse_count[j]++] = k;
	}
    count = 0;
    for (k=0;k< key_len;k++) {
      if (inverse_count[k]==0) continue;
		index = offset = 0;
		while ( inverse_key[k][index]+offset < buf_len) {
			final_decrypt[inverse_key[k][index]+offset] = code.charAt(count++);
			if ( ++index >= inverse_count[k]){
					index = 0;
					offset += key_len;
			}
		} /* end while*/
    } /* next k */

	s='';
	j = 0;
	for (i=0;i<buf_len;i++){
		s += final_decrypt[i];
		if (++j == key_len){
			s += '\n';
			j = 0;
		}
	}
	s += '\n';
	s += '\nkey: '
	for (j=0;j<key_len;j++)
		s += c_symbols.charAt(key[j]);
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

function setup_code_columns() {
	var i,j,n;
	var elm,s;
	
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
	numb_long_cols = buf_len % key_len;
	numb_short_cols = key_len - numb_long_cols;
	numb_rows = Math.floor(buf_len / key_len);
	min_start[0] = 0;
	n = 0;
	for (j=1;j<key_len;j++) {
		if ( n<numb_short_cols) {
			min_start[j] = min_start[j-1]+numb_rows;
			n++;
		}
		else {
			min_start[j] = min_start[j-1]+numb_rows+1;
		}
	}
	max_start[0]= max_diff[0] = 0;
	n = 0;
	for (j=1;j<key_len;j++) {
		if ( n<numb_long_cols) {
			max_start[j] = max_start[j-1]+numb_rows+1;
			n++;
		}
		else {
			max_start[j] = max_start[j-1]+numb_rows;
		}
		max_diff[j] = max_start[j]-min_start[j];
	}
	// Use HTML table so checkboxes will align with code columns
	s = '';
    s += '<b>Transposition Block:</b>';
	s += '<table><tr>'
    n = numb_rows; 
	for (j=0;j<key_len;j++){
		s += '<td valign=top>';
        s += '<div id = "col'+j+'" class="colx"';
		s += ' " styLe="font-family:monospace;font-size:15px;';
        s += ' height:'+n+'em;"> </div>';
		s += '</td>';
	}
	// space for vowel stats
	s += '<td>';
    s += '<div id = "vowel_stats" class="coly" ';
	s += 'styLe="font-family:monospace;font-size:15px; height:'+n+'em;"> </div>';
	s += '</td>';
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
	// vowel label
	s += '<td>'
	s += '<input type="text" size=3 value = "VL%" id = "vowel_label" >';
	s += '</td>';
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
	s += '</tr></table>';
	document.getElementById('outputblock').innerHTML=s;	
	for (i=0;i<key_len;i++) {
		col_pos[i]=i;
		max_rep[i] = 1; // no columns joined yet
		rep_index[i]=1; // no columns joined yet
	}
	for (i=0;i<key_len;i++){
		s = get_column_string(i);
        document.getElementById('col'+i).innerHTML=s;	        
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
	do_vowel_stats();
	// record top pixels so Safari can tell if one has changed
	for (j=0;j<key_len;j++){
		elm = 'col'+j;	
		old_top_pixel[j] = document.getElementById(elm).scrollTop;
	}
    // add event listeners
    for (j=0;j<key_len;j++) {
        document.getElementById('col'+j).addEventListener("mousemove", check_top_pixels);  
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
        if ( index<numb_long_cols) n=1;
        else n = 0;
        mr = max_rep[ col_pos[index] ];
        ri = rep_index[ col_pos[index] ];
        inx = min_start[ col_pos[index] - (mr-ri) ]+(mr-ri);
        for (j=0;j<numb_rows+max_diff[col_pos[index]-(mr-ri)]+n ; j++){
            co = code.charAt(inx+j*mr)
            if ( cribtext.indexOf(co) != -1  // possible crib letter, that could be in crib_row
                && j >= crib_row && j<= crib_row + max_diff[col_pos[index]-(mr-ri)]+n) 
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
	s += ' Standard deviation in percentage of vowels per row: ';
	s += '<input type="text" size=3 id = "vowel_dev" >';
	document.getElementById('swapblock').innerHTML= s;
    document.getElementById('do_decrypt7').addEventListener("click", do_decrypt);            
    document.getElementById('color_letters7').addEventListener("click", color_letters);  
    document.getElementById('get_crib7').addEventListener("click", get_crib);  
    document.getElementById('letter_count7').addEventListener("click", letter_count);  
}
function setup_swap() {
	var n,j,i, col1,col2;
    var sr1,sr2;
	
    check_top_pixels(); // make sure old_top_pixel array is up to date
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
    sr1 = old_top_pixel[col1];
    sr2 = old_top_pixel[col2];
	n = col_pos[col1];
	col_pos[col1] = col_pos[col2];
	col_pos[col2] = n;
    restore_columns();
    // preserve vertical alignment
    n = 'col'+col1;
    document.getElementById(n).scrollTop = sr2;
    n = 'col'+col2;
    document.getElementById(n).scrollTop = sr1;
    check_top_pixels();
}

function rotate_left(){
	var n,j,i, col1,col2;
    var ta,line_height,s; 
	var temp = [];
    
    check_top_pixels(); // make sure old_top_pixel array is up to date  
    for (j=0;j<key_len;j++) temp[j] = old_top_pixel[j];
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
        temp[j] = temp[j+1];
    temp[key_len-1] = n;
    restore_columns();
    // update vertical alignment
    for (j=0;j<key_len;j++){
        n = 'col'+j;
        document.getElementById(n).scrollTop = temp[j];
    }
    check_top_pixels();
    // scroll rightmost column up 1 letter, if possible
    n = key_len-1;
    s = 'col'+n
	ta = document.getElementById(s)
    n = ta.scrollTop;
    line_height = ta.clientHeight / numb_rows;
    // I don't think you have to check for bottom of column, maybe automatically can't go past it.
    n += line_height
    ta.scrollTop = n;
    check_top_pixels();    
    
}

function insert_right(right_pos,left_pos) { // partial rotate left from right_pos to left pos
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
    check_top_pixels(); // make sure old_top_pixel array is up to date  
    for (j=0;j<key_len;j++) temp[j] = old_top_pixel[j];

    //move leftmost column to rightmost column and shift all other columns left.
    n = col_pos[left_pos];
    for (j=left_pos;j<right_pos;j++)
        col_pos[j] = col_pos[j+1];
    col_pos[right_pos] = n;
    n = temp[left_pos];
    for (j=left_pos;j<right_pos;j++)
        temp[j] = temp[j+1];
    temp[right_pos] = n;
    restore_columns();
    // update vertical alignment
    for (j=0;j<key_len;j++){
        n = 'col'+j;
        document.getElementById(n).scrollTop = temp[j];
    }
    check_top_pixels();
}


function insert_left(right_pos,left_pos) { // partial rotate right from left_pos to right pos
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
    check_top_pixels(); // make sure old_top_pixel array is up to date  
    for (j=0;j<key_len;j++) temp[j] = old_top_pixel[j];

    //move rightmost column to leftmost column and shift all other columns right.
    n = col_pos[right_pos];
    for (j=right_pos;j>left_pos;j--)
        col_pos[j] = col_pos[j-1];
    col_pos[left_pos] = n;
    n = temp[right_pos];
    for (j=right_pos;j>left_pos;j--)
        temp[j] = temp[j-1];
    temp[left_pos] = n;
    restore_columns();
    // update vertical alignment
    for (j=0;j<key_len;j++){
        n = 'col'+j;
        document.getElementById(n).scrollTop = temp[j];
    }
    check_top_pixels();
}


function rotate_right(){
	var n,j,i, col1,col2;
    var ta,line_height;
	var temp = [];
    
    check_top_pixels(); // make sure old_top_pixel array is up to date  
    for (j=0;j<key_len;j++) temp[j] = old_top_pixel[j];
	
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
        temp[j] = temp[j-1];
    temp[0] = n;
    restore_columns();
    // update vertical alignment
    for (j=0;j<key_len;j++){
        n = 'col'+j;
        document.getElementById(n).scrollTop = temp[j];
    }
    check_top_pixels();
    // scroll leftmost column down 1 letter, if possible
	ta = document.getElementById('col0')
    n = ta.scrollTop;
    line_height = ta.clientHeight / numb_rows;
    if (n >= line_height) n -= line_height
    ta.scrollTop = n;
    check_top_pixels();    

}

function show_directions() {
    var s,str;
    str = '';
    str += '<b>Directions</b><br>';
	str += 'To swap columns, check the boxes below them, & click swap button.<br>'
	str += 'To combine columns, check their boxes, & click join button.<br> '
    str += "To move a column, drag it's column label to the label where you want it to go. <br>";
	str += ' Use sliders to align vertically.<br> When layout looks correct, click decrypt button.';
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

function set_railfence_pattern(){
var i,j,k,c,n,s;

if ( (key_len%2) != 0){
    s = "Odd number of columns. Not railfence!";
    display_message(s);
    return;
}
max_rep[0] = rep_index[0] = 1;
max_rep[key_len-1] = rep_index[key_len-1] = 1;

for (i=1;i<key_len-1;i++)
    max_rep[i] = 2;
    
for (i=1;i<key_len-1;i=i+2){
    rep_index[i] = 2;
    rep_index[i+1] = 1;
}

col_pos[0] = 0;
col_pos[ key_len/2] = key_len-1

n = 1;
for (i=1;i<key_len/2;i++){
    col_pos[i] = n++;
    col_pos[key_len-i] = n++;
}    

restore_columns();

}

function initialize_buttons(){
    var s;
	s = '<br>key length: <input type = text name=key_len_entry value =' +key_len+' size = 3 id="checkEnter1" >'
	s += ' &nbsp <INPUT id="setup_swap1" type=button value="swap checked columns" >';
    s += '&nbsp <INPUT id="rotate_left1" type=button value="rotate left" >';
    s += '&nbsp <INPUT id="rotate_right1" type=button value="rotate right" >';
    s += '&nbsp <INPUT id="do_join1" type=button value="join checked columns" >';
	s += '&nbsp <INPUT id="undo_join1" type=button value="undo join" >';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';    
    s += '&nbsp; <INPUT id="railfence1" type=button value="railfence pattern" >';
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
    document.getElementById('do_join1').addEventListener("click", do_join);    
    document.getElementById('undo_join1').addEventListener("click", undo_join);  
    document.getElementById('railfence1').addEventListener("click", set_railfence_pattern);  
    document.getElementById('directions1').addEventListener("click", show_directions);                
    document.getElementById('start_over1').addEventListener("click", start_over);            
    document.getElementById('do_clear1').addEventListener("click", do_clear);                
    document.getElementById('save_to_disk2').addEventListener("click", save_to_disk);                    
    document.getElementById('get_from_disk2').addEventListener("click", get_from_disk);   
    document.getElementById('clear_disk2').addEventListener("click", clear_disk);                    
}    
function do_setup(){
	key_len = parseInt(document.ciphertext.key_len_entry.value);		
    initialize_buttons();
	setup_code_columns();
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
			localStorage.setItem("myszkowski.cipher", code); //saves to the database, “key”, “value”
			localStorage.setItem("myszkowski.period", key_len);
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			show_box(0,'Quota exceeded!'); //data wasn’t successfully saved due to quota exceed so throw an error
			}
		}
	}

	str = '';
	for (i=0;i < key_len;i++) {
		str += col_pos[i]+':';
	}
	localStorage.setItem("myszkowski.colOrder", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += max_rep[i]+':';
	}
	localStorage.setItem("myszkowski.maxRep", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += rep_index[i]+':';
	}
	localStorage.setItem("myszkowski.repIndex", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += old_top_pixel[i]+':';
	}
	localStorage.setItem("myszkowski.topPixel", str);

	show_box(0,"Work saved on disk");

}

function get_from_disk(){
	var s,i,j,k;
    var temp;

	temp = localStorage.getItem("myszkowski.cipher");
	if (temp == undefined){
		show_box(0,"No cipher stored");
		return
	}
    code = temp;
	key_len = parseInt(localStorage.getItem("myszkowski.period"));
    if ( document.getElementById('cipher_place') ){    
        document.ciphertext.cipher_place.value = code;
        initialize_buttons();
        setup_code_columns();
    }
    s = localStorage.getItem("myszkowski.colOrder")
    s = s.split(':');
    for (i=0;i<key_len;i++)
        col_pos[i] = parseInt(s[i]);
    s = localStorage.getItem("myszkowski.maxRep")
    s = s.split(':');
    for (i=0;i<key_len;i++)
        max_rep[i] = parseInt(s[i]);
    s = localStorage.getItem("myszkowski.repIndex")
    s = s.split(':');
    for (i=0;i<key_len;i++)
        rep_index[i] = parseInt(s[i]);
    restore_columns();
    //  reset top pixels
    s = localStorage.getItem("myszkowski.topPixel")    
    s = s.split(':');
    for (i=0;i<key_len;i++) {
        j = 'col'+i;
        k = parseFloat(s[i]);
        document.getElementById(j).scrollTop = k;
    }
    check_top_pixels();
}

function clear_disk(){
	localStorage.removeItem("myszkowski.cipher");
	localStorage.removeItem("myszkowski.period");
	localStorage.removeItem("myszkowski.colOrder");    
	localStorage.removeItem("myszkowski.maxRep");    
	localStorage.removeItem("myszkowski.repIndex");    
	localStorage.removeItem("myszkowski.topPixel");        
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

