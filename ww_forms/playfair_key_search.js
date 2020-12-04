// playfair key search
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list_array = [];


function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsArray2(fname);
	
}


function getAsArray2(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  reader.onprogress = updateProgress2;
  reader.onload = loaded2;
  reader.onerror = errorHandler2;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsArrayBuffer(readFile);
  
}

function updateProgress2(evt) {
  if (evt.lengthComputable) {
    // evt.loaded and evt.total are ProgressEvent properties
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      // Increase the prog bar length
      // style.width = (loaded * 200) + "px";
    }
  }
}

function loaded2(evt) {  
  // Obtain the read file data    
  var fileArray = evt.target.result;
  var s;
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;  
  

  word_list_array  = new Uint8Array(fileArray);
    s = "The length of the file is "+word_list_array.length;
  document.getElementById('output_area').value = s;

  
}

function errorHandler2(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

 
function do_key_search(){
	var str,c,i,n,j,k;
    var op_choice;
    var period;

   if (!do_check()) return;    
   if ( word_list_array.length==0){
        alert("Must Choose word list file!");
        return;
   }

   var worker = new Worker('playfair_key_search_worker.js');
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
   // note: below, you need the .buffer at the end because word_list_array is a (char) view of the arrayBuffer, not
   // the arrayBuffer itself. If word_list_array was just an arrayBuffer you wouldn't need to add .buffer to it.
   //worker.webkitPostMessage( {op_choice:1, buf:word_list_array.buffer},[word_list_array.buffer]);
   worker.postMessage( {op_choice:1, buf:word_list_array.buffer},[word_list_array.buffer]);
   //worker.webkitPostMessage( {op_choice:2, str:str});
   //period = document.getElementById('t_period').value;	
   //worker.postMessage( {op_choice:2, str:str, period:period});
   worker.postMessage( {op_choice:2, str:str});

//document.getElementById('debug_area').value="key search";
}

