
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];
var search_pattern = [];
var word_list_array=[];
var key_pairs= '';

var stop_flag = 0;
var worker;

// new crib stuff
var crib=''; // new global variable
var plain_len;
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)

// 6x6 stuff
var alpha5='abcdefghijklmnopqrstuvwxyz';
var alpha6 = 'abcdefghijklmnopqrstuvwxyz0123456789';
var symbols5 = 'abcdefghijklmnopqrstuvwxyz-';
var symbols6 = 'abcdefghijklmnopqrstuvwxyz0123456789-';

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
  document.getElementById('output_area').value = s;
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


function do_search(){
    var i,j,n,state;
    var strs,kw,mt,cs,cb
    var v_keys,h_keys,n1,n2;
    var str,str2;
    var ciphertext='';
    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var key_score_flag, hill_climb_flag;
    
    var v_letters_found = [];
    var h_letters_found = [];
    var max_trials, op_choice,bs, max_ss_trials, max_simple_sub_trials;

	max_trials = parseInt(document.getElementById('numb_trials').value);	    
    max_ss_trials = parseInt(document.getElementById('numb_ss_trials').value);	    
    var max_letters = 10; // later allow for possibility of 12 for 6x6 checkerboard
    
   if ( document.getElementById('6x6').checked )
    max_letters = 12
   else
    max_letters = 10;
	if (max_letters == 12)
        kw = 6;
    else
        kw = 5;
   if ( document.getElementById('key_score').checked )
    key_score_flag = true;
   else
    key_score_flag = false;
   if ( document.getElementById('key_ic').checked )
    hill_climb_flag = false;
   else
    hill_climb_flag = true;  
	if (document.getElementById('hc_simple_sub').checked){
		ciphertext = document.getElementById('simp_sub_area').value
		if (ciphertext == '') {
			alert("No Simple substitution cipher entered!");
			return;
		}
		max_simple_sub_trials = parseInt(document.getElementById("numb_simp_sub_trials").value);	    
		
	} // end hill-climb simple sub checked
   else {	// hill-climb simple sub not checked
   ciphertext = document.getElementById('cipher_area').value
   if (ciphertext == '') {
    alert("No ciphertext entered!");
    return;
   }
   state = 0;
   str = ciphertext.toUpperCase();
    for (i=0;i<26;i++)
        v_letters_found[i] = h_letters_found[i] = 0;
   for (i=0;i<str.length;i++){
	   c = str.charAt(i);
	   if (symbols.indexOf(c) != -1) {
         if (state ==0 ) {
            v_letters_found[symbols.indexOf(c)] = 1;
            state = 1;
         }
         else {
            h_letters_found[symbols.indexOf(c)] = 1;
            state = 0;
         }
       }
	}
    if ( state == 1) {
        alert("Odd number of ciphertext letters!");
        return;
    }
    str = ''; // get unique key letters.
    cnt = 0
    for (i=0;i<26;i++)
        if (v_letters_found[i] == 1){
            cnt++;
            str += symbols.charAt(i);
    }
	if (cnt > max_letters) {
		alert("Too many vertical key letters!");
		return;
	}
	var extra_letters = 'TALESCRONY'; // two words from wordle search list. probably dont need more than 10 even with 6x6
	var extra_letters_index = [];
	for (i=0;i<10;i++){
		n = symbols.indexOf( extra_letters.charAt(i) );
		extra_letters_index.push(n);
	}
	while ( cnt < max_letters){ // fill in with unused extra_letters
        for (i=0;i<10;i++) {
			n = extra_letters_index[i];
            if (v_letters_found[n] == 0)
                break; // use letter n
		}

		v_letters_found[n] = 1;
        str += symbols.charAt(n);
        cnt++;
	}
    str2 = ''; // get unique key letters.
    cnt = 0;
    for (i=0;i<26;i++)
        if (h_letters_found[i] == 1){
            cnt++;
            str2 += symbols.charAt(i);
    }    
	if (cnt > max_letters) {
		alert("Too many horizontal key letters!");
		return;
	}
	while ( cnt < max_letters){ // fill in with unused extra_letters
        for (i=0;i<10;i++) {
			n = extra_letters_index[i];
            if (h_letters_found[n] == 0)
                break; // use letter n
		}

		h_letters_found[n] = 1;
        str2 += symbols.charAt(n);
        cnt++;

	}
    v_keys = str;
    h_keys = str2;   
	} // end 'else' simple sub not checked   
   worker = new Worker('dbl_chkb_pseudokeys_worker.js');
   worker.onmessage = function(event) {
   	 str = event.data;
     if (str.charAt(0) != '~')
        document.getElementById('output_area').value = str;
     else
        document.getElementById('keys_searched').value = str.slice(1);
   }
   // allow for webkit prefix or its removal
   worker.postMessage = worker.webkitPostMessage || worker.postMessage;
   if (document.getElementById('custom_table').checked == true) {
        if ( book_string =='') {
            alert("No book selected for custom table!");
            return;
        }
        worker.postMessage( {op_choice:1, bs:book_string });  	// command worker to make custom table
   }
   if ( crib_status_flag>0)
    crib = document.getElementById('crib_area').value;
	if (document.getElementById('hc_simple_sub').checked){
		//alert("simple sub");
		worker.postMessage( { op_choice:2, ct:ciphertext, ms:max_simple_sub_trials, cs:crib_status_flag, cb:crib } );
	}
	else 
	worker.postMessage( { op_choice:0, vk:v_keys, hk:h_keys, kw:kw, ct:ciphertext,
    mt:max_trials, ks:key_score_flag, hc:hill_climb_flag, ms:max_ss_trials, cs:crib_status_flag, cb:crib } );
}

