importScripts("bulk_traverse_trees.js"); 
importScripts("means_all_stats.js"); 
importScripts("decision_gini_trees100.js"); 

var final_output;
var length_cutoff;


if (!Array.prototype.indexOf) {
 Array.prototype.indexOf = function(elt /*, from*/) {
   var len = this.length;

   var from = Number(arguments[1]) || 0;
   from = (from < 0)
        ? Math.ceil(from)
        : Math.floor(from);
   if (from < 0)
     from += len;

   for (; from < len; from++)   {
     if (from in this &&
         this[from] === elt)
       return from;
   }
   return -1;
 };
}
var dx = 100;
var dy = 15;

var selected_type;
var extra_stat_names = ["Autokey Log DI score","Beaufort Log DI score","Porta Log DI score","Slidefair Log DI score","Vigenere Log DI score","Normal Order","reverse Log DI score","Portax Log DI score","Nicodemus IC","Phillips IC","Bifid DIC","Max Columnar SSD score","Swagman max STD score","Max Progressive Key IC"];

var extra_stat_divisors = [1000,1000,1000,1000,1000,1000,1000,1000,100,100,1000,1000,100,100];

var test_values;

var max_period = 15;


// indices for the current attributes
var IC_index = 0
var MIC_index = 1
var MKA_index = 2
var DIC_index = 3
var EDI_index = 4
var LR_index = 5
var ROD_index = 6
var LDI_index = 7
var SDD_index = 8
var Cipher_type_index = 9
var DIV_2_index = 10
var DIV_3_index = 11
var DIV_5_index = 12
var DIV_25_index = 13
var DIV_4_15_index = 14
var DIV_4_30_index = 15
var PSQ_index = 16
var HAS_L_index = 17
var HAS_D_index = 18
var HAS_J_index = 19
var HAS_H_index = 20
var DBL_index = 21
var A_LDI_index = 22
var B_LDI_index = 23
var P_LDI_index = 24
var S_LDI_index = 25
var V_LDI_index = 26
var NOMOR_index = 27
var RDI_index = 28
var PTX_index = 29
var NIC_index = 30
var PHIC_index = 31
var HAS_0_index = 32
var BDI_index = 33
var CDD_index = 34
var SSTD_index = 35
var MPIC_index = 36
var SERP_index = 37;

var ave = new Array(),std = new Array();
ctype= ["Plaintext", "Randomdigit", "Randomtext", "6x6Bifid", "6x6Playfair", "Amsco", "Bazeries", "Beaufort", "Bifid6", "Bifid7", "Cadenus", "Cmbifid", "Columnar", "Digrafid", "DoubleCheckerBoard", "Four_square", "FracMorse", "Grandpre", "Grille", "Gromark", "Gronsfeld", "Homophonic", "MonomeDinome", "Morbit", "Myszkowski", "Nicodemus", "Nihilistsub", "NihilistTransp", "Patristocrat", "Phillips", "Periodic gromark", "Playfair", "Pollux", "Porta", "Portax", "Progressivekey", "Progkey beaufort", "Quagmire2", "Quagmire3", "Quagmire4", "Ragbaby", "Redefence", "RunningKey", "Seriatedpfair", "Swagman", "Tridigital", "Trifid", "Trisquare", "Trisquare HR", "Two square", "Twosquarespiral", "Vigautokey", "Vigenere", "period 7 Vigenere", "Vigslidefair", "Route Transp"];
ave[0]=new Array(63.0,100.0,38.0,35.0,42.0,63.0,64.0,42.0,47.0,47.0,63.0,47.0,63.0,41.0,90.0,48.0,47.0,128.0,63.0,39.0,40.0,101.0,124.0,122.0,63.0,42.0,144.0,63.0,63.0,49.0,38.0,50.0,100.0,41.0,42.0,38.0,38.0,41.0,42.0,41.0,41.0,63.0,39.0,48.0,62.0,122.0,42.0,43.0,43.0,49.0,47.0,39.0,42.0,42.0,40.0,63.0);
std[0]=new Array(5.0,2.0,1.0,4.0,4.0,5.0,4.0,3.0,4.0,4.0,5.0,4.0,5.0,3.0,13.0,3.0,2.0,3.0,5.0,1.0,2.0,1.0,7.0,4.0,5.0,3.0,11.0,5.0,5.0,3.0,1.0,4.0,0.0,2.0,2.0,1.0,1.0,2.0,2.0,2.0,1.0,5.0,4.0,3.0,5.0,8.0,3.0,2.0,1.0,3.0,3.0,1.0,2.0,3.0,2.0,5.0);
ave[1]=new Array(73.0,108.0,44.0,47.0,51.0,72.0,74.0,67.0,58.0,58.0,74.0,57.0,73.0,53.0,133.0,58.0,53.0,136.0,74.0,46.0,66.0,108.0,134.0,129.0,72.0,50.0,201.0,73.0,73.0,58.0,45.0,60.0,103.0,66.0,51.0,45.0,45.0,65.0,66.0,65.0,49.0,72.0,56.0,56.0,72.0,134.0,53.0,51.0,52.0,60.0,59.0,45.0,65.0,67.0,63.0,73.0);
std[1]=new Array(11.0,8.0,5.0,9.0,9.0,10.0,13.0,9.0,10.0,9.0,11.0,9.0,11.0,7.0,18.0,9.0,8.0,7.0,12.0,7.0,8.0,6.0,11.0,7.0,10.0,7.0,23.0,12.0,11.0,8.0,7.0,9.0,2.0,9.0,7.0,6.0,6.0,8.0,9.0,8.0,8.0,10.0,18.0,9.0,11.0,15.0,8.0,5.0,5.0,8.0,8.0,6.0,8.0,9.0,9.0,11.0);
ave[2]=new Array(95.0,132.0,60.0,62.0,67.0,94.0,94.0,78.0,75.0,77.0,95.0,75.0,96.0,67.0,149.0,76.0,70.0,158.0,91.0,63.0,76.0,127.0,169.0,156.0,95.0,73.0,195.0,97.0,95.0,74.0,63.0,79.0,121.0,74.0,66.0,63.0,63.0,75.0,76.0,75.0,71.0,94.0,74.0,75.0,90.0,161.0,68.0,64.0,65.0,77.0,76.0,62.0,74.0,78.0,72.0,92.0);
std[2]=new Array(19.0,16.0,12.0,16.0,15.0,19.0,20.0,17.0,15.0,17.0,17.0,15.0,18.0,13.0,23.0,15.0,15.0,15.0,16.0,13.0,19.0,13.0,19.0,16.0,18.0,14.0,30.0,18.0,19.0,16.0,14.0,18.0,9.0,16.0,14.0,13.0,14.0,15.0,18.0,18.0,14.0,16.0,22.0,19.0,17.0,22.0,14.0,11.0,11.0,16.0,15.0,12.0,15.0,17.0,16.0,17.0);
ave[3]=new Array(72.0,100.0,14.0,14.0,32.0,44.0,60.0,23.0,24.0,24.0,40.0,23.0,41.0,17.0,110.0,36.0,42.0,179.0,42.0,15.0,21.0,116.0,249.0,193.0,41.0,18.0,218.0,41.0,72.0,32.0,14.0,38.0,105.0,22.0,18.0,14.0,14.0,21.0,22.0,21.0,18.0,41.0,16.0,25.0,39.0,195.0,18.0,21.0,21.0,36.0,34.0,15.0,22.0,23.0,18.0,46.0);
std[3]=new Array(18.0,8.0,2.0,5.0,9.0,10.0,15.0,5.0,6.0,6.0,9.0,5.0,8.0,4.0,30.0,8.0,9.0,15.0,9.0,3.0,5.0,7.0,36.0,15.0,8.0,4.0,33.0,9.0,18.0,7.0,3.0,9.0,2.0,6.0,3.0,3.0,3.0,5.0,5.0,5.0,4.0,10.0,8.0,6.0,7.0,29.0,5.0,3.0,3.0,9.0,7.0,3.0,6.0,5.0,4.0,14.0);
ave[4]=new Array(73.0,98.0,14.0,14.0,72.0,43.0,61.0,23.0,24.0,23.0,41.0,23.0,41.0,20.0,207.0,72.0,43.0,227.0,43.0,15.0,25.0,160.0,252.0,194.0,41.0,18.0,266.0,40.0,73.0,32.0,15.0,72.0,105.0,25.0,19.0,13.0,14.0,25.0,24.0,23.0,18.0,43.0,16.0,25.0,39.0,197.0,18.0,21.0,21.0,72.0,72.0,14.0,26.0,23.0,25.0,47.0);
std[4]=new Array(24.0,15.0,5.0,8.0,24.0,13.0,20.0,9.0,8.0,8.0,13.0,9.0,12.0,7.0,58.0,24.0,13.0,39.0,14.0,6.0,11.0,15.0,43.0,25.0,13.0,7.0,42.0,13.0,24.0,10.0,6.0,24.0,4.0,11.0,8.0,5.0,6.0,10.0,10.0,10.0,6.0,16.0,15.0,9.0,12.0,37.0,8.0,6.0,5.0,24.0,24.0,5.0,11.0,8.0,9.0,18.0);
ave[5]=new Array(22.0,21.0,5.0,4.0,11.0,11.0,17.0,9.0,7.0,7.0,10.0,6.0,11.0,5.0,25.0,11.0,16.0,33.0,10.0,4.0,9.0,24.0,45.0,38.0,11.0,5.0,38.0,10.0,22.0,11.0,4.0,12.0,23.0,9.0,6.0,4.0,4.0,8.0,8.0,8.0,6.0,10.0,4.0,7.0,10.0,38.0,6.0,7.0,7.0,11.0,11.0,4.0,8.0,9.0,6.0,12.0);
std[5]=new Array(5.0,3.0,3.0,3.0,5.0,4.0,5.0,4.0,4.0,4.0,4.0,4.0,4.0,3.0,5.0,4.0,3.0,3.0,4.0,3.0,4.0,2.0,5.0,2.0,4.0,3.0,4.0,4.0,5.0,4.0,3.0,4.0,1.0,4.0,3.0,3.0,3.0,4.0,4.0,4.0,4.0,4.0,5.0,4.0,4.0,4.0,3.0,2.0,3.0,4.0,4.0,3.0,4.0,4.0,3.0,6.0);
ave[6]=new Array(50.0,50.0,50.0,49.0,25.0,50.0,49.0,50.0,48.0,49.0,49.0,50.0,50.0,43.0,13.0,28.0,50.0,43.0,49.0,50.0,42.0,42.0,49.0,49.0,49.0,50.0,40.0,50.0,50.0,49.0,48.0,32.0,50.0,42.0,48.0,49.0,49.0,42.0,43.0,44.0,49.0,49.0,49.0,49.0,50.0,49.0,51.0,49.0,50.0,28.0,25.0,50.0,42.0,50.0,40.0,50.0);
std[6]=new Array(6.0,3.0,10.0,12.0,9.0,8.0,5.0,10.0,10.0,9.0,9.0,10.0,7.0,11.0,7.0,8.0,7.0,3.0,7.0,12.0,14.0,2.0,2.0,2.0,7.0,10.0,6.0,9.0,6.0,9.0,11.0,8.0,1.0,13.0,12.0,14.0,12.0,14.0,12.0,13.0,11.0,7.0,19.0,8.0,6.0,3.0,12.0,6.0,7.0,8.0,9.0,12.0,13.0,10.0,11.0,7.0);
ave[7]=new Array(756.0,0,428.0,298.0,243.0,688.0,477.0,443.0,510.0,517.0,657.0,493.0,653.0,469.0,609.0,507.0,444.0,0,679.0,431.0,444.0,0,0,0,657.0,442.0,0,654.0,414.0,424.0,428.0,491.0,0,432.0,442.0,428.0,429.0,431.0,444.0,440.0,473.0,653.0,445.0,484.0,650.0,0,462.0,503.0,512.0,542.0,501.0,434.0,438.0,437.0,436.0,675.0);
std[7]=new Array(13.0,0,23.0,53.0,57.0,15.0,44.0,32.0,36.0,37.0,17.0,31.0,16.0,33.0,44.0,33.0,32.0,0,16.0,26.0,27.0,0,0,0,18.0,35.0,0,17.0,57.0,37.0,26.0,42.0,0,35.0,24.0,24.0,26.0,32.0,36.0,33.0,23.0,18.0,35.0,38.0,18.0,0,37.0,23.0,23.0,33.0,36.0,23.0,33.0,34.0,34.0,33.0);
ave[8]=new Array(303.0,0,109.0,71.0,63.0,188.0,112.0,113.0,119.0,118.0,134.0,114.0,128.0,112.0,133.0,114.0,107.0,0,173.0,109.0,111.0,0,0,0,135.0,112.0,0,129.0,106.0,106.0,108.0,118.0,0,111.0,113.0,109.0,109.0,109.0,110.0,111.0,112.0,128.0,107.0,115.0,135.0,0,112.0,119.0,120.0,121.0,119.0,111.0,106.0,108.0,112.0,162.0);
std[8]=new Array(23.0,0,14.0,16.0,19.0,17.0,21.0,15.0,16.0,17.0,18.0,16.0,15.0,15.0,19.0,16.0,17.0,0,17.0,15.0,15.0,0,0,0,18.0,15.0,0,17.0,23.0,17.0,16.0,19.0,0,16.0,13.0,15.0,14.0,16.0,17.0,17.0,15.0,15.0,23.0,17.0,16.0,0,15.0,14.0,13.0,18.0,17.0,16.0,16.0,17.0,15.0,50.0);


