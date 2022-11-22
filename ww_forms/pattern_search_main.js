// search a word/phrase list for headline puzzle hats

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];
var search_pattern = [];
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


function do_search(){
	var str,c,i,n,pattern_len,j,k;
    var flag,index,cnt;
    var word_pat = [];
    var op_choice, buf;

    var symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    

   if ( word_list_array.length==0){
        alert("Must Choose word list file!");
        return;
   }
   var worker = new Worker('pattern_search_worker.js');
   worker.onmessage = function(event) {
   	 str = event.data;
     document.getElementById('output_area').value = str;	
   }
   // allow for webkit prefix or its removal
   worker.postMessage = worker.webkitPostMessage || worker.postMessage;
   str = document.getElementById('word_pattern').value
   if ( str==''){
        alert("No search pattern entered!");
        return;
   }
// send copy of word_list_array, not word_list_array itself, so word_list_array won't be deleted
   var buf = new ArrayBuffer(word_list_array.length);
   var bufView = new Uint8Array(buf);
   for (i=0;i< word_list_array.length;i++)
        bufView[i] = word_list_array[i];
   worker.postMessage( {op_choice:1, buf:buf},[buf]);
   
   worker.postMessage( {op_choice:2, str:str});
}
onload = function() {
    document.getElementById('search_for_pattern').addEventListener("click",do_search);    
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
}    
