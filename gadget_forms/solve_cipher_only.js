var code = "EMPTY"
var lowerC="abcdefghijklmnopqrstuvwxyz"
var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
//substate values 0 =no choice,1 = cipher letter chosen, 2 = plain letter chosen, 3 = both letters chosen (use just 1 and 2?)
var substate=0, pchoice=0,cchoice=0
var key_array = '--------------------------'
var puzzle_selected=0,hidden_plaintext='',hidden_key = ''
var keyed_alphabet = '', solving_flag = 0;
var line_len = 80;
var display_directions_flag=0;
var display_letter_count_flag = 0;

var l_count = new Array(26),s_count = new Array(26)

//for checking for correct solution:
var inverse_keyed = new Array();

var fire_fox=!document.all;

var shortcut_displayed = 0;
var max_shortcut_display = 1; // or 2?

	

function break_pt(c) {
	switch(c) {
		case ' ':
		case ',':
		case '"':
			return 1
	}
	return 0
}

function selectmouse(e) {
 var x,s,l,n;
  var fobj       = fire_fox ? e.target : event.srcElement;
  
	if (fobj.className.slice(0,4)=="code" ){
		x = fobj.className.slice(4);
		cletter_click(x);
	}
}
		
document.onmousedown=selectmouse;

function check_key(e) {

    if (solving_flag==0) return(true); // ciphertext not on display yet
    var s,n;
    var evt=window.event? event : e //distinguish between IE's explicit event object (window.event) and Firefox's implicit.
    var c=evt.charCode? evt.charCode : evt.keyCode
    var key=String.fromCharCode(c) // can distinguish caps from lower case
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
    if ( key == '-') {
        shortcut_displayed = max_shortcut_display; // turn off tool tip
        xlate(0);
        return(false);
    }
    return(true);
}

document.onkeypress=check_key;