var cipher_symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#0123456789";
var numb_symbols;
var cipher_values = new Array(9);
numb_symbols = cipher_symbols.length;

var logdi = new Array(
[4,7,8,7,4,6,7,5,7,3,6,8,7,9,3,7,3,9,8,9,6,7,6,5,7,4],
 [7,4,2,0,8,1,1,1,6,3,0,7,2,1,7,1,0,6,5,3,7,1,2,0,6,0],
 [8,2,5,2,7,3,2,8,7,2,7,6,2,1,8,2,2,6,4,7,6,1,3,0,4,0],
 [7,6,5,6,8,6,5,5,8,4,3,6,6,5,7,5,3,6,7,7,6,5,6,0,6,2],
 [9,7,8,8,8,7,6,6,7,4,5,8,7,9,7,7,5,9,9,8,5,7,7,6,7,3],
 [7,4,5,3,7,6,4,4,7,2,2,6,5,3,8,4,0,7,5,7,6,2,4,0,5,0],
 [7,5,5,4,7,5,5,7,7,3,2,6,5,5,7,5,2,7,6,6,6,3,5,0,5,1],
 [8,5,4,4,9,4,3,4,8,3,1,5,5,4,8,4,2,6,5,7,6,2,5,0,5,0],
 [7,5,8,7,7,7,7,4,4,2,5,8,7,9,7,6,4,7,8,8,4,7,3,5,0,5],
 [5,0,0,0,4,0,0,0,3,0,0,0,0,0,5,0,0,0,0,0,6,0,0,0,0,0],
 [5,4,3,2,7,4,2,4,6,2,2,4,3,6,5,3,1,3,6,5,3,0,4,0,5,0],
 [8,5,5,7,8,5,4,4,8,2,5,8,5,4,8,5,2,4,6,6,6,5,5,0,7,1],
 [8,6,4,3,8,4,2,4,7,1,0,4,6,4,7,6,1,3,6,5,6,1,4,0,6,0],
 [8,6,7,8,8,6,9,6,8,4,6,6,5,6,8,5,3,5,8,9,6,5,6,3,6,2],
 [6,6,7,7,6,8,6,6,6,3,6,7,8,9,7,7,3,9,7,8,9,6,8,4,5,3],
 [7,3,3,3,7,3,2,6,7,2,1,7,3,2,7,6,0,7,6,6,6,0,3,0,4,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0],
 [8,6,6,7,9,6,6,5,8,3,6,6,6,6,8,6,3,6,8,8,6,5,6,0,7,1],
 [8,6,7,6,8,6,5,7,8,4,6,6,6,6,8,7,4,5,8,9,7,4,7,0,6,2],
 [8,6,6,5,8,6,5,9,8,3,3,6,6,5,9,6,2,7,8,8,7,4,7,0,7,2],
 [6,6,7,6,6,4,6,4,6,2,3,7,7,8,5,6,0,8,8,8,3,3,4,3,4,3],
 [6,1,0,0,8,0,0,0,7,0,0,0,0,0,5,0,0,0,1,0,2,1,0,0,3,0],
 [7,3,3,4,7,3,2,8,7,2,2,4,4,6,7,3,0,5,5,5,2,1,4,0,3,1],
 [4,1,4,2,4,2,0,3,5,1,0,1,1,0,3,5,0,1,2,5,2,0,2,2,3,0],
 [6,6,6,6,6,6,5,5,6,3,3,5,6,5,8,6,3,5,7,6,4,3,6,2,4,2],
 [4,0,0,0,5,0,0,0,3,0,0,2,0,0,3,0,0,0,1,0,2,0,0,0,4,4]);

