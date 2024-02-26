var symbols="abcdefghijklmnopqrstuvwxyz-"
var c_symbols="ABCDEFGHIJKLMNOPQRSTUVWXYZ-"
var digits="0123456789";

var solving_flag = 0;
var plain_key= [];
var code,data;
var plain ;
var line_limit = 90;
var fire_fox = 1;
var dobj, cpos;

// undo and redo routines and variables

var undo_array = [];
var redo_array = [];
var undo_index = 0;
var redo_index = 0;

var undo_array2 = [];
var redo_array2 = [];

// web worker stuff
var stopped_flag = true;
var hworker,hworker2;
var best_score = -1000;
var current_channel = 0;
var crib = '';

function letters_only(str){ // remove everything except letters
	str = str.toLowerCase();
	return str.replace(/[^a-z]/g,'');
}



function do_undo(){
    var i,j;

    if (undo_index == 0) return;
    redo_array[redo_index] = [];
    redo_array2[redo_index] = [];
	for (i=0;i<code.length;i++) {
		redo_array[redo_index][i] = plain[ i ];
	}
	for (i=0;i<26;i++) {
		redo_array2[redo_index][i] = plain_key[ i ];
	}
    
    redo_index++;
    undo_index--;
	for (i=0;i<code.length;i++) {
		plain[ i ] = undo_array[undo_index][i];
	}
	for (i=0;i<26;i++) {
		plain_key[ i ] = undo_array2[undo_index][i];
	}
    
    document.getElementById('redo_button').disabled = false;
    update_keyblock();
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
    update_keyblock();
    xlate();
}

function update_undo(){
    var i,j;

    undo_array[undo_index] = [];
    undo_array2[undo_index] = [];
	for (i=0;i<code.length;i++) {
		undo_array[undo_index][ i ] = plain[ i ];
	}
	for (i=0;i<26;i++) {
		undo_array2[undo_index][ i ] = plain_key[ i ];
	}
    undo_index++;
    redo_index = 0;

}

// custom tet table
var book_string = '';
function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
	//alert(str);
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
  book_string = fileString;
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


function setup_code() {
    var n,i,c;
	data = document.getElementById('cipher_place').value;
	if (data.length<2){
		alert("No ciphertext entered!");
        clear();
		return;
	}
	data = data.toUpperCase();
	// global replace of line feeds and carriage returns with blank
	//code = data.replace(/[\n\r]/g,' ');
	// global relace of strings of line feeds, carriage returns, and blanks with a single blank
	code = data.replace(/\s\s+/g,' ');
	solving_flag = 1;
	document.getElementById('outputblock').style.border = "3px ridge black";
    
	//solving_flag=1;
	old_xlation = ['-'];
    plain = [];
	for (i = 0;i<code.length;i++){
		old_xlation[i]= '-';
        c = code.charAt(i);
        n = c_symbols.indexOf(c);
        if (n>-1 && n<26)
            plain[i] = '-'
        else
            plain[i] = c;
    }
        
	document.body.style.cursor = 'crosshair';
    undo_index = redo_index = 0;
}

function clear(){
    var str;
    str = 'Ciphertext: (Enter cipher into this box, click the Initialize button)<BR>';
    str += '<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
    document.getElementById('outputblock').innerHTML = str;
    document.getElementById('letterblock').style.display="none";
    document.getElementById('keyblock').innerHTML = '';
    document.getElementById('undo_redo').innerHTML = '';
    str = '<input type = "button" value="Initialize"; id="initialize1" >';
    str += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
    str += '<INPUT id="get_from_disk1" type=button value="retrieve work from disk" >'
    document.getElementById('initial').innerHTML = str;
    document.getElementById('initialize1').addEventListener("click",initialize);
    document.getElementById('get_from_disk1').addEventListener("click",get_from_disk);
    
    undo_index = redo_index = 0;
    solving_flag = 0;
}

function reset_key(){
    var i;
    for (i=0;i<26;i++)
        plain_key[i] = '-';
    update_keyblock();
}

