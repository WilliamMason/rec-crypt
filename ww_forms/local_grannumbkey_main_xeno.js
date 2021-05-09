// version 3
//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;
var score_type = 0;

var work_sent_flag = false;
var key_str;

var book_string = '';
var word_list_string = '';

function initialize(){
	var str;
	var s,hill_climb_name;
    var xfer;
	
    if ( score_type == 0)
        hill_climb_name = 'grannumbkey_ph_climb_xeno.js'; // use extended word list scoring
    else if ( score_type == 2)
        hill_climb_name = 'grannumbkey_ph_climb_rev_xeno.js'; // use reverse extended word list scoring
    else if ( score_type == 3)
        hill_climb_name = 'grannumbkey_ph_climb_suffix_xeno.js'; // use reverse word list suffix
    else if ( score_type == 1)
        hill_climb_name = 'grannumbkey_ph_climb_prefix_xeno.js'; // use word list prefix
	else
        hill_climb_name = 'sloppy_grandpre_wimpy_climb_xeno.js'; // use sloppy grandpre
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
     		document.getElementById('output_area2').value = s[1]+" worker: 0";
	 
     	//document.getElementById('output_area').value = str.slice(1);
	 }
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     	document.getElementById('status').value = str.slice(1);
 	}
     else
     	document.getElementById('output_area2').value = str;   
   };

   xfer = {};
   xfer[ 'op_choice' ] = 'book_string';
   xfer[ 'book_string' ] = book_string;
   if (document.getElementById('word_list_option').checked)
    xfer[ 'word_list_string' ] = word_list_string;
   else
    xfer[ 'word_list_string' ] = '';   
   hclimber.postMessage(xfer);  
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
   		  		document.getElementById('output_area2').value = s[1]+" worker: 1";
   		  	
 			}
   		  else if (str.charAt(0) == '1'){
   		  	//alert(str.slice(1));
   		  		document.getElementById('status1').value = str.slice(1);
 			}
   		  else
   		  	document.getElementById('output_area2').value = str+" worker: 1";   
   		};
        hclimber2.postMessage(xfer);  
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
   		  		document.getElementById('output_area2').value = s[1]+" worker: 2";
   		  	
 			}
   		  else if (str.charAt(0) == '1'){
   		  	//alert(str.slice(1));
   		  		document.getElementById('status2').value = str.slice(1);
 			}
   		  else
   		  	document.getElementById('output_area2').value = str+" worker: 2";   
   		};
        hclimber3.postMessage(xfer);          
   }
  
}


