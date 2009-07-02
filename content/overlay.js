(function(){

    function startup() {

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        // determine if initialization has taken place by checking for the presence
        // of '.initialized' file under user profile
        var profPath = GeckoJS.Configure.read('ProfD');
        var initMarker = new GeckoJS.File(profPath + '/.initialized');
        var firstRunMarker = new GeckoJS.File(profPath + '/.firstrun');

        if (!initMarker.exists()) {
            var aURL = 'chrome://viviecr/content/setup_wizard.xul';
            var aName = _('VIVIPOS Setup');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;
            var aArguments = {initialized: false, restart: false, restarted: false};

            GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures, aArguments);
            while (aArguments.restart) {
                aArguments.restart = false;
                aArguments.restarted = true;

                // reload project locale properties
                GeckoJS.StringBundle.createBundle("chrome://viviecr/locale/messages.properties");

                GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures, aArguments);
            }

            if (aArguments.initialized) {
                // carry out initialization tasks and restart application
                initMarker.create();

                // create first run marker
                firstRunMarker.create();

                // remove any existing queue recovery files
                $do('removeQueueRecoveryFile', null, 'Cart');

                // remove any existing recovery file
                Transaction.removeRecoveryFile();
                
                GREUtils.restartApplication();

            }
        }

        // observer restart topic
        this.observer = GeckoJS.Observer.newInstance({
            topics: ['application-restart'],

            observe: function(aSubject, aTopic, aData) {
                try {
                    var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
                    var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
                    xulChromeReg.reloadChrome();

                } catch(err) {
                }
            }
        }).register();

        $do('initial', null, "Main");

        // check if this is first run
        if (firstRunMarker.exists()) {
            firstRunMarker.remove();

            // remove user.js
            GREUtils.File.remove(profPath + '/user.js');
            
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                         _('Initial Setup'),
                                         _('Would you like to go to product import/export screen now?'))) {
                var aURL = 'chrome://viviecr/content/importexport.xul';
                var aName = _('Initial Setup');
                var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);
            }
        }
    }

    function destroy() {
        this.observer.unregister();
        $do('destroy', null, "Main");
        $do('destroy', null, "Cart");
        $do('destroy', null, "VFD");
    }

    window.addEventListener('load', startup, false);
    window.addEventListener('unload', destroy, false);


})();
