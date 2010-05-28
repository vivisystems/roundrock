(function(){

    /**
     * Big Disk controller
     */

    var __controller__ = {

        name: 'BigDisk',

        uses: ['TableStatus'],

        _marker: '.bigdisk',
        _id: '.bigdisk_id',
        _data_path: '',
        _marker_path:'',
        _license_path: '/etc/vivipos.lic',
        _last_good_db_script: 'last_good_db.sh',
        _last_good_db_path: 'last_good_db',
        _merge_db_script: 'merge_db.sh',
        _restore_last_good_db_script: 'restore_last_good_db.sh',
        _bigdisk_setting: 'bigdisk_settings',
        _bigdisk_session_flag: 'vivicenter.BigDisk',

        _script_url: 'chrome://roundrock/content/scripts/',
        _script_path: '',
        
        _syncSettings: null,
        _syncSuspendStatusFile: '/tmp/sync_suspend_',
        
        _limit_retain_txn: 30,
        _limit_retain_inventory: 30,

        initial: function(evt) {
            
            // set up event listeners
            this.addEventListener('activateBigDisk', this._activateBigDisk, this);
            this.addEventListener('suspendBigDisk', this._suspendBigDisk, this);
            this.addEventListener('newBigDisk', this._newBigDisk, this);
            this.addEventListener('resumeBigDisk', this._newBigDisk, this);

            // listen for 'afterTruncateTxnRecords' event to remove last good db
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this._afterTruncateTxnRecords, this);
            }

            // set up various paths
            this._data_path = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._marker_path = this._data_path + '/' + this._marker;
            this._script_path =  GREUtils.File.chromeToPath(this._script_url);

            var bigdisk = '';
            var current_bigdisk = this._readBigDiskID();

            // check if big disk is enabled
            bigdisk = this._checkProvisionedBigDisk(this._marker_path, this._license_path);
            if (bigdisk) {
                switch(current_bigdisk) {
                    case 'suspended':
                        // restore and merge, reset current_bigdisk
                        if (this.dispatchEvent('resumeBigDisk', bigdisk)) {
                            this._writeBigDiskID(bigdisk.uuid);

                            GeckoJS.Session.set(this._bigdisk_session_flag, true);
                            this.log('INFO', 'new big disk [' + bigdisk.uuid + '] activated and in use');
                        }
                        break;
                        
                    case 'none':
                        this.log('INFO', 'Activating big disk [' + bigdisk.uuid + ']: [' + bigdisk.size + ']');
                        if (this.dispatchEvent('activateBigDisk', bigdisk)) {
                            this._writeBigDiskID(bigdisk.uuid);

                            GeckoJS.Session.set(this._bigdisk_session_flag, true);
                            this.log('INFO', 'Big disk [' + bigdisk.uuid + '] activated and in use');
                        }
                        else {
                            this.log('ERROR', 'Failed to activate Big disk [' + bigdisk.uuid + ']');
                        }
                        break;

                    default:
                        if (bigdisk.uuid != current_bigdisk) {
                            // restore but no merge, reset current_bigdisk
                            if (this.dispatchEvent('newBigDisk', bigdisk)) {
                                this._writeBigDiskID(bigdisk.uuid);

                                GeckoJS.Session.set(this._bigdisk_session_flag, true);
                                this.log('INFO', 'new big disk [' + bigdisk.uuid + '] activated and in use');
                            }
                            else {
                                this.log('WARN', 'Shutting down due to presence of new big disk [' + bigdisk.uuid + ']');

                                $do('shutdownMachine', null, 'Main');

                                evt.preventDefault();
                            }
                        }
                        else {
                            GeckoJS.Session.set(this._bigdisk_session_flag, true);
                            this.log('INFO', 'Using big disk [' + bigdisk.uuid + ']: [' + bigdisk.size + ']');
                        }
                        break;
                }
            }
            else {
                if (current_bigdisk != 'none' && current_bigdisk != 'suspended') {
                    this.log('WARN', 'The active big disk [' + current_bigdisk + '] is off-line');
                    if (this.dispatchEvent('suspendBigDisk', current_bigdisk)) {

                        // restore last good database
                        if (this._restoreLastGoodDB()) {

                            if (!this.TableStatus.rebuildTableStatus()) {
                                this.log('ERROR', 'Failed to rebuild table status');
                            }

                            this._writeBigDiskID('suspended');
                            this.log('WARN', 'The active big disk [' + current_bigdisk + '] is now suspended');
                        }
                        else {
                            this.log('FATAL', 'Failed to restore last good database');
                        }
                    }
                    else {
                        this.log('WARN', 'Shutting down due to active big disk [' + current_bigdisk + '] being off-line');

                        $do('shutdownMachine', null, 'Main');

                        evt.preventDefault();
                    }
                }
                else {
                    if (current_bigdisk == 'none') {
                        this.log('INFO', 'no big disk found; big disk never activated');
                    }
                    else {
                        this.log('INFO', 'no big disk found; big disk suspended');
                    }
                    if (!this._checkSmallDisk()) {
                        this.log('WARN', 'Shutting down due to configuration imcompatible with small disks');

                        $do('shutdownMachine', null, 'Main');

                        evt.preventDefault();
                    }
                }
            }
            if (GeckoJS.Session.get(this._bigdisk_session_flag)) {
                // listen for 'periodClosed' event to back up last good db if bigdisk
                var shiftChange = GeckoJS.Controller.getInstanceByName('ShiftChanges');
                if (shiftChange) {
                    shiftChange.addEventListener('periodClosed', this._periodClosed, this);
                }
            }
            else {
                // intercept electronic journal events if not bigdisk
                var journal = GeckoJS.Controller.getInstanceByName('Journal');
                if (journal) {
                    journal.addEventListener('onInitial', this._afterJournalInitialization, this);
                }

                // intercept autobackup event if not bigdisk
                var autobackup = GeckoJS.Controller.getInstanceByName('AutoBackup');
                if (autobackup) {
                    autobackup.addEventListener('beforeAutoBackupToLocal', this._beforeAutoBackupToLocal, this);
                }

                // intercept IRC operations if not bigdisk
                var irc = GeckoJS.Controller.getInstanceByName('Irc');
                if (irc) {
                    irc.addEventListener('beforeFilter', this._disableIRC, this);
                }
            }

            if (!evt.cancel) {
                this.dispatchEvent('BigDiskMode', {active: GeckoJS.Session.get(this._bigdisk_session_flag) || false,
                                                   details: bigdisk});
            }
        },

        _disableIRC: function(evt) {
            evt.preventDefault();
        },

        updateSysprefOptions: function(doc) {
            if (!GeckoJS.Session.get(this._bigdisk_session_flag)) {
                // orderRetaindays
                var orderRetaindaysObj = doc.getElementById('orderRetaindays');
                if (orderRetaindaysObj) {
                    orderRetaindaysObj.setAttribute('max', this._limit_retain_txn);
                    orderRetaindaysObj.setAttribute('min', 1);
                }

                // inventoryAdjustmentRetaindays
                var inventoryAdjustmentRetaindaysObj = doc.getElementById('inventoryAdjustmentRetaindays');
                if (inventoryAdjustmentRetaindaysObj) {
                    inventoryAdjustmentRetaindaysObj.setAttribute('max', this._limit_retain_inventory);
                    inventoryAdjustmentRetaindaysObj.setAttribute('min', 1);
                }
            }
        },
        
        updateSystemBackupOptions: function(doc) {
            var mergeButtonObj = doc.getElementById('mergefromstick');

            if (!GeckoJS.Session.get(this._bigdisk_session_flag)) {
                // hide backup to local button
                var backupToLocalButtonObj = doc.getElementById('backuptolocal');
                if (backupToLocalButtonObj) backupToLocalButtonObj.setAttribute('hidden', true);

                // hide merge button
                var mergeActionRow = doc.getElementById('merge_action');
                if (mergeActionRow) mergeActionRow.setAttribute('hidden', true);
            }

            // replace systembackup controller's validate form with my own
            var system_backup = doc.defaultView.GeckoJS.Controller.getInstanceByName('SystemBackup');
            var builtInValidateForm = system_backup.validateForm;

            system_backup.validateForm = function() {
                builtInValidateForm.call(system_backup);
                var externalListObj = doc.getElementById('stickbackupscrollablepanel');

                if (mergeButtonObj) mergeButtonObj.setAttribute('disabled', !(externalListObj.selectedItems.length > 0));
            }
        },

        updateSyncSettingOptions: function(doc) {
            if (!GeckoJS.Session.get(this._bigdisk_session_flag)) {
                // pullOrder
                var pullOrderObj = $(doc).find('checkbox[name=pull_order]');
                if (pullOrderObj.length) {
                    pullOrderObj[0].setAttribute('checked', false);
                    pullOrderObj[0].setAttribute('disabled', true);
                }
            }
        },

        mergeFromStick: function(env) {
            if (env._busy) return;
            if (!env.checkBackupDevice(env._selectedDevice)){
                NotifyUtils.info(_('Media not found!! Please attach the external storage device...'));
                return;
            }

            var stickObj = env.getListObjStickBackup();
            var index = stickObj.selectedIndex;
            var datas = stickObj.datasource._data;
            var args = [];

            if (index >= 0) {
                var dir = datas[index].dir;
                args.push(env._stickbackupDir + dir);

                var confirmMessage = _("Are you sure you want to import historical transaction data from backup [%S] located on external media [%S]?", [datas[index].time, env._selectedDevice.label]) + "\n\n"
                                       + _("If you import now, the system will restart automatically after you return to the Main Screen.");

                if (GREUtils.Dialog.confirm(this.topmostWindow, _("Confirm Import"), confirmMessage)) {

                    confirmMessage = _("You are strongly advised to backup the existing data before proceeding with the import. Do you want to continue with the import?");

                    if (GREUtils.Dialog.confirm(this.topmostWindow, _("Confirm Import"), confirmMessage)) {

                        env._busy = true;
                        var waitPanel = env._showWaitPanel(_('Importing Historical Data from External Backup'));
                        env.setButtonState();

                        $('#mergefromstick').attr('disabled', true);

                        this.sleep(100);

                        this.log('FATAL', '[IMPORT-BEGIN] invoking script to import data from external backup: [' + env._stickbackupDir + dir + ']');

                        GeckoJS.ConnectionManager.closeAll();

                        // execute the merge script
                        this._execute(this._script_path + '/' + this._merge_db_script,
                                      [env._stickbackupDir + dir, this._data_path]);

                        this.log('FATAL', '[IMPORT-END] invoked script to import data from external backup: [' + env._stickbackupDir + dir + ']');

                        this.dispatchEvent('importHistoricalData', {source: env._stickbackupDir + dir,
                                                                    target: this._data_path + '/databases'});

                        NotifyUtils.info(_('<Import from External Backup> is done!!'));

                        GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                        waitPanel.hidePopup();
                    }
                }
            } else {
                NotifyUtils.info(_('Please select an external backup to import'));
            }

            env._busy = false;
            env.validateForm();
            
            $('#mergefromstick').attr('disabled', false);
        },

        _readBigDiskID: function() {
            var uuid = 'none';
            var settingFile = new GeckoJS.File(this._data_path + '/profile/' + this._bigdisk_setting);
            if (settingFile.exists() && settingFile.isReadable()) {
                settingFile.open('r');
                uuid = settingFile.read(36);
                settingFile.close();

                if (uuid.length != '36' && uuid != 'suspended') uuid = 'none';
            }
            return uuid;
        },

        _writeBigDiskID: function(uuid) {
            var settingFile = new GeckoJS.File(this._data_path + '/profile/' + this._bigdisk_setting);

            try {
                settingFile.open('w');
                if (settingFile.isWritable()) {
                    settingFile.write(uuid);
                }
                settingFile.close();
            }
            catch(e) {
                this.log('ERROR', 'Failed to update big disk ID to [' + uuid + ']');
            }
        },

        _checkProvisionedBigDisk: function(marker, license) {

            var bigdisk;
            var licenseFile = new GeckoJS.File(license);
            var markerFile = new GeckoJS.File(marker);

            if (licenseFile.exists() && licenseFile.isReadable() && markerFile.exists() && markerFile.isReadable()) {

                licenseFile.open('r');
                markerFile.open('r');

                var license_data = licenseFile.read() || '';
                var marker_content = markerFile.read() || '';
                var marker_data = marker_content.substr(37,128);
                if (license_data == marker_data) {
                    var uuid = marker_content.substr(0, 36);
                    var du_info = marker_content.substr(166) || '';
                    var du = du_info.split(/\s+/) || ['-', '-', '-', '-'];
                    bigdisk = {
                        marker: marker_content,
                        uuid: uuid,
                        size: du[1],
                        free: du[3]
                    }
                }

                licenseFile.close();
                markerFile.close();
            }

            return bigdisk;
        },

        _activateBigDisk: function(evt) {
            var size = evt.data ? evt.data.size : '-';
            var free = evt.data ? evt.data.free : '-';
            this._notify(_('Secondary Storage Activated'),
                         _('Secondary storage of size [%S] with [%S] free is now online and ready for use', [size, free])
                         + '\n\n'
                         + _('The following service/configuration is now active automatically') + ':\n'
                         + ' - ' + _('electronic journal') + '\n'
                         + ' - ' + _('retaining the last 7 local backups instead of the last 2') + '\n\n'
                         + _('The following services may now be enabled') + ':\n'
                         + ' - ' + _('pulling orders from synchronization server') + '\n'
                         + ' - ' + _('backing up terminal profile') + '\n\n'
                         + _('In addition, please adjust the following settings') + ':\n'
                         + ' - ' + _('number of days to retain transaction data' + '\n'
                         + ' - ' + _('number of days to retain inventory commitment records')));
        },

        _checkSmallDisk: function() {
            var result = this._validateSmallDiskConfiguration();
            if (!result.updated) return true;

            // notify user that system options and parameters have been updated
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var notifications = '';
            result.notifications.forEach(function(msg) {
                notifications += '\n - ' + msg;
            });

            if (GREUtils.Dialog.confirm(win,
                                        _('Small Disk Configuration'),
                                        _('We have detected terminal configurations that require secondary storage, but no secondary storage has been installed.') + '\n\n'
                                         + _('Do you still want to use this terminal?') + '\n\n'
                                         + _('If you choose to use the terminal, the following service/configuration changes will be made automatically') + ':'
                                         + notifications + '\n\n'
                                         + _('If you choose NOT to use the terminal, please press the "Cancel" button; the terminal will automatically shut down'))) {
                // turn off bi-directional sync
                if (GeckoJS.String.parseBoolean(result.sync_settings.pull_order)) {
                    result.sync_settings.pull_order = 0;
                    (new SyncSetting()).save(result.sync_settings);

                    // restart sync_client
                    GeckoJS.File.run('/etc/init.d/sync_client', ['restart'], true);
                }

                if (result.adjust_retain_txn_days) {
                    GeckoJS.Configure.write('vivipos.fec.settings.OrderRetainDays', this._limit_retain_txn);
                }

                if (result.adjust_retain_inventory_days) {
                    GeckoJS.Configure.write('vivipos.fec.settings.InventoryAdjustmentRetainDays', this._limit_retain_inventory);
                }
                return true;
            }
            else {
                return false;
            }
        },

        _suspendBigDisk: function(evt) {
            var result = this._validateSmallDiskConfiguration();

            // notify user that system options and parameters have been updated
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var notifications = '';
            result.notifications.forEach(function(msg) {
                notifications += '\n - ' + msg;
            });

            if (GREUtils.Dialog.confirm(win,
                                        _('Secondary Storage Disabled'),
                                        _('The secondary storage has been taken off-line. You may still use this terminal, but historical transaction data must be restored from external backup before they may be accessed.') + '\n\n'
                                         + _('Do you want to use this terminal?') + '\n\n'
                                         + _('If you choose to use the terminal, the following service/configuration changes will be made automatically') + ':\n'
                                         + notifications + '\n\n'
                                         + _('If you choose NOT to use the terminal, please press the "Cancel" button; the terminal will automatically shut down'))) {
                // turn off bi-directional sync
                if (GeckoJS.String.parseBoolean(result.sync_settings.pull_order)) {
                    result.sync_settings.pull_order = 0;
                    (new SyncSetting()).save(result.sync_settings);

                    // restart sync_client
                    GeckoJS.File.run('/etc/init.d/sync_client', ['restart'], true);
                }

                if (result.adjust_retain_txn_days) {
                    GeckoJS.Configure.write('vivipos.fec.settings.OrderRetainDays', this._limit_retain_txn);
                }

                if (result.adjust_retain_inventory_days) {
                    GeckoJS.Configure.write('vivipos.fec.settings.InventoryAdjustmentRetainDays', this._limit_retain_inventory);
                }
            }
            else {
                evt.preventDefault();
            }
        },

        _newBigDisk: function(evt) {
            // notify user that a new big disk is online
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var size = evt.data ? evt.data.size : '-';
            var free = evt.data ? evt.data.free : '-';

            this._notify(_('New Secondary Storage Activated'),
                         _('New secondary storage of size [%S] with [%S] free is now online and ready for use', [size, free])
                         + '\n\n'
                         + _('The following service and configuration are now active automatically') + ':\n'
                         + ' - ' + _('electronic journal') + '\n'
                         + ' - ' + _('retaining the last 7 local backups instead of the last 2') + '\n\n'
                         + _('The following service may now be enabled') + ':\n'
                         + ' - ' + _('pulling orders from synchronization server') + '\n\n'
                         + _('In addition, please adjust the following settings') + ':\n'
                         + ' - ' + _('number of days to retain transaction data') + '\n'
                         + ' - ' + _('number of days to retain inventory commitment records') + '\n\n'
                         + _('You may use the "Import" option in "System Backup/Restore" to import historical transaction data into the current database'));
        },
        
        _validateSmallDiskConfiguration: function() {

            var notifications = [];
            var updated = false;

            // verify that various system options and parameters fall within limits
            //
            // configurations that are automatically disabled:
            //
            // 1. electronic journal
            // 2. number of backups to retain
            // 3. backing up terminal profile
            // 4. pulling from synchronization server

            if (!GeckoJS.Configure.read('vivipos.fec.settings.internal.disableJournal')) {
                notifications.push(_('disabling electronic journal'))
            }

            notifications.push(_('retaining the last 2 local backups instead of the last 7'));

            var settings = (new SyncSetting()).read();
            if (GeckoJS.String.parseBoolean(settings.pull_order)) {
                notifications.push(_('pulling orders from synchronization server'));
                updated = true;
            }

            //
            // configurations whose values need to be checked against limit
            //
            // 1. number of days to retain transaction data
            // 2. number of days to retain inventory commitment records

            var retain_txn_days = GeckoJS.Configure.read('vivipos.fec.settings.OrderRetainDays');
            var retain_inventory_days = GeckoJS.Configure.read('vivipos.fec.settings.InventoryAdjustmentRetainDays');
            var adjust_retain_txn_days = false;
            var adjust_retain_inventory_days = false;

            if (retain_txn_days == null || retain_txn_days == 0 || retain_txn_days > this._limit_retain_txn) {
                notifications.push(_('number of days to retain order data set to [%S] ([%S])', [this._limit_retain_txn, retain_txn_days || 0]));
                adjust_retain_txn_days = true;
                updated = true;
            }

            if (retain_inventory_days == null || retain_inventory_days == 0 || retain_inventory_days > this._limit_retain_inventory) {
                notifications.push(_('number of days to retain inventory adjustment records set to [%S] ([%S])', [this._limit_retain_inventory, retain_inventory_days || 0]));
                adjust_retain_inventory_days = true;
                updated = true;
            }

            return {
                notifications: notifications,
                adjust_retain_txn_days: adjust_retain_txn_days,
                adjust_retain_inventory_days: adjust_retain_inventory_days,
                sync_settings: settings,
                updated: updated
            }
        },

        _afterJournalInitialization: function(evt) {
            if (!GeckoJS.Session.get(this._bigdisk_session_flag)) {

                // disable electronic journal if not in BigDisk mode
                var journal = GeckoJS.Controller.getInstanceByName('Journal');
                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                if (journal) {
                    cart.removeEventListener('afterSubmit', journal.submitOrder);
                    cart.removeEventListener('afterVoidSale', journal.voidOrder);
                }
            }
        },

        _periodClosed: function(evt) {
            // generate last good db if in BigDisk mode
            if (GeckoJS.Session.get(this._bigdisk_session_flag)) {

                var terminal = GeckoJS.Session.get('terminal_no');
                var file = new Date().toString('yyyyMMddHHmmss');
                var main = GeckoJS.Controller.getInstanceByName('Main');
                var waitPanel = main._showWaitPanel('wait_panel', 'wait_caption', _('Generating Last Good Database...'), 500, true);

                this._execute(this._script_path + '/' + this._last_good_db_script,
                              [terminal, this._data_path + '/profile/' + this._last_good_db_path, file]);

                // dispatch event to allow other add-on's to migrate data into last good db
                this.dispatchEvent('generateLastGoodDB', {backup_path: this._data_path + '/profile/' + this._last_good_db_path,
                                                          backup_file: file});

                this.log('WARN', 'last good database generated');

                if (waitPanel) {
                    waitPanel.hidePopup();
                }
            }
        },

        _afterTruncateTxnRecords: function(evt) {
            // generate last good db if in BigDisk mode
            var dir = new GeckoJS.Dir(this._data_path + '/profile/' + this._last_good_db_path);
            if (dir.exists()) {
                dir.remove(true);
                this.log('WARN', 'last good database [' + dir.path + '] removed on afterTruncateTxnRecords event');
            }
        },

        _beforeAutoBackupToLocal: function(evt) {
            if (evt.data.args.length == 0) {
                evt.data.args = ['', 'secondary'];
            }
            else if (evt.data.args.length == 1) {
                evt.data.args.push('secondary');
            }
            else {
                evt.data.args[1] = 'secondary';
            }
        },

        _restoreLastGoodDB: function() {
            var result = true;

            // check if last good db exists
            var files = GeckoJS.Dir.readDir(this._data_path + '/profile/' + this._last_good_db_path, {type: 'f'}) || [];
            var file_name;

            files.forEach(function(f) {
                // find file with largest date
                if (!isNaN(f.leafName)) {
                    if (file_name == null) {
                        file_name = parseInt(f.leafName);
                    }
                    else if (parseInt(f.leafName) > file_name) {
                        file_name = parseInt(f.leafName);
                    }
                }
            });

            if (file_name != null) {
                file_name = file_name.toString();

                var backup_date = new Date();
                backup_date.setFullYear(file_name.substr(0, 4));
                backup_date.setMonth(file_name.substr(4, 2) - 1);
                backup_date.setDate(file_name.substr(6, 2));
                backup_date.setHours(file_name.substr(8, 2));
                backup_date.setMinutes(file_name.substr(10, 2));
                backup_date.setSeconds(file_name.substr(12, 2));

                // close data source
                GeckoJS.ConnectionManager.closeAll();

                var alert_win = this._showAlertDialog(_('Last Good Database'),
                                                      _('Restoring Last Good Database...'),
                                                      '(' + backup_date.toLocaleString() + ')');

                this.sleep(500);

                this._execute(this._script_path + '/' + this._restore_last_good_db_script,
                              [this._data_path + '/profile/' + this._last_good_db_path + '/' + file_name,
                               this._data_path]);

                // dispatch event to allow other add-ons to migrate data from last good db
                result = this.dispatchEvent('restoreLastGoodDB',
                                            {backup_path: this._data_path + '/profile/' + this._last_good_db_path,
                                             backup_file: file_name,
                                             db_path: this._data_path + '/databases'
                                            })

                if (alert_win) {
                    alert_win.close();
                    delete alert_win;
                }

                this.log('ERROR', 'restored last good database from [' + file_name + '], result [' + result + ']');
            }

            return result;
        },

        _execute: function(cmd, params) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(params, true);
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

        _showAlertDialog: function(title, message, datestr) {
            var width = 600;
            var height = 120;

            var aURL = 'chrome://roundrock/content/alert_restore_last_good_db.xul';
            var aName = title;
            var aArguments = {message: message, date: datestr};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            if (win.document.documentElement.boxObject.screenX < 0) {
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
    function startup(evt) {
        GeckoJS.Dispatcher.removeEventListener('onDispatch', startup);
        $do('initial', evt, 'BigDisk');
    }
    GeckoJS.Dispatcher.addEventListener('onDispatch', startup);

})();

