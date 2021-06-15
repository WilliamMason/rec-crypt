
// each tree stage has one key that has one or two values. If one value that's the cipher type we are looking for
// if two values they are the 'above' and 'below" cut_off keys or 'Y' and 'N'. These values, in turn, are the next //subtrees

var ctype_xlate = 
{'Twosquarespiral': 'Two_square', 'Morbit': 'Morbit', 'Trisquare': 'Trisquare', 'Nicodemus': 'Nicodemus', 'Grandpre': 'Grandpre', 'Plaintext': 'Plaintext', 'Phillips': 'Phillips', 'Gromark': 'Gromark', 'Nihilistsub': 'Nihilistsub', 'Grille': 'Grille', 'Progressivekey7': 'Progressivekey', 'Columnar': 'Columnar', 'Beaufort7': 'Beaufort', 'Randomtext': 'Randomtext', 'Portax': 'Portax', 'Homophonic': 'Homophonic', 'Bazeries': 'Bazeries', 'PatristocratK3': 'Patristocrat', 'Cmbifid7': 'Cmbifid', 'Randomdigit': 'Randomdigit', 'Amsco': 'Amsco', 'Myszkowski': 'Myszkowski', 'Cadenus': 'Cadenus', 'Pollux': 'Pollux', 'Vigenere': 'Vigenere/Variant', 'RunningKey': 'RunningKey', 'Redefence': 'Redefence', 'Tridigital': 'Tridigital', 'Playfair': 'Playfair', 'Vigenere7': 'Vigenere/Variant', 'Four_square': 'Four_square', 'Periodic_gromark': 'Periodic_gromark', 'MonomeDinome': 'MonomeDinome', 'Porta': 'Porta', 'Ragbaby': 'Ragbaby', '6x6Bifid7': '6x6Bifid', 'Swagman5': 'Swagman', 'DoubleCheckerBoard': 'CheckerBoard', 'Bifid6': 'Bifid', 'NilhilistTransp': 'NihilistTransp', '6x6Playfair': '6x6Playfair', 'Progkey7beau': 'Progressivekey', 'Gronsfeld': 'Vigenere/Variant', 'Two_square': 'Two_square', 'Seriatedpfair7': 'Seriated_pfair', 'Bifid7': 'Bifid', 'Vigautokey': 'Autokey', 'Quagmire4': 'Quagmire', 'FracMorse': 'FracMorse', 'Quagmire2': 'Quagmire', 'Quagmire3': 'Quagmire', 'Trifid7': 'Trifid', 'RouteTransp': 'RouteTransp', 'Vigslidefair7': 'Slidefair', 'Digrafid5': 'Digrafid', 'TrisquareHR': 'Trisquare'};


//var original_attributes = ['IC','MIC','MKA','DIC','EDI','LR','ROD','LDI','SDD','Cipher_type',
//'DIV_2', 'DIV_3', 'DIV_5', 'DIV_25', 'DIV_4_15', 'DIV_4_30','PSQ']

//original_attributes = ['IC','MIC','MKA','DIC','EDI','LR','ROD','LDI','SDD','Cipher_type',
//'DIV_2', 'DIV_3', 'DIV_5', 'DIV_25', 'DIV_4_15', 'DIV_4_30','PSQ','HAS_L','HAS_D','HAS_J','HAS_H','DBL']
var original_attributes = ['IC','MIC','MKA','DIC','EDI','LR','ROD','LDI','SDD','Cipher_type',
'DIV_2', 'DIV_3', 'DIV_5', 'DIV_25', 'DIV_4_15', 'DIV_4_30','PSQ','HAS_L','HAS_D','HAS_J','HAS_H','DBL','A_LDI','B_LDI','P_LDI','S_LDI','V_LDI','NOMOR','RDI','PTX','NIC','PHIC','HAS_0','BDI','CDD','SSTD','MPIC','SERP']


var cipher_type_index = 9

var available_attributes = [];
for (var i=0;i<original_attributes.length;i++)
    available_attributes[i] = i;

//var numerical_attributes = available_attributes.slice(0,9)+available_attributes.slice(22,32);
var numerical_attributes = [0,1,2,3,4,5,6,7,8,22,23,24,25,26,27,28,29,30,31,33,34,35,36];


var answers = {}

var out_str = '';

