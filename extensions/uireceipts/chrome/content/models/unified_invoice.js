var UnifiedInvoiceModel = window.UnifiedInvoiceModel =  GeckoJS.Model.extend({
    name: 'UnifiedInvoice',

    useDbConfig: 'extension',

    belongsTo: ['Order'],

    behaviors: ['Sync']
    
});
