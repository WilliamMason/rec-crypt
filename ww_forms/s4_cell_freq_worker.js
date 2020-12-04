// cell frequency worker using algorithm from Rat's article in SO 2015 Cm
importScripts('tettable.js'); 
/*
// expected frequency tables from Rat's article in SO 2015 Cm
var expect_right = [ [0.0474,0.0547,0.0703,0.0724,0.0343],
[0.0274,0.0189,0.0452,0.0496,0.0356],
[0.0413,0.0437,0.0339,0.0707,0.0500],
[0.0298,0.0304,0.0600,0.0765,0.0458],
[0.0101,0.0054,0.0118,0.0189,0.0159] ];

var expect_left = [ [0.0400,0.0579,0.0778,0.0585,0.0426],
[0.0211,0.0302,0.0461,0.0579,0.0208],
[0.0458,0.0317,0.0345,0.0836,0.0441],
[0.0405,0.0264,0.0436,0.0818,0.0550],
[0.0124,0.0085,0.0089,0.0210,0.0093] ];
*/
// frequency tables calcuated by me from englishbooks.txt
var expect_right = [ [0.0484,0.0558,0.0759,0.0766,0.0362],
[0.0282,0.0178,0.0399,0.0486,0.0372],
[0.0457,0.0392,0.0353,0.0754,0.0455],
[0.0329,0.0273,0.0593,0.0803,0.0459],
[0.0083,0.0033,0.0080,0.0148,0.0140] ];

var expect_left = [ [0.0403,0.0581,0.0876,0.0603,0.0466],
[0.0232,0.0259,0.0415,0.0644,0.0170],
[0.0484,0.0280,0.0341,0.0837,0.0466],
[0.0423,0.0239,0.0484,0.0722,0.0591],
[0.0095,0.0075,0.0063,0.0154,0.0095] ];

// my expected frequency tables for 6x6, see make_6x6_freq_table.py in testing folder

var expect_right6 = [[0.0242,0.0118,0.0194,0.0269,0.0267,0.0345],
[0.0411,0.0102,0.0259,0.0307,0.0479,0.0270],
[0.0325,0.0056,0.0314,0.0119,0.0296,0.0313],
[0.0556,0.0114,0.0287,0.0107,0.0353,0.0170],
[0.0708,0.0117,0.0756,0.0271,0.0692,0.0443],
[0.0156,0.0031,0.0186,0.0086,0.0172,0.0109] ];

var expect_left6 = [[0.0230,0.0091,0.0325,0.0195,0.0368,0.0225],
[0.0288,0.0152,0.0454,0.0281,0.0329,0.0324],
[0.0211,0.0070,0.0223,0.0163,0.0260,0.0496],
[0.0632,0.0100,0.0271,0.0161,0.0346,0.0082],
[0.0795,0.0106,0.0576,0.0254,0.0825,0.0427],
[0.0244,0.0019,0.0149,0.0102,0.0133,0.0095] ];


var specific_route_flag = false;
var specific_left_route, specific_right_route;

var NUMB_TO_SAVE = 2000; // save top keys and routes for left and for right key squares.
// save key word, route, score
var WORD_INDEX = 0;
var ROUTE_INDEX = 1;
var SCORE_INDEX = 2;
var top_right, top_left;
var even_freq, odd_freq;

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var old_alpha6="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	
var alpha6="A1B2C3D4E5F6G7H8I9J0KLMNOPQRSTUVWXYZ";	
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

