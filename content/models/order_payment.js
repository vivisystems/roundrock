(function() {

    var __model__ = {

        name: 'OrderPayment',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        saveLedgerPayment: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         _('An error was encountered while saving ledger payment (error code %S): %S', [this.lastError, this.lastErrorString]));

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
    var OrderPaymentModel = window.OrderPaymentModel =  GeckoJS.Model.extend(__model__);

})();
