( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'Table',

        useDbConfig: 'table',

        belongsTo: ['TableRegion'],

        hasOne: ['TableStatus'],
        
        hasMany: ['TableBooking','TableOrder'],

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


        /**
         *
         */
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
                    // this.saveTables(tables);
                }else {
                    tables = this.find('all', {
                        recursive: 0,
                        order: 'table_no asc'
                    });

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

            let tablesByRegion = {};
            let tablesById = {};
            let tablesByNo = {};

            tables.forEach(function(table) {
                let id = table.id;
                let no = table.table_no;
                let rid = table.table_region_id;

                if (id) {
                    tablesById[id] = table;
                }

                if (no) {
                    tablesByNo[no] = table;
                }

                if(rid) {
                    if(!tablesByRegion[rid]) {
                        tablesByRegion[rid] = [];
                    }
                    tablesByRegion[rid].push(table);
                }

            }, this);

            GeckoJS.Session.add('tables', tables);
            GeckoJS.Session.add('tablesByRegion', tablesByRegion);
            GeckoJS.Session.add('tablesById', tablesById);
            GeckoJS.Session.add('tablesByNo', tablesByNo);

            return tables;
        },


        /**
         * 
         */
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


        /**
         * 
         */
        addTable: function(data) {

            let table_no = data.table_no;
            if(!table_no || table_no.length == 0) return false;

            let count = this.find('count', {
                conditions: "table_no='"+table_no+"'"
                });

            if(count>0) return false;

            this.create();

            let result = this.save(data);

            return result;

        },


        /**
         * 
         */
        updateTable: function(id, data) {

            this.id = id;
            var result = this.save(data);

            return result;

        },


        /**
         * 
         */
        removeTable: function(id) {

            var result = this.remove(id);
            
            return result;
        },


        /**
         * 
         */
        toggleTable: function(id) {

            let table = this.find('first', {
                conditions: "id='"+id+"'",
                recursive:0
            });
            if (table) {
                this.id = id;
                var data = {
                    active: !table.active
                    };
                return this.save(data);
            } else {
                return false;
            }

        },


        /**
         * 
         */
       getTablesById: function (useDb) {
            useDb = useDb || false;

            var tables = null;

            if (!useDb) {
                tables = GeckoJS.Session.get('tablesById');
            }

            if (tables == null) {
               this.getTables(true);
               tables = GeckoJS.Session.get('tablesById');
            }

            return tables;
        },


        /**
         * 
         */
        getTablesByNo: function (useDb) {
            useDb = useDb || false;

            var tables = null;

            if (!useDb) {
                tables = GeckoJS.Session.get('tablesByNo');
            }

            if (tables == null) {
               this.getTables(true);
               tables = GeckoJS.Session.get('tablesByNo');
            }

            return tables;
        },


        /**
         * 
         */
        getTablesByRegion: function (useDb) {
           useDb = useDb || false;

            var tables = null;

            if (!useDb) {
                tables = GeckoJS.Session.get('tablesByRegion');
            }

            if (tables == null) {
               this.getTables(true);
               tables = GeckoJS.Session.get('tablesByRegion');
            }

            return tables;
        },


        /**
         * 
         */
        getTableById: function(id, useDb) {

            var tables = this.getTablesById(useDb);

            return tables[id] || null;

        },


        /**
         * 
         */
        getTableByNo: function(no, useDb) {

            var tables = this.getTablesByNo(useDb);

            return tables[no] || null;

        },

    
        /**
         * 
         */
        getTablesByRegionId: function(regionId, useDb) {

            var tables = this.getTablesByRegion(useDb);

            return tables[regionId] || [] ;

        }

    };


    var TableModel = window.TableModel = AppModel.extend(__model__);

} )();
