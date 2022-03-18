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
var custom_tet_table_string='';

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
  reader.onerror = errorHandler;
  
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
  custom_tet_table_string = fileString;
  //alert("file loaded");
  //make_table(custom_tet_table_string);

  
}

function letters_only(str){ // remove everthing except letters
	str = str.toLowerCase();
	return str.replace(/[^a-z]/g,'');
}


function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var weighted_tet_sum, unweighted_tet_sum;    
    
    //s = "0making table from sring of length "+str.length;
    //postMessage(s);
    str = str.toUpperCase();
    // initialize tet table
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = 0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n == -1) continue; //not a letter
        if (state == 0) {
            n1 = n;
            c1 = c;
        }
        else if (state == 1) {
            n2 = n;
            c2 = c;
        }
        else if (state == 2) {
            n3 = n;
            c3 = c;
        }
        else {
            //x = n+26*n3+26*26*n2+26*26*26*n1;
            x = n1+26*n2+26*26*n3+26*26*26*n;
            tet_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet_table[x] > max_v) {
                max_v = tet_table[x];
                mc1 = c1;
                mc2 = c2;
                mc3 = c3;
                mc4 = c;
            }
            max_n++;
            c1 = c2;
            c2 = c3;
            c3 = c;
        }
        state++;
    }    
    //s = '0there were '+max_n+' tetragraphs with greatest value of '+max_v;
    //s += ' for tet: '+mc1+mc2+mc3+mc4;
    weighted_tet_sum = 0;
    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
        n = tet_table[i];
        tet_table[i] = Math.log(1+tet_table[i]);
        weighted_tet_sum += n*tet_table[i];
        unweighted_tet_sum += tet_table[i];            
    }

    // global variables for this tet table
    //random_score = 100*unweighted_tet_sum / (26*26*26*26);
    //std_eng_score = 100*weighted_tet_sum / max_n;
    
    //postMessage(s);    
}    


function do_check(){
	var s,s1,n,c,str;

	s = document.getElementById('input_area').value;
	if (s == ''){
		alert("No text entered");
		return(false)
	}
	str = s.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    
    if (word_list_string =='') {
        alert(" No word/phrase file chosen!");
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


function nicodemus_decrypt(key){
    var str,i,j,k,n,s,c,cnt;
    var out_str;
    var key_len,index,offset;
    // change alphabetic key to numeric  tramp key.
	//codetext = letters_only(codetext);
	key = letters_only(key);
    var numeric_key = [];
    n = 0;
    for (i=0;i<26;i++){
        for (j=0;j<key.length;j++)
            if (key.charAt(j) == l_alpha.charAt(i) ) // use lower case key letteres
                numeric_key[j] = n++;
    }
// get tramp offset
    offset = [];
    for (i=0;i<numeric_key.length;i++)
        offset[ numeric_key[i] ] = i;
    // get numeric vigenere key
    var  vig_key = [];
    for (i=0;i<key.length;i++)
        vig_key[i] = l_alpha.indexOf(key[i] );
        
	var code = buffer; // buffer is global variable, ciphertext already converted to numbers in do_check
    var start_pos = 0;
    var limit = key.length*5;
	cnt = 0;
    var plain = [];
    while (start_pos< code.length){
        if (start_pos+limit > code.length)
            limit = code.length - start_pos;
        for (index = 0;index<key.length; index++){
            for (i= start_pos;i<start_pos+limit;i++){
                if ( (i%key.length) == offset[index] )
                    plain[i]=( (26+code[cnt++] - vig_key[ offset[index] ] ) % 26 );                
            }
        }
        start_pos += limit;
    }
    return(plain )

}
	
function get_score(buf_len){
	var score,i,n;

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
    // buffer loaded by do_check
    //alert("solve");
    initialize_word_list(word_list_string);
    //alert("word list initialized");
	if ( document.getElementById('custom_table').checked){
		if ( custom_tet_table_string == ''){
			alert("no custom tet table book loaded");
			return;
		}
		make_table(custom_tet_table_string);
		
	}
	else
		initialize_tet_table();
    max_score = 0;
    for (i=0;i<word_list.length;i++){
		
		plain_text = nicodemus_decrypt(word_list[i]);
        score = get_score(buf_len);
        if (score>max_score){
            max_score = score;
			out_str = '';
			x = score.toFixed(2);
			//out_str += x+'~';
			for (j=0;j<buf_len;j++)
				out_str += l_alpha.charAt(plain_text[j]);
			out_str += "\nscore: "+score.toFixed(2);

                out_str += '\nNicodemus key: '+word_list[i];
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
    document.getElementById('input2').addEventListener("change", function(){handleFiles2(this.files)});             	
}    
