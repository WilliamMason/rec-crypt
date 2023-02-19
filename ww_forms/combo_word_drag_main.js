var word_string = '';
var parse_string = '';
var word_type
var hworker;
var output_array;


function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
	//alert(str);
	word_type = true;
	getAsText(fname);
}

function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
    word_type = false;
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
  if (word_type) word_string = fileString;
  else parse_string = fileString; 

  //alert("file loaded");
  //stop_flag=1; // reinitialize web workers
  stopped_flag = true;
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function initialize_worker(){
    var s1,s2,score,result;
    
   hworker = new Worker('combo_word_drag_worker.js');
   hworker.onmessage = function (event) {
    //s1 = event.data.s1;
    //s2 = event.data.s2;
	//s1 = event.data;
	result = event.data;
	s1 = result[0];
	output_array = result[1]; // global 
    document.getElementById('output_area').value = s1;
   }
}

function check_for_errors(){
	if (word_string == ''){
		alert("No word list loaded");
		return(true);
	}
	if ( parse_string==''){
		alert("No parse list loaded");
		return(true);
	}
	if ( document.getElementById('cipher').value ==''){
		alert("no cipher entered");
		return(true);
	}
	return(false); // no errors
}

function do_drag(){
	var xfer;
	var i,j,k,c,n;
	//alert("do drag");
	if ( check_for_errors() )
		return;
	do_calc();
	document.getElementById('output_area').value = 'working . . .';;
	//document.getElementById('output_area').value = word_string;
	initialize_worker();
	xfer = {};
	xfer["cipher"] = document.getElementById('cipher').value;
	n = parseInt(document.getElementById('plaintext_word_len').value);
	xfer["min_plain_len"] = n;
	xfer["min_logdi"] = document.getElementById('s_logdi').value;
	xfer["fixed_position"] = document.getElementById('s_pos_start').value;
	xfer["fixed_end_position"] = document.getElementById('s_pos_end').value;	
	xfer["phrase_file"] = word_string;
	xfer["parse_file"] = parse_string;
	xfer["output_browser"] = '1';
	xfer["output_on"] = document.getElementById('output_on').value;
	xfer["output_name" ] = ''; // don't output to a file;
	xfer["c_type"] = document.getElementById('cipher_type').value;
	xfer["no_suffix"] = document.getElementById('no_suffix').value;
	xfer["no_prefix"] = document.getElementById('no_prefix').value;
	xfer["phrase_max"] = document.getElementById('s_max_len').value;
	xfer["phrase_min"] = document.getElementById('s_min_len').value;
	xfer["start_phrase"] = document.getElementById('s_start_string').value;
	xfer["end_phrase"] = document.getElementById('s_end_string').value;
	
	hworker.postMessage(xfer);
	document.getElementById('Test_the_results').disabled = false;
	
}
