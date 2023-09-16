// collector simply displays a text record of the current My Towneley exhibition
var collector = (function(){
    "use strict";
    var version = "0.1", version_date = "2020-04-08",
        exhibition_name = "", // the value of the localStorage item myTowneley
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
        document.getElementById("exhibition_title").innerHTML = "<h3>There is no exhibition to display</h3>";
      }
      else{
        exhibition_name = localStorage.myTowneley;
        document.getElementById("exhibition_title").innerHTML = "<h3>"+exhibition_name+"</h3>";
        load_exhibition_records();
        record_exhibits();
      }
      return "";
    }
// sorts selected objects according to object labels and displays them
    function record_exhibits(){
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
      if (length === 0){
        document.getElementById("record_exhibition").innerHTML =
          "<h3>There have not been any objects selected for display</h3>";
      }
      else{
        html = "<ul>";
        for (var i=0; i<length; i++){
          object = exhibition_records.selected[working_list[i]];
          html += "<li>"+working_list[i]+": "+object.image+" "+object.label+"</li>";
        }
        document.getElementById("record_exhibition").innerHTML = html+"</ul>";
      }
      return "";
    }
    // make_changes if false displays message to make_changes available
    // if true offers to change name of exhibition or the label of any selected object
    // or discard any selected object or close the exhibition completely
// common internal functions
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
// about for tests
    function about(){
      return { 
        "version": version, "version_date": version_date,
        "exhibition_name": exhibition_name, "exhibition_records": exhibition_records
      };
    }
    
    return {
      "start": start,
      "record_exhibits": record_exhibits,
      "about": about
    };
  })();
onload = collector.start;
