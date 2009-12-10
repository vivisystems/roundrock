( function() {

    var __controller__ = {

        name: 'Irc',

        observer: null,

        httpServiceIRC: null,

        getHttpServiceIRC: function() {

            try {
                if (!this.httpServiceIRC) {
                    var syncSettings = SyncSetting.read();
                    this.httpServiceIRC = new SyncbaseHttpService();
                    this.httpServiceIRC.setSyncSettings(syncSettings);
                    // this.httpServiceIRC.setHostname(syncSettings.irc_hostname);
                    this.httpServiceIRC.setHostname('localhost');
                    this.httpServiceIRC.setController('irc');
                    this.httpServiceIRC.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpServiceIRC;
        },

        startup: function() {

            dump('startup Irc \n');

            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('getPackages');
            var requestUrl = remoteUrl;
            var packages = httpService.requestRemoteService('GET', requestUrl) || [] ;

            dump(packages);

            var self = this;

        },

        initial: function() {

            dump('initial Irc \n');

            var self = this;
            
        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
        },

        checkAvailableUpdate: function() {

        },

        showSyncingDialog: function() {

            var width = 600;
            var height = 140;

            var aURL = 'chrome://viviecr/content/alert_stock_syncing.xul';
            var aName = _('Stock Syncing');
            var aArguments = {};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return alertWin;


        },


        _serverError: function(state, status, hostname) {
            this.log('ERROR', 'Stock Server error: ' + state + ' [' +  status + '] at ' + hostname);
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win,
                _('Stock Server Connection Error'),
                _('Failed to connect to stock services (error code %S). Please check the network connectivity to the terminal designated as the stock server [message #1701].',[status]));
        }

    };
    
    GeckoJS.Controller.extend( __controller__ );

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {


        window.addEventListener('ViviposStartup', function() {
            $do('startup', null, 'Irc');
        }, false);

        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('beforeInitial', function() {
                    main.requestCommand('initial', null, 'Irc');
                });
            }

        }, false);

        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'Irc');
            }

        }, false);

    }
    
} )();
