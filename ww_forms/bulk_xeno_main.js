var ciphers = new Array();
var cipher_id = new Array();
var keys = new Array();
var numb_ciphers;
var working_on_numb;
var empty_key='--------------------------';

var code = "EMPTY"
var lowerC="abcdefghijklmnopqrstuvwxyz"
var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
//substate values 0 =no choice,1 = cipher letter chosen, 2 = plain letter chosen, 3 = both letters chosen (use just 1 and 2?)
var substate=0, pchoice=0,cchoice=0
var key_array = '--------------------------';
var puzzle_selected=0,hidden_plaintext='',hidden_key = ''
var keyed_alphabet = '', solving_flag = 0;
var line_len = 80;
var display_directions_flag=0;
var display_letter_count_flag = 0;
var l_count = new Array(26),s_count = new Array(26)

var columns_selected = new Array();
var inverse_key = new Array();
var alt_key_flag = 0;
var col_order = new Array();
var fire_fox=!document.all;
var stored_col_orders = new Array(); // store as strings of upper case letters

var show_sols_flag=0;

//web worker stuff
var hclimber, hclimber2, hclimber3;
var stop_flag = 0;
var current_channel = 0;
var max_score = -10000.0;
var cipher_type = 0;

// k3 key stuff
var k3_buffer = new Array();
var k3_swap_array = new Array();
var missing_letters = new Array();
var temp_k3_buffer = new Array();
var shifts = [1,3,5,7,9,11,15,17,19,21,23,25];
var best_overall_score;
var numb_26chains,numb_13chains, numb_slidable;

var best_key = new Array();
var chain = new Array();
var chain2 = new Array();
var slide_k3_buffer = new Array();
var missing_pos = new Array();

var numb_missing,k3_buf_len;

var numb_workers=3;

// file API stuff
var book_string = '';
var word_list_string = '';
var book_type = true;

// for use with cipher sheets app
var WORK_START = '{~\n'; // added \n at end
var WORK_END = '~}\n'; // added \n at end

function handleFiles(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
	//alert(str);
    book_type = true;
	getAsText(fname);
	
}

function handleFiles2(obj){
	var str, fname;
	fname = obj[0];
	str = "handle list file: "+fname.fileName;
	//alert(str);
    book_type = false;
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
  if (book_type) book_string = fileString;
  else word_list_string = fileString;
  stop_flag = 1; // restart with the new files
  
}

function errorHandler(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}


function next_perm(L) { // L is the length of the missing and k3_swap_arrays
	var n,pos;
	var c;

	for ( n=1; n<L;n++) {
		if (k3_swap_array[n] < n) {
			if ( n&1 ) pos = k3_swap_array[n];
			else pos = 0;
			c = missing_letters[pos];
			missing_letters[pos] = missing_letters[n];
			missing_letters[n] = c;
			k3_swap_array[n]++;
			return( 1);
		}
		k3_swap_array[n] = 0;
	}
	return( 0);
} /* end next_perm*/

function score_key() { // uses fact that slidable alphabet in temp_k3_buffer starts with A, so no wrap around
	var i;
	var score,best_score;

	score = best_score = 0;
	for (i=0;i<25;i++) {
		if ( temp_k3_buffer[i] < temp_k3_buffer[i+1] ) score++;
		else {
			if (score > best_score)
				best_score = score;
			score = 0;
		}
	} /* next i */
	if (score > best_score) // check ascending final run!
		best_score = score;	
	return (best_score+1);
} /* end score_key */

function decimate_key() { // decimate key in slide k3_buffer, put decimations in temp_k3_buffer
	var i,n,j,index,score;

	for (i = 0; i<12; i++) {
		n = shifts[i];
		index = 0;
		for (j = 0; j < 26*n; j=j+n)
			temp_k3_buffer[index++] = slide_k3_buffer[ j % 26 ];
		score = score_key();
		numb_slidable++;
		if (score >= best_overall_score) {
			best_overall_score = score;
			for (j=0;j<26;j++){
				best_key[j] = temp_k3_buffer[j];
				//printf ("%c",temp_k3_buffer[j]+'A');
			}
			//printf(" score %i \n",score);
		}
	}
} /* end decimate_key */

function score_next_key() {
	var i,j,n,flag,index;
	var nxt;

	for (i=0;i<numb_missing;i++)// insert missing letters in the current permutation order
		k3_buffer[ missing_pos[i] ] = missing_letters[i];
	chain[0] = 0;
	nxt = k3_buffer[0];
	n = 1;
	while( nxt != 0 ) {
		chain[n++] = nxt;
		nxt = k3_buffer[nxt];
	}
	if (n != 26 && n != 13) return;
	if ( n==26) {
		for (i=0;i<26;i++)
			slide_k3_buffer[i] = chain[i];
		numb_26chains++;
		decimate_key();
		return;
	}
	/* must construct second chain */
	for (i=0;i<26;i++)  {
		flag = 1;
		for (j=0;j<13;j++)
			if (chain[j] == i) {
				flag = 0;
				break;
		}
		if (flag) break;
	}
	chain2[0] = i;
	nxt = k3_buffer[i];
	n = 1;
	while ( nxt != i) {
		chain2[n++] = nxt;
		nxt = k3_buffer[nxt];
	}
	if (n != 13) return;
	numb_13chains++;
	for (n=0;n<13;n++) {
		for (j=index =0;j<26;index++,j= j+2) {
			slide_k3_buffer[j] = chain[index];
			slide_k3_buffer[j+1] = chain2[ (index+n)%13 ];
		}
		decimate_key();
	}
} /* end score_next_key */

