//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

var cipher_type=0;

// new crib stuff
var crib=''; // new global variable
var plain_len;
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)

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

function initialize(){
	var str;
	var s,hill_climb_name;
	
    if ( cipher_type == 0)
        hill_climb_name = 'columnar_ph_climb.js'; 
    else if (cipher_type == 1)
	        hill_climb_name = 'myszkowski_ph_climb.js'; 
    else if (cipher_type == 2)
	        hill_climb_name = 'amsco_ph_climb.js'; 
    else if (cipher_type == 3)
	        hill_climb_name = 'redefence_ph_climb.js'; 
    else if (cipher_type == 4)
	        hill_climb_name = 'swagman_ph_climb.js'; 
    else if (cipher_type == 5)
	        hill_climb_name = 'grille_ph_climb.js'; 
    else if (cipher_type == 6)
	        hill_climb_name = 'cadenus_ph_climb.js'; 
    else if (cipher_type == 7)
	        hill_climb_name = 'route_ph_climb.js'; 
    else if (cipher_type == 8)
	        hill_climb_name = 'nihilist_tramp_ph_climb.js'; 
            
   hclimber = new Worker(hill_climb_name);
   hclimber.onmessage = function (event) {
	 str = event.data;
	 if (str.charAt(0) == '0'){
		 s = str.split('~'); // string separated by tilde ~
		 score = parseFloat(s[0].slice(1));
		 document.getElementById('status').value = s[0].slice(1);
		 if ( score > max_score){
		 	 max_score = score;
		 	 current_channel = 0;
		 }
		
		if ( current_channel == 0)
     		document.getElementById('output_area').value = s[1]+" worker: 0";
	 
     	//document.getElementById('output_area').value = str.slice(1);
	 }
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     	document.getElementById('status').value = str.slice(1);
 	}
     else if (str.charAt(0) == '2'){ // debug message
     	//alert(str.slice(1));
     	document.getElementById('debug_area').value = str.slice(1);
 	}
	/*
     else
     	document.getElementById('output_area').value = str;
	*/
   };
   if (document.getElementById('custom_table').checked == true) {
    s = '#'; // prefix to indicate string to make table from
    s += book_string;
    hclimber.postMessage(s);  	// command hclimber to make custom table
    //alert("custom tet tabel constructed");
   }
   if (numb_workers>1){
   		hclimber2 = new Worker(hill_climb_name);
   		hclimber2.onmessage = function (event) {
			var str,i,score,s;	   
			 str = event.data; 	 
			 if (str.charAt(0) == '0') { // break up into score and display strings
				 s = str.split('~'); // string separated by tilde ~
				 score = parseFloat(s[0].slice(1));
				 document.getElementById('status1').value = s[0].slice(1);		 
				 if ( score > max_score){
					 max_score = score;
					 current_channel = 1;
				 }
				
				if ( current_channel == 1)
   		  		document.getElementById('output_area').value = s[1]+" worker: 1";
   		  	
 			}
   		  else if (str.charAt(0) == '1'){
   		  	//alert(str.slice(1));
   		  		document.getElementById('status1').value = str.slice(1);
 			}
   		  else
   		  	document.getElementById('output_area').value = str+" worker: 1";   
   		};
        if (document.getElementById('custom_table').checked == true) {
            s = '#'; // prefix to indicate string to make table from
            s += book_string;
            hclimber2.postMessage(s);  	// command hclimber to make custom table
            //alert("custom tet tabel constructed");
        }
   }
   if (numb_workers>2){
   		hclimber3 = new Worker(hill_climb_name);
   		hclimber3.onmessage = function (event) {
			var str,i,score,s;	   
			 str = event.data; 	 
			 if (str.charAt(0) == '0') { // break up into score and display strings
				 s = str.split('~'); // string separated by tilde ~
				 score = parseFloat(s[0].slice(1));
				 document.getElementById('status2').value = s[0].slice(1);		 
				 if ( score > max_score){
					 max_score = score;
					 current_channel = 2;
				 }
				
				if ( current_channel == 2)
   		  		document.getElementById('output_area').value = s[1]+" worker: 2";
   		  	
 			}
   		  else if (str.charAt(0) == '1'){
   		  	//alert(str.slice(1));
   		  		document.getElementById('status2').value = str.slice(1);
 			}
   		  else
   		  	document.getElementById('output_area').value = str+" worker: 2";   
   		};
        if (document.getElementById('custom_table').checked == true) {
            s = '#'; // prefix to indicate string to make table from
            s += book_string;
            hclimber3.postMessage(s);  	// command hclimber to make custom table
            //alert("custom tet tabel constructed");
        }
   }
  
}

