
var hsearcher;

function initialize(){
	
   hsearcher = new Worker('twosquare_key_search_worker.js');
   hsearcher.onmessage = function (event) {
        var s;
        var state = event.data.op_choice;
        s = event.data.str;        
        if ( state == 1){ // alert
            alert(s);
            document.getElementById('output_area').value = "error"
            document.getElementById('output2_area').value = "error";
            return;
        }
        else if ( state == 2) { // left key
            document.getElementById('output_area').value = s;
        }
        else if ( state == 3) { // right key
            document.getElementById('output2_area').value = s;
        }
    }
}    
        

function do_calc(){
    var s1,s2,s3,s4;
    var ciphertext,plaintext,left_key,right_key;

    s1 = document.getElementById('cipher_area').value;
    if ( s1==''){
        alert('No ciphertext entered');
        return;
    }
    s1 = s1.toUpperCase();
    s1 = s1.replace(/Ø/g,'0');
    s2 = document.getElementById('plain_area').value;
    if ( s2==''){
        alert('No plaintext entered');
        return;
    }
    s2 = s2.toUpperCase();
    s2 = s2.replace(/Ø/g,'0');
    s3 = document.getElementById('key1_area').value;
    if ( s3==''){
        alert('No left key entered');
        return;
    }
    s3 = s3.toUpperCase();
    s3 = s3.replace(/Ø/g,'0');
    s4 = document.getElementById('key2_area').value;
    if ( s4==''){
        alert('No right key entered');
        return;
    }
    s4 = s4.toUpperCase();
    s4 = s4.replace(/Ø/g,'0');
    initialize();    
    document.getElementById('output_area').value = "working . . ."
    document.getElementById('output2_area').value = "working . . .";
    hsearcher.postMessage( {ciphertext:s1, plaintext:s2,left_key:s3,right_key:s4});
}

onload = function() {
    document.getElementById('do_calc').addEventListener("click",do_calc);    
}    
