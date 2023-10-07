var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";	

var buffer = new Array();
var plain_text = new Array();
var key=[];
var inverse_key = [];
var buf_len;
var period;
var max_period = 15;
var fudge_factor, numb_decrypts;

var mysz_calcs = function(){
// T has compressed binary Single letter - Trigraph Discrepancy values
// had to replace \ by \\

/*
// cutoff 7.5
T1 = ""
T1 += "p4r1D4@6QipATRph?_^54pApA42pdEH>U3Xhx@OYk1I4V75A@N"
T1 += "p1pXpApS31r`o1Y1ITR7DAJFp@P4pA4qTAJ>t3PP2tUXhx@4Xr"
T1 += "RP:q@rPw26x4p2p@4q1A44s:x41q@41Pp1p21q`4|@p8u83^>t"
T1 += "144q18pP^jjr4r8uXR[:x1v@41114PS3xA4444A88@pP@p8pQ1"
T1 += "x@t22t@RW1xAp2phO_^1q1r2t@2p@2w@4191s4A@@Pp@Yx@411"
T1 += "q4w8~pPw1qHTW35AH6@6YiAZSRC4C@4@6Q9pl1RCA:2Zt54Tpl"
T1 += "Eb<@6ii1I4V7r8@6@CHslOjND6iiAe4^7q81@4Y9pHp631r@48"
T1 += "8q4r186y18pPSY8pA444q8u8Pp2xAx11phSS31w@p4qAp2qP~u"
T1 += "2uHPR3x@p2p8822r1yThHx@w4A@@rPx@4p1w4@q1~~p4A8Np4X"
T1 += "q22P8q@rQp14q2~2uA44s8@4w1@p@6Yh1igWG1wH@V31|>V^@4"
T1 += "@qA46pTAJFPQhhp`461pA8qoPk4w@sOU^3UCH>@4191q824p@4"
T1 += "tg5\\6TAHND5Yk1p1@p4AH2p6Pi@s4p22~~~~~~~|4@Pt4@@~y2"
T1 += "y4w14s@x14p@p@~~s`O\\nepAp1@p2q18pP_hh6@p4r8u72UKxA"
T1 += "444u11pT3X;p1DuAp4p4Ap@@pP`pTp<1~vlVR1xAp2p`;>^r1r"
T1 += "2s8pPXhw1@u4p4A@2pSPi4w@4p1pA4Pp4p84p1p@~v`ookGx4X"
T1 += "qNg[Oq@r1u\\?on5~q144p`Mn>4w41@@@41t1P9L>v4~r@4rmTV"
T1 += "35AJ>pahjphQV3518q5pb4pQR3xmT\\1T1F>@6Ui@TQP241nN2s"
T1 += "o7\\6TA:>DgiiAt1r4p`tT1::tD2P1x@12p`92>r1r2uQz@sA44"
T1 += "44@@q4pZp1p44t4111I422q84p2pay4r2q2~~~~~~~{hO^L54r"
T1 += "@441p18pPkmj6Ip6341HsPpcq8x1v@q1pnR?CU1F>4sAp44p@q"
T1 += "@5P@pNp<3~vnW_C1t1qATVplMnn5q1r2s8@nlh6w@48q@4Pp4A"
T1 += "@qPHZx@4111A444DIHF@6JIv@u1PP1tgik7s4Ap@@4QqNg[;5@"
T1 += "@rPq41p2l?nN1w4p2@r1pA4448=<^p4@p1s4A@@@FiiAA665Lp"
T1 += "b8v4q1q`p8Xt@12q6p`p@4r1HqP8q@t8sP}4P4q1q@41qnVSC1"
T1 += "1@q4r@q2418<@5YH~{@2z1rP8:6}B8h~s@@qBH8y4~~x8@y4Pq"
T1 += "4RS1q@rPq4q2|4wA44pP8Z:y1@p@4QXpA421~r48~x4X`~~~~~"
T1 += "~q8P1AP184qPq1s822~zP6YXr4p4~p@4pQt4@p2~~~~~~~~~t"
*/
/*
// cuttoff 6.0
T1 = ""
T1 += "D42pTANNDoYiEIT^7m?_nM>YiAITW7dOoNUClj2I42pDpH6`oi"
T1 += "kAigWGUGNNUaHhpmW_W1r`oekAig_GeKnN4bPmpITV1TOON54r"
T1 += "OPW24@HpPomh@1424s@4Yq\\RS;q@rPq41p2p426t4r4p2p@451"
T1 += "1A44pP3>>x4A@@@6Qh1A665@p`>v4t@4HXthon>6s144441:pP"
T1 += "okj^p44r8q1p`pkS_o1w1TsIp@4111LW[31p@uA444TAJN@4QA"
T1 += "18PW1t4p1p@rL1>:tnWW?1s21qAT64hO_n?q1pQp22@q8@_hk7"
T1 += "w`4991s4A@@Paais4s`4111I4R64@HF`pJiv@uCRQ2uQ8pkWW3"
T1 += "gIHFBoiiA^c[OTCJ>DFiiAmc_Ca:^nP6p1pETV1lOkNEnmkAig"
T1 += "WGQ8p:@>ikIslOnNeoikAoV^WQ6:?H6YiAiRW31Aq`6hi@14pB"
T1 += "PK:>4t4q41JpPgih3A444q8qApPplPRCxATp44@@p@4111mc_C"
T1 += "1wA444TI:N@TQI1q21v1t<p6:tjW[O1t1qAT24h8>^@q1p1p24"
T1 += "@q8`^hhx@48p1q1p4A@@p78Xx@4111A4p64p84@8piu1wPPtP6"
T1 += "PhtTKJNF4Y8pNcSKp@@q8Qp141p2p1p<t5r4A2r11pA44DpXp<"
T1 += "@4HA1s4AD@@niiAmg_G1p@uicWG1r`4HXthO^^A6ai@e4V5TCJ"
T1 += "NTolh6iTW3UEJ6@olkDw@7YipoW_7UONNDfUi5=[[;5AdLtoW^"
T1 += "GeOoNDoYk921d1TAJ>@nmiA@r\\1::@u1r@@tAp2p@8p2r1~~p4"
T1 += "A@s8y4~~w4iR6s4A@@p4PqB32vPt2q22x4@v1444q`:w141@@@"
T1 += "41Pr21p1@~whOone6AA1I4VSUA:2`omjGHp61p58qApPpoB_O2"
T1 += "s1rAT44q1p@4111n7_;TAnN6sA444TIHN@UQi1_Y]1v1t416:t"
T1 += "l_WS3q@q1qAT2ph??^5p@1r2p@q<@^Xi@sT127@481p1D444A@"
T1 += "BpShi4p44t@4111IVV75AHFpWYiu1@uCPW3s`ookgw@4Yqng_O"
T1 += "3p@p@pQ1p4p42lOon=s@4V64p2p@448pA444hoo>=w41@@@6QY"
T1 += "1A6R5l_n>4s1p4t@p8Xt@A2p@Vii@mW_GUEJNTgljSigW3UCJ>"
T1 += "DO]kD>SR;T18p@aP9poU^7UOONEnmiE^S[CTOnN6so7^G]OoNE"
T1 += "omkEs4C86@^Qi@sl?O>5p11pl__31t1qAQ6ph9?^r1r2p@q8pS"
T1 += "8j5w@49qAD444A@@pWYkp9444s@4111iVV75@HDpGPiv@q4r7Q"
T1 += "S2v8t4wH2P3~2~t4~t288~~plOonM6ii@I4V3TAJ>ToojgiWW3"
T1 += "eCJ>41p`poC_?w11PqP1@:@4111oo_KU?nN6sA4444A8J@_YiI"
T1 += "o[=3t6x2>tng_K5p@@q18pATVplOon58p1r2p@4p<`oliOs@pH"
T1 += "2@4911aDT44A@BQcik4A454s@4A11I4V7DIjN`oki@s41@uKRW"
T1 += "3sPomkg@q4dAHB@4Y9png[O5CBrPq41p3l?on5s4pVp4AB@@41"
T1 += "91I4TEhMn^E4A1As4E@@`nmkEEV^Ul;n:tAp4q1q`7hXt`?^>@"
T1 += "fii@M4V3DAH6pghhpHTV34A:N@7phq12pT18<4sgP<2TAEND4Q"
T1 += "11nW[OUALL@7Qhpop^7TONND?Yi1~s22p4r`SZAxAp2pPK:>5q"
T1 += "1r2uoXhx@411uA@pPGhj@w@4@11@4q4p84~{VXhp1v@4Y9pnWS"
T1 += "KqBrPq4q3T1p8t4p214@2q451pA4TDh8j>x4A@@@FihAE6V7q`"
T1 += "w4t`4hXu2p8}>hi@|Pq1~v2~zP~x8P[GP18>DpQqAp6p8=;Vq1"
T1 += "1p@pRp@pP81z4`nYk5hpV34A@pP2:Xr8t@6pY1AP214I:Nt1s1"
T1 += "~p`48~p2~p:>~r1~z4z@~q"
*/
/*
//cutoff 7.0
T1 = ""
T1 += "p4qT1F>@7Yi@ATV4h?_^E>XIpATR4dMJ>U3Xh2s@r`OYkAiWW7"
T1 += "UAHNU1pXpITW71r`oQkAIeW7EIJNp@PUpI4TpTKN>44rCPR24@"
T1 += "qPgYhp1v@4Xq<RQ:q@rPw26x4p2p@4111A44s:x41@p@41P114"
T1 += "61q`4|@p88tXCn>t144p418pP_jj2q4r8q1pPpXR_:x1Pu@411"
T1 += "1<PS3xA444TA8H@4Q@18PU1x@s12:tHRW3xAp24hO_n=q1r2t@"
T1 += "2HH2w`4191s4A@@PA@Yx@4111A4p44p84q:a~Pw1qITW3EAHFB"
T1 += "6YiA^cSK4CH6@FQI1mSVCa:ZZPs54V1lGjN@VikAIEV7Qq8@6a"
T1 += "kHslOjNdViiAmV^Wp4:5@4YIpH2V311q@4XXq4qP18>y18pPgi"
T1 += "h2A444q8u<PR3xAv@411plc[C1wAp4p4A8:@pQHs1~22thTS3x"
T1 += "@p2488::r1yThhx@w4A@@p4pXx@4p11@4t4@q9~xPuTA8ND4Yq"
T1 += "6RQIq@rQp14q2|4p2s1pA44s8@4w1@p@6YhAig_G1p@ui@W31s"
T1 += "48uP?^^A4AapA4V1TAJNTShh2hTV34A82po`k4w@5PIpoU^7UC"
T1 += "LNDDQ91p38;41`4to7\\FTAJNDUYk1p1@p4AH:@FPi@@r4p2:@u"
T1 += "1~~~~~~~t4@Pt4@@@p4s2~q2y4w144r@x14p@@@~~shOlne4A1"
T1 += "1@42q18pPohhG@p6r8u72UOxA444s@411p\\3\\;pAd42sA44p4I"
T1 += "8@@pP`pT9<1v1}lVR3xAP2p`;>^r1r2p@q8@VXhv21@p81q44p"
T1 += "4A@2pShi4w@4111A4P34@84pQQA}1PPt`ookGw@4Yqng[Oq@rQ"
T1 += "ul?on5s@r4p2uA44phMn>=w41@@@41q1q5T;N>4u4v88x@6`Hp"
T1 += "mWW3UAJ>pchj2hQV3U3H>p7Pj4<QR;4woU^1TAN>DFei@^SXCT"
T1 += "1nN6so7\\6TGN>DgiiEs41p2@6Pa@sT3J>1sL2Z3u1q@12p`92>"
T1 += "r1r2s8pQ88x@4rA4444@@qU8Zp1444s@4111I6V74p84p6piy4"
T1 += "r2PP2~xP~~~~~~qhOnnE4p@pA461P1:pPomj6ipV3UAH4p1pPp"
T1 += "k29;x1v@p11pno_CU1nN4sA4444Aq@5Qipn2<3~2unW_C1p@@q"
T1 += "1qATVplOon5q1r2p@q8@oliGs@q2@49p1A4Tp4A@BpQHZp1444"
T1 += "s@4111A4V6DIJF`WJiu1@uCPQ1sPoikgs4AH@@4Y8pNg[;5A@r"
T1 += "Pq41p2l?nn5s4r4A2@p411pI44Dh=N^@4@p1s4A@@@niiAE665"
T1 += "Lpb8v4q1q`pXXt@1:4p6Qh@D42141HqP8q@r4A8@p1pPu18u5P"
T1 += "4q1D4@411pnV[C11@4p41@pOp42TA8>D5YH1~z@2ZAx1rPI:>1"
T1 += "q1yn8hy4wA@qChHx@4~~x8Hx@4XqTVS3q@rPq4q2z2p4p2uA44"
T1 += "pP8Z>y1@p@6QhpA4R5q@w4u488~w6h`@~~~~~~p8PQAP18<@pP"
T1 += "q1p6q8;Vq1~w`6Yh1q4p41@r8y@4pY1Ar4A82~~~~r:~~~~~p"
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
var bstd = [];
var max_score;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";

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
//alert("table constructed");

function get_trial_decrypt(period){
                var i,j,index;
                var offset,count,k;
                var inverse_count;
                
                /* for speed, set up inverse key */
                inverse_count = [];
                for (j=0;j<period;j++)
                    inverse_key[j] = [];
        
                for (j=0;j<period;j++) {// highest possible key entry is key_len-1
                    inverse_count[j] = 0;
                    for (k=0;k<period;k++)
                        if ( key[k] == j)
                            inverse_key[j][inverse_count[j]++] = k;
                }
                count = 0;
                for (k=0;k< period;k++) {
                    if (inverse_count[k]==0) continue;
                    index = offset = 0;
                    while ( inverse_key[k][index]+offset < buf_len) {
                        plain_text[inverse_key[k][index]+offset] = buffer[count++];
                        if ( ++index >= inverse_count[k]){
                                index = 0;
                                offset += period;
                        }
                    } /* end while*/
                } /* next k */
        }
	

        function get_score(period){
            var score,i,n;
        
            get_trial_decrypt(period);
            // get tri score
            score = 0.0;
            for (i=0;i<buffer.length-2;i++){
                n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2];
                score += bstd[n];
            }
            return(score);
        }    

    var do_mysz_calc = function(code){ // return this function which can use the pseudo-global variables
        var str, alpha,out_str,c,n,i,ct,sum,c1,c2,j,k,flag;
        //var code_len,code;
        var code_len;
        var period, best_score, best_line,result,best_period;
        var n1,n2,v1,v2, local_best_score, local_count, reps;
        //var numb_decrypts, numb_accepted, fudge_factor;
		var numb_accepted;
        var ext_key, pos;
        
		/*
        numb_decrypts = parseInt(document.getElementById('numb_decrypts').value );
        max_period = parseInt(document.getElementById('max_period').value );
        fudge_factor = parseFloat(document.getElementById('fudge').value );
		*/
        max_score = 0;
        key = [];
        var cycle_limit = 30;	
        var begin_level = 1.0
        var noise_step = 1.5;
        var noise_level = begin_level;
        var cycle_numb = 0;        
        
       for (period = 4; period <= max_period; period++){
        for (i=0;i<period;i++)
            key[i] = Math.floor(Math.random()*period);
        local_best_score = 0;    
        loal_count = 0;
        //var max_local_count = 500;
        numb_accepted = 0;        
        for (i=0;i<numb_decrypts;i++){
           op_choice = Math.random()*100;
           if ( op_choice < 50){
                n1 = Math.floor(Math.random()*period);
                v1 = key[n1];
                key[n1] = Math.floor(Math.random()*period);
                //key[n1] = Math.floor(Math.random()*26);
           }
           else {
                n1 = Math.floor(Math.random()*period);
                v1 = key[n1];
                n2 = Math.floor(Math.random()*period);
                v2 = key[n2];
                key[n1] = v2;
                key[n2] = v1;
           
           }
            
            score = get_score(period);
            if (score>max_score){
                max_score = score;
                out_str = '';
                x = score.toFixed(2);
                //out_str += x+'~';
                for (j=0;j<buf_len;j++)
                    out_str += l_alpha.charAt(plain_text[j]);
                out_str += "\nscore: "+score.toFixed(2);
                k = 1000*score/(buffer.length-2);
                out_str += ", normalized score: "+k.toFixed(2);
                n = (k-69)/(740-69); // std english bstd score = 740, random english bstd score = 69
                out_str += ", doppleschach score: "+n.toFixed(2);
/*                
                k = 100*score/(buffer.length-2);
                out_str += ", normlized score: "+k.toFixed(2);
                n = (k-15)/(79-15); // std english bstd score = 79, random english bstd score = 15
                out_str += ", doppleschach score: "+n.toFixed(2);
*/                
                out_str += "\n% accept: "+ (100.0*numb_accepted/(i+1)).toFixed(2);
                out_str += '\nkey: ';
                for (j=0;j<period;j++)
                    out_str += l_alpha.charAt( key[j] );
                // check for repeated key letters, record repeats
                reps = {};
                flag = true;
                for (j=0;j<period;j++){
                    if (key[j] in reps){
                        reps[key[j]]++;
                        flag =false;
                    }
                    else {
                        reps[key[j]] = 1;
                    }
                }                    
                if ( flag )
                    out_str += ' (columnar)';
                /*
                // check for repeated key letters
                reps = {};
                flag = true;
                for (j = 0;j<period;j++){
                    if ( key[j] in reps ) {
                        flag = false;
                        break;
                    }
                    else
                        reps[ key[j] ] = true;
                }
                if ( flag )
                    out_str += ' (columnar)';
                */
                // check for redefence
                pos = -1;
                flag = true;
                for( c in reps) {
                    if ( reps[c] >2){ // not redefence
                        pos = -1;
                        flag = false;
                        break;
                    }
                    if (reps[c] == 1){
                        pos = key.indexOf( parseInt(c) ); // reps keys are stored in string format, even though key[] is an integer array
                    }
                }
                
                if ( pos != -1){
                    ext_key = key.slice(pos).concat(key.slice(0,pos));
                    k = (key.length-2)/2;
                    if (2*k +2 != key.length){
                        flag = false;
                    }
                    if ( flag)
                    for (j=1;j<k;j++){
                        if (ext_key[j] != ext_key[ext_key.length-j] ){
                            flag = false;
                            break;
                        }
                    }
                }
                if ( flag)
                    out_str += ' (redefence)';

                //document.getElementById('output_area').value = out_str;	
                //postMessage(out_str);
            }
            if (score > local_best_score-fudge_factor*buffer.length/(noise_level)) {	
                if (score != local_best_score)
                    numb_accepted++;				

                local_best_score = score;
			}
            else {
                if (op_choice< 50)
                    key[n1] = v1;
                else {
                    key[n1] = v1;
                    key[n2] = v2;
                }
            }
            noise_level += noise_step;	
            if ( ++cycle_numb >= cycle_limit) {
                noise_level = begin_level;
                cycle_numb = 0;
            }
            
        } // next i   
       } // next period
        
       postMessage(out_str);
        //test_values[test_index] = best_score;
        //document.getElementById('output_area').value = out_str;
        //return(max_score); for ID test return max doppleschach score

    } // end do_mysz_calc function
    return (do_mysz_calc); // return this function which can access pseudo_global variables
} // end mysz_calcs closure function

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
    do_mysz_calc = mysz_calcs(); // returns a function and initializes scoring table
    do_mysz_calc(buffer);
    
}

onmessage = function(event) { //receiving a message with the string to decode, start hill-climbing
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
debugger;
  var str = event.data; // string to decode
  
  buffer = str.buffer;
  max_period = str.max_period;
  numb_decrypts = str.numb_decrypts;
  fudge_factor = str.fudge_factor;
  buf_len = buffer.length;
  do_solve(); 
};  
