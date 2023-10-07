var buffer;
var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	
var buf_len;
var numb_decrypts;

var route_calcs = function(){
// T has compressed binary Single letter - Trigraph Discrepancy values
// had to replace \ by \\

/*
var T="sP5D4475HAAPRphXWR=><I@A42p`E1"
T=T+"N71rHAR2ApH2`M8BAiEW75A@uiAYU1"
T=T+"r`NpS1IDR51@8D2@p5pI4PpTOO>D4p"
T=T+"18;`QR6@p@Xonj`1p44s@4Xq6cQ822"
T=T+"BrPq41r4262s4pRp4p2p@4111A44@p"
T=T+"T8>4r1t1@@@458A1665pP`4v4tb7lX"
T=T+":r4XS^V6s1p44p1:pPZnJ^q4r8q1rX"
T=T+"bXNt1p8p1Pu@41118PX3xA4544Ap@@"
T=T+"s8PU1v1p@rH1?22r1BRQy1p24hN_^?"
T=T+"q1r2t@;@@2s@t911s4A@@P@@Qx@q11"
T=T+"p4u2p:Cv@u2PQP2q@tjeW3E@82B6Y8"
T=T+"@2@rB@p@BP8p<ApCAqR`NP1d5TT1hG"
T=T+"S8HNiYApD4t@<@CIslG`@T4AIAQp2Q"
T=T+"p421@6YI@H@435AqP68qA444S2p44w"
T=T+"41:pPSH8RAT44q8q1rXPRC1r@1P8pA"
T=T+"Ps@r115Hc[c3q@t@q44@p@s9r1v1q4"
T=T+"4p\\p6::sha[[1w@T24882Rr1p1424s"
T=T+"P^hH:s@r@p8u4A@@rPx@4p11p4u@82"
T=T+"I}2PQPr@xTA8N64Yq2Bp8q@rQp14{4"
T=T+"p4r2s1q44qPp8s1t14p@65HAig_g1p"
T=T+"@uhcWc31q`4H8Xr4p6VT`p@q@42TTA"
T=T+":BTQD8RhT61UE8p8KTb<wH7XK@oU\\5"
T=T+"WCD6D4511p988qdD2sg1\\F4A9FD1QJ"
T=T+"9p1@p\\CH26NliaAp2P<p2:Hp1paPp1"
T=T+"p1p@@tAT2p887Rq81r2p@{@p22@p8q"
T=T+"144p4A@@1qXs4t4A1114p61p8Dr1u1"
T=T+"v;`S2r@PT@`4s4A@@qXq22p82p@rPw"
T=T+"22t4@q4pB@t14p4pPdZ1q1t41@@@p1"
T=T+"p1sPp@t8v@qH88s`O]neNAAAHE2Q1p"
T=T+":pPX4H6hp6pQ48p4s7B1J2s1P88AT4"
T=T+"4v1pT:8;PEeF6s1p14p@p@qPPpV9]Y"
T=T+"v1tHp62sPl_RQr@tAT2pH<7R;q1p8p"
T=T+"2p@sZ8hHs@q6@p81q444p@@2pS@i4w"
T=T+"@4p111Dp54@p@2aZIv@uCPS1sPonjn"
T=T+"y8qJcYK2p@r1u\\?o^?sLTV71p2y`dW"
T=T+"><x1p@xX_f>4u4tPp8y@6q@meVCU5:"
T=T+"p4Q@2RhaWSU7:64C4`Dr[T7:>41P8p"
T=T+"oQXpU7F6D64A@pQqT7fF6sn38pTE;>"
T=T+"4GThIq@p41rFph@sl?o>=p1pPl3Z11"
T=T+"w@P2ph97Rq81r2p@s18:Ps@q2@48qA"
T=T+"4441@rW8Z@1444t4p11I4251q42Olk"
T=T+"lx41p83PSp2q@p:T@@s4r@4XqjRS91"
T=T+"p@rPq4t2u4pTp4p2@@s1444q28x41p"
T=T+"@@FU@Aq6Pz4q1q`ph:th_VdMN@H@Aq"
T=T+"1Pp:pPkfb>hAV3U7H44qPpep84yPqP"
T=T+"wVZ?KU7nN6s1p44uP@8^;=S|8p6ulS"
T=T+"YA5p@@tAPRphl?f>q1r2p@sglhOs@p"
T=T+"J2@p9p1p4T44A@qPHZp1p14s@4111A"
T=T+"44pD@8pb[JIv@t8;PQPr@8olZ^r44A"
T=T+"p@p4Xq6cQ86@BrPq41qh6_>5s4pRp4"
T=T+"p2@r1pA44D8488p4@p1s41@@@FeIA1"
T=T+"4p4Lpb8v4qAp@`pXXt@p2p@NmkmD4P"
T=T+"Q118qPqPh@VA5A82p1qHslOoN51p1p"
T=T+"VP<pPADN4p1q^o[KQ3N6DomkM6q2T7"
T=T+"9FD11@9~p4q2u`3RAq@@t1p2pXK:>5"
T=T+"q1r2uO8h:s@s411@t@@pPCjH@x4q1p"
T=T+"4~v8p2PQu2:Hx@4X8pVkSI2pBrPpP4"
T=T+"1p2x4PVA4p2r11pA44@X8Z>4r1t1@@"
T=T+"@FUhAA42Uq@w4q@@p`7lXZ@q42p681"
T=T+"|omiN|Pp1Q~q@s2pP~xRz8PSP1w8PY"
T=T+"AX?_>GpQqAP64889Rq11rRp@pP81w@"
T=T+"p:4PNmj5hc_C5p@pP22s8t@EpY11q4"
T=T+"4@8BRs1s1@r11p2Pq4p8qbH8}B8s@r"
T=T+"PuX5:^1~q@rP~@s1s8I^85}Hq14p40"
*/

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

var bstd = [];
var max_score;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";


var orig_buffer ;
var inv_buffer;
var plain_text = new Array();
var rwidth;
var matrix = [];
var max_rwidth = 15;
var rwidth,rheight, route_in,route_out,flip, rev_flag, input_rev_flag;


function construct_table(){
    var i,n,index,c,ze,x,j,mask;
    // read T and put it into the working binary trigraph table: bstd
    n = 26*26*26
    i = index = 0;

    ze = '0'.charCodeAt(0);
    while (i < n){
        //c = T.charCodeAt(index);
		c = T1.charCodeAt(index);
        index +=1
        //x = ord(c)-ord('0')
        x = c-ze;
        if (x > 63){
            x -= 63;
            //for j in range(6*x):
            for (j=0;j<6*x;j++){
                bstd[i] = 0;
                i += 1;
            }
        }
        else{
            mask = 1;
            while (mask < 64){
                if (mask & x ){
                    bstd[i] = 1;
                }
                else bstd[i] = 0;
                i += 1;
                mask += mask;
                if (i >= n)  break;
            }
        }
    }
}

construct_table();
orig_buffer = [];
rev_buffer = [];
for (var i=0;i<buffer.length;i++){
    orig_buffer[i] = buffer[i];
    rev_buffer[i] = buffer[i];
}
rev_buffer.reverse();

//alert("table constructed");
var NUMB_ROUTES = 10;

function in_route( route){
        var j,k,dr;
        var index,sx,sy,wd,ht;
        var cnt;

        index = 0;
        switch(route) {
        case 0:
        for (j=0;j<rwidth;j++) for (k=0;k<rheight;k++)
                matrix[k][j] = buffer[index++];
        break;
        case 1:
        for  (k=0;k<rheight;k++)for (j=0;j<rwidth;j++)
                matrix[k][j] = buffer[index++];
        break;
        case 2: /* diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
        break;
        case 9: /* reverse diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
        break;        
        case 3: /* alternating diagonals*/
        dr = 0;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                dr ^= 1;
        }
        break;
        case 4: /* reverse alternating diagonals*/
        dr = 1;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                matrix[k-j][j] = buffer[index++];
                }
                dr ^= 1;
        }
        break;
        case 5: /* clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( sx<wd) {
                        for (j=sx;j<wd;j++) {
                                matrix[sy][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sy+1;j<ht;j++) {
                                matrix[j][wd-1] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for(j=wd-2;j>sx-1;j--) {
                                matrix[ht-1][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                                                
                        for (j=ht-2;j>sy;j--) {
                                matrix[j][sx] = buffer[index++];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        case 6: /* alternating verticals*/
                dr = 0;
                for (j=0;j<rwidth;j++){
                        if(dr==0){
                                 for (k=0;k<rheight;k++)
                                        matrix[k][j] = buffer[index++];
                        }
                        else {
                                 for (k=0;k<rheight;k++)
                                        matrix[rheight-1-k][j] = buffer[index++];
                        }
                        dr ^= 1;
                }
                break;
        case 7: /* alternating horizontals*/
                dr = 0;
                for (k=0;k<rheight;k++){
                        if(dr==0){
                                 for (j=0;j<rwidth;j++)
                                        matrix[k][j] = buffer[index++];
                        }
                        else {
                                 for (j=0;j<rwidth;j++)
                                        matrix[k][rwidth-1-j] = buffer[index++];
                        }
                        dr ^= 1;
                }
                break;
        case 8: /* counter clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sy;j<ht;j++) {
                                matrix[j][sx] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sx+1;j<wd;j++) {
                                matrix[ht-1][j] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy-1;j--) {
                                matrix[j][wd-1] = buffer[index++];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for(j=wd-2;j>sx;j--) {
                                matrix[sy][j] = buffer[index++];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        } /* end switch */
} /* end in_route*/

