var word_list_string;
var alpha = 'abcdefghijklmnopqrstuvwxyz';

function do_search(word1_pattern,word2_pattern,word3_pattern,count_only,known_letters){
    var i,j,k,n,c,s,ln,ln1,str,s1,x,s2;
    var flag;
    var kl = known_letters.split('\n');
    var known_plain_letters = kl[0].toLowerCase();
    var known_cipher_letters = kl[1].toLowerCase();

   if ( known_letters == '') // nothing entered
		known_letters = ' \n '; // use two empty lines

    // change any digits to letters a-j
    var digits = '0123456789';
    for (i=0;i<digits.length;i++){
        //c = '//'+ digits.charAt(i)+'//g'; // doesn't work, have to use RegExp()
        c = new RegExp(digits.charAt(i),'g');
        word1_pattern = word1_pattern.replace(c,alpha.charAt(i));
        word2_pattern = word2_pattern.replace(c,alpha.charAt(i));
        word3_pattern = word3_pattern.replace(c,alpha.charAt(i));
        known_cipher_letters = known_cipher_letters.replace(c,alpha.charAt(i));
    }

    var known = {};
    for (i=0;i<known_plain_letters.length;i++){
        c = known_plain_letters.charAt(i);
        n = alpha.indexOf(c);
        if ( n != -1)
            known[n] = alpha.indexOf(known_cipher_letters.charAt(i) ); // assuming plain and cipher letters in same columns.
    }  

    //console.log(word1_pattern);
    //console.log(known_cipher_letters);
    var pattern1 = [];
    word1_pattern = word1_pattern.toLowerCase();
    for (i=0;i<word1_pattern.length;i++){
        c = word1_pattern.charAt(i);
        n = alpha.indexOf(c);
        if ( n != -1)
            pattern1.push(n)
    }
    var pattern2 = [];
    word2_pattern = word2_pattern.toLowerCase();
    for (i=0;i<word2_pattern.length;i++){
        c = word2_pattern.charAt(i);
        n = alpha.indexOf(c);
        if ( n != -1)
            pattern2.push(n)
    }
    var pattern3 = [];
    word3_pattern = word3_pattern.toLowerCase();
    for (i=0;i<word3_pattern.length;i++){
        c = word3_pattern.charAt(i);
        n = alpha.indexOf(c);
        if ( n != -1)
            pattern3.push(n)
    }

    word_list = [];
    //var data = fs.readFileSync(word_list_name);
    //var words = data.toString();
	
    lines = word_list_string.split('\n');
    str = "read in "+lines.length+" lines";
    console.log(str);
    var cnt = 0;
    for(i=0;i<lines.length;i++){;
        ln = lines[i];
            if ( ln=='') continue;
    
    
        ln1 = ln.split(/[\W\r]/); // split at non-letter or carriage return
        wrd = ln1[0];
        wrd = wrd.toLowerCase();
        //word_list[cnt] = wrd;
        word_list[cnt]=[];
        for (j=0;j<wrd.length;j++){
            c = wrd.charAt(j);
            n = alpha.indexOf(c);
            if (n!=-1)
                word_list[cnt].push(n)

        }
        cnt++;
    }
    str = "\nNumber of words in word_list array: "+cnt;
    //console.log(str);
    // get matching words
    out_str = '';
    cnt = 0
    var match_list1 = [];
    for (i=0;i<word_list.length;i++){
        if (pattern1.length == word_list[i].length){
            // does word i match known pattern letters?
            flag = false;
            for (j=0;j<word_list[i].length;j++){
                n = word_list[i][j]
                if ( n in known && (pattern1[j] != known[n]) ){
                    flag = true; // doesn't match known letters
                    break;
                }
            }
            if ( flag) continue;
            if (pattern_match(pattern1,i)){
                match_list1.push(i);
                cnt++;
            }
        }
    }
    str = "Number of pattern 1 matches: "+cnt;
    console.log(str);
    out_str += str+'\n';
	postMessage(out_str);
    if (pattern2.length == 0){
        for (i=0;i<match_list1.length;i++) {
            s='';
            for (k=0;k<pattern1.length;k++) {
                s += alpha.charAt( word_list[ match_list1[i] ][k]);
            }
            if (count_only == '0')
                out_str += '\nword 1 '+s;
        }
		postMessage(out_str);
        return;

    }
    var match_list2 = [];
    if (pattern2.length>0){
        cnt = 0
        for (i=0;i<word_list.length;i++){
            if (pattern2.length == word_list[i].length){
                // does word i match known pattern letters?
                flag = false;
                for (j=0;j<word_list[i].length;j++){
                    n = word_list[i][j]
                    if ( n in known && (pattern2[j] != known[n]) ){
                        flag = true; // doesn't match known letters
                        break;
                    }
                }
                if ( flag) continue;
                if (pattern_match(pattern2,i)){
                    match_list2.push(i);
                    cnt++;
                }
            }
        }
        str = "Number of pattern 2 matches: "+cnt;
        console.log(str);
        out_str += str+'\n'
    }
    var match_list3 = [];

    if (pattern3.length>0){
        cnt = 0
        for (i=0;i<word_list.length;i++){
            if (pattern3.length == word_list[i].length){
                // does word i match known pattern letters?
                flag = false;
                for (j=0;j<word_list[i].length;j++){
                    n = word_list[i][j]
                    if ( n in known && (pattern3[j] != known[n]) ){
                        flag = true; // doesn't match known letters
                        break;
                    }
                }
                if ( flag) continue;
                if (pattern_match(pattern3,i)){
                    match_list3.push(i);
                    cnt++;
                }
            }
        }
        str = "Number of pattern 3 matches: "+cnt;
        console.log(str);
        out_str += str+'\n'
    }
    //out_str = '';
    // get cross matches
    cnt = 0;
    
    for (i=0;i<match_list1.length;i++)
        for (j=0;j<match_list2.length; j++)
        if ( cross_match(match_list1[i],match_list2[j],pattern1,pattern2)){
            if (pattern3.length==0) {
                s='';
                for (k=0;k<pattern1.length;k++)
                    s += alpha.charAt( word_list[ match_list1[i] ][k]);
                s1 = '';
                for (k=0;k<pattern2.length;k++)
                    s1 += alpha.charAt( word_list[ match_list2[j] ][k]);
                cnt++
                //out_str += 'word 1 '+s+', word 2 '+s1+'\n';
                if (count_only == '0')
                    out_str += '\nword 1 '+s+', word 2 '+s1;
            }
            else {
                for (x=0;x<match_list3.length;x++)
                if ( cross_match(match_list1[i],match_list3[x],pattern1,pattern3) &&
                        cross_match(match_list2[j],match_list3[x],pattern2,pattern3)) {
                    s='';
                    for (k=0;k<pattern1.length;k++)
                        s += alpha.charAt( word_list[ match_list1[i] ][k]);
                    s1 = '';
                    for (k=0;k<pattern2.length;k++)
                        s1 += alpha.charAt( word_list[ match_list2[j] ][k]);
                    s2 = '';
                    for (k=0;k<pattern3.length;k++)
                        s2 += alpha.charAt( word_list[ match_list3[x] ][k]);
            
                    cnt++
                    //out_str += 'word 1 '+s+', word 2 '+s1+', word 3 '+s2+'\n';
                    if (count_only == '0')
                    out_str += '\nword 1 '+s+', word 2 '+s1+', word 3 '+s2;


                    
                }
        
            }
        }
            
        //}
        s = "number of cross matches is "+cnt;
        console.log(s);
        out_str += '\n\n'+s+'\n'
        //console.log(out_str);
		postMessage(out_str);

}

