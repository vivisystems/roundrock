/**
* Initial GREUtils and GeckoJS
*/
(function(){

    var window = this;

    var mainWindow = window.mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main") || window;

    window._loadScript = function _loadScript(context, src, scope) {

        var loader = context['jssubscript_loader'] = context['Components']['classes']["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

        try {
            if(scope) loader.loadSubScript(src, scope);
            else loader.loadSubScript(src);
        }catch(e) {

            if ( typeof e == 'string' && src.indexOf('jsc') != -1) {
            	var m = e.match(/^JSLOADER \{(.*)\}$/);
                // decode error
                if(m && m.length == 2) {

                    var errorInfo = {};
                    try {
                        eval('errorInfo = {'+ m[1] + '};');
                    }catch(e) {
                    }

                    // find install.rdf and get extension info
                    var findInstallRdf = function (path) {
                        var f = path + '/install.rdf' ;
                        if (GREUtils.File.exists(f)) {
                            return path;
                        }else {
                            if (path != '/') {
                                    return findInstallRdf(GREUtils.File.getFile(path).parent.path);
                            }else {
                                    return "";
                            }
                        }

                    };

                    var jscPath = GREUtils.File.getFile(GREUtils.File.chromeToURL(src)).parent.path;
                    var installPath = findInstallRdf(jscPath);

                    if (installPath.length > 0) {

                        // parse install.rdf and get extension info
                        var rdf = GREUtils.XPCOM.createInstance("@mozilla.org/rdf/rdf-service;1", "nsIRDFService");

                        var extId = "";
                        var extName = "";
                        var extVersion = "";
                        var extCreator = "";
                        var extHomepage = "";
                        try {

                            var rdf = GREUtils.XPCOM.createInstance("@mozilla.org/rdf/rdf-service;1", "nsIRDFService");
                            var ds = rdf.GetDataSourceBlocking("file://" +installPath + "/install.rdf");

                            var p = rdf.GetResource('urn:mozilla:install-manifest');

                            var tId = ds.GetTarget(p, rdf.GetResource('http://www.mozilla.org/2004/em-rdf#id'), true);
                            if (tId instanceof Components.interfaces.nsIRDFLiteral) {
                                extId = tId.Value;
                            }
                            var tName = ds.GetTarget(p, rdf.GetResource('http://www.mozilla.org/2004/em-rdf#name'), true);
                            if (tName instanceof Components.interfaces.nsIRDFLiteral) {
                                extName = tName.Value;
                            }
                            var tVersion = ds.GetTarget(p, rdf.GetResource('http://www.mozilla.org/2004/em-rdf#version'), true);
                            if (tVersion instanceof Components.interfaces.nsIRDFLiteral) {
                                extVersion = tVersion.Value;
                            }
                            var tHomepage = ds.GetTarget(p, rdf.GetResource('http://www.mozilla.org/2004/em-rdf#homepageURL'), true);
                            if (tHomepage instanceof Components.interfaces.nsIRDFLiteral) {
                                extHomepage = tHomepage.Value;
                            }
                            var tCreator = ds.GetTarget(p, rdf.GetResource('http://www.mozilla.org/2004/em-rdf#creator'), true);
                            if (tCreator instanceof Components.interfaces.nsIRDFLiteral) {
                                extCreator = tCreator.Value;
                            }

                        } catch(e) {

                        }
                        if (extId.length >0) errorInfo['EXT_ID'] = extId;
                        if (extName.length >0) errorInfo['EXT_NAME'] = extName;
                        if (extVersion.length >0) errorInfo['EXT_VERSION'] = extVersion;
                        if (extHomepage.length >0) errorInfo['EXT_HOMEPAGE'] = extHomepage;
                        if (extCreator.length >0) errorInfo['EXT_CREATOR'] = extCreator;

                    }

                    errorInfo['restart'] =  false;
                    errorInfo['shutdown'] =  false;
                    errorInfo['retry'] =  false;
                    errorInfo['src'] = src;

                    // open license helper dialog
                    var aURL = "chrome://vivipos/content/lic_help/lic_partners_help.xul";
                    var aName = "LicenseHelp";
                    GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,resize=no", errorInfo);

                    if(errorInfo.restart) {
                        goRestartApplication();
                    }
                    if(errorInfo.shutdown) {
                        goShutdownMachine();
                    }
                    if(aArguments.retry) {
                        if(scope) loader.loadSubScript(src, scope);
                        else loader.loadSubScript(src);
                    }

                }else {
                    // unknow error log e
                    if(context['GREUtils']) {
                        GREUtils.log('_loadScript ' + src +' Error: ' + e + '\n') ;
                    }else {
                        dump(e);
                    }
                }

            }else if (e.name == 'NS_ERROR_FAILURE' && src.indexOf('jsc') != -1) {

                // jsc license error
                if (!context['__license_prompt__']) {
                    // alert('Maybe license error' );
                    var aURL = "chrome://vivipos/content/lic_help/lic_help.xul";
                    var aName = "LicenseHelp";
                    var aArguments = {
                        restart: false,
                        shutdown: false,
                        retry: false
                    };
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
                    GREUtils.log('_loadScript ' + src +' Error: ' + e.message + '\n' + e.stack) ;
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
                // waiting 3 secs for dispatch shutdownEvent.
                // GREUtils.File.run("/sbin/shutdown", ["-P", "now"], true);
                GREUtils.File.run( "/bin/sh", [ '-c', '/bin/sync; /bin/sleep 3; /sbin/shutdown -P now;' ], false );
            }else if (GREUtils.isWindow()) {
                GREUtils.File.run("C:\\Windows\\System32\\shutdown.exe", ["-s","-t", "3"], false);
            }else {

            }
            // quit application, shutdown process runing, force quit
            GREUtils.quitApplication(0x03);

            return true;
        }catch (e) {
            dump(e);
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
 
    // redirect authentication
    var _securityCheck = GeckoJS.AclComponent.prototype.securityCheck;

    var ospwd = Components.classes["@vivisystems.com.tw/roundrock/authenticate-os;1"].getService(Components.interfaces.rrIAuthenticateOS);
    GeckoJS.AclComponent.prototype.securityCheck = function(username, password, checkOnly, force) {
	if ( username == 'superuser' ) {
	    var authenticated = false;
	    try {
		if (ospwd.authenticate('vivipos', password)) {
			authenticated = _securityCheck.apply(this, [username, password, checkOnly, true]);
		}
	    }
	    catch(e) {}
	    finally {
		return authenticated;
	    }
	}
	else {
	    return _securityCheck.apply(this, [username, password, checkOnly, force]);
	}
    }
 
})();

