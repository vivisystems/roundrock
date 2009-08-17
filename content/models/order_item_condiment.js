( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {
    
        name: 'OrderItemCondiment',

        useDbConfig: 'order',

        belongsTo: ['Order'],
        
        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        mappingTranToOrderItemCondimentsFields: function(data) {

            var orderItemCondiments = [];

            for (var iid in data.items) {

                let item = data.items[iid];

                for (var cond in item.condiments) {

                    let orderItemCondiment = {};

                    orderItemCondiment['item_id'] = iid;
                    orderItemCondiment['order_id'] = data.id;

                    var condiment = item.condiments[cond];

                    for (var key in condiment) {
                        switch(key) {
                            case 'id':
                            case 'current_subtotal':
                                break;

                            default:
                                orderItemCondiment[key] = condiment[key];
                                break;
                        }
                    }
                    orderItemCondiments.push(orderItemCondiment);
                }
            }
            return orderItemCondiments;

        },

        mappingOrderItemCondimentsFieldsToTran: function() {
            
        }

    };

    var OrderItemCondimentModel = window.OrderItemCondimentModel =  AppModel.extend(__model__);
} )();
