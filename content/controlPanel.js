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
    
        // var args = window.args = window.arguments[0].wrappedJSObject;
        centerWindowOnScreen();


        var prefs = GeckoJS.BaseObject.getValues(GeckoJS.Configure.read('vivipos.fec.settings.controlpanels'));
        var data = new opener.GeckoJS.ArrayQuery(prefs).orderBy("label asc");
        if (data) data.forEach(function(el) {el.label = _(el.label)});
        
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

        // hide cancel button
        document.getElementById('cancel').setAttribute('hidden', true);
    };

    window.addEventListener('load', startup, true);

})();
