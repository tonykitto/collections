// Viewer displays one or more objects from the museum collection records loaded into windows
var Viewer = (function(){
    "use strict";
    var version = "1.1.0",
    version_date = "2020-04-20",
    save_content, // innerHTML content saved at start and used on return from show_object
    has_session, // set by test_Storage function at start
    has_local, // set by test_Storage function at start
    myTowneley, // set at start
    collection_name, // the museum collection name
    collection, // the museum collection object 
    full_list, // a list of object numbers for all objects in the museum collection created at start
    working_list, // subset of full_list according to value of search_box
    page_size, // initally set by start according to default button value and subsequently updated by button change
    record_number, // set at start to 1, updated by page_move, reset to 1 by search_handler
    search_string; // search box value
/*  start is the first Viewer function with a validated museum collection name,
 *  all the shared variables are initialised in start */
    function start(amuse){
      function test_Storage(type) {
        var storage = window[type];
        try {
          var key = "__storage_test__";
          storage.setItem(key, key);
          storage.removeItem(key);
          return true;
        } 
        catch (e) {
          return false;
        }
      } 
    // start_storage sets up memory storage if sessionStorage is not available
    // sessionStorage is used if available to retain display_page locations
      function start_storage(name){
        if (! has_session){
          page_size = 5;
          record_number = 1;
          search_string = "";
          return "";
        }
        if (! sessionStorage[name+"_page_size"]){
          page_size = 5;
          sessionStorage.setItem(name+"_page_size", "5");
          record_number = 1;
          sessionStorage.setItem(name+"_record_number", "1");
          search_string = "";
          sessionStorage.setItem(name+"_search_string", "");
          return "";
        }
        page_size = parseInt(sessionStorage.getItem(name+"_page_size"), 10);
        record_number = parseInt(sessionStorage.getItem(name+"_record_number"), 10);
        search_string = sessionStorage.getItem(name+"_search_string");
        return "";
      }
      var coll, list, id,  sort_property, property_value, sorted_list;
      document.getElementById("report").innerHTML = "";
      save_content = document.getElementById("content").innerHTML;
      coll = amuse; // amuse_collectionName
      has_local = test_Storage("localStorage");
      has_session = test_Storage("sessionStorage");
      myTowneley = false;
      if (has_local & has_session){
        if (localStorage.myTowneley){myTowneley = true;}
      }
      start_storage(coll);
      collection_name = amuse;
      collection = window[collection_name];
      full_list = [];
      list = [];
      if ("objects" in collection){
        for (id in collection.objects){
          full_list.push(id);
        }
        if ("sort_by" in collection){
          sort_property = collection.sort_by;
          for (var i=0; i<full_list.length; i++ ){
            if (sort_property in collection.objects[full_list[i]]){
              property_value = collection.objects[full_list[i]][sort_property];
            }
            else{ property_value = "~"; }
            list.push(property_value+"\t"+full_list[i]);
          }
          sorted_list = nat_sort(list);
          list = []; // remove propery headers
          for (var j=0; j<sorted_list.length; j++ ){
            list.push(sorted_list[j].split("\t").pop());
          }
          full_list = list;
        }
        else{full_list = nat_sort(full_list); }
      }
      working_list = create_object_list(search_string);
      start_page();
      return "";
    }
    // set_record_number updates sessionStorage if available
    // called by page_move and by search_handler
    function set_record_number(value){
      if (has_session){
        sessionStorage.setItem(collection_name+"_record_number", value);
      }
      record_number = value;
      return "";
    }
    // refresh_page_size called by click_button and by start_page
    function refresh_page_size(value){
    // set_page_size updates sessionStorage if available
      function set_page_size(value){
        if (has_session){
          sessionStorage.setItem(collection_name+"_page_size", value);
        }
        page_size = value;
        return "";
      }
      var list = ["button5", "button10", "button20", "button40", "button100"];
      var target= "button"+value;
      document.getElementById(target).className="btn_selected";
      for (var id in list){
        if (list[id] != target){ 
          document.getElementById(list[id]).className="btn";
        }
      }
      set_page_size(value);
      return "";
    }
    // create_object_list starts with full_list and returns a lists of object_numbers with records
    // matching the search_string, which may include one or more case insensitive words
    function create_object_list(search){
      // match_string returns object_numbers where string matches a property value
      function match_string(objects, list, string){
        var matches, list_length, object, property, value;
        matches = [];
        list_length = list.length;
        for (var i=0; i<list_length; i++){
          object = objects[list[i]];
          for (property in object){
            if (property[0] != "$"){
              value = object[property];
            }
            else{ value = object[property].join("\t"); }
            value = value.toLowerCase();
            if (value.indexOf(string)>=0){
              matches.push(list[i]);
              break;
            }
          }
        }
        return matches;
      }
      var keywords, keys, local_list;
      keywords = search.match(/\S+/g); // words separated by white space to array
      if (! keywords){return full_list; }
      keys = [];
      for (var i=0; i<keywords.length; i += 1){
       keys.push(keywords[i].toLowerCase()); 
      }
      local_list = full_list;
      if (keys.length > 0){
        for (var j=0; j<keys.length; j+= 1){
          local_list = match_string(collection.objects, local_list, keys[j]);
        }
      }
      return local_list;
    }
    // start_page is called at start or by page_return to setup content div
    function start_page(){
      refresh_page_size(page_size);
      document.getElementById("search_box").value = search_string;
      document.getElementById("search_box").onkeydown = Viewer.search_handler;
      document.getElementById("clear_search").onclick = function(){Viewer.reset_search();};
      document.getElementById("move_back").onclick = function(){Viewer.page_move(60); };
      document.getElementById("move_forward").onclick = function(){Viewer.page_move(62); };
      display_page();
      return "";
    }
    //  display_page shows the image and brief description of a given number of objects given 
    //  given a list of objects, a page number and the number of objects per page
    function display_page(){
      // shorten_briefly makes a shorter version of briefly text 
      // nb. compare with short_briefly in click_choose, which is a longer version
      function shorten_briefly(text){
        var stop, short, space;
        if (text.length<100){return text; }
        stop = text.indexOf(".");
        if (stop>10 & stop<99){return(text.slice(0,stop+1)); }
        short = text.slice(0, 100);
        space = short.lastIndexOf(" ");
        if (space>10){return short.slice(0, space)+" ...&nbsp;"; }
        return short.slice(0, 96)+" ???&nbsp;"; // do not expect long string with no space
      }
      var list_length = working_list.length;
      var begin = record_number;
      var end = begin+page_size-1;  
      if (list_length<end){end = list_length; }
      var object = "";
      var briefly = "";
      var image = "";
      var html = "";
      var href = window.location.href;
      var top = href.indexOf("#top");
      if (top>0){
        href = href.slice(0, top);
      }
      var search = href.indexOf("?");
      if (search>0){
        href = href.slice(0, search);
      }
      var href_link = "";
      var myTowneley = false;
      if (localStorage.myTowneley){myTowneley = true;}
      for (var i=begin-1; i<end; i ++){
        object = collection.objects[working_list[i]];
        briefly = shorten_briefly(object.briefly);
        image = object.image;
        href_link = href+"?"+working_list[i];
        html += "<div><img src=images_360/"+image+" alt='Collection image described below'>";
        if (myTowneley){
          if (localStorage["Ty_"+working_list[i]]){
            html += "Choose me <input type=\"checkbox\" checked onclick=Viewer.click_choose(this) id=\""+
              working_list[i]+"\">";
          }
          else{ 
            if (localStorage["my_"+working_list[i]]){
              html +="Selected";
            }
            else{
              html += "Choose me <input type=\"checkbox\" onclick=Viewer.click_choose(this) id=\""+
                working_list[i]+"\">";
            }
          }
        }
        html += "<p>"+briefly+"<span class=\"point_to\" onclick=Viewer.show_object(\""+working_list[i]+
                "\") style=\"float:right\">["+working_list[i]+"]</span></p></div>";
      }
      var showing = "";
      if (end ==begin){showing = "item "+end+" of "+list_length;}
      else{
        showing = "items "+begin+" to "+end+" of "+list_length;
      }
      document.getElementById("show_number").innerHTML = showing;
      document.getElementById("portfolio").innerHTML = html;
      return "";
    }
    /* rinse cleans up user text. It replaces  symbols '&', '>' and '<' by their html equivalent
    * but avoids duplication. Replaces all white space characters by a single space,
    * and trim leading and trailing spaces */
    function rinse(text){
      function trim(string){
          return (string || "").replace(/^\x20+|\x20+$/g,"");
      }
      var clean, parts, i;
      clean = text.replace(/\s\s+/g," ");
      parts = clean.split("&");
      clean = parts[0];
      for (i=1; i<parts.length; i += 1){
        if (/^amp;|^gt;|^lt;|^quot;|^#\d+;/.test(parts[i])){clean += "&"+parts[i]; }
        else{clean += "&amp;"+parts[i]; }
      }
      clean = clean.replace(/</g,"&lt;");
      clean = clean.replace(/>/g,"&gt;");
      return trim(clean);
    }
    /*  nat_sort takes an array of strings and returns a new array formed by 
    *  sorting a copy of the parameter using the built-in sort function to 
    *  generate alphanumeric strings in natural order. */
    function nat_sort(list){
      var slist, parse_string, a_, b_;
      slist = list.slice(0); // copy rather than reference
      parse_string = /(\D*)(\d*)(\D*)(\d*)(\D*)(\d*)(\D*)(\d*)(.*)/;
      slist.sort(function(a,b){ 
        if (a===b) { return 0; }
        a_ = a.match(parse_string);
        b_ = b.match(parse_string);
        if (a_[1]!==b_[1]) { return a_[1] < b_[1] ? -1 : 1; }
        if (a_[2]!==b_[2]) { return (+a_[2]) - (+b_[2]); }
        if (a_[3]!==b_[3]) { return a_[3] < b_[3] ? -1 : 1; }
        if (a_[4]!==b_[4]) { return (+a_[4]) - (+b_[4]); }
        if (a_[5]!==b_[5]) { return a_[5] < b_[5] ? -1 : 1; }
        if (a_[6]!==b_[6]) { return (+a_[6]) - (+b_[6]); }
        if (a_[7]!==b_[7]) { return a_[7] < b_[7] ? -1 : 1; }
        if (a_[8]!==b_[8]) { return (+a_[8]) - (+b_[8]); }
        return a_[9] < b_[9] ? -1 : 1;
      });
      return slist;
    } 
// displays individual object with large image and all the property values
    function show_object(object_number){
    // display_object displays the objects properties
        function display_object(object_number){
          function shorten(property){
            if (property == "Acquisition.Date"){return "Aquired: ";}
            if (property == "Acquisition.Person"){return "";}
            if (property == "Acquisition.Organisation"){return "";}
            if (property == "Acquisition.CreditLine"){return "CreditLine: ";}
            if (property == "Acquisition.Note"){return "Note: ";}
            if (property == "Production.Person"){return "";}
            if (property == "Production.Organisation"){return "";}
            if (property == "Production.Date"){return "Date made: ";}
            if (property == "Production.Period"){return "Period made: ";}
            if (property == "Production.Place"){return "Made in ";}
            if (property == "Description.Condition"){return "Condition: ";}
            if (property == "Description.Material"){return "Material: ";}
            if (property == "Description.Measurement"){return "Measurement: ";}
            if (property == "Description.Inscription"){return "Inscription:";}
            if (property == "$Production.Person"){return "Made by: ";}
            return property+": ";
          }
          function display_object_list(prop, list){
            var html, i;
            if (list.length === 0){return ""; }
            html = "<li>"+shorten(prop)+"<ul>";
            for (i=0; i<list.length; i++ ){ html += "<li>"+list[i]+"</li>"; }
            return html+"</ul></li>";
          }
          function has_value(object, property){
            if (typeof object[property] === "string"){
              return "<p>"+shorten(property)+object[property]+"</p>";
            }
            else if (typeof object[property] === "object"){
              return display_object_list(property, object[property]);
            }
            return "";
          }
          function get_key_values(object, key_list){
            var values, prop, value;
            values = "";
            for (var i=0; i<key_list.length; i++ ){
              prop = key_list[i];
              value = has_value(object, prop); 
              values += value;
            }
            return values;
          }
          var object, display, content, view_groups, group, key_list, group_result;
          object = collection.objects[object_number];
          display = {};
          for (var property in object){
            if (property == "common"){
              for (var common_property in collection.common[object.common]){
                display[common_property] = collection.common[object.common][common_property];
              }
            }
            else{
              display[property] = object[property];
            }
          }
          content = "<p>"+object.briefly+" ["+object_number+"]</p>";
          view_groups = collection.$groups;
          for (var i=0; i<collection.$groups.length; i++ ){
            group = view_groups[i];
            key_list = collection[group];
            if (key_list.length>0){
              group_result = get_key_values(display, key_list);
              if (group_result){
                content += group_result;
              }
            }
          }
          if ("$tags" in collection.objects[object_number]){
            content += has_value(collection.objects[object_number],"$tags");
          }
          document.getElementById("show_record").innerHTML = content;
          document.getElementById("portfolio").innerHTML = "";
          return "";
        }
    // show_image displays the object image
        function show_image(current){
          var object, image, briefly, return_link, navigation, previous, next, html;
          object = collection.objects[working_list[current]];
          image = object.image;
          briefly = object.briefly;
          return_link = "<div><p id=\"return\" onclick=Viewer.page_return()>Return to collection</p></div>";
          if (working_list.length > 1){
            if (current>0){
              previous = current-1;
              navigation = "<div class=\"navigate\"><span onclick=Viewer.show_object(\""+working_list[previous]+"\")><b>&lt;</b> previous</span>";
            }
            else{
              navigation = "<div class=\"navigate\">";
            }
            next = current+1;
            if (next<working_list.length){
              navigation += "<span onclick=Viewer.show_object(\""+working_list[next]+"\") style=\"float:right\">next <b>&gt;</b></span></div>";
            }
            else{
              navigation += "</div>";
            }
          }
          else{
            navigation = "<div class=\"navigate\"> </div>";
          }
          html = return_link+navigation+"<img src=images_1200/"+image+" alt=\"Collection image described below\">";
          document.getElementById("show_image").innerHTML = html;
          document.getElementById("content").innerHTML = "";
          return "";
        }
    // get_working_list_number returns index for object_number
        function get_working_list_number(object_number){
          var length = working_list.length;
          for (var i=0; i<length; i++){
            if (working_list[i] == object_number){
              return i;
            }
          }
          return 0; // error ignored
        }
      var current_object = get_working_list_number(object_number);
      show_image(current_object);
      display_object(object_number);
      return "";
    }
//  page_return re-instates content before calling start_page
    function page_return(){
      document.getElementById("show_image").innerHTML = "";
      document.getElementById("show_record").innerHTML = "";
      document.getElementById("content").innerHTML = save_content;
      start_page();
      return "";
    }
// click_choose handles Choose me checkbox for given object number
    function click_choose(box){
      function short_briefly(text){
        var label = rinse(text);
        if (label.length<140){return label; }
        var stop = label.indexOf(". ");
        if (stop>10 & stop<140){return label.slice(0,stop+1);}
        var space = label.slice(0,135).lastIndexOf(" ");
        if (space>10)return label.slice(0, space)+" ...&nbsp;";
        return label(0, 135)+" ???&nbsp;";
      }
      var object = collection.objects[box.id];
      var storage = "Ty_"+box.id;
      var checked = box.checked;
      if (checked){localStorage.setItem(storage, object.image+"\t"+short_briefly(object.briefly)); }
      else{
        if (localStorage[storage]){localStorage.removeItem(storage); }
      } 
      return "";
    }
// page_move handles the click on previous or next page buttons
    function page_move(e){
      var keyCode;
      if (typeof e == "number"){keyCode = e; }
      else{
        keyCode = (window.event) ? event.keyCode : e.keyCode;
      }
      if (keyCode === 60){
        if (record_number == 1){return ""; }
        record_number -= page_size;
        if (record_number<1){
          record_number = 1;
        }
        set_record_number(record_number);
        display_page();
      }
      else if (keyCode === 62){
        if (record_number+page_size > working_list.length){
          return "";}
        record_number += page_size;
        set_record_number(record_number);
        display_page();
      }
      else{ alert("unexpected event with keyCode ="+keyCode); }
      return "";
    }
// click_button handles page_size change, called direct from html code
    function click_button(value){
      if (value != page_size){ 
        refresh_page_size(value);
        display_page();
      }
      return "";
    }
// search_handler handles the search box and updates working_list
    function search_handler(e){
    // set_search_string updates sessionStorage if available 
      function remove_quotes(text){
        var length = text.length;
        var string = "";
        if (length===0){return ""; }
        for (var i=0; i<length; i ++){
          if (text[i] !== "\""){ string += text[i]; }
        }
        return string;
      }
      function set_search_string(value){
        if (has_session){
          sessionStorage.setItem(collection_name+"_search_string", value);
        }
        search_string = value;
        return "";
      }
      var keyCode, new_search, text, local_list;
      if (typeof e === "number"){keyCode = e; }
      else{
        keyCode = (window.event) ? event.keyCode : e.keyCode;
      }
      if ( (keyCode === 9) || (keyCode === 13) ){
        new_search = document.getElementById("search_box").value;
        text = rinse(remove_quotes(new_search)).toLowerCase();
        document.getElementById("search_box").value = text;
        if (! text){
          document.getElementById("search_box").value = "";
          set_search_string("");
          working_list = full_list;
          set_record_number(1);
          display_page();
          return ""; 
        }
        local_list = create_object_list(text);
        if (local_list.length >0){
          working_list = local_list;
          set_record_number(1);
          set_search_string(text);
          display_page();
        }
        else{
          alert("No records matching "+text+" found");
          document.getElementById("search_box").value = search_string;
        }
      }
      return "";
    }
//  reset_filter sets search_box value to empty string and calls search_handler
    function reset_search(){
      document.getElementById("search_box").value = "";
      Viewer.search_handler(13);
    }
// about for tests
    function about(){
      return { 
        "version": version, "version_date": version_date, "save_content": save_content,
        "has_session": has_session,"has_local": has_local, "myTowneley": myTowneley,
        "collection_name": collection_name, "collection": collection, "full_list": full_list,
        "working_list": working_list,"search_string": search_string, "record_number": record_number,
         "page_size": page_size
      };
    }
    
    return {
      "start": start,
      "show_object": show_object,
      "page_return": page_return,
      "click_choose": click_choose,
      "page_move": page_move,
      "click_button": click_button,
      "search_handler": search_handler,
      "reset_search": reset_search,
      "about": about
    };
  })();
