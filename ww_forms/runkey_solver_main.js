var fire_fox=!document.all;
var curs_pos;
var col_display=0;
var stopped_flag = true;
var hworker,hworker2;
var best_score = -1000;
var current_channel = 0;
var porta_warning  = true;

//make all three areas scroll together
function scrolltheothers(){
	var farea = document.runform.cipherarea;
	var sarea = document.runform.keyarea;
	var tarea = document.runform.plainarea;
	sarea.scrollLeft = farea.scrollLeft;
	tarea.scrollLeft = farea.scrollLeft;
	setTimeout("scrolltheothers()",10);
}
window.onload = scrolltheothers;


var code;
var dobj, solving_flag =0;
var letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ-"
var symbols="abcdefghijklmnopqrstuvwxyz-"
var ciph_type='vig';

//next function is for positioning the cursor in a textarea
function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
	else if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	}
}       

function show_column(where) {
	
	if (fire_fox) begin = where.selectionStart;
	else {
		sel = document.selection.createRange();
		if(sel.text==""){
			sel.text='µµµ';
			dummy = where.createTextRange();
			dummy.findText('µµµ');
			dummy.select();
			begin=where.value.indexOf('µµµ');
			document.selection.clear();					
		}
	}
	c = begin+1;
	s = 'Clicked on column: '+c;
	document.getElementById('col_position').innerHTML=s;
	col_display=1;
	//document.debug.output_area.value= begin;
	
}

function decrypt_symbol(ci,ki,origin){
	var v,s,ky,n;
	
	if (solving_flag==1) {//which cipher type is checked?
		for (var i = 0;i<document.buttonarea.ctype.length;i++) 
			if (document.buttonarea.ctype[i].checked){
				ciph_type = document.buttonarea.ctype[i].value;
				break;
		}
		//update button area with the fixed cipher type
		s = 'Cipher type: '
		if (ciph_type=='vig') {
            s += 'Vigenere'
		}
		else if(ciph_type=='bea'){
            s += 'Beaufort'
		}
		else if(ciph_type=='var'){
            s += 'Variant'
		}
		else if(ciph_type=='por'){
            s += 'Porta'
            // allow shifts with warning
            //document.getElementById("drag_bl").disabled = true;
            //document.getElementById("drag_br").disabled = true;
		}        
		s += '<br><br><INPUT id="start_over" type=button value="Start Over" >'
		s += '<INPUT id= "reset" type=button value="Erase Cipher" >	'
		document.getElementById('button_actions').innerHTML=s;		
		solving_flag=2;
        document.getElementById('start_over').addEventListener("click",start_over); 
        document.getElementById('reset').addEventListener("click",reset); 
	}				
	if (ki<0 || ki>25)
		return(26); // index of dash in symbols array
	if (ciph_type=='vig') {
		v = (26-ki+ci)%26;
		return(v);
	}
	else if(ciph_type=='bea'){
		if ( origin==1) ci = - ci;
		v = (26+ki+ci)%26;
		//document.debug.output_area.value= ki+' '+ci+' '+v;
		return(v);
	}
	else if(ciph_type=='var'){
		if ( origin==1) ci = - ci;		
		v = (26+ki-ci)%26;
		//document.debug.output_area.value= ki;
		return(v);
	}
	else if(ciph_type=='por'){
		if ( origin==1) {
            ky = Math.floor(ki/2);        
            v = ci;
            if (v < 13){
                v += ky;
                if (v < 13) v += 13;
            }
            else {
                v -= ky;
                if (v > 12) v -= 13;
            }  
        }
        else { // if ki entered in plaintext area, can't narrow letter down to one choice.
            //v = 26; // use this choice if you want to ignore top plaintext
            if ( porta_warning){
                s = "Porta Warning\n"
                s += "The top plaintext letter could be one of two consecutive letters. ";
                s += "Using the lower one\n(This warning won't be shown again.)"
                alert(s);
                porta_warning = false;
            }
            // exactly one of ki, ci is less than 13
            v = ci-ki;
            if ( v< 0 ) v = -v;
            if ( v > 12 ) v -= 13;
            v = 2*v; // could also be v = 2*v+1;
            
        }
		return(v);
	}
		
}

