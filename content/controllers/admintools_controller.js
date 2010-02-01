(function(){

    var __controller__ = {

        name: 'AdminTools',

        _dataPath: null,
        _modelClasses: null,
        _syncedDatasources: null,
        _syncListObj: null,
        _syncSettings: null,
        _syncTerminal: null,
        _httpServiceSync: null,

        _terminalListObj: null,
        _tableListObj: null,

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
        
        _getSyncListObj: function() {
            if (this._syncListObj == null) {
                this._syncListObj = document.getElementById('syncstatuslist');
            }
            return this._syncListObj;
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
        },

        refreshSyncStatus: function() {

            let settings = this._getSyncSettings();
            let syncTerminal = this._getSyncTerminal(settings);
            let myTerminal = settings.machine_id;

            document.getElementById('sync_server').value = settings.hostname + ' [' + (syncTerminal || _('--no contact--')) + ']';

            // get list of datasources
            var dsList = this._getSyncedDatasources() || [];
            var statusList = [];

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

                // extract remote index
                let remoteIndex = '';
                if (syncTerminal) {
                    let remoteIndexResult = ds.fetchAll('select last_synced as "index" from sync_remote_machines where machine_id = "' + syncTerminal + '"') || [];
                    if (remoteIndexResult.length > 0) {
                        remoteIndex = remoteIndexResult[0].index;
                    }
                }
                
                statusList.push({
                    datasource: ds.configName,
                    database: config.database,
                    index: localIndex,
                    synced: remoteIndex
                })
            }, this)

            document.getElementById('syncstatuslist').datasource = statusList;
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

        load: function() {

            // initialize sync list
            this.initSyncStatus();

            // initialize remote data list
            this.initRemoteDataList();

            // refresh sync list
            this.refreshSyncStatus();

            // refresh remote data list
            this.refreshRemoteDataList();

            // refresh order sequence
            this.refreshOrderSequence();

            // initialize sale period data; must happen after order sequence is refreshed
            this.refreshSalePeriodData();

            this.dispatchEvent('initial');
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

