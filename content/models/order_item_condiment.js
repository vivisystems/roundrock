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

        mappingOrderItemCondimentsFieldsToTran: function(orderData, data) {

            if (!orderData.OrderItemCondiment || typeof orderData.OrderItemCondiment == 'undefined') return false;

            let condimentList = {};
            for (var idx in orderData.OrderItemCondiment) {

                let condiment = orderData.OrderItemCondiment[idx];
                let index = condiment.item_id;
                
                let item = data.items[index];
                let subtotal = 0 ;
                
                if (!item) continue;

                if (!item.condiments) item.condiments = {};

                let condimentObject = {
                       id: item.id,
                       name: condiment.name,
                       price: condiment.price,
                       current_subtotal: condiment.price
                };
                item.condiments[condiment.name] = condimentObject;
                item.current_condiment += condiment.price;

                if (!(index in condimentList)) {
                    condimentList[index] = {};
                }

                condimentList[index][condiment.name] = condimentObject;
            }

            // rebuild collapsed condiment objects
            for (var idx in condimentList) {
                let condimentObjects = condimentList[idx];
                let condimentNames = GeckoJS.BaseObject.getKeys(condimentObjects);

                if (condimentNames && condimentNames.length > 0) {
                    let key = condimentNames.join(',');
                    data.items[idx].collapsedCondiments = {};
                    data.items[idx].collapsedCondiments[key] = {
                        id: data.items[idx].id,
                        name: key,
                        price: 0,
                        current_subtotal: ''
                    }
                }
            }
            return true;
        }

    };

    var OrderItemCondimentModel = window.OrderItemCondimentModel =  AppModel.extend(__model__);
} )();
