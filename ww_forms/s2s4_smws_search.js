// Converging key search worker
importScripts('tettable.js'); 
importScripts('routes.js'); 

//postMessage("tet_values loaded");
// smws stuff
var left_key_len,right_key_len;
var left_key_buffer = [];
var left_key_array = [];
var right_key_buffer = [];
var right_key_array = [];
var left_key = [];
var right_key = [];
var best_left_key = [];
var best_right_key = [];


var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var alpha6="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	
var buffer = new Array();
var plain_text = new Array();
var key = [];
var work_key = [];
var key_array = [];
var J_index;
var used_let = [];
var max_trials;
var l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var l_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var r_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var key6_flag = false;

var best_l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var best_r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[,15,16,17,18,19],[20,21,22,23,24]];
var best_l_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var best_r_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];

/////////////a 1 b 2 c 3 d 4 e 5 f 6 g 7 h 8 i 9 j 0 k l m n o p q r s t u v w x y z}
xlate_pos = [0,27,1,28,2,29,3,30,4,31,5,32,6,33,7,34,8,35,9,26,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];


var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var buf_len;
var s4Flag = true;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var word_list,word_count;


var numb_routes;

var random_score = 17
var std_eng_score = 404

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
    weighted_tet_sum = 0;
    unweighted_tet_sum = 0;
    
    // still have to convert to logs.
    for (i=0;i<26*26*26*26;i++){
            n = tet_table[i];
            tet_table[i] = Math.log(1+tet_table[i]);
            weighted_tet_sum += n*tet_table[i];
            unweighted_tet_sum += tet_table[i];            
        //tet_table[i] = Math.log(1+tet_table[i]);
    }
    // global variables for this tet table
    random_score = 100*unweighted_tet_sum / (26*26*26*26);
    std_eng_score = 100*weighted_tet_sum / max_n;
    
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