var sdd = new Array(
[0,3,4,2,0,0,1,0,0,0,4,5,2,6,0,2,0,4,4,3,0,6,0,0,3,5],
[0,0,0,0,6,0,0,0,0,9,0,7,0,0,0,0,0,0,0,0,7,0,0,0,7,0],
[3,0,0,0,2,0,0,6,0,0,8,0,0,0,6,0,5,0,0,0,3,0,0,0,0,0],
[1,6,0,0,1,0,0,0,4,4,0,0,0,0,0,0,0,0,0,1,0,0,4,0,1,0],
[0,0,4,5,0,0,0,0,0,3,0,0,3,2,0,3,6,5,4,0,0,4,3,8,0,0],
[3,0,0,0,0,5,0,0,2,1,0,0,0,0,5,0,0,2,0,4,1,0,0,0,0,0],
[2,0,0,0,1,0,0,6,1,0,0,0,0,0,2,0,0,1,0,0,2,0,0,0,0,0],
[5,0,0,0,7,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,5,0,0,0,4,0,0,0,1,1,3,7,0,0,0,0,5,3,0,5,0,0,0,8],
[0,0,0,0,6,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,9,0,0,0,0,0],
[0,0,0,0,6,0,0,0,5,0,0,0,0,4,0,0,0,0,0,0,0,0,1,0,0,0],
[2,0,0,4,2,0,0,0,3,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,7,0],
[5,5,0,0,5,0,0,0,2,0,0,0,0,0,2,6,0,0,0,0,2,0,0,0,6,0],
[0,0,4,7,0,0,8,0,0,2,2,0,0,0,0,0,3,0,0,4,0,0,0,0,0,0],
[0,2,0,0,0,8,0,0,0,0,4,0,5,5,0,2,0,4,0,0,7,4,5,0,0,0],
[3,0,0,0,3,0,0,0,0,0,0,5,0,0,5,7,0,6,0,0,3,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0],
[1,0,0,0,4,0,0,0,2,0,4,0,0,0,2,0,0,0,0,0,0,0,0,0,5,0],
[1,1,0,0,0,0,0,1,2,0,0,0,0,0,1,4,4,0,1,4,2,0,4,0,0,0],
[0,0,0,0,0,0,0,8,3,0,0,0,0,0,3,0,0,0,0,0,0,0,2,0,0,0],
[0,4,3,0,0,0,5,0,0,0,0,6,2,3,0,6,0,6,5,3,0,0,0,0,0,6],
[0,0,0,0,8,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[6,0,0,0,2,0,0,6,6,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0],
[3,0,7,0,1,0,0,0,2,0,0,0,0,0,0,9,0,0,0,5,0,0,0,6,0,0],
[1,6,2,0,0,2,0,0,0,6,0,0,2,0,6,2,1,0,2,1,0,0,6,0,0,0],
[2,0,0,0,8,0,0,0,0,6,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,9]);
 
 

function convert_string(code) {
	var num_code = new Array(),i,clen,n;
	
	//code = document.puzzle.ciphertext.value;
    //code = document.getElementById("ciphertext").value;
	code = code.toUpperCase();
    code = code.replace(/Ø/g,'0');
	clen=0;
	for (i=0;i<code.length;i++) {
		n = cipher_symbols.indexOf(code.charAt(i))
		if ( n != -1){
			num_code[clen]=n;
			clen++;
		}
	}
	return num_code;
}

function get_ic(dat) {
	var sum,i,ic,l;
	var ct=new Array()
	
	for (i=0;i<numb_symbols;i++)
		ct[i]=0;
	l = dat.length;
	for (i=0;i<l;i++)
		ct[ dat[i] ] += 1
	sum = 0.0
	for (i=0;i<numb_symbols;i++)
		sum += ct[i]*(ct[i]-1)
	ic = sum/(l*(l-1));
	return ic*1000
}

function get_max_periodic_ic(dat) {
	var sum,i,j,l,mx,period,index,x,y,z;
	var ct=new Array()
    
	mx=0.0;

	l= dat.length;
	for (i=0;i<=max_period;i++)
		ct[i]=new Array(numb_symbols);
	for (period = 1; period <= max_period;period++) {	
		for (i=0;i<period;i++)
			for (j=0;j<numb_symbols;j++)
				ct[i][j]=0;
		index = 0;
		for (i=0;i<l;i++) {
			ct[index][ dat[i] ] += 1;
			index = (index+1)%period;
		}
		z=0.0
		for (i=0;i<period;i++) {
			x=y=0.0;
			for (j=0;j<numb_symbols;j++) {
				x += ct[i][j]*(ct[i][j]-1);
				y += ct[i][j];
			}
			if (y>1) z += x/(y*(y-1));
		}
		z = z/period;
		if (z>mx) mx = z;
	}
	return( 1000.0*mx);
}

function get_max_progkey_ic(dat) {
	var sum,i,j,l,mx,period,index,x,y,z;
    var prog_index, prog_incr,c;
	var ct=new Array()
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y') //has numbers or # symbol
        return(0);

	mx=0.0;
    //max_period = document.puzzle.period_entry.value
    //max_period = document.getElementById("period_entry").value;
	l= dat.length;
	for (i=0;i<=max_period;i++)
		ct[i]=new Array(numb_symbols);
	for (period = 1; period <= max_period;period++) {	
      for (prog_index = 1;prog_index<26;prog_index++){
		for (i=0;i<period;i++)
			for (j=0;j<numb_symbols;j++)
				ct[i][j]=0;
		index = 0;
        prog_incr = 0;
		for (i=0;i<l;i++) {
            c = (26+dat[i]-prog_incr)%26;
			ct[index][ c ] += 1;
			//index = (index+1)%period;
            if ( ++index == period){
                index = 0;
                prog_incr = (prog_incr+prog_index)%26;
            }
		}
		z=0.0
		for (i=0;i<period;i++) {
			x=y=0.0;
			for (j=0;j<numb_symbols;j++) {
				x += ct[i][j]*(ct[i][j]-1);
				y += ct[i][j];
			}
			if (y>1) z += x/(y*(y-1));
		}
		z = z/period;
		if (z>mx) {
			mx = z;
		}
       } 
	}
    return( Math.floor(1000.0*mx));
}

function get_kappa(dat) {
	var mx,i,l,period,z;
	var ct
	

	mx = 0.0
	for (period = 1;period<=max_period;period++) {
		if ( period>=dat.length) break;
		ct = 0.0;
		for (i=0;i<dat.length-period;i++)
			if (dat[i]==dat[i+period])
				ct += 1.0;
		z = ct/(dat.length-period);
		if ( z>mx) mx=z;
	}
	return 1000.0*mx
}

function get_dic(dat) {
	var sum,i,ic,l;
	var ct=new Array()
	
	for (i=0;i<numb_symbols*numb_symbols;i++)
		ct[i]=0;
	l = dat.length;
	for (i=0;i<l-1;i++)
		ct[ dat[i]+numb_symbols*dat[i+1] ] += 1
	sum = 0.0
	for (i=0;i<numb_symbols*numb_symbols;i++)
		sum += ct[i]*(ct[i]-1)
	l--;
	ic = sum/(l*(l-1));
	return ic*10000
}

function get_even_dic(dat) {
	var sum,i,ic,l,n;
	var ct=new Array()
	
	for (i=0;i<numb_symbols*numb_symbols;i++)
		ct[i]=0;
	l = dat.length;
	n=0;
	for (i=0;i<l-1;i=i+2) {
		ct[ dat[i]+numb_symbols*dat[i+1] ] += 1
		n++;
	}
	sum = 0.0
	for (i=0;i<numb_symbols*numb_symbols;i++)
		sum += ct[i]*(ct[i]-1)
	ic = sum/(n*(n-1));
	return ic*10000
}


function get_LR(dat) {
	var i,j,n,l;
	var reps = new Array(11);
	
	for (i=0;i<11;i++) reps[i]=0;
	l = dat.length;
	for (i=0;i<l;i++)
		for (j=i+1;j<l;j++) {
			n=0;
			while (j+n<l && dat[i+n]==dat[j+n])
				n++;
			if ( n>10) n=10;
			reps[n]++;
		}
	return 1000.0*Math.sqrt(reps[3])/l
}

function get_ROD(dat) {
	var i,j,n,l;
	var sum_all,sum_odd;
	
	sum_all=sum_odd=0;
	l = dat.length;
	for (i=0;i<l;i++)
		for (j=i+1;j<l;j++) {
			n=0;
			while (j+n<l && dat[i+n]==dat[j+n])
				n++;
			if ( n>1) {
				sum_all++;
				if ( (j-i)&1)
					sum_odd++;
			}
		}
	if ( sum_all == 0 ) return 50.0
	return 100.0*sum_odd/sum_all
}

function get_logdi(dat) {
	var score,i,l;

	l=dat.length-1;
	score = 0;
	for (i=0;i<l;i++) {
		if (dat[i]>25 || dat[i+1]>25)
			continue;
		score += logdi[dat[i]][dat[i+1]]
	}
	score *= 100;
	score /= l;
	return score
}

function get_sdd(dat) {
	var score,i,l;

	l=dat.length-1;
	score = 0;
	for (i=0;i<l;i++) {
		if (dat[i]>25 || dat[i+1]>25)
			continue;
		score += sdd[dat[i]][dat[i+1]]
	}
	score *= 100;
	score /= l;
	return score
}

function get_num_dev() {
	var i,j,x,v;
	var num_dev = new Array();
	
	for (i=0;i<ctype.length;i++) {
		x=0.0;
		for (j=0;j<9;j++) {
			v = std[j][i];
			if (j==0) v += .001;
			if (ave[j][i]==0)
				x += cipher_values[j];
			else
			x += Math.abs( (cipher_values[j] - ave[j][i])/v );
		}
		num_dev[i]=[ctype[i],x]
	}

	return num_dev
}

function s_compare(a,b) {
		return a[1]-b[1]
}		

function calc_length_attributes(len){
    var s,s1,n;
    var test_index;
    
    test_index = 10;
    s = 'DIV_2: ';
    if ((len%2) == 0) {
        s += 'Y' ;//length divisible by 2
        test_values[test_index++] = 'Y';
    }
    else {
        s += 'N';
        test_values[test_index++] = 'N';
    }
    s += ',DIV_3: ';
    if ((len%3) == 0) {
        s += 'Y'; //length divisible by 3
        test_values[test_index++] = 'Y';
    }
    else {
        s += 'N';
        test_values[test_index++] = 'N';
    }
    s += ',DIV_5: ';
    if ((len%5) == 0) {
        s += 'Y' ;//length divisible by 5
        test_values[test_index++] = 'Y';
    }
    else {
        s += 'N';
        test_values[test_index++] = 'N';
    }
    s += ',DIV_25: ';
    if ((len%25) == 0) {
        s += 'Y'; //length divisible by 25
        test_values[test_index++] = 'Y';
    }
    else {
        s += 'N';
        test_values[test_index++] = 'N';
    }
    s += ',DIV_4_15: ';
    s1 = 'N';
    for (n=4;n<16;n++) //length divisible by an integer between 4 and 15
        if ((len%n) == 0){
            s1 = 'Y';
            break;
    }
    test_values[test_index++] = s1;
    s += s1
    s += ',DIV_4_30: ';
    s1 = 'N';
    for (n=4;n<31;n++) //length divisible by an integer between 4 and 30
        if ((len%n) == 0){
            s1 = 'Y';
            break;
    }
    test_values[test_index++] = s1;    
    s += s1
    s += ',PSQ: ';
    n = Math.floor(Math.sqrt(len))
    if (n*n == len) {
        s += 'Y'; //length is perfect square
            test_values[test_index++] = 'Y';
    }
    else {
        s += 'N';
            test_values[test_index++] = 'N';
    }
    //s += ',' // include comma at end for split(,) function.    
    return( s);
}    

function calc_letter_digit_attributes(dat){
    var i,s,l1,l2,l3,l4,c;
    var test_index;
    
    s = ''
    l1 = l2 = l3 = l4 = 'N';
    for (i=0;i<dat.length;i++){
        c = dat[i];
        if (c<26) l1 = 'Y';
        if ( c==26) l4 = 'Y'
        if ( c > 26) l2 = 'Y'
        if (c == 9) l3 = 'Y'
    }
    test_index = 17
    s += 'HAS_L: '+l1;
    test_values[test_index++] = l1;    
    s += ', HAS_D: '+l2;
    test_values[test_index++] = l2;    
    s += ', HAS_J: '+l3;
    test_values[test_index++] = l3;    
    s += ', HAS_H: '+l4;
    test_values[test_index++] = l4; 
    l1 = 'N'
    if ( (dat.length%2) == 0) { //even length
        for (i=0;i<dat.length;i=i+2){
            if (dat[i] == dat[i+1]){
                l1 = 'Y';
                break;
            }
        }
    }
    s += ', DBL: '+l1;
    test_values[test_index++] = l1;    
    
    return(s);
}


// vig family functions
function decode_let(ct, key, ciph_type){
        var j,k;
        var cp;

        switch(ciph_type) {
        case 2: // VIGENERE
        case 8: //VEAUTOKEY
                cp = (26+ct - key)%26;
                break;
        case 3: //VARIANT
        case 6: //VAUTOKEY
                cp = (ct+key)%26;
                break;
        case 4: //BEAUFORT
        case 7: // BAUTOKEY
                cp = (26+key - ct)%26;
                break;
        default: /* must be porta */
                key = Math.floor(key /2);
                cp = ct;
                if ( cp<13) {
                        cp += key;
                        if ( cp <13)
                                cp += 13;
                }
                else {
                        cp -= key;
                        if ( cp >12)
                                cp -= 13;
                }
        } /* end switch */
        return(cp);
} /* end decode_let */


function best_di(col,ciph_type,period,buffer){
/* return best log_di score for all possible digraph keys in column */
        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr;
        
        best_score = 0;
        rows = Math.floor(buf_len / period);
        for (kl = 0;kl<26;kl++) for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                kl1 = kl;
                kr1 = kr;
		        for (j=0;j<rows;j++) {
                	if ( col+j*period+1>=buf_len)
                	        break;
                	cl = buffer[col+j*period];
                	cr = buffer[col+1+j*period];
                	pl = decode_let(cl,kl1,ciph_type);
                	pr = decode_let(cr,kr1,ciph_type);
                	score += logdi[pl][pr];
                	ct++;
                	if ( ciph_type <= 9 // PAUTOKEY 
                		&& ciph_type >= 6 ){ //VAUTOKEY) 
                	        kl1 = pl;
                	        kr1 = pr;
                	}
                }/* next j */
                score *= 100;
                score /= ct;
                if ( score > best_score)
                        best_score = score;
        } /* next kr,kl */
        return(best_score);
} /* end best_di */

