// use three web workers: the first uses range 1-500,000, the second uses range 500,000 to 1 million, the
//third uses alternative key translation in range 1111 to 10,000.

var hworker;
var best_score = 0; 

function do_solve(){
	var str, s, op_choice;
    var decrypt1, decrypt2, decrypt3;
    var use_6x6;
	
	s = document.getElementById('input_area').value;
    if ( s==''){
        alert("No ciphertext entered!");
        return;
    }
    s = s.replace(/Ø/g,'0');
    hworker = new Worker('homophonic_worker.js');
    hworker.onmessage = function(event) {
        var op_choice, str,score;
        op_choice = event.data.op_choice;
        str = event.data.str;
        if ( op_choice==1){
            //document.getElementById('output_area').value = str;
            decrypt1 = str;
            document.getElementById('output_area').value = decrypt1;
        }
    }
    hworker.postMessage( {op_choice:1, str:s});
    document.getElementById('output_area').value = 'working';

}

function stop_search(){
    hworker.terminate();
    //document.getElementById('status').value = 'stopped';

    best_score = 0;
}

onload = function() {
    document.getElementById('do_solve1').addEventListener("click",do_solve);
    document.getElementById('stop_search').addEventListener("click",stop_search);
}
