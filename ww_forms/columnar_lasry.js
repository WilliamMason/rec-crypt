// PH hill-climber with log tetragraph scoring
importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var period=5; // default

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

// adjacency scoring
var numb_long_cols, numb_short_cols;
var min_start = [];
var max_start=[];
var numb_rows; // really number of complete rows
var adjacency_matrix = [];
var offset_matrix = [];
// table of digraph scores
var sdd = new Array(
[0,3,4,2,0,0,1,0,0,0,4,5,2,6,0,2,0,4,4,3,0,6,0,0,3,5],
[0,0,0,0,6,0,0,0,0,9,0,7,0,0,0,0,0,0,0,0,7,0,0,0,7,0],
[3,0,0,0,2,0,0,6,0,0,8,0,0,0,6,0,5,0,0,0,3,0,0,0,0,0],
[1,6,0,0,1,0,0,0,4,4,0,0,0,0,0,0,0,0,0,1,0,0,4,0,1,0],
[0,0,4,5,0,0,0,0,0,3,0,0,3,2,0,3,6,5,4,0,0,4,3,8,0,0],
[3,0,0,0,0,5,0,0,2,1,0,0,0,0,5,0,0,2,0,4,1,0,0,0,0,0],
[2,0,0,0,1,0,0,6,1,0,0,0,0,0,2,0,0,1,0,0,2,0,0,0,0,0],
[5,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,5,0,0,0,4,0,0,0,1,1,3,7,0,0,0,0,5,3,0,5,0,0,0,8],
[0,0,0,0,6,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,9,0,0,0,0,0],
[0,0,0,0,6,0,0,0,5,0,0,0,0,4,0,0,0,0,0,0,0,0,1,0,0,0],
[2,0,0,4,2,0,0,0,3,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
[5,5,0,0,5,0,0,0,2,0,0,0,0,0,2,6,0,0,0,0,2,0,0,0,6,0],
[0,0,4,7,0,0,8,0,0,2,2,0,0,0,0,0,3,0,0,4,0,0,0,0,0,0],
[0,2,0,0,0,8,0,0,0,0,4,0,5,5,0,2,0,4,0,0,7,4,5,0,0,0],
[3,0,0,0,3,0,0,0,0,0,0,5,0,0,5,7,0,6,0,0,3,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0],
[1,0,0,0,4,0,0,0,2,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,5,0],
[1,1,0,0,0,0,0,1,2,0,0,0,0,0,1,4,4,0,1,4,2,0,4,0,0,0],
[0,0,0,0,0,0,0,8,3,0,0,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0],
[0,4,3,0,0,0,5,0,0,0,0,6,2,3,0,6,0,6,5,3,0,0,0,0,0,6],
[0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[6,0,0,0,2,0,0,6,6,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
[3,0,7,0,1,0,0,0,2,0,0,0,0,0,0,9,0,0,0,5,0,0,0,6,0,0],
[1,6,2,0,0,2,0,0,0,6,0,0,2,0,6,2,1,0,2,1,0,0,6,0,0,0],
[2,0,0,0,8,0,0,0,0,6,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,9]);


function get_digraph_matrix(){
    var i,j,n,x,y,k;
    var score, max_score;
    numb_long_cols = buf_len % period;
    numb_short_cols = period - numb_long_cols;
    numb_rows = Math.floor(buf_len / period);
    /* get min_start,max_start*/
    min_start[0] = 0;
    n = 0;
    for (j=1;j<period;j++) {
        if ( n<numb_short_cols) {
            min_start[j] = min_start[j-1]+numb_rows;
            n++;
        }
        else {
            min_start[j] = min_start[j-1]+numb_rows+1;
        }
    }
    max_start[0] =  0;
    n = 0;
    for (j=1;j<period;j++) {
        if ( n<numb_long_cols) {
            max_start[j] = max_start[j-1]+numb_rows+1;
            n++;
        }
        else {
            max_start[j] = max_start[j-1]+numb_rows;
        }
        //max_diff[j] = max_start[j]-min_start[j];
    }
    for(i=0;i<period;i++){
        adjacency_matrix[i] = [];
        offset_matrix[i] = [];
        for (j=0;j<period;j++){
            if ( i == j) {
                adjacency_matrix[i][i] = offset_matrix[i][i] = 0;
                continue;
            }
            max_score = 0;
            for (x = min_start[i]; x<=max_start[i];x++)
                for (y = min_start[j];y<=max_start[j];y++){
                    score = 0;
                    for (k=0;k<numb_rows;k++)
                        score += sdd[ buffer[x+k] ][buffer[y+k] ];
                    if (score > max_score){
                        max_score = score;
                        adjacency_matrix[i][j] = score;
                        n = y-x;
                        if (n<0) n = -n;
                        offset_matrix[i][j] = ( n )%numb_rows;
                        
                    }
                    
            }
        }
    }

}



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
max_trials = 1000000;

	
function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var col,pos;
        var c1,c2,c3,c4;

	index = 0;
	for ( col = 0; col <period;col++)
		for ( pos = key[col];pos<buf_len; pos = pos + period)
			plain_text[pos] = buffer[index++];
            
}
	

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
    if ( crib_flag == 1){
        for (i=0;i<buf_len;i++){
            if (plain_text[i] == crib_buffer[i])
                score += 1.0
        }
        score *= 100.0;
    }
    else if (crib_flag == 2){ // floating crib
        best_match = 0;
        for ( var crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
            if ( plain_text[crib_pos] == crib_buffer[0]) {
                     match = 0.0;
                    for (y=0;y<crib_len;y++)
                            if ( plain_text[crib_pos+y] == crib_buffer[y]) {
                                    match += 1.0
                    }
                    if (match>best_match) {
                            best_match = match;
                    }
        }
        score += 100.0*best_match;
    }    
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	

function get_digraph_score(){
var i,j,k;
var inv_key = [];
var score;

for (i=0;i<period;i++)
    inv_key[ key[i] ] = i;

score = 0;
for (i=0;i<period-1;i++)
    score += adjacency_matrix[ inv_key[i] ][ inv_key[i+1] ];
    
return(score);    

}

function get_alignment_score(){
var i,j,k, le,ri,n;
var score;
var previous_align = [];
var inv_key = [];
var col_type = []; // 0 = short, 1 = long

    for (i=0;i<period;i++)
        inv_key[ key[i] ] = i; // inv_key is really the encryption key.
    
    for (i=0;i<period;i++)
        col_type[i] = 0;
    for (i=0;i<numb_long_cols;i++)
        col_type[ inv_key[i] ] = 1;
        
    for (i=0;i<period;i++)
        previous_align[i] = 0;
        
    score = 0;
    for (i=0;i<period-1;i++){
        if (inv_key[i] < inv_key[i+1]){
            le = inv_key[i];
            ri = inv_key[i+1];
        }
        else {
            le =inv_key[i+1];
            ri = inv_key[i];
        }
        n = 0;
        for (j= le; j<ri;j++)
            n += col_type[j];
        if (offset_matrix[inv_key[i]][inv_key[i+1] ] == n){
                score += 2;
                previous_align[ri] = 1;
                if ( previous_align[le] == 1)
                   score++;               
        }
    }
    
    return(score);
}


function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	//var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    // segment swaps and slides
    var seg_pos, seg_len,seg_shift, seg_start,seg_right_shift,seg_left_shift,seg_end;  
    var seg_target, middle_seg,left_seg,right_seg;
    var new_key,old_key;
    var cnt, change_flag, sec_score;
    var align_step,align_min,dig_step,dig_min;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    if (crib_flag >= 1){
        crib = crib.toUpperCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            if (c == '-')
                crib_buffer[crib_len++] = -1;
            else {
                n = alpha.indexOf(c);
                if ( n>=0)
                    crib_buffer[crib_len++] = n;
            }
        }
    }
    debugger;
    get_digraph_matrix();
/*    
    // for testing
    out_str = '00~';// 0 at beginning is signal to post message in output box
    out_str += 'digraph matrices\nadjacency\n';
    
    for (i=0;i<period;i++){
        out_str += i+': ';
        for (j=0;j<period;j++)
            out_str += adjacency_matrix[i][j]+', ';
        out_str += '\n';
    }
    out_str += '\noffset\n';
    for (i=0;i<period;i++){
        out_str += i+': ';
        for (j=0;j<period;j++)
            out_str += offset_matrix[i][j]+', ';
        out_str += '\n';
    }
    
    postMessage(out_str);    
    return;
*/    
	for (i=0;i<period;i++) {
		key[i] = i;
	}
	// random start;
	for (i=period-1;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
    // do about 15 adjacency trials first
    score = max_score =  get_digraph_score();
    current_hc_score = 0;
    old_key = key.slice(0);
    dig_min = dig_step = 750*(buf_len-1)/(100*15);
    align_min = align_step = period/15;
	for (trial = 0;trial < 15;trial++){
        cnt = 0;
        change_flag = 0;
        // try all segment swaps, maximize digraph score
        for (seg_pos = 0; seg_pos<period-1; seg_pos++){
            for (seg_target = seg_pos+1;seg_target<period;seg_target++){
                for (seg_len= 1; seg_len<=seg_target - seg_pos; seg_len++){
                if (seg_target+seg_len > period) continue;
			    seg_start = old_key.slice(0,seg_pos);
			    left_seg = old_key.slice(seg_pos,seg_pos+seg_len);
			    middle_seg = old_key.slice(seg_pos+seg_len ,seg_target);
                right_seg = old_key.slice(seg_target,seg_target+seg_len);
                seg_end = old_key.slice(seg_target+seg_len);
                key = seg_start.concat(right_seg,middle_seg,left_seg,seg_end);
                //console.log(new_key);
                //score = get_score(buf_len);
                score = get_digraph_score();
                sec_score = get_alignment_score();
                if ( score>max_score && sec_score > align_min){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    get_trial_decrypt();
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\ndigraph score: "+score.toFixed(2)+" on trial: "+trial+" swap number: "+cnt;
                    out_str += "\nalignment score: "+sec_score+" \n";
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                //if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
                if (score >= current_hc_score && sec_score > align_min) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                     old_key = key.slice(0);
                    
                }
                cnt++;
                
            }  
          }
        }
        // try all segment shifts, maximize digraph score
        for (seg_pos = 0;seg_pos<period-1;seg_pos++){
            for (seg_len = 1;seg_len<=period - seg_pos - 1;seg_len++){
                for (seg_shift = 1;seg_shift<=period - seg_len - seg_pos;  seg_shift++){
			seg_start = old_key.slice(0,seg_pos);
			seg_right_shift = old_key.slice(seg_pos,seg_pos+seg_len);
			seg_left_shift = old_key.slice( seg_pos + seg_len , seg_pos + seg_len + seg_shift );
            seg_end = old_key.slice(seg_pos + seg_len + seg_shift );
            key = seg_start.concat(seg_left_shift,seg_right_shift,seg_end);

                score = get_digraph_score();
                sec_score = get_alignment_score();
                if ( score>max_score && sec_score > align_min){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    get_trial_decrypt();
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\ndigraph score: "+score.toFixed(2)+" on trial: "+trial+" shift number: "+cnt;
                    out_str += "\nalignment score: "+sec_score+" \n";
                    
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                if (score >= current_hc_score && sec_score > align_min) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                    old_key = key.slice(0);
                    
                } 
                cnt++;
                
            }  
          }
        }
        // try all segment swaps, maximize alignment score
        key = old_key.slice(0);
        max_score = current_hc_score = get_alignment_score();
        for (seg_pos = 0; seg_pos<period-1; seg_pos++){
            for (seg_target = seg_pos+1;seg_target<period;seg_target++){
                for (seg_len= 1; seg_len<=seg_target - seg_pos; seg_len++){
                if (seg_target+seg_len > period) continue;
			    seg_start = old_key.slice(0,seg_pos);
			    left_seg = old_key.slice(seg_pos,seg_pos+seg_len);
			    middle_seg = old_key.slice(seg_pos+seg_len ,seg_target);
                right_seg = old_key.slice(seg_target,seg_target+seg_len);
                seg_end = old_key.slice(seg_target+seg_len);
                key = seg_start.concat(right_seg,middle_seg,left_seg,seg_end);
                //console.log(new_key);
                //score = get_score(buf_len);
                sec_score = get_digraph_score();
                score = get_alignment_score();
                if ( score>max_score && sec_score > dig_min){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    get_trial_decrypt();
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\nalignment score: "+score.toFixed(2)+" on trial: "+trial+" swap number: "+cnt;
                    out_str += "\ndigraph score: "+sec_score+" \n";
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                //if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
                if (score >= current_hc_score && sec_score > dig_min) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                     old_key = key.slice(0);
                    
                }
                cnt++;
                
            }  
          }
        }
        // try all segment shifts, maximize alignment score
        for (seg_pos = 0;seg_pos<period-1;seg_pos++){
            for (seg_len = 1;seg_len<=period - seg_pos - 1;seg_len++){
                for (seg_shift = 1;seg_shift<=period - seg_len - seg_pos;  seg_shift++){
			seg_start = old_key.slice(0,seg_pos);
			seg_right_shift = old_key.slice(seg_pos,seg_pos+seg_len);
			seg_left_shift = old_key.slice( seg_pos + seg_len , seg_pos + seg_len + seg_shift );
            seg_end = old_key.slice(seg_pos + seg_len + seg_shift );
            key = seg_start.concat(seg_left_shift,seg_right_shift,seg_end);

                sec_score = get_digraph_score();
                score = get_alignment_score();
                if ( score>max_score && sec_score > dig_min){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    get_trial_decrypt();
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\nalignment score: "+score.toFixed(2)+" on trial: "+trial+" shift number: "+cnt;
                    out_str += "\ndigraph score: "+sec_score+" \n";
                    
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                if (score >= current_hc_score && sec_score > dig_min) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                    old_key = key.slice(0);
                    
                } 
                cnt++;
                
            }  
          }
        }
        
/*          
        if ( (change_flag)==0){   
            current_hc_score = 0;
            // wimipy hill-climbing, just swap one random pair
            n1 = Math.floor(Math.random()*period);
            v = old_key[n1];
            n2 = Math.floor(Math.random()*period);
            old_key[n1] = old_key[n2];
            old_key[n2] = v;
            
        }
*/
         if (change_flag == 0) break; // at local max;
         align_min += align_step;
         dig_min += dig_step;
		
	} // next trial
    //return ;// for testing
    key = old_key.slice(0); // best key from adjacency scoring
	max_score = current_hc_score = score = get_score(buf_len);	
	out_str = '0';
	x = score.toFixed(2);
	out_str += x+'~';
	for (i=0;i<buf_len;i++)
		out_str += alpha.charAt(plain_text[i]).toLowerCase();
	out_str += "\n score of plaintext is "+score;
	//document.getElementById('output_area').value = out_str;	
	postMessage(out_str);

	mut_count = 0;
	numb_accepted = 1;
    old_key = key.slice(0);
	for (trial = 0;trial < max_trials;trial++){
        cnt = 0;
        change_flag = 0;
        /*
        for (i=0;i<period;i++)
            old_key[i] = key[i];
        */
        // try all segment swaps
        for (seg_pos = 0; seg_pos<period-1; seg_pos++){
            for (seg_target = seg_pos+1;seg_target<period;seg_target++){
                for (seg_len= 1; seg_len<=seg_target - seg_pos; seg_len++){
                if (seg_target+seg_len > period) continue;
			    seg_start = old_key.slice(0,seg_pos);
			    left_seg = old_key.slice(seg_pos,seg_pos+seg_len);
			    middle_seg = old_key.slice(seg_pos+seg_len ,seg_target);
                right_seg = old_key.slice(seg_target,seg_target+seg_len);
                seg_end = old_key.slice(seg_target+seg_len);
                key = seg_start.concat(right_seg,middle_seg,left_seg,seg_end);
                //console.log(new_key);
                score = get_score(buf_len);
                if ( score>max_score){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial+" swap number: "+cnt;
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                //if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
                if (score >= current_hc_score) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                    // score_sum += score;
                    // accepted_count++;	
                    //for (i=0;i<period;i++)
                     //   old_key[i] = key[i];
                     old_key = key.slice(0);
                    
                }
                /*
                else {
                    for (i=0;i<period;i++)
                        key[i] = old_key[i];
                }
                */
                cnt++;
                
            }  
          }
        }
        // try all segment shifts
        for (seg_pos = 0;seg_pos<period-1;seg_pos++){
            for (seg_len = 1;seg_len<=period - seg_pos - 1;seg_len++){
                for (seg_shift = 1;seg_shift<=period - seg_len - seg_pos;  seg_shift++){
			seg_start = old_key.slice(0,seg_pos);
			seg_right_shift = old_key.slice(seg_pos,seg_pos+seg_len);
			seg_left_shift = old_key.slice( seg_pos + seg_len , seg_pos + seg_len + seg_shift );
            seg_end = old_key.slice(seg_pos + seg_len + seg_shift );
            key = seg_start.concat(seg_left_shift,seg_right_shift,seg_end);
                score = get_score(buf_len);
                if ( score>max_score){
                    max_score = score;
                    out_str = '0'; // 0 at beginning is signal to post message in output box
                    x = score.toFixed(2);
                    out_str += x+'~';
                    for (i=0;i<buf_len;i++)
                        out_str += alpha.charAt(plain_text[i]).toLowerCase();
                    out_str += "\nscore: "+score.toFixed(2)+" on trial: "+trial+" shift number: "+cnt;
                    /*
                    out_str += ", fudge factor: "+fudge_factor;
                    out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
                    */
                    if ( crib_flag >= 1)
                        out_str += ", (using crib)";
                    out_str += '\nColumnar Offset: ';
                    for (i=0;i<period;i++) 
                        out_str += key[i]+' ';
                    //document.getElementById('output_area').value = out_str;	
                    postMessage(out_str);
                }
                //if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
                if (score >= current_hc_score) {				
                    if (score != current_hc_score){
                        numb_accepted++;	
                        change_flag = 1;
                    }
                    current_hc_score = score;
                    // score_sum += score;
                    // accepted_count++;	
                    //for (i=0;i<period;i++)
                        //old_key[i] = key[i];
                    old_key = key.slice(0);
                    
                } 
                /*
                else {
                    for (i=0;i<period;i++)
                        key[i] = old_key[i];
                }
                */
                cnt++;
                
            }  
          }
        }
          
/*
		if ( (trial%1000000)==0){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
*/        
        if ( (change_flag)==0){   
            current_hc_score = 0;
            /*
            for (i=period-1;i>0;i--) {
                j = Math.floor( Math.random()*i);
                c = key[j];
                key[j]=key[i];
                key[i] = c;
            }
            */
            // wimipy hill-climbing, just swap one random pair
            n1 = Math.floor(Math.random()*period);
            v = old_key[n1];
            n2 = Math.floor(Math.random()*period);
            old_key[n1] = old_key[n2];
            old_key[n2] = v;
            
        }
        /*
        else{
            for (i=0;i<period;i++)
                key[i] = old_key[i];
        }
        */
			
		
	} // next trial
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	max_trials = parseInt(s[0].slice(1));
  	fudge_factor = parseFloat(s[1]);
  	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
	period = parseInt(s[3]);
	// for debugging
	// s = '2period passed is: '+period;
	// postMessage(s);
  }
  else if(str.charAt(0)  == '#') {// construct custom tet table
    make_table(str);
  }
  else if (str.charAt(0)  == ')')  { // crib indicator, then 0, no crib, 1 fixed crib,2 floating crib
    if (str.charAt(1)=='1') {
        crib_flag = 1;
        crib = str.slice(2);
    }
    else if (str.charAt(1)=='2') {
        crib_flag = 2;
        crib = str.slice(2);
    }
    else crib_flag = 0;
  }
  else {
		postMessage("1working...");
		do_hill_climbing(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
