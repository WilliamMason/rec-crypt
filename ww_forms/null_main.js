var code = "EMPTY";
var lowerC="abcdefghijklmnopqrstuvwxyz";
var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//substate values 0 =no choice,1 = cipher letter chosen, 2 = plain letter chosen, 3 = both letters chosen (use just 1 and 2?)
var substate=0, pchoice=0,cchoice=0
var key_array = '--------------------------'
var inverse_key = new Array(26);

var solving_flag = 0;
var line_len = 80;
var cipher_type = 0;

var l_count = new Array(26),s_count = new Array(26);
var hclimber;
var stop_flag = 0;

function initialize(){
	var str;
    var hname;
    
   if (document.getElementById('np').checked == true) 
    hname = 'hill_climb_null3.js';
   else if (document.getElementById('sk').checked == true) 
    hname = 'hill_climb_null3_skip.js';    
   else
    hname = 'hill_climb_null3_escape.js';   
   hclimber = new Worker(hname);
   hclimber.onmessage = function (event) {
	 str = event.data;
	 if (str.charAt(0) == '0')
     	document.getElementById('output_area').value = str.slice(1);
     else if (str.charAt(0) == '1'){
     	//alert(str.slice(1));
     	document.getElementById('status').value = str.slice(1);
 	}
    else if (str.charAt(0) == '2'){
     	//alert(str.slice(1));
     	document.getElementById('debug_area').value = str.slice(1);
 	}
 	
     else
     	document.getElementById('output_area').value = str;   
   };
  
}


function do_clear(){
		do_erase = confirm("Erase the current cipher?")
		if ( do_erase == true) {
			document.getElementById('input_area').value = '';
			solving_flag=0;
			document.getElementById('output_area').value = '';
			document.getElementById('crib').value = '';
		}
}	


function do_calc(){
	var s,str,n;
	
	if (solving_flag ==0){
		code = document.getElementById('input_area').value
		code = code.toUpperCase()
	}
	if (stop_flag == 1){
		initialize();
		stop_flag = 0;
	}
	// global replace of line feeds and carriage returns with blank
	code = code.replace(/[\n\r]/g,' ');
	max_trials = parseInt(document.getElementById('numb_trials').value);	
	str = '@'+max_trials;
    if (document.getElementById('np').checked == true) {
        n = parseInt(document.getElementById('max_key_len').value);	
        str += ':'+n;
        n = parseInt(document.getElementById('max_letters').value);	
        str += ':'+n;
    }
    else if (document.getElementById('sk').checked == true) {
        n = parseInt(document.getElementById('pat_len').value);	
        str += ':'+n;
        n = parseInt(document.getElementById('skip_len').value);	
        str += ':'+n;
    }    
    else {
        n = parseInt(document.getElementById('max_let_pos').value);	
        str += ':'+n;
        n = parseInt(document.getElementById('max_skip').value);	
        str += ':'+n;
    }
    n = parseInt(document.getElementById('plain_limit').value);	
    str += ':'+n;
    if (document.getElementById('repeat_crib').checked == true)
        str += ':1'
    else
        str += ':0'
	n = Math.floor( Math.random()*1000);
	str += ':'+n;
	hclimber.postMessage(str);  
	str = '~'+ document.getElementById('crib').value;
	hclimber.postMessage(str);  		
	hclimber.postMessage(code);  
	
}

function do_stop(){
	var str;
	
	hclimber.terminate();
	document.getElementById('status').value = "Stopped";
	stop_flag = 1;
}

onload = function() {
    document.getElementById('do_calc1').addEventListener("click",do_calc);    
    document.getElementById('do_stop1').addEventListener("click",do_stop);    
    document.getElementById('do_clear1').addEventListener("click",do_clear);   
    document.getElementById('np').addEventListener("change", function(){stop_flag = 1;});     
    document.getElementById('es').addEventListener("change", function(){stop_flag = 1;});     
    document.getElementById('sk').addEventListener("change", function(){stop_flag = 1;});         
    initialize();
}    
