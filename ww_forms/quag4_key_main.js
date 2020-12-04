var hworker,hworker2;
var stop_flag = 0;
var best_score;
var word_list_array=[];
var period, start_pos;

// shift prescan stuff
var buffer = [];
var crib = [];
var buf_len, crib_len;

var quag_array, inv_array;
var shift = [];
var rel_shift = []

function setup_cipher(s,s1) {
	var i,j,state,cnt,c, data,n1,n;
    var str,index,c1;
    var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ";    
    var upperC2="ABCDEFGHIJKLMNOPQRSTUVWXYZ-";    
    
    str = s.toUpperCase();
    buf_len = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = upperC.indexOf(c);
        if ( n != -1)
            buffer[buf_len++] = n;
    }
    str = s1.toUpperCase();
    crib_len = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = upperC2.indexOf(c);
        if ( n != -1)
            crib[crib_len++] = n;
    }

}	

function expand_shifts(){ // for shift prescan
    var i,j,k,flag,not_filled;
    
    for (i = 0;i<period-1;i++)
        for ( j = i+1;j<period;j++)
          if (rel_shift[i][j] == 0)
            for (k=0;k<26;k++) {
                if (quag_array[i][k] ==1 && quag_array[j][k] ==1 ){ // two letters in same column, goto same letter
                rel_shift[i][j] = 1;
            }
    }               
    flag = 1;
    while(flag == 1 ){
        flag = 0;
        for (i = 0;i<period-1;i++)
            for ( j = i+1;j<period;j++) {
            if (rel_shift[i][j] == 1 && shift[i] == 1){
                    if (shift[j] == 0) {
                        shift[j] = 1;
                        flag = 1;
                    }
            }
            else if (rel_shift[i][j] == 1 && shift[j] == 1){
                    if (shift[i] == 0) {
                        shift[i] = 1;
                        flag = 1;
                    }
                }
        }
    } // end while
    // any not filled in?
    not_filled = 0;
    for (i=1;i<period;i++)
        if (shift[i] == 0)
            not_filled++;
    return(not_filled);

}    

function check_shifts(start_pos,key_type) {
    var j, count,nb,nc,n,k,i;
    var c,c1,c2,c3,index;
    var fill_total;
    var not_filled;
        
    quag_array = [];
    for (i=0;i<period;i++){
        quag_array[i] = [];
        for (j=0;j<26;j++) {
            quag_array[i][j] = 0;
        }
    }
    index = 0; // arbirary start at index 0 is OK
    for (i=0;i<crib_len;i++){
            if (key_type == 0)
                c = buffer[start_pos+i];
            else
                c = crib[i];            
            quag_array[index][c] = 1;
            index = (index+1)% period;
    }
    shift = []; // global
    shift[0] = 1; // you can fill in one shift artitrarily.
    for (i=1;i<period;i++)
        shift[i] = 0;
    rel_shift = [] // global

    for (i=0;i<period-1;i++){
        rel_shift[i] = [];
        for (j=i+1;j<period;j++)
            rel_shift[i][j] = 0;
    }
    not_filled = expand_shifts();
    
return(not_filled); /* OK */
} /* end check text */
 
