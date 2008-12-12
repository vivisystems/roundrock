var OrderModel = window.OrderModel =  GeckoJS.Model.extend({
    name: 'Order',

    useDbConfig: 'order',

    hasMany: ['OrderItem', 'OrderAddition', 'OrderPayment'],
    hasOne: ['OrderObject'],

    saveOrder: function(data) {
        if(!data) return;

        this.saveOrderMaster(data);
        this.saveOrderItems(data);
        this.saveOrderAdditions(data);
        this.saveOrderPayments(data);


    },

    saveOrderMaster: function(data) {

        var orderData  = this.mappingTranToOrderFields(data);

        this.begin();
        this.save(orderData);
        this.commit();

    },


    saveOrderItems: function(data) {

        var orderItems  = this.mappingTranToOrderItemsFields(data);

        this.OrderItem.begin();
        this.OrderItem.saveAll(orderItems);
        this.OrderItem.commit();

    },

    saveOrderAdditions: function(data) {

        var orderAdditions  = this.mappingTranToOrderAdditionsFields(data);

        this.OrderAddition.begin();
        this.OrderAddition.saveAll(orderAdditions);
        this.OrderAddition.commit();

    },

    saveOrderPayments: function(data) {

        var orderPayments  = this.mappingTranToOrderPaymentsFields(data);

        this.OrderPayment.begin();
        this.OrderPayment.saveAll(orderPayments);
        this.OrderPayment.commit();

    },


    mappingTranToOrderFields: function(data) {
        
        var orderData = {};

        // process mapping
        for (var key in data) {
            switch(key) {
                case 'seq':
                    orderData['sequence'] = "" + data[key];
                    break;

                case 'remain':
                    orderData['change'] = Math.abs(data[key]);
                    break;

                case 'created':
                    orderData['transaction_created'] = data[key];
                    orderData['transaction_created_format'] = new Date(data[key]).toString('yyyy-MM-dd HH:mm:ss');
                    break;

                case 'modified':
                    orderData['transaction_submited'] = data[key];
                    orderData['transaction_submited_format'] = new Date(data[key]).toString('yyyy-MM-dd HH:mm:ss');
                    break;

                case 'items':
                case 'display_sequences':
                case 'items_summary':
                case 'trans_discounts':
                case 'trans_surcharges':
                case 'trans_payments':
                case 'markers':
                    break;

                default:
                    orderData[key] = data[key];
                    break;
            }
        }

        return orderData;

    },

    mappingTranToOrderItemsFields: function(data) {

        var orderItems = [];

        for (var iid in data.items) {

            var item = data.items[iid];

            var orderItem = {};
            orderItem['id'] = iid;
            orderItem['order_id'] = data.id;

            for (var key in item) {


                switch(key) {
                    case 'id':
                        orderItem['product_id'] = item[key];
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
                        orderItem['has_discount'] = item[key];
                        break;
                    case 'hasSurcharge':
                        orderItem['has_surcharge'] = item[key];
                        break;
                    case 'hasMarker':
                        orderItem['has_marker'] = item[key];
                        break;
                    case 'type':
                    case 'index':
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


    mappingTranToOrderAdditionsFields: function(data) {

        var orderAdditions = [];

        for (var iid in data.trans_discounts) {
            
            var discount = data.trans_discounts[iid];

            var orderAddition = GREUtils.extend({}, discount);

            orderAddition['id'] = iid;
            orderAddition['order_id'] = data.id;
            orderAddition['order_item_count'] = data.item_count;
            orderAddition['order_item_total'] = data.item_count;

            orderAdditions.push(orderAddition);

        }

        for (var iid2 in data.trans_surcharges) {
            var surcharge = data.trans_surcharges[iid2];

            var orderAddition = GREUtils.extend({}, surcharge);

            orderAddition['id'] = iid2;
            orderAddition['order_id'] = data.id;

            orderAdditions.push(orderAddition);

        }

        return orderAdditions;

    },

    mappingTranToOrderPaymentsFields: function(data) {

        var orderPayments = [];

        for (var iid in data.trans_payments) {

            var payment = data.trans_payments[iid];

            var orderPayment = GREUtils.extend({}, payment);

            orderPayment['id'] = iid;
            orderPayment['order_id'] = data.id;
            orderPayment['order_items_count'] = data.items_count;
            orderPayment['order_total'] = data.total;

            orderPayments.push(orderPayment);

        }

        return orderPayments;

    },
    

    serializeOrder: function (data) {
        this.OrderObject.save(data);
    },

    unserializeOrder: function () {

    },

    beforeSave: function(evt) {
        return true;
    }
    
});
