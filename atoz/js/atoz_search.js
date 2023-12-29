// simple atoz_js search 

var atoz_search = (function(){
	"use strict";
	var version = "1.1",
	version_date = "2023-12-26",
	atoz_list = [],
	cms_list = [],
	search_input;
	function start(){
	document.getElementById("report").innerHTML = "<details class=\"column\"><summary>Search help</summary><h3>Searching a to z entries</h3>You find specific entries by typing in any combination of words and numbers <b>and then pressing the tab or return key</b>. The words are not case sensitive and single letters and two letter words are ignored. Only entries with content matching all the words will be included in a list of links to the entries.<h3>Searching the collection records</h3>If the first search word does not include any numbers, there will also be a search to find matching objects within the collection records. As an example enter abc.</details>";
	document.getElementById("search_box").value = ""; 
	document.getElementById("search_box").autocomplete = "off"
	document.getElementById("search_box").onkeydown = atoz_search.selection;
	}
// selection handles the search box to find entries that match all the input words in lower case using the atoz dictionary
	function selection(e){
		var keyCode, text, words, words_used, collection;
		if (typeof e === "number"){keyCode = e; }
		else{
			keyCode = (window.event) ? event.keyCode : e.keyCode;
		}
		if ( (keyCode === 9) || (keyCode === 13) ){
			search_input = document.getElementById("search_box").value;
			text = rinse(search_input);
			if (! text){
				document.getElementById("search_box").value = "";
				search_input = "";
				document.getElementById("results").innerHTML = "search results";
				return "";
			}
			text = text.toLowerCase(); // atoz dictionary case insensitive
			words = text.split(" ");
			words_used = []
			for (let i = 0; i<words.length; i ++){
				if ((words[i].length>2) && (! atoz_dict['ignore'].includes(words[i]))){ words_used.push(words[i]); }
			}
			atoz_list = using_atoz(words_used);
			cms_list = using_cms(words_used[0]);
			if (atoz_list.length == 0 && cms_list.length == 0){
				if (words_used.length > 0){
					collection = "No entries found for <i>"+words_used.join(' ')+"</i>";
				}
				else{ collection = '"'+text+'" is ignored'; }
			}
			else{
				collection = "<ul>";
				if (atoz_list.length > 0){
					for (let i = 0; i<atoz_list.length; i ++){
						collection = collection +'<li><a href="'+atoz_list[i]+'"> '+atoz_list[i]+'</a></li>'
					}
				}
				if (cms_list.length>0){
					for (let i = 0; i<cms_list.length; i ++){
						collection = collection+'<li><a href="../cms/'+cms_list[i]+'.html?'+words_used[0]+'"> '+cms_list[i]+'.html?'+words_used[0]+'</a></li>'
					}
				}
				collection = collection+"</ul>"
			}
			document.getElementById("results").innerHTML = collection;
		}
		return "";
	}
	
// checks that all words in list appear in atoz dictionary, if so returns link to any entry that matches all words
	function using_atoz(word_list){
		function entry_links(int_list){
			var links = [];
			if (int_list.length == 0){ return []; }
			for (let i = 0; i<int_list.length; i ++){
				links.push(atoz_dict["files"][int_list[i]]);
			}
			return links;
		}

		var old_set;
		if (word_list.length<2){
			if (! (word_list[0] in atoz_dict["words"])){return []; }
			return entry_links(atoz_dict["words"][word_list[0]]); }
		old_set = new Set(atoz_dict["words"][word_list[0]]);
		for (let i = 1; i<word_list.length; i ++){
			if (! (word_list[i] in atoz_dict["words"])){return []; }// all words must be in dictionary
			old_set = join(old_set, atoz_dict["words"][word_list[i]]);
		}
		return entry_links(Array.from(old_set));
	}

	function using_cms(word){
		function cms_entry_links(tag_list){
			var links = [];
			if (tag_list.length == 0){ return []; }
			for (let i = 0; i<tag_list.length; i ++){
				links.push('cms_'+tag_list[i]);
			}
			return links;
		}
		
		var old_set;
			if (! (word in cms_dict)){return []; }
			return cms_entry_links(cms_dict[word]);
	}

// common internal functions
	// returns intersection of set and array of integers
	function join(old_set, new_array){
		var new_set = new Set(new_array);
		var intersect = new Set();
		old_set.forEach(value => {
			if (new_set.has(value)){
				intersect.add(value);
			}
		});
		return intersect;
	}
    /* rinse cleans up user text. Replaces all white space characters by a single space,
    * and trim leading and trailing spaces */
    function rinse(text){
      function trim(string){
          return (string || "").replace(/^\x20+|\x20+$/g,"");
      }
      var clean, parts, i;
      clean = text.replace(/\s\s+/g," ");
      return trim(clean);
    }
// about for tests
	function about(){
	  return { "version": version, "version_date": version_date,
		"atoz_list": atoz_list, "cms_list": cms_list };
	}
	
	return {
	  "start": start,
	  "selection": selection,
//	  "collector": collector,
	  "about": about
	};
  })();
