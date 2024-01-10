importScripts('tettable.js');
importScripts('routes.js');

var word_list_string = '';
var word_list = [];

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha_C="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var l_alpha="abcdefghijklmnopqrstuvwxyz";
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;

var alpha;
var alpha5="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alpha6="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


var sq = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var inv_row = [];
var inv_col = [];

var key=[];
var inverse_key = [];
var work_key=[];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default
var left_over;
var flag6x6, keysquare_width;

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;
var reversed_key_flag = false;


function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
//    var weighted_tet_sum, unweighted_tet_sum;
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
        n = alpha_C.indexOf(c);
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
//    weighted_tet_sum = 0;
//    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
//        n = tet_table[i];
        tet_table[i] = Math.log(1+tet_table[i]);
        //tet_table[i] = Math.sqrt( Math.sqrt(tet_table[i]) );
//        weighted_tet_sum += n*tet_table[i];
//        unweighted_tet_sum += tet_table[i];
    }
    // global variables for this tet table
//    random_score = 100*unweighted_tet_sum / (26*26*26*26);
//    std_eng_score = 100*weighted_tet_sum / max_n;
    
    postMessage(s);
}


function initialize_tet_table(){
	var i,c,n,v;

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha_C.indexOf(tet_values[c].charAt(0))+	26*alpha_C.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha_C.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha_C.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}
	//alert("tet_table initialized");
	postMessage("00~tet table initialized");
}
initialize_tet_table();

function search_word_list(b_array){
	var s,n;
    var state,i,c,index;
    
    // construct word list
    state = 0; //no current word
    s = '';
    index = 0;
    for (i=0;i<b_array.length;i++) {
        //c = str.charAt(i);
        n = b_array[i];
        if (n>=65 && n<(65+26)) // upper case
            n -=65;
        else if (n>=97 && n<(97+26)) // lower case
            n -= 97;
        else n = -1;
        //n = l_alpha.indexOf(c);
        if ( state == 0 && n >=0){
            //s = c;
            s = l_alpha.charAt(n);
            state = 1;
        }
        else if (state == 1){
            if (n >=0) s += l_alpha.charAt(n);
            else {
                word_list[index++] = s;
                state = 0;
            }
        }
    }
    if (state == 1)
        word_list[index++] = s;

	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
	//document.getElementById('output_area').value = s;
	//postMessage(s);
}

function put_pc(c1,c2,i1,i2) {
    var row1,col1,row2,col2;

    row1=inv_row[c1];
    col1=inv_col[c1];
    row2=inv_row[c2];
    col2=inv_col[c2];

    if (row1 == row2) {
   		plain_text[i1] = sq[row1][ (col1+keysquare_width-1)%keysquare_width];
   		plain_text[i2] = sq[row2][ (col2+keysquare_width-1)%keysquare_width];
	}
	else if ( col1 == col2) {
   		plain_text[i1] = sq[(row1+keysquare_width-1)%keysquare_width ][col1];
   		plain_text[i2] = sq[ (row2+keysquare_width-1)%keysquare_width ][col2];
	}
    else {
    	plain_text[i1] = sq[row1][col2];
    	plain_text[i2] = sq[row2][col1];
	}
}
	
                		
	
function get_trial_decrypt(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;
        var pos;

        // get inverse key square
		for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++){
			inv_row[ sq[i][j] ] = i;
			inv_col[ sq[i][j] ] = j;
		}
        pos = 0;
		while (pos < buf_len-left_over){
            for (j=0;j<period;j++) {
                    c1 = buffer[pos+j];
                    c2 = buffer[pos+j+period];
                    put_pc(c1,c2,pos+j,pos+j+period);
            }
            pos += 2*period;
        }
        if ( left_over>0) {
            pos = buf_len - left_over;
            k = left_over/2;
            for (j=0;j<k;j++){
                c1 = buffer[pos+j];
                c2 = buffer[pos+j+k];
                put_pc(c1,c2,pos+j,pos+j+k);
            }
        }
}


function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
	  if (plain_text[i] >25 ||plain_text[i+1] >25 ||plain_text[i+2] >25 ||plain_text[i+3] >25 )
	    continue;
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}

