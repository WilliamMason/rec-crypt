importScripts("shiffman_bias_weights_random_database.js"); 

// used modified Matrix and neural net routines from Daniel Shiffman
// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// Based on "Make Your Own Neural Network" by Tariq Rashid
// https://github.com/makeyourownneuralnetwork/

// This is my own ridiculous Matrix implemenation
// Would probably make more sense to use math.js or something else!
class Matrix {

// Make a matrix full of zeros
constructor(rows, cols) {
  this.rows = rows;
  this.cols = cols;
  this.data = new Array(rows);
  for (var i = 0; i < this.rows; i++) {
    this.data[i] = new Array(cols);
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = 0;
    }
  }
}

// This fills the matrix with random values
randomize() {
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      this.data[i][j] = Math.random()*2-1;
      //this.data[i][j] = randomGaussian();
      //this.data[i][j] = random(-1, 1);
    }
  }
}

// Take the matrix and make it a 1 dimensional array
toArray() {
  // Add all the values to the array
  var arr = [];
  for (var i = 0; i < this.rows; i++) {
    for (var j = 0; j < this.cols; j++) {
      arr.push(this.data[i][j]);
    }
  }
  return arr;
}


// This transposes a matrix
// rows X cols --> cols X rows
transpose() {
  var result = new Matrix(this.cols, this.rows);
  for (var i = 0; i < result.rows; i++) {
    for (var j = 0; j < result.cols; j++) {
      result.data[i][j] = this.data[j][i];
    }
  }
  return result;
}

// This makes a copy of the matrix
copy() {
  var result = new Matrix(this.rows, this.cols);
  for (var i = 0; i < result.rows; i++) {
    for (var j = 0; j < result.cols; j++) {
      result.data[i][j] = this.data[i][j];
    }
  }
  return result;
}

/*
// This adds a single value to each element
add(other) {
  // Are we trying to add a Matrix?
  if (other instanceof Matrix) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += other.data[i][j];
      }
    }
    // Or just a single scalar value?
  } else {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += other;
      }
    }
  }
}
*/

// a scalar multiply
multiply(other) {
    // Or just a single scalar value?

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] *= other;
      }
    }

}

map(fn) {

   for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] = fn(this.data[i][j]) ;
      }
    }

}


static multiply(a,b){
  if (a.cols != b.rows) {
    console.log("Incompatible matrix sizes!");
    return;
  }
  // Make a new matrix
  var result = new Matrix(a.rows, b.cols);
  for (let i = 0; i < a.rows; i++) {
    for (let j = 0; j < b.cols; j++) {
      // Sum all the rows of A times columns of B
      var sum = 0;
      for (var k = 0; k < a.cols; k++) {
        sum += a.data[i][k] * b.data[k][j];
      }
      // New value
      result.data[i][j] = sum;
    }
  }
  return result;

}

static add(a,b){
  // Make a new matrix
  var result = new Matrix(a.rows, a.cols);
  for (let i = 0; i < result.rows; i++) {
    for (let j = 0; j < result.cols; j++) {
      result.data[i][j] = a.data[i][j] + b.data[i][j];
    }
  }
  return result;

}


static fromArray(ar){
    let m = new Matrix(ar.length,1);
    for (let i = 0; i<ar.length;i++)
        m.data[i][0] = ar[i];
    return(m);
}

} // end Matrix class


class NeuralNetwork{

/*
 constructor(input_nodes,hidden_nodes,output_nodes){
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;
    this.weights_ih = new Matrix(this.hidden_nodes,this.input_nodes);
    this.weights_ho = new Matrix(this.output_nodes,this.hidden_nodes);
    this.weights_ih.randomize();
    this.weights_ho.randomize();
    this.bias_h = new Matrix(this.hidden_nodes,1);
    this.bias_o = new Matrix(this.output_nodes,1);
    this.bias_h.randomize();
    this.bias_o.randomize();
    
 }
*/
 constructor(input_nodes,hidden_nodes,output_nodes,weights_ih,weights_ho,bias_h,bias_o){
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;
    this.weights_ih = weights_ih;
    this.weights_ho = weights_ho
    this.bias_h = bias_h;
    this.bias_o = bias_o;
    
 }

 feedforward(input_array){
 
    // generate hidden outputs
    let inputs = Matrix.fromArray(input_array);
    let hidden = Matrix.multiply(this.weights_ih,inputs);
    //hidden.add(this.bias_h);
    hidden = Matrix.add(hidden,this.bias_h);
    hidden.map(relu);
    // generate final output
    let output = Matrix.multiply(this.weights_ho,hidden);
    //output.add(this.bias_o)
    output = Matrix.add(output,this.bias_o);
    //output.map(sigmoid);
    output.map(softmax);
    let ar = output.toArray();
    return( ar );
 }
 
 
} // end neural network class

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


var test_values;
var normalized_test_values;

var cipher_name_normalized_order = ["6x6bifid","6x6playfair","amsco","Autokey","Bazeries","Beaufort","bifid","cadenus","checkerboard","cmBifid","columnar", "CONDI","digrafid","foursquare","fractionatedMorse","Grandpre","grille","Gromark","homophonic","keyphrase","monomeDinome","morbit","myszkowski","nicodemus","nihilistSub","NihilistSub6x6","nihilistTramp","numberedKey","simplesubstitution","periodicGromark","phillips","playfair","pollux","porta","portax","progressiveKey","Quagmire","ragbaby","redefence","routeTramp","runningKey","sequenceTramp","seriatedPlayfair","Swagman","syllabary","tridigital","trifid","trisquare","twosquare","Vigenere/Variant","Slidefair" ];



var max_period = 15;

