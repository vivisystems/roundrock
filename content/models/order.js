var OrderModel = window.OrderModel =  GeckoJS.Model.extend({
    name: 'Order',

    useDbConfig: 'order',

    hasMany: ['OrderItem', 'OrderAddition', 'OrderPayment', 'OrderReceipt', 'OrderAnnotation'],
    hasOne: ['OrderObject'],

    behaviors: ['Sync'],

    removeOldOrder: function(iid) {
        //
        this.del(iid);

        var cond = "order_id='" + iid + "'";

        this.OrderItem.delAll(cond);
        this.OrderAddition.delAll(cond);
        // this.OrderPayment.delAll(cond);
        this.OrderObject.delAll(cond);
    },

    saveOrder: function(data) {
        if(!data) return;

        // remove old order data if exist...
        this.removeOldOrder(data.id);

        var r;
        r = this.saveOrderMaster(data);

        if (data.status >= 0) {
            // ignore cancel or fail order
            r = this.saveOrderItems(data);
            r = this.saveOrderAdditions(data);
            r = this.saveOrderPayments(data);

            // serialize to database
            // serialize must call serializeOrder by your self
            // r = this.serializeOrder(data);
        }

    },

    saveOrderMaster: function(data) {

        var orderData  = this.mappingTranToOrderFields(data);
        var r;

        this.id = orderData.id;
        this.begin();
        r = this.save(orderData);
        this.commit();
        return r;
    },


    saveOrderItems: function(data) {

        var orderItems  = this.mappingTranToOrderItemsFields(data);
        var r;

        this.OrderItem.begin();
        r = this.OrderItem.saveAll(orderItems);
        this.OrderItem.commit();
        return r;

    },

    saveOrderAdditions: function(data) {

        var orderAdditions  = this.mappingTranToOrderAdditionsFields(data);
        var r;

        this.OrderAddition.begin();
        r = this.OrderAddition.saveAll(orderAdditions);
        this.OrderAddition.commit();
        return r;

    },

    saveOrderPayments: function(data) {

        var orderPayments  = this.mappingTranToOrderPaymentsFields(data);
        var r;
        
        this.OrderPayment.begin();
        r = this.OrderPayment.saveAll(orderPayments);
        this.OrderPayment.commit();
        return r;

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
                    break;

                case 'modified':
                    orderData['transaction_submitted'] = data[key];
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
        var i = 0;
        var len = data.order_items;
        var len = GeckoJS.BaseObject.getKeys(data.trans_payments).length;
        for (var iid in data.trans_payments) {
            i++;
            var payment = data.trans_payments[iid];

            var orderPayment = GREUtils.extend({}, payment);

            orderPayment['id'] = iid;
            orderPayment['order_id'] = data.id;
            orderPayment['order_items_count'] = data.items_count;
            orderPayment['order_total'] = data.total;

            orderPayment['service_clerk'] = data.service_clerk;
            orderPayment['proceeds_clerk'] = data.proceeds_clerk;

            orderPayment['service_clerk_displayname'] = data.service_clerk_displayname;
            orderPayment['proceeds_clerk_displayname'] = data.proceeds_clerk_displayname;

            orderPayment['sale_period'] = data.sale_period;
            orderPayment['shift_number'] = data.shift_number;
            orderPayment['terminal_no'] = data.terminal_no;
            
            if (i == len) {
                orderPayment['change'] = Math.abs(data.remain);
            } else {
                orderPayment['change'] = 0;
            }

            orderPayments.push(orderPayment);

        }

        return orderPayments;

    },
    

    serializeOrder: function (data) {

        var obj = GeckoJS.BaseObject.serialize(data);
        var orderObj = {order_id: data.id, object: obj};
        this.OrderObject.id = '';
        this.OrderObject.save(orderObj);

    },

    unserializeOrder: function (order_id) {
        try {
            var orderObject = this.OrderObject.find('first', {conditions:"order_id='"+order_id+"'"});
            if(orderObject) {
                return GeckoJS.BaseObject.unserialize(orderObject.object);
            }
        }catch(e) {
            
        }

        return null;
    },

    saveLedgerEntry: function(data) {

        // don't create orders just for tracking ledger payments

        var r;
        /*
        this.id = '';
        this.begin();
        r = this.save(data);
        this.commit();
        */
        this.OrderPayment.id = '';
        data.order_id = '';
        this.OrderPayment.begin();
        r = this.OrderPayment.save(data);
        this.OrderPayment.commit();
        return r;
        
    },

    deleteLedgerEntry: function(iid) {
        this.OrderPayment.del(iid);
    },


    beforeSave: function(evt) {
        return true;
    },

    removeOrders: function(conditions) {
        // use execute sql statement to prevent sync...
        var self = this;

        var datas = this.find( 'all', {fields: ['id'], conditions: conditions, recursive: -1} );
        datas.forEach(function(obj) {
            var iid = obj.id;
            var cond = "order_id='" + iid + "'";

            self.OrderItem.execute("DELETE FROM " + self.OrderItem.table + " WHERE " + cond);
            self.OrderAddition.execute("DELETE FROM " + self.OrderAddition.table + " WHERE " + cond);
            self.OrderPayment.execute("DELETE FROM " + self.OrderPayment.table + " WHERE " + cond);
            self.OrderObject.execute("DELETE FROM " + self.OrderObject.table + " WHERE " + cond);
            self.OrderReceipt.execute("DELETE FROM " + self.OrderReceipt.table + " WHERE " + cond);
            self.OrderAnnotation.execute("DELETE FROM " + self.OrderAnnotation.table + " WHERE " + cond);

        });

        this.execute("DELETE FROM " + this.table + " WHERE " + conditions);

    }
    
});