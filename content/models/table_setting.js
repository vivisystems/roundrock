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

        /**
         * get Table Settings
         * 
         * Table Settings is special case:
         * each clients own settings of self, but can load master settings.
         * 
         * @param {Boolean} useDb   force use db or cached settings.
         * @param {Boolean} useRemote   force use remote or local settings
         */
        getTableSettings: function(useDb, useRemote) {

            useDb = useDb || false;
            useRemote = useRemote || false;

            var table_settings = null;

            if (!useDb) {
                table_settings = GeckoJS.Session.get('table_settings');
            }

            if (table_settings == null) {

                if (this.isRemoteService() && useRemote) {
                    var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTableSettings');
                    var requestUrl = remoteUrl ;
                    table_settings = this.getHttpService().requestRemoteService('GET', requestUrl) || null ;

                    if (table_settings) {
                        table_settings = this.setTableSettingsToSession(table_settings);
                        // save tables to database;
                        this.saveTableSettings(table_settings);
                    }

                }else {
                    table_settings = this.find('all', {recursive: 0});
                    if (table_settings) {
                        table_settings = this.setTableSettingsToSession(table_settings);
                    }
                }
            }

            return table_settings;

        },

        /**
         * save table settings to local.
         */
        saveTableSettings: function(table_settings) {

            if (!table_settings) return false;

            var r = false;

            r = this.begin();

            if (r) {

                // remove all local tables
                var datasource = this.getDataSource();
                datasource.executeSimpleSQL("DELETE FROM " + this.table);

                // save all not update timestamp
                for (var s in table_settings) {
                    this.id = s ;
                    this.save({id: s, value:table_settings[s]}); 
                }

                r = this.commit();
            }

            return r;

        },

        setTableSettingsToSession: function(table_settings) {
            let hashedSettings = {};
            table_settings.forEach(function(s) {
                hashedSettings[s.TableSetting.id] = s.TableSetting.value;
            });
            GeckoJS.Session.add('table_settings', hashedSettings);
            return hashedSettings;
        }


    });
} )();