function get_k3_key(){
	var str, alpha,out_str,c,n,i,flag,x,y,k;
	var do_copy;
	
	best_overall_score = numb_26chains = numb_13chains=numb_slidable=0;	
	alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	//str = document.getElementById('input_area').value;
	//str = str.toUpperCase();
	str = key_array;
	k3_buf_len = 0;
	numb_missing = 0;
	for (var i=0;i<str.length;i++){
		c = str.charAt(i);
		if (c=='-') {
			missing_pos[numb_missing++] = k3_buf_len;
			k3_buffer[k3_buf_len++] = -1;
			continue;
		}
		n = alpha.indexOf(c);
		if ( n>=0)
                k3_buffer[k3_buf_len++] = n;		
	}
	/* get missing letters */
	n=0;
	for (i=0;i<26;i++) {
		flag = 1;
		for (j=0;j<26;j++)
			if (k3_buffer[j] == i ) {
				flag = 0;
				break;
		}
		if (flag) missing_letters[n++] = i;
	}
	if ( n != numb_missing) {
		alert("Program bug! can't find missing letters!\n");
		return;
	}
	if ( numb_missing >8){
		alert("More then 8 missing cipher letters");
		return;
	}
	for( i=0;i<numb_missing;i++)
		k3_swap_array[i] = 0;
	score_next_key();
	while ( next_perm(numb_missing)) {
		score_next_key();
	}
	if (best_overall_score == 0){
		alert("No slidable alphabet. (either not K3, or shifted by 13)");
		return;
	}
	out_str="";		
	out_str += "Done, best score "+best_overall_score+"\n";
	for (i=0;i<26;i++)
		out_str+= alpha[ best_key[i] ];
	out_str+="\n";
	out_str += "transfer to alternate key?";
	do_copy = confirm(out_str)
	if ( do_copy == true) {
		for (i=0;i<26;i++)
	 		col_order[i] = best_key[i];
		display_keyblock(0);
	}
} // end get_k3_key


function web_worker_initialize(){
	//var str,i,score,s;

   if ( book_string==''){
        alert("Choose book file.");
        return;
   }
   if ( word_list_string==''){
        alert("Must Choose word list file!");
        return;
   }
   hclimber = new Worker('hill_climb_xeno.js');
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
   // insert tet tables and word list
   str = '#'; // prefix to indicate string to make table from
   str += book_string;
   hclimber.postMessage(str);  	   
   str = '^'; // prefix to indicate string to make trie from
   str += word_list_string;
   hclimber.postMessage(str);  	
   if (numb_workers>1){
   		hclimber2 = new Worker('hill_climb_xeno.js');
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
        // insert tet tables and word list
        str = '#'; // prefix to indicate string to make table from
        str += book_string;
        hclimber2.postMessage(str);  	   
        str = '^'; // prefix to indicate string to make trie from
        str += word_list_string;
        hclimber2.postMessage(str);  	
        
   }
   if (numb_workers>2){
   		hclimber3 = new Worker('hill_climb_xeno.js');
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
        // insert tet tables and word list
        str = '#'; // prefix to indicate string to make table from
        str += book_string;
        hclimber3.postMessage(str);  	   
        str = '^'; // prefix to indicate string to make trie from
        str += word_list_string;
        hclimber3.postMessage(str);  	
   }

  
}

function get_cipher_type() {
	
	if ( cipher_id[working_on_numb].slice(0,3) == 'X-8')
		cipher_type = 1;
	else cipher_type = 0;
}


function do_calc(){
	var s,str,n,change_flag;
	
	if (solving_flag ==0){
		//code = document.puzzle.ciphertext.value
		code = ciphers[working_on_numb];		
		code = code.toUpperCase()
	}
   change_flag = 0;	
   if(document.getElementById('xww1').checked) {
	   if (numb_workers != 1) change_flag = 1;
		numb_workers=1;
	}
	else if(document.getElementById('xww2').checked) {
	   if (numb_workers != 2) change_flag = 1;		
		numb_workers=2;
	}
	else {
	   if (numb_workers != 3) change_flag = 1;		
		numb_workers = 3;
   }
	if (stop_flag == 1 || change_flag == 1){
		web_worker_initialize();
		stop_flag = 0;
	}
	get_cipher_type();	
	max_score = -10000.0;
	max_trials = parseInt(document.getElementById('numb_trials').value);	
	str = '@'+max_trials;
	//ff = parseFloat(document.settings.fudgefactor.value);	
	s = document.getElementById('fudgefactor').value;
	str += ':'+s; // use colons to separate values
    s = document.getElementById('log_weight').value;
	str += ':'+s; // use colons to separate values    
	// use different random number seeds for different web workers
	n = Math.floor( Math.random()*1000);
	s = str+':'+n;
	hclimber.postMessage(s); 
	n = Math.floor( Math.random()*2000);
	s = str+':'+n;
	if (numb_workers>1) hclimber2.postMessage(s); 
	n = Math.floor( Math.random()*3000);
	s = str+':'+n;
	if (numb_workers>2) hclimber3.postMessage(s); 
	if (document.getElementById('word_scoring').checked == true)
		s = '1';
	else s = '0';
	str = '~'+cipher_type+s+key_array;
	hclimber.postMessage(str);  
	hclimber.postMessage(code);  
	if (numb_workers>1){
		hclimber2.postMessage(str);  		
		hclimber2.postMessage(code);  
	}
	if (numb_workers>2) {
		hclimber3.postMessage(str);  		
		hclimber3.postMessage(code);  
	}
	
}

function do_stop(){
	var str;
	
	hclimber.terminate();
	if (numb_workers>1) hclimber2.terminate();
	if (numb_workers>2) hclimber3.terminate();	
	document.getElementById('status').value = "Stopped";
	if (numb_workers>1) document.getElementById('status2').value = "Stopped";
	if (numb_workers>2) document.getElementById('status3').value = "Stopped";
	stop_flag = 1;
}
	

// remove multiple, leading or trailing spaces
function trim(s) {
	s = s.replace(/(^\s*)|(\s*$)/gi,"");
	s = s.replace(/[ ]{2,}/gi," ");
	s = s.replace(/\n /,"\n");
	return s;
}


function id_display(){
	var s;

	s = '<font color="green"><b>Cipher ID:</font> '+cipher_id[working_on_numb]+'</b>';
	s+='	&nbsp &nbsp &nbsp &nbsp  ';

	s += '&nbsp &nbsp &nbsp <INPUT id="previous_cipher2" type=button value="Previous Cipher" >';
	s += '&nbsp &nbsp &nbsp <INPUT id="next_cipher2" type=button value="Next Cipher" >';
	s += '&nbsp &nbsp &nbsp <INPUT id="locate_cipher2" type=button value="Skip to ..." >';
	document.getElementById('directions').innerHTML=s;
    document.getElementById('previous_cipher2').addEventListener("click",previous_cipher);        
    document.getElementById('next_cipher2').addEventListener("click",next_cipher);   
    document.getElementById('locate_cipher2').addEventListener("click",locate_cipher);       
}

