var OrderItemModel = window.OrderItemModel =  GeckoJS.Model.extend({
    name: 'OrderItem',

    useDbConfig: 'order',

    belongsTo: ['Order'],
    
    behaviors: ['Sync', 'Training']

    
});
