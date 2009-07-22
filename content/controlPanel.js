(function(){

    var isShowing = false;

    /**
     * Window Startup
     */
    function startup() {

    /*
        var openModel = function(url, name, args) {
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;
            return window.openDialog(url, name, features, args);
        };
    */
        // var args = window.args = window.arguments[0].wrappedJSObject;
        centerWindowOnScreen();

        var prefs = GeckoJS.Configure.read('vivipos.fec.settings.controlpanels');

        var categories = GeckoJS.BaseObject.getKeys(prefs) || [];

        categories.forEach(function(cn) {
            var ctrls = GeckoJS.BaseObject.getKeys(prefs[cn]);
            var ctrls2 = [];

            if (ctrls) {
                ctrls.forEach(function(key) {

                    var el = prefs[cn][key];
                    // if controlpanel has stringbundle create it.
                    if (el.bundle) GeckoJS.StringBundle.createBundle(el.bundle);

                    // hidden inaccessible entry
                    if(GeckoJS.AclComponent.isUserInRole(el.roles)) {
                        var label = el.label;
                        if (label.indexOf('chrome://') == 0) {
                            var keystr = 'vivipos.fec.settings.controlpanels.' + cn + '.' + key + '.label';
                            label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                        }
                        else {
                            label = _(label);
                        }
                        var entry = {
                            icon: el.icon,
                            path: el.path,
                            roles: el.roles,
                            features: (el.features || null),
                            type:  (el.type || 'uri'),
                            label: label
                        }

                        ctrls2.push(entry);
                    }
                });
            }
            
            var data = new GeckoJS.ArrayQuery(ctrls2).orderBy("label asc");
            window.viewHelper = new opener.GeckoJS.NSITreeViewArray(data);
        
            document.getElementById(cn + 'Panel').datasource = window.viewHelper ;
        });
    };


    window.launchControl = function launchControl(panel) {
        var data = panel.datasource.data;
        var index = panel.selectedIndex;

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

        if (index > -1 && index < data.length) {
            var pref = data[index];

            var features = pref['features'] || "chrome,popup=no,titlebar=no,toolbar,centerscreen";
            features += ",modal,width=" + width + ",height=" + height;

            if (isShowing) {
            // nothings to do
            }else {

                try {

                    isShowing = true;

                    $.blockUI({
                        message:$('#loading'),
                        css: {
                            'background-color': 'transparent',
                            left: '0%',
                            border: '0px'
                        }
                    });

                    // @hack sleep to make sure the loading panel is rendered
                    GeckoJS.BaseObject.sleep(50);
                    if (pref['type'] == 'uri') {

                        window.openDialog(pref['path'], pref['label'], features);

                    }else {

                        VirtualKeyboard.show();

                        var paths = pref['path'].split(' ');
                        var launchAp = paths[0];
                        var args = paths.slice(1);

                        var fileAp = new GeckoJS.File(launchAp);
                        fileAp.run(args, true);

                        VirtualKeyboard.hide();
                    }
                }
                catch (e) {
                }
                finally {
                    isShowing = false;
                    $.unblockUI();
                }

            }
        }
    };

    window.savePreferences = function savePreferences() {
        // GeckoJS.Configure.savePreferences('vivipos');
        window.close();
    };


    window.addEventListener('load', startup, true);



})();
