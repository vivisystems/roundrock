( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableRegionModel = window.TableRegionModel = AppModel.extend({
        name: 'TableRegion',

        useDbConfig: 'table',

    //    hasMany: ['Table'],

        behaviors: ['Training'],

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

                    // extractObject
                    table_regions = GeckoJS.Array.objectExtract(table_regions, "{n}.TableRegion");

                    // update tables to local database;
                    this.saveTableRegions(table_regions);
                }else {
                    table_regions = this.find('all', {recursive: 0, order: 'name asc'});

                    // extractObject
                    table_regions = GeckoJS.Array.objectExtract(table_regions, "{n}.TableRegion");
                }

                if (table_regions != null) {
                    GeckoJS.Session.add('table_regions', table_regions);
                }
            }

            return table_regions;

        },

        addTableRegion: function(data) {
           // XXX need to check duplicate
           this.create();
           var result = this.save(data);

           return result;
        },

        updateTableRegion: function(id, data) {

            this.id = id;
            var result = this.save(data);

            return result;
        },

        removeTableRegion: function(id) {
            // XXX need to check is tables in this region.
           var result = this.remove(id);

           return result;
        },

        saveTableRegions: function(table_regions) {

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

            return r;

        }

    });
} )();