function letterblock_setup(){
	var s,i,c;
    s = "Click on one of the blue symbols below , then click below a cipher letter in the box above or on a place in the Key Table below. ";
	s += "<br> To insert several symbols put them in the <b>Insertion Box</b> and insert the first symbol as usual.<br>"
    document.getElementById('initial').innerHTML=s;
    document.getElementById('letterblock').style.display="block";
	
	s=''

	for (i=0;i<symbols.length;i++) {
		c = symbols.charAt(i);

		s = s+'<span width="75" height="75" style="border: 2px solid white;background: white;"  >';
		s=s+'&nbsp<span width="75" height = "75" id ="'+c+'letter" class="'+c+'key" style="color:blue">';
		s=s+c+'</span> </span>';
	}
	s=s+'<br>';
	document.getElementById('letterblock').innerHTML=s;
	last_cell='';
    s = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    s += '<input type=button value = "undo" id="do_undo2">'
    s += '<input type=button value = "redo" id="redo_button" disabled>';
    document.getElementById('undo_redo').innerHTML=s;
    document.getElementById('do_undo2').addEventListener("click",do_undo);
    document.getElementById('redo_button').addEventListener("click",do_redo);
}

function xlate() {
	var state,str,limit,pos,pl,cnt,c1,n,c;
    
	str='';
	//str='<style="font-family:monospace; font-size:15px;">';
	limit=line_limit;

	if (code.length<limit)
		limit = code.length;
    else {// break at white space
        c = code.charAt(limit-1);
        n = c_symbols.indexOf(c);
        while ( n > -1 && n <26){
            limit--;
            c = code.charAt(limit-1);
            n = c_symbols.indexOf(c);
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
                n = c_symbols.indexOf(c);
                while ( n > -1 && n <26){
                    limit--;
                    c = code.charAt(pos+limit-1);
                    n = c_symbols.indexOf(c);
                }
            }
		}
	}
	//document.ciphertext.cipher_place.value=str;
	document.getElementById('outputblock').innerHTML=str;
}


function outblock_setup(){
    if (solving_flag == 0){
        setup_code();
    }
    xlate();
}

function initialize(){
reset_key();
letterblock_setup()
insertionblock_setup();
outblock_setup()
disk_setup();
web_worker_setup();
}


function insertionblock_setup(){
	//alert("insertion box goes here");
	var s='<b>Insertion Box: </b> <input type=text value = "" size = 6 id="insertion_Box" > '
	document.getElementById('insertionblock').innerHTML=s;
}

function disk_setup(){
var str;

str = '<br><INPUT id="save_to_disk3" type=button value="save work to disk" >';
str += '<INPUT id="get_from_disk3" type=button value="retrieve work from disk" >'
str += '<INPUT id="clear_disk3" type=button value="clear work from disk" >';
document.getElementById('diskops').innerHTML=str;
document.getElementById('save_to_disk3').addEventListener("click",save_to_disk);
document.getElementById('get_from_disk3').addEventListener("click",get_from_disk);
document.getElementById('clear_disk3').addEventListener("click",clear_disk);


}

function save_to_disk(){
	var i,j, str;
	
	if (typeof(localStorage) == 'undefined' ) {
		alert('Your browser does not support HTML5 localStorage. Try Chrome.');
	}
	else {
		try {
			localStorage.setItem("keyphrase.cipher", data); //saves to the database, �key�, �value�
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!'); //data wasn�t successfully saved due to quota exceed so throw an error
			}
		}
	}
	str = '';
	for (i=0;i< code.length;i++) {
		str += plain[ i ];
	}
	localStorage.setItem("keyphrase.plain", str);
	str = '';
	for (i=0;i<26;i++) {
		str += plain_key[i];
	}
	localStorage.setItem("keyphrase.plain.key", str);
	alert("Work saved on disk");

}

function get_from_disk(){
	var s,i,j,k,temp;
    
	temp = localStorage.getItem("keyphrase.cipher");
	if (temp == undefined){
		alert("No cipher stored");
		return
	}
    clear();
    document.getElementById('cipher_place').value = temp;
    initialize();
    s = localStorage.getItem("keyphrase.plain");
    for (i=0;i<code.length;i++)
        plain[i] = s.charAt(i);
    s = localStorage.getItem("keyphrase.plain.key");
    for (i=0;i<26;i++)
        plain_key[i] = s.charAt(i);
    update_keyblock();
    xlate();
}