function decode_sl(cl,cr,k, ciph_type) {
        var j,pl,pr
        

        if ( ciph_type == 1) { //BSLIDEFAIR
                pl = (26+k-cr)%26;
                pr = (26+k - cl) % 26;
        }
        else {
                pl = (26+cr-k) % 26;
                pr = (cl+k)%26;
        }
        return( [pl,pr]);
} /* end decode_sl */

function best_sldi(col, ciph_type,period,buffer){
/* return best log_di score for all possible single letter keys in column */
        var j,rows,ct, rowb, posn;
        var best_score, score;
        var k,pl,pr, kl1;
        var cl,cr;
        var result;
        
        best_score = 0;
        rows = Math.floor(buf_len / (2*period));
        rowb = 2*col;
        for (k = 0;k<26;k++) {
                score = 0;
                ct = 0;
        for (j=0;j<rows;j++) {
                        posn = j*period*2+rowb;
                        if ( posn+1 >= buf_len)
                                break;
                        cl = buffer[posn];
                        cr = buffer[posn+1];
                        result=decode_sl(cl,cr,k,ciph_type);
                        pl= result[0];
                        pr = result[1];
                        score += logdi[pl][pr];
                        ct++;
                }/* next j */
                score *= 100;
                score /= ct;
                if ( score > best_score)
                        best_score = score;
        } /* next k */
        return(best_score);
} /* end best_sldi */


function get_vig_values(dat) {
	var s,type_name,hi,n,i;
	var ciph_type, start_type;
	var best_score;
	var period,best_period;
    var attribute_group_scores;
    var group_index;
    
    // translate cipher type index to attribute_group_index
    // A_LDI 0, B_LDI 1, P_LDI 2, S_LDI 3, V_LDI 4
/* cipher types:
VIGENERE 2
VARIANT 3
BEAUFORT 4
VSLIDEFAIR 0
BSLIDEFAIR 1
VAUTOKEY 6
BAUTOKEY 7
VEAUTOKEY 8
PORTA 5
PAUTOKEY 9
*/
    
    var xlate_indices = [ 3,3,4,4,1,2,0,0,0,0];
	
	buf_len = dat.length;	
	best_score = 0;

    var min_period = 3;
	if ( (buf_len%2) == 0) start_type = 0;
	else start_type = 2;
    attribute_group_scores = [0,0,0,0,0];
	for (ciph_type = start_type; ciph_type<=9;ciph_type++) {
        group_index = xlate_indices[ciph_type];
		for (period = min_period; period <= max_period; period++) {
        	sum = 0;
            for (col = 0; col <period;col++) 
            	if ( ciph_type > 1) //BSLIDEFAIR
                	sum += best_di(col,ciph_type,period,dat);
                else
                    sum += best_sldi(col,ciph_type,period,dat);
                sum /= period;
                n = Math.floor(sum);
                if (n > attribute_group_scores[group_index]) {
                    attribute_group_scores[group_index] = n;
                }
         } /* next period */
	} /* next ciphertype */
    s = 'A_LDI '+attribute_group_scores[0]+' , B_LDI '+attribute_group_scores[1];
    s += ' , P_LDI '+attribute_group_scores[2]+' , S_LDI '+attribute_group_scores[3];
    s += ' , V_LDI '+attribute_group_scores[4]+' ';
    var test_index = 22;
    for (i=0;i<5;i++)
        test_values[test_index+i] = attribute_group_scores[i]
	return(s);
}


function calc_vig_family_attributes(dat) {
    var i,j,n,s;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
    
    var test_index = 22;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not vig family if it has numbers or # symbol
        s = 'A_LDI 0, B_LDI 0, P_LDI 0, S_LDI 0, V_LDI 0';
        for (i=test_index;i<test_index+5;i++)
            test_values[i] = 0;
        return(s);
    }    
    s = get_vig_values(dat);
    return(s);
}

function calc_nomor(num_code){
    var c ,n ,i,j,indx,sum;
    var freq,val,freq_order;
    var s;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 27;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not vig family if it has numbers or # symbol
        s = 'NOMOR 0';
        test_values[test_index] = 0;
        return(s);
    }    
    
    var english_freq_list = [4, 19, 0, 14, 8, 13, 18, 17, 7, 11, 3, 20, 2, 12, 6, 5, 24, 15, 22, 1, 21, 10, 23, 9, 25, 16]
    
    // get letter frequencies in the code
    freq = []
    for (i=0;i<26;i++) freq[i] = 0;
    for ( i = 0;i<num_code.length;i++){
        n = num_code[i]
        if ( n <26)
        freq[n]++;
    }
    // get list of the unique letter frequencies
    vals = [];
    indx = 0;
    for(i=0;i<26;i++){
        n = freq[i];
        j = vals.indexOf(n);
        if ( j == -1)
        vals[indx++]=n;
    }
    vals.sort(function(a,b){return b-a}); // descending numerical sort
    // make list of the code letters in order of their frequencies, highest first, equal frequencies in
    // alphabetical order
    freq_order = [];
    indx = 0;
    for (i=0;i<vals.length;i++){
        n = vals[i];
        for (j=0;j<26;j++){
            if (freq[j] == n)
                freq_order[indx++] = j;;
        }
    }
    // sum the differences in position between each letter in the code frequencies and in standard 
    //english  frequencies
    sum = 0
    for (i=0 ; i<26; i++){
        n = english_freq_list.indexOf(i) - freq_order.indexOf(i);
        if (n<0) n = -n;
        sum += n;
    }
    test_values[test_index] = sum;
    s = 'NOMOR '+sum
    return s;
}


function calc_rev_logdi(num_code){
    var c ,n ,i,j,ct,score,l;
    var s;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 28;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not vig family if it has numbers or # symbol
        s = 'RDI 0';
        test_values[test_index] = 0;
        return(s);
    }    
    if (num_code.length&1 != 0) {//odd number of letters
        s = 'RDI 0';
        test_values[test_index] = 0;
        return(s);
    }    
	l=num_code.length;
	score = 0;
    ct = 0;
	for (i=0;i<l;i=i+2) {
		score += logdi[num_code[i+1]][num_code[i]]
        ct++;
	}
	score *= 100;
	score /= ct;
    score = Math.floor(score);
    test_values[test_index] = score;
    s = 'RDI '+score
    return s;
}    

