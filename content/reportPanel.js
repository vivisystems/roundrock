(function(){

    var width = 0 , height = 0;
    var isShowing = false;
    
    /**
     * Window Startup
     */
    function startup() {

        width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
   
        centerWindowOnScreen();

        var reports = GeckoJS.Configure.read('vivipos.fec.reportpanels');
        var keys = GeckoJS.BaseObject.getKeys(reports) || [];
        var data = [];

        keys.forEach(function(key) {
            var el = reports[key];
            var label = el.label;
            if (label.indexOf('chrome://') == 0) {
                var keystr = 'vivipos.fec.reportpanels.' + key + '.label';
                label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
            }
            else {
                label = _(label);
            }
            var entry = {
                icon: el.icon,
                path: el.path,
                roles: el.roles,
                label: label,
                key: key || ""
            };
            data.push(entry);
        });
        data = new GeckoJS.ArrayQuery(data).orderBy("label asc");
        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(data);

        document.getElementById('imagePanel').datasource = window.viewHelper;

    }

    window.openModel = function openModel(url, name, args) {
        var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;
        return window.openDialog(url, name, features, args);
    };


    window.launchReport =  function launchReport (panel) {
        var data = panel.datasource.data;
        var index = panel.currentIndex;
        var pref = data[index];
        var aArguments = pref;

        if (isShowing) {
            // nothings to do
        }else {
            $('#loading').show();
            isShowing = true;
            openModel(pref['path'], "Preferences_" + pref['label'], aArguments);
            $('#loading').hide();
            isShowing = false;

        }
    };

    window.addEventListener('load', startup, true);

})();
