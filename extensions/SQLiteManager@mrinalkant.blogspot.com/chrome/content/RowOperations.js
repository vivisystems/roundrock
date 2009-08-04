var RowOperations = {
  mbConfirmationNeeded: false,

  maQueries: [],
  maParamData: [],

  mNotifyMessages: ["Execution successful", "Execution failed"],
  mAcceptAction: null,

  mIntervalID: null,

	//arrays with information for each field
	aFieldNames: null,
	aFieldValues: null,
	aFieldTypes: null,
	aFieldDefVals: null,
	aDataTypes: null,
	oldBlobs: null,
	newBlobs: null,
	
  mRowId: null, //for update, delete and duplicate
	sCurrentTable: null,
	sObject: null,
	sOperation: null,
	
	aOps: [
			["=", "=", ""],
			["!=", "!=", ""],
			["<", "<", ""],
			["<=", "<=", ""],
			[">", ">", ""],
			[">=", ">=", ""],
			["contains", 'like "%', '%"'],
			["begins with", 'like "', '%"'],
			["ends with", 'like "%', '"'],
			["IS NULL", "", ""],
			["IS NOT NULL", "", ""]
		],

	loadDialog: function () {
		Database = window.arguments[0];
		this.sCurrentTable = window.arguments[1];
		this.sOperation = window.arguments[2];
		this.mRowId = window.arguments[3];

    this.mbConfirmationNeeded = sm_prefsBranch.getBoolPref("confirm.records");

		switch(this.sOperation) {
			case "insert":
			case "duplicate":
				document.title = "Add New Record";
				this.mAcceptAction = "doOKInsert"
				this.setAcceptAction(this.mAcceptAction);
				this.mNotifyMessages = ["Record inserted successfully. You can add another record now. Press Cancel to exit this dialog.", "Failure in inserting record. You can add another record now. Press Cancel to exit this dialog."];
				break;
			case "update":
				document.title = "Edit Record";
				this.mAcceptAction = "doOKUpdate"
				this.setAcceptAction(this.mAcceptAction);
				this.mNotifyMessages = ["Record updated successfully. Press Cancel to exit this dialog.", "Failure in updating record. Press Cancel to exit this dialog."];
				break;
			case "delete":
				document.title = "Delete Record";
				this.mAcceptAction = "doOKDelete"
				this.setAcceptAction(this.mAcceptAction);
				break;
			case "search":
				document.title = "Search in table: " + this.sCurrentTable;
				this.setAcceptAction("doOKSearch");
				break;
			case "search-view":
				document.title = "Search in view: " + this.sCurrentTable;
				this.setAcceptAction("doOKSearch");
				this.loadForViewRecord(this.sCurrentTable, window.arguments[3]);
    		window.sizeToContent();
				return;
		}

		this.loadForTableRecord();
		this.loadTableNames();
		window.sizeToContent();
	},

	setAcceptAction: function(sFunctionName) {
		var dlg = $$("dialog-table-operations");
		dlg.setAttribute("ondialogaccept",
				"return RowOperations." + sFunctionName + "();");
	},

	setCancelAction: function(sFunctionName) {
		var dlg = $$("dialog-table-operations");
		dlg.setAttribute("ondialogcancel",
				"return RowOperations." + sFunctionName + "();");
	},

	loadTableNames: function() {
		this.sObject = "TABLE";
		var listbox = $$("tablenames");

		var aNormTableNames = Database.getObjectList("table", "");
		var aTempTableNames = [];
		var aTableNames = aNormTableNames.concat(aTempTableNames);
		PopulateDropDownItems(aTableNames, listbox, this.sCurrentTable);
	},

  selectTable: function(sID) {
    var sTable = $$(sID).value;
    //to do, if the table dropdown is enabled
	},
	
	doOK: function() {
	},
		
	onSelectOperator: function(selectedOp, sFieldName) {
		var ctrl = "ctrl-tb-" + sFieldName;
		var node = $$(ctrl);
		switch (this.aOps[selectedOp][0]) {
			case "IS NULL":
			case "IS NOT NULL":
				node.disabled = true;
				break;
			default:
				node.disabled = false;
		}
	},
	
	loadForTableRecord: function() {
		$$("tablenames").setAttribute("disabled", true);
		var sTableName = this.sCurrentTable;

		var info = Database.getTableColumns(sTableName, "");
		var cols = info[0];

		this.aFieldNames = [];
		this.aFieldValues = [];
		this.aFieldTypes = [];
		this.aFieldDefVals = [];
		this.aDataTypes = [];
		this.oldBlobs = [];
		this.newBlobs = [];

		for(var i = 0; i < cols.length; i++) {
			this.aFieldNames.push(cols[i][info[1]["name"][0]]);
			this.aFieldValues.push("");
			this.aDataTypes.push(3);
			this.aFieldTypes.push(cols[i][info[1]["type"][0]]);
			this.aFieldDefVals.push(cols[i][info[1]["dflt_value"][0]]);
			
			this.oldBlobs.push(null);
			this.newBlobs.push(null);
		}
		
		if(this.sOperation == "update" || this.sOperation == "delete" || this.sOperation == "duplicate") {
			var sql = "SELECT * from " + Database.getPrefixedName(sTableName, "") + " where " + this.mRowId;
			Database.selectQuery(sql);
			var row = Database.getRecords()[0];
			var cols = Database.getColumns();
			var rowTypes = Database.getRecordTypes()[0];
			for (var j = 0; j < this.aFieldNames.length; j++) {
				for (var k = 0; k < cols.length; k++) {
					if (cols[k][0] == this.aFieldNames[j]) {
						this.aDataTypes[j] = rowTypes[k];
						this.aFieldValues[j] = row[k];
					}
				}
				//for blobs, do the following
				if (this.aDataTypes[j] == 4) {
					var data = Database.selectBlob(this.sCurrentTable, this.aFieldNames[j], this.mRowId);
					this.oldBlobs[j] = data;
				}
			}
		}

		var grbox = $$("columnEntryFields");
		ClearElement(grbox);
		var cap = document.createElement("caption");
		cap.setAttribute("label", "Enter Field Values");
		grbox.appendChild(cap);
		
		for(var i = 0; i < this.aFieldNames.length; i++) {
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex", "0");
			hbox.setAttribute("style", "margin:2px 3px 2px 3px");
			
			var lbl = document.createElement("label");
			var lblVal = (i+1) + ". " + this.aFieldNames[i];
			lblVal += " ( " + this.aFieldTypes[i] + " )"; 
			lbl.setAttribute("value", lblVal);
			lbl.setAttribute("style", "padding-top:5px;width:25ex");
			if (i < 9)
        lbl.setAttribute("accesskey", (i+1));
			lbl.setAttribute("control", "ctrl-tb-" + i);
			hbox.appendChild(lbl);
								
			var spacer = document.createElement("spacer");
			spacer.flex = "1";
			hbox.appendChild(spacer);

			if(this.sOperation == "search") {
				var vb = this.getSearchMenuList(this.aFieldNames[i]);
				hbox.appendChild(vb);
			}

			var inp1 = this.getInputField(i);
			hbox.appendChild(inp1);

			var vb = this.getInputToggleImage(i, this.sOperation);
			hbox.appendChild(vb);

			grbox.appendChild(hbox);
		}
		if (this.sOperation == "insert")
		  this.setInsertValues(true);

		window.sizeToContent();
	},

  saveBlob: function(iIndex) {
    if(this.sOperation != "update")
      return false;
 
	  const nsIFilePicker = Ci.nsIFilePicker;
	  
	  var fp = Cc["@mozilla.org/filepicker;1"]
	  	           .createInstance(nsIFilePicker);
	  fp.init(window, "Save Blob to File", nsIFilePicker.modeSave);
	  fp.appendFilters(nsIFilePicker.filterAll);
	  
	  var rv = fp.show();
	  if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace) {
			var data = this.oldBlobs[iIndex];
			
			if(data.length == 0) //nothing to write
				return false;

	    var file = fp.file;
	    // Get the path as string. Note that you usually won't 
	    // need to work with the string paths.
	    var path = fp.file.path;
	
	    // file is nsIFile, data is a string
	    var foStream = Cc["@mozilla.org/network/file-output-stream;1"]
	                .createInstance(Ci.nsIFileOutputStream);
	    
	    // use 0x02 | 0x10 to open file for appending.
	    foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 
	    // write, create, truncate
	    // In a c file operation, we have no need to set file mode with or operation,
	    // directly using "r" or "w" usually.
    
			var bostream = Cc['@mozilla.org/binaryoutputstream;1']
               .createInstance(Ci.nsIBinaryOutputStream);
	    bostream.setOutputStream(foStream);
	    bostream.writeByteArray(data, data.length);
	    
	    bostream.close();
	    foStream.close();
		}		
  },

	addBlob: function(iIndex) {
	  const nsIFilePicker = Ci.nsIFilePicker;
	  
	  var fp = Cc["@mozilla.org/filepicker;1"]
	  	           .createInstance(nsIFilePicker);
	  fp.init(window, "Select Blob File", nsIFilePicker.modeOpen);
	  fp.appendFilters(nsIFilePicker.filterAll);
	  
	  var rv = fp.show();
	  if (rv == nsIFilePicker.returnOK) {
	    var fistream = Cc["@mozilla.org/network/file-input-stream;1"]
	               .createInstance(Ci.nsIFileInputStream);
	    var bininput = Cc['@mozilla.org/binaryinputstream;1']
	               .createInstance(Ci.nsIBinaryInputStream);
	
	    var mimeservice = Cc['@mozilla.org/mime;1']
	               .createInstance(Ci.nsIMIMEService);
	
//	    var type = mimeservice.getTypeFromFile(fp.file);
//	    if(!type)
//	      type = "application/octet-stream";
	
	    fistream.init(fp.file, 0x01, 0,5);
	    bininput.setInputStream(fistream);
	    var fileCounts = fistream.available();
	    var fileContents = bininput.readByteArray(fileCounts);
	    bininput.close();
	    fistream.close();

	 		this.newBlobs[iIndex] = fileContents;

  		var ctrltb = $$("ctrl-tb-" + iIndex);
  		var val = g_strForBlob;
      if (g_showBlobSize)
				val += " (Size: " + fileCounts + ")";

  		ctrltb.setAttribute("value",val);
  		ctrltb.setAttribute("fieldtype","4");
  		ctrltb.setAttribute("disabled","true");

//  		var imgSave = $$("img-saveBlob-" + sField);
//  		imgSave.setAttribute("hidden","false");
  
  		var imgRemove = $$("img-removeBlob-" + iIndex);
  		imgRemove.setAttribute("hidden","false");
	  }
	
	},

	removeBlob: function(iIndex) {
		var ctrltb = $$("ctrl-tb-" + iIndex);
		ctrltb.setAttribute("value","");
		ctrltb.setAttribute("fieldtype","3");
		ctrltb.removeAttribute("disabled");

		var imgSave = $$("img-saveBlob-" + iIndex);
		imgSave.setAttribute("hidden","true");

		var imgRemove = $$("img-removeBlob-" + iIndex);
		imgRemove.setAttribute("hidden","true");
	},

	getSearchMenuList: function(sField) {
		var ml = document.createElement("menulist");
		ml.setAttribute("id", "op-" + sField);
		ml.setAttribute("sizetopopup", "always");
		ml.setAttribute("style", "max-width: 25ex");
		ml.setAttribute("oncommand", 
			"RowOperations.onSelectOperator(this.value, '" +	sField + "')");
    
		var mp = document.createElement("menupopup");

		for(var iOp = 0; iOp < this.aOps.length; iOp++) {
			var mi = document.createElement("menuitem");
			mi.setAttribute("label", this.aOps[iOp][0]);
			mi.setAttribute("value", iOp);
			if (iOp == 0)
				mi.setAttribute("selected", "true");
			mp.appendChild(mi);
		}
		ml.appendChild(mp);
		var vb = document.createElement("vbox");
		vb.appendChild(ml);
	  return vb;
	},

	getInputToggleImage: function(iIndex, sOperation) {
		var iType = 3;
		if (this.aDataTypes != null)
			iType = this.aDataTypes[iIndex];

		var hb = document.createElement("hbox");
		var vb = document.createElement("vbox");
		var img = document.createElement("image");
		img.setAttribute("id", "img-" + iIndex);
		img.setAttribute("src", "chrome://sqlitemanager/skin/images/expand.png");
		img.setAttribute("style", "margin-top:5px;");
		img.setAttribute("tooltiptext", "Expand the input area");
		img.setAttribute("onclick", 'RowOperations.collapseInputField("' + iIndex + '")');
		vb.appendChild(img);
		hb.appendChild(vb);

			if (sOperation == "update" || sOperation == "insert") {
				var vb1 = document.createElement('vbox');
				var img1 = document.createElement('image');
				img1.setAttribute('id', 'img-addBlob-' + iIndex);
				img1.setAttribute('src', 'chrome://sqlitemanager/skin/images/attachBlob.gif');
	  		img1.setAttribute("style", "margin-top:5px;");
	  		img1.setAttribute("tooltiptext", "Add File as a Blob");
				img1.setAttribute("onclick", 'RowOperations.addBlob(' + iIndex + ')');
				vb1.appendChild(img1);
				hb.appendChild(vb1);
	
				var vb2 = document.createElement('vbox');
				var img2 = document.createElement('image');
				img2.setAttribute('id', 'img-saveBlob-' + iIndex);
				img2.setAttribute('src', 'chrome://sqlitemanager/skin/images/saveBlob.png');
	  		img2.setAttribute('style', 'margin-top:5px;');
	  		img2.setAttribute("tooltiptext", "Save Blob data as a file");
				img2.setAttribute('onclick', 'RowOperations.saveBlob(' + iIndex + ')');
 	  		img2.setAttribute('hidden', 'true');
				if (iType == 4)
  	  		img2.setAttribute('hidden', 'false');
				vb2.appendChild(img2);
				hb.appendChild(vb2);

				var vb3 = document.createElement('vbox');
				var img3 = document.createElement('image');
				img3.setAttribute('id', 'img-removeBlob-' + iIndex);
				img3.setAttribute('src', 'chrome://sqlitemanager/skin/images/delete_red.gif');
	  		img3.setAttribute('style', 'margin-top:5px;');
	  		img3.setAttribute("tooltiptext", "Delete the Blob data from this column");
				img3.setAttribute('onclick', 'RowOperations.removeBlob(' + iIndex + ')');
 	  		img3.setAttribute('hidden', 'true');
				if (iType == 4)
  	  		img3.setAttribute('hidden', 'false');
				vb3.appendChild(img3);
				hb.appendChild(vb3);
			}
		  return hb;
	},

  getTextBoxHeight: function() {
		//show the reference textbox, get the height and hide it
		//needed because multiline is taller than normal textbox even when rows=1
		var oRef = $$("reference");
		oRef.hidden = false;
		var iHeight = oRef.boxObject.height;
		oRef.hidden = true;
		return iHeight;
  },

	getInputField: function(iIndex) {
		var sField = this.aFieldNames[iIndex];
		var sValue = "", iType = 3;
		if (this.aFieldValues != null)
			sValue = this.aFieldValues[iIndex];
		if (this.aDataTypes != null)
			iType = this.aDataTypes[iIndex];

		var inp1 = document.createElement("textbox");
		inp1.setAttribute("id", "ctrl-tb-" + iIndex);
		inp1.setAttribute("flex", "30");
		inp1.setAttribute("value", sValue);
		inp1.setAttribute("multiline", "true");
	  inp1.setAttribute("rows", "1");
	  if (iType == 4)
		  inp1.setAttribute("disabled", "true");
    //following attributes are not in xul
		inp1.setAttribute("originalvalue", sValue);
		inp1.setAttribute("fieldtype", iType);

		var iHeight = this.getTextBoxHeight();
	  inp1.setAttribute("height", iHeight);

	  return inp1;
	},

  setInsertValues: function(bForceDefault) {
    //Issue #169
    if (!bForceDefault) {
      var sInsertFieldStatus = sm_prefsBranch.getCharPref("whenInsertingShow");
      if (sInsertFieldStatus != "default")
        return false;
    }

		for(var i = 0; i < this.aFieldDefVals.length; i++) {
  		var inptb = $$("ctrl-tb-" + i);
  		inptb.value = sm_makeSimpleString(this.aFieldDefVals[i]);
    }
  },

  typeConstant: function(sConstant) {
    var focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == "html:textarea")
      focused.value = sConstant;
  },

	collapseInputField: function(id) {
		var inptb = $$("ctrl-tb-" + id);
		var iLines = inptb.getAttribute("rows");
		var bMultiline = inptb.hasAttribute("multiline");

    var img = $$("img-" + id);
		if (iLines == 1) {
		  inptb.setAttribute("rows", 4);
  	  inptb.removeAttribute("height");
			img.setAttribute('src', 'chrome://sqlitemanager/skin/images/collapse.png');
  		img.setAttribute("tooltiptext", "Collapse the input area");
		}
		else {
  		var iHeight = this.getTextBoxHeight();
  	  inptb.setAttribute("height", iHeight);
		  inptb.setAttribute("rows", 1);
			img.setAttribute('src', 'chrome://sqlitemanager/skin/images/expand.png');
  		img.setAttribute("tooltiptext", "Expand the input area");
		}
	},

	loadForViewRecord: function(sViewName, aColumns) {
		$$("tablenames").hidden = true;
		$$("label-name").value = "View Name : " + sViewName;

		this.aFieldNames = aColumns[0];
		var aTypes = aColumns[1];

		var grbox = $$("columnEntryFields");
		ClearElement(grbox);
		var cap = document.createElement("caption");
		cap.setAttribute("label", "Enter Field Values");
		grbox.appendChild(cap);

		for(var i = 0; i < this.aFieldNames.length; i++) {
			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex", "1");
			hbox.setAttribute("style", "margin:2px 3px 2px 3px");

			var lbl = document.createElement("label");
			var lblVal = (i+1) + ". " + this.aFieldNames[i];
			lblVal += " ( " + aTypes[i] + " )"; 
			lbl.setAttribute("value", lblVal);
			lbl.setAttribute("style", "padding-top:5px;width:25ex");
			if (i < 9)
        lbl.setAttribute("accesskey", (i+1));
			lbl.setAttribute("control", "ctrl-tb-" + i);
			hbox.appendChild(lbl);

			var spacer = document.createElement("spacer");
			spacer.flex = "1";
			hbox.appendChild(spacer);

			var vb = this.getSearchMenuList(this.aFieldNames[i]);
			hbox.appendChild(vb);

			var inp = this.getInputField(i);
			hbox.appendChild(inp);

			var vb = this.getInputToggleImage(i);
			hbox.appendChild(vb);

			grbox.appendChild(hbox);
		}
	},

	doOKInsert: function() {
		var colPK = null;
		var rowidcol = Database.getTableRowidCol(this.sCurrentTable);
		if (rowidcol["name"] != "rowid")
			colPK = rowidcol["name"];

		var aNullCols = Database.getColumnsNullAllowStatus(this.sCurrentTable, true);
		var aDefCols = Database.getTableColumnsWithDefaultValue(this.sCurrentTable);
		if (colPK != null)
			aDefCols.push(colPK);

		var inpval, fld;
		var aCols = [];
		var aVals = [];
		
		var iParamCounter = 1;
		var aParamData = [];
		for(var i = 0; i < this.aFieldNames.length; i++) {
			var ctrltb = $$("ctrl-tb-" + i);
			inpval = ctrltb.value;

			//this is to allow autoincrement of primary key columns 
			//and accept default values where available
			if (aDefCols.indexOf(this.aFieldNames[i]) >= 0)
				if(inpval.toUpperCase() == g_strForNull.toUpperCase() || inpval.length == 0)
				  continue;

      //when no input, omit column from insert unless null not allowed
      if (inpval.length == 0 && aNullCols.indexOf(this.aFieldNames[i]) >= 0)
        continue;

			var iType = ctrltb.getAttribute("fieldtype");
      if (iType == 4 && this.newBlobs[i] == null)
        continue;

			inpval = sm_makeSqlValue(inpval);
			fld = sm_doublequotes(this.aFieldNames[i]);

			if (iType == 4) {
				inpval = "?" + iParamCounter;
				aParamData.push([(iParamCounter-1), this.newBlobs[i], "blob"]);
				iParamCounter++;
			}

			aCols.push(fld);
			aVals.push(inpval);
		}	
		var cols = "(" + aCols.toString() + ")";
		var vals = "(" + aVals.toString() + ")";
		
		this.maQueries = ["INSERT INTO " + Database.getPrefixedName(this.sCurrentTable, "")
                + " " + cols + " VALUES " + vals];
    this.maParamData = aParamData
    if (this.mbConfirmationNeeded)
      this.seekConfirmation();
    else
      this.doOKConfirm();
    return false;
	},

  notify: function(sMessage, sType) {
	  var notifyBox = $$("boxNotify");
	  var notification = notifyBox.appendNotification(sMessage);
	  notification.type = sType;
	  //notification.priority = notifyBox.PRIORITY_INFO_HIGH;
	  setTimeout('$$("boxNotify").removeAllNotifications(false);', 3000);
  },

	doOKUpdate: function() {
		var inpval, fld, inpOriginalVal, iType;
		var cols = "";
		var vals = "";
		var aParamData = [];
		var iParamCounter = 1;
		for(var i = 0; i < this.aFieldNames.length; i++) {
			var ctrltb = $$("ctrl-tb-" + i);
			inpval = ctrltb.value;
			inpOriginalVal = ctrltb.getAttribute("originalvalue");
			inpval = sm_makeSqlValue(inpval);
			inpOriginalVal = sm_makeSqlValue(inpOriginalVal);

			iType = ctrltb.getAttribute("fieldtype");
      if (iType == 4 && this.newBlobs[i] == null)
        continue;

      if (inpOriginalVal == inpval)
        continue;

			if (iType == 4) {
				inpval = "?" + iParamCounter;
				aParamData.push([(iParamCounter-1), this.newBlobs[i], "blob"]);
				iParamCounter++;
			}
			
			fld = sm_doublequotes(this.aFieldNames[i]);

			if(cols != "") {
				fld = ", " + fld;
			}
			cols += fld + " = " + inpval;
		}	

		if (cols == "") {
		  alert("No field has been changed. You can use Cancel button to cancel the operation");
		  return false;
		}

		this.maQueries = ["UPDATE " + Database.getPrefixedName(this.sCurrentTable, "")
                + " SET " + cols + " WHERE " + this.mRowId];
    this.maParamData = aParamData
    if (this.mbConfirmationNeeded)
      this.seekConfirmation();
    else
      this.doOKConfirm();
    return false;
	},

