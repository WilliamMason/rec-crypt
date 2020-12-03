var buffer = [];
var buf_len;
var max_trials = 100000; // max hill-climbing trials

var PRIMER_LEN = 5;
var order;
var p_len;
 
var ksq = [];
var PRIMER = 0;
var SCORE = 1; // indices in ksq

var  even_flag = false;
var  g_flag = false; //g_flag == GIZMO flag


var chain_start = [];
var chain = [];
var sum_rows = [];
var sum_columns = [];
var freq_m = [];
var numb_to_show = 10;

var specific_primer, specific_primer_flag;
 
function sort_scores() {
        var i,j,k,l,m,t1;
        var c;

        order = [];
        for (i=0;i<100000;i++) order[i]=i;
        if (even_flag)
        	i = j = 3125;
		else
        	i=j=100000;
        i>>=1;
        while(i) {
                k=0; l=j-i;
                while(k<l) {
                        c=k;
                        while(c>=0) {
                                m=c+i;
                                if (ksq[order[m]][SCORE] > ksq[order[c]][SCORE]) {
                                        /* swap c and m */
                                        t1=order[c];
                                        order[c] = order[m];
                                        order[m] = t1;
                                }
                                else break;
                                c-=i;
                        }
                        k++;
                }
                i>>=1;
        }
} /* end sort scores */
 
 
function get_chain() {
        var i,j,k,index;
        var sum,count;
        var score,v,w;

        // reset to zero to avoid garbage collection
        //memset(sum_rows,0,sizeof(sum_rows));
        for (i=0;i<10;i++)
            sum_rows[i] = 0;
        //memset(sum_columns,0,sizeof(sum_columns));
        for (i=0;i<26;i++)
            sum_columns[i] = 0;
        for (index = 0;index<p_len;index++)
                chain[index] = chain_start[index];
        for (j = 0;j<buf_len-p_len;j++)
                chain[j+p_len] = (chain[j]+chain[j+1]) % 10;
        //memset(freq_m,0,sizeof(freq_m));
        for (i=0;i<26;i++) for(j=0;j<10;j++)
            freq_m[i][j] = 0;
        for (j=0;j<buf_len;j++){
                freq_m[ buffer[j] ][ chain[j] ]++;
                sum_rows[ chain[j] ]++;
                sum_columns[ buffer[j] ]++;
        }
        index = 0;
		score = 0;
		
        for (k=0;k<10;k++)
                for (j=0;j<26;j++) {
                	w = (sum_columns[j]*sum_rows[k])/buf_len;
                	if (w>0) {
                		v = (freq_m[j][k] - w);
                		score += v*v/w;
            		}
        }
	if ( !g_flag || chain_start[0]&1 || chain_start[1]&1 || chain_start[2]&1 || chain_start[3]&1 || chain_start[4]&1 )
        return(score);
    else
    	return(score * 1.66 );
} /* end get_chain */
 
 
function do_search(ciphertext){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
//    var alpha1 = 'abcdefghijklmnopqrstuvwxyz-';
    var s,i,indx,c,n,j,x,index;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    var j1,j2,j3,j4,j5;
    
    s = ciphertext.toLowerCase();
    indx = 0;
    buffer = [];
    for (i=0;i<s.length;i++){
        c = s.charAt(i);
        n = alpha.indexOf(c);
        if ( n >=0) {
            buffer[indx++] = n;
        }
    }
    buf_len = indx;
    p_len = PRIMER_LEN;
    index = 0;
    for (i=0;i<26;i++)
        freq_m[i] = [];
    best_score = -10000;
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
	ksq[index] = [];
    s = ''+chain_start[0]+chain_start[1]+chain_start[2]+chain_start[3]+chain_start[4];
    ksq[index][PRIMER] = s;
    score = get_chain();
    ksq[index++][SCORE] = score;
    }}}}}
    sort_scores();
    n = 0;
    out_str = '';
    for (i=0;i<numb_to_show;i++) {
        out_str += ksq[order[i]][PRIMER]+' scores: '+ksq[order[i]][SCORE].toFixed(2)+', ';
        if (++n == 4) {
            n = 0;
            out_str += '\n';
        }
    }
    if ( specific_primer_flag){
      for (i=0;i<100000;i++)
        if (ksq[order[i]][PRIMER] == specific_primer){
          n = i+1;
          out_str += '\nspecifc primer: '+specific_primer+', has rank: '+n;
          break;
        }
    }
    postMessage(out_str);
    postMessage('@'); // done signal


}

onmessage = function(event) { //receiving a message with the string to decode. do search
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
  var op_choice = event.data.op_choice;
  if ( op_choice==0 ) {
    var str = event.data.str; // string to decode
    do_search(str);
  }
  else if (op_choice==1){
    numb_to_show = parseInt(event.data.str);
    even_flag = event.data.even;
    g_flag = event.data.giz;
    specific_primer_flag = event.data.flag;
    specific_primer = event.data.primer;
  }

};
    