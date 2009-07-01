(function() {

    var __model__ = {

        name: 'ShiftMarker',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        saveMarker: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         _('An error was encountered while saving shift marker (error code %S): %S', [this.lastError, this.lastErrorString]));

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', _('record saved to backup'));
                }
                else {
                    this.log('ERROR',
                             _('record could not be saved to backup: %S', ['\n' + this.dump(data)]));
                }
            }
            return r;
        }
    }
    
    var ShiftMarkerModel = window.ShiftMarkerModel = GeckoJS.Model.extend(__model__);

})();
