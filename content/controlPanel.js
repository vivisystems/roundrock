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
                             features: (el.features || null), 
                             type:  (el.type || 'uri'),
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
        var features = pref['features'] || "chrome,popup=no,titlebar=no,toolbar,centerscreen,modal,width=" + width + ",height=" + height;

        try {
            $.blockUI({
                message:$('#loading'),
                css: {
                    left: '30%',
                    border: '0px'
                }
            });

            // @hack sleep to make sure the loading panel is rendered
            GeckoJS.BaseObject.sleep(50);
            if (pref['type'] == 'uri') {

                window.openDialog(pref['path'], pref['label'], features);

            }else {

                var paths = pref['path'].split(' ');
                var launchAp = paths[0];
                var args = paths.slice(1);

                var fileAp = new GeckoJS.File(launchAp);
                fileAp.run(args, true);

            }
        }
        catch (e) {alert(e);}
        finally {
            $.unblockUI();
        }
    }
}

function savePreferences() {
    // GeckoJS.Configure.savePreferences('vivipos');
    window.close();
}
