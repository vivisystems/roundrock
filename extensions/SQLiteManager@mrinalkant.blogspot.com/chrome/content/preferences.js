const sm_nsISupportsString = Components.interfaces.nsISupportsString;

//constant for branch of nsIPrefService                 
const sm_prefsBranch = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.sqlitemanager.");

/* get unicode string value from preference store */
function sm_getUnicodePref(prefName) {
    return sm_prefs.getComplexValue(prefName, sm_nsISupportsString).data;
}

/* set unicode string value */
function sm_setUnicodePref(prefName, prefValue) {
    var sString = Components.classes["@mozilla.org/supports-string;1"]
						.createInstance(sm_nsISupportsString);
    sString.data = prefValue;
    sm_prefsBranch.setComplexValue(prefName, sm_nsISupportsString, sString);
}
