

var hworker;


var cipher_words;
var word_list_string = '';
var word_list = [];

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var skip_word_index, last_index;
var length_not_found;
var word_len = [];
var start_key;
// make word list

var word_list_with_freq_flag = false;
var class_array;
// make word list
var class_array_cutoff = 0;


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

function do_class_conversion(str){
//alert("convert");
  var i,j,k,c,n,s,s1;
  var str_array;
  
  //var str = book_string;
  if ( str ==''){
	alert("no word list loaded");
	return;
  }
  str_array = str.split('\n'); // break into separate lines, each line has word and its log frequency
  class_array = []; // global variable
  
  for (i=0;i<str_array.length;i++){
    s = str_array[i];
    s = condense_white_space(s); // change separator strings to single blanks
    s = s.split(' ');
    s1 = new dict_element(s[0],parseInt(s[1]));
    class_array.push(s1);
    
  }

  //s = "number of elements in class array is: "+class_array.length;
  //document.getElementById('output_area').value = s;  
  
}

function alltrim(str) { // remove leading and trailing blanks
    return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
    return str.replace(/\s+/g, ' ');
}

function letters_and_dash_only(str){
	str = str.toLowerCase();
	return( str.replace( /[^a-z-]/g,'') );
}

class dict_element {
  constructor(word,freq){
    this.word = word;
    this.freq = freq;
  }
}

function reformat(st){
    var out_str,s,str;
    
	//str = document.getElementById('input_area').value;
    // remove apostophes, hyphens, and equal signs
    str = st.replace(/[\'\-\=]/g,"");
    // replace new lines by blanks
    str = str.replace(/[\n\r]/g,' ');
    str = str.toLowerCase();
    // replace all non-alphabetic characters by blanks
    str = str.replace(/[^a-z]/g,' ');
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
	if (document.getElementById('has_frequency').checked){
		word_list_with_freq_flag = true;
		class_array_cutoff = parseInt(document.getElementById('cutoff_amount').value );
	}
	else
		word_list_with_freq_flag = false;	
	
	word_len = []; // have to reset in case cutoff frequency has changed and you need a new word list
	if(word_len.length == 0 ) {
		if (word_list_string == ''){
			alert("Must select word list file.")
				return;
		}
		if (word_list_with_freq_flag){
			do_class_conversion(word_list_string);
			word_list = [];
			for (i=0;i<class_array.length;i++){
				if (class_array[i].freq > class_array_cutoff)
					word_list.push(class_array[i].word)
			}
		}
		else
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
	start_key = letters_and_dash_only(s2);
	if ( start_key.length != 26){
		alert('Initial key does not have 26 letters and dashes');
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
    
   hworker = new Worker('recursive_keyphrase_worker.js');
   hworker.onmessage = function (event) {
    out_str = event.data
	document.getElementById('output_area').value = out_str;	
    }
}


function do_stop(){
	var str;
	
	hworker.terminate();
	str = document.getElementById('output_area').value;
	document.getElementById('output_area').value = str+"\Stopped";
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

function display_hide_cutoff(){
	var str;
	
	if (document.getElementById('has_frequency').checked){
		str = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
		str += 'Frequency cutoff : <input type = "text" id="cutoff_amount" size = 3 value = 14>';
	}
	else
		str = '';
	document.getElementById('cutoff_location').innerHTML = str;
}



onload = function() {
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});
	document.getElementById('has_frequency').addEventListener("change",display_hide_cutoff );	
}