function traverse_tree(next_tree){
    var ans,li,stage0, indx0,ke,s,s1;
    var subtree,subkey0,subkey1;
    var keys,subkeys;
    
    if ( (typeof next_tree) == 'string'){ //next_tree is a string not a dictionary!
        out_str +=  "Decision time, best guess is: "+next_tree+"\n"; //this is the cipher type
        out_str += "===================\n";
        li = next_tree.split('.') // cipher name always ends in a period.
        ans = li[0]
        ans = ctype_xlate[ans] // put into slightly smaller groups
        if (ans in answers)
            answers[ans] += 1;
        else
            answers[ans] = 1;
        return;
    }

    keys = []
    for (ke in next_tree) // actually next_tree has just one key
        keys[keys.length] = ke;
    stage0 = keys[0];
    indx0 = parseInt(stage0); // convert to integer to use as index to stat label

    out_str += "testing "+original_attributes[indx0]+"\n";
    subtree = next_tree[stage0]
    
      if (numerical_attributes.indexOf(indx0) != -1){ // stat is numeric, not Y/N
        keys = [];
        for (ke in subtree) 
            keys[keys.length] = ke;
        subkey0 = keys[0]; //string of form attribute "above"["below"]  cut_off
        subkey1 = keys[1];
        out_str +=  "Value for test cipher is: "+test_values[indx0];
        s = subkey0;
        s1 = s.split(' ');
        cut_off = Math.floor(s1[2])

        out_str += ", cut off value is "+cut_off;
        if (test_values[indx0] >= cut_off){
            //print " is above ",
            if (s1[1]=='above' ){
                //print " go to key0 tree"
                out_str += "------>\n";
                traverse_tree(subtree[subkey0]);
            }
            else{
                //print "go to key1 tree"
                out_str += "------>\n";                
                traverse_tree(subtree[subkey1]);
            }
        }
       else {
            //print " is below ",
            if (s1[1]=='above') {
                //print " go to key1 tree"
                out_str += "------>\n";                                
                traverse_tree(subtree[subkey1])
            }
            else {
                //print "go to key0 tree"
                out_str += "------>\n"
                traverse_tree(subtree[subkey0]);
            }
      }
      }
      else{ // stat is Y/N, not numeric
        keys = [];
        for (ke in subtree)
            keys[keys.length] = ke;
        subkey0 = keys[0] // string of form attribute: "Y" or "N"
        subkey1 = keys[1]
        
        out_str +=  "Value for test cipher is: "+test_values[indx0];
        s = subkey0;
        s1 = s.split(' ');
        answer = s1[1];
        //print ",  left branch if ",answer
        out_str += ",  left branch if "+answer;
        if (test_values[indx0] ==answer){
                out_str += "------>\n";                  
            traverse_tree(subtree[subkey0]);
        }
        else {
            //print "go to key1 tree"
            out_str += "------>\n";                              
            traverse_tree(subtree[subkey1]);
        }
        }

}            


function get_id(){
var n, an;

out_str = '';
answers = {};

//trees = [tree1,tree2,tree3,tree4,tree5,tree6,tree7,tree8,tree9,tree10,tree11,tree12,tree13,tree14,tree15]
//trees = [tree1,tree2,tree3,tree4,tree5]
// "trees" array now defined in decision_trees.js file
out_str += "Q&A Dialogues\n";
for (var i=0;i<trees.length;i++){
    test_tree = trees[i];
    n = i+1;
    out_str += 'Decision tree: '+n+'\n';
    traverse_tree(test_tree);
}    
max = 0
for (ans in answers){
    if (answers[ans] > max){
        max = answers[ans];
        c_type = ans;
    }
    else if (answers[ans] == max){
        c_type += ' or '+ans
    }
} 

return(c_type); // want just the winner no other data.
/*
var result_str ='';

//result_str += "------------------\n"        
result_str += "\n"        
result_str += "Winner is "+ c_type+" with "+max+" votes out of "+trees.length+"\n\n"

//answers.sort(s_compare);
result_str += "vote distribution:\n"

for (an in answers)
    result_str += an+' '+answers[an]+'\n';
result_str += '\n'; 

var ans_array =[];
for (an in answers)
    ans_array.push( [an,answers[an]] );
ans_array.sort(function(a,b){return b[1]-a[1]});
for (i=0;i<ans_array.length;i++)
    result_str += ans_array[i][0]+' '+ans_array[i][1]+'\n';
result_str += '\n';

if (document.getElementById('show_dialogues').checked)
    out_str = result_str+out_str;
else     
    out_str = result_str
return; // out_str is a global variable, don't need to pass it back
*/
}