function decode_pair(k,c1, c2) {
        var t_flag,b_flag,t_index,b_index;
        var rvalue,sum;

        if (c1<13) t_flag = 0;
        else t_flag = 2;
        if ( c2 % 2 ) b_flag = 1;
        else b_flag = 0;
        rvalue = [0,0,0];
        sum = t_flag+b_flag;
        if ( sum == 2)
			if (c1-13 != (c2 >> 1)) // c1,c2 not verticaly aligned
				rvalue = [1, (c2 >> 1)+13,(c1-13) << 1]
        if ( sum == 3)
			if (c1-13 != (c2>>1))// c2, c2 not vertically aligned
				rvalue = [1,(c2>>1)+13,( (c1-13)<<1 )+1 ]
        return(rvalue);
} /* end decode_pair */


function calc_portax_logdi(nc){
	var s, count,score,hi,j,k,result
	var big_step;
	var best_score;
	var period,best_period;
    var c1,c2,c3,c4;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 29;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not vig family if it has numbers or # symbol
        s = 'PTX 0';
        test_values[test_index] = 0;
        return(s);
    }    
    if (nc.length&1 != 0) {//odd number of letters
        s = 'PTX 0';
        test_values[test_index] = 0;
        return(s);
    }    
    var buf_len = nc.length;

    best_score = 0;
	for (period = 3; period <= max_period; period++) {
        /* do encryption/decryption */
        big_step = 2*period;
        count = 0;
        score = 0;
        for (j=0;j<buf_len;j=j+big_step) 
                for (k=0;k<period;k++) {
                        c1 = nc[j+k];
                        c2 = nc[j+k+period];
                        if (j+k+period >= buf_len) break;
                        result = decode_pair(k,c1,c2)
                        if (result[0]==1 ) {
	                        	c3 = result[1];
	                        	c4 = result[2];
                                /* plaintext independent of key values*/
                                score += logdi[c3][c4];
                                count++;
                        }
        } /* next k,j */
        /* skip testing of remainder, probably won't be crucial  */
        score *= 100;
        score /= count;

        if ( score > best_score) {
                best_score = score;
                best_period = period;
        }
    } /* period */
    best_score = Math.floor(best_score);
    test_values[test_index] = best_score;
    s = 'PTX '+best_score
    return s;
}    

function get_max_nico_periodic_ic(dat) {
	var sum,i,j,l,mx,period,index,x,y,z;
    var col_len = 5;
    var block_len,limit;
	var ct=new Array()

    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 30;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not nicodemus if it has numbers or # symbol
        s = 'NIC 0';
        test_values[test_index] = 0;
        return(s);
    }    
    
	mx=0.0;

    var numb_symbols = 26;
	l= dat.length;
	for (i=0;i<=max_period;i++)
		ct[i]=new Array(numb_symbols);
	for (period = 3; period <= max_period;period++) {	
		for (i=0;i<period;i++)
			for (j=0;j<numb_symbols;j++)
				ct[i][j]=0;
        block_len = Math.floor(l / (col_len*period));
        if (block_len == 0) continue;
        limit = block_len*col_len*period; // round off to nearest multiple of period*5
		index = 0;
		for (i=0;i<limit;i++) {
			ct[index][ dat[i] ] += 1;
            if ( ((i+1)%col_len)==0)
                index = (index+1)%period
		}
		z=0.0
		for (i=0;i<period;i++) {
			x=y=0.0;
			for (j=0;j<numb_symbols;j++) {
				x += ct[i][j]*(ct[i][j]-1);
				y += ct[i][j];
			}
			if (y>1) z += x/(y*(y-1));
		}
		z = z/period;
		//per_ic[period] = 1000.0*z;
		if (z>mx) {
			mx = z;
			//max_index = period;
		}
	}
	//return 1000.0*mx
     var best_score = Math.floor(1000.0*mx);
    test_values[test_index] = best_score;
    var s = 'NIC '+best_score
    return s;
     
}

function get_phillips_ic(dat) {
	var sum,i,j,l,mx,period,index,x,y,z;
    var col_len = 5;
    var block_len,limit;
	var ct=new Array()
    var combine_alpha = [0,1,2,3,0,4,5,1];
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 31;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not nicodemus if it has numbers or # symbol
        s = 'PHIC 0';
        test_values[test_index] = 0;
        return(s);
    }    
    
	mx=0.0;

    var numb_symbols = 26;
	l= dat.length;
    period = 8;
	for (i=0;i<= period-2;i++)
		ct[i]=new Array(numb_symbols);
    
	for (i=0;i<period-2;i++){ // combine 2 of the alphbets so 6 altogether
			for (j=0;j<numb_symbols;j++)
				ct[i][j]=0;

    }
    block_len = Math.floor(l / (col_len*period));
    if (block_len == 0) {
            s = 'PHIC 0';
            test_values[test_index] = 0;
            return(s);
    }    
        
    limit = block_len*col_len*period; // round off to nearest multiple of period*5
	index = 0;
	for (i=0;i<limit;i++) {
			ct[combine_alpha[index]][ dat[i] ] += 1;
            if ( ((i+1)%col_len)==0)
                index = (index+1)%period
	}
	z=0.0
	for (i=0;i<period-2;i++) {
		x=y=0.0;
		for (j=0;j<numb_symbols;j++) {
			x += ct[i][j]*(ct[i][j]-1);
			y += ct[i][j];
	}
	if (y>1) z += x/(y*(y-1));
	}
	z = z/(period-2);

    var best_score = Math.floor(1000.0*z);
    test_values[test_index] = best_score;
    var s = 'PHIC '+best_score
    return s;
     
}

function digital_with_0(dat){ 
    var s,l1;
   var letter_index = 17; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 32;
    if (test_values[letter_index]=='Y' || test_values[hash_index]=='Y'){//not all digital if letters or # symbol
        s = 'HAS_0 N';
        test_values[test_index] = 'N';
        return(s);
    }    

    l1 ='N';
    for (i=0;i<dat.length;i++){
        c = dat[i];
        if (c == 27){
            l1 = 'Y' // has a zero
            break;
        }
    }
    s = 'HAS_0 '+l1;
    test_values[test_index] = l1;
    return(s);
}

function get_bif_dic(code,period){
    var j,i,freq;
	/*
	get Gizmo's JF 79 Bifid dic for code digits and period
	*/

	var normalizer = 25*25 ;//25 possible ciphertext letters
	var le = code.length;
	var l1 ;
	var l2 ;
	var numb = 0;
    freq = [];
    for (i=0;i<26*26;i++)
        freq[i] = 0;
    for ( j=0;j<le;j=j+period){
		if (j + period < le){
			limit = j + period;
			second_row = Math.floor(period/2);
        }
		else{
			limit = le;
			second_row = Math.floor((le-j)/2);
        }
        for (i=j;i<limit-second_row;i++)
            freq[code[i]+26*code[i+second_row]]++;
		numb += limit-second_row - j;
    }

	var sum = 0.0
    for (i=0;i<26*26;i++)
        sum += freq[i]*(freq[i]-1);
	dic = 100*normalizer * sum / (numb*(numb-1));
	return Math.floor(dic);
}

function get_bdi(dat) {
    var i,j,k,period,s;
    var score,best_score;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 33;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not nicodemus if it has numbers or # symbol
        s = 'BDI 0';
        test_values[test_index] = 0;
        return(s);
    }  
    best_score = 0;
    for (period = 3;period<=max_period;period++){
        score = get_bif_dic(dat,period);
        if (score>best_score)
            best_score = score;
    }
    s = 'BDI '+best_score;
    test_values[test_index] = best_score;
    return(s);
}    
  
