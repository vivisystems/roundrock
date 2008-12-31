(function(){

 /**
  * Window Startup
  */
    function startup() {

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

        var openModel = function(url, name, args) {
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;
            return window.openDialog(url, name, features, args);
        };
    
        centerWindowOnScreen();

        var prefs = GeckoJS.BaseObject.getValues(GeckoJS.Configure.read('vivipos.fec.reportpanels'));
        var data = new opener.GeckoJS.ArrayQuery(prefs).orderBy("label asc");
        // if (data) data.forEach(function(el) {el.label = _(el.label)});

        if (data) data = data.map(function(el) {
                var entry = {icon: el.icon,
                             path: el.path,
                             roles: el.roles,
                             label: _(el.label)}
                return entry;
            })

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(data);

        document.getElementById('imagePanel').datasource = window.viewHelper ;

        document.getElementById('imagePanel').addEventListener('command', function(evt) {

            var index = evt.target.currentIndex;
            var pref = data[index];
            var aArguments = "";

            $('#loading').show();
            openModel(pref['path'], "Preferences_" + pref['label'], aArguments);
            $('#loading').hide();
        }, true);

    };

    window.addEventListener('load', startup, true);

})();