function initialize(b_value){
	var str,out_str,c,n,lines,i,flag,s,con;
	var start_id="X-1";
	var stop_id = "X-8";
	
	numb_ciphers = 0;
	
	
	str = document.getElementById('ciphertext').value;
	str = str.toUpperCase();
	if (b_value==1)
		str = 'X-1\n'+str+'X-8\n(No pats in this batch)\nX-9\n';
	else if (b_value==2)
		str = 'X-1\n(Click on Next Cipher button)\nX-8\n'+str+'X-9\n';
		
	// split into single lines
	lines = str.split(/[\n\r]/g)
	flag=0;
	con = '';
	//Aristocrats
	for (i=0;i<lines.length;i++){
		s = trim(lines[i]);
		if ( s.slice(0,3) == stop_id){
			if(flag==1) {
				ciphers[numb_ciphers++]=con;
				con = '';
			}
			break;
		}
		else if (s.slice(0,2) == start_id.slice(0,2)){
			if(flag==1) {
				ciphers[numb_ciphers++]=con;				
				con = '';
			}
			// don't save anything in the header after the first period (& don't save period itself)
			n = s.indexOf('.');
			if ( n != -1)
				s = s.slice(0,n);												
			cipher_id[numb_ciphers] = s;
			keys[numb_ciphers]=empty_key;
			stored_col_orders[numb_ciphers]=upperC;
			flag = 1;
		}
		else if (flag==1)
			con += s+"\n";
	}
	//Patristocrats
	start_id = stop_id;
	stop_id = "X-9";
	flag=0;
	for (i=i;i<lines.length;i++){
		s = lines[i].replace(/ /g,"");
		if ( s.slice(0,3) == stop_id){
			if(flag==1) {
				ciphers[numb_ciphers++]=con;
			}
			break;
		}
		else if (s.slice(0,2) == start_id.slice(0,2)){
			if(flag==1) {
				ciphers[numb_ciphers++]=con;				
				con = '';
			}
			// don't save anything in the header after the first period
			n = s.indexOf('.');
			if ( n != -1)
				s = s.slice(0,n);												
			cipher_id[numb_ciphers] = s;
			keys[numb_ciphers]=empty_key;
			stored_col_orders[numb_ciphers]=upperC;			
			flag = 1;
		}
		else if (flag==1)
			con += s+"\n";
	}
	if(document.getElementById('ww1').checked) {
		numb_workers=1;
		document.getElementById('xww1').checked = true;
	}
	else if(document.getElementById('ww2').checked) {
		numb_workers=2;
		document.getElementById('xww2').checked = true;
	}
	else {
		numb_workers = 3;
		document.getElementById('xww3').checked = true;
	}
	initialize_display();
	for (i=0;i<26;i++){
		c = stored_col_orders[working_on_numb].charAt(i);
		col_order[i] = upperC.indexOf(c);
	}
	id_display();
	xlate(2);
}