function out_route(route){
        var j,k,index,dr;
        var wd,ht,sx,sy;
        var cnt;

        index = 0;
        switch(route) {
        case 0:
        for (j=0;j<rwidth;j++) for (k=0;k<rheight;k++)
                plain_text[index++] = matrix[k][j];
        break;
        case 1:
        for  (k=0;k<rheight;k++) for (j=0;j<rwidth;j++)
                plain_text[index++] = matrix[k][j];
        break;
        case 2: /* diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++]=matrix[k-j][j];
        break;
        case 9: /* reverse diagonals */
        for (k=0;k<rheight+rwidth;k++)
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++]=matrix[k-j][j];
        break;        
        case 3: /* alternating diagonals*/
        dr = 0;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                dr ^= 1;
        }
        break;
        case 4: /*reverse alternating diagonals*/
        dr = 1;
        for (k=0;k<rheight+rwidth;k++) {
                if ( dr==0){
                for (j=0;j<rwidth;j++)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                else {
                for (j=rwidth-1;j>=0;j--)
                        if ( k-j>=0 && k-j<rheight)
                                plain_text[index++] =matrix[k-j][j];
                }
                dr ^= 1;
        }
        break;
        case 5: /* clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sx;j<wd;j++) {
                                plain_text[index++] =matrix[sy][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sy+1;j<ht;j++) {
                                plain_text[index++] = matrix[j][wd-1];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for(j=wd-2;j>sx-1;j--) {
                                plain_text[index++] = matrix[ht-1][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy;j--) {
                                plain_text[index++] =matrix[j][sx];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        case 6: /* alternating verticals*/
                dr = 0;
                for (j=0;j<rwidth;j++){
                        if(dr==0){
                                 for (k=0;k<rheight;k++)
                                        plain_text[index++] = matrix[k][j];
                        }
                        else {
                                 for (k=0;k<rheight;k++)
                                        plain_text[index++] = matrix[rheight-1-k][j];
                        }
                        dr ^= 1;
                }
                break;
        case 7: /* alternating horizontals*/
                dr = 0;
                for (k=0;k<rheight;k++){
                        if(dr==0){
                                 for (j=0;j<rwidth;j++)
                                        plain_text[index++] = matrix[k][j];
                        }
                        else {
                                 for (j=0;j<rwidth;j++)
                                        plain_text[index++] = matrix[k][rwidth-1-j];
                        }
                        dr ^= 1;
                }
                break;
        case 8: /* counter clockwise spiral */
                sx = sy = 0;
                ht = rheight;
                wd = rwidth;
                cnt = ht*wd;
                while( cnt>0) {
                        for (j=sy;j<ht;j++) {
                                plain_text[index++] =matrix[j][sx];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for (j=sx+1;j<wd;j++) {
                                plain_text[index++] = matrix[ht-1][j];
                                cnt--;
                        }
                        if ( cnt == 0) break;                                
                        for (j=ht-2;j>sy-1;j--){
                                plain_text[index++] = matrix[j][wd-1];
                                cnt--;
                        }
                        if ( cnt == 0) break;
                        for(j=wd-2;j>sx;j--){
                                plain_text[index++] = matrix[sy][j];
                                cnt--;
                        }
                        wd--;
                        ht--;
                        sx++;
                        sy++;
                } /* end while */
                break;
        } /* end switch */

} /* end out_route*/

