// Converging key search worker
// 6x6 option not active
importScripts('tettable.js'); 
importScripts('routes.js'); 

var order; // routes to use

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var alpha6="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";	
var buffer = new Array();
var plain_text = new Array();
var key = [];
var work_key = [];
var key_array = [];
var inverse_key = [];
var work_array=[];
var J_index;
var used_let = [];
var max_trials;
// var l_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
// var r_sqr_6 = [[0,1,2,3,4,5],[6,7,8,9,10,11],[12,13,14,15,16,17],[18,19,20,21,22,23],[24,25,26,27,28,29],[30,31,32,33,34,35]];
var key6_flag = false;
var reverse_flag = false;

// /////////////a 1 b 2 c 3 d 4 e 5 f 6 g 7 h 8 i 9 j 0 k l m n o p q r s t u v w x y z}
// xlate_pos = [0,27,1,28,2,29,3,30,4,31,5,32,6,33,7,34,8,35,9,26,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];

var l_sqr = [];
var r_sqr = [];
var best_l_sqr = [];
var best_r_sqr = [];

var buf_len;

var period;

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

var word_list,word_count;



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

function get_trial_decrypt(){
        var i,j,k, index,x,y;
        var c1,c2,c3,c4;

        // get inverse key 
		for (i=0;i<25;i++) {
			inverse_key[ l_sqr[i] ] = i;
		}    
		index =  y = 0;
        for (x=0;x<buf_len;x++) {
                c1 = Math.floor((inverse_key[ buffer[x] ]/5));
                c2 = (inverse_key[ buffer[x] ] %5);
                work_array[index++] = c1;
                work_array[index++] = c2;
                if ( index == 2*period) { /* array is filled */
                        for (k=0;k<index/2;k++)
                                plain_text[y++]=r_sqr[ 5*work_array[k]+
                                        work_array[k+period]];
										
                        index = 0;
                } /* end if */
        } /* next x */
        if (index !=0 ) /* finish partially filled work_array */
                for (k=0;k<index/2;k++)
                        plain_text[y++]=r_sqr[ 5*work_array[k]+
                                work_array[k+index/2]];		    
		
}
	
