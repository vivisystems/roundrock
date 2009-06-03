var OrderObjectModel = window.OrderObjectModel =  GeckoJS.Model.extend({
    name: 'OrderObject',

    useDbConfig: 'order',
    
    belongsTo: ['Order'],

    behaviors: ['Sync', 'Training']

    
});