function initialize_display(){
	var s,i,c;
	
	working_on_numb = 0;
	s='';
	s += '<INPUT id="start_over3" type=button value="Start over" > ';
	s+='	&nbsp    ';
	s+='<INPUT id="letter_count3" type=button value="Display/hide letter count" > ';
	s+='&nbsp ';
	s+='<INPUT id="toggle_keyblock3" type=button value="Display/hide alternate key" > ';
	s+='&nbsp &nbsp &nbsp &nbsp  ';
	
	s+='<INPUT id="save_to_disk3" type=button value="save work" >';
	s+='<INPUT id="get_from_disk3" type=button value="retrieve saved work" >';
	s+='<INPUT id="clear_disk3" type=button value="clear saved work" >';
	s+='&nbsp; &nbsp;&nbsp;';	
	s+='<INPUT id="output_solutions3" type=button value="output/hide solutions" >';
	s += ' (<input type="checkbox" id="sheet_delimiters"> Cipher sheets delimiters in output)';	
	document.getElementById('button_actions').innerHTML=s;	
    document.getElementById('start_over3').addEventListener("click",start_over);   
    document.getElementById('letter_count3').addEventListener("click",letter_count);   
    document.getElementById('toggle_keyblock3').addEventListener("click",toggle_keyblock);   
    document.getElementById('save_to_disk3').addEventListener("click",save_to_disk);   
    document.getElementById('get_from_disk3').addEventListener("click",get_from_disk);   
    document.getElementById('clear_disk3').addEventListener("click",clear_disk);   
    document.getElementById('output_solutions3').addEventListener("click",output_solutions);   
	//id_display();
	//solving_flag=1;
	s="Key: ";
    s += '<span style="float:right; margin-right:50px;">';
    s+='Book file: <input type="file" id="input" >';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
    s += '<input type="file" id="input2" ></span><br>';
    
	document.getElementById('key_caption').innerHTML=s;
	document.getElementById('keySpace').style.border = "1px ridge black;";
    document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
    document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
    s='&nbsp &nbsp &nbsp &nbsp;&nbsp; Cipher letter: <font size="2"> ';
    s += '<input value="A" style="width: 25px;" type="button" id="b0"> <input value="B" style="width: 25px;" type="button" id="b1"> <input value="C" style="width: 25px;" type="button" id="b2"> <input value="D" style="width: 25px;" type="button" id="b3"> <input value="E" style="width: 25px;" type="button" id="b4"> <input value="F" style="width: 25px;" type="button" id="b5"> <input value="G" style="width: 25px;" type="button" id="b6"> <input value="H" style="width: 25px;" type="button" id="b7"> <input value="I" style="width: 25px;" type="button" id="b8"> <input value="J" style="width: 25px;" type="button" id="b9"> <input value="K" style="width: 25px;" type="button" id="b10"> <input value="L" style="width: 25px;" type="button" id="b11"> <input value="M" style="width: 25px;" type="button" id="b12"> <input value="N" style="width: 25px;" type="button" id="b13"> <input value="O" style="width: 25px;" type="button" id="b14"> <input value="P" style="width: 25px;" type="button" id="b15"> <input value="Q" style="width: 25px;" type="button" id="b16"> <input value="R" style="width: 25px;" type="button" id="b17"> <input value="S" style="width: 25px;" type="button" id="b18"> <input value="T" style="width: 25px;" type="button" id="b19"> <input value="U" style="width: 25px;" type="button" id="b20"> <input value="V" style="width: 25px;" type="button" id="b21"> <input value="W" style="width: 25px;" type="button" id="b22"> <input value="X" style="width: 25px;" type="button" id="b23"> <input value="Y" style="width: 25px;" type="button" id="b24"> <input value="Z" style="width: 25px;" type="button" id="b25"> </font> <br>';

   s += '<br>Goes to plain letter: <font size="2"> ';
   s += '<input id="p0" value="a" style="width: 25px;" type="button"> <input id="p1" value="b" style="width: 25px;" type="button"> <input id="p2" value="c" style="width: 25px;" type="button"> <input id="p3" value="d" style="width: 25px;" type="button"> <input id="p4" value="e" style="width: 25px;" type="button"> <input id="p5" value="f" style="width: 25px;" type="button"> <input id="p6" value="g" style="width: 25px;" type="button"> <input id="p7" value="h" style="width: 25px;" type="button"> <input id="p8" value="i" style="width: 25px;" type="button"> <input id="p9" value="j" style="width: 25px;" type="button"> <input id="p10" value="k" style="width: 25px;" type="button"> <input id="p11" value="l" style="width: 25px;" type="button"> <input id="p12" value="m" style="width: 25px;" type="button"> <input id="p13" value="n" style="width: 25px;" type="button"> <input id="p14" value="o" style="width: 25px;" type="button"> <input id="p15" value="p" style="width: 25px;" type="button"> <input id="p16" value="q" style="width: 25px;" type="button"> <input id="p17" value="r" style="width: 25px;" type="button"> <input id="p18" value="s" style="width: 25px;" type="button"> <input id="p19" value="t" style="width: 25px;" type="button"> <input id="p20" value="u" style="width: 25px;" type="button"> <input id="p21" value="v" style="width: 25px;" type="button"> <input id="p22" value="w" style="width: 25px;" type="button"> <input id="p23" value="x" style="width: 25px;" type="button"> <input id="p24" value="y" style="width: 25px;" type="button"> <input id="p25" value="z" style="width: 25px;" type="button"> <input id="p26" value="-" name="ebutton" type="button"> </font> <br>';
    
	document.getElementById('selection_buttons').innerHTML=s;
	document.getElementById('selection_buttons').style.background = "yellow";	
    document.getElementById('b0').addEventListener("click",function(){cletter_click(0)});    
    document.getElementById('b1').addEventListener("click",function(){cletter_click(1)});    
    document.getElementById('b2').addEventListener("click",function(){cletter_click(2)});    
    document.getElementById('b3').addEventListener("click",function(){cletter_click(3)});    
    document.getElementById('b4').addEventListener("click",function(){cletter_click(4)});    
    document.getElementById('b5').addEventListener("click",function(){cletter_click(5)});    
    document.getElementById('b6').addEventListener("click",function(){cletter_click(6)});    
    document.getElementById('b7').addEventListener("click",function(){cletter_click(7)});    
    document.getElementById('b8').addEventListener("click",function(){cletter_click(8)});    
    document.getElementById('b9').addEventListener("click",function(){cletter_click(9)});    
    document.getElementById('b10').addEventListener("click",function(){cletter_click(10)});    
    document.getElementById('b11').addEventListener("click",function(){cletter_click(11)});    
    document.getElementById('b12').addEventListener("click",function(){cletter_click(12)});    
    document.getElementById('b13').addEventListener("click",function(){cletter_click(13)});    
    document.getElementById('b14').addEventListener("click",function(){cletter_click(14)});    
    document.getElementById('b15').addEventListener("click",function(){cletter_click(15)});    
    document.getElementById('b16').addEventListener("click",function(){cletter_click(16)});    
    document.getElementById('b17').addEventListener("click",function(){cletter_click(17)});    
    document.getElementById('b18').addEventListener("click",function(){cletter_click(18)});    
    document.getElementById('b19').addEventListener("click",function(){cletter_click(19)});    
    document.getElementById('b20').addEventListener("click",function(){cletter_click(20)});    
    document.getElementById('b21').addEventListener("click",function(){cletter_click(21)});    
    document.getElementById('b22').addEventListener("click",function(){cletter_click(22)});    
    document.getElementById('b23').addEventListener("click",function(){cletter_click(23)});    
    document.getElementById('b24').addEventListener("click",function(){cletter_click(24)});    
    document.getElementById('b25').addEventListener("click",function(){cletter_click(25)});    
    
    document.getElementById('p0').addEventListener("click",function(){pletter_click(0)});    
    document.getElementById('p1').addEventListener("click",function(){pletter_click(1)});    
    document.getElementById('p2').addEventListener("click",function(){pletter_click(2)});    
    document.getElementById('p3').addEventListener("click",function(){pletter_click(3)});    
    document.getElementById('p4').addEventListener("click",function(){pletter_click(4)});    
    document.getElementById('p5').addEventListener("click",function(){pletter_click(5)});    
    document.getElementById('p6').addEventListener("click",function(){pletter_click(6)});    
    document.getElementById('p7').addEventListener("click",function(){pletter_click(7)});    
    document.getElementById('p8').addEventListener("click",function(){pletter_click(8)});    
    document.getElementById('p9').addEventListener("click",function(){pletter_click(9)});    
    document.getElementById('p10').addEventListener("click",function(){pletter_click(10)});    
    document.getElementById('p11').addEventListener("click",function(){pletter_click(11)});    
    document.getElementById('p12').addEventListener("click",function(){pletter_click(12)});    
    document.getElementById('p13').addEventListener("click",function(){pletter_click(13)});    
    document.getElementById('p14').addEventListener("click",function(){pletter_click(14)});    
    document.getElementById('p15').addEventListener("click",function(){pletter_click(15)});    
    document.getElementById('p16').addEventListener("click",function(){pletter_click(16)});    
    document.getElementById('p17').addEventListener("click",function(){pletter_click(17)});    
    document.getElementById('p18').addEventListener("click",function(){pletter_click(18)});    
    document.getElementById('p19').addEventListener("click",function(){pletter_click(19)});    
    document.getElementById('p20').addEventListener("click",function(){pletter_click(20)});    
    document.getElementById('p21').addEventListener("click",function(){pletter_click(21)});    
    document.getElementById('p22').addEventListener("click",function(){pletter_click(22)});    
    document.getElementById('p23').addEventListener("click",function(){pletter_click(23)});    
    document.getElementById('p24').addEventListener("click",function(){pletter_click(24)});    
    document.getElementById('p25').addEventListener("click",function(){pletter_click(25)});    
    document.getElementById('p26').addEventListener("click",function(){xlate(0)});        
    
	document.getElementById('keyblock_space').innerHTML='';	
	document.getElementById('web_worker_space').style.display="block";
	web_worker_initialize()		
} // end initialize display

