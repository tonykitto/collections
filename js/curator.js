// curator helps set up your on-line exhibition from objects in the Towneley collections
// version 1.1 01/05/2020
var curator = (function(){
    "use strict";
    var exhibition_name = "", // the value of the localStorage item myTowneley
        exhibition_records = {}, // load_exhibition_records at start
        working_list = []; // working_list updated by display_exhibits
// sets up new exhibition or shows current selection plus any candidates
    function start(){
      function test_sessionStorage(){
        try {
          var key = "testing_sessionStorage";
          sessionStorage.setItem(key, key);
          sessionStorage.removeItem(key);
          return true;
        } 
        catch (e) {
          return false;
        }
      }
      // load_exhibition_records collects all localStorage items that begin with my_ or Ty_
      // expecting the subsequent part to be an object_number and the item value to have 
      // the format image\tlabel
      function load_exhibition_records(){
        exhibition_records = {}; // shared variable within curator
        var length = localStorage.length;
        var object_name, object_number, object_label, tab, candidates;
        exhibition_records.name = exhibition_name; 
        exhibition_records.selected = {}; 
        candidates = []; 
        for (var i = 0; i<length; i += 1){
          object_name = localStorage.key(i);
          if (object_name.slice(0,3) == "my_" || object_name.slice(0,3) == "Ty_"){
            object_number = object_name.slice(3);
            if (object_name.slice(0,3) == "Ty_"){ candidates.push(object_number); }
            exhibition_records.selected[object_number]={};
            object_label = localStorage.getItem(object_name);
            tab = object_label.indexOf("\t");
            exhibition_records.selected[object_number].image = object_label.slice(0, tab);
            exhibition_records.selected[object_number].label = object_label.slice(tab+1);
          } // discard anything not starting with Ty_ or my_
        }
        for (var j in candidates){
          localStorage.setItem("my_"+candidates[j], localStorage.getItem("Ty_"+candidates[j]));
          localStorage.removeItem("Ty_"+candidates[j]);
        }
        return "";
      }
      document.getElementById("report").innerHTML = "";
      if (! test_sessionStorage()){ 
        document.getElementById("report").innerHTML = "sessionStorage not available";
        return"";
      }
      if (! localStorage.myTowneley){
        localStorage.clear(); // discard old localStorage used for previous exhibtions
        localStorage.setItem("my_paoil120", "paoil/paoil120.jpg\tZ is for Zoffany - Charles Townley among his marbles by Johann Zoffany");
        localStorage.setItem("my_hha25","hha/hha25.jpg\tA is for Animal heads and horns - Cokes Hartebeest head in the attic");
        localStorage.setItem("myTowneley", "starting with Towneley from A to Z");
      }
      exhibition_name = localStorage.myTowneley;
      document.getElementById("exhibition_title").innerHTML = "<h3>"+exhibition_name+"</h3>";
      load_exhibition_records();
      display_exhibits();
      make_changes(false);
      return "";
    }
  // common internal functions
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
// display_exhibits sorts selected objects according to object labels and displays them
    function display_exhibits(){
      /*  nat_sort takes an array of strings and returns a new array formed by 
       *  sorting a copy of the parameter using the built-in sort function to 
       *  generate alphanumeric strings in natural order. */
      function nat_sort(list){
        var slist, parse_string, a_, b_;
        if (list.length === 0){ return []; }
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
      // sort_selected sorts selected_list by label\tobject_number
      function sort_selected(){
        var selected_list = [];
        var object_number, label, sorted_list;
        for (object_number in exhibition_records.selected){
          label = exhibition_records.selected[object_number].label;
          selected_list.push(label+"\t"+object_number);
        }
        sorted_list = nat_sort(selected_list);
        selected_list = [];
        for (var j=0; j<sorted_list.length; j++ ){
          selected_list.push(sorted_list[j].split("\t").pop());
        }
        return selected_list;
      }
      working_list = sort_selected();
      var length = working_list.length;
      var object = {};
      var html = "";
      document.getElementById("show_image").innerHTML = "";
      document.getElementById("show_label").innerHTML = "";

      if (length === 0){
        document.getElementById("display_exhibition").innerHTML =
          "<h3>There have not been any objects selected for display</h3>";
      }
      else{
        for (var i=0; i<length; i++){
          object = exhibition_records.selected[working_list[i]];
          html += "<div><img src=images_360/"+
            object.image+" alt='Collection image described below'>"+
            "<p>"+object.label+" <span class=\"point_to\" onclick=curator.show_image(\""+working_list[i]+
            "\") style=\"float:right\">["+working_list[i]+"]</span></p></div>";
        }
        document.getElementById("display_exhibition").innerHTML = html;
      }
      return "";
    }
    // make_changes if false displays message to make_changes available
    // if true offers to change name of exhibition or the label of any selected object
    // or discard any selected object or close the exhibition completely
    function make_changes(offer){
      if (! offer){
        document.getElementById("change_display").innerHTML = "";
        document.getElementById("change_exhibition_name").innerHTML =
          "<button class=\"changes\" onclick= curator.make_changes(true)>Make exhibition changes</button>";
        document.getElementById("close_exhibition").innerHTML = "<span style=\"float:right\">more about "+
                                "<a href=\"about.html\" class=\"about\">making exhibition changes</a>"+
                                " and about <a href=\"store.html\" class=\"about\"> the exhibition store</a></span>";
        return "";
      }
      if (! exhibition_name){return ""; }
      var length, html, object_number;
      length = working_list.length;
      html = "";
      if (length === 0){html =" <p>Nothing selected</p>"; }
      else{
        for (var i=0; i<length; i++){
          object_number = working_list[i];
          html += "<div>["+object_number+"]<p><textarea contenteditable=\"true\" rows=\"4\" id=\"label_"+
            object_number+"\" class=\"label\">"+
            exhibition_records.selected[object_number].label+"</textarea><br>"+
            "<button class=\"accept\" onclick= curator.modify_selected(\""+
            object_number+"\")>edit label</button> <span class=\"divide\"> OR </span> "+
            "<button class=\"discard\" onclick= curator.discard_selected(\""+
            object_number+"\")>remove object</button></p></div>";
        }
      }
      document.getElementById("change_display").innerHTML = html;
      // offer to change exhibition name
      document.getElementById("change_exhibition_name").innerHTML = 
        "<p><b>Change name of your exhibition</b><br>"+
        "<input type=\"text\" id=\"change_name\" size=32><br><button class=\"changes\" onclick= curator.change_name()>update</button></p>";
      document.getElementById("change_name").value = exhibition_name;
      // offer to close exhibition
      document.getElementById("close_exhibition").innerHTML = 
        "<p><b>To close current exhibition click and then confirm :</b> "+
        "<button class=\"changes\" onclick= curator.close_exhibition()>Close exhibition :</button></p>"+
        "<button class=\"changes\" onclick= curator.make_changes(false)>Hide exhibition changes</button>"+
        "<span style=\"float:right\">more about "+
        "<a href=\"about.html\" class=\"about\">making exhibition changes</a>"+
        " and about <a href=\"store.html\" class=\"about\"> the exhibition store</a></span>";
      return "";
    }
    // modify_selected makes a change to the selected object's label and updates the display
    function modify_selected(object_number){
      var image = exhibition_records.selected[object_number].image;
      var label = rinse(document.getElementById("label_"+object_number).value);
      localStorage.setItem("my_"+object_number,image+"\t"+label);
      exhibition_records.selected[object_number].label = label;
      display_exhibits();
      make_changes(true);
      return "";
    }
    // discard_selected removes the object from the records
    // and from the displays
    function discard_selected(object_number){
      localStorage.removeItem("my_"+object_number);
      delete exhibition_records.selected[object_number];
      display_exhibits();
      make_changes(true);
      return "";
    }
    // change_name updates exhibition name
    function change_name(){
      var name = rinse(document.getElementById("change_name").value);
      if (name){
        localStorage.setItem("myTowneley", name);
        document.getElementById("exhibition_title").innerHTML = "<h3>"+name+"</h3>";
      }
      else{
        document.getElementById("change_name").value = exhibition_name;
      }
      return "";
    }
    // close_exhibition checks for confirmation to 
    // remove all exhibition entries from localStorage and call start
    function close_exhibition(){
      var action = confirm("Are you sure you want to start a new exhibition?");
      if (action){
        localStorage.clear();
        start();
      }
      return "";
    }
// show_large image with buttons to previous, next and return to exhibition display
    function show_image(object_number){
    // show_image displays the object image with the label above togetther with return button
        function display_image(current){
          var object, image, navigation, previous, next, html;
          object = exhibition_records.selected[working_list[current]];
          image = object.image;
          if (working_list.length > 1){
            if (current>0){
              previous = current-1;
              navigation = "<div class=\"navigate\"><span onclick=curator.show_image(\""+working_list[previous]+"\")><b>&lt;</b> previous</span>";
            }
            else{
              navigation = "<div class=\"navigate\"><span>&nbsp;</span>";
            }
            next = current+1;
            if (next<working_list.length){
              navigation += "<span onclick=curator.show_image(\""+working_list[next]+"\") style=\"float:right\">next <b>&gt;</b></span></div>";
            }
            else{
              navigation += "</div>";
            }
          }
          else{
            navigation = "<div class=\"navigate\"> </div>";
          }
          html = "<div><p id=\"return\" onclick=curator.display_exhibits()>Return to Exhibition </p></div>"+navigation+"<img src=images_1200/"+image+" alt=\"Collection image described below\">";
          document.getElementById("show_image").innerHTML = html;
          document.getElementById("show_label").innerHTML ="<p class=\"header\">"+object.label+"</p>";
          document.getElementById("display_exhibition").innerHTML = "";
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
      display_image(current_object);
      return "";
    }
// about for tests
    function about(){
      return { 
        "exhibition_name": exhibition_name, "exhibition_records": exhibition_records,
        "working_list": working_list
      };
    }
    return {
      "start": start,
      "display_exhibits": display_exhibits,
      "make_changes": make_changes,
      "change_name": change_name,
      "modify_selected": modify_selected,
      "discard_selected":discard_selected, 
      "close_exhibition": close_exhibition,
      "show_image": show_image,
      "about": about
    };
  })();
onload = curator.start;
