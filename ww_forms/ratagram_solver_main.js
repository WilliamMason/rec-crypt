var code = "EMPTY"
var lowerC="abcdefghijklmnopqrstuvwxyz"
var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
//substate values 0 =no choice,1 = cipher letter chosen, 2 = plain letter chosen, 3 = both letters chosen (use just 1 and 2?)
var substate=0, pchoice=0,cchoice=0
var key_array = '--------------------------'
var inverse_key = new Array(26);

var solving_flag = 0;
var line_len = 80;
var cipher_type = 0;

var l_count = new Array(26),s_count = new Array(26)
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;

var cipher_words;
var word_list_string = '';

// make word list

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
  word_list_string = fileString;
  //alert("file loaded");
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function initialize(){
	//var str,i,score,s;
	
   hclimber = new Worker('hill_climb_ratagram.js');
   hclimber.onmessage = function (event) {
	var str,i,score,s;
	 str = event.data;
	 if (str.charAt(0) == '0') { // break up into score and display strings
		 s = str.split('~'); // string separated by tilde ~
		 score = parseFloat(s[0].slice(1));
		 document.getElementById('status').value = s[0].slice(1);
		 if ( score > max_score){
		 	 max_score = score;
		 	 current_channel = 0;
		 }
		
		if ( current_channel == 0)
     		document.getElementById('output_area').value = s[1]+" worker: 0";
     	
 	}
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     		document.getElementById('status').value = str.slice(1);
 	}
     else
     	document.getElementById('output_area').value = str+" worker: 0";
   };
   hclimber2 = new Worker('hill_climb_ratagram.js');
   hclimber2.onmessage = function (event) {
	var str,i,score,s;
	 str = event.data;
	 if (str.charAt(0) == '0') { // break up into score and display strings
		 s = str.split('~'); // string separated by tilde ~
		 score = parseFloat(s[0].slice(1));
		 document.getElementById('status2').value = s[0].slice(1);
		 if ( score > max_score){
			 max_score = score;
			 current_channel = 1;
		 }
		
		if ( current_channel == 1)
     		document.getElementById('output_area').value = s[1]+" worker: 1";
     	
 	}
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     		document.getElementById('status2').value = str.slice(1);
 	}
     else
     	document.getElementById('output_area').value = str+" worker: 1";
   };
   hclimber3 = new Worker('hill_climb_ratagram.js');
   hclimber3.onmessage = function (event) {
	var str,i,score,s;
	 str = event.data;
	 if (str.charAt(0) == '0') { // break up into score and display strings
		 s = str.split('~'); // string separated by tilde ~
		 score = parseFloat(s[0].slice(1));
		 document.getElementById('status3').value = s[0].slice(1);
		 if ( score > max_score){
			 max_score = score;
			 current_channel = 2;
		 }
		
		if ( current_channel == 2)
     		document.getElementById('output_area').value = s[1]+" worker: 2";
     	
 	}
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     		document.getElementById('status3').value = str.slice(1);
 	}
     else
     	document.getElementById('output_area').value = str+" worker: 2";
   };

  
}


function type_selected(){
	get_cipher_type();
	if (cipher_type == 1) // patristocrat
		document.getElementById('fudgefactor').value="0.5"; // changed from 0.7
	else // Aristoctat
		document.getElementById('fudgefactor') = "0.5";
	
}

function get_cipher_type() {
	var i;

    cipher_type = 0;
    /*
	for (i = 0;i<document.puzzle.ctype.length;i++)
		if (document.puzzle.ctype[i].checked){
			cipher_type = document.puzzle.ctype[i].value;
			break;
	}
    */
//	s = "cipher type is "+cipher_type
//	alert(s)
}

function letters_only(s){
	var i,n;
	
	str = '';
	for (i=0;i<s.length;i++) {
			n = upperC.indexOf(s.charAt(i))
			if ( n != -1)
				str += s.charAt(i)
	}
	return(str);
}

function break_pt(c) {
	switch(c) {
		case ' ':
		case ',':
		case '"':
			return 1
	}
	return 0
}

function get_inverse_key(){
	var j;
	
	for (j=0;j<26;j++)
		inverse_key[j] = '-';
	for (j=0;j<26;j++)
		if (key_array.charAt(j) != '-')
			inverse_key[upperC.indexOf(key_array.charAt(j))] = lowerC.charAt(j)
}

