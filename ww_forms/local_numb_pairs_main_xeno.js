
//var word_list_string = '';
var word_list = [];

var code,code_array,crib_pos,cribtext;
var symbols="abcdefghijklmnopqrstuvwxyz-?"
var digits="0123456789";
val_letter_selected=0;
//var fire_fox=!document.all;
var fire_fox = 1;
var dobj, solving_flag =0;
var asize = 10;
var line_len = 90;
var crib_entered=0;
var pair_line_limit=28;
var last_cell,numb_repeats;
var data;

//try associative array for key
var numb_key = new Array();
var saved_numb_key = new Array();
var freq = new Array();

// multiple crib entries
var temp_key = new Array();
var keep_key_flag=0;
var old_xlation;

// trie stuff
var EMPTY = -1;
var END_OF_WORD_INDEX = 26;
var trie = new Array();
var max_trie_index;
var alpha = "abcdefghijklmnopqrstuvwxyz";
var fitting_words = new Array();
var numb_fitting_words;
var fitting_strings = new Array();
var numb_fitting_strings;
var TOO_MANY_WORDS = 1000;

function new_trie_element(indx){
	var i;
	
	trie[indx] = new Array();
	for ( i=0;i<26;i++)
		trie[indx][i] = EMPTY;
	trie[indx][END_OF_WORD_INDEX] = 0;
}

function insert_word(wrd){
	var i,j,c,n;
	var current_index,next_index;

	c = wrd.charAt(0);
	n = alpha.indexOf(c);
	if ( n == -1) return;
	current_index = n;
	if (wrd.length == 1){
		trie[n][END_OF_WORD_INDEX] = 1;
		return;
	}
	for (i=1;i<wrd.length;i++){
		c = wrd.charAt(i);
		n = alpha.indexOf(c);
		if ( n == -1) continue; // skip dashes and apostophes, if they haven't already been removed
		next_index = n;
		if (trie[current_index][next_index] == EMPTY){
			new_trie_element(max_trie_index);
			trie[current_index][next_index] = max_trie_index;
			max_trie_index++;
		}
		current_index = trie[current_index][next_index];
	}
	trie[current_index][END_OF_WORD_INDEX] = 1;
}

function make_trie(){ // both forward and reverse
	var i;
	
	for (i=0;i<26*2;i++)
		new_trie_element(i);
	max_trie_index = 26;
	for (i in word_list) {
		insert_word(word_list[i]);
	}

}

function trie_initialize(){
	var str,n;
	
    trie = [];
	make_trie();
	n = word_list.length;
	str = "loaded "+n+" words using "+max_trie_index+" trie elements";
	//document.getElementById('cipher_place').value = str;		
	//alert(str);
}

function get_trie_index(str){ // get index of last trie element in the string str, already verified that str is in trie
	var i,c,current_index;
	var cnt,len;

	len = str.length;
	c = str.charAt(0);
	current_index = alpha.indexOf(c);
	cnt = 1;
	//if (cnt == len) return(current_index);
	while(cnt < len){
		c = str.charAt(cnt);		
		n =  alpha.indexOf(c);
		current_index = trie[current_index][n];		
		cnt++;
	}
	return(current_index);
}
	

function get_fitting_strings(s,len){ // get fitting strings of length len starting at position s
	// extend from previous fitting strings array if len >1
	var pos,letter,cell,c;
	var temp_strings, numb_temp;
	var i,j,n,str,trie_index;
	
	pos = parseInt(s); // starting position in cipher
	if (len == 1) { // at start, no strings stored yet
		temp_save(); // get current key into temp_key array
		cell = code_array[pos]; // code symbol
		letter = temp_key[cell]; // plaintext letter, or '-' if not filled in yet
		if (letter == '-') { // all starting letters are possible
			for (i=0;i<26;i++)
				fitting_strings[i] = alpha.charAt(i);
			numb_fitting_strings = 26;
		}
		else { //only one letter possible, any letter can begin a word, so its ok
			fitting_strings[0] = letter;
			numb_fitting_strings = 1;
		}
	}
	else { // fitting_strings array is set up
		temp_strings = new Array(); // set up next fitting strings array
		numb_temp = 0;
		for (i=0;i<numb_fitting_strings;i++){
			str = fitting_strings[i];
			trie_index = get_trie_index(str);
			if (trie[trie_index][END_OF_WORD_INDEX] == 1) // found word
				fitting_words[numb_fitting_words++] = str;
			if ( pos+len >= code_array.length) continue; // note: final entry in code array not a cipher symbol
			temp_save(); // get current key into temp_key array
			for (j=0;j<len-1;j++){ // add letters from current fitting string to temp_key array
				c = str.charAt(j);
				temp_key[code_array[pos+j]]=c;
			}
			cell = code_array[pos+len-1]; // last code symbol
			letter = temp_key[cell]; // plaintext letter, or '-' if not filled in yet
			if ( letter == '-') { // not decoded yet;
				for (j=0;j<26;j++){
					if (trie[trie_index][j] != EMPTY) // this is a possibility
						temp_strings[numb_temp++] = str+alpha.charAt(j);
				}
			}
			else { // just one possibility
				j = alpha.indexOf(letter);
				if (trie[trie_index][j] != EMPTY) // this is a possibility
					temp_strings[numb_temp++] = str+alpha.charAt(j);
			}
		}
		// transfer new srings to fitting strings array
		numb_fitting_strings = numb_temp;
		for (i=0;i<numb_fitting_strings;i++)
			fitting_strings[i] = temp_strings[i];
	}
	return(numb_fitting_strings);	
}		

