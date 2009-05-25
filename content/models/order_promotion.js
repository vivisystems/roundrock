var OrderPromotionModel = window.OrderPromotionModel =  GeckoJS.Model.extend({
    name: 'OrderPromotion',

    useDbConfig: 'order',

    belongsTo: ['Order'],

    behaviors: ['Sync', 'Training']
    
});