function drag_crib(row,dir) {
	var t,s;
	
	if ( row=="top") {
		t = document.getElementById('keytext').value;
		if (dir=="right")
			t = '-'+t.slice(0,-1)
		else
			t = t.slice(1)+'-';
		s = ''
		t = t.toLowerCase();
		for (var i=0 ;i<code.length;i++) {
			cic = code.charAt(i);
			ci = letters.indexOf(cic)
			ni = t.charAt(i);
			n = symbols.indexOf(ni);
			v = decrypt_symbol(ci,n,1);
			s += symbols.charAt(v);
		}
	}
	else {
		s = document.getElementById('plaintext').value;
		if (dir=="right")
			s = '-'+s.slice(0,-1)
		else
			s = s.slice(1)+'-';
		t = ''
		s = s.toLowerCase();		
		for (var i=0 ;i<code.length;i++) {
			cic = code.charAt(i);
			ci = letters.indexOf(cic)
			ni = s.charAt(i)
			n = symbols.indexOf(ni);
			v = decrypt_symbol(ci,n,0);
			t += symbols.charAt(v);
		}
	}
	document.getElementById('keytext').value=t;
	document.getElementById('plaintext').value=s;
}

function setup_code() {
	var s
	
	data = document.getElementById('cipher').value
	data = data.toUpperCase();
	
	
//	document.debug.output_area.value= data; 	
	
	state=0;
	code = '';
	for (i=0;i<data.length;i++) {
		c = data.charAt(i);
		if ( letters.indexOf(c) >-1 && letters.indexOf(c) < 26) {
				code = code+c;
		}
	}
	solving_flag=1;
	s = code;
	document.getElementById('cipher').value=s;
	s = "Select cipher type, then enter decrypted letters in top or bottom plaintext box";
	s += '<br>To erase enter a dash "-". Can enter crib & use shift buttons to drag it. For computer assistance click Solve button.<br>';
	document.getElementById('directions').innerHTML=s;	
	s = '<INPUT id= "drag_tl" type=button value="<=shift Top Plaintext left" >';
	s += '&nbsp &nbsp &nbsp &nbsp<INPUT id="drag_tr" type=button value="shift Top Plaintext right=>" >';
	s +='<br><br><INPUT id="drag_bl" type=button value="<=shift Bottom Plaintext left" >';
	s += '&nbsp &nbsp <INPUT id="drag_br" type=button value="shift Bottom Plaintext right=>" >';
	document.getElementById('cribblock').innerHTML=s;	
    document.getElementById('drag_tl').addEventListener("click",function(){drag_crib("top","left")}); 	
    document.getElementById('drag_tr').addEventListener("click",function(){drag_crib("top","right")}); 	
    document.getElementById('drag_bl').addEventListener("click",function(){drag_crib("bot","left")}); 	
    document.getElementById('drag_br').addEventListener("click",function(){drag_crib("bot","right")}); 	
//	document.debug.output_area.value= code; 
    s = "<br> computer output:";
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'status 0: <input type=text value = "idle" size = 3 id="status0" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'status 1: <input type=text value = "idle" size = 3 id="status1" >'    
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'Number of Trial Decrypts: <input type=text value = "3000000" size = 6 id="max_trials" >'
    
    s += '<br>';
    s += '<textarea rows = 5  cols = 100 id="computer_output">';
    s += '</textarea>';
    s += '<br><input type=button id = "do_solve" value = "Solve">'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'fudge 0: <input type=text value = "0.5" size = 3 id="fudge0" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';
    s += 'fudge 1: <input type=text value = "0.3" size = 3 id="fudge1" >'
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';  
    s += '<input type=button id = "stop_solve" value = "Stop Solver">'    
    s += '&nbsp;&nbsp;&nbsp;&nbsp;';  
    s += '<input type=checkbox id = "word_scoring" > Use word list scoring.'
    s += '<br><br><input type=button id="copy_selection" value="Copy selection from trial decrypt to worksheet">';
    document.getElementById('computerblock').innerHTML=s;	
    document.getElementById('do_solve').addEventListener("click",do_solve);
    document.getElementById('stop_solve').addEventListener("click",stop_solve);
    document.getElementById('copy_selection').addEventListener("click",copy_selection);
}	

