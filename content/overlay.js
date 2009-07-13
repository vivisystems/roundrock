(function(){

    function startup() {
        
        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

        // determine if initialization has taken place by checking for the presence
        // of '.initialized' file under user profile
        var profPath = GeckoJS.Configure.read('ProfD');
        var initMarker = new GeckoJS.File(profPath + '/.runsetup');
        var firstRunMarker = new GeckoJS.File(profPath + '/.firstrun');

        if (initMarker.exists()) {
            
            var aURL = 'chrome://viviecr/content/wizard_first.xul';
            var aName = _('VIVIPOS Setup');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;
            var aArguments = {initialized: false, restart: false, restarted: false, test: 123};

            GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures, aArguments);
            var aURL = 'chrome://viviecr/content/setup_wizard.xul';
            
            while (aArguments.restart) {
                aArguments.restart = false;
                aArguments.restarted = true;

                // reload project locale properties
                GeckoJS.StringBundle.createBundle("chrome://viviecr/locale/messages.properties");

                GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures, aArguments);
            }

            if (aArguments.initialized) {
                // carry out initialization tasks and restart application
                initMarker.remove();

                // create first run marker
                firstRunMarker.create();

                // remove any existing queue recovery files
                $do('removeQueueRecoveryFile', null, 'Cart');

                // remove any existing recovery file
                Transaction.removeRecoveryFile();
                
                GREUtils.restartApplication();

                GeckoJS.Session.set('restarting', true);
                return;
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

        // check if this is first run
        var firstrun;
        if (firstRunMarker.exists()) {
            firstRunMarker.remove();

            // remove user.js
            GREUtils.File.remove(profPath + '/user.js');

            var firstrun = true;
        }
        $do('initial', firstrun, "Main");

        if (firstrun) {
            if (GREUtils.Dialog.confirm(null,
                                         _('Initial Setup'),
                                         _('Welcome to VIVIPOS. If you have prepared product data in comma-separated vector (CSV) format, ' +
                                           'you can easily import them into the terminal. Would you like to go to product import/export screen now?'))) {
                var aURL = 'chrome://viviecr/content/importexport.xul';
                var aName = _('Initial Setup');
                var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;

                GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures);
            }
        }
    }

    function destroy() {
        if (this.observer) this.observer.unregister();
        $do('destroy', null, "Main");
        $do('destroy', null, "Cart");
        $do('destroy', null, "VFD");
    }

    window.addEventListener('load', startup, false);
    window.addEventListener('unload', destroy, false);


})();
