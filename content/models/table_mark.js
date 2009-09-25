( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableMarkModel = window.TableMarkModel = AppModel.extend({

        name: 'TableMark',

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
                    this.httpService.setController('table_marks');
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },

        getTableMarks: function(useDb) {

            useDb = useDb || false;

            var table_marks = null;

            if (!useDb) {
                table_marks = GeckoJS.Session.get('table_marks');
            }

            if (table_marks == null) {

                if (this.isRemoteService()) {
                    var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTableMarks');
                    var requestUrl = remoteUrl ;
                    table_marks = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;

                    if (table_marks) {
                        table_marks = this.setTableMarksToSession(table_marks);
                        // save tables to database;
                        this.saveTableMarks(table_marks);
                    }

                }else {
                    table_marks = this.find('all', {recursive: 0});
                    if (table_marks) {
                        table_marks = this.setTableMarksToSession(table_marks);
                    }
                }
            }
            return table_marks;

        },

        addTableMark: function(data) {

           // XXX need to check duplicate           
           this.create();
           var result = this.save(data);

           return result;
           
        },

        updateTableMark: function(id, data) {
            
            this.id = id;
            var result = this.save(data);

            return result;
        },

        removeTableMark: function(id) {
            // XXX need to check is tables in this region.
           var result = this.remove(id);

           return result;
        },

        /**
         * save table settings to local.
         */
        saveTableMarks: function(table_marks) {

            if (!table_marks) return false;

            var r = false;

            // XXX check lastmodified
            
            r = this.begin();

            if (r) {

                // remove all local tables
                var datasource = this.getDataSource();
                datasource.executeSimpleSQL("DELETE FROM " + this.table);

                // save all not update timestamp
                table_marks.forEach(function(mark) {
                    this.id = mark.name;
                    this.save(mark);
                }, this);

                r = this.commit();
            }

            return r;

        },

        setTableMarksToSession: function(table_marks) {

            //extractObject
            let table_marks2 = GeckoJS.Array.objectExtract(table_marks, '{n}.TableMark');

            GeckoJS.Session.add('table_marks', table_marks2);
            return table_marks2;
            
        }


    });
} )();
