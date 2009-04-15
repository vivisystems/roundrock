// SQLiteManager extension
var sQuerySelectInstruction = "(Select a Query)";
var Database = new SQLiteHandler();

var smStructTrees = [];
smStructTrees[0] = new TreeDbStructure("t-dbStructNorm", "tc-dbStructNorm", 0);

var treeBrowse = new TreeDataTable("browse-tree");
var treeExecute = new TreeDataTable("treeSqlOutput");

var smExtManager = null;

var SQLiteManager = {
  prefs: null,

  miDbObjects: 0,
  //for display in the browse tree
  miLimit: -1,
  miOffset: 0,
  miCount: 0,

  maSortInfo: [],
  msBrowseObjName: null,
  msBrowseCondition: null,

  // Currently selected database file (nsIFile)
  sCurrentDatabase: null, 

  //an array containing names of current table, index, view and trigger
  aCurrObjNames: [],

  //to store the latest selection in tree showing db objects
  mostCurrObjName: null,
  mostCurrObjType: null,

  mbDbJustOpened: true,
  // an array of 4 arrays;
  // each holding names of tables, indexes, views and triggers
  aObjNames: [],
  aObjTypes: ["master", "table", "view", "index", "trigger"],

  clipService: null,      // Clipboard service: nsIClipboardHelper

  // Status bar: panels for displaying various info
  sbPanel: [],

  //store extension pertaining mgmt info externally/internally
  m_bMgmtDataIsInDb: true,

  maFileExt: [],

  //the mru list which is stored in a pref
  maMruList: [],

  experiment: function() {
    SmExim.loadDialog("import", "d-mainarea");
    return true;

  var tt = "";
  for (var i in document.documentElement)
    if (typeof document.documentElement[i] != "function")
    tt += i + "=" + document.documentElement[i] + "\n";
  sm_confirm("", tt);

  var st =  "position:absolute;" +
            "top:" + document.documentElement.clientTop + "px;" +
            "left:" + document.documentElement.clientLeft + "px;" +
            "width:" + document.documentElement.clientWidth + "px;" +
            "height:" + document.documentElement.clientHeight + "px;";
            alert(st);
           alert(document.documentElement.offsetTop);
    var vb = document.createElement("vbox");
    document.documentElement.appendChild(vb);
    vb.setAttribute("style", st);
    //document.getElementById("sbFull").setAttribute("top", 0);
  },

  // Startup: called ONCE during the browser window "load" event
  Startup: function() {
    $$("experiment").hidden = true;
    //create the menus by associating appropriate popups
    this.createMenu();

    g_smBundle = $$("sm-bundle");

    //initialize the structure tree
 		smStructTrees[0].init();

    this.refreshDbStructure();

    treeBrowse.init();
    treeExecute.init();

    var mi = $$("menu-general-sharedPagerCache");

    this.showMruList();

    // Load clipboard service
    this.clipService = Cc["@mozilla.org/widget/clipboardhelper;1"]
       .getService(Ci.nsIClipboardHelper);

    //get the nodes for Status bar panels
    this.sbPanel["display"] = $$("sbPanel-display");
    //global var in globals.js for sbpanel[display]
    gSbPanelDisplay = this.sbPanel["display"];

    $$("sbExtVersion").setAttribute("label", gExtVersion);

    //display whether we are using Gecko 1.9+ in the status bar (Issue#35)
    var sbGeckoVersion = $$("sbGeckoVersion");
    sbGeckoVersion.setAttribute("label","Gecko " + gAppInfo.platformVersion);

		$$("vb-structureTab").hidden = true;
		$$("vb-browseTab").hidden = true;
		$$("vb-executeTab").hidden = true;
		$$("vb-dbInfoTab").hidden = true;

    //preferences service to add oberver
    // and then observe changes via the observe function
    //see http://developer.mozilla.org/en/docs/Adding_preferences_to_an_extension
    //initialize the preference service with the correct branch
    this.prefs = sm_prefsBranch;
    //query interface to be able to use addObserver method
    this.prefs.QueryInterface(Ci.nsIPrefBranch2);
    //now, add the observer which will be implemented using observe method
    //calling removeObserver when done with observing helps the memory
    this.prefs.addObserver("", this, false);

    var iNumRecords = sm_prefsBranch.getIntPref("displayNumRecords");
    if (iNumRecords == -1)
      sm_prefsBranch.setIntPref("displayNumRecords", 100);
    //manage changes when the following preferences change.
    //although the this.observe function handles the observer
    //calling these functions reduces the size of the code
    //It is like fooling observe into believing that the following
    //preferences have changed.
    var chPrefs = ["hideMainToolbar", "showMainToolbarDatabase",
      "showMainToolbarTable", "showMainToolbarIndex", "sqliteFileExtensions",
      "displayNumRecords", "textForBlob", "showBlobSize", "mruPath.1",
      "posInTargetApp" /* this one for firefox only*/,
      "handleADS" /* this one for Windows only*/ ];
    for(var i = 0; i < chPrefs.length; i++)
      this.observe("", "nsPref:changed", chPrefs[i]);

    // opening with last used DB if preferences set to do so
    var bPrefVal = sm_prefsBranch.getBoolPref("openWithLastDb");
		if(bPrefVal) {
			var sPath = this.getMruLatest();
			if(sPath != null) {
				//Last used DB found, open this DB
				var newfile = Cc["@mozilla.org/file/local;1"]
              .createInstance(Ci.nsILocalFile);
				newfile.initWithPath(sPath);
				//if the last used file is not found, bail out
				if(!newfile.exists()) {
					smPrompt.alert(null, sm_getLStr("extName"), sm_getLStr("lastDbDoesNotExist") + sPath);
				  return;
				}
				bPrefVal = sm_prefsBranch.getBoolPref("promptForLastDb");
				if(bPrefVal) {
					var check = {value: false}; // default the checkbox to false
					var result = smPrompt.confirmCheck(null, sm_getLStr("extName") + " - " + sm_getLStr("promptLastDbTitle"),
					       sm_getLStr("promptLastDbAsk")+ "\n" + sPath + "?",
                 sm_getLStr("promptLastDbOpen"), check);

					if(!result)
						return;
					//update the promptForLastDb preference
					bPrefVal = sm_prefsBranch.setBoolPref("promptForLastDb", !check.value);
				}
				//assign the new file (nsIFile) to the current database
				this.sCurrentDatabase = newfile;
				this.setDatabase(this.sCurrentDatabase);
			}
		}
		//load the previously opened tab
    this.loadTabWithId(this.getSelectedTabId());
		return;
  },

  // Shutdown: called ONCE during the browser window "unload" event
  Shutdown: function() {
    //close the current database
    this.closeDatabase(false);
    //Destruction - this should be fired once you're done observing
    //Failure to do so may result in memory leaks.	
    this.prefs.removeObserver("", this);

    this.clipService= null;
  },  

	createMenu: function() {
		var suffixes = ["table", "index", "view", "trigger"];
		for(var i = 0; i < suffixes.length; i++) {
		  var suffix = suffixes[i];
		  var mp = $$("mp-" + suffix);
		  var clone = mp.cloneNode(true);
		  clone.setAttribute("id", "mp-main-" + suffix);
		  var menu = $$("menu-" + suffix);
		  ClearElement(menu);
		  menu.appendChild(clone);
		}
	  var mpdb = $$("mp-dbstructure");
		for(var i = 0; i < suffixes.length; i++) {
		  var suffix = suffixes[i];
		  var mp = $$("mp-" + suffix);
		  var ch = mp.childNodes;
      for (var c = 0; c < ch.length; c++) {
  		  var clone = ch[c].cloneNode(true);
  		  clone.setAttribute("smType", suffix);
        mpdb.appendChild(clone);
      }
		  var mp = $$("mp-create-" + suffix);
		  var ch = mp.childNodes;
      for (var c = 0; c < ch.length; c++) {
  		  var clone = ch[c].cloneNode(true);
  		  clone.setAttribute("smType", "create-" + suffix);
        mpdb.appendChild(clone);
      }
		}
	},

	changeDbSetting: function(sSetting) {
		var node = $$("pr-" + sSetting);
		var sVal = node.value;
		var newVal = Database.setSetting(sSetting, sVal);
		node.value = newVal;
	},
		
	setTreeStructureContextMenu: function() {
		var tree = $$(smStructTrees[this.miDbObjects].treeId);
		var idx = tree.currentIndex;
		// idx = -1 if nothing is selected; says xulplanet element reference
		if(idx == -1)
			idx = 0;
		var objName = tree.view.getCellText(idx, tree.columns.getColumnAt(0));
		var level = tree.view.getLevel(idx);
 		var info = smStructTrees[this.miDbObjects].getSmType(idx);

		//there is a database object at level 1 only
		var mpId = "";
		if (level == 0) {
  		if(info.indexOf("all-") == 0) {
        info = info.substring("all-".length).toLowerCase();
  			if (this.aObjTypes.indexOf(info) > 0) //thus omit master
          mpId = "create-" + info;
			}
		}	
		if (level == 1) {
 			if (this.aObjTypes.indexOf(info) != -1)
   	    mpId = info;
    }
	  var mpdb = $$("mp-dbstructure");
	  var ch = mpdb.childNodes;
		for(var i = 0; i < ch.length; i++) {
		  var suffix = ch[i].getAttribute("smType");
		  if (suffix == mpId)
		    ch[i].hidden = false;
      else
		    ch[i].hidden = true;
		}
  },

  setMruList: function(sPath) {
    var iMruSize = sm_prefsBranch.getIntPref("mruSize");
    var aNewList = [];
    var aPrefList = [];

    var fDir = Cc["@mozilla.org/file/directory_service;1"]
            .getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);
    if (sPath.indexOf(fDir.path) == 0) {
      var sRelPath = "[ProfD]" + sPath.substring(fDir.path.length);
      aNewList.push(sRelPath);
    } else {
      aNewList.push(sPath);
    }

    for (var i = 0; i < this.maMruList.length; i++) {
      if (this.getMruFullPath(this.maMruList[i]) != sPath)
        aNewList.push(this.maMruList[i]);

      if (aNewList.length >= iMruSize)
        break;
    }
    this.maMruList = aNewList;

    sm_setUnicodePref("mruPath.1", this.maMruList.join(","));
    this.showMruList();
  },

  removeFromMru: function(sPath) {
    for (var i = 0; i < this.maMruList.length; i++) {
      if (this.getMruFullPath(this.maMruList[i]) == sPath) {
        this.maMruList.splice(i, 1);
        sm_setUnicodePref("mruPath.1", this.maMruList.join(","));
        this.showMruList();
        return true;
      }
    }
    return false;
  },

  getMruLatest: function() {
    var sMru = sm_prefsBranch.getComplexValue("mruPath.1", Ci.nsISupportsString).data;
    this.maMruList = sMru.split(",");
    if (this.maMruList.length > 0)
      return this.getMruFullPath(this.maMruList[0]);
    else
      return null;
  },

  getMruFullPath: function(sMruVal) {
    var sRelConst = "[ProfD]";
    var fDir = Cc["@mozilla.org/file/directory_service;1"]
            .getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);

    var sFullPath = sMruVal;
    if (sFullPath.indexOf(sRelConst) == 0)
      sFullPath = fDir.path + sFullPath.substring(sRelConst.length);

    return sFullPath;
  },

  showMruList: function() {
    this.getMruLatest();

    var menupopupNode = $$("menu-mru").firstChild;
    ClearElement(menupopupNode);
    for (var i = 0; i < this.maMruList.length; i++) {
      var sFullPath = this.getMruFullPath(this.maMruList[i])

		  var mp = $$("mi-mru");
		  var mi = mp.cloneNode(true);
		  mi.setAttribute("id", "mi-mru-" + i);
  	  mi.setAttribute("label", sFullPath);
  	  mi.removeAttribute("hidden");
      menupopupNode.appendChild(mi);
    }
  },

	observe: function(subject, topic, data) {
		if (topic != "nsPref:changed")
			return;
		
		switch(data) {
			case "hideMainToolbar":
				var bPrefVal = sm_prefsBranch.getBoolPref("hideMainToolbar");
				$$("hbox-main-toolbar").hidden = bPrefVal;
				break;
			case "showMainToolbarDatabase":
				var bPrefVal = sm_prefsBranch.getBoolPref("showMainToolbarDatabase");
				$$("sm-toolbar-database").hidden = !bPrefVal;
				break;
			case "showMainToolbarTable":
				var bPrefVal = sm_prefsBranch.getBoolPref("showMainToolbarTable");
				$$("sm-toolbar-table").hidden = !bPrefVal;
				break;
			case "showMainToolbarIndex":
				var bPrefVal = sm_prefsBranch.getBoolPref("showMainToolbarIndex");
				$$("sm-toolbar-index").hidden = !bPrefVal;
				break;
			case "sqliteFileExtensions":
				var sExt = sm_prefsBranch.getCharPref("sqliteFileExtensions");
				this.maFileExt = sExt.split(",");
				for (var iC = 0; iC < this.maFileExt.length; iC++) {
				  this.maFileExt[iC] = this.maFileExt[iC].replace(/^\s+/g, '')
                                                  .replace(/\s+$/g, '');
				}
        // Load profile folder's sqlite db files list into dropdown 
				this.populateDBList("profile");   
				break;
			case "searchToggler":
				var sPrefVal = sm_prefsBranch.getCharPref("searchCriteria");
				this.msBrowseCondition = sPrefVal;
				//empty the criteria after use for security
				sm_prefsBranch.setCharPref("searchCriteria", "");
				this.loadTabBrowse();
				break;
			case "displayNumRecords":
				var iPrefVal = sm_prefsBranch.getIntPref("displayNumRecords");
				this.miLimit = iPrefVal;
				if (this.miLimit == 0) this.miLimit = -1;
				this.miOffset = 0;
				break;
			case "textForBlob":
				g_strForBlob = sm_prefsBranch.getCharPref("textForBlob");
				break;
			case "showBlobSize":
				g_showBlobSize = sm_prefsBranch.getBoolPref("showBlobSize");
				break;
			case "handleADS": //for ADS on Windows/NTFS
        $$("mi-connect-ads-win").hidden = true;
        if (navigator.oscpu.indexOf("Windows") >= 0) {
          var iPrefVal = sm_prefsBranch.getIntPref("handleADS");
          if (iPrefVal == 1)
            $$("mi-connect-ads-win").hidden = false;
        }
        break;
			case "posInTargetApp":
      var appInfo = Cc["@mozilla.org/xre/app-info;1"]
                        .getService(Ci.nsIXULAppInfo);
      if(appInfo.ID == "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}") {
        var md = window.QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIWebNavigation)
          .QueryInterface(Ci.nsIDocShellTreeItem).rootTreeItem
          .QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIDOMWindow).document;
        var iVal = sm_prefsBranch.getIntPref("posInTargetApp");
        var mi = md.getElementById("menuitem-sqlitemanager");
        if (mi) {
          if (iVal == 0)
            mi.setAttribute("hidden", true);
          if (iVal == 1)
            mi.setAttribute("hidden", false);
        }
      }
    }
  },

  refresh: function() {
    if (this.sCurrentDatabase == null)
    	return false;
    this.refreshDbStructure();
    return true; 
  },
  //Issue #108
  reconnect: function() {
    var nsFile = this.sCurrentDatabase;
    this.closeDatabase(false);

    this.sCurrentDatabase = nsFile;
    this.setDatabase(this.sCurrentDatabase);  
  },

  //refreshDbStructure: populates the schematree based on selected database
  //must be called whenever a database is opened/closed
  //and whenever the schema changes
  refreshDbStructure: function() {
    //1. if no database is selected
    if (this.sCurrentDatabase == null) {
  		smStructTrees[0].removeChildData();

  		for(var i = 0; i < this.aObjTypes.length; i++) {
  			var type = this.aObjTypes[i];
  			this.aCurrObjNames[type] = null;
  		}
  		return;
  	}

    //2. if db is being opened, set nodes to expand
    if (this.mbDbJustOpened) {
      //set the expandable nodes here
      var aExpand = [["all-table"],[]];
  		//check whether aExpand data is in smextmgmt table and use it
		  if (smExtManager.getUsage()) {
		    aExpand = smExtManager.getStructTreeState();
		  }
	    smStructTrees[0].setExpandableNodes(aExpand);
    }

    //3. 
    var tree = $$(smStructTrees[this.miDbObjects].treeId);

		//requery for all the objects afresh and redraw the tree
    for (var iC = 0; iC < this.aObjTypes.length; iC++) {
      var sType = this.aObjTypes[iC];
      this.aObjNames[sType] = Database.getObjectList(sType, "");
    }

		var idx = tree.currentIndex;
    smStructTrees[this.miDbObjects].setChildData(this.aObjNames);

    if (idx >= smStructTrees[this.miDbObjects].visibleDataLength)
      idx = 0;

		tree.view.selection.select(idx); //triggers getDbObjectInfo function
		
		//now assign the current objects
		for(var i = 0; i < this.aObjTypes.length; i++) {
			var type = this.aObjTypes[i];
			if(this.aObjNames[type].length > 0) {
				var bFound = false;
				if(this.aCurrObjNames[type]) {
					for(var n = 0; n < this.aObjNames[type].length; n++) {
						if(this.aCurrObjNames[type] == this.aObjNames[type][n]) {
							bFound = true;
							break;
						}
					}
				}
				if(!bFound)
					this.aCurrObjNames[type] = this.aObjNames[type][0];
			}
			else
				this.aCurrObjNames[type] = null;
		}
  },
		 		 
	//getDbObjectInfo: this function must show the structural info about the
	// selected database object (table, index, view & trigger)
	//this function is trigered by the select event on the tree
  getDbObjectInfo: function() {
    var tree = $$(smStructTrees[this.miDbObjects].treeId);
		var idx = tree.currentIndex;

		// idx = -1 if nothing is selected; says xulplanet element reference
		if(idx < 0 || idx >= tree.view.rowCount)
			idx = 1; //first table

		var level = tree.view.getLevel(idx);

		//there is a database object at level 1 only
		if(level == 0) {
			this.mostCurrObjName = null;
			this.mostCurrObjType = null;
			return false;
		}
		//level 2 is a field name of the parent table
		if(level == 2) {
		  idx = tree.view.getParentIndex(idx);
		}	
		var r_name = tree.view.getCellText(idx, tree.columns.getColumnAt(0));
    var r_type = smStructTrees[this.miDbObjects].getSmType(idx);
			
		//assign current selection in tree as current object
		this.aCurrObjNames[r_type] = r_name;

		this.mostCurrObjName = r_name;
		this.mostCurrObjType = r_type;

		this.loadTabStructure();
		this.loadTabBrowse();

		return true;
  },

  hideTabStructure: function() {
		//hide the hboxes containing object specific operation buttons
		//later enable one appropriate hbox according to the selection in tree
		$$("d-master-ops").hidden = true;
    $$("d-more-info").hidden = true;
    //hide other things
		$$("gb-master-info").hidden = true;
  },

  emptyTabStructure: function() {
		//hide the hboxes containing object specific operation buttons
		//later enable one appropriate hbox according to the selection in tree
		this.hideTabStructure();

		var fld = ["type","name","tbl_name","rootpage", "sql"];
		var node;
		for (var i = 0; i < fld.length; i++) {
			node = $$("str-" + fld[i]);
			node.value = "";
		}

    this.printTableInfo(null, "table");
  },

  loadTabStructure: function() {
    //no need to waste resources if this tab is not selected
    if(this.getSelectedTabId() != "tab-structure")
    	return false;
    	
    this.hideTabStructure();

    if (this.sCurrentDatabase == null)
    	return false;

		//there is a database object at level 1 only
		if(this.mostCurrObjName == null) {
			return false;
		}	
		
		//display this groupbox only if it will show something meaningful
		$$("gb-master-info").hidden = false;
		
		var r_name = this.mostCurrObjName;
		var r_type = this.mostCurrObjType;

	  $$("d-master-ops").hidden = false;
	  $$("d-master-ops").selectedPanel = $$("gb-master-ops-" + r_type);

		var fld = ["type","name","tbl_name","rootpage", "sql"];
		var row = Database.getMasterInfo(r_name, fld, "");

		var node;
		for(var i=0; i < fld.length; i++) {
			node = $$("str-"+fld[i]);
			var val = row[i];
			if(fld[i] == "type") {
				val = val.toUpperCase();
			}
			node.value = val;
			node.setAttribute("style", "font-weight:bold;font-size:12px;");
		}		

		//do the following for table/index
		if(r_type == "table" || r_type == "master") {
			this.printTableInfo(this.aCurrObjNames[r_type], r_type);
		}
		if(r_type == "index") {
  	  $$("d-more-info").hidden = false;
  	  $$("d-more-info").selectedPanel = $$("gb-more-info-index");
			this.printIndexInfo(this.aCurrObjNames[r_type]);
		}
		return true;
  },

  printTableInfo: function(sTable, sType) {
    if (this.miDbObjects == 1) //no add column option for master tables
      sType = "master";

	  $$("d-more-info").hidden = false;
	  $$("d-more-info").selectedPanel = $$("gb-more-info-table");
//		var box = $$("gb-more-info-table");
//		box.hidden = false;

		var vbox = $$("vb-more-info-table-columns");
		ClearElement(vbox);
    if (sTable == null)
      return;

    $$("hb-addcol").hidden = false;
    if (sType == "master") //no add column option for master tables
      $$("hb-addcol").hidden = true;

		var info = Database.getTableColumns(sTable, "");

		var cols = info[0];
		for(var i = 0; i < cols.length; i++) {
			var hbox = document.createElement("hbox");
			var tb = document.createElement("textbox");
			tb.setAttribute("id", "id-for-colname-" + i);
			tb.setAttribute("style", "width:24ex");
			if (sType == "master")
        tb.setAttribute("readonly","true");
			tb.setAttribute("value", cols[i][info[1]["name"][0]]);
			tb.setAttribute("oldvalue", cols[i][info[1]["name"][0]]);
			hbox.appendChild(tb);

			var tb = document.createElement("textbox");
			tb.setAttribute("id", "id-for-coltype-" + i);
			tb.setAttribute("style","width:15ex");
			if (sType == "master")
        tb.setAttribute("readonly","true");
			tb.setAttribute("value", cols[i][info[1]["type"][0]]);
			tb.setAttribute("oldvalue", cols[i][info[1]["type"][0]]);
			hbox.appendChild(tb);

			var tb = document.createElement("checkbox");
			tb.setAttribute("style","width:7ex");
			tb.setAttribute("disabled","true");
			if (cols[i][info[1]["pk"][0]] == 1)
				tb.setAttribute("checked", true);
			hbox.appendChild(tb);

			var tb = document.createElement("checkbox");
			tb.setAttribute("style","width:7ex");
			tb.setAttribute("disabled","true");
			if (cols[i][info[1]["notnull"][0]] != 0)
				tb.setAttribute("checked", true);
			hbox.appendChild(tb);

			var tb = document.createElement("textbox");
			tb.setAttribute("id", "id-for-coldefval-" + i);
			tb.setAttribute("style","width:10ex");
//			if (sType == "master")
        tb.setAttribute("readonly","true");
			var def_val = cols[i][info[1]["dflt_value"][0]];
			//if (info[2][i][info[1]["dflt_value"][0]] == 3)
			//	def_val = sm_quote(def_val);
			tb.setAttribute("value", def_val);
			hbox.appendChild(tb);

			var tb = document.createElement("button");
			tb.setAttribute("label", sm_getLStr("dropColumn"));
			tb.setAttribute("value", cols[i][info[1]["name"][0]]);
			tb.setAttribute("oncommand", "SQLiteManager.dropColumn('" + sTable + "','" + cols[i][info[1]["name"][0]] + "')");
      if (sType != "master") // not for master tables
      	hbox.appendChild(tb);

			var tb = document.createElement("button");
			tb.setAttribute("label", sm_getJsStr("alterColumn"));
			tb.setAttribute("value", cols[i][info[1]["name"][0]]);
			tb.setAttribute("oncommand", "SQLiteManager.alterColumn('" + sTable + "'," + i + ")");
      if (sType != "master") // not for master tables
      	hbox.appendChild(tb);

			vbox.appendChild(hbox);
		}

		var aTableInfo = Database.getTableInfo(sTable, -1);

		$$("numFields").value = aTableInfo["numFields"];
		$$("numIndexes").value = aTableInfo["numIndexes"];
		$$("numRecords").value = aTableInfo["numRecords"];
  },

  printIndexInfo: function(sIndex) {
		var aIndexInfo = Database.getIndexInfo(sIndex, this.miDbObjects);
		
		$$("tabletoindex").value = aIndexInfo["table"];
		$$("fieldtoindex").value = aIndexInfo["cols"];
		$$("duplicatevalues").value = sm_getLStr("allowed");
		if(aIndexInfo["unique"] == 1)
			$$("duplicatevalues").value = sm_getLStr("notAllowed");
  },

  changeSortOrder: function(ev) {
    if (ev.button==2) //right click
      return;
    var tgt = ev.target
    var sColName = tgt.getAttribute("label");
    var bFound = false;
    for(var i = 0; i < this.maSortInfo.length; i++) {
      if (this.maSortInfo[i][0] == sColName) {
        bFound = true;
        switch (this.maSortInfo[i][1]) {
          case "none":
            this.maSortInfo[i][1] = "asc";
            break;
          case "asc":
            this.maSortInfo[i][1] = "desc";
            break;
          case "desc":
            this.maSortInfo[i][1] = "none";
            break;
        }
        var aTemp = this.maSortInfo[i];
        this.maSortInfo.splice(i, 1);

        if (aTemp[1] != "none")
          this.maSortInfo.splice(0, 0, aTemp);
      }
    }
    if (!bFound)
      this.maSortInfo.splice(0, 0, [sColName, "asc"]);
    this.loadTabBrowse();
    //alert(sColName + "=" + sDataType + "=" + tgt.getAttribute("smSortDir"));
  },

	//loadTabBrowse: populates the table list and the tree view for current table
	//must be called whenever a database is opened/closed
	//and whenever the schema changes
	//depends entirely upon the values in "browse-type" and "browse-name" controls
  loadTabBrowse: function() {
    //no need to waste resources if this tab is not selected
    if(this.getSelectedTabId() != "tab-browse")
    	return false;
    	
    if (this.sCurrentDatabase == null)
    	return false;

		if (this.mostCurrObjType == null)
			return false;

		var sObjType = this.mostCurrObjType.toLowerCase();
		if (sObjType != "table" && sObjType != "master" && sObjType != "view")
			return false;

		$$("browse-type").value = sObjType.toUpperCase();
		if ($$("browse-name").value != this.mostCurrObjName)
		  this.maSortInfo = [];

		$$("browse-name").value = this.mostCurrObjName;

		//populate the treeview
    var sObjName = this.mostCurrObjName;
		if (sObjName != this.msBrowseObjName) {
			this.miOffset = 0;
			this.msBrowseObjName = sObjName;
			this.msBrowseCondition = "";
		}

		//some UI depends on whether table/master tables/view is shown
		var btnAdd =	$$("btnAddRecord");
		var btnDup =	$$("btnAddDupRecord");
		var btnEdit =	$$("btnEditRecord");
		var btnDelete =	$$("btnDeleteRecord");

		var treeChildren = $$("browse-treechildren");

    var setting = [false, "mp-editTableRow", "SQLiteManager.operateOnTable('update')"];
		if (sObjType == "table" && (this.mostCurrObjName == "sqlite_master" || this.mostCurrObjName == "sqlite_temp_master")) {
      setting = [true, "mp-browse-copy", ""];
		}
		if (sObjType == "master") {
      setting = [true, "mp-browse-copy", ""];
		}
		if (sObjType == "view") {
      setting = [true, "mp-browse-copy", ""];
		}

		btnAdd.disabled = setting[0];
		btnDup.disabled = setting[0];
		btnEdit.disabled = setting[0];
		btnDelete.disabled = setting[0];
		treeChildren.setAttribute("context", setting[1]);
		treeChildren.setAttribute("ondblclick", setting[2]);

    treeBrowse.ShowTable(false);

    try {
      var aOrder = this.maSortInfo;
      var aArgs = {sWhere: this.msBrowseCondition, iLimit: this.miLimit,
                  iOffset: this.miOffset, aOrder: aOrder};
      var iRetVal = Database.loadTableData(sObjType, sObjName, aArgs);
      var timeElapsed = Database.getElapsedTime();
    } catch (e) { 
      sm_message(e + "\n" + sm_getLStr("loadDataFailed"), 0x3);
			return false;
    }
    if (iRetVal == -1)
    	return false;

    var records = Database.getRecords();
    var columns = Database.getColumns();
  	this.miCount = Database.getTableCount(sObjName, this.msBrowseCondition);
	  $$("sbQueryTime").label = "ET: " + timeElapsed;

		this.manageNavigationControls();    	
    if (records && columns) {
      treeBrowse.createColumns(columns, iRetVal, this.maSortInfo, "SQLiteManager.changeSortOrder(event);");
      treeBrowse.PopulateTableData(records, columns);
    }
		return true;
  },

	onBrowseNavigate: function(sType) {
		switch(sType) {
			case "first":
				this.miOffset = 0;
				break;
			case "previous":
				this.miOffset = this.miOffset - this.miLimit;
				if (this.miOffset < 0)
					this.miOffset = 0;
				break;
			case "next":
				this.miOffset = this.miOffset + this.miLimit;
				break;
			case "last":
				this.miOffset = this.miCount - (this.miCount % this.miLimit);
				break;
		}
		this.loadTabBrowse();
	},

	manageNavigationControls: function() {
		//manage textboxes
  	$$("nav-total-val").value = this.miCount;
  	var iStart = (this.miCount == 0) ? 0 : (this.miOffset + 1);
  	$$("nav-start-val").value = iStart;
  	var iEnd = this.miOffset + this.miLimit;
  	iEnd = ((iEnd > this.miCount) || (this.miLimit == -1)) ? this.miCount : iEnd;
  	$$("nav-end-val").value = iEnd;

		//manage buttons
		var btnFirst = $$("btn-nav-first");
		var btnPrevious = $$("btn-nav-previous");
		var btnNext = $$("btn-nav-next");
		var btnLast = $$("btn-nav-last");

		btnFirst.disabled = false;
		btnPrevious.disabled = false;
		btnNext.disabled = false;
		btnLast.disabled = false;

    //manage the navigate buttons
    if (this.miLimit < 0 || this.miLimit >= this.miCount) {
			btnFirst.disabled = true;
			btnPrevious.disabled = true;
			btnNext.disabled = true;
			btnLast.disabled = true;
			return;
    }

		if (this.miOffset == 0) {
			btnFirst.disabled = true;
			btnPrevious.disabled = true;
		}
		else {
			btnFirst.disabled = false;
			btnPrevious.disabled = false;
		}
		if (this.miOffset + this.miLimit > this.miCount) {
			btnNext.disabled = true;
			btnLast.disabled = true;
		}
		else {
			btnNext.disabled = false;
			btnLast.disabled = false;
		}
	},

	//loadTabExecute: anything to be done when that tab is shown goes here
  loadTabExecute: function() {
    this.populateQueryListbox();
  },

	//loadTabDbInfo: anything to be done when that tab is shown goes here
  loadTabDbInfo: function() {
    //no need to waste resources if this tab is not selected
    if(this.getSelectedTabId() != "tab-dbinfo")
    	return false;

    if (this.sCurrentDatabase == null)
    	return false;

	  aSettings = ["schema_version", "user_version", "auto_vacuum", "cache_size", "count_changes", "default_cache_size", "empty_result_callbacks", "encoding", "full_column_names", "fullfsync", "legacy_file_format", "locking_mode", "page_size", "max_page_count", "page_count", "freelist_count", "read_uncommitted", "short_column_names", "synchronous", "temp_store", "temp_store_directory"];
		for(var i = 0; i < aSettings.length; i++)	{
		  var sSetting = aSettings[i];
			var node = $$("pr-" + sSetting);
			var newVal = Database.getSetting(sSetting);
			node.value = newVal;
		}
		return true;
	},

  search: function() {
		var oType = $$("browse-type").value.toUpperCase();
    var oName = $$("browse-name").value;
    if (oType == "VIEW")
      return this.searchView(oName);
    if (oType == "TABLE" || oType == "MASTER") {
      window.openDialog("chrome://sqlitemanager/content/RowOperations.xul",
  					"RowOperations", "chrome, resizable, centerscreen, modal, dialog", 
  					Database, oName, "search");
  		return true;
  	}
  },

  searchView1: function(sViewName) {
    var aArgs = {sWhere: "", iLimit: 1, iOffset: 0};
  	Database.loadTableData("view", sViewName, aArgs);
    var records = Database.getRecords();
    if (records.length == 0) {
    	alert(sm_getLStr("noRecord"));
    	return false;
    }

		var columns = Database.getColumns();
  	var names = [], types = [];
    for (var col in columns) {
    	names[col] = columns[col][0];
    	types[col] = GetColumnTypeString(columns[col][1]);
    }
    var aColumns = [names, types];
    
		this.aFieldNames = aColumns[0];
		var aTypes = aColumns[1];

		var grbox = $$("hb-sliding");
		ClearElement(grbox);
//    		var cap = document.createElement("caption");
//    		cap.setAttribute("label", "Enter Field Values");
//    		grbox.appendChild(cap);

		for(var i = 0; i < this.aFieldNames.length; i++) {
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex", "1");
			hbox.setAttribute("style", "margin:2px 3px 2px 3px");

			var lbl = document.createElement("label");
			var lblVal = (i+1) + ". " + this.aFieldNames[i];
			lblVal += " ( " + aTypes[i] + " )"; 
			lbl.setAttribute("value", lblVal);
			lbl.setAttribute("style", "padding-top:5px;width:25ex");
			lbl.setAttribute("accesskey", (i+1));
			lbl.setAttribute("control", "ctrl-" + this.aFieldNames[i]);
			hbox.appendChild(lbl);

			var spacer = document.createElement("spacer");
			spacer.flex = "1";
			hbox.appendChild(spacer);

			var vb = RowOperations.getSearchMenuList(this.aFieldNames[i]);
			hbox.appendChild(vb);

			var inp = RowOperations.getInputField(i);
			hbox.appendChild(inp);

			var vb = RowOperations.getInputToggleImage(i);
			hbox.appendChild(vb);

			grbox.appendChild(hbox);
		}
    return true;
  },

  searchView: function(sViewName) {
    var aArgs = {sWhere: "", iLimit: 1, iOffset: 0};
  	Database.loadTableData("view", sViewName, aArgs);
    var records = Database.getRecords();
    if (records.length == 0) {
    	alert(sm_getLStr("noRecord"));
    	return false;
    }

		var columns = Database.getColumns();
  	var names = [], types = [];
    for (var col in columns) {
    	names[col] = columns[col][0];
    	types[col] = GetColumnTypeString(columns[col][1]);
    }
    var cols = [names, types];
    window.openDialog("chrome://sqlitemanager/content/RowOperations.xul",
					"RowOperations", "chrome, resizable, centerscreen, modal, dialog", 
					Database, sViewName, "search-view", cols);
    return true;
  },

  showAll: function() {
		sm_prefsBranch.setCharPref("searchCriteria", "");

		//the value of searchToggler should toggle for change event to fire.
		var bTemp = sm_prefsBranch.getBoolPref("searchToggler");
		sm_prefsBranch.setBoolPref("searchToggler", !bTemp);
  },

  //getSelectedTab: returns the selected tab
  getSelectedTab: function() {
		return $$("sm-tabs").selectedItem;
  },

  //getSelectedTabId: returns the id of the selected tab
  getSelectedTabId: function() {
		var oSelectedTab = $$("sm-tabs").selectedItem;
		var id = oSelectedTab.getAttribute("id");
		return id;
  },

  //doSelectTab: called when onselect event fires on tabs[id="sm-tabs"]
	doSelectTab: function(oSelectedTab) {
		var id = oSelectedTab.getAttribute("id");
		return this.loadTabWithId(id);
	},

  //selectStructTab: called when onselect event fires on tabs[id="sm-tabs-db"]
	selectStructTab: function(oSelectedTab) {
		var id = oSelectedTab.getAttribute("id");
		switch(id) {
			case "tab-db-norm":
				this.miDbObjects = 0;
				break;
		}
		this.refreshDbStructure();
		return true;
	},

	loadTabWithId: function(sId) {
		switch(sId) {
			case "tab-structure":
				this.loadTabStructure();
				break;
			case "tab-browse":
				this.loadTabBrowse();
				break;
			case "tab-execute":
				this.loadTabExecute();
				break;
			case "tab-dbinfo":
				this.loadTabDbInfo();
				break;
		}
		return true;
	},

  //bImplicit: false = called from menuitem; true = function call
  useExtensionManagementTable: function(bUse, bImplicit) {
    var mi = $$("menu-general-extensionTable");

		if(this.sCurrentDatabase == null) {
		  //revert to the state before clicking
      mi.removeAttribute("checked");
			if (!bImplicit) alert(sm_getLStr("firstOpenADb"));
			return false;
		}

    smExtManager.setUsage(bUse, bImplicit);
    if (bUse) {
      mi.setAttribute("checked", "true");
      this.populateQueryListbox();
    }
    else
      mi.removeAttribute("checked");

		//refresh the structure tree here so that mgmt table is shown/removed
		this.refresh();

		//hide/show the images for query history in the execute sql tab
		$$("queryHistoryPrevImage").hidden = !bUse;
		$$("queryHistoryNextImage").hidden = !bUse;
		$$("querySaveByNameImage").hidden = !bUse;
		$$("queryHistoryClearImage").hidden = !bUse;

		$$("listbox-queries").hidden = !bUse;

    return true;
  },

  showPrevSql: function() {
    var sQuery = smExtManager.getPrevSql();
    if (!sQuery) return;
    $$("txtSqlStatement").value = sQuery;
  },

  showNextSql: function() {
    var sQuery = smExtManager.getNextSql();
    if (!sQuery) return;
    $$("txtSqlStatement").value = sQuery;
  },

	saveSqlByName: function()	{
		var sQuery = $$("txtSqlStatement").value;
		if (sQuery.length <= 0)
			alert("Nothing to save.");

    if (smExtManager.saveSqlByName(sQuery))
      this.populateQueryListbox();
	},

  clearSqlHistory: function() {
    smExtManager.clearSqlHistory();
  },

	onSelectQuery: function() {
    var sVal = $$("listbox-queries").value;
    if (sVal != sQuerySelectInstruction)
  		$$("txtSqlStatement").value = sVal;
	},

	populateQueryListbox: function() {
		var listbox = $$("listbox-queries");
    if (this.sCurrentDatabase == null) {
      listbox.hidden = true;
    	return false;
    }
		var aQueries = smExtManager.getQueryList();
		if (aQueries.length)
		  aQueries.unshift(sQuerySelectInstruction);
		else
		  aQueries = [sQuerySelectInstruction];
		var sDefault = listbox.selectedItem;
		if (sDefault != null)
      sDefault = sDefault.label;
		PopulateDropDownItems(aQueries, listbox, sDefault);
	},

	runSqlStatement: function(sType) {
		if(this.sCurrentDatabase == null)	{
			alert(sm_getLStr("firstOpenADb"));
			return;
		}

		//get the query string from an xul page
		var sQuery = $$("txtSqlStatement").value;
		
		var queries = sql_tokenizer(sQuery);
    if (queries.length == 0) {
			alert(sm_getLStr("writeSomeSql"));
			return;
		}
		var aData, aColumns;
    var timeElapsed = 0;
    var bRet = false;
//		if(sType == "select")
    if (queries.length == 1) {
      sQuery = queries[0];
			bRet = Database.selectQuery(sQuery);
			timeElapsed = Database.getElapsedTime();
      //store the query in config db
			if (bRet) {
    		aData = Database.getRecords();
    		aColumns = Database.getColumns();
   		  sm_message(sm_getLStr("rowsReturned") + ": " + aData.length, 0x2);
        smExtManager.addQuery(sQuery);
      }
      //set this value so that query history is reset to latest query
      //that is previous will again begin from the latest query
  		smExtManager.goToLastQuery();
		}
		else {
			bRet = Database.executeTransaction(queries);
			timeElapsed = Database.getElapsedTime();
		}
		
		//display the last error in the textbox
		$$("sqlLastError").value = Database.getLastError();
		if (bRet) {
		  $$("sbQueryTime").label = "ET: " + timeElapsed;
		}

		//the following two lines must be before the code for tree
		//otherwise, it does not refresh the structure tree as expected
		this.refreshDbStructure();
		this.loadTabBrowse();
		
		treeExecute.ShowTable(false);
		if (bRet && queries.length == 1) {
		  treeExecute.createColumns(aColumns, 0, [], null);
		  treeExecute.PopulateTableData(aData, aColumns);
		}
	},

  newDatabase: function() {
  	var sExt = "." + this.maFileExt[0];
		//prompt for a file name
		var fname = prompt("Enter the database name (" + sExt + " will be automatically appended to the name)", "", "Enter the Database Name");

		//if cancelled, abort
		if (fname == "" || fname == null)
			return false;
		
		//append the extension to the chosen name
		fname += sExt;
		
		//let the user choose the folder for the new db file	
		var dir = sm_chooseDirectory(sm_getLStr("selectFolderForDb"));
		if (dir != null) {
			//access this new copied file
			var newfile = Cc["@mozilla.org/file/local;1"]
								.createInstance(Ci.nsILocalFile);
			newfile.initWithPath(dir.path);
			newfile.append(fname);
			
			//if the file already exists, alert user that existing file will be opened 
			if(newfile.exists()) {
				alert(sm_getLStr("dbFileExists"));
			}

    	//if another file is already open,
			//confirm from user that it should be closed
    	if(this.closeDatabase(false)) {
				//assign the new file (nsIFile) to the current database
				this.sCurrentDatabase = newfile;
				//if the file does not exist, openDatabase will create it 
				this.setDatabase(this.sCurrentDatabase);
				return true;
			}
		}
		return false;
  },

	//closeDatabase: 
  closeDatabase: function(bAlert) {
		//nothing to close if no database is already open    
  	if(this.sCurrentDatabase == null)	{
   		if(bAlert)
        alert(sm_getLStr("noOpenDb"));
			return true;
		}
			
   	//if another file is already open, confirm before closing
   	var answer = true;
 		if(bAlert)
  		answer = smPrompt.confirm(null, "SQLite Manager", sm_getLStr("confirmClose"));

  	if(!answer)
  		return false;

    //save StructureTreeState in ext mgmt table if mgmt is in use
    if (smExtManager.getUsage()) {
      smExtManager.setStructTreeState(smStructTrees[0].aExpandedNodes);
    }
		//make the current database as null and 
		//call setDatabase to do appropriate things
		this.sCurrentDatabase = null;
		this.setDatabase(this.sCurrentDatabase);
		return true;
	},
		
  copyDatabase: function() {
 		if(this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return;
		}
    var sExt = "." + this.maFileExt[0];
		//prompt for a file name
		var fname = prompt("Enter the database name (" + sExt + " will be automatically appended to the name)", "", "Enter the Database Name");

		//if cancelled, abort
		if (fname == "" || fname == null)
			return;
		else
			fname += sExt;
			
		//let the user choose the folder for the new db file	
		//let the user choose the folder for the new db file	
		var dir = sm_chooseDirectory(sm_getLStr("selectFolderForDb"));
		if (dir != null) {
			//copy the opened file to chosen location
			this.sCurrentDatabase.copyTo(dir, fname);

			//access this new copied file
			var newfile = Cc["@mozilla.org/file/local;1"]
								.createInstance(Ci.nsILocalFile);
			newfile.initWithPath(dir.path);
			newfile.append(fname);
			
			//if the file does not exist, openDatabase will create it 
			if(!newfile.exists()) {
				var ans = smPrompt.confirm(null, "SQLite Manager", sm_getLStr("copyFailed"));
				if(!ans)
					return;
			}

			//assign the new file (nsIFile) to the current database
    	if(this.closeDatabase(false)) {
				this.sCurrentDatabase = newfile;
        this.setDatabase(this.sCurrentDatabase);
        return;
			}
		}
		return;
  },
    
  compactDatabase: function() {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}
		var befPageCount = Database.getSetting("page_count");
		var pageSize = Database.getSetting("page_size");
    var sQuery = "VACUUM";
    //cannot vacuum from within a transaction
    Database.selectQuery(sQuery);
		var aftPageCount = Database.getSetting("page_count");
    sm_alert("Result of Compacting", "The database was compacted using VACUUM statement.\n" +
      "Before compacting:\n" +
      "   Page Count    = " + befPageCount + "\n" +
      "   Database Size = " + befPageCount*pageSize + " bytes\n" +
      "After compacting:\n" +
      "   Page Count    = " + aftPageCount + "\n" +
      "   Database Size = " + aftPageCount*pageSize + " bytes\n");
    return true;
  },

  analyzeDatabase: function() {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
    }
  	var sQuery = "ANALYZE";
  	Database.selectQuery(sQuery);
  	return true;
  },

  checkIntegrity: function() {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
    }
    Database.selectQuery("PRAGMA integrity_check");
    var records = Database.getRecords();
    var columns = Database.getColumns();

    var txt = sm_getLStr("integrityResultPrefix") + ": ";
    //report OK if i row returned containing the value "ok"
    if (records.length == 1 && records[0][0] == "ok")
      alert(txt + sm_getLStr("ok"));
    else
      alert(txt + sm_getLStr("notOk"));
    return true;
  },

  openDatabase: function() {        
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			           .createInstance(nsIFilePicker);
		fp.init(window, sm_getLStr("selectDb"), nsIFilePicker.modeOpen);
    var sExt = "";
		for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
      sExt += "*." + this.maFileExt[iCnt] + ";";
		}
	  fp.appendFilter(sm_getLStr("sqliteDbFiles") + " (" + sExt + ")", sExt);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		  // work with returned nsILocalFile...
    	if(this.closeDatabase(false)) {
				this.sCurrentDatabase = fp.file;
        this.setDatabase(this.sCurrentDatabase);
        return true;
			}
		}
		return false;
  },

  openDatabaseADS: function() {        
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			           .createInstance(nsIFilePicker);
		fp.init(window, sm_getLStr("selectDb"), nsIFilePicker.modeOpen);
    var sExt = "";
		for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
      sExt += "*." + this.maFileExt[iCnt] + ";";
		}
	  fp.appendFilter(sm_getLStr("sqliteDbFiles") + " (" + sExt + ")", sExt);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
  		var check = {value: false};   // default the checkbox to false
  		var input = {value: ""};   // default the edit field to table name
  		var result = smPrompt.prompt(null, "Enter ADS Name: " + fp.file.leafName,
  		                  "Enter the name of ADS containing sqlite db", 
  		                  input, null, check);
  		var sAdsName = input.value;
  		//returns true on OK, false on cancel
  		if (!result || sAdsName.length == 0)
  		  return false;

      var sPath = fp.file.path + ":" + sAdsName;
    	return this.openDatabaseWithPath(sPath);
		}
		return false;
  },

  openDatabaseWithPath: function(sPath) {
		var newfile = Cc["@mozilla.org/file/local;1"]
							.createInstance(Ci.nsILocalFile);
		try {
      newfile.initWithPath(sPath);
    } catch (e) {
		  alert("File not found: " + sPath);
		  this.removeFromMru(sPath);
		  return false;
    }
		if(newfile.exists()) {
    	if(this.closeDatabase(false)) {
				this.sCurrentDatabase = newfile;
        this.setDatabase(this.sCurrentDatabase);
        return true;
			}
		}
		else {
		  alert("File not found: " + sPath);
		  this.removeFromMru(sPath);
		}
		return false;
  },

  saveDatabase: function() {        
  },

  createTable: function() {        
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}

		var aRetVals = {};
    window.openDialog("chrome://sqlitemanager/content/createTable.xul",
						"createTable", "chrome, resizable, centerscreen, modal, dialog", 
						Database, aRetVals);
 		if (aRetVals.ok) {
      Database.confirmAndExecute([aRetVals.createQuery], "Create Table " + aRetVals.tableName, "confirm.create");
  		this.refreshDbStructure();
	   	this.loadTabBrowse();
	  }
  },

  createObject: function(sObjectType) {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}

		var xul = "chrome://sqlitemanager/content/create" + sObjectType + ".xul";
		if (sObjectType == "view") {
   		var aRetVals = {dbName: Database.logicalDbName, tableName: this.aCurrObjNames["table"]};
      window.openDialog(xul, "create" + sObjectType, 
  						"chrome, resizable, centerscreen, modal, dialog", 
  						Database, aRetVals);
  		if (aRetVals.ok) {
        Database.confirmAndExecute(aRetVals.queries,
          "Create " + sObjectType + " " + aRetVals.objectName, "confirm.create");
    		this.refreshDbStructure();
  	   	this.loadTabBrowse();
  	  }
    }
    else
      window.openDialog(xul, "create" + sObjectType, 
  						"chrome, resizable, centerscreen, modal, dialog", 
  						Database, this.aCurrObjNames["table"], sObjectType);

		this.refreshDbStructure();
		this.loadTabBrowse();
		return true;
  },

  modifyView: function() {
    var sViewName = this.aCurrObjNames["view"];
		var info = Database.getMasterInfo(sViewName, ["sql"], "");
		var sOldSql = info[0];
    var sSelect = getViewSchemaSelectStmt(sOldSql);

  	var aRetVals = {dbName: Database.logicalDbName, objectName: sViewName,
            modify: 1, selectStmt: sSelect};
    aRetVals.readonlyFlags = ["dbnames", "viewname"];
    window.openDialog("chrome://sqlitemanager/content/createview.xul",
  					"createView", "chrome, resizable, centerscreen, modal, dialog", 
  					Database, aRetVals);
		if (aRetVals.ok) {
      Database.confirmAndExecute(aRetVals.queries,
        "Modify view " + " " + aRetVals.objectName, "confirm.create");
  		this.refreshDbStructure();
	   	this.loadTabBrowse();
	  }
  },

  alterColumn: function(sTable, iCol) {
    var bConfirm = sm_confirm("Dangerous Operation", "This is a potentially dangerous operation. SQLite does not support statements that can alter a column in a table. Here, we attempt to reconstruct the new CREATE SQL statement by looking at the pragma table_info which does not contain complete information about the structure of the existing table.\n\nDo you still want to proceed?");
    if (!bConfirm)
      return false;
    var sOldName = $$("id-for-colname-" + iCol)
                      .getAttribute("oldvalue");
    var sNewName = $$("id-for-colname-" + iCol).value;
    var sNewType = $$("id-for-coltype-" + iCol).value;
    var sNewDefVal = $$("id-for-coldefval-" + iCol).value;
    sNewDefVal = sm_makeDefaultValue(sNewDefVal);
    var aNewInfo = {oldColName: sOldName,
                    newColName: sNewName,
                    newColType: sNewType,
                    newDefaultValue: sNewDefVal};
		var bReturn = CreateManager.modifyTable("alterColumn", sTable, aNewInfo);
		if(bReturn) {
			this.refreshDbStructure();
			this.loadTabBrowse();
		}
		return bReturn;
  },

  dropColumn: function(sTable, sColumn) {        
    var bConfirm = sm_confirm("Dangerous Operation", "This is a potentially dangerous operation. SQLite does not support statements that can alter a column in a table. Here, we attempt to reconstruct the new CREATE SQL statement by looking at the pragma table_info which does not contain complete information about the structure of the existing table.\n\nDo you still want to proceed?");
    if (!bConfirm)
      return false;
//    var bConfirm = sm_prefsBranch.getBoolPref("allowUnsafeTableAlteration");
    
		var bReturn = CreateManager.modifyTable("dropColumn", sTable, sColumn);
		if(bReturn) {
			this.refreshDbStructure();
			this.loadTabBrowse();
		}
		return bReturn;
  },

  reindexIndex: function() {        
  	var sCurrIndex = this.aCurrObjNames["index"];
  	if(sCurrIndex != null && sCurrIndex != undefined && sCurrIndex.length > 0) {
			var bReturn = Database.reindexObject("INDEX", sCurrIndex);
			return bReturn;
		}
		return false;
  },

	dropObject: function(sObjectType) {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}

		var sObjectName = "";
		sObjectName = this.aCurrObjNames[sObjectType];
		
		var aNames = this.aObjNames[sObjectType];

		if(aNames.length == 0) {
			alert(sm_getLStr("noObjectToDelete") + ": " + sObjectType);
			return false;
		}
		var bReturn = Database.dropObject(sObjectType, sObjectName);
		if(bReturn) {
			sm_message(sm_getLStr("dropDone"), 0x2);
			this.refreshDbStructure();
			this.loadTabBrowse();
		}
		return bReturn;
  },

  exportAll: function(sWhat) {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}
    var sDbName = Database.logicalDbName; //"main";
    var sExpType = "sql";
    var sFileName = sDbName;
    if (sDbName == "main") {
      sFileName = Database.getFileName();
	    var iPos = sFileName.lastIndexOf(".");
	    if (iPos > 0)
  	    sFileName = sFileName.substr(0, iPos);
    }
		// get export file
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			      .createInstance(nsIFilePicker);
		fp.init(window, "Export to file ", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll);
		fp.defaultString = sFileName + "." + sExpType;
		
		var rv = fp.show();
		
		//if chosen then
		if (rv != nsIFilePicker.returnOK && rv != nsIFilePicker.returnReplace) {
			alert("Please choose a file to save the exported data to.");
			return false;
		}
		var file = Cc["@mozilla.org/file/local;1"]
							.createInstance(Ci.nsILocalFile);
		file.initWithFile(fp.file);

		var foStream = Cc["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Ci.nsIFileOutputStream);
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

    var os = Cc["@mozilla.org/intl/converter-output-stream;1"]
              .createInstance(Ci.nsIConverterOutputStream);
    
    // This assumes that fos is the nsIOutputStream you want to write to
    os.init(foStream, "UTF-8", 0, 0x0000);
    
    if (sWhat == "tables" || sWhat == "db") {
      var bCreate = true, bTransact = false;
  		var iExportNum = 0;
     	var aTableNames = Database.getObjectList("table", sDbName);
  		for (var i = 0; i < aTableNames.length; i++) {
  			iExportNum = SmExim.writeSqlContent(os, sDbName, aTableNames[i], bCreate, bTransact);
  		}
		}
		var aObjNames = [];
		if (sWhat == "dbstructure") {
     	var aTableNames = Database.getObjectList("table", sDbName);
      aObjNames = aObjNames.concat(aTableNames);
    }
		if (sWhat == "db" || sWhat == "dbstructure") {
     	var aViewNames = Database.getObjectList("view", sDbName);
      aObjNames = aObjNames.concat(aViewNames);
     	var aTriggerNames = Database.getObjectList("trigger", sDbName);
      aObjNames = aObjNames.concat(aTriggerNames);
     	var aIndexNames = Database.getObjectList("index", sDbName);
      aObjNames = aObjNames.concat(aIndexNames);
  		for (var i = 0; i < aObjNames.length; i++) {
        var sSql = Database.getMasterInfo(aObjNames[i], ["sql"], sDbName);
        if (sSql[0] != g_strForNull)
          os.writeString(sSql[0] + ";\n");
      }
		}
    os.close();
		foStream.close();

		if (sWhat == "db")
		  sm_message("Database exported to " + fp.file.path, 0x3);
		if (sWhat == "dbstructure")
		  sm_message("Database Structure exported to " + fp.file.path, 0x3);
		if (sWhat == "tables")
		  sm_message(aTableNames.length + " tables exported to " + fp.file.path, 0x3);
		return true;
  },

	importFromFile: function() {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}
    SmExim.loadDialog("import", "d-mainarea");
	},
	
	exportObject: function(sObjectType) {
    if (this.sCurrentDatabase == null) {
			alert(sm_getLStr("firstOpenADb"));
			return false;
		}

		var sObjectName = this.aCurrObjNames[sObjectType];
		
//    window.openDialog("chrome://sqlitemanager/content/export.xul",
//						"export",	"chrome, resizable, centerscreen, modal, dialog", 
//						Database, sObjectType, sObjectName);
    SmExim.loadDialog("export", "d-mainarea", sObjectType, sObjectName);
		return true;
  },

	copyTable: function(sTableName) {
		var xul = "chrome://sqlitemanager/content/copyTable.xul";
		var aRetVals = {};
    var ret = window.openDialog(xul, "copyTable", 
						"chrome, centerscreen, modal, dialog",
            Database.logicalDbName, this.aCurrObjNames["table"],
            Database.getDatabaseList(), aRetVals);
    var sNewDb = aRetVals.newDbName;
    var sNewTable = aRetVals.newTableName;
    var bOnlyStructure = aRetVals.onlyStructure;

		if (sNewTable.length == 0)
		  return false;
		  
		var info = Database.getMasterInfo(sTableName, ["sql"], "");
		var r_sql = info[0];
		sNewTable = Database.getPrefixedName(sNewTable, sNewDb);
		var sOldTable = Database.getPrefixedName(sTableName, "");	

    var sNewSql = replaceObjectNameInSql(r_sql, sNewTable);
    if (sNewSql == "") {
      alert(sm_getJsStr("failSqlForCopy"));
      return;
    }

		var aQueries = [sNewSql];
		if(!bOnlyStructure) {
			aQueries.push("INSERT INTO " + sNewTable + " SELECT * FROM " + sOldTable);
		}
		return Database.confirmAndExecute(aQueries, sm_getJsStr("copyTheTable") + ": " + sTableName);
	},

	renameTable: function(sTableName)	{
		var check = {value: false};   // default the checkbox to false
		var input = {value: sTableName};   // default the edit field to table name
		var result = smPrompt.prompt(null, "Rename Table " + sTableName,
		                  "Enter the new name of the table", 
		                  input, null, check);
		var sNewTable = input.value;
		//returns true on OK, false on cancel
		if (!result || sNewTable.length == 0)
		  return false;
		  
		sNewTable = sm_doublequotes(sNewTable);
		var sOldTable = Database.getPrefixedName(sTableName, "");
		var sQuery = "ALTER TABLE " + sOldTable + " RENAME TO " + sNewTable;
		
		return Database.confirmAndExecute([sQuery], "Rename table " + sOldTable);
	},

	renameObject: function(sObjType)	{
    var sObjName = this.aCurrObjNames[sObjType];
		var check = {value: false};   // default the checkbox to false
		var input = {value: sObjName};   // default the edit field to object name
		var result = smPrompt.prompt(null, "Rename " + sObjType + " " + sObjName,
		                  "Enter the new name of the " + sObjType, 
		                  input, null, check);
		var sNewName = input.value;
		//returns true on OK, false on cancel
		if (!result || sNewName.length == 0)
		  return false;
		  
		sNewName = Database.getPrefixedName(sNewName, "");
		var info = Database.getMasterInfo(sObjName, ["sql"], "");
		var sOldSql = info[0];
    var sNewSql = replaceObjectNameInSql(sOldSql, sNewName);
    if (sNewSql == "") {
      alert("Failed to create sql statement");
      return;
    }
		var sOldName = Database.getPrefixedName(sObjName, "");

		var aQueries = [];
		aQueries.push("DROP " + sObjType + " " + sOldName);
		aQueries.push(sNewSql);
		var bReturn = Database.confirmAndExecute(aQueries, "Rename " + sObjType + " " + sOldName);
		if(bReturn)	this.refresh();
	},

