var UniformInvoiceModel = window.UniformInvoiceModel =  GeckoJS.Model.extend({
    name: 'UniformInvoice',

    useDbConfig: 'extension',

    belongsTo: ['Order'],

    behaviors: ['Sync']
    
});
