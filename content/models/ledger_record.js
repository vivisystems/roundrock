(function() {

    var __model__ = {

        name: 'LedgerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        saveLedgerEntry: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         _('An error was encountered while saving ledger activity (error code %S): %S', [this.lastError, this.lastErrorString]));

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
    };

    var LedgerRecordModel = window.LedgerRecordModel = GeckoJS.Model.extend(__model__);
    
})();