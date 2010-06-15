(function(){

    /**
     * Databasek controller
     */

    var __controller__ = {

        name: 'BDBData',

        _script_url: 'chrome://roundrock/content/scripts/',
        _script_path: '',
        _data_path: '',
        _expire_batch_size: 500,
        _expire_total_size: 100000,

        _backup_system_script: 'bdb_backup.sh',
        _restore_system_script: 'bdb_restore.sh',

        _bdb_recover: '/usr/local/BerkeleyDB.5.0/bin/db_recover',
        _sqlite3: '/usr/bin/sqlite3',

        _integrity_check_output: '/tmp/ROUNDROCK_INTEGRITY_STATUS',

        // @integrityCheck
        //
        // This function is invoked before any controller is initialized. Its
        // function is to verify that integrity check has completed, and perform
        // any necessary post-processing according to the result of the integrity
        // check:
        //
        // 1. wait for integrity to complete
        // 2a. if integrity check succeeds, simply exits
        // 2b. if integrity check fails, attempt db recover, put up "call for service" notice
        //
        integrityCheck: function(evt) {
            var statusFile = '/tmp/integrity-status.' + GeckoJS.String.uuid();
            var status = '';
            var alertDialog;

            var failedToRunMsg = _('Data integrity check failed to run.');
            var checkFailedMsg = _('Data integrity check failed.');
            var actionMsg = _('Please contact your dealer for service.')

            // loop until status returns 'stop/waiting' or failed
            while (status != 'stop/waiting' && status != 'failed-check' && status != 'failed-to-run') {
                if (status) {
                    // put up wait panel
                    if (!alertDialog) alertDialog = this._showAlertDialog();
                    this.sleep(1000);
                }
                this._execute('/bin/sh', ['-c', "status integrity-check | awk -F' ' '{ print $2 }' > " + statusFile]);

                // read integrity check status from status file
                if (GeckoJS.File.exists(statusFile)) {
                    let f = new GeckoJS.File(statusFile);
                    f.open('r');

                    // if status file is empty or unreadable, then integrity check failed to run
                    status = f.readAllLine() || 'failed-to-run';
                    f.close();
                }
                else {
                    status = 'failed-to-run';
                }
            }

            // if integrity check completed, check result
            if (status == 'stop/waiting') {
                if (GeckoJS.File.exists(this._integrity_check_output)) {
                    let f = new GeckoJS.File(this._integrity_check_output);
                    f.open('r');

                    status = f.readAllLine() || 'failed-check';

                    if (status != '0') {
                        status = 'failed-check'
                    }
                }
                else {
                    status = 'failed-to-run';
                }
            }

            switch(status) {
                case 'failed-to-run':
                case 'failed-check':
                    evt.preventDefault();
                    alertDialog = this._showAlertDialog(((status == 'failed-to-run') ? failedToRunMsg : checkFailedMsg) + ' ' + actionMsg);
                    break;

                default:
                    if (alertDialog) alertDialog.hidePopup();
                    break;
            }
        },

        initial: function(evt) {
            
            // set up various paths
            this._data_path = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._script_path =  GREUtils.File.chromeToPath(this._script_url);
            
            // listen for 'beforeTruncateTxnRecords' event to truncate transaction records by dropping tables
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('beforeTruncateTxnRecords', this._beforeTruncateTxnRecords, this);
                main.addEventListener('beforeClearOrderData', this._beforeClearOrderData, this);
            }

            // intercept autobackup event if not bigdisk
            var autobackup = GeckoJS.Controller.getInstanceByName('AutoBackup');
            if (autobackup) {
                autobackup.addEventListener('beforeAutoBackupToLocal', this._beforeAutoBackupToLocal, this);
            }

            var self = this;

            // replace default rebootMachine/shutdownMachine
            if (goRebootMachine && typeof goRebootMachine == 'function') {
                let builtinGoRebootMachine = goRebootMachine;
                window.goRebootMachine = function() {
                    GeckoJS.ConnectionManager.closeAll();

                    self.log('DEBUG', 'Closing database connections on reboot');

                    builtinGoRebootMachine.call();
                }
            }
            
            if (goShutdownMachine && typeof goShutdownMachine == 'function') {
                let builtinGoShutdownMachine = goShutdownMachine;
                window.goShutdownMachine = function() {
                    GeckoJS.ConnectionManager.closeAll();

                    self.log('DEBUG', 'Closing database connections on shutdown');

                    builtinGoShutdownMachine.call();
                }
            }

            // replace default GREUtils.restartApplication
            if (GREUtils.restartApplication && typeof GREUtils.restartApplication == 'function') {
                let builtinRestartApplication = GREUtils.restartApplication;
                GREUtils.restartApplication = function() {
                    GeckoJS.ConnectionManager.closeAll();

                    self.log('DEBUG', 'Closing database connections on restart');

                    builtinRestartApplication.call();
                }
            }

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

        updateSysprefOptions: function(doc) {
            var rebuildButton = doc.getElementById('rebuild_database');
            if (rebuildButton) {
                var parent = rebuildButton.parentNode;
                if (parent) parent.hidden = true;
            }
        },

        updateSystemBackupOptions: function(doc) {
            // add listener for 'beforeRestoreFromLocal' and 'beforeRestoreFromRemote' to redirect restore script
            var backupController = doc.defaultView.GeckoJS.Controller.getInstanceByName('SystemBackup');
            if (backupController) {
                backupController.addEventListener('beforeBackupToLocal', this._beforeBackupToLocal, this);
                backupController.addEventListener('beforeRestoreFromLocal', this._handleRestore, this);
                backupController.addEventListener('beforeRestoreFromRemote', this._handleRestore, this);

                // replace systembackup controller's validate form with my own
                var backupToExternalButtonObj = doc.getElementById('backuptoexternal');
                var builtInValidateForm = backupController.validateForm;

                backupController.validateForm = function() {
                    builtInValidateForm.call(backupController);

                    if (backupToExternalButtonObj) backupToExternalButtonObj.setAttribute('disabled', !backupController._selectedDevice);
                }

                // replace systembackup controller's setButtonState with my own
                backupController.setButtonState= function() {
                    $(doc).find('vivibutton').attr('disabled', backupController._busy);

                    backupController.validateForm();
                }
            }
        },

        // @backupToRemote:
        //
        // parms should be an array with two elements:
        //
        // parms[0]: reference to the built-in system backup controller
        // parms[1]: reference to the system backup document
        //
        backupToRemote: function(parms) {

            var env = parms[0];
            var doc = parms[1];

            if (env._busy) return;
            env._busy = true;

            var waitPanel = env._showWaitPanel(_('Backing Up Data to Local Storage'));
            var withProfile = doc.getElementById('backupWithProfile').checked ;

            env.setButtonState();

            var args;
            if (withProfile) {
                args = ['with-profile', 'secondary'];
            }
            else {
                args = ['', 'secondary'];
            }

            // log user process
            this.log('FATAL', 'backupToRemote withProfile: [' + withProfile +']');

            env.flushPrefs(); // flush it.

            // close all non-in-memory database connections
            this._closeDBConnections();

            var script = this._script_path + '/' + this._backup_system_script;
            let evt_data = {script: script, args: args, skip: false};
            if (this.dispatchEvent('beforeBackupToRemote', evt_data)) {
                script = evt_data.script;
                args = evt_data.args;

                this.log('DEBUG', 'backup script [' + script + ']');
                this.log('DEBUG', 'backup args [' + this.dump(args) + ']');

                if (evt_data.skip || this._execute(script, args)) {
                    this._execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                    NotifyUtils.info(_('<Backup to Local Storage> is done'));
                }
            }
            env.refresh();
            env._busy = false;
            env.validateForm();

            waitPanel.hidePopup();
        },

        _closeNonMemoryDSConnections: function() {
            var dsList = GeckoJS.ConnectionManager.sourceList();
        },

        _beforeClearOrderData: function(evt) {
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
        
        _beforeTruncateTxnRecords: function(evt) {

            var ds = new OrderModel().getDataSource();
            var database_file = ds.path + '/' + ds.database;

            // close all data connections
            this._closeDBConnections();

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

        _beforeBackupToLocal: function(evt) {
            evt.data.script = this._script_path + '/' + this._backup_system_script;
            if (evt.data.args.length == 0) {
                evt.data.args = ['', 'local'];
            }
            else if (evt.data.args.length == 1) {
                evt.data.args.push('local');
            }
            else {
                evt.data.args[1] = 'local';
            }
        },

        _beforeAutoBackupToLocal: function(evt) {
            evt.data.script = this._script_path + '/' + this._backup_system_script;
        },

        _handleRestore: function(evt) {

            // handle restore iff databases.tbz does not exist
            var dir = evt.data.args[0];
            if (!GeckoJS.File.exists(dir + '/databases.tbz')) {
                var target_dir = this._data_path + '/databases';
                var error_file = '/tmp/restore.status.' + GeckoJS.String.uuid();

                var script = this._script_path + '/' + this._restore_system_script;
                var args = [];
                args.push(evt.data.args[0]);
                if (evt.data.args.length < 2) {
                    args.push('');
                }
                else {
                    args.push(evt.data.args[1]);
                }
                args.push(error_file);
                args.push(target_dir);

                this.log('FATAL', 'Restoring from [' + args[0] + '] into [' + target_dir + ']');

                this._execute(script, args);

                if (GeckoJS.File.exists(error_file)) {
                    let msg;
                    let f = new GeckoJS.File(error_file);
                    if (f) {
                        f.open('r');
                        msg = f.readAllLine() || _('System restore failed');
                        f.close();
                    }
                    this.log('FATAL', 'System restore failed [' + msg + ']');

                    this._notify(_('System Restore Error'), msg);

                    evt.preventDefault();
                }
                else {
                    // remove cart recovery file
                    Transaction.removeRecoveryFile();
                }

                evt.data.skip = true;
            }
        },

        /*
         * close all connections to databases that are not in-memory
         */
        _closeDBConnections: function() {
            var dsList = GeckoJS.ConnectionManager.sourceList() || [];
            dsList.forEach(function(dsName) {
                if (dsName.toLowerCase() != 'memory') {
                    let ds = GeckoJS.ConnectionManager.getDataSource(dsName);
                    if (ds) {
                        ds.close();
                    }
                }
            }, this);
        },

        _startServices: function() {
            this._execute('/usr/bin/sudo', ['/sbin/start', '--no-wait', 'lighttpd']);
            this._execute('/usr/bin/sudo', ['/sbin/start', '--no-wait', 'sync-client']);
            this._execute('/usr/bin/sudo', ['/sbin/start', '--no-wait', 'irc-client']);

            return true;
        },

        _stopServices: function() {
            this._execute('/usr/bin/sudo', ['/sbin/stop', 'irc-client']);
            this._execute('/usr/bin/sudo', ['/sbin/stop', 'sync-client']);
            this._execute('/usr/bin/sudo', ['/sbin/stop', 'lighttpd']);

            return true;
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

        _notify: function(title, message) {
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win, title, message);
        },

        _showAlertDialog: function(msg) {

            var width = 700;
            var height = 150;

            var aURL = 'chrome://roundrock/content/alert_integrity_check.xul';
            var aName = _('Data Integrity');
            var aArguments = {detail: msg, controller: this};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height + ((msg) ? ',modal' : '');

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return alertWin;
        },

        destroy: function() {

        }
    };

    GeckoJS.Controller.extend(__controller__);

    // set up event listener to intercept invocation of Main.initial()
    window.addEventListener('load', function() {
        $do('initial', null, 'BDBData');
    }, false);

    window.addEventListener('close', function() {
        GeckoJS.ConnectionManager.closeAll();
    }, false);
})();

