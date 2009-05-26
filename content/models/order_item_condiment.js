var OrderItemCondimentModel = window.OrderItemCondimentModel =  GeckoJS.Model.extend({
    name: 'OrderItemCondiment',

    useDbConfig: 'order',

    belongsTo: ['Order'],
    
    behaviors: ['Sync'],

    autoRestoreFromBackup: true

    
});
