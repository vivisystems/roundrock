( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderItem',

        useDbConfig: 'order',

        belongsTo: ['Order'],
        
        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        mappingTranToOrderItemsFields: function(data) {

            var orderItems = [];

            for (var iid in data.items) {

                let item = data.items[iid];

                let orderItem = {};
                orderItem['id'] = iid;
                orderItem['order_id'] = data.id;

                for (var key in item) {


                    switch(key) {
                        case 'cate_id':
                        case 'id':
                            // orderItem['product_id'] = item[key];
                            break;
                        case 'no':
                            orderItem['product_no'] = item[key];
                            break;
                        case 'name':
                            orderItem['product_name'] = item[key];
                            break;
                        case 'barcode':
                            orderItem['product_barcode'] = item[key];
                            break;
                        case 'condiments':
                            orderItem['condiments'] = GeckoJS.BaseObject.getKeys(item[key]).join(',');
                            break;
                        case 'hasDiscount':
                            orderItem['has_discount'] = item[key] ? 1 : 0;
                            break;
                        case 'hasSurcharge':
                            orderItem['has_surcharge'] = item[key] ? 1 : 0;
                            break;
                        case 'hasMarker':
                            orderItem['has_marker'] = item[key] ? 1 : 0;
                            break;
                        case 'parent_index':
                            if (item[key] != null && item[key] != '') {
                                orderItem['parent_no'] = data.items[item[key]].no;
                            }
                            break;
                        case 'type':
                        case 'index':
                            break;

                        case 'current_qty':
                            if (item['sale_unit'] == 'unit') {
                                orderItem['current_qty'] = item['current_qty'];
                                orderItem['weight'] = 0.0;
                            }
                            else {
                                orderItem['current_qty'] = 1;
                                orderItem['weight'] = item['current_qty'];
                            }
                            break;

                        default:
                            orderItem[key] = item[key];
                            break;
                    }
                }

                orderItems.push(orderItem);
            }
            return orderItems;

        },

        mappingOrderItemsFieldsToTran: function(orderData, data) {

            var items = {};
            var items_summary = {};

            if (!orderData.OrderItem || typeof orderData.OrderItem == 'undefined') {
                data.items = items;
                data.items_summary = items_summary ;
                return items;
            }

            for (var idx in orderData.OrderItem) {

                let item = orderData.OrderItem[idx];

                let itemIndex = item.id;
                let orderId = item.order_id;

                // name,current_qty,current_price,current_subtotal
                let orderItem =  (data.items ? data.items[itemIndex] : false ) || {
                    type: 'item', // item or category
                    index: itemIndex
                };

                for (var key in item) {

                    switch(key) {
                        case 'order_id':
                        case 'id':
                        case 'condiments':
                        case 'parent_index':
                            break;
                        case 'product_no':
                            orderItem['no'] = item[key];
                            break;
                        case 'product_name':
                            orderItem['name'] = item[key];
                            break;
                        case 'product_barcode':
                            orderItem['barcode'] = item[key];
                            break;
                        case 'has_discount':
                            orderItem['hasDiscount'] = item[key];
                            break;
                        case 'has_surcharge':
                            orderItem['hasSurcharge'] = item[key];
                            break;
                        case 'has_marker':
                            orderItem['hasMarker'] = item[key];
                            break;
                        default:
                            orderItem[key] = item[key];
                            break;
                    }
                }

                items[itemIndex] = orderItem;
                
                // process summary
                let itemSummary = items_summary[orderItem.id] || {
                    id: orderItem.id, 
                    name: orderItem.name,
                    qty_subtotal: 0,
                    subtotal: 0,
                    discount_subtotal: 0,
                    surcharge_subtotal: 0                    
                };

                itemSummary.qty_subtotal += orderItem.current_qty;
                itemSummary.subtotal += orderItem.current_subtotal;
                itemSummary.discount_subtotal += orderItem.current_discount;
                itemSummary.surcharge_subtotal += orderItem.current_surcharge;

                items_summary[orderItem.id] = itemSummary;

            }
            data.items = items;
            data.items_summary = items_summary;
            if (!data.display_sequences) {
                this.rebuildDisplaySequences(data);
            }
            return items;
            
        },

        // XXX not yet!
        rebuildDisplaySequences: function(data) {

        }
        
    };

    var OrderItemModel = window.OrderItemModel =  AppModel.extend(__model__);

} )();
