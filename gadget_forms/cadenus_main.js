var code;
var symbols="abcdefghijklmnopqrstuvwxyz-";
var vowels="aeiou";
var c_symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
digits = '0123456789';
//var fire_fox=!document.all;
var fire_fox = 1;
var dobj, solving_flag =0;
var key_len;

var buf_len, numb_rows;
var col_pos = new Array();
var final_decrypt = new Array();
var columns_selected = new Array();


var old_top_pixel = new Array(); // so Safari web browser can tell if there has been vertical scrolling

// letters to be colored
var red_let = '';
var green_let = '';
var blue_let = '';
var cyan_let='';

var current_key_labels = [];

function s_compare(a,b) {
		return b[1]-a[1]
}		

function letter_count() {
	var i,n,str,s;
	var l_count = new Array();
	var s_count = new Array();
	var temp;

	for (i=0;i<26;i++)
		l_count[i] = 0;
	temp = code.toLowerCase();	// in code string tops of original columns are capitalized.
	for (i=0;i<code.length;i++) {
			n = symbols.indexOf(temp.charAt(i))
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
		do_key_labels();
	}
}

function do_key_labels() { // changed to get current key labels, not vowels
	var i,j,elm,s;
	var  numb_pixels;
	var x,index,c,sum,ave,dev;
	var v_count = new Array();	
	var top_pixel,ta,line_height;
	var n;

	var row_labels = "AZYXWUTSRQPONMLKJIHGFEDCB"
	for (j=0;j<key_len;j++) {
		// get index of letter displayed at top of column j
		elm = "col"+j;
		ta = document.getElementById(elm)
		top_pixel = document.getElementById(elm).scrollTop;
		s = get_raw_column_string(j); // raw; no format info
		//pixels per letter
        line_height = ta.clientHeight / numb_rows;
		// top visible letter
		index = Math.floor(0.5+top_pixel/line_height);	
        // snap to grid point
        document.getElementById(elm).scrollTop = index*line_height;
        old_top_pixel[j] = index*line_height;
		for (i=0;i<numb_rows;i++){
            c = s.charAt(index+i); 
			n = c_symbols.indexOf(c);
			if (n != -1) // capital letter, indicates key label
				current_key_labels[j] = i;
		}//next i
	} // next j
	s = '';
	for (i=0;i<key_len;i++)
		s += row_labels.charAt( current_key_labels[i]);
	document.getElementById("key_labels").value = s;
	
}
function get_raw_column_string(index) { // no formatting info
	var s,mr,ri,inx,j,n;
    var co;

	s = '';
	inx = col_pos[index];
	for (j=0;j<25; j++){
        co = code.charAt(inx+j*key_len)
        s += co;
    }
	s = s+s;
	return(s);
}
		

function get_column_string(index){
	var s,mr,ri,inx,j,n;
    var co,i;
    

	s = '';
	inx = col_pos[index];

	for (j=0;j<25 ; j++){
		co = code.charAt(inx+j*key_len)
		n = c_symbols.indexOf(co); // is this a capital, if so, it's original column top, color its background
		if ( n != -1) {
			co = '<span style="background-color:yellow;">'+co+'</span>';
		}
		if ( co == red_let)
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
	s = s+s; // use two copies
	return(s);
}

function get_label(index) {
	var s,mr,ri,inx,j,n;

	s = '';
	s = c_symbols.charAt(col_pos[index]);
	return(s);
}
	
function restore_columns() {
    var j,s,n;
    
    for (n=0;n<key_len;n++){
		s = get_column_string(n);
		document.getElementById('col'+n).innerHTML=s;
		s = get_label(n);
        document.getElementById('label'+n).innerHTML=s;
        
    }
	for (j=0;j<key_len;j++)
		document.ciphertext.colbox[j].checked = false;
	do_key_labels();    
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
    }
    restore_columns();
    for (i=0;i<key_len;i++) {
        j = 'col'+i;
        document.getElementById(j).scrollTop = 0;
    }
    check_top_pixels();
	
}    

function input_ok() {
	var s='Ciphertext: (Type or paste cipher into this box. click Initialize button)<BR>';
	s=s+'<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
	document.getElementById('outputblock').innerHTML=s;			
	s = '';
    s += '<input type = button value="Initialize" id="do_setup4">';
	document.getElementById('key_lenblock').innerHTML=s;	
	document.getElementById('swapblock').innerHTML= ' ';
    document.getElementById('do_setup4').addEventListener("click", do_setup);        
}

