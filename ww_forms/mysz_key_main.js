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
	
	//make_trie();
    /*
	n = word_list.length;
	s = "0loaded "+n+" words ";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	document.getElementById('output_area').value = s;	
    */
	//postMessage(s);
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

function get_trial_decrypt(){
        var i,j,index;
        var offset,count,k;
        var inverse_count;
        
		/* for speed, set up inverse key */
        inverse_count = [];
        for (j=0;j<period;j++)
            inverse_key[j] = [];

		for (j=0;j<period;j++) {// highest possible key entry is key_len-1
			inverse_count[j] = 0;
			for (k=0;k<period;k++)
				if ( key[k] == j)
					inverse_key[j][inverse_count[j]++] = k;
		}
        count = 0;
        for (k=0;k< period;k++) {
	        if (inverse_count[k]==0) continue;
			index = offset = 0;
			while ( inverse_key[k][index]+offset < buf_len) {
				plain_text[inverse_key[k][index]+offset] = buffer[count++];
				if ( ++index >= inverse_count[k]){
						index = 0;
						offset += period;
				}
			} /* end while*/
        } /* next k */
}
	
function get_col_trial_decrypt(){
    var i,j,index,col;
    var offset,count,k;

    offset = [];
    for (j=0;j<period;j++)
         offset[ key[j] ] = j;
	index = 0;
	for ( col = 0; col <period;col++)
		for ( pos = offset[col];pos<buf_len; pos = pos + period)
			plain_text[pos] = buffer[index++];

}
    
function get_score(buf_len){
	var score,i,n;

    if (col_flag)
        get_col_trial_decrypt();
    else
        get_trial_decrypt();
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
    if ( document.getElementById('col').checked )
        col_flag = true;
    else
        col_flag = false;
    // buffer loaded by do_check
    //alert("solve");
    initialize_word_list(word_list_string);
    //alert("word list initialized");
    initialize_tet_table();
    max_score = 0;
    for (i=0;i<word_list.length;i++){
        // convert word into musz key with entries in range 0-word length
        period = word_list[i].length;
        if (col_flag){
            indx = 0
            for (j=0;j<26;j++){
                 c = l_alpha.charAt(j);
                for (k=0;k<period;k++){
                    if (word_list[i].charAt(k) == c)
                         key[k] = indx++;
                }
             }

        }
        else {
            indx = -1;
            for (j=0;j<26;j++){
                state = 0; // no letter with index j encountered yet
                c = l_alpha.charAt(j);
                for (k=0;k<period;k++){
                    if (word_list[i].charAt(k) == c){
                        if (state==0){
                            indx++;
                            key[k]=indx;
                            state = 1;
                        }
                        else
                            key[k] = indx;
                    }
                }
            }
        }
        score = get_score(buf_len);
        if (score>max_score){
            max_score = score;
			out_str = '';
			x = score.toFixed(2);
			//out_str += x+'~';
			for (j=0;j<buf_len;j++)
				out_str += l_alpha.charAt(plain_text[j]);
			out_str += "\nscore: "+score.toFixed(2);
            if ( col_flag)
                out_str += '\nColumnar key: '+word_list[i];
            else
                out_str += '\nMyszkowski key: '+word_list[i];
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