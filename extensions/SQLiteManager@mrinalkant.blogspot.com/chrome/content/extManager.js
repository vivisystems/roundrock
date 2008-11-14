function SMExtensionManagerExternal() { };
SMExtensionManagerExternal.prototype = {
  dbConfig: null,   // SQLiteHandler
  m_dbId: null,
  m_queryId: null,

  _init: function(dbPath)
  {
    this.dbConfig = new SQLiteHandler();

    // Get the nsIFile object pointing to the profile directory
    var profDir = Components.classes["@mozilla.org/file/directory_service;1"]
            .getService(Components.interfaces.nsIProperties)
            .get("ProfD", Components.interfaces.nsIFile);
		var configFile = Components.classes['@mozilla.org/file/local;1']
    							.createInstance(Components.interfaces.nsILocalFile);
		configFile.initWithPath(profDir.path);
		configFile.append("ext-sqlitemanager.sqlite");
		
		//if the file does not exist, create it and its tables
		if(!configFile.exists())
		{
		  this.dbConfig.ConnectToDatabase(configFile);
		  var aQueries = [];
		  aQueries.push("create table `openedDb` (`dbId` integer primary key, `dbPath` text)");
		  aQueries.push("create table `queryHistory` (`queryId` integer  primary key, `dbId` integer, `query` text)");
      this.dbConfig.executeTransaction(aQueries);
		}
	  this.dbConfig.ConnectToDatabase(configFile);
	  this.setDbId(dbPath);
  },

  setDbId: function(dbPath)
  {
    this.m_dbPath = dbPath;
    this.m_dbId = this._getDbId(dbPath);
    if (this.m_dbId != null)
      return;

    var dbPath1 = sm_makeSqlValue(dbPath);
    this.dbConfig.executeTransaction(["insert into `openedDb`(`dbPath`) values(" + dbPath1 + ")"]);
    this.m_dbId = this._getDbId(dbPath);
  },
  
  _getDbId: function(dbPath)
  {
    var dbId = null;
    dbPath = sm_makeSqlValue(dbPath);
    this.dbConfig.selectQuery("select `dbId` from `openedDb` where `dbPath`=" + dbPath);
    var aData = this.dbConfig.getRecords();
    if (aData.length > 0)
      dbId = aData[0][0];
    return dbId;
  },

  addQuery: function(dbId, sQuery)
  {
    this.dbConfig.executeTransaction(["insert into `queryHistory`(`dbId`,`query`) values(" + this.m_dbId + "," + sm_makeSqlValue(sQuery) + ")"]);
  },
  
  getPrevSql: function()
  {
    var crit2 = "";
    if (this.m_queryId != null)
      crit2 = " and `queryId` < " + this.m_queryId;

    this.dbConfig.selectQuery("select `queryId`, `query` from `queryHistory` where `queryId` = (select max(`queryId`) from `queryHistory` where `dbId` = " + this.m_dbId + crit2 + ")");
    var aData = this.dbConfig.getRecords();
    if (aData.length > 0)
    {
      this.m_queryId = aData[0][0];
      return aData[0][1];
    }

    return null;
  },

  getNextSql: function()
  {
    if (this.m_queryId == null)
      return null;

    this.dbConfig.selectQuery("select `queryId`, `query` from `queryHistory` where `queryId` = (select min(`queryId`) from `queryHistory` where `dbId` = " + this.m_dbId + " and `queryId` > " + this.m_queryId + ")");
    var aData = this.dbConfig.getRecords();
    if (aData.length > 0)
    {
      this.m_queryId = aData[0][0];
      return aData[0][1];
    }

    return null;
  },
  
  goToLastQuery: function()
  {
    this.m_queryId = null;
  }
};

