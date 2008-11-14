var CreateManager = {
	//arrays with information for each field
	aFieldNames: null,
	aFieldTypes: null,

	sCurrentTable: null,
	sObject: null,
	sOperation: null,

	numOfEmptyColumns: 20, //shown during create table

	loadEmptyColumns: function() {
		var node = document.getElementById("rows-all");
		this.numOfEmptyColumns = sm_getPreferenceValue("maxColumnsInTable", 20);

		var row = document.getElementById("row-template");
		for(var i = 0; i < this.numOfEmptyColumns; i++) {
			var clone = row.cloneNode(true);
			clone.setAttribute("id", "row-" + i);
			clone.setAttribute("style", "");
			var children = clone.childNodes;
			var id;
      for (var j = 0; j < children.length; j++) {
        id = children[j].getAttribute("id") + "-" + i;
        children[j].setAttribute("id", id);
      };

			node.appendChild(clone);
		}
	},

	loadOccupiedColumns: function(sTableName) {
    var bReadOnlyColNames = false;
		var aRetVals = window.arguments[1];
    if (typeof aRetVals.readonlyFlags != "undefined") {
      if (aRetVals.readonlyFlags.indexOf("colnames") >= 0)
        bReadOnlyColNames = true;
    }

    document.getElementById("tablename").value = aRetVals.tableName;
		var node = document.getElementById("rows-all");
//		this.numOfEmptyColumns = sm_getPreferenceValue("maxColumnsInTable", 20);
		this.numOfEmptyColumns = aRetVals.colNames.length;
		
		var row = document.getElementById("row-template");
		for(var i = 0; i < this.numOfEmptyColumns; i++) {
			var clone = row.cloneNode(true);
			clone.setAttribute("id", "row-" + i);
			clone.setAttribute("style", "");
			var children = clone.childNodes;
			var id;
		   for (var j = 0; j < children.length; j++) {
		   		id = children[j].getAttribute("id");
		   		if (id == "colname") {
            children[j].setAttribute("value", aRetVals.colNames[i]);
            if (bReadOnlyColNames)
              children[j].setAttribute("readonly", bReadOnlyColNames);
          }
		   		children[j].setAttribute("id", id + "-" + i);
		   };

			node.appendChild(clone);
		}
	},
		
	loadCreateTableDialog: function () {
		Database = window.arguments[0];
		var aRetVals = window.arguments[1];

		this.sObject = "TABLE";
		
		this.loadDbNames("dbName", Database.logicalDbName);

		if (typeof aRetVals.tableName == "undefined")
    	this.loadEmptyColumns();
    else
    	this.loadOccupiedColumns();
    window.sizeToContent();
	},
		
  changeDataType: function(sId) {
		var sVal = document.getElementById(sId).value;
		var sNum = sId.substr(sId.lastIndexOf("-")+1);
    var sPkeyId = "primarykey-" + sNum;
    var sAutoId = "autoincrement-" + sNum;

    if (sVal.toUpperCase() == "INTEGER"
        && document.getElementById(sPkeyId).checked)
      document.getElementById(sAutoId).disabled = false;
    else {
      document.getElementById(sAutoId).disabled = true;
      document.getElementById(sAutoId).checked = false;
    }
  },

  togglePrimaryKey: function(sId) {
		var bPk = document.getElementById(sId).checked;
		var sNum = sId.substr(sId.lastIndexOf("-")+1);
    var sNullId = "allownull-" + sNum;
    var sDefId = "defaultvalue-" + sNum;
    var sAutoId = "autoincrement-" + sNum;
    var sTypeId = "datatype-" + sNum;
    if (document.getElementById(sTypeId).value.toUpperCase() == "INTEGER"
        && bPk)
      document.getElementById(sAutoId).disabled = false;
    else {
      document.getElementById(sAutoId).disabled = true;
      document.getElementById(sAutoId).checked = false;
    }

    if (bPk) {
      document.getElementById(sNullId).checked = !bPk;
    }
  },

  selectDb: function(sID) {
    this.loadTableNames("tabletoindex", this.sCurrentTable, false);
	},

  selectTable: function(sID) {
    var sTable = document.getElementById(sID).value;
		//function names have been assigned in the main load functions
		if(this.sObject == "INDEX")
			this.loadFieldNames(sTable);
	},

	loadCreateIndexDialog: function () {
		Database = window.arguments[0];
		this.sCurrentTable = window.arguments[1];

		this.sObject = "INDEX";

		this.loadDbNames("dbName", Database.logicalDbName);
    this.loadTableNames("tabletoindex", this.sCurrentTable, false);

		this.loadFieldNames(this.sCurrentTable);
	},

  loadFieldNames: function(sTableName) {
		document.title = "Create Index on Table " + sTableName;
 		var dbName = document.getElementById("dbName").value;
		var info = Database.getTableColumns(sTableName, dbName);
		var cols = info[0];
		this.aFieldNames = [], aTypes = [];
		for(var i = 0; i < cols.length; i++) {
			this.aFieldNames.push(cols[i][info[1]["name"][0]]);
			aTypes.push(cols[i][info[1]["type"][0]]);
		}
		var vbox = document.getElementById("definecolumns");

		while (vbox.firstChild) {
			 vbox.removeChild(vbox.firstChild);
		}
			
		for(var i = 0; i < this.aFieldNames.length; i++) {
			var radgr = document.createElement("radiogroup");
			radgr.setAttribute("id", "rad-" + (i+1));

			var hbox = document.createElement("hbox");
			hbox.setAttribute("flex", "1");
			hbox.setAttribute("style", "margin:2px 3px 2px 3px");
			hbox.setAttribute("align", "right");
			
			var lbl = document.createElement("label");
			lbl.setAttribute("value", (i+1) + ". " + this.aFieldNames[i]);
			lbl.setAttribute("style", "padding-top:5px;width:100px;");
			lbl.setAttribute("accesskey", (i+1));
			lbl.setAttribute("control", "rad-" + (i+1));
			hbox.appendChild(lbl);
			
			var radio;
			radio = document.createElement("radio");
			radio.setAttribute("label", "Do not use");
			radio.setAttribute("selected", "true");
			radio.setAttribute("value", "");
			hbox.appendChild(radio);

			radio = document.createElement("radio");
			radio.setAttribute("label", "Ascending");
			radio.setAttribute("value", sm_doublequotes(this.aFieldNames[i]) + " ASC");
			hbox.appendChild(radio);

			radio = document.createElement("radio");
			radio.setAttribute("label", "Descending");
			radio.setAttribute("value", sm_doublequotes(this.aFieldNames[i]) + " DESC");
			hbox.appendChild(radio);

			radgr.appendChild(hbox);
			
			vbox.appendChild(radgr);
		}
	},

	doOKCreateIndex: function() {
		var name = document.getElementById("indexname").value;
		if(name == "") {
			alert("Name cannot be null");
			return false;
		}

		var dbName = document.getElementById("dbName").value;
 		name = Database.getPrefixedName(name, dbName);

		var tbl = document.getElementById("tabletoindex").value;
		var dup = document.getElementById("duplicatevalues").selectedItem.value;
		
		var radgr, radval;
		var cols = "";
		for(var i = 0; i < this.aFieldNames.length; i++) {
			radgr = document.getElementById("rad-" + (i+1));
			radval = radgr.value;
			if(radval != "") {
				if(cols != "")
					radval = ", " + radval;
				
				cols = cols + radval;
			}
		}	
		if(cols == "") {
			alert("No Fields selected");
			return false;
		}
		
		var sQuery = "CREATE " + dup + " INDEX " + name + " ON " +
        sm_doublequotes(tbl) +	" (" + cols + ")";
		return Database.confirmAndExecute([sQuery], "Create Index " + name, "confirm.create");
	},

	loadCreateTriggerDialog: function () {
		Database = window.arguments[0];
		this.sCurrentTable = window.arguments[1];

		this.sObject = "trigger";

		this.loadDbNames("dbName", Database.logicalDbName);
    this.loadTableNames("tabletoindex", this.sCurrentTable, false);
	},

  //used for create index/trigger dialogs;
  loadTableNames: function(sListBoxId, sTableName, bMaster) {
		var dbName = document.getElementById("dbName").value;
		var listbox = document.getElementById(sListBoxId);

    var aMastTableNames = [];
    if (bMaster)
      aMastTableNames = Database.getObjectList("master", dbName);
		var aNormTableNames = Database.getObjectList("table", dbName);
		var aObjectNames = aMastTableNames.concat(aNormTableNames);
		PopulateDropDownItems(aObjectNames, listbox, sTableName);

		if(this.sObject == "INDEX")
			this.selectTable("tabletoindex");
  },

  loadDbNames: function(sListBoxId, sDbName) {
		var listbox = document.getElementById(sListBoxId);
    var aObjectNames = Database.getDatabaseList();
		PopulateDropDownItems(aObjectNames, listbox, sDbName);
  },

	doOK: function() {
	},
		
	modifyTable: function(sOperation, sTable, sColumn) {
		//get the columns info
		var info = Database.getTableColumns(sTable, "");
		if (sOperation == "alterColumn") {
			//correct the info array
			for(var i = 0; i < info[0].length; i++) {
				if (info[0][i][info[1]["name"][0]] == sColumn.oldColName) {
				  info[0][i][info[1]["name"][0]] = sColumn.newColName;
				  info[0][i][info[1]["type"][0]] = sColumn.newColType;
//				  info[0][i][info[1]["dflt_value"][0]] = sColumn.newDefaultValue;
				}
				else
					continue;
			}
		}
		if (sOperation == "dropColumn") {
			//correct the info array
			for(var i = 0; i < info[0].length; i++) {
				if (info[0][i][info[1]["name"][0]] == sColumn) {
				  info[0].splice(i, 1);
				}
				else
					continue;
			}
		}

		var cols = info[0];

		var aPK = [], aCols = [], aColNames = [];

		for(var i = 0; i < cols.length; i++) {
			var colname = cols[i][info[1]["name"][0]];
			colname = sm_doublequotes(colname);
      aColNames.push(colname);

			var col = [i, colname];
			aCols.push(col);
			var primarykey = cols[i][info[1]["pk"][0]];
			if(primarykey == 1)
				aPK.push(colname);
		}
		var colList = aColNames.toString();

    var aColDefs = [];
		for(var i = 0; i < aCols.length; i++) {
			var j = aCols[i][0]
			var datatype = cols[j][info[1]["type"][0]];

			var txtNull = " NOT NULL ";
			if(cols[j][info[1]["notnull"][0]] == 0)
				txtNull = "";

			var defaultvalue = cols[j][info[1]["dflt_value"][0]];
			if(defaultvalue.toUpperCase() == g_strForNull.toUpperCase())
				defaultvalue = ""
			else
				defaultvalue = " DEFAULT " + defaultvalue + " ";

			var pk = "";
			if(aPK.length == 1 && aPK[0] == aCols[i][1])
				pk = " PRIMARY KEY ";
			var col = aCols[i][1] + " " + datatype + 
						pk + txtNull + defaultvalue;
			aColDefs.push(col);
		}
		var coldef = aColDefs.toString();

		//this is the primary key constraint on multiple columns
		var constraintPK = "";
		if(aPK.length > 1)
			constraintPK = ", PRIMARY KEY (" + aPK.toString() + ") ";

		coldef += constraintPK;

////////////////////////////
		var sTab = Database.getPrefixedName(sTable, "");
		var sTempTable = Database.getPrefixedName(g_tempNamePrefix + sTable, "");
		var sTempTableName = sm_doublequotes(g_tempNamePrefix + sTable);
		
		var aQueries = [];
		aQueries.push("ALTER TABLE " + sTab + " RENAME TO "	+ sTempTableName);
		aQueries.push("CREATE TABLE " + sTab + " (" + coldef + ")");		
		if (sOperation == "dropColumn")
  		aQueries.push("INSERT INTO " + sTab + " SELECT " + colList
  					+ " FROM " + sTempTable);		
		if (sOperation == "alterColumn")
  		aQueries.push("INSERT INTO " + sTab + " SELECT * FROM " + sTempTable);		
		aQueries.push("DROP TABLE " + sTempTable);		

    var sMsg = "";
		if (sOperation == "dropColumn")
      sMsg = "Drop Column " + sColumn + " from " + sTab;
		if (sOperation == "alterColumn")
      sMsg = "Alter Column " + sColumn[0] + " in table " + sTab;

		var bReturn = Database.confirmAndExecute(aQueries, sMsg, "confirm.otherSql");
  	return bReturn;
	},

	doOKCreateTable: function() {
		var name = document.getElementById("tablename").value;
		if(name == "") {
			alert("Table Name cannot be null");
			return false;
		}
		if(name.indexOf("sqlite_") == 0) {
			alert("Table Name cannot begin with sqlite_");
			return false;
		}

		var txtTemp = "";
		if(document.getElementById("temptable").checked)
			txtTemp = " TEMP ";

		//temp object will be created in temp db only
    if (txtTemp == "") {
  		var dbName = document.getElementById("dbName").value;
   		name = Database.getPrefixedName(name, dbName);
   	}
   	else
   	  name = sm_doublequotes(name);

		var txtExist = "";
		if(document.getElementById("ifnotexists").checked)
			txtExist = " IF NOT EXISTS ";

    //find which textboxes contain valid entry for column name
		var iTotalRows = this.numOfEmptyColumns;
		var aCols = [];
		for(var i = 0; i < iTotalRows; i++) {
			var colname = document.getElementById("colname-" + i).value;
			if(colname.length == 0 || colname == null || colname == undefined) {
				continue;
			}
			if(colname == "rowid" || colname == "_rowid_" || colname == "oid") {
				alert("Column Name cannot be one of rowid, _rowid_, oid");
				return false;
			}
			//if colname is valid, get the col definition details in aCols array
			//coldef needs name, datatype, pk, autoinc, default, allownull
			var col = [];
			colname = sm_doublequotes(colname);
			col["name"] = colname;
			col["type"] = document.getElementById("datatype-" + i).value;
			col["pk"] = document.getElementById("primarykey-" + i).checked;
			col["autoinc"] = document.getElementById("autoincrement-" + i).checked;
			col["defValue"] = document.getElementById("defaultvalue-" + i).value;
			col["allowNull"] = document.getElementById("allownull-" + i).checked;
			aCols.push(col);
		}

		//populate arrays for primary key and count autoincrement columns
		var aPK = [], iAutoIncCols = 0;
		for(var i = 0; i < aCols.length; i++) {
			if(aCols[i]["pk"]) {
				aPK.push(aCols[i]["name"]);
			}
			if(aCols[i]["autoinc"]) {
				iAutoIncCols++;
			}
		}
		//some checks follow
		if(iAutoIncCols > 1) {
      alert("AUTOINCREMENT on more than one column is an error.");
      return false; //do not leave the dialog
		}
		if(iAutoIncCols > 0 && aPK.length > 1) {
      alert("AUTOINCREMENT not allowed if primary key is over two or more columns.");
      return false; //do not leave the dialog
		}
		
    //prepare an array of column definitions
		var aColDefs = [];
		for(var i = 0; i < aCols.length; i++) {
			var sColDef = aCols[i]["name"] + " " + aCols[i]["type"];

			if(aPK.length == 1 && aCols[i]["pk"])
				sColDef += " PRIMARY KEY ";
			if(aCols[i]["autoinc"])
				sColDef += " AUTOINCREMENT ";

			if(!aCols[i]["allowNull"])
				sColDef += " NOT NULL ";
				
			var sDefValue = sm_makeDefaultValue(aCols[i]["defValue"]);
			if (sDefValue != null)
        sColDef += " DEFAULT " + sDefValue;

			aColDefs.push(sColDef);
		}

		//this is the primary key constraint on multiple columns
		if(aPK.length > 1) {
			var constraintPK = "PRIMARY KEY (" + aPK.join(", ") + ")";
  		aColDefs.push(constraintPK);
  	}

		var sQuery = "CREATE " + txtTemp + " TABLE " + txtExist + name + " (" + aColDefs.join(", ") + ")";

		var aRetVals = window.arguments[1];
		aRetVals.tableName = name;
		aRetVals.createQuery = sQuery;
		aRetVals.ok = true;
		return true;
	},

	loadCreateViewDialog: function () {
		Database = window.arguments[0];
		var aRetVals = window.arguments[1];
		this.loadDbNames("dbName", aRetVals.dbName);
    if (typeof aRetVals.readonlyFlags != "undefined") {
      if (aRetVals.readonlyFlags.indexOf("dbnames") >= 0)
        document.getElementById("dbName").setAttribute("disabled", true);
      if (aRetVals.readonlyFlags.indexOf("viewname") >= 0)
        document.getElementById("objectName").setAttribute("readonly", true);
    }
    if (typeof aRetVals.modify != "undefined") {
      document.getElementById("objectName").value = aRetVals.objectName;
      document.getElementById("txtSelectStatement").value = aRetVals.selectStmt;
      document.getElementById("tempObject").disabled = true;
      document.getElementById("ifnotexists").disabled = true;

      document.getElementById("txtSelectStatement").focus();
      document.title = "Modify View";
    }
	},
	
	doOKCreateView: function() {
		var name = document.getElementById("objectName").value;
		if(name == "") {
			alert("Name cannot be null");
			return false;
		}

		var txtTemp = "";
		if(document.getElementById("tempObject").checked)
			txtTemp = " TEMP ";
			
		//temp object will be created in temp db only
    if (txtTemp == "") {
  		var dbName = document.getElementById("dbName").value;
   		name = Database.getPrefixedName(name, dbName);
   	}
   	else
   	  name = sm_doublequotes(name);

		var txtExist = "";
		if(document.getElementById("ifnotexists").checked)
			txtExist = " IF NOT EXISTS ";
				
		var selectStatement = document.getElementById("txtSelectStatement").value;
		if(selectStatement == "") {
			alert("Statement cannot be null");
			return false;
		}

		var aRetVals = window.arguments[1];
    var aQueries = [];
    if (typeof aRetVals.modify != "undefined") {
      aQueries.push("DROP VIEW " + name);
    }
		var sQuery = "CREATE " + txtTemp + " VIEW " + txtExist + name 
					+ " AS " + selectStatement;
		aQueries.push(sQuery);

		aRetVals.objectName = name;
		aRetVals.queries = aQueries;
		aRetVals.ok = true;
		return true;
	},

	doOKCreateTrigger: function() {
		var name = document.getElementById("objectName").value;
		if(name == "") {
			alert("Name cannot be null");
			return false;
		}

		var txtTemp = "";
		if(document.getElementById("tempObject").checked)
			txtTemp = " TEMP ";

		//temp object will be created in temp db only
    if (txtTemp == "") {
  		var dbName = document.getElementById("dbName").value;
   		name = Database.getPrefixedName(name, dbName);
   	}
   	else
   	  name = sm_doublequotes(name);

		var txtExist = "";
		if(document.getElementById("ifnotexists").checked)
			txtExist = " IF NOT EXISTS ";
				
		var txtForEachRow = "";
		if(document.getElementById("foreachrow").checked)
			txtForEachRow = " FOR EACH ROW ";
				
		var whenExpression = document.getElementById("txtWhenExpression").value;
		if(whenExpression == "" || whenExpression == null) {
			whenExpression = "";
		}
		else
			whenExpression = " WHEN " + whenExpression + " ";

		var steps = document.getElementById("txtTriggerSteps").value;
		if(steps == "") {
			alert("Trigger steps cannot be empty");
			return false;
		}

		var txtTable = document.getElementById("tabletoindex").value;
		var txtTime = document.getElementById("triggerTime").selectedItem.label;
		var txtEvent = document.getElementById("dbEvent").selectedItem.label;

		var sQuery = "CREATE " + txtTemp + " TRIGGER " + txtExist + name 
					+ " " + txtTime + " " + txtEvent + " ON " + txtTable + txtForEachRow 
					+ whenExpression + " BEGIN " + steps + " END";
		return Database.confirmAndExecute([sQuery], "Create Trigger " + name, "confirm.create");
	},

	doCancel: function() {
	  return true;
	}
};
