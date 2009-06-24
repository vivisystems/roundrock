(function() {

    var __model__ = {

        name: 'OrderReceipt',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        saveReceipt: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving order receipt (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup: %S' + '\n' + this.dump(data));
                }
            }
            return r;
        }
    }

    var OrderReceiptModel = window.OrderReceiptModel =  GeckoJS.Model.extend(__model__);

})();
