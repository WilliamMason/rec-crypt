//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

// new crib stuff
var crib=''; // new global variable
var plain_len;
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)

function initialize(){
	var str;
	var s;
	
	
   hclimber = new Worker('smws_digrafid_climb.js');
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
   if (numb_workers>1){
   		hclimber2 = new Worker('smws_digrafid_climb.js');
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
   }
   if (numb_workers>2){
   		hclimber3 = new Worker('smws_digrafid_climb.js');
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
   }
  
}

function do_check(){
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz#';
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
    if ( (s1.length & 1) != 0 ){
        alert("Ciphertext has odd number of symbols");
        return(false);
    }
    if ( crib_status_flag == 1) {
        n = s1.length;
        plain_len = n;
        s = document.getElementById('crib_area').value;
        s = s.toLowerCase();
        var symbols='abcdefghijklmnopqrstuvwxyz#-';
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
	s = document.getElementById('d_period').value;
	if (s == ''){
		alert("No period entered");
		return(false);
	}
	if (parseInt(s) == 0){
		alert("Need period greater than zero!");
		return(false)
	}
	s = document.getElementById('max_h_len').value;
	if (s == ''){
		alert("No Max Horizontal Key length entered");
		return(false);
	}
	if (parseInt(s) == 0){
		alert("Need max_key length greater than zero!");
		return(false)
	}    
	s = document.getElementById('max_v_len').value;
	if (s == ''){
		alert("No Max Vertical Key length entered");
		return(false);
	}    
	if (parseInt(s) == 0){
		alert("Need max_key length greater than zero!");
		return(false)
	}
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var period,max_h_len, max_v_len;
	
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
	
	if (table_loaded != numb_workers || stop_flag==1){
		initialize();
		table_loaded=numb_workers;
	}
	max_score  = -10000.0;
	//max_trials = parseInt(document.getElementById('numb_trials').value);	
	//str = '@'+max_trials;
    str = '@1';
	//ff = parseFloat(document.settings.fudgefactor.value);	
	//s = document.getElementById('fudgefactor0').value;
	//s = 0.23;
	//str += ':'+s; // use colons to separate values
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
	period = document.getElementById('d_period').value;	
	str = str+':'+period;
	max_h_len = document.getElementById('max_h_len').value;	
	str = str+':'+max_h_len;
	max_v_len = document.getElementById('max_v_len').value;	
	str = str+':'+max_v_len;    
	hclimber.postMessage(str);  
	if(numb_workers>1) {
		//str = '@'+max_trials;
        str = '@1';
		//ff = parseFloat(document.settings.fudgefactor.value);	
		//s = document.getElementById('fudgefactor1').value;
		//s = 0.23;
		//str += ':'+s; // use colons to separate values
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*2000);
		str = str+':'+n;
		//period = document.getElementById('d_period').value;	// already calculated
		str = str+':'+period;
        str = str+':'+max_h_len;        
        str = str+':'+max_v_len;        
		hclimber2.postMessage(str);  
	}
	if(numb_workers>2) {
		//str = '@'+max_trials;
        str = '@1';
		//ff = parseFloat(document.settings.fudgefactor.value);	
		//s = document.getElementById('fudgefactor2').value;
		//s = 0.23;
		//str += ':'+s; // use colons to separate values
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*3000);
		str = str+':'+n;
		//period = document.getElementById('d_period').value;	// already calculated
		str = str+':'+period;
        str = str+':'+max_h_len;        
        str = str+':'+max_v_len;        
		hclimber3.postMessage(str);  
	}
    // post whether to use crib
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
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}

function initialize_crib() {
    var i;
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz#';
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
    var symbols='abcdefghijklmnopqrstuvwxyz#-';
    
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

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);    
    document.getElementById('do_crib1').addEventListener("click",do_crib); 
}    
    