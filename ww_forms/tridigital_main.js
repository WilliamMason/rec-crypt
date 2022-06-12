// undo and redo routines and variables

var undo_array = [];
var redo_array = [];
var undo_index = 0;
var redo_index = 0;

var undo_array2 = [];
var redo_array2 = [];

var undo_array3 = [];
var redo_array3 = [];

var undo_array4 = [];
var redo_array4 = [];

// web worker stuff
var stopped_flag = true;
var hworker,hworker2;
var best_score = -1000;
var current_channel = 0;
var crib = '';

// key search stuff
var book_type = true;
var word_list_string = '';
var key_cols;
var used_digit = [];
var num_key;

function do_undo(){
    var i,j;

    if (undo_index == 0) return;
    redo_array[redo_index] = [];
    redo_array2[redo_index] = [];
    redo_array3[redo_index] = [];
    redo_array4[redo_index] = [];
	for (i=0;i<code.length;i++) {
		redo_array[redo_index][i] = plain[ i ];
	}
	for (i=0;i<30;i++) {
		redo_array2[redo_index][i] = plain_key[ i ];
	}
	for (i=0;i<10;i++) {
		redo_array3[redo_index][i] = top_key[ digits.charAt(i) ];
	}
    i = 0;
	for (j=0;j<10;j++) {
		redo_array4[redo_index][i++]=check_key[ label0+digits.charAt(j) ];
		redo_array4[redo_index][i++]=check_key[ label1+digits.charAt(j) ];
		redo_array4[redo_index][i++]=check_key[ label2+digits.charAt(j) ];
    }
    redo_index++;
    undo_index--;
	for (i=0;i<code.length;i++) {
		plain[ i ] = undo_array[undo_index][i];
	}
	for (i=0;i<30;i++) {
		plain_key[ i ] = undo_array2[undo_index][i];
	}
	for (i=0;i<10;i++) {
		top_key[ digits.charAt(i) ] = undo_array3[undo_index][i];
	}
    i = 0;
	for (j=0;j<10;j++) {
		check_key[ label0+digits.charAt(j) ]=undo_array4[undo_index][i++];
        check_key[ label1+digits.charAt(j) ]=undo_array4[undo_index][i++];
        check_key[ label2+digits.charAt(j) ]=undo_array4[undo_index][i++];
    }
    
    document.getElementById('redo_button').disabled = false;
    restore_keyblock(0);
    xlate();
}

function do_redo(){
    var i,j;
    
    if (redo_index == 0)
        return;
    redo_index--;
    undo_index++;
	for (i=0;i<code.length;i++) {
		plain[ i ] = redo_array[redo_index][ i ];
	}
	for (i=0;i<26;i++) {
		plain_key[ i ] = redo_array2[redo_index][ i ];
	}
	for (i=0;i<10;i++) {
		top_key[ digits.charAt(i) ] = redo_array3[redo_index][i];
	}
    i = 0;
	for (j=0;j<10;j++) {
		check_key[ label0+digits.charAt(j) ]=redo_array4[redo_index][i++];
        check_key[ label1+digits.charAt(j) ]=redo_array4[redo_index][i++];
        check_key[ label2+digits.charAt(j) ]=redo_array4[redo_index][i++];
    }
    restore_keyblock(0);
    xlate();
}

function update_undo(){
    var i,j;

    undo_array[undo_index] = [];
    undo_array2[undo_index] = [];
    undo_array3[undo_index] = [];
    undo_array4[undo_index] = [];
	for (i=0;i<code.length;i++) {
		undo_array[undo_index][ i ] = plain[ i ];
	}
	for (i=0;i<26;i++) {
		undo_array2[undo_index][ i ] = plain_key[ i ];
	}
	for (i=0;i<10;i++) {
		undo_array3[undo_index][i] = top_key[ digits.charAt(i) ];
	}
    i = 0;
	for (j=0;j<10;j++) {
		undo_array4[undo_index][i++]=check_key[ label0+digits.charAt(j) ];
		undo_array4[undo_index][i++]=check_key[ label1+digits.charAt(j) ];
		undo_array4[undo_index][i++]=check_key[ label2+digits.charAt(j) ];
    }
    undo_index++;
    redo_index = 0;

}


//next definition needed by Internet explorer, firefox already has it
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

// custom tet table
var book_string = '';
function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
	//alert(str);
    book_type = true;
	getAsText(fname);
}

function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
    book_type = false;
	getAsText(fname);
	
}


function getAsText(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  //reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
  
  // Read file into memory as UTF-16
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsText(readFile);
  
}

