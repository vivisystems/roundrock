const Cc = Components.classes;
const Ci = Components.interfaces;

var gAppInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
var gbGecko_191 = (Cc["@mozilla.org/xpcom/version-comparator;1"]
                      .getService(Ci.nsIVersionComparator)
                      .compare(gAppInfo.platformVersion, "1.9.1") >= 0);

var smGlobals = {
  gExtVersion: "0.4.8",//vveerrssiioonn
  g_tempNamePrefix: "__temp__",
  g_smBundle: null,
  gAppInfo: Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo),
  gbGecko_191: (Cc["@mozilla.org/xpcom/version-comparator;1"]
                  .getService(Ci.nsIVersionComparator)
                  .compare(this.gAppInfo.platformVersion, "1.9.1") >= 0),
  gOS: navigator.appVersion,
  
  smPrompt: Cc["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Ci.nsIPromptService),
  
  gSbPanelDisplay: null,
  g_strForNull: "NULL",
  g_strForBlob: "BLOB",
  g_showBlobSize: true
};

var gExtVersion = "0.4.8";//vveerrssiioonn
var gExtCreator = "Mrinal Kant";

var g_tempNamePrefix = "__temp__";
var g_smBundle = null;
var gOS = navigator.appVersion;

var smPrompt = 	Cc["@mozilla.org/embedcomp/prompt-service;1"]
              .getService(Ci.nsIPromptService);							

var gSbPanelDisplay = null;
var g_strForNull = "NULL";
var g_strForBlob = "BLOB";
var g_showBlobSize = true;

function $$(sId) {
  return document.getElementById(sId);
}

// GetColumnTypeString: Determine the type of the table column
function GetColumnTypeString(iType) {
  switch (iType) {
    case 0: return g_strForNull;
    case 1: return "int";
    case 2: return "float";
    case 3: return "string";
    case 4: return "blob";
    default: return "unknown";
  }
}

// ClearElement: Remove all child elements 
function ClearElement(el) {
  while (el.firstChild) 
    el.removeChild(el.firstChild);
}

// PopulateDropDownItems: Populate a dropdown listbox with menuitems
function PopulateDropDownItems(aItems, dropdown, sSelectedItemLabel) {   
  dropdown.removeAllItems();
  dropdown.selectedIndex = -1;

  for (var i = 0; i < aItems.length; i++) {
 		var bSelect = false;
  	if(i == 0)
  		bSelect = true;
  	
    if (typeof aItems[i] == "string") {
    	if(aItems[i] == sSelectedItemLabel)
    		bSelect = true;
    }
    else {
    	if(aItems[i][0] == sSelectedItemLabel)
    		bSelect = true;
  	}
  	
    var menuitem = AddDropdownItem(aItems[i], dropdown, bSelect);
  }
}

// AddDropdownItem: Add a menuitem to the dropdown
function AddDropdownItem(sLabel, dropdown, bSelect) {
  var menuitem;
  if (typeof sLabel == "string") {
	  menuitem = dropdown.appendItem(sLabel, sLabel);
  }
  else {
	  menuitem = dropdown.appendItem(sLabel[0], sLabel[1]);
	}

  //make this item selected
	if (bSelect)
    dropdown.selectedItem = menuitem;

  return menuitem;
}

function sm_launchHelp() {
	var urlHelp = sm_getBundle().getString("sm.url.help");
	sm_openURL(urlHelp);
}

function sm_openURL(UrlToGoTo) {
  var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  var uri = ios.newURI(UrlToGoTo, null, null);
  var protocolSvc = Cc["@mozilla.org/uriloader/external-protocol-service;1"]
                    .getService(Ci.nsIExternalProtocolService);

  if (!protocolSvc.isExposedProtocol(uri.scheme)) {
    // If we're not a browser, use the external protocol service to load the URI.
    protocolSvc.loadUrl(uri);
    return;
  }

  var navWindow;
  
  // Try to get the most recently used browser window
  try {
    var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
                       .getService(Ci.nsIWindowMediator);
    navWindow = wm.getMostRecentWindow("navigator:browser");
  } catch(ex) {}

  if (navWindow) {  // Open the URL in most recently used browser window
    if ("delayedOpenTab" in navWindow) {
      navWindow.delayedOpenTab(UrlToGoTo);
    } 
    else if ("openNewTabWith" in navWindow) {
      navWindow.openNewTabWith(UrlToGoTo);
    } 
    else if ("loadURI" in navWindow) {
      navWindow.loadURI(UrlToGoTo);
    }
    else {
      navWindow._content.location.href = UrlToGoTo;
    }
  }
  else {
    // If there is no recently used browser window 
    // then open new browser window with the URL
    var ass = Cc["@mozilla.org/appshell/appShellService;1"]
                .getService(Ci.nsIAppShellService);
    var win = ass.hiddenDOMWindow;
    win.openDialog(sm_getBrowserURL(), "", "chrome,all, dialog=no", UrlToGoTo );
  }
}

function sm_getBrowserURL() {
   // For SeaMonkey etc where the browser window is different.
   try {
      var prefs = Cc["@mozilla.org/preferences-service;1"]
          .getService(Ci.nsIPrefBranch);
      var url = prefs.getCharPref("browser.chromeURL");
      if (url)
         return url;
   } catch(e) {
   }

   return "chrome://browser/content/browser.xul";
}

function sm_getBundle() {
	if(g_smBundle == null) 
		g_smBundle = document.getElementById("sm-bundle");  

	return g_smBundle;
}

