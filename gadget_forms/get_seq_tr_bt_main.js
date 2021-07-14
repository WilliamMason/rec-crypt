var hworker, hworker2,hworker3;

var upperC="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var lowerC="abcdefghijklmnopqrstuvwxyz";
var digits="0123456789";
var buffer = [];
var buf_len, crib_len;
var crib ;

var quag_array, inv_array, out_str;
var numb_cribs;
var period = 10;

var primer;
var chain = [];
var chain_start = [];
var best_seq_tr_bt_score;

// binary trigraph table. version constructed by construct_binary_trigraph_table.html with cutoff of 8.0
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

var bt = [];

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

function get_btscore(buffer){
    var score,i,n;
    // get tri score
    score = 0.0;
    for (i=0;i<buffer.length-2;i++){
         n = buffer[i]+26*buffer[i+1]+26*26*buffer[i+2];
         score += bt[n];
    }
    return(score);
}    

	
function do_stop(){
	var str;
	
	hworker.terminate();
	hworker2.terminate();	
	//alert("Search stopped");
	document.getElementById('status').value = 'stopped';
	document.getElementById('status1').value = 'stopped';
	
}
	
function setup_cipher() {
	var i,j,state,cnt,c, data,n1,n;
    var str,index,c1;
    
    str = document.getElementById('cipher_area').value;
    str = str.toUpperCase();
    buf_len = 0;
    for (i=0;i<str.length;i++) {
        c = str.charAt(i);
        n = upperC.indexOf(c);
        if ( n != -1)
            buffer[buf_len++] = n;
    }

}	
function do_calc(){
	var str, alpha,c,n,cnt,i,j;
    var start_pos,cnt;
    var j1,j2,j3,j4,j5;

    var even_flag = false;
    setup_cipher();
    if ( buf_len == 0){
        alert("No ciphertext entered");
        return;
    }
    alpha="abcdefghijklmnopqrstuvwxyz";
    initialize_worker();
    do_processing();
    
}


function initialize_worker(){
    var s1,n;
    
   var score, best_score,bt_score,n_btscore;
   var ave_seq_tr_bt = 523;
   var std_dev_seq_tr_bt = 92;
   var start_done_flag = false;
   var end_done_flag = false;
   var other_stats_block = '<div id = "other_stats" class = "other_stats" >&nbsp; Seq_tr_bt processing complete, getting other stats: <br><br> <textarea ID="Other text" rows=5 cols=100> </textarea> </div>';
   

   best_score = 0;
   hworker = new Worker('get_seq_tr_bt_worker_from_start.js');
   hworker.onmessage = function (event) { 
	if ( event.data.s2.length>0){
		document.getElementById('status').value = event.data.s2;
		
		if (event.data.s2 == "DONE" ){
			start_done_flag = true;
			if (start_done_flag && end_done_flag){
				document.getElementById('processing_status').innerHTML  = other_stats_block;
				do_other_processing();
			}
				
		}
		
	}
	else {
		score = parseFloat(event.data.score);
		if ( score > best_score){
			best_score = score;
			s1 = 'From start: '+event.data.s1;
			//s1 += '\nnumeric plain: '+event.data.numeric_plain;			
			bt_score = get_btscore(event.data.numeric_plain);
			n_btscore = 1000*bt_score/(event.data.numeric_plain.length-2); ///multiply by 1000 to make normalized score close to average log digraph score.			
			s1 += '\nn_btscore: '+n_btscore.toFixed(0);
			n = (n_btscore-ave_seq_tr_bt)/std_dev_seq_tr_bt;
			best_seq_tr_bt_score = n; //global
			s1 += ', normalized seq_tr_bt score is '+n.toFixed(2);
			document.getElementById('output_area').value = s1;
		}
	}
   }
   hworker2 = new Worker('get_seq_tr_bt_worker_from_end.js');
   hworker2.onmessage = function (event) {
	if ( event.data.s2.length>0){
		document.getElementById('status1').value = event.data.s2;

		if (event.data.s2 == "DONE" ){
			end_done_flag = true;
			if (start_done_flag && end_done_flag) {
				document.getElementById('processing_status').innerHTML  = other_stats_block ;
				do_other_processing();
				
			}
				
		}

		
	}
	else {
		score = parseFloat(event.data.score);
		if ( score > best_score){
			best_score = score;
			s1 = 'From end: '+event.data.s1;
			//s1 += '\nnumeric plain: '+event.data.numeric_plain;	
			bt_score = get_btscore(event.data.numeric_plain);
			n_btscore = 1000*bt_score/(event.data.numeric_plain.length-2); ///multiply by 1000 to make normalized score close to average log digraph score.			
			s1 += '\nn_btscore: '+n_btscore.toFixed(0);
			n = (n_btscore-ave_seq_tr_bt)/std_dev_seq_tr_bt;
			best_seq_tr_bt_score = n; //global
			s1 += ', normalized seq_tr_bt score is '+n.toFixed(2);
			
			document.getElementById('output_area').value = s1;
		}
	}
		
   }
   initialize_other_worker();
	
}

