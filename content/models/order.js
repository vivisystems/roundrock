(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {
    
        name: 'Order',

        useDbConfig: 'order',

        hasMany: ['OrderItem', 'OrderAddition', 'OrderPayment', 'OrderReceipt', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion'],
        hasOne: ['OrderObject'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        /**
         * return:
         *
         *   true  - if successfully saved to backup
         *   false - if save to backup failed
         */
        saveOrder: function(data) {
            if (!data ) return true;
            
            var retObj;
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            var checksum = "";

            try {
                if (isTraining) {
                    retObj = this.save(this.mappingTranToOrderFields(data));
                }
                else {
                    retObj = this.saveToBackup(this.mappingTranToOrderFields(data));
                }
                if (!retObj) {
                    throw 'Order';
                }
                checksum += retObj.id + retObj.modified;

                if (isTraining) {
                    retObj = this.OrderItem.saveAll(this.mappingTranToOrderItemsFields(data));
                }
                else {
                    retObj = this.OrderItem.saveToBackup(this.mappingTranToOrderItemsFields(data));
                }
                if (!retObj) {
                    throw 'OrderItem';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (isTraining) {
                    retObj = this.OrderAddition.saveAll(this.mappingTranToOrderAdditionsFields(data));
                }
                else {
                    retObj = this.OrderAddition.saveToBackup(this.mappingTranToOrderAdditionsFields(data));
                }
                if (!retObj) {
                    throw 'OrderAddition';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (isTraining) {
                    retObj = this.OrderPayment.saveAll(this.mappingTranToOrderPaymentsFields(data));
                }
                else {
                    retObj = this.OrderPayment.saveToBackup(this.mappingTranToOrderPaymentsFields(data));
                }
                if (!retObj) {
                    throw 'OrderPayment';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (isTraining) {
                    retObj = this.OrderAnnotation.saveAll(this.mappingTranToOrderAnnotationsFields(data));
                }
                else {
                    retObj = this.OrderAnnotation.saveToBackup(this.mappingTranToOrderAnnotationsFields(data));
                }
                if (!retObj) {
                    throw 'OrderAnnotation';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (isTraining) {
                    retObj = this.OrderItemCondiment.saveAll(this.mappingTranToOrderItemCondimentsFields(data));
                }
                else {
                    retObj = this.OrderItemCondiment.saveToBackup(this.mappingTranToOrderItemCondimentsFields(data));
                }
                if (!retObj) {
                    throw 'OrderItemCondiment';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (isTraining) {
                    retObj = this.OrderPromotion.saveAll(this.mappingTranToOrderPromotionsFields(data));
                }
                else {
                    retObj = this.OrderPromotion.saveToBackup(this.mappingTranToOrderPromotionsFields(data));
                }
                if (!retObj) {
                    throw 'OrderPromotion';
                }
                (new GeckoJS.ArrayQuery(retObj).orderBy("id asc")).forEach(function(d){
                    checksum += d.id + d.modified;
                });

                if (data.status == 2) {

                    data.checksum = GREUtils.CryptoHash.md5(checksum);

                    if (!this.serializeOrder(data)) {
                        throw 'OrderObject';
                    }
                    this.log(data.id + ': ' + data.checksum);
                }
                return true;

            } catch(e) {
                this.log('ERROR',
                         'record could not be saved to backup [' + e + ']\n' + this.dump(data));
            }
            return false;
        },

        restoreOrderFromBackup: function() {

            var r = this.restoreFromBackup();

            if (r) r = this.OrderItem.restoreFromBackup();
            if (r) r = this.OrderAddition.restoreFromBackup();
            if (r) r = this.OrderPayment.restoreFromBackup();
            if (r) r = this.OrderAnnotation.restoreFromBackup();
            if (r) r = this.OrderItemCondiment.restoreFromBackup();
            if (r) r = this.OrderPromotion.restoreFromBackup();

            if (r) r = this.OrderObject.restoreFromBackup();

            return r;
        },

        updateOrderMaster: function(data, updateTimestamp) {

            this.id = data.id;
            var r = this.save(data, updateTimestamp);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while updating order master (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data, updateTimestamp);
                if (r) {
                    this.log('ERROR', 'order master saved to backup');
                }
                else {
                    this.log('ERROR',
                             'order master could not be saved to backup\n' +  this.dump(data));
                }
            }
            return r;
        },
        
        saveOrderMaster: function(data) {

            var orderData  = this.mappingTranToOrderFields(data);

            this.create();
            var r = this.save(orderData);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving order master (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'order master saved to backup');
                }
                else {
                    this.log('ERROR',
                             'order master could not be saved to backup\n' +  this.dump(data));
                }
            }
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
                        if (data[key] < 0)
                            orderData['change'] = Math.abs(data[key]);
                        else
                            orderData['change'] = 0;
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

        mappingTranToOrderItemCondimentsFields: function(data) {

            var orderItemCondiments = [];

            for (var iid in data.items) {

                var item = data.items[iid];

                for (var cond in item.condiments) {

                    var orderItemCondiment = {};

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

        mappingTranToOrderPromotionsFields: function(data) {

            var orderPromotions = [];

            for (var idx in data.promotion_apply_items) {

                var applyItem = data.promotion_apply_items[idx];

                applyItem['order_id'] = data.id;
                applyItem['promotion_id'] = applyItem['id'];
                applyItem['discount_subtotal'] = applyItem['discount_subtotal'];
                delete (applyItem['id']);

                orderPromotions.push(applyItem);
            }

            return orderPromotions;

        },

        mappingTranToOrderAnnotationsFields: function(data) {

            var orderAnnotations = [];

            for (var idx in data.annotations) {

                var annotationItem = {};

                annotationItem['order_id'] = data.id;
                annotationItem['type'] = idx;
                annotationItem['text'] = data.annotations[idx];
                delete (annotationItem['id']);
                
                orderAnnotations.push(annotationItem);
            }

            return orderAnnotations;

        },

        mappingTranToOrderPaymentsFields: function(data) {

            var orderPayments = [];
            var i = 0;
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

                // calculate change only if the order is being finalized
                if (i == len && data.status == 1) {
                    orderPayment['change'] = Math.abs(data.remain);
                } else {
                    orderPayment['change'] = 0;
                }

                orderPayments.push(orderPayment);

            }

            return orderPayments;

        },

        serializeOrder: function (data) {

            // var obj = GREUtils.Gzip.deflate(GeckoJS.BaseObject.serialize(data));
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            var obj = GeckoJS.BaseObject.serialize(data);

            var orderObj = {
                id: data.id,
                order_id: data.id,
                object: obj
            };

            this.OrderObject.id = orderObj.id;

            if (isTraining) {
                return this.OrderObject.save(orderObj);
            }
            else {
                return this.OrderObject.saveToBackup(orderObj);
            }

        },

        unserializeOrder: function (order_id) {
            try {
                var orderObject = this.OrderObject.find('first', {
                    conditions:"order_id='"+order_id+"'"
                });

                if(orderObject) {
                    // return GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(orderObject.object));
                    return GeckoJS.BaseObject.unserialize(orderObject.object);
                }
            }catch(e) {
                dump(e);
            }

            return null;
        },

        beforeSave: function(evt) {
            return true;
        },

        removeOrders: function(conditions) {
            // use execute sql statement to prevent sync...

            // use transaction to improve performance
            if (!this.begin()) {
                this.log('ERROR', 'An error was encountered while preparing to remove expired orders (error code ' + this.lastError + '): ' + this.lastErrorString);
                return false;
            }
            else {
                try {
                    
                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    if (!this.execute("DELETE FROM " + this.table + " WHERE " + conditions)) {
                        throw {errno: this.lastError,
                               errstr: this.lastErrorString,
                               errmsg: 'An error was encountered while removing orders (error code ' + this.lastError + '): ' + this.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order items
                    if (!this.OrderItem.execute("DELETE FROM " + this.OrderItem.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_ITEMS.order_id)")) {
                        throw {errno: this.OrderItem.lastError,
                               errstr: this.OrderItem.lastErrorString,
                               errmsg: 'An error was encountered while removing order items (error code ' + this.OrderItem.lastError + '): ' + this.OrderItem.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order item condiments
                    if (!this.OrderItemCondiment.execute("DELETE FROM " + this.OrderItemCondiment.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_ITEM_CONDIMENTS.order_id)")) {
                        throw {errno: this.OrderItemCondiment.lastError,
                               errstr: this.OrderItemCondiment.lastErrorString,
                               errmsg: 'An error was encountered while removing order items (error code ' + this.OrderItemCondiment.lastError + '): ' + this.OrderItemCondiment.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order additions
                    if (!this.OrderAddition.execute("DELETE FROM " + this.OrderAddition.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_ADDITIONS.order_id)")) {
                        throw {errno: this.OrderAddition.lastError,
                               errstr: this.OrderAddition.lastErrorString,
                               errmsg: 'An error was encountered while removing order additons (error code ' + this.OrderAddition.lastError + '): ' + this.OrderAddition.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order annotations
                    if (!this.OrderAnnotation.execute("DELETE FROM " + this.OrderAnnotation.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_ANNOTATIONS.order_id)")) {
                        throw {errno: this.OrderAnnotation.lastError,
                               errstr: this.OrderAnnotation.lastErrorString,
                               errmsg: 'An error was encountered while removing order annotations (error code ' + this.OrderAnnotation.lastError + '): ' + this.OrderAnnotation.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order objects
                    if (!this.OrderObject.execute("DELETE FROM " + this.OrderObject.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_OBJECTS.order_id)")) {
                        throw {errno: this.OrderObject.lastError,
                               errstr: this.OrderObject.lastErrorString,
                               errmsg: 'An error was encountered while removing order objects (error code ' + this.OrderAddition.lastError + '): ' + this.OrderAddition.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order payments
                    if (!this.OrderPayment.execute("DELETE FROM " + this.OrderPayment.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_PAYMENTS.order_id)")) {
                        throw {errno: this.OrderPayment.lastError,
                               errstr: this.OrderPayment.lastErrorString,
                               errmsg: 'An error was encountered while removing order payments (error code ' + this.OrderPayment.lastError + '): ' + this.OrderPayment.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order receipts
                    if (!this.OrderReceipt.execute("DELETE FROM " + this.OrderReceipt.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_RECEIPTS.order_id)")) {                            throw {errno: this.OrderReceipt.lastError,
                               errstr: this.OrderReceipt.lastErrorString,
                               errmsg: 'An error was encountered while removing order receipts (error code ' + this.OrderReceipt.lastError + '): ' + this.OrderReceipt.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order promotions
                    if (!this.OrderPromotion.execute("DELETE FROM " + this.OrderPromotion.table + " WHERE NOT EXISTS (SELECT 1 FROM ORDERS WHERE ORDERS.id == ORDER_PROMOTIONS.order_id)")) {                            throw {errno: this.OrderPromotion.lastError,
                               errstr: this.OrderPromotion.lastErrorString,
                               errmsg: 'An error was encountered while removing order promotions (error code ' + this.OrderPromotion.lastError + '): ' + this.OrderPromotion.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    if (!this.commit()) {
                        throw {errno: this.lastError,
                               errstr: this.lastErrorString,
                               errmsg: 'An error was encountered while completing removal of expired orders (error code ' + this.lastError + '): ' + this.lastErrorString
                        }
                    }
                    return true;
                }
                catch(e) {
                    this.rollback();

                    this.log('ERROR', e.errmsg);

                    this.lastError = e.lastError;
                    this.lastErrorString = e.lastErrorString;

                    return false;
                }
            }
        },

        getOrderChecksum: function(id) {
            if (!id) return ""; // return "" is id not specify

            var ds = this.getDataSource();
            if (!ds) return ""; // return "" if datasouce is null

            var checksum = "";
            var datas = [];

            //hasMany: ['OrderItem', 'OrderAddition', 'OrderPayment', 'OrderReceipt', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion'],

            datas = ds.fetchAll("SELECT id,modified from orders where id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_items where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_additions where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_payments where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_annotations where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_item_condiments where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_promotions where order_id = '"+id+"' ORDER BY id");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            return GREUtils.CryptoHash.md5(checksum);
        }
    };

    var OrderModel = window.OrderModel =  AppModel.extend(__model__);
})();
