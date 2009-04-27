var Database;
var SmExim = {
	sExpType: "",
	sObjectName: null,
	sObjectType: null,
	msDbName: "main",
	
	lines: [],
	mFileToImport: null,
	msLeafName: null,

  mDeckId: null,
  mPrevDeckPanelId: null,

  init: function() {
    this.msDbName = null;
    this.sObjectType = null;
    this.sObjectName = null;
    this.mFileToImport = null;
    this.msLeafName = null;
  },

  exitExim: function() {
    if (this.mPrevDeckPanelId == "eximTabbox")
      $$(this.mDeckId).selectedIndex = 0;
    else
      $$(this.mDeckId).selectedPanel = $$(this.mPrevDeckPanelId);
  },

	loadDialog: function (sOpType, sDeckId, sObjectType, sObjectName) {
    this.init();
    this.mDeckId = sDeckId;
    this.mPrevDeckPanelId = $$(sDeckId).selectedPanel.id;

    $$(this.mDeckId).selectedPanel = $$("eximTabbox");
		this.msDbName = Database.logicalDbName;

		if (sOpType == "import") {
			$$("eximTab").label = "Import Wizard";
			$$("exim-exp-ok").hidden = true;
			$$("exim-imp-ok").hidden = false;
			$$("eximSql-create-statement").hidden = true;
			$$("eximObjectSelection").hidden = true;
			$$("eximFileSelection").hidden = false;
			$$("eximFilename").value = "";
			return;
		}
		if (sOpType == "export") {
		  this.sObjectType = sObjectType;
		  this.sObjectName = sObjectName;
			$$("eximTab").label = "Export Wizard: Exporting the " + sObjectType + ": " + this.sObjectName;
			$$("exim-exp-ok").hidden = false;
			$$("exim-imp-ok").hidden = true;
			$$("eximSql-create-statement").hidden = false;
			$$("eximObjectSelection").hidden = false;
			$$("eximFileSelection").hidden = true;

  		this.loadDbNames("eximDbName", Database.logicalDbName);
      this.loadObjectNames("eximObjectNames", this.sObjectName, sObjectType);
  
  		$$("eximLblObjectType").value = "Name of the " + sObjectType;
			return;
		}

	},
	
  loadObjectNames: function(sListBoxId, sTableName, sObjectType) {
		var dbName = $$("eximDbName").value;
		var listbox = $$(sListBoxId);

    var aObjectNames = [];
    if (sObjectType == "table") {
      var aMastTableNames = Database.getObjectList("master", dbName);
	   	var aNormTableNames = Database.getObjectList("table", dbName);
		  aObjectNames = aMastTableNames.concat(aNormTableNames);
		}
		else
	   	aObjectNames = Database.getObjectList(sObjectType, dbName);
		
		PopulateDropDownItems(aObjectNames, listbox, sTableName);
		this.onSelectObject();
  },

  loadDbNames: function(sListBoxId, sDbName) {
		var listbox = $$(sListBoxId);
    var aObjectNames = Database.getDatabaseList();
		PopulateDropDownItems(aObjectNames, listbox, sDbName);
  },

  onSelectDb: function(sID) {
    this.loadObjectNames("eximObjectNames", this.sObjectName, this.sObjectType);
	},

	onSelectObject: function() {
		this.sObjectName = $$("eximObjectNames").value;

		$$("eximTab").label = "Export Wizard: Exporting the " + this.sObjectType + ": " + this.sObjectName;
		$$("eximSql-create-statement").hidden = false;
		if (this.sObjectName == "sqlite_master" || this.sObjectName == "sqlite_temp_master") {
		  $$("eximSql-create-statement").checked = false;
		  $$("eximSql-create-statement").hidden = true;
		}
  },

	onSelectTab: function() {
		switch($$("eximTabsFormat").selectedItem.getAttribute("id")) {
			case "eximTabCsv":
				this.sExpType = "csv";
				break;
			case "eximTabSql":
				this.sExpType = "sql";
				break;
			case "eximTabXml":
				this.sExpType = "xml";
				break;
		}
	},

	doOKExport: function() {
    this.onSelectTab();
		var sTableName = $$("eximObjectNames").value;
		var sDbName = $$("eximDbName").value;

		// get export file
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			      .createInstance(nsIFilePicker);
		fp.init(window, "Export to file ", nsIFilePicker.modeSave);
		fp.appendFilters(nsIFilePicker.filterAll);
		fp.defaultString = sTableName + "." + this.sExpType;
		
		var rv = fp.show();
		
		//if chosen then
		if (rv != nsIFilePicker.returnOK && rv != nsIFilePicker.returnReplace) {
			alert("Please choose a file to save the exported data to.");
			return false;
		}
		var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
		file.initWithFile(fp.file);

		var foStream = Cc["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Ci.nsIFileOutputStream);
		// use 0x02 | 0x10 to open file for appending.
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

    var os = Cc["@mozilla.org/intl/converter-output-stream;1"]
              .createInstance(Ci.nsIConverterOutputStream);
    
    // This assumes that fos is the nsIOutputStream you want to write to
    os.init(foStream, "UTF-8", 0, 0x0000);
    
		var sQuery = "SELECT * FROM " + Database.getPrefixedName(sTableName, sDbName);
		var iExportNum = 0;
		switch(this.sExpType) {
			case "csv":
			 //separator
    		var cSeparator = $$("eximCsv_separator").value;
    		if(cSeparator == "other")
    		  cSeparator = $$("eximCsv_separator-text").value;
        else if(cSeparator == "\\t")
          cSeparator = "\t";
        //encloser
    		var cEncloser = $$("eximCsv_encloser").value;
    		if(cEncloser == "other")
    		 cEncloser = $$("eximCsv_encloser-text").value;
        //colnames needed or not
    		var bColNames = $$("eximCsv_column-names").checked;

				iExportNum = this.writeCsvContent(os, sQuery, cSeparator, cEncloser, bColNames);
				break;
			case "sql":
    		var sDbName = $$("eximDbName").value;
        var bTransact = $$("eximSql-transact-statement").checked;
    		var bCreate = $$("eximSql-create-statement").checked;
				iExportNum = this.writeSqlContent(os, sDbName, this.sObjectName, bCreate, bTransact);
				break;
			case "xml":
	     	var bType = $$("eximXml_type-attribute").checked;
				iExportNum = this.writeXmlContent(os, sQuery, bType);
				break;
		}
    os.close();
		foStream.close();
		sm_message(iExportNum + " records exported to " + fp.file.path, 0x3);
		return false;
	},

	writeCsvContent: function(foStream, sQuery, cSeparator, cEncloser, bColNames) {
		Database.selectQuery(sQuery, true);
		var allRecords = Database.getRecords();
		var columns = Database.getColumns();
		
		if(bColNames) {
			var data = "";
			var i = 0;
			for(var i in columns) {
				if (i > 0) data += cSeparator;
				if (cEncloser == "din") {
          if (columns[i][0].indexOf('"') >= 0 
              || columns[i][0].indexOf('\n') >= 0 
              || columns[i][0].indexOf(cSeparator) >= 0) {
            columns[i][0] = columns[i][0].replace("\"", "\"\"", "g");				
            data += '"' + columns[i][0] + '"';
          }
          else
            data += columns[i][0];
				}
				else
        	data += cEncloser + columns[i][0] + cEncloser;
				i++;
			}
			data += "\n";
      foStream.writeString(data);
		}

		for(var i = 0; i < allRecords.length; i++) {
			var row = allRecords[i];
			var data = "";
      for (var iCol = 0; iCol < row.length; iCol++) {
				if (iCol > 0) data += cSeparator;
				if (cEncloser == "din") {
				  if(typeof row[iCol] == "string") {
            if (row[iCol].indexOf('"') >= 0 
                || row[iCol].indexOf('\n') >= 0 
                || row[iCol].indexOf(cSeparator) >= 0) {
              row[iCol] = row[iCol].replace("\"", "\"\"", "g");				
              data += '"' + row[iCol] + '"';
            }
            else
              data += row[iCol];
          }
          else
            data += row[iCol];
				}
				else
    			data += cEncloser + row[iCol] + cEncloser;
      }
			data += "\n";
      foStream.writeString(data);
		}
		return allRecords.length;
	},
  //function depends on args and Database object only
	writeSqlContent: function(foStream, sDbName, sTable, bCreate, bTransact) {
    var data = "";

    if (bTransact) {
      data = "BEGIN TRANSACTION;\n";
      foStream.writeString(data);
    }

    if (bCreate) {
      var sTableSql = Database.getMasterInfo(sTable, ["sql"], sDbName);
      data = "DROP TABLE IF EXISTS " + sm_doublequotes(sTable) + ";\n";
      data += sTableSql[0] + ";\n";
        foStream.writeString(data);

    }

		var sQuery = "SELECT * FROM " + Database.getPrefixedName(sTable, sDbName);
		Database.selectQuery(sQuery, true);
		var allRecords = Database.getRecords();
		var columns = Database.getColumns();
		var types = Database.getRecordTypes();
    if (allRecords.length > 0) { 
      var sInsert = "INSERT INTO " + sm_doublequotes(sTable) + " VALUES(";
		  for(var i = 0; i < allRecords.length; i++) {
        data = sInsert;
			  var row = allRecords[i];
        for (var iCol = 0; iCol < row.length; iCol++) {
			    if (iCol > 0) data += ",";
          switch (types[i][iCol]) {
            case 0:  data += g_strForNull; break;
            case 3:  data += sm_quote(row[iCol]); break;
            case 4:  data += row[iCol].toString(); break;
            default: data += row[iCol]; break;
          }
        }
        data += ");\n"
        foStream.writeString(data);
		  }
	  }
    if (bTransact) {
      data = "COMMIT;\n";
      foStream.writeString(data);
    }
		return allRecords.length;
	},

	writeXmlContent: function(foStream, sQuery, bType) {
		Database.selectQuery(sQuery, true);
		var allRecords = Database.getRecords();
		var columns = Database.getColumns();
		var types = Database.getRecordTypes();
		var sDbName = Database.getFileName();
		var data = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n";
		data += "<!--\n";
		data += "  GUID:  SQLiteManager@mrinalkant.blogspot.com\n";
		data += "  Homepage:  http://sqlite-manager.googlecode.com\n\n";
		var d = new Date();
		data += "  Generation Time: " + d.toGMTString() + "\n";
		data += "  SQLite version: " + Database.sqliteVersion + "\n";
		data += "-->\n\n";
		data += "<!-- Database: " + sDbName + " -->\n";
    foStream.writeString(data);

		var xmlDatabase = <{sDbName}/>;
		var xmlColumn, data, xmlTable, colName;
		for(var i = 0; i < allRecords.length; i++) {
			var row = allRecords[i];
			xmlTable = <{this.sObjectName}/>;
      for (var iCol = 0; iCol < row.length; iCol++) {
				colName = columns[iCol][0];
				xmlColumn = <{colName}>{row[iCol]}</{colName}>;
				if (bType)
					xmlColumn.@type = types[i][iCol];
				xmlTable.appendChild(xmlColumn);
      }
      xmlDatabase.appendChild(xmlTable);
		}
    data = xmlDatabase.toXMLString();
    foStream.writeString(data);
		return allRecords.length;
	},

  selectFile: function() {
    this.onSelectTab();
		const nsIFilePicker = Ci.nsIFilePicker;
		var fp = Cc["@mozilla.org/filepicker;1"]
			           .createInstance(nsIFilePicker);
		fp.init(window, "Select File to Import", nsIFilePicker.modeOpen);
		var fileFilters = {
  		csv: ["CSV Files", "*.csv"],
  		xml: ["XML Files", "*.xml"],
  		sql: ["SQL Files", "*.sql"]
  		};
		var filter = fileFilters[this.sExpType];
		fp.appendFilter(filter[0], filter[1]);
		fp.appendFilters(nsIFilePicker.filterAll);
		
		var rv = fp.show();
		if (rv != nsIFilePicker.returnOK && rv != nsIFilePicker.returnReplace) {
			return false;
		}

		//if chosen then
		var file = Cc["@mozilla.org/file/local;1"]
							.createInstance(Ci.nsILocalFile);
		file.initWithFile(fp.file);
		//to support ADS
		//file.initWithPath(fp.file.path + ":hhh.txt"); //ADS works
		
		this.msLeafName = fp.file.leafName;
		$$("eximFilename").value = this.msLeafName;
		this.mFileToImport = file;
		var iLength = this.msLeafName.indexOf(".");
		if (iLength >= 0)
			this.msLeafName = this.msLeafName.substring(0, iLength);
		return true;
  },

	doOKImport: function() {
    if (this.mFileToImport == null) {
      smPrompt.alert(null, "SQLite Manager - Import Error", "No file to import from!\nPlease select the file which contains the data you want to import.");
      return false;
    }

    var file = this.mFileToImport;
		// |file| is nsIFile
		var istream = Cc["@mozilla.org/network/file-input-stream;1"]
                  .createInstance(Ci.nsIFileInputStream);
		istream.init(file, 0x01, 0444, 0);

    var is = Cc["@mozilla.org/intl/converter-input-stream;1"]
                   .createInstance(Ci.nsIConverterInputStream);

    // This assumes that istream is the nsIInputStream you want to read from
    var charset = $$("eximFileCharSet").value;
    is.init(istream, charset, 1024, 0xFFFD);

		// read lines into array
		var line = {}, bHasMore = true;
		this.lines = [];
    if (is instanceof Ci.nsIUnicharLineInputStream) {
      do {
    			bHasMore = is.readLine(line);
    			this.lines.push(line.value);
      } while (bHasMore);
    }
		istream.close();
		
		var iImportNum = 0;
		switch(this.sExpType) {
			case "csv":
    		var cSeparator = $$("eximCsv_separator").value;
    		if(cSeparator == "other")
    		  cSeparator = $$("eximCsv_separator-text").value;
        else if(cSeparator == "\\t")
          cSeparator = "\t";

    		var cEncloser = $$("eximCsv_encloser").value;
    		if(cEncloser == "other")
    		 cEncloser = $$("eximCsv_encloser-text").value;
        if (cEncloser == "din")
          cEncloser = '"';

    		var bColNames = $$("eximCsv_column-names").checked;

				iImportNum = this.readCsvContent(cSeparator, cEncloser, bColNames);
				break;
			case "sql":
				iImportNum = this.readSqlContent();
				break;
			case "xml":
				iImportNum = this.readXmlContent();
				break;
		}
		this.lines = null;
		if (iImportNum > 0) {
		  if (this.sExpType == "sql")
		    sm_message(iImportNum + " statements executed.", 0x3);
		  else
		    sm_message(iImportNum + " records imported.", 0x3);

      SQLiteManager.refreshDbStructure();
      SQLiteManager.loadTabBrowse();
      return true;

		}
		else
		  sm_message("Import failed.", 0x3);
		  
		return false;
	},
	
	readCsvContent: function(cSeparator, cEncloser, bColNames) {
		//determine table name
		var check = {value: false};   // default the checkbox to false
		var input = {value: this.msLeafName};   // default the edit field to leafname
		var result = smPrompt.prompt(null, "SQLite Manager",
		                  "Enter the name of the table in which data will be imported:", 
		                  input, null, check);
		var sTabName = input.value;
		//returns true on OK, false on cancel
		if (!result || sTabName.length == 0)
		  return -1;

		var sVals, row, colText;
		var iEnc = cEncloser.length;

		var cValEnc = "'";
		if (cEncloser == '"')
			cValEnc = '"';

		var sData = "";
		//Include \n for sql to correctly recognize token boundaries as well as 
		//one line comments
		for (var iLine = 0; iLine < this.lines.length; iLine++)
		  sData += this.lines[iLine] + "\n";
		var aCsvLines = csv_tokenizer(sData, cSeparator);
		var iRows = aCsvLines.length;

    var aCols = [];
		if (iRows > 0) {
      var aVals = aCsvLines[0];

			if (bColNames) {
				for (var c = 0; c < aVals.length; c++) {
          if (aVals[c].indexOf(cEncloser) == 0)
    				aVals[c] = aVals[c].substring(iEnc, aVals[c].length - iEnc);

          aCols.push(aVals[c]);
  			}
			}
			else {
        for (var c = 1; c <= aVals.length; c++)
					aCols.push("col_" + c);
			}
		}
		else
			return -1;

		var aQueries = [];
		var sQuery = "";
    var iOtherQueries = 0;

    var sDbName = Database.logicalDbName;
    var aRet = this.getCreateTableQuery(sTabName, sDbName, aCols, false);
    if (aRet.error)
      return -1;
    if (aRet.query != "") {
			aQueries.push(aRet.query);
	   	iOtherQueries = 1;
    }
    sTabName = aRet.tableName;

		for (var i = bColNames?1:0; i < iRows; i++) {
      var aVals = aCsvLines[i];

      var iCol = 0;
      var aInp = [];
      var aBadLines = [];
      var sNoValue = "''";
			for (var c = 0; c < aVals.length; c++) {
        //ignore nulls
//        if (aVals[c].length == 0)
//          continue;

        //reached here, means this is a column value
        if (aVals[c].indexOf(cEncloser) == 0) {
  				aVals[c] = aVals[c].substring(iEnc, aVals[c].length - iEnc);
  				if (cEncloser == '"')
  				  aVals[c] = aVals[c].replace("\"\"", '"', "g");
  				if (cEncloser == "'")
  				  aVals[c] = aVals[c].replace("\'\'", "'", "g");
  			}
  			
        aVals[c] = sm_makeSqlValue(aVals[c]);
        aInp.push(aVals[c]);
			}
			
			//if aInp has fewer values than expected, 
      //complete the aInp array with empty strings.
      while (aInp.length < aCols.length)
        aInp.push(sNoValue);
      //aBadLines will not be empty only if their are more values than columns
      if (aInp.length != aCols.length) {
        aBadLines.push(i+1);
        continue;
      }
			sVals = " VALUES (" + aInp.join(",") + ")";
			sQuery = "INSERT INTO " + sTabName + sVals;
//alert(sQuery);
			aQueries.push(sQuery);
		}
		var num = aQueries.length - iOtherQueries;
		var answer = smPrompt.confirm(null, "SQLite Manager", "Are you sure you want to perform the following operation(s):\nImport Data: Rows = " + num);
		if(answer) {
		  if (aBadLines.length > 0) {
        var err = "Failed to import " + aBadLines.length +
                  " lines.\nRow numbers: " + aBadLines.join(", ");
        alert(err);
      }
			var bReturn = Database.executeTransaction(aQueries);
	  	if (bReturn)
				return num;
		}
		return -1;
	},
	
	readSqlContent: function() {
		var sData = "";
		//Include \n for sql to correctly recognize token boundaries as well as 
		//one line comments
		for (var iLine = 0; iLine < this.lines.length; iLine++)
		  sData += this.lines[iLine] + "\n";

		var aQueries = sql_tokenizer(sData);
//		alert(aQueries);

    var bTransact = $$("eximSql-transact-statement").checked;

    if (bTransact) {
      //remove the first and last statement which should be
      //BEGIN TRANSACTION and COMMIT respectively
      aQueries.splice(0, 1);
      aQueries.splice(aQueries.length - 1, 1);
    }

		var answer = smPrompt.confirm(null, "SQLite Manager", "Are you sure you want to perform the following operation(s):\nImport Data by executing SQL statements\nNumber of SQL statements: " + aQueries.length);
		if(answer) {
			var bReturn = Database.executeTransaction(aQueries);
	  	if (bReturn)
				return aQueries.length;
		}
		return -1;
	},
	
	readXmlContent: function() {
		var bType = $$("eximXml_type-attribute").checked;

		var aQueries = [];
		//the following two arrays should be of equal length
		var xmlTables = []; //unique table names in xml nodes
    var actualTables = [];//names of tables as created

    var aCols = [];

		var sData = "";
		//E4X doesn't support parsing XML declaration(<?xml version=...?>)(bug 336551)
		//so, skipping one line and counter is initialized to 0 instead of 1
		for (var iLine = 1; iLine < this.lines.length; iLine++)
		  sData += this.lines[iLine];

		var xmlData = new XML(sData);
		XML.ignoreComments = true;
		var sDbName = xmlData.name().localName;
		var iRows = xmlData.*.length();
		var sCols, sVals, iCols, row, colText, sTabName, sQuery;
		for (var i = 0; i < iRows; i++) {
			row = xmlData.child(i);
			sTabName = row.name().localName;
			iCols = row.*.length();
			sCols = "";
			sVals = "";
			aCols = [];
			for (var j = 0; j < iCols; j++) {
				colText = row.child(j).toString();
				if (j != 0) {
					sCols += ", ";
					sVals += ", ";
				}
				sCols += sm_doublequotes(row.child(j).name().localName);
				aCols.push(row.child(j).name().localName);
				if (bType) {
					if (row.child(j).@type == 3)
						sVals += sm_quote(colText);
					else if (row.child(j).@type == 0)
						sVals += "NULL";
					else if (row.child(j).@type == 1)
						sVals += colText;
					else
						sVals += sm_quote(colText);
				}
				else
					sVals += sm_quote(colText);
			}
      var sDbName = Database.logicalDbName;
			var sTabNameInInsert = Database.getPrefixedName(sTabName, sDbName);
      var iFound = xmlTables.indexOf(sTabName);
      if (iFound == -1) {
        //last arg is true to indicate that user cannot edit column names
        //needed until we can maintain arrays for original and new names
        //like we do for tables using xmlTables & actualTables
        var aRet = this.getCreateTableQuery(sTabName, sDbName, aCols, true);
        if (aRet.error)
          return -1;
        if (aRet.query != "") {
  				aQueries.push(aRet.query);
  				xmlTables.push(sTabName);
  				actualTables.push(aRet.tableName);
        }
      }
      iFound = xmlTables.indexOf(sTabName);
      if (iFound >= 0) {
        sTabNameInInsert = actualTables[iFound];
      }
			sQuery = "INSERT INTO " + sTabNameInInsert + " (" + sCols + ") VALUES (" + sVals + ")";
			aQueries.push(sQuery);
		}
		
		var answer = smPrompt.confirm(null, "SQLite Manager", "Are you sure you want to perform the following operation(s):\nImport Data: Rows = " + iRows);
		if(answer) {
			var bReturn = Database.executeTransaction(aQueries);
	  	if (bReturn)
				return iRows;
		}
		return -1;
	},

  getCreateTableQuery: function(sTabName, sDbName, aCols, bReadOnlyColNames) {
    //importing to an existing table
    if (Database.tableExists(sTabName, sDbName)) {
      sTabName = Database.getPrefixedName(sTabName, sDbName);
		  //confirm before proceeding
		  //TODO: the buttons should say Continue (=OK), Abort (=Cancel)
      // and Let me modify = open createTable.xul
      var answer = smPrompt.confirm(null, "SQLite Manager", "Are you sure you want to import the data to an existing table " + sTabName + "?\nClick OK to continue importing.");
      return {error: !answer, query: "", tableName: sTabName};
    }

    //table needs to be created
    var sQuery = "";
	  //ask whether the user wants to modify the new table
    var answer = smPrompt.confirm(null, "SQLite Manager", "A new table called " + sTabName + " will be created. Do you want to modify this table?\nClick OK to modify.");
    if(answer) { //if yes, call create table dialog
  		var aRetVals = {tableName: sTabName, colNames: aCols};
  		if (bReadOnlyColNames)
  		  aRetVals.readonlyFlags = ["colnames"];
      window.openDialog("chrome://sqlitemanager/content/createTable.xul",
  						"createTable", "chrome, resizable, centerscreen, modal, dialog", 
  						Database, aRetVals);
  		if (aRetVals.ok) {
  		  sQuery = aRetVals.createQuery;
        return {error: false, query: sQuery, tableName: aRetVals.tableName};
  		}
    }
    //user chose not to modify, or pressed cancel in create table dialog
    sTabName = Database.getPrefixedName(sTabName, sDbName);
    for (var ic = 0; ic < aCols.length; ic++)
			aCols[ic] = sm_doublequotes(aCols[ic]);
		var sCols = aCols.toString();
		sQuery = "CREATE TABLE IF NOT EXISTS " + sTabName + " (" + sCols + ")";
  	return {error: false, query: sQuery, tableName: sTabName};
  }
};