var numerical_attributes = [0,1,2,3,4,5,6,7,8,22,23,24,25,26,27,28,29,30,31,33,34,35,36,38,39,41,42,43,44,46];
/*
Average for index IC is 58.58
Average for index MIC is 71.59
Average for index MKA is 88.98
Average for index DIC is 50.59
Average for index EDI is 58.85
Average for index LR is 12.53
Average for index ROD is 45.48
Average for index LDI is 427.62
Average for index SDD is 103.70
Average for index A_LDI is 504.13
Average for index B_LDI is 510.24
Average for index P_LDI is 491.42
Average for index S_LDI is 314.89
Average for index V_LDI is 524.02
Average for index NOMOR is 130.23
Average for index RDI is 244.75
Average for index PTX is 231.48
Average for index NIC is 44.55
Average for index PHIC is 39.09
Average for index BDI is 211.64
Average for index CDD is 188.70
Average for index SSTD is 25.25
Average for index MPIC is 46.57
Average for index ROUTE_BSTD is 0.15
Average for index MYSZ_BSTD is 0.29
Average for index VIG_VAR_DC is 0.31
Average for index STD_DC is 0.39
Average for index CHI_SQ is 243.00
Average for index PROGKEY_LDI is 502.50

Standard deviation for index IC is 27.21
Standard deviation for index MIC is 31.62
Standard deviation for index MKA is 35.10
Standard deviation for index DIC is 56.26
Standard deviation for index EDI is 66.68
Standard deviation for index LR is 10.48
Standard deviation for index ROD is 12.65
Standard deviation for index LDI is 201.66
Standard deviation for index SDD is 54.85
Standard deviation for index A_LDI is 269.28
Standard deviation for index B_LDI is 270.81
Standard deviation for index P_LDI is 260.55
Standard deviation for index S_LDI is 331.93
Standard deviation for index V_LDI is 278.26
Standard deviation for index NOMOR is 90.12
Standard deviation for index RDI is 263.10
Standard deviation for index PTX is 244.41
Standard deviation for index NIC is 26.49
Standard deviation for index PHIC is 23.68
Standard deviation for index BDI is 173.01
Standard deviation for index CDD is 110.09
Standard deviation for index SSTD is 24.23
Standard deviation for index MPIC is 27.32
Standard deviation for index ROUTE_BSTD is 0.21
Standard deviation for index MYSZ_BSTD is 0.26
Standard deviation for index VIG_VAR_DC is 0.17
Standard deviation for index STD_DC is 0.30
Standard deviation for index CHI_SQ is 132.09
Standard deviation for index PROGKEY_LDI is 266.79
*/
numerical_averages = [ 58.58,71.59,88.98,50.59,58.85,12.53,45.48,427.62,103.70,504.13,
510.24,491.42,314.89,524.02,130.23,244.75,231.48,44.55,39.09,211.64,188.70,25.25,46.57,0.15,0.29,0.31,0.39,243.00,502.50,429.58];
numerical_std_devs = [27.21,31.62,35.10,56.26,66.68,10.48,12.65,201.66,54.85,269.28,
270.81,260.55,331.93,278.26,90.12,263.10,244.41,26.49,23.68,173.01,110.09,24.23,27.32,0.21,0.26,0.17,0.30,132.09,266.79,255.65]; 

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
var ROUTE_BSTD_index = 38;
var MYSZ_BSTD_index = 39;
var NO_KEY_REPEATS_index = 40;

var VIG_VAR_DC_index = 41;
var STD_DC_index = 42;
// now the not used area:
var CHI_SQ_index = 43
var PROGKEY_LDI_index = 44;
var REDEF_PAT_index = 45;
var GRO_BT_index = 46;
var NSP_index = 47;

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
    //code = db_element.ciphertext;
    code = code.replace(/\n/g,' ');
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
	return 1000.0*mx
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
        
        /*
        alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        out_str="";
        code = [];
        code_len = 0;
        str = document.getElementById('input_area').value;
        str = str.toUpperCase();
        for (i=0;i<str.length;i++){
            c = str.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0) {
                    code[code_len++] = n
            }
        }
        if ( code_len == 0){
            alert("No letters entered!");
            return;
        }
        */
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
       
        /*
        alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        out_str="";
        code = [];
        code_len = 0;
        str = document.getElementById('input_area').value;
        str = str.toUpperCase();
        for (i=0;i<str.length;i++){
            c = str.charAt(i);
            n = alpha.indexOf(c);
            if ( n>=0) {
                    code[code_len++] = n
            }
        }
        if ( code_len == 0){
            alert("No letters entered!");
            return;
        }
        */
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

function get_nsp(dat){ // possible nihilist sub periods
    var code, code_len, state, sq_size, period,cycle,i,j,k,key,flag,pos,x,y;
    var min_per = 2;
    var has_letter_index = 17; // assume presence of letters in code already calculated
    
    if ( test_values[has_letter_index]=='Y')
        return('N'); // not numerical cipher
        
     if ( (dat.length%2) != 0)  //odd length
        return('N'); // can't divide into numerical pairs
    // dat entries for '0'-'9' got from 27 to 36
   	code = [];
    code_len = 0;
    state = 0;
	for (i=0;i<dat.length;i++){
            n = dat[i] - 27; // put into range 0-9
            if (state == 0) {
                n1 = n;
                state = 1;
            }
            else {
                code[code_len++] = 10*n1+n;
                state = 0;
            }

	}
    sq_size = 5;
     for (period = min_per;period<= max_period;period++) {
        for (cycle = 0;cycle<period;cycle++) {
            for (j= 1;j<= sq_size;j++) {
                for (k= 1;k<= sq_size;k++) {
                    key = 10*j+k;
                    flag = 1;
                        pos = cycle;
                        while( pos<code_len) {
                            n = code[pos];
                            //if ( n<11) n += 100;
                            //n -= key;
                            n = (100+n-key)%100;                                
                            x = Math.floor(n / 10);
                            y = n % 10;
                            if ( x< 1 || x > sq_size || y<1 || y > sq_size) {
                                flag = 0;
                                 break;
                            }
                            pos += period;
                        } /* end while */
                        if ( flag )
                                break;
                } /* next k */
                if ( flag)
                        break;
            } /* next j */
            if ( !flag) {
                //printf("No possible key for period %li \n",period);
                break;
            }
        } /* next cycle */
        if ( flag)
            //printf("\tPeriod %li is possible!\n",period);
            //out_str += "Period "+period+" is possible.\n";
            return('Y');
    } /* next period */

    return('N'); // period up to max_period;

}

function get_chain(dat,chain_start) {
        var i,j,k,index;
        var sum,count;
        var score,v,w;
        var sum_rows = [];
        var sum_columns = [];
        var freq_m = [];
        var chain = [];
        var p_len = 5;
        
        for (i=0;i<26;i++)
            freq_m[i] = [];
        for (i=0;i<10;i++)
            sum_rows[i] = 0;
        for (i=0;i<26;i++)
            sum_columns[i] = 0;
        for (index = 0;index<p_len;index++)
                chain[index] = chain_start[index];
        for (j = 0;j<dat.length-p_len;j++)
                chain[j+p_len] = (chain[j]+chain[j+1]) % 10;

        for (i=0;i<26;i++) for(j=0;j<10;j++)
            freq_m[i][j] = 0;
        for (j=0;j<dat.length;j++){
                freq_m[ dat[j] ][ chain[j] ]++;
                sum_rows[ chain[j] ]++;
                sum_columns[ dat[j] ]++;
        }
        index = 0;
		score = 0;
		
        for (k=0;k<10;k++)
                for (j=0;j<26;j++) {
                	w = (sum_columns[j]*sum_rows[k])/dat.length;
                	if (w>0) {
                		v = (freq_m[j][k] - w);
                		score += v*v/w;
            		}
        }
        return(score);
} /* end get_chain */


