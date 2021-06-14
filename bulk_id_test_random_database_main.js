var hworker;
var worker_initialized_flag = false;

function initialize_worker(){
    var s;
    
   hworker = new Worker('bulk_id_test_random_database_worker.js');
   hworker.onmessage = function (event) {
    s = event.data;
    //s2 = event.data.s2;
    //document.getElementById('output_area').value = s1;
    //document.getElementById('output_area2').value = s2; 
    document.puzzle.cipherstats.value = s
    }
	worker_initialized_flag = true;
	
}

function do_clear() {
	document.puzzle.ciphertext.value = ""
	document.puzzle.cipherstats.value = ""
    document.getElementById('period_entry').value = '10';
}


function do_processing(){
    var s,s2,xfer;
    /*
    s = document.getElementById('input_area').value;
    s2 = document.getElementById('input_area2').value;
    xfer = {};
    xfer["str1"] = s;
    xfer["str2"] = s2;
    */
	if (!worker_initialized_flag)
		initialize_worker();
    code = document.puzzle.ciphertext.value;
    xfer = {};
    xfer["code"] = code;
    xfer["maxPeriod"] = document.getElementById('period_entry').value;

    hworker.postMessage(xfer);
    
}

function do_halt(){
    hworker.terminate();
	worker_initialized_flag = false;
    alert("Processing halted");
	
}

onload=function(){
    document.getElementById('do_processing').addEventListener("click",do_processing); 
   initialize_worker();
}