var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var word_list,word_count;
var routes = [

/* 0 horizontal */[ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
/*1 left -right*/ [0,1,2,3,4,9,8,7,6,5,10,11,12,13,14,19,18,17,16,15,20,21,22,23,24],
/*2 spiral*/
[0,1,2,3,4,15,16,17,18,5,14,23,24,19,6,13,22,21,20,7,
                                12,11,10,9,8],

/*3 vertical*/
[0,5,10,15,20,1,6,11,16,21,2,7,12,17,22,3,8,13,18,23,
                                4,9,14,19,24],
/*4 down up*/
[0,9,10,19,20,1,8,11,18,21,2,7,12,17,22,3,6,13,16,23,
                                4,5,14,15,24],
/* 5 counter clockwise spiral*/
[0,15,14,13,12,1,16,23,22,11,2,17,24,21,10,3,18,19,20,9,
                                4,5,6,7,8],
/*6 vert up*/
[4,9,14,19,24,3,8,13,18,23,2,7,12,17,22,1,6,11,16,21,
                                0,5,10,15,20],
/*7 diagonal up*/
[0,2,5,9,14,1,4,8,13,18,3,7,12,17,21,6,11,16,20,23,
                                10,15,19,22,24],

/*8 diagonal alternating up and down*/
[0,2,3,9,10,1,4,8,11,18,5,7,12,17,19,6,13,16,20,23,
                                14,15,21,22,24],
/*9 diagonal down, start at right corner*/
[10,6,3,1,0,15,11,7,4,2,19,16,12,8,5,22,20,17,13,9,
                                24,23,21,18,14],
//10 diagonal down
[0,1,3,6,10,2,4,7,11,15,5,8,12,16,19,9,13,17,20,22,
								14,18,21,23,24 ]                               
];

var routes6 = [];
	// horizontal
	routes6[0] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35];
    //left-right
    routes6[1] = [ 0,1,2,3,4,5,11,10,9,8,7,6,12,13,14,15,16,17,23,22,21,20,19,18,24, 
             25,26,27,28,29,35,34,33,32,31,30];
    //spiral
    routes6[2] = [0,1,2,3,4,5,19,20,21,22,23,6,18,31,32,33,24,7,17,30,35,34,25,8,16, 
             29,28,27,26,9,15,14,13,12,11,10];
    // 3 vertical
    routes6[3] = [0,6,12,18,24,30,1,7,13,19,25,31,2,8,14,20,26,32,3,9,15,21,27,33,4, 
             10,16,22,28,34,5,11,17,23,29,35];
    // 4 down up
    routes6[4] = [0,11,12,23,24,35,1,10,13,22,25,34,2,9,14,21,26,33,3,8,15,20,27,32, 
                 4,7,16,19,28,31,5,6,17,18,29,30];
    //  5 counter clockwise spiral
    routes6[5] = [0,19,18,17,16,15,1,20,31,30,29,14,2,21,32,35,28,13,3,22,33,34,27,12, 
             4,23,24,25,26,11,5,6,7,8,9,10];
    // 6 vert up
    routes6[6] = [5,11,17,23,29,35,4,10,16,22,28,34,3,9,15,21,27,33,2,8,14,20,26,32,1, 
                  7,13,19,25,31,0,6,12,18,24,30];
    // 7 diagonal up
    routes6[7] = [0,2,5,9,14,20,1,4,8,13,19,25,3,7,12,18,24,29,6,11,17,23,28,32,10,16, 
                   22,27,31,34,15,21,26,30,33,35];
    // 8 diagonal alternating up and down
    routes6[8] = [0,2,3,9,10,20,1,4,8,11,19,21,5,7,12,18,22,29,6,13,17,23,28,30,14,16, 
                  24,27,31,34,15,25,26,32,33,35];
    // 9 diagonal down, start at right corner
    routes6[9] = [15,10,6,3,1,0,21,16,11,7,4,2,26,22,17,12,8,5,30,27,23,18,13,9,33,31,28, 
                    24,19,14,35,34,32,29,25,20];
    // 10 clockwise spiral starting at bottom right
    routes6[10] = [10,11,12,13,14,15,9,26,27,28,29,16,8,25,34,35,30,17,7,24,33,32,31,18, 
                    6,23,22,21,20,19,5,4,3,2,1,0];
    // 11 vertical up-down
    routes6[11] = [5,6,17,18,29,30,4,7,16,19,28,31,3,8,15,20,27,32,2,9,14,21,26,33,1,10,13, 
                    22,25,34,0,11,12,23,24,35];
    // 12 spiral from lower left
    routes6[12] = [5,6,7,8,9,10,4,23,24,25,26,11,3,22,33,34,27,12,2,21,32,35,28,13,1,20,31, 
                    30,29,14,0,19,18,17,16,15];


