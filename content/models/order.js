(function() {

    var __model__ = {
    
        name: 'Order',

        useDbConfig: 'order',

        hasMany: ['OrderItem', 'OrderAddition', 'OrderPayment', 'OrderReceipt', 'OrderAnnotation', 'OrderItemCondiment', 'OrderPromotion'],
        hasOne: ['OrderObject'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        removeOldOrder: function(iid) {
            var r = this.find('count', {fields: "id", conditions: "id='" + iid + "'", recursive: 0});
            if (r) {

                this.delAll("id='" + iid + "'");

                var cond = "order_id='" + iid + "'";
        
                this.OrderItem.delAll(cond);
                this.OrderAddition.delAll(cond);
                // this.OrderPayment.delAll(cond);
                this.OrderObject.delAll(cond);
                this.OrderAnnotation.delAll(cond);
                this.OrderItemCondiment.delAll(cond);
                this.OrderPromotion.delAll(cond);
            }
        },

        saveOrder: function(data) {
            if(!data ) return;

            var r;
            r = this.begin();
            if (r) {

                // remove old order data if exist...
                this.removeOldOrder(data.id);

                this.saveOrderMaster(data);

                if (data.status >= 0) {
                    // ignore cancel or fail order
                    this.saveOrderItems(data);
                    this.saveOrderAdditions(data);
                    this.saveOrderPayments(data);
                    this.saveOrderAnnotations(data);
                    this.saveOrderItemCondiments(data);
                    this.saveOrderPromotions(data);
                }
                r = this.commit();
            }

            if(!r) {
                this.log('ERROR', 'save order to backup , notify user ???');
                this.rollback();
                
                //return; // debug
                this.saveToBackup(this.mappingTranToOrderFields(data));
                this.OrderItem.saveToBackup(this.mappingTranToOrderItemsFields(data));
                this.OrderAddition.saveToBackup(this.mappingTranToOrderAdditionsFields(data));
                this.OrderPayment.saveToBackup(this.mappingTranToOrderPaymentsFields(data));
                this.OrderAnnotation.saveToBackup(this.mappingTranToOrderAnnotationsFields(data));
                this.OrderItemCondiment.saveToBackup(this.mappingTranToOrderItemCondimentsFields(data));
                this.OrderPromotion.saveToBackup(this.mappingTranToOrderPromotionsFields(data));
            }else {
                // success 
            }
        },

        saveOrderMaster: function(data) {

            var orderData  = this.mappingTranToOrderFields(data);
            // this.id = orderData.id;  // remove id , this will to cause model.exists finding data exists.
            this.create();
            this.save(orderData);

            return orderData;
            
        },


        saveOrderItems: function(data) {

            return this.OrderItem.saveAll(this.mappingTranToOrderItemsFields(data));

        },

        saveOrderAdditions: function(data) {

            var orderAdditions  = this.mappingTranToOrderAdditionsFields(data);

            this.OrderAddition.saveAll(orderAdditions);
            
            return orderAdditions;

        },


        saveOrderPayments: function(data) {

            var orderPayments  = this.mappingTranToOrderPaymentsFields(data);

            this.OrderPayment.saveAll(orderPayments);

            return orderPayments;

        },

        saveOrderAnnotations: function(data) {

            var orderAnnotations = this.mappingTranToOrderAnnotationsFields(data);

            this.OrderAnnotation.saveAll(orderAnnotations);

            return orderAnnotations;
        },

        saveOrderItemCondiments: function(data) {

            var orderItemCondiments = this.mappingTranToOrderItemCondimentsFields(data);

            this.OrderItemCondiment.saveAll(orderItemCondiments);

            return orderItemCondiments;
            
        },


        saveOrderPromotions: function(data) {

            var orderPromotions  = this.mappingTranToOrderPromotionsFields(data);

            this.OrderPromotion.saveAll(orderPromotions);

            return orderPromotions;

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

            // add checksum field
            data.checksum = this.getOrderChecksum(data.id);

            var obj = GeckoJS.BaseObject.serialize(data);
            var orderObj = {
                order_id: data.id,
                object: obj
            };
            this.OrderObject.id = '';
            this.OrderObject.save(orderObj);

        },

        unserializeOrder: function (order_id) {
            try {
                var orderObject = this.OrderObject.find('first', {
                    conditions:"order_id='"+order_id+"'"
                });
                if(orderObject) {
                    return GeckoJS.BaseObject.unserialize(orderObject.object);
                }
            }catch(e) {

            }

            return null;
        },

        beforeSave: function(evt) {
            return true;
        },

        removeOrders: function(conditions) {
            // use execute sql statement to prevent sync...
            var self = this;

            var datas = this.find( 'all', {
                fields: ['id'],
                conditions: conditions,
                recursive: -1
            } );
            datas.forEach(function(obj) {
                var iid = obj.id;
                var cond = "order_id='" + iid + "'";

                self.OrderItem.execute("DELETE FROM " + self.OrderItem.table + " WHERE " + cond);
                self.OrderAddition.execute("DELETE FROM " + self.OrderAddition.table + " WHERE " + cond);
                self.OrderPayment.execute("DELETE FROM " + self.OrderPayment.table + " WHERE " + cond);
                self.OrderObject.execute("DELETE FROM " + self.OrderObject.table + " WHERE " + cond);
                self.OrderReceipt.execute("DELETE FROM " + self.OrderReceipt.table + " WHERE " + cond);
                self.OrderAnnotation.execute("DELETE FROM " + self.OrderAnnotation.table + " WHERE " + cond);
                self.OrderItemCondiment.execute("DELETE FROM " + self.OrderItemCondiment.table + " WHERE " + cond);
                self.OrderPromotion.execute("DELETE FROM " + self.OrderPromotion.table + " WHERE " + cond);

                // update progressbar...
                GeckoJS.BaseObject.sleep(50);

            });

            this.execute("DELETE FROM " + this.table + " WHERE " + conditions);

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

            datas = ds.fetchAll("SELECT id,modified from order_items where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_additions where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_payments where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_annotations where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_item_condiments where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            datas = ds.fetchAll("SELECT id,modified from order_promotions where order_id = '"+id+"'");
            datas.forEach(function (d) {
              checksum += d.id + d.modified;
            });

            return GREUtils.CryptoHash.md5(checksum);
            
        }


    };

    var OrderModel = window.OrderModel =  GeckoJS.Model.extend(__model__);

})();
