// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

var tet_table = [];
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	

// in case we need custom table option
function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
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
        if (state = 0) {
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
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
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

 
function get_score(plain){
    var score = 0;
    var i,n;
    // for(var i = 0;i<plain.length-1;i++)
        // score += logdi[plain[i]][plain[i+1]];
	for (i=0;i<plain.length-3;i++){
		n = plain[i]+26*plain[i+1]+26*26*plain[i+2]+26*26*26*plain[i+3];
		score += tet_table[n];
	}
    return(score);
}    



String.prototype.reverse= function(){
 var s= '', L= this.length;
 while(L){
  s+= this.charAt(--L);
 }
 return s;
}


var word1 = ['one','two','three','four','five','six','seven','eight','nine']
var word2 = ['eleven','twelve','thirteen','fourteen','fifteen','sixteen', 'seventeen','eighteen','nineteen']
var word3 = ['error','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety']

var pos_digits = '123456789';
var alpha="abcdefghiklmnopqrstuvwxyz";
var digits = '0123456789';
var complete_alpha = "abcdefghijklmnopqrstuvwxyz";
var use_6x6 = 0;
var alpha1="a1b2c3d4e5f6g7h8i9j0klmnopqrstuvwxyz"    	

// convert from alpha1 order to regular alpha order
var con_dic = {0: 0, 1: 26, 2: 1, 3: 27, 4: 2, 5: 28, 6: 3, 7: 29, 8: 4, 9: 30, 10: 5, 11: 31, 12: 6, 13: 32, 14: 7, 15: 33, 16: 8, 17: 34, 18: 9, 19: 35, 20: 10, 21: 11, 22: 12, 23: 13, 24: 14, 25: 15, 26: 16, 27: 17, 28: 18, 29: 19, 30: 20, 31: 21, 32: 22, 33: 23, 34: 24, 35: 25}


function get_6x6_score(plain){
    var score = 0;
    var i,n;
    var n1,n2,n3,n4;
    // convert from alpha1 order to alpha order, skip digits
    // for(var i = 0;i<plain.length-1;i++) {
        // n1 = con_dic[plain[i]];
        // n2 = con_dic[plain[i+1]];
        // if ( n1>25 || n2>25) continue;
        // score += logdi[n1][n2];
    // }
	for (i=0;i<plain.length-3;i++){
        n1 = con_dic[plain[i]];
        n2 = con_dic[plain[i+1]];
        n3 = con_dic[plain[i+2]];
        n4 = con_dic[plain[i+3]];
        if ( n1>25 || n2>25 || n3>25 || n4 > 25) continue;
		n = n1+26*n2+26*26*n3+26*26*26*n4;
		score += tet_table[n];
	}    
    
    return(score);
}    


function xlate_baz(numb_str){
    var numb,i,n,word_len;
    var to_go, txt;

    numb = [];
    word_len = 0;
    for (i=0;i<numb_str.length;i++){
         n = pos_digits.indexOf(numb_str.charAt(i));
         if (n== -1){
            //alert("No zeros or non digit characters allowed in number!");
            return('Q'); // error signal
         }
         numb[word_len++] = n;
    }
    if ( word_len>6){
        alert("Number must be less than a million!");
        return('Q');
    }
    to_go = word_len;
    txt='';
    while(to_go > 0){
		if (to_go==6||to_go==4||to_go==3||to_go==1) // in [6,4,3,1]:
			txt += word1[ numb[word_len-to_go]]
		else {
			if (numb[word_len-to_go] == 0){
				to_go -= 1			
				txt += word2[ numb[word_len-to_go]]
            }
			else
				txt += word3[ numb[word_len-to_go]]
        }
		if (to_go == 4)
			txt += "thousand"
		else if (to_go==3 || to_go==6)// in [3,6]:
			txt += "hundred"		
		to_go -= 1
    }
	return(txt);
}        
    
function expand_key(text){
    var i,n,c;
	var key;
    
    var txt = text.toLowerCase();
    key = '';
    for (i=0;i<txt.length;i++){
        c = txt.charAt(i)
        n = alpha.indexOf(c);
        if ( n>=0){
            n = key.indexOf(c);
            if ( n == -1)
                key += c;
        }
    }
    for (i=0;i<26;i++){
        c = alpha.charAt(i)
        n = key.indexOf(c);
        if ( n == -1)
            key += c;
    }
    return(key);
}    

function expand_6x6_key(text){
    var i,n,c,j;
	var key;
    
    var txt = text.toLowerCase();
    key = '';
    for (i=0;i<txt.length;i++){
        c = txt.charAt(i)
        n = alpha1.indexOf(c);
        if ( n>=0){
            j = key.indexOf(c);
            if ( j == -1) {
                key += c;
                if ( n <= 19)
                    key += alpha1.charAt(n+1); // assume n is a letter, not a digit; append the corresponding digit
            }
        }
    }
    for (i=0;i<36;i++){
        c = alpha1.charAt(i)
        n = key.indexOf(c);
        if ( n == -1)
            key += c;
    }
    return(key);
}    

function do_6x6_solve(str,start_numb,end_numb){
	var str, out_str,c,n,s,code_len,i,j,k,s1,numb,numb_str,key;
    var pos,index,pr,nl,p_row,p_col,plain,best_score,score;
    var op_choice,x;

	//str = document.getElementById('input_area').value;
    str = str.toLowerCase();
    var code = '';
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = alpha1.indexOf(c);
        if ( n >= 0)
            code += c;
    }
    code_len = code.length;
    best_score = 0;
    for (numb = start_numb;numb<end_numb;numb++) {
        numb_str = ''+numb;
        s1 = xlate_baz(numb_str);
        if ( s1=='Q') continue; // contains 0
        key = expand_6x6_key(s1);
        nl = []
        for (i=0;i<numb_str.length;i++)
            nl[i] = digits.indexOf(numb_str.charAt(i));
        pos = index = 0;
        plain = [];
        while(pos<code_len){
            pr = code.slice(pos,pos+nl[index]);
            pr = pr.reverse();
            for (j=0;j<nl[index];j++){
                if ( pos+j>=code_len) break;
                c = pr.charAt(j);
                n = key.indexOf(c);
                p_row = Math.floor(n/6);
                p_col = n % 6;
                pl = p_col*6+p_row; //plain keysquare is vertical
                plain[pos+j] = pl;
            }
            pos += nl[index];
            index++;
            if ( index == numb_str.length)
                index = 0;
        }
        score = get_6x6_score(plain);
        if ( score > best_score){
            best_score = score;
            x = score.toFixed(2);
            s = ''
            for (i=0;i<plain.length;i++)
                s += alpha1.charAt(plain[i]);
            s += '\nKey: '+numb_str+' score: '+x;
            //document.getElementById('output_area').value = s;    
            //postMessage(s);
            postMessage( {op_choice:1, str:s} );
            s = ''+x;
            postMessage( {op_choice:2, str:s} );
        }
    }
    postMessage( {op_choice:2, str:"done"});
} // end do_6x6_solve

