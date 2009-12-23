(function() {

    var __controller__ = {

        name : 'Irc',

        observer : null,

        httpServiceIRC : null,

        getHttpServiceIRC : function() {

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
            } catch (e) {
                this.log('error ' + e);
            }

            return this.httpServiceIRC;
        },

		
        /**
         * on ViviposStartup Check available update exists?
         */
        startup : function() {

            var self = this;
			
            // force checking when vivipos startup
            var syncSettings = SyncSetting.read();
            var hostname = syncSettings.irc_hostname;

            /*
            if (hostname == 'localhost' || hostname == '127.0.0.1') {
                return ;
            }*/

            // check update
            this.checkAvailableUpdates();


        },

		
        /**
         * initial irc controller to listen events
         */
        initial : function() {

            var self = this;
			
            var syncSettings = SyncSetting.read();
            var hostname = syncSettings.irc_hostname;

            /*
            if (hostname == 'localhost' || hostname == '127.0.0.1') {
                return ;
            }*/
			
            // add main listener
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
				
                if (syncSettings.irc_update_when_signon) {
                    main.addEventListener('signedOn', function() {
                        self.checkAvailableUpdates();
                    });
                }

                if (syncSettings.irc_update_when_signoff) {
                    main.addEventListener('signedOff', function() {
                        self.checkAvailableUpdates();
                    });
                }

                if (syncSettings.irc_update_when_reboot) {
                    main.addEventListener('beforeReboot', function() {
                        self.checkAvailableUpdates(true);
                    });
                }

                if (syncSettings.irc_update_when_shutdown) {
                    main.addEventListener('beforeShutdown', function() {
                        self.checkAvailableUpdates(true);
                    });
                }

                main.addEventListener('onClearOrderData', function() {
                    self.removeExpirePackages();
                });
				
            }

            /*
            // add idle listener
            var idle = GeckoJS.Controller.getInstanceByName('Idle');
            if (idle) {

                    if (syncSettings.irc_update_when_idle) {
                            idle.addEventListener('onBack', function() {
                                    self.checkAvailableUpdates();
                            });
                    }
            }
            */
		
        },

		
        /**
         * destroy listener
         */
        destroy : function() {

            var self = this;

        },

		
        /**
         * checkAvailableUpdates
         */
        checkAvailableUpdates : function(skipReboot) {

            skipReboot = skipReboot || false;
            
            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('checkAvailableUpdates');
            var requestUrl = remoteUrl;

            var alertWin = null;
            try {
                alertWin = this.showProgressDialog(_('Checking Available Updates'));
                var packages = httpService.requestRemoteService('GET', requestUrl) || false;
            }catch(e) {
                this.log('ERROR', 'Error checkAvailableUpdates', e);
            }finally {
                alertWin.close();
            }

            if (packages && packages.length) {
				
                // show info
                var result = this.showInfoDialog(_('Available Updates'), packages);
				
                if (result) {
                    // now apply updates
                    this.applyAvailableUpdates(packages, skipReboot);
                }
				
            }else if (packages === false) {
                this._serverError(_('Failed to check IRC Update packages or has apply IRC packages error before [message #2101]'));
            }

        },

		
        /**
         * applyAvailableUpdates
         *
         * @param {Object} packages
         */
        applyAvailableUpdates: function(packages, skipReboot) {

            skipReboot = skipReboot || false;
            var isNeedReboot = false;

            var pkgs = [];
            packages.forEach(function(pkg) {
                isNeedReboot |= pkg.reboot;
                pkgs.push(pkg.file) ;
            });

            // log user process
            this.log('FATAL', 'applyAvailableUpdates: ' + pkgs.toString() +'');

            // write prefs to disk and sync
            this.flushPrefs();
			
            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('applyAvailableUpdates');
            var requestUrl = remoteUrl;

            var alertWin = null;
            var result = false;
            try {
                alertWin = this.showProgressDialog(_('Updating Available Updates'));
                result = httpService.requestRemoteService('GET', requestUrl) || false;
            }catch(e) {
                this.log('ERROR', 'Error applyAvailableUpdates', e);
            }finally {
                alertWin.close();
            }
 
            if (result && !skipReboot) {
                if (isNeedReboot) {
                    this.reboot();
                } else {
                    this.restart();
                }
            }else {
                this._serverError(_('Failed to apply IRC Update packages [message #2102]'));
            }
			
			
        },
		
		

        /**
         * flushPrefs to disk and chmod to 0664
         */
        flushPrefs: function() {
            try {
                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
                // mPrefService.readUserPrefs(null);
                mPrefService.savePrefFile(null);
                this.sleep(200);
                
                // chmod to 664
                var prefsjs = GeckoJS.Configure.read('ProfD') + '/prefs.js';
                var nsiPrefs = GREUtils.File.getFile(prefsjs);
                nsiPrefs.permissions = 0664;
                
            }catch(e) {
                this.log('ERROR', 'Error reload prefs.js');
            }
        },


        /**
         * restart
         */
        restart: function() {

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Restart'), _('Updating success') + '\n\n' + _('Please confirm to restart the terminal')) == false) {
                return;
            }

            // log user process
            this.log('FATAL', 'applyAvailableUpdates success and restart');

            try {
                GREUtils.restartApplication();
                window.stop();
                window.close();
            }catch(e) {
                this.log('ERROR', 'Error restart', e);
            }

        },


        /**
         * reboot
         */
        reboot: function() {
        	
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Reboot'), _('Updating success') + '\n\n' + _('Please confirm to reboot the terminal')) == false) {
                return;
            }
            
            // log user process
            this.log('FATAL', 'applyAvailableUpdates success and reboot');

            try {
                goRebootMachine();
                window.stop();
                window.close();
            }catch(e) {
                this.log('ERROR', 'Error reboot', e);
            }
            

        },


        /**
         * removeExpirePackages
         */
        removeExpirePackages: function() {

            var syncSettings = SyncSetting.read();

            var ircExpireDays = syncSettings['irc_expire_days'] || 0;
            
            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('removeExpirePackages');
            var requestUrl = remoteUrl + '/' + ircExpireDays;

            var alertWin = null;
            try {
                alertWin = this.showProgressDialog(_('Removing Exipre IRC Packages'));
                var result = httpService.requestRemoteService('GET', requestUrl) || false;
            }catch(e) {
                this.log('ERROR', 'Error removeExpirePackages', e);
            }finally {
                alertWin.close();
            }


        },
        
		
        /**
         * progress Dialog
         *
         * @param {String} caption
         */
        showProgressDialog : function(caption) {

            var width = 600;
            var height = 140;

            var aURL = 'chrome://viviecr/content/alert_irc_update.xul';
            var aName = _('IRC Dialog');
            var aArguments = {
                type: 'progress',
                caption: caption
            };
				
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width='
            + width + ',height=' + height;

            var win = this.topmostWindow;
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("Vivipos:Main");

            win = mainWindow;

            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var alertWin = GREUtils.Dialog.openWindow(null, aURL, aName,
                aFeatures, aArguments);

            return alertWin;

        },
	

        /**
         * progress Dialog
         *
         * @param {String} caption
         * @param {Array} packages
         */
        showInfoDialog : function(caption, packages) {

            width = 600;
            height = 400;

            var aURL = 'chrome://viviecr/content/alert_irc_update.xul';
            var aName = _('IRC Dialog');
            var aArguments = {
                type: 'info',
                caption: caption,
                packages: packages
            };
			
            var aFeatures = 'chrome,modal,dialog,centerscreen,dependent=yes,resize=no,width='
            + width + ',height=' + height;

            var win = this.topmostWindow;
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator)
            .getMostRecentWindow("Vivipos:Main");

            win = mainWindow;

            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return aArguments.result;

        },
		
		
        /**
         * _serverError
         */
        _serverError : function(message) {

            this.log('ERROR', 'IRC Update error: ' + message);
            
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win, _('IRC Update Error'), message );
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator)
    .getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {

        window.addEventListener('ViviposStartup', function() {
            $do('startup', null, 'Irc');
        }, false);

        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('beforeInitial', function() {
                    main.requestCommand('initial', null, 'Irc');
                });
            }

        }, false);

        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.requestCommand('destroy', null, 'Irc');
            }

        }, false);

    }

})();
