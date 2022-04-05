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
	
   hclimber = new Worker('trisq_conv_search.js');
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

   if (numb_workers>1){
   		hclimber2 = new Worker('trisq_conv_search.js');
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
   }
   if (numb_workers>2){
   		hclimber3 = new Worker('trisq_conv_search.js');
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

   }
  
}

function do_check(){
	var s,s1,n,c;
	var alpha='abcdefghijklmnopqrstuvwxyz';
    var alpha6="abcdefghijklmnopqrstuvwxyz0123456789";	

    var flag6x6;
    if (document.getElementById('use6x6').checked){
        flag6x6=true;
    }
    else {
        flag6x6 = false;
    }
    
	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
    s = s.toUpperCase();
    s = s.replace(/Ø/g,'0');    
	s = s.toLowerCase();
	s1=''
    if (flag6x6){
        for (n = 0;n<s.length;n++){
            c = s.charAt(n);
            if (alpha6.indexOf(c) != -1)
                s1 += c;
        }    
    }
    else {
        for (n = 0;n<s.length;n++){
            c = s.charAt(n);
            if (alpha.indexOf(c) != -1)
                s1 += c;
        }
    }
	if ( (s1.length%3) !=0 ){
		alert("Cipher length not divisible by 3!");
		return(false);
	}
    
	if (!flag6x6 && s1.indexOf('j') != -1 ){
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
    for (i=0;i<50;i++){
        s = 'r'+i;
        if (document.getElementById(s).checked )
            selected_routes.push(i);
    }
}

function do_solve(){
	var str,max_trials,s,n;
	
	if (!do_check()) return;
    get_routes();
    if (document.getElementById('use6x6').checked)
        flag6x6 = true;
    else
        flag6x6 = false;

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

		str +=':0'; // dummy
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	str = str+':'+n;
	str += ':'+JSON.stringify(selected_routes);
	s = document.getElementById('numb_seeds').value
	str += ':'+s;
	//s = document.getElementById('numb_routes').value
    s = selected_routes.length;
	str += ':'+s;	
    if (flag6x6)
        str += ':1'
    else
        str += ':0';    
	hclimber.postMessage(str);  
	if(numb_workers>1) {
		str = '@';

			str +=':0';
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*2000);
		str = str+':'+n;
            //str += ':0';
        str += ':'+JSON.stringify(selected_routes);
		s = document.getElementById('numb_seeds').value
		str += ':'+s;
		//s = document.getElementById('numb_routes').value
        s = selected_routes.length;
		str += ':'+s;	
        if (flag6x6)
            str += ':1'
        else
            str += ':0';        
        hclimber2.postMessage(str);  
     }
	if(numb_workers>2) {
		str = '@';

			str +=':0';
		// use different random number seeds for different web workers
		n = Math.floor( Math.random()*3000);
		str = str+':'+n;
        //str += ':0';
        str += ':'+JSON.stringify(selected_routes);
		s = document.getElementById('numb_seeds').value
		str += ':'+s;
		//s = document.getElementById('numb_routes').value
        s = selected_routes.length;
		str += ':'+s;	
        if (flag6x6)
            str += ':1'
        else
            str += ':0';        
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

/*
route_name[0] = "horizontal";
route_name[1] = "vertical";
route_name[2] = "diagonal down";
route_name[3] = "diagonal up-down";
route_name[4] = "diagonal down-up";
route_name[5] = "cc spiral";
route_name[6] = "left-right";
route_name[7] = "vertical down-up";
route_name[8] = "spiral";
route_name[9] = "diagonal up";
*/
function setup_route_grid(){
    var str,j,i,c,n;
    
    str = '';
    str += '<div class= "label_h"> horizontal </div>';
    str += '<div class= "label_h"> vertical </div>';    
    str += '<div class= "label_h"> diagonal down </div>';    
    str += '<div class= "label_h"> diagonal up-down </div>';    
    str += '<div class= "label_h"> diagonal down-up </div>';    
    str += '<div class= "label_h"> cc spiral </div>';    
    str += '<div class= "label_h"> left-right </div>';    
    str += '<div class= "label_h"> vertical down-up </div>';    
    str += '<div class= "label_h"> spiral </div>';    
    str += '<div class= "label_h"> diagonal up </div>';    
    str += '<div class="directions"> select routes </div>';    
    j = 0;
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label"> Left, No-flip </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"> </div>';
        j++;
    }
    str += '<div class="label"> Left,Up-Down </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry_top"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label_top"> Top, No-flip </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry_top"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label_top"> Top Left-right </div>';
    for (i=0;i<10;i++){
        str += '<div class="entry_middle"> <input type="checkbox" class="largerCheckbox" id="r'+j+'"></div>';
        j++;
    }
    str += '<div class="label_middle"> Middle, No-flip </div>';
    
    document.getElementById('wrapper').innerHTML = str;
    document.getElementById('r0').checked = true;
    document.getElementById('r1').checked = true;
    document.getElementById('r8').checked = true;
	document.getElementById('r20').checked = true;
	document.getElementById('r40').checked = true;
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);    
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});  
    setup_route_grid();
}    
