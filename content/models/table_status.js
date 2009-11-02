(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        hasMany: ['TableBooking', 'TableOrder'],

        behaviors: ['Training'], // for local use when connect master fail...

        lastModified: 0,

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setForce(true);
                    this.httpService.setController('table_status');
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
        getTablesStatus: function(useDb) {

            useDb = useDb || false;

            var tables_status = null;

            if (!useDb) {
                tables_status = GeckoJS.Session.get('tablesStatus');
            }

            if (tables_status == null) {

                var lastModified = GeckoJS.Session.get('tablesStatusLastmodified') || 0;

                var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTablesStatus') ;
                var requestUrl = remoteUrl + '/' + lastModified ;
                // tables_status = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
                let tables_status_response = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
                tables_status = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(tables_status_response)));
                
                this.setTablesStatusToSession(tables_status);
                
            }

            return tables_status;

        },

        /**
         * rebuild table status
         *
         * @return {Boolean} success
         */
        rebuildTableStatus: function(){

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('rebuildTableStatus') ;
            var requestUrl = remoteUrl ;
            var success = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || false ;

            return success;

        },

        /**
         * set tables to sessions and cached by id , region
         *
         * @return {Array} tables
         */
        setTablesStatusToSession: function(tables_status) {

            if(!tables_status || tables_status.length == 0) return false;
            
            // let tablesStatus = GeckoJS.Session.get('tablesStatus') ||  {};
            let tablesStatusByRegion = GeckoJS.Session.get('tablesStatusByRegion') || {};
            let tablesStatusById = GeckoJS.Session.get('tablesStatusById') || {};
            let tablesStatusByNo = GeckoJS.Session.get('tablesStatusByNo') || {};
            let lastModified = GeckoJS.Session.get('tablesStatusLastmodified') || 0;

            try {

                tables_status.forEach(function(status) {

                    let id = status.Table.id;
                    let no = status.Table.table_no;
                    let rid = status.Table.table_region_id;

                    lastModified = (status.TableStatus.modified > lastModified) ? status.TableStatus.modified : lastModified ;

                    if (id) {
                        tablesStatusById[id] = status;
                    }

                    if (no) {
                        tablesStatusByNo[no] = status;
                    }

                    if(rid) {
                        if(!tablesStatusByRegion[rid]) {
                            tablesStatusByRegion[rid] = [];
                        }
                        tablesStatusByRegion[rid].push(status);
                    }

                }, this);


            }catch(e) {
                dump(e);
            }

            let tablesStatus = GeckoJS.Array.objectExtract(tablesStatusByNo, '{s}') ;

            GeckoJS.Session.add('tablesStatusLastmodified', lastModified);
            GeckoJS.Session.add('tablesStatus', tablesStatus);
            
            GeckoJS.Session.add('tablesStatusByRegion', tablesStatusByRegion);
            GeckoJS.Session.add('tablesStatusById', tablesStatusById);
            GeckoJS.Session.add('tablesStatusByNo', tablesStatusByNo);

            return true;
        },


        /**
         *
         */
        getTablesStatusById: function (useDb) {
            useDb = useDb || false;

            var tablesStatus = null;

            if (!useDb) {
                tablesStatus = GeckoJS.Session.get('tablesStatusById');
            }

            if (tablesStatus == null) {
                this.getTablesStatus(true);
                tablesStatus = GeckoJS.Session.get('tablesStatusById') || {};
            }

            return tablesStatus;
        },


        /**
         *
         */
        getTablesStatusByNo: function (useDb) {
            useDb = useDb || false;

            var tablesStatus = null;

            if (!useDb) {
                tablesStatus = GeckoJS.Session.get('tablesStatusByNo');
            }

            if (tablesStatus == null) {
                this.getTablesStatus(true);
                tablesStatus = GeckoJS.Session.get('tablesStatusByNo') || {};
            }

            return tablesStatus;
        },


        /**
         *
         */
        getTablesStatusByRegion: function (useDb) {
            useDb = useDb || false;

            var tablesStatus = null;

            if (!useDb) {
                tablesStatus = GeckoJS.Session.get('tablesStatusByRegion');
            }

            if (tablesStatus == null) {
                this.getTables(true);
                tablesStatus = GeckoJS.Session.get('tablesStatusByRegion') || [];
            }

            return tablesStatus;
        },


        /**
         *
         */
        getTableStatusById: function(id, useDb) {

            var tablesStatus = this.getTablesStatusById(useDb);

            return tablesStatus[id] || null;

        },


        /**
         *
         */
        getTableStatusByNo: function(no, useDb) {

            var tablesStatus = this.getTablesStatusByNo(useDb);

            return tablesStatus[no] || null;

        },


        /**
         *
         */
        getTablesStatusByRegionId: function(regionId, useDb) {

            var tablesStatus = this.getTablesStatusByRegion(useDb);

            return tablesStatus[regionId] || [] ;

        },


        /**
         * mergeTable
         */
        mergeTable: function(masterTableId, slaveTableId) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('mergeTable') ;
            var requestUrl = remoteUrl + '/' + masterTableId + '/' + slaveTableId;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        },

        /**
         * unmergeTable
         */
        unmergeTable: function(tableId) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('unmergeTable') ;
            var requestUrl = remoteUrl + '/' + tableId ;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        },


       /**
         * markTable
         */
        markTable: function(tableId, markId, clerk, expire) {

            expire = expire || 0;
            var remoteUrl = this.getHttpService().getRemoteServiceUrl('markTable') ;
            var requestUrl = remoteUrl + '/' + tableId + '/' + markId + '/' + encodeURIComponent(clerk) +'/'+expire;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        },

        /**
         * unmergeTable
         */
        unmarkTable: function(tableId) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('unmarkTable') ;
            var requestUrl = remoteUrl + '/' + tableId ;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        },

       /**
         * markRegion
         */
        markRegion: function(regionId, markId, clerk) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('markRegion') ;
            var requestUrl = remoteUrl + '/' + regionId + '/' + markId + '/' + encodeURIComponent(clerk);

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        },

        /**
         * unmergeTable
         */
        unmarkRegion: function(regionId) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('unmarkRegion') ;
            var requestUrl = remoteUrl + '/' + regionId ;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            return result;
        }

    };

    var TableStatusModel = window.TableStatusModel = AppModel.extend(__model__);

})();
