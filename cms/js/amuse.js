// support for simple web API
var amuse = {
  version : "10.1",
  date : "2023-11-15",
  session_init: function(coll, query){
    "use strict";
    var event;
    document.getElementById("report").innerHTML = "";
    window.Viewer.start(window[coll]);
    if (query){
      // ~ is used at start of search string to indicate search for hash tag
           // instead of # , which in a uri search string is a fragment identifier 
      document.getElementById("filter_box").value = 
        query.replace(/%20/g, " ").replace(/%22/g, "\"").replace(/^~/,"#");
      if (window.event){ event = window.event; }
      else{ event = {}; }
      event.keyCode = 13;
      window.Viewer.filter_list(event);
    }
    return "";
  }
};