function get_key_array(wrd){
        var i,j,c,n,n2;
        var indx;
        
        key = [];
        var used_indx = [];
        for (i=0;i<26;i++) used_indx[i] = 0
        used_indx[9] = 1; // index of 'j' is 9.
        indx = 0;
        for (i=0;i<wrd.length;i++){
            c = wrd.charAt(i);
            if ( c=='j') c = 'i';
            n = l_alpha.indexOf(c);
            if (  used_indx[n] == 0 ){
                key[indx++] = n;
                used_indx[n] = 1;
            }
        }
        for (i=0;i<26;i++){
            if (  used_indx[i] == 0 )
                key[indx++] = i
        }
		if (reversed_key_flag)
			key.reverse();
				
}


function get_6x6key_array(wrd){
        var i,j,c,n,n2;
        var indx;
        
        key = [];
        var used_indx = [];
        for (i=0;i<26;i++) used_indx[i] = 0
        indx = 0;
        for (i=0;i<wrd.length;i++){
            c = wrd.charAt(i);
            n = l_alpha.indexOf(c);
            if (  used_indx[n] == 0 ){
                key[indx++] = n;
                used_indx[n] = 1;
                if(n<9)
                  key[indx++] = n+27; // 1-9
                else if (n==9) // letter j
                  key[indx++] = 26; // position of 0
                
            }
        }
        for (i=0;i<26;i++){
            if (  used_indx[i] == 0 ){
                key[indx++] = i
                if(i<9)
                  key[indx++] = i+27; // 1-9
                else if (i==9) // letter j
                  key[indx++] = 26; // position of 0
            }
        }
}

 
function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s,cnt;
    
    if ( flag6x6){
        alpha = alpha6;
        keysquare_width = 6;
    }
    else {
        alpha = alpha5;
        keysquare_width = 5;
    }

    cnt = 0;
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    x = Math.floor(buf_len / (2*period));
    left_over = buf_len - x*2*period;
    sq = [];
    n = 0
    for (i=0;i<keysquare_width;i++){
      sq[i] = [];
      for (j=0;j<keysquare_width;j++){
        sq[i][j] = n++
      }
    }
    max_score = -10000;
    for (w_index=0;w_index<word_list.length;w_index++) {
        wrd = word_list[w_index];
        if (flag6x6)
          get_6x6key_array(wrd);
        else
          get_key_array(wrd);
        for ( k = 0;k<routes.length;k++) {
            for (j=0;j<keysquare_width*keysquare_width;j++){
              if (flag6x6)
                work_key[j] = key[ routes6[k][j] ];
            else
                work_key[j] = key[ routes[k][j] ];
            }
            n = 0;
            for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)
                sq[i][j] = work_key[n++];
            score = get_score(buf_len);
            if ( score>max_score){
                max_score = score;
                out_str = '';
                for (i=0;i<buf_len;i++)
                    out_str += alpha.charAt(plain_text[i]).toLowerCase();
                out_str += "\nscore of plaintext: "+score.toFixed(2);
                out_str += '\nKey word: '+wrd;
                out_str += '\nKey: ';
                for (i=0;i<keysquare_width*keysquare_width;i++)
                    out_str += alpha.charAt(work_key[i]);				
                //out_str += "\nroute: "+k+" ("+route_name[k]+")";
				if ( reversed_key_flag)
					out_str += "\nroute: "+k+" ("+route_name[k]+" reversed)";
				else 
					out_str += "\nroute: "+k+" ("+route_name[k]+")";				
				
                //document.getElementById('output_area').value = out_str;
                postMessage(out_str);
            }
        }
    }
    postMessage("~");
//document.getElementById('debug_area').value="key search";
}

onmessage = function(event) { //receiving a message
	var str,s;

  debugger;
  var state = event.data.op_choice;
  if ( state == 1){ // word list
    var word_list_array = new Uint8Array(event.data.buf); // need to set char view of arrayBuffer that was passed
    search_word_list(word_list_array);  // set up word list
  }
  else if (state == 3){ // custom tet table
    str = event.data.str;
    make_table(str);
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
    period = parseInt(event.data.period);
    flag6x6 = event.data.flag6x6;
    str = event.data.str;
	reversed_key_flag = event.data.reversed_key_flag;			
    do_key_search(str);
  }
}
