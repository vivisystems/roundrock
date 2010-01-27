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

        _getSyncTerminal: function(hostname) {
            if (!this._syncTerminal) {
                var httpService = this._getHttpServiceSync(hostname);
                var remoteUrl = httpService.getRemoteServiceUrl('auth');

                this._syncTerminal = httpService.requestRemoteService('GET', remoteUrl, null, null, null, true);
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
            let syncTerminal = this._getSyncTerminal(settings.hostname);

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
            let syncTerminal = this._getSyncTerminal(settings.hostname);
            document.getElementById('sync_server').value = settings.hostname + ' [' + syncTerminal + ']';

            // get list of datasources
            var dsList = this._getSyncedDatasources() || [];
            var statusList = [];

            dsList.forEach(function(pair) {
                let model = pair.model;
                let ds = pair.datasource;
                let config = ds.config;

                // extract local index
                let localIndex = '';
                let localIndexResult = ds.fetchAll('select max(id) as "index" from syncs') || [];
                if (localIndexResult.length > 0) {
                    localIndex = localIndexResult[0].index;
                }

                // extract remote index
                let remoteIndex = '';
                let remoteIndexResult = ds.fetchAll('select last_synced as "index" from sync_remote_machines where machine_id = "' + syncTerminal + '"') || [];
                if (remoteIndexResult.length > 0) {
                    remoteIndex = remoteIndexResult[0].index;
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
            var terminalTableList = ['cashdrawer_records',
                                     'ledger_records',
                                     'orders',
                                     'shift_changes',
                                     'shift_markers',
                                     'uniform_invoices',
                                     'uniform_invoice_markers'];

            // check each table for foreign terminals
            terminalTableList.forEach(function(table) {
                let records = ds.fetchAll('select distinct(terminal_no) as "terminal" from ' + table + ' where terminal_no != "' + terminal_no + '" ORDER BY terminal_no') || [];

                records.forEach(function(record) {
                    let terminal = record.terminal;
                    if (!(terminal in terminals)) {
                        terminals[terminal] = [];
                    }
                    terminals[terminal].push({table: table});
                })
            }, this);
            
            let terminalTableList = [];
            GeckoJS.BaseObject.getKeys(terminals).sort().forEach(function(key) {
                terminalTableList.push({terminal: key,
                                        tables: terminals[key]});
            })

            // dispatch event to allow extensions to add their own terminal/table list
            this.dispatchEvent('buildTerminalTableList', terminalTableList);

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
                    this.dispatchEvent('remoteRemoteData');
                    
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

        load: function() {

            // initialize sync list
            this.initSyncStatus();

            // initialize remote data list
            this.initRemoteDataList();

            // refresh sync list
            this.refreshSyncStatus();

            // refresh remote data list
            this.refreshRemoteDataList();
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