function reset_worker_display(){
	
	document.getElementById('output_area').value	='';
	document.getElementById('status3').value = 'idle';
	document.getElementById('status2').value = 'idle';
	document.getElementById('status').value = 'idle';
}

function previous_cipher(){
	var s,i,c;

	keys[working_on_numb]=key_array;
	s='';
	for (i=0;i<26;i++)
		s+=upperC.charAt(col_order[i]);
	stored_col_orders[working_on_numb]=s;
	if (working_on_numb > 0)
		working_on_numb--;
	id_display();
	s="Key: ";
    s += '<span style="float:right; margin-right:50px;">';
    s+='Book file: <input type="file" id="input" >';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
    s += '<input type="file" id="input2" ></span><br>';
    
	document.getElementById('key_caption').innerHTML=s;
	//document.getElementById('keySpace').style.border = "1px ridge black;";
    document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
    document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
    
		document.getElementById('let_space').innerHTML=' ';	
		document.getElementById('let_space').style.border = "white";
		display_letter_count_flag = 0;
	key_array = keys[working_on_numb];
	for (i=0;i<26;i++){
		c = stored_col_orders[working_on_numb].charAt(i);
		col_order[i] = upperC.indexOf(c);
	}
	solving_flag = 0;	
	xlate(2);
	reset_worker_display()
}


function next_cipher(){
	var s,i,c;

	keys[working_on_numb]=key_array;
	s='';
	for (i=0;i<26;i++)
		s+=upperC.charAt(col_order[i]);
	stored_col_orders[working_on_numb]=s;		
	if (working_on_numb < numb_ciphers-1)
		working_on_numb++;
	//s = '<font color="green"><b>Cipher ID:</font> '+cipher_id[working_on_numb]+'</b>';
	//document.getElementById('directions').innerHTML=s;
	id_display();
	s="Key: ";
    s += '<span style="float:right; margin-right:50px;">';
    s+='Book file: <input type="file" id="input" >';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
    s += '<input type="file" id="input2" ></span><br>';
    
	document.getElementById('key_caption').innerHTML=s;
	//document.getElementById('keySpace').style.border = "1px ridge black;";
    document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
    document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
		document.getElementById('let_space').innerHTML=' ';	
		document.getElementById('let_space').style.border = "white";
		display_letter_count_flag = 0;
	key_array = keys[working_on_numb];
	for (i=0;i<26;i++){
		c = stored_col_orders[working_on_numb].charAt(i);
		col_order[i] = upperC.indexOf(c);
	}
	solving_flag=0;
	xlate(2);
	reset_worker_display()
}