function loaded(evt) {
  // Obtain the read file data
  var fileString = evt.target.result;
  var s;
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;
  s = "The length of the file is "+fileString.length;
  document.getElementById('computer_output').value = s;
  if (book_type) book_string = fileString;
  else word_list_string = fileString;
  //alert("file loaded");
  stop_flag=1; // reinitialize web workers
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function set_reload(){
    stop_flag = 1; // signal to reinitialize
}


var data;
var code;
var symbols="abcdefghijklmnopqrstuvwxyz-"
var digits="0123456789";
var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ-"
val_letter_selected=0;
var fire_fox=!document.all;
var dobj, solving_flag =0;
var asize = 5;
var line_len = 90;
var crib_entered=0;
var line_limit=80;
var last_cell;

//try associative array for key
var check_key = new Array();
var left_key = new Array();
var top_key = new Array();
var rows_selected = new Array();
var columns_selected = new Array();

// labels for key table rows
var label0 = 'A';
var label1 = 'B';
var label2 = 'C';


var word_separator;
var plain, old_xlation;
var plain_key= [];


function reset_key() {
	var j;
	for (j=0;j<10;j++) {
		check_key[ label0+digits.charAt(j) ] = '-';
		check_key[ label1+digits.charAt(j) ] = '-';
		check_key[ label2+digits.charAt(j) ] = '-';
		top_key[digits.charAt(j) ] = digits.charAt(j);
	}
	left_key[label0]=label0;
	left_key[label1]=label1;
	left_key[label2]=label2;
    for (i=0;i<30;i++)
        plain_key[i] = '-';

}

function input_ok() {
	var s='Ciphertext: (Type or paste cipher into this box)<BR>';
	s=s+'<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
	document.getElementById('outputblock').innerHTML=s;
	s = 'Word separator: <input type="text" id="word_separator" size=3>';
	//s += '<INPUT onclick=initialize(); type=button value="initialize" >';
    s += '<input type = "button" value="Initialize"; id="initialize1" >';
	document.getElementById('button_actions').innerHTML=s;
	s='Enter cipher and a digit for the word separator, then click initialize button.'
	document.getElementById('directions').innerHTML=s;
	document.getElementById('holdletterblock').innerHTML='';
	document.getElementById('keyblock').innerHTML='';
    document.getElementById('initialize1').addEventListener("click",initialize);
	
}

// check_key is an array holding the key letters, indexed by strings of the form: labelXX+digit_char 
function is_check_key_inconsistent(){
	var i,j,k,c,n,s;
	var used_let;
	
	used_let = [];
		
	for (i=0;i<10;i++){
		c = check_key[label0+digits.charAt(i)];
		if (c!= '-'){
			n = used_let.indexOf(c);
			if ( n != -1){
				s = 'more than one copy of '+c+' in key table';
				alert(s);
				return(true);
				
			}
			used_let.push(c);
		}
		
		c = check_key[label1+digits.charAt(i)];
		if (c!= '-'){
			n = used_let.indexOf(c);
			if ( n != -1){
				s = 'more than one copy of '+c+' in key table';
				alert(s);
				return(true);
				
			}
			used_let.push(c);
		}

		c = check_key[label2+digits.charAt(i)];
		if (c!= '-'){
			n = used_let.indexOf(c);
			if ( n != -1){
				s = 'more than one copy of '+c+' in key table';
				alert(s);
				return(true);
				
			}
			used_let.push(c);
		}
		
	} // next i
	return(false); // it is consistent	
} // end of is_key_inconsistent

function update_check_key(p_let,c_digit){ // place p_let in key table under c_digit
    var i,row,col,c
    
	if (is_check_key_inconsistent() )
		return; // check_key array has more than one copy of some letter
    // find column with c_digit
    for (i=0;i<10;i++)
        if (top_key[i] == c_digit){
            col = i;
            break;
    }
    c = left_key[label0]+digits.charAt(col);
    if (check_key[c] == p_let) return; // already filled in
    c = left_key[label1]+digits.charAt(col);
    if (check_key[c] == p_let) return; // already filled in
    c = left_key[label2]+digits.charAt(col);
    if (check_key[c] == p_let) return; // already filled in
    c = left_key[label0]+digits.charAt(col);
    if (check_key[c] == '-') {
        check_key[c] = p_let;
        return;
    }
    c = left_key[label1]+digits.charAt(col);
    if (check_key[c] == '-') {
        check_key[c] = p_let;
        return;
    }
    c = left_key[label2]+digits.charAt(col);
    if (check_key[c] == '-') {
        check_key[c] = p_let;
        return;
    }
    c = "all columns with "+c_digit+" are filled!";
    alert(c);
}


function setup_code() {
	var i;

	data = document.ciphertext.cipher_place.value;
	//data = data.toUpperCase();
	data = data.replace(/[\n\r]/g,' ');
	code = '';
	for (i=0;i<data.length;i++) {
		c = data.charAt(i);
		if ( digits.indexOf(c) >-1 ) {
            if ( c == word_separator)
                c = ' ';
            code += c;
		}
	}
	solving_flag=1;
   	old_xlation = ['-'];
    plain = [];
	for (i = 0;i<code.length;i++){
		old_xlation[i]= '-';
        c = code.charAt(i);
        n = digits.indexOf(c);
        if (n != -1)
            plain[i] = '-'
        else
            plain[i] = c;
    }
    undo_index = redo_index = 0;

}


function xlate() {
	var state,str,limit,pos,pl,cnt,c1,n,c;

	if (solving_flag ==0) {
		setup_code();
		if (solving_flag==0) return;
	}
    
	str='';
	//str='<style="font-family:monospace; font-size:15px;">';
	limit=line_limit;

	if (code.length<limit)
		limit = code.length;
    else {// break at white space
        c = code.charAt(limit-1);
        n = digits.indexOf(c);
        while ( n != -1){
            limit--;
            c = code.charAt(limit-1);
            n = digits.indexOf(c);
        }
    }
	pos=0;
	cnt=0;
	pl='';
	while (pos<code.length) {
        c = code.charAt(pos);
		str = str+c;
        c1 = plain[pos];
		if ( old_xlation[pos] != c1){
			old_xlation[pos]=c1;
			pl = pl+'<font color="red"><span class = "plain'+pos+'">'+c1+'</span></font>';
		}
		else
			pl = pl+'<span class = "plain'+pos+'">'+c1+'</span>';
		//pl = pl+c+'&nbsp;&nbsp;';
		pos++;
		cnt++;
		if (cnt>=limit) {
			//str=str+'\n'+pl+'\n';
			str = str+'<br><font color="blue">'+pl+'</font><br>'
			pl='';
			cnt=0;
			if (pos+line_limit>code.length)
				limit = code.length-pos;
            else { // break line at word break
                limit = line_limit;
                c = code.charAt(pos+limit-1);
                n = digits.indexOf(c);
                while ( n != -1){
                    limit--;
                    c = code.charAt(pos+limit-1);
                    n = digits.indexOf(c);
                }
            }
		}
	}
	//document.ciphertext.cipher_place.value=str;
	document.getElementById('outputblock').innerHTML=str;
}


function selectmouse(e){
   var p_letter,n,c,n1,c_old,c_letter;
   var i,j,k,c1;
  var fobj       = fire_fox ? e.target : event.srcElement;
  if (fobj.className.slice(1)=="key") {
    dobj = fobj;
	cpos = symbols.indexOf(dobj.className.charAt(0));
	letter_selected=1;
	//reset key
	letterblock_setup();
	c=dobj.className.charAt(0);
	s= '<span width="75" height = "75" id ="'+c+'letter" class="'+c+'key" style="color:red">'+c+'</span>';
	document.getElementById(dobj.id).innerHTML= s;
	//next 2 lines for debugging
	//s = "you clicked on "+c;
	//document.debug.output_area.value= s;
    return false;
  }
  else if (fobj.className.slice(0,5)=="plain" && letter_selected) {
	  dobj = fobj;
	  x = fobj.className.slice(5);
	  p_letter=symbols.charAt(cpos);
      n = parseInt(x);
      c = code.charAt(n);
      if ( c == ' ') // clicked underneath a blank, ignore
        return(false);
      n1 = digits.indexOf(c);
      c_old = plain[n];
      if ( n1 != -1) {
        if (c_old != '-' && p_letter == '-'){
            cpos = symbols.indexOf(c_old); // erasing a letter
            c = '-';
        }
        if ( p_letter != '-' && plain_key[cpos] != '-' && plain_key[cpos] != c ){
            alert("Selected letter inconsistent with key!");
        }
        else if ( p_letter != '-' && c_old != '-' && p_letter != c_old){
            alert("Erase old letter before changing to new letter!");
        }
        else {
            update_undo();
            document.getElementById('redo_button').disabled = true;
            plain[ n ] = p_letter;
            plain_key[cpos] = c;
        }
      }
      update_check_key(p_letter,plain_key[cpos]);
	  letter_selected=0;
	  //reset letter block
	  letterblock_setup();
	  xlate();
      restore_keyblock(0);
      return false;
  }
  
  else if (fobj.className.slice(2)=="keyblock" && letter_selected) {
	  dobj = fobj;
	  letter=symbols.charAt(cpos);
	  s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:blue">';
	  s=s+letter+'</span>';
	  document.getElementById(dobj.id).innerHTML= s;
	  letter_selected=0;
	  cell=dobj.className.slice(0,2);
      update_undo();
      document.getElementById('redo_button').disabled = true;
	  //update key array
	  //check for duplicate letters and erase old if found
	  if ( letter != '-' ) {
		  for (i=0;i<3;i++){
			  if ( i==0) c1=label0;
			  else if (i==1) c1 = label1;
			  else c1 = label2;
			  //c1 = digits.charAt(i);
			  for (j=0;j<10;j++) {
				  c2 = digits.charAt(j);
				  if (check_key[c1+c2]==letter && c1+c2 != cell){
		  			//delete letter at old location
		  			c = c1+c2;
		  			check_key[c] = '-';
					s= '<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
					s+='-</span>';
					document.getElementById(c+'keymatrix').innerHTML= s;
                    // if new letter is in different column, erase old letters from plaintext
                    if ( j != digits.indexOf(cell.charAt(1)) ) {
                        for (k=0;k<code.length;k++)
                            if (code[k] == top_key[c2] &&  plain[k] == letter) plain[k] = '-';
                    }
				}
			}
		}
        plain_key[cpos] = top_key[cell.charAt(1)];
	  }
      else { // letter is '-'
            c_old = top_key[cell.charAt(1)]
            c = check_key[cell]; // old letter, erase it.
            plain_key[symbols.indexOf(c)] = letter;
            // erase old substitutions from plaintext
            for (k=0;k<code.length;k++)
                if (code[k] == c_old &&  plain[k] == c) plain[k] = '-';
            
      }
	  check_key[ cell] = letter;
	  //reset letter block
	  letterblock_setup();
	  last_cell=cell;
	  xlate();
      //next 2 lines for debugging
	  //s = "you put it under pair "+cell+"\n";
	  //document.debug.output_area.value= s;
      return false;
  }
  else if (fobj.className.slice(1)=="keycolumn") {
	  dobj = fobj;
	  cell=dobj.className.slice(0,1);
	  //update columns selected array
	  columns_selected[ cell] ^= 1;
	  if (columns_selected[ cell]==1) {
	  	s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:black">';
	  	s +='X</span>';
	   }
	  else {
	  	s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:Yellow">';
	  	s +='&nbsp</span>';
	   }
	  document.getElementById(dobj.id).innerHTML= s;
      //next 3 lines for debugging
	  //s = "you put it under letter "+cell+"\n";
	  //s = s+check_key;
	  //document.debug.output_area.value= s;
      return false;
  }
  else if (fobj.className.slice(1)=="keyrow") {
	  dobj = fobj;
	  cell=dobj.className.slice(0,1);
	  //update rows selected array
	  rows_selected[ cell] ^= 1;
	  if (rows_selected[ cell]==1) {
	  	s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:black">';
	  	s +='X</span>';
	   }
	  else {
	  	s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:Yellow">';
	  	s +='&nbsp</span>';
	   }
	  document.getElementById(dobj.id).innerHTML= s;
      //next 3 lines for debugging
	  //s = "you put it under letter "+cell+"\n";
	  //s = s+check_key;
	  //document.debug.output_area.value= s;
      return false;
  }
	  
}
document.onmousedown=selectmouse;

function letterblock_setup() {
	var s,i,c;
	
	
 s = "Click on one of the blue symbols below , then click below a digit in the box above or on a place in the Key Table below. ";
	document.getElementById('directions').innerHTML=s;
	s=''
	s += '<div id="letterblock" class="letter_block" ';
	s += 'style="font-family:monospace; font-size: 15px; cursor: crosshair; border: 3px ridge black; '
	s += 'margin-right:20px; padding:10px">'

	for (i=0;i<symbols.length;i++) {
		c = symbols.charAt(i);

		s = s+'<span width="75" height="75" style="border: 2px solid white;background: white;"  >';
		s=s+'&nbsp<span width="75" height = "75" id ="'+c+'letter" class="'+c+'key" style="color:blue">';
		s=s+c+'</span> </span>';
	}
	s=s+'<br>';
	s += '</div>';
	s += '<br>Key Table:<br>';
	document.getElementById('holdletterblock').innerHTML=s;
	last_cell='';

}

function keyblock_setup() {
	var s,i,c;
    var co,n;
	
	s='';
	//one column of row labels
	s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
	s=s+'&nbsp&nbsp<span width="75" height = "75" >';
	s=s+'</span> </span>';

	//digits across the top
	for (i=0;i<10;i++) {
		c = digits.charAt(i);
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'key_top" class="'+c+'keytop" style="color:blue">';
			s=s+top_key[c]+'</span> </span>';
	}
	s=s+'<br>';

	
	for (i=0;i<3;i++) {
		if ( i==0) cr = label0;
		else if ( i==1) cr = label1;
		else cr = label2;
			//left outer
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+cr+'key_left" class="'+cr+'keyleft" style="color:blue">';
			s=s+cr+'</span> </span>';
		//row of key block cells
		for (j=0;j<10;j++) {
            n = digits.indexOf(top_key[j]);
            if ( n == word_separator)
                co = 'red';
            else
                co = 'white';
			cc=digits.charAt(j);
			c = cr+cc;
			//s = s+'<span width="75" height="75" style="border: 2px solid black;background: white;"  >';
            s = s+'<span width="75" height="75" style="border: 2px solid black;background:'+co+';"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
			s=s+'-'+'</span> </span>';
		}
		s=s+'&nbsp; <br>';
	}
	s=s+'&nbsp; <br>';
	document.getElementById('keyblock').innerHTML=s;

}

function start_over() {
    var i;
	if (solving_flag==0) {
		code = document.ciphertext.cipher_place.value;
	}
	reset_key();
    plain = [];
	for (i = 0;i<code.length;i++){
		old_xlation[i]= '-';
        c = code.charAt(i);
        n = digits.indexOf(c);
        if (n != -1)
            plain[i] = '-'
        else
            plain[i] = c;
    }

	letterblock_setup()
	keyblock_setup()
	xlate();
}

function reset() {
	do_erase = confirm("Erase the current cipher?")
	if ( do_erase == true) {
		reset_key();
		input_ok();
		document.ciphertext.cipher_place.value='';
		solving_flag=0;
	}
}



function redirect() {
	window.location="checkerboard_lowres.html";
}

function screen_check() {
	if (screen.width <1000) {
		redirect();
	}
}

function restore_keyblock(flag) { // if flag ==1 include yellow selection boxes
	var s,i,c;
    var co,n;
    
	s='';
	//one column of row labels
	s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
	s=s+'&nbsp&nbsp<span width="75" height = "75" >';
	s=s+'</span> </span>';

	//digits across the top
	for (i=0;i<10;i++) {
		c = digits.charAt(i);
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'key_top" class="'+c+'keytop" style="color:blue">';
			s=s+top_key[c]+'</span> </span>';
	}
	s=s+'&nbsp; <br>';

	
	for (i=0;i<3;i++) {
		if ( i==0) cr = label0;
		else if ( i==1) cr = label1;
		else cr = label2;
		v = left_key[cr];
			//left outer
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+cr+'key_left" class="'+cr+'keyleft" style="color:blue">';
			s=s+v+'</span> </span>';
		
		//row of key block cells
		for (j=0;j<10;j++) {
            n = digits.indexOf(top_key[j]);
            if ( n == word_separator)
                co = 'red';
            else
                co = 'white';
			cc=digits.charAt(j);
			c = cr+cc;
			v = check_key[c];
			//s = s+'<span width="75" height="75" style="border: 2px solid black;background: white;"  >';
            s = s+'<span width="75" height="75" style="border: 2px solid black;background:'+co+';"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
			s += v+'</span> </span>';
		}
		if (flag) {// yellow row selection box
			//if (i>0){ // row i==0 is always fixed
				s = s+'<span width="75" height="75" style="border: 2px solid black;background: yellow;"  >';
				s=s+'&nbsp<span width="75" height = "75" id ="'+cr+'key_row" class="'+cr+'keyrow" style="color:yellow">';
				s += '&nbsp</span> </span>';
				rows_selected[cr]=0;
			//}
		}
		
		s=s+'&nbsp; <br>';
	}
	if (flag) {//put in yellow column boxes
	//one column of blank place holders
		s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
		s=s+'&nbsp&nbsp<span width="75" height = "75" >';
		s=s+'</span> </span>';
		
	
		// yellow selection boxes
		for (i=0;i<10;i++) {
				c = digits.charAt(i);
				s = s+'<span width="75" height="75" style="border: 2px solid black;background: yellow;"  >';
				s=s+'&nbsp<span width="75" height = "75" id ="'+c+'key_column" class="'+c+'keycolumn" style="color:yellow">';
				s += '&nbsp</span> </span>';
				columns_selected[c] = 0;
		}
	} // end if flag
	s=s+'&nbsp; <br>';
	document.getElementById('keyblock').innerHTML=s;

}
	


function set_original_buttons() {
    str = '<INPUT id="start_over2" type=button value="start over" >';
    str = str+'<INPUT id="reset2" type=button value="erase cipher" >';
    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    str += '<input type=button value = "undo" id="do_undo2">'
    str += '<input type=button value = "redo" id="redo_button" disabled>';
    str += '<br><br><br>';
    str = str + '<INPUT id="setup_swap2" type=button value="swap rows or columns in key" >';
	document.getElementById('button_actions').innerHTML= str;
    document.getElementById('start_over2').addEventListener("click",start_over);
    document.getElementById('reset2').addEventListener("click",reset);
    document.getElementById('do_undo2').addEventListener("click",do_undo);
    document.getElementById('redo_button').addEventListener("click",do_redo);
     document.getElementById('setup_swap2').addEventListener("click",setup_swap);
}

function restore_original() {
	set_original_buttons();
	restore_keyblock(0);
}

function do_swap() {
	var i,ccnt,rcnt, col1,col2,row1,row2,s,n,p,c;
	
	ccnt = rcnt=0
	for (i=0;i<3;i++){
		if ( i==0) c = label0;
		else if ( i==1) c = label1;
		else c = label2;
		if (rows_selected[c]==1) {
			if (rcnt==0) row1=c;
			else if ( rcnt ==1 )row2=c;
			rcnt += 1;
		}
	}
	
	for (i=0;i<10;i++) {
		c = digits.charAt(i);
		if (columns_selected[c]==1) {
			if (ccnt==0) col1=c;
			else if ( ccnt ==1 )col2=c;
			ccnt += 1;
		}
	}
    /*
	if (ccnt+rcnt>2) {
			alert("Too many rows/columns selected!")
			return
	}
	if (ccnt>0 && rcnt>0){
			alert("Select only rows or only columns!")
			return
	}
    */
	if (ccnt+rcnt<2) {
			alert("Select at least a PAIR of rows or a PAIR of columns!")
			return
	}

	if (rcnt>2) {
			alert("Too many rows selected!")
			return
	}
	if ( rcnt ==2) { //swap rows row1 and row2
      update_undo();
//      document.getElementById('redo_button').disabled = true;
      if ( ccnt == 0) {
        /* no point in swaping left keys, they are merely labels in this cipher type
		// swap left keys
		s = left_key[row1];
		left_key[row1]= left_key[row2];
		left_key[row2] = s
        */
		// swap rows in keyrectangle
		for (i=0;i<10;i++) {
			n = digits.charAt(i);
			s = check_key[row1+n];
			check_key[row1+n] = check_key[row2+n];
			check_key[row2+n]=s;
		}
       }
       else { // swap just the column checked
		for (i=0;i<10;i++)
            if ( columns_selected[i] == 1){
			n = digits.charAt(i);
			s = check_key[row1+n];
			check_key[row1+n] = check_key[row2+n];
			check_key[row2+n]=s;
		}
       }
       
	}
	else if ( ccnt ==2) { //swap columns col1 and col2
        update_undo();
//        document.getElementById('redo_button').disabled = true;
		// swap top keys
		s = top_key[col1];
		top_key[col1]= top_key[col2];
		top_key[col2] = s
		// swap columns in keyrectangle
		for (i=0;i<3;i++) {
			if ( i==0)
				n = label0;
			else if ( i==1)
				n = label1;
			else n = label2;
			//n = digits.charAt(i);
			s = check_key[n+col1];
			check_key[n+col1] = check_key[n+col2];
			check_key[n+col2]=s;
		}
	}
	restore_original();
}

function setup_swap() {
	str='Select a pair of rows or columns by clicking their yellow boxes. ';
	str += 'Then click the swap button.<br> Or select a pair of rows and check specific columns for the row swap.<br>';
	//str += '<br><input type="button" value="Swap" onclick=do_swap()>';
    str += '<br><input type="button" value="Swap" id="do_swap3">';
	//str += '&nbsp&nbsp<input type="button" value="Cancel" onclick=restore_original()>';
    str += '&nbsp&nbsp<input type="button" value="Cancel" id="restore_original3">';
	document.getElementById('button_actions').innerHTML= str;
    document.getElementById('do_swap3').addEventListener("click",do_swap);
    document.getElementById('restore_original3').addEventListener("click",restore_original);
	restore_keyblock(1);
}



function initialize(){
	var ck;
	
    word_separator = document.getElementById('word_separator').value;
    ck = digits.indexOf(word_separator);
    if ( word_separator=='' || ck == -1 ) {
        alert("Must enter a digit for the word separator");
        return;
    }
	reset_key();
	letterblock_setup();
	keyblock_setup();
	set_original_buttons();
	xlate();
    disk_setup();
    web_worker_setup();
}

function disk_setup(){
var str;

//str = '<br><INPUT onclick=save_to_disk(); type=button value="save work to disk" >';
str = '<br><INPUT id="save_to_disk4" type=button value="save work to disk" >';
//str += '<INPUT onclick=get_from_disk(); type=button value="retrieve work from disk" >'
str += '<INPUT id="get_from_disk4" type=button value="retrieve work from disk" >'
//str += '<INPUT onclick=clear_disk(); type=button value="clear work from disk" >';
str += '<INPUT id="clear_disk4" type=button value="clear work from disk" >';
document.getElementById('diskops').innerHTML=str;
document.getElementById('save_to_disk4').addEventListener("click",save_to_disk);
document.getElementById('get_from_disk4').addEventListener("click",get_from_disk);
document.getElementById('clear_disk4').addEventListener("click",clear_disk);
}

function save_to_disk(){
	var i,j, str;
	
	if (typeof(localStorage) == 'undefined' ) {
		alert('Your browser does not support HTML5 localStorage. Try Chrome.');
	}
	else {
		try {
			localStorage.setItem("tridigital.cipher", data); //saves to the database, �key�, �value�
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!'); //data wasn�t successfully saved due to quota exceed so throw an error
			}
		}
	}
    str = ''+word_separator;
	localStorage.setItem("tridigital.word_separator", str);
	str = '';
	for (i=0;i< code.length;i++) {
		str += plain[ i ];
	}
	localStorage.setItem("tridigital.plain", str);
	str = '';
	for (i=0;i<30;i++) {
		str += plain_key[i];
	}
	localStorage.setItem("tridigital.plain.key", str);
    str = '';
	for (j=0;j<10;j++) {
		str += check_key[ label0+digits.charAt(j) ];
		str += check_key[ label1+digits.charAt(j) ];
		str += check_key[ label2+digits.charAt(j) ];
	}
	localStorage.setItem("tridigital.check.key", str);
    str = '';
	for (j=0;j<10;j++)
		str += top_key[digits.charAt(j) ];
	localStorage.setItem("tridigital.top.key", str);
	alert("Work saved on disk");

}
function clear(){
		reset_key();
		input_ok();
		document.ciphertext.cipher_place.value='';
		solving_flag=0;
        undo_index = redo_index = 0;
}

