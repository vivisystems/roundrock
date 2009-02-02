var SyncModel = window.SyncModel =  GeckoJS.Model.extend({
    
    name: 'Sync',

    useDbConfig: 'default',
    
    isActive: function() {
	return true;

        var syncSettings = (new SyncSettingModel()).read();
        if(syncSettings) {
            return syncSettings['active'] == 1;
        }
        return false;
    }

});