function do_search(){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var s,str,s1;
    var op_choice,buf;
    var plain_key_flag;
    var not_filled;
    var max_trials;
    
    if (stop_flag == 1) {
        initialize_workers();
        stop_flag = 0;
    }
    best_score = -10000;
        
    s = document.getElementById('ciphertext').value;
    if ( s == ''){
        alert("No cipertext entered");
        return;
    }
    s1 = document.getElementById('crib_area').value;
    if ( s1 == ''){
        alert("No crib entered");
        return;
    }
    period = parseInt(document.getElementById('period').value);
    if (isNaN(period) || period <=0){
        alert("Period must be a positive number");
        return;
    }
    start_pos = parseInt(document.getElementById('start_pos').value);
    if (isNaN(start_pos) || start_pos < 0){
        alert("No crib start position entered.");
        return;
    }
    setup_cipher(s,s1); // set up for shift array prescan
    if (document.getElementById('plain_key').checked) {
        not_filled = check_shifts(start_pos,0);
        if ( not_filled > 0) {
            document.getElementById('output_area').value = "Crib not long enough to fix plain key shifts";
            return;
        }
    }    
    else {
        not_filled = check_shifts(start_pos,1);
        if ( not_filled > 0) {
            document.getElementById('output_area').value = "Crib not long enough to fix code key shifts";
            return;
        }
    }    
    max_trials = document.getElementById('max_trials').value;
    if (document.getElementById('plain_key').checked)
        plain_key_flag = 1;
    else if (document.getElementById('code_key_ic').checked)
        plain_key_flag = 0; // IC+DIC scoring
    else
        plain_key_flag = 2; // hill-climbing
    if (document.getElementById('custom_list').checked != true) {
        str = '';
        str += period+'@1@'; // search first half
        str += plain_key_flag+'@';
        str += start_pos+'@';
        str += max_trials+'@';
        str += s1+'@';
        str += s;
        hworker.postMessage({op_choice:0, str:str});
        document.getElementById('status').value = 'working';
        str = '';
        str += period+'@2@'; // search second half
        str += plain_key_flag+'@';        
        str += start_pos+'@';
        str += max_trials+'@';
        str += s1+'@';        
        str += s;
        hworker2.postMessage({op_choice:0, str:str});
        document.getElementById('status2').value = 'working';
    }
    else { // different word lists already loaded
        if ( word_list_array.length==0){
            alert("Must Choose word list file!");
            return;
        }
        str = '';
        str += period+'@3@'; // search all
        str += plain_key_flag+'@';        
        str += start_pos+'@';
        str += max_trials+'@';
        str += s1+'@';        
        str += s;
        hworker.postMessage({op_choice:2, str:str});
        document.getElementById('status').value = 'working';
        str = '';
        str += period+'@3@'; // search all
        str += plain_key_flag+'@';        
        str += start_pos+'@';
        str += max_trials+'@';
        str += s1+'@';        
        str += s;
        hworker2.postMessage({op_choice:2, str:str});
        document.getElementById('status2').value = 'working';
    }

}

function stop_search(){
    hworker.terminate();
    document.getElementById('status').value = 'stopped';
    hworker2.terminate();
    document.getElementById('status2').value = 'stopped';
    
    stop_flag = 1;
}

function initialize_workers(){
    var str;
    var s,score;
    var op_choice,word_break;
    
   hworker = new Worker('quag4_key_worker.js');
   hworker.onmessage = function (event) {
    str = event.data;
    if (str == '@')
        document.getElementById('status').value = 'done';
    else {
        s = str.split('^');
        score = parseFloat(s[0]);
        document.getElementById('status').value = score;        
        if ( score> best_score) {
            best_score = score;
            document.getElementById('output_area').value = s[1];

        }
    }
   }
   // allow for webkit prefix or its removal
   hworker.postMessage = hworker.webkitPostMessage || hworker.postMessage;
   
   hworker2 = new Worker('quag4_key_worker.js');
   hworker2.onmessage = function (event) {
    str = event.data;
    if (str == '@')
        document.getElementById('status2').value = 'done';
    else {
        s = str.split('^');
        score = parseFloat(s[0]);
        document.getElementById('status2').value = score;        
        if ( score> best_score) {
            best_score = score;
            document.getElementById('output_area').value = s[1];

        }
    }
   }
   // allow for webkit prefix or its removal
   hworker2.postMessage = hworker2.webkitPostMessage || hworker2.postMessage;
   
   if (document.getElementById('custom_list').checked == true) {
        // get word break nearest middle of file   
        word_break = Math.floor(word_list_array.length/2);
        while (word_list_array[word_break] != 32  && word_list_array[word_break] != 13 && word_list_array[word_break] != 10 && word_break>0) word_break--; // 32 is ascii code for blank, 13, 10 new lines
        var buf = new ArrayBuffer(word_break+1);
        var bufView = new Uint8Array(buf);
        // first half of file
        for (i=0;i<=word_break;i++)
            bufView[i] = word_list_array[i];
        //hworker.webkitPostMessage( {op_choice:1, buf:buf},[buf]);
        hworker.postMessage( {op_choice:1, buf:buf},[buf]);
        // second half of file
        buf = new ArrayBuffer(word_list_array.length-word_break);
        bufView = new Uint8Array(buf);
        // second half of file
        for (i=word_break+1;i<word_list_array.length;i++)
            bufView[i-(word_break+1)] = word_list_array[i]
        //hworker2.webkitPostMessage( {op_choice:1, buf:buf},[buf]);
        hworker2.postMessage( {op_choice:1, buf:buf},[buf]);
   }

}

function set_reload(){
    stop_flag = 1; // signal to reinitialize
}    

function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
	getAsArray(fname);
    stop_flag = 1; // force reload of workers
	
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

onload=function(){
    document.getElementById('do_search').addEventListener("click",do_search); 
    document.getElementById('stop_search').addEventListener("click",stop_search);   
    document.getElementById('custom_list').addEventListener("change", set_reload); 
    document.getElementById('input').addEventListener("change", function(){handleFiles(this.files)});         
    
    initialize_workers();
}
    