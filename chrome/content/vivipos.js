// import vivipos libraries

(function(){


    var vivipos = window.vivipos = {

        initialized: false,
        
        version: '1.2.1',

        _httpdServer: null,

        closeObserve: null,

        _handleWindowClose: function(event){
            // handler for clicking on the 'x' to close the window
            return this.shutdown();
        },
    
    
        startup: function(){
    
            if (this.initialized)
                return;
            this.initialized = true;

            GeckoJS.Configure.loadPreferences('vivipos');

            // set log level
            var logLevel = GeckoJS.Configure.read('vivipos.fec.debug.log_level') || 'ERROR';
            var logLevelObj = GeckoJS.Log[logLevel] || GeckoJS.Log.WARN;

            // addAppender for vivipos.log file.
            GeckoJS.Log.addAppender('vivipos', new GeckoJS.Log.FileAppender(logLevelObj, GeckoJS.Configure.read('CurProcD')+"/log/vivipos.log"));

            GeckoJS.Log.defaultClassLevel = GeckoJS.Log[logLevel];
            GeckoJS.Log.getAppender('console').level = GeckoJS.Log[logLevel];
            GeckoJS.Log.getLoggerForClass('DatasourceSQL').level = GeckoJS.Log[logLevel];
            GeckoJS.Log.getLoggerForClass('DatasourceSQLite').level = GeckoJS.Log[logLevel];

            // process userConfigure.js
            this.processUserConfigure();

            // set main screen
            var mainscreenSettings = GeckoJS.Configure.read('vivipos.fec.mainscreen');

            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                             .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main") || window;

            var mainscreenObject = mainWindow.document.getElementById('viviposMainWindow');

            for (var k in mainscreenSettings) {
                if(mainscreenObject) mainscreenObject.setAttribute(k, mainscreenSettings[k]);
            }

            this.updateStatusPanel();

            // preload SyncSetting and createSchema
            var syncSetting = new SyncSetting();
            var syncSettings = syncSetting.read();

            if (syncSettings) {
                if (syncSettings['active'] == 1) syncSetting.createSchema();
                GeckoJS.Session.set('terminal_no', syncSettings['machine_id']);
            }else {
                GeckoJS.Session.set('terminal_no', 'T001');
            }

            var self = this;
            
            this.closeObserve = GeckoJS.Observer.newInstance({
                
                topics: ['quit-applicatio-requested','quit-application-granted', 'quit-application', 'xpcom-shutdown'],
                observe: function(aSubject, aTopic, aData) {

                    self.shutdown();
                    
                }
            }).register();

            // log startup
            GeckoJS.Log.getLoggerForClass('VIVIPOS').setLevel(GeckoJS.Log.WARN).warn('VIVIPOS STARTUP');

            // check PrefFile
            this.checkPrefFile();

            // register Configure listenter
            this.registerConfigureListener();

            // startup simple http services
            this.startupHttpd();

            try {
                // notify that vivipos STARTUP
                var event = mainWindow.document.createEvent("Event");
                event.initEvent("ViviposStartup", true, true);
                GeckoJS.Log.getLoggerForClass('VIVIPOS').warn('VIVIPOS dispatchEvent [ViviposStartup]');
                mainWindow.dispatchEvent(event);
            }catch(e) {
            }


            // Try to kill osd from run_vivipos script
            // XXXX has better way?
            GREUtils.File.run( "/bin/sh", [ '-c', '/usr/bin/pkill aosd_cat;' ], true );

        },
    

        shutdown: function(){
            
            this.closeObserve.unregister();

            // shutdown console log
            if(consoleErrors) consoleErrors.shutdown();

            // log close
            GeckoJS.Log.getLoggerForClass('VIVIPOS').warn('VIVIPOS SHUTDOWN');

            // shutdown simple http services
            this.shutdownHttpd();

            try {
                // notify that vivipos SHUTDOWN
                var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main") | window;
                var event = mainWindow.document.createEvent("Event");
                event.initEvent("ViviposShutdown", true, true);
                GeckoJS.Log.getLoggerForClass('VIVIPOS').warn('VIVIPOS dispatchEvent [ViviposShutdown]');
                mainWindow.dispatchEvent(event);
            }catch(e) {
            }

        },
    
        shutdownQuery: function() {

            // broadcast vivipos shutdown

            return true;
        },

        hasErrors: function(errors){
            var errorImg = document.getElementById("img_jsconsole");
            if(!errorImg) {
                return;
            }
            if (errors) {
                errorImg.setAttribute("mode", "error");
            }
            else {
                errorImg.setAttribute("mode", "ok");
            }
        },

        updateStatusPanel: function() {
            
            try {
                var debugSettings = GeckoJS.Configure.read('vivipos.fec.debug');

                for(var k in debugSettings) {
                    switch (k) {

                        case 'disable_bottombox':
                            if (debugSettings[k] && document.getElementById('vivipos-bottombox') ) document.getElementById('vivipos-bottombox').setAttribute('hidden', true);
                            break;
                        case 'disable_extension_manager':
                            if (debugSettings[k] && document.getElementById('statusbar-extension_manager') ) document.getElementById('statusbar-extension_manager').setAttribute('hidden', true);
                            break;
                        case 'disable_inspector':
                            if (debugSettings[k] && document.getElementById('statusbar-inspector') ) document.getElementById('statusbar-inspector').setAttribute('hidden', true);
                            break;
                        case 'disable_debugger':
                            if (debugSettings[k] && document.getElementById('statusbar-debugger') ) document.getElementById('statusbar-debugger').setAttribute('hidden', true);
                            break;
			case 'disable_sqlitemanager':
                            if (debugSettings[k] && document.getElementById('statusbar-sqlitemanager') ) document.getElementById('statusbar-sqlitemanager').setAttribute('hidden', true);
			    break;
                        case 'disable_jsconsole':
                            if (debugSettings[k] && document.getElementById('statusbar-jsconsole') ) {
                                document.getElementById('statusbar-jsconsole').setAttribute('hidden', true);
                            }else {
                                if (!debugSettings['disable_bottombox']) {
                                    // init the error watching
                                    consoleErrors.startup(this);
                                    this.hasErrors(false);
                                }                                
                            }
                            break;
                    }
                }

            }catch(e) {}

        },

        processUserConfigure: function () {
            
            var profilePath = GeckoJS.Configure.read('CORE.ProfD');
            var userConf = profilePath + '/chrome/userConfigure.js' ;

            var f = new GeckoJS.File(userConf);
            
            if (f.exists()) {

                f.open("r");

                var jsContent = f.read();

                if (jsContent.length <=0) return ;

                var write = function(k, v) {
                    // dump('write k: ' + k + ' ,v: ' + v + '\n');
                    GeckoJS.Configure.write(k, v, false);
                };

                var remove = function(k) {
                    // dump('remove k: ' + k + '\n');
                    GeckoJS.Configure.remove(k, false);
                };

                try {
                    window.eval(jsContent);
                }catch(e) {
                    //dump(e);
                }
                
                f.close();
            }

            return ;
        },


        /**
         * Startup simple httpd
         *
         * support observe / dispatch / session
         *
         * object supported
         */
        startupHttpd: function() {
            
            var self = this;

            try {
                var server = Components.classes["@mozilla.org/server/jshttp;1"]
                             .createInstance(Components.interfaces.nsIHttpServer);

                var port  = GeckoJS.Configure.read("vivipos.fec.simplehttpd.port") || 8888;


                server.registerPathHandler("/", function(metadata, response) {

                    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
                    var body = "";
                    body += "name: " + appInfo.name + "\n";
                    body += "ID: " + appInfo.ID + "\n";
                    body += "appBuildID: " + appInfo.appBuildID + "\n";

                    response.setStatusLine(metadata.httpVersion, 200, "OK");
                    response.setHeader("Content-Type", "text/plain", false);
                    response.bodyOutputStream.write(body, body.length);

                });

                server.registerPathHandler("/observer", function(metadata, response) {

                    var queryData = GeckoJS.String.parseStr(metadata.queryString);

                    var topic = queryData['topic'] || "" ;
                    var data = queryData['data'] || "" ;
                    var body = "" ;
                    var dataObj = null;

                    // convert data from UTF-8 to UNICODE
                    data = GREUtils.Charset.convertToUnicode(data);

                    // parse data if data is json string
                    if (data.length>0) {
                        try {
                            dataObj = JSON.parse(data);
                        }catch(e) {
                            dataObj = data;
                        }
                        data = dataObj;
                    }

                    try {
                        if (topic.length > 0) {
                            body = "observer notify: \n";
                            body += "  topic: " + topic + "\n";
                            body += "  data: " + data + "\n";

                            // use function wrapper , and response
                            setTimeout(function() {
                                GeckoJS.Observer.notify(null, topic, data);
                            }, 0);

                        }
                    }catch(e) {
                        dump(e);
                    }

                    response.setStatusLine(metadata.httpVersion, 200, "OK");
                    response.setHeader("Content-Type", "text/plain", false);
                    response.bodyOutputStream.write(body, body.length);

                });


                server.registerPathHandler("/dispatch", function(metadata, response) {

                    var queryData = GeckoJS.String.parseStr(metadata.queryString);

                    var command = queryData['command'] || "" ;
                    var data = queryData['data'] || "" ;
                    var controller = queryData['controller'] || "" ;
                    var body = "" ;
                    var dataObj = null;

                    // convert data from UTF-8 to UNICODE
                    data = GREUtils.Charset.convertToUnicode(data);

                    // parse data if data is json string
                    if (data.length>0) {
                        try {
                            dataObj = JSON.parse(data);
                        }catch(e) {
                            dataObj = data;
                        }
                        data = dataObj;
                    }

                    try {
                        if (command.length > 0 && controller.length > 0) {

                           // mainWindow only
                            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main") || window;

                            body = "dispatch: \n";
                            body += "  controller: " + controller + "\n";
                            body += "  command: " + command + "\n";

                            // use function wrapper , and response
                            setTimeout(function() {
                                GeckoJS.Dispatcher.dispatch(mainWindow, command, data, controller);
                            }, 10);

                        }
                    }catch(e){
                        dump(e);
                    }

                    response.setStatusLine(metadata.httpVersion, 200, "OK");
                    response.setHeader("Content-Type", "text/plain", false);
                    response.bodyOutputStream.write(body, body.length);

                });

                server.registerPathHandler("/session", function(metadata, response) {

                    var queryData = GeckoJS.String.parseStr(metadata.queryString);

                    var action = queryData['action'] || "" ;
                    var key = queryData['key'] || "" ;
                    var value = queryData['value'] || null ;
                    var body = "" ;
                    var dataObj = null;

                    try {
                        if (action.length > 0 && key.length > 0) {

                            switch(action) {
                                case "add":

                                    body = "session added: \n";
                                    body += "  key: " + key + "\n";

                                    // parse value if value is json string
                                    if (value) {
                                        dataObj = null;
                                        try {
                                            dataObj = JSON.parse(value);
                                        }catch(e) {
                                            dataObj = value;
                                        }
                                        value = dataObj;
                                    }

                                    // use function wrapper , and response
                                    setTimeout(function() {
                                        GeckoJS.Session.add(key, value);
                                    }, 10);

                                case "set":

                                    body = "session updated: \n";
                                    body += "  key: " + key + "\n";

                                    // convert value from UTF-8 to UNICODE
                                    value = GREUtils.Charset.convertToUnicode(value);

                                    // parse value if value is json string
                                    if (value) {
                                        dataObj = null;
                                        try {
                                            dataObj = JSON.parse(value);
                                        }catch(e) {
                                            dataObj = value;
                                        }
                                        value = dataObj;
                                    }

                                    // use function wrapper , and response
                                    setTimeout(function() {
                                        GeckoJS.Session.set(key, value);
                                    }, 10);

                                    break;

                                case "remove":

                                    body = "session removed: \n";
                                    body += "  key: " + key + "\n";

                                    // use function wrapper , and response
                                    setTimeout(function() {
                                        GeckoJS.Session.remove(key);
                                    }, 10);

                                    break;

                                case "get":
                                    value = (GeckoJS.Session.get(key) || null);

                                    // stringify value if value is object
                                    if (value != null && (typeof value == 'object')) {
                                        dataObj = null;
                                        try {
                                            dataObj = GREUtils.Charset.convertFromUnicode(JSON.stringify(value));
                                        }catch(e) {
                                            dataObj = value;
                                        }
                                        value = dataObj;
                                    }else if (value != null && (typeof value == 'string')) {
                                        value = GREUtils.Charset.convertFromUnicode(value);
                                    }
                                    body = value +'';

                                    break;
                            }
                        }

                    }catch(e) {
                        dump(e);
                    }

                    response.setStatusLine(metadata.httpVersion, 200, "OK");
                    response.setHeader("Content-Type", "text/plain", false);
                    response.bodyOutputStream.write(body, body.length);

                });

                server.start(port);

                GeckoJS.Log.getLoggerForClass('VIVIPOS').warn('VIVIPOS SIMPLE HTTPD STARTUP (' + port + ')');

                this._httpdServer = server;

            }catch(e) {


            }

        },


        shutdownHttpd: function() {

            try {
                
                if (this._httpdServer) {
                    this._httpdServer.stop( {
                        onStopped: function() {
                            // nothing to do
                        }
                    });

                    GeckoJS.Log.getLoggerForClass('VIVIPOS').warn('VIVIPOS SIMPLE HTTPD SHUTDOWN');
                }

            }catch(e) {

            }

        },


        checkPrefFile: function() {

            var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
            var userJs = profD.clone(); userJs.append('user.js');
            var prefsJs = profD.clone(); prefsJs.append('prefs.js');
            var invalidprefsJs = profD.clone(); invalidprefsJs.append('Invalidprefs.js');
            var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);

            if (invalidprefsJs.exists()) {
                GeckoJS.Log.getLoggerForClass('VIVIPOS').error('Invalidprefs.js exists, maybe prefs.js corrupt');

                if (userJs.exists()) {

                    mPrefService.savePrefFile(null);
                    mPrefService.savePrefFile(userJs);
                    GeckoJS.Log.getLoggerForClass('VIVIPOS').error('Using user.js to repairing corrupt prefs.js');

                    invalidprefsJs.moveTo(profD, 'Invalidprefs.js.bak');
                    GeckoJS.Log.getLoggerForClass('VIVIPOS').error('Rename Invalidprefs.js to Invalidprefs.js.bak');
                }

            }

        },



        registerConfigureListener: function() {

            this._registerListener = function(evt) {

                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
                var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
                var userJs = profD.clone(); userJs.append('user.js');

                mPrefService.savePrefFile(userJs);

            };

            GeckoJS.Configure.addEventListener('savePrefFile', this._registerListener);
            
        }



    };


    // ------------------------------------------------------------------
    // attach to window events so vivipos object can startup / shutdown
    // ------------------------------------------------------------------

    window.addEventListener("DOMContentLoaded", function() {
        vivipos.startup();
    }, true)

    window.addEventListener("load", function (){

    }, false);

    window.addEventListener("unload", function (){
        vivipos.shutdown();
    }, false);

    // add window close handler
    window.addEventListener("close", function(event){
        vivipos._handleWindowClose(event);
    }, false);


// end of wrap 
})();
