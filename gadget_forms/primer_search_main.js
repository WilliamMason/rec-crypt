var hworker,hworker2;
var stop_flag = 0;
var best_score;
 
function do_search(){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var s,str,s1,s2;
    var op_choice,buf;
    var even_flag,g_flag;
    var specific_primer;
    var digits = '0123456789';
    var specific_primer_flag,c,n;
    
    //initialize_workers();
    if (stop_flag == 1) {
        initialize_workers();
        stop_flag = 0;
    }
    best_score = -10000;
        
    s = document.getElementById('ciphertext').value;
    if ( s == ''){
        alert("No cipertext entered");
        return;
    }
    s1 = document.getElementById('to_show').value;
    if (s1==''){
        alert("Number to show not entered!");
        return;
    }
    if (document.getElementById('std').checked) {
        even_flag = false;
        g_flag = false;
    }
    else if (document.getElementById('even_only').checked) {
        even_flag = true;
        g_flag = false;
    }
    else if (document.getElementById('g_flag').checked) {
        even_flag = false;
        g_flag = true;
    }
    s2 = document.getElementById('specific_primer').value;
    cnt = 0;
    specific_primer = '';
    for (var i = 0;i<s2.length;i++){
      c = s2.charAt(i);
      n = digits.indexOf(c);
      if ( n != -1)
        specific_primer += c;
    }
    specific_primer_flag = false;
    n = specific_primer.length;
    if ( n>0 && n<5){
      alert("Specific primer has less than 5 digits");
      return;
    }
    else if ( n>5){
      alert("Specific primer has more than 5 digits!")
      return;
    }
    else if (n==5)
      specific_primer_flag = true;
    hworker.postMessage({op_choice:1, str:s1,even:even_flag, giz:g_flag,
        flag:specific_primer_flag, primer:specific_primer});
    str = '';
    str += s;
    hworker.postMessage({op_choice:0, str:str});
    document.getElementById('status').value = 'working';

}

function stop_search(){
    hworker.terminate();
    document.getElementById('status').value = 'stopped';
    
    stop_flag = 1;
}

function initialize_workers(){
    var str;
    var s,score;
    var op_choice,word_break;
    
   hworker = new Worker('primer_search_worker.js');
   hworker.onmessage = function (event) {
    str = event.data;
    if (str == '@')
        document.getElementById('status').value = 'done';
    else {
        document.getElementById('output_area').value = str;
        }
    }
   
   // allow for webkit prefix or its removal
   hworker.postMessage = hworker.webkitPostMessage || hworker.postMessage;
   

}

function set_reload(){
    stop_flag = 1; // signal to reinitialize
}


onload=function(){
    document.getElementById('do_search').addEventListener("click",do_search);
    document.getElementById('stop_search').addEventListener("click",stop_search);
    
   initialize_workers();
}
    