function reset() {
	do_erase = confirm("Erase the current cipher?")
	if ( do_erase == true) {
		document.getElementById('cipher').value='';			
		document.getElementById('keytext').value='';	
		document.getElementById('plaintext').value='';
		code = '';
		solving_flag = 0;
		s = '<INPUT id="initialize" type=button value="Initialize" >'
		document.getElementById('button_actions').innerHTML=s;	
        document.getElementById('initialize').addEventListener("click",make_template);
		s='Directions: Type or paste cipher into the box labeled cipher. Then click the Initialize button.<BR><br>';
		document.getElementById('directions').innerHTML=s;	
		s='&nbsp'
		document.getElementById('cribblock').innerHTML=s;	
	}	
	
}

function start_over() {
	solving_flag = 1; // change from 2 to 1 to allow change of cipher type
	s= '';
	for (i=0;i<code.length;i++)
		s += '-';
	document.getElementById('keytext').value=s;	
	document.getElementById('plaintext').value=s;	
	s='<form name="buttonarea"><input type="radio" checked name="ctype" value="vig"> Vigenere'
	s +='<input type="radio" name="ctype" value="bea"> Beaufort'
	s +='<input type="radio" name="ctype" value="var"> Variant'		
	s +='<input type="radio" name="ctype" value="por"> Porta'		    
	s += '</form>'
	s += '<br><br><INPUT id="start_over" type=button value="Start Over" >'
	s += '<INPUT id= "reset" type=button value="Erase Cipher" >	'
	document.getElementById('button_actions').innerHTML=s;		
    document.getElementById('start_over').addEventListener("click",start_over); 
    document.getElementById('reset').addEventListener("click",reset); 
	
}

function make_template() {
	var s;
	
	if (solving_flag==0) setup_code()
	s= '';
	for (i=0;i<code.length;i++)
		s += '-';
	document.getElementById('keytext').value=s;	
	document.getElementById('plaintext').value=s;	
	s='<form name="buttonarea"><input type="radio" checked name="ctype" value="vig"> Vigenere'
	s +='<input type="radio" name="ctype" value="bea"> Beaufort'
	s +='<input type="radio" name="ctype" value="var"> Variant'	
	s +='<input type="radio" name="ctype" value="por"> Porta'		    	
	s += '</form>'
	s += '<br><br><INPUT id="start_over" type=button value="Start Over" >'
	s += '<INPUT id= "reset" type=button value="Erase Cipher" >	'
	document.getElementById('button_actions').innerHTML=s;		
    document.getElementById('start_over').addEventListener("click",start_over); 
    document.getElementById('reset').addEventListener("click",reset); 
	
}