var numb_seeds, numb_routes;

function make_word_list(str) {
	var s,n;
    var state,i,c,index;
	
    s = "making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    state = 0; //no current word
    s = '';
    index = 0;
	word_list = [];
	for (i=0;i<str.length;i++){
		c = str.charAt(i);
		//if (c =='J') c = 'I'; // leave out, have to allow for 6x6
		n = alpha.indexOf(c);
		if ( state == 0 && n >=0) {
			s = c;
			state = 1;
		}
		else if (state==1){
			if ( n >=0)
				s += c;
            else {
                word_list[index++] = s;
                state = 0;
            }				
		}
	}
    if (state == 1)
        word_list[index++] = s;
	word_count = word_list.length; // global variable
	n = word_list.length;
	s = "loaded "+n+" words";
    s += ' first word is '+word_list[0]+', last word is '+word_list[word_list.length-1];
		
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

function put_pc(c1,c2,i1) {
        var row1,col1,row2,col2;
		var tmp;

        row1=inv_row1[c1];
        col1=inv_col1[c1];
        row2=inv_row2[c2];
        col2=inv_col2[c2];
        

        	// four square	        
        	tmp = 5*row1+col2;
        	if ( tmp>=9) tmp++; // skip 'j' slot
        	plain_text[i1] = tmp;
        	tmp = 5*row2+col1;
        	if ( tmp>=9) tmp++; // skip 'j' slot        
        	plain_text[i1+1]=tmp;
		
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


        	// four square	        
        	tmp = 6*row1+col2;
        	plain_text[i1] = xlate_pos[tmp];
        	tmp = 6*row2+col1;
        	plain_text[i1+1]=xlate_pos[tmp];

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

function get_next_key(le){
	var i,j,k,index;
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	used_let[J_index] = 1;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[key[i]] == 0){
			key_array[index++] = key[i];
			used_let[key[i]] = 1;
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)
			key_array[index++] = i;
}			

function get_next_key6(le){
	var i,j,k,index;
	
	for (i=0;i<36;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[key[i]] == 0){
        	key_array[index++] = key[i];
            used_let[key[i]] = 1;
            if ( key[i] <= J_index ) {
                key_array[index++] = key[i]+1;
                used_let[key[i]+1] = 1;
            }
            
	}
	for (i=0;i<36;i++)
		if ( used_let[i] == 0)  {
			key_array[index++] = i;
			if ( i <= J_index ){
				key_array[index++] = i+1;
                used_let[i+1] = 1;
            }
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
	var le, numb_saved, max_right_score, index_of_max_right, wrd_numb, temp_route, temp_sqr;
    var max_left_score, index_of_max_left
    
    if (key6_flag){
        do_key_search6(str);
        return;
    }
    // get ciphertext plus even and odd ciphertext frequencies
    even_freq = [];
    odd_freq = [];
    for (i=0;i<26;i++)
        even_freq[i] = odd_freq[i] = 0;    
    J_index = alpha.indexOf('J');
	str = str.toUpperCase();
	buf_len = 0;
    j = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0){
			buffer[buf_len++] = n;
            if (j==0){
                even_freq[n]++;
                j=1;
            }
            else {
                odd_freq[n]++;
                j=0;
            }
        }
	}
    // initialize top key lists, format: word, route numb, score or 1000
    top_right = [];
    for (i=0;i< NUMB_TO_SAVE;i++)
        top_right[i] = ['a',0,1000];
    top_left = [];
    for (i=0;i< NUMB_TO_SAVE;i++)
        top_left[i] = ['a',0,1000];
    
    numb_saved = 0;
    max_right_score = max_left_score = -1;
    index_of_right_max = index_of_left_max = -1
    // go through word list getting best (=smallest) deviation from expectged frequencies
    
	var NUMB_ROUTES = routes.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    temp_sqr = [];
    for (i=0;i<5;i++)
        temp_sqr[i] = [];
    for (wrd_numb = 0; wrd_numb<word_count;wrd_numb++){
    	le = word_list[wrd_numb].length;
        for (i=0;i<le;i++) {
            c = word_list[wrd_numb].charAt(i);
            if (c =='J') c = 'I';
            key[i] = alpha.indexOf(c);
        }
        get_next_key(le);
        for (temp_route = 0;temp_route<numb_routes;temp_route++){
            if (specific_route_flag)
                temp_route = specific_right_route;
            for (j=0;j<25;j++)
                work_key[j] = key_array[ routes[temp_route][j] ];  
            n = 0;
            for (i=0;i<5;i++) for (j=0;j<5;j++)    
                temp_sqr[i][j] = work_key[n++];
            // check expected frequency for right square
            score = 0;
            for (i=0;i<5;i++) for (j=0;j<5;j++){
                n = expect_right[i][j] - (2/buf_len)*even_freq[ temp_sqr[i][j] ];
                if (n<0) n = -n;
                score += n;
            }
            // is this one of the best right scores?
            if (numb_saved < NUMB_TO_SAVE){ // havn't filled top scoring lists yet
                top_left[numb_saved] = [ word_list[wrd_numb], temp_route,score];
                // don't increment numb_saved, until insert left score.
            }
            else if (score<max_right_score){ // improvement. replace old highest score and get new one
                top_right[index_of_top_right] = [ word_list[wrd_numb], temp_route,score];
                max_right_score = score;
                // get new top right score
                for (i=0;i<NUMB_TO_SAVE;i++){
                    if ( top_right[i][SCORE_INDEX] >max_right_score){
                            max_right_score = top_right[i][SCORE_INDEX]
                            index_of_top_right = i;
                    }
                }
            }
            if ( specific_route_flag){
                temp_route = specific_left_route;
                for (j=0;j<25;j++)
                    work_key[j] = key_array[ routes[specific_left_route][j] ];  
                n = 0;
                for (i=0;i<5;i++) for (j=0;j<5;j++)    
                    temp_sqr[i][j] = work_key[n++];

            }
            // check expected frequency for left square
            score = 0;
            for (i=0;i<5;i++) for (j=0;j<5;j++){
                n = expect_left[i][j] - (2/buf_len)*odd_freq[ temp_sqr[i][j] ];
                if (n<0) n = -n;
                score += n;
            }
            // is this one of the best left scores?
            if (numb_saved < NUMB_TO_SAVE){ // havn't filled top scoring lists yet
                top_left[numb_saved++] = [ word_list[wrd_numb], temp_route,score];
                if (numb_saved == NUMB_TO_SAVE){ // get max left and right scores
                    for (i=0;i<NUMB_TO_SAVE;i++){
                        if ( top_right[i][SCORE_INDEX] >max_right_score){
                            max_right_score = top_right[i][SCORE_INDEX]
                            index_of_top_right = i;
                        }
                        if ( top_left[i][SCORE_INDEX] >max_left_score){
                            max_left_score = top_right[i][SCORE_INDEX]
                            index_of_top_left = i;
                        }
                    }
                }
            }
            else if (score<max_left_score){ // improvement. replace old highest score and get new one
                top_left[index_of_top_left] = [ word_list[wrd_numb], temp_route,score];
                max_left_score = score;
                // get new top right score
                for (i=0;i<NUMB_TO_SAVE;i++){
                    if ( top_left[i][SCORE_INDEX] >max_left_score){
                            max_left_score = top_left[i][SCORE_INDEX]
                            index_of_top_left = i;
                    }
                }
            }
            if ( specific_route_flag) break;
        }  // next temp_route      
    } // next wrd_numb
/* for testng
	out_str = '0100~right keys'; // 0 at beginning is signal to post message in output box
        for (i=0;i<NUMB_TO_SAVE;i++){
                       out_str += 'key: '+top_right[i][WORD_INDEX]+', route: '+top_right[i][ROUTE_INDEX]+', score: '+top_right[i][SCORE_INDEX]+'\n';
       }
    out_str += 'left keys\n'
        for (i=0;i<NUMB_TO_SAVE;i++){
                       out_str += 'key: '+top_left[i][WORD_INDEX]+', route: '+top_left[i][ROUTE_INDEX]+', score: '+top_left[i][SCORE_INDEX]+'\n';
      }
	postMessage(out_str);  
*/
    // now try all these possible key, route combinations
    best_score = -1000;
   for (left_index = 0;left_index<NUMB_TO_SAVE;left_index++){
	le = top_left[left_index][WORD_INDEX].length;
	for (i=0;i<le;i++) {
		c = top_left[left_index][WORD_INDEX].charAt(i);
		if (c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    for (j=0;j<25;j++)
        work_key[j] = key_array[ routes[top_left[left_index][ROUTE_INDEX] ][j] ];  
    n = 0;
    for (i=0;i<5;i++) for (j=0;j<5;j++)    
        r_sqr[i][j] = work_key[n++];
    for (right_index = 0;right_index<NUMB_TO_SAVE;right_index++){
        le = top_right[right_index][WORD_INDEX].length;
        for (i=0;i<le;i++) {
            c = top_right[right_index][WORD_INDEX].charAt(i);
            if (c =='J') c = 'I';
            key[i] = alpha.indexOf(c);
        }
        get_next_key(le);
        for (j=0;j<25;j++)
            work_key[j] = key_array[ routes[top_right[right_index][ROUTE_INDEX] ][j] ];  
        n = 0;
        for (i=0;i<5;i++) for (j=0;j<5;j++)    
            l_sqr[i][j] = work_key[n++];
        score = get_score(buf_len);
		if ( score > best_score){
			best_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2);
			out_str += '\nS4 Keys:';
			
			// note: Left-right are swapped because decrypts are constructed by reversing encryption.
            out_str += 'left key: '+top_left[left_index][WORD_INDEX]+', route: '+top_left[left_index][ROUTE_INDEX]+'\n';
            out_str += 'right key: '+top_right[right_index][WORD_INDEX]+', route: '+top_right[right_index][ROUTE_INDEX]+'\n';
            out_str += '(testing '+NUMB_TO_SAVE+' keys)';
			postMessage(out_str);
			
		}
        
    } // next right index
    if ( (left_index%100) == 0){
        s = out_str + "\n (left_index is "+left_index+")";
        postMessage(s);
    }
   } // next left_index 
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
    // get ciphertext plus even and odd ciphertext frequencies
    even_freq = [];
    odd_freq = [];
    for (i=0;i<36;i++)
        even_freq[i] = odd_freq[i] = 0;    
	str = str.toUpperCase();
    J_index = alpha6.indexOf('J');    
	buf_len = 0;
    j = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0){
			buffer[buf_len++] = n;
            if (j==0){
                even_freq[n]++;
                j=1;
            }
            else {
                odd_freq[n]++;
                j=0;
            }
        }
	}
    // initialize top key lists, format: word, route numb, score or 1000
    top_right = [];
    for (i=0;i< NUMB_TO_SAVE;i++)
        top_right[i] = ['a',0,1000];
    top_left = [];
    for (i=0;i< NUMB_TO_SAVE;i++)
        top_left[i] = ['a',0,1000];
    
    numb_saved = 0;
    max_right_score = max_left_score = -1;
    index_of_right_max = index_of_left_max = -1
    // go through word list getting best (=smallest) deviation from expectged frequencies
    
	var NUMB_ROUTES = routes6.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    temp_sqr = [];
    for (i=0;i<6;i++)
        temp_sqr[i] = [];
    for (wrd_numb = 0; wrd_numb<word_count;wrd_numb++){
    	le = word_list[wrd_numb].length;
        for (i=0;i<le;i++) {
            c = word_list[wrd_numb].charAt(i);
            key[i] = alpha6.indexOf(c);
        }
        get_next_key6(le);
        for (temp_route = 0;temp_route<numb_routes;temp_route++){
            if (specific_route_flag)
                temp_route = specific_right_route;        
            for (j=0;j<36;j++)
                work_key[j] = key_array[ routes6[temp_route][j] ];  
            n = 0;
            for (i=0;i<6;i++) for (j=0;j<6;j++)    
                temp_sqr[i][j] = work_key[n++];
            // check expected frequency for right square
            score = 0;
            for (i=0;i<6;i++) for (j=0;j<6;j++){
                n = expect_right6[i][j] - (2/buf_len)*even_freq[ temp_sqr[i][j] ];
                if (n<0) n = -n;
                score += n;
            }
            // is this one of the best right scores?
            if (numb_saved < NUMB_TO_SAVE){ // havn't filled top scoring lists yet
                top_left[numb_saved] = [ word_list[wrd_numb], temp_route,score];
                // don't increment numb_saved, until insert left score.
            }
            else if (score<max_right_score){ // improvement. replace old highest score and get new one
                top_right[index_of_top_right] = [ word_list[wrd_numb], temp_route,score];
                max_right_score = score;
                // get new top right score
                for (i=0;i<NUMB_TO_SAVE;i++){
                    if ( top_right[i][SCORE_INDEX] >max_right_score){
                            max_right_score = top_right[i][SCORE_INDEX]
                            index_of_top_right = i;
                    }
                }
            }
            if(specific_route_flag){
                temp_route = specific_left_route;
                for (j=0;j<36;j++)
                    work_key[j] = key_array[ routes6[specific_left_route][j] ];  
                n = 0;
                for (i=0;i<6;i++) for (j=0;j<6;j++)    
                    temp_sqr[i][j] = work_key[n++];
            }
            // check expected frequency for left square
            score = 0;
            for (i=0;i<6;i++) for (j=0;j<6;j++){
                n = expect_left6[i][j] - (2/buf_len)*odd_freq[ temp_sqr[i][j] ];
                if (n<0) n = -n;
                score += n;
            }
            // is this one of the best left scores?
            if (numb_saved < NUMB_TO_SAVE){ // havn't filled top scoring lists yet
                top_left[numb_saved++] = [ word_list[wrd_numb], temp_route,score];
                if (numb_saved == NUMB_TO_SAVE){ // get max left and right scores
                    for (i=0;i<NUMB_TO_SAVE;i++){
                        if ( top_right[i][SCORE_INDEX] >max_right_score){
                            max_right_score = top_right[i][SCORE_INDEX]
                            index_of_top_right = i;
                        }
                        if ( top_left[i][SCORE_INDEX] >max_left_score){
                            max_left_score = top_right[i][SCORE_INDEX]
                            index_of_top_left = i;
                        }
                    }
                }
            }
            else if (score<max_left_score){ // improvement. replace old highest score and get new one
                top_left[index_of_top_left] = [ word_list[wrd_numb], temp_route,score];
                max_left_score = score;
                // get new top right score
                for (i=0;i<NUMB_TO_SAVE;i++){
                    if ( top_left[i][SCORE_INDEX] >max_left_score){
                            max_left_score = top_left[i][SCORE_INDEX]
                            index_of_top_left = i;
                    }
                }
            }
            if(specific_route_flag) break;
        }  // next temp_route      
    } // next wrd_numb