function locate_cipher(){
	var i,les,j,s,c;
	
	var new_id= prompt('Enter ID: (A-5,P-10,P-SP-2,etc)');
	if (new_id==' ' || new_id==null)
		return;
	keys[working_on_numb]=key_array;
	s='';
	for (i=0;i<26;i++)
		s+=upperC.charAt(col_order[i]);
	stored_col_orders[working_on_numb]=s;
	new_id =new_id.toUpperCase();
	le = new_id.length;
	for (i=0;i<numb_ciphers;i++){
		s = cipher_id[i].toUpperCase();
		s = s.slice(0,le);
		if (new_id == s){
			working_on_numb = i;
			id_display();	
            s="Key: ";
            s += '<span style="float:right; margin-right:50px;">';
            s+='Book file: <input type="file" id="input" >';
            s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
            s += '<input type="file" id="input2" ></span><br>';
            
            document.getElementById('key_caption').innerHTML=s;
            //document.getElementById('keySpace').style.border = "1px ridge black;";
            document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
            document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
			document.getElementById('let_space').innerHTML=' ';	
			document.getElementById('let_space').style.border = "white";
			display_letter_count_flag = 0;
			for (j=0;j<26;j++){
				c = stored_col_orders[working_on_numb].charAt(j);
				col_order[j] = upperC.indexOf(c);
			}
			key_array = keys[working_on_numb];
			solving_flag=0;
			xlate(2);
			reset_worker_display()
			return;
		}
	}
	alert("ID not found");
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

function cletter_click(i) {
	cchoice = i;
	if (substate==0) {
		substate = 1;
	}
}	

function pletter_click(i) {
	if (substate==1) {
		pchoice = i;
		xlate(1)
		substate=0;
	}
}	


function xlate(sub_flag) {
	var k,i,n,pl,pos,str,limit,c;
	
	// erase any previous values of cchoice
 if(sub_flag<2){	
	n = key_array.indexOf(upperC.charAt(cchoice))
	if ( n != -1) {
		k = key_array.slice(0,n)+'-';
		if (n<25)
			k = k+key_array.slice(n+1);
		key_array=k;
	}
	if (sub_flag) { //substitution, not erasure
		k = key_array.slice(0,pchoice)+upperC.charAt(cchoice);	
		if (pchoice<25)
			k = k+key_array.slice(pchoice+1);
		key_array=k;
	}
 }
 else {
	 n = -1;
	 pchoice = -1;
 }
	//document.puzzle.key.value =key_array+"\n"+lowerC;
	str = key_array+"<br>"+lowerC;
	document.getElementById('keySpace').innerHTML=	str;
	document.getElementById('keySpace').style.border = "1px ridge black";	
	if ( alt_key_flag ) display_keyblock(0);
	if (solving_flag == 0) {
		//code = document.puzzle.ciphertext.value
		code = ciphers[working_on_numb];
		code = code.toUpperCase()
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');
		solving_flag = 1;
		document.getElementById('outputblock').style.border = "3px ridge black";
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
		//str = str+code.slice(pos,limit+1)+"\n"
		str += code.slice(pos,limit+1);
		pl = ''
		for (i=pos;i<=limit;i++) {
			c = code.charAt(i);
			n = key_array.indexOf(c)
			if (n != -1 && c!='-') {
				if ( n == pchoice)
					pl += '<font color="red">'+lowerC.charAt(n)+'</font>';
				else
					pl = pl+lowerC.charAt(n);
			}
			else {
				n = upperC.indexOf(c);
				if (n!= -1) c = '-';
				pl = pl+c;
			}
		}
		//str = str+pl+"\n"
		str += '<br><font color="blue">'+pl+'</font><br>'
		pos = limit+1
	}
	//document.puzzle.ciphertext.value = str
	document.getElementById('outputblock').innerHTML=str;
	//document.getElementById('debug_place').value=str;
	substate=0
}	// end xlate

function s_compare(a,b) {
		return b[1]-a[1]
}		


function letter_count() {
	var i,n,str,s;


	if ( display_letter_count_flag == 0){	
		s = 'Key: &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp ';
		s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp Letter count:<br>';
		document.getElementById('key_caption').innerHTML=s;
		document.getElementById('let_space').style.border = "1px ridge black";	
		if (solving_flag == 0) {
			//code = document.puzzle.ciphertext.value
			code = ciphers[working_on_numb];			
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
			str += s_count[i][0]+"&nbsp;&nbsp;";
		//str += '\n';
		str += "<br>";
		for (i=0;i<26;i++){
			str += s_count[i][1].toString()+'&nbsp;';
			if (s_count[i][1]<10) str += '&nbsp;';
		}
		
		//alert(str)
		//s = "Letter count:<br>";
		s = '';
		//s += '<TEXTAREA id=let_ct styLe="font-family:monospace" name=let_ct rows=2 cols=80></TEXTAREA> <BR>';
		document.getElementById('let_space').innerHTML=str;	
		//document.getElementById('let_ct').value = str;
		display_letter_count_flag = 1;
	}
	else {
        s="Key: ";
        s += '<span style="float:right; margin-right:50px;">';
        s+='Book file: <input type="file" id="input" >';
        s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
        s += '<input type="file" id="input2" ></span><br>';
        
        document.getElementById('key_caption').innerHTML=s;
        //document.getElementById('keySpace').style.border = "1px ridge black;";
        document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
        document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
		document.getElementById('let_space').innerHTML=' ';	
		document.getElementById('let_space').style.border = "white";
		display_letter_count_flag = 0;
	}

}	//end letter_count

function start_over(){
	
	key_array = empty_key;
	xlate(2);
}

function save_to_disk(){
	var i,j, str;

	keys[working_on_numb]=key_array;
	str='';
	for (i=0;i<26;i++)
		str+=upperC.charAt(col_order[i]);
	stored_col_orders[working_on_numb]=str;
	if (typeof(localStorage) == 'undefined' ) {
		alert('Your browser does not support HTML5 localStorage. Try Chrome.');
	} 
	else {
		try {
			localStorage.setItem("xeno_batch_7880.numb_ciphers", numb_ciphers); //saves to the database, “key”, “value”
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			alert('Quota exceeded!'); //data wasn’t successfully saved due to quota exceed so throw an error
			}
		}
	}
	for (i=0;i<numb_ciphers;i++){
		str = "xeno_batch_7880.cipher"+i;
		localStorage.setItem(str, ciphers[i]);
		str = "xeno_batch_7880.key"+i;
		localStorage.setItem(str,keys[i]) ;
		str = "xeno_batch_7880.id"+i;
		localStorage.setItem(str,cipher_id[i]) ;
		str = "xeno_batch_7880.col_order"+i;
		localStorage.setItem(str,stored_col_orders[i]) ;
		
	}
	alert("Work saved.");
}

function get_from_disk(){
	var s,i,j,k,c;

	s="xeno_batch_7880.numb_ciphers";
	k=localStorage.getItem(s);
	if (k == undefined){
		alert("No ciphers stored");
		return
	}
	numb_ciphers = parseInt(k);
	for (i=0;i<numb_ciphers;i++){
		s = "xeno_batch_7880.cipher"+i;
		ciphers[i]=localStorage.getItem(s);
		s = "xeno_batch_7880.key"+i;
		keys[i]=localStorage.getItem(s);
		s = "xeno_batch_7880.id"+i;
		cipher_id[i]=localStorage.getItem(s);
		s = "xeno_batch_7880.col_order"+i;
		stored_col_orders[i]=localStorage.getItem(s) ;
	}
	working_on_numb = 0;
	id_display();
	s="Key: ";
    s += '<span style="float:right; margin-right:50px;">';
    s+='Book file: <input type="file" id="input" >';
    s += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Word list file: ';
    s += '<input type="file" id="input2" ></span><br>';
    
	document.getElementById('key_caption').innerHTML=s;
	//document.getElementById('keySpace').style.border = "1px ridge black;";
    document.getElementById('input').addEventListener("change",function(){ handleFiles(this.files) } );       
    document.getElementById('input2').addEventListener("change",function(){ handleFiles2(this.files) } );           
		document.getElementById('let_space').innerHTML=' ';	
		document.getElementById('let_space').style.border = "white";
		display_letter_count_flag = 0;
	
	key_array = keys[working_on_numb];
	for (i=0;i<26;i++){
		c = stored_col_orders[working_on_numb].charAt(i);
		col_order[i] = upperC.indexOf(c);
	}
	solving_flag = 0;	
	xlate(2);
	
}

function clear_disk(){
	var s,i,le, do_remove;
	
 do_remove = confirm("Delete saved work from storage?")
 if ( do_remove == true) {
	s="xeno_batch_7880.numb_ciphers";
	localStorage.removeItem(s);
	if (numb_ciphers>39) le = numb_ciphers;
	else le = 39;  // 25 A's, 14 P's
	for (i=0;i<le;i++){
		s = "xeno_batch_7880.cipher"+i;
		localStorage.removeItem(s);
		s = "xeno_batch_7880.key"+i;
		localStorage.removeItem(s);
		s = "xeno_batch_7880.id"+i;
		localStorage.removeItem(s);
		s = "xeno_batch_7880.col_order"+i;
		localStorage.removeItem(s);
	}
	
	//alert("work cleared from storage");
 }
}

function check_storage(){
	var s, do_get;
	
	s = localStorage.getItem("xeno_batch_7880.numb_ciphers");
	if (s != undefined){
		do_get = confirm("Retrieve stored work?")
		if ( do_get == true) {
			initialize_display();
			get_from_disk();
		}
	}
}

function toggle_keyblock(){
	
	if (alt_key_flag){
		alt_key_flag = 0;
		document.getElementById('keyblock_space').innerHTML='';
	}
	else {
		alt_key_flag = 1;
		display_keyblock(0);
	}
}

function display_keyblock(flag){
	var s,i,c,co,v,j,c2;

	get_inverse_key();
	s='';
	s = s+'Alternate Key:<br><br> &nbsp;';
	//letters across the top
	for (i=0;i<26;i++) {
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" >';
			s=s+inverse_key[upperC.charAt(col_order[i])]+'</span> </span>';
	}		
	s=s+'<br>';
	//row of cells
	s += '&nbsp;';
	for (j=0;j<26;j++) {
		c=upperC.charAt(col_order[j]);
		co = 'white';
		s = s+'<span width="75" height="75" style="border: 2px solid black;background:'+co+';"  >';
		s=s+'&nbsp<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
		s=s+c+'</span> </span>';
	}
	s=s+'&nbsp <br>';	
	if (flag) {//put in green column boxes
		s = s+'&nbsp;';
		// green selection boxes
		for (i=0;i<26;i++) {
				c = upperC.charAt(i);
				s = s+'<span width="75" height="75" style="border: 2px solid black;background: green;"  >';
				s=s+'&nbsp<span width="75" height = "75" id ="'+c+'key_column" class="'+c+'keycolumn" style="color:green">';			
				s += '&nbsp</span> </span>';
				columns_selected[c] = 0;
		}		
		s=s+'&nbsp <br>';	
		s+='<br>Select 1 or 2 columns by clicking their green boxes. ';
		s += 'Then click desired action:<br> ';
		s += '<input type="button" value="<- column(s) left" id="shift_key_columns_left4" >';		
		s += '<input type="button" value="column(s) right ->" id="shift_key_columns_right4">';			
		s += '<input type="button" value="clear Xs" id="display_keyblock41">';				
		s += '&nbsp&nbsp<input type="button" value="Close" id="display_keyblock40" >';	
		s += '&nbsp&nbsp<input type="button" value="Reset" id="reset_alt_key4" >';	
        document.getElementById('keyblock_space').innerHTML=s;	        
        document.getElementById('shift_key_columns_left4').addEventListener("click",shift_key_columns_left);       
        document.getElementById('shift_key_columns_right4').addEventListener("click",shift_key_columns_right);
        document.getElementById('reset_alt_key4').addEventListener("click",reset_alt_key);
        document.getElementById('display_keyblock41').addEventListener("click",function(){display_keyblock(1)});document.getElementById('display_keyblock40').addEventListener("click",function(){display_keyblock(0)});        
				
	} // end if flag
	else {
		s+='<br><INPUT id="display_keyblock42" type=button value="change column order" >';
		s += '<INPUT id="get_k3_key4" type=button value="get K3 key" >';
        document.getElementById('keyblock_space').innerHTML=s;	
        document.getElementById('display_keyblock42').addEventListener("click",function(){display_keyblock(1)});
        document.getElementById('get_k3_key4').addEventListener("click",get_k3_key);
	}
	location.href = "#directions"; // scroll down a little so all buttons visible
} // end display keyblock

function reset_alt_key(){
	var i;
	
	for (i=0;i<26;i++) col_order[i]=i;
	display_keyblock(1);
}

function get_inverse_key(){
	var i;

	for (i=0;i<26;i++)
		inverse_key[upperC.charAt(i)] = '-';		
	for (i=0;i<26;i++){
		if (key_array.charAt(i) != '-')
			inverse_key[ key_array.charAt(i) ] = lowerC.charAt(i);
	}
}		

function shift_key_columns_left(){
	var i,ccnt, col1,col2,r,i1,i2,n,c,j1,j2,c1,c2;
	
	ccnt = 0
	for (i=0;i<26;i++) {
		c = upperC.charAt(i);
		if (columns_selected[c]==1) {
			if (ccnt==0) {
				//col1=c;
				i1 = i;
			}
			else if ( ccnt ==1 ){
				//col2=c;
				i2=i;
			}
			ccnt += 1;
		}
	}
	if (ccnt==1) {// move just one column
		//col2=col1;
		i2=i1;
		ccnt++;
	}
	if (ccnt>2) {
			alert("Too many columns selected!")
			return
	}
	if (ccnt<2) {
			alert("No column selected!!")
			return
	}	
	if ( ccnt ==2) { //shift columns between col1 and col2 to the left
		for (j1=i1;j1<=i2;j1++) {
			j2 = (25+j1)%26; // column to left of j1
			n = col_order[j2];
			col_order[j2]=col_order[j1];
			col_order[j1]=n;
		}
		display_keyblock(1);
		// reset selection so can move again with one click
		c1= upperC.charAt((25+i1)%26);
		columns_selected[c1]=1;
		c2= upperC.charAt((25+i2)%26);
		columns_selected[c2]=1;	
		document.getElementById(c1+'key_column').style.color = "black";
		document.getElementById(c1+'key_column').innerText= "X"	;
		document.getElementById(c2+'key_column').style.color = "black";
		document.getElementById(c2+'key_column').innerText= "X"	;
	}
	
}
function shift_key_columns_right(){
	var i,ccnt, col1,col2,r,i1,i2,n,c,j1,j2,c1,c2;
	
	ccnt = 0
	for (i=0;i<26;i++) {
		c = upperC.charAt(i);
		if (columns_selected[c]==1) {
			if (ccnt==0) {
				//col1=c;
				i1 = i;
			}
			else if ( ccnt ==1 ){
				//col2=c;
				i2=i;
			}
			ccnt += 1;
		}
	}
	if (ccnt==1) {// move just one column
		//col2=col1;
		i2=i1;
		ccnt++;
	}
	if (ccnt>2) {
			alert("Too many columns selected!")
			return
	}
	if (ccnt<2) {
			alert("No column selected!!")
			return
	}	
	if ( ccnt ==2) { //shift columns between col1 and col2 to the left
		for (j1=i1;j1<=i2;j1++) {
			j2 = (1+j1)%26; // column to right of j1
			n = col_order[j2];
			col_order[j2]=col_order[j1];
			col_order[j1]=n;
		}
		display_keyblock(1);
		// reset selection so can move again with one click
		c1= upperC.charAt((1+i1)%26);
		columns_selected[c1]=1;
		c2= upperC.charAt((1+i2)%26);
		columns_selected[c2]=1;	
		document.getElementById(c1+'key_column').style.color = "black";
		document.getElementById(c1+'key_column').innerText= "X"	;
		document.getElementById(c2+'key_column').style.color = "black";
		document.getElementById(c2+'key_column').innerText= "X"	;
	}
}

function selectmouse(e){
  var fobj       = fire_fox ? e.target : event.srcElement;	
  var cell;
	if (fobj.className.slice(1)=="keycolumn") {	  
	  cell=fobj.className.slice(0,1);
	  //update columns selected array
	  columns_selected[ cell] ^= 1;
	  if (columns_selected[ cell]==1) {
	  	s= '<span width="75" height = "75" id ="'+fobj.id+'" class="'+fobj.className+'" style="color:black">';
	  	s +='X</span>';
	   }
	  else {	   
	  	s= '<span width="75" height = "75" id ="'+fobj.id+'" class="'+fobj.className+'" style="color:green">';
	  	s +='&nbsp</span>';
	   }		  
	  document.getElementById(fobj.id).innerHTML= s;	
      return false;	  	
  }
} // end selectmouse
document.onmousedown=selectmouse;

function output_solutions(){
	var s,str,pl,sol_numb,i,j;
    var delimiter_flag;
    
if (show_sols_flag==0){ // show output
	show_sols_flag=1;	// toggle for hide output
	// save curent work	
	keys[working_on_numb]=key_array;
	s='';
	for (i=0;i<26;i++)
		s+=upperC.charAt(col_order[i]);
	stored_col_orders[working_on_numb]=s;		
	//set up display
	s='<br><span style="font-weight:bold;">Solutions: </span> (to copy output to clipboard, ';
	s += 'click inside box, then Ctl-A to highlight, then Ctl-C to copy):<br>';
    s+='<textarea id="show_solutions" style="font-family: monospace;" name="solutontext" rows="6" cols="90">';
    s+='</textarea><br>';
    document.getElementById('solution_space').innerHTML= s;	
	location.href = "#button_actions"; // scroll down a little so solutions
    str='Solutions:\n\n';
    delimiter_flag = document.getElementById('sheet_delimiters').checked    
 for (sol_numb=0;sol_numb<numb_ciphers;sol_numb++){  
	if(keys[sol_numb] == empty_key) continue;

    str += cipher_id[sol_numb]+'\n';
    if (delimiter_flag) str += WORK_START;
	sol_code = ciphers[sol_numb];
	sol_code = sol_code.toUpperCase()
	// global replace of line feeds and carriage returns with blank
	sol_code = sol_code.replace(/[\n\r]/g,' ');
	solving_flag = 1;

	pos=0
	while ( pos < sol_code.length ) {
		limit = pos+line_len;
		if ( limit >= sol_code.length)
			limit = sol_code.length-1;
		else {
			while ( break_pt(sol_code.charAt(limit))== 0 && limit>pos )
				limit = limit -1;
			if (limit == pos) //no place to split!
				limit = pos+line_len;
		}
		pl = ''
		for (i=pos;i<=limit;i++) {
			c = sol_code.charAt(i);
			n = keys[sol_numb].indexOf(c);
			if (n != -1 && c!='-') {
					pl = pl+lowerC.charAt(n);
			}
			else {
				n = upperC.indexOf(c);
				if (n!= -1) c = '-';
				pl = pl+c;
			}
		}
		str = str+pl+"\n"
		pos = limit+1
	}
	s='';
	for (i=0;i<26;i++){
		c = stored_col_orders[sol_numb].charAt(i);
		j = keys[sol_numb].indexOf(c);
		if ( j != -1)
			s += lowerC.charAt(j);
		else
			s += '-';
	}
	str += "\nKey:                          Alternate Key:\n";
	str += lowerC+"    "+stored_col_orders[sol_numb]+"\n";

    str +=keys[sol_numb]+"    "+s+"\n";
    if ( delimiter_flag ) str += WORK_END;
    
	str+='\n';
 }// next sol_numb
	document.getElementById('show_solutions').value=str;
}
else {    
	show_sols_flag=0;
	document.getElementById('solution_space').innerHTML= '';
}
} // end output_solutions

function xfer_sol(){
	var str,n,s;
	
	str = document.getElementById('output_area').value;
	n = str.indexOf(lowerC);
	if ( n == -1 ){
		alert("No data to transfer!");
		return;
	}
	n += 60;
	key_array = str.slice(n,n+26);
	xlate(2);

}

onload = function() {
    document.getElementById('initialize0').addEventListener("click",function(){initialize(0)});    
    document.getElementById('initialize1').addEventListener("click",function(){initialize(1)});    
    document.getElementById('initialize2').addEventListener("click",function(){initialize(2)});  
    document.getElementById('do_stop1').addEventListener("click",do_stop);        
    document.getElementById('do_calc1').addEventListener("click",do_calc);            
    document.getElementById('xfer_sol1').addEventListener("click",xfer_sol);   
    check_storage();    
}    