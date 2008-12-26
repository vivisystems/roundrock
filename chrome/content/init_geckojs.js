/** 
 * Initial GREUtils and GeckoJS
 */
(function(){

var hiddenWindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
         .getService(Components.interfaces.nsIAppShellService).hiddenDOMWindow;

var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
         .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");


window.include = function include(src, scope) {

    let loader = window.jssubscript_loader = window.Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

    try {
        if(scope) loader.loadSubScript(src, scope);
	else loader.loadSubScript(src);
   }catch(e) {}

};

window.includeh = function includeh(src, scope) {

    let loader = hiddenWindow.jssubscript_loader = hiddenWindow.Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

    try {
        if(scope) loader.loadSubScript(src, scope);
	else loader.loadSubScript(src);
   }catch(e) {}

};

window.includem = function includeh(src, scope) {

    let loader = mainWindow.jssubscript_loader = mainWindow.Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

    try {
        if(scope) loader.loadSubScript(src, scope);
	else loader.loadSubScript(src);
   }catch(e) { alert(e)}

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

// include template
if (typeof TrimPath == 'undefined') {
    include("chrome://vivipos/content/libs/template.js");
}

/*
 * initial GREUtils library and persistent it
 */ 
if(typeof mainWindow.GREUtils == 'undefined') {
    includem("chrome://vivipos/content/libs/GREUtils.js");
}
if(mainWindow !== window) {
	window.GREUtils = {};
	mainWindow.GREUtils.extend(window.GREUtils, mainWindow.GREUtils, {global: window, include: include});
}
//GREUtils.log("window.GREUtils.global === mainWindow.GREUtils.global " + (window.GREUtils.global === mainWindow.GREUtils.global));

/*
 * initial GeckoJS library and persistent it
 */ 
if (typeof mainWindow.GeckoJS == 'undefined') {
	includem("chrome://vivipos/content/libs/GeckoJS.jsc");
}
if(mainWindow !== window) {
	window.GeckoJS = {};
	mainWindow.GREUtils.extend(window.GeckoJS, mainWindow.GeckoJS, {global: window, include: include});
}
// GREUtils.log("window.GeckoJS.global === mainWindow.GeckoJS.global " + (window.GeckoJS.global === mainWindow.GeckoJS.global) + ","+ GeckoJS);


/*
 * initial GeckoJS MVC library
 */ 
include("chrome://vivipos/content/libs/GeckoJS_mvc.jsc");


// initial GeckoJS bootstrap
if(mainWindow === window) {
    includem("chrome://vivipos/content/libs/bootstrap.js");
}


// ONLY FOR jsmodules version gecko 1.9
// initial current window context to javascript code modules
include("chrome://global/content/globalOverlay.js");

Components.utils.import('resource://app/modules/osd_utils.jsm', window);
Components.utils.import('resource://app/modules/vkb.jsm', window);


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

window['_'] = window['translate'] = function() {
    return GeckoJS.I18n.getInstance().translate.apply(GeckoJS.I18n.getInstance(), arguments);
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