function SMExtensionManager() {
    this.m_db = Database;
    this.m_tbl = sm_getPreferenceValue("tableForExtensionManagement", "__sm_ext_mgmt");
};
SMExtensionManager.prototype = {
  //variable to handle the current query in query history
  m_queryId: null,
  
  m_bSetUsageDone: false,
  //boolean value: true if m_tbl exists, or is explicitly set to true
  m_bUseConfig: false,

  _init: function(dbPath) {
		//if the table does not exist, create it
		if (!this.m_db.dataConnection.tableExists(this.m_tbl))	{
      if (!this.m_bUseConfig)
        return false;

		  var aQueries = [];
		  aQueries.push("create table " + this.m_tbl + " (`id` integer primary key, `type` text not null , `value` text)");
      this.m_db.executeTransaction(aQueries);
		}
    this.m_db.executeTransaction(["delete from " + this.m_tbl + " where `type` = 'Enabled'", "insert into " + this.m_tbl + "(`type`, `value`) values('Enabled', '1')"]);

		return true;
  },

  setUsage: function(bUse, bImplicit) {
    this.m_bSetUsageDone = true;

    this.m_bUseConfig = bUse;
    if (this.m_bUseConfig) {
      this._init();
    }
    else {
      if (bImplicit) return;

  		if (this.m_db.dataConnection.tableExists(this.m_tbl)) {
  		  var aQueries = [];
  		  aQueries.push();
  		  var bRet = confirm("Are you sure you want to drop the table " + this.m_tbl + "?\nYou will lose all the data related to Query History in execute sql tab.");
        if (bRet)
          this.m_db.executeTransaction(["drop table " + this.m_tbl]);
        else
          this.m_db.executeTransaction(["delete from " + this.m_tbl + " where `type` = 'Enabled'", "insert into " + this.m_tbl + "(`type`, `value`) values('Enabled', '0')"]);
  		}
    }
  },

  getUsage: function() {
    //check for the table and enable type = 1 to return true;
    if(this.m_db.dataConnection.tableExists(this.m_tbl)) {
      this.m_db.selectQuery("select `value` from " + this.m_tbl + " where `type` = 'Enabled'");
      var aData = this.m_db.getRecords();
      if (aData.length > 0 && aData[0][0] == 1) {
        return true;
      }
    }
    return false;
  },

  addQuery: function(sQuery) {
    if (!this.m_bUseConfig)
      return false;

    this.m_db.executeTransaction(["insert into " + this.m_tbl + "(`type`, `value`) values('QueryHistory', " + sm_makeSqlValue(sQuery) + ")"]);
    return true;
  },
  
  getPrevSql: function() {
    if (!this.m_bUseConfig)
      return false;

    var crit2 = "";
    if (this.m_queryId != null)
      crit2 = " and `id` < " + this.m_queryId;

    this.m_db.selectQuery("select `id`, `value` from " + this.m_tbl + " where `type` = 'QueryHistory' and `id` = (select max(`id`) from " + this.m_tbl + " where `type` = 'QueryHistory' " + crit2 + ")");
    var aData = this.m_db.getRecords();
    if (aData.length > 0) {
      this.m_queryId = aData[0][0];
      return aData[0][1];
    }

    return null;
  },

  getNextSql: function() {
    if (!this.m_bUseConfig)
      return false;

    if (this.m_queryId == null)
      return null;

    this.m_db.selectQuery("select `id`, `value` from " + this.m_tbl + " where `type` = 'QueryHistory' and `id` = (select min(`id`) from " + this.m_tbl + " where `type` = 'QueryHistory' and `id` > " + this.m_queryId + ")");
    var aData = this.m_db.getRecords();
    if (aData.length > 0) {
      this.m_queryId = aData[0][0];
      return aData[0][1];
    }

    return null;
  },

  clearSqlHistory: function() {
    if (!this.m_bUseConfig)
      return false;

    this.m_db.executeTransaction(["delete from " + this.m_tbl + " where `type` = 'QueryHistory'"]);
    alert("Deleted all stored queries from table: " + this.m_tbl);
    this.m_queryId = null;
    return true;
  },

	saveSqlByName: function(sQuery) {
    if (!this.m_bUseConfig)
      return false;

		var qName = prompt("Enter the name of the query to be saved", "");

		//if cancelled, abort
		if (qName == "" || qName == null)
			return false;

    var temp = this.getQueryList(qName);
    if (temp.length > 0) {
      alert("A query having the chosen name already exists.")
      return false;
    }

    this.m_db.executeTransaction(["INSERT INTO " + this.m_tbl + "(`type`, `value`) VALUES('NamedQuery:" + qName + "', " + sm_makeSqlValue(sQuery) + ")"]);
    return true;
	},

	getQueryList: function(sQueryName) {
    if (!this.m_bUseConfig)
      return false;

		var prefix = "NamedQuery:", criteria;
    if (sQueryName == undefined)
      criteria = "like '" + prefix + "%'";
    else
      criteria = "= '" + prefix + sQueryName + "'";

    try {
		this.m_db.selectQuery("SELECT `type`, `value` FROM " + this.m_tbl + " WHERE `type` " + criteria + " ORDER BY `type`");
		} catch (e) {
			alert(e);
		}
    var aData = this.m_db.getRecords();

    var aQueries = new Array();
    var aTemp, sName;
    for (var iC = 0; iC < aData.length; iC++)
    {
    	sName = aData[iC][0].substring(prefix.length);
	    aTemp = [sName, aData[iC][1]];
      aQueries.push(aTemp);
    }

    return aQueries;
	},

  goToLastQuery: function() {
    if (!this.m_bUseConfig)
      return false;

    this.m_queryId = null;
    return true;
  },
  
  getStructTreeState: function() {
    var sEc = "StructTree:ExpandedCategories", sEo = "StructTree:ExpandedObjects";
    var aExpand = [["all-table"],[]];

    this.m_db.selectQuery("select `id`, `value` from " + this.m_tbl + " where `type` = '" + sEc + "'");
    var aData = this.m_db.getRecords();
    if (aData.length > 0) {
      aExpand[0] = aData[0][1].split(",");
    }
    this.m_db.selectQuery("select `id`, `value` from " + this.m_tbl + " where `type` = '" + sEo + "'");
    var aData = this.m_db.getRecords();
    if (aData.length > 0) {
      aExpand[1] = aData[0][1].split(",");
    }

    return aExpand;
  },

  setStructTreeState: function(aExpand) {
    var sEc = "StructTree:ExpandedCategories", sEo = "StructTree:ExpandedObjects";

    var q1 = "delete from " + this.m_tbl + " where `type` = '" + sEc + "' OR `type` = '" + sEo + "'";
    var q2 = "insert into " + this.m_tbl + "(`type`, `value`) values('" + sEc + "', '" + aExpand[0].toString() + "')";
    var q3 = "insert into " + this.m_tbl + "(`type`, `value`) values('" + sEo + "', '" + aExpand[1].toString() + "')";
    this.m_db.executeTransaction([q1,q2,q3]);
  }
};