function get_next_left_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	used_let[J_index] = 1;        
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[left_key_buffer[i]] == 0){
			left_key_array[index++] = left_key_buffer[i];
			used_let[left_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			left_key_array[index++] = i;
}		

function get_next_right_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	used_let[J_index] = 1;        
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[right_key_buffer[i]] == 0){
			right_key_array[index++] = right_key_buffer[i];
			used_let[right_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			right_key_array[index++] = i;
}		

function random_left_key(){
    var i,j,n,c;
    
    j = 0;
    for (i=0;i<25;i++){
        if ( i == J_index) j++;
        left_key_buffer[i] = j++;
    }
    for (i=24;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = left_key_buffer[i];
        left_key_buffer[i] = left_key_buffer[j];
        left_key_buffer[j]= n;
    }
}

function random_right_key(){
    var i,j,n,c;
    
    j = 0;
    for (i=0;i<25;i++){
        if ( i == J_index) j++;
        right_key_buffer[i] = j++;
    }
    for (i=24;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = right_key_buffer[i];
        right_key_buffer[i] = right_key_buffer[j];
        right_key_buffer[j]= n;
    }
}


function get_next_left_key6(le){ // ignore digits, put them in at end
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[left_key_buffer[i]] == 0){
			left_key_array[index++] = left_key_buffer[i];
			used_let[left_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			left_key_array[index++] = i;
}		

function get_next_right_key6(le){ // ignore digits, put them in at end
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[right_key_buffer[i]] == 0){
			right_key_array[index++] = right_key_buffer[i];
			used_let[right_key_buffer[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			right_key_array[index++] = i;
}		

function random_left_key6(){
    var i,j,n,c;
    
    for (i=0;i<26;i++){
        left_key_buffer[i] = i;
    }
    for (i=25;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = left_key_buffer[i];
        left_key_buffer[i] = left_key_buffer[j];
        left_key_buffer[j]= n;
    }
}

function random_right_key6(){
    var i,j,n,c;
    
    for (i=0;i<26;i++){
        right_key_buffer[i] = i;
    }
    for (i=25;i>1;i--){
        j = Math.floor( Math.random() * i );
        n = right_key_buffer[i];
        right_key_buffer[i] = right_key_buffer[j];
        right_key_buffer[j]= n;
    }
}


function put_pc(c1,c2,i1) {
        var row1,col1,row2,col2;
		var tmp;

        row1=inv_row1[c1];
        col1=inv_col1[c1];
        row2=inv_row2[c2];
        col2=inv_col2[c2];
        
        if (s4Flag) {
        	// four square	        
        	tmp = 5*row1+col2;
        	if ( tmp>=9) tmp++; // skip 'j' slot
        	plain_text[i1] = tmp;
        	tmp = 5*row2+col1;
        	if ( tmp>=9) tmp++; // skip 'j' slot        
        	plain_text[i1+1]=tmp;
    	}
    	else {
	    	// two-square
        	if ( row1 == row2 ) {
        	        plain_text[i1] = c2;
        	        plain_text[i1+1] = c1;
        	        return;
        	}
        	plain_text[i1] = r_sqr[row1][col2];
        	plain_text[i1+1] = l_sqr[row2][col1];
    	}
		
}
	
function get_trial_decrypt(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;

        // get inverse key square
		for (i=0;i<5;i++) for (j=0;j<5;j++){
			inv_row1[ l_sqr[i][j] ] = i;
			inv_col1[ l_sqr[i][j] ] = j;
			inv_row2[ r_sqr[i][j] ] = i;
			inv_col2[ r_sqr[i][j] ] = j;			
		}                
        for (j=0;j<buf_len;j = j+2) {
                c1 = buffer[j];
                c2 = buffer[j+1];
				put_pc(c1,c2,j);
        }
}

function put_pc6(c1,c2,i1) {
        var row1,col1,row2,col2;
		var tmp;

        row1=inv_row1[c1];
        col1=inv_col1[c1];
        row2=inv_row2[c2];
        col2=inv_col2[c2];
        
        if (s4Flag) {
        	// four square	        
        	tmp = 6*row1+col2;
        	plain_text[i1] = xlate_pos[tmp];
        	tmp = 6*row2+col1;
        	plain_text[i1+1]=xlate_pos[tmp];
    	}
    	else {
	    	// two-square
        	if ( row1 == row2 ) {
        	        plain_text[i1] = c2;
        	        plain_text[i1+1] = c1;
        	        return;
        	}
        	plain_text[i1] = r_sqr_6[row1][col2];
        	plain_text[i1+1] = l_sqr_6[row2][col1];
    	}
		
}
	
function get_trial_decrypt6(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;

        // get inverse key square
		for (i=0;i<6;i++) for (j=0;j<6;j++){
			inv_row1[ l_sqr_6[i][j] ] = i;
			inv_col1[ l_sqr_6[i][j] ] = j;
			inv_row2[ r_sqr_6[i][j] ] = i;
			inv_col2[ r_sqr_6[i][j] ] = j;			
		}                
        for (j=0;j<buf_len;j = j+2) {
                c1 = buffer[j];
                c2 = buffer[j+1];
				put_pc6(c1,c2,j);
        }
}
	

function get_score(buf_len){
	var score,i,n;

    if (key6_flag)
        get_trial_decrypt6();
    else
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
        for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
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
        if (plain_text[i]>25 || plain_text[i+1]>25 ||plain_text[i+2]>25 ||plain_text[i+3]>25 ) {
            //score--;
            continue;
        }
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	

function insert_digits(ky){
    var i,j,index;
    
    key_array = [];
    index = 0;
    for (i=0;i<ky.length;i++){
		key_array[index++] = ky[i];
		if ( ky[i] <= J_index )
			key_array[index++] = xlate_pos[2*ky[i]+1];
    }
    
}

function do_key_search(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,best_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	//var max_trials; // now global
	var s;
    var l_index,r_index;
    var left_index, right_index, left_route, right_route;
    var best_left_index, best_right_index, best_left_route, best_right_route;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;
    var max_key_len;
    var rpt,y,z,key_carry
        
        
	//last_seed_number = numb_seeds;
    if ( key6_flag){
        do_key_search6(str)
        return;
    }
	J_index = alpha.indexOf('J');
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
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
    
	var NUMB_ROUTES = routes.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    if (left_key_len <9 && right_key_len < 9){
        key_carry = 25;
        max_trials = 500*numb_routes;
    }
    else {
        max_key_len = left_key_len;
        if ( right_key_len > max_key_len)
            max_key_len = right_key_len;
        key_carry = 60*(max_key_len-8);
        max_trials = key_carry*max_key_len*numb_routes;
    }
  best_score = -1000;  
  for(var sht = 0;sht< max_trials;sht++) {
    if ( (sht%key_carry) == 0){
        random_left_key();
        random_right_key();
        get_next_left_key(left_key_len);
        get_next_right_key(right_key_len);
        best_left_route = left_route = Math.floor( Math.random()* numb_routes);
        best_right_route = right_route = Math.floor( Math.random()* numb_routes);
    }
    else {
        random_right_key();
        get_next_right_key(right_key_len);    
        best_right_route = right_route = Math.floor( Math.random()* numb_routes);
    }    
    local_best_score = -100;
    for (j=0;j<25;j++)
        work_key[j] = left_key_array[ routes[best_left_route][j] ];  
    n = 0;
    for (i=0;i<5;i++) for (j=0;j<5;j++)    
        l_sqr[i][j] = work_key[n++];
    for (i=0;i<5;i++) for (j=0;j<5;j++)    
        best_l_sqr[i][j] = l_sqr[i][j];
	for (rpt = 0;rpt<16;rpt++){  
        change_flag = false;
        for (i=0;i<25;i++)
            left_key[i] = left_key_array[i];
        for (z=0;z<= right_key_len;z++) for (y=0;y<25;y++){
            for (i=0;i<25;i++)
                right_key[i] = right_key_array[i];
            c = right_key[z];
            right_key[z] = right_key[y];
            right_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            used_let[J_index]=1;
            for (i=0;i<right_key_len;i++) used_let[right_key[i]] = 1;
            index = right_key_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    right_key[index++] = i;
			for (right_route = 0;right_route<numb_routes;right_route++){
					for (j=0;j<25;j++)
						work_key[j] = right_key[ routes[right_route][j] ]; 
					n=0;
					for (i=0;i<5;i++) for (j=0;j<5;j++)    
						r_sqr[i][j] = work_key[n++];						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = true;

                        for (i=0;i<25;i++)
                            right_key_array[i] = right_key[i];                        
						best_right_route = right_route;
						for (i=0;i<5;i++) for (j=0;j<5;j++) 
							best_r_sqr[i][j] = r_sqr[i][j];                    
					}
					if ( score > best_score){
						best_score = score;
                        for(i=0;i<25;i++) {
                            best_right_key[i] = right_key[i];
                            best_left_key[i] = left_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        if ( crib_flag >= 1)
                            out_str += ", (using crib)";
						if(s4Flag) out_str += '\nS4 Keys:';
						else out_str += '\nS2 Keys:';
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: ';
                            for (i=0;i<right_key_len;i++)
                                out_str +=alpha.charAt(best_right_key[i]);
						out_str += ', Right key: ';
                            for (i=0;i<left_key_len;i++)
                                out_str +=alpha.charAt(best_left_key[i]);
                        
						out_str += ', Left route: '+ route_name[right_route];
						out_str += ', Right route: '+ route_name[best_left_route];
						postMessage(out_str);
						
					}
				} // next right route
            } // next y,z
	
				// set up best right key so far
				for (i=0;i<5;i++) for (j=0;j<5;j++)    
					r_sqr[i][j] = best_r_sqr[i][j];
				// now look for better left key and route
        for (i=0;i<25;i++)
             right_key[i] = right_key_array[i];
        for (z=0;z<= left_key_len;z++) for (y=0;y<25;y++){
            for (i=0;i<25;i++)
                left_key[i] = left_key_array[i];
            c = left_key[z];
            left_key[z] = left_key[y];
            left_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            used_let[J_index]=1;
            for (i=0;i<left_key_len;i++) used_let[left_key[i]] = 1;
            index = left_key_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    left_key[index++] = i;

				for (left_route = 0;left_route<numb_routes;left_route++){
					for (j=0;j<25;j++)
						work_key[j] = left_key[ routes[left_route][j] ];  
					
					n=0;
					for (i=0;i<5;i++) for (j=0;j<5;j++)    
						l_sqr[i][j] = work_key[n++];
						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = true;
                        for (i=0;i<25;i++)
                            left_key_array[i] = left_key[i];                                                
						//best_left_index = left_index;
						best_left_route = left_route;
						for (i=0;i<5;i++) for (j=0;j<5;j++) 
							best_l_sqr[i][j] = l_sqr[i][j];                    
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
                        for(i=0;i<25;i++) {
                            best_right_key[i] = right_key[i];
                            best_left_key[i] = left_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        if ( crib_flag >= 1)
                            out_str += ", (using crib)";                        
						if(s4Flag) out_str += '\nS4 Keys:';
						else out_str += '\nS2 Keys:';
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: ';
                            for (i=0;i<right_key_len;i++)
                                out_str +=alpha.charAt(best_right_key[i]); 
						out_str += ', Right key: ';
                            for (i=0;i<left_key_len;i++)
                                out_str +=alpha.charAt(best_left_key[i]);
                                
						out_str += ', Left route: '+ route_name[best_right_route];
						out_str += ', Right route: '+ route_name[left_route];
						postMessage(out_str);
 
					}
				} //next left route
            } // netx y,z
			if ( !change_flag){
					break;
			}
				
        } // next rpt            
	} // next sht           
} // end main
	

function do_key_search6(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,best_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	//var max_trials; // now global
	var s;
    var l_index,r_index;
    var left_index, right_index, left_route, right_route;
    var best_left_index, best_right_index, best_left_route, best_right_route;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;
    var max_key_len;
    var rpt,y,z,key_carry

	J_index = alpha6.indexOf('J');	// for inserting digits into the key
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
    if (crib_flag >= 1){
        crib = crib.toUpperCase();
        crib_len = 0;
        for (i=0;i<crib.length;i++){
            c = crib.charAt(i);
            if (c == '-')
                crib_buffer[crib_len++] = -1;
            else {
                n = alpha6.indexOf(c);
                if ( n>=0)
                    crib_buffer[crib_len++] = n;
            }
        }
    }    
	var NUMB_ROUTES = routes6.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    if (left_key_len <9 && right_key_len < 9){
        key_carry = 25;
        max_trials = 500*numb_routes;
    }
    else {
        max_key_len = left_key_len;
        if ( right_key_len > max_key_len)
            max_key_len = right_key_len;
        key_carry = 60*(max_key_len-8);
        max_trials = key_carry*max_key_len*numb_routes;
    }
  best_score = -1000;  
  for(var sht = 0;sht< max_trials;sht++) {
    if ( (sht%key_carry) == 0){
        random_left_key6();
        random_right_key6();
        get_next_left_key6(left_key_len);
        get_next_right_key6(right_key_len);
        best_left_route = left_route = Math.floor( Math.random()* numb_routes);
        best_right_route = right_route = Math.floor( Math.random()* numb_routes);
    }
    else {
        random_right_key6();
        get_next_right_key6(right_key_len);    
        best_right_route = right_route = Math.floor( Math.random()* numb_routes);
    }    
    local_best_score = -100;
    insert_digits(left_key_array);
    for (j=0;j<36;j++)
        work_key[j] = key_array[ routes6[best_left_route][j] ];  

    n = 0;
    for (i=0;i<6;i++) for (j=0;j<6;j++)    
        l_sqr_6[i][j] = work_key[n++];
    for (i=0;i<6;i++) for (j=0;j<6;j++)    
        best_l_sqr_6[i][j] = l_sqr_6[i][j];
    
	for (rpt = 0;rpt<16;rpt++){  
        change_flag = false;
        for (i=0;i<26;i++)
            left_key[i] = left_key_array[i];
        for (z=0;z<= right_key_len;z++) for (y=0;y<26;y++){
            for (i=0;i<26;i++)
                right_key[i] = right_key_array[i];
            c = right_key[z];
            right_key[z] = right_key[y];
            right_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            for (i=0;i<right_key_len;i++) used_let[right_key[i]] = 1;
            index = right_key_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    right_key[index++] = i;

			for (right_route = 0;right_route<numb_routes;right_route++){
                    insert_digits(right_key); // into key_array
					for (j=0;j<36;j++)
						work_key[j] = key_array[ routes6[right_route][j] ]; 

					n=0;
					for (i=0;i<6;i++) for (j=0;j<6;j++)    
						r_sqr_6[i][j] = work_key[n++];						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = true;

                        for (i=0;i<26;i++)
                            right_key_array[i] = right_key[i];                        
                       
						best_right_route = right_route;
						for (i=0;i<6;i++) for (j=0;j<6;j++) 
							best_r_sqr_6[i][j] = r_sqr_6[i][j];                    
					}
					if ( score > best_score){
						best_score = score;
                        for(i=0;i<26;i++) {
                            best_right_key[i] = right_key[i];
                            best_left_key[i] = left_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha6.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        if ( crib_flag >= 1)
                            out_str += ", (using crib)";                        
						if(s4Flag) out_str += '\nS4 Keys:';
						else out_str += '\nS2 Keys:';
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: ';
                            for (i=0;i<right_key_len;i++)
                                out_str +=alpha6.charAt(best_right_key[i]); 
						out_str += ', Right key: ';
                            for (i=0;i<left_key_len;i++)
                                out_str +=alpha6.charAt(best_left_key[i]);
                        
						out_str += ', Left route: '+ right_route;
						out_str += ', Right route: '+ best_left_route;

						postMessage(out_str);
						
					}
				} //  next right route
            } // next y,z
				// set up best right key so far
				for (i=0;i<6;i++) for (j=0;j<6;j++)    
					r_sqr_6[i][j] = best_r_sqr_6[i][j];
        for (i=0;i<26;i++)
                right_key[i] = right_key_array[i];
        for (z=0;z<= left_key_len;z++) for (y=0;y<26;y++){
            for (i=0;i<26;i++)
                left_key[i] = left_key_array[i];
            c = left_key[z];
            left_key[z] = left_key[y];
            left_key[y] = c;
            for (i=0;i<26;i++)
                used_let[i] = 0;
            for (i=0;i<left_key_len;i++) used_let[left_key[i]] = 1;
            index = left_key_len;
            for (i=0;i<26;i++)
                if ( used_let[i] == 0)
                    left_key[index++] = i;


				for (left_route = 0;left_route<numb_routes;left_route++){
                    insert_digits(left_key);
					for (j=0;j<36;j++)
						work_key[j] = key_array[ routes6[left_route][j] ];  
					
					n=0;
					for (i=0;i<6;i++) for (j=0;j<6;j++)    
						l_sqr_6[i][j] = work_key[n++];
						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = true;
                        for (i=0;i<26;i++)
                            left_key_array[i] = left_key[i];                                                 
						best_left_route = left_route;
						for (i=0;i<6;i++) for (j=0;j<6;j++) 
							best_l_sqr_6[i][j] = l_sqr_6[i][j];                    
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
                        for(i=0;i<26;i++) {
                            best_right_key[i] = right_key[i];
                            best_left_key[i] = left_key[i];
                        }
                        
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha6.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
                        if ( crib_flag >= 1)
                            out_str += ", (using crib)";                                                
						if(s4Flag) out_str += '\nS4 Keys:';
						else out_str += '\nS2 Keys:';
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: ';
                            for (i=0;i<right_key_len;i++)
                                out_str +=alpha6.charAt(best_right_key[i]); 
						out_str += ', Right key: ';
                            for (i=0;i<left_key_len;i++)
                                out_str +=alpha6.charAt(best_left_key[i]);
                         
						out_str += ', Left route: '+ best_right_route;
						out_str += ', Right route: '+ left_route;
//						out_str += ', seed: '+seed_number;
						postMessage(out_str);
 
					}
				} // next left route
            } // next y,z
			if ( !change_flag){
				break;
			}
        } // next rpt            
	} // next sht
}	

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,s;

  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons


	if (s[1] == '0') s4Flag=true;
	else s4Flag = false;
	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing

	if (s[3] == '0') key6_flag = false;
	else key6_flag = true;
    numb_routes = parseInt(s[4]);
    left_key_len = parseInt(s[5]);
    right_key_len = parseInt(s[6]);
    /*
    // debugging check
    s = "0100~s4 flag: "+s4Flag;
    s += ", 6x6 flag: "+key6_flag;
    s += ", numb routes: "+numb_routes;
    s += ", left key length: "+left_key_len;
    s += ", right key len: "+right_key_len;
    postMessage(s);
    */
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
		do_key_search(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
