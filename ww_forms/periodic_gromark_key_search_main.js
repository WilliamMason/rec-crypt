var hworker;
var word_list_array=[];


function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsArray(fname);
	
}


function getAsArray(readFile) {
        
  var reader = new FileReader();
  // Handle progress, success, and errors
  reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader.readAsArrayBuffer(readFile);
  
}

function updateProgress(evt) {
  if (evt.lengthComputable) {
    // evt.loaded and evt.total are ProgressEvent properties
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      // Increase the prog bar length
      // style.width = (loaded * 200) + "px";
    }
  }
}

function loaded(evt) {  
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

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function initialize_worker(){
    var s1,s2;
    
   hworker = new Worker('periodic_gromark_key_search_worker.js');
   hworker.onmessage = function (event) {
    s1 = event.data.s1;
    document.getElementById('output_area').value = s1;
    }
}

function do_processing(){
    var s,s2,xfer;
    
   if ( word_list_array.length==0){
        alert("Must Choose word list file!");
        return;
   }    
   xfer = {};
   xfer["op_choice"] = 1;
   xfer["buf"] = word_list_array.buffer;
   hworker.postMessage(xfer,[word_list_array.buffer] ); 
    s = document.getElementById('input_area').value;
    xfer = {};
    xfer["op_choice"] = 2;
    xfer["str1"] = s;
    hworker.postMessage(xfer);
    
}

onload=function(){
    document.getElementById('do_processing').addEventListener("click",do_processing); 
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});             
   initialize_worker();
}

