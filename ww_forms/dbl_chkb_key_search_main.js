// search a word/phrase list for headline puzzle hats

var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var word_list_string = '';
var word_list = [];
var search_pattern = [];
var word_list_array=[];
var key_pairs= '';


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
    var str2,kw;

    var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var max_letters = 10; // later allow for possibility of 12 for 6x6 checkerboard
    var letters_found = [];
    
   if ( document.getElementById('6x6').checked )
    max_letters = 12
   else
    max_letters = 10;
   if ( word_list_array.length==0){
        alert("Must Choose word list file!");
        return;
   }
   var worker = new Worker('dbl_chkb_key_search_worker.js');
   worker.onmessage = function(event) {
   	 str = event.data;
     document.getElementById('output_area').value = str;
     key_pairs = str.slice(0);
   }
   // allow for webkit prefix or its removal
   worker.postMessage = worker.webkitPostMessage || worker.postMessage;
   str = document.getElementById('word_pattern').value
   if ( str==''){
        alert("No vertical key letters entered!");
        return;
   }
   str = str.toUpperCase();
   for (i=0;i<26;i++)
    letters_found[i] = 0;
   for (i=0;i<str.length;i++){
	   c = str.charAt(i);
	   if (symbols.indexOf(c) != -1)
            letters_found[symbols.indexOf(c)] = 1;
	}
    cnt = 0;
    str = ''; // get unique key letters.
    for (i=0;i<26;i++)
        if (letters_found[i] == 1){
            cnt++;
            str += symbols.charAt(i);
    }
	if (cnt > max_letters) {
		alert("Too many vertical key letters!");
		return;
	}
	if ( cnt < max_letters/2){
		alert("Not enough vertical key letters!");
		return;
	}

   str2 = document.getElementById('word_pattern2').value
   if ( str2==''){
        alert("No horizontal key letters entered!");
        return;
   }
   str2 = str2.toUpperCase();
   for (i=0;i<26;i++)
    letters_found[i] = 0;   
   for (i=0;i<str2.length;i++){
	   c = str2.charAt(i);
	   if (symbols.indexOf(c) != -1)
            letters_found[symbols.indexOf(c)] = 1;
	}
    str2 = ''; // get unique key letters.
    cnt = 0;
    for (i=0;i<26;i++)
        if (letters_found[i] == 1){
            cnt++;
            str2 += symbols.charAt(i);
    }    
	if (cnt > max_letters) {
		alert("Too many horizontal key letters!");
		return;
	}
	if ( cnt < max_letters/2){
		alert("Not enough horizontal key letters!");
		return;
	}
	if (max_letters == 12)
        kw = 6;
    else
        kw = 5;
	flag = false;
	if (document.getElementById('all_letters').checked)
		flag = true;
   // note: below, you need the .buffer at the end because word_list_array is a (char) view of the arrayBuffer, not
   // the arrayBuffer itself. If word_list_array was just an arrayBuffer you wouldn't need to add .buffer to it.
   //worker.webkitPostMessage( {op_choice:1, buf:word_list_array.buffer},[word_list_array.buffer]);
   worker.postMessage( {op_choice:1, buf:word_list_array.buffer},[word_list_array.buffer]);
   //worker.webkitPostMessage( {op_choice:2, str:str, str2:str2});
   worker.postMessage( {op_choice:2, str:str, str2:str2, kw:kw, flag:flag});
}

function get_combos(){
    var i,j,n;
    var strs,kw;
    var v_keys,h_keys,n1,n2;
    var ciphertext='';
//alert("Get combos");
    var max_letters = 10; // later allow for possibility of 12 for 6x6 checkerboard
    
   if ( document.getElementById('6x6').checked )
    max_letters = 12
   else
    max_letters = 10;
    if ( key_pairs == ''){
        alert("No key pairs found. Search for keys first!");
        return;
    }
    strs = key_pairs.split('\n');

    // note: last item in strs is empty string, omit it
    n1 = strs.indexOf('/ vertical pairs:');
    n2 = strs.indexOf('/ horizontal pairs:');
    v_keys = strs.slice(n1+1,n2);
    h_keys = strs.slice(n2+1,strs.length-1)
	if (max_letters == 12)
        kw = 6;
    else
        kw = 5;
    
//document.getElementById('cipher_area').value = v_keys+' then...'+h_keys  
   ciphertext = document.getElementById('cipher_area').value
   if (ciphertext == '') {
    alert("No ciphertext entered!");
    return;
   }
   var worker = new Worker('dbl_chkb_key_combo_worker.js');
   worker.onmessage = function(event) {
   	 str = event.data;
     document.getElementById('output_area').value = str;
   }
   // allow for webkit prefix or its removal
   worker.postMessage = worker.webkitPostMessage || worker.postMessage;
   worker.postMessage( { vk:v_keys, hk:h_keys, kw:kw, ct:ciphertext } );
} // end get_combos

function get_key_letters(){
    var i,j,n,state;
    var str, str2,s;

    var max_letters = 10; // later allow for possibility of 12 for 6x6 checkerboard
   if ( document.getElementById('6x6').checked )
    max_letters = 12
   else
    max_letters = 10;

    var v_letters_found = [];
    var h_letters_found = [];
    var ciphertext = document.getElementById('cipher_area').value
   if (ciphertext == '') {
    alert("No ciphertext entered!");
    return;
   }
   state = 0;
   str = ciphertext.toLowerCase();
    for (i=0;i<26;i++)
        v_letters_found[i] = h_letters_found[i] = 0;
   for (i=0;i<str.length;i++){
	   c = str.charAt(i);
	   if (l_alpha.indexOf(c) != -1) {
         if (state ==0 ) {
            v_letters_found[l_alpha.indexOf(c)] = 1;
            state = 1;
         }
         else {
            h_letters_found[l_alpha.indexOf(c)] = 1;
            state = 0;
         }
       }
	}
    if ( state == 1) {
        alert("Odd number of ciphertext letters!");
        return;
    }
    str = ''; // get unique key letters.
    cnt = 0
    for (i=0;i<26;i++)
        if (v_letters_found[i] == 1){
            cnt++;
            str += l_alpha.charAt(i);
    }
	if (cnt > max_letters) {
		alert("Too many vertical key letters!");
		return;
	}
    str2 = ''; // get unique key letters.
    cnt = 0;
    for (i=0;i<26;i++)
        if (h_letters_found[i] == 1){
            cnt++;
            str2 += l_alpha.charAt(i);
    }    
	if (cnt > max_letters) {
		alert("Too many horizontal key letters!");
		return;
	}
    document.getElementById('word_pattern').value = str.toUpperCase();
    document.getElementById('word_pattern2').value = str2.toUpperCase();
	s = "There are "+str.length+" vertical key letters and "+str2.length+" horizontal key letters"
	document.getElementById('output_area').value = s;

}

onload = function() {
    document.getElementById('search_for_pattern').addEventListener("click",do_search);    
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)}); 
    document.getElementById('search_for_combos').addEventListener("click",get_combos);        
    document.getElementById('search_for_key_letters').addEventListener("click",get_key_letters);            
}    
