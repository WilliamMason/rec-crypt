//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

// crib stuff
var crib=''; //  global variable
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)



function initialize(){
	var str;
	var s;
	
	
   hclimber = new Worker('syllabary_ph_climb_pent.js');
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
   };
   if (numb_workers>1){
   		hclimber2 = new Worker('syllabary_ph_climb_pent.js');
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
   		hclimber3 = new Worker('syllabary_ph_climb_pent.js');
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

    var digits = '0123456789';
	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No c-phertext entered");
		return(false)
	}
    s1 = '';
    for (var i = 0;i<s.length;i++){
        c = s.charAt(i);
        n = digits.indexOf(c);
        if ( n != -1) s1 += c;
    }
    if (s1.length==0){
        alert("Ciphertext does not contain any digits! Not Syllabary cipher!");
        return(false);
    }
    if ( (s1.length%2) != 0) {
        alert("Ciphertext has odd number of digits! Not Syllabary cipher!");
        return(false);
    }
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var period,key_type,key_info,key_len
	var key_table_weight;
	
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
    if (document.getElementById('english').checked)
        key_type = '0';
    else if (document.getElementById('french').checked)
        key_type = '1';  
    else if (document.getElementById('german').checked)
        key_type = '2';  
    else if (document.getElementById('italian').checked)
        key_type = '3';
    else if (document.getElementById('spanish').checked)
        key_type = '4';
    else if (document.getElementById('latin').checked)
        key_type = '5';            
    if( document.getElementById('known_key').checked)
        key_info = '1';
    else if( document.getElementById('known_cord').checked)
        key_info = '2';
    else
        key_info = '0';
	key_len = document.getElementById("key_len").value;	
	max_score  = -10000.0;
	key_table_weight = parseFloat(document.getElementById('work_key_weight').value);
	max_trials = parseInt(document.getElementById('numb_trials').value);	
	str = '@'+max_trials;
	//ff = parseFloat(document.settings.fudgefactor.value);	
	s = document.getElementById('fudgefactor0').value;
	//s = 0.23;
	str += ':'+s; // use colons to separate values
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
    str += ':'+key_type;
    str += ':'+key_info;
	str += ':'+key_table_weight;
	str += ':'+key_len;
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
        str += ':'+key_type;   
        str += ':'+key_info;
		str += ':'+key_table_weight;
		str += ':'+key_len;		
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
        str += ':'+key_type; 
        str += ':'+key_info;
		str += ':'+key_table_weight;
		str += ':'+key_len;		
		hclimber3.postMessage(str);  
	}
    // post whether to use crib
    if ( crib_status_flag == 2) { // use floating crib
        str = ')2'+crib;
    }
    else if ( crib_status_flag == 1) { // use fixed crib
        str = ')1'+crib;
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

function floating_crib() {
	crib= prompt('Enter floating crib');
	if (crib==' ' || crib==null) {
        crib_status_flag = 0;
		return;
    }
    crib_status_flag = 2;     // floating crib indicator
}

function fixed_crib() {
	crib= prompt('Paste in fixed crib');
	if (crib==' ' || crib==null) {
        crib_status_flag = 0;
		return;
    }
    crib_status_flag = 1;     // fixed crib indicator
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);  
    document.getElementById('float_crib').addEventListener("click",floating_crib);       
    document.getElementById('fixed_crib').addEventListener("click",fixed_crib);           
    document.getElementById('known_key').addEventListener("click",function(){document.getElementById("fixed_crib").disabled = true;});           
    document.getElementById('unknown_key').addEventListener("click",function(){document.getElementById("fixed_crib").disabled = false;});
    document.getElementById('known_cord').addEventListener("click",function(){document.getElementById("fixed_crib").disabled = true;});                       

}
