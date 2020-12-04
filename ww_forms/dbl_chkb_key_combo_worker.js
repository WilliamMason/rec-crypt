
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var key_width;
var symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij';

var v_keys,h_keys;
var ciphertext, buf_len;
var buffer, work_buffer, final_buffer;
var vkey,hkey, numb_v_keys,numb_h_keys;
var pair_sub;
var freq,dfreq;

var top_keys;


function do_combo_search(){
    var i,j,n,c,indx;
    var vk,hk;
    var score, best_score;
    var str;
    var best_v,best_k, best_sub;
    var numb_top_keys,least_top_score,least_top_index;

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
    numb_v_keys = v_keys.length;
    for (i=0;i<v_keys.length;i++){
        indx = 0;
        vkey[i] = [];
        for (j=0;j<v_keys[i].length;j++) {
            c = v_keys[i].charAt(j);
            n = l_alpha.indexOf(c);
            if ( n != -1) 
               vkey[i][indx++] = n;
        }
    }
    hkey = [];
    numb_h_keys = h_keys.length;
    for (i=0;i<h_keys.length;i++){
        indx = 0;
        hkey[i] = [];
        for (j=0;j<h_keys[i].length;j++) {
            c = h_keys[i].charAt(j);
            n = l_alpha.indexOf(c);
            if ( n != -1) 
               hkey[i][indx++] = n;
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
    top_keys  = [];
    numb_top_keys = 10;
    for (i=0;i< numb_top_keys;i++){
        top_keys[i] = {};
        top_keys[i].score = -1;
    }
    least_top_score = -1;
    least_top_index = 0;
    best_score = 0;
    for (vk = 0;vk<numb_v_keys;vk++) for (hk = 0;hk<numb_h_keys;hk++) {
        xlate(vk,hk); // convert to simple substitution
        score = get_score();
        if (score > best_score){
            best_score = score;
            best_v = vk;
            best_h = hk;
            best_sub = '';
            for (i=0;i<buf_len/2;i++)
                best_sub += symbols.charAt(final_buffer[i] );
        }
        if ( score > least_top_score ){
            top_keys[least_top_index].score = score;
            top_keys[least_top_index].v_key = vk;
            top_keys[least_top_index].h_key = hk;
            top_keys[least_top_index].simple_sub = '';
            for (i=0;i<buf_len/2;i++)
                top_keys[least_top_index].simple_sub += symbols.charAt(final_buffer[i] );
            least_top_score = score;
            for (i=0;i<numb_top_keys;i++)
                if (top_keys[i].score < least_top_score){
                    least_top_score = top_keys[i].score
                    least_top_index = i;
            }
        }
    }
    n = Math.floor(best_score);
    str = 'best score is: '+n+'\n';
    str += 'best vertical key: '+v_keys[best_v]+' \n';
    str += 'best horizontal key: '+h_keys[best_h]+' \n';
    str += 'best simple substitution cipher: '+best_sub+' \n';
    str += '\nTop keys:\n';
    for (i=0;i<numb_top_keys;i++){
      if ( top_keys[i].score != -1){
        str += "score: "+Math.floor(top_keys[i].score)+'\n';
        str += 'best vertical key: '+v_keys[top_keys[i].v_key]+' \n';
        str += 'best horizontal key: '+h_keys[top_keys[i].h_key]+' \n';
        str += 'best simple substitution cipher: '+top_keys[i].simple_sub+' \n\n';
      }
    }
        
    postMessage(str);    
    
    
}

function xlate( vk, hk){
	var i,j,x,k;
	var c;
	var vindex,hindex,count;

	for (i=0;i<buf_len;i++)
		work_buffer[i] = buffer[i];
    // using current pairing, convert to single checkerboard
	for (i=0;i<buf_len;i = i+2) {
		c = buffer[i];
		for (j=key_width;j<key_width+key_width;j++)
			if ( vkey[vk][j]==c) {
				work_buffer[i] = vkey[vk][j-key_width];
				break;
		}
		c = buffer[i+1];
		for (j=key_width;j<key_width+key_width;j++)
			if ( hkey[hk][j]==c) {
				work_buffer[i+1] = hkey[hk][j-key_width];
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
    
	score = 0;
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

	return(score);
} /* end get_score*/

onmessage = function(event) { //receiving a message
	var str,s;

    v_keys = event.data.vk;
    h_keys = event.data.hk;
    ciphertext = event.data.ct;
    if (event.data.kw == 6)
        key_width = 6;
    else
        key_width = 5;
    do_combo_search();

}

  
