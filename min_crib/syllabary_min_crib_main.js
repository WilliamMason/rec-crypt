// find crib of minimum length that has a unique property, default property: only one place it will fit
// or only one place with selected minimum number of repeated symbols.
// also can specify minimum percent of plaintext covered by letters in the crib.


var worker_started = false;
var hworker;

var symbols = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var code;
var plain = [];
var crib = [];
var freq;
var code_array;

var skip_index; // number of letters at the beginning of plaintext to skip
var min_crib_len, min_pos, min_rep;
var starting_crib_len;

var known_keysquare_flag = false;
var caesar_shift_flag = false;
var crib_str;
var digits = '0123456789';
var EMPTY = '-1';
var FAIL = [-1,-1];

var english_basic_key = ["a","1","al","an","and","ar","are","as","at","ate",
"ati","b","2","be","c","3","ca","ce","co","com",
"d","4","da","de","e","5","ea","ed","en","ent",
"er","ere","ers","es","est","f","6","g","7","h",
"8","has","he","i","9","in","ing","ion","is","it",
"ive","j","0","k","l","la","le","m","me","n",
"nd","ne","nt","o","of","on","or","ou","p","q",
"r","ra","re","red","res","ri","ro","s","se","sh",
"st","sto","t","te","ted","ter","th","the","thi","thr",
"ti","to","u","v","ve","w","we","x","y","z"]

var french_basic_key = ["a","1","ai","ais","ait","an","ans","ar","as","b",
"2","c","3","ce","d","4","dan","de","del","des",
"du","e","5","ed","ede","el","ell","em","eme","en",
"ent","er","es","ese","est","eur","f","6","g","7",
"ge","h","8","i","9","ie","ion","it","j","0",
"k","l","la","le","les","lle","m","me","men","n",
"ne","no","non","ns","nt","o","on","ont","ou","oui",
"our","ous","p","par","q","qu","que","qui","r","re",
"res","s","se","sse","t","te","ti","tio","tre","tte",
"u","ui","un","une","ur","v","w","x","y","z"];

var german_basic_key = ["a","1","ab","aht","als","am","an","au","auf","b",
"2","be","ben","ber","c","3","ch","che","cht","d",
"4","da","de","den","der","des","di","die","du","e",
"5","ei","ein","el","en","end","er","f","6","g",
"7","ge","gen","h","8","ha","he","hen","i","9",
"ich","ie","in","isc","ist","it","j","0","k","l",
"m","mi","mit","n","nd","nde","ne","no","ns","nur",
"o","ob","p","q","r","rch","re","s","sch","se",
"st","t","te","ten","u","ue","um","un","und","ung",
"v","von","w","war","was","wo","x","y","z","zu"];

var italian_basic_key = ["a","1","al","an","ar","ato","b","2","c","3",
"ca","che","ci","co","d","4","da","de","di","e",
"5","el","en","er","es","et","f","6","g","7",
"gi","h","8","i","9","ia","ic","il","in","ion",
"is","it","j","0","k","l","la","le","li","ll",
"lo","m","ma","me","mi","mo","n","na","ne","ni",
"no","nte","o","ol","on","or","os","p","pa","per",
"pr","q","qu","r","ra","re","ri","ro","s","sa",
"se","si","so","ss","st","t","ta","te","ti","to",
"tr","tt","u","un","v","w","x","y","z","zio"];

var spanish_basic_key = ["a","1","ad","ado","al","aqu","ar","ara","as","b",
"2","c","3","ci","cio","co","con","d","4","de",
"del","di","e","5","ede","el","en","er","es","est",
"f","6","g","7","h","8","hay","i","9","io",
"ist","j","0","k","l","la","las","lo","los","m",
"mas","me","mi","muy","n","nei","no","non","nte","o",
"on","or","os","osa","p","per","por","q","qu","que",
"r","ra","re","res","s","sde","se","ser","si","sin",
"son","st","su","sus","t","ta","te","ti","tu","u",
"ue","un","una","uno","v","va","w","x","y","z"];

var latin_basic_key = ["a", "1", "ad", "ae", "am", "ant", "as", "at", "ati", "atu",
"b", "2", "bus", "c", "3", "con", "cum", "d", "4", "e",
"5", "em", "ent", "equ", "er", "era", "eri", "es", "et", "ex",
"f", "6", "g", "7", "h", "8", "i", "9", "ia", "ibu",
"in", "io", "ion", "is", "iss", "it", "ita", "itu", "j","0",
"k", "l", "m", "n", "ne", "nt", "o","os","p","per",
"pro",'q', "qua", "que", "qui", "quo", "r", "ra", "rat", "re",
"ri", "rum", "s", "se", "si", "sse", "str", "t", "ta", "tat",
"te", "ter", "ti", "tis", "to", "tum", "tur", "u","ua", "ui",
"um", "unt", "ur", "us", "ut", "v", "w", "x", "y", "z"];