function process_key(e,where){
	var x = e.keyCode;
	if ( col_display==1) {
		s = '&nbsp'
		document.getElementById('col_position').innerHTML=s;		
		col_display=0;
	}
  	//document.debug.output_area.value= x;
	if(x!=37&&x!=38&&x!=40&&x!=45&&x!=39&&x!=9){
		if (x==8 || x == 46) {//backspace key or delete key
			if (fire_fox) begin = where.selectionStart;
			else {
				sel = document.selection.createRange();
				if(sel.text==""){
					sel.text='µµµ';
					dummy = where.createTextRange();
					dummy.findText('µµµ');
					dummy.select();
					begin=where.value.indexOf('µµµ');
					document.selection.clear();					
				}
			}
			if (x==8)
				 begin -= 1;
			if (where.name == 'keyarea') {
				k = 'keytext';
				s = 'plaintext';
			}
			else {
				s = 'keytext';
				k = 'plaintext';
			}
			k1 =document.getElementById(k).value;
			t = k1.slice(0,begin)+'-'+k1.slice(begin+1);
			if (x==8)
				t += '-';
			document.getElementById(k).value=t;
			s1 =document.getElementById(s).value;
			t = s1.slice(0,begin)+'-'+s1.slice(begin+1);
			document.getElementById(s).value=t;
			//show_column(where,mv);			
			//reset cursor position, delay 10 milliseconds for updated string to get into place
			setTimeout("setSelectionRange(document.getElementById(k), begin, begin)",10);
			return;
		}	
		overwrite(where);
		//ci = document.getElementById('cipher').value;
		if (where.name == 'keyarea') {
			//update corresponding letter in plaintext
			s = document.getElementById('plaintext').value
			//document.debug.output_area.value= s;
			if ( fire_fox) begin = where.selectionStart;
			else begin = curs_pos;
			//document.debug.output_area.value= x+"at "+begin;
			//cic = ci.charAt(begin);
			cic = code.charAt(begin);
			ci = letters.indexOf(cic)
			n = x-65;
			//document.debug.output_area.value= n;
			v = decrypt_symbol(ci,n,1);
			t = s.slice(0,begin)+symbols.charAt(v)+s.slice(begin+1)
			//document.debug.output_area.value= v;
			document.getElementById('plaintext').value=t;
		}			
		if (where.name == 'plainarea') {
			//update corresponding letter in keytext
			s = document.getElementById('keytext').value
			if ( fire_fox) begin = where.selectionStart;
			else begin = curs_pos;
			//cic = ci.charAt(begin);
			cic = code.charAt(begin);
			ci = letters.indexOf(cic)
			n = x-65;
			v = decrypt_symbol(ci,n,0);
			t = s.slice(0,begin)+symbols.charAt(v)+s.slice(begin+1)
			document.getElementById('keytext').value=t;
		}			

	}
}

function overwrite(where) {

 if (document.selection) { //Internet explorer
	where.focus();
	sel = document.selection.createRange();
	if(sel.text==""){
		sel.text='µµµ';
		dummy = where.createTextRange();
		dummy.findText('µµµ');
		dummy.select();
		pos=where.value.indexOf('µµµ');
		//document.debug.output_area.value= "here";
		curs_pos = pos;//global variable
		//document.debug.output_area.value= curs_pos;
		begin=pos;
		document.selection.clear();
		dummy.moveEnd('character',1);
		dummy.select();
		where.focus();
	}
 }
 else if (where.selectionStart || where.selectionStart == '0') {//Firefox
	begin = where.selectionStart;
	end = where.selectionEnd;
	//document.debug.output_area.value= where.name;
	if(end==begin){
		where.selectionEnd=end+1;
		where.focus();
	}
 }
}

function initialize_worker(){
    var s1,s2,score;
    
   hworker = new Worker('runkey_solver_worker.js');
   hworker.onmessage = function (event) {
    s1 = event.data.s1;
    s2 = event.data.s2;    
    document.getElementById('status0').value = s2;
    if ( s2 != 'Done') {
        score = parseFloat(s2);
        if (score > best_score || current_channel==0){
            document.getElementById('computer_output').value = s1;
            best_score = score;
            current_channel = 0;
        }
   }
   }
   hworker2 = new Worker('runkey_solver_worker.js');
   hworker2.onmessage = function (event) {
    s1 = event.data.s1;
    s2 = event.data.s2;    
    document.getElementById('status1').value = s2;
    if ( s2 != 'Done') {
        score = parseFloat(s2);
        if (score > best_score || current_channel==1){
            document.getElementById('computer_output').value = s1;
            best_score = score;
            current_channel = 1;
        }
   }
   }
   
}


function do_solve(){
    var xfer;
    
    if ( stopped_flag) {
        initialize_worker();
        stopped_flag = false;
    }
    best_score = -10000;
    if ( solving_flag<2){
        for (var i = 0;i<document.buttonarea.ctype.length;i++) 
            if (document.buttonarea.ctype[i].checked){
                ciph_type = document.buttonarea.ctype[i].value;
                break;
        }  
    }    
    xfer = {};
    xfer["str1"] = code;
    xfer["cipher_type"] = ciph_type;
    xfer["crib"] = document.getElementById('keytext').value;
    xfer["fudge"] = document.getElementById('fudge0').value;
    xfer["max_trials"] = document.getElementById('max_trials').value;
    if (document.getElementById('word_scoring').checked)
        xfer["word_scoring"] = true;
    else
        xfer["word_scoring"] = false;
    hworker.postMessage(xfer);
    xfer["fudge"] = document.getElementById('fudge1').value; 
    hworker2.postMessage(xfer);
}