function do_decrypt(){
	var key = new Array();
	var inverse_key = new Array();
	var inverse_count = new Array();
	var i,j,k,n,s,count,index,offset;
	var col,row;
	
    for (col = 0;col<key_len;col++)
        for (row = 0;row<25;row++)
            final_decrypt[col+row*key_len ] =
                 code.charAt( col_pos[col] + ((25+row-current_key_labels[col])%25)*key_len );
	
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
	var row_labels = "AZYXWUTSRQPONMLKJIHGFEDCB"	
	s += '\nkey: '
	for (j=0;j<key_len;j++)
		s += row_labels.charAt(current_key_labels[j]);
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
	var elm,s,c;
	
	var row_labels = "AZYXWUTSRQPONMLKJIHGFEDCB"
	
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
	key_len = Math.floor(code.length/25);
	if ( key_len * 25 != code.length){
		show_box(0,"Length of cipher is not multiple of 25!");
		return;
	}
// covert tops of original columns to capitals	
	s = '';
	for (i=0;i<key_len;i++)
		s += code.charAt(i).toUpperCase();
	code = s+ code.slice(key_len);
	buf_len = code.length;
	numb_rows = Math.floor(buf_len / key_len); // should be 25
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
    // space for row labels
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
	s += '<input type="text" size=3 value = "V. Key" id = "row_label" >';
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
	}
	for (i=0;i<key_len;i++){
		s = get_column_string(i);
        document.getElementById('col'+i).innerHTML=s;	        
	}
    // row labels
    s=''
    for (i=1;i<=numb_rows;i++){
        s += '<span class="r_label'+i+'" style="cursor:default;" >';
		c = row_labels.charAt(i-1);
        if (c != 'W') s += '&nbsp;';
		else s += 'V';
        s += c+'<br>';
        s += '</span>';
    }
    document.getElementById('row_numbs').innerHTML=s;	
	// put in labels
	for (i=0;i<key_len;i++){
		s = get_label(i);
        document.getElementById('label'+i).innerHTML=s;
		
	}
	show_swap();
	do_key_labels();
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

function cancel_messagecr(){
    document.getElementById('c_display').style.visibility="hidden";
}    


function clear_messagecr(){
    document.getElementById('crib_string').value = '';
    document.getElementById('crib_row').value = '0';
}    

function redirect() {
	window.location="cadenus_lowres.html";
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
	

    s =' <br>&nbsp;<INPUT id="do_decrypt7" type=button value="decrypt using current columns" >';    

    s += '&nbsp &nbsp &nbsp &nbsp &nbsp';    
    s +=  '&nbsp <INPUT id="color_letters7" type=button value="color letters" >';  
    s += '&nbsp &nbsp <INPUT id="letter_count7" type=button value="letter count" >';
    s += '&nbsp; &nbsp; &nbsp; &nbsp; <INPUT id="key_compare" type=button value="compare horizontal & vertical keys" >';
	document.getElementById('swapblock').innerHTML= s;
    document.getElementById('do_decrypt7').addEventListener("click", do_decrypt);            
    document.getElementById('color_letters7').addEventListener("click", color_letters);  
    document.getElementById('letter_count7').addEventListener("click", letter_count);  
    document.getElementById('key_compare').addEventListener("click", do_key_compare);            
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

}

function show_directions() {
    var s,str;
    str = '';
    str += '<b>Directions</b><br>';
    str += 'Yellow letter in each column picks vertical key letter for that column<br><br>'
	str += 'To swap columns, check the boxes below them, & click swap button.<br>'
    str += "To move a column, drag it's column label to the label where you want it to go. <br>";
	str += 'Use sliders to align vertically';
	str += '<br>Use red or green arrow to move all rows up or down together';
	str += '<br> When layout looks correct, click decrypt button.';
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
	s += '&nbsp;&nbsp;&nbsp;<img src="up_arrow3.png" id = "up_arrow" >';
	s += '&nbsp;&nbsp;&nbsp;<img src="down_arrow3.png"id = "down_arrow">';
	s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Vertical key: '
	s += '<input type=text id="key_labels" size = 15>';
    s += '<br><br> &nbsp <INPUT id="directions1" type=button value="Directions" >';
    s += '&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp';
    s += '&nbsp &nbsp &nbsp &nbsp ';
    s += '&nbsp  <INPUT id="start_over1" type=button value="Start over" >';
	s += '&nbsp  <INPUT id="do_clear1" type=button value="Erase" >';
       
       s+='<INPUT id="save_to_disk2" type=button value="save work to disk" >';
       s+=' <INPUT id="get_from_disk2" type=button value="retrieve work from disk" >';
       s+=' <INPUT id="clear_disk2" type=button value="clear work from disk" >';
 

	document.getElementById('key_lenblock').innerHTML=s;
    document.getElementById('setup_swap1').addEventListener("click", setup_swap);    
    document.getElementById('rotate_left1').addEventListener("click", rotate_left);        
    document.getElementById('rotate_right1').addEventListener("click", rotate_right);    
    document.getElementById('directions1').addEventListener("click", show_directions);                
    document.getElementById('start_over1').addEventListener("click", start_over);            
    document.getElementById('do_clear1').addEventListener("click", do_clear);                
    document.getElementById('save_to_disk2').addEventListener("click", save_to_disk);                    
    document.getElementById('get_from_disk2').addEventListener("click", get_from_disk);   
    document.getElementById('clear_disk2').addEventListener("click", clear_disk);                    
	document.getElementById('up_arrow').addEventListener("click", columns_up);                    
	document.getElementById('down_arrow').addEventListener("click", columns_down);                    
}    
function do_setup(){

    initialize_buttons(); // initial key labels
	setup_code_columns();
	initialize_buttons(); // now have key length
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
			localStorage.setItem("cadenus.cipher", code); //saves to the database, “key”, “value”
			localStorage.setItem("cadenus.period", key_len);
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
	localStorage.setItem("cadenus.colOrder", str);
	str = '';
	for (i=0;i < key_len;i++) {
		str += old_top_pixel[i]+':';
	}
	localStorage.setItem("cadenus.topPixel", str);

	show_box(0,"Work saved on disk");

}

