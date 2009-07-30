function SQLiteHandler() {
  // Get database storage service
  this.storageService = Components.classes["@mozilla.org/storage/service;1"]
      .getService(Components.interfaces.mozIStorageService);
};

SQLiteHandler.prototype = {
  dataConnection: null,   // Connection to current database (mozIStorageConnection)
  mbShared: true,
  mOpenStatus: "",

  aTableData: null,       // Stores 2D array of table data
	aTableType: null,
  aColumns: null,

	colNameArray: null,
	resultsArray: null,
	statsArray: null,

  maDbList: ["main", "temp"],
  mLogicalDbName: "main", //for main, temp and attached databases

	lastErrorString: "",
  miTime: 0, //time elapsed during queries
				
  // openDatabase: opens a connection to the database file nsIFile
  // bShared = true: first attempt shared mode, then unshared
  // bShared = false: attempt unshared cache mode only
  openDatabase: function(nsIFile, bShared) {
    this.closeConnection();

 		try {
  	  if (!bShared) // dummy exception to reach catch to use openUnsharedDatabase
        throw 0;

      this.dataConnection = this.storageService.openDatabase(nsIFile);
      this.mbShared = true;
			// if the db does not exist it does not give us any indication
			// this.dataConnection.lastErrorString returns "not an error"
		}
		catch (e) { //attempt unshared connection; supported since sqlite 3.5.4.1
  		try {
        this.dataConnection = this.storageService.openUnsharedDatabase(nsIFile);
        this.mbShared = false;
  			// if the db does not exist it does not give us any indication
  			// this.dataConnection.lastErrorString returns "not an error"
  		}
  		catch (e) {
  			this.onSqlError(e, "Error in opening file " + nsIFile.leafName + 
  											   " - perhaps this is not an sqlite db file", null);
  			return false;
  		}
    }
		
		if(this.dataConnection == null)
			return false;
		this.mOpenStatus = this.mbShared?"Shared":"Exclusive";
		return true;
  },

  openSpecialDatabase: function(sSpecialName) {
    if (sSpecialName != "memory")
      return false;
    this.closeConnection();

 		try {
      this.dataConnection = this.storageService.openSpecialDatabase(sSpecialName);
		}
		catch (e) {
			this.onSqlError(e, "Error in opening in memory database", null);
			return false;
    }
		
		if(this.dataConnection == null)
			return false;
		this.mOpenStatus = "Memory";
		return true;
  },

  //closeConnection: Free the database resources (right now this doesn't do much)
  closeConnection: function() {
//   if (this.dataConnection != null)
//	    this.dataConnection.close();  

    this.dataConnection = null;//close() doesn't work, so C++ style
    this.aTableData = null;
    this.aTableType = null;
    this.aColumns = null;
    this.mOpenStatus = "";
  },

  createFunction: function(fnName, argLength, fnObject) {
    this.dataConnection.createFunction(fnName, argLength, fnObject);
  },

  getOpenStatus: function() { return this.mOpenStatus; },

  getElapsedTime: function() { return this.miTime; },

	setLogicalDbName: function(sDbName) {
    this.mLogicalDbName = sDbName;	
	},

  get logicalDbName() { return this.mLogicalDbName; },

  getPrefixedName: function(objName, sDbName) {
    if (sDbName == "")
      sDbName = this.mLogicalDbName;

    return sm_doublequotes(sDbName) + "." + sm_doublequotes(objName);
  },

  getPrefixedMasterName: function(sDbName) {
    if (sDbName == "")
      sDbName = this.mLogicalDbName;

    if (sDbName == "temp")
      return sm_doublequotes("sqlite_temp_master");
    else
      return sm_doublequotes(sDbName) + "." + sm_doublequotes("sqlite_master");
  },

  getFileName: function() {
    if (this.dataConnection != null)
	    return this.dataConnection.databaseFile.leafName;
	  return null;
	},

  getFile: function() {
    if (this.dataConnection != null)
	    return this.dataConnection.databaseFile;
	  return null;
	},

  get sqliteVersion() {
		this.selectQuery("SELECT sqlite_version()");
		return this.aTableData[0][0];
  },

  get schemaVersion() { return this.dataConnection.schemaVersion;	},

	setSetting: function(sSetting, sValue) {
		if (sSetting == "encoding" || sSetting == "temp_store_directory")
			sValue = "'" + sValue + "'";
		var sQuery = "PRAGMA " + sSetting + " = " + sValue;
		//do not execute in a transaction; some settings will cause error
		this.selectQuery(sQuery);

		return this.getSetting(sSetting);
	},

	getSetting: function(sSetting) {
		var iValue = null;
		this.selectQuery("PRAGMA " + sSetting);

		iValue = this.aTableData[0][0];
		return iValue;
	},
	
  tableExists: function(sTable, sDbName) {
    if (typeof sDbName == "undefined")
      return this.dataConnection.tableExists(sTable);
    else {
      var aList = this.getObjectList("table", sDbName);
      if (aList.indexOf(sTable) >= 0)
        return true;
    }
    return false;
  },

	getMasterInfo: function(sObjName, aFields, sDbName) {
    if (sObjName == "sqlite_master" || sObjName == "sqlite_temp_master") {
      var aResult = [];
  		for (var i = 0; i < aFields.length; i++)
  		  if (aFields[i] == "name")
          aResult.push(sObjName);
  		  else if (aFields[i] == "type")
          aResult.push("table");
        else
          aResult.push("No data");
  
  		return aResult;
    }

    var sTable = this.getPrefixedMasterName(sDbName);
		var sQuery = "SELECT " + aFields.toString() + " FROM " + sTable + " WHERE name='" + sObjName + "'";
		this.selectQuery(sQuery);
	  return this.aTableData[0];
	},
	
  //getObjectList: must return an array of names of type=argument 
  // Type = master|table|index|view|trigger,
  //empty array if no object found
  getObjectList: function(sType, sDb) {
    if (sDb == "")
      sDb = this.mLogicalDbName;

    var aResult = [];

    if (sType == "master") {
      aResult = ["sqlite_master"];
      if (sDb == "temp")
        aResult = ["sqlite_temp_master"];
      return aResult;    
    }

    var sTable = this.getPrefixedMasterName(sDb);
    var sQuery = "SELECT name FROM " + sTable + " WHERE type = '"
					+ sType + "' ORDER BY name";
		this.selectQuery(sQuery);

		for (var i = 0; i < this.aTableData.length; i++)
			aResult.push(this.aTableData[i][0]);

		return aResult;
  },

  // loadTableData: retrieves data from a table including rowid if needed
  // return r: -1 = error, 0 = ok without extracol,
  // r > 0 means column number of extracol starting with 1
  loadTableData: function(sObjType, sObjName, aArgs) {
  	if (sObjType != "master" && sObjType != "table" && sObjType != "view")
  		return -1;
  		
    var sCondition = aArgs.sWhere?aArgs.sWhere:"";
    var iLimit = aArgs.iLimit?aArgs.iLimit:-1;
    var iOffset = aArgs.iOffset?aArgs.iOffset:0;
    var sOrder = "";
    if (aArgs.aOrder && aArgs.aOrder.length > 0) {
      var aTemp = [];
      for (var i = 0; i < aArgs.aOrder.length; i++) {
        aTemp.push("[" + aArgs.aOrder[i][0] + "] " + aArgs.aOrder[i][1]);
      }
      sOrder = " ORDER BY " + aTemp.join(", ") + " ";
//      alert("sOrder = " + sOrder);
    }

		var extracol = "";
		var iRetVal = 0;
  	var sLimitClause = " LIMIT " + iLimit + " OFFSET " + iOffset;
  	
  	if (sObjType == "table" || sObjType == "master") {
	    //find whether the rowid is needed 
			//or the table has an integer primary key
			var rowidcol = this.getTableRowidCol(sObjName);
			if (rowidcol["name"] == "rowid") {
				extracol = " `rowid`, ";
				iRetVal = 1;
			}
		}
    //table having columns called rowid behave erratically
    sObjName = this.getPrefixedName(sObjName, "");
		this.selectQuery("SELECT " + extracol + " * FROM " + sObjName + " "
						+ sCondition + sOrder + sLimitClause);
		return iRetVal;
	},

	//for tables and views
	getTableCount: function(sObjName, sCondition) {
		var iValue = 0;
		sObjName = this.getPrefixedName(sObjName, "");
		var sQuery = "SELECT count(*) FROM " + sObjName + " " + sCondition;
		this.selectQuery(sQuery);

		iValue = this.aTableData[0][0];
		return iValue;
	},
	
	//emptyTable: deletes all the records in the table
	emptyTable: function(sTableName) {
		var sQuery = "DELETE FROM " + this.getPrefixedName(sTableName, "");
		return this.confirmAndExecute([sQuery], "Delete All Records");
	},

	analyzeTable: function(sTableName) {
		var sQuery = "ANALYZE " + this.getPrefixedName(sTableName, "");
		return this.confirmAndExecute([sQuery], "Analyze Table");
	},

	//sObject = TABLE/INDEX/COLLATION; thus we have a common function
	reindexObject: function(sObjectType, sObjectName) {
		var sQuery = "REINDEX " + this.getPrefixedName(sObjectName, "");
		return this.confirmAndExecute([sQuery], sQuery);
	},

	//sObjType = TABLE/INDEX/VIEW/TRIGGER; thus we have a common function
	dropObject: function(sObjType, sObjectName) {
		var sQuery = "DROP " + sObjType + " " + this.getPrefixedName(sObjectName, "");
		return this.confirmAndExecute([sQuery], sQuery);
	},

  addColumn: function(sTable, aColumn) {
		var aQueries = [];
		var coldef = sm_doublequotes(aColumn["name"]) + " " + aColumn["type"];
		if (aColumn["notnull"]) coldef += " NOT NULL ";
		if (aColumn["dflt_value"] != null) {
			coldef += " DEFAULT " + aColumn["dflt_value"];
		}
		var sTab = Database.getPrefixedName(sTable, "");
		var sQuery = "ALTER TABLE " + sTab + " ADD COLUMN " + coldef;
		return this.confirmAndExecute([sQuery], "Add Column to Table " + sTable);
  },

  // getRecords: return aTableData 
  getRecords: function() {
    return this.aTableData;         
	},

  getRecordTypes: function() {
    return this.aTableType;         
	},

  getColumns: function() {
    return this.aColumns;         
	},
		
  // selectQuery : execute a select query and store the results
  selectQuery: function(sQuery, bBlobAsHex) {
    this.aTableData = new Array();
    this.aTableType = new Array();
// if aColumns is not null, there is a problem in tree display
//	this.aColumns = new Array();
    this.aColumns = null;        
    var bResult = false;
 
    var timeStart = Date.now();
    try {		// mozIStorageStatement
			var stmt = this.dataConnection.createStatement(sQuery);
		}
		catch (e) {
			// statement will be undefined because it throws error);
			this.onSqlError(e, "Likely SQL syntax error: " + sQuery, 
			  		this.dataConnection.lastErrorString);
			this.setErrorString();
			return false;
		}
		
    var iCols = 0;
    var iType, colName;
		try	{
      // do not use stmt.columnCount in the for loop, fetches the value again and again
      iCols = stmt.columnCount;
			this.aColumns = new Array();
			var aTemp, aType;
			for (var i = 0; i < iCols; i++)	{
        colName = stmt.getColumnName(i);
        aTemp = [colName, iType];
        this.aColumns.push(aTemp);  
			}
		} catch (e) { 
			this.onSqlError(e, "Error while fetching column name: " + colName, null);
    	this.setErrorString();
    	return false;
  	}

    var cell;
   	var bFirstRow = true;
    try {
      while (stmt.executeStep()) {
        aTemp = [];//new Array();
        aType = [];
        for (i = 0; i < iCols; i++) {
          iType = stmt.getTypeOfIndex(i);
	        if (bFirstRow) {
	        	this.aColumns[i][1] = iType;
	        }
          switch (iType) {
            case stmt.VALUE_TYPE_NULL: 
							cell = g_strForNull;
							break;
            case stmt.VALUE_TYPE_INTEGER:
            //use getInt64, not getInt32 otherwise long int
            // as in places.sqlite/cookies.sqlite shows funny values
							cell = stmt.getInt64(i);
							break;
            case stmt.VALUE_TYPE_FLOAT:
							cell = stmt.getDouble(i);
							break;
            case stmt.VALUE_TYPE_TEXT:
							cell = stmt.getString(i);
							break;
            case stmt.VALUE_TYPE_BLOB: //todo - handle blob properly
            	if (bBlobAsHex) {
	              	var iDataSize = {value:0};
	              	var aData = {value:null};
	  							stmt.getBlob(i, iDataSize, aData);
	  							cell = sm_blob2hex(aData.value);
            	}
            	else {
	              cell = g_strForBlob;
	              if (g_showBlobSize) {
	              	var iDataSize = {value:0};
	              	var aData = {value:null};
	  							stmt.getBlob(i, iDataSize, aData);
	  							cell += " (Size: " + iDataSize.value + ")";
	  							if (iDataSize.value <= g_maxSizeToShowBlobData || g_maxSizeToShowBlobData < 0) {
	  							  cell = sm_blob2str(aData.value);
	  							}
	              }
	            }
							break;
            default: sData = "<unknown>"; 
          }
          aTemp.push(cell);
          aType.push(iType);
        }
        this.aTableData.push(aTemp);
        this.aTableType.push(aType);
        bFirstRow = false;
      }
      this.miTime = Date.now() - timeStart;
    } catch (e) { 
			this.onSqlError(e, "Query: " + sQuery + " - executeStep failed", null);
    	this.setErrorString();
    	return false;
    } finally {
    	//must be reset after executeStep
    	stmt.reset();
    }
		this.setErrorString();
    return true;
  },

  // selectBlob : execute a select query to return blob
  selectBlob: function(sTable, sField, sWhere) {
		var sQuery = "SELECT " + sm_doublequotes(sField) + 
									" FROM " + this.getPrefixedName(sTable, "") + " WHERE " + sWhere;
    try {		// mozIStorageStatement
			var stmt = this.dataConnection.createStatement(sQuery);
		}
		catch (e) {
			// statement will be undefined because it throws error);
			this.onSqlError(e, "Likely SQL syntax error: " + sQuery, 
			  		this.dataConnection.lastErrorString);
			this.setErrorString();
			return false;
		}
		
    if (stmt.columnCount != 1)
      return false;

    var cell;
    try {
      stmt.executeStep();
      if (stmt.getTypeOfIndex(0) != stmt.VALUE_TYPE_BLOB)
        return false;

    	var iDataSize = {value:0};
    	var aData = {value:null};
			stmt.getBlob(0, iDataSize, aData);
			cell = "BLOB (Size: " + iDataSize.value + ")";
      //return [iDataSize.value, aData.value];
      return aData.value;
    } catch (e) { 
			this.onSqlError(e, "Query: " + sQuery + " - executeStep failed", null);
    	this.setErrorString();
    	return false;
    } finally {
    	//must be reset after executeStep
    	stmt.reset();
    }
		this.setErrorString();
    return true;
  },

  // getTableRowidCol : execute a pragma query and return the results
  getTableRowidCol: function(sTableName) {
		var sQuery = this.getPragmaSchemaQuery("table_info", sTableName, "");
		this.selectQuery(sQuery);
		var aReturn = [];
		var iPk, iType, iName, iCid;
		for (var i in this.aColumns) {
			switch (this.aColumns[i][0]) {
				case "pk": iPk = i; break;
				case "type": iType = i; break;
				case "name": iName = i; break;
				case "cid": iCid = i; break;
			}
		}
		var iNumPk = 0, iIntPk = 0;
		for(var i = 0; i < this.aTableData.length; i++) {
			var row = this.aTableData[i];
			var type = row[iType];
			var pk = row[iPk];
			type = type.toUpperCase();
			if(pk == 1) {
				iNumPk++;
				if (type == "INTEGER") {
  				iIntPk++;
  				var name = row[iName];
  				var cid = row[iCid];
  				aReturn["name"] = name;
  				aReturn["cid"] = cid;
				}
			}
		}
		if (iNumPk == 1 && iIntPk == 1)
			return aReturn;
		
		aReturn["name"] = "rowid";
		aReturn["cid"] = 0;
		return aReturn;
  },

  // getTableColumns : execute a pragma query and return the results
  getTableColumns: function(sTableName, sDbName) {
		var sQuery = this.getPragmaSchemaQuery("table_info", sTableName, sDbName);
		this.selectQuery(sQuery);
		
		var aCols = new Array();
		for (var i in this.aColumns) {
			var aTemp = [i, this.aColumns[i][1]];
			aCols[this.aColumns[i][0]] = aTemp;
		}
		var aResult = [this.aTableData, aCols, this.aTableType];
		return aResult;
  },

	getTableColumnsWithDefaultValue: function(sTableName) {
		var aResult = [];
		var info = this.getTableColumns(sTableName, "");
		var columns = info[0];
		for(var i = 0; i < columns.length; i++) {
			if (columns[i][info[1]["dflt_value"][0]] != g_strForNull)
				aResult.push(columns[i][info[1]["name"][0]]);
		}
		return aResult;
	},

  getColumnsNullAllowStatus: function(sTableName, bNullAllowed) {
		var aResult = [];
		var info = this.getTableColumns(sTableName, "");
		var columns = info[0];
		for(var i = 0; i < columns.length; i++) {
		  if (bNullAllowed) {
  			if (columns[i][info[1]["notnull"][0]] == 0)
  				aResult.push(columns[i][info[1]["name"][0]]);
			}
		  else {
  			if (columns[i][info[1]["notnull"][0]] != 0)
  				aResult.push(columns[i][info[1]["name"][0]]);
			}
		}
		return aResult;
  },

  getPragmaSchemaQuery: function(sPragma, sObject, sDbName) {
    if (sDbName == "")
      sDbName = this.mLogicalDbName;
    return "PRAGMA " + sm_doublequotes(sDbName) + "." + sPragma + "(" + sm_doublequotes(sObject) + ")";
  },

  // getTableInfo : execute a pragma query and return the results
  getTableInfo: function(sTableName,ciInfoType) {
		var aResult = [];
		var sQuery = this.getPragmaSchemaQuery("table_info", sTableName, "");
		this.selectQuery(sQuery);
		aResult["numFields"] = this.aTableData.length;

		sQuery = this.getPragmaSchemaQuery("index_list", sTableName, "");
		this.selectQuery(sQuery);
		if(this.aTableData != null)
			aResult["numIndexes"] = this.aTableData.length;
		else
			aResult["numIndexes"] = 0;
		
		aResult["numRecords"] = this.getTableCount(sTableName, "");

   	return aResult;
  },
  
  // getIndexInfo : execute a pragma query and return the results
  getIndexInfo: function(sIndexName, iKind) {
		//to find the table and sql of the index; there are no master indexes,
    // so the last arg will always be 0 or 2
		var sInfo = this.getMasterInfo(sIndexName, ["sql", "tbl_name"], iKind);

		var aReturn = [];
		aReturn["sql"] = sInfo[0];
		aReturn["table"] = sInfo[1];

		//to find fields in the index
		var sQuery = this.getPragmaSchemaQuery("index_info", sIndexName, "");
		this.selectQuery(sQuery);

   	var iRequiredField = 2;
		var cols = [];
		for(var i = 0; i < this.aTableData.length; i++)
			cols.push(this.aTableData[i][iRequiredField]);

		aReturn["cols"] = cols;

		//to find whether duplicates allowed
		aReturn["unique"] = 0;
		var sQuery = this.getPragmaSchemaQuery("index_list", aReturn["table"], "");
		this.selectQuery(sQuery);
		for(var i = 0; i < this.aTableData.length; i++) {
			if(this.aTableData[i][1] == sIndexName)
				aReturn["unique"] = this.aTableData[i][2];
		}
		
		return aReturn;
  },
    
	select : function(file,sql,param) {
		var ourTransaction = false;
		if (this.dataConnection.transactionInProgress) {
			ourTransaction = true;
			this.dataConnection.beginTransactionAs(this.dataConnection.TRANSACTION_DEFERRED);
		}
		var statement = this.dataConnection.createStatement(sql);
    if (param) {
			for (var m = 2, arg = null; arg = arguments[m]; m++) 
				statement.bindUTF8StringParameter(m-2, arg);
		}
		try {
			var dataset = [];
			while (statement.executeStep()) {
				var row = [];
				for (var i = 0, k = statement.columnCount; i < k; i++)
					row[statement.getColumnName(i)] = statement.getUTF8String(i);

				dataset.push(row);
			}
			// return dataset;	
		}
		finally {
			statement.reset();
		}
		if (ourTransaction) {
			this.dataConnection.commitTransaction();
		}
        return dataset;	
	},
	
	executeTransaction: function(aQueries) {
    //IS THIS NEEDED?
		//commit, if some leftover transaction is in progress
		if (this.dataConnection.transactionInProgress)
			this.dataConnection.commitTransaction();

    var timeStart = Date.now();
		//begin a transaction, iff no transaction in progress
		if (!this.dataConnection.transactionInProgress)
			this.dataConnection.beginTransaction();

		for(var i = 0; i < aQueries.length; i++) {
	    try {
				var statement = this.dataConnection.createStatement(aQueries[i]);
				statement.execute();
				this.setErrorString();
			}
			catch (e) {
				// statement will be undefined because it throws error);
				this.onSqlError(e, "Likely SQL syntax error: " + aQueries[i], 
								this.dataConnection.lastErrorString);
				this.setErrorString();
				if (this.dataConnection.transactionInProgress) {
					this.dataConnection.rollbackTransaction();
				}
				return false;
			}
			finally {
				statement.reset();
			}
		}
		//commit transaction, if reached here
		if (this.dataConnection.transactionInProgress)
			this.dataConnection.commitTransaction();

    this.miTime = Date.now() - timeStart;
		return true;
	},	

	getLastError: function() {
		return this.lastErrorString;
	},
	
	setErrorString: function() {
		this.lastErrorString = this.dataConnection.lastErrorString;
	},
	
  // executeWithParams : execute a query with parameter binding
  executeWithParams: function(sQuery, aParamData) {
  	try {
			var stmt = this.dataConnection.createStatement(sQuery);
		} catch (e) {
			this.onSqlError(e, "Create statement failed: " + sQuery, 
							this.dataConnection.lastErrorString);
			this.setErrorString();
			return false;
		}

		for (var i = 0; i < aParamData.length; i++) {
			var aData = aParamData[i];
			switch (aData[2]) {
				case "blob":
					try {
						stmt.bindBlobParameter(aData[0], aData[1], aData[1].length);
					} catch (e) {
						this.onSqlError(e, "Binding failed for parameter: " + aData[0], 
										this.dataConnection.lastErrorString);
						this.setErrorString();
						return false;
					}
					break;
			}
		}
		try {
			stmt.execute();
		} catch (e) {
				this.onSqlError(e, "Execute failed: " + sQuery, 
								this.dataConnection.lastErrorString);
				this.setErrorString();
				return false;
		}

		try {
			stmt.reset();
			stmt.finalize();
		} catch (e) {
				this.onSqlError(e, "Failed to reset/finalize", 
								this.dataConnection.lastErrorString);
				this.setErrorString();
				return false;
		}
		return true;
  },

	confirmAndExecute: function(aQueries, sMessage, confirmPrefName, aParamData) {
		var answer = sm_confirmBeforeExecuting(aQueries, sMessage, confirmPrefName);

		if(answer) {
			if (aParamData)
				return this.executeWithParams(aQueries[0], aParamData);
			else
				return this.executeTransaction(aQueries);
		}
		return false;
	},

	executeWithoutConfirm: function(aQueries, aParamData) {
		if (aParamData)
			return this.executeWithParams(aQueries[0], aParamData);
		else
			return this.executeTransaction(aQueries);
	},

	onSqlError: function(ex, msg, SQLmsg) {
		if (SQLmsg != null)
			msg += " [ " + SQLmsg + " ]";
		alert(msg + "\n" +
		      "Exception Name: " + ex.name + "\n" +
					"Exception Message: " + ex.message);
		return true;
	},

//functions for db list (main, temp and attached)
  getDatabaseList: function() {
		this.selectQuery("PRAGMA database_list");

		var cols = ["main", "temp"];
		for(var i = 0; i < this.aTableData.length; i++)
		  if (this.aTableData[i][0] > 1) //sometimes, temp is not returned
        cols.push(this.aTableData[i][1]);
		return cols;
  }
};
