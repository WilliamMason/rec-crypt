//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

function initialize(){
	var str;
	var s;
	
	
   hclimber = new Worker('hl_key_climb.js');
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
   		hclimber2 = new Worker('hl_key_climb.js');
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
   		hclimber3 = new Worker('hl_key_climb.js');
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
	var s,s1,n,c,indx,cnt,str,i;

	var alpha='abcdefghijklmnopqrstuvwxyz';
    var used_let = [];    
    var chain1=[];
    var chain2 = []
    for (i=0;i<26;i++)
        used_let[i] = 0;
    
	s = document.getElementById('slidable_alpha').value;
	if (s == ''){
		alert("No slidable entered");
		return(false)
	}
	s = s.toLowerCase();
	s1=''
    cnt = 0;
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1){
			s1 += c;
            indx = alpha.indexOf(c);
            chain1[cnt++] = indx;
            used_let[indx]++;
        }
	}
    if ( document.getElementById('one_chain').checked && (s1.length != 26)) {
        alert("Slidable alphabet does not have 26 letters!");
        return(false);
    }
    if ( document.getElementById('two_chain').checked){
        if ( cnt != 13){
            alert("First chain does not have 13 letters!");
            return;
        }
        str = document.getElementById('chain2').value;
        str = str.toLowerCase();
        cnt = 0;
        for (i=0;i<str.length;i++){
            c = str.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0){
                chain2[cnt++] = n;
                used_let[n]++;
            }
        }
        if ( cnt != 13){
            alert("Second chain does not have 13 letters!");
            return;
        }
    }
    for (i=0;i<26;i++){
        if (used_let[i] == 0){
            s = "Letter "+alpha.charAt(i)+" is missing";
            alert(s);
            return;
        }
        if (used_let[i] >1 ){
            s = "Letter "+alpha.charAt(i)+" appears more than once";
            alert(s);
            return;
        }
    }
	s = document.getElementById('max_hat').value;
	if (s == ''){
		alert("No max hat length entered");
		return(false);
	}
	if (parseInt(s) == 0){
		alert("Need max hat length greater than zero!");
		return(false)
	}
	s = document.getElementById('max_key').value;
	if (s == ''){
		alert("No max key length entered");
		return(false);
	}
	if (parseInt(s) == 0){
		alert("Need max key length greater than zero!");
		return(false)
	}
    
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	var max_hat,max_key,chain_type;
	
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
    if ( document.getElementById('one_chain').checked)
        chain_type = 1;
    else
        chain_type = 2;
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
	max_hat = document.getElementById('max_hat').value;	
	str = str+':'+max_hat;
	max_key = document.getElementById('max_key').value;	
	str = str+':'+max_key;
    str = str+':'+chain_type;
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
		max_hat = document.getElementById('max_hat').value;	
		str = str+':'+max_hat;
        max_key = document.getElementById('max_key').value;	
        str = str+':'+max_key;
        str = str+':'+chain_type;        
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
		max_hat = document.getElementById('max_hat').value;	
		str = str+':'+max_hat;
        max_key = document.getElementById('max_key').value;	
        str = str+':'+max_key;
        str = str+':'+chain_type;                
		hclimber3.postMessage(str);  
	}
	str = document.getElementById('slidable_alpha').value;	
    if ( chain_type == 2)
        str += document.getElementById('chain2').value;	
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
	document.getElementById('slidable_alpha').value = '';
    document.getElementById('chain2').value = '';
    document.getElementById('max_hat').value = '';
    document.getElementById('max_key').value = '';    
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);    
}
    
    
    