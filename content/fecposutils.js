/**
 * Some utilitie functions used by FECPos
 *
 *
 * @public
 * @name FECPosUtils
 * @namespace FECPosUtils
 */
GREUtils.define('GeckoJS.FECPosUtils', GeckoJS.global);


/**
 * Returns the index of an element in an array.<br/>
 * <br/>
 * This method returns -1 if the element is not found.<br/>
 *
 * @public
 * @static
 * @function
 * @param {Object} elem       This is the element to look for in the array
 * @param {Object} array      This is the array
 * @return {Number}          The index of the element
 */
GeckoJS.FECPosUtils.inArray =  function( elem, array ) {
	for ( var i = 0, length = array.length; i < length; i++ )
		if ( GREUtils.JSON.encode( array[ i ] ) == GREUtils.JSON.encode( elem ) )
			return i;
	return -1;
};

//

/**
 * FECPos System Configures
 */
GeckoJS.FECPosUtils.Configures = null;

/**
 * Returns the XPCom service that implements the nsIPrefBranch2 interface.
 * The nsIPrefService interface is the main entry point into the back end preferences management library.
 * The preference service is directly responsible for the management of the preferences files and
 * also facilitates access to the preference branch object which allows the direct manipulation of the preferences themselves.
 *
 * @public
 * @static
 * @function
 * @return {nsIPrefService}             The preference service
 */
GeckoJS.FECPosUtils.getPrefService = function () {
    return GREUtils.XPCOM.getService("@mozilla.org/preferences-service;1", "nsIPrefService");
};
/**
 * Sets the state of individual preferences
 *
 * This method will automatically detect the type of preference (string, number,
 * boolean) and set the preference value accordingly.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             This is the name of the preference
 * @param {Object} prefValue            This is the preference value to set
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 */
GeckoJS.FECPosUtils.setPref = function() {
    var prefName = arguments[0] ;
    var value = arguments[1];
    var prefs = (arguments[2]) ? arguments[2] : this.getPrefService();
    var nsIPrefBranch = prefs.getBranch(null);
    var type = nsIPrefBranch.getPrefType(prefName);
    if (type == nsIPrefBranch.PREF_STRING)
        nsIPrefBranch.setCharPref(prefName, value);
    else if (type == nsIPrefBranch.PREF_INT)
        nsIPrefBranch.setIntPref(prefName, value);
    else if (type == nsIPrefBranch.PREF_BOOL)
        nsIPrefBranch.setBoolPref(prefName, value);
    else {
        // if prefName not exist, create it!
        if ((typeof value).toLowerCase() == 'string' )
            nsIPrefBranch.setCharPref(prefName, value);
        if ((typeof value).toLowerCase() == 'boolean' )
            nsIPrefBranch.setBoolPref(prefName, value);
        if ((typeof value).toLowerCase() == 'number' )
            nsIPrefBranch.setIntPref(prefName, value);
    }
    prefs.savePrefFile(null);

};

/**
 * Called to clear a user set value from a specific preference.
 * This will, in effect, reset the value to the default value.
 * If no default value exists the preference will cease to exist. ^
 *
 * Note: This method does nothing if this object is a default branch.
 *
 * @public
 * @static
 * @function
 * @param {String} prefName             The preference to be cleared.
 * @param {Object} prefService          This is the preferences service to use; if null, the default preferences service will be used
 */
GeckoJS.FECPosUtils.clearUserPref = function() {
    var prefName = arguments[0] ;
    var prefs = (arguments[1]) ? arguments[1] : GREUtils.Pref.getPrefService();
    prefs.clearUserPref(prefName);
};

GeckoJS.FECPosUtils.setConfigures = function(dd) {
    //if (!this.Configures) {

            //GREUtils.Pref.setPref('extensions.vivipos.DateFormatStr', 'yyyy-mm-dd');
            //GREUtils.Pref.setPref('extensions.vivipos.TimeformatStr', 'hh:nn:ss');
            //GREUtils.Pref.setPref('extensions.vivipos.DecimalNum', 2);
            //GREUtils.Pref.setPref('extensions.vivipos.DepartmentRows', 2);
            //GREUtils.Pref.setPref('extensions.vivipos.PluRows', 2);
            //GREUtils.Pref.setPref('extensions.vivipos.FuncBtnRows', 2);

            this.setPref('extensions.vivipos.DateFormatStr', 'yyyy-mm-dd');
            this.setPref('extensions.vivipos.TimeformatStr', dd);
            this.setPref('extensions.vivipos.DecimalNum', 3);
            this.setPref('extensions.vivipos.DepartmentRows', 3);
            this.setPref('extensions.vivipos.PluRows', 5);
            this.setPref('extensions.vivipos.FuncBtnRows', 6.8);

            // this.clearUserPref('extensions.vivipos.firstrun2');

        
    //}
    // GREUtils.log('set Configures:' + GeckoJS.BaseObject.dump(this.Configures));
    // return this.Configures;
};

GeckoJS.FECPosUtils.getConfigures = function() {
    // if (!this.Configures) {
        this.Configures = {
            firstrun  : GREUtils.Pref.getPref('extensions.vivipos.firstrun'),
            DateFormatStr  : GREUtils.Pref.getPref('extensions.vivipos.settings.DateFormatStr'),
            TimeformatStr  : GREUtils.Pref.getPref('extensions.vivipos.settings.TimeformatStr'),
            DecimalNum     : GREUtils.Pref.getPref('extensions.vivipos.settings.DecimalNum'),
            DepartmentRows : GREUtils.Pref.getPref('extensions.vivipos.settings.DepartmentRows'),
            PluRows        : GREUtils.Pref.getPref('extensions.vivipos.settings.PluRows'),
            FuncBtnRows    : GREUtils.Pref.getPref('extensions.vivipos.settings.FuncBtnRows')
        }
    //}
    GREUtils.log('get Configures:' + GeckoJS.BaseObject.dump(this.Configures));
    return this.Configures;
};
