/** 
 * Initial GREUtils and GeckoJS
 */
(function(){
var loader = window.jssubscript_loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

window.include = function include(src, scope) {
    scope = scope || window;

    try {

        loader.loadSubScript(src, scope);

    }catch(e) {
        // error loadSubscript
    }
};


// include jquery
if(typeof window.jQuery == 'undefined') {
    include("resource://app/modules/jquery-1.2.6.js");
	include("resource://app/modules/jquery.qsa.js");
	include("resource://app/modules/jquery.form.js");
}

// include date-js
if (typeof Date.CultureInfo == 'undefined') {
	include("resource://app/modules/date.js");
}

//Components.utils.import("resource://app/modules/GREUtils.jsm", window);
//Components.utils.import("resource://app/modules/GeckoJS.jsm", window);

if(typeof GREUtils == 'undefined') {
    include("resource://app/modules/GREUtils.js");
//    GREUtils.global = window || this;
}

if (typeof GeckoJS == 'undefined') {
    include("resource://app/modules/GeckoJS.js");
//    GeckoJS.global = window  || this;
}

// ONLY FOR jsmodules version gecko 1.9
// initial current window context to javascript code modules
include("chrome://global/content/globalOverlay.js");


// Dispatcher shortcut
var shortDispatcher = {};
window['gDispatch'] = window['$do'] = shortDispatcher['gDispatch'] = shortDispatcher['$do'] = function(){

    ///var ww = GREUtils.XPCOM.getUsefulService("window-watcher");

    // ww.activeWindow = window;

    var args = [];

	// add window context
	args.push(window);

	for(var i=0; i<arguments.length; i++) args.push(arguments[i]);

	GeckoJS.Dispatcher.dispatch.apply(GeckoJS.Dispatcher, args);
    return shortDispatcher;
};




window.goRestartApplication = function goRestartApplication()
{
    if (!canQuitApplication())
        return false;

    //  var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].
    //                     getService(Components.interfaces.nsIAppStartup);
    //  appStartup.quit(Components.interfaces.nsIAppStartup.eRestart | Components.interfaces.nsIAppStartup.eAttemptQuit);

    GREUtils.restartApplication();
    return true;
};


window.toOpenWindowByType = function toOpenWindowByType(inType, uri) {
    var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
    window.open(uri, "_blank", winopts);
};




})();