function get_from_disk(){
	var s,i,j,k,temp;
    
	temp = localStorage.getItem("tridigital.cipher");
	if (temp == undefined){
		alert("No cipher stored");
		return
	}
    clear();
    document.getElementById('cipher_place').value = temp;
    s = localStorage.getItem("tridigital.word_separator");
    document.getElementById('word_separator').value=s;
    initialize();
    s = localStorage.getItem("tridigital.plain");
    for (i=0;i<code.length;i++)
        plain[i] = s.charAt(i);
    s = localStorage.getItem("tridigital.plain.key");
    for (i=0;i<30;i++)
        plain_key[i] = s.charAt(i);
    s = localStorage.getItem("tridigital.check.key");
    i = 0;
	for (j=0;j<10;j++) {
		check_key[ label0+digits.charAt(j) ] = s.charAt(i++);
		check_key[ label1+digits.charAt(j) ]  = s.charAt(i++);
		check_key[ label2+digits.charAt(j) ]  = s.charAt(i++);
	}
    s = localStorage.getItem("tridigital.top.key");
    for (i=0;i<10;i++)
        top_key[digits.charAt(i)] = s.charAt(i);
    xlate();
    restore_keyblock(0);
}

function copy_selection () {
            var selection = "";
            var out_str,n,data,i;
            var pos,c;

            var textarea = document.getElementById("computer_output");
            data = textarea.value;
            if ('selectionStart' in textarea) {
                    // check whether some text is selected in the textarea
                if (textarea.selectionStart != textarea.selectionEnd) {
                    selection = textarea.value.substring  (textarea.selectionStart, textarea.selectionEnd);
                }
            }
            else {  // Internet Explorer before version 9
                    // create a range from the current selection
                var textRange = document.selection.createRange ();
                    // check whether the selection is within the textarea
                var rangeParent = textRange.parentElement ();
                if (rangeParent === textarea) {
                    selection = textRange.text;

                }
            }
            if (selection =='') return;
            update_undo();
            document.getElementById('redo_button').disabled = true;
            
            pos = textarea.selectionStart;
            for (i=0;i<selection.length;i++){
              c = selection.charAt(i);
              plain[pos+i] = c;
              n = symbols.indexOf(c);
              if ( n!=-1) {
                plain_key[n] = code.charAt(pos+i);
                update_check_key(c,plain_key[n]);
              }
                
            }

            xlate();
            restore_keyblock(0);
            
            
}