function xlate(sub_flag) {
	var k,i,n,pl,pos,str,limit
	// erase any previous values of cchoice
	n = key_array.indexOf(upperC.charAt(cchoice))
	if ( n != -1) {
		k = key_array.slice(0,n)+'-';
		if (n<25)
			k = k+key_array.slice(n+1);
		key_array=k
	}
	if (sub_flag) { //substitution, not erasure
		k = key_array.slice(0,pchoice)+upperC.charAt(cchoice);
		if (pchoice<25)
			k = k+key_array.slice(pchoice+1);
		key_array=k
	}
	document.puzzle.key.value =key_array+"\n"+lowerC;
	if (solving_flag == 0) {
		get_cipher_type();
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		if (cipher_type == 1)
			// dump everything except letters
			code = letters_only(code);
		else
			// global replace of line feeds and carriage returns with blank
			code = code.replace(/[\n\r]/g,' ');
		solving_flag = 1;
	}
	pos=0
	str = ''
	while ( pos < code.length ) {
		limit = pos+line_len;
		if ( limit >= code.length)
			limit = code.length-1;
		else {
			while ( break_pt(code.charAt(limit))== 0 && limit>pos )
				limit = limit -1;
			if (limit == pos) //no place to split!
				limit = pos+line_len;
		}
		str = str+code.slice(pos,limit+1)+"\n"
		pl = ''
		for (i=pos;i<=limit;i++) {
			c = code.charAt(i);
			n = key_array.indexOf(c)
			if (n != -1 && c!='-')
				pl = pl+lowerC.charAt(n);
			else {
				n = upperC.indexOf(c);
				if (n!= -1) c = '-';
				pl = pl+c;
			}
		}
		str = str+pl+"\n"
		pos = limit+1
	}
	str += "\n\nK2 Key:\n"+lowerC+"\n"+key_array+"\n";
	get_inverse_key();
	str += "\nK1 Key:\n"+upperC+"\n";
	for (i=0;i<26;i++)
		str += inverse_key[i];
	str += "\n";
	document.puzzle.ciphertext.value = str
	substate=0
	document.solver.halt_solver();
}

function s_compare(a,b) {
		return b[1]-a[1]
}

function letter_count() {
	var i,n,str,s;

	
	if (solving_flag == 0) {
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');
		//solving_flag = 1;
	}

	for (i=0;i<26;i++)
		l_count[i] = 0;
		
	for (i=0;i<code.length;i++) {
			n = upperC.indexOf(code.charAt(i))
			if ( n != -1)
				l_count[n] = l_count[n]+1
	}

	for (i=0;i<26;i++)
		s_count[i] = [upperC.charAt(i),l_count[i] ]
	s_count.sort(s_compare);
	str = '';
	for (i=0;i<26;i++)
		str += s_count[i][0]+"  ";
	str += '\n';
	for (i=0;i<26;i++){
		str += s_count[i][1].toString()+' ';
		if (s_count[i][1]<10) str += ' ';
	}
	
	//alert(str)
	s = "Letter count:<br>";
	s += '<TEXTAREA id=let_ct styLe="font-family:monospace" name=let_ct rows=2 cols=80></TEXTAREA> <BR>';
	document.getElementById('let_space').innerHTML=s;
	document.getElementById('let_ct').value = str;

}
	
	
function start_over() {
	var i
	key_array = '--------------------------';
	document.puzzle.key.value =key_array+"\n"+lowerC;
	if (solving_flag ==0) {
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');
		//solving_flag = 1;
	}
	document.puzzle.ciphertext.value = code
	substate=0
	solving_flag = 0; //OK to edit ciphertext
	document.solver.halt_solver();
}

function do_clear(){
		do_erase = confirm("Erase the current cipher?")
		if ( do_erase == true) {
			setup_key()
			document.puzzle.ciphertext.value = ''
			solving_flag=0;
			document.getElementById('let_space').innerHTML=' ';
			document.getElementById('output_area').value = '';
		}
}


function do_calc(){
	var s,str,n;
	
	if (solving_flag ==0){
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		get_cipher_type();
	}
	if (stop_flag == 1){
		initialize();
		stop_flag = 0;
	}
    if (document.getElementById('custom_word_list').checked){
        if (word_list_string == ''){
            alert("Must select word list file.")
            return;
        }
        str = '^'+word_list_string;
        hclimber.postMessage(str);
        hclimber2.postMessage(str);
        hclimber3.postMessage(str);
        document.getElementById('custom_word_list').checked = false;
    }
	max_score = -10000.0;
	max_trials = parseInt(document.getElementById('numb_trials').value);
	str = '@'+max_trials;
	//ff = parseFloat(document.settings.fudgefactor.value);
	s = document.getElementById('fudgefactor').value;
	str += ':'+s; // use colons to separate values
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	s = str+':'+n;
	hclimber.postMessage(s);
	n = Math.floor( Math.random()*2000);
	s = str+':'+n;
	hclimber2.postMessage(s);
	n = Math.floor( Math.random()*3000);
	s = str+':'+n;
	hclimber3.postMessage(s);
	if (document.getElementById('word_scoring').checked == true)
		s = '1';
	else s = '0';
	str = '~'+cipher_type+s+key_array;
	hclimber.postMessage(str);
	hclimber.postMessage(code);
	hclimber2.postMessage(str);
	hclimber2.postMessage(code);
	hclimber3.postMessage(str);
	hclimber3.postMessage(code);
	
}

function do_stop(){
	var str;
	
	hclimber.terminate();
	hclimber2.terminate();
	hclimber3.terminate();
	document.getElementById('status').value = "Stopped";
	document.getElementById('status2').value = "Stopped";
	document.getElementById('status3').value = "Stopped";
	stop_flag = 1;
}
onload = function() {
    document.getElementById('do_calc').addEventListener("click",do_calc);
    document.getElementById('do_stop').addEventListener("click",do_stop);
    //setup_key();
    initialize();
    //document.getElementById('do_clear1').addEventListener("click",do_clear);
   document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});
}