function stop_solve(){
    hworker.terminate();
    hworker2.terminate(); 
    document.getElementById('status0').value = "stopped";
    document.getElementById('status1').value = "stopped";
    stopped_flag = true;
}

function copy_selection () {
            var selection = "";
            var out_str,n,data,i,s,x;
            
            var textarea = document.getElementById("computer_output");
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
            n = code.length;
            if (textarea.selectionStart < n && textarea.selectionEnd < n){
                var t = document.getElementById("keytext").value;
                out_str = t.slice(0,textarea.selectionStart)+selection+t.slice(textarea.selectionEnd);
                document.getElementById("keytext").value = out_str;
                var b = document.getElementById("plaintext").value;
                s = data.slice(textarea.selectionStart+n+1,textarea.selectionEnd+n+1);// add 1 to account for the '\n' separating top and bottom in trial decrypt
                out_str = b.slice(0,textarea.selectionStart)+ s +b.slice(textarea.selectionEnd);
                document.getElementById("plaintext").value = out_str;
            }
            else if(textarea.selectionStart >n && textarea.selectionEnd <= 2*n){
                var t = document.getElementById("keytext").value;
                s = data.slice(textarea.selectionStart-n-1,textarea.selectionEnd-n-1);// subtract 1 to account for the '\n' separating top and bottom in trial decrypt
                out_str = t.slice(0,textarea.selectionStart-n-1)+ s +t.slice(textarea.selectionEnd-n-1);
                document.getElementById("keytext").value = out_str;
                var b = document.getElementById("plaintext").value;
                out_str = b.slice(0,textarea.selectionStart-n-1)+ selection +b.slice(textarea.selectionEnd-n-1);
                document.getElementById("plaintext").value = out_str;
            }
            else if (textarea.selectionStart < n && textarea.selectionEnd >n && textarea.selectionEnd <= 2*n){
            // break selection into two parts, key part and plaintext part
                // keytext part
                x = selection.indexOf('\n'); // '\n' separates key from plaintext in trial decrypt output
                var t = document.getElementById("keytext").value;
                s = selection.slice(0,x);
                out_str = t.slice(0,textarea.selectionStart)+s;
                document.getElementById("keytext").value = out_str;
                var b = document.getElementById("plaintext").value;
                s = data.slice(textarea.selectionStart+n+1,textarea.selectionStart+x+n+1);// add 1 to account for the '\n' separating top and bottom in trial decrypt
                out_str = b.slice(0,textarea.selectionStart)+ s;
                document.getElementById("plaintext").value = out_str;
                // plaintext part
                t = document.getElementById("keytext").value;
                s = data.slice(0,textarea.selectionEnd-n-1);// subtract 1 to account for the '\n' separating top and bottom in trial decrypt
                out_str = s +t.slice(textarea.selectionEnd-n-1);
                document.getElementById("keytext").value = out_str;
                b = document.getElementById("plaintext").value;
                out_str =  selection.slice(x+1) +b.slice(textarea.selectionEnd-n-1);
                document.getElementById("plaintext").value = out_str;                
            }
            
}

onload=function(){
    document.getElementById('initialize').addEventListener("click",make_template); 
    document.getElementById('keytext').addEventListener("click",function(){show_column(this)}); 
    document.getElementById('plaintext').addEventListener("click",function(){show_column(this)}); 
    document.getElementById('keytext').addEventListener("keydown",function(){process_key(event,this)}); 
    document.getElementById('plaintext').addEventListener("keydown",function(){process_key(event,this)}); 
    document.getElementById('cipher').addEventListener("scroll",scrolltheothers); 
}
