/**
* Initial GREUtils and GeckoJS
*/
(function(){
 
    var window = this;
 
    var mainWindow = window.mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");
    
    window._loadScript = function _loadScript(context, src, scope) {
        
        var loader = context['jssubscript_loader'] = context['Components']['classes']["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
 
        try {
            if(scope) loader.loadSubScript(src, scope);
            else loader.loadSubScript(src);
        }catch(e) {
 
            if (e.name == 'NS_ERROR_FAILURE' && src.indexOf('jsc') != -1) {
 
                // jsc decode error
                if (!context['__license_prompt__']) {
                    // alert('Maybe license error' );
                    var aURL = "chrome://vivipos/content/lic_help/lic_help.xul";
                    var aName = "LicenseHelp";
                    var aArguments = {restart: false, shutdown: false, retry: false};
                    GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,resize=no", aArguments);
 
                    // only prompt once
                    context['__license_prompt__'] = true;
 
                    if(aArguments.restart) {
                        goRestartApplication();
                    }
                    if(aArguments.shutdown) {
                        goShutdownMachine();
                    }
                    if(aArguments.retry) {
                        if(scope) loader.loadSubScript(src, scope);
                        else loader.loadSubScript(src);
                    }
                }
 
            }else {
                // log e.message
                if(context['GREUtils']) {
                    GREUtils.log('_loadScript Error: ' + e.message + '\n' + e.stack) ;
                }else {
                    dump(e.message);
                }
            }
 
        }
        
    };
 
    /**
* loadScript load javascript in current window
*/
    window.loadScript = function loadScript(src, scope) {
        _loadScript(window, src, scope);
    };
 
 
    /**
* loadScript load javascript in vivipos Main window
*/
    window.loadScriptInMainWindow = function loadScriptInMainWindow(src, scope) {
        _loadScript(mainWindow, src, scope);
    };
 
    /**
* alias loadScript to include
*/
    window.include = loadScript ;
 
    // include xulrunner libs
    include("chrome://global/content/globalOverlay.js");
 
    // include jquery
    if(typeof window.jQuery == 'undefined') {
 
        include("chrome://vivipos/content/libs/jquery.js");
        include("chrome://vivipos/content/libs/jquery.form.js");
        include("chrome://vivipos/content/libs/jsdeferred.jquery.js");
        Deferred.define();
        include("chrome://vivipos/content/libs/jquery.popupPanel.js");
        include("chrome://vivipos/content/libs/jquery.blockUI_XUL.js");
 
    }
 
    // include date-js
    if (typeof Date.CultureInfo == 'undefined') {
        include("chrome://vivipos/content/libs/date.js");
    }
 
    /*
* initial GREUtils library and persistent it
*/
    if(typeof mainWindow.GREUtils == 'undefined') {
        loadScriptInMainWindow("chrome://vivipos/content/libs/GREUtils.js");
    }
 
    if(mainWindow !== window) {
        window.GREUtils = {};
        mainWindow.GREUtils.extend(window.GREUtils, mainWindow.GREUtils, {
            global: window,
            include: include
        });
    }
 
 
    /**
* Restart Application
*/
    window.goRestartApplication = function goRestartApplication() {
        if (!canQuitApplication())
            return false;
 
        GREUtils.restartApplication();
        return true;
    };
 
    /**
* Shutdown Machine
*/
    window.goShutdownMachine = function goShutdownMachine() {
 
        if (!canQuitApplication()) return false;
 
        try {
            if (GREUtils.isLinux()) {
                GREUtils.File.run("/sbin/shutdown", ["-P", "now"], true);
            }else if (GREUtils.isWindow()) {
                GREUtils.File.run("C:\\Windows\\System32\\shutdown.exe", ["-s","-t", "3"], true);
            }else {
                
            }
            return true;
        }catch (e) {
            alert(e);
        }
        return false;
 
    };
 
 
    /**
* Reboot Machine
*/
    window.goRebootMachine = function goRebootMachine() {
 
        if (!canQuitApplication()) return false;
 
        try {
            var fs;
            if (GREUtils.isWindow()) {
                fs = GREUtils.File.getFile("C:\\Windows\\System32\\shutdown.exe");
                GREUtils.File.run(fs, ["-r", "-t", "3"]);
            }else {
                fs = GREUtils.File.getFile("/sbin/shutdown");
                GREUtils.File.run(fs, ["-r", "now"]);
            }
            return true;
        }catch(e) {
        }
        return false;
 
 
    };
 
    window.toOpenWindowByType = function toOpenWindowByType(inType, uri) {
        var winopts = "chrome,extrachrome,menubar,resizable,scrollbars,status,toolbar";
        window.open(uri, "_blank", winopts);
    };
 
    window.getMostRecentWindow =function getMostRecentWindow (type) {
        return Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow(type);
    };
 
 
    /*
* initial GeckoJS library and persistent it
*/
    if (typeof mainWindow.GeckoJS == 'undefined') {
        loadScriptInMainWindow("chrome://vivipos/content/libs/GeckoJS.jsc");
    }
 
    if(mainWindow !== window) {
        window.GeckoJS = {};
        mainWindow.GREUtils.extend(window.GeckoJS, mainWindow.GeckoJS, {
            global: window,
            include: include
        });
    }
 
    /*
* initial GeckoJS MVC library
*/
    loadScript("chrome://vivipos/content/libs/GeckoJS_mvc.jsc");
 
 
    // initial GeckoJS bootstrap
    if(mainWindow === window) {
        loadScriptInMainWindow("chrome://vivipos/content/libs/bootstrap.js");
    }
 
    // Sync behaviors for models
    include('chrome://vivipos/content/models/sync.js');
    include('chrome://vivipos/content/models/sync_setting.js');
    include('chrome://vivipos/content/behaviors/sync.js');

    try {
        Components.utils.import('resource://app/modules/osd_utils.jsm');
        Components.utils.import('resource://app/modules/notify_utils.jsm');
        Components.utils.import('resource://app/modules/vkb.jsm');
    }catch(e){
        // maybe permission deny
        dump(e.message);
    }

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
 
    // define i18n _ shortcut
    window['_'] = window['translate'] = function() {
        return GeckoJS.I18n.getInstance().translate.apply(GeckoJS.I18n.getInstance(), arguments);
    };
 
 
})();
 