// chi_sq routines not used.

function get_chi_sq(dat){
//    var alpha = 'abcdefghijklmnopqrstuvwxyz';
//    var digits = '0123456789';
//    var alpha1 = 'abcdefghijklmnopqrstuvwxyz-';
    var s,i,indx,c,n,j,x,index;
    var score,high_score;
    var out_str;
    //var start_search,end_search;
    var j1,j2,j3,j4,j5;
    var k1,k2, k3, k4, k5;
    var equ_primers = {};
    var chain_start = [];
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;

    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return(0); // no digits or # allowed
    high_score = 0;
    for (j1=0;j1<10;j1++) {
            chain_start[0] = j1;
    for (j2=0;j2<10;j2++) {
            chain_start[1] = j2;
    for (j3=0;j3<10;j3++) {
            chain_start[2] = j3;
    for (j4=0;j4<10;j4++) {
            chain_start[3] = j4;
    for (j5=0;j5<10;j5++) {
            chain_start[4] = j5;
    s = ''+chain_start[0]+chain_start[1]+chain_start[2]+chain_start[3]+chain_start[4];
    if ( s in equ_primers)
        continue;
    score = get_chain(dat,chain_start);

    if (score>high_score){
        high_score = score;
        //high_primer = s;
    }

    // get equivalent primers to s so can skip them
    k1 = (j1*3)%10;
    k2 = (j2*3)%10;
    k3 = (j3*3)%10;
    k4 = (j4*3)%10;
    k5 = (j5*3)%10;
    s = ''+k1+k2+k3+k4+k5;
    equ_primers[s] = 1;
    k1 = (j1*7)%10;
    k2 = (j2*7)%10;
    k3 = (j3*7)%10;
    k4 = (j4*7)%10;
    k5 = (j5*7)%10;
    s = ''+k1+k2+k3+k4+k5;
    equ_primers[s] = 1;
    k1 = (j1*9)%10;
    k2 = (j2*9)%10;
    k3 = (j3*9)%10;
    k4 = (j4*9)%10;
    k5 = (j5*9)%10;
    s = ''+k1+k2+k3+k4+k5;
    equ_primers[s] = 1;

    }}}}}
    return(Math.floor(high_score) );

}
// progkey stats not used

// should convert to closure
var left_shift = [];
var right_shift = [];

function best_pk_di(col,period,buffer){
/* return best log_di score for all possible digraph keys in column */

        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr;
        var buf_len;
        
        best_score = 0;
        buf_len = buffer.length
        rows = Math.floor(buf_len / period);
        for (kl = 0;kl<26;kl++) for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = cl+kl; // vigenere
                        if (pl>=26) pl -= 26;
                        pr = cr+kr; // vigenere
                        if ( pr >= 26) pr -= 26;
                        score += logdi[pl][pr];
                        ct++;
                    }/* next j */
                
                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end best_di */

function extend_pk_di(col,period,buffer){
/* return best log_di score for all possible extensions of digraphs */
/* keys are the same as shifts */
        var j,k,rows,ct;
        var best_score, score;
        var kl,kr,pl,pr, kl1,kr1;
        var cl,cr, buf_len;
        
        best_score = 0;
        buf_len = buffer.length        
        rows = Math.floor(buf_len / period);
        kl = right_shift[col-1];// use previous best right as new left
        for (kr = 0; kr < 26;kr++) {
                score = 0;
                ct = 0;
                    for (j=0;j<rows;j++) {
                        if ( col+j*period+1>=buf_len)
                            break;
                        cl = buffer[col+j*period];
                        cr = buffer[col+1+j*period];
                        pl = cl+kl; // Vigenere
                        if (pl>=26) pl -= 26;
                        pr = cr+kr; //vigenere
                        if ( pr >= 26) pr -= 26;
                        score += logdi[pl ][pr ];
                        
                        ct++;
                    }/* next j */

                
                score *= 100;
                score /= ct;
                if ( score > best_score) {
                        best_score = score;
                        left_shift[col] = kl;
                        right_shift[col] = kr;
                 }
        } /* next kr,kl */
        return(best_score);
} /* end extend_di */
 
