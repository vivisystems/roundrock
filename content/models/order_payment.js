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
                r = this.saveToBackup(data);
            }
            return r;
        }
    }
    var OrderPaymentModel = window.OrderPaymentModel =  GeckoJS.Model.extend(__model__);

})();