var columnar_calcs = function(){
    // put pseudo-global variables in this closure 
    var code = [];
    var numb_long_cols, numb_short_cols;
    var min_start = [];
    var max_start=[];
    var max_diff=[];
    var offset=[];
    var test_len;
    var col_array=[];
    var cols_in_use=[];
    var best_col_array=[];
    var diff_array=[];
    var next_col, next_dif;
    
    var key_len, numb_rows;

    var col_pos = [];
    
    function get_best_di(col){
        var i,j,k;
        var max,sum;
        var index,dif,long_corr,short_corr;
    
        max = 0;
    
        for (j= col;j<key_len;j++) {
        long_corr = short_corr = 0;
        if ( col>=numb_long_cols && col_array[j] >= numb_short_cols)
            short_corr = 1;
        else if ( col<numb_long_cols && col_array[j] >= numb_long_cols)
            long_corr=1;	
        for (dif = short_corr;dif<=max_diff[ col_array[j] ] - long_corr ;dif++) {
            sum = 0;
            for (k=0;k<numb_rows;k++) 
                    sum += sdd[code[col_pos[ col_array[col-1]]+k+diff_array[col-1]] ] [code[col_pos[col_array[j]]+k+dif] ];		
            if ( sum > max) {
                max = sum;
                next_col = j;
                next_dif = dif;
            }
        }
        }
        return(max);
    }

    var do_col_calc = function(dat){ // return this function which can use the pseudo-global variables
        var str, alpha,out_str,c,n,i,ct,sum,c1,c2;
        var j,best_score, current_dif,index,t0,score,tn,swap;
        var normal_score,best_key_len;
        
        code = dat; // put in clsoure space so won't have to keep passing the entire array to get_best_di
        var code_len = code.length;
        for (i=0;i<max_period;i++) cols_in_use[i] = 0;
        best_score = 0;
        for (key_len = 4;key_len <= max_period;key_len++){
            numb_long_cols = code_len % key_len;
            numb_short_cols = key_len - numb_long_cols;
    //	    printf("There are %i long columns and %i short columns\n",numb_long_cols,numb_short_cols);
            /* transpose into columns */
            numb_rows = Math.floor(code_len / key_len);
            /* get min_start,max_start,max_diff*/
            min_start[0] = 0;
            n = 0;
            for (j=1;j<key_len;j++) {
                if ( n<numb_short_cols) {
                    min_start[j] = min_start[j-1]+numb_rows;
                    n++;
                }
                else {
                    min_start[j] = min_start[j-1]+numb_rows+1;
                }
            }
            max_start[0]= max_diff[0] = 0;
            n = 0;
            for (j=1;j<key_len;j++) {
                if ( n<numb_long_cols) {
                    max_start[j] = max_start[j-1]+numb_rows+1;
                    n++;
                }
                else {
                    max_start[j] = max_start[j-1]+numb_rows;
                }
                max_diff[j] = max_start[j]-min_start[j];
            }
        
            //best_score = 0;
        
            /* set column pointers to minimum for each column*/		
            for (j=0;j<key_len;j++) {
                col_pos[j] = min_start[j];
            }
            /* try all possible digraphs */
            for (t0=0;t0<key_len;t0++) {
                col_array[0] = t0;
                cols_in_use[t0] = 1;
                if (0<numb_long_cols && t0 >= numb_long_cols)
                    long_corr=1;
                else long_corr=0;
                for ( current_dif=0;current_dif <= max_diff[t0] - long_corr ;current_dif++) {	
                    diff_array[0] = current_dif;
                    index = 1;
                    for (j=0;j<key_len;j++)
                        if ( !cols_in_use[j])
                            col_array[index++] = j;
                    score = 0;
                    for (j=1;j<key_len;j++) {
                        tn = get_best_di( j);/* also sets next_col and next dif */
                        score += tn;
                        swap = col_array[next_col];
                        col_array[next_col] = col_array[j];
                        col_array[j] = swap;
                        diff_array[j] = next_dif;
                    }
                    score = Math.floor(100*score/(numb_rows*(key_len-1)));
                    if ( score > best_score ) {
                        best_score = score;
                        best_key_len = key_len;
                    }
                } /* next current_dif*/
                cols_in_use[t0] = 0;
            } // next t0
            //normal_score = Math.floor(100*best_score/(numb_rows*(key_len-1)));
            //out_str += "Best score for key length "+key_len+" is "+normal_score+"\n";
        } //next key_len
        //normal_score = Math.floor(100*best_score/(numb_rows*(best_key_len-1)));
        normal_score = best_score;
        //out_str += "Best score is "+normal_score+" for key length "+best_key_len+"\n";
        out_str = "CDD "+best_score;
        var test_index = 34;    
        test_values[test_index] = best_score;
        //document.getElementById('output_area').value = out_str;
        return(out_str);
    } // end do_cal_calc function
    return (do_col_calc); // return this function which can access pseudo_global variables
} // end columnar_calcs closure function
  
function get_cdd(dat){
    var s;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 34;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not columnar if it has numbers or # symbol
        s = 'CDD 0';
        test_values[test_index] = 0;
        return(s);
    }  

    do_col_calc = columnar_calcs(); // closure to isolate 'pseudo_global' variables
    s= do_col_calc(dat);
    return(s);
}    

