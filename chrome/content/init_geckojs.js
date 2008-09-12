/** 
 * Initial GREUtils and GeckoJS
 */
(function(){

var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                       .getService(Components.interfaces.mozIJSSubScriptLoader); 

// include jquery
if(typeof window.jQuery == 'undefined') {
    loader.loadSubScript("resource://app/modules/jquery-1.2.6.js", window); 
	loader.loadSubScript("resource://app/modules/jquery.qsa.js", window);
	loader.loadSubScript("resource://app/modules/jquery.form.js", window);
}

// include date-js
if (typeof Date.CultureInfo == 'undefined') { 
	loader.loadSubScript("resource://app/modules/date.js", window);
}

Components.utils.import("resource://app/modules/GREUtils.jsm");
Components.utils.import("resource://app/modules/GeckoJS.jsm");

// ONLY FOR jsmodules version gecko 1.9
// initial current window context to javascript code modules
GREUtils.global = window || this;
GeckoJS.global = window  || this;

GREUtils.include_once("chrome://global/content/globalOverlay.js", window);


// Dispatcher shortcut
var gDispatch = window.gDispatch = window.$g =  function(){
	let args = [];
	for(let i=0; i<arguments.length; i++) args.push(arguments[i]);
	// add window context
	args.push(window)

	GeckoJS.Dispatcher.dispatch.apply(GeckoJS.Dispatcher, args);
};


})();