function do_check(){
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz';
	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
	s = s.toLowerCase();
	s1=''
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1)
			s1 += c;
	}
    if ( crib_status_flag == 1) {
        n = s1.length;
        plain_len = n;
        s = document.getElementById('crib_area').value;
        s = s.toLowerCase();
        var symbols='abcdefghijklmnopqrstuvwxyz-';
        n=0;
        s1 = '';
        for ( i=0;i<s.length;i++){
            c = s[i];
            if (symbols.indexOf(c)>=0) {
                n++;
                s1 += c;
            }
        }
        if ( n != plain_len){
            alert("Crib has incorrect number of entries!");
            return(false)
        }
        crib = s1;
    }
    
	s = document.getElementById('t_period').value;
	if (s == ''){
		alert("No Key Length entered");
		return(false);
	}
	if (parseInt(s) == 0){
		alert("Need key length greater than zero!");
		return(false)
	}
    if(document.getElementById('cytp5').checked){
        n = parseInt(s);
        if ( (s1.length % n) != 0){
            alert("Swagman key length not multiple of cipher length!");
            return(false);
        }
    }
    else if(document.getElementById('cytp6').checked){
        n = parseInt(s);
        if ( s1.length != n*n){
            alert("Gille key length is not square root of cipher length!");
            return(false);
        }
    }
    else if(document.getElementById('cytp7').checked){
        n = parseInt(s);
        if ( (s1.length % n) != 0){
            alert("cadenus key length not multiple of cipher length!");
            return(false);
        }
        if ( (s1.length % 25) != 0){
            alert("cipher length is not multiple of 25!");
            return(false);
        }
    }
    else if(document.getElementById('cytp8').checked){
        n = parseInt(s);
        if ( (s1.length % n) != 0){
            alert("route key length not multiple of cipher length!");
            return(false);
        }
    }
    else if(document.getElementById('cytp9').checked){
        n = parseInt(s);
        if ( s1.length != n*n){
            alert("Nihilist key length is not square root of cipher length!");
            return(false);
        }
    }
    
    else if (document.getElementById('custom_table').checked == true && book_string=='') {
        alert(" No book file chosen for custom tet table!");
        return(false);
    }
    
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var period;
    var starting_cell, nihil_by_rows;
	
	if (!do_check()) return;

	if(document.getElementById('ww1').checked) {
		numb_workers=1;
	}
	else if(document.getElementById('ww2').checked) {
		numb_workers=2;
	}
	else {
		numb_workers = 3;
	}
	if(document.getElementById('cytp0').checked) {
		if (cipher_type != 0) table_loaded = 0; // must reload
        cipher_type = 0;
	}
	else if(document.getElementById('cytp1').checked) {
		if (cipher_type != 1) table_loaded = 0; // must reload
        cipher_type = 1;
	}
	else if(document.getElementById('cytp2').checked) {
		if (cipher_type != 2) table_loaded = 0; // must reload
        cipher_type = 2;
        starting_cell = 0;
	}
	else if(document.getElementById('cytp3').checked) {
		if (cipher_type != 2) table_loaded = 0; // must reload
        cipher_type = 2;
        starting_cell = 1;
	}
	else if(document.getElementById('cytp4').checked) {
		if (cipher_type != 3) table_loaded = 0; // must reload
        cipher_type = 3;
	}
	else if(document.getElementById('cytp5').checked) {
		if (cipher_type != 4) table_loaded = 0; // must reload
        cipher_type = 4;
	}
	else if(document.getElementById('cytp6').checked) {
		if (cipher_type != 5) table_loaded = 0; // must reload
        cipher_type = 5;
	}
	else if(document.getElementById('cytp7').checked) {
		if (cipher_type != 6) table_loaded = 0; // must reload
        cipher_type = 6;
	}
	else if(document.getElementById('cytp8').checked) {
		if (cipher_type != 7) table_loaded = 0; // must reload
        cipher_type = 7;
	}
    else if(document.getElementById('cytp9').checked) {
		if (cipher_type != 8) table_loaded = 0; // must reload
        cipher_type = 8;
        nihil_by_rows = 0;
	}
    else if(document.getElementById('cytp10').checked) {
		if (cipher_type != 8) table_loaded = 0; // must reload
        cipher_type = 8;
        nihil_by_rows = 1;
	}
	if (table_loaded != numb_workers || stop_flag==1){
		initialize();
		table_loaded=numb_workers;
	}
	max_score  = -10000.0;
	max_trials = parseInt(document.getElementById('numb_trials').value);	
	str = '@'+max_trials;
	//ff = parseFloat(document.settings.fudgefactor.value);	
	s = document.getElementById('fudgefactor0').value;
	//s = 0.23;
	str += ':'+s; // use colons to separate values
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
	period = document.getElementById('t_period').value;	
	str = str+':'+period;
    if ( cipher_type == 2)
        str = str+':'+starting_cell;
    else if ( cipher_type == 8)
        str = str+':'+nihil_by_rows;
	hclimber.postMessage(str);  
	if(numb_workers>1) {
		str = '@'+max_trials;
		//ff = parseFloat(document.settings.fudgefactor.value);	
		s = document.getElementById('fudgefactor1').value;
		//s = 0.23;
		str += ':'+s; // use colons to separate values
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*2000);
		str = str+':'+n;
		period = document.getElementById('t_period').value;	
		str = str+':'+period;
        if ( cipher_type == 2)
            str = str+':'+starting_cell;
        else if ( cipher_type == 8)
            str = str+':'+nihil_by_rows;
		hclimber2.postMessage(str);  
	}
	if(numb_workers>2) {
		str = '@'+max_trials;
		//ff = parseFloat(document.settings.fudgefactor.value);	
		s = document.getElementById('fudgefactor2').value;
		//s = 0.23;
		str += ':'+s; // use colons to separate values
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*3000);
		str = str+':'+n;
		period = document.getElementById('t_period').value;	
		str = str+':'+period;
        if ( cipher_type == 2)
            str = str+':'+starting_cell;
        else if ( cipher_type == 8)
            str = str+':'+nihil_by_rows;
		hclimber3.postMessage(str);  
	}
    // post whether to use crib
    if ( cipher_type==6 ||  cipher_type==4 ||  cipher_type==5 ||  cipher_type==3 ||  cipher_type==0 
        ||  cipher_type==8 ||  cipher_type==1) { // transmit crib data for this cipher type
        if ( crib_status_flag != 0) { // use crib!
            if (crib == '') {
                alert("No crib saved!");
                return;
            }
            if ( crib_status_flag == 1)
                str = ')1'+document.getElementById('crib_area').value;
            else
                str = ')2'+document.getElementById('crib_area').value;
        }
        else str = ')0';
    }
	hclimber.postMessage(str);  
	if(numb_workers>1) hclimber2.postMessage(str);  
	if(numb_workers>2) hclimber3.postMessage(str);  
    // finally, transmit ciphertext!
	str = document.getElementById('input_area').value;	
	hclimber.postMessage(str);  
	if(numb_workers>1) hclimber2.postMessage(str);  
	if(numb_workers>2) hclimber3.postMessage(str);  
	stop_flag = 0;
}

