(function(){

    /**
     * Controller Startup
     */
    function startup() {

        var firstRun = GREUtils.Pref.getPref('vivipos.fec.firstrun');

        if(firstRun) {
            var aURL = "chrome://viviecr/content/firstuse.xul";
            var aName = "First Run";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = 800;
            var height = 600;
            GREUtils.Dialog.openDialog(aURL, aName, aArguments, posX, posY, width, height);
        }else {
            // app start
            // load product and category

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
    }

    window.addEventListener('load', startup, false);
    window.addEventListener('unload', destroy, false);


})();
