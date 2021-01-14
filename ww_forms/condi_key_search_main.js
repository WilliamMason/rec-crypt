// condi key search
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list_array = [];


function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsText2(fname);
	
}

function getAsText2(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  //reader.onprogress = updateProgress;
  reader.onload = loaded2;
  reader.onerror = errorHandler2;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsText(readFile);
  
}

function loaded2(evt) {  
  // Obtain the read file data    
  var fileString = evt.target.result;
  var s;
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;  
  s = "The length of the file is "+fileString.length;
  document.getElementById('output_area').value = s;
  word_list_string = fileString;
  //alert("file loaded");
  stop_flag=1; // reinitialize web workers
  
}

function errorHandler2(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function set_reload2(){
    stop_flag = 1; // signal to reinitialize
}    

 
function do_key_search(){
	var str,c,i,n,j,k;
    var op_choice;
    var period;

   if (!do_check()) return;    
   if ( word_list_string==''){
        alert("Must Choose word list file!");
        return;
   }
   var worker = new Worker('condi_key_search_worker.js');
   worker.onmessage = function(event) {
   	 str = event.data;
     if (str.charAt(0)=='~')
        document.getElementById('status').value = "End Keys";
     else
        document.getElementById('output_area').value = str;	
   }
   // allow for webkit prefix or its removal
   worker.postMessage = worker.webkitPostMessage || worker.postMessage;
   if (document.getElementById('custom_table').checked == true) {
    //s = '#'; // prefix to indicate string to make table from
    //s += book_string;
    worker.postMessage({op_choice:3, str:book_string});  	// command key search to make custom table
    //alert("custom tet tabel constructed");
   }      
   document.getElementById('status').value = "Start Keys";
    str = document.getElementById('input_area').value;	
   worker.postMessage( {op_choice:1, str:word_list_string});
   worker.postMessage( {op_choice:2, str:str});

//document.getElementById('debug_area').value="key search";
}