function pattern_match(pattern,word_numb){ // word lengths alreaady match
    var i,j,c,n;

    for (i=0;i<pattern.length-1;i++)
       for (j=i+1;j<pattern.length;j++)
        if (word_list[word_numb][i] == word_list[word_numb][j] && pattern[i] != pattern[j])
             return(false);

    return(true); // match
}

function cross_match(w1,w2,pat1,pat2){//w1,w2 word list indices,pat1,pat2 are pattern arrays
    var i,j;
    var key1 = [];
    var key2 = [];
    for (i=0;i<26;i++)
        key1[i] = key2[i] = -1;

    for (i=0;i<pat1.length;i++)
        key1[ word_list[w1][i] ] = pat1[i];
    for (i=0;i<pat2.length;i++)
        key2[ word_list[w2][i] ] = pat2[i];
    for (i=0;i<26;i++){
        if (key1[i]!= -1 && key2[i] != -1 && key1[i] != key2[i] )
            return(false)
    }
    return(true);
}

onmessage = function(event) { //receiving a message
	var str,s;

  debugger;  
  var state = event.data.op_choice;
  if ( state == 1){ // word list
    word_list_string = event.data.str;
    //search_word_list(word_list_array);  // set up word list
	postMessage("word list received")
  }
  else if (state == 2){
    //word_pattern_string = event.data.str;
	/*
    str = event.data.pat1;
	str += ','+event.data.pat2;
	str += ','+event.data.pat3;
	str += ','+event.data.count_only;	
	str += ','+event.data.known_letters;	
    do_search(str);
	*/
	do_search( event.data.pat1,event.data.pat2,event.data.pat3,event.data.count_only,event.data.known_letters );
  }
}
