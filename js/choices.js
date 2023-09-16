// chices displays other exhibition from objects in the Towneley collections
// version 0.0 02/05/2020
var choices = (function(){
    "use strict";
    var exhibition_name = "", // the value of the localStorage item myTowneley
        exhibition_records = {}, // records received at start
        working_list = []; // working_list updated by display_exhibits
    function start(records){
      document.getElementById("report").innerHTML = "";
      exhibition_records = records;
      exhibition_name = exhibition_records.name;
      document.getElementById("exhibition_title").innerHTML = "<h3>"+exhibition_name+"</h3>";
      display_exhibits();
      return "";
    }
  // common internal functions
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
            "<p>"+object.label+" <span class=\"point_to\" onclick=choices.show_image(\""+working_list[i]+
            "\") style=\"float:right\">["+working_list[i]+"]</span></p></div>";
        }
        document.getElementById("display_exhibition").innerHTML = html;
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
              navigation = "<div class=\"navigate\"><span onclick=choices.show_image(\""+working_list[previous]+"\")><b>&lt;</b> previous</span>";
            }
            else{
              navigation = "<div class=\"navigate\"><span>&nbsp;</span>";
            }
            next = current+1;
            if (next<working_list.length){
              navigation += "<span onclick=choices.show_image(\""+working_list[next]+"\") style=\"float:right\">next <b>&gt;</b></span></div>";
            }
            else{
              navigation += "</div>";
            }
          }
          else{
            navigation = "<div class=\"navigate\"> </div>";
          }
          html = "<div><p id=\"return\" onclick=choices.display_exhibits()>Return to Exhibition </p></div>"+navigation+"<img src=images_1200/"+image+" alt=\"Collection image described below\">";
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
        "exhibition_name": exhibition_name,
        "exhibition_records": exhibition_records,
        "working_list": working_list
      };
    }
    return {
      "start": start,
      "display_exhibits": display_exhibits,
      "show_image": show_image,
      "about": about
    };
  })();
