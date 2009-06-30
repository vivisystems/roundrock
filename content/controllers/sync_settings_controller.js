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
                GREUtils.Dialog.alert(this.topmostWindow, _('Synchronization Settings'),
                                      _('Terminal number must only contain [a-zA-Z] and [0-9]'));
                data.cancel = true;
            }
            else {
                data.changed = this.Form.isFormModified('syncSettingForm');
            }
        },
        
        save: function(data) {
		
            var obj = this.Form.serializeToObject('syncSettingForm', false);

            // change boolean to integer
            for (var k in obj) {
                if(typeof obj[k] == 'boolean') {
                    obj[k] = obj[k] ? 1 : 0 ;
                }
            }

            (new SyncSetting()).save(obj);

            // restart sync_client
            try {
                var syncClientScript = new GeckoJS.File('/etc/init.d/sync_client');
                if (syncClientScript.exists()) {
                    syncClientScript.run(['restart'], true); // no arguments and blocking.
                }
                delete syncClientScript;
                syncClientScript = null;
            }catch(e) {
            }
		
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();
