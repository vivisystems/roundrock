(function(){

    var __controller__ = {
        
        name: 'SyncSettings',

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

            this.Form.unserializeFromObject('syncSettingForm', settings);
        },

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9]/;
            return !nonalphaRE.test(str);
        },

        validateForm: function(data) {

            var obj = this.Form.serializeToObject('syncSettingForm', false);

            // make sure terminal_no is alphanumeric only
            if (!this.isAlphaNumeric(obj['machine_id'])) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Network Service Settings'),
                                      _('Terminal number must only contain [a-zA-Z] and [0-9]'));
                data.cancel = true;
            }
            else {
                data.changed = this.Form.isFormModified('syncSettingForm');
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
		
            OsdUtils.info(_('Network service settings saved'));
        },

        exit: function() {
            
            if (this.Form.isFormModified('syncSettingForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
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
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