function show_choice(s){
	var newword,str,pos,insert_pos;
	var i;
	
	insert_pos = parseInt(s);
	pos = document.getElementById('wordlist')	
	newword = pos.options[pos.selectedIndex].text
	//str = "Choice is "+newword+"  at position "+insert_pos;
	//alert(str);
	for (i=0;i<newword.length;i++) {
		c = newword.charAt(i);
		numb_key[code_array[insert_pos+i]]=c;
	}
	xlate();
	restore_keyblock();		
}

function undo_key(){
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		numb_key[ digits.charAt(i)+digits.charAt(j) ] = temp_key[ digits.charAt(i)+digits.charAt(j) ];
	}
	xlate();
	restore_keyblock();

}

function close_table(){
	hide_repeats();
}


function show_filtered_words(spos) {
    document.getElementById('m_display').style.visibility="hidden";
	var x;
	if ( numb_fitting_words==0) {
		//alert("No words in list!");
        show_box(0,"No words in list!");
		return;
	}
	temp_save(); // so can undo
	alts=["even","odd"];
	str= '<SELECT  size="5" id="wordlist">';
	
	state=0;
	for (var i=0;i<numb_fitting_words;i++) {
		str += '<OPTION class="'+alts[state]+'">'+fitting_words[i];
		state ^=1 ;
	}		
	str += '</select><br><input type="button" value="Insert into text" id="show_choicexx">'
	str += '<input type="button" value="Undo" id="undo_keyxx">';	
	str += '<br><input type="button" value="Close" id="close_tablexx">';
	document.getElementById('crib_repeats').innerHTML= str;
    document.getElementById('undo_keyxx').addEventListener("click", undo_key);        
    document.getElementById('close_tablexx').addEventListener("click", close_table); 
    document.getElementById('show_choicexx').addEventListener("click", function(){ show_choice(spos)});     
}

function cancel_messagefw(){
    document.getElementById('m_display').style.visibility="hidden";
}    


function get_fitting_words(s){
	var str,n,m,le;
	
	numb_fitting_words = 0;
	n = get_fitting_strings(s,1);
	le = 2;
	while( n>0){
		n = get_fitting_strings(s,le);
		le++;
		if (numb_fitting_words > TOO_MANY_WORDS) break; // too many to use!
	}
	str = "There are "+numb_fitting_words+" fitting words at position: "+s+" . Show them?";
	//var show_words=confirm(str);
    var s1;
	s1 = '<span id="m_display"><br>';
    s1 += str+'<br>';

	s1 += '<br><br><center><input value="OK" id="hide_messagefw7" type="button">';
    s1 += ' <input value="Cancel" id="cancel_messagefw7" type="button">';
	s1 += '</span>';
	document.getElementById('cm_display').innerHTML=s1;
	document.getElementById('m_display').style.visibility="visible";
    
    document.getElementById('hide_messagefw7').addEventListener("click", function(){show_filtered_words(s)});        
    document.getElementById('cancel_messagefw7').addEventListener("click", cancel_messagefw);            
    /*
	if ( show_words==true)
		show_filtered_words(s);
    */
	//alert(str);
}

function reset_key() {
	if (keep_key_flag==1 ) {
		for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
			numb_key[ digits.charAt(i)+digits.charAt(j) ] = temp_key[ digits.charAt(i)+digits.charAt(j) ];
		}
	}	
	else {	
		for (i=0;i<asize;i++) for (j=0;j<asize;j++) {
			numb_key[ digits.charAt(i)+digits.charAt(j) ] = '-';
			saved_numb_key[ digits.charAt(i)+digits.charAt(j) ] = '-';
		}
	}
		
}

function input_ok() {
	var s='Ciphertext: (Type or paste cipher into this box)<BR>';
	s=s+'<TEXTAREA id=cipher_place style="font-family:monospace" name=output_area rows=9 cols=90></TEXTAREA><BR>';
	
	document.getElementById('outputblock').innerHTML=s;		
}


function setup_code_pairs() {
	var i,j,state;
	
	data = document.ciphertext.cipher_place.value;
	state=0;
	code = '';
	for (i=0;i<data.length;i++) {
		c = data.charAt(i);
		if ( digits.indexOf(c) >-1) {
			if (state==0) {
				code = code+c;
				state=1;
			}
			else {
				code = code+c+' ';
				state=0;
			}
		}
	}
	solving_flag=1;
	if (state) {
		//alert("Cipher has odd number of digits!");
        show_box(0,"Cipher has odd number of digits!");
		solving_flag=0;
		return;
	}
	code_array = code.split(' ');	
	old_xlation = ['-'];
	for (i = 0;i<code_array.length-1;i++)
		old_xlation[i]= '-';
	// get ciphertext frequencies	
	for (i=0;i<asize;i++) for (j=0;j<asize;j++) 
		freq[ digits.charAt(i)+digits.charAt(j) ] = 0;
	for (i in code_array)
		freq[ code_array[i] ]++;
	restore_keyblock();		
}	


