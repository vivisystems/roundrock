// import vivipos libraries

(function(){


    var vivipos = window.vivipos = {

        initialized: false,
        version: '0.2',

        suspendSavePreference: false,

        closeObserve: null,

        _handleWindowClose: function(event){
            // handler for clicking on the 'x' to close the window
            return this.shutdown();
        },
    
    
        startup: function(){
    
            if (this.initialized)
                return;
            this.initialized = true;

            // addAppender for vivipos.log file.
            GeckoJS.Log.addAppender('vivipos', new GeckoJS.Log.FileAppender(GeckoJS.Log.FATAL, GeckoJS.Configure.read('CurProcD')+"/log/vivipos.log"));

            GeckoJS.Configure.loadPreferences('vivipos');

            // set main screen
            var mainscreenSettings = GeckoJS.Configure.read('vivipos.fec.mainscreen');

            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                        .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");
            var mainscreenObject = mainWindow.document.getElementById('vivipos_mainWindow');

            for (var k in mainscreenSettings) {
                mainscreenObject.setAttribute(k, mainscreenSettings[k]);
            }

            this.updateStatusPanel();

            // preload SyncSetting and createSchema
            var syncSetting = new SyncSetting();
            var syncSettings = syncSetting.read();

            if (syncSettings['active'] == 1) {
                syncSetting.createSchema();
            }

            var self = this;
            
            this.closeObserve = GeckoJS.Observer.newInstance({
                
                topics: ['quit-applicatio-requested','quit-application-granted', 'quit-application', 'xpcom-shutdown'],
                observe: function(aSubject, aTopic, aData) {

                    self.shutdown();
                    
                }
            }).register();

            GeckoJS.Log.getLoggerForClass('VIVIPOS').setLevel(GeckoJS.Log.ERROR).info('VIVIPOS STARTUP');

        },
    
        shutdown: function(){
            
            this.closeObserve.unregister();

            // save vivipos Preferences
	    // if (!this.suspendSavePreference) GeckoJS.Configure.savePreferences('vivipos');

            // shutdown console log
            if(consoleErrors) consoleErrors.shutdown();

            // log close
            GeckoJS.Log.getLoggerForClass('VIVIPOS').info('VIVIPOS CLOSE');

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
                            if (debugSettings[k]) document.getElementById('vivipos-bottombox').setAttribute('hidden', true);
                            break;
                        case 'disable_extension_manager':
                            if (debugSettings[k]) document.getElementById('statusbar-extension_manager').setAttribute('hidden', true);
                            break;
                        case 'disable_inspector':
                            if (debugSettings[k]) document.getElementById('statusbar-inspector').setAttribute('hidden', true);
                            break;
                        case 'disable_debugger':
                            if (debugSettings[k]) document.getElementById('statusbar-debugger').setAttribute('hidden', true);
                            break;
                        case 'disable_jsconsole':
                            if (debugSettings[k]) {
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
