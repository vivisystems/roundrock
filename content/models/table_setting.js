( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableSettingModel = window.TableSettingModel = AppModel.extend({
        name: 'TableSetting',

        useDbConfig: 'table',

        behaviors: ['Training'],

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setController('table_settings');
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },

        getTableSettings: function(useDb) {

            useDb = useDb || false;

            var table_settings = null;

            if (!useDb) {
                table_settings = GeckoJS.Session.get('table_settings');
            }

            if (table_settings == null) {

                if (this.isRemoteService()) {
                    var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTableSettings');
                    var requestUrl = remoteUrl ;
                    table_settings = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
                    // update tables to database;
                    this.updateRemoteTableSettings(table_settings);
                }else {
                    table_settings = this.find('all', {recursive: 0});
                }

                if (table_settings != null) {
                    return this.setTableSettingsToSession(table_settings);
                }
            }

            return table_settings;

        },

        /**
         * Update remove table settings to local.
         */
        updateRemoteTableSettings: function(table_settings) {

            if (!table_settings) return false;

            var r = false;

            r = this.begin();


            if (r) {

                // remove all local tables
                var datasource = this.getDataSource();
                datasource.executeSimpleSQL("DELETE FROM " + this.table);

                // save all not update timestamp
                this.saveAll(table_settings, false);

                r = this.commit();
            }

            this.log('r = ' + r) ;
            return r;

        },

        setTableSettingsToSession: function(table_settings) {
            let hashedSettings = {};
            table_settings.forEach(function(s) {
                hashedSettings[s.key] = s.value;
            });
            GeckoJS.Session.add('table_settings', hashedSettings);
            return hashedSettings;
        }


    });
} )();