function freq_color_display(){
	var i,j,s;
	
	s='';
	for (i=0;i<5;i++){
		if (i>=4)
			co = 'white';
		else if (i==3)
			co = 'yellow';
		else if (i==2)
			co = 'pink';
		else if (i==1)
			co = 'orange';
		else
			co = 'silver'

		s = s+'<span width="75" height="75" style="border: 2px solid black; padding:2px;background:'+co+';"  >';
		s=s+'&nbsp<span width="75" height = "75" style="color:blue">';
		s=s+i+'</span> ';
		if ( i==4)
			s += '+';
		s +='</span>';
	}
	s=s+'&nbsp <br>';	
	document.getElementById('freq_legend').innerHTML= s;	
}	
	

function xlate() {
	var state,str,limit,pos,pl,cnt,numb_pairs;
	if (solving_flag ==0) {
		setup_code_pairs();
		if (solving_flag==0) return;//odd number of digits!
	}
	str='';
	//str='<style="font-family:monospace; font-size:17px;">';
	limit=pair_line_limit;
	numb_pairs=code_array.length-1;//final entry not a code pair
	if (numb_pairs<limit)
		limit = numb_pairs;
	pos=0;
	cnt=0;
	pl='';
	while (pos<numb_pairs ) {
		str = str+code_array[pos]+' ';
		//pl = pl+numb_key[code_array[pos]]+'  ';
		ce=code_array[pos];
		c = numb_key[ce];
		//if ( ce==last_cell)		
		if ( old_xlation[pos] != c){
			old_xlation[pos]=c;	
			pl = pl+'<font color="red"><span class = "plain'+pos+'">'+c+'&nbsp;&nbsp;</span></font>';					
			//c = '<font color="red">'+c+'</font>';
		}
		else
			pl = pl+'<span class = "plain'+pos+'">'+c+'&nbsp;&nbsp;</span>';
		//pl = pl+c+'&nbsp;&nbsp;';
		pos++;
		cnt++;
		if (cnt>=limit) {
			//str=str+'\n'+pl+'\n';
			str = str+'<br><font color="blue">'+pl+'</font><br>'
			pl='';
			cnt=0;
			if (pos+pair_line_limit>numb_pairs)
				limit = numb_pairs-pos;;
		}
	}
	//document.ciphertext.cipher_place.value=str;
	document.getElementById('outputblock').innerHTML=str;
}
	

function selectmouse(e) {
 var x,s;
  var fobj       = fire_fox ? e.target : event.srcElement;
  if (fobj.className.slice(1)=="key") {
    dobj = fobj;
	cpos = symbols.indexOf(dobj.className.charAt(0));  
	letter_selected=1;
	//reset key
	letterblock_setup();
	c=dobj.className.charAt(0);	
	s= '<span width="75" height = "75" id ="'+c+'letter" class="'+c+'key" style="color:red">'+c+'</span>';
	document.getElementById(dobj.id).innerHTML= s;
	//next 2 lines for debugging
	//s = "you clicked on "+c;
	//document.debug.output_area.value= s; 	
    return false;
  }
  else if (fobj.className.slice(2)=="keyblock" && letter_selected) {
	  keep_key_flag = 0;	  
	  dobj = fobj;
	  letter=symbols.charAt(cpos);
	  if ( letter == '?') // query doesn't apply to key table, should click on plaintext for query
	  	return
	  s= '<span width="75" height = "75" id ="'+dobj.id+'" class="'+dobj.className+'" style="color:blue">';
	  s=s+letter+'</span>';
	  document.getElementById(dobj.id).innerHTML= s;
	  letter_selected=0;
	  cell=dobj.className.slice(0,2);
      update_undo();
      document.getElementById('do_redo').disabled = true;          
      
	  //update key array
	  numb_key[ cell] = letter;
	  //reset letter block
	  letterblock_setup();
	  last_cell=cell;
	  xlate();
	  hide_repeats(); //crib info no longer needed
      //next 3 lines for debugging
	  //s = "you put it in cell "+cell+"\n";
	  //s = s+numb_key;
	  //document.debug.output_area.value= s; 	
      return false;
	  
  }
  else if (fobj.className.slice(0,5)=="plain" && letter_selected) {
	  keep_key_flag = 0;	  
	  dobj = fobj;
	  x = fobj.className.slice(5);
	  letter=symbols.charAt(cpos);
	  letter_selected=0;	  
	  cell = code_array[ parseInt(x)];
	  if ( letter == '?'){ // query, find fitting words 
	  	get_fitting_words(x);
	  	//reset letter block
	  	letterblock_setup();
	  	return;
  	}
    update_undo();
    document.getElementById('do_redo').disabled = true;          
    
	  //update key array
	  numb_key[ cell] = letter;
	  //reset letter block
	  letterblock_setup();
	  last_cell=cell;
	  xlate();
	  restore_keyblock();
	  hide_repeats(); //crib info no longer needed
      //next 3 lines for debugging
	  //s = "you put it in cell "+cell+"\n";
	  //s = s+numb_key;
	  //document.debug.output_area.value= s; 	
      return false;
  }
	  	  	  
}
document.onmousedown=selectmouse;

function letterblock_setup() {
	var s,i,c;
	
	s=''

	for (i=0;i<symbols.length;i++) {
		c = symbols.charAt(i);

		s = s+'<span width="75" height="75" style="border: 2px solid white;background: white;"  >';
		s=s+'&nbsp<span width="75" height = "75" id ="'+c+'letter" class="'+c+'key" style="color:blue">';
		s=s+c+'</span> </span>';
	}	
	s=s+'<br>';	
	document.getElementById('letterblock').innerHTML=s;	
	last_cell='';

}