function do_stop(){
	var str;
	
	hclimber.terminate();
	if (numb_workers>1) hclimber2.terminate();
	if (numb_workers>2) hclimber3.terminate();	
	document.getElementById('status').value = "Stopped";
	if (numb_workers>1) document.getElementById('status1').value = "Stopped";
	if (numb_workers>2) document.getElementById('status2').value = "Stopped";
	stop_flag = 1;
}

function do_clear(){
	document.getElementById('output_area').value = '';
	document.getElementById('input_area').value = '';
    document.getElementById('t_period').value = '';
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}

function do_key_length(){
	var str, alpha,caesar_shift,out_str,c,n;
    var count,max,min,height,width;
	
	alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	out_str="";
	count = 0;
	str = document.getElementById('input_area').value;
	str = str.toUpperCase();
	for (var i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0) count++;
	}
	out_str += "Cipher has a total of "+count+" alphabetic characters";
    out_str += '\nTranposition key length possibilities according to ACA guidelines:\n'
    
    max = Math.floor(2*count / (8*3))+1;
    min = Math.floor(2*count / (12*3));
    out_str += 'Amsco: '+min+'-'+max;
       
    max = Math.floor(count/15)+1;
    min = Math.floor(count / 18);
    out_str += '\nIncomplete columnar: '+min+'-'+max;
        
    max = Math.floor(count/12)+1;
    min = Math.floor(count / 15);
    out_str += '\nMyszkowski: '+min+'-'+max;    
    max = Math.floor(count/10)+1;
    min = Math.floor(count / 15);
    out_str += '\nRedefence: '+min+'-'+max;        
    out_str += "\n\nPossibilities needing exact multiples:"        ;
    for (width=2;width<= count;width++)
        if ( (count % width) == 0 ) {
                height = count / width;
                if ( height >= 8 && height <= 15)
                    out_str += '\n     Complete columnar: '+width+'x'+height;
                if ( width <= 8 && height <= 10 )
                    out_str += '\n     Route tramp: '+width+'x'+height;
                if ( height == 25 && width <= 6)
                    out_str += '\n     Cadenus: '+width+'x'+height;
                n = Math.floor(height / width);
                if ( n >= 2 && n <= 6 && width <= height)
                    out_str += '\n     Swagman: '+width+'x'+height;
        }
        n = Math.floor(Math.sqrt(count));
        if ( n*n == count)
            out_str += '\n     Grille or Nihilist tramp: '+n+'x'+n;
        
        out_str += '\n(Done)\n';
	document.getElementById('output_area').value = out_str;

}