function clear_disk(){
	localStorage.removeItem("tridigital.cipher");
	localStorage.removeItem("tridigital.word_separator");
	localStorage.removeItem("tridigital.plain");
	localStorage.removeItem("tridigital.plain.key");
	localStorage.removeItem("tridigital.check.key");
	localStorage.removeItem("tridigital.top.key");
	alert("work cleared from disk");
}

function web_worker_setup(){
    s = "<br> <b>computer output:</b>";
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'status 0: <input type=text value = "idle" size = 4 id="status0" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'status 1: <input type=text value = "idle" size = 4 id="status1" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += '( fudge 0: <input type=text value = "0.001" size = 3 id="fudge0" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'fudge 1: <input type=text value = "0.005" size = 3 id="fudge1" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'Number of Trial Decrypts: <input type=text value = "10000" size = 6 id="max_trials" > )'
    s += '<br><br>';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s += '<input type="button" value="Copy selected plaintext to worksheet" id="copy_selection2" >';
    
    s += '<br><br>';
    s += '<textarea rows = 8  cols = 100 id="computer_output">';
    s += '</textarea>';
    s += '<br><input type=button id = "do_solve" value = "Solve">'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    //s += 'fudge 0: <input type=text value = "0.5" size = 3 id="fudge0" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    //s += 'fudge 1: <input type=text value = "0.3" size = 3 id="fudge1" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += '<input type=button id = "stop_solve" value = "Stop Solver">'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s += '<input type=checkbox id = "word_scoring" > Use word list scoring.'
    
    s+='&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;&nbsp; &nbsp; &nbsp; &nbsp;';
    s+='<input type="checkbox" id = "custom_table" >';
    s+='Make custom tet table from book.';
    s+='&nbsp; &nbsp; &nbsp; &nbsp;';
    s+='Book file: ';
    s+='<input type="file" id="input" >';
    s += '<br><br>';
    s += '<input type=button id="key_search" value="Key search">';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'Key search word list: <input type="file" id="input2" ></span><br>';
    s += '<br><br><br>'; // add a little room at bottom
    document.getElementById('computerblock').innerHTML=s;
    document.getElementById('do_solve').addEventListener("click",do_solve);
    document.getElementById('stop_solve').addEventListener("click",stop_solve);
    document.getElementById('custom_table').addEventListener("change", set_reload);
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});
    document.getElementById('copy_selection2').addEventListener("click", copy_selection);
    
    document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );document.
    getElementById('key_search').addEventListener("click",do_key_search);
    
}

