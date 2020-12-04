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
var selected_routes;

// key table
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

// custom tet table
var book_string2 = '';
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
  book_string2 = fileString;
  //alert("file loaded");
  stop_flag=1; // reinitialize web workers
  
}

function errorHandler2(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function initialize(){
	var str;
	var s;
	
   hclimber = new Worker('s2s4_conv_search.js');
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

   if (document.getElementById('custom_table').checked == true) {
    s = '&'; // prefix to indicate string to make table from
    s += book_string2;
    hclimber.postMessage(s);  	// command hclimber to make custom table
    //alert("custom tet tabel constructed");
   }
    

   if (numb_workers>1){
   		hclimber2 = new Worker('s2s4_conv_search.js');
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
        s = '#'; // prefix to indicate string to make table from
        s += book_string;
        hclimber2.postMessage(s);  	// command hclimber to make custom table
        //alert("custom tet tabel constructed");
        if (document.getElementById('custom_table').checked == true) {
            s = '&'; // prefix to indicate string to make table from
            s += book_string2;
            hclimber.postMessage(s);  	// command hclimber to make custom table
            //alert("custom tet tabel constructed");
        }
        
   }
   if (numb_workers>2){
   		hclimber3 = new Worker('s2s4_conv_search.js');
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
        s = '#'; // prefix to indicate string to make table from
        s += book_string;
        hclimber3.postMessage(s);  	// command hclimber to make custom table
        //alert("custom tet tabel constructed");
        if (document.getElementById('custom_table').checked == true) {
            s = '&'; // prefix to indicate string to make table from
            s += book_string2;
            hclimber.postMessage(s);  	// command hclimber to make custom table
            //alert("custom tet tabel constructed");
        }

   }
  
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
	return(true);
}

function get_routes(){
    var i,j,c,n,s;
    
    selected_routes = [];
    for (i=0;i<40;i++){
        s = 'r'+i;
        if (document.getElementById(s).checked )
            selected_routes.push(i);
    }
}


function do_solve(){
	var str,max_trials,s,n;
	
	if (!do_check()) return;
    get_routes();
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
	str = '@';
	if(document.getElementById('s4t').checked)
		str +=':0';
	else
		str += ':1';
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
	if(document.getElementById('option6').checked)
		str +=':1';
	else
		str += ':0';
	s = document.getElementById('numb_seeds').value
	str += ':'+s;
	//s = document.getElementById('numb_routes').value
    s = selected_routes.length;
	str += ':'+s;	
	if(document.getElementById('reverse_flag').checked)
        str +=':1';
    else
		str += ':0';    
    str += ':'+JSON.stringify(selected_routes);
	hclimber.postMessage(str);  
	if(numb_workers>1) {
		str = '@';
		if(document.getElementById('s4t').checked)
			str +=':0';
		else
			str += ':1';
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*2000);
		str = str+':'+n;
        if (document.getElementById('option6').checked)
            str +=':1';
        else
            str += ':0';
		s = document.getElementById('numb_seeds').value
		str += ':'+s;
		//s = document.getElementById('numb_routes').value
        s = selected_routes.length;
		str += ':'+s;
        if(document.getElementById('reverse_flag').checked)
            str +=':1';
        else
            str += ':0';                        
        str += ':'+JSON.stringify(selected_routes);        
		hclimber2.postMessage(str);  
	}
	if(numb_workers>2) {
		str = '@';
		if(document.getElementById('s4t').checked)
			str +=':0';
		else
			str += ':1';
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*3000);
		str = str+':'+n;
        if(document.getElementById('option6').checked)
            str +=':1';
        else
            str += ':0';
		s = document.getElementById('numb_seeds').value
		str += ':'+s;
		//s = document.getElementById('numb_routes').value
        s = selected_routes.length;
		str += ':'+s;
        if(document.getElementById('reverse_flag').checked)
            str +=':1';
        else
            str += ':0';                        
        str += ':'+JSON.stringify(selected_routes);        
		hclimber3.postMessage(str);  
	}
    // finally, transmit ciphertext!
	str = document.getElementById('input_area').value;	
	str = str.toUpperCase();
    str = str.replace(/Ø/g,'0');    
	hclimber.postMessage(str);  
	if(numb_workers>1) hclimber2.postMessage(str);  
	if(numb_workers>2) hclimber3.postMessage(str);  
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
	document.getElementById('input_area').value = '';
	document.getElementById('status').value = 'Idle';
	document.getElementById('status1').value = 'Idle';
	document.getElementById('status2').value = 'Idle';	
}

function setup_route_grid(){
    var str,j,i,c,n;
    
    str = '';
    str += '<div class= "label"> horizontal </div>';
    str += '<div class= "label"> vertical </div>';    
    str += '<div class= "label"> diagonal down </div>';    
    str += '<div class= "label"> diagonal up-down </div>';    
    str += '<div class= "label"> diagonal down-up </div>';    
    str += '<div class= "label"> cc spiral </div>';    
    str += '<div class= "label"> left-right </div>';    
    str += '<div class= "label"> vertical down-up </div>';    
    str += '<div class= "label"> spiral </div>';    
    str += '<div class= "label"> diagonal up </div>';    
    str += '<div class="directions"> select routes </div>';    
    j = 0;
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label"> No Flips </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"> </div>';
        j++;
    }
    str += '<div class="label"> Up-Down </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label"> Left-Right </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label"> Both flips </div>';
    
    document.getElementById('wrapper').innerHTML = str;
    document.getElementById('r0').checked = true;
    document.getElementById('r1').checked = true;
    document.getElementById('r8').checked = true;
}

function do_select_all(){
var i;
//alert("select all routes")
    for (i=0;i<40;i++){
        s = 'r'+i;
        document.getElementById(s).checked = true;
    }

}

function do_clear_all(){
//alert("clear all routes")
var i;

    for (i=0;i<40;i++){
        s = 'r'+i;
        document.getElementById(s).checked = false;
    }

}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);    
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});    
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});  
    document.getElementById('do_select_all').addEventListener("click",do_select_all);        
    document.getElementById('do_clear_all').addEventListener("click",do_clear_all);        
    setup_route_grid();
}    
