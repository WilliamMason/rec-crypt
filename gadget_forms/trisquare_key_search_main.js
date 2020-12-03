
var hsearcher;

function initialize(){
	
   hsearcher = new Worker('trisquare_key_search_worker.js');
   hsearcher.onmessage = function (event) {
        var s;
        var state = event.data.op_choice;
        s = event.data.str;        
        if ( state == 1){ // alert
            alert(s);
            document.getElementById('output_area').value = "error"
            document.getElementById('output2_area').value = "error";
            document.getElementById('output3_area').value = "error";            
            return;
        }
        else if ( state == 2) { // left key
            document.getElementById('output_area').value = s;
        }
        else if ( state == 3) { // top key
            document.getElementById('output2_area').value = s;
        }
        else if ( state == 4) { // middle key
            document.getElementById('output3_area').value = s;
        }
        
    }
}    
        

function do_calc(){
    var s1,s2,s3,s4,s5
    var ciphertext,plaintext,left_key,top_key;

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
        alert('No top key entered');
        return;
    }
    s4 = s4.toUpperCase();
    s4 = s4.replace(/Ø/g,'0');
    
    s5 = document.getElementById('key3_area').value;
    if ( s5==''){
        alert('No Middle key entered');
        return;
    }
    s5 = s5.toUpperCase();
    s5 = s5.replace(/Ø/g,'0');
    
    initialize();    
    document.getElementById('output_area').value = "working . . ."
    document.getElementById('output2_area').value = "working . . .";
    document.getElementById('output3_area').value = "working . . .";    
    hsearcher.postMessage( {ciphertext:s1, plaintext:s2,left_key:s3,top_key:s4,middle_key:s5});
}

onload = function() {
    document.getElementById('do_calc').addEventListener("click",do_calc);    
}    