function get_pk_score(period,buffer){
        var score;
        var sum, col;
        
        sum = best_pk_di(0,period,buffer);
        for (col = 1;col<period;col++)
            sum += extend_pk_di(col,period,buffer);
        score = sum / period;
        return(score);
} /* end get_score */

 
function get_progkey_ldi(original_buffer){
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var digits = '0123456789';
    var s,i,indx,c,n,j,x;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    var prog_index,cnt,period;
    var best_period,best_prog_index;
    var c_type;
    var buffer;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
 
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return(0); // no digits or # allowed
 
    //original_buffer = [];
    buffer = [];
    /*
    s = ciphertext.toLowerCase();
    indx = 0;
    for (i=0;i<s.length;i++){
        c = s.charAt(i);
        n = alpha.indexOf(c);
        if (c == '#') return(0); //ignore trifids and digrafids 
        if ( n >=0) {
            original_buffer[indx++] = n;
        }
        else {
            n = digits.indexOf(c);
            if ( n != -1)
                return(0); // ignore digital ciphers
        }
        
    }
    */
    best_score = 0;
    for (c_type = 0;c_type<2;c_type++)
    for (period = 3;period<16;period++)
    for (prog_index = 1; prog_index<26;prog_index++){
        indx = 0;
        cnt = 0;
        for (i=0;i<original_buffer.length;i++){
            if ( c_type==0) 
                buffer[i] = (26+original_buffer[i] - indx)%26; 
            else
                buffer[i] = (26-original_buffer[i] + indx)%26; 
            cnt++;
            if (cnt == period){
                cnt = 0;
                indx = (indx+prog_index)%26;
            }
        }
        score = get_pk_score(period,buffer);
        if (score> best_score) {
            best_score = score;
/*            
            s ="Period: "+period;
            s += '\nProgression index: '+prog_index;
            x = best_score.toFixed(2);
            s +='\nscore '+x;
            out_str = '';
            out_str += s;
*/            
        }
    }
    //best_score = best_score.toFixed(2);
    //console.log(out_str);
    return(Math.floor(best_score) );

}
// get route bstd stat
var route_calcs = function(){
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

var bstd = [];
var max_score;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";


var buffer;
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
orig_buffer = [];
rev_buffer = [];

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
        var numb_decrypts;
        var max_dopple_score;
        buffer = [];
        for (i=0;i<code.length;i++)
            buffer[i] = code[i];
                
        orig_buffer = [];
        rev_buffer = [];
                
        for (i=0;i<buffer.length;i++){
            orig_buffer[i] = buffer[i];
            rev_buffer[i] = buffer[i];
        }
        rev_buffer.reverse();
        
        //numb_decrypts = parseInt(document.getElementById('numb_decrypts').value );
        //numb_decrypts = 10000;
        numb_decrypts = 20000; // double those used to generate training data
        //max_rwidth = parseInt(document.getElementById('max_rwidth').value );
        /*
        max_rwidth = 15;
        if ( Math.floor(Math.sqrt(buffer.length)) > 15)
            max_rwidth = Math.floor(Math.sqrt(buffer.length));
        */
        //max_rwidth = document.getElementById("period_entry").value;    
        max_rwidth = max_period;
        max_score = 0;
        //out_str = "no width";
        max_dopple_score = 0;
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
                /*
                for (j=0;j<buf_len;j++)
                    out_str += l_alpha.charAt(plain_text[j]);
                out_str += "\nscore: "+score.toFixed(2);
                */
                k = 100*score/(buffer.length-2);
                //out_str += ", normlized score: "+k.toFixed(2);
                n = (k-15)/(79-15); // std english bstd score = 79, random english bstd score = 15
                max_dopple_score = n;
                /*
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
                */
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
        return(max_dopple_score);

    } // end do_route_calc function
    return (do_route_calc); // return this function which can access pseudo_global variables
} // end route_calcs closure function



function do_route_bstd_solve(ciphertext){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
 
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return(0); // no digits or # allowed
    do_route_calc = route_calcs(); // returns a function and initializes scoring table
    score = do_route_calc(ciphertext);
    return( score );
}