function initialize_worker(){
    var s1,s2,score;
    
   hworker = new Worker('tridigital_worker.js');
   hworker.onmessage = function (event) {
    s1 = event.data.s1;
    s2 = event.data.s2;
    document.getElementById('status0').value = s2;
    if ( s2 != 'Done') {
        score = parseFloat(s2);
        if (score > best_score || current_channel==0){
            document.getElementById('computer_output').value = s1;
            best_score = score;
            current_channel = 0;
        }
   }
   }
   
   hworker2 = new Worker('tridigital_worker.js');
   hworker2.onmessage = function (event) {
    s1 = event.data.s1;
    s2 = event.data.s2;
    document.getElementById('status1').value = s2;
    if ( s2 != 'Done') {
        score = parseFloat(s2);
        if (score > best_score || current_channel==1){
            document.getElementById('computer_output').value = s1;
            best_score = score;
            current_channel = 1;
        }
   }
   }
   
   if (document.getElementById('custom_table').checked == true) {
    if (book_string == ''){
        alert("No book file chose for custom tet table");
        return;
    }
    var xfer = {};
    xfer["op_choice"] = "make_table";
    xfer["str1"]= book_string;
    hworker.postMessage(xfer);  	// command hclimber to make custom table
    hworker2.postMessage(xfer);
   }
   
}