function clear_disk(){
	localStorage.removeItem("keyphrase.cipher");
	localStorage.removeItem("keyphrase.plain");
	localStorage.removeItem("keyphrase.plain.key");
	alert("work cleared from disk");
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
              if ( n!=-1)
                plain_key[n] = code.charAt(pos+i);
            }
            update_keyblock();
            xlate();
            
            
}

function insert_symbols_from_selection_box(p_letter,pos){ // pos is the position of the digit you clicked under, the position of the p_letter
	//alert("insertion box not empty");
	
	var i,j,k,c,n,s;
	var selection = document.getElementById('insertion_Box').value;
	selection = letters_only(selection);
	c = selection.charAt(0);
	if ( c != p_letter){
		s = 'letter selected is '+p_letter+ ' but that is not first letter in the selection box';
		alert(s);
		return;
	}
	// insert the rest of the letters.
	for (i=1;i<selection.length;i++){
        c = selection.charAt(i);              
        n = symbols.indexOf(c);
        if ( n!=-1) {
            plain[pos+i] = c; 
            plain_key[n] = code.charAt(pos+i);
        }
	}	
	document.getElementById('insertion_Box').value = '';
	
}	

function selectmouse(e){
  var p_letter,n,c,n1,c_old,c_letter;
  
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
      n1 = c_symbols.indexOf(c);
      c_old = plain[n];
      if ( n1 > -1 && n1 < 26) {
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
			if (document.getElementById('insertion_Box').value != '')
				insert_symbols_from_selection_box(p_letter,n);
			
        }
      }
      //next 3 lines for debugging
	  //s = "using letter "+p_letter+" You clicked on pos "+x+" , which is below the codepair\n";
	  //s = s+code_array[ parseInt(x)];
	  //document.debug.output_area.value= s;
	  letter_selected=0;
	  //reset letter block
	  letterblock_setup();
	  xlate();
      update_keyblock();
      return false;
  }
  else if (fobj.className.slice(0,8)=="k_letter" && letter_selected) {
	  dobj = fobj;
	  x = fobj.className.slice(8);
	  c_letter = c_symbols.charAt(cpos);
      n = parseInt(x);
      if (plain_key[n] != '-' && c_letter != plain_key[n]){
        alert("Letter selected inconsistent with letter already filed in. Undo old letters first");
      }
      else {
            update_undo();
            document.getElementById('redo_button').disabled = true;
            plain_key[n] = c_letter;
      }
	  //document.debug.output_area.value= s;
	  letter_selected=0;
	  //reset letter block
	  letterblock_setup();
	  xlate();
      update_keyblock();
      return false;
  }
	  
}
document.onmousedown=selectmouse;
function update_keyblock(){
    var str,i,j,n;
    
    str = "Key Table<br>";
    str += symbols.slice(0,26);
    str += '<br>';
    for (i=0;i<26;i++)
        //str += plain_key[i];
        str += '<span class="k_letter'+i+'">'+ plain_key[i]+'</span>';
    document.getElementById('keyblock').innerHTML=str;
    // calculate and show inverse key
    var invkey = [];
    for ( i=0;i<26;i++)
        invkey[i] = '-';
    for (i=0;i<26;i++)
        if ( plain_key[i] != '-' ){
           n = c_symbols.indexOf( plain_key[i] );
           invkey[n] += symbols.charAt(i);
    }
    str = 'Inverse key Table<br>';
    for (i=0;i<26;i++)
        str += c_symbols[i]+invkey[i]+' ';
    document.getElementById('invkeyblock').innerHTML=str;
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
    s += '<br><br>'
    s += '(For copy selection to align correctly, ciphertext word divisions must include genuine blanks)';
    s += '<br><br><br>'; // add a little room at bottom
    document.getElementById('computerblock').innerHTML=s;
    document.getElementById('do_solve').addEventListener("click",do_solve);
    document.getElementById('stop_solve').addEventListener("click",stop_solve);
    document.getElementById('custom_table').addEventListener("change", set_reload);
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});
    document.getElementById('copy_selection2').addEventListener("click", copy_selection);
    
}

function initialize_worker(){
    var s1,s2,score;
    
   hworker = new Worker('keyphrase_worker.js');
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
   hworker2 = new Worker('keyphrase_worker.js');
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


onload=function(){
    document.getElementById('initialize').addEventListener("click",initialize);
    document.getElementById('get_from_disk').addEventListener("click",get_from_disk);
}
