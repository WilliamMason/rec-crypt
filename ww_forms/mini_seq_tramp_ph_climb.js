// PH hill-climber binary trigraph
//importScripts('tettable.js'); 

//postMessage("tet_values loaded");
var tet_table = new Array();
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var digits = '0123456789';
var buffer = new Array();
var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;
var fudge_factor = 0.2; // for backup in case I forget to send it.
var primer;
var chain = [];

var crib_flag=0;
var crib;
var crib_buffer = [];
var crib_len;

// primerless stuff
primerless_flag = '1';
primer_limit = 1500;
var PRIMER_LEN = 5;
var order;
var p_len;
var MAX_MUT = 500; // wimpy hill-climbing on primer
 

var chain_start = [];
//var chain = []; // already defined
// multipliers for equivalent keys
var equ_mult = [3,7,9];

var bt = [];

//T1 has compressed binary trigraph values
// had to replace \ by \\

// version constructed by construct_binary_trigraph_table.html with cutoff of 8.0
T1 = "" 
T1 += "t1r41IpAP2ph9^^44p1pAp2p`18>53Xhx@59b1I4V34A@2rXpA"
T1 += "p11s`M1Q1I4R74AHFp@p4tT1@>uPxXy4Xr2p8~p2|@4t4s8y1r"
T1 += "4u1qP~w83:2t1t8pPRXjr4r8uXRS:x1v@4111pPp2xAp444Aq@"
T1 += "s8q1x@{@2Q1z2p`M?^|@2p@x@4111s4A@@rYx@q1~~yHp735AH"
T1 += "2@6YIp2RPCpC@4@2P8pL1RC@p2:t144plAb8@4Qi1A4Vt@4pC8"
T1 += "sdOjN@6aiAe4V7r1@4Q9p@p43s@48r4~p18pPR88r4r8u8Pp2x"
T1 += "Ax11pHPR31w@s1~~tR1}822r1yTH8x@w4A@@rPx@4p1{1~~p4A"
T1 += "8Np4Pr2s@rQp1~{44s8y1q@41hpiWWG1wHp23}46>@s@42p41J"
T1 += "BpQp8p`44q18q?P`4w@sCT41TA@6@4191q8ygp\\64AHN@5QK1q"
T1 += "@p4A@2p6Pav2~~~~~~~~pPt4@@~y2~s14s@y4p@~~u`I<N@r1q"
T1 += "2r8pPVph6u8u325BxA444v1p42X3qDuAp4qAq@pP`pTp<~wD62"
T1 += "1x@p2p`;6^r1r2uP8Xx@u4r@2p3Phx@4p1p@4Ps4~z`oijD|LW"
T1 += "[;u1uT?o^5~q1r`In>y1@@p4u1p1D>v4~r@4rMTV3518qaXJpH"
T1 += "pV3p18q5pb4pPR3xAP4141@4@6UaqQP2p1TNtg3<6TA:>@GaiA"
T1 += "x4pPu1p:t42P{2pP922r1yPz@s@44u4pZp1w4rA4p2r4r@y4~~"
T1 += "~~~~~~s`?^L14w18pPk`b6@q141HsPpc~ynR?CQ1p64sAp44t4"
T1 += "P@p4p43~vNS[Cx@pRplM>n5q1r2s8pVhh2w@48r4q4A@qP@Zx@"
T1 += "4111A44pD@86@2@9}1PPugih4s4Ap@p4PqFcS;4p@rPr1p2`;^"
T1 += ">1w4p2@r1pA444q8:p4v4A@@@6QiAA4658p`8v4q1qPp8z4r@4"
T1 += "r1HqPx8~s4v@p1q^6RC11@q4u2p184@p1@~|2~Pp86~8X~t@q@"
T1 += "p8y4~~x8z4Pr2Rr@rP~~4pP8Z:y1@q4PPpA4~~~p4P~~~~~~r8"
T1 += "P1@P|82~|4XPt4~p@4pQu@p2~~~~~~~~~t"

function construct_bt_table(){
    var i,n,index,c,ze,x,j,mask;
    // read T and put it into the working binary trigraph table: bt
    n = 26*26*26
    i = index = 0;

    ze = '0'.charCodeAt(0);
    while (i < n){
        c = T1.charCodeAt(index);
        index +=1
        //x = ord(c)-ord('0')
        x = c-ze;
        if (x > 63){
            x -= 63;
            //for j in range(6*x):
            for (j=0;j<6*x;j++){
                bt[i] = 0;
                i += 1;
            }
        }
        else{
            mask = 1;
            while (mask < 64){
                if (mask & x ){
                    bt[i] = 1;
                }
                else bt[i] = 0;
                i += 1;
                mask += mask;
                if (i >= n)  break;
            }
        }
    }
}

construct_bt_table();

max_trials = 1000000;

function get_chain(buf_len){
    var i,j,k,index,n,c;

    index = 0;
    for (i=0;i<primer.length;i++){
        c = primer.charAt(i);
        n = digits.indexOf(c);
        if ( n != -1)
            chain[index++] = n
    }
    for (j = 0;j<buf_len-index;j++) 
       chain[j+index] = (chain[j]+chain[j+1]) % 10;
}       
	
function get_trial_decrypt(buf_len){
        var i,j,k, index,x,y,c;
        var c1,c2,c3,c4;

        
        index = 0;
        for (i=0;i<10;i++){
            k = key[i];
            for (j=0;j<buf_len;j++){
                if ( chain[j] == k) 
                    plain_text[j] = buffer[index++];
            }
        }
}
	

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt(buf_len);
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2];
		score += bt[n];
	}
	return(score);
}	

