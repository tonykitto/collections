// simple cms_js collection viewer

var Viewer = (function(){
	"use strict";
	var version = "2.1.1",
	version_date = "2023-11-27",
	collection, // the museum collection object 
	mandatory, // property required for every object in the museum collection
	full_list, // a list of object numbers for all objects in the museum collection
	filtered_list, // subset of full_list according to value of filter_box
	working_list, // filtered_list sorted according to sort_property value
	filter_input, // filter box value
	sort_property, // update_selected_sort handles change of property value list
	names, // object maps object_number to position in working_list
	working_list_number, // points to object_number to be displayed by Viewer
	small_images; //name of directory containing museum object images 
/*	start must be the first Viewer function called and expects, as a parameter,
 *	a validated museum collection object
 *	all the shared variables are initialized in start */
	function start(a_collection){
	  function start_sort_list(){
		// sort_properties returns list of properties from objects
		// the list of properties is in the order of most frequent use
		function sort_properties(objects){
		  var prop_counts, name, prop, list, sorted_list;
		  prop_counts = {};
		  for (name in objects){
			for (prop in objects[name]){
			  if (! (prop in prop_counts)){ prop_counts[prop] = 1; }
			  else{ prop_counts[prop] += 1; }
			}
		  }
		  list = [];
		  for (prop in prop_counts){list.push("_"+prop_counts[prop]+"\t"+prop); }
		  list = nat_sort(list).reverse();
		  sorted_list = [];
		  for (var i=0; i<list.length; i++){ sorted_list.push(list[i].split("\t").pop()); }
		  return sorted_list;
		}
	
		var property_list, select, entry;
		property_list = sort_properties(collection.objects);
		select = "<label for=\"selected_sort\"><b>sort by property</b></label>"+
				 "<select id=\"selected_sort\" "+
				 "onchange=Viewer.update_sort_record(selected_sort.value)>";
		select += "<option value=\"\">object_number</option>";
		for (var i=0; i<property_list.length; i++ ){
		  entry = property_list[i];
		  select += "<option value=\""+entry+"\">"+entry+"</options>";
		}
		document.getElementById("sort").innerHTML = select+"</select>";
		document.getElementById("selected_sort").autocomplete="off";
		return "";
	  }
	
	  var id;
	      document.getElementById("report").innerHTML = "<details class=\"column\"><summary>Search help</summary><h3>Selecting an object number</h3><ul><li>You can select an object to be displayed by typing in the object number and then pressing the tab or return key. If the object number does not match an existing object, the object with the nearest matching object number is selected.</li><li> Alternatively, simply focussing on the object number box and pressing the keyboard up and down arrow keys will display the next higher or lower object number in the list.</li><li>You can move directly to any object by touching the blue object number within the object list.</li></ul><h3>Search contents</h3><p>You find specific objects by typing in keywords <b>and then pressing the tab or return key</b>. Only objects with content matching the keywords will be included in the list. If neither tab nor return key is pressed, the words can later be invoked by select a property value from the property drop-down list(see below).The words are case-insensitive and may be embedded in longer words, eg mark will match St Mark and market. Use double quotes to match case-sensitive sequences, eg \"St M\" to match St Mark and St Mattthew.</p><h3>sort objects by property value</h3><p>You can select any property name from the drop-down list to sort the list by that property's values, filtering out any object with an empty value, for example 'image' lists only objects with an image. The drop-down list is ordered with the least used properties at the bottom of the list.</p><p>If there are any additional keywords waiting in the input keyword box, these are also applied to further reduce the object display list.</p></details>";
	  collection = a_collection;
	  if ("$props" in collection){
		mandatory = collection.$props[0];
	  }
	  else{ return "invalid collection"; }
	  full_list = [];
	  if ("objects" in collection){
		for (id in collection.objects){
		  full_list.push(id);
		}
		full_list = nat_sort(full_list);
	  }
	  filtered_list = full_list;
	  working_list =  full_list;
	  filter_input = "";
	  sort_property = "";
	  names = {};
	  for (var i=0; i<working_list.length; i++){
		names[working_list[i]] = i*1;
	  }
	  working_list_number = 0;
	  if ("image_folder" in collection){
		small_images = "../images_360/"+collection.image_folder;
	  }
	  else{
		  small_images = "../images_360/";
	  }	
	  document.getElementById("filter_box").value = ""; 
	  document.getElementById("filter_box").autocomplete = "off"
	  document.getElementById("filter_box").onkeydown = Viewer.filter_list;
	  document.getElementById("object_number").onkeydown = Viewer.choose_object;
	  document.getElementById("object_number").autocomplete = "off"
	  start_sort_list();
	  display_list();
	  document.getElementById("object_number").value = 
	  working_list[working_list_number];
	  display_object(working_list[working_list_number]);
	  document.getElementById("selected_sort").selectedIndex=0;
	  return "";
	}
/*	display_list sets up list of museum object numbers when called by start,
 *	the display is changed whenever a filter or property sort event occurs 
 *	(via browsing function)or an object is added */
	function display_list(){
	  var html, length, object_number;
	  html = "<h3>"+collection.name+"</h3>"+
	  "<p class=\"centred\">listed "+working_list.length+" of "+full_list.length+
	  " objects</p><ul id=\"disp_list\">";
	  length = working_list.length;
	  for (var i=0; i<length; i++){
		object_number = working_list[i];
		html+= "<li><b class=\"show\" onclick='Viewer.display_object(\""+object_number+"\")' >"+
		  object_number+"</b>: "+collection.objects[object_number][mandatory]+"</li>";
	  }
	  document.getElementById("browser").innerHTML = html+"</ul>";
	  return "";
	}
//	display_object shows all the properties of the museum object plus any related images
	function display_object(object_number){
	  function display_object_list(prop, list){
		var html, i;
		if (list.length === 0){return ""; }
		html = "<li>"+prop+"<ul>";
		for (i=0; i<list.length; i++ ){ html += "<li>"+list[i]+"</li>"; }
		return html+"</ul></li>";
	  }
	  function has_value(object, property){
		if (typeof object[property] === "string"){
		  return "<li>"+property+" : "+object[property]+"</li>";
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

	  var object, image_shown, content, view_groups, group, key_list, group_result;
	  document.getElementById("object_number").value = object_number;
	  working_list_number = names[object_number];
	  object = collection.objects[object_number];
	  image_shown = false;
	  if (("image" in object) && (object.image.toLowerCase().indexOf(".jpg")>0)){
		content = "<img id=\"primary\" alt=\"thumbnail\" src="+small_images+object.image+" />"+
		"<p>"+collection.objects[object_number][mandatory]+"</p>";
		image_shown = true;
	  }
	  else{ content = ""; }
	  document.getElementById("object").innerHTML = content+"</div>";
	  content = "["+object_number+"]";
	  view_groups = collection.$groups;
	  for (var i=0; i<collection.$groups.length; i++ ){
		group = view_groups[i];
		key_list = collection[group];
		if (key_list.length>0){
		  group_result = get_key_values(object, key_list);
		  if (group_result){
			content += "<ul>"+group_result+"</ul>";
		  }
		}
	  }
	  if ("$tags" in collection.objects[object_number]){
		content += "<ul>"+has_value(collection.objects[object_number],"$tags")+"</ul>";
	  }
	  document.getElementById("details").innerHTML = content+"</div>";
	  if (working_list_number === 0){
		document.getElementById("browser").firstChild.scrollIntoView();
	  }
	  else{
		document.getElementById("disp_list").children[working_list_number].scrollIntoView();
	  }
	  document.body.scrollIntoView();
	  return "";
	}
// choose_object handles user input to select the next museum object to display	   
	function choose_object(e){
	  function best_match(text){
		function match(x, y){
		  if (x.charAt(0) !== y.charAt(0)){ return 0; }
		  if (x.length === 1){ return 1; }
		  if (y.length === 1){ return 1; }
		  return 1 + match(x.slice(1), y.slice(1));
		}
		
		var best_count = text.length;
		var nearest = working_list[0];
		var current_count = match(text, nearest);
		if (current_count === best_count){ return nearest; }
		var length = working_list.length;
		var latest = "";
		var count = 0;
		for (var i=1; i<length; i++ ){
		  latest = working_list[i];
		  count = match(text, latest);
		  if (count === best_count){ return latest; }
		  if (count > current_count){
			current_count = count;
			nearest = latest;
		  }
		}
		return nearest;
	  }
	  
	  var keyCode, text, object_number;
	  if (typeof e === "number"){keyCode = e; }
	  else{
		keyCode = (window.event) ? event.keyCode : e.keyCode;
	  }
	  if ((keyCode === 9) || (keyCode === 13)){
		text = rinse(document.getElementById("object_number").value);
		if (text in names){ object_number = text; }
		else{ object_number = best_match(text); }
	  }
	  else if (keyCode === 40){
		if (working_list_number < (working_list.length-1)){
		  working_list_number += 1;
		  object_number = working_list[working_list_number];
		}
		else{ return ""; }
	  }
	  else if (keyCode === 38){
		if (working_list_number > 0){
		  working_list_number -= 1;
		  object_number = working_list[working_list_number];
		}
		else{ return ""; }
	  }
	  else{ return ""; }
	  document.getElementById("object_number").value = object_number;
	  display_object(object_number);
	  return "";
	}
// filter_list handles the filter box to select which objects to retain in the display list	 
	function filter_list(e){
	  // match_tags returns list of object_numbers where $tags matches a list of tags
	  function match_tags(objects, candidates, tags){
		var list, i, values, j, tag, match, k, value;
		list = [];
		for (i=0; i<candidates.length; i += 1){
		  if ("$tags" in objects[candidates[i]]){
			values = objects[candidates[i]].$tags;
			for (j=0; j<tags.length; j += 1){
			  tag = tags[j];
			  match = false;
			  for (k=0; k<values.length; k += 1){
				value = values[k].toLowerCase();
				if (value === tag){
				  match = true;
				  break;
				}
			  }
			  if (! match){ break; }
			}
			if (match){ list.push(candidates[i]); }
		  }
		}
		return list;
	  }
	  // match_string returns object_numbers where string matches a property value
	  // if lower_case is true, match is case insensitive
	  function match_string(objects, list, string, lower_case){
		var matches, list_length, i, object, property, value;
		matches = [];
		list_length = list.length;
		for (i=0; i<list_length; i++){
		  object = objects[list[i]];
		  for (property in object){
			if (property.charAt(0) !=="$"){
			  value = object[property];
			}
			else{
			  if (property !== "$tags"){ // $tags only matched against #keyword
				value = object[property].join("\t");
			  }
			}
			if (lower_case){ value = value.toLowerCase(); }
			if (value.indexOf(string)>=0){
			  matches.push(list[i]);
			  break;
			}
		  }
		}
		return matches;
	  }
	  // extract_quotes removes quoted strings from text and returns both in object
	  function extract_quotes(text){
		var quotes, input, strings, quote, endquote, string;
		quotes = true;
		input = text;
		strings = [];
		while (quotes){
		  quote = input.indexOf("\"");
		  if (quote<0){ quotes = false; }
		  else{
			endquote = input.slice(quote+1).indexOf("\"");
			if (endquote<0){
			  string = input.slice(quote+1);
			  if (string){ strings.push(string); }
			  input = input.slice(0, quote);
			  quotes = false;
			}
			else{
			  string = input.slice(quote+1, quote+endquote+1);
			  if (string){
				strings.push(string);
				input = input.slice(0, quote)+" "+input.slice(quote+endquote+2);
			  }
			  else{
				  input = input.slice(0, quote)+" "+input.slice(quote+endquote+2);
			  }
			}
		  }
		}
		return {"quoted": strings, "remainder": input};
	  }
	
	  var keyCode, text, strings, quotes, keywords, tags, keys, local_list;
	  if (typeof e === "number"){keyCode = e; }
	  else{
		keyCode = (window.event) ? event.keyCode : e.keyCode;
	  }
	  if ( (keyCode === 9) || (keyCode === 13) ){
		filter_input = document.getElementById("filter_box").value;
		text = rinse(filter_input);
		if (! text){
		  document.getElementById("filter_box").value = "";
		  filter_input = "";
		  filtered_list = full_list;
		  if (sort_property){ update_sort_record(sort_property); }
		  else{
			working_list = full_list;
			browsing();
		  }
		  return ""; 
		}
		if (text in collection.objects){ 
		  local_list = [text]; 
		}
		else{
		  strings = extract_quotes(text);
		  quotes = strings.quoted;
		  keywords = strings.remainder.match(/\S+/g); // words separated by white space to array
		  if (! keywords){ keywords = []; }
		  tags = [];
		  keys = [];
		  for (var i=0; i<keywords.length; i += 1){
			if (keywords[i].charAt(0) === "#"){
			  tags.push(keywords[i].slice(1).toLowerCase()); // remove # prefix
			}
			else{ keys.push(keywords[i].toLowerCase()); }
		  }
		  if (tags.length > 0 ){
			local_list = match_tags(collection.objects, full_list, tags);
		  }
		  else{ local_list = full_list;}
		  if ((local_list.length > 0) && (keys.length > 0)){
			for (var j=0; j<keys.length; j+= 1){
			  local_list = match_string(collection.objects, local_list, keys[j], true);
			}
		  }
		  if ((local_list.length >0) && (quotes.length>0)){
			for (var k=0; k<quotes.length; k += 1){
			  local_list = match_string(collection.objects, local_list, quotes[k], false);
			}
		  }
		}
		if (local_list.length >0){
		  filtered_list = local_list;
		  if (! sort_property){
			working_list = local_list;
			browsing();
		  }
		  else{
			update_sort_record(sort_property);
		  }
		}
		else{
		  alert("No records matching "+text+" found");
		  document.getElementById("filter_box").value = "";
		  filter_input = "";
		  filtered_list = full_list;
		  update_sort_record(sort_property);
		}
	  }
	  return "";
	}
/*	update_sort_record first processes any outstanding filter_box value, then
 *	the filtered_list is filtered and sorted according to the sort_property.
 *	If the resulting sorted list is empty, the sort property reverts to the
 *	previous sort property value or discards the sort */  
	function update_sort_record(property){
	  function discard_sort(){
		sort_property = "";
		document.getElementById("selected_sort").value = "";
		working_list = filtered_list;
		browsing();
		return "";
	  }
	
	  var current_filter, old_sort;
	  current_filter = document.getElementById("filter_box").value;
	  if (current_filter !== filter_input){ filter_list(13); }
	  if (! property){ // object_number only
		discard_sort();
		return "";
	  }
	  old_sort = sort_property;
	  sort_property = property;
	  working_list = objects_sorted_list();
	  if (working_list.length > 0){ browsing(); }
	  else{ 
		alert("The currently selected objects have no sort property "+sort_property);
		if (old_sort !== sort_property){
		  document.getElementById("selected_sort").value = old_sort;	 
		  update_sort_record(old_sort);
		}
		else{ discard_sort(); }
	  }
	  return "";
	}
// current_object_number returns the object_number of the museum object being display		
	function current_object_number(){
	  return working_list[working_list_number];
	}
// last_object_number returns the value to be logical increased by the next object added	
	function last_object_number(){
	  if (typeof full_list === "object"){
		return full_list[full_list.length-1];
	  }
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
/*	nat_sort takes an array of strings and returns a new array formed by 
 *	sorting a copy of the parameter using the built-in sort function to 
 *	generate alphanumeric strings in natural order. */
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
/*	browsing resets names whenever working_list changes and updates 
 *	the list and object displays to show the first object in the list */				
	function browsing(){
	  names = {};
	  for (var i=0; i<working_list.length; i++){
		names[working_list[i]] = i*1;
	  }
	  working_list_number = 0;
	  display_list();
	  document.getElementById("object_number").value = working_list[working_list_number];
	  display_object(working_list[working_list_number]);
	  return "";
	}	 
/* objects_sorted_list returns the filtered_list sorted according to the sort_property
 * value. Objects without the sort_property are omitted .
 */	  
	function objects_sorted_list(){
	  var list, prop_name, prop_value, sorted_list;
	  list = [];
	  for (var i=0; i<filtered_list.length; i++ ){
		prop_name = "";
		if (sort_property in collection.objects[filtered_list[i]]){
		  prop_value = collection.objects[filtered_list[i]][sort_property];
		  if (prop_value){ prop_name = prop_value+"\t"+prop_name; }
		}
		if (prop_name){ list.push(prop_name+"\t"+filtered_list[i]); }
	  }
	  sorted_list = nat_sort(list);
	  list = []; // remove property headers
	  for (var j=0; j<sorted_list.length; j++ ){
		list.push(sorted_list[j].split("\t").pop());
	  }
	  return list;
	}
// about for tests
	function about(){
	  return { "version": version, "version_date": version_date,
		"collection": collection, "mandatory": mandatory,
		"full_list": full_list,"filtered_list": filtered_list,
		"working_list": working_list,"filter_input": filter_input,
		"sort_property": sort_property,
		"names": names, "working_list_number": working_list_number,
		"small_images": small_images
	  };
	}
	
	return {
	  "start": start,
	  "display_list": display_list,
	  "display_object": display_object,
	  "choose_object": choose_object,
	  "filter_list": filter_list,
	  "update_sort_record": update_sort_record,
	  "current_object_number": current_object_number,
	  "browsing": browsing,
	  "last_object_number": last_object_number,
	  "about": about
	};
  })();
