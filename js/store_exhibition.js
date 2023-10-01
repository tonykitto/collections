// exhibition store loads and stores exhibition text files
// version 1.0 21/04/2020
var record = (function(){
  "use strict";
  var exhibition_name = "", // the value of the localStorage item myTowneley
    exhibition_records = {}, // load_exhibition_records at start
    working_list = [], // working_list updated by display_exhibits
    new_exhibition_name = "", // from first line of selected text file
    new_exhibition_records = {}, // from selected text file
    file_name = "";
  function start(){
      function test_localStorage(){
        try {
          var key = "testing_localStorage";
          localStorage.setItem(key, key);
          localStorage.removeItem(key);
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
        record.exhibition_records = {}; // shared variable within curator
        var length = localStorage.length;
        var object_name, object_number, object_label, tab, candidates;
        record.exhibition_records.name = record.exhibition_name; 
        record.exhibition_records.selected = {}; 
        candidates = []; 
        for (var i = 0; i<length; i += 1){
          object_name = localStorage.key(i);
          if (object_name.slice(0,3) == "my_" || object_name.slice(0,3) == "Ty_"){
            object_number = object_name.slice(3);
            if (object_name.slice(0,3) == "Ty_"){ candidates.push(object_number); }
            record.exhibition_records.selected[object_number]={};
            object_label = localStorage.getItem(object_name);
            tab = object_label.indexOf("\t");
            record.exhibition_records.selected[object_number].image = object_label.slice(0, tab);
            record.exhibition_records.selected[object_number].label = object_label.slice(tab+1);
          } // discard anything not starting with Ty_ or my_
        }
        for (var j in candidates){
          localStorage.setItem("my_"+candidates[j], localStorage.getItem("Ty_"+candidates[j]));
          localStorage.removeItem("Ty_"+candidates[j]);
        }
        return "";
      }
      function record_exhibits(){
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
          for (object_number in record.exhibition_records.selected){
            label = record.exhibition_records.selected[object_number].label;
            selected_list.push(label+"\t"+object_number);
          }
          sorted_list = nat_sort(selected_list);
          selected_list = [];
          for (var j=0; j<sorted_list.length; j++ ){
            selected_list.push(sorted_list[j].split("\t").pop());
          }
          return selected_list;
        }
        record.working_list = sort_selected();
        var length = record.working_list.length;
        var object = {};
        if (length === 0){
          document.getElementById("current_records").innerHTML =
            "<h3>There have not been any objects selected for display</h3>";
        }
        else{
          var html = "<h2>Exhibition Store</h2>"+
          "<h4>Current exhibition</h4><ul>myTowneley: "+record.exhibition_name;
          for (var i=0; i<length; i++){
            object = record.exhibition_records.selected[record.working_list[i]];
            html += "<li>"+record.working_list[i]+": "+object.image+" "+object.label+"</li>";
          }
          document.getElementById("current_records").innerHTML = html+"</ul>";
        }
        return "";
      }
      function current_download(){
        function exhibition_record_text(){
          var records = record.exhibition_records;
          var text = "myTowneley: "+records.name+"\n";
          for (var select in records.selected){
            text += select+": "+records.selected[select].image+" "+records.selected[select].label+"\n";
          }
          return text;
        }
        var filename = record.exhibition_name+".txt";
        document.getElementById("downloading").innerHTML = "<p>The current exhibition <span class=\"name\">"+
          record.exhibition_name +"</span> can be <a id=\"download_link\" download=\""+filename+
          "\" href=\”\” > downloaded as a text File</a> to your filestore.</p><hr>";
        var text = exhibition_record_text();
        var data = new Blob([text], {type: 'text/plain'});
        var url = window.URL.createObjectURL(data);
        document.getElementById('download_link').href = url;
        return "";
      } 

    var version = "0.0", date = "2020-04-12";
    document.getElementById("report").innerHTML = "load Version "+version+" ["+date+"]";
    document.getElementById("selected_records").innerHTML = "";
    document.getElementById("loading").innerHTML = "";
    document.getElementById("fileInput").value = "";
    document.getElementById("report").innerHTML = "";
    if (! test_localStorage()){ 
      document.getElementById("report").innerHTML = "localStorage not available";
      return"";
    }
    if (! localStorage.myTowneley){
      document.getElementById("current_records").innerHTML = "<h3>There is no exhibition to display</h3>";
    }
    else{
      record.exhibition_name = localStorage.myTowneley;
      load_exhibition_records();
      record_exhibits();
      current_download();
    }
    return "";
  }
  function replace_exhibition(){
    localStorage.setItem("myTowneley",record.new_exhibition_records.name);
    var old_records = record.exhibition_records;
    var new_records = record.new_exhibition_records;
    for (var remove in old_records.selected){
      localStorage.removeItem("my_"+remove);
    }
    for (var add in new_records.selected){
      localStorage.setItem("my_"+add,
                           new_records.selected[add].image+"\t"+new_records.selected[add].label);
    }
    record.start();
    return "";
  }
  function discard_selection(){
    document.getElementById("selected_records").innerHTML = "";
    document.getElementById("loading").innerHTML = "";
    document.getElementById("fileInput").value = "";
    return "";
  }
  function handleFiles(files){
    var reader;
    reader = new FileReader();
    reader.readAsText(files[0]);
    reader.onload = record.checks;
  }
  function checks(evt){
    function valid_text(text){
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
      
      var fake = document.getElementById("fileInput").value;
      var filename = fake.slice(fake.lastIndexOf("\\")+1);
      var tag = filename.slice(filename.lastIndexOf(".")+1);
      if (tag != "txt"){throw({"name":filename, "message": "not a text file"}); }
      var lines = text.split("\n");
      var length= lines.length;
      if (length<2 || length>999){throw({"name":filename, "message": "not an exhibition file"}); }
      var name = rinse(lines[0]);
      if (name.indexOf("myTowneley:") !== 0){throw({"name":filename, "message": "does not start MyTowneley:"}); }
      record.new_exhibition_name = name.slice(name.indexOf(" ")+1);
      record.new_exhibition_records = {};
      record.new_exhibition_records.name = record.new_exhibition_name;
      record.new_exhibition_records.selected = {};
      var line, object, remainder, image, label;
      for (var i = 1; i<length; i += 1){
        line = rinse(lines[i]);
        if (line.length === 0){continue; }
        object = line.slice(0, line.indexOf(": "));
        if (object.length<2){throw({"name": filename, message: "invalid line "+ lines[i]}); }
        remainder = line.slice(object.length+2);
        image = remainder.slice(0, remainder.indexOf(" "));
        if (image.slice(-4) != ".jpg"){throw({"name": filename, message: "missing image "+lines[i]}); }
        label = remainder.slice(image.length+1);
        record.new_exhibition_records.selected[object] = {};
        record.new_exhibition_records.selected[object].image = image;
        record.new_exhibition_records.selected[object].label = label;
      }
      return "";
    }
    // sorts selected objects according to object labels and displays them
    function display_selected_text(){
      var records = record.new_exhibition_records;
      var html = "<h3>Selected records</h3><ul>myTowneley: "+records.name;
      for (var select in records.selected){
        html += "<li>"+select+": "+records.selected[select].image+" "+records.selected[select].label+"</li>";
      }
      document.getElementById("selected_records").innerHTML = html+"</ul>";
      document.getElementById("loading").innerHTML = 
        "<button class=\"load\" onclick=record.replace_exhibition()>Replace exhibition</button>"+
        "<button class=\"discard\" onclick=record.discard_selection()>Discard selection</button>";
      return "";
    }
    
    var file = evt.target.result;
    document.getElementById("selected_records").innerHTML = "";
    document.getElementById("loading").innerHTML = "";
    try{    
      valid_text(file);
    }
    catch(arg){
      document.getElementById("report").innerHTML = "Failed "+
        arg.name+" : "+arg.message;
      return "";
    }
    display_selected_text();
    return "";
  }

  return {
    "start": start,
    "replace_exhibition": replace_exhibition,
    "discard_selection": discard_selection, 
    "handleFiles": handleFiles,
    "checks": checks
  };
})();
onload = record.start;
