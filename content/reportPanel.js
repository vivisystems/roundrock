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
            GREUtils.log(label);
            GREUtils.log('vivipos.fec.reportpanels.' + key + '.label');
            GREUtils.log(_('vivipos.fec.reportpanels.' + key + '.label'));
            if (label.indexOf('chrome://') == 0) {
                label = _('vivipos.fec.reportpanels.' + key + '.label');
            }
            else {
                label = _(label);
            }
            var entry = {
                icon: el.icon,
                path: el.path,
                roles: el.roles,
                label: label
                };
            data.push(entry);
        });

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
        var aArguments = "";

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
