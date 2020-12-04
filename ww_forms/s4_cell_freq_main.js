//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var numb_workers = 0;
var table_loaded = 0;

// new crib stuff
var crib=''; // new global variable
var plain_len;
var crib_status_flag = 0; // 0= no crib, 1 = fixed crib, 2 = floating crib (to do)


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
	
   hclimber = new Worker('s4_cell_freq_worker.js');
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
     else
     	document.getElementById('output_area').value = str;   
   };

    s = '#'; // prefix to indicate string to make word list from
    s += book_string;
    hclimber.postMessage(s); 
    //alert("custom tet tabel constructed");
  
}

function do_check(){
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz';
    if (document.getElementById('option6').checked)
        alpha += '0123456789';
	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
    s = s.toUpperCase();
    s = s.replace(/Ø/g,'0');    
	s = s.toLowerCase();
	s1=''
	for (n = 0;n<s.length;n++){
		c = s.charAt(n);
		if (alpha.indexOf(c) != -1)
			s1 += c;
	}
	if ( (s1.length&1) !=0 ){
		alert("Text has odd number of letters!");
		return(false);
	}
	if (s1.indexOf('j') != -1 && document.getElementById('option6').checked == false){
		alert("Ciphertext has a J!");
		return(false);
	}
    if ( book_string=='') {
        alert(" No key file chosen!");
        return(false);
    }
	if(document.getElementById('specific_routes').checked){
        n = parseInt(document.getElementById('left_route').value);
        if (isNaN(n) ){
            alert("No left route number entered");
            return(false);
        }
        n = parseInt(document.getElementById('right_route').value);
        if (isNaN(n) ){
            alert("No right route number entered");
            return(false);
        }
    }    
	return(true);
}

function do_solve(){
	var str,max_trials,s,n;
	
	if (!do_check()) return;


	numb_workers=1;
	
	if (table_loaded != numb_workers || stop_flag==1){
		initialize();
		table_loaded=numb_workers;
	}
	max_score  = -10000.0;
	str = '@';
	if(document.getElementById('option6').checked)
		str +=':1';
	else
		str += ':0';
	s = document.getElementById('numb_routes').value
	str += ':'+s;	
	s = document.getElementById('numb_keys').value
	str += ':'+s;
	if(document.getElementById('specific_routes').checked){
		str +=':1';
        s = document.getElementById('left_route').value
        str += ':'+s;	
        s = document.getElementById('right_route').value
        str += ':'+s;
    }
	else
		str += ':0';
	hclimber.postMessage(str);  
    // finally, transmit ciphertext!
	str = document.getElementById('input_area').value;	
	str = str.toUpperCase();
    str = str.replace(/Ø/g,'0');    
	hclimber.postMessage(str);  
	stop_flag = 0;
}

function do_stop(){
	var str;
	
	hclimber.terminate();
	document.getElementById('status').value = "Stopped";
	stop_flag = 1;
}

function do_route_display(){
    var s;
    s="Routes:\n0 horizontal\n1 left-right\n2 spiral\n3 vertical\n4 down-up\n5 counter clockwise spiral\n";
    s += "6 vertical up\n7 diagonal up\n8 diagonal alternation up-down\n";
    s += "9 diagonal down, starting at right corner\n10 diagonal down";
    alert(s);
}    

function do_clear(){
	document.getElementById('output_area').value = '';
	document.getElementById('input_area').value = '';
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}
onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);    
    document.getElementById('do_route_display').addEventListener("click",do_route_display);        
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});         
}    
