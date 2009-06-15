(function() {

    var __model__ = {
        name: 'LedgerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Training'],

        saveLedgerEntry: function(data) {
            var r = this.save(data);
            if (!r) {
                r = this.saveToBackup(data);
            }
            return r;
        }
    };

    var LedgerRecordModel = window.LedgerRecordModel = GeckoJS.Model.extend(__model__);
    
})();