function do_hill_climbing(buffer,buf_len){
	var  out_str,c,n,v,score,i,j,trial,k;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;
	//var max_trials; // now global
	var s;
    var primer_numb;
    var old_best_score, current_best_score,cnt;
    var primer_array;
	var norm_score;
        // start with random primer
        primer_array = [];
        for (i=0;i<5;i++)
            primer_array[i] = Math.floor(Math.random()*10);
        primer = '';
        for (i=0;i<5;i++)
            primer += digits.charAt(primer_array[i]);
        cnt = 0;
        old_best_score = 0;

   max_score = 0;
 for (primer_numb = 0;primer_numb<primer_limit;primer_numb++){    
	for (i=0;i<10;i++) {
		key[i] = i;
	}
	// random start;
	for (i=9;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
    if (primerless_flag == '1'){
        n1 = Math.floor(Math.random()*5);
        v1 = primer_array[n1];
        primer_array[n1] = Math.floor(Math.random()*10);
        primer = '';
        for (i=0;i<5;i++)
            primer += digits.charAt(primer_array[i]);                
    }
    get_chain(buf_len);
	cycle_limit = 20;
	//fudge_factor = 0.23; // now sent via post message
	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	current_hc_score = score = get_score(buf_len);	
    current_best_score = score;
    if ( score>max_score){
        max_score = score;
        out_str = '0';
        x = score.toFixed(2);
        out_str += x+'~';
        for (i=0;i<buf_len;i++)
            out_str += alpha.charAt(plain_text[i]).toLowerCase();
        out_str += "\n score of plaintext is "+score;
        postMessage(out_str);
    }
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*10);
		n2 = Math.floor(Math.random()*10);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
        if ( score > current_best_score)
            current_best_score = score;
		if ( score>max_score){
			max_score = score;
			//out_str = '0'; // 0 at beginning is signal to post message in output box
			out_str = '';
			//x = score.toFixed(2);
			//out_str += x+'~';
			for (i=0;i<buf_len;i++)
				out_str += alpha.charAt(plain_text[i]).toLowerCase();
			//out_str += "\nscore of plaintext: "+score.toFixed(2)+" on trial: "+trial;
			norm_score = 1000*score/(buf_len-2);
			out_str += "\nscore of plaintext: "+score.toFixed(2)+" (normalized: "+norm_score.toFixed(2)+") on trial: "+trial;
			out_str += ", fudge factor: "+fudge_factor;
			out_str += ", % accept: "+ (100.0*numb_accepted/(trial+1)).toFixed(2);
            if (primerless_flag == '1')
                out_str += '\nprimer: '+primer+', primer number: '+primer_numb+', out of: '+primer_limit;
            if ( crib_flag >= 1)
                out_str += ", (using crib)";
			out_str += '\nKey: ';
			for (i=0;i<10;i++) 
				out_str += digits.charAt(key[i]);
             // get the other 3  equivalent keys
             out_str += '\nEquivalent Keys:\n';             
             for ( k = 0;k<equ_mult.length;k++){
                for (i=0;i<10;i++) {
                    j = (equ_mult[k]*key[i])%10;;                    
                    out_str += digits.charAt(j);
                }
                out_str += '\n';
                 
             }

             
			//document.getElementById('output_area').value = out_str;	
			postMessage(out_str);
		}
       	if (score > current_hc_score-fudge_factor*buf_len/(noise_level)) {				
           	if (score != current_hc_score)
           		numb_accepted++;				
			current_hc_score = score;
            // score_sum += score;
            // accepted_count++;				
			}
		
		else {
			key[n1]=v1;
			key[n2]=v2;
		}
		noise_level += noise_step;	
		if ( ++cycle_numb >= cycle_limit) {
			noise_level = begin_level;
			cycle_numb = 0;
		}
		if ( (trial%1000000)==0 && primerless_flag =='0'){
			v = 100.0*numb_accepted/(trial+1);
			v = v.toFixed(2);
			s = out_str+"\n\n(trial: "+trial+" % accepted: "+v+")";
			postMessage(s);
		}
			
		
	} // next trial
	/* ignore old best score, better to make random changes.
    if (primerless_flag == '1'){    
        if (current_best_score > old_best_score)
            old_best_score = current_best_score;
        else{
            cnt++;
            if ( cnt > MAX_MUT){ // gone too long with no improvement
                cnt = 0;
                old_best_score = 0; // keep current primer as "best"
            }
            else{
                primer_array[n1] = v1; // restore old primer
            primer = '';
            for (i=0;i<5;i++)
                primer += digits.charAt(primer_array[i]);
                
            }
        }
    }
	*/
    if ( (primer_numb%10)==0){
        s = out_str+"\n\n(primer: "+primer_numb+")";
        postMessage(s);
    }
 
  }// number primer_numb    
}	
onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
debugger;
  var str = event.data; // string to decode
/*  
  // test
  out_str = "the string you passed was\n"+str;
  postMessage(out_str);
  return;
  */
  max_trials = str.max_trials;
  fudge_factor = str.fudge_factor;
  primer_limit = str.primer_limit;
  buffer = str.buffer;
  buf_len = buffer.length;
  do_hill_climbing(buffer,buf_len);
  
};  