function do_solve(str,start_numb,end_numb){
	var str, out_str,c,n,s,code_len,i,j,k,s1,numb,numb_str,key;
    var pos,index,pr,nl,p_row,p_col,plain,best_score,score;
    var op_choice,x;
	
	//str = document.getElementById('input_area').value;
    str = str.toLowerCase();
    str = str.replace('j','i');
    var code = '';
    for (i=0;i<str.length;i++){
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n >= 0)
            code += c;
    }
    code_len = code.length;
    best_score = 0;
    for (numb = start_numb;numb<end_numb;numb++) {
        numb_str = ''+numb;
        s1 = xlate_baz(numb_str);
        if ( s1=='Q') continue; // contains 0
        key = expand_key(s1);
        nl = []
        for (i=0;i<numb_str.length;i++)
            nl[i] = digits.indexOf(numb_str.charAt(i));
        pos = index = 0;
        plain = [];
        while(pos<code_len){
            pr = code.slice(pos,pos+nl[index]);
            pr = pr.reverse();
            for (j=0;j<nl[index];j++){
                if ( pos+j>=code_len) break;
                c = pr.charAt(j);
                n = key.indexOf(c);
                p_row = Math.floor(n/5);
                p_col = n % 5;
                pl = p_col*5+p_row; //plain keysquare is vertical
                if (pl >= 9) pl += 1;// skip j
                plain[pos+j] = pl;
            }
            pos += nl[index];
            index++;
            if ( index == numb_str.length)
                index = 0;
        }
        score = get_score(plain);
        if ( score > best_score){
            best_score = score;
            x = score.toFixed(2);
            s = ''
            for (i=0;i<plain.length;i++)
                s += complete_alpha.charAt(plain[i]);
            s += '\nkey: '+numb_str+' score: '+x;
            //document.getElementById('output_area').value = s;    
            //postMessage(s);
            postMessage( {op_choice:1, str:s} );
            s = ''+x;
            postMessage( {op_choice:2, str:s} );
        }
    }
    postMessage( {op_choice:2, str:"done"});
}

onmessage = function(event) { //receiving a message
	var str,s;

  var state = event.data.op_choice;
  if ( state == 1){ 
    str = event.data.str;
    if ( use_6x6 == 0)    
        do_solve(str,1,500000)
    else
        do_6x6_solve(str,1,500000)    
  }
  else if (state == 2){
    str = event.data.str;
    if ( use_6x6 == 0)        
        do_solve(str,500000,1000000)
    else
        do_6x6_solve(str,500000,1000000)    
  }
  else if (state == 4){
    use_6x6 = 1;
  }
}
