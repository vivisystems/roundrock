//localized description for this extension
pref("extensions.{SQLiteManager@mrinalkant.blogspot.com}.description", "chrome://sqlitemanager/locale/strings.properties");

//position in target application (only Firefox) as a menuitem
//As of now, 1 stands for show menuitem in Tools menu. 0 means hide it.
//for other values do nothing
pref("extensions.sqlitemanager.posInTargetApp", 1);

pref("extensions.sqlitemanager.autoBackup", "off");//on, off, prompt

//openmode: 1=chrome window, 2=tab
pref("extensions.sqlitemanager.openMode", 1);

//false = do not open any db on start, true = open last used db on start
pref("extensions.sqlitemanager.openWithLastDb", true);
pref("extensions.sqlitemanager.promptForLastDb", true);

//how many records to display when browsing and searching; -1 means all
pref("extensions.sqlitemanager.displayNumRecords", 100);

//kind of MRU
pref("extensions.sqlitemanager.mruPath.1", "");
pref("extensions.sqlitemanager.mruSize", 10);

pref("extensions.sqlitemanager.userDir", "");

//related to main toolbar area and the included toolbars
pref("extensions.sqlitemanager.hideMainToolbar", false);
pref("extensions.sqlitemanager.showMainToolbarDatabase", true);
pref("extensions.sqlitemanager.showMainToolbarTable", true);
pref("extensions.sqlitemanager.showMainToolbarIndex", true);

//default extension for sqlite db files
pref("extensions.sqlitemanager.sqliteFileExtensions", "sqlite");

//for search
pref("extensions.sqlitemanager.searchToggler", true);
pref("extensions.sqlitemanager.searchCriteria", "");

//for confirmation prompt before executing queries
//pref("extensions.sqlitemanager.confirmOperations", ":rowInsert=1:rowUpdate=1:rowDelete=1:create=1:otherSql=1:");
pref("extensions.sqlitemanager.confirm.records", true);
pref("extensions.sqlitemanager.confirm.create", true);
pref("extensions.sqlitemanager.confirm.otherSql", true);

//for extension management table name
pref("extensions.sqlitemanager.tableForExtensionManagement", "__sm_ext_mgmt");

//for max number of columns in create table dialog
pref("extensions.sqlitemanager.maxColumnsInTable", 20);

//text to show for blob fields
pref("extensions.sqlitemanager.textForBlob", "BLOB");
//display size of blob in the blob fields
pref("extensions.sqlitemanager.showBlobSize", true);

//unsafe alter table operations (delete/alter column) are disabled by default
//pref("extensions.sqlitemanager.allowUnsafeTableAlteration", false);

//handle ADS
pref("extensions.sqlitemanager.handleADS", 0);

//not frozen
//allowed values: previous/default
pref("extensions.sqlitemanager.whenInsertingShow", "previous");
