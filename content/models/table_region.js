( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableRegionModel = window.TableRegionModel = AppModel.extend({
        name: 'TableRegion',

        useDbConfig: 'table',

    //    hasMany: ['Table'],

        behaviors: ['Sync', 'Training'],

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setController('table_regions');
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },

        getTableRegions: function(useDb) {

            useDb = useDb || false;

            var table_regions = null;

            if (!useDb) {
                table_regions = GeckoJS.Session.get('table_regions');
            }

            if (table_regions == null) {

                if (this.isRemoteService()) {
                    var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTableRegions');
                    var requestUrl = remoteUrl ;
                    table_regions = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
                    // update tables to database;
                    this.updateRemoteTableRegions(table_regions);
                }else {
                    table_regions = this.find('all', {recursive: 0});
                }

                if (table_regions != null) {
                    GeckoJS.Session.add('tables', table_regions);
                }
            }

            return table_regions;

        },

        updateRemoteTableRegions: function(table_regions) {

            if (!table_regions) return false;

            var r = false;

            r = this.begin();


            if (r) {

                // remove all local tables
                var datasource = this.getDataSource();
                datasource.executeSimpleSQL("DELETE FROM " + this.table);

                // save all not update timestamp
                this.saveAll(table_regions, false);

                r = this.commit();
            }

            this.log('r = ' + r) ;
            return r;

        }

    });
} )();
