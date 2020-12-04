// Converging key search worker
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
var J_index;
var used_let = [];
var max_trials;
var flag6x6 = false;
var keysquare_width;

var best_l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
var best_r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];
var best_m_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]];

var l_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // left
var r_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // right (top)
var m_sqr = [[0,1,2,3,4],[5,6,7,8,9],[10,11,12,13,14],[15,16,17,18,19],[20,21,22,23,24]]; // middle
var inv_row1 = [];
var inv_col1 = [];
var inv_row2 = [];
var inv_col2 = [];
var inv_row3 = [];
var inv_col3 = [];



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

function put_pc(l,m,r,i1) {
       var row1,col1,row2,col2;
       var mrow,mcol;
	var tmp;
       
       col1=inv_col1[l];
       row2=inv_row2[r];

       mrow=inv_row3[m];
       mcol=inv_col3[m];
       
      	plain_text[i1] = l_sqr[mrow][ col1];
      	plain_text[i1+1] = r_sqr[row2][mcol];
       

	
}

                		
	
function get_trial_decrypt(){
       var i,j,k, index,x;
       var c1,c2,c3,c4;

       // get inverse key squares
	for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++){
		inv_row1[ l_sqr[i][j] ] = i;
		inv_col1[ l_sqr[i][j] ] = j;
		inv_row2[ r_sqr[i][j] ] = i;
		inv_col2[ r_sqr[i][j] ] = j;	
		inv_row3[ m_sqr[i][j] ] = i;
		inv_col3[ m_sqr[i][j] ] = j;	
           
	}
       index = 0;
       for (j=0;j<buf_len;j = j+3) {
               c1 = buffer[j];
               c2 = buffer[j+1];
               c3 = buffer[j+2];
			put_pc(c1,c2,c3,index);
               index += 2;
       }
 }

	

function get_score(buf_len){
	var score,i,n;

    get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<plain_text.length-3;i++){
        if (plain_text[i] >25 || plain_text[i+1] >25 || plain_text[i+2] >25 || plain_text[i+3] >25 )
            continue;
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2]+26*26*26*plain_text[i+3];
		score += tet_table[n];
	}
	return(score);
}	

