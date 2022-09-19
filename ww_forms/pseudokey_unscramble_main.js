var word_list_string = '';
var word_list = [];
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	

var buffer = new Array();
var plain_text = new Array();
//var key=[];
var inverse_key = [];
var buf_len;
var key;

function letters_only(str){ // remove everthing except letters
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
		alert("No pseudokey entered");
		return(false)
	}
	key = letters_only(s);
	if (key.length != 10){
		alert("pseudokey does not have 10 letters.")
		return(false);
    }
    if (word_list_string =='') {
        alert(" No word file chosen!");
        return(false);
    }
	return(true);
}

function initialize_word_list(str){
	var s,n;
    var state,i,c,index,j;
	var used_let, flag;
    
    // construct word list of 5 letter words with no repeats
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
				if (s.length == 5){
					used_let = {};
					flag = true
					for (j=0;j<5;j++){
						if (s.charAt(j) in used_let){ // word has repeated letter
							flag = false;
							break;
						}
						used_let[s.charAt(j)] = 1;
					}
					if (flag)
						word_list[index++] = s;
				}
                state = 0;
            }
        }
    }
    if (state == 1) {// last word
			if (s.length == 5){
				used_let = {};
				flag = true
				for (j=0;j<5;j++){
					if (s.charAt(j) in used_let){ // word has repeated letter
						flag = false;
						break;
					}
					used_let[s.charAt(j)] = 1;
				}
				if (flag)
					word_list[index++] = s;
			}
	}

	
}


function do_solve(){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
	var wrd,i,j,word_pos,c,n,idx;	

    
    
    if (do_check() == false){
        return;
    }
    // buffer loaded by do_check
    //alert("solve");
    initialize_word_list(word_list_string);
    //alert("word list initialized");
    ///initialize_tet_table();
out_str = '';
for (i=0;i<word_list.length;i++){
	wrd = word_list[i];
	alt_word = ''; // construct the alternate key word
	for ( word_pos = 0; word_pos < wrd.length;word_pos++){
		c = wrd.charAt(word_pos);
		idx = key.indexOf(c);
		if (idx == -1) // word letter not in the key, if there are fewer than 10 letters in vert or hor key, may have to redo this step.
			break; 
		if (idx < 5) {
			alt_word += key.charAt(idx+5)
		}
		else // idx >= 5
			alt_word += key.charAt(idx-5);
	}
	if (idx == -1) continue; // go to next word in word list
	n = word_list.indexOf(alt_word);
	if ( n != -1){ // found two key words that unscramble the key
		out_str += 'found: '+wrd+', '+alt_word+'\n';
	}
}	 // next word 
document.getElementById('output_area').value = out_str;

}


function do_clear(){
	document.getElementById('output_area').value = '';
	document.getElementById('input_area').value = '';
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});         
}    
