(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'LedgerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        saveLedgerEntry: function(data) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            var r = this.save(data);
            if (!r && !isTraining) {
                this.log('ERROR',
                         'An error was encountered while saving ledger activity (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup\n' + this.dump(data));
                }
            }
            return r;
        }
    };

    var LedgerRecordModel = window.LedgerRecordModel = AppModel.extend(__model__);
    
})();