function do_solve(){
    var xfer,i;
    
    if ( stopped_flag) {
        initialize_worker();
        stopped_flag = false;
    }
    best_score = -10000;
    xfer = {};
    xfer["op_choice"] = 'solve';
    xfer["str1"] = code;
    crib = '';
    for (i=0;i<plain.length;i++)
        crib += plain[i];
    xfer["crib"] = crib;
    xfer["max_trials"] = document.getElementById('max_trials').value;
    xfer["separator"] = word_separator;
    if ( document.getElementById('word_scoring').checked )
        xfer["word_scoring"] = true;
    else
        xfer["word_scoring"] = false;
    xfer["fudge_factor"] = document.getElementById('fudge0').value;
    hworker.postMessage(xfer);
    xfer["fudge_factor"] = document.getElementById('fudge1').value;
    hworker2.postMessage(xfer);
}

function stop_solve(){
    hworker.terminate();
    hworker2.terminate();
    document.getElementById('status0').value = "stopped";
    document.getElementById('status1').value = "stopped";
    stopped_flag = true;
}

function do_key_search(){
    var i,j,n,c,col,s;
    var n1,n2,n3, index, out_str, score, best_score;
    var word_list_index,result;
    var l_alpha = "abcdefghijklmnopqrstuvwxyz";
    
    if ( word_list_string ==''){
        alert("No word list selected!");
        return;
    }
	if (is_check_key_inconsistent() )
		return; // check_key array has more than one copy of some letter
	
    // set up letter columns in digital form from current key (=check_key).
    key_cols = []; // global
    for (col = 0;col<10;col++){
        key_cols[col] = [-1,-1,-1];
        index = 0;
        c = label0+digits[col];
        n = symbols.indexOf(check_key[c]);
        if (n < 26) // not a dash
            key_cols[col][index++] = n;
        c = label1+digits[col];
        n = symbols.indexOf(check_key[c]);
        if (n < 26) // not a dash
            key_cols[col][index++] = n;
        c = label2+digits[col];
        n = symbols.indexOf(check_key[c]);
        if (n < 26) // not a dash
            key_cols[col][index++] = n;
    }

    // read through word list
    word_list_string = word_list_string.toLowerCase();
    var state = 0; // no current word
    var wrd = [];
    var index = 0;
    var best_score = -100;
    s = '';
    for (word_list_index = 0;word_list_index<word_list_string.length;word_list_index++){
        c = word_list_string.charAt(word_list_index);
        n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            wrd[index++] = n;
            s += c;
            state = 1;
        }
        else if (state == 1){
            if (n >=0) {
                wrd[index++] = n;
                s += c;
            }
            else { // have read in a word, score it
                result = score_key_word(wrd);
                score = result[0];
                if ( score > best_score){
                    best_score = score;
                    out_str = "WORD: "+s+" SCORES: "+score+"\nKey array:\n";
                    for (i=0;i<26;i++){
                        out_str += l_alpha.charAt(result[1][i]);
                        if ( i== 8|| i == 17)
                            out_str += '\n';
                    }
                    document.getElementById('computer_output').value = out_str;
                }
                state = 0;
                // set up for next word
                wrd = [];
                s='';
                index = 0;
            }
        }
    } // next word_list_index
}