function sm_getLStr(sName) {
  return g_smBundle.getString(sName);
}

function sm_getJsStr(sName) {
  return $$("jss-" + sName).value;
}

function sm_chooseDirectory(sTitle) {
	const nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc["@mozilla.org/filepicker;1"]
		      .createInstance(nsIFilePicker);
	fp.init(window, sTitle, nsIFilePicker.modeGetFolder);
	
	var rv = fp.show();
	
	//if chosen then
	if (rv == nsIFilePicker.returnOK || rv == nsIFilePicker.returnReplace)
		return fp.file;
		
	return null; 
}

function sm_message(str, where) {
	if(where & 0x1)
		alert(str);
	if(where & 0x2 && gSbPanelDisplay != null)
		gSbPanelDisplay.label= str;;
}

function sm_quote(str) {
	var newStr = "";
	for (var i = 0; i < str.length; i++)
	{
		newStr += str[i];
		if (str[i] == "'")
			newStr += "'";
	}
	return "'" + newStr + "'";
}

function sm_doublequotes(str) {
	var newStr = "";
	for (var i = 0; i < str.length; i++)
	{
		if (str[i] == '"')
			newStr += '""';
		else
		  newStr += str[i];
	}
	return '"' + newStr + '"';
}

function sm_blob2hex(aData) {
  var hex_tab = '0123456789ABCDEF';
	var str = '';
	for (var i = 0; i < aData.length; i++) {
		str += hex_tab.charAt(aData[i] >> 4 & 0xF) + hex_tab.charAt(aData[i] & 0xF);
	}
	return "X'" + str + "'";
}

function sm_backquote(str) {
	return "`" + str + "`";
}

function sm_makeSqlValue(str) {
  var sUp = str.toUpperCase();
	if (sUp == g_strForNull.toUpperCase())
		return g_strForNull;
	if (sUp == "CURRENT_DATE" || sUp == "CURRENT_TIME" || sUp == "CURRENT_TIMESTAMP")
		return str.toUpperCase();

	return sm_quote(str);
}

function sm_makeSimpleString(str) {
  if (typeof str != "string")
    return str;
  if (str.length == 0)
    return "";
	if (str.toUpperCase() == g_strForNull.toUpperCase())
		return "";
	var ch = str[0];
	if (ch != "'" && ch != '"')
    return str;

	var newStr = "";
	for (var i = 1; i < str.length - 1; i++)
	{
		if (i >= 2)
		  if (str[i] == ch && str[i-1] == ch)
        continue;

		newStr += str[i];
	}
	return newStr;
}

//sm_makeDefaultValue: convert the argument into a format suitable for use in
// DEFAULT clause in column definition. return null, if no DEFAULT clause needed.
function sm_makeDefaultValue(str) {
  var sDefValue = null;
  if (str.length > 0) {
    var defaultvalue = Number(str);
    if (isNaN(str)) //not a number, then quote it
      defaultvalue = sm_makeSqlValue(str);
  	if(str.toUpperCase() != g_strForNull.toUpperCase())
  		sDefValue = defaultvalue;
  }

  return sDefValue;
}

function sm_confirm(sTitle, sMessage) {
	var aRetVals = {};
  var oWin = window.openDialog("chrome://sqlitemanager/content/confirm.xul",
        "confirmDialog", "chrome, resizable, centerscreen, modal, dialog",
        sTitle, sMessage, aRetVals, "confirm");
  return aRetVals.bConfirm;
}

function sm_alert(sTitle, sMessage) {
	var aRetVals = {};
  var oWin = window.openDialog("chrome://sqlitemanager/content/confirm.xul",
        "alertDialog", "chrome, resizable, centerscreen, modal, dialog",
        sTitle, sMessage, aRetVals, "alert");
}

function sm_confirmBeforeExecuting(aQueries, sMessage, confirmPrefName) {
  if (confirmPrefName == undefined)
    confirmPrefName = "confirm.otherSql";
  var bConfirm = sm_prefsBranch.getBoolPref(confirmPrefName);

	var answer = true;
	var ask = "Are you sure you want to perform the following operation(s):";
	//in case confirmation is needed, reassign value to answer
  if (bConfirm) {
  	var txt = ask + "\n" + sMessage + "\nSQL:\n" + aQueries.join("\n");
  	if (typeof sMessage == "object" && !sMessage[1]) {
  		txt = ask + "\n" + sMessage[0];
  	}
		answer = sm_confirm("Confirm the operation", txt);
	}

	return answer;
}

//cTimePrecision: Y, M, D, h, m, s
function getISODateTimeFormat(dt, cSeparator, cPrecision) {
  var aPrecision = ["Y", "M", "D", "h", "m", "s"];
  var aSeparators = ["", "-", "-", "T", ":", ":"];
  if (dt == null)
    dt = new Date();

  var tt;
  var iPrecision = aPrecision.indexOf(cPrecision);
  var sDate = dt.getFullYear();
  for (var i = 1; i <= iPrecision; i++) {
    switch (i) {
      case 1:
        tt = new Number(dt.getMonth() + 1);
        break;
      case 2:
        tt = new Number(dt.getDate());
        break;
      case 3:
        tt = new Number(dt.getHours());
        break;
      case 4:
        tt = new Number(dt.getMinutes());
        break;
      case 5:
        tt = new Number(dt.getSeconds());
        break;
    }
    var cSep = (cSeparator == null)?aSeparators[i]:cSeparator;
    sDate += cSep + ((tt < 10)? "0" + tt.toString() : tt);
  }
  return sDate;
}