function xlate(sub_flag) { //sub_flag: 0=erase letter, 1=substitute letter,2=display only, 3=show correct substitutions
							// 4 = display cipher letter selected in yellow
	var k,i,n,pl,pos,str,limit,s,c;
	var symbols_correct,total_letters;
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
	else
		button_default_background(); // no pletter click, reset buttons here
 }
 else {
	 n = -1;
	 pchoice = -1;
 }
	//document.puzzle.key.value =key_array+"\n"+lowerC;
	if (puzzle_selected == 1){
		for (i=0;i<26;i++)
			inverse_keyed[keyed_alphabet.indexOf(upperC.charAt(i))]=i;// for checking sols
		total_letters = 0;
		for (i=0;i<code.length;i++)
			if (upperC.indexOf(code.charAt(i)) > -1) total_letters++;
	}
	str = key_array+"<br>"+lowerC;
	document.getElementById('key_space').innerHTML=	str;
	if (solving_flag == 0) {
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');
		solving_flag = 1;
		document.getElementById('outputblock').style.border = "3px ridge black";
	}
	symbols_correct = 0;
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
		//str += code.slice(pos,limit+1);
		//set up code letters for clicking
		for (i=pos;i<=limit;i++) {
			c=code.charAt(i);
			n = upperC.indexOf(c);
			if ( n != -1) {// code letter
				if ( n == cchoice && sub_flag==4)
					str += '<span style="background-color:Yellow; cursor:default;" class = "code'+n+'">'+c+'</span>';
				else
					str += '<span style="cursor:default;" class = "code'+n+'">'+c+'</span>';
			}
			else // blank or punctuation, etc.
				str += c;
		}
		pl = ''
		for (i=pos;i<=limit;i++) {
			c = code.charAt(i);
			n = key_array.indexOf(c)
			if (n != -1 && c!='-') {
				if(puzzle_selected==1){
					if (inverse_keyed[n] == upperC.indexOf(c)){ // correct letter
						symbols_correct++;
						if (sub_flag==3) pl += '<font color="green"><b>'+lowerC.charAt(n)+'</b></font>';
						else if ( n == pchoice)
							pl += '<font color="brown">'+lowerC.charAt(n)+'</font>';
						else
							pl = pl+lowerC.charAt(n);
					}
					// incorrect letter
					else if ( sub_flag==3)
						pl += '<font color="red"><u>'+lowerC.charAt(n)+'</u></font>';
					else if ( n == pchoice)
						pl += '<font color="brown">'+lowerC.charAt(n)+'</font>';
					else
						pl = pl+lowerC.charAt(n);
				}
				else {//  no info on correctness, puzzle pasted in
					if ( n == pchoice)
						pl += '<font color="brown">'+lowerC.charAt(n)+'</font>';
					else
						pl = pl+lowerC.charAt(n);
				}
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
	if (sub_flag==3){
		str += '<center><b>Correct in <font color="green">Green</font>. Incorrect <font color="red"><u>underlined in Red</font>.</u></b></center>';
	}
    else if (sub_flag==4 && shortcut_displayed < max_shortcut_display){
    	str += '<br><i>(Keyboard shortcuts: upper case "clicks" cipher letters, lower case "clicks" plain letters)</i>';
        shortcut_displayed++;
    }
	else if (symbols_correct>0 && symbols_correct == total_letters){
		str += '<center><font color="green"><h3>Puzzle solved!</font>';
		// is key cmpletely filled in?
		k=1;
		for (i=0;i<26;i++){
			n = upperC.indexOf(key_array.charAt(i))
			if (inverse_keyed[i] != n){
				k=0;
				break;
			}
		}
		if ( k==1)
			str += '<font color="green"> . . . Key solved!</font>';
		str += '</h3></center>';
	}
	document.getElementById('outputblock').innerHTML=str;
	if (sub_flag==3){
		str = '';
		for (i=0;i<26;i++){
			n = upperC.indexOf(key_array.charAt(i))
			if (inverse_keyed[i] == n)
				str += '<font color="green">'+key_array.charAt(i)+'</font>';
			else if (n == -1)
				str += key_array.charAt(i);				
			else
				str += '<font color="red"><u>'+key_array.charAt(i)+'</u></font>';
				
		}
		str += "<br>"+lowerC;
		document.getElementById('key_space').innerHTML=	str;
		button_default_background();// since about to set substate to 0
	}
	substate=0
}	

function s_compare(a,b) {
		return b[1]-a[1]
}		


function do_encryption() {
	// encypt hidden_plaintext with hidden_key
	var i,c,pl,ka,flag,j
	ka = ''
	hidden_key = hidden_key.toUpperCase()
	for (i=0;i<hidden_key.length;i++) {
		c = hidden_key.charAt(i)
		n = ka.indexOf(c)
		if ( n == -1)
			ka = ka+c
	}
	for (i=0;i<26;i++) {
		c = upperC.charAt(i)
		n = ka.indexOf(c)
		if ( n == -1)
			ka = ka+c
	}
	offset = randomvalue(0,25);
	for (i=0;i<26;i++) {
		flag=1;
		for (j=0;j<26;j++) {
			if (ka.charAt( (j+offset)%26) == upperC.charAt(j) ) {
				flag = 0;
				break;
			}
		}
		if ( flag==1)
			break;
		offset=(offset+1)%26;
	}
	keyed_alphabet = ''
	for (i=0;i<26;i++)
		keyed_alphabet = keyed_alphabet+ka.charAt( (i+offset)%26 )
	code = ''
	pl = hidden_plaintext.toUpperCase()
	for (i=0;i<pl.length;i++) {		
		c = pl.charAt(i);
		n = upperC.indexOf(c);
		if (n != -1)
			c = keyed_alphabet.charAt(n);
		code = code+c;
	}
}
	
function button_default_background(){
	var i,s,b;
	
	for (i=0;i<26;i++){
		s = 'b'+i;
		b = document.getElementById(s);
		b.style.backgroundColor = '';
	}
}
		
function cletter_click(i) {
	var b,s;
	
	button_default_background();
	cchoice = i;
	s = 'b'+i;
	b = document.getElementById(s);
	b.style.backgroundColor = "Yellow";
	xlate(4); // highlight letters in the ciphertext
	substate = 1;

}	

function pletter_click(i) {
	button_default_background();
	if (substate==1) {
		pchoice = i;
		xlate(1)
		substate=0;
	}
}	


function setup_key() {
	var i,s;
	
	key_array = '--------------------------';
	s = key_array+"<br>"+lowerC;
	//document.puzzle.key.value =key_array+"\n"+lowerC;
	document.getElementById('key_space').innerHTML=	s;
	substate = 0
}		

function start_over() {
	var i
	//key_array = '--------------------------';
	//document.puzzle.key.value =key_array+"\n"+lowerC;	
	button_default_background();
	setup_key();
	if (solving_flag ==0) {
		code = document.puzzle.ciphertext.value
		code = code.toUpperCase()
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');		
		//solving_flag = 1; 
	}
	else restore_input_area();
	document.puzzle.ciphertext.value = code
	substate=0
	solving_flag = 0; //OK to edit ciphertext
	xlate(2); // display dashes right away
}		

function restore_input_area(){
	var s;
	document.getElementById('outputblock').style.border = "white";
	s=' Cipher: <br>';
	s += '  <textarea id="ciphertext" style="font-family: monospace;" name="ciphertext" rows="6" cols="90"></textarea><br>';	
	document.getElementById('outputblock').innerHTML=s;
	solving_flag = 0;
}

function do_erase1(){
            if (solving_flag==1){
                //do_erase = confirm("Erase the current puzzle?")
                //if (do_erase == false) return;
                show_box(2,"Erase the current puzzle?" );
            }
}



function do_erase(){

    close_box();
	if ( solving_flag ==1) restore_input_area();
	setup_key()
	document.puzzle.ciphertext.value = ''
	puzzle_selected = 0;
	solving_flag=0;
	document.getElementById('key_caption').innerHTML='Key:<br>';						
	document.getElementById('let_space').innerHTML=' ';	
	document.getElementById('let_space').style.border = "white";
	display_letter_count_flag = 0;
	button_default_background();
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

    else if ( n==1) { // new puzzle
        str += '<br><input type = button id="do_erase9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }

    else if ( n==2) { // erase_puzzle
        str += '<br><input type = button id="do_undo9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    else if ( n==3) { // retrieve saved work
        str += '<br><input type = button id="do_undo9" value="OK">'
        str += '&nbsp;&nbsp;&nbsp;&nbsp;<input type = button id="close_box9" value="Cancel">'
    }
    
    document.getElementById('light').innerHTML = str;
    if ( n==0)
        document.getElementById('close_box9').addEventListener("click", close_box);  
        
    else if ( n==1) { // new puzzle
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_erase9').addEventListener("click", new_puzzle);  
    }

    else if ( n==2) { // erase_puzzle
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_undo9').addEventListener("click", do_erase);  
    }
    else if ( n==3) { // retrieve saved work
        document.getElementById('close_box9').addEventListener("click", close_box);  
        document.getElementById('do_undo9').addEventListener("click", get_from_disk);  
    }

}
function close_box(){
    var s;
    document.getElementById('light').style.display='none';
    document.getElementById('fade').style.display='none';
    //s = "result was "+n;
    //document.getElementById('result').innerHTML=s;
}

function letter_count() {
	var i,n,str,s;


	if ( display_letter_count_flag == 0){	
		s = 'Key: &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp ';
		s += '&nbsp &nbsp;&nbsp;&nbsp;&nbsp Letter count:<br>';
		document.getElementById('key_caption').innerHTML=s;
		document.getElementById('let_space').style.border = "1px ridge black";	
		if (solving_flag == 0) {
			code = document.puzzle.ciphertext.value
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
		if ( puzzle_selected == 0) {// pasted-in puzzle, make sure dashes are set up
			xlate(2);
			button_default_background();
		}
	}
	else {
		document.getElementById('key_caption').innerHTML='Key:<br>';								
		document.getElementById('let_space').innerHTML=' ';	
		document.getElementById('let_space').style.border = "white";
		display_letter_count_flag = 0;
	}

}	

function save_to_disk(){
	var i,j, str;


if( window.chrome && chrome.storage){    // using packaged app   
    var data_store = {};
    
    data_store["solve_a_cipher_3@#6.cipher"] = code;
    data_store["solve_a_cipher_3@#6.key"] = key_array;
    data_store["solve_a_cipher_3@#6.puzzle_selected"]= puzzle_selected;
    if ( puzzle_selected==1){
		data_store["solve_a_cipher_3@#6.hidden_key"]= hidden_key;
		data_store["solve_a_cipher_3@#6.keyed_alphabet"]= keyed_alphabet;
		data_store["solve_a_cipher_3@#6.hidden_plaintext"]= hidden_plaintext;
		str = '';
		str += hint_index;
		if (hint_index<10) str += ' ';
		for (i=0;i<26;i++) {
			str += hint_order[i];
			if (hint_order[i]<10)
				str += ' ';
		}
		data_store["solve_a_cipher_3@#6.hint_order"]= str;
	}
    else {
		data_store["solve_a_cipher_3@#6.hidden_key"]= '';
		data_store["solve_a_cipher_3@#6.keyed_alphabet"]= '';
		data_store["solve_a_cipher_3@#6.hidden_plaintext"]= '';
        data_store["solve_a_cipher_3@#6.hint_order"]= '';
    }
    chrome.storage.local.set(data_store, function() {
      show_box(0,"Work saved.");
  });
}  
else {
    
		if (typeof(localStorage) == 'undefined' ) {
		//alert('Your browser does not support HTML5 localStorage. Try Chrome.');
        show_box(0,'Your browser does not support HTML5 localStorage. Try Chrome.');
	} 
	else {
		try {
			localStorage.setItem("solve_a_cipher_3@#6.cipher", code); //saves to the database, ?key?, ?value?
		} catch (e) {
			if (e == QUOTA_EXCEEDED_ERR) {
			//alert('Quota exceeded!'); //data wasn?t successfully saved due to quota exceed so throw an error
            show_box(0,'Quota exceeded!');
			}
		}
	}
	localStorage.setItem("solve_a_cipher_3@#6.key", key_array);
	localStorage.setItem("solve_a_cipher_3@#6.puzzle_selected", puzzle_selected);
	if ( puzzle_selected==1){
		localStorage.setItem("solve_a_cipher_3@#6.hidden_key", hidden_key);
		localStorage.setItem("solve_a_cipher_3@#6.keyed_alphabet", keyed_alphabet);
		localStorage.setItem("solve_a_cipher_3@#6.hidden_plaintext", hidden_plaintext);
		str = '';
		str += hint_index;
		if (hint_index<10) str += ' ';
		for (i=0;i<26;i++) {
			str += hint_order[i];
			if (hint_order[i]<10)
				str += ' ';
		}
		localStorage.setItem("solve_a_cipher_3@#6.hint_order", str);
	}
	//alert("Work saved.");
    show_box(0,"Work saved.");

}
}

function get_from_disk(){
	var s,i,j,k;
    var t_code;

    close_box();
    var items;
    
    var key1 = "solve_a_cipher_3@#6.cipher";
    var key2 = "solve_a_cipher_3@#6.key";
    var key3 = "solve_a_cipher_3@#6.puzzle_selected";
    var key4 = "solve_a_cipher_3@#6.hidden_key";
    var key5 = "solve_a_cipher_3@#6.keyed_alphabet";
    var key6 = "solve_a_cipher_3@#6.hidden_plaintext";
    var key7 = "solve_a_cipher_3@#6.hint_order";
    
if( window.chrome && chrome.storage){    // using packaged app   
   chrome.storage.local.get([key1,key2,key3,key4,key5,key6,key7], function(items) {
	var s,i,j,k;
    var temp;
   
    temp = items[key1];
    if (temp == undefined){
		show_box(0,"No cipher stored");
		return
	}
    code = temp;
	solving_flag = 1;
	start_over();
	key_array = items[key2];
	xlate(2);
    temp = items[key3];
	puzzle_selected = parseInt(temp);
	if ( puzzle_selected==1){
		hidden_key=items[key4];
		keyed_alphabet= items[key5];
		hidden_plaintext= items[key6];
		s = items[key7];;
		hint_index = parseInt(s.slice(0,2));
		for (i=0;i<26;i++)
			hint_order[i] = parseInt(s.slice(2*(i+1),2*(i+1)+2));
	}
    
  });
}  
else {    
	t_code = localStorage.getItem("solve_a_cipher_3@#6.cipher");
	if (t_code == undefined){
		//alert("No cipher stored");
        show_box(0,"No cipher stored");
		return
	}
    code = t_code;
	solving_flag = 1;
	start_over();
	key_array = localStorage.getItem("solve_a_cipher_3@#6.key");
	xlate(2);
	puzzle_selected = parseInt(localStorage.getItem("solve_a_cipher_3@#6.puzzle_selected"));
	if ( puzzle_selected==1){
		hidden_key=localStorage.getItem("solve_a_cipher_3@#6.hidden_key");
		keyed_alphabet=localStorage.getItem("solve_a_cipher_3@#6.keyed_alphabet");
		hidden_plaintext=localStorage.getItem("solve_a_cipher_3@#6.hidden_plaintext");
		s = localStorage.getItem("solve_a_cipher_3@#6.hint_order");
		hint_index = parseInt(s.slice(0,2));
		for (i=0;i<26;i++)
			hint_order[i] = parseInt(s.slice(2*(i+1),2*(i+1)+2));
			
	}
}
}

function clear_disk(){

    var key1 = "solve_a_cipher_3@#6.cipher";
    var key2 = "solve_a_cipher_3@#6.key";
    var key3 = "solve_a_cipher_3@#6.puzzle_selected";
    var key4 = "solve_a_cipher_3@#6.hidden_key";
    var key5 = "solve_a_cipher_3@#6.keyed_alphabet";
    var key6 = "solve_a_cipher_3@#6.hidden_plaintext";
    var key7 = "solve_a_cipher_3@#6.hint_order";

if( window.chrome && chrome.storage){   // using packaged app
    chrome.storage.local.remove([key1,key2,key3,key4,key5,key6,key7], function() {
            show_box(0,"work cleared from disk");
        });
    }  
else {
	localStorage.removeItem("solve_a_cipher_3@#6.cipher");
	localStorage.removeItem("solve_a_cipher_3@#6.key");
	localStorage.removeItem("solve_a_cipher_3@#6.puzzle_selected");
	localStorage.removeItem("solve_a_cipher_3@#6.hidden_key");
	localStorage.removeItem("solve_a_cipher_3@#6.keyed_alphabet");
	localStorage.removeItem("solve_a_cipher_3@#6.hidden_plaintext");
	localStorage.removeItem("solve_a_cipher_3@#6.hint_order");
	//alert("work cleared from storage");
    show_box(0,"work cleared from storage");
    
}
}

function check_storage(){
	var s, do_get;

    var key1 = "solve_a_cipher_3@#6.cipher";
    var key2 = "solve_a_cipher_3@#6.key";
    var key3 = "solve_a_cipher_3@#6.puzzle_selected";
    var key4 = "solve_a_cipher_3@#6.hidden_key";
    var key5 = "solve_a_cipher_3@#6.keyed_alphabet";
    var key6 = "solve_a_cipher_3@#6.hidden_plaintext";
    var key7 = "solve_a_cipher_3@#6.hint_order";

if ( window.chrome && chrome.storage) {    
   chrome.storage.local.get([key1,key2,key3,key4,key5,key6,key7], function(items) {
        var s,i,j,k;
        var temp;
   
        temp = items[key1];
        if (temp != undefined){
            show_box(3,"Retrieve stored work?" );
        }
    });
}    
else {
	s = localStorage.getItem("solve_a_cipher_3@#6.cipher");
	if (s != undefined){
        show_box(3,"Retrieve stored work?" );
	}
}
}

function show_directions(){
	var str;
	if ( display_directions_flag == 0) {
		str = '<h3>Directions</h3>';
    	str += '<ul>'
    	str += '<li>Type or paste the ciphertext into cipher box.</li>';
    	str += '<li>Click on a cipher letter button -- or on a letter in the cipher display -- and then click on its plaintext substitute. Repeat until solution.</li>';
    	str += '<li> To remove a substitution, click on the cipher letter to be removed from the key, then click on the "-" button.</li>';
        str += '<li>Keyboard shortcuts: upper case "clicks" cipher letters, lower case "clicks" plain letters</li>';        
    	str += '<li>To erase the entire key, click the "Start Over" button.</li>'
    	str += '</ul>';
    	document.getElementById('directions').innerHTML=str;
    	display_directions_flag = 1;
	}
	else {
		document.getElementById('directions').innerHTML=' ';
		display_directions_flag = 0;
	}			
}

function display_message(message){
	var s;
	
	s = '<span id="m_display">';
	s += message;
	s += '<br><br><center><input value="Close" id="hide_message2" type="button"></center>';
	s += '</span>';
	document.getElementById('cm_display').innerHTML=s;
	document.getElementById('m_display').style.visibility="visible";
    document.getElementById('hide_message2').addEventListener("click",hide_message);    
    
}

function hide_message(){
	document.getElementById('m_display').style.visibility="hidden";
}

onload = function() {
    document.getElementById('go1').addEventListener("click",do_erase1);    
    document.getElementById('letter_count1').addEventListener("click",letter_count);    
    document.getElementById('show_directions1').addEventListener("click",show_directions);    
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
    
    document.getElementById('start_over1').addEventListener("click",start_over);            
    document.getElementById('save_to_disk1').addEventListener("click",save_to_disk);                
    document.getElementById('get_from_disk1').addEventListener("click",get_from_disk);     
    document.getElementById('clear_disk1').addEventListener("click",clear_disk);                    
    setup_key( );
    check_storage();
    
}
