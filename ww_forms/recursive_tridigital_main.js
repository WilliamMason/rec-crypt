

var hworker;


var cipher_words;
var word_list_string = '';
var word_list = [];

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var skip_word_index, last_index;
var length_not_found;
var word_len = [];
var start_key;
var word_separator;
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
  word_len = [];
  //alert("file loaded");
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function initialize_word_list(str){
	var s,n;
    var state,i,c,index;
    
    // construct word list
    str = str.toLowerCase();
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            s = c;
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += c;
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;
	

}


function alltrim(str) { // remove leading and trailing blanks
    return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
    return str.replace(/\s+/g, ' ');
}

function digits_and_dash_only(str){
	str = str.toLowerCase();
	return( str.replace( /[^0-9-]/g,'') );
}

function digits_only(str){ // remove everthing except digits
	str = str.toLowerCase();
	return str.replace(/[^0-9]/g,'');
}


function reformat(st){
    var out_str,s,str;
	var rs;
    
	//str = document.getElementById('input_area').value;
    // remove apostophes, hyphens, and equal signs
    str = digits_only(st);
	word_separator = document.getElementById('word_separator').value;
	rs = new RegExp(word_separator,'g')
    // replace new lines by blanks
    //str = str.replace(/[\n\r]/g,' ');
    //str = str.toLowerCase();
    // replace word sep digits  characters by blanks
    str = str.replace(rs,' ');
    // reduce to just one space between words
    str = alltrim(str);
    str = condense_white_space(str)
	//document.getElementById('output_area').value = out_str;
    return(str);
}

function do_processing(){
	var xfer;
	var i,j,k,c,n,s,s2;
	
	initialize_worker();
	//word_len = [];
	if(word_len.length == 0 ) {
		if (word_list_string == ''){
			alert("Must select word list file.")
				return;
		}
		initialize_word_list(word_list_string);
		length_not_found = [];
		for (i=0;i<50;i++)
			length_not_found[i] = true;
		
		for (i=0;i<word_list.length;i++){
				le = word_list[i].length;
				if ( length_not_found[le] ){
					length_not_found[le] = false;
					word_len[le] = [];
				}
				word_len[le].push( word_list[i] )
		}
	}
	

	skip_word_index = [];
	last_index = cipher_words.length-1;
	for (i=0;i<cipher_words.length;i++)
		skip_word_index[i] = false;
	
	//enter the indices of all words to skip and update the skip_word_index array
	s2 = document.getElementById('skip_numbs').value;
	s = s2.split(' ');
	for (i=0;i<s.length;i++){
		n = parseInt(s[i]);
		skip_word_index[n] = true;
	}
	s2 = document.getElementById('start_key').value;
	start_key = digits_and_dash_only(s2);
	if ( start_key.length != 26){
		alert('Initial key does not have 26 digits and dashes');
		return;
	}
	xfer = {};
	xfer["word_len"] = word_len;
	xfer["length_not_found"] = length_not_found;
	xfer["cipher_words"] = cipher_words;
	xfer["skip_word_index"] = skip_word_index;
	xfer["start_key"] = start_key;
	hworker.postMessage(xfer);
	
}	

function display_lengths(){
    var out_str,s,str;
	var i,j,k,c,n;
	var result, wrd1,wrd2,length_array;
	
	length_array = [];
	out_str = "Word lengths (format: position, word, word length)\n\n"
	for (i=0;i<cipher_words.length;i++)
		length_array.push( [i,cipher_words[i],cipher_words[i].length] )
	length_array.sort( (a,b) => b[2]-a[2] )
	for (i=0;i<length_array.length;i++)
		out_str += length_array[i]+'\n';
		
	
	document.getElementById('output_area').value = out_str;
}

function initialize(){
    var out_str,s,str;
    var pat, result;
    var i,j,k,c,n;
    
	s = document.getElementById('word_separator').value;
	s = digits_only(s);
	if ( s == ''){
		alert("No word separator digit entered");
		return;
	}
	
	out_str="";
	str = document.getElementById('input_area').value;
  str = reformat(str);
  cipher_words = str.split(' ');
  display_lengths();
  out_str += "";
  for (i=0;i<cipher_words.length;i++)
      out_str += '('+i+') '+cipher_words[i].toUpperCase()+', ';
	document.getElementById('input_area').value = out_str;
	document.getElementById('process').disabled = false;
	document.getElementById('stop').disabled = false;
	document.getElementById('insert').disabled = false;
	
  
}

function initialize_worker(){
    var out_str;
    
   hworker = new Worker('recursive_tridigital_worker.js');
   hworker.onmessage = function (event) {
    out_str = event.data
	document.getElementById('output_area').value = out_str;	
    }
}


function do_stop(){
	var str;
	
	hworker.terminate();
	str = document.getElementById('output_area').value;
	document.getElementById('output_area').value = str+"\nStopped";
	//alert("Stopped");
//	word_len = [];
	//stop_flag = 1;
}

function do_insert(){
	var i,s;
	s = '';
	for (i=0;i<cipher_words.length;i++)
		s += i+' ';
	document.getElementById('skip_numbs').value = s;
}

onload = function() {
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});
}

