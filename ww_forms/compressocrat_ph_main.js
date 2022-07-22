//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

// new crib stuff
var crib=''; // new global variable
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)


function initialize(){
	var str;
	var s;
	
	
   hclimber = new Worker('compressocrat_ph_climb.js');
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
   		hclimber2 = new Worker('compressocrat_ph_climb.js');
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
   		hclimber3 = new Worker('compressocrat_ph_climb.js');
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
	var alpha='abcdefghijklmnopqrstuvwxyz';
	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
    s = document.getElementById('key_len').value;
	if (s == ''){
		alert("No key length entered");
		return(false)
	}
    s = document.getElementById('max_p_len').value;
	if (s == ''){
		alert("No maximum plaintext length entered");
		return(false)
	}
    
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var period,key_len;
    var p_len;
	
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
	max_trials = parseInt(document.getElementById('numb_trials').value);	
	str = '@'+max_trials;
	//ff = parseFloat(document.settings.fudgefactor.value);	
	s = document.getElementById('fudgefactor0').value;
	//s = 0.23;
	str += ':'+s; // use colons to separate values
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
    key_len = document.getElementById('key_len').value;
	str = str+':'+key_len;    
    p_len = document.getElementById('max_p_len').value;
	str = str+':'+p_len;    
   if( document.getElementById('k2m').checked )
        c='1';
   else
        c = '0';
    str = str+':'+c;
	if (document.getElementById('hill_climb_with_shifted_keys').checked)
		str += ':1';
	else
		str += ':0';
	
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
        str = str+':'+key_len;
        str = str+':'+p_len;    
        str = str+':'+c;
		if (document.getElementById('hill_climb_with_shifted_keys').checked)
			str += ':1';
		else
			str += ':0';
		
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
        str = str+':'+key_len;
        str = str+':'+p_len;
        str = str+':'+c;
		if (document.getElementById('hill_climb_with_shifted_keys').checked)
			str += ':1';
		else
			str += ':0';
			
		hclimber3.postMessage(str);  
	}
    // post whether to use crib
    if ( crib_status_flag == 2) { // use floating crib
        save_crib();
        str = ')2'+crib;
    }
    else str = ')0';
	hclimber.postMessage(str);  
	if(numb_workers>1) hclimber2.postMessage(str);  
	if(numb_workers>2) hclimber3.postMessage(str);      
	
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

function do_crib(){
    var s;
    
    if (crib==''){
        s = "Enter floating crib(s). If multiple crib strings put them on separate lines."
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
    s += '<input value="Close" id="hide_message2" type="button">';
    s += '<input value="Clear" id="clear_crib_display2" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('m_display').style.visibility="visible";
    document.getElementById('crib_area').value = message;
    document.getElementById('crib_area').focus();
    document.getElementById('crib_status').addEventListener("click", save_crib);   
    document.getElementById('hide_message2').addEventListener("click", hide_message);   
    document.getElementById('clear_crib_display2').addEventListener("click", clear_crib_display);   
}

function hide_message(){
    save_crib();
	document.getElementById('m_display').style.visibility="hidden";
}

function save_crib(){
    crib = document.getElementById("crib_area").value;
    if (document.getElementById("crib_status").checked)
        crib_status_flag = 2; // floating cribs only
    else crib_status_flag = 0;
}    

function clear_crib_display(){
    if (crib != ''){
        var do_confirm = confirm("Clear crib?");
        if (do_confirm == false) return;
    }
    document.getElementById('crib_area').value = '';
    document.getElementById('crib_area').focus();
}


onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);  
	document.getElementById('crib1').addEventListener("click",do_crib);               
    document.getElementById('search_for_key').addEventListener("click",do_key_search);    
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
   
}