function do_processing(){
    var s,s2,xfer;
    
    xfer = {};
    xfer["buffer"] = buffer;
    hworker.postMessage(xfer);
	hworker2.postMessage(xfer);
    
}

function initialize_other_worker(){
    var s1,s2;
	var i,j,k,n,c,s;
var stat_names_verbose = ["0 Index of Coincidence times 1000 (IC): ","1 max IC for periods 1 to max,times 1000 (MIC): ","2 Digraphic Index of Coincidence, times 10000 (DIC): ","3 DIC for even numbered pairs, times 10000 (EDI): ","4 Long Repeat (percentage of 3 symbol repeats) (LR): ","5 average English log digraph score (LDI): ","6 average English single letter - digraph discrepancy score (SDD): ","7 length divisible by 2 (DIV_2): ","8 length divisible by 3 (DIV_3): ","9 length divisible by 5 (DIV_5): ","10 length divisible by 25 (DIV_25): ","11 length divisible by integer between 4 and 15 (DIV_4_15): ","12 length divisible by integer between 4 and 30 (DIV_4_30): ","13 length is perfect square (PSQ): ","14 Reverse log digraph score (RDI): ","15 max Columnar SDD score for periods 4 to max (CDD): ","16 the max STD score for Swagman, periods 4 to 8 (SSTD): ","17 Binary STD trigraph score for route tramp (ROUTE_BSTD): ","18 Binary STD trigraph score for myszkowski tramp (MYSZ_BSTD): ","19 does myszkowski key have no repeated letters (NO_KEY_REPEATS): ","20 distance correlation with standard english frequencies. (STD_DC): ","21 does myszkowski key have a redefence pattern (REDEF_PAT): ","22 Sequence tramp BinaryTrigraph score (SEQ_TR_BT): " ];

    
   hworker3 = new Worker('other_stats_tramp_worker.js');
   hworker3.onmessage = function (event) {
		s1 = event.data.s1;
		//s2 = event.data.s2;
		//document.getElementById('output_area').value = s1;
		
		
		// get neural net input array
		var input_array = s1.slice(0);
		n = Math.floor(100*best_seq_tr_bt_score );
		n = n/100;
		input_array.push( n );
		// next line for testing
		//c
	s = '\n\n';
	for (i=0;i<input_array.length;i++){
		s += stat_names_verbose[i]+" "+input_array[i]+"\n";
	}
	document.getElementById('Other text').value = s1+s;
	// get array of selected values
    var result = neural_net_get_id(input_array);
    s = "Top cipher type is:\n"
    //s += result[0]
    //s += ' ('+cipher_name_normalized_order[ result[0] ]+')\n';
    s += cipher_name_normalized_order[ result[0]	]+'\n\n';
	
    s += 'Top  cipher types were:\n';
    for (i=0;i<5;i++){
        s += result[1][i][0]+' '+result[1][i][1].toFixed(2)+'\n';
    }
	document.getElementById('output_area').value  = s;
   }
}


function do_other_processing(){
    var s,s2,xfer;
    
    s = document.getElementById('cipher_area').value;
    s2 = document.getElementById('max_period').value;
    xfer = {};
    xfer["str1"] = s;
    xfer["str2"] = s2;
    hworker3.postMessage(xfer);
    
}
