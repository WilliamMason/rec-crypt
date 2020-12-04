// use three web workers: the first uses range 1-500,000, the second uses range 500,000 to 1 million, the
//third uses alternative key translation in range 1111 to 10,000.

var hworker,hworker2,hworker3;
var best_score = 0;

function do_solve(){
	var str, s, op_choice;
    var decrypt1, decrypt2, decrypt3;
    var use_6x6;
	
	s = document.getElementById('input_area').value;
    s = s.toUpperCase();
    s = s.replace(/Ø/g,'0');    // in case of 6x6 with Ø for zero.
    if ( s==''){
        alert("No ciphertext entered!");
        return;
    }
    if (document.getElementById('use_6x6').checked)
        use_6x6 = 1;
    else use_6x6 = 0; 
    hworker = new Worker('bazeries_key_worker.js');
    hworker.onmessage = function(event) {
        var op_choice, str,score;
        op_choice = event.data.op_choice;
        str = event.data.str;
        if ( op_choice==1)
            //document.getElementById('output_area').value = str;	
            decrypt1 = str;
        else if ( op_choice==2) {
            document.getElementById('status').value = str;
            if ( !isNaN(str) ){
                score = parseInt(str);
                if (score > best_score) {
                    best_score = score;
                    // decrypt posted before score, so it should already be there.
                    document.getElementById('output_area').value = decrypt1; 
                }
            }
        }
    }
    if (use_6x6==1)
        hworker.postMessage( {op_choice:4});
    hworker.postMessage( {op_choice:1, str:s});
    document.getElementById('status').value = 'working';
    hworker2 = new Worker('bazeries_key_worker.js');
    hworker2.onmessage = function(event) {
        var op_choice, str,score;
        op_choice = event.data.op_choice;
        str = event.data.str;
        if ( op_choice==1)
            //document.getElementById('output_area').value = str;	
            decrypt2 = str;
        else if ( op_choice==2) {
            document.getElementById('status2').value = str;
            if ( !isNaN(str) ){
                score = parseInt(str);
                if (score > best_score) {
                    best_score = score;
                    // decrypt posted before score, so it should already be there.
                    document.getElementById('output_area').value = decrypt2; 
                }
            }
        }
    }
    if (use_6x6==1)
        hworker2.postMessage( {op_choice:4});
    hworker2.postMessage( {op_choice:2, str:s});
    document.getElementById('status2').value = 'working';
    hworker3 = new Worker('bazeries_alt_key_worker.js');
    hworker3.onmessage = function(event) {
        var op_choice, str,score;
        op_choice = event.data.op_choice;
        str = event.data.str;
        if ( op_choice==1)
            //document.getElementById('output_area').value = str;	
            decrypt3 = str;
        else if ( op_choice==2) {
            document.getElementById('status3').value = str;
            if ( !isNaN(str) ){
                score = parseInt(str);
                if (score > best_score) {
                    best_score = score;
                    // decrypt posted before score, so it should already be there.
                    document.getElementById('output_area').value = decrypt3; 
                }
            }
        }
    }
    if (use_6x6==1)
        hworker3.postMessage( {op_choice:4});
    hworker3.postMessage( {op_choice:3, str:s});
    document.getElementById('status3').value = 'working';
    
}

function stop_search(){
    hworker.terminate();
    document.getElementById('status').value = 'stopped';
    hworker2.terminate();
    document.getElementById('status2').value = 'stopped';
    hworker3.terminate();
    document.getElementById('status3').value = 'stopped';
    
    best_score = 0;
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);    
    document.getElementById('stop_search').addEventListener("click",stop_search);       
}    
