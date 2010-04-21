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
                            orderItem[key] = item[key];
                            break;
                        case 'type':
                        case 'index':
                        case 'tax_details':
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

            var productModel = new ProductModel();
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
                    id: (productModel.getProductByNo(item.product_no) ? productModel.getProductByNo(item.product_no).id : ''), 
                    type: 'item', // item or category
                    index: itemIndex,
                    no: item.product_no,
                    name: item.product_name,
                    parent_index: item.parent_index
                };

                for (var key in item) {

                    switch(key) {
                        case 'order_id':
                        case 'id':
                        case 'condiments':
                        case 'parent_index':
                            if (!orderItem['parent_index']) {
                                orderItem['parent_index'] = null;
                            }
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

                this.log('orderItem: ' + this.dump(orderItem));
                
                // check non stored data and rebuild from product databases
                if (!orderItem.link_group) {
                    try {
                        this.log('item id: ' + orderItem.id);
                        let product = productModel.getProductById(orderItem.id);
                        this.log(this.dump(product));
                        orderItem['link_group'] = product.link_group;
                    }catch(e){
                        // product not exists, maybe databases error or calling old order
                        this.log('WARN', 'product not exists when mappingOrderItemsFieldsToTran: ' + orderItem.id);
                    }
                }
                
                orderItem.index = itemIndex;
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

                // convert weight to current_qty if needed
                if (orderItem['sale_unit'] != 'unit') {
                    orderItem['current_qty'] = orderItem['weight']
                }
            }
            data.items = items;
            data.items_summary = items_summary;
            if (!data.display_sequences) {
                this.rebuildDisplaySequences(data);
            }

            if (data.display_sequences) {
                for (i = 0; i < data.display_sequences.length; i++) {
                    let dispItem = data.display_sequences[i];
                    if (dispItem.type == 'item') {
                        let transItem = data.items[dispItem.index];
                        if (transItem) transItem.batch = dispItem.batch;
                    }
                }
            }
            return items;
            
        },

        // XXX not yet!
        rebuildDisplaySequences: function(data) {

            data.display_sequences = [] ;

            try {

                var transaction = new Transaction(true, true);

                for (var itemIndex in data.items) {
                    let dsp_seq = transaction.createDisplaySeq(itemIndex, data.items[itemIndex]);
                    data.display_sequences.push(dsp_seq);
                }

                data.rebuildedDisplaySequences = true;

            }catch(e) {
                this.log('WARN', 'rebuildDisplaySequences failure.', e);
            }
        }

    };

    var OrderItemModel = window.OrderItemModel =  AppModel.extend(__model__);

} )();