function get_next_key(le){
	var i,j,k,index;
    
    if ( flag6x6){
        get_6x6key_array(le);
        return;
    }
	key_array = [];
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

function get_6x6key_array(le){
        var i,j,c,n,n2;
        var indx;
        
        var used_indx = [];
        key_array = [];
        for (i=0;i<26;i++) used_indx[i] = 0
        indx = 0;
        for (i=0;i<le;i++){
            if (  used_indx[key[i]] == 0 ){
                key_array[indx++] = key[i];
                used_indx[key[i]] = 1;
                if(key[i]<9)
                  key_array[indx++] = key[i]+27; // 1-9
                else if (key[i]==9) // letter j
                  key_array[indx++] = 26; // position of 0
                
            }
        }
        for (i=0;i<26;i++){
            if (  used_indx[i] == 0 ){
                key_array[indx++] = i
                if(i<9)
                  key_array[indx++] = i+27; // 1-9
                else if (i==9) // letter j
                  key_array[indx++] = 26; // position of 0
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
    var mid_index, mid_route,best_mid_index,best_mid_route;
    var change_flag, seed_number, last_seed_number;
    var local_best_score;
	var le;

    debugger;
    if (flag6x6) 
        keysquare_width = 6;
    else
        keysquare_width = 5;
    // initialize all keysquares separately so no two are pointing at each other.
    l_sqr = [];
    r_sqr = [];
    m_sqr = [];
    n = 0
    for (i=0;i<keysquare_width;i++){
      l_sqr[i] = [];
      r_sqr[i] = [];
      m_sqr[i] = [];
      for (j=0;j<keysquare_width;j++){
        l_sqr[i][j] = n;
        r_sqr[i][j] = n;
        m_sqr[i][j] = n++
      }
    }
    best_l_sqr = [];
    best_r_sqr = [];
    best_m_sqr = [];
    n = 0
    for (i=0;i<keysquare_width;i++){
      best_l_sqr[i] = [];
      best_r_sqr[i] = [];
      best_m_sqr[i] = [];
      for (j=0;j<keysquare_width;j++){
        best_l_sqr[i][j] = n;
        best_r_sqr[i][j] = n;
        best_m_sqr[i][j] = n++
      }
    }
    
	last_seed_number = numb_seeds;
	J_index = alpha.indexOf('J');
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
        if (flag6x6)
            n = alpha6.indexOf(c);
        else
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
    mid_index = Math.floor( Math.random() * word_count);
    mid_route = Math.floor( Math.random()* numb_routes);
    
	le = word_list[left_index].length;
	for (i=0;i<le;i++) {
		c = word_list[left_index].charAt(i);
		if (!flag6x6 && c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    for (j=0;j<keysquare_width*keysquare_width;j++)
        if ( flag6x6) work_key[j] = key_array[ routes6[order[left_route]][j] ];  
        else work_key[j] = key_array[ routes[order[left_route]][j] ];  
    n = 0;
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        l_sqr[i][j] = work_key[n++];
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        best_l_sqr[i][j] = l_sqr[i][j];
        
	le = word_list[mid_index].length;
	for (i=0;i<le;i++) {
		c = word_list[mid_index].charAt(i);
		if (c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    for (j=0;j<keysquare_width*keysquare_width;j++)
        if ( flag6x6) work_key[j] = key_array[ routes6[order[mid_route]][j] ];  
        else work_key[j] = key_array[ routes[order[mid_route]][j] ];  
    n = 0;
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        m_sqr[i][j] = work_key[n++];
    for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
        best_m_sqr[i][j] = m_sqr[i][j];
        
    best_left_index = left_index;
    best_left_route = left_route;
    best_mid_index = mid_index;
    best_mid_route = mid_route;
    
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
						if (!flag6x6 && c =='J') c = 'I';
						key[i] = alpha.indexOf(c);
					}
					get_next_key(le);//expand key to keysquare_width*keysquare_width chars in key_array
					for (j=0;j<keysquare_width*keysquare_width;j++)
                        if ( flag6x6) work_key[j] = key_array[ routes6[order[right_route]][j] ];  
                        else work_key[j] = key_array[ routes[order[right_route]][j] ];  
					n=0;
					for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
						r_sqr[i][j] = work_key[n++];						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_right_index = right_index;
						best_right_route = right_route;
						for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++) 
							best_r_sqr[i][j] = r_sqr[i][j];                    
					}
					if ( score > best_score){
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<plain_text.length;i++){
                            if ( flag6x6) 
                                out_str += alpha6.charAt(plain_text[i]).toLowerCase();
                            else
                                out_str += alpha.charAt(plain_text[i]).toLowerCase();
                        }
						out_str += "\nscore: "+score.toFixed(2);
						out_str += '\nKeys:';
						out_str += '\nTop key: '+ word_list[right_index];
						out_str += ', Left key: '+word_list[best_left_index];
                        out_str += ', Middle key: '+word_list[best_mid_index];
						out_str += ', Top route: '+ route_name[order[right_route]];
						out_str += ', Left route: '+ route_name[order[best_left_route]];
                        out_str += ', Middle route: '+ route_name[order[best_mid_route]];
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
				// set up best right key so far
				for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
					r_sqr[i][j] = best_r_sqr[i][j];
				// now look for better left key and route
			//printf("Searching right key list...\n");    
			//change_flag = 0;
			for (left_index = 0;left_index<word_count;left_index++)
				for (left_route = 0;left_route<numb_routes;left_route++){
					le = word_list[left_index].length;
					for (i=0;i<le;i++) {
						c = word_list[left_index].charAt(i);
						if (!flag6x6 && c =='J') c = 'I';
						key[i] = alpha.indexOf(c);
					}
					get_next_key(le);
					for (j=0;j<keysquare_width*keysquare_width;j++)
                        if ( flag6x6) work_key[j] = key_array[ routes6[order[left_route]][j] ];  
                        else work_key[j] = key_array[ routes[order[left_route]][j] ];  
					
					n=0;
					for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
						l_sqr[i][j] = work_key[n++];
						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_left_index = left_index;
						best_left_route = left_route;
						for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++) 
							best_l_sqr[i][j] = l_sqr[i][j];                    
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<plain_text.length;i++){
                            if ( flag6x6) 
                                out_str += alpha6.charAt(plain_text[i]).toLowerCase();
                            else
                                out_str += alpha.charAt(plain_text[i]).toLowerCase();
                        }
/*                        
						for (i=0;i<plain_text.length;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
*/                            
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += '\nKeys:';
						// note: Left-right are swapped because decrypts are constructed by reversing encryption.
						out_str += '\nTop key: '+ word_list[best_right_index];
						out_str += ' Left key: '+word_list[left_index];
                        out_str += ', Middle key: '+word_list[best_mid_index];                        
						out_str += ', Top route: '+ route_name[order[best_right_route]];
						out_str += ', Left route: '+ route_name[order[left_route]];
                        out_str += ', Middle route: '+ route_name[order[best_mid_route]];
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
				// set up best left key so far
				for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)                        
					l_sqr[i][j] = best_l_sqr[i][j];
                    
			//change_flag = 0;
			for (mid_index = 0;mid_index<word_count;mid_index++)
				for (mid_route = 0;mid_route<numb_routes;mid_route++){
					le = word_list[mid_index].length;
					for (i=0;i<le;i++) {
						c = word_list[mid_index].charAt(i);
						if (!flag6x6 && c =='J') c = 'I';
						key[i] = alpha.indexOf(c);
					}
					get_next_key(le);
					for (j=0;j<keysquare_width*keysquare_width;j++)
                        if ( flag6x6) work_key[j] = key_array[ routes6[order[mid_route]][j] ];  
                        else work_key[j] = key_array[ routes[order[mid_route]][j] ];  
					
					n=0;
					for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
						m_sqr[i][j] = work_key[n++];
						
					score = get_score(buf_len);
					if ( score > local_best_score){
						local_best_score = score;
						change_flag = 1;
						best_mid_index = mid_index;
						best_mid_route = mid_route;
						for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++) 
							best_m_sqr[i][j] = m_sqr[i][j];                    
					}                
					if ( score > best_score){
						// change_flag = 1;
						best_score = score;
						out_str = '0'; // 0 at beginning is signal to post message in output box
						x = score.toFixed(2);
						out_str += x+'~';
						for (i=0;i<plain_text.length;i++){
                            if ( flag6x6) 
                                out_str += alpha6.charAt(plain_text[i]).toLowerCase();
                            else
                                out_str += alpha.charAt(plain_text[i]).toLowerCase();
                        }
/*                        
						for (i=0;i<plain_text.length;i++)
							out_str += alpha.charAt(plain_text[i]).toLowerCase();
*/                            
						out_str += "\nscore: "+score.toFixed(2);
                        out_str += '\n Keys:';
						
						out_str += '\nTop key: '+ word_list[best_right_index];
						out_str += ' Left key: '+word_list[best_left_index];
                        out_str += ', Middle key: '+word_list[mid_index];                        
						out_str += ', Top route: '+ route_name[order[best_right_route]];
						out_str += ', Left route: '+ route_name[order[best_left_route]];
                        out_str += ', Middle route: '+ route_name[order[mid_route]];
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
				} //next mid route, next mid index
                if (change_flag == 0) break;
				// set up best left key so far
				for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)                        
					m_sqr[i][j] = best_m_sqr[i][j];
                    
				
	} // next trial            
	seed_number++;
	//printf ("New seed number %i\n",seed_number);
	s = out_str + "\nNew seed number "+seed_number;
	postMessage(s);	
	mid_index = Math.floor(Math.random() * word_count);
	mid_route = Math.floor(Math.random()* numb_routes);
	le = word_list[mid_index].length;
	for (i=0;i<le;i++) {
		c = word_list[mid_index].charAt(i);
		if (!flag6x6 && c =='J') c = 'I';
		key[i] = alpha.indexOf(c);
	}
	get_next_key(le);
    for (j=0;j<keysquare_width*keysquare_width;j++)
        if ( flag6x6) work_key[j] = key_array[ routes6[order[mid_route]][j] ];  
        else work_key[j] = key_array[ routes[order[mid_route]][j] ];  
	n = 0;
	for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
		m_sqr[i][j] = work_key[n++];
	for (i=0;i<keysquare_width;i++) for (j=0;j<keysquare_width;j++)    
		best_m_sqr[i][j] = m_sqr[i][j];
	local_best_score = -1000;
	if ( seed_number == last_seed_number)
					break;
	} // end while(1)            
} // end main
	

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,buf_len,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count,s;
    debugger;
  var str = event.data; // string to decode
  if (str.charAt(0)  == '@')  {
	s = str.split(':'); // variable values separated by colons
  	//max_trials = parseInt(s[0].slice(1));
	//if (s[1] == '0') s4Flag=true;
  	//fudge_factor = parseFloat(s[2]);
  	//n = parseInt(s[3]);
    
	n = parseInt(s[2]);
  	Math.random(n); // seed for hill-climbing
    order = JSON.parse(s[3]);
	//if (s[4] == '0') key6_flag = false;
	numb_seeds = parseInt(s[4]);
	numb_routes = parseInt(s[5]);
    if (s[6] == '1')
        flag6x6 = true;
    else
        flag6x6 = false;
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
