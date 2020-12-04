var hworker,hworker2;
var stop_flag = 0;
var best_score;
var word_list_array=[];
 
function do_search(){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var s,str;
    var op_choice,buf;
    
    if (stop_flag == 1) {
        initialize_workers();
        stop_flag = 0;
    }
    best_score = 0;
    if (document.getElementById('q1').checked)
        quag_type = 1;
    else if (document.getElementById('q2').checked)
        quag_type = 2;
    else if (document.getElementById('q3').checked)
        quag_type = 3;
        
    s = document.getElementById('ciphertext').value;
    if ( s == ''){
        alert("No cipertext entered");
        return;
    }
    period = parseInt(document.getElementById('period').value);
    if (isNaN(period) || period <=0){
        alert("Period must be a positive number");
        return;
    }
    if (document.getElementById('custom_di_table').checked) {
        if ( book_string == ''){
            alert("Must choose book file!");
            return;
        }
        hworker.postMessage({op_choice:3, str:book_string});
        hworker2.postMessage({op_choice:3, str:book_string});
    } 
    if (document.getElementById('custom_list').checked != true) {
        str = '';
        str += quag_type+'@';
        str += period+'@1@'; // search first half
        str += s;
        hworker.postMessage({op_choice:0, str:str});
        document.getElementById('status').value = 'working';
        str = '';
        str += quag_type+'@';
        str += period+'@2@'; // search second half
        str += s;
        hworker2.postMessage({op_choice:0, str:str});
        document.getElementById('status2').value = 'working';
    }
    else { // different word lists already loaded
        if ( word_list_array.length==0){
            alert("Must Choose word list file!");
            return;
        }
        str = '';
        str += quag_type+'@';
        str += period+'@3@'; // search all
        str += s;
        hworker.postMessage({op_choice:2, str:str});
        document.getElementById('status').value = 'working';
        str = '';
        str += quag_type+'@';
        str += period+'@3@'; // search all
        str += s;
        hworker2.postMessage({op_choice:2, str:str});
        document.getElementById('status2').value = 'working';
    }

}

function stop_search(){
    hworker.terminate();
    document.getElementById('status').value = 'stopped';
    hworker2.terminate();
    document.getElementById('status2').value = 'stopped';
    
    stop_flag = 1;
}

function initialize_workers(){
    var str;
    var s,score;
    var op_choice,word_break;
    
   hworker = new Worker('quag_key_worker.js');
   hworker.onmessage = function (event) {
    str = event.data;
    if (str == '@')
        document.getElementById('status').value = 'done';
    else {
        s = str.split('^');
        score = parseFloat(s[0]);
        document.getElementById('status').value = score;        
        if ( score> best_score) {
            best_score = score;
            document.getElementById('output_area').value = s[1];

        }
    }
   }
   // allow for webkit prefix or its removal
   hworker.postMessage = hworker.webkitPostMessage || hworker.postMessage;
   
   hworker2 = new Worker('quag_key_worker.js');
   hworker2.onmessage = function (event) {
    str = event.data;
    if (str == '@')
        document.getElementById('status2').value = 'done';
    else {
        s = str.split('^');
        score = parseFloat(s[0]);
        document.getElementById('status2').value = score;        
        if ( score> best_score) {
            best_score = score;
            document.getElementById('output_area').value = s[1];

        }
    }
   }
   // allow for webkit prefix or its removal
   hworker2.postMessage = hworker2.webkitPostMessage || hworker2.postMessage;
   
   if (document.getElementById('custom_list').checked == true) {
        // get word break nearest middle of file   
        word_break = Math.floor(word_list_array.length/2);
        while (word_list_array[word_break] != 32  && word_list_array[word_break] != 13 && word_list_array[word_break] != 10 && word_break>0) word_break--; // 32 is ascii code for blank, 13, 10 new lines
        var buf = new ArrayBuffer(word_break+1);
        var bufView = new Uint8Array(buf);
        // first half of file
        for (i=0;i<=word_break;i++)
            bufView[i] = word_list_array[i];
        //hworker.webkitPostMessage( {op_choice:1, buf:buf},[buf]);
        hworker.postMessage( {op_choice:1, buf:buf},[buf]);
        // second half of file
        buf = new ArrayBuffer(word_list_array.length-word_break);
        bufView = new Uint8Array(buf);
        // second half of file
        for (i=word_break+1;i<word_list_array.length;i++)
            bufView[i-(word_break+1)] = word_list_array[i]
        //hworker2.webkitPostMessage( {op_choice:1, buf:buf},[buf]);
        hworker2.postMessage( {op_choice:1, buf:buf},[buf]);
   }

}

// custom di table
var book_string = '';
function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
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
  book_string = fileString;
  //alert("file loaded");
  stop_flag=1; // reinitialize web workers
  
}

function errorHandler2(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function set_reload(){
    stop_flag = 1; // signal to reinitialize
}    

function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsArray(fname);
    stop_flag = 1; // force reload of workers
	
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

onload=function(){
    document.getElementById('do_search').addEventListener("click",do_search); 
    document.getElementById('stop_search').addEventListener("click",stop_search);   
    document.getElementById('custom_list').addEventListener("change", set_reload); 
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});         

    document.getElementById('custom_di_table').addEventListener("change", set_reload); 
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});         
    
    initialize_workers();
}
    