function get_trial_decrypt6(){
        var i,j,k, index,x;
        var c1,c2,c3,c4;

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
	
	for (i=0;i<26;i++)
		used_let[i] = 0;
	index = 0;
	for (i=0;i<le;i++)
		if ( used_let[key[i]] == 0){
			key_array[index++] = key[i];
			used_let[key[i]] = 1;
			if ( key[i] <= J_index )
				key_array[index++] = xlate_pos[2*key[i]+1];
	}
	for (i=0;i<26;i++)
		if ( used_let[i] == 0)  {
			key_array[index++] = i;
			if ( i <= J_index )
				key_array[index++] = xlate_pos[2*i+1];
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
    var left_index, right_index, left_route, right_route,left_reverse_key, right_reverse_key;
    var best_left_index, best_right_index, best_left_route, best_right_route, best_left_reverse_key,best_right_reverse_key;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;

	last_seed_number = numb_seeds;
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
	var NUMB_ROUTES = routes.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    // select key and route for left square at random
    left_index = Math.floor( Math.random() * word_count);
    left_route = Math.floor( Math.random()* numb_routes);
    right_index = Math.floor( Math.random() * word_count);
    right_route = Math.floor( Math.random()* numb_routes);
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		if (c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    for (j=0;j<25;j++)
        best_l_sqr[j] = l_sqr[j] =key_array[ routes[order[ left_route] ][j] ];  
		
    best_left_index = left_index;
    best_left_route = left_route;
    best_left_reverse_key = false;
    best_right_index = -1;
    local_best_score = best_score = -1000;
    seed_number = 0;
	while(1) {
	for (trial = 0 ; trial<100;trial++){        
			// find the best right key and route for this left key and route;
			change_flag = 0;
			//printf("Searching left key list...\n");
			for (right_index = 0;right_index<word_count;right_index++) 
				for (right_route = 0;right_route<numb_routes;right_route++){
					le = word_list[right_index].length;
					/* switch to a=0,b=1,c=2, etc*/
					for (i=0;i<le;i++) {
						c = word_list[right_index].charAt(i);
						if (c =='J') c = 'I';
						key[i] = alpha.indexOf(c);
					}
					get_next_key(le);//expand key to 25 chars in key_array
					for (j=0;j<25;j++)
						r_sqr[j] = key_array[ routes[order[ right_route] ][j] ]; 						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_right_index = right_index;
						best_right_route = right_route;
						for (i=0;i<25;i++)
							best_r_sqr[i] = r_sqr[i];
                        best_right_reverse_key = false;
					}
					if ( score > best_score){
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: '+ word_list[right_index];
						out_str += ', Right key: '+word_list[best_left_index];
                        if (best_left_reverse_key)
                            out_str += ' (reversed) ';                        
						out_str += ', Left route: '+ route_name[order[right_route]];
						out_str += ', Right route: '+ route_name[order[best_left_route]];
						out_str += ', seed: '+seed_number;
						/*
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(l_sqr[i][j]);
						out_str += '     ';
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(r_sqr[i][j]);
						*/
						postMessage(out_str);
						
					}
                    if (reverse_flag){
                        key_array.reverse();
                        for (j=0;j<25;j++)
                            r_sqr[j] = key_array[ routes[order[ right_route] ][j] ]; 						
                        score = get_score(buf_len);
                        if ( score > local_best_score){
                            local_best_score = score;
                            change_flag = 1;
                            best_right_index = right_index;
                            best_right_route = right_route;
                            for (i=0;i<25;i++)
                                best_r_sqr[i] = r_sqr[i];
                            best_right_reverse_key = true;
                        }
                        if ( score > best_score){
                            best_score = score;
                            out_str = '0'; // 0 at beginning is signal to post message in output box
                            x = score.toFixed(2);
                            out_str += x+'~';
                            for (i=0;i<buf_len;i++)
                                out_str += alpha.charAt(plain_text[i]).toLowerCase();
                            out_str += "\nscore: "+score.toFixed(2);
                            // note: Left-right are swapped because decrypts are constructed by reversing encryption.
                            out_str += '\nLeft key: '+ word_list[right_index] + ' (reversed) ';
                            out_str += ', Right key: '+word_list[best_left_index];
                            if (best_left_reverse_key)
                                out_str += ' (reversed) ';                        
                            out_str += ', Left route: '+ route_name[order[right_route]];
                            out_str += ', Right route: '+ route_name[order[best_left_route]];
                            out_str += ', seed: '+seed_number;
                            /*
                            for (i=0;i<5;i++) for(j=0;j<5;j++)
                                out_str += alpha.charAt(l_sqr[i][j]);
                            out_str += '     ';
                            for (i=0;i<5;i++) for(j=0;j<5;j++)
                                out_str += alpha.charAt(r_sqr[i][j]);
                            */
                            postMessage(out_str);
						
                        }
                    } // end if reverse_flag
                    
				} // next right index, next right route
	
				if ( change_flag == 0){
					//printf("\nLeft key square unchanged on trial %i! Done.\n", trial);
					//exit(0);
					s = out_str + "\nLeft key square unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best right key so far
				for (i=0;i<25;i++)
					r_sqr[i] = best_r_sqr[i];
				// now look for better left key and route
			//printf("Searching right key list...\n");    
			change_flag = 0;
			for (left_index = 0;left_index<word_count;left_index++)
				for (left_route = 0;left_route<numb_routes;left_route++){
					le = word_list[left_index].length;
					for (i=0;i<le;i++) {
						c = word_list[left_index].charAt(i);
						if (c =='J') c = 'I';
						key[i] = alpha.indexOf(c);
					}
					get_next_key(le);
					for (j=0;j<25;j++)
						l_sqr[j] = key_array[ routes[order[ left_route] ][j] ];  
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_left_index = left_index;
						best_left_route = left_route;
						for (i=0;i<25;i++)
							best_l_sqr[i] = l_sqr[i];
                        best_left_reverse_key = false;
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: '+ word_list[best_right_index];
                        if (best_right_reverse_key)
                            out_str += ' (reversed) ';
						out_str += ' Right key: '+word_list[left_index];
						out_str += ', Left route: '+ route_name[order[best_right_route]];
						out_str += ', Right route: '+ route_name[order[left_route]];
						out_str += ', seed: '+seed_number;
						/*
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(l_sqr[i][j]);
						out_str += '     ';
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(r_sqr[i][j]);
						*/
						postMessage(out_str);
 
					}
                    if ( reverse_flag){
                        key_array.reverse();
                        for (j=0;j<25;j++)
                            l_sqr[j] = key_array[ routes[order[ left_route] ][j] ];  
                        score = get_score(buf_len);
                        if ( score > local_best_score){
                            local_best_score = score;
                            change_flag = 1;
                            best_left_index = left_index;
                            best_left_route = left_route;
                            for (i=0;i<25;i++)
                                best_l_sqr[i] = l_sqr[i]; 
                            best_left_reverse_key = true;
                        }                
                        if ( score > best_score){
                            // change_flag = 1;
                            best_score = score;
                            out_str = '0'; // 0 at beginning is signal to post message in output box
                            x = score.toFixed(2);
                            out_str += x+'~';
                            for (i=0;i<buf_len;i++)
                                out_str += alpha.charAt(plain_text[i]).toLowerCase();
                            out_str += "\nscore: "+score.toFixed(2);
                            // note: Left-right are swapped because decrypts are constructed by reversing encryption.
                            out_str += '\nLeft key: '+ word_list[best_right_index];
                            if (best_right_reverse_key)
                                out_str += ' (reversed) ';                            
                            out_str += ' Right key: '+word_list[left_index] + ' (reversed) ';
                            out_str += ', Left route: '+ route_name[order[best_right_route]];
                            out_str += ', Right route: '+ route_name[order[left_route]];
                            out_str += ', seed: '+seed_number;
                            /*
                            for (i=0;i<5;i++) for(j=0;j<5;j++)
                                out_str += alpha.charAt(l_sqr[i][j]);
                            out_str += '     ';
                            for (i=0;i<5;i++) for(j=0;j<5;j++)
                                out_str += alpha.charAt(r_sqr[i][j]);
                            */
                            postMessage(out_str);
                        }
                    }
                    
				} //next left route, next left index
				if ( change_flag == 0){
					s = out_str + "\nRight key square unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best left key so far
				for (i=0;i<25;i++)
					l_sqr[i] = best_l_sqr[i];
				
	} // next trial            
	seed_number++;
	//printf ("New seed number %i\n",seed_number);
	s = out_str + "\nNew seed number "+seed_number;
	postMessage(s);	
	left_index = Math.floor(Math.random() * word_count);
	left_route = Math.floor(Math.random()* numb_routes);
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		if (c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    best_left_reverse_key = false;	
    if (reverse_flag && Math.random()< 0.5){
        best_left_reverse_key = true;
        key_array.reverse();
    }
    for (j=0;j<25;j++)
        best_l_sqr[j] = l_sqr[j] = key_array[ routes[order[ left_route] ][j] ];  
	
	local_best_score = -1000;
	if ( seed_number == last_seed_number)
					break;
	} // end while(1)            
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

	last_seed_number = numb_seeds;
	J_index = alpha6.indexOf('J');	
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha6.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
			//plain_text[buf_len++] = n;
	}
	var NUMB_ROUTES = routes6.length;
	if ( numb_routes > NUMB_ROUTES) numb_routes = NUMB_ROUTES;
    // select key and route for left square at random
    left_index = Math.floor( Math.random() * word_count);
    left_route = Math.floor( Math.random()* numb_routes);
    right_index = Math.floor( Math.random() * word_count);
    right_route = Math.floor( Math.random()* numb_routes);
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}
	get_next_key6(le);
    for (j=0;j<36;j++)
        work_key[j] = key_array[ routes6[left_route][j] ];  
    n = 0;
    for (i=0;i<6;i++) for (j=0;j<6;j++)    
        l_sqr_6[i][j] = work_key[n++];
    for (i=0;i<6;i++) for (j=0;j<6;j++)    
        best_l_sqr_6[i][j] = l_sqr_6[i][j];
    best_left_index = left_index;
    best_left_route = left_route;
    best_right_index = -1;
    local_best_score = best_score = -1000;
    seed_number = 0;
	while(1) {
	for (trial = 0 ; trial<100;trial++){        
			// find the best right key and route for this left key and route;
			change_flag = 0;
			//printf("Searching left key list...\n");
			for (right_index = 0;right_index<word_count;right_index++) 
				for (right_route = 0;right_route<numb_routes;right_route++){
					le = word_list[right_index].length;
					/* switch to a=0,b=1,c=2, etc*/
					for (i=0;i<le;i++) {
						c = word_list[right_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}
					get_next_key6(le);//expand key to 25 chars in key_array
					for (j=0;j<36;j++)
						work_key[j] = key_array[ routes6[right_route][j] ]; 
					n=0;
					for (i=0;i<6;i++) for (j=0;j<6;j++)    
						r_sqr_6[i][j] = work_key[n++];						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_right_index = right_index;
						best_right_route = right_route;
						for (i=0;i<6;i++) for (j=0;j<6;j++) 
							best_r_sqr_6[i][j] = r_sqr_6[i][j];                    
					}
					if ( score > best_score){
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha6.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: '+ word_list[right_index];
						out_str += ', Right key: '+word_list[best_left_index];
						out_str += ', Left route: '+ right_route;
						out_str += ', Right route: '+ best_left_route;
						out_str += ', seed: '+seed_number;
						/*
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(l_sqr[i][j]);
						out_str += '     ';
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(r_sqr[i][j]);
						*/
						postMessage(out_str);
						
					}
				} // next right index, next right route
	
				if ( change_flag == 0){
					//printf("\nLeft key square unchanged on trial %i! Done.\n", trial);
					//exit(0);
					s = out_str + "\nLeft key square unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best right key so far
				for (i=0;i<6;i++) for (j=0;j<6;j++)    
					r_sqr_6[i][j] = best_r_sqr_6[i][j];
				// now look for better left key and route
			//printf("Searching right key list...\n");    
			change_flag = 0;
			for (left_index = 0;left_index<word_count;left_index++)
				for (left_route = 0;left_route<numb_routes;left_route++){
					le = word_list[left_index].length;
					for (i=0;i<le;i++) {
						c = word_list[left_index].charAt(i);
						key[i] = alpha.indexOf(c);
					}
					get_next_key6(le);
					for (j=0;j<36;j++)
						work_key[j] = key_array[ routes6[left_route][j] ];  
					
					n=0;
					for (i=0;i<6;i++) for (j=0;j<6;j++)    
						l_sqr_6[i][j] = work_key[n++];
						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_left_index = left_index;
						best_left_route = left_route;
						for (i=0;i<6;i++) for (j=0;j<6;j++) 
							best_l_sqr_6[i][j] = l_sqr_6[i][j];                    
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<buf_len;i++)
							out_str += alpha6.charAt(plain_text[i]).toLowerCase();
						out_str += "\nscore: "+score.toFixed(2);
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nLeft key: '+ word_list[best_right_index];
						out_str += ' Right key: '+word_list[left_index];
						out_str += ', Left route: '+ best_right_route;
						out_str += ', Right route: '+ left_route;
						out_str += ', seed: '+seed_number;
						/*
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(l_sqr[i][j]);
						out_str += '     ';
						for (i=0;i<5;i++) for(j=0;j<5;j++)
							out_str += alpha.charAt(r_sqr[i][j]);
						*/
						//document.getElementById('output_area').value = out_str;	
						postMessage(out_str);
 
					}
				} //next left route, next left index
				if ( change_flag == 0){
					//printf("\nLeft key square unchanged on trial %i! Done.\n", trial);
					//exit(0);
					s = out_str + "\nRight key square unchanged on trial "+trial;
					postMessage(s);
					break;
				}
				// set up best left key so far
				for (i=0;i<6;i++) for (j=0;j<6;j++)                        
					l_sqr_6[i][j] = best_l_sqr_6[i][j];
				
	} // next trial            
	seed_number++;
	//printf ("New seed number %i\n",seed_number);
	s = out_str + "\nNew seed number "+seed_number;
	postMessage(s);	
	left_index = Math.floor(Math.random() * word_count);
	left_route = Math.floor(Math.random()* numb_routes);
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		key[i] = alpha.indexOf(c);
	}
	get_next_key6(le);
    for (j=0;j<36;j++)
        work_key[j] = key_array[ routes6[left_route][j] ];  
	n = 0;
	for (i=0;i<6;i++) for (j=0;j<6;j++)    
		l_sqr_6[i][j] = work_key[n++];
	for (i=0;i<6;i++) for (j=0;j<6;j++)    
		best_l_sqr_6[i][j] = l_sqr_6[i][j];
	local_best_score = -1000;
	if ( seed_number == last_seed_number)
					break;
	} // end while(1)            
}	

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,s;
debugger;
  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
	period = parseInt(s[1]);
	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
	if (s[3] == '0') key6_flag = false;
	else key6_flag = true;
	numb_seeds = parseInt(s[4]);
	numb_routes = parseInt(s[5]);
    if (s[6] == '1') reverse_flag = true;
    else reverse_flag = false;
    order = JSON.parse(s[7]);
  }
  else if(str.charAt(0)  == '#') {// construct key table
    make_word_list(str);
  }
  else {
		postMessage("1working...");
		do_key_search(str);
			postMessage("1DONE"); // 1 at beginning is signal not to post in output box
  }
};  
