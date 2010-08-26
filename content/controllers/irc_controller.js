(function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

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
                    this.httpServiceIRC.setTimeout(syncSettings.irc_timeout);
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


            // check and flush prefs if previos irc has updated prefs.js
            if(this.isFlushPrefsFlagExists()) {
                this.flushPrefs();
                this.removeFlushPrefsFlag();
            }

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
				
                if (GeckoJS.String.parseBoolean(syncSettings.irc_update_when_signon)) {
                    main.addEventListener('signedOn', function() {
                        self.checkAvailableUpdates();
                    });
                }

                if (GeckoJS.String.parseBoolean(syncSettings.irc_update_when_signoff)) {
                    main.addEventListener('signedOff', function() {
                        self.checkAvailableUpdates();
                    });
                }

                if (GeckoJS.String.parseBoolean(syncSettings.irc_update_when_reboot)) {
                    main.addEventListener('beforeReboot', function() {
                        self.checkAvailableUpdates(true);
                    });
                }

                if (GeckoJS.String.parseBoolean(syncSettings.irc_update_when_shutdown)) {
                    main.addEventListener('beforeShutdown', function() {
                        self.checkAvailableUpdates(true);
                    });
                }

                main.addEventListener('onClearOrderData', function() {
                    self.removeExpirePackages();
                });
				
            }

            // add cart listener
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                if (GeckoJS.String.parseBoolean(syncSettings.irc_update_when_eachsale)) {
                    cart.addEventListener('onSubmitSuccess', function() {
                        self.checkAvailableUpdates();
                    });
                    cart.addEventListener('onCancelSuccess', function() {
                        self.checkAvailableUpdates();
                    });
                    cart.addEventListener('onVoidSaleSuccess', function() {
                        self.checkAvailableUpdates();
                    });
                }                
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

            var syncSettings = SyncSetting.read();
            var workgroup = syncSettings['irc_workgroup'] || '';
            
            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('checkAvailableUpdates');
            var requestUrl = remoteUrl + '/' + workgroup;

            var alertWin = null;
            try {
                alertWin = this.showProgressDialog(_('Checking for Available Updates'));
                var packages = httpService.requestRemoteService('GET', requestUrl);
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
                this._serverError(_('Failed to retrieve IRC update package information. Please ensure that all previous IRC update errors, if any, have been successfully resolved and connection to IRC server is up [message #2101]'));
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

            // chmod
            this.changeDirModes();

            var syncSettings = SyncSetting.read();
            var workgroup = syncSettings['irc_workgroup'] || '';

            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('applyAvailableUpdates');
            var requestUrl = remoteUrl + '/' + workgroup;

            var alertWin = null;
            var result = false;
            try {
                alertWin = this.showProgressDialog(_('Applying Available Updates'));
                result = httpService.requestRemoteService('GET', requestUrl);
            }catch(e) {
                this.log('ERROR', 'Error applyAvailableUpdates', e);
            }finally {
                
                alertWin.close();

                // reload preferences
                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
                mPrefService.readUserPrefs(null);

                this.sleep(200);

                this.createFlushPrefsFlag();

                // chmod
                this.changeDirModes();
            }
 
            if (result && !skipReboot) {
                if (isNeedReboot) {
                    this.reboot();
                } else {
                    this.restart();
                }
            }else {
                this._serverError(_('Failed to apply IRC Update packages [message #2102]'));
                
                remoteUrl = httpService.getRemoteServiceUrl('getLastErrorPackageMessage');
                requestUrl = remoteUrl;

                var result2 = httpService.requestRemoteService('GET', requestUrl) || false;
                
                if (result2) {
                    this.log('ERROR', 'Failed unpack irc package [' + result2['last_error_package'] + '\n' + this.dump(result2['logs']));
                }
            }
			
			
        },
		
		

        /**
         * flushPrefs to disk and chmod to 0664
         */
        flushPrefs: function() {
            try {
                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
                mPrefService.savePrefFile(null);

                var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
                var userJs = profD.clone(); userJs.append('user.js');
                mPrefService.savePrefFile(userJs);

                this.sleep(200);
                
                // chmod to 664
                var prefsjs = GeckoJS.Configure.read('ProfD') + '/prefs.js';
                var nsiPrefs = GREUtils.File.getFile(prefsjs);
                nsiPrefs.permissions = 0664;

                userJs.permissions = 0664;

               
            }catch(e) {
                this.log('ERROR', 'Error reload prefs.js', e);
            }
        },


        changeDirModes: function() {

            try {
                // chown directory
                GeckoJS.File.run('/bin/chown', ['-R', 'root:root', '/data/profile' ], true);
                GeckoJS.File.run('/bin/chown', ['-R', 'root:root', '/data/scripts' ], true);
                GeckoJS.File.run('/bin/chown', ['-R', 'root:root', '/data/databases' ], true);
                GeckoJS.File.run('/bin/chown', ['-R', 'root:root', '/data/images' ], true);

                // chmod directory mode
                GeckoJS.File.run('/bin/chmod', ['-R', 'g+rw', '/data/profile' ], true);
                GeckoJS.File.run('/bin/chmod', ['-R', 'g+rw', '/data/scripts' ], true);
                GeckoJS.File.run('/bin/chmod', ['-R', 'g+rw', '/data/databases' ], true);
                GeckoJS.File.run('/bin/chmod', ['-R', 'g+rw', '/data/images' ], true);
            }catch(e) {
                this.log('ERROR', 'Error changeDirModes', e);
            }

        },

        /**
         * restart
         */
        restart: function() {

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            if (GREUtils.Dialog.confirm(win, _('Restart after Update'), _('Update successful') + '\n\n' + _('Please confirm to restart the terminal')) == false) {
                return;
            }

            // log user process
            this.log('FATAL', 'applyAvailableUpdates success and restart');

            try {
                GREUtils.restartApplication();
                window.stop();
                window.close();

                this.sleep(1000);
            }catch(e) {
                this.log('ERROR', 'Error restart', e);
            }
        },


        /**
         * reboot
         */
        reboot: function() {
        	
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Reboot after Update'), _('Update successful') + '\n\n' + _('Please confirm to reboot the terminal')) == false) {
                return;
            }
            
            // log user process
            this.log('FATAL', 'applyAvailableUpdates success and reboot');

            try {
                goRebootMachine();
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
                alertWin = this.showProgressDialog(_('Removing Exipred IRC Packages'));
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

            var win = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName,
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
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return aArguments.result;

        },

        createFlushPrefsFlag: function() {

            var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
            var flag = profD.clone(); flag.append('.flush_prefsjs');

            if (flag.exists()) return true;

            try {
                flag.create(flag.NORMAL_FILE_TYPE, 0644);
            }catch(e) {
                this.log('ERROR', 'Can not create .flush_prefsjs file', e);
                return false;
            }

            return true;

        },

        removeFlushPrefsFlag: function() {

            var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
            var flag = profD.clone(); flag.append('.flush_prefsjs');

            if (!flag.exists()) return true;

            try {
                flag.remove(false);
            }catch(e) {
                this.log('ERROR', 'Can not remove .flush_prefsjs file', e);
                return false;
            }

            return true;

        },

        isFlushPrefsFlagExists: function() {

            var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
            var flag = profD.clone(); flag.append('.flush_prefsjs');

            return flag.exists();

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

    AppController.extend(__controller__);

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
