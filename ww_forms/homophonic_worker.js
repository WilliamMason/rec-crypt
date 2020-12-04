//log tetragraph scoring
importScripts('tettable.js');
var tet_table = [];
var code;
var plain_text = [];

var BASE0 = 1;
var BASE1 = 26;
var BASE2 = 51;
var BASE3 = 76;

var J_index;

function initialize_tet_table(){
	var i,c,n,v;
  var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	//postMessage("00~tet table initialized");
}
initialize_tet_table();

 
function get_score(s0,s1,s2,s3){
  var i,j,c,n,score;
  
  for (j=0;j<code.length;j++) {
    n = code[j];
    if ( n==0) n = 100;
    if (n<BASE1)
        c = (n-BASE0+s0)%25;
    else if (n<BASE2)
        c = (n-BASE1+s1)%25;
    else if (n<BASE3)
        c = (n-BASE2+s2)%25;
    else
        c = (n-BASE3+s3)%25;
    if ( c>=J_index) c++;
    plain_text[j] = c;
  }
  score = 0;
	for (i=0;i<plain_text.length-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
  
  return(score);
}



function do_solve(str){
	var  out_str,c,n,s,i,j,k;
    var pos,index,best_score,score;
    var op_choice;
    var state,n1,code_len;
    var s0,s1,s2,s3;
	
  	var digits = '0123456789';
  	var alpha = 'abcdefghijklmnopqrstuvwxyz';
	//str = document.getElementById('input_area').value;
	  J_index = alpha.indexOf('j');
    code = [];
    state = 0;
    code_len = 0;
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = digits.indexOf(c);
        if ( n >= 0){
          if (state == 0){
            n1 = n;
            state =1;
          }
          else {
            n = 10*n1+n;
            code[code_len++] = n;
            state = 0;
          }
        }
    }
    //code_len = code.length;
    best_score = 0;
    for (s0=0;s0<25;s0++) for (s1=0;s1<25;s1++) for (s2=0;s2<25;s2++)for(s3=0;s3<25;s3++) {
        score = get_score(s0,s1,s2,s3);
        if ( score > best_score){
            best_score = score;
            s = ''
            for (i=0;i<plain_text.length;i++)
                s += alpha.charAt(plain_text[i]);
            s += '\nkey: ';
            c=s0;
            if ( c>= J_index)c++;
            s +=alpha.charAt(c).toUpperCase();
            c=s1;
            if ( c>= J_index)c++;
            s +=alpha.charAt(c).toUpperCase();
            c=s2;
            if ( c>= J_index)c++;
            s +=alpha.charAt(c).toUpperCase();
            c=s3;
            if ( c>= J_index)c++;
            s +=alpha.charAt(c).toUpperCase();
            n = score.toFixed(2);
            s+=', score: '+n;
            postMessage( {op_choice:1, str:s} );
        }
    }
    postMessage( {op_choice:2, str:"done"});
}

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
    str = event.data.str;
        do_solve(str)
}
