(function(){

 /**
  * Window Startup
  */
    function startup() {


        var openModel = function(url, name, args) {
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;
            return window.openDialog(url, name, features, args);
        };
    
        // var args = window.args = window.arguments[0].wrappedJSObject;
        centerWindowOnScreen();


        var prefs = GeckoJS.Configure.read('vivipos.fec.settings.controlpanels');

        var categories = GeckoJS.BaseObject.getKeys(prefs) || [];

        categories.forEach(function(cn) {
            var data = new GeckoJS.ArrayQuery(GeckoJS.BaseObject.getValues(prefs[cn])).orderBy("label asc");
            //if (data) data.forEach(function(el) {el.label = _(el.label)});
            if (data) data = data.map(function(el) {
                var entry = {icon: el.icon,
                             path: el.path,
                             roles: el.roles,
                             label: _(el.label)}
                return entry;
            })
            window.viewHelper = new opener.GeckoJS.NSITreeViewArray(data);
        
            document.getElementById(cn + 'Panel').datasource = window.viewHelper ;
        });
    };

    window.addEventListener('load', startup, true);

})();

function launchControl(panel) {
    var data = panel.datasource.data;
    var index = panel.selectedIndex;

    var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
    var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

    if (index > -1 && index < data.length) {
        var pref = data[index];

        var aArguments = "";
        var features = "chrome,popup=yes,titlebar=no,toolbar,centerscreen,modal,width=" + width + ",height=" + height;

        try {
            $('#loading').show();
	    // @hack sleep to make sure the loading panel is rendered
	    GeckoJS.BaseObject.sleep(50);
            window.openDialog(pref['path'], pref['label'], features, aArguments);
        }
        catch (e) {}
        finally {
            $('#loading').hide();
        }
    }
}

function savePreferences() {
    GeckoJS.Configure.savePreferences('vivipos');
    window.close();
}
