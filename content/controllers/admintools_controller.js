(function(){

    var __controller__ = {

        name: 'AdminTools',

        _dataPath: null,
        _modelClasses: null,
        _syncedDatasources: null,
        _syncListObj: null,
        _syncSettings: null,

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

        refreshSyncStatus: function() {

            let settings = this._getSyncSettings();
            let syncServer = settings.hostname;
            document.getElementById('sync_server').value = syncServer;

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
                let remoteIndexResult = ds.fetchAll('select last_synced as "index" from sync_remote_machines where machine_id = "' + syncServer + '"') || [];
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
            if (this._execute(script, ['sync'])) {

                this.refreshSyncStatus();
                
                NotifyUtils.info(_('Synchronization request executed'));
            }
        },

        load: function() {

            // update sync list
            this.refreshSyncStatus();
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