/* fro testing
	out_str = '0100~right keys'; // 0 at beginning is signal to post message in output box
        for (i=0;i<NUMB_TO_SAVE;i++){
                       out_str += 'key: '+top_right[i][WORD_INDEX]+', route: '+top_right[i][ROUTE_INDEX]+', score: '+top_right[i][SCORE_INDEX]+'\n';
       }
    out_str += 'left keys\n'
        for (i=0;i<NUMB_TO_SAVE;i++){
                       out_str += 'key: '+top_left[i][WORD_INDEX]+', route: '+top_left[i][ROUTE_INDEX]+', score: '+top_left[i][SCORE_INDEX]+'\n';
      }
	postMessage(out_str);  
    return;
*/    
    // now try all these possible key, route combinations
    best_score = -1000;
   for (left_index = 0;left_index<NUMB_TO_SAVE;left_index++){
	le = top_left[left_index][WORD_INDEX].length;
	for (i=0;i<le;i++) {
		c = top_left[left_index][WORD_INDEX].charAt(i);
		key[i] = alpha6.indexOf(c);
	}
	get_next_key6(le);
    for (j=0;j<36;j++)
        work_key[j] = key_array[ routes6[top_left[left_index][ROUTE_INDEX] ][j] ];  
    n = 0;
    for (i=0;i<6;i++) for (j=0;j<6;j++)    
        r_sqr_6[i][j] = work_key[n++];
    for (right_index = 0;right_index<NUMB_TO_SAVE;right_index++){
        le = top_right[right_index][WORD_INDEX].length;
        for (i=0;i<le;i++) {
            c = top_right[right_index][WORD_INDEX].charAt(i);
            key[i] = alpha6.indexOf(c);
        }
        get_next_key6(le);
        for (j=0;j<36;j++)
            work_key[j] = key_array[ routes6[top_right[right_index][ROUTE_INDEX] ][j] ];  
        n = 0;
        for (i=0;i<6;i++) for (j=0;j<6;j++)    
            l_sqr_6[i][j] = work_key[n++];
        score = get_score(buf_len);
		if ( score > best_score){
			best_score = score;
			out_str = '0'; // 0 at beginning is signal to post message in output box
			x = score.toFixed(2);
			out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += old_alpha6.charAt(plain_text[i]).toLowerCase();
			out_str += "\nscore: "+score.toFixed(2);
			out_str += '\nS4 Keys:';
			
			// note: Left-right are swapped because decrypts are constructed by reversing encryption.
            out_str += 'left key: '+top_left[left_index][WORD_INDEX]+', route: '+top_left[left_index][ROUTE_INDEX]+'\n';
            out_str += 'right key: '+top_right[right_index][WORD_INDEX]+', route: '+top_right[right_index][ROUTE_INDEX]+'\n';
            out_str += '(testing '+NUMB_TO_SAVE+' keys)';
			postMessage(out_str);
			
		}
        
    } // next right index
    if ( (left_index%100) == 0){
        s = out_str + "\n (left_index is "+left_index+")";
        postMessage(s);
    }
    
   } // next left_index 

}	// end do_keysearch6

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,s;

    debugger;
  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	//fudge_factor = parseFloat(s[2]);
  	//n = parseInt(s[3]);

	if (s[1] == '0') key6_flag = false;
	else key6_flag = true;
	numb_routes = parseInt(s[2]);
    NUMB_TO_SAVE = parseInt(s[3]);
    if (s[4] == '1'){
        specific_route_flag = true;
        specific_left_route = parseInt(s[5]);
        specific_right_route = parseInt(s[6]);
    }
    else
        specific_route_flag = false;
  }
  else if(str.charAt(0)  == '#') {// construct key table
    make_word_list(str);
  }
  else {
		postMessage("1working...");
		do_key_search(str);
			//alert("done");
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
			//close();  
  }
};  
