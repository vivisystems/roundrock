(function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'LedgerReceipt',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        saveReceipt: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving ledger receipt (error code ' + this.lastError + '): ' + this.lastErrorString);

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
    }

    var LedgerReceiptModel = window.LedgerReceiptModel =  AppModel.extend(__model__);

})();