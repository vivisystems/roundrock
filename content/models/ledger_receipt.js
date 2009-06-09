var LedgerReceiptModel = window.LedgerReceiptModel =  GeckoJS.Model.extend({
    name: 'LedgerReceipt',

    useDbConfig: 'order',

    belongsTo: ['Order'],

    behaviors: ['Sync'],
    
    autoRestoreFromBackup: true

    
});