function do_stop(){
	var str;
	
	worker.terminate();
    str = document.getElementById('output_area').value;
    str += '\nprocessing terminated';
    document.getElementById('output_area').value = str;
	stop_flag = 1;
}

function do_clear(){
	document.getElementById('output_area').value = '';
	document.getElementById('cipher_area').value = '';
}

function initialize_crib() {
    var i;
	var s,s1,n,c;
	//var alpha='abcdefghijklmnopqrstuvwxyz';
	
    var alpha;   
  if (document.getElementById('hc_simple_sub').checked){
	alpha = alpha5;
	s = document.getElementById('simp_sub_area').value;
	if (s == ''){
		alert("No simple substitution cipher entered");
		return;
	}
	s = s.toLowerCase();
	s1=''
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1)
			s1 += c;
	}
    n = s1.length;
    plain_len = s1.length;
    crib = '';
    for (i=0;i<plain_len;i++)
        crib += '-';
    document.getElementById('crib_area').value = crib;
	return;
  } // end if hc_simple_sub checked	
    if (document.getElementById('6x6').checked)
        alpha = alpha6;
    else
        alpha = alpha5;
    
	s = document.getElementById('cipher_area').value;
	if (s == ''){
		alert("No ciphertext text entered");
		return;
	}
	s = s.toLowerCase();
	s1=''
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1)
			s1 += c;
	}
	if ( (s1.length%2) !=0 ){
		alert("Ciphertext length not divisible by 2!");
		return;
	}
    n = s1.length;
    plain_len = n/2;
    crib = '';
    for (i=0;i<plain_len;i++)
        crib += '-';
    document.getElementById('crib_area').value = crib;
}    
    

function copy_selection () {
            var selection = "";
            var out_str,n,data,i;

            var textarea = document.getElementById("output_area");
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
            if (crib==''){
                alert("Crib not initialized!");
                return;
            }
            // remove everything surperflous from possibly pasted in crib
            clean_crib();
            out_str = crib.slice(0,textarea.selectionStart)+selection+crib.slice(textarea.selectionEnd)
            document.getElementById("crib_area").value=out_str;
            crib = out_str;
}

function save_crib(){
    crib = document.getElementById("crib_area").value;
    if (document.getElementById("crib_status").checked)
        crib_status_flag = 1;
    else crib_status_flag = 0;
    if (crib_status_flag == 1 && document.getElementById("float_crib").checked)
        crib_status_flag = 2;
}    

function clean_crib(){    
// remove everything surperflous from possibly pasted-in crib
    var i,s,n,c;
    //var symbols='abcdefghijklmnopqrstuvwxyz-';
    var symbols;
    if (document.getElementById('6x6').checked)
        symbols = symbols6;
    else
        symbols = symbols5;
    
    save_crib();
    crib = crib.toLowerCase();
    s = '';
    for ( i=0;i<crib.length;i++){
        c = crib[i];
        n = symbols.indexOf(c);
        if (n>=0)
            s += c;
    }
    crib = s;
}    
    
function do_crib(){
    var s;
    
    if (crib==''){
        s = "Paste crib from dragging program (after you clear this message) or click initalize button."; 
        s += ' Or use short crib and check floating crib box. If multiple floating cribs put them on separate lines.';
    }
    else
        s = crib;
    display_message(s);
}    

function display_message(message){
	var s;
	
	s = '<span id="m_display">';
	//s += message;
    s += '<textarea id="crib_area" cols=80 rows=5 spellcheck="false" ></textarea>';
	s += '<br><br><center>';
    s += '<input type="checkbox" id = "crib_status" > use crib in solving &nbsp;&nbsp;&nbsp;';
    s += '<input type="checkbox" id = "float_crib" > floating crib &nbsp;&nbsp;&nbsp;';    
    s += '<input value="Initialize crib" id="initialize_crib2" type="button"> ';
    s += '<input value="Copy selected plaintext to crib" id="copy_selection2" type="button"> ';
    s += '<input value="Close" id="hide_message2" type="button">';
    s += '<input value="Clear" id="clear_crib_display2" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
    if (crib_status_flag == 1) document.getElementById('crib_status').checked=true;
	document.getElementById('m_display').style.visibility="visible";
    document.getElementById('crib_area').value = message;
    document.getElementById('crib_area').focus();
    document.getElementById('crib_status').addEventListener("click", save_crib);   
    document.getElementById('float_crib').addEventListener("click", save_crib);   
    document.getElementById('initialize_crib2').addEventListener("click", initialize_crib);   
    document.getElementById('copy_selection2').addEventListener("click", copy_selection);   
    document.getElementById('hide_message2').addEventListener("click", hide_message);   
    document.getElementById('clear_crib_display2').addEventListener("click", clear_crib_display);   
}


function clear_crib_display(){
    if (crib != ''){
        var do_confirm = confirm("Clear crib?");
        if (do_confirm == false) return;
    }
    document.getElementById('crib_area').value = '';
    document.getElementById('crib_area').focus();
}
    

function hide_message(){
    save_crib();
	document.getElementById('m_display').style.visibility="hidden";
}


onload = function() {
    document.getElementById('search_for_pattern').addEventListener("click",do_search);    
    document.getElementById('custom_table').addEventListener("change", set_reload); 
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});  
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear); 
    document.getElementById('do_crib1').addEventListener("click",do_crib); 
    document.getElementById('key_ic').addEventListener("click",function(){document.getElementById('do_crib1').disabled = true;} )
    document.getElementById('key_hc').addEventListener("click",function(){document.getElementById('do_crib1').disabled = false;} )
    document.getElementById('hc_simple_sub').addEventListener("click",function(){document.getElementById('do_crib1').disabled = false;} )    
}    
