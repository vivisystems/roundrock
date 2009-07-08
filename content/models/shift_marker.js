(function() {

    var __model__ = {

        name: 'ShiftMarker',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        saveMarker: function(data) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            var r = this.save(data);
            if (!r && !isTraining) {
                this.log('ERROR',
                         'An error was encountered while saving shift marker (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup' + this.dump(data));
                }
            }
            return r;
        }
    }
    
    var ShiftMarkerModel = window.ShiftMarkerModel = GeckoJS.Model.extend(__model__);

})();
