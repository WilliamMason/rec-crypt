// PH hill-climber with log tetragraph scoring
importScripts('tet27table.js'); 
importScripts('tettable.js'); 

var tet_table27 = [];
var tet_table = [];
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var key_width;
var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij';
var ext_alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ["; 


var v_keys,h_keys;
var ciphertext, buf_len;
var buffer, work_buffer, final_buffer;
var vkey,hkey, numb_v_keys,numb_h_keys;
var pair_sub;
var freq,dfreq;
var key_score_flag = true;
var hill_climb_flag = false;

var top_keys;
var max_trials = 1000000;
var plain_text;

var alpha27  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
var whitespace="\n\t\r ',-.;=";
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	

// hill-climbing to solve simple sub
var max_simpsub_trials =  10000; // max hill-climbing trials
var simple_sub_array = [];
var plain_symbols = "abcdefghijklmnopqrstuvwxyz0123456789";
var best_plain,temp_plain;

var crib_flag=0;
var crib;
var crib_buffer = [];
//var crib_len;
// allow multiple floating cribs. To be practical restrict to 3, never had more than that in the Cryptogam. 
var float_crib;
var MAX_CRIBS = 3;
var numb_cribs;

// 6x6 stuff
var alpha5='abcdefghijklmnopqrstuvwxyz';
var alpha6 = 'abcdefghijklmnopqrstuvwxyz0123456789';


function alltrim(str) { // remove leading and trailing blanks
	return str.replace(/^\s+|\s+$/g, '');
}

function condense_white_space(str) { // replace sequences of 1 or more space characters by single blanks
	return str.replace(/\s+/g, ' ');
}

function initialize_tet_table(){
	var i,c,n,v;
    
    // for hill-climbing option

	for ( i = 0; i<26*26*26*26;i++)
		tet_table[i] = 0.0;
	for ( c in tet_values){
		n = alpha.indexOf(tet_values[c].charAt(0))+	26*alpha.indexOf(tet_values[c].charAt(1))
			+ 26*26*alpha.indexOf(tet_values[c].charAt(2))+ 26*26*26*alpha.indexOf(tet_values[c].charAt(3));
		v = parseFloat(tet_values[c].slice(4));
		tet_table[n] = v;
	}    
    // for key scoring option
	for ( i = 0; i<27*27*27*27;i++)
		tet_table27[i] = 0.0;
	for ( c in tet27_values){
		n = ext_alpha.indexOf(tet27_values[c].charAt(0))+	27*ext_alpha.indexOf(tet27_values[c].charAt(1))
			+ 27*27*ext_alpha.indexOf(tet27_values[c].charAt(2))+ 27*27*27*ext_alpha.indexOf(tet27_values[c].charAt(3));
		v = parseFloat(tet27_values[c].slice(4));
		tet_table27[n] = v;
	}
	//alert("tet_table initialized");
	postMessage("tet table initialized");
}	
initialize_tet_table();

function make_table(str) {
    var s,i;
    var c, n,state;
    var n1,n2,n3,x;
    var max_n,max_v,c1,c2,c3,c4,mc1,mc2,mc3,mc4;
    s = "making table from sring of length "+str.length;
    postMessage(s);
    str = str.toUpperCase();
    for (i=0;i<27*27*27*27;i++)
        tet_table27[i] = 0.0;
    // make tet table with blanks
    max_n = 0;
    max_v=0;
    state = 0;
    var spaceFlag = 0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = whitespace.indexOf(c);
        if ( n >= 0) {
            if (spaceFlag == 1) continue; // in the middle of a bunch of blanks
            spaceFlag = 1;
            c = ' ';
        }
        n = alpha27.indexOf(c);
        if ( n == -1) continue;
        if ( n<26) spaceFlag = 0;
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
            //x = n+27*n3+27*27*n2+27*27*27*n1;
            x = n1+27*n2+27*27*n3+27*27*27*n;
            tet_table27[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            if (tet_table27[x] > max_v) {
                max_v = tet_table27[x];
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
    s += '\nthere were '+max_n+' 27 char tetragraphs with greatest value of '+max_v;
    s += ' for tet: '+mc1+mc2+mc3+mc4;
    // still have to convert to logs.
    //for (i=0;i<26*26*26*26;i++)
    //    tet_table27[i] = Math.log(1+tet_table27[i]);
    for (i=0;i<27*27*27*27;i++)
        tet_table27[i] = Math.log(1+tet_table27[i]);
        
        
    // make tet table with no blanks        
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = 0.0;
    for (i=1; i<str.length;i++) { // start at 1 because char 0 is just the '#' flag
        c = str.charAt(i);
        n = alpha.indexOf(c);
        if ( n == -1) continue;
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
            //x = n+27*n3+27*27*n2+27*27*27*n1;
            x = n1+26*n2+26*26*n3+26*26*26*n;
            tet_table[x]++;
            n1 = n2;
            n2 = n3;
            n3 = n;
            c1 = c2;
            c2 = c3;
            c3 = c;
        }
        state++;
    }    
    // still have to convert to logs.
    //for (i=0;i<26*26*26*26;i++)
    //    tet_table27[i] = Math.log(1+tet_table27[i]);
    for (i=0;i<26*26*26*26;i++)
        tet_table[i] = Math.log(1+tet_table[i]);
    
    //postMessage(s);    
}    


function do_search(){
    var i,j,n,c,indx;
    var vk,hk;
    var score, best_score, current_hc_score;
    var str,s;
    var best_v,best_k, best_sub;
    var numb_top_keys,least_top_score,least_top_index;
    var mut_choice,trial,n1,n2,c1,c2, mut_count;
    var crib_alpha;
    plain_text = [];
    
    // convert ciphertext to number array
    ciphertext = ciphertext.toLowerCase();
    buffer = [];
    buf_len = 0;
    for (i=0;i<ciphertext.length;i++) {
        c = ciphertext.charAt(i);
        n = l_alpha.indexOf(c);
        if ( n != -1) 
            buffer[buf_len++] = n;
    }
    // convert keys to number arrays
    vkey = [];
    indx = 0;
    for (j=0;j<v_keys.length;j++) {
        c = v_keys.charAt(j);
        n = l_alpha.indexOf(c);
        if ( n != -1) 
           vkey[indx++] = n;
    }
    
    hkey = [];
    indx = 0;
    for (j=0;j<h_keys.length;j++) {
        c = h_keys.charAt(j);
        n = l_alpha.indexOf(c);
        if ( n != -1) 
           hkey[indx++] = n;
    }
    if (crib_flag >= 1){
        crib = crib.toLowerCase();
        if (key_width == 6)
            crib_alpha = alpha6;
        else
            crib_alpha = alpha5;
        if ( crib_flag == 1 ){
            crib_len = 0;
            for (i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if (c == '-')
                    crib_buffer[crib_len++] = -1;
                else {
                    n = crib_alpha.indexOf(c);
                    if ( n>=0)
                        crib_buffer[crib_len++] = n;
                }
            }
        }
        else { // crib_flag ==2, floating crib
            crib_len = 0;
            float_crib = [];
            numb_cribs = 0;
            float_crib[numb_cribs] = [];
            for (var i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if ( c == '\n'){
                    numb_cribs++;
                    float_crib[numb_cribs] = [];
                    crib_len = 0;
                    continue;
                }
                n = crib_alpha.indexOf(c);
                if ( n>=0)
                    float_crib[numb_cribs][crib_len++] = n;
            }
            /* // this should already be checked 
            if ( numb_cribs==0 && crib_len == 0){
                alert("No crib entered!");
                return;
            }
            */ 
            while (numb_cribs>0 && float_crib[numb_cribs].length == 0) // last crib string ended in a new line, remove empty crib
                numb_cribs--;
            // but now final crib doesn't end in line feed, increment to get actual crib count.
            numb_cribs++;
            if ( numb_cribs > MAX_CRIBS) // allows 3, usually no more than 2
                numb_cribs = MAX_CRIBS;
        
        }
    }
    
    work_buffer = [];
    final_buffer = [];
    freq = [];
    dfreq = [];    
    pair_sub = [];
    for (i=0;i<36;i++) {
        pair_sub[i] = [];
        dfreq[i] = [];
    }
    best_score = current_hc_score = -10000;
    mut_count = 0;
    for (trial = 0;trial<max_trials;trial++) {
        mut_choice = Math.floor(Math.random()*100);
        if ( mut_choice<50){
            n1 = Math.floor(Math.random()*vkey.length);
            n2 = Math.floor(Math.random()*vkey.length);
            c1 = vkey[n1];
            c2 = vkey[n2];
            vkey[n1] = c2;
            vkey[n2] = c1;
        }
        else {
            n1 = Math.floor(Math.random()*hkey.length);
            n2 = Math.floor(Math.random()*hkey.length);
            c1 = hkey[n1];
            c2 = hkey[n2];
            hkey[n1] = c2;
            hkey[n2] = c1;
        }
        
        xlate(); // convert to simple substitution
        score = get_score();
        if (score > best_score){
            best_score = score;
            str = '';
            if (hill_climb_flag){
                best_plain = temp_plain.slice(0);
                str += best_plain+'\n(Best plaintext) ';
                if ( crib_flag>0)
                    str += '(using crib)';
                str += '\n';
            }            
            best_v = vkey.slice(0);
            best_h = hkey.slice(0);
            best_sub = '';
            for (i=0;i<buf_len/2;i++)
                best_sub += symbols.charAt(final_buffer[i] );
            n = Math.floor(best_score);
            str += 'best score is: '+n+' on trial '+trial+'\n';
            str += 'best vertical key: ';
                for (i=0;i<best_v.length;i++) {
                    str += symbols.charAt(best_v[i] );
                    if ( i== key_width-1)
                        str += ' ';
                }
            str += '\nbest horizontal key: ';
                for (i=0;i<best_h.length;i++) {
                    str += symbols.charAt(best_h[i] );  
                    if ( i== key_width-1)
                        str += ' ';
                }
            str += '\nbest simple substitution cipher: '+best_sub+' \n';
            postMessage(str);    
        }
        if (score > current_hc_score){
            current_hc_score = score;
            mut_count = 0;
        }
        else {
            mut_count++;
            if ( mut_choice<50){
                vkey[n1]=c1;
                vkey[n2]=c2;
            }
            else {
                hkey[n1]=c1;
                hkey[n2]=c2;
            }
            if ( mut_count > 500) {
                current_hc_score = -10000;
                mut_count = 0;
            }
        }        
        if ( ((trial)%1000 ) == 0){
            s = '~'+trial;
            postMessage(s);
        }
    }

    n = Math.floor(best_score);
    str = 'best score is: '+n+'\n';
    str += 'best vertical key: ';
    for (i=0;i<best_v.length;i++) {
            if ( i== key_width) str += ' ';
            str += symbols.charAt(best_v[i] );
    }
    str += '\nbest horizontal key: ';
    for (i=0;i<best_h.length;i++) {
            if ( i==key_width ) str += ' ';
            str += symbols.charAt(best_h[i] ); 
     }
    str += '\nbest simple substitution cipher: '+best_sub+' \n';
    if (hill_climb_flag)
        str += '\nbest plaintext: '+best_plain+' \n';
    str += '\n(processing complete)';
    postMessage(str);    
    s = '~'+trial;
    postMessage(s);
    
    
}

function xlate( ){
	var i,j,x,k;
	var c;
	var vindex,hindex,count;

	for (i=0;i<buf_len;i++)
		work_buffer[i] = buffer[i];
    // using current pairing, convert to single checkerboard
	for (i=0;i<buf_len;i = i+2) {
		c = buffer[i];
		for (j=key_width;j<vkey.length;j++)
			if ( vkey[j]==c) {
				work_buffer[i] = vkey[j-key_width];
				break;
		}
		c = buffer[i+1];
		for (j=key_width;j<hkey.length;j++)
			if ( hkey[j]==c) {
				work_buffer[i+1] = hkey[j-key_width];
				break;
		}
	}
    for (j=0;j<36;j++)
        for (k=0;k<36;k++)
              pair_sub[j][k]=0;
    // assign single symbols to pairs 
    x = 1;
    for (j=0;j<buf_len;j = j+2)
        if ( pair_sub[work_buffer[j]][work_buffer[j+1]]==0)
             pair_sub[work_buffer[j]][work_buffer[j+1]] = x++;
    // convert to simple substitution
    count=0;
    for (j=0;j<buf_len;j = j+2) {
		final_buffer[count++] = pair_sub[work_buffer[j]][work_buffer[j+1]]-1;
    }
} // end xlate

function get_score(){
	var i,j,k;
	var index,len,sum,score;
	var k_score,n;
    
	//score = 0;
    if(key_score_flag) 
        score = get_key_score();
    else
        score = 0;
    if (hill_climb_flag)
        score += hill_climb_key();
    else { // IC+DIC
        for (i=0;i<36;i++) freq[i] = 0;
        len = buf_len>>1;
        for (j=0;j<len;j++)
            freq[final_buffer[j]]++;
        sum = 0;
        for (j=0;j<36;j++)
        sum += freq[j]*(freq[j]-1);
        score += 1000*sum/(len*(len-1));
        for (i=0;i<36;i++) for (j=0;j<36;j++) dfreq[i][j] = 0;
        for (j=0;j<len-1;j++)
            dfreq[final_buffer[j]][final_buffer[j+1]]++;
        sum = 0;
        for (j=0;j<36;j++)	for (i=0;i<36;i++)
                sum += dfreq[j][i]*(dfreq[j][i]-1);
        score += 10000*sum/((len-1)*(len-2));
    }

	return(score);
} /* end get_score*/

function get_key_score(){
	var score,i,n;
    var index;

    plain_text[0] = 26; /* space at start and end , using tet27 scoring*/    
    for (i=0;i<key_width;i++)
        plain_text[i+1] = vkey[i]; // plain_text has blanks at beginning and end
    plain_text[key_width+1] = 26; /* space at start and end , using tet27 scoring*/            
	score = 0.0;
    /* tetragrams */
    for (i=0;i<key_width-1;i++) { // limit: key_width+2-3
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table27[index];
   }

    for (i=0;i<key_width;i++)
        plain_text[i+1] = vkey[i+key_width]; // plain_text has blanks at beginning and end
    for (i=0;i<key_width-1;i++) { // limit: key_width+2-3
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table27[index];
   }   
    for (i=0;i<key_width;i++)
        plain_text[i+1] = hkey[i]; // plain_text has blanks at beginning and end
    for (i=0;i<key_width-1;i++) { // limit: key_width+2-3
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table27[index];
   }
    for (i=0;i<key_width;i++)
        plain_text[i+1] = hkey[i+key_width]; // plain_text has blanks at beginning and end
    for (i=0;i<key_width-1;i++) { // limit: key_width+2-3
        index = plain_text[i]+27*plain_text[i+1]
                            +27*27*plain_text[i+2]+27*27*27*plain_text[i+3];
       	score += tet_table27[index];
   }

   return(score);
}   

function hill_climb_key(){
    var score, trial,n1,n2,n3,hc_score,x;
    var sum,sum2,ct,ct2,index,i,j,n,k,le;    
    var temp = [];
    var best_array = [];
    var mut_count, best_ss_score;
    var numb_symbols;

    if ( key_width == 5)
        numb_symbols = 26;
    else
        numb_symbols = 36;
    for (i=0;i<numb_symbols;i++)
        simple_sub_array[i] = i;
    // randomize
    for (i= numb_symbols-1; i>0;i--){
        j = Math.floor(Math.random()*i);
        n = simple_sub_array[i];
        simple_sub_array[i] = simple_sub_array[j];
        simple_sub_array[j] = n;
    }
    best_ss_score = 0;
    hc_score = 0;
    mut_count = 0;
    
    for (trial = 0;trial<max_simpsub_trials;trial++){
        n1 = Math.floor(Math.random()*numb_symbols);
        n2 = Math.floor(Math.random()*numb_symbols);
        x = simple_sub_array[n1];
        simple_sub_array[n1] = simple_sub_array[n2];
        simple_sub_array[n2] = x;
        for (i=0;i< final_buffer.length;i++)
            temp[i] = simple_sub_array[ final_buffer[i] ];
        score = 0;
        if ( crib_flag == 1){
            for (i=0;i<buf_len;i++){
                if (temp[i] == crib_buffer[i])
                    score += 1.0
            }
            score *= 100.0;
        }
        else if (crib_flag == 2){ // floating crib
            best_match = 0;
            crib_start0 = crib_start1 = -1;
            crib_len = float_crib[0].length;
            for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++)
                if ( temp[crib_pos] == float_crib[0][0]) {
                        match = 0.0;
                        for (y=0;y<crib_len;y++)
                                if ( temp[crib_pos+y] == float_crib[0][y]) {
                                        match += 1.0
                        }
                        if (match>best_match) {
                                best_match = match;
                                crib_start0 = crib_pos;
                        }
            }
            score += 100.0*best_match;
            if ( numb_cribs > 1) {
                best_match = 0;        
                crib_len = float_crib[1].length;        
                for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++) {
                    if (crib_pos == crib_start0 ) continue;
                    if ( temp[crib_pos] == float_crib[1][0]) {
                            match = 0.0;
                            for (y=0;y<crib_len;y++)
                                    if ( temp[crib_pos+y] == float_crib[1][y]) {
                                            match += 1.0
                            }
                            if (match>best_match) {
                                    best_match = match;
                                    crib_start1 = crib_pos;
                            }
                    }
                }
                score += 100.0*best_match;
            }
            if ( numb_cribs > 2) {
                best_match = 0;        
                crib_len = float_crib[2].length;        
                for ( crib_pos=0;crib_pos<buf_len-crib_len+1;crib_pos++) {
                    if (crib_pos == crib_start0 || crib_pos == crib_start1 ) continue;
                    if ( temp[crib_pos] == float_crib[2][0]) {
                            match = 0.0;
                            for (y=0;y<crib_len;y++)
                                    if ( temp[crib_pos+y] == float_crib[2][y]) {
                                            match += 1.0
                            }
                            if (match>best_match) {
                                    best_match = match;
                                    crib_start1 = crib_pos;
                            }
                    }
                }
                score += 100.0*best_match;
            } 
        }         
        for (i=0;i<final_buffer.length-3;i++){
            if ( temp[i]>25 || temp[i+1]>25 || temp[i+2]>25 || temp[i+3]>25 ) continue;
            n = temp[i]+26*temp[i+1]+26*26*temp[i+2]+26*26*26*temp[i+3];
            score += tet_table[n];
        }
        if (score>best_ss_score) {
            best_ss_score = score;
            for (k=0;k<numb_symbols;k++)
                best_array[k] = simple_sub_array[k];
            temp_plain = ''; // global var
            for (i=0;i<final_buffer.length;i++)
                temp_plain += plain_symbols[ temp[i] ];
        }
        if (score>hc_score) {
            hc_score = score;
            mut_count = 0;
        }
        else {
            mut_count++;
            // swap column order back the way it was
            x = simple_sub_array[n1];
            simple_sub_array[n1] = simple_sub_array[n2];
            simple_sub_array[n2] = x;
            if ( mut_count >= 500)
                hc_score = 0; // accept next swap no matter what
        }
    }
    // set simple_sub to best sol
    for (i=0;i<numb_symbols;i++)
        simple_sub_array[i] = best_array[i];
    
    return(best_ss_score);
    
//return(0);
}

