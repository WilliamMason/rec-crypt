 
 onload = function() {
 document.getElementById('top_line').addEventListener('dragover',  function (event) {
     // stops the browser from redirecting off to the text.
     if (event.preventDefault) {
         event.preventDefault();
     }
 });
 
 document.getElementById('top_line').addEventListener('drop',  function (event) {
     var pos1,pos2;        
     // stops the browser from redirecting off to the text.
     if (event.preventDefault) {
         event.preventDefault();
     }
    document.getElementById('password').style.visibility = "visible"
    return false;
 });        
}