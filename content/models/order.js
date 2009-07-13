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
                    retObj = this.OrderItem.save(this.mappingTranToOrderItemsFields(data));
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
                    retObj = this.OrderAddition.save(this.mappingTranToOrderAdditionsFields(data));
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
                    retObj = this.OrderPayment.save(this.mappingTranToOrderPaymentsFields(data));
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
                    retObj = this.OrderAnnotation.save(this.mappingTranToOrderAnnotationsFields(data));
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
                    retObj = this.OrderItemCondiment.save(this.mappingTranToOrderItemCondimentsFields(data));
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
                    retObj = this.OrderPromotion.save(this.mappingTranToOrderPromotionsFields(data));
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
            var self = this;

            var r;
            try {
                var datas = this.find( 'all', {
                    fields: ['id'],
                    conditions: conditions,
                    recursive: -1
                } );

                if (parseInt(this.lastError) != 0) {
                    throw {errno: this.lastError,
                           errstr: this.lastErrorString,
                           errmsg: 'An error was encountered while removing orders (error code ' + this.lastError + '): ' + this.lastErrorString
                    }
                }

                datas.forEach(function(obj) {
                    var iid = obj.id;
                    var cond = "order_id='" + iid + "'";

                    // order items
                    r = self.OrderItem.restoreFromBackup();
                    if (r) {
                        r = self.OrderItem.execute("DELETE FROM " + self.OrderItem.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderItem.lastError,
                                   errstr: self.OrderItem.lastErrorString,
                                   errmsg: 'An error was encountered while removing order items (error code ' + self.OrderItem.lastError + '): ' + self.OrderItem.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderItem.lastError,
                                   errstr: self.OrderItem.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order items (error code ' + self.OrderItem.lastError + '): ' + self.OrderItem.lastErrorString
                            }
                    }

                    // order item condiments
                    r = self.OrderItemCondiment.restoreFromBackup();
                    if (r) {
                        r = self.OrderItemCondiment.execute("DELETE FROM " + self.OrderItemCondiment.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderItemCondiment.lastError,
                                   errstr: self.OrderItemCondiment.lastErrorString,
                                   errmsg: 'An error was encountered while removing order items (error code ' + self.OrderItemCondiment.lastError + '): ' + self.OrderItemCondiment.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderItemCondiment.lastError,
                                   errstr: self.OrderItemCondiment.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order items (error code ' + self.OrderItemCondiment.lastError + '): ' + self.OrderItemCondiment.lastErrorString
                            }
                    }

                    // order additions
                    r = self.OrderAddition.restoreFromBackup();
                    if (r) {
                        r = self.OrderAddition.execute("DELETE FROM " + self.OrderAddition.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderAddition.lastError,
                                   errstr: self.OrderAddition.lastErrorString,
                                   errmsg: 'An error was encountered while removing order additons (error code ' + self.OrderAddition.lastError + '): ' + self.OrderAddition.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderAddition.lastError,
                                   errstr: self.OrderAddition.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order additions (error code ' + self.OrderAddition.lastError + '): ' + self.OrderAddition.lastErrorString
                            }
                    }

                    // order annotations
                    r = self.OrderAnnotation.restoreFromBackup();
                    if (r) {
                        r = self.OrderAnnotation.execute("DELETE FROM " + self.OrderAnnotation.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderAnnotation.lastError,
                                   errstr: self.OrderAnnotation.lastErrorString,
                                   errmsg: 'An error was encountered while removing order annotations (error code ' + self.OrderAnnotation.lastError + '): ' + self.OrderAnnotation.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderAnnotation.lastError,
                                   errstr: self.OrderAnnotation.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order annotations (error code ' + self.OrderAnnotation.lastError + '): ' + self.OrderAnnotation.lastErrorString
                            }
                    }

                    // order objects
                    r = self.OrderObject.restoreFromBackup();
                    if (r) {
                        r = self.OrderObject.execute("DELETE FROM " + self.OrderObject.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderObject.lastError,
                                   errstr: self.OrderObject.lastErrorString,
                                   errmsg: 'An error was encountered while removing order objects (error code ' + self.OrderAddition.lastError + '): ' + self.OrderAddition.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderObject.lastError,
                                   errstr: self.OrderObject.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order objects (error code ' + self.OrderObject.lastError + '): ' + self.OrderObject.lastErrorString
                            }
                    }

                    // order payments
                    r = self.OrderPayment.restoreFromBackup();
                    if (r) {
                        r = self.OrderPayment.execute("DELETE FROM " + self.OrderPayment.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderPayment.lastError,
                                   errstr: self.OrderPayment.lastErrorString,
                                   errmsg: 'An error was encountered while removing order payments (error code ' + self.OrderPayment.lastError + '): ' + self.OrderPayment.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderPayment.lastError,
                                   errstr: self.OrderPayment.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order payments (error code ' + self.OrderPayment.lastError + '): ' + self.OrderPayment.lastErrorString
                            }
                    }

                    // order receipts
                    r = self.OrderReceipt.restoreFromBackup();
                    if (r) {
                        r = self.OrderReceipt.execute("DELETE FROM " + self.OrderReceipt.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderReceipt.lastError,
                                   errstr: self.OrderReceipt.lastErrorString,
                                   errmsg: 'An error was encountered while removing order receipts (error code ' + self.OrderReceipt.lastError + '): ' + self.OrderReceipt.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderReceipt.lastError,
                                   errstr: self.OrderReceipt.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order receipts (error code ' + self.OrderReceipt.lastError + '): ' + self.OrderReceipt.lastErrorString
                            }
                    }

                    // order promotions
                    r = self.OrderPromotion.restoreFromBackup();
                    if (r) {
                        r = self.OrderPromotion.execute("DELETE FROM " + self.OrderPromotion.table + " WHERE " + cond);
                        if (!r) {
                            throw {errno: self.OrderPromotion.lastError,
                                   errstr: self.OrderPromotion.lastErrorString,
                                   errmsg: 'An error was encountered while removing order promotions (error code ' + self.OrderPromotion.lastError + '): ' + self.OrderPromotion.lastErrorString
                            }
                        }
                    }
                    else {
                            throw {errno: self.OrderPromotion.lastError,
                                   errstr: self.OrderPromotion.lastErrorString,
                                   errmsg: 'An error was encountered while removing backup order promotions (error code ' + self.OrderPromotion.lastError + '): ' + self.OrderPromotion.lastErrorString
                            }
                    }


                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                });

                r = this.restoreFromBackup();
                if (r) {
                    r = this.execute("DELETE FROM " + this.table + " WHERE " + conditions);
                    if (!r) {
                        throw {errno: this.lastError,
                               errstr: this.lastErrorString,
                               errmsg: 'An error was encountered while removing order promotions (error code ' + this.lastError + '): ' + this.lastErrorString
                        }
                    }
                }
                else {
                        throw {errno: this.lastError,
                               errstr: this.lastErrorString,
                               errmsg: 'An error was encountered while removing backup order promotions (error code ' + this.lastError + '): ' + this.lastErrorString
                        }
                }
                return true;
            }
            catch(e) {
                this.log('ERROR', e.errmsg);

                this.datasource.lastError = e.lastError;
                this.datasource.lastErrorString = e.lastErrorString;
                
                return false;
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
