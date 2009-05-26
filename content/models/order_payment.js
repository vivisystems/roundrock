var OrderPaymentModel = window.OrderPaymentModel =  GeckoJS.Model.extend({
    name: 'OrderPayment',

    useDbConfig: 'order',
    
    belongsTo: ['Order'],

    behaviors: ['Sync'],
    
    autoRestoreFromBackup: true
    
});
