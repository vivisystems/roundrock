(function(){

    /**
     * Controller Startup
     */
    function startup() {

        // determine if initialization has taken place by checking for the presence
        // of '.initialized' file under user profile
        var procPath = GeckoJS.Configure.read('ProfD');
        var initMarker = new GeckoJS.File(procPath + '/.initialized');

        if (!initMarker.exists()) {
            var aURL = 'chrome://viviecr/content/setup_wizard.xul';
            var aName = _('VIVIPOS Setup');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
            var aArguments = {initialized: false};

            GREUtils.Dialog.openWindow(null, aURL, aName, aFeatures, aArguments);

            if (aArguments.initialized) {
                // carry out initialization tasks and restart application
                initMarker.create();

                alert('initialized!');
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
