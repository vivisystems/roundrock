(function(){

    /**
     * SyncSettings Controller
     */

    GeckoJS.Controller.extend( {
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

    });

})();

