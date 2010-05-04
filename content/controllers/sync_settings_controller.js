(function(){

    var __controller__ = {
        
        name: 'SyncSettings',

        ircModules: {},

        ircPackages: [],

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


        // initial SyncSettings
        initial: function (warn) {

            if (warn == null) warn = true;
		
            var settings = (new SyncSetting()).read();

            if (settings == null) {
                settings = {};
            }

            settings.machine_id = settings.machine_id || GeckoJS.Session.get('terminal_no');
            settings.active = GeckoJS.String.parseBoolean(settings.active);
            settings.advance_sale_period = GeckoJS.String.parseBoolean(settings.advance_sale_period);
            settings.table_active = GeckoJS.String.parseBoolean(settings.table_active);
            settings.pull_order = GeckoJS.String.parseBoolean(settings.pull_order);
            settings.irc_update_when_signon = GeckoJS.String.parseBoolean(settings.irc_update_when_signon);
            settings.irc_update_when_signoff = GeckoJS.String.parseBoolean(settings.irc_update_when_signoff);
            settings.irc_update_when_reboot = GeckoJS.String.parseBoolean(settings.irc_update_when_reboot);
            settings.irc_update_when_shutdown = GeckoJS.String.parseBoolean(settings.irc_update_when_shutdown);
            settings.irc_update_when_eachsale = GeckoJS.String.parseBoolean(settings.irc_update_when_eachsale);

            this.Form.unserializeFromObject('syncSettingForm', settings);

            this.initialIrcModules();
        },

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9]/;
            return !nonalphaRE.test(str);
        },

        validateForm: function(data) {

            var obj = this.Form.serializeToObject('syncSettingForm', false);

            // make sure terminal_no is alphanumeric only
            if (!this.isAlphaNumeric(obj['machine_id']) || obj['machine_id'].length==0) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Network Service Settings'),
                    _('Terminal number must only contain [a-zA-Z] and [0-9]'));
                data.cancel = true;
            }
            else {
                data.changed = this.Form.isFormModified('syncSettingForm');
            }
        },

        onSelectTab: function(tabItem) {
            let id = tabItem ? tabItem.id : '';
            switch (id) {
                default:
                    $('#save').attr({hidden: 'false'});
                    break;
                case 'irc-tab':
                    $('#save').attr({hidden: 'true'});
                    this.initialIrcLists();
                    break;
            }
        },
        
        save: function() {

            var data = {
                cancel: false,
                changed: false
            };

            $do('validateForm', data, 'SyncSettings');

            if (data.changed) {
                var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);
                if (GREUtils.Dialog.confirm(topwin, _('confirm network service settings change'),
                    _('Network service settings changes require system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                    )) {

                    this.update();

                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                NotifyUtils.warn(_('No changes to save'));
            }
            return !data.cancel;
        },

        update: function() {
		
            var obj = this.Form.serializeToObject('syncSettingForm', false);
            this.Form.unserializeFromObject('syncSettingForm', obj);

            // change boolean to integer
            for (var k in obj) {
                if(typeof obj[k] == 'boolean') {
                    obj[k] = obj[k] ? 1 : 0 ;
                }
            }

            (new SyncSetting()).save(obj);

            // update store contact as well
            var storeContact = GeckoJS.Session.get('storeContact');
            if (storeContact && storeContact.id) {
                storeContact.terminal_no = obj.machine_id;
                var storeContactModel = new StoreContactModel();
                storeContactModel.id = storeContact.id;
                storeContactModel.save(storeContact);
            }

            try {

                var ntpConf = new GeckoJS.File('/etc/ntp.conf');
                ntpConf.open("r");
                var ntpBuf = ntpConf.read();
                ntpConf.close();

                // token  # VIVIPOS MASTER SERVER START   # VIVIPOS END
                var t1 = ntpBuf.split('# VIVIPOS MASTER SERVER START');
                var t2 = t1[1].split('# VIVIPOS END');

                var ntp_server = '';
                if (obj.ntp_hostname != '127.0.0.1' && obj.ntp_hostname != 'localhost') {
                    ntp_server = 'server ' + obj.ntp_hostname + '\n' + 'fudge ' + obj.ntp_hostname + ' stratum 7';
                }

                ntpConf.open("w");
                ntpConf.write(t1[0] + '# VIVIPOS MASTER SERVER START\n' + ntp_server +'\n' + '# VIVIPOS END\n' + t2[1] );
                ntpConf.close();

            }catch(e){
                
            }

            // restart sync_client
            GeckoJS.File.run('/etc/init.d/sync_client', ['restart'], true);
            // restart ntp
            GeckoJS.File.run('/etc/init.d/ntp', ['restart'], true);
            // start rdate
            GeckoJS.File.run('/etc/init.d/rdate', ['start'], true);

            OsdUtils.info(_('Network service settings saved'));
        },

        exit: function() {
            
            if (this.Form.isFormModified('syncSettingForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Components.interfaces.nsIPromptService);
                var check = {
                    data: false
                };
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                    _('Exit'),
                    _('You have made changes to network service settings. Save changes before exiting?'),
                    flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.save()) return;
                }
            }
            window.close();
        },


        initialIrcModules: function(){

            var ircModulePrefs = GeckoJS.Configure.read('vivipos.fec.irc.modules') || {};
            var ircModules = this.ircModules = {};

            for (let key in ircModulePrefs) {

                let l10nLabel = "";
                let pref = ircModulePrefs[key];
                let name = pref.name;
                let label = pref.label;
                let l10nKey = 'vivipos.fec.irc.modules' + '.' + key;

                // get l10n label
                if (label.indexOf('chrome://') == 0) {
                    l10nLabel = GeckoJS.StringBundle.getPrefLocalizedString(l10nKey+'.label') || name;
                } else {
                    l10nLabel = _(label);
                }

                ircModules[name] = {key: key, name: name, label: l10nLabel};

            }

            var ircModulesObj = document.getElementById('ircModules');
            ircModulesObj.datasource = GeckoJS.BaseObject.getValues(ircModules);

        },


        initialIrcLists: function() {

            var httpService = this.getHttpServiceIRC();
            
            var remoteUrl = httpService.getRemoteServiceUrl('getPackages');
            var requestUrl = remoteUrl;
            var packages = httpService.requestRemoteService('GET', requestUrl) || [] ;

            // sort packages by file name
            packages = packages.sort(function(p1, p2) {return p1.file > p2.file});

            // update package size to human readable format
            packages.forEach(function(pkg) {
                pkg.filesize = GeckoJS.NumberHelper.toReadableSize(pkg.filesize);
            });
            
            this.ircPackages = packages;
            document.getElementById('ircPackagesTree').datasource = packages;

            $('#ircRemovePackage').attr({disabled: 'true'});
            $('#ircRefreshPackage').attr({disabled: 'true'});

            document.getElementById('ircPackagesTree').selectedIndex = -1;
            document.getElementById('ircPackagesTree').currentIndex = -1;
            document.getElementById('ircPackagesTree').selectedItems = [];
            document.getElementById('ircPackagesTree').selection.select(-1);

            this.Form.reset('ircDetail');

        },

        updatePackageClientList: function(ircPackage) {
            let clients = [];
            if (ircPackage) {
                for (var i in ircPackage.status) {
                    let status = ircPackage.status[i];
                    let downloaded = '';
                    let updated = '';
                    if (status.downloaded) {
                        downloaded = (new Date(status.downloaded*1000)).toLocaleDateString();
                    }
                    if (status.updated) {
                        updated = (new Date(status.updated*1000)).toLocaleDateString();
                    }
                    clients.push({machine_id: status.machine_id, downloaded: downloaded, updated: updated});
                }
            }
            clients.sort(function(a,b) {return a.machine_id > b.machine_id});
            document.getElementById('ircDetailClientsTree').datasource = clients;

        },

        refreshSelectedIrcPackage: function(noNotify) {

            var index = document.getElementById('ircPackagesTree').selectedIndex;

            if (index < 0) return false ;

            var ircPackage = this.ircPackages[index] || false;
            if (ircPackage) {
                // try refresh package status
                var httpService = this.getHttpServiceIRC();
                var remoteUrl = httpService.getRemoteServiceUrl('getPackage');
                var requestUrl = remoteUrl + "/" + ircPackage['file'];
                var newPackageStatus = httpService.requestRemoteService('GET', requestUrl) || false ;

                if (newPackageStatus) {
                    // update package size to human readable format
                    newPackageStatus.filesize = GeckoJS.NumberHelper.toReadableSize(newPackageStatus.filesize);

                    this.ircPackages[index] = ircPackage = newPackageStatus;
                    this.updatePackageClientList(ircPackage);
                }
            }
            else {
                this.updatePackageClientList();
            }
            if (!noNotify) NotifyUtils.info(_('Package client list refreshed'));
            
        },
        
        onSelectIrcPackage: function(index) {

            if (index < 0) return false ;

            // refresh first
            this.refreshSelectedIrcPackage(true);
            
            var ircPackage = this.ircPackages[index] || false;
            if (!ircPackage) return false;

            let data = GREUtils.extend({}, ircPackage);

            data.activation = (new Date(ircPackage.activation*1000)).toLocaleString();
            data.module_labels = ircPackage.module_labels.split(",").join("\n");

            this.Form.reset('ircDetail');
            this.Form.unserializeFromObject('ircDetail', data);           

            $('#ircRemovePackage').attr({disabled: 'false'});
            $('#ircRefreshPackage').attr({disabled: 'false'});

            
        },

        createIrcPackage: function(submit) {

            submit = submit || false;

            // cancel process
            if (!submit) {
                // disable ui buttons
                $('#irc-edit-tabs')[0].selectedIndex = 1;
                $('#ircCreatePackage').attr({disabled: 'true'});
                $('#ircRemovePackage').attr({disabled: 'true'});
                $('#ircRefreshPackage').attr({disabled: 'true'});
                $('#irc-detail-tab').attr({disabled: 'true'});
                $('#irc-edit-tab').attr({disabled: 'false'});

                $('#basic-tab').attr({disabled: 'true'});
                $('#advanced-tab').attr({disabled: 'true'});
                $('#services-tab').attr({disabled: 'true'});

                this.Form.reset('ircEdit');

                // set activation time to current time
                document.getElementById('activation').value = new Date().getTime();

                return ;
            }

            var datas = this.Form.serializeToObject('ircEdit');

            // process selected irc modules to module name array
            var ircModulesObj = document.getElementById('ircModules');
            var ircModules = GeckoJS.BaseObject.getValues(this.ircModules);
            var selectedModules = [];
            var selectedModuleLabels = [];
            for (var i in ircModulesObj.selectedItems) {
                selectedModules.push(ircModules[ircModulesObj.selectedItems[i]].name);
                selectedModuleLabels.push(ircModules[ircModulesObj.selectedItems[i]].label);
            }

            if (selectedModules.length == 0) {
                NotifyUtils.warn(_('Please select one or more modules to synchronize'));
                return false;
            }

            datas.modules = selectedModules.join(",");
            datas.module_labels = selectedModuleLabels.join(",");

            // convert javascript ms to sec
            datas.activation = Math.floor(datas.activation/1000);

            var query_string = GeckoJS.String.httpBuildQuery(datas);

            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('createPackage');
            var requestUrl = remoteUrl + '/?' + query_string;

            var waitPanel = document.getElementById('wait_panel');
            document.getElementById('wait_caption').setAttribute('label', _('Creating IRC Package'));
            waitPanel.openPopupAtScreen(0, 0);

            // chmod before create packages
            this.changeDirModes();

            var success = httpService.requestRemoteService('GET', requestUrl) || false ;

            waitPanel.hidePopup();
            
            if (success) {
                OsdUtils.info(_('Package [%S] created successfully', [success]));
            }else {
                NotifyUtils.warn(_('Failed to create IRC Package'));
            }

            this.initialIrcLists();
            
            // enable ui buttons
            this.cancelCreateIrcPackage();


        },

        cancelCreateIrcPackage: function() {

                document.getElementById('ircPackagesTree').selectedIndex = -1;
                document.getElementById('ircPackagesTree').currentIndex = -1;
                document.getElementById('ircPackagesTree').selectedItems = [];
                document.getElementById('ircPackagesTree').selection.select(-1);

                // enable ui buttons
                $('#irc-edit-tabs')[0].selectedIndex = 0;
                $('#ircCreatePackage').attr({disabled: 'false'});
                $('#irc-detail-tab').attr({disabled: 'false'});
                $('#irc-edit-tab').attr({disabled: 'true'});
                $('#ircRemovePackage').attr({disabled: 'true'});
                $('#ircRefreshPackage').attr({disabled: 'true'});

                $('#basic-tab').attr({disabled: 'false'});
                $('#advanced-tab').attr({disabled: 'false'});
                $('#services-tab').attr({disabled: 'false'});

                return ;
        },


        removeIrcPackage: function(index) {

            if (index < 0) return false ;

            var ircPackage = this.ircPackages[index] || false;
            if (!ircPackage) return false;

            var file = ircPackage.file;

            var httpService = this.getHttpServiceIRC();

            var remoteUrl = httpService.getRemoteServiceUrl('removePackage');
            var requestUrl = remoteUrl + '/' + file;

            var success = httpService.requestRemoteService('GET', requestUrl) || false ;

            this.initialIrcLists();

            this.updatePackageClientList();

            if (success) {
                OsdUtils.info(_('Package [%S] removed successfully', [file]));
            }else {
                NotifyUtils.warn(_('Package not available to remove.'));
            }

            // enable ui buttons
            this.cancelCreateIrcPackage();

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
                this.log('ERROR', 'Error changeDirModes');
            }
        }



    };

    GeckoJS.Controller.extend(__controller__);

})();