function keyblock_setup() {
	var s,i,c;

	if (solving_flag){
		restore_keyblock();
		return;
	}
	s='';
	s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
	s=s+'&nbsp<span width="75" height = "75" >';
	s=s+'</span> </span>';
	//digits across the top
	for (i=0;i<10;i++) {
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" >';
			s=s+digits.charAt(i)+'</span> </span>';
	}		
	s=s+'<br>';
	for (i=0;i<10;i++) {
		cr = digits.charAt(i);
		//digit on the side
		s = s+cr+'&nbsp';
		//row of cells
		for (j=0;j<10;j++) {
			cc=digits.charAt(j);
			c = cr+cc;
			s = s+'<span width="75" height="75" style="border: 2px solid black;background: white;"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
			s=s+'-'+'</span> </span>';
		}
		s=s+'&nbsp <br>';			
	}	
	s=s+'<br>';	
	document.getElementById('keyblock').innerHTML=s;	

}

function restore_keyblock() {
	var s,i,c,co,v,i,j;
	
	s='';
	s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
	s=s+'&nbsp<span width="75" height = "75" >';
	s=s+'</span> </span>';
	//digits across the top
	for (i=0;i<10;i++) {
			s = s+'<span width="75" height="75" style="border: 2px solid silver;background: silver;"  >';
			s=s+'&nbsp<span width="75" height = "75" >';
			s=s+digits.charAt(i)+'</span> </span>';
	}		
	s=s+'<br>';
	for (i=0;i<10;i++) {
		cr = digits.charAt(i);
		//digit on the side
		s = s+cr+'&nbsp';
		//row of cells
		for (j=0;j<10;j++) {
			cc=digits.charAt(j);
			c = cr+cc;
			v = numb_key[c];
			if (freq[ c ]>=4)
				co = 'white';
			else if (freq[ c ]==3)
				co = 'yellow';
			else if (freq[ c ]==2)
				co = 'pink';
			else if (freq[ c ]==1)
				co = 'orange';
			else
				co = 'silver'
			s = s+'<span width="75" height="75" style="border: 2px solid black;background:'+co+';"  >';
			s=s+'&nbsp<span width="75" height = "75" id ="'+c+'keymatrix" class="'+c+'keyblock" style="color:blue">';
			s=s+v+'</span> </span>';
		}
		s=s+'&nbsp <br>';			
	}	
	s=s+'<br>';	
	document.getElementById('keyblock').innerHTML=s;	

}


function start_over() {
	keep_key_flag = 0;
	if (solving_flag==0) {
		code = document.ciphertext.cipher_place.value;
	}
	reset_key();
	letterblock_setup()

	input_ok();
	document.ciphertext.cipher_place.value=code;
	solving_flag=0;
	keyblock_setup()	
}	

function reset() {
    show_box(1,"Erase the current cipher?");
}	

function do_erase(){
    close_box();
	keep_key_flag = 0;		
	reset_key();
	letterblock_setup()
	keyblock_setup()
	input_ok();
	document.ciphertext.cipher_place.value='';
	solving_flag=0;
	crib_entered=0;
	keyblock_setup()		
}

function ck_crib_pos() {
	//also set up numb_key and keyblock
	//for speed, check consistency first
	reset_key();
	numb_repeats=0;
	for (i=0;i<cribtext.length;i++) {
		c = cribtext.charAt(i);
		pr =code_array[crib_pos+i];
		k = numb_key[pr];
		if ( k != '-' && k != c) {
			/* for speed,only reset at end, if not found!
			reset_key();
			keyblock_setup();	
			*/
			return(0);
		}
		if ( k != '-') numb_repeats++;
		numb_key[code_array[crib_pos+i]]=c;
	}
	//it's consistent, update keyblock and screen
	//keyblock_setup();
	restore_keyblock();
	for (i=0;i<cribtext.length;i++) {
		c = cribtext.charAt(i);
		pr =code_array[crib_pos+i];
        s= '<span width="75" height = "75" id ="'+pr+'keymatrix" class="'+pr+'keyblock" style="color:blue">';
	    s=s+c+'</span>';
	    document.getElementById(pr+'keymatrix').innerHTML= s;
	}
	return(1); //OK at crib_pos!
}	

function show_repeats() {
		str ='<font color="blue"> There are '+numb_repeats+' repeated pairs at this crib position.</font><br>';
	    document.getElementById('crib_repeats').innerHTML= str;	
}

function hide_repeats() {
		str = '&nbsp <br>';
	    document.getElementById('crib_repeats').innerHTML= str;	
}

function drag_right() {
	if (crib_entered==0) {
		drag_crib();
		return;
	}
	not_found=1;	
	crib_pos++;
	if (crib_pos>=code_array.length-cribtext.length+1)
		crib_pos=0;
	while(crib_pos< code_array.length-cribtext.length+1) {
		if ( ck_crib_pos() ) {
			not_found=0;
			break; // OK!
		}
		crib_pos++;
	}
	if ( not_found ){
		reset_key();
		//keyblock_setup();	
		restore_keyblock();
	}	
	else show_repeats();
	//fill in plaintext
	xlate();
}

function drag_left(){
	if (crib_entered==0) {
		drag_crib();
		return;
	}	
	not_found=1;	
	crib_pos--;
	if (crib_pos<0)
		crib_pos=code_array.length-cribtext.length;
	while(crib_pos>=0) {
		if ( ck_crib_pos() ) {
			not_found=0;
			break; // OK!
		}
		crib_pos--;
	}
	if ( not_found ){
		reset_key();
		//keyblock_setup();	
		restore_keyblock();
	}	
	else show_repeats();
	//fill in plaintext
	xlate();
}

