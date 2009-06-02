(function(){

    /**
     * Localization Editor
     */

    var __controller__ = {
        name: 'Localization',

        load: function() {
            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');

            var selectedLocale = GeckoJS.Configure.read('general.useragent.local');
            //var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');
            alert('current locale: ' + selectedLocale);

            // retrieve file system paths to base locale
            for (var pkg in packages) {
                
                var chromePath = 'chrome://' + pkg + '/locale/';
                var selectedFilePath = GREUtils.File.chromeToPath(chromePath);

                GeckoJS.Configure.write('general.useragent.locale', packages[pkg]);
                var baseLocale = xulChromeReg.getSelectedLocale(pkg);
                var baseFilePath = GREUtils.File.chromeToPath(chromePath);

                GeckoJS.Configure.write('general.useragent.locale', selectedLocale);

                alert('pkg [' + pkg + '] current locale: ' + selectedFilePath + ', base locale: ' + baseFilePath);
                
                // make sure filePath exists and is a directory
                if (!GREUtils.File.exists(selectedFilePath) || !GREUtils.File.isDir(selectedFilePath)) {
                    alert('current locale at ' + selectedFilePath + ' does not exist or is not a directory');
                }
                else if (!GREUtils.File.exists(baseFilePath) || !GREUtils.File.isDir(baseFilePath)) {
                    alert('base locale at ' + baseFilePath + ' does not exist or is not a directory');
                }
                else {
                    // recursively load each dtd/properies file from base & current locale
                }
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
