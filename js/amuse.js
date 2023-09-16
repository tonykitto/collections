// support for simple web API
var amuse = {
  version : "10.0",
  date : "2018-09-25",
  session_init: function(coll, query){
    "use strict";
    var event, search;
    document.getElementById("report").innerHTML = "";
    if (typeof(Storage) == "undefined") { alert("No Storage availble");}
    else{
      if (! sessionStorage[coll+"_page_size"]){
        sessionStorage.setItem(coll+"_page_size", "5");
        sessionStorage.setItem(coll+"_record_number", "1");
      }
    }
    window.Viewer.start(coll);
    if (query in window[coll].objects){
      window.Viewer.show_object(query);
      return "";
    }
    window.Viewer.start_page();
    if (query){
      // ~ is used at start of search string to indicate search for hash tag
           // instead of # , which in a uri search string is a fragment identifier 
      document.getElementById("filter_box").value = 
        query.replace(/%20/g, " ").replace(/%22/g, "\"").replace(/^~/,"#");
      search = true;
    }
    else{
      if (sessionStorage[coll+"_search_word"]){
        document.getElementById("filter_box").value = sessionStorage[coll+"_search_word"];
        search = true;
      }
    }
    if (search){
      if (window.event){ event = window.event; }
      else{ event = {}; }
      event.keyCode = 13;
      window.Viewer.filter_list(event);
    }
    window.Viewer.display_page();
    return "";
  }
};