function cancel_messagecr(){
    document.getElementById('c_display').style.visibility="hidden";
}    


function do_crib_entered(){
    var i,c;
//var crib= prompt('Enter crib');
    crib = document.getElementById('crib_string').value;
    var ck = document.getElementById('keep_table6').checked;
    document.getElementById('c_display').style.visibility="hidden";
	if (crib==' ' || crib==null)
		return;
	if (solving_flag){
		//ck=confirm('Include current key table?');
		if (ck == true)
			temp_save();
		else
			keep_key_flag = 0;
	}
	if (solving_flag ==0) {
		setup_code_pairs();
		if (solving_flag==0) return;//odd number of digits!
	}
	cribtext='';
	crib = crib.toLowerCase();	
	for (i=0;i<crib.length;i++) {
		c = crib.charAt(i);
		if (symbols.indexOf(c) !=-1 ) {//allow '-' chars in crib!
			cribtext = cribtext+c;
		}
	}
	crib_pos=0;
	not_found=1;
	while(crib_pos< code_array.length-cribtext.length+1) {
		if ( ck_crib_pos() ) {
			not_found=0;
			break; // OK!
		}
		crib_pos++;
	}
	if ( not_found ){
		reset_key();
		//keyblock_setup();	
		restore_keyblock();
	}
	else {
		show_repeats();
    }
	//fill in plaintext
	xlate();
	crib_entered=1;
}


function drag_crib() {	
    var i;
    var n;
    
    var s;
	s = '<span id="c_display"><br>';
    s += 'Enter Crib:<br> <input type="text" size="50" id = "crib_string"  ><br>';

	s += '<br><br><center><input value="OK" id="hide_messagecr6" type="button">';
    s += ' <input value="Cancel" id="cancel_messagecr6" type="button">';
    s += '<br><input type = "checkbox" checked id = "keep_table6"> Include current key table.';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('c_display').style.visibility="visible";
    
    document.getElementById('hide_messagecr6').addEventListener("click", do_crib_entered);        
    document.getElementById('cancel_messagecr6').addEventListener("click", cancel_messagecr);            
    
    document.getElementById('crib_string').focus();
}


function redirect() {
	window.location="grandpre_lowres.html";
}

function screen_check() {
	if (screen.width <1000) {
		redirect();
	}
	//make sure browser size is maximized
	top.window.moveTo(0,0); 
	if (!fire_fox) 
	    top.window.resizeTo(screen.availWidth,screen.availHeight);
	else if (document.layers || document.getElementById){ 
	   if (top.window.outerHeight < screen.availHeight || top.window.outerWidth < 
			screen.availWidth) {
	      top.window.outerHeight = top.screen.availHeight; 
	      top.window.outerWidth = top.screen.availWidth; 
	   } 
	} 
}

function temp_save(){
	var v;
	
	keep_key_flag = 1;
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		temp_key[ digits.charAt(i)+digits.charAt(j) ] = numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
}


function save_keys() {

	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		saved_numb_key[ digits.charAt(i)+digits.charAt(j) ] = numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}

	//alert("Key saved");
    show_box(0,"Key saved.");
}	


function restore_keys() {

	show_box(2,"Restore saved key?");
}	

function do_restore(){
    close_box();
	keep_key_flag = 0;		
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		numb_key[ digits.charAt(i)+digits.charAt(j) ] = saved_numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
	xlate();
	restore_keyblock();		
}

function save_to_disk(){
	var i,j, str;

	str = '';
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		str += numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
    
    
    if( window.chrome && chrome.storage){    // using packaged app   
        var data_store = {};
        
        data_store["numb_key.cipher"] = data
        data_store["numb_key.key"] = str;
        chrome.storage.local.set(data_store, function() {
        show_box(0,"Work saved on disk.");
    });
        
    }
    else{	
            if (typeof(localStorage) == 'undefined' ) {
            //alert('Your browser does not support HTML5 localStorage. Try Chrome.');
            show_box(0,"Your browser does not support HTML5 localStorage. Try Chrome.");
        } 
        else {
            try {
                localStorage.setItem("numb_key.cipher", data); //saves to the database, “key”, “value”
            } catch (e) {
                if (e == QUOTA_EXCEEDED_ERR) {
                //alert('Quota exceeded!'); //data wasn’t successfully saved due to quota exceed so throw an error
                show_box(0,"Quota exceeded!");
                }
            }
        }
        localStorage.setItem("numb_key.key", str);
        //alert("Work saved on disk");
        show_box(0,"Work saved on disk");
    }
}

