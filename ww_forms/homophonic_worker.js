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

var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    var weighted_tet_sum, unweighted_tet_sum;
    
    s = "0making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    // initialize tet table
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = 0;
    // make tet table with no blanks
    max_n = 0;
    max_v=0;
    state = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n == -1) continue; //not a letter
        if (state == 0) {
            n1 = n;
            c1 = c;
        }
        else if (state == 1) {
            n2 = n;
            c2 = c;
        }
        else if (state == 2) {
            n3 = n;
            c3 = c;
        }
        else {
            //x = n+26*n3+26*26*n2+26*26*26*n1;
            x = n1+26*n2+26*26*n3+26*26*26*n;
            tet_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet_table[x] > max_v) {
                max_v = tet_table[x];
                mc1 = c1;
                mc2 = c2;
                mc3 = c3;
                mc4 = c;
            }
            max_n++;
            c1 = c2;
            c2 = c3;
            c3 = c;
        }
        state++;
    }    
    s = '0there were '+max_n+' tetragraphs with greatest value of '+max_v;
    s += ' for tet: '+mc1+mc2+mc3+mc4;
    weighted_tet_sum = 0;
    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
        n = tet_table[i];
        tet_table[i] = Math.log(1+tet_table[i]);
        weighted_tet_sum += n*tet_table[i];
        unweighted_tet_sum += tet_table[i];            
    }
    // global variables for this tet table
    random_score = 100*unweighted_tet_sum / (26*26*26*26);
    std_eng_score = 100*weighted_tet_sum / max_n;
       
    /*
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    */
    
    postMessage(s);    
}    


function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}	
initialize_tet_table();

/*
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
*/
 
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

debugger;
  var state = event.data.op_choice;
  if (state ==2){

   str = event.data.str;
   make_table(str);	  
  }
  if (state==1){
	     str = event.data.str;
        do_solve(str)
  }
}