function matrix_manip(x) {
        var j,k;
        var temp_matrix = [];

        if ( x==0) return; // no swaps
        for (j=0;j<rheight;j++) {
            temp_matrix[j] = [];
            for (k=0;k<rwidth;k++) 
                temp_matrix[j][k] = matrix[j][k]
        }
        switch(x) {
        // case 0: /* use original*/
                // for (j=0;j<rheight;j++)
                        // for (k=0;k<rwidth;k++)
                                // matrix[j][k] = temp_matrix[j][k];
                // break;
        case 1: /* width rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[j][rwidth-1-k];
                break;
        case 2: /* height rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[rheight-1-j][k];
                break;

        case 3: /* height & width rotate*/
                for (j=0;j<rheight;j++)
                        for (k=0;k<rwidth;k++)
                                matrix[j][k] = temp_matrix[rheight-1-j][rwidth-1-k];
                break;
        } /* end switch */
} /* end matrix_manip*/

        function get_trial_decrypt(){
        
            if (input_rev_flag == 1)
                buffer = rev_buffer;
            else
                buffer = orig_buffer;    
            in_route(route_in);
            matrix_manip(flip);
            out_route(route_out);
            if (rev_flag ==1 )
                plain_text.reverse();
        }
        

        function get_score(){
            var score,i,n;
        
            get_trial_decrypt();
            // get tri score
            score = 0.0;
            for (i=0;i<buffer.length-2;i++){
                n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2];
                score += bstd[n];
            }
            return(score);
        }    

    var do_route_calc = function(code){ // return this function which can use the pseudo-global variables
        var str, alpha,out_str,c,n,i,ct,sum,c1,c2,j,k,flag;
        //var code_len,code;
        var code_len;
        var best_score, best_line,result,best_rwidth;
        var n1,n2,v1,v2, local_best_score, local_count, reps;
       //var numb_decrypts;
        
/*		
        numb_decrypts = parseInt(document.getElementById('numb_decrypts').value );
        max_rwidth = parseInt(document.getElementById('max_rwidth').value );
*/		
        max_score = 0;
        out_str = "no width";
       for (rwidth = 4; rwidth <= max_rwidth; rwidth++){
        if( (buf_len%rwidth) != 0) continue; // not rectangular array
        rheight = buf_len/rwidth;
        for (i=0;i<rheight;i++)
            matrix[i] = [];
        route_in = Math.floor( Math.random()*NUMB_ROUTES);
        route_out = Math.floor( Math.random()*NUMB_ROUTES);
        flip = Math.floor( Math.random()*4);
        rev_flag = Math.floor( Math.random()*2);
        input_rev_flag = Math.floor( Math.random()*2);
        
        local_best_score = 0;    
        loal_count = 0;
        var max_local_count = 500;
        for (i=0;i<numb_decrypts;i++){
            op_choice = Math.floor(Math.random()*100);
            if ( op_choice <25 ){
                n1 = route_in;
                route_in = Math.floor( Math.random()*NUMB_ROUTES);
            }
            else if (op_choice < 50){
                n1 = route_out;
                route_out= Math.floor( Math.random()*NUMB_ROUTES);
            }
            else if (op_choice < 75){
                n1 = flip;
                flip= Math.floor( Math.random()*4);
            }
            else if (op_choice <87)
                input_rev_flag ^= 1;        
            else
                rev_flag ^= 1;
            score = get_score();

            if (score>max_score){
                max_score = score;
                out_str = '';
                x = score.toFixed(2);
                //out_str += x+'~';
                for (j=0;j<buf_len;j++)
                    out_str += l_alpha.charAt(plain_text[j]);
                out_str += "\nscore: "+score.toFixed(2);
                //k = 100*score/(buffer.length-2);
				k = 1000*score/(buffer.length-2);
                out_str += ", normlized score: "+k.toFixed(2);
                //n = (k-15)/(79-15); // std english bstd score = 79, random english bstd score = 15
                n = (k-69)/(740-69); // std english bstd score = 740, random english bstd score = 69								
                out_str += ", doppleschach score: "+n.toFixed(2);
                out_str += '\nWidth: '+rwidth+', Height: '+rheight;
                if (input_rev_flag == 1)
                    out_str += '\n(Input reversed) ';
                else
                    out_str += '\n';
                out_str += 'Route in: '+route_in+' Flip type: '+flip+' Route out: '+route_out;
                if (rev_flag == 1) out_str += " (Output reversed).";
                    
                    //document.getElementById('output_area').value = out_str;	
                    //postMessage(out_str);
                }
                if ( score > local_best_score){
                    local_best_score = score;
                    local_count = 0;
                }
                else {
                if ( op_choice <25 ){
                    route_in = n1;
                }
                else if (op_choice < 50){
                    route_out = n1;
                }
                else if (op_choice < 75){
                    flip = n1;
                }
                else if (op_choice <87)
                    input_rev_flag ^= 1;
                else
                    rev_flag ^= 1;
            
                if (++local_count > max_local_count)
                    local_best_score = 0;
            }
        } // next i   
       } // next rwidth
        
       
        //test_values[test_index] = best_score;
        //document.getElementById('output_area').value = out_str;
        //return(max_score);
        // return max doppleschach score if using this routine for ID test
		postMessage(out_str);

    } // end do_route_calc function
    return (do_route_calc); // return this function which can access pseudo_global variables
} // end route_calcs closure function

function do_solve(){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
    
/*    
    if (do_check() == false){ // converts code to numbers in buffer
        return;
    }
*/    
    do_route_calc = route_calcs(); // returns a function and initializes scoring table
    do_route_calc(buffer);
    
}

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
debugger;
  var str = event.data; // string to decode
  
  buffer = str.buffer;
  max_rwidth = str.max_period;
  numb_decrypts = str.numb_decrypts;
  buf_len = buffer.length;
  do_solve(); 
};  
