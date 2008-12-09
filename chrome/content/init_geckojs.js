/** 
 * Initial GREUtils and GeckoJS
 */
(function(){
var loader = window.jssubscript_loader = Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

window.include = function include(src, scope) {

    try {
        if(scope) loader.loadSubScript(src, scope);
	else loader.loadSubScript(src);
   }catch(e) {
//	alert(e.message);
  }
};

// include jquery
if(typeof window.jQuery == 'undefined') {
    include("chrome://vivipos/content/libs/jquery-1.2.6.js");
    include("chrome://vivipos/content/libs/jquery.qsa.js");
    include("chrome://vivipos/content/libs/jquery.form.js");
}

// include date-js
if (typeof Date.CultureInfo == 'undefined') {
    include("chrome://vivipos/content/libs/date.js");
}

if(typeof GREUtils == 'undefined') {
    include("chrome://vivipos/content/libs/GREUtils.js");
//    GREUtils.global = window || this;
}

if (typeof GeckoJS == 'undefined') {
      include("chrome://vivipos/content/libs/GeckoJS.jsc");
//    GeckoJS.global = window  || this;
}

// ONLY FOR jsmodules version gecko 1.9
// initial current window context to javascript code modules
include("chrome://global/content/globalOverlay.js");


// Dispatcher shortcut
var shortDispatcher = {};
window['gDispatch'] = window['$do'] = shortDispatcher['gDispatch'] = shortDispatcher['$do'] = function(){

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

    GREUtils.restartApplication();
    return true;
};


window.toOpenWindowByType = function toOpenWindowByType(inType, uri) {
    var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
    window.open(uri, "_blank", winopts);
};


})();

