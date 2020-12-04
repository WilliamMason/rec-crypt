//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

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
	var s;
	
	
   hclimber = new Worker('mysz_pseudokey_climb.js');
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
	 
	 }
     else if (str.charAt(0) == '1'){
     	document.getElementById('status').value = str.slice(1);
 	}
     else if (str.charAt(0) == '2'){ // debug message
     	document.getElementById('debug_area').value = str.slice(1);
 	}
   };
   if (numb_workers>1){
   		hclimber2 = new Worker('mysz_pseudokey_climb.js');
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
   		hclimber3 = new Worker('mysz_pseudokey_climb.js');
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
   if (document.getElementById('custom_table').checked == true) {
    if (book_string == ''){
        alert("No book file chose for custom tet table");
        return;
    }
    var xfer = {};
    xfer["op_choice"] = "make_table";
    xfer["str1"]= book_string;
    hclimber.postMessage(xfer);  	// command hclimber to make custom table
    if( numb_workers>1) hclimber2.postMessage(xfer);
    if (numb_workers>2) hclimber3.postMessage(xfer);
   }   
  
}

function do_check(){
	var s,s1,n,c,indx,cnt,str,i;

	var alpha='abcdefghijklmnopqrstuvwxyz';
    
	s = document.getElementById('key_alpha').value;
	if (s == ''){
		alert("No key pattern entered");
		return(false)
	}
	s = s.toLowerCase();
	s1=''
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1){
			s1 += c;
        }
	}
    if (s1==''){
		alert("Key pattern not alphabetic");
		return(false)
	}
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
    var xfer;
	
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
    xfer = {};
    xfer["op_choice"] = 'solve';
	max_trials = document.getElementById('numb_trials').value;
    xfer["max_trials"] = max_trials;
	n = Math.floor( Math.random()*1000);
    xfer["seed"] = ''+n;
    str = document.getElementById('key_alpha').value;
    xfer["pattern"] = str;
    hclimber.postMessage(xfer);  
	if(numb_workers>1) {
		n = Math.floor( Math.random()*2000);
        xfer["seed"] = ''+n; 
        hclimber2.postMessage(xfer);          
	}
	if(numb_workers>2) {
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*3000);
        xfer["seed"] = ''+n; 
        hclimber3.postMessage(xfer);          
	}
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
	document.getElementById('key_alpha').value = '';
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear); 
    document.getElementById('custom_table').addEventListener("change", set_reload); 
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});    
}
    
    
    