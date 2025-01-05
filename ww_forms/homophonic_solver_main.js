// use three web workers: the first uses range 1-500,000, the second uses range 500,000 to 1 million, the
//third uses alternative key translation in range 1111 to 10,000.

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
  debugger;
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


var hworker;
var best_score = 0; 

function do_solve(){
	var str, s, op_choice;
    var decrypt1, decrypt2, decrypt3;
    var use_6x6;
	
	s = document.getElementById('input_area').value;
    if ( s==''){
        alert("No ciphertext entered!");
        return;
    }
    s = s.replace(/Ø/g,'0');
    hworker = new Worker('homophonic_worker.js');
    hworker.onmessage = function(event) {
        var op_choice, str,score;
        op_choice = event.data.op_choice;
        str = event.data.str;
        if ( op_choice==1){
            //document.getElementById('output_area').value = str;
            decrypt1 = str;
            document.getElementById('output_area').value = decrypt1;
        }
    }
   if (document.getElementById('custom_table').checked == true) {
    //s = '#'; // prefix to indicate string to make table from
    //s += book_string;
	if (book_string=='') {
        alert(" No book file chosen for custom tet table!");
        return;
    }    
    	
	hworker.postMessage( {op_choice:2, str:book_string});
   }
	
    hworker.postMessage( {op_choice:1, str:s});
    document.getElementById('output_area').value = 'working';

}

function stop_search(){
    hworker.terminate();
    //document.getElementById('status').value = 'stopped';

    best_score = 0;
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);
    document.getElementById('stop_search').addEventListener("click",stop_search);
	document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});     
}
