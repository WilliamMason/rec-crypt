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
	str = document.getElementById('crib_area').value;
	str = str.toLowerCase();
    crib_len = 0;
    crib = [];
    //numb_cribs = 0;
    //crib[numb_cribs] = [];
	for (var i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			crib[crib_len++] = n;
	}
    /*
    primer = document.getElementById('primer').value;
    if (primer == ''){
        alert("No primer entered");
        return;
    }
    if (primer.length  != 5){
        alert("Need 5 digit primer!");
        return;
    }
    
    out_str = "crib is " + crib
    document.getElementById('output_area').value = out_str;            
    return;
    out_str = '';
    */
    /*
    for (j1=0;j1<10;j1++) {
            chain_start[0] = j1;
            if (even_flag && j1&1)
            	continue;
    for (j2=0;j2<10;j2++) {
            chain_start[1] = j2;
            if (even_flag && j2&1)
            	continue;
    for (j3=0;j3<10;j3++) {
            if (even_flag && j3&1)
            	continue;
            chain_start[2] = j3;
    for (j4=0;j4<10;j4++) {
            chain_start[3] = j4;
            if (even_flag && j4&1)
            	continue;
    for (j5=0;j5<10;j5++) {
            if (even_flag && j5&1)
            	continue;
            chain_start[4] = j5;
    
    //out_str = "primer "+primer+" ";  
    get_chain();
    if (construct_crib(0) ) {
        out_str += 'OK for ';
        for (i=0;i<5;i++)
            out_str += chain_start[i];
        out_str += ', ';
    }
    }}}}}
    out_str += ' done';
    document.getElementById('output_area').value = out_str;        
    */
    initialize_worker();
    do_processing();
    
}


function initialize_worker(){
    var s1;
    
   hworker = new Worker('primerless_crib_drag_worker.js');
   hworker.onmessage = function (event) {
    s1 = event.data.s1;
    document.getElementById('output_area').value = s1;
    }
}

function do_processing(){
    var s,s2,xfer;
    
    xfer = {};
    xfer["buffer"] = buffer;
    xfer["crib"] = crib;
    hworker.postMessage(xfer);
    
}
