( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'Table',

        useDbConfig: 'table',

        belongsTo: ['TableRegion'],

        hasOne: [{name: 'TableStatus', 'primaryKey': 'table_no', 'foreignKey': 'table_no'}],
        // hasOne: ['TableStatus'],
        
        hasMany: ['TableBooking'],

        behaviors: ['Training'],

        lastModified: 0,
        
        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setController('tables');
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },

        getTables: function(useDb) {

            useDb = useDb || false;

            var tables = null;

            if (!useDb) {
                tables = GeckoJS.Session.get('tables');
            }

            if (tables == null) {

                if (this.isRemoteService()) {
                    var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTables');
                    var requestUrl = remoteUrl ;
                    tables = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;

                    // extractObject
                    tables = GeckoJS.Array.objectExtract(tables, "{n}.Table");

                    // update tables to database;
                    this.saveTables(tables);
                }else {
                    tables = this.find('all', {recursive: 0, order: 'table_no asc'});

                    // extractObject
                    tables = GeckoJS.Array.objectExtract(tables, "{n}.Table");
                }

                this.setTablesToSession(tables);
            }

            return tables;

        },

        /**
         * set tables to sessions and cached by id , region
         *
         * @return {Array} tables
         */
        setTablesToSession: function(tables) {
            
            if(!tables) return null;

            GeckoJS.Session.add('tables', tables);

            return tables;
        },

        saveTables: function(tables) {

            if (!tables) return false;

            var r = false;

            r = this.begin();


            if (r) {

                // remove all local tables
                var datasource = this.getDataSource();
                datasource.executeSimpleSQL("DELETE FROM " + this.table);

                // save all not update timestamp
                this.saveAll(tables, false);
                
                r = this.commit();
            }

            return r;

        },


        addTable: function(data) {

            let table_no = data.table_no;
            if(!table_no || table_no.length == 0) return false;

            let count = this.find('count', {conditions: "table_no='"+table_no+"'"});

            if(count>0) return false;

            this.create();

            let result = this.save(data);

            return result;

        },



        updateTable: function(id, data) {

            this.id = id;
            var result = this.save(data);

            return result;

        },


        removeTable: function(id) {

            var result = this.remove(id);
            
            return result;
        },


        toggleTable: function(id) {

            let table = this.find('first', {conditions: "id='"+id+"'", recursive:0});
            if (table) {
                this.id = id;
                var data = {active: !table.active};
                return this.save(data);
            } else {
                return false;
            }

        },


        getTableById: function(id, useDb) {

            useDb = useDb || false;

            var tables = this.getTables(useDb);

            var aqTables = new GeckoJS.ArrayQuery(tables);

            var result = aqTables.filter("id='"+id+"'");

            return (result.length > 0) ? result[0] : null;

        },

        getTableByNo: function(no, useDb) {

            useDb = useDb || false;

            var tables = this.getTables(useDb);

            var aqTables = new GeckoJS.ArrayQuery(tables);

            var result = aqTables.filter("table_no='"+no+"'");

            return (result.length > 0) ? result[0] : null;

        },

        getTablesByRegionId: function(regionId, useDb) {

            useDb = useDb || false;

            var tables = this.getTables(useDb);

            var aqTables = new GeckoJS.ArrayQuery(tables);

            var result = aqTables.filter("table_region_id='"+regionId+"'");
            
            return result;

        }

    };


    var TableModel = window.TableModel = AppModel.extend(__model__);

} )();
