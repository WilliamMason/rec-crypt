//var fire_fox=!document.all;
var current_position , nxt_position;
var plaintexts,current_plain,numb_plain;
var ciph_type='arist';
var key_type = 'K2';
var lowerC="abcdefghijklmnopqrstuvwxyz"
var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
var con_count;
var current_code, final_output, current_work, final_work;
var saved_con, encrypted_con;
var line_len = 65;
var pat_line_len = 76;
var pat_limit = 7; // max number of code groups per line in Patristocrat
var original_plain; // preserve original capitalization
var top_key, bottom_key;
var let_count = new Array();
var numb_syms = "+-0123456789";

function do_popup(){ // show key array in pop-up window
	var s;
    /*
	for (i = 0;i<document.entryform.ktype.length;i++) 
		if (document.entryform.ktype[i].checked){
			key_type = document.entryform.ktype[i].value;
			break;
	}
    */
    if (document.getElementById('type1').checked)
        key_type = "K1";
    else if (document.getElementById('type2').checked)
        key_type = "K2";
    else if (document.getElementById('type3').checked)
        key_type = "K3";
    else if (document.getElementById('type4').checked)
        key_type = "K4";
    
	ka = ''
	// get key
	s = document.getElementById('key').value.toUpperCase();
	if ( s==''){
		alert("No Key entered!");
		return;
	}
	//document.debug.output_area.value=s;
	for (i=0;i<s.length;i++) {
		c = s.charAt(i)
		if( upperC.indexOf(c) == -1) continue;
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
	
	s = document.getElementById('shift').value
	if ( s==''){
		alert("No shift entered!");
		return;
	}
	n = numb_syms.indexOf(s.charAt(0));
	offset = parseInt(s);
	if (offset<0 || offset > 25 || n==-1 ){
		alert("Shift not a number between 0 and 25!");
		return;
	}
	if (key_type=='K2'){
		// K2 encryption	
		// get closest value that sends no letter into itself
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
		k1 = lowerC;
		k2 = keyed_alphabet;
	}
	else if (key_type=='K1'){
		// K1 encryption	
		// get closest value that sends no letter into itself
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
		k1 = keyed_alphabet.toLowerCase();
		k2 = upperC;
	}
	else if (key_type=='K3'){
		// K3 encryption	
		if ( offset == 0) offset = 1;
		keyed_alphabet = ''
		for (i=0;i<26;i++)
			keyed_alphabet = keyed_alphabet+ka.charAt( (i+offset)%26 )
		k1 = ka.toLowerCase();
		k2 = keyed_alphabet;
	}
	else if (key_type=='K4'){	
		ka2 = ''
		// get key2
		s = document.getElementById('key2').value.toUpperCase();
		if ( s==''){
			alert("No Second Key entered!");
			return;
		}
		//document.debug.output_area.value=s;
		for (i=0;i<s.length;i++) {
			c = s.charAt(i)
			if( upperC.indexOf(c) == -1) continue;
			n = ka2.indexOf(c)
			if ( n == -1)
				ka2 = ka2+c
		}
		for (i=0;i<26;i++) {
			c = upperC.charAt(i)
			n = ka2.indexOf(c)
			if ( n == -1)
				ka2 = ka2+c
		}
		// get closest value that sends no letter into itself
		for (i=0;i<26;i++) {
			flag=1;
			for (j=0;j<26;j++) {
				if (ka.charAt( (j+offset)%26) == ka2.charAt(j) ) {
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
		k1 = ka2.toLowerCase();
		k2 = keyed_alphabet;
	}
/*	
	shiftwin = window.open("", "KeyWindow","width=320,height=100");
	s = '<html><head><TITLE>view key</TITLE>';
	s += '</head><body>';
	s += '<div style="font-family:monospace; font-size: 15px; ">';
	s += 'key array:<br>'+k1+'<br>'+k2+'</div>';
	s += '</body></html>';

	// write to window
	shiftwin.document.writeln(s);
*/
/*
	// not monospaced font
	s = 'key\n'+k1+'\n'+k2+'\n';
	alert(s);	
*/
/*
	s='<INPUT onclick=encrypt(); type=button value="Encrypt" >';	
	s += '&nbsp &nbsp &nbsp <INPUT onclick=save_con(); type=button value="Save con" >';	
	s += '&nbsp &nbsp &nbsp <INPUT onclick=next_cipher(); type=button value="Next Cipher" >';
	s += '&nbsp &nbsp &nbsp <INPUT onclick=show_output(); type=button value="Output saved cons" >';
	s += '&nbsp &nbsp &nbsp <INPUT onclick=do_popup(); type=button value="update key view =>" >';	
	s += '<textarea id="keyview"  name = "key_area" cols=30; rows=3;></textarea>';
	document.getElementById('button_actions').innerHTML=s;	
*/    
	s = 'key table:\n'+k1+'\n'+k2+'\n';	
	document.getElementById('keyview').value = s;
	
}

// places where you can split an Aristocrat
function break_pt(c) {
	switch(c) {
		case ' ':
		case ',':
//		case '"':
		case '\n':
		case '\r':
			return 1
	}
	return 0
}

function reset(){
	document.getElementById('key').value='';
	document.getElementById('key2').value='';	
	document.getElementById('shift').value='';
	document.getElementById('con').value = '';	
	document.getElementById('title').value = '';
	document.getElementById('crib').value = '';	
	document.getElementById('nom').value = '';
	saved_con = 0;	
	encrypted_con = 0;
    /*
	s='<INPUT onclick=encrypt(); type=button value="Encrypt" >';	
	s += '&nbsp &nbsp &nbsp <INPUT onclick=save_con(); type=button value="Save con" >';	
	s += '&nbsp &nbsp &nbsp <INPUT onclick=next_cipher(); type=button value="Next Cipher" >';
	s += '&nbsp &nbsp &nbsp <INPUT onclick=show_output(); type=button value="Output saved cons" >';
	s += '&nbsp &nbsp &nbsp <INPUT onclick=do_popup(); type=button value="view current key table" >';	
	document.getElementById('button_actions').innerHTML=s;	
    */
	
}
function next_cipher(){
	var n;
	if (saved_con == 0){
		do_skip = confirm("Current con not saved, skip it?")
		if ( do_skip == false) return
	}
	reset()	
	if(current_position == -1){
		alert("No more plaintexts left!");
		return;
	}
	con_count += 1;
	nxt_position = plaintexts.indexOf('@',current_position+1)
	//document.debug.output_area.value=nxt_position;
	current_position += 1; // skip @
	if (nxt_position != -1)
		current_plain = plaintexts.slice(current_position,nxt_position);
	else
		current_plain = plaintexts.slice(current_position);	
	// skip initial white space
	n=0;
	while (break_pt(current_plain.charAt(n)) && n< current_plain.length) n += 1;
	current_plain = current_plain.slice(n);
	original_plain = current_plain; // preserve
  	document.getElementById('cipher').readOnly=false;		
	document.getElementById('cipher').value = current_plain;
  	document.getElementById('cipher').readOnly=true;
 	document.getElementById('cipher_numb').value=''+con_count+' of '+numb_plain;  			
	current_position = nxt_position;
}

function encrypt(){
	var i,c,pl,ka,flag,j,s,ka2,n,cnt;
	// get cipher type
	
    /*
	for (i = 0;i<document.entryform.ctype.length;i++) 
		if (document.entryform.ctype[i].checked){
			ciph_type = document.entryform.ctype[i].value;
			break;
	}
	for (i = 0;i<document.entryform.ktype.length;i++) 
		if (document.entryform.ktype[i].checked){
			key_type = document.entryform.ktype[i].value;
			break;
	}
	*/
    if (document.getElementById('arist_type').checked)
        ciph_type = "arist";
    else if (document.getElementById('pat_type').checked)
        ciph_type = "pat";
        
    if (document.getElementById('type1').checked)
        key_type = "K1";
    else if (document.getElementById('type2').checked)
        key_type = "K2";
    else if (document.getElementById('type3').checked)
        key_type = "K3";
    else if (document.getElementById('type4').checked)
        key_type = "K4";
        
	ka = ''
	// get key
	s = document.getElementById('key').value.toUpperCase();
	if ( s==''){
		alert("No Key entered!");
		return;
	}
	//document.debug.output_area.value=s;
	for (i=0;i<s.length;i++) {
		c = s.charAt(i)
		if( upperC.indexOf(c) == -1) continue;
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
	//document.debug.output_area.value=ka;
	s = document.getElementById('shift').value
	if ( s==''){
		alert("No shift entered!");
		return;
	}
	n = numb_syms.indexOf(s.charAt(0));
	offset = parseInt(s);
	if (offset<0 || offset > 25 || n==-1 ){
		alert("Shift not a number between 0 and 25!");
		return;
	}
	//document.debug.output_area.value=s+offset;
	// next str for grouping plaintext Patristocrat letters for work sheet
	if (key_type=='K2'){
		// K2 encryption	
		// get closest value that sends no letter into itself
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
		//document.debug.output_area.value=keyed_alphabet
	    top_key = lowerC;
		bottom_key = keyed_alphabet;	
		code = ''
//		flag = 1;
		pl = current_plain.toUpperCase()
		for (i=0;i<pl.length;i++) {		
			c = pl.charAt(i);
			n = upperC.indexOf(c);
//			if ( n == -1 && flag ==1) continue; // haven't got to first letter yet
//			flag = 0;
			if (n != -1)
				c = keyed_alphabet.charAt(n);
			code = code+c;

		}
	}
	else if (key_type=='K1'){
		// K1 encryption	
		// get closest value that sends no letter into itself
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
		//document.debug.output_area.value=keyed_alphabet	
		top_key = keyed_alphabet.toLowerCase();
		bottom_key = upperC;
		code = ''
//		flag = 1;
		pl = current_plain.toUpperCase()
		for (i=0;i<pl.length;i++) {		
			c = pl.charAt(i);
			n = keyed_alphabet.indexOf(c);
//			if ( n == -1 && flag ==1) continue; // haven't got to first letter yet
//			flag = 0;
			if (n != -1)
				c = upperC.charAt(n);
			code = code+c;
		}
	}
	else if (key_type=='K3'){
		// K3 encryption	
		if ( offset == 0) offset = 1;
		keyed_alphabet = ''
		for (i=0;i<26;i++)
			keyed_alphabet = keyed_alphabet+ka.charAt( (i+offset)%26 )
		//document.debug.output_area.value=keyed_alphabet
		top_key = ka.toLowerCase();
		bottom_key = keyed_alphabet;			
		code = ''
//		flag = 1;
		pl = current_plain.toUpperCase()
		for (i=0;i<pl.length;i++) {		
			c = pl.charAt(i);
			n = ka.indexOf(c);
//			if ( n == -1 && flag ==1) continue; // haven't got to first letter yet
//			flag = 0;
			if (n != -1)
				c = keyed_alphabet.charAt(n);
			code = code+c;
		}
	}
	else if (key_type=='K4'){
		// K4 encryption	
		ka2 = ''
		// get key2
		s = document.getElementById('key2').value.toUpperCase();
		if ( s==''){
			alert("No Second Key entered!");
			return;
		}
		//document.debug.output_area.value=s;
		for (i=0;i<s.length;i++) {
			c = s.charAt(i)
			if( upperC.indexOf(c) == -1) continue;
			n = ka2.indexOf(c)
			if ( n == -1)
				ka2 = ka2+c
		}
		for (i=0;i<26;i++) {
			c = upperC.charAt(i)
			n = ka2.indexOf(c)
			if ( n == -1)
				ka2 = ka2+c
		}
		// get closest value that sends no letter into itself
		for (i=0;i<26;i++) {
			flag=1;
			for (j=0;j<26;j++) {
				if (ka.charAt( (j+offset)%26) == ka2.charAt(j) ) {
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
		top_key = ka2.toLowerCase();
		bottom_key = keyed_alphabet;			
		//document.debug.output_area.value=keyed_alphabet	
		code = ''
//		flag = 1;
		pl = current_plain.toUpperCase()
		for (i=0;i<pl.length;i++) {		
			c = pl.charAt(i);
			n = ka2.indexOf(c);
//			if ( n == -1 && flag ==1) continue; // haven't got to first letter yet
//			flag = 0;
			if (n != -1)
				c = keyed_alphabet.charAt(n);
			code = code+c;
		}
	}
	
	s='<br>Current Ciphertext:<br><textarea id="con"  name = "con_area" cols=90; rows=5;></textarea>';
	document.getElementById('ciphertext_space').innerHTML=s;	
	// format
	if (ciph_type =='arist')
		s = 'A-'+con_count+' ';
	else
		s = 'P-'+con_count+' ';
	s += document.getElementById('title').value+' '+key_type+' ';
	j=0; // number of different letters
	cnt = 0; // total number of letters
	for (i=0;i<26;i++) let_count[i]=0;
	for (i=0;i<code.length;i++){
		c = code.charAt(i);
		n = upperC.indexOf(c);
		if ( n != -1){
			if (let_count[n]==0) j+=1;
			let_count[n] += 1;
			cnt += 1;
		}
	}
	if (ciph_type == 'arist')
		s += '['+cnt+'] ';
	else
		s += '['+cnt+'/'+j+'] ';	
	crb = document.getElementById('crib').value.toUpperCase() 
	s_crb=''
	for (i=0;i<crb.length;i++){
		c = crb.charAt(i);
		n = upperC.indexOf(c)
		if (n != -1)
			s_crb += upperC.charAt( (n+20)%26 );
	}
	if (s_crb != '')
		s_crb = '('+s_crb+')';
	//s += s_crb+' '+document.getElementById('nom').value+'\n';
	s += s_crb;
	str=document.getElementById('nom').value;
	if (ciph_type == 'arist')
		n = line_len-s.length-str.length;
	else
		n = pat_line_len-s.length-str.length;
	if ( n>0)
		for (i=0;i<n;i++)
			s += ' ';
	s += str+'\n';
	work_sheet = '\nWorksheet:\n'

	if (ciph_type=='arist'){	
		// parse code so we split after words, but don;t run too long
		// global replace of line feeds and carriage returns with blank
		code = code.replace(/[\n\r]/g,' ');
		pl = current_plain.replace(/[\n\r]/g,' ');
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
			str = str+code.slice(pos,limit+1)+"\n"
			work_sheet += code.slice(pos,limit+1)+"\n"
			work_sheet += pl.slice(pos,limit+1)+"\n"
			pos = limit+1
		}

	}
	else {// patristocrat
		str = '';
		wrk_plain = '';
		wrk_code = '';
		pos = 0;
		limit = 0;
		for (i=0;i<code.length;i++) {		
			c = code.charAt(i);
			n = upperC.indexOf(c);
			if ( n != -1){
				wrk_plain += current_plain.charAt(i)+' ';
				wrk_code += c+' ';
				str += c+' ';
				pos +=1;
				if ( pos == 5){
					wrk_plain += ' ';
					wrk_code += ' ';
					str += ' ';
					pos = 0;
					limit += 1
					if (limit == pat_limit){
						str += '\n';
						work_sheet += wrk_code+'\n'+wrk_plain+'\n';
						limit = 0;
						wrk_plain = '';
						wrk_code = '';
					}
				}
			}
		}
		if (limit !=0)
			//str += '\n';
			str = str.slice(0,-1)+'.\n';
			work_sheet += wrk_code+'\n'+wrk_plain+'\n';
	}
	s += str;					
	current_code = s;
	if ( key_type=='K4')
		s += '\nkeys: '+document.getElementById('key').value.toUpperCase()+', '
			+document.getElementById('key2').value.toUpperCase();
	else
		s += '\nkey: '+document.getElementById('key').value.toUpperCase();	
	s += '\nkey array:\n'+top_key+'\n'+bottom_key+'\n';
	s += '\nplaintext:\n'+original_plain;
	s += work_sheet+'\n-----------------\n';
	document.getElementById('con').value = s;
	current_work = s;
	encrypted_con = 1;
}
function save_con(){
	if (encrypted_con == 0){
		alert("Con not encrypted yet. Nothing to save!");
		return;
	}	
	final_output += current_code+'\n';
	final_work += current_work+'\n';
	current_code = '';
	current_work = '';
	saved_con = 1;
	alert("saved!");	
}

function show_output(){
	s='<br><span style="font-weight:bold;">Final Output: </span> (to copy output to clipboard, ';
	s += 'click inside box, then Ctl-A to highlight, then Ctl-C to copy):<br>';
	s += '<textarea id="con"  name = "con_area" cols=90; rows=5;></textarea>';
	document.getElementById('ciphertext_space').innerHTML=s;	
	
	document.getElementById('con').value = final_output+final_work;
}

function initialize(){
	plaintexts = document.getElementById('ciphers').value;
	final_output = '';
	final_work = '======= solutions========\n';
	current_code = '';
	current_work = '';
	con_count = 1;
	saved_con = 0;		
	encrypted_con = 0;
	current_position = 0;
	nxt_position = plaintexts.indexOf('@',current_position+1);
	//document.debug.output_area.value=nxt_position;
	if (nxt_position != -1)
		current_plain = plaintexts.slice(current_position,nxt_position);
	else
		current_plain = plaintexts.slice(current_position);	
	// find number of plaintexts
	numb_plain = 1;
	n = nxt_position;
	while ( n!= -1){
		n = plaintexts.indexOf('@',n+1);
		numb_plain += 1;
	}
	// skip initial white space
	n=0;
	while (break_pt(current_plain.charAt(n)) && n< current_plain.length) n += 1;
	current_plain = current_plain.slice(n);
	original_plain = current_plain; // preserve
	//document.debug.output_area.value=current_plain;
	s= 'Directions: Select cipher & key types, fill in boxes, click encrypt. Then if desired, click save. ';
	s += '<br> To bring up next cipher, click Next cipher button. When all done, click Output saved cons';
	document.getElementById('directions').innerHTML=s;
	//s='Current Plaintext:<br><textarea id="cipher"  name = "cipherarea" cols=90; rows=5;></textarea>';
	s='Current Plaintext: <input type = "text" id ="cipher_numb" readOnly size=10 value=" '+con_count;
	s += ' of '+numb_plain+'">';
	s += '<br><textarea id="cipher"  name = "cipherarea" cols=90; rows=5;></textarea>';
	document.getElementById('controlArea').innerHTML=s;	
	s = '';
	s +='<br>Cipher Type: <input type="radio"  checked name="ctype" id="arist_type" value="arist"> Aristrocrat'
	s +='<input type="radio" name="ctype" id="pat_type" value="pat"> Patristocrat'
	
	s +='&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp  Key Type: <input type="radio" name="ktype" value="K1" id="type1"> K1'
	s +='<input type="radio" checked name="ktype" value="K2" id="type2"> K2'
	s +='<input type="radio" name="ktype" value="K3" id="type3"> K3'		
	s +='<input type="radio" name="ktype" value="K4" id="type4"> K4'			
	
	s += '<br><br>Key: <input type="text" id="key"  name="key_area" size=20>';	
	s += '&nbsp &nbsp &nbsp Second Key (K4 only): <input type="text" id="key2"  name="key_area2" size=20>';	
	s += '&nbsp &nbsp &nbsp Key shift (0-25): <input type="text" id="shift"  name="shift_area" size=5>';	
	s += '<br><br><br>Title: <input type="text" id="title"  name="title_area" size=20>';	
	s += '&nbsp &nbsp &nbsp Crib: <input type="text" id="crib"  name="crib_area" size=20>';		
	s += '&nbsp &nbsp &nbsp Nom: <input type="text" id="nom"  name="nom_area" size=20>';	
	document.getElementById('keySpace').innerHTML=s;
  	document.getElementById('cipher').readOnly=false;		
	document.getElementById('cipher').value = current_plain;
  	document.getElementById('cipher').readOnly=true;		
	s='<INPUT id="encrypt1" type=button value="Encrypt" >';	
	s += '&nbsp &nbsp &nbsp <INPUT id="save_con1" type=button value="Save con" >';	
	s += '&nbsp &nbsp &nbsp <INPUT id="next_cipher1" type=button value="Next Cipher" >';
	s += '&nbsp &nbsp &nbsp <INPUT id="show_output1" type=button value="Output saved cons" >';
	//s += '&nbsp &nbsp &nbsp <INPUT id="do_popup1" type=button value="view current key table" >';	
	document.getElementById('button_actions').innerHTML=s;	
    document.getElementById("encrypt1").addEventListener("click", encrypt);
    document.getElementById("save_con1").addEventListener("click", save_con);
    document.getElementById("next_cipher1").addEventListener("click", next_cipher);
    document.getElementById("show_output1").addEventListener("click", show_output);
    //document.getElementById("do_popup1").addEventListener("click", do_popup);
	current_position = nxt_position;
}

onload = function() {
    document.getElementById("initialize1").addEventListener("click", initialize);
}    