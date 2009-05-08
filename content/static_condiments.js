(function(){


    function startup() {

        $do('registerInitial', null, 'StaticCondiments');
        
    }


    function startup_settings() {

        $do('initial', null, 'StaticCondiments');
    }


    // only main window need initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {

        window.addEventListener('load', startup, false);
    }

    // only controller window need initial
    var settingsWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("staticCondimentsSettings");

    if (settingsWindow === window) {
        window.addEventListener('load', startup_settings, false);
    }


})();