function score_key_word(wrd){ // score the digital characters in the wrd array
// extend wrd to key_array
    var i,j,c,n,next_key,index;
    next_key = [];
    for (i=0;i<26;i++)
        next_key[i] = false;
    var key_array = [];
    num_key = []; // global
    index = 0;
    for (i=0;i<wrd.length;i++){
        if (!next_key[ wrd[i]]){
            key_array[index++] = wrd[i];
            next_key[wrd[i]] = true;
        }
    }
    for (i=0;i<26;i++)
        if (!next_key[i])
            key_array[index++] = i;
    // now assign 'letters' in key array to 9 columns
    index = 0;
    for (j=0;j<26;j++) {
        num_key[ key_array[j] ] = index;
        index = (index+1)%9;
    }
    // now compare with key columns from tridigital cipher
    for (i=0;i<10;i++)
        used_digit[i] = false; // global
    score = 0;
    var ws = digits.indexOf(word_separator);
    for (j=0;j<10;j++) {
       score += check_col_match(j);
    }
    return([score,key_array]);
}

function check_col_match(index){
   var i,j,c;
   
   if ( key_cols[index][0] == -1 ) // no letters filled in for this column
        return(1); // empty colum does match!
   c = key_cols[index][0];
   var x = num_key[c]; // column in key word array that has c;
   if ( used_digit[x]) return(0); // this column already used.
   if (key_cols[index][1] != -1 && num_key[key_cols[index][1] ] != x)
    return(0); // tridital key in two different columns
   if (key_cols[index][2] != -1 && num_key[key_cols[index][2] ] != x)
    return(0); // tridital key in two different columns
   used_digit[x] = true;
   return(1); // tridigital column matches the key_array column
}


onload=function(){
    document.getElementById('initialize').addEventListener("click",initialize);
    document.getElementById('get_from_disk').addEventListener("click",get_from_disk);
}
