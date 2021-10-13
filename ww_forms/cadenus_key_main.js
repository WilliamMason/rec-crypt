var word_list_string = '';
var word_list = [];
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	

var buffer = new Array();
var plain_text = new Array();
var key=[];
var inverse_key = [];
var buf_len;
var period;
var col_flag = false;


function letters_only(str){ // remove everything except letters
	str = str.toLowerCase();
	return str.replace(/[^a-z]/g,'');
}


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


function do_check(){
	var s,s1,n,c,str;

	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
	s = letters_only(s);
	str = s.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	
	if ( (buffer.length%25)!=0){
		alert("Ciphertext length not multiple of 25!");
		return(false)
	}
    
    if (word_list_string =='') {
        alert(" No word list file chosen!");
        return(false);
    }
	return(true);
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

function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	//postMessage("00~tet table initialized");
}	

function cadenus_decrypt(){
    var str,i,j,k,n,s,c,cnt;
    var out_str;
    var key_len,index,offset;
    var target_len,shift,pos;
    

	//codetext = letters_only(codetext);
	//key = letters_only(key);

    // change alphabetic key to numeric key.
    var numeric_key = [];
    for (i=0;i<key.length;i++){
        c = key.charAt(i);
        n = l_alpha.indexOf(c);
        numeric_key[i] = n;
    }

// get offset
    offset = [];
    index = 0;
    for (i=0;i<26;i++)
        for (j=0;j<key.length;j++)
            if (i == numeric_key[j])
                offset[index++] = j;

    // reduce numeric key letters beyound 'V'. 'W' is letter 22
    for (i=0;i<key.length;i++)
        if (numeric_key[i] >= 22) numeric_key[i]--;
    var plain = [];
    index = 0;
    for (j=0;j<25;j++)
        for (i=0;i<offset.length;i++){
            shift= (25-numeric_key[ offset[i] ]+j)%25;
            pos = offset[i]+shift*offset.length;
            plain[pos]=buffer[index++];
        }
	
	return(plain);

}

function get_score(buf_len){
	var score,i,n;

    plain_text =  cadenus_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	


function do_solve(){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;

    
    
    if (do_check() == false){
        return;
    }
	period = Math.floor(buffer.length/25);
    // buffer loaded by do_check

    initialize_word_list(word_list_string);
    //alert("word list initialized");
    initialize_tet_table();
    max_score = 0;
    for (i=0;i<word_list.length;i++){
        
        if(period != word_list[i].length)
			continue;
		key = word_list[i]; // key is global variable
        score = get_score(buf_len);
        if (score>max_score){
            max_score = score;
			out_str = '';
			x = score.toFixed(2);
			//out_str += x+'~';
			for (j=0;j<buf_len;j++)
				out_str += l_alpha.charAt(plain_text[j]);
			out_str += "\nscore: "+score.toFixed(2);
			/*
            if ( col_flag)
                out_str += '\nColumnar key: '+word_list[i];
            else
                out_str += '\nMyszkowski key: '+word_list[i];
			*/
			out_str += '\nCadenus key: '+word_list[i];
			document.getElementById('output_area').value = out_str;	
			//postMessage(out_str);
        }
    } // next i   
    
}


function do_clear(){
	document.getElementById('output_area').value = '';
	document.getElementById('input_area').value = '';
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});         
}    
