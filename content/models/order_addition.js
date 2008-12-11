var OrderAdditionModel = window.OrderAdditionModel =  GeckoJS.Model.extend({
    name: 'OrderAddition',

    useDbConfig: 'order',

    belongsTo: ['Order']
    
});