var mysz_calcs = function(){
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

var bstd = [];
var max_score;
var l_alpha = "abcdefghijklmnopqrstuvwxyz";
var plain_text = new Array();
var key=[];
var inverse_key = [];
var period;
var max_period = 13;
var buffer;
var buf_len;
var start_row;

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
        function get_redef_trial_decrypt(period){
                var i,j,index;
                var offset,count,k;
                var inverse_count;
                var le,ext_key;
                var s,my_key;
                
            // convert redefence key to equivalent myskowski key.
            le = 2*period-2;        
            ext_key = key.slice(0,period); // use slice so we get a copy, not just a pointer to the key.
            index = period;
            for (j= period-2;j> 0;j--)
                ext_key[index++]= key[j];
            index = 0;
            my_key = [];
            for (j=start_row;j<le;j++)
                my_key[index++] = ext_key[j];
            for (j=0;j<start_row;j++)
                my_key[index++] = ext_key[j];
        //my_key = ext_key.slice(start_row,le)+ext_key.slice(0,start_row);
		/* for speed, set up inverse key */
        inverse_count = [];
        for (j=0;j<le;j++)
            inverse_key[j] = [];

		for (j=0;j<le;j++) {// highest possible key entry is key_len-1
			inverse_count[j] = 0;
			for (k=0;k<le;k++)
				if ( my_key[k] == j)
					inverse_key[j][inverse_count[j]++] = k;
		}
        count = 0;
        for (k=0;k< le;k++) {
	        if (inverse_count[k]==0) continue;
			index = offset = 0;
			while ( inverse_key[k][index]+offset < buf_len) {
				plain_text[inverse_key[k][index]+offset] = buffer[count++];
				if ( ++index >= inverse_count[k]){
						index = 0;
						offset += le;
				}
			} /* end while*/
        } /* next k */
                
        }
	

        function get_redef_score(period){
            var score,i,n;
        
            get_redef_trial_decrypt(period);
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
        var numb_decrypts, numb_accepted, fudge_factor;
        var max_dopple_score, col_flag;
        var ext_key, pos, redef_flag;
        var score;
        var route_bstd_index = 38; // assume this value is already calculated
        
        buffer = [];
        for (i=0;i<code.length;i++)
            buffer[i] = code[i];
        buf_len = code.length;

        //max_period = parseInt(document.getElementById('period_entry').value );

        numb_decrypts = 50000;
        //numb_decrypts = 100000;
        fudge_factor = 0.08;
        max_score = 0;
        key = [];
        var cycle_limit = 30;	
        var begin_level = 1.0
        var noise_step = 1.5;
        var noise_level = begin_level;
        var cycle_numb = 0;        
        
       max_dopple_score = 0; 
       col_flag = 'N';               
       redef_flag = 'N';
       for (period = 4; period <= max_period; period++){
        for (i=0;i<period;i++)
            key[i] = Math.floor(Math.random()*period);
        local_best_score = 0;    
        loal_count = 0;
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
                //x = score.toFixed(2);

                /*
                for (j=0;j<buf_len;j++)
                    out_str += l_alpha.charAt(plain_text[j]);
                out_str += "\nscore: "+score.toFixed(2);
                */
                k = 100*score/(buffer.length-2);
                //out_str += ", normlized score: "+k.toFixed(2);
                n = (k-15)/(79-15); // std english bstd score = 79, random english bstd score = 15
                max_dopple_score = n;                
                /*
                out_str += ", doppleschach score: "+n.toFixed(2);
                out_str += "\n% accept: "+ (100.0*numb_accepted/(i+1)).toFixed(2);
                out_str += '\nkey: ';
                for (j=0;j<period;j++)
                    out_str += l_alpha.charAt( key[j] );
                */
                // check for repeated key letters, record repeats
                reps = {};
                col_flag = 'Y';                
                for (j=0;j<period;j++){
                    if (key[j] in reps){
                        reps[key[j]]++;
                        col_flag = 'N';                        
                    }
                    else {
                        reps[key[j]] = 1;
                    }
                }                    
                //if ( flag )
                //    out_str += ' (columnar)';
                /*
                // check for repeated key letters
                reps = {};
                col_flag = 'Y';
                for (j = 0;j<period;j++){
                    if ( key[j] in reps ) {
                        col_flag = 'N';
                        break;
                    }
                    else
                        reps[ key[j] ] = true;
                }
                //if ( flag )
                //    out_str += ' (columnar)';
                */
                // check for redefence
                pos = -1;
                redef_flag = 'Y';
                for( c in reps) {
                    if ( reps[c] >2){ // not redefence
                        pos = -1;
                        redef_flag = 'N';
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
                        redef_flag = 'N';
                    }
                    if ( redef_flag == 'Y')
                    for (j=1;j<k;j++){
                        if (ext_key[j] != ext_key[ext_key.length-j] ){
                            redef_flag = 'N';
                            break;
                        }
                    }
                }
//                if ( flag)
//                    out_str += ' (redefence)';
                
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
            noise_level = begin_level;
            cycle_numb = 0;
        
            for (i=0;i<period;i++) {
                key[i] = i;
            }
            // random start;
            for (i=period-1;i>0;i--) {
                j = Math.floor( Math.random()*i);
                c = key[j];
                key[j]=key[i];
                key[i] = c;
            }
            fudge_factor = 0.1;
            start_row = Math.floor(Math.random()*period);            
            local_best_score = 0;    
            loal_count = 0;
            //var max_local_count = 500;
            numb_accepted = 0;        
            for (i=0;i<numb_decrypts;i++){
            op_choice = Math.random()*100;
            if ( op_choice < 50){
                    n1 = start_row;
                    start_row = Math.floor(Math.random()*period);
            }
            else {
                    n1 = Math.floor(Math.random()*period);
                    v1 = key[n1];
                    n2 = Math.floor(Math.random()*period);
                    v2 = key[n2];
                    key[n1] = v2;
                    key[n2] = v1;
            
            }
                
                score = get_redef_score(period);
                if (score>max_score && score > test_values[route_bstd_index] ){ // better than route score and mysz score
                    max_score = score;
                    out_str = '';
                    //x = score.toFixed(2);
                    //out_str += x+'~';
                    /*
                    for (j=0;j<buf_len;j++)
                        out_str += l_alpha.charAt(plain_text[j]);
                    out_str += "\nscore: "+score.toFixed(2);
                    */
                    k = 100*score/(buffer.length-2);
                    //out_str += ", normlized score: "+k.toFixed(2);
                    n = (k-15)/(79-15); // std english bstd score = 79, random english bstd score = 15
                    max_dopple_score = n;   
                    col_flag = 'N';
                    redef_flag = 'Y';
                    /*
                    out_str += ", doppleschach score: "+n.toFixed(2);
                    out_str += "\n% accept: "+ (100.0*numb_accepted/(i+1)).toFixed(2);
                    out_str += '\nkey: ';
                    for (j=0;j<period;j++)
                        out_str +=  key[j]+' ';
                    out_str += "start row: "+start_row;
                    */
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
                        start_row = n1;
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
// is score too low to be a redefence?
        if ( max_dopple_score < 0.7)
            redef_flag = 'N';
        //test_values[test_index] = best_score;
        //document.getElementById('output_area').value = out_str;
        //return(max_score); for ID test return max doppleschach score
        return([max_dopple_score,col_flag,redef_flag]);

    } // end do_mysz_calc function
    return (do_mysz_calc); // return this function which can access pseudo_global variables
} // end mysz_calcs closure function

var gro_bt_calcs = function(){ // closure for gromark binary trigraph score
var primer_limit = 200;
var fudge_factor = 0.05;
var max_trials = 30000;

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

var alpha="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
var digits = '0123456789';
var buffer = [];
var buf_len;

var plain_text = new Array();
//var key = new Array();
var max_trials;
var key=[];
var inverse_key = [];
var buf_len;
var noise_step, cycle_limit, begin_level;

var primer;


var PRIMER_LEN = 5;
var order;
var p_len;

var ksq = [];
var PRIMER = 0;
var SCORE = 1; // indices in ksq

var  even_flag = false;
var  g_flag = false; //g_flag == GIZMO flag


var chain_start = [];
var chain = [];
var sum_rows = [];
var sum_columns = [];
var freq_m = [];
var numb_to_show = 10;

var high_score = 0;
 
function sort_scores() {
        var i,j,k,l,m,t1;
        var c;

        order = [];
        for (i=0;i<100000;i++) order[i]=i;
        if (even_flag)
        	i = j = 3125;
		else
        	i=j=100000;
        i>>=1;
        while(i) {
                k=0; l=j-i;
                while(k<l) {
                        c=k;
                        while(c>=0) {
                                m=c+i;
                                if (ksq[order[m]][SCORE] > ksq[order[c]][SCORE]) {
                                        /* swap c and m */
                                        t1=order[c];
                                        order[c] = order[m];
                                        order[m] = t1;
                                }
                                else break;
                                c-=i;
                        }
                        k++;
                }
                i>>=1;
        }
} /* end sort scores */
 

function get_primerless_chain() {
        var i,j,k,index;
        var sum,count;
        var score,v,w;

        // reset to zero to avoid garbage collection
        //memset(sum_rows,0,sizeof(sum_rows));
        for (i=0;i<10;i++)
            sum_rows[i] = 0;
        //memset(sum_columns,0,sizeof(sum_columns)); 
        for (i=0;i<26;i++)
            sum_columns[i] = 0;        
        for (index = 0;index<p_len;index++)
                chain[index] = chain_start[index];
        for (j = 0;j<buf_len-p_len;j++)
                chain[j+p_len] = (chain[j]+chain[j+1]) % 10;
        //memset(freq_m,0,sizeof(freq_m));
        for (i=0;i<26;i++) for(j=0;j<10;j++)
            freq_m[i][j] = 0;
        for (j=0;j<buf_len;j++){
                freq_m[ buffer[j] ][ chain[j] ]++;
                sum_rows[ chain[j] ]++;
                sum_columns[ buffer[j] ]++;
        }
        index = 0;
		score = 0;
		
        for (k=0;k<10;k++) 
                for (j=0;j<26;j++) {
                	w = (sum_columns[j]*sum_rows[k])/buf_len;
                	if (w>0) {
                		v = (freq_m[j][k] - w);
                		score += v*v/w;
            		}
        }
	if ( !g_flag || chain_start[0]&1 || chain_start[1]&1 || chain_start[2]&1 || chain_start[3]&1 || chain_start[4]&1 )
        return(score);
    else
    	return(score * 1.66 );
} /* end get_primerless_chain */
 
 
function order_primers(){
    var s,i,indx,c,n,j,x,index;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    var j1,j2,j3,j4,j5;
    
    p_len = PRIMER_LEN;
    index = 0;
    for (i=0;i<26;i++)
        freq_m[i] = [];
    best_score = -10000;    
    for (j1=0;j1<10;j1++) {
            chain_start[0] = j1;
            if (even_flag && j1&1)
            	continue;
    for (j2=0;j2<10;j2++) {
            chain_start[1] = j2;
            if (even_flag && j2&1)
            	continue; 
    for (j3=0;j3<10;j3++) {
            if (even_flag && j3&1)
            	continue;
            chain_start[2] = j3;
    for (j4=0;j4<10;j4++) {
            chain_start[3] = j4;
            if (even_flag && j4&1)
            	continue;                
    for (j5=0;j5<10;j5++) {
            if (even_flag && j5&1)
            	continue;
            chain_start[4] = j5;
	ksq[index] = [];
    s = ''+chain_start[0]+chain_start[1]+chain_start[2]+chain_start[3]+chain_start[4];
    ksq[index][PRIMER] = s;
    score = get_primerless_chain();
    ksq[index++][SCORE] = score;
    }}}}}	
    sort_scores();   

}


function get_chain(){
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
	
function get_trial_decrypt(){
        var i,j,k, index,x,y,c;
        var c1,c2,c3,c4;

        // get inverse key 
	for (i=0;i<26;i++) {
		inverse_key[ key[i] ] = i;
	}    
    for (x=0;x<buf_len;x++) {
        c = inverse_key[buffer[x]];
        plain_text[x] = (26+c-chain[x])%26;
    }
}
	

function get_score(buf_len){
	var score,i,n;

	get_trial_decrypt();
	// get tetgraph score
	score = 0.0;
	for (i=0;i<buf_len-3;i++){
		n = plain_text[i]+26*plain_text[i+1]+26*26*plain_text[i+2];
		score += bt[n];
	}
	return(score);
}	

function do_hill_climbing(str){
	var  out_str,c,n,v,score,i,j,trial;
	var n1,n2,v1,v2,max_score,current_hc_score;
	var mut_count;
	var x,y,n3,n4;
	var noise_level,cycle_numb,sq_choice,c1,c2;
	var numb_accepted;

	var s;
    var primer_numb, primer_start;
    var norm_score;
  
	str = str.toUpperCase();
	buf_len = 0;
	for ( i=0;i<str.length;i++){
		c = str.charAt(i);
		n = alpha.indexOf(c);
		if ( n>=0)
			buffer[buf_len++] = n;
	}
    if (buf_len >= 800)
        primer_limit = 12;
    else if (buf_len>= 400)
        primer_limit = 100;
    else
        primer_limit = 500;
    order_primers();

   max_score = 0;
 for (primer_numb = 0;primer_numb<primer_limit;primer_numb++){    
	for (i=0;i<26;i++) {
		key[i] = i;
	}
	// random start;
	for (i=25;i>0;i--) {
		j = Math.floor( Math.random()*i);
		c = key[j];
		key[j]=key[i];
		key[i] = c;
	}
    primer = ksq[order[primer_numb]][PRIMER]
    get_chain();
	cycle_limit = 20;

	begin_level = 1.3;
	noise_step = 1.3;
	noise_level = begin_level;
	cycle_numb = 0;
	current_hc_score = score = get_score(buf_len);	
    if ( score>max_score){
        max_score = score;
        norm_score = 1000*score/(buf_len-2);        
    }
	mut_count = 0;
	numb_accepted = 1;
	for (trial = 0;trial < max_trials;trial++){
		n1 = Math.floor(Math.random()*26);
		n2 = Math.floor(Math.random()*26);
		v1 = key[n1];
		v2 = key[n2];
		key[n1]=v2;
		key[n2]=v1;
		score = get_score(buf_len);
		if ( score>max_score){
			max_score = score;
            norm_score = 1000*score/(buf_len-2);
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
		
	} // next trial
  }// number primer_numb    
  return( Math.floor(norm_score) );
}
return(do_hill_climbing);  // return this function which can access pseudo_global variables
} // end closure for gro_bt_calcs

function get_gro_bt(str){
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
 
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return(0); // no digits or # allowed

    var bt_climb = gro_bt_calcs(); // get gro_bt hill-climber
    var score = bt_climb(str);
    return(score);
}


function do_mysz_bstd_solve(ciphertext){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
    
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return([0,'N','N']); // no digits or # allowed
    
    do_mysz_calc = mysz_calcs(); // returns a function and initializes scoring table
    s= do_mysz_calc(ciphertext);
    score = s[0];
    
    return( [score.toFixed(2),s[1],s[2]] );
    
}

var dist_corr_calcs = function(){ // beginning of closure
function get_distance_correlation(x_array,y_array){ // assume x_array and y_array have same length
    var i,j, sum, count;
    // get the two distance matrices
    
    var x_dist_matrix = get_distance_matrix(x_array);
    var y_dist_matrix = get_distance_matrix(y_array);
    
    // get row means, column means, grand mean
    
    var result = get_matrix_means(x_dist_matrix);
    var x_mean = result[0];
    var x_row_means = result[1];
    var x_col_means = result[2];
    
    result = get_matrix_means(y_dist_matrix);
    var y_mean = result[0];
    var y_row_means = result[1];
    var y_col_means = result[2];
    
    var x_double_center_matrix = [];
    
    for (i=0;i<x_dist_matrix.length;i++){
        x_double_center_matrix[i] = [];
        for (j=0;j<x_dist_matrix.length;j++)
            x_double_center_matrix[i][j] = x_dist_matrix[i][j] - x_row_means[i] - x_col_means[j] + x_mean;
    }
    
    var y_double_center_matrix = [];
    
    for (i=0;i<y_dist_matrix.length;i++){
        y_double_center_matrix[i] = [];
        for (j=0;j<y_dist_matrix.length;j++)
            y_double_center_matrix[i][j] = y_dist_matrix[i][j] - y_row_means[i] - y_col_means[j] + y_mean;
    }
    
    // get distance covariance of X and Y
    
    var xy_product_matrix = elementwise_multiply(x_double_center_matrix,y_double_center_matrix)
    
    sum = 0
    count = 0;

    for (i=0;i<xy_product_matrix.length;i++)
        for (j=0;j<xy_product_matrix.length;j++){
            sum += xy_product_matrix[i][j];
            count++;
    }
    
    var distance_covariance = Math.sqrt(sum/count);
    
    // get distance variance of X and of Y
    
    var x_product_matrix = elementwise_multiply(x_double_center_matrix,x_double_center_matrix)
    
    sum = 0
    count = 0;
    
    for (i=0;i<x_product_matrix.length;i++)
        for (j=0;j<x_product_matrix.length;j++){
            sum += x_product_matrix[i][j];
            count++;
    }
    
    var x_distance_variance = Math.sqrt(sum/count);
    
    var y_product_matrix = elementwise_multiply(y_double_center_matrix,y_double_center_matrix)
    
    sum = 0
    count = 0;
    
    for (i=0;i<y_product_matrix.length;i++)
        for (j=0;j<y_product_matrix.length;j++){
            sum += y_product_matrix[i][j];
            count++;
    }
    
    var y_distance_variance = Math.sqrt(sum/count);
    
    var distance_correlation = distance_covariance / Math.sqrt( x_distance_variance*y_distance_variance);
    
    return(distance_correlation);

}


function get_distance_matrix(input_array){
    var i,j,n;
    var dist_mat = [];

    for (i = 0;i<input_array.length;i++){
        dist_mat[i] = [];
        dist_mat[i][i] = 0;
    }
    for ( i = 0;i<input_array.length-1;i++)
        for ( j = i+1;j<input_array.length;j++){
            n = get_distance( input_array[i], input_array[j] );
            dist_mat[i][j] = dist_mat[j][i] = n;
    }
    return(dist_mat);
}

function get_distance(a,b){ // get distance between numbers or vectors of equal length
    var i,n;
    
    if ( a instanceof Array ){ // a, b vectors
        n = 0;
        for (i=0;i<a.length;i++)
            n += (a[i]-b[i]) * (a[i]-b[i]);
        n = Math.sqrt(n);
    }
    else { // a,b are numbers
        n = a-b;
        if ( n <0) n = -n;
    }
    return(n);   
}


function get_matrix_means(input_matrix){ // assume square matrix, row length equals column length
    var i,j;
    var sum = 0;
    var count = 0;
    var row_mean = [];
    var col_mean = [];
    
    for (i=0;i< input_matrix.length;i++){
        row_mean[i] = 0;
        for (j=0;j<input_matrix[i].length;j++){
            row_mean[i] += input_matrix[i][j];
            sum += input_matrix[i][j];
            count++;
        }
        row_mean[i] /= input_matrix[i].length;            
    }
    
    var mean = sum / count;
    
    for (j=0;j <input_matrix.length;j++){
        col_mean[j] = 0;
        for (i=0;i<input_matrix[j].length;i++){
            col_mean[j] += input_matrix[i][j];
        }
        col_mean[j] /= input_matrix[j].length;            
    }
    return( [mean,row_mean,col_mean] );
}

function elementwise_multiply(a,b){ // a,b square matrices of same dimensions
    var i,j;
    
    var product_matrix = [];
    for (i=0;i<a.length;i++){
        product_matrix[i] = [];
        for (j=0;j<a.length;j++)
            product_matrix[i][j] = a[i][j] * b[i][j];
    }
    return(product_matrix);
}


var vigstats = [0.0460,0.0350,0.0295,0.0258,0.0459,0.0372,0.0414,0.0454,0.0455,0.0278,0.0354,0.0484,
		0.0428,0.0306,0.0342,0.0379,0.0284,0.0420,0.0449,0.0397,0.0355,0.0472,0.0461,0.0376,
		0.0339,0.0364]

var varstats = [0.0650,0.0396,0.0307,0.0347,0.0440,0.0333,0.0362,0.0393,0.0340,0.0334,0.0379,0.0442,
		0.0390,0.0419,0.0390,0.0442,0.0379,0.0334,0.0340,0.0393,0.0362,0.0333,0.0440,0.0347,
		0.0307,0.0396]


// letter percentages standard english
var final_freq = [8.678,1.598,3.080,3.901,12.040,2.192,1.950,4.755,7.427,0.183,0.686,4.329,2.810,7.354,7.493,2.110,0.124,6.275,6.426,8.838,2.914,1.042,1.713,0.203,1.741,0.136];

    var do_dist_corr_calc = function(code){ // return this function which can use the pseudo-global variables
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var digits = '0123456789';
    var s,i,indx,c,n,j,x;
    var score,best_score;
    var out_str;
    var start_search,end_search;
    var prog_index,cnt,period;
    var best_period,best_prog_index;
    var c_type;
    var d_cor1,d_cor2,d_cor3;
    
    //s = code.toLowerCase();
    s = code; // already converted to range 0-25
    var series = [];
    for (i=0;i<26;i++) series[i] = 0;
    
    for (i=0;i<s.length;i++){
        series[ s[i] ]++;
    }
    best_score = d_cor1 = get_distance_correlation(series,vigstats);
    d_cor2 = get_distance_correlation(series,varstats);
    if ( d_cor2>best_score)
        best_score = d_cor2;
    d_cor3 = get_distance_correlation(series,final_freq);
    //best_score = best_score.toFixed(2);
    //console.log(out_str);
    return( [best_score.toFixed(3),d_cor3.toFixed(3)] );
    
    } // end do_dist_corr_calc
    return (do_dist_corr_calc); // return this function which can access pseudo_global variables
} // end of closure

function get_dc_scores(ciphertext){
	var str,max_trials,s,n;
	var  out_str,c,v,score,i,j;
	var n1,n2,v1,v2,max_score;
	var x,y,n3,n4;
    var indx,state,k;
    var digit_index = 18; // assume these values have already been calculated
    var hash_index = 20;
    
    if (test_values[digit_index]=='Y' || test_values[hash_index]=='Y')
        return([0,0]); // no digits or # allowed
    
    do_dist_corr_calc = dist_corr_calcs(); // returns a function and initializes scoring table
    s= do_dist_corr_calc(ciphertext);
    return(s); // s is an array with two elements
    //return( [s[0],s[1]] );
    
}

function do_id_test(code){
	var s,x,num_dev,n;
    var test_index;
    var str;
    
    
    // test message
    str = "the code you sent was: "+code+"\nand max period is: "+max_period+"\n working on it...";
    //postMessage(str);
    //return;
    
	nc = convert_string(code);
	if (nc.length < 2) {
		//alert("Cipher too short!")
        console.log("Cipher too short");
		return
	}
    

    //max_period = parseInt(document.getElementById('period_entry').value);
    if ( isNaN(max_period) || max_period == 0){
        //alert("Maximum Period must be a positive number!");
        postMessage("Error. Maximum Period must be a positive number!");
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
    postMessage("Basic stats calculated. Working on binary trigraph scores (may take quite a while). . .");
    x = get_max_progkey_ic(nc);
    test_values[MPIC_index] = x;
    x = get_serp(nc);
    test_values[SERP_index] = x;  
    x = do_route_bstd_solve(nc);
    test_values[ROUTE_BSTD_index] = x;
    x = do_mysz_bstd_solve(nc);
    test_values[MYSZ_BSTD_index] = x[0];    
    test_values[NO_KEY_REPEATS_index] = x[1];
    test_values[REDEF_PAT_index] = x[2];    
    x = get_dc_scores(nc);
    test_values[VIG_VAR_DC_index] = x[0];    
    test_values[STD_DC_index] = x[1];

    x = get_chi_sq(nc);
    test_values[CHI_SQ_index] = x;
    
    x = get_progkey_ldi(nc);
    test_values[PROGKEY_LDI_index] = x;
	//str = document.puzzle.ciphertext.value; 
    //str = db_element.ciphertext;
    str = code;
    str = str.replace(/\n/g,' ');

    x = get_gro_bt(str);
    test_values[GRO_BT_index] = x;
    x = get_nsp(nc);
    test_values[NSP_index] = x;
    
    //s += "\n\n"+test_values;
    // delete previous s for now.
    //s = display_stats(nc);
    //x = normalize_test_values();
    result = normalize_test_values();
    //s += "\n normalized test values\n"
    //s += result[0]
    //s += '\n';
    result = neural_net_get_id(result[1]);
    s = "Top cipher type is:\n"
    //s += result[0]
    //s += ' ('+cipher_name_normalized_order[ result[0] ]+')\n';
    s += cipher_name_normalized_order[ result[0] ]+'\n\n';
    s += 'Top 5 cipher types were:\n';
    for (i=0;i<5;i++){
        s += result[1][i][0]+' '+result[1][i][1].toFixed(2)+'\n';
    }
    s += '\n(not tested: Baconian, Interrupted Key, Null)\n'
	//document.puzzle.cipherstats.value = s // made stat display optional
    //get_id();
    /*
    if (document.getElementById('show_stats').checked){
        s = display_stats(nc);
        s += '\n'+out_str;
    }
    else
        s = out_str;
    */
    //document.puzzle.cipherstats.value = s
    postMessage(s);
    
}

function normalize_test_values(){
    var i,j,k,n,c,s;
    var normalized_array;

    s = '[';
    normalized_array = [];
    j=0;
    for (i=0;i<48;i++){
        if ( i==9) continue; // skip cipher type
        if (numerical_attributes.indexOf(i) != -1) {// numerical value
            /*
            if ( i==46 ) // GRO_BT just divide by 1000
                n = test_values[i]/1000;
            else
            */
            // GRO_BT now computed like others
            n = (test_values[i] - numerical_averages[ numerical_attributes.indexOf(i) ])/numerical_std_devs[numerical_attributes.indexOf(i)];
            s += n;
            //normalized_array[j++] = n.toFixed(2); // toFixed converts to a string
            normalized_array[j++] = Math.round(n*100)/100;
        
        }
        else if (test_values[i] == 'Y'){
            s += 1.0
            normalized_array[j++] = 1.0
        }
        else if (test_values[i] == 'N'){
            s += 0.0
            normalized_array[j++] = 0.0
        }
        if (i != 47)
            s += ',';
        else
            s += ']';
    }
    return([s,normalized_array]);
    
}
/*
function do_clear() {
	document.puzzle.ciphertext.value = ""
	document.puzzle.cipherstats.value = ""
    document.getElementById('period_entry').value = '10';
}
*/
function neural_net_get_id(input_array){
    var i,j,k,n,c,s;
    var sum,max_out,max_index;
    let numb_outputs = 51;
    
    
   var outputs = nnet.feedforward(input_array);
    
        // get index of the max output
    max_out = 0;
    for (i=0;i<numb_outputs;i++)
        if (outputs[i]>max_out){
            max_out = outputs[i];
            max_index = i;
        }
        
    // get result in percent (softmax)
    sum = 0;
    for (i=0;i<numb_outputs;i++)
        sum += outputs[i];
    // sort in frequency order
    var freq_list = [];
    for (i=0;i<numb_outputs;i++)
        freq_list[i] = [cipher_name_normalized_order[i],outputs[i]/sum];
    freq_list.sort(function(a,b){return(b[1]-a[1])});
    return([max_index,freq_list]);
     
}

function sigmoid(x){
return( 1.0/(1.0+Math.exp(-x)) )
}

function relu(x){
    if (x<0) return(0);
    return(x);
}

function softmax(x){
    return( Math.exp(x) )
}

function neural_net_setup(){
	let numb_inputs = 47
    let numb_hidden = hidden_bias.length;
    let numb_outputs = 51;

    var hb = new Matrix(numb_hidden,1);
    for (i=0;i<numb_hidden;i++)
        hb.data[i][0] = hidden_bias[i][0];
        
    var ob = new Matrix(numb_outputs,1);
    for (i=0;i<numb_outputs;i++)
        ob.data[i][0] = output_bias[i][0];
    //out_str = "bias martices constructed\n";
    var iw  = new Matrix(numb_hidden,numb_inputs);
    for (i=0;i<numb_hidden;i++)
        for (j=0;j<numb_inputs;j++)
            iw.data[i][j] = input_weights[i][j]; 
    var ow  = new Matrix(numb_outputs,numb_hidden);
    for (i=0;i<numb_outputs;i++)
        for (j=0;j<numb_hidden;j++)
            ow.data[i][j] = hidden_weights[i][j]; 
    //out_str += "weight matrices constructed\n";
    
    nnet = new NeuralNetwork(numb_inputs,numb_hidden,numb_outputs,iw,ow,hb,ob);

}

neural_net_setup();

onmessage = function(event) { //receiving a message with the string to decode. do search
    var code
    code = event.data.code;
    //str2 = event.data.str2;
    max_period = parseInt(event.data.maxPeriod);
    do_id_test(code);
};  