var basic_key = english_basic_key;

function setup_code_pairs() {
	var i,j,state;
	
	data = document.getElementById("cipher_area").value;
    data = data.toUpperCase();
    data = data.replace(/Ø/g,'0');
	state=0;
	code = '';
	for (i=0;i<data.length;i++) {
		c = data.charAt(i);
		if ( digits.indexOf(c) >-1) {
			if (state==0) {
				code = code+c;
				state=1;
			}
			else {
				code = code+c+' ';
				state=0;
			}
		}
	}
	if (state==1) {
		alert("Cipher has odd number of digits!");
		return(false);
	}
    if (code == ''){
		alert("No digits in ciphertext!");
		return(false);
	}
	code_array = code.split(' ');
    freq = {};
    for (i=0;i<code_array.length;i++){
        c = code_array[i];
        if (c in freq)
            freq[c]++;
        else
            freq[c] = 1;
    }
    return(true);
}

function initialize_worker(){
    var s1,s2,s3
    
   hworker = new Worker('syllabary_min_crib_worker.js');
   hworker.onmessage = function (event) {
    s1 = event.data.s1;
    s2 = event.data.s2;
    if ( s1 =="temp")
        s3 = "current best\n"+s2;
    else
        s3 = "final result\n"+s2;
    document.getElementById('output_area').value = s3;
    
    }
    worker_started = true;
}

function do_calc(){
	var str, alpha,out_str,c,n,cnt,i,j;
    var current_pos,crib_len,numb_positions,start_pos;
    var minimum_repeats, match_pos,nr;
    var result, cov, min_coverage, current_coverage;
    var xfer;
    
    if( !setup_code_pairs() ) return;
    xfer = {};
    xfer["code_array"] = code_array;
    xfer["freq"] = freq;
    xfer["basic_key"] = basic_key;
	alpha="abcdefghijklmnopqrstuvwxyz0123456789";
	out_str="";
	
	str = document.getElementById('plain_area').value;
	str = str.toLowerCase();
    cnt = 0;
    plain = [];
	for (var i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			plain[cnt++] = n;
	}
    if ( plain.length < code_array.length){
        alert("Plaintext shorter than codetext!");
        return;
    }
    xfer["plain"] = plain;
    if ( !worker_started )
        initialize_worker();
    if (document.getElementById("known_key").checked)
      known_keysquare_flag = true; // global var
    else
      known_keysquare_flag = false;   
    xfer["known_keysquare_flag"] = known_keysquare_flag;
    if (document.getElementById("c_shift").checked)
      caesar_shift_flag = true; // global var
    else
      caesar_shift_flag = false;   
    xfer["caesar_shift_flag"] = caesar_shift_flag;
    
    //skip_index = parseInt(document.getElementById('skip_amount').value);
    xfer["skip_index"] = document.getElementById('skip_amount').value; // string value
    starting_crib_len = 5;
    //minimum_repeats = parseInt(document.getElementById('rep_amount').value); 
    xfer["minimum_repeats"] = document.getElementById('rep_amount').value; // string vlaue
    //min_coverage = parseInt(document.getElementById('crib_amount').value);
    xfer["min_coverage"] = document.getElementById('crib_amount').value; // string value
    hworker.postMessage(xfer);
    document.getElementById('output_area').value = "Working  . . .";
}


function switch_basic_block(){
    if (document.getElementById('english').checked)
        basic_key = english_basic_key;
    else if (document.getElementById('french').checked)
        basic_key = french_basic_key;
    else if (document.getElementById('german').checked)
        basic_key = german_basic_key;
    else if (document.getElementById('italian').checked)
        basic_key = italian_basic_key;
    else if (document.getElementById('spanish').checked)
        basic_key = spanish_basic_key;
    else if (document.getElementById('latin').checked)
        basic_key = latin_basic_key;
}

function halt_search(){
    hworker.terminate();
    worker_started = false;
    alert("Search halted");
}

onload=function(){
    document.getElementById('do_calc').addEventListener("click",do_calc); 
    document.getElementById('halt_search').addEventListener("click",halt_search); 
    document.getElementById('english').addEventListener("click",switch_basic_block); 
    document.getElementById('french').addEventListener("click",switch_basic_block); 
    document.getElementById('german').addEventListener("click",switch_basic_block); 
    document.getElementById('italian').addEventListener("click",switch_basic_block); 
    document.getElementById('spanish').addEventListener("click",switch_basic_block); 
    document.getElementById('latin').addEventListener("click",switch_basic_block); 
}