function solve_simple_sub_cipher(){
	var i,j,k,c,n,s;
	//postMessage('got to simple sub cipher');
    // convert ciphertext to number array
    ciphertext = ciphertext.toLowerCase(); // now simple sub, not origianl checkerboard
    final_buffer = [];
    buf_len = 0;
    for (i=0;i<ciphertext.length;i++) {
        c = ciphertext.charAt(i);
        n = l_alpha.indexOf(c);
        if ( n != -1) 
            final_buffer[buf_len++] = n;
    }
	key_width = 5;
    if (crib_flag >= 1){
        crib = crib.toLowerCase();
        if (key_width == 6)
            crib_alpha = alpha6;
        else
            crib_alpha = alpha5;
        if ( crib_flag == 1 ){
            crib_len = 0;
            for (i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if (c == '-')
                    crib_buffer[crib_len++] = -1;
                else {
                    n = crib_alpha.indexOf(c);
                    if ( n>=0)
                        crib_buffer[crib_len++] = n;
                }
            }
        }
        else { // crib_flag ==2, floating crib
            crib_len = 0;
            float_crib = [];
            numb_cribs = 0;
            float_crib[numb_cribs] = [];
            for (var i=0;i<crib.length;i++){
                c = crib.charAt(i);
                if ( c == '\n'){
                    numb_cribs++;
                    float_crib[numb_cribs] = [];
                    crib_len = 0;
                    continue;
                }
                n = crib_alpha.indexOf(c);
                if ( n>=0)
                    float_crib[numb_cribs][crib_len++] = n;
            }
            /* // this should already be checked 
            if ( numb_cribs==0 && crib_len == 0){
                alert("No crib entered!");
                return;
            }
            */ 
            while (numb_cribs>0 && float_crib[numb_cribs].length == 0) // last crib string ended in a new line, remove empty crib
                numb_cribs--;
            // but now final crib doesn't end in line feed, increment to get actual crib count.
            numb_cribs++;
            if ( numb_cribs > MAX_CRIBS) // allows 3, usually no more than 2
                numb_cribs = MAX_CRIBS;
        
        }
    }
	
	var score = hill_climb_key();
    str = '';
    best_plain = temp_plain.slice(0);
    str += best_plain+'\n(Best plaintext) ';
    if ( crib_flag>0)
            str += '(using crib)';
    str += '\n';
	str += 'score: '+score;
	// show keysquare;
	// need to substitute dashes - where no letters in the plaintext 

	str += '\nBest keysquare:\n'
	j=0;
	for (i=0;i<25;i++){	// only need first 25 letters, Z never appears in the simple sub ciphertxt string that is output by key finder program
		c = l_alpha.charAt(simple_sub_array[i]);
		n = best_plain.indexOf(c);
		if (n == -1) // letterc  never appears in the plaintext
			c = '-'
		str += c;
		if (++j == 5){
			str += '\n'
			j=0;
		}
	}
    str += '\n(processing complete)';
    postMessage(str);    
    	
		
}
onmessage = function(event) { //receiving a message
	var str,s;

debugger;    
    if ( event.data.op_choice == 1) {
        make_table(event.data.bs);
        return;
    }
	if ( event.data.op_choice == 2) { // hill-climb on simple sub cipher 
		ciphertext = event.data.ct;
		max_simpsub_trials = event.data.ms;
		crib_flag = event.data.cs;
		crib = event.data.cb;
		solve_simple_sub_cipher();
		return;
	}
		
    v_keys = event.data.vk;
    v_keys = v_keys.toLowerCase();
    h_keys = event.data.hk;
    h_keys = h_keys.toLowerCase();
    ciphertext = event.data.ct;
    if (event.data.kw == 6)
        key_width = 6;
    else
        key_width = 5;
    max_trials = event.data.mt;
    key_score_flag = event.data.ks;
    hill_climb_flag = event.data.hc;
    max_simpsub_trials = event.data.ms;
    crib_flag = event.data.cs;
    crib = event.data.cb;
    do_search();

}

  