function get_from_disk(){
	var s,i,j,k;

    var key1 = "numb_key.cipher";
    var key2 = "numb_key.key";
    if( window.chrome && chrome.storage){    // using packaged app   
    chrome.storage.local.get([key1,key2], function(items) {
        var s,i,j,k;
        var temp;
    
        temp = items[key1];
        if (temp == undefined){
            show_box(0,"No cipher stored");
            return
        }
        data = temp;
        keep_key_flag = 0;		
        reset_key();
        letterblock_setup()
        keyblock_setup()
        input_ok();
        document.ciphertext.cipher_place.value=data;
        solving_flag=0;
        crib_entered=0;
        keyblock_setup()		
        start_over();
        xlate();
        s = items[key2];
        k=0;
        for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
            numb_key[ digits.charAt(i)+digits.charAt(j) ] = s.charAt(k);
            k++;
        }
        xlate();
        restore_keyblock();		
    });
    }
    else{	
        data = localStorage.getItem("numb_key.cipher");
        if (data == undefined){
            //alert("No cipher stored");
            show_box(0,"No cipher stored");
            return
        }
        keep_key_flag = 0;		
        reset_key();
        letterblock_setup()
        keyblock_setup()
        input_ok();
        document.ciphertext.cipher_place.value=data;
        solving_flag=0;
        crib_entered=0;
        keyblock_setup()		
        start_over();
        xlate();
        s = localStorage.getItem("numb_key.key");
        k=0;
        for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
            numb_key[ digits.charAt(i)+digits.charAt(j) ] = s.charAt(k);
            k++;
        }
        xlate();
        restore_keyblock();		
    }
}

function clear_disk(){
    var key1 = "numb_key.cipher";
    var key2 = "numb_key.key";
    if( window.chrome && chrome.storage){   // using packaged app
        chrome.storage.local.remove([key1,key2], function() {
                show_box(0,"work cleared from disk");
            });
        }  
    else{
        localStorage.removeItem("numb_key.cipher");
        localStorage.removeItem("numb_key.key");	
        //alert("work cleared from disk");
        show_box(0,"work cleared from disk");
    }    
}

function show_box(n,message){ // n=0 1 choice, 2 for 2 choices
    var str;
    document.getElementById('light').style.display='block';
    document.getElementById('fade').style.display='block';
    str ='';
    str += message;
    str += '<br>';
    if ( n==0)
        str += '<br><input type = button id="close_box9" value="OK">'
    else if ( n==1) { // erase cipher
        str += '<br><input type = button id="do_erase9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    else if ( n==2) { // restore
        str += '<br><input type = button id="do_undo9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    document.getElementById('light').innerHTML = str;
    if ( n==0)
        document.getElementById('close_box9').addEventListener("click", close_box);  
    else if ( n==1) { // erase cipher
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_erase9').addEventListener("click", do_erase);  
    }
    else if ( n==2) { // restore
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_undo9').addEventListener("click", do_restore);  
    }
    
}
function close_box(){
    var s;
    document.getElementById('light').style.display='none';
    document.getElementById('fade').style.display='none';
    //s = "result was "+n;
    //document.getElementById('result').innerHTML=s;
}

function send_ciphertext(){
	if (solving_flag ==0) {
		setup_code_pairs();
		if (solving_flag==0) return;//odd number of digits!
	}
    // ciphertext variable is 'data'
    //chrome.runtime.sendMessage({mes_choice:0,str:data});
    document.getElementById('input_area').value = data;
}    

function send_work(){
	var i,j, str;

	str = '';
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		str += numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
    //chrome.runtime.sendMessage({mes_choice:1,str:str});
  document.getElementById('output_area2').value = "Partial key from interactive solver:\n"+str;
  key_str = str;
  work_sent_flag = true;
  document.getElementById('hill_climb_start').scrollIntoView();
    
}    


function message_sending_initialize(){
var str;
    str = '<INPUT id="send_ciphertext" type=button value="send cipher to hill-climber" >';
    str += '<INPUT id="send_work" type=button value="send work to hill-climber" >';
    //if ( window.chrome && chrome.runtime) {
        document.getElementById('send_messages').innerHTML = str;
        document.getElementById('send_ciphertext').addEventListener("click",send_ciphertext);    
        document.getElementById('send_work').addEventListener("click",send_work);    
    //}
}    

function display_message(message){
	var s;
	
	s = '<span id="ms_display">';
	//s += message;
    s += '<textarea id="display_area" cols=50 rows=24 ></textarea>';
	s += '<br><br><center><input value="Close" id="hide_message8" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('ms_display').style.visibility="visible";
    document.getElementById('display_area').value = message;
    document.getElementById('hide_message8').addEventListener("click", hide_message);  
}

function hide_message(){
	document.getElementById('ms_display').style.visibility="hidden";
}


function show_sol(){
	var state,str,limit,pos,pl,cnt,numb_pairs,i,j;

	if (solving_flag ==0) {
		setup_code_pairs();
		if (solving_flag==0) return;//odd number of digits!
	}
	limit=pair_line_limit;
	numb_pairs=code_array.length-1;//final entry not a code pair
	if (numb_pairs<limit)
		limit = numb_pairs;
	pos=0;
	cnt=0;
	pl='Plaintext\n';
	while (pos<numb_pairs ) {
		ce=code_array[pos];
		c = numb_key[ce];
        pl += c;
		pos++;
		cnt++;
		if (cnt>=limit) {
            pl += '\n';
			cnt=0;
			if (pos+pair_line_limit>numb_pairs)
				limit = numb_pairs-pos;;
		}
	}
    
    pl += "\nKey:\n";
	for (var i=0;i<asize;i++) {
        for (var j=0;j<asize;j++) {
            pl += numb_key[ digits.charAt(i)+digits.charAt(j) ];
        }
        pl += '\n';
    }
    display_message(pl);

}

function check_key(e) {

    if (solving_flag==0) return(true); // ciphertext not on display yet
    var s,n;
    var evt=window.event? event : e //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var c=evt.charCode? evt.charCode : evt.keyCode
    var key=String.fromCharCode(c) // can distinguish caps from lower case
    /*
    //s = 'key pressed was '+key;
    //alert(s);
    n = upperC.indexOf(key);
    if ( n != -1) {
        shortcut_displayed = max_shortcut_display; // turn off tool tip
        cletter_click(n);
        return(false);
    }
    n = lowerC.indexOf(key);
    if ( n != -1) {
        shortcut_displayed = max_shortcut_display; // turn off tool tip
        pletter_click(n);
        return(false);
    }
        shortcut_displayed = max_shortcut_display; // turn off tool tip
    if ( key == '-') {
        xlate(0);
        return(false);
    }
    */
    if ( key == ' ') {
        speechButton();
        //showInfo("space bar pressed");
        return(false);
    }
    
    return(true);
}

document.onkeypress=check_key;

var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
  upgrade();
} else {
  var recognition = new webkitSpeechRecognition();
  //recognition.continuous = true;
  recognition.continuous = false;
  //recognition.interimResults = true;
  recognition.interimResults = false;

  recognition.onstart = function() {
    recognizing = true;
    showInfo("Listening . . .");
    //start_img.src = 'mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      showInfo('info_blocked');
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    var s,n,n1,n2,c,str,c1,n3;
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    //start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('Try again');
      return;
    }
    s = final_transcript.toLowerCase();

    if ( s=='undo'){
        showInfo(s);
        do_undo();
        return;
    }
    if ( s=='redo'){
        showInfo(s);
        do_redo();
        return;
    }

    s = s.split(' ');
    if (s.length==1){
        str = s[0]+' (<font color="red"> error:</font> need two words)';
        showInfo(str);
    }
    else if ( s.length>2) {
        str = s[0]+' '+s[1]+' '+s[2]+ ' . . . (<font color="red"> error:</font> more than two words)'
        showInfo(str);
    }
    else if ( s.length == 2){ 
        c1 = '<font color="brown">'+s[1].charAt(0)+'</font>';
        str = s[0]+' '+c1+s[1].slice(1);
        showInfo(str);
        // two words. 1st letter of 1st word is cipher letter, 1st letter of 2nd word is plain letter
        n1 = digits.indexOf(s[0].charAt(0));
        if (s[0].length > 1)
            n2 = digits.indexOf(s[0].charAt(1));
        else {
            n2 = n1;
            n1 = 0;
        }
        n3 = symbols.indexOf(s[1].charAt(0));
        if ( n1 >= 0 && n2 >= 0 && n3>=0 ){
            keep_key_flag = 0;	  
            cpos = n3;
            letter=symbols.charAt(cpos);
            letter_selected=0;
            //n = n1+10*n2;
            n = 10*n1+n2; // row comes first
            cell = ''+n;
            if ( n<10)
                cell = '0'+cell;
            /*
            if ( letter == '?'){ // query, find fitting words 
                get_fitting_words(x);
                //reset letter block
                letterblock_setup();
            return;
            }
            */
            update_undo();
            document.getElementById('do_redo').disabled = true;          
            
            //update key array
            numb_key[ cell] = letter;
            //reset letter block
            letterblock_setup();
            last_cell=cell;
            xlate();
            restore_keyblock();
            hide_repeats(); //crib info no longer needed
        }
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = ''; // No effect. interim currently turned off
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        interim_transcript += event.results[i][0].transcript;
      }
    }
    //speech_string = final_transcript;
  };
}

