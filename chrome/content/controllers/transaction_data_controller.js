(function(){

    /**
     * Databasek controller
     */

    var __controller__ = {

        name: 'TransactionData',

        _script_url: 'chrome://roundrock/content/scripts/',
        _script_path: '',
        _data_path: '',
        _truncate_script: 'truncate_txn_records.sh',
        _expire_batch_size: 750,
        _expire_total_size: 100000,

        _bdb_recover: '/usr/local/BerkeleyDB.5.0/bin/db_recover',
        _sqlite3: '/usr/bin/sqlite3',

        initial: function(evt) {
            
            // listen for 'beforeTruncateTxnRecords' event to truncate transaction records by dropping tables
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('beforeTruncateTxnRecords', this.beforeTruncateTxnRecords, this);
                main.addEventListener('beforeClearOrderData', this.beforeClearOrderData, this);
            }

            // set up various paths
            this._data_path = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._script_path =  GREUtils.File.chromeToPath(this._script_url);

            // observer application restart/shutdown events to close db connections
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['quit-application-requested' ],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'quit-application-requested') {
                        GeckoJS.ConnectionManager.closeAll();
                    }
                }
            }).register();

        },

        beforeClearOrderData: function(evt) {
            var retainDate = parseInt(evt.data);
            if (retainDate > 0) {
                var main = GeckoJS.Controller.getInstanceByName('Main');

                try {
                    // get list of order ids
                    var order = new OrderModel();
                    var conditions = 'orders.transaction_submitted <= ' + retainDate + ' AND orders.status <= 1';
                    var order_records = order.find('all', {
                        fields: 'id',
                        conditions: conditions,
                        limit: this._expire_total_size
                    });

                    this.log('WARN', 'number of orders to remove [' + order_records.length + ']');

                    while (order_records.length > 0) {
                        // remove orders in batches
                        let order_list = order_records.splice(0, this._expire_batch_size);
                        let id_list = []
                        if (order_list.length > 0) {
                            id_list = order_list.map(function(o) {
                                return "'" + o.id + "'";
                            });
                        }

                        r = order.removeOrders('', id_list);
                        if (!r) {
                            throw {
                                errno: order.lastError,
                                errstr: order.lastErrorString,
                                errmsg: _('An error was encountered while expiring sales activity logs (error code %S) [message #1005].', [order.lastError])
                            };
                        }

                        this.log('WARN', 'remaining orders [' + order_records.length + ']');
                    }

                    delete order_records;

                    // get list of uniform invoices (if model is defined)
                    if (typeof UniformInvoiceModel != 'undefined') {
                        var uiModel = new UniformInvoiceModel();
                        var ui_records = uiModel.find('all', {
                            fields: 'id',
                            conditions: conditions,
                            limit: this._expire_total_size
                        });

                        this.log('WARN', 'number of uniform invoices to remove [' + ui_records.length + ']');

                        while (ui_records.length > 0) {
                            // remove uniform invoices in batches
                            let ui_list = ui_records.splice(0, this._expire_batch_size);
                            let id_list = []
                            if (ui_list.length > 0) {
                                id_list = ui_list.map(function(o) {
                                    return "'" + o.id + "'";
                                });
                            }

                            let r = uiModel.execute('delete from uniform_invoices where id in (' + id_list.join(',') + ')');
                            if (!r) {
                                throw {
                                    errno: order.lastError,
                                    errstr: order.lastErrorString,
                                    errmsg: _('An error was encountered while expiring uniform invoice logs (error code %S) [message #9006]', [uiModel.lastError])
                                };
                            }

                            this.log('WARN', 'remaining uniform invoices [' + ui_records.length + ']');
                        }

                        delete ui_records;
                    }
                }
                catch(e) {
                    if (main) main._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },
        
        beforeTruncateTxnRecords1: function(evt) {

            var ds = new OrderModel().getDataSource();
            var database_file = ds.path + '/' + ds.database;

            // close all data connections
            GeckoJS.ConnectionManager.closeAll();

            this.log('WARN', 'before truncate [' + this._script_path + '/' + this._truncate_script + '] [' + database_file + ']');

            // we will use script to truncate transaction records for better performance
            this._execute(this._script_path + '/' + this._truncate_script,
                          [database_file]);

            this.log('WARN', 'after truncate');
        },


        beforeTruncateTxnRecords: function(evt) {

            var ds = new OrderModel().getDataSource();
            var database_file = ds.path + '/' + ds.database;

            // close all data connections
            GeckoJS.ConnectionManager.closeAll();

            this.log('WARN', 'before truncate');

            // step 1: suspend services
            this._stopServices();
            this.sleep(200);

            // step 2: dump schema
            var uuid = GeckoJS.String.uuid();
            var schema_file = '/tmp/schema.' + uuid;
            this._execute('/bin/sh', ['-c', this._sqlite3 + ' ' + database_file + ' .schema > ' + schema_file]);

            // step 3: copy DB_CONFIG
            var db_config = database_file + '-journal/DB_CONFIG';
            var db_config_copy = '/tmp/DB_CONFIG.' + uuid;
            if (GeckoJS.File.exists(db_config)) {
                GeckoJS.File.copy(db_config, db_config_copy);
            }

            // step 4: remove existing DB
            this._execute('/bin/sh', ['-c', '/bin/rm -rf ' + database_file + '*']);
            
            // step 5: create new DB
            this._execute('/bin/sh', ['-c', this._sqlite3 + ' ' + database_file + ' ".read ' + schema_file + '"']);

            // step 6: restore db environment
            this._execute('/bin/mv', [db_config_copy, database_file + '-journal/DB_CONFIG']);

            // step 7: recreate db environment
            this._execute(this._bdb_recover, ['-h', database_file + '-journal']);

            // step 8: change permission
            this._execute('/bin/sh', ['-c', '/bin/chmod 0664 ' + database_file]);
            this._execute('/bin/sh', ['-c', '/bin/chmod 0775 ' + database_file + '-journal']);
            this._execute('/bin/sh', ['-c', '/bin/chmod 0664 ' + database_file + '-journal/*']);

            // step 9: sync disks
            this._execute('/bin/sync');

            // step 10: resume services
            this._startServices();
            this.log('WARN', 'after truncate');
        },

        _startServices: function() {
            this._execute('/usr/bin/sudo', ['/etc/init.d/lighttpd', 'start', '>/dev/null', '2>&1']);
            this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/sync_client', 'start']);
            // this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/irc_client', 'start', '>/dev/null', '2>&1']);
        },

        _stopServices: function() {
            this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/sync_client', 'stop']);
            this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/irc_client', 'stop', '>/dev/null', '2>&1']);
            this._execute('/usr/bin/sudo', ['/etc/init.d/lighttpd', 'stop', '>/dev/null', '2>&1']);
        },

        _execute: function(cmd, params, nonblocking) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(params, !nonblocking);
                exec.close();
                return true;
            }
            catch (e) {
                this.log('ERROR', 'Failed to execute command [' + cmd + ' ' + params + ']');
                return false;
            }
        },

        destroy: function() {

        }
    };

    GeckoJS.Controller.extend(__controller__);

    // set up event listener to intercept invocation of Main.initial()
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'TransactionData');
                                      });

    }, false);


})();