function do_check(){
	var s,s1,n,c,s2,i,j,s3,kdigits,m,ka,start_key;
	var digits='0123456789'; 
	var alpha='abcdefghijklmnopqrstuvwxyz';
	s = document.getElementById('input_area').value;
	if (s == ''){
		//alert("No text entered");
        document.getElementById('output_area2').value = "No text entered";
		return(false)
	}
	s = s.toLowerCase();

	m = 0;
	for (n=0;n<s.length;n++){
		c = s.charAt(n);
		if ( alpha.indexOf(c) != -1){
			//alert("Can't decrypt alphabetic characters!");
            document.getElementById('output_area2').value = "Can't decrypt alphabetic characters!";
			return(false);
		}
		if (digits.indexOf(c) != -1)
			m++;
	}
	if ( (m&1)!=0){
		//alert("ciphertext has odd number of digits!");
        document.getElementById('output_area2').value = "ciphertext has odd number of digits!";
		return(false);
	}
	if( book_string == ''){
        document.getElementById('output_area2').value = "No book file chosen!";
		return(false);
	}
    if ( document.getElementById('word_list_option').checked && word_list_string == ''){
        document.getElementById('output_area2').value = "No word list chosen!";
		return(false);
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
	if(document.getElementById('sct1').checked) {
		if (score_type != 0) table_loaded = 0; // must reload
        score_type = 0;
	}
	else if(document.getElementById('sct3').checked) {
		if (score_type != 2) table_loaded = 0; // must reload
        score_type = 2;
	}
	else if(document.getElementById('sct4').checked) {
		if (score_type != 3) table_loaded = 0; // must reload
        score_type = 3;
	}
	else if(document.getElementById('sct2').checked){
        if (score_type != 1) table_loaded = 0; // must reload
		score_type = 1;
	}
    else {
        if (score_type != 4) table_loaded = 0; // must reload
		score_type = 4;
    }
	
	if (table_loaded != numb_workers || stop_flag==1){
		initialize();
		table_loaded=numb_workers;
	}
	max_score  = -10000.0;
	max_trials = parseInt(document.getElementById('numb_trials').value);	
    xfer = {};
    xfer[ 'op_choice' ] = 'setup';
    xfer[ 'max_trials' ] = ''+max_trials;
	s = document.getElementById('fudgefactor0').value;
    xfer[ 'fudge_factor' ] = s;
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
    xfer[ 'seed' ] = ''+n;
	s = document.getElementById('range_bot').value;
    xfer[ 'bot_range' ] = s;
	s = document.getElementById('range_top').value;
    xfer[ 'top_range' ] = s;
	

    hclimber.postMessage(xfer);  
	if(numb_workers>1) {
        s = document.getElementById('fudgefactor1').value;
        xfer[ 'fudge_factor' ] = s;
        n = Math.floor( Math.random()*1000);
        xfer[ 'seed' ] = ''+n;
    
		hclimber2.postMessage(xfer);  
	}
	if(numb_workers>2) {
        s = document.getElementById('fudgefactor2').value;
        xfer[ 'fudge_factor' ] = s;
        n = Math.floor( Math.random()*1000);
        xfer[ 'seed' ] = ''+n;
    
		hclimber3.postMessage(xfer);  
    
	}
    // if received crib key from interactive solver, send it along it
    if (work_sent_flag) {
        xfer = {};
        xfer[ 'op_choice' ] = 'crib';
        str = ')'+key_str;
        xfer[ 'crib_string' ] = key_str;

        hclimber.postMessage(xfer);        
        if(numb_workers>1) hclimber2.postMessage(xfer);  
        if(numb_workers>2) hclimber3.postMessage(xfer);  
    }
    xfer = {};    
    xfer[ 'op_choice' ] = 'solve';
	str = document.getElementById('input_area').value;	
    xfer[ 'cipher' ] = str;

    hclimber.postMessage(xfer);  
	if(numb_workers>1) hclimber2.postMessage(xfer);  
	if(numb_workers>2) hclimber3.postMessage(xfer);  
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
	document.getElementById('output_area2').value = '';
	document.getElementById('input_area').value = '';
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}
/*
 if ( window.chrome && chrome.runtime) {
    chrome.runtime.onMessage.addListener(
        function(data, sender, sendResponse) {
            if ( data.mes_choice == 0) // sent ciphertext
                 document.getElementById('input_area').value = data.str;
            if ( data.mes_choice == 1) { // sent work
                 document.getElementById('output_area').value = "Partial key from interactive solver:\n"+data.str;
                 key_str = data.str;
                 work_sent_flag = true;
            }
        }
    )  ;
 }
*/ 
// file API stuff
var book_string = '';
var word_list_string = '';
var book_type = true;

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
  document.getElementById('output_area2').value = s;
  if (book_type) book_string = fileString;
  else word_list_string = fileString;
  //stop_flag = 1; // restart with the new files
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}
/* moved to other file, which is loaded last
onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear); 
    document.getElementById('input2').addEventListener("click",handleFiles ); 
    document.getElementById('input3').addEventListener("click",handleFiles2 ); 
    document.getElementById('word_list_option').addEventListener("click",function(){stop_flag=1;} ); 
    loadInitialFile();
    loadInitialFile2();
    
}
*/