function upgrade() {
  showInfo('info_upgrade');
}


function showInfo(s) {
//document.getElementById('speech_result').value=s;
//document.getElementById('speech_result').innerText = s;
document.getElementById('speech_result').innerHTML = s;
}

function speechButton(event){
   if (recognizing) {
    recognition.stop();
    return;
  }
  final_transcript = '';
  //recognition.lang = select_dialect.value;  
  recognition.start();
  ignore_onend = false;
  //start_img.src = 'mic-slash.gif';
  showInfo('info_allow');
  //start_timestamp = event.timeStamp;


}

// undo and redo routines and variables

var undo_array = [];
var redo_array = [];
var undo_index = 0;
var redo_index = 0;

function do_undo(){
    var i,j;

    if (undo_index == 0) return;
    redo_array[redo_index] = [];
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		redo_array[redo_index][ digits.charAt(i)+digits.charAt(j) ] = numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
    redo_index++;
    undo_index--;  
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		 numb_key[ digits.charAt(i)+digits.charAt(j) ] = undo_array[undo_index][ digits.charAt(i)+digits.charAt(j) ] ;
	}
    document.getElementById('do_redo').disabled = false;
    keep_key_flag = 0;		
	xlate();
	restore_keyblock();		
}

function do_redo(){
    var i,j;
    
    if (redo_index == 0)
        return;
    redo_index--;
    undo_index++;
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		 numb_key[ digits.charAt(i)+digits.charAt(j) ] = redo_array[redo_index][ digits.charAt(i)+digits.charAt(j) ] ;
	}
	keep_key_flag = 0;		    
	xlate();
	restore_keyblock();		
}

function update_undo(){
    var i,j;

    undo_array[undo_index] = [];
	for (var i=0;i<asize;i++) for (var j=0;j<asize;j++) {
		undo_array[undo_index][ digits.charAt(i)+digits.charAt(j) ] = numb_key[ digits.charAt(i)+digits.charAt(j) ];
	}
    undo_index++;
    redo_index = 0;

}


