// Docs functions
// 2018-10-26 version 3
var Docs = {
  version : "version 3",
  album_change: function(image, caption){
    var html;
    html = "<a id=\"a_album\" target=\"_blank\" href=\"../images/"+image+"\" >"+
          "<img id=\"i_album\" src=\"../images/"+image+"\" alt=\""+caption+"\" /></a><br>"+caption;
    document.getElementById("abox").innerHTML = html;
    return "";
  }
};