//required in case delete option is added to the edit record dialog
	doOKDelete: function() {
		this.maQueries = ["DELETE FROM " +
          Database.getPrefixedName(this.sCurrentTable, "")+ " WHERE " + this.mRowId];
    this.maParamData = null;
    if (this.mbConfirmationNeeded)
      this.seekConfirmation();
    else
      this.doOKConfirm();
    return false;
	},

	//used for searching within table/view
	doOKSearch: function() {
		var inpval, opval, fld;
		var where = "";
		for(var i = 0; i < this.aFieldNames.length; i++) {
			var ctrltb = $$("ctrl-tb-" + i);
			inpval = ctrltb.value;
			if (inpval.length == 0)
				continue;
			opval = $$("op-" + this.aFieldNames[i]).value;
//			if (this.aOps[opval][0] == g_strIgnore)
//				continue;

			switch (this.aOps[opval][0]) {
				case "IS NULL":
					inpval = " ISNULL ";
					break;
				case "IS NULL":
					inpval = " NOTNULL ";
					break;
				default:
				  if (this.aOps[opval][2] != "")
            inpval = this.aOps[opval][1] + inpval + this.aOps[opval][2];
          else {//figure out whether value is string/constant
            inpval = this.aOps[opval][1] + sm_makeSqlValue(inpval);
          }
					break;
			}
			inpval = sm_doublequotes(this.aFieldNames[i]) + " " + inpval;

			if(where.length > 0)
				inpval = " AND " + inpval;

			where += inpval;
		}
		var extracol = "";
		if (this.sOperation == "search") {	//do this for table, not for view
			var rowidcol = Database.getTableRowidCol(this.sCurrentTable);
			if (rowidcol["name"] == "rowid")
				extracol = " rowid, ";
		}
		if(where.length > 0)
			where = " WHERE " + where;

		var answer = true;
	  if(answer) {
			//the order in which the following are set is important
			sm_prefsBranch.setCharPref("searchCriteria", where);

			//the value of searchToggler should toggle for change event to fire.
			var bTemp = sm_prefsBranch.getBoolPref("searchToggler");
			sm_prefsBranch.setBoolPref("searchToggler", !bTemp);
		}
		//return false so that window stays there for more queries
		//the user must cross, escape or cancel to exit
		//return false; //commented due to Issue #32
	},
		
	doCancel: function() {
      return true;
	},

	doOKConfirm: function() {
    this.changeState(0);
    var bRet = Database.executeWithoutConfirm(this.maQueries, this.maParamData);
    if (bRet) {
		  this.notify(this.mNotifyMessages[0], "info");
    }
    else {
		  this.notify(this.mNotifyMessages[1], "warning");
    }

    if (this.mAcceptAction == "doOKInsert") {
      this.setInsertValues(false);
      $$("ctrl-tb-0").focus();
    }
    if (this.mAcceptAction == "doOKUpdate") {
      //reset values so that no further change means no more update
    }
    return false;
	},

	doCancelConfirm: function() {
    this.changeState(0);
    return false;
	},

	changeState: function(iNewState) {
    $$("deck-rowedit").selectedIndex = iNewState;
    if (iNewState == 0) {
      this.setAcceptAction(this.mAcceptAction);      
      this.setCancelAction("doCancel");      
    }
    if (iNewState == 1) {
      this.setAcceptAction("doOKConfirm");      
      this.setCancelAction("doCancelConfirm");      
    }
	},

  seekConfirmation: function() {
  	var ask = "Are you sure you want to execute the following statement(s):";
  	var txt = ask + "\n\n" + this.maQueries.join("\n");
    $$("tbMessage").value = txt;
    this.changeState(1);
  }
};