var swagman_calcs = function(){
// T has compressed binary Single letter - Trigraph Discrepancy values
// had to replace \ by \\ 
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

var bstd = []

function construct_table(){
    var i,n,index,c,ze,x,j,mask;
    // read T and put it into the working binary trigraph table: bstd
    n = 26*26*26
    i = index = 0;

    ze = '0'.charCodeAt(0);
    while (i < n){
        c = T.charCodeAt(index);
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


function next_per(str,le){
	/*
	get next permutation of array str of length le
	return 0 if finished, 1 otherwise.
	*/
	if (le < 2) return (0);
	//find last element not in reverse alphabetic order
	var last = le-2;
	while (str[last] >= str[last+1]){
		if (last == 0) return(0);
		last -= 1;
    }
	// find first element that is larger than the element at last
	var fst = le-1;
	while (str[fst] <= str[last])
		fst -= 1;

	//swap these two
	var c = str[last];
	str[last] = str[fst];
	str[fst] = c;

	//put part of string at tail into ascending order
	if (str[last+1] != str[le-1] ){
		var i = 1;
		while (last+i < le -i){
			c = str[last+i];
			str[last+i] = str[le-i];
			str[le-i] = c;
			i += 1;
        }
    }
	return(1);
}

	function construct_row(row_order,swag_array,period,numb_columns){
        var i,c;
		var row = []
		var index = 0
		//for i in range(numb_columns):
        for (i=0;i<numb_columns;i++){
			c = swag_array[ row_order[index] ][i]
			//row.append(c)
            row[i] = c;
			index += 1;
			if (index == period ) index = 0;
        }
		return(row);
    }

	function score_row(row){
		var score = 0
		//for i in range(len(row)-2):
        for (var i=0;i<row.length-2;i++)
			score += bstd[row[i]+26*row[i+1]+26*26*row[i+2]];
		return score;
    }


    function swag_test(code,period){
        var i,j,index,c;
        /*
        test code digits for swagman of given period, return binary std score
        and best scoring line
        */
        var numb_columns = code.length/period; // should always be integer
        var row_order = [];
        for (i=0;i<period;i++)
            row_order[i] = i;
        var swag_array = [];
        for (i=0;i<period;i++)
            swag_array[i] = []
        index = i = 0;
        //for c in code:
        for (j=0;j<code.length;j++){
            c = code[j];
            swag_array[i][index] = c;
            i += 1;
            if (i == period ){
                index += 1;
                i = 0;
            }
        }
        var row = construct_row(row_order,swag_array,period,numb_columns)
        var score = score_row(row)
        var best_score = score
        var best_row = row
        while (next_per(row_order,row_order.length) != 0){
            row = construct_row(row_order,swag_array,period,numb_columns)
            score = score_row(row)
            if (score > best_score){
                best_score = score;
                best_row = row;
            }
        }
        var std_score = Math.floor(100*best_score / (numb_columns-2));
        var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        //l1 = convert_to_string(best_row)
        var l1 = '';
        for (i=0;i<best_row.length;i++)
            l1 += alpha.charAt(best_row[i]);
        return ([std_score,l1]);
    }
    var do_swag_calc = function(code){ // return this function which can use the pseudo-global variables
        var str, alpha,out_str,c,n,i,ct,sum,c1,c2;
        //var code_len,code;
        var code_len;
        var period, best_score, best_line,result,best_period;
       
        //out_str = 'testng'
        best_score = 0;
        best_line = '';
        for (period = 4;period <= 8;period++){
            if ( code.length % period != 0) continue;
            if (3*period*period > code.length) break; // not enough code blocks
            result = swag_test(code,period);
            if (result[0] > best_score){
                best_score = result[0];
                best_line = result[1];
                best_period = period;
             }
        }
        /*
        out_str += 'Best score is '+best_score+' for period '+best_period+' best line is: '+best_line.toLowerCase();
        document.getElementById('output_area').value = out_str;
        */
        out_str = "SSTD "+best_score;
        var test_index = 35;    
        test_values[test_index] = best_score;
        //document.getElementById('output_area').value = out_str;
        return(out_str);

    } // end do_cal_calc function
    return (do_swag_calc); // return this function which can access pseudo_global variables
} // end swagman_calcs closure function


function get_sstd(dat){
    var s;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    var test_index = 35;
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y'){//not columnar if it has numbers or # symbol
        s = 'SSTD 0';
        test_values[test_index] = 0;
        return(s);
    }  

    do_swag_calc = swagman_calcs(); // closure to isolate 'pseudo_global' variables
    s= do_swag_calc(dat);
    return(s);
}    

function get_serp(dat){
    var period,x,flag,pos,left_over,i,j;
    if ( (dat.length&1) != 0){ // odd length can't be seriated playfair
        return('N');
    }
   var code_len = dat.length;
   var final_period = max_period;
   if (final_period > 10)
    final_period = 10; // don't think aca will have a seriated pfair with period > 10
   for (period = 3;period<= final_period;period++) {
		x = Math.floor(code_len / (2*period));
		left_over = code_len - x*2*period;
		flag = 1;
		pos = 0;
		while( pos <code_len-left_over) {
            for (j=0;j<period;j++) {
                if ( dat[pos+j] == dat[pos+j+period]) {
                    flag = 0;
                    break;
                }
            }
            pos += 2*period;
		} /* end while */
		if ( left_over) {
			pos = code_len - left_over;
			for (j=0;j<Math.floor(left_over/2);j++){
	      		if ( dat[pos+j] == dat[pos+j+left_over/2]) {
					flag = 0;
					break;
				}
			}
		}
		//printf("%li ",period);
		if ( flag ) {
            return('Y'); //seriated playfair possible for this period
		}
    } /* next period */
    return('N'); // no period in range will work
}

function display_stats(dat){
var s;
    s = "Length:"+dat.length+ " IC:"+test_values[IC_index]+" MIC:"+ test_values[MIC_index];
    s += ' MKA:'+ test_values[MKA_index]+' DIC:'+ test_values[DIC_index]+' EDI:'+ test_values[EDI_index];
    s += ' LR:'+ test_values[LR_index]+' ROD:'+ test_values[ROD_index]+' LDI:'+ test_values[LDI_index];
    s +=' NOMOR:'+ test_values[NOMOR_index];
    s += '\n';
    s += 'NIC:'+test_values[NIC_index]+' PHIC:'+test_values[PHIC_index]+ ' MPIC:'+test_values[MPIC_index];
    s += ' BDI:'+test_values[BDI_index];
    s +=' SDD:'+test_values[SDD_index]+' CDD:'+test_values[CDD_index]+' SSTD:'+test_values[SSTD_index];
    s += '\n';    
    s += 'HAS_L:'+test_values[HAS_L_index]+' HAS_J:'+test_values[HAS_J_index]+' DBL:'+test_values[DBL_index];
    s += ' SERP:'+test_values[SERP_index]+' HAS_#:'+test_values[HAS_H_index]+' HAS_D:'+test_values[HAS_D_index];
    s += ' HAS_0:'+test_values[HAS_0_index];       
    s += '\n';        
    s += 'DIV_2:'+test_values[DIV_2_index]+' DIV_3:'+test_values[DIV_3_index]+' DIV_5:'+test_values[DIV_5_index];
    s += ' DIV_25:'+test_values[DIV_25_index]+' DIV_4_15:'+test_values[DIV_4_15_index];
    s +=' DIV_4_30:'+test_values[DIV_4_30_index]+' PSQ:'+test_values[PSQ_index];
    s += '\n';            
    s += 'A_LDI:'+test_values[A_LDI_index]+' B_LDI:'+test_values[B_LDI_index]+' P_LDI:'+test_values[P_LDI_index];
    s += ' S_LDI:'+test_values[S_LDI_index]+' V_LDI:'+test_values[V_LDI_index]+' PTX:'+test_values[PTX_index]
    s += ' RDI:'+test_values[RDI_index];
    s += '\n';  
    s += '(used maximum period of: '+max_period+')\n';
    
    return(s);
}
  
function do_id_test(code){
	var s,x,num_dev,n;
    var test_index;
    //document.getElementById("stats_area").style.display = "none";
    //document.getElementById("compare_area").style.display = 'block';    
	nc = convert_string(code)
	if (nc.length < 2) {
		alert("Cipher too short!")
		return
	}
	/*
    max_period = parseInt(document.getElementById('period_entry').value);
    if ( isNaN(max_period) || max_period == 0){
        alert("Maximum Period must be a positive number!");
        return;
    }
	*/
    test_index = 0;
    test_values = [];
	s = "len: "+nc.length
	x = get_ic(nc)
	//dump decimal part of x
	cipher_values[0] = x
    test_values[test_index++] = Math.floor(x);    
	s += " IC: "+cipher_values[0].toFixed(0)
	x = get_max_periodic_ic(nc)
	cipher_values[1] = x
    test_values[test_index++] = Math.floor(x);
	s += " MIC: "+cipher_values[1].toFixed(0)
	x = get_kappa(nc)
	cipher_values[2] = x
    test_values[test_index++] = Math.floor(x);
	s += " MKA: "+cipher_values[2].toFixed(0)
	x = get_dic(nc)
	cipher_values[3] = x
    test_values[test_index++] = Math.floor(x);    
	s += " DIC: "+cipher_values[3].toFixed(0)
	x = get_even_dic(nc)
	cipher_values[4] = x
    test_values[test_index++] = Math.floor(x);    
	s += " EDI: "+cipher_values[4].toFixed(0)
	x = get_LR(nc);
	cipher_values[5] = x
    test_values[test_index++] = Math.floor(x);    
	s += " LR: "+cipher_values[5].toFixed(0)
	x = get_ROD(nc);
	cipher_values[6] = x
    test_values[test_index++] = Math.floor(x);    
	s += " ROD: "+cipher_values[6].toFixed(0)
	x = get_logdi(nc);
	cipher_values[7] = x
    test_values[test_index++] = Math.floor(x);    
	s += " LDI: "+cipher_values[7].toFixed(0)
	x = get_sdd(nc);
	cipher_values[8] = x
    test_values[test_index++] = Math.floor(x);    
	s += " SDD: "+cipher_values[8].toFixed(0)
    test_values[test_index++] = 'c type';    
    //s += "\n"+test_values;
    s +="\n"+ calc_length_attributes(nc.length);
    s += "\n"+ calc_letter_digit_attributes(nc)
    s += "\n"+calc_vig_family_attributes(nc);
    s += " , "+calc_nomor(nc);
    s += " , "+calc_rev_logdi(nc);
    s += "\n"+calc_portax_logdi(nc); 
    s += " , "+get_max_nico_periodic_ic(nc)
    s += " , "+get_phillips_ic(nc)
    s += " , "+digital_with_0(nc)
    s += " , "+ get_bdi(nc);
    s += " , "+ get_cdd(nc);
    s += " , "+ get_sstd(nc);
    x = get_max_progkey_ic(nc);
    test_values[MPIC_index] = x;
    x = get_serp(nc);
    test_values[SERP_index] = x;    
    //s += "\n"+test_values;
	//document.puzzle.cipherstats.value = s // made stat display optional
    s = get_id();
	return(s);
	/*
    if (document.getElementById('show_stats').checked){
        s = display_stats(nc);
        s += '------------------------------'+out_str;
    }
    else
        s = out_str;
    //document.puzzle.cipherstats.value = s
    document.getElementById("cipherstats").value = s
*/	
}

function do_compare() {
	var s,x,num_dev,n;
    //document.getElementById("stats_area").style.display = "none";
    //document.getElementById("compare_area").style.display = 'block';    
	nc = convert_string()
	if (nc.length < 2) {
		alert("Cipher too short!")
		return
	}
    max_period = 15;
	s = "len: "+nc.length
	x = get_ic(nc)
	//dump decimal part of x
	cipher_values[0] = x
	s += " IC: "+cipher_values[0].toFixed(0)
	x = get_max_periodic_ic(nc)
	cipher_values[1] = x
	s += " MIC: "+cipher_values[1].toFixed(0)
	x = get_kappa(nc)
	cipher_values[2] = x
	s += " MKA: "+cipher_values[2].toFixed(0)
	x = get_dic(nc)
	cipher_values[3] = x
	s += " DIC: "+cipher_values[3].toFixed(0)
	x = get_even_dic(nc)
	cipher_values[4] = x
	s += " EDI: "+cipher_values[4].toFixed(0)
	x = get_LR(nc);
	cipher_values[5] = x
	s += " LR: "+cipher_values[5].toFixed(0)
	x = get_ROD(nc);
	cipher_values[6] = x
	s += " ROD: "+cipher_values[6].toFixed(0)
	x = get_logdi(nc);
	cipher_values[7] = x
	s += " LDI: "+cipher_values[7].toFixed(0)
	x = get_sdd(nc);
	cipher_values[8] = x
	s += " SDD: "+cipher_values[8].toFixed(0)
	s += "\n\nNumber of standard deviations from averages for each cipher type:\n\n"
	num_dev = get_num_dev()
	num_dev.sort(s_compare)
	for (i=0;i<num_dev.length;i++) {
		x = Number(num_dev[i][1]);
		s += num_dev[i][0]+" "+x.toFixed(0)+"\n"
	}
	//document.puzzle.cipherstats.value = s
    document.getElementById("cipherstats").value = s
}

function do_clear() {
    document.getElementById("stats_area").style.display = "none";
    document.getElementById("compare_area").style.display = 'block';
	//document.puzzle.ciphertext.value = ""	
    document.getElementById("ciphertext").value = '';
    document.getElementById("cipherstats").value = '';
	//document.puzzle.cipherstats.value = ""
    document.getElementById('period_entry').value = '15';

}

function get_symbol_count(dat) {
	var str,i,ic,l;
	var ct = [];
	
	for (i=0;i<numb_symbols;i++)
		ct[i]=0;
	l = dat.length;
	for (i=0;i<l;i++)
		ct[ dat[i] ] += 1
	str = '';
	for (i=0;i<numb_symbols;i++)
	  str += cipher_symbols[i]+'&nbsp;&nbsp;';
	str += '<br>';
	for (i=0;i<numb_symbols;i++){
	  str += ct[i]+'&nbsp;';
	  if (ct[i]<10)
	    str += '&nbsp;';
	}
	return(str)
}

function get_sorted_symbol_count(dat) {
	var str,i,ic,l;
	var ct = [];
    var combine_dat = [];
	
	for (i=0;i<numb_symbols;i++)
		ct[i]=0;
	l = dat.length;
	for (i=0;i<l;i++)
		ct[ dat[i] ] += 1
    for (i=0;i<numb_symbols;i++)
        combine_dat[i] = [cipher_symbols[i],ct[i] ];
    combine_dat.sort( function(a,b){
        return(b[1]-a[1]);
    });
    
	str = '';
	for (i=0;i<numb_symbols;i++){
      if (combine_dat[i][0] == 'J' && combine_dat[i][1] == 0) // no J's
        str += '<font color = "red">'+combine_dat[i][0]+'</font>&nbsp;&nbsp;';
      else
        str += combine_dat[i][0]+'&nbsp;&nbsp;';
    }
	str += '<br>';
	for (i=0;i<numb_symbols;i++){
	  str += combine_dat[i][1]+'&nbsp;';
	  if (combine_dat[i][1]<10)
	    str += '&nbsp;';
	}
	return(str)
}


function doubled_letters(dat){
    var l1 = '<font color = green>No</font>';
    if ( (dat.length%2) == 0) { //even length
        for (var i=0;i<dat.length;i=i+2){
            if (dat[i] == dat[i+1]){
                l1 = '<font color = red>Yes</font>';
                break;
            }
        }
    }
    return(l1);
}

function bar_graph(id,val,ref,txt){
	canvas = document.getElementById(id);
	ctx = canvas.getContext("2d");
	ctx.clearRect(0,0,2*dx,dy);
	ctx.lineWidth = 2.0;
    ctx.font = "8pt Arial";
    if ( val > 2*dx-1) val = 2*dx-1;
    if ( ref>2*dx-4) ref = 2*dx-4;
    ctx.strokeRect(0,0,2*dx,dy);
    ctx.fillStyle="green";
    ctx.fillRect(0,0,val,dy); // cipher value
    ctx.fillStyle="red";
    ctx.fillRect(ref,0,4,dy); // reference value
    ctx.fillStyle="black";
    ctx.fillRect(dx/2,15,2,3*dy/4); // reference value
    ctx.fillRect(dx,15,2,3*dy/4); // reference value
    ctx.fillRect(3*dx/2,15,2,3*dy/4); // reference value
    ctx.fillRect(dx/4,15,2,dy/2); // reference value
    ctx.fillRect(3*dx/4,15,2,dy/2); // reference value
    ctx.fillRect(5*dx/4,15,2,dy/2); // reference value
    ctx.fillRect(7*dx/4,15,2,dy/2); // reference value
    // text
    if (txt==1){
        ctx.fillText('25',dx/2-5,2.4*dy);
        ctx.fillText('50',dx-5,2.4*dy);	
        ctx.fillText('75',3*dx/2-5,2.4*dy);
    }
    else{
        ctx.fillText('250',dx/2-10,2.4*dy);
        ctx.fillText('500',dx-10,2.4*dy);	
        ctx.fillText('750',3*dx/2-10,2.4*dy);
    }        
}

function get_specific(){
var ref,str;
document.getElementById("compare_area").style.display = "none";
document.getElementById("stats_area").style.display = "block";
selected_type = document.getElementById("s_type").selectedIndex;
    nc = convert_string();
	if (nc.length < 2) {
		alert("Cipher too short!")
		return
	}
    ref = ave[0][selected_type]; // average IC of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_IC",get_ic(nc)*2*dx/100,ref,1);
    ref = ave[3][selected_type]; // average DIC of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_DIC",get_dic(nc)*2*dx/100,ref,1);
    ref = ave[1][selected_type]; // average MIC of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_MIC",get_max_periodic_ic(nc)*2*dx/100,ref,1);
    ref = ave[2][selected_type]; // average MKA of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_MKA",get_kappa(nc)*2*dx/100,ref,1);
    ref = ave[4][selected_type]; // average EDI of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_EDI",get_even_dic(nc)*2*dx/100,ref,1);
    ref = ave[5][selected_type]; // average LR of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_LR",get_LR(nc)*2*dx/100,ref,1);
    ref = ave[6][selected_type]; // average ROD of selected_type
    ref = ref*2*dx/100;
    bar_graph("canvas_ROD",get_ROD(nc)*2*dx/100,ref,1);
    ref = ave[7][selected_type]; // average log di of selected_type
    ref = ref*2*dx/1000;
    bar_graph("canvas_LDI",get_logdi(nc)*2*dx/1000,ref,0);
    ref = ave[8][selected_type]; // average sdd of selected_type
    ref = ref*2*dx/1000;
    bar_graph("canvas_SDD",get_sdd(nc)*2*dx/1000,ref,0);
    str = 'length '+nc.length+' is divisible by 1';
    for (var i=2;i<nc.length;i++){
        if ( (nc.length % i ) ==0)
            str += ", "+i;
    }
    document.getElementById("len_divisors").innerHTML = str;
    str = doubled_letters(nc)
    document.getElementById("doubled_even").innerHTML = 'Even length and doubled symbols at an even position: '+str;
    
    str = get_symbol_count(nc);
    document.getElementById("symbol_count_alphabetical").innerHTML = str;
    
    str = get_sorted_symbol_count(nc);
    document.getElementById("symbol_count_sorted").innerHTML = str;
    // reset extra stat
        str = '';
        str += '<span  style="background:AliceBlue; float:left; padding:5px; border:2px dotted black; margin:2px;height:50px; ">'
        str += '(none selected yet)<br>';
        str += '<canvas id="canvas_extra_stat" width = "200" height = "50">';
        str += '</canvas>';
        str += '</span>';
        bar_graph("canvas_extra_stat",0,0,1);
        document.getElementById("extra_pic").innerHTML = str;
    
}

function get_extra_stat(){
var n,s,i,ref,txt;
get_all_stats(); // fill test_values array.
var extra_stat_start_index = 9;
var selected_stat = document.getElementById("extra_stat").selectedIndex;
var extra_stat_value = test_values[ numerical_attributes[ selected_stat+extra_stat_start_index] ];
var out_str = '';
out_str += '<span  style="background:AliceBlue; float:left; padding:5px; border:2px dotted black; margin:2px;height:50px; ">'

out_str += extra_stat_names[selected_stat]+'<br>';

out_str += '<canvas id="canvas_extra_stat" width = "200" height = "50">';
out_str += '</canvas>';

out_str += '</span>';
document.getElementById("extra_pic").innerHTML = out_str;
s = document.getElementById("s_type")[selected_type].text;
//alert(s);
s = s.replace(/ /g,'');
//alert(s);
ref = -1;
for (i=0;i<specific_means.length;i++)
    if ( specific_means[i][0] == s)
        ref = specific_means[i][selected_stat+extra_stat_start_index+1]; // add 1 because of cipher type addition
if ( ref == -1)
    alert("Program bug. cipher types have inconsistent names");
n = extra_stat_divisors[selected_stat];
if ( n == 100) txt = 1;
else txt = 0;
bar_graph("canvas_extra_stat",extra_stat_value*2*dx/n,ref*2*dx/n,txt);

}

function get_all_stats(){ // fill test_values array
	var s,x,num_dev,n;
    var test_index;
    
	nc = convert_string()
	if (nc.length < 2) {
		alert("Cipher too short!")
		return
	}
    /*
    if (nc.length <= 100)
        max_period = 10;
    else
        max_period = 15;
    */        
    max_period = parseInt(document.getElementById('period_entry').value);
    if ( isNaN(max_period) || max_period == 0){
        alert("Maximum Period must be a positive number!");
        return;
    }
    test_index = 0;
    test_values = [];
	s = "len: "+nc.length
	x = get_ic(nc)
	//dump decimal part of x
	cipher_values[0] = x
    test_values[test_index++] = Math.floor(x);    
	s += " IC: "+cipher_values[0].toFixed(0)
	x = get_max_periodic_ic(nc)
	cipher_values[1] = x
    test_values[test_index++] = Math.floor(x);
	s += " MIC: "+cipher_values[1].toFixed(0)
	x = get_kappa(nc)
	cipher_values[2] = x
    test_values[test_index++] = Math.floor(x);
	s += " MKA: "+cipher_values[2].toFixed(0)
	x = get_dic(nc)
	cipher_values[3] = x
    test_values[test_index++] = Math.floor(x);    
	s += " DIC: "+cipher_values[3].toFixed(0)
	x = get_even_dic(nc)
	cipher_values[4] = x
    test_values[test_index++] = Math.floor(x);    
	s += " EDI: "+cipher_values[4].toFixed(0)
	x = get_LR(nc);
	cipher_values[5] = x
    test_values[test_index++] = Math.floor(x);    
	s += " LR: "+cipher_values[5].toFixed(0)
	x = get_ROD(nc);
	cipher_values[6] = x
    test_values[test_index++] = Math.floor(x);    
	s += " ROD: "+cipher_values[6].toFixed(0)
	x = get_logdi(nc);
	cipher_values[7] = x
    test_values[test_index++] = Math.floor(x);    
	s += " LDI: "+cipher_values[7].toFixed(0)
	x = get_sdd(nc);
	cipher_values[8] = x
    test_values[test_index++] = Math.floor(x);    
	s += " SDD: "+cipher_values[8].toFixed(0)
    test_values[test_index++] = 'c type';    
    //s += "\n"+test_values;
    s +="\n"+ calc_length_attributes(nc.length);
    s += "\n"+ calc_letter_digit_attributes(nc)
    s += "\n"+calc_vig_family_attributes(nc);
    s += " , "+calc_nomor(nc);
    s += " , "+calc_rev_logdi(nc);
    s += "\n"+calc_portax_logdi(nc); 
    s += " , "+get_max_nico_periodic_ic(nc)
    s += " , "+get_phillips_ic(nc)
    s += " , "+digital_with_0(nc)
    s += " , "+ get_bdi(nc);
    s += " , "+ get_cdd(nc);
    s += " , "+ get_sstd(nc);
    x = get_max_progkey_ic(nc);
    test_values[MPIC_index] = x;
    x = get_serp(nc);
    test_values[SERP_index] = x;    
	s =  get_id();
	return(s);
}

function letters_hash_digits_only(str){
	str = str.toLowerCase();
	return str.replace(/[^a-z0-9#]/g,'');
}


function do_bulk_id_test(list){
	var i,j,k,c,n,s,s1,le;
	var type;
	
	var codes = list.split('\n');
	postMessage('working...');
	final_output= '';
	le = codes.length;
	for (i=0;i<le;i++){
		code = codes[i];
		if (code=='') continue;
		final_output += code+'\n';
		s1 = letters_hash_digits_only(code);
		n = s1.length;
		if (n >= length_cutoff)
			max_period = 15;
		else
			max_period = 10;
		type = do_id_test(code);
		//type = get_all_stats();
		final_output += type+'\n';
		j = i+1;
		s = 'finished ciphertext number '+j+' out of '+le;
		s += '\n'+final_output;
		postMessage(s);
	}
	s ='Final Output\n\n'+final_output;
	postMessage(s);
	
}	

onmessage = function(event) { //receiving a message with the string to decode. do search
    var code,s;
    code = event.data.code;
		
    //str2 = event.data.str2;
    length_cutoff = parseInt(event.data.maxPeriod);
    //do_id_test(code);
	do_bulk_id_test(code)
};  



	