function get_from_disk(){
	var s,i,j,k;
    var temp;

	temp = localStorage.getItem("cadenus.cipher");
	if (temp == undefined){
		show_box(0,"No cipher stored");
		return
	}
    code = temp;
	key_len = parseInt(localStorage.getItem("cadenus.period"));
    if ( document.getElementById('cipher_place') ){    
        document.ciphertext.cipher_place.value = code;
        initialize_buttons();
        setup_code_columns();
    }
    s = localStorage.getItem("cadenus.colOrder")
    s = s.split(':');
    for (i=0;i<key_len;i++)
        col_pos[i] = parseInt(s[i]);
    restore_columns();
    //  reset top pixels
    s = localStorage.getItem("cadenus.topPixel")    
    s = s.split(':');
    for (i=0;i<key_len;i++) {
        j = 'col'+i;
        k = parseFloat(s[i]);
        document.getElementById(j).scrollTop = k;
    }
    check_top_pixels();
}

function clear_disk(){
	localStorage.removeItem("cadenus.cipher");
	localStorage.removeItem("cadenus.period");
	localStorage.removeItem("cadenus.colOrder");    
	localStorage.removeItem("cadenus.topPixel");        
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

function columns_up(){
	var i,j,elm,s;
	var  numb_pixels;
	var x,index,c;
	var top_pixel,ta,line_height;
	var n;

	for (j=0;j<key_len;j++) {
		// get index of letter displayed at top of column j
		elm = "col"+j;
		ta = document.getElementById(elm)
		top_pixel = document.getElementById(elm).scrollTop;
		//pixels per letter
        line_height = ta.clientHeight / numb_rows;
		// top visible letter
		index = Math.floor(0.5+top_pixel/line_height);	
		if ( index < 25) // enough room,  can get to 25 which shows second copy of top letter.
			index++;
		else
			index = 1; // at bottom, second copy of top letter showing, wrap around to second line from top
        // snap to grid point
        document.getElementById(elm).scrollTop = index*line_height;
	} // next j
	check_top_pixels();
}

function columns_down(){
	var i,j,elm,s;
	var  numb_pixels;
	var x,index,c;
	var top_pixel,ta,line_height;
	var n;

	for (j=0;j<key_len;j++) {
		// get index of letter displayed at top of column j
		elm = "col"+j;
		ta = document.getElementById(elm)
		top_pixel = document.getElementById(elm).scrollTop;
		//pixels per letter
        line_height = ta.clientHeight / numb_rows;
		// top visible letter
		index = Math.floor(0.5+top_pixel/line_height);	
		if ( index >0) // enough room
			index--;
		else
			index = 24; // at top, wrap around to bottom
        // snap to grid point
        document.getElementById(elm).scrollTop = index*line_height;
	} // next j
	check_top_pixels();

}

function do_key_compare(){
var i,j,c,n;
var pattern_symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
// table for converting from row order to alphabet order
var order_convert = [0,25,24,23,22,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1];

// convert row labels to alphabetic order
var cv = []
for (i=0;i<key_len;i++)
    cv[i] = order_convert[ current_key_labels[i] ];
    
// now convert to key pattern order    
var k2 = []
nxt = 0  
for (i=0;i<26;i++) for (j=0;j<key_len;j++){
    if (cv[j] == i){
        k2[j] = nxt
        nxt++;
    }
}    

// compare both key patterns
var s1 = ''
for (i=0;i<key_len;i++)
    s1 += pattern_symbols[ col_pos[i] ];
    
var s2 = '';
for (i=0;i<key_len;i++)
    s2 += pattern_symbols[ k2[i] ];
    
var out_str = 'The vertical key pattern is   '+s2;
out_str += '\nThe horizontal key pattern is '+s1;
if (s1 == s2)
    out_str += '\n Patterns are the same';
else
    out_str += '\n Patterns are not the same';

//alert(out_str);
display_message(out_str);


}


onload = function() {
    document.getElementById('get_from_disk1').onclick=get_from_disk;
    document.getElementById('do_setup1').onclick=do_setup;    
}

