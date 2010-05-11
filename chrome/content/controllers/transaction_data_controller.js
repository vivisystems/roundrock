(function(){

    /**
     * Databasek controller
     */

    var __controller__ = {

        name: 'TransactionData',

        _script_url: 'chrome://roundrock/content/scripts/',
        _script_path: '',
        _data_path: '',
        _expire_batch_size: 500,
        _expire_total_size: 100000,
        _sync_suspend_status_file: '/tmp/sync_client.off',

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

                var uiModel;
                if (typeof UniformInvoiceModel != 'undefined') {
                    uiModel = new UniformInvoiceModel();
                }

                this.log('DEBUG', 'expiration date [' + retainDate + ' (' + new Date(retainDate * 1000) + ')]');
                try {
                    // get list of order ids
                    var order = new OrderModel();
                    var conditions = 'orders.transaction_submitted <= ' + retainDate + ' AND orders.status <= 1';
                    var order_records = order.find('all', {
                        fields: 'id',
                        conditions: conditions,
                        limit: this._expire_total_size
                    });

                    this.log('DEBUG', 'number of orders to remove [' + order_records.length + ']');

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

                        if (uiModel) {
                            r = uiModel.execute('delete from uniform_invoices where order_id in (' + id_list.join(',') + ')');
                            if (!r) {
                                throw {
                                    errno: order.lastError,
                                    errstr: order.lastErrorString,
                                    errmsg: _('An error was encountered while expiring uniform invoice logs (error code %S) [message #9006]', [uiModel.lastError])
                                };
                            }
                        }
                        this.log('WARN', 'remaining orders [' + order_records.length + ']');
                    }

                    delete order_records;
                }
                catch(e) {
                    if (main) main._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },
        
        beforeTruncateTxnRecords: function(evt) {

            var ds = new OrderModel().getDataSource();
            var database_file = ds.path + '/' + ds.database;

            // close all data connections
            GeckoJS.ConnectionManager.closeAll();

            this.log('WARN', 'before truncate');

            try {
                // step 1: suspend services
                if (!this._stopServices()) {
                    throw _('step 1');
                }
                this.log('WARN', 'after step 1');
                this.sleep(200);

                // step 2: dump schema
                var uuid = GeckoJS.String.uuid();
                var schema_file = '/tmp/schema.' + uuid;
                if (!this._execute('/bin/sh', ['-c', this._sqlite3 + ' ' + database_file + ' .schema > ' + schema_file])) {
                    throw _('step 2');
                }
                this.log('WARN', 'after step 2');
                this.sleep(200);

                // step 3: copy DB_CONFIG
                var db_config = database_file + '-journal/DB_CONFIG';
                var db_config_copy = '/tmp/DB_CONFIG.' + uuid;
                if (GeckoJS.File.exists(db_config)) {
                    GeckoJS.File.copy(db_config, db_config_copy);
                }
                this.log('WARN', 'after step 3');
                this.sleep(200);

                // step 4: remove existing DB
                if (!this._execute('/bin/sh', ['-c', '/bin/rm -rf ' + database_file + '*'])) {
                    throw _('step 4');
                }
                this.log('WARN', 'after step 4');
                this.sleep(200);

                // step 5: create new DB
                if (!this._execute('/bin/sh', ['-c', this._sqlite3 + ' ' + database_file + ' ".read ' + schema_file + '"'])) {
                    throw _('step 5');
                }
                GeckoJS.File.remove(schema_file);
                this.log('WARN', 'after step 5');
                this.sleep(200);

                // step 6: restore db environment
                if (!this._execute('/bin/mv', [db_config_copy, database_file + '-journal/DB_CONFIG'])) {
                    throw _('step 6');
                }
                this.log('WARN', 'after step 6');
                this.sleep(200);

                // step 7: recreate db environment
                if (!this._execute(this._bdb_recover, ['-h', database_file + '-journal'])) {
                    throw _('step 7');
                }
                this.log('WARN', 'after step 7');
                this.sleep(200);

                // step 8: change permission
                if (!this._execute('/bin/sh', ['-c', '/bin/chmod 0664 ' + database_file]) ||
                    !this._execute('/bin/sh', ['-c', '/bin/chmod 0775 ' + database_file + '-journal']) ||
                    !this._execute('/bin/sh', ['-c', '/bin/chmod 0664 ' + database_file + '-journal/*'])) {
                    throw _('step 8');
                }
                this.log('WARN', 'after step 8');
                this.sleep(200);

                // step 9: sync disks
                if (!this._execute('/bin/sync')) {
                    throw _('step 9');
                }
                this.log('WARN', 'after step 9');
                this.sleep(200);

                // step 10: resume services
                if (!this._startServices()) {
                    throw _('step 10');
                }
                this.log('WARN', 'after truncate');
            }
            catch(e) {
                this.log('ERROR', 'Failed to truncate transaction records [' + e + ']');

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Transaction Record Truncate Error'),
                                      _('Failed to truncate transaction records [%S]. Please restart the terminal and try again [message #RR-001]', [e]));
                evt.preventDefault();
            }
        },

        _startServices: function() {
            // Note that sync_client/irc_client are restarted automatically by cron job
            // this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/sync_client', 'start']);
            // this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/irc_client']);

            var marker_file_path = this._sync_suspend_status_file;

            if (GeckoJS.File.exists(marker_file_path)) {
                GeckoJS.File.remove(marker_file_path);
            }

            this._execute('/usr/bin/sudo', ['/etc/init.d/lighttpd', 'start']);

            return !GeckoJS.File.exists(marker_file_path);
        },

        _stopServices: function() {
            // create sync syspend file
            var marker_file_path = this._sync_suspend_status_file;

            if (!GeckoJS.File.exists(marker_file_path)) {
                let marker_file = new GeckoJS.File(marker_file_path);
                if (marker_file) marker_file.create();
            }

            if (!GeckoJS.File.exists(marker_file_path)) {
                return false;
            }
            else {
                this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/sync_client', 'stop']);
                this._execute('/usr/bin/sudo', ['/data/vivipos_webapp/irc_client', 'stop']);
                this._execute('/usr/bin/sudo', ['/etc/init.d/lighttpd', 'stop']);
                
                return true;
            }
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

