var hworker;

var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var lowerC="abcdefghijklmnopqrstuvwxyz";
var digits="0123456789";
var buffer = [];
var buf_len, crib_len;
var crib ;

var quag_array, inv_array, out_str;
var numb_cribs;
var period = 10;

var primer;
var chain = [];
var chain_start = [];
    
	
function do_stop(){
	var str;
	
	hworker.terminate();
	hworker2.terminate();	
	//alert("Search stopped");
	document.getElementById('status').value = 'stopped';
	document.getElementById('status1').value = 'stopped';
	
}
	
function setup_cipher() {
	var i,j,state,cnt,c, data,n1,n;
    var str,index,c1;
    
    str = document.getElementById('cipher_area').value;
    str = str.toUpperCase();
    buf_len = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = upperC.indexOf(c);
        if ( n != -1)
            buffer[buf_len++] = n;
    }

}	
function do_calc(){
	var str, alpha,c,n,cnt,i,j;
    var start_pos,cnt;
    var j1,j2,j3,j4,j5;

    var even_flag = false;
    setup_cipher();
    if ( buf_len == 0){
        alert("No ciphertext entered");
        return;
    }
    alpha="abcdefghijklmnopqrstuvwxyz";
    initialize_worker();
    do_processing();
    
}


function initialize_worker(){
    var s1;
    
   var score, best_score;
   best_score = 0;
   hworker = new Worker('seq_tramp_one_pass_worker.js');
   hworker.onmessage = function (event) { 
	if ( event.data.s2.length>0)
		document.getElementById('status').value = event.data.s2;
	else {
		score = parseFloat(event.data.score);
		if ( score > best_score){
			best_score = score;
			s1 = 'From start: '+event.data.s1;
	
			document.getElementById('output_area').value = s1;
		}
	}
   }
   hworker2 = new Worker('seq_tramp_one_pass_worker_from_end.js');
   hworker2.onmessage = function (event) {
	if ( event.data.s2.length>0)
		document.getElementById('status1').value = event.data.s2;
	else {
		score = parseFloat(event.data.score);
		if ( score > best_score){
			best_score = score;
			s1 = 'From end: '+event.data.s1;
			document.getElementById('output_area').value = s1;
		}
	}
		
   }
	
}

function do_processing(){
    var s,s2,xfer;
    
    xfer = {};
    xfer["buffer"] = buffer;
    hworker.postMessage(xfer);
	hworker2.postMessage(xfer);
    
}
