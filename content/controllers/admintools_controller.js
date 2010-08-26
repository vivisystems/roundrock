(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'AdminTools',

        _dataPath: null,
        _modelClasses: null,
        _syncedDatasources: null,
        _syncSettings: null,
        _syncTerminal: null,
        _httpServiceSync: null,

        _syncPushListObj: null,
        _syncPullListObj: null,
        _terminalListObj: null,
        _tableListObj: null,
        _dsbackupListObj: null,
        _ircpackageListObj: null,
        
        _syncSuspendStatus: null,
        _syncSuspendStatusFile: '/tmp/sync_suspend_',

        _dsbackupPath: null,
        _dsbackupFiles: null,

        _fileViewer: '/usr/bin/leafpad',

        _ircRootPath: '/data/irc_packages/',
        _ircPackages: [],
        _ircLastFailedPackage: null,

        terminalTableList: {},

        _getTerminalListObj: function() {
            if (!this._terminalListObj) {
                this._terminalListObj = document.getElementById('terminallist');
            }
            return this._terminalListObj;
        },

        _getTableListObj: function() {
            if (!this._tableListObj) {
                this._tableListObj = document.getElementById('tablelist');
            }
            return this._tableListObj;
        },

        _getHttpServiceSync: function(hostname) {

            if (!this._httpServiceSync) {
                var syncSettings = SyncSetting.read();
                this._httpServiceSync = new SyncbaseHttpService();
                this._httpServiceSync.setSyncSettings(syncSettings);
                this._httpServiceSync.setHostname(hostname);
                this._httpServiceSync.setController('syncs');
                this._httpServiceSync.setForce(true);
            }
            return this._httpServiceSync;
        },

        _getSyncTerminal: function(settings) {
            if (!this._syncTerminal) {
                if (settings.hostname != 'localhost') {
                    var httpService = this._getHttpServiceSync(settings.hostname);
                    var remoteUrl = httpService.getRemoteServiceUrl('auth');

                    this._syncTerminal = httpService.requestRemoteService('GET', remoteUrl, null, null, null, true);
                }
                else {
                    this._syncTerminal = settings.machine_id;
                }
            }
            return this._syncTerminal;
        },

        _getDataPath: function() {
            if (this._dataPath == null) {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            }
            return this._dataPath;
        },
        
        _getSyncPushListObj: function() {
            if (this._syncPushListObj == null) {
                this._syncPushListObj = document.getElementById('syncstatuspushlist');
            }
            return this._syncPushListObj;
        },

        _getSyncPullListObj: function() {
            if (this._syncPullListObj == null) {
                this._syncPullListObj = document.getElementById('syncstatuspulllist');
            }
            return this._syncPullListObj;
        },

        _getDSBackupListObj: function() {
            if (this._dsbackupListObj == null) {
                this._dsbackupListObj = document.getElementById('dsbackuplist');
            }
            return this._dsbackupListObj;
        },

        _getDSBackupPath: function() {
            if (this._dsbackupPath == null) {
                let ds = GeckoJS.ConnectionManager.getDataSource('backup');
                this._dsbackupPath = ds.config.path;
            }
            return this._dsbackupPath;
        },

        _getSyncSettings: function() {
            if (this._syncSettings == null) {
                let settings = (new SyncSetting()).read();

                if (settings == null) {
                    settings = {};
                }
                this._syncSettings = settings;
            }
            return this._syncSettings;
        },

        _getModelClasses: function() {
            if (this._modelClasses == null) {
                let keys = GeckoJS.ClassRegistry.keys() || [];
                let models = [];

                keys.forEach(function(key) {
                    if (key.indexOf('ModelClass_') == 0) {
                        models.push(key.substr(11));
                    }
                });

                this._modelClasses = models;
            }
            return this._modelClasses;
        },

        _getSyncSuspendStatus: function(refresh) {
            let syncSettings = this._getSyncSettings();
            if (this._syncSuspendStatus == null || refresh) {
                var statusFile = new GeckoJS.File(this._syncSuspendStatusFile + syncSettings.machine_id);
                this._syncSuspendStatus = statusFile && statusFile.exists();
            }
            return this._syncSuspendStatus;
        },

        _getSyncedDatasources: function() {
            if (this._syncedDatasources == null) {
                let modelClasses = this._getModelClasses() || [];
                let dsList = [];
                let dsConfigs = {};

                modelClasses.forEach(function(modelClass) {
                   let model = GeckoJS.Model.getInstanceByName(modelClass);
                   if (model.behaviors && model.behaviors.indexOf('Sync') > -1) {
                       if (model.datasource && model.datasource.configName && !(model.datasource.configName in dsConfigs)) {
                           dsList.push({model: model, datasource: model.datasource});
                           dsConfigs[model.datasource.configName] = true;
                       }
                   }
                }, this);

                this._syncedDatasources = dsList;
            }
            return this._syncedDatasources;
        },

        _getIRCPackageListObj: function() {
            if (this._ircstatusListObj == null) {
                this._ircstatusListObj = document.getElementById('ircpackagelist');
            }
            return this._ircstatusListObj;
        },

        _execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(param, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
        },

        _showWaitPanel: function(message) {
            var waitPanel = document.getElementById('wait_panel');
            waitPanel.openPopupAtScreen(0, 0);

            var caption = document.getElementById( 'wait_caption' );
            caption.label = message;

            // release CPU for progressbar ...
            this.sleep(500);
            return waitPanel;
        },

        initSyncStatus: function() {

            let settings = this._getSyncSettings();
            let syncTerminal = this._getSyncTerminal(settings);

            if (syncTerminal == null) {
                syncTerminal = _('-- no contact --');
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Contacting Synchronization Server'),
                                      _('Failed to establish contact with the synchronization service. Please check network connectivity to the server at [' + settings.hostname + ']'));
            }

            settings.active = GeckoJS.String.parseBoolean(settings.active);
            if (settings.active) {
                document.getElementById('sync_indicator').setAttribute('class', 'custom-sync-enabled');
                document.getElementById('syncNow').setAttribute('disabled', 'false');
                document.getElementById('refreshSyncStatus').setAttribute('disabled', 'false');
            }
            else {
                document.getElementById('sync_indicator').setAttribute('class', 'custom-sync-disabled');
                document.getElementById('syncNow').setAttribute('disabled', 'true');
                document.getElementById('refreshSyncStatus').setAttribute('disabled', 'true');
            }

            this.refreshSyncSuspendStatus();
        },

        refreshSyncSuspendStatus: function() {
            let suspended = this._getSyncSuspendStatus();
            if (suspended) {
                document.getElementById('suspendResumeSync').label = _('Resume Sync');
            }
            else {
                document.getElementById('suspendResumeSync').label = _('Suspend Sync');
            }
        },

        refreshSyncStatus: function(noNotify) {

            let settings = this._getSyncSettings();
            let syncTerminal = this._getSyncTerminal(settings);
            let myTerminal = settings.machine_id;

            document.getElementById('sync_server').value = settings.hostname + ' [' + (syncTerminal || _('--no contact--')) + ']';

            // get list of datasources
            var dsList = this._getSyncedDatasources() || [];
            var statusPushList = [];
            var statusPullList = [];

            dsList.forEach(function(pair) {
                let model = pair.model;
                let ds = pair.datasource;
                let config = ds.config;

                // extract local index
                let localIndex = '';
                let localIndexResult = ds.fetchAll('select max(id) as "index" from syncs where machine_id="' + myTerminal + '"') || [];
                if (localIndexResult.length > 0) {
                    localIndex = localIndexResult[0].index;
                }

                // extract push index
                let pushIndex = '';
                if (syncTerminal) {
                    let pushIndexResult = ds.fetchAll('select last_synced as "index" from sync_remote_machines where machine_id = "' + syncTerminal + '"') || [];
                    if (pushIndexResult.length > 0) {
                        pushIndex = pushIndexResult[0].index;
                    }
                }
                
                statusPushList.push({
                    datasource: ds.configName,
                    database: config.database,
                    index: localIndex,
                    synced: pushIndex
                })

                // extract pull index
                let pullIndexResult = ds.fetchAll('select machine_id as "clientid", last_synced as "index" from sync_remote_machines where machine_id != "' + syncTerminal + '" ORDER BY machine_id') || [];
                pullIndexResult.forEach(function(client) {
                    statusPullList.push({
                        datasource: ds.configName,
                        database: config.database,
                        index: localIndex,
                        synced: client.index,
                        clientid: client.clientid
                    })
                }, this);

            }, this)

            // sort push list by datasource
            statusPushList = statusPushList.sort(function(a, b) {
                if (a.datasource > b.datasource) return 1;
                else if (a.datasource < b.datasource) return -1;
                else return 0
            });

            this._getSyncPushListObj().datasource = statusPushList;
            this._getSyncPullListObj().datasource = statusPullList;

            if (!noNotify) NotifyUtils.info(_('Synchronization status refreshed'));
        },

        syncNow: function() {
            let dataPath = this._getDataPath();
            let script = dataPath + '/vivipos_webapp/sync_client';

            let waitpanel = this._showWaitPanel(_('Performing Synchronization...'));
            if (this._execute(script, ['sync'])) {

                this.sleep(5000);

                this.refreshSyncStatus();

                waitpanel.hidePopup();

                NotifyUtils.info(_('Synchronization request executed'));
            }
            else {
                waitpanel.hidePopup();

                NotifyUtils.error(_('Failed to execute synchronization client'));
            }
        },

        purgeSync: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Purge Synchronization Data'),
                                        _('This action will irrecoverably remove change logs on all datasources and re-initialize local sync index. Are you sure you want to proceed?'))) {

                var waitpanel = this._showWaitPanel(_('Purging Synchronization Data...'));
                var dsList = this._getSyncedDatasources() || [];

                let success = 0;
                let total = dsList.length;
                dsList.forEach(function(pair) {
                    let model = pair.model;
                    let ds = pair.datasource;

                    // remove change logs
                    if (ds.begin(true)) {

                        if (ds.execute('delete from syncs')) {
                            if (ds.execute('delete from sync_remote_machines')) {
                                if (!ds.commit(true)) {
                                    ds.rollback(true);
                                    NotifyUtils.error(_('Unable to commit changes to datasource [%S]', [ds.configName]));
                                }
                                else {
                                    this.refreshSyncStatus();
                                    success++;
                                }
                            }
                            else {
                                ds.rollback(true);
                                NotifyUtils.error(_('Unable to re-initialize local index [sync_remote_machines] for datasource [%S]', [ds.configName]));
                            }
                        }
                        else {
                            ds.rollback(true);
                            NotifyUtils.error(_('Unable to purge change logs [syncs] from datasource [%S]', [ds.configName]));
                        }
                    }
                    else {
                        NotifyUtils.warn(_('Unable to obtain exclusive lock on datasource [%S]', [ds.configName]));
                    }
                }, this)

                waitpanel.hidePopup();
                if (success == total) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Synchronization Data'),
                                          _('Synchronization data successfully purged from all datasources'));
                }
                else if (success == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Synchronization Data'),
                                          _('Failed to purge synchronization data'));
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Synchronization Data'),
                                          _('Failed to purge synchronization data from some of the datasources'));
                }
            }
        },

        suspendResumeSync: function() {
            var suspended = this._getSyncSuspendStatus();
            var syncSettings = this._getSyncSettings();
            var statusFile = new GeckoJS.File(this._syncSuspendStatusFile + syncSettings.machine_id);

            if (suspended) {
                // do resume
                statusFile.remove();

                suspended = this._getSyncSuspendStatus(true);
                if (suspended) {
                    NotifyUtils.error(_('Failed to resume synchronization'));
                }
                else {
                    NotifyUtils.info(_('Synchronization to server resumed'));
                }
            }
            else {
                // do suspend
                statusFile.create();

                suspended = this._getSyncSuspendStatus(true);
                if (suspended) {
                    NotifyUtils.info(_('Synchronization to server suspended'));
                }
                else {
                    NotifyUtils.error(_('Failed to suspend synchronization'));
                }
            }

            this.refreshSyncSuspendStatus();
        },

        initRemoteDataList: function() {
            var settings = this._getSyncSettings();

            // show sync mode: uni-directional or bi-directional
            settings.pull_order = GeckoJS.String.parseBoolean(settings.pull_order);
            document.getElementById('syncMode').value = settings.pull_order ? _('Bi-directional Synchronization') : _('Uni-directional Synchronization');

            // show terminal number
            var terminal_no = settings.machine_id;
            document.getElementById('terminal_no').value = terminal_no;
        },

        refreshRemoteDataList: function() {
            var settings = this._getSyncSettings();
            var terminal_no = settings.machine_id;

            var terminals = {};
            var ds = new OrderModel().getDataSource();
            var tableList = ['cashdrawer_records',
                             'ledger_records',
                             'orders',
                             'shift_changes',
                             'shift_markers'];

            // check each table for foreign terminals
            tableList.forEach(function(table) {
                let records = ds.fetchAll('select distinct(terminal_no) as "terminal" from ' + table + ' where terminal_no != "' + terminal_no + '" ORDER BY terminal_no') || [];

                records.forEach(function(record) {
                    let terminal = record.terminal;
                    if (!(terminal in terminals)) {
                        terminals[terminal] = [];
                    }
                    terminals[terminal].push({table: table});
                })
            }, this);
            
            // dispatch event to allow extensions to add their own terminal/table list
            var evtData = {list: terminals, terminal_no: terminal_no};
            this.dispatchEvent('buildTerminalTableList', evtData);
            terminals = evtData.list;
            
            let terminalTableList = [];
            GeckoJS.BaseObject.getKeys(terminals).sort().forEach(function(key) {
                terminalTableList.push({terminal: key,
                                        tables: terminals[key]});
            })
            this.terminalTableList = terminalTableList;

            // initialize terminal list
            this._getTerminalListObj().datasource = terminalTableList;

            // initialize table list
            let tableListObj = this._getTableListObj();
            if (terminalTableList.length > 0) {
                this.selectRemoteTerminal(0);
            }
            else {
                this.selectRemoteTerminal(-1);
            }
        },

        selectRemoteTerminal: function(index) {
            let terminalTableList = this.terminalTableList;
            let tableListObj = this._getTableListObj();
            if (index > -1 && index < terminalTableList.length) {
                tableListObj.datasource = terminalTableList[index].tables;
            }
            else {
                tableListObj.datasource = [];
            }
        },

        removeRemoteData: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Purge Non-local Transaction Data'),
                                        _('This action will irrecoverably purge transaction data generated on other terminals. This is intended only for use on client terminals with uni-directional synchronization. Are you sure you want to proceed?'))) {

                var waitpanel = this._showWaitPanel(_('Purging Non-Local Transaction Data...'));

                var ds = new OrderModel().getDataSource();
                var terminal_no = this._getSyncSettings().machine_id;

                if (ds.begin(true)) {

                    // cashdrawer_records
                    ds.execute('delete from cashdrawer_records where terminal_no != "' + terminal_no + '"');
                    
                    // ledger records
                    ds.execute('delete from ledger_records where terminal_no != "' + terminal_no + '"');

                    // ledger receipts
                    ds.execute('delete from ledger_receipts where ledger_id not in (select id from ledger_records)');

                    // order queues
                    ds.execute('delete from order_queues');

                    // orders
                    ds.execute('delete from orders where terminal_no != "' + terminal_no + '"');

                    // order item taxes
                    ds.execute('delete from order_item_taxes where order_id not in (select id from orders)');

                    // order items
                    ds.execute('delete from order_items where order_id not in (select id from orders)');

                    // order item condiments
                    ds.execute('delete from order_item_condiments where order_id not in (select id from orders)');

                    // order additions
                    ds.execute('delete from order_additions where order_id not in (select id from orders)');

                    // order annotations
                    ds.execute('delete from order_annotations where order_id not in (select id from orders)');

                    // order objects
                    ds.execute('delete from order_objects where order_id not in (select id from orders)');

                    // order payments
                    ds.execute('delete from order_payments where order_id not in (select id from orders union select id from ledger_records)');

                    // order receipts
                    ds.execute('delete from order_receipts where order_id not in (select id from orders)');

                    // order promotions
                    ds.execute('delete from order_promotions where order_id not in (select id from orders)');

                    // shift changes
                    ds.execute('delete from shift_changes where terminal_no != "' + terminal_no + '"');

                    // shift change details
                    ds.execute('delete from shift_change_details where shift_change_id not in (select id from shift_changes)');

                    // shift markers
                    ds.execute('delete from shift_markers where terminal_no != "' + terminal_no + '"');

                    // uniform invoices
                    ds.execute('delete from uniform_invoices where terminal_no != "' + terminal_no + '"');

                    // uniform invoice markers
                    ds.execute('delete from uniform_invoice_markers where terminal_no != "' + terminal_no + '"');

                    // dispatch event to allow extensions to do their own cleanup
                    this.dispatchEvent('removeRemoteData', terminal_no);
                    
                    ds.commit(true);

                    waitpanel.hidePopup();

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Non-local Transaction Data'),
                                          _('Non-local Transaction data purged from datasource [%S]', [ds.configName]));
                }
                else {
                    ds.rollback(true);

                    waitpanel.hidePopup();
                    
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Non-local Transaction Data'),
                                          _('Unable to obtain lock on datasource [%S]', [ds.configName]));
                }
                
                this.refreshRemoteDataList();
            }
        },

        refreshSalePeriodData: function() {

            var terminal_no = GeckoJS.Session.get('terminal_no');
            
            // current sale period/shift number
            var currentSalePeriod = GeckoJS.Session.get('sale_period');
            var currentShiftNumber = GeckoJS.Session.get('shift_number');

            document.getElementById('current_sale_period').value = new Date(currentSalePeriod * 1000).toLocaleDateString();;
            document.getElementById('current_shift_number').value = currentShiftNumber;

            // last shift change
            var shiftChangeModel = new ShiftChangeModel();
            var shiftChangeRecord = shiftChangeModel.find('first', {conditions: 'terminal_no = "' + terminal_no + '"',
                                                                    recursive: 0,
                                                                    order: 'sale_period desc, shift_number desc'});
            var lastSalePeriod = '';
            var lastShiftNumber = '';

            if (shiftChangeRecord) {
                lastSalePeriod = shiftChangeRecord.sale_period;
                lastShiftNumber = shiftChangeRecord.shift_number;
            }

            document.getElementById('last_sale_period').value = (lastSalePeriod == '') ? '' : new Date(lastSalePeriod * 1000).toLocaleDateString();
            document.getElementById('last_shift_number').value = lastShiftNumber;

            // last ledger entry
            var ledgerRecordModel = new LedgerRecordModel();
            var ledgerRecord = ledgerRecordModel.find('first', {conditions: 'terminal_no = "' + terminal_no + '"',
                                                                recursive: 0,
                                                                order: 'sale_period desc, shift_number desc, created desc'});

            // last transaction entry
            var orderModel = new OrderModel();
            var orderRecord = orderModel.find('first', {conditions: 'terminal_no = "' + terminal_no + '"',
                                                        recursive: 0,
                                                        order: 'sale_period desc, shift_number desc, transaction_submitted desc'});

            // last activity sale period/shift number
            var activitySalePeriod = -1;
            var activityShiftNumber = -1;
            var activityTime = -1
            var activityType;

            if (ledgerRecord) {
                activitySalePeriod = ledgerRecord.sale_period;
                activityShiftNumber = ledgerRecord.shift_number;
                activityTime = ledgerRecord.created;
                activityType = _('(activity)ledger');
            }

            if (orderRecord) {
                if (orderRecord.sale_period >= activitySalePeriod &&
                    orderRecord.shift_number >= activityShiftNumber) {
                    activitySalePeriod = orderRecord.sale_period;
                    activityShiftNumber = orderRecord.shift_number;

                    if (orderRecord.sale_period == activitySalePeriod &&
                        orderRecord.shift_number == activityShiftNumber) {
                        if (orderRecord.transaction_submitted >= activityTime) {
                            activityType = _('(activity)transaction');
                            activityTime = orderRecord.transaction_submitted;
                        }
                    }
                    else {
                        activityTime = orderRecord.transaction_submitted;
                    }
                }
            }

            // populate fields
            if (activityType == null) {
                document.getElementById('activity_sale_period').value = '';
                document.getElementById('activity_shift_number').value = '';
                document.getElementById('activity_type').value = '';
                document.getElementById('activity_time').value = '';
            }
            else {
                document.getElementById('activity_sale_period').value = new Date(activitySalePeriod * 1000).toLocaleDateString();
                document.getElementById('activity_shift_number').value = activityShiftNumber;
                document.getElementById('activity_type').value = activityType;
                document.getElementById('activity_time').value = new Date(activityTime * 1000).toLocaleString();
            }

            // set new sale period to last sale period
            if (lastSalePeriod != '') {
                document.getElementById('new_sale_period').value = lastSalePeriod * 1000;
                document.getElementById('new_shift_number').value = lastShiftNumber;
            }
            else {
                document.getElementById('new_sale_period').value = currentSalePeriod * 1000;
                document.getElementById('new_shift_number').value = currentShiftNumber;
            }

            // last transaction sequence number for current sale period
            var fields = '';
            var orderSequence = '';

            if (GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod')) {
                fields = 'max(CAST(substr(sequence, 9) as INTEGER)) as "max_seq"';
            }
            else {
                fields = 'max(CAST(sequence as INTEGER)) as "max_seq"';
            }
            var sequenceRecord = orderModel.find('first', {fields: [fields],
                                                         recursive: 0,
                                                         conditions: 'terminal_no = "' + terminal_no + '" AND sale_period=' + currentSalePeriod + ' AND shift_number=' + currentShiftNumber});
            if (sequenceRecord && sequenceRecord.max_seq != null) {
                orderSequence = parseInt(sequenceRecord.max_seq);
            }
            document.getElementById('order_sequence').value = orderSequence;
            if (orderSequence != '') {
                document.getElementById('new_order_sequence').value = orderSequence + 1;
            }
        },

        resetSalePeriod: function() {
            var terminal_no = GeckoJS.Session.get('terminal_no');

            var newSalePeriodDate = new Date(parseInt(document.getElementById('new_sale_period').value)).clearTime();
            var newSalePeriod = newSalePeriodDate.getTime() / 1000;
            var newShiftNumber = parseInt(document.getElementById('new_shift_number').value);
            var newSalePeriodStr = newSalePeriodDate.toLocaleDateString();

            var currentSalePeriod = GeckoJS.Session.get('sale_period');;
            var currentShiftNumber = GeckoJS.Session.get('shift_number');
            var currentSalePeriodStr = new Date(currentSalePeriod * 1000).toLocaleDateString();

            // determine last sale period/shift
            var lastSalePeriodStr = ' -- ';
            var lastSalePeriod = -1;
            var lastShiftNumber = ' -- ';
            var shiftChangeModel = new ShiftChangeModel();
            var lastShiftRecord = shiftChangeModel.find('first', {conditions: 'terminal_no = "' + terminal_no + '" AND (sale_period < ' + newSalePeriod + ' OR (sale_period = ' + newSalePeriod + ' AND shift_number < ' + newShiftNumber + '))',
                                                                  recursive: 0,
                                                                  order: 'sale_period desc, shift_number desc'});
                                                              
            if (lastShiftRecord) {
                lastSalePeriod = lastShiftRecord.sale_period;
                lastSalePeriodStr = new Date(lastShiftRecord.sale_period * 1000).toLocaleDateString();
                lastShiftNumber = lastShiftRecord.shift_number;
            }

            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Reset Sale Period'),
                                        _('You are attempting to reset sale period from [%S, %S] to [%S, %S]. This will cause the following to happen:\n\n  - set current sale period to [%S] and shift number to [%S]\n  - remove shift change records for shifts starting at sale period [%S] and shift [%S]\n  - move all activities since sale period [%S] and shift [%S] to new sale period [%S] and shift [%S]\n\nAre you sure you want to proceed?',
                                          [currentSalePeriodStr, currentShiftNumber, newSalePeriodStr, newShiftNumber, newSalePeriodStr, newShiftNumber, newSalePeriodStr, newShiftNumber, lastSalePeriodStr, lastShiftNumber, newSalePeriodStr, newShiftNumber]))) {

                // put up wait panel
                let waitPanel = this._showWaitPanel(_('Resetting Sale Period...'));

                // update current sale period
                let mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                                    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                let shiftChangeController = mainWindow.GeckoJS.Controller.getInstanceByName('ShiftChanges');
                if (shiftChangeController) {
                    shiftChangeController._setShift(newSalePeriod, newShiftNumber, false, false);
                }

                var ds = shiftChangeModel.getDataSource();
                if (ds.begin(true)) {

                    // remove shift change records beyond new sale period and shift
                    var lastShiftRecords = shiftChangeModel.find('all', {conditions: 'terminal_no = "' + terminal_no + '" AND (sale_period > ' + newSalePeriod + ' OR (sale_period = ' + newSalePeriod + ' AND shift_number >= ' + newShiftNumber + '))',
                                                                         recursive: 0,
                                                                         limit: 3000000}) || [];
                    lastShiftRecords.forEach(function(record) {
                        shiftChangeModel.removeShiftChange(record.terminal_no, record.sale_period, record.shift_number);
                    })

                    // update ledger records
                    var ledgerRecordModel = new LedgerRecordModel();
                    var orderPaymentModel = new OrderPaymentModel();
                    var ledgerRecords;
                    if (lastShiftRecord) {
                        ledgerRecords = ledgerRecordModel.find('all', {conditions: 'terminal_no = "' + terminal_no + '" AND (sale_period > ' + lastSalePeriod + ' OR (sale_period = ' + lastSalePeriod + ' AND shift_number > ' + lastShiftNumber + '))',
                                                                       recursive: 0,
                                                                       limit: 3000000});
                    }
                    else {
                        ledgerRecords = ledgerRecordModel.find('all', {recursive: 0, limit: 3000000});
                    }
                    ledgerRecords.forEach(function(ledger) {
                       ledgerRecordModel.id = ledger.id;
                       ledger.sale_period = newSalePeriod;
                       ledger.shift_number = newShiftNumber;

                       ledgerRecordModel.save(ledger);

                       // update payment record
                       let paymentRecords = orderPaymentModel.findByIndex('all', {index: 'order_id', value: ledger.id, limit: 3000000});
                       paymentRecords.forEach(function(payment) {
                           orderPaymentModel.id = payment.id;
                           payment.sale_period = newSalePeriod;
                           payment.shift_number = newShiftNumber;

                           orderPaymentModel.save(payment);
                       });

                    });
                    // update orders
                    var orderModel = new OrderModel();
                    var orderRecords;
                    if (lastShiftRecord) {
                        orderRecords = orderModel.find('all', {conditions: 'terminal_no = "' + terminal_no + '" AND (sale_period > ' + lastSalePeriod + ' OR (sale_period = ' + lastSalePeriod + ' AND shift_number > ' + lastShiftNumber + '))',
                                                               recursive: 0,
                                                               limit: 3000000});
                    }
                    else {
                        orderRecords = orderModel.find('all', {recursive: 0, limit: 3000000});
                    }
                    orderRecords.forEach(function(order) {
                       orderModel.id = order.id;
                       order.sale_period = newSalePeriod;
                       order.shift_number = newShiftNumber;

                       orderModel.save(order);

                       // update payment record
                       let paymentRecords = orderPaymentModel.findByIndex('all', {index: 'order_id', value: order.id, limit: 3000000});
                       paymentRecords.forEach(function(payment) {
                           orderPaymentModel.id = payment.id;
                           payment.sale_period = newSalePeriod;
                           payment.shift_number = newShiftNumber;

                           orderPaymentModel.save(payment);
                       });

                    });

                    // dispatch event to allow extensions to perform their own clean up tasks
                    this.dispatchEvent('resetSalePeriod', {new_sale_period: newSalePeriod, new_shift_number: newShiftNumber,
                                                           last_sale_period: lastSalePeriod, last_shift_number: lastShiftNumber});

                    ds.commit(true);
                    
                    waitPanel.hidePopup();

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Reset Sale Period'),
                                          _('Current sale period successfully reset'));
                }
                else {
                    ds.rollback(true);

                    waitpanel.hidePopup();

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Reset Sale Period'),
                                          _('Unable to obtain lock on datasource [%S]', [ds.configName]));
                }

                this.refreshSalePeriodData();
            }
        },

        refreshOrderSequence: function() {
            var sequenceModel = new SequenceModel();
            var seq = sequenceModel.findByIndex('first', {
                index: 'key',
                value: 'order_no'
            });

            if (seq) {
                document.getElementById('current_order_sequence').value = seq.value;
                document.getElementById('new_order_sequence').value = seq.value + 1;
            }
            else {
                document.getElementById('current_order_sequence').value = '';
                document.getElementById('new_order_sequence').value = '';
            }
        },

        resetOrderNumber: function() {
            var newOrderSequence = document.getElementById('new_order_sequence').value;
            if (newOrderSequence != null && newOrderSequence != '' && !isNaN(parseInt(newOrderSequence))) {
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Reset Order Sequence'),
                                            _('This action will set the local order sequence number to [%S], and could lead to duplicate sequence numbers and must be used with extreme care. Are you sure you want to proceed?', [newOrderSequence]))) {
                    var sequenceModel = new SequenceModel();
                    sequenceModel.setLocalSequence('order_no', newOrderSequence);

                    this.refreshOrderSequence();
                    
                    NotifyUtils.info(_('Local order sequence number set to [%S]', [newOrderSequence]));
                }
            }
            else {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Reset Order Sequence'),
                                      _('New order sequence number [%S] is invalid', [newOrderSequence]));
            }
        },

        refreshDSBackupData: function(noNotify) {
            let path = this._getDSBackupPath();
            let nsIFiles = GeckoJS.Dir.readDir(path, {type: 'f'});
            files = nsIFiles.sort(function(f1, f2) {
                if (f1.leafName > f2.leafName) return 1;
                else if (f1.leafName < f2.leafName) return -1;
                else return 0;
            }).map(function(nsIFile) {
                return {file: nsIFile,
                        model: nsIFile.leafName,
                        size: GeckoJS.NumberHelper.toReadableSize(nsIFile.fileSize)}
            });

            this._dsbackupFiles = files;

            this._getDSBackupListObj().datasource = files;
            
            this._getDSBackupListObj().selection.clearSelection();

            // view button
            document.getElementById('viewDatasourceBackup').disabled = true;

            // remove button
            document.getElementById('removeDatasourceBackup').disabled = true;

            // purge button
            document.getElementById('purgeDatasourceBackup').disabled = (files.length == 0);

            if (!noNotify) NotifyUtils.info(_('Datasource backup list refreshed'));
        },

        selectDSBackup: function() {
            // view button
            document.getElementById('viewDatasourceBackup').disabled = false;

            // remove button
            document.getElementById('removeDatasourceBackup').disabled = false;
        },

        viewDSBackupData: function() {
            let dsbackupListObj = this._getDSBackupListObj();
            let index = dsbackupListObj.selectedIndex;
            if (index > -1 && index < this._dsbackupFiles.length) {
                let dsbackup = this._dsbackupFiles[index];
                
                VirtualKeyboard.show();

                let launchApp = this._fileViewer;

                let fileApp = new GeckoJS.File(this._fileViewer);
                fileApp.run([dsbackup.file.path], true);

                VirtualKeyboard.hide();
            }
        },

        removeDSBackupData: function() {
            let dsbackupListObj = this._getDSBackupListObj();
            let index = dsbackupListObj.selectedIndex;
            if (index > -1 && index < this._dsbackupFiles.length) {
                let dsbackup = this._dsbackupFiles[index];
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Remove Datasource Backup Data'),
                                            _('This action will irrecoverably remove backup data for model [%S]. This may result in loss of customer data. Are you sure you want to proceed?', [dsbackup.model]))) {

                    let nsIFile = dsbackup.file;
                    if (nsIFile.exists()) {
                        GREUtils.File.remove(nsIFile);

                        this.refreshDSBackupData(true);

                        if (!nsIFile.exists()) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                                  _('Remove Datasource Backup Data'),
                                                  _('Backup data for model [%S] successfully removed', [dsbackup.model]));
                        }
                        else {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                                  _('Remove Datasource Backup Data'),
                                                  _('Failed to remove backup data for model [%S]', [dsbackup.model]));
                        }
                    }
                }
            }
        },

        purgeDSBackupData: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Purge Datasource Backup Data'),
                                        _('This action will irrecoverably remove all datasource backup data. This may result in loss of customer data. Are you sure you want to proceed?'))) {

                let path = this._getDSBackupPath();
                let nsIFiles = GeckoJS.Dir.readDir(path, {type: 'f'});
                let total = nsIFiles.length;
                let removed = 0;
                nsIFiles.forEach(function(nsIFile) {
                    if (nsIFile.exists()) {
                        GREUtils.File.remove(nsIFile);
                        if (!nsIFile.exists()) removed++;
                    }
                })
                this.refreshDSBackupData(true);
                
                if (removed == total) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Datasource Backup Data'),
                                          _('Datasource backup data successfully purged'));
                }
                else if (removed == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Datasource Backup Data'),
                                          _('Failed to purge datasource backup data'));
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Purge Datasource Backup Data'),
                                          _('Failed to purge some of the datasource backup data'));
                }
            }
        },

        refreshIRCStatus: function(noNotify) {

            let rootPath = this._ircRootPath;

            // read IRC host
            let syncSettings = this._getSyncSettings();
            document.getElementById('irc_hostname').value = syncSettings.irc_hostname;
            
            // read last download timestamp
            let timestamp = '';
            let lastDownloadedFile = new GeckoJS.File(rootPath + 'last_downloaded');
            if (lastDownloadedFile && lastDownloadedFile.exists()) {
                lastDownloadedFile.open('r');
                let lines = lastDownloadedFile.readAllLine();
                if (lines && lines.length > 0 && !isNaN(parseInt(lines[0]))) {
                    timestamp = new Date(parseInt(lines[0]) * 1000).toLocaleFormat('%Y%m%d%H%M%S');
                }
            }
            document.getElementById('irc_last_downloaded').value = timestamp;

            // read last error package
            let failedPackage = '';
            this._ircLastFailedPackage = null;

            let failedPackageFile = new GeckoJS.File(rootPath + 'last_error_package');
            if (failedPackageFile && failedPackageFile.exists()) {
                failedPackageFile.open('r');
                let lines = failedPackageFile.readAllLine();
                if (lines && lines.length > 0) {
                    failedPackage = lines[0];
                }
            }
            this._ircLastFailedPackage = failedPackage;
            document.getElementById('irc_last_failure').value = failedPackage;
            document.getElementById('viewIRCLastFailure').disabled = (failedPackage == '');
            document.getElementById('clearIRCFailure').disabled = (failedPackage == '');

            // read all packages
            let pkglist = [];
            let packages = {};
            let pkgFiles = GeckoJS.Dir.readDir(rootPath + 'queues', {type: 'f'}) || [];
            pkgFiles.forEach(function(file) {
                let baseName = file.leafName.substr(0, file.leafName.indexOf('.'));
                if (!(baseName in packages)) {
                    packages[baseName] = {pkg: baseName,
                                          created: 0,
                                          source: '-',
                                          unpacked: false}
                }

                if (file.leafName == baseName + '.tbz') {
                    packages[baseName].size = GeckoJS.NumberHelper.toReadableSize(file.fileSize)
                }
                else if (file.leafName == baseName + '.tbz.json') {
                    let f = new GeckoJS.File(file);
                    f.open('r');
                    let lines = f.readAllLine();
                    if (lines.length > 0 && lines[0].length > 0) {
                        let desc = GeckoJS.BaseObject.unserialize(lines[0]);
                        if (desc) {
                            packages[baseName].created = desc.created;
                            packages[baseName].source = desc.created_machine_id;
                        }
                    }
                }
                else if (file.leafName == baseName + '.tbz.unpacklog.json') {
                    packages[baseName].unpacked = true;
                    packages[baseName].unpacklog = file.path;
                }
            }, this)
            for (let key in packages) {
                pkglist.push(packages[key]);
            }
            pkglist.sort(function(a, b) {
                if (a.pkg > b.pkg)
                    return 1
                else if (a.pkg < b.pkg)
                    return -1
                else return 0;
            });
            
            this._ircPackages = pkglist;

            this._getIRCPackageListObj().datasource = pkglist;
            this._getIRCPackageListObj().selection.clearSelection();

            document.getElementById('viewIRCUpackResult').disabled = true;
            document.getElementById('setIRCLastDownload').disabled = true;

            if (!noNotify) NotifyUtils.info(_('IRC status refreshed'));
        },

        viewIRCLastFailure: function() {
            let rootPath = this._ircRootPath;
            let failedPackage = this._ircLastFailedPackage;
            let unpacklog = rootPath + 'queues/' + failedPackage + '.unpacklog.json';
            
            let file = new GeckoJS.File(unpacklog);
            if (file.exists() && file.isReadable()) {
                VirtualKeyboard.show();

                let launchApp = this._fileViewer;

                let fileApp = new GeckoJS.File(this._fileViewer);
                fileApp.run([unpacklog], true);

                VirtualKeyboard.hide();
            }
            else {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('View Last Failure'),
                                      _('Unpack log for package [%S] no longer exists', [failedPackage]));
            }
        },

        clearIRCFailure: function() {
            let rootPath = this._ircRootPath;
            let failedPackage = this._ircLastFailedPackage;
            
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Clear Last Failure'),
                                        _('This action will remove the failure flag for package [%S] and allow it to be re-applied. Are you sure you want to proceed?', [failedPackage]))) {

                let unpacklogPath = rootPath + 'queues/' + failedPackage + '.unpacklog.json';
                let unpacklogFile = new GeckoJS.File(unpacklogPath);
                unpacklogFile.remove();

                let lastFailurePath = rootPath + 'last_error_package';
                let lastFailureFile = new GeckoJS.File(lastFailurePath);
                lastFailureFile.remove();

                this.refreshIRCStatus();
                
                if (unpacklogFile.exists() || lastFailureFile.exists()) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Clear Last Failure'),
                                          _('Failed to clear the failure flag'));
                }
                else {
                    NotifyUtils.info(_('Last failure cleared'));
                }
            }
        },

        viewIRCUpackResult: function() {
            let ircStatusListObj = this._getIRCPackageListObj();
            let index = ircStatusListObj.selectedIndex;
            if (index > -1 && index < this._ircPackages.length) {
                let pkg = this._ircPackages[index];

                VirtualKeyboard.show();

                let launchApp = this._fileViewer;

                let fileApp = new GeckoJS.File(this._fileViewer);
                fileApp.run([pkg.unpacklog], true);

                VirtualKeyboard.hide();
            }
        },

        selectIRCPackage: function() {
            let unpacked = false;
            let ircStatusListObj = this._getIRCPackageListObj();
            let index = ircStatusListObj.selectedIndex;
            if (index > -1 && index < this._ircPackages.length) {
                let pkg = this._ircPackages[index];
                unpacked = pkg.unpacked;
            }
            // view button
            document.getElementById('viewIRCUpackResult').disabled = !unpacked;

            // download button
            document.getElementById('setIRCLastDownload').disabled = false;
        },

        _resetIRCLastDownload: function(timestamp) {
            let rootPath = this._ircRootPath;
            let result = 0;
            let lastDownloadedFile = new GeckoJS.File(rootPath + 'last_downloaded', true);
            if (lastDownloadedFile && lastDownloadedFile.exists()) {
                lastDownloadedFile.open('w');
                result = lastDownloadedFile.write(timestamp);
                lastDownloadedFile.close();
            }
            return result;
        },

        resetIRCLastDownload: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Reset Download Timestamp'),
                                        _('This action will reset timestamp to [0]. Are you sure you want to proceed?'))) {
                if (this._resetIRCLastDownload(0)) {
                    NotifyUtils.info(_('Download timestamp reset to [0]'));
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Reset Download Timestamp'),
                                          _('Failed to reset download timestamp'));
                }
                this.refreshIRCStatus();
            }
        },

        setIRCLastDownload: function() {
            let rootPath = this._ircRootPath;
            let ircStatusListObj = this._getIRCPackageListObj();
            let index = ircStatusListObj.selectedIndex;
            if (index > -1 && index < this._ircPackages.length) {
                let pkg = this._ircPackages[index];

                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Re-Download Packages'),
                                            _('This action will remove package [%S] and all later packages and reset timestamp to cause them to be downloaded from the server again. Are you sure you want to proceed?', [pkg.pkg]))) {

                    // remove packages including and after the selected entry
                    for (; index < this._ircPackages.length; index++) {
                        this._execute('/bin/rm', ['-f', rootPath + 'queues/' + this._ircPackages[index].pkg + '.tbz']);
                        this._execute('/bin/rm', ['-f', rootPath + 'queues/' + this._ircPackages[index].pkg + '.tbz.json']);
                        this._execute('/bin/rm', ['-f', rootPath + 'queues/' + this._ircPackages[index].pkg + '.tbz.unpacklog.json']);
                    }

                    // set last downloaded to the selected package time minus 1
                    let newtimestamp = pkg.created - 1;
                    let rc = this._resetIRCLastDownload(newtimestamp);
                    if (rc) {
                        NotifyUtils.info(_('Selected package(s) cleared and download timestamp updated to [%S]', [newtimestamp]));
                    }
                    else {
                        GREUtils.Dialog.alert(this.topmostWindow,
                                              _('Re-Download Packages'),
                                              _('Failed to update last download timestamp'));
                    }

                    this.refreshIRCStatus();
                }
            }
        },

        load: function() {
            // initialize sync list
            this.initSyncStatus();

            // initialize remote data list
            this.initRemoteDataList();

            // refresh sync list
            this.refreshSyncStatus(true);

            // refresh remote data list
            this.refreshRemoteDataList();

            // refresh order sequence
            this.refreshOrderSequence();

            // refresh sale period data; must happen after order sequence is refreshed
            this.refreshSalePeriodData();

            // refresh datasource backup data
            this.refreshDSBackupData(true);

            // refresh irc status
            this.refreshIRCStatus(true);
            
            this.dispatchEvent('initial');
        }

    };

    AppController.extend(__controller__);

})();