function handleFiles3(obj){
	var str, fname;
	fname = obj[0];
	str = "handle file: "+fname.fileName;
	//alert(str);
	getAsText3(fname);
	
}


function getAsText3(readFile) {
        
  var reader2 = new FileReader();
  // Handle progress, success, and errors
  //reader.onprogress = updateProgress;
  reader2.onload = loaded2;
  reader2.onerror = errorHandler2;
  
  // Read file into memory as UTF-16      
  //reader.readAsText(readFile, "UTF-16");
  reader2.readAsText(readFile);
  
}

function loaded2(evt) {  
  // Obtain the read file data    
  var fileString = evt.target.result;
  var s;
  /*
  //alert("got to loaded");
  // Handle UTF-16 file dump
    //document.getElementById('output_area').value = fileString;  
  s = "The length of the file is "+fileString.length;
  document.getElementById('output_area2').value = s;
  if (book_type) book_string = fileString;
  else word_list_string = fileString;
  //stop_flag = 1; // restart with the new files
  */
  make_word_list(fileString);
  trie_initialize();
  
}

function errorHandler2(evt) {
  if(evt.target.error.code == evt.target.error.NOT_READABLE_ERR) {
    // The file could not be read
    alert("got error handler");
  }
}

function make_word_list(word_list_string){
	var str, alpha,out_str,c,n,i;
    var white_space = true;
    var word_list_len;
    var new_word_list = {};    
    
	var alpha="abcdefghijklmnopqrstuvwxyz";    
	word_list_string = word_list_string.toLowerCase();
    var wrd = ''
    word_list = [];
    word_list_len = 0;
	for (i=0;i<word_list_string.length;i++){
		c = word_list_string.charAt(i);
        if (c=="'" || c=="’") continue; // skip apostrophes, so don't for example will become dont
		n = alpha.indexOf(c);
		if ( n>=0) {
            if (white_space) { // starting new word
                wrd = c;
                white_space = false;
            }
            else // in middle of word
                wrd += c;
        }
        else { // hit white space
            if (wrd.length == 1)
                wrd = ''; //skip single letter "words".
            if ( wrd != '') { // is this a new word?
                if (!(wrd in new_word_list)) {// new word
                    new_word_list[wrd]=1;
                    word_list[word_list_len++] = wrd; // also put in an array so you can sort it.
                }
                wrd = '';
            }
            white_space = true;
        }
	}
    if ( wrd != '') { // last text element is a letter, presumably ending a word.
        if (!(wrd in new_word_list)) {// new word
            word_list[word_list_len++] = wrd; // also put in an array so you can sort it.
        }
    }
}

function copy_selection () {
            var selection = "";
            var out_str,n,data,i;
            var pos,c,cell;

            var textarea = document.getElementById("output_area2");
            data = textarea.value;
            if ('selectionStart' in textarea) {
                    // check whether some text is selected in the textarea
                if (textarea.selectionStart != textarea.selectionEnd) {
                    selection = textarea.value.substring  (textarea.selectionStart, textarea.selectionEnd);
                }
            }
            else {  // Internet Explorer before version 9
                    // create a range from the current selection
                var textRange = document.selection.createRange ();
                    // check whether the selection is within the textarea
                var rangeParent = textRange.parentElement ();
                if (rangeParent === textarea) {
                    selection = textRange.text;

                }
            }
            if (selection =='') return;
            update_undo();
            document.getElementById('do_redo').disabled = true;
            
            pos = textarea.selectionStart;
            for (i=0;i<selection.length;i++){
              c = selection.charAt(i);
              cell = code_array[pos+i];
              numb_key[cell] = c;
            }
            
            xlate();
            restore_keyblock();
            
}


onload = function() {

    document.getElementById('clear_disk').addEventListener("click",clear_disk);    
    document.getElementById('get_from_disk').addEventListener("click",get_from_disk);    
    document.getElementById('save_to_disk').addEventListener("click",save_to_disk);    
    document.getElementById('drag_crib').addEventListener("click",drag_crib);    
    document.getElementById('drag_left').addEventListener("click",drag_left);    
    document.getElementById('drag_right').addEventListener("click",drag_right);    
    
    document.getElementById('show_sol').addEventListener("click",show_sol);    
    document.getElementById("do_undo").addEventListener("click", do_undo);        
    document.getElementById("do_redo").addEventListener("click", do_redo);            
    
    document.getElementById('start_over').addEventListener("click",start_over);    
    document.getElementById('reset').addEventListener("click",reset);   
    document.getElementById('input4').addEventListener("change",function(){ handleFiles3(this.files) } );               
    //document.getElementById('input2').addEventListener("click",handleFiles ); 
    
// insert hill-climbing listeners
    document.getElementById('do_solve1').addEventListener("click",do_solve);
    document.getElementById('do_stop1').addEventListener("click",do_stop);
    document.getElementById('do_clear1').addEventListener("click",do_clear);
    document.getElementById('copy_selection2').addEventListener("click", copy_selection);
    document.getElementById('input2').addEventListener("change",function(){ handleFiles(this.files) } ); 
    document.getElementById('input3').addEventListener("change",function(){ handleFiles2(this.files) } );           
    
    //loadInitialFile(); // book
    
    reset_key();
    letterblock_setup()
    keyblock_setup()
    freq_color_display()
    //trie_initialize(); // put into file load routine
    message_sending_initialize();
    
}
