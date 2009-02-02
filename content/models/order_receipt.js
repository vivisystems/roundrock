var OrderReceiptModel = window.OrderReceiptModel =  GeckoJS.Model.extend({
    name: 'OrderReceipt',

    useDbConfig: 'order',

    belongsTo: ['Order']
    
});