function initialize_crib() {
    var i;
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz';
	s = document.getElementById('input_area').value;
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
    n = s1.length;
    plain_len = n;
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
    var symbols='abcdefghijklmnopqrstuvwxyz-';
    
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
        s = "Paste crib from dragging program (after you clear this message) or click initalize button. May have to set fudge factor above 1.0"; 
        s += ' Or use short crib and check floating crib box';
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

function crib_ok(){

    if (document.getElementById('cytp7').checked || document.getElementById('cytp5').checked ||
        document.getElementById('cytp6').checked  || document.getElementById('cytp4').checked
        || document.getElementById('cytp0').checked || document.getElementById('cytp1').checked 
        || document.getElementById('cytp9').checked || document.getElementById('cytp10').checked) { 
        // cadenus, swagman, grille, redefence, columnar, myszkowski
        document.getElementById('crib').disabled = false;
        return;
    }
    document.getElementById('crib').disabled = true;
    crib_status_flag = 0;
}    

onload=function() {
    var i,s;
    
    document.getElementById('do_key_length1').addEventListener("click", do_key_length);   
    document.getElementById('do_clear1').addEventListener("click", do_clear);   
    document.getElementById('do_stop1').addEventListener("click", do_stop);   
    document.getElementById('do_solve1').addEventListener("click", do_solve); 
    for (i=0;i<=10;i++) {
        s = "cytp"+i;
        document.getElementById(s).addEventListener("change", crib_ok); 
    }
    document.getElementById('custom_table').addEventListener("change", set_reload); 
    document.getElementById('crib').addEventListener("click", do_crib); 
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});     
}
    