// operateOnTable: various operations on a given table
// sOperation = rename | copy | reindex | delete	| 
//              insert | duplicate | update
  operateOnTable: function(sOperation) {
		//these operations make sense in the context of some table
		//so, take action only if there is a valid selected db and table
	  if (this.sCurrentDatabase == null || this.aCurrObjNames["table"] == null) {
			alert(sm_getLStr("noDbOrTable"));
			return false;
		}
  	var sCurrTable = this.aCurrObjNames["table"];
  	var bReturn = false;
  	var bRefresh = false; //to reload tabs
		switch(sOperation) {
			case "reindex":
				return Database.reindexObject("TABLE", sCurrTable);
				break;
			case "analyze":
			  return Database.analyzeTable(sCurrTable);
				break;
		}
  	if(sOperation == "copy") {
			var bReturn = this.copyTable(sCurrTable);
			if(bReturn)	this.refresh();
			return bReturn;
		}
  	if(sOperation == "rename") {
			var bReturn = this.renameTable(sCurrTable);
			if(bReturn)	this.refresh();
			return bReturn;
		}
  	if(sOperation == "drop") {
			var bReturn = Database.dropObject("TABLE", sCurrTable);
			if(bReturn)	this.refresh();
			return bReturn;
		}
  	if(sOperation == "empty") {
      var bReturn = Database.emptyTable(sCurrTable);
      if(bReturn)	this.refresh();
      return bReturn;
    }
    if(sOperation == "addColumn") {
      var newCol = [];
      newCol["name"] = $$("tb-addcol-name").value;
      newCol["type"] = $$("tb-addcol-type").value;
      newCol["notnull"] = $$("tb-addcol-notnull").checked;
      newCol["dflt_value"] = $$("tb-addcol-default").value;
      newCol["dflt_value"] = sm_makeDefaultValue(newCol["dflt_value"]);

      var bReturn = Database.addColumn(sCurrTable, newCol);
      if(bReturn) {
        $$("tb-addcol-name").value = "";
        $$("tb-addcol-type").value = "";
        $$("tb-addcol-notnull").checked = false;
        $$("tb-addcol-default").value = "";
        this.refresh();
      }
      $$("tb-addcol-name").focus();
      return bReturn;
    }

		//update the first selected row in the tree, else alert to select
  	//if selection exists, pass the rowid as the last arg of openDialog
  	var aRowIds = [];
  	var rowCriteria = "";
  	if(sOperation == "update" || sOperation == "delete" || sOperation == "duplicate") {
  		var colMain = Database.getTableRowidCol(this.aCurrObjNames["table"]);
			colMain["name"] = "`" + colMain["name"] + "`";

  		//allowing for multiple selection in the tree
			var tree = $$("browse-tree");
			var start = new Object();
			var end = new Object();
			var numRanges = tree.view.selection.getRangeCount();

			for (var t = 0; t < numRanges; t++) {
				tree.view.selection.getRangeAt(t,start,end);
			  for (var v = start.value; v <= end.value; v++) {
			  	var rowid = tree.view.getCellText(v,
							tree.columns.getColumnAt(colMain["cid"]));
					aRowIds.push(rowid);
			  }
			}
			//do nothing, if nothing is selected
			if(aRowIds.length == 0)	{
				alert(sm_getLStr("noRecord"));
				return false;
			}
			//if editing, should select only one record
			if (sOperation == "update" || sOperation == "duplicate")	{
				if (aRowIds.length != 1) {
					alert(sm_getLStr("onlyOneRecord"));
					return false;
				}
				rowCriteria = " " + colMain["name"] + " = " + aRowIds[0];
			}
			//if deleting, pass as argument rowid of all selected records to delete
			if (sOperation == "delete") {
    		var criteria = colMain["name"] + " IN (" + aRowIds.toString() + ")";
    		var sQuery = "DELETE FROM " + Database.getPrefixedName(sCurrTable, "") + " WHERE " + criteria;
    		//IMPORTANT: the last parameter is totally undocumented.
				var bReturn = Database.confirmAndExecute([sQuery], ["Delete " + aRowIds.length + " records from " + sCurrTable, false]);
				if(bReturn)
					this.loadTabBrowse();
				return bReturn;
			}
		}
/* following code if dialog is popped up for editing etc. */
    var bUseWindow = true;
    if (bUseWindow) {
      window.openDialog("chrome://sqlitemanager/content/RowOperations.xul",
  					"RowOperations", "chrome, resizable, centerscreen, modal, dialog", 
  					Database, this.aCurrObjNames["table"], sOperation, rowCriteria);
  		if(sOperation != "update") {
  			this.refreshDbStructure();
  		}
  		this.loadTabBrowse();
		}
    else {
      RowOps.loadDialog(this.aCurrObjNames["table"], sOperation, rowCriteria);
    }

		return true;
  },

  selectDefaultDir: function(sType) {
    var file = sm_chooseDirectory("Select Default Directory");

    // 1. Write to prefs
    var relFile = Cc["@mozilla.org/pref-relativefile;1"]
                  .createInstance(Ci.nsIRelativeFilePref);
    relFile.relativeToKey = "ProfD";
    relFile.file = file;      // |file| is nsILocalFile
    sm_prefsBranch.setComplexValue("userDir", Ci.nsIRelativeFilePref, relFile);
    this.populateDBList("user");
  },

  // populateDBList: Load list of files with default file extensions
  populateDBList: function(sType) {
    var fileList;
    var sTooltip = "Profile Directory";
    var sSelectString = sm_getLStr("selectProfileDb");
    if (sType == "profile")
      // Get the nsIFile object pointing to the profile directory
      fileList = Cc["@mozilla.org/file/directory_service;1"]
            .getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile)
            .directoryEntries;
    if (sType == "user") {
      sSelectString = sm_getLStr("selectDbInDefaultDir");
      //Read from prefs
      var value = sm_prefsBranch.getComplexValue("userDir",Ci.nsIRelativeFilePref);
      // |value.file| is the file.
      sTooltip = value.file.path;
			var lFile = value.file;
      fileList = lFile.directoryEntries;
    }
    //get the node for the popup menus to show profile db list
    var listbox = $$("listbox-profileDB");
    listbox.setAttribute("dirType", sType);
    listbox.setAttribute("tooltiptext", sTooltip);
    $$("menu-DbList").setAttribute("tooltiptext", sTooltip);

    listbox.removeAllItems();
    listbox.appendItem(sSelectString, "");
    listbox.selectedIndex = 0;

    var aSplit, sExt;
    var file;
    var iFileCount = 0;
		while (fileList.hasMoreElements()) {
      file = fileList.getNext().QueryInterface(Ci.nsIFile);
      aSplit = file.leafName.split(".");
      sExt = aSplit[aSplit.length - 1]; 

      if (this.maFileExt.indexOf(sExt) != -1) {
        iFileCount++;
        listbox.appendItem(file.leafName, file.path);
      }
    }
    sm_message(sm_getLStr("filesInProfileDbList") + ": " + iFileCount, 0x2);
  },

  // openSelectedDatabase: open a file from the database dropdown list
  openSelectedDatabase: function(sMenuListId) { 
		//get the node for dropdown menu in which profile db list is shown       
  	var listbox = $$(sMenuListId);
    var sPath = listbox.selectedItem.value;
    var sType = listbox.getAttribute("dirType"); //profile/user

		var file = Cc["@mozilla.org/file/local;1"]
							.createInstance(Ci.nsILocalFile);
		file.initWithPath(sPath);

		//proceed only if the file exists
		//we are in the profile folder via the listbox, so open if the file exists
		//do not attempt to create new file
		if(!file.exists()) {
			alert(sm_getLStr("invalidProfileDb"));
			return false;
		}
  	if(this.closeDatabase(false))	{
			this.sCurrentDatabase = file;
      this.setDatabase(this.sCurrentDatabase);
      return true;
		}
		return false;
	},

  changeAttachedDb: function() {
    var mlist = $$("ml-dbNames");
	  var mi = mlist.selectedItem;
	  var sDbName = mi.getAttribute("dbName");
	  if (sDbName == "")
	   return false;

	  Database.setLogicalDbName(sDbName);
	  this.refreshDbStructure();
	  return true;
  },

  detachDatabase: function() {
    var mlist = $$("ml-dbNames");
	  var mi = mlist.selectedItem;
	  var sDbName = mi.getAttribute("dbName");
    if (mlist.selectedIndex <= 2) {
      alert("Cannot detach this item. This operation is valid on an attached database only.");
      return false;
    }

    var answer = smPrompt.confirm(null, "SQLite Manager", "Are you sure you want to detach the database " + sDbName + "?\nThe path of the attached db is: " + mi.getAttribute("tooltiptext"));
		if(!answer) {
		  return false;
     } 
		var sQuery = "DETACH DATABASE " + sm_doublequotes(sDbName);
		if (Database.selectQuery(sQuery)) {
		  var mi = mlist.removeItemAt(mlist.selectedIndex);
      mlist.selectedIndex = 0;
      this.changeAttachedDb();
		  sm_message("Database " + sDbName + " detached.", 0x2);
      return true;
		}
		else {
		  sm_message("Database " + sDbName + " failed to detach.", 0x2);
		  return false;
		}
  },

  attachDatabase: function() {
		if(this.sCurrentDatabase == null)	{
			alert(sm_getLStr("firstOpenADb"));
			return;
		}
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			           .createInstance(nsIFilePicker);
		fp.init(window, sm_getLStr("selectDb"), nsIFilePicker.modeOpen);
    var sExt = "";
		for (var iCnt = 0; iCnt < this.maFileExt.length; iCnt++) {
      sExt += "*." + this.maFileExt[iCnt] + ";";
		}
	  fp.appendFilter(sm_getLStr("sqliteDbFiles") + " (" + sExt + ")", sExt);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var rv = fp.show();
		if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
		  // work with returned nsILocalFile...
    	var sPath = sm_doublequotes(fp.file.path);

      var check = {value: false};   // default the checkbox to false
  		var input = {value: ""};   // default the edit field to table name
  		var result = smPrompt.prompt(null, "Attach Database " + sPath,
  		                  "Enter the database name", input, null, check);
  		var sDbName = input.value;
  		//returns true on OK, false on cancel
  		if (!result || sDbName.length == 0)
  		  return false;

  		var sQuery = "ATTACH DATABASE " + sPath + " AS " + sm_doublequotes(sDbName);
  		if (Database.selectQuery(sQuery)) {
  		  var mi = $$("ml-dbNames").appendItem(sDbName, sDbName, fp.file.leafName);
  		  mi.setAttribute("dbName", sDbName);
  		  mi.setAttribute("tooltiptext", sPath);

  		  sm_message("Database " + sPath + " attached as " + sDbName, 0x2);
        return true;
  		}
  		else {
  		  sm_message("Database " + sPath + " failed to attach.", 0x2);
  		  return false;
  		}  		
		}
		return false;
  },

  createTimestampedBackup: function(nsiFileObj) {
    if (!nsiFileObj.exists()) //exit if no such file
      return false;

    switch (sm_prefsBranch.getCharPref("autoBackup")) {
      case "off":     return false;
      case "on":      break;
      case "prompt":
        var bAnswer = smPrompt.confirm(null, "SQLite Manager",
                        sm_getLStr("confirmBackup"));
        if (!bAnswer) return false;
        break;
      default:        return false;    
    }

    //construct a name for the new file as originalname_timestamp.ext
//    var dt = new Date();
//    var sTimestamp = dt.getFullYear() + dt.getMonth() + dt.getDate(); 
    var sTimestamp = getISODateTimeFormat(null, "", "s");//Date.now(); 
    var sFileName = nsiFileObj.leafName;
    var sMainName = sFileName, sExt = "";
    var iPos = sFileName.lastIndexOf(".");
    if (iPos > 0) {
	    sMainName = sFileName.substr(0, iPos);
	    sExt = sFileName.substr(iPos);
	  }
    var sBackupFileName = sMainName + "_" + sTimestamp + sExt;

    //copy the file in the same location as the original file
    try {
		  nsiFileObj.copyTo(null, sBackupFileName);
		} catch (e) {
		  alert("Failed to create the backup file: " + sBackupFileName + "\nException Message: " + e.message);
		}
		return true;
  },

  openMemoryDatabase: function() {
  	if(this.closeDatabase(false)) {
			this.sCurrentDatabase = "memory";
      this.setDatabase(this.sCurrentDatabase);
      return true;
		}
		return false;
  },

  // setDatabase: set the current database to nsiFileObj
  // If nsiFileObj is a string, then openSpecialDatabase
  setDatabase: function(nsiFileObj) {
  //when passed as arg, works but fails to show .path and .leafName properties
//      this.sCurrentDatabase = nsiFileObj; 

    this.mbDbJustOpened = true;

    var mlist = $$("ml-dbNames");
    mlist.removeAllItems();

		treeBrowse.ShowTable(false);
		treeExecute.ShowTable(false);

    $$("sbSharedMode").label = "---";

		//try connecting to database
		var bConnected = false;
		try	{
			if(this.sCurrentDatabase != null) {
        if (this.sCurrentDatabase == "memory") {
          bConnected = Database.openSpecialDatabase("memory");
        }
        else {
  			 //create backup before opening
          this.createTimestampedBackup(this.sCurrentDatabase);
  
          var mi = $$("menu-general-sharedPagerCache");
          var bSharedPagerCache = mi.hasAttribute("checked");
          bConnected = Database.openDatabase(this.sCurrentDatabase,bSharedPagerCache);
        }
        $$("vb-structureTab").hidden = false;
        $$("vb-browseTab").hidden = false;
        $$("vb-executeTab").hidden = false;
        $$("vb-dbInfoTab").hidden = false;

        $$("bc-dbOpen").removeAttribute("disabled");
		  }
			if(this.sCurrentDatabase == null) {
		    Database.closeConnection();
    		//call it to hide all things there - Issue #90, etc.
        $$("bc-dbOpen").setAttribute("disabled", true);

        this.emptyTabStructure();
     		$$("vb-structureTab").hidden = true;
    		$$("vb-browseTab").hidden = true;
    		$$("vb-executeTab").hidden = true;
    		$$("vb-dbInfoTab").hidden = true;
        this.useExtensionManagementTable(false, true);
		  }
		} 
		catch (e)	{
	    var sTemp = this.sCurrentDatabase.path;
	    this.sCurrentDatabase = null;
	    sm_message("Connect to '" + sTemp + "' failed: " + e, 0x3);
	    return;
		}

    var path = "", leafName = "";
    if (bConnected) {
      $$("sbSharedMode").label = Database.getOpenStatus();

      if (nsiFileObj.path) {
        path = nsiFileObj.path;
        leafName = nsiFileObj.leafName;
        //change the mruPath.1 in preferences
        this.setMruList(path);
      }
      else {
        path = "in-memory database";
        leafName = "in-memory";
      }

      //extension related mgmt info
      if (this.m_bMgmtDataIsInDb) {
        smExtManager = new SMExtensionManager();
  //  else
  //    smExtManager = new SMExtensionManagerExternal();
  
        this.useExtensionManagementTable(smExtManager.getUsage(), true);
      }
      //populate the db list menu with main and temp
      var mlist = $$("ml-dbNames");
      mlist.removeAllItems();
      var mi = mlist.appendItem(leafName, leafName, "");
      mi.setAttribute("dbName", "main");
      mi.setAttribute("tooltiptext", path);
      var mi = mlist.appendItem("Temporary Objects", "Temporary Objects", "");
      mi.setAttribute("dbName", "temp");
      mi.setAttribute("tooltiptext", "Temporary DB Objects");
      var mi = mlist.appendItem("--- Attached Databases ---", "--- Attached Databases ---", "");
      mi.setAttribute("dbName", "");
      mi.setAttribute("disabled", "true");
  
      mlist.selectedIndex = 0;
      this.changeAttachedDb();
      //display the sqlite version in the status bar
      var sV = sm_getLStr("sqlite") + " " + Database.sqliteVersion;
      $$("sbSqliteVersion").setAttribute("label",sV);

      //creating a function
      Database.createFunction("REGEXP", 2, smDbFunctions.regexp);
    }
    if (!bConnected) {
    	this.sCurrentDatabase = null;
    }
    //change window title to show db file path
		document.title = sm_getLStr("extName") + " - " + path;
		//reload the two tabs
    this.refreshDbStructure();

    this.mbDbJustOpened = false;
  },

  selectAllRecords: function() {
    var t;
    if(this.getSelectedTabId() == "tab-browse")
      t = $$("browse-tree");
    else if(this.getSelectedTabId() == "tab-execute")
      t = $$("treeSqlOutput");
    else
      return;

    t.view.selection.selectAll();
    t.focus();
  },

  setSqlText: function(val) {
    $$("txtSqlStatement").value = val;
  },

  resizeThings: function() {
  }
};

//observer for something
function smExampleObserver() {
  this.register();
}

smExampleObserver.prototype = 
{
  observe: function(subject, topic, data) {
     // Do your stuff here.
  },
  
	register: function() {
    var observerService = Cc["@mozilla.org/observer-service;1"]
                          .getService(Ci.nsIObserverService);
    observerService.addObserver(this, "myTopicID", false);
  },
  
	unregister: function() {
    var observerService = Cc["@mozilla.org/observer-service;1"]
                            .getService(Ci.nsIObserverService);
    observerService.removeObserver(this, "myTopicID");
  }
}
