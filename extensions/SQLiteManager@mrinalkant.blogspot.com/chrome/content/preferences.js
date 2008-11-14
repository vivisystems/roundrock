const sm_nsISupportsString = Components.interfaces.nsISupportsString;
const SM_PREF = "extensions.sqlitemanager";

const sm_prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefBranch);

//constant for branch of nsIPrefService                 
const sm_prefsBranch = Components.classes["@mozilla.org/preferences-service;1"]. 
				getService(Components.interfaces.nsIPrefService). 
				getBranch(SM_PREF + ".");

const SM_PREF_TYPE = {COMPLEX: -1};
function sm_getPreferenceValue(prefName, defaultValue)
{
	var prefValue;
	try { 
		var prefType = sm_prefsBranch.getPrefType(prefName);
		if (prefType == SM_PREF_TYPE.COMPLEX) 
		{			
			prefValue = sm_getUnicodePref(SM_PREF + "." + prefName);
		}
		else if (prefType == sm_prefs.PREF_STRING)
		{
			prefValue = sm_prefsBranch.getCharPref(prefName);
		}
		else if (prefType == sm_prefs.PREF_BOOL)
		{
			prefValue = sm_prefsBranch.getBoolPref(prefName);
		}
		else if (prefType == sm_prefs.PREF_INT)
		{
			prefValue = sm_prefsBranch.getIntPref(prefName);
		}
	}
	catch (e)
	{
	// if no existing value, use the default value
		prefValue = defaultValue;
	}
	return prefValue;
}

function sm_setPreferenceValue(preferenceName, preferenceValue)
{	
	try 
	{ 
		var prefType = sm_prefsBranch.getPrefType(preferenceName);
		if (prefType == SM_PREF_TYPE.COMPLEX) 
		{				
			sm_setUnicodePref(preferenceName, preferenceValue);			 				
		}
		else if (prefType == sm_prefs.PREF_STRING) 
		{					
			sm_prefsBranch.setCharPref(preferenceName, preferenceValue);					
		}
		else if (prefType == sm_prefs.PREF_BOOL)
		{
			if (preferenceValue == "true" || preferenceValue == true)
			{
				sm_prefsBranch.setBoolPref(preferenceName, true);
			}
			else
			{
				sm_prefsBranch.setBoolPref(preferenceName, false);
			}
		}
		else if (prefType == sm_prefs.PREF_INT)
		{
				sm_prefsBranch.setIntPref(preferenceName, parseInt(preferenceValue));	
		}
	}
	catch (e) 
	{
//		sm_logMessageLevel("exception setting VAL: " +SM_PREF + "." + preferenceName + " == " + preferenceValue + "  :" + 
//			 new Date() + " -- " + lastModified, SM_LOG_LEVEL_INFO);
	}
}

/* get unicode string value from preference store */
function sm_getUnicodePref(prefName)
{
    return sm_prefs.getComplexValue(prefName, sm_nsISupportsString).data;
}

/* set unicode string value */
function sm_setUnicodePref(prefName,prefValue)
{
    var sString = Components.classes["@mozilla.org/supports-string;1"]
						.createInstance(sm_nsISupportsString);
    sString.data = prefValue;
    sm_prefsBranch.setComplexValue(prefName,sm_nsISupportsString,sString);
}
