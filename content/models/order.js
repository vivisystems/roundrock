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

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname); // XXX table or order services ??
                    this.httpService.setController('orders');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },
        
        /**
         * return:
         *
         *   true  - if successfully saved to backup
         *   false - if save to backup failed
         */
        saveOrder: function(data) {

            if (!data ) return true;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            var result =  this.saveOrderToBackup(data, isTraining) || false;

            return result;

        },

        /**
         * commitSaveOrder
         *
         * if status == 2  (store)   || recall == 2 (recall from store)
         * 
         * Force USE TABLE Flow.
         *
         * @param {Object} data   transaction object
         */
        commitSaveOrder: function(data) {

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if (isTraining) return true;

            if (data.status == 2 || data.recall == 2) {
                // XXXX call table service to save order to remote.
                return this.restoreOrderFromBackupToRemote();
            }else {
                return this.restoreOrderFromBackup();
            }

        },

        /**
         * saveOrderToBackup 
         */
        saveOrderToBackup: function(data, isTraining) {

            var retObj;

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

                if (isTraining) {
                    retObj = this.OrderItem.saveAll(this.OrderItem.mappingTranToOrderItemsFields(data));
                }
                else {
                    retObj = this.OrderItem.saveToBackup(this.OrderItem.mappingTranToOrderItemsFields(data));
                }
                if (!retObj) {
                    throw 'OrderItem';
                }

                if (isTraining) {
                    retObj = this.OrderAddition.saveAll(this.OrderAddition.mappingTranToOrderAdditionsFields(data));
                }
                else {
                    retObj = this.OrderAddition.saveToBackup(this.OrderAddition.mappingTranToOrderAdditionsFields(data));
                }
                if (!retObj) {
                    throw 'OrderAddition';
                }

                if (isTraining) {
                    retObj = this.OrderPayment.saveAll(this.OrderPayment.mappingTranToOrderPaymentsFields(data));
                }
                else {
                    retObj = this.OrderPayment.saveToBackup(this.OrderPayment.mappingTranToOrderPaymentsFields(data));
                }
                if (!retObj) {
                    throw 'OrderPayment';
                }

                if (isTraining) {
                    retObj = this.OrderAnnotation.saveAll(this.OrderAnnotation.mappingTranToOrderAnnotationsFields(data));
                }
                else {
                    retObj = this.OrderAnnotation.saveToBackup(this.OrderAnnotation.mappingTranToOrderAnnotationsFields(data));
                }
                if (!retObj) {
                    throw 'OrderAnnotation';
                }
                    
                if (isTraining) {
                    retObj = this.OrderItemCondiment.saveAll(this.OrderItemCondiment.mappingTranToOrderItemCondimentsFields(data));
                }
                else {
                    retObj = this.OrderItemCondiment.saveToBackup(this.OrderItemCondiment.mappingTranToOrderItemCondimentsFields(data));
                }
                if (!retObj) {
                    throw 'OrderItemCondiment';
                }

                if (isTraining) {
                    retObj = this.OrderPromotion.saveAll(this.OrderPromotion.mappingTranToOrderPromotionsFields(data));
                }
                else {
                    retObj = this.OrderPromotion.saveToBackup(this.OrderPromotion.mappingTranToOrderPromotionsFields(data));
                }
                if (!retObj) {
                    throw 'OrderPromotion';
                }

                if (isTraining) {
                    retObj = this.OrderObject.save(this.OrderObject.mappingTranToOrderObjectsFields(data));
                }
                else {
                    retObj = this.OrderObject.saveToBackup(this.OrderObject.mappingTranToOrderObjectsFields(data));
                }
                if (!retObj) {
                    throw 'OrderPromotion';
                }

                return true;

            } catch(e) {
                this.log('ERROR',
                    'record could not be saved to backup [' + e + ']\n' + this.dump(data));
            }
            return false;

        },

        /**
         * Restore order and order* from backup to REAL databases
         * 
         * @return {Boolean} return true if success
         */
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

        /**
         * Restore order and orders from backup to REMOTE Services server
         * 
         * @return {Boolean} return true if success
         */
        restoreOrderFromBackupToRemote: function() {

            var datas = {};

            datas['Order'] = this.getBackupContent();
            datas['OrderItem'] = this.OrderItem.getBackupContent();
            datas['OrderAddition'] = this.OrderAddition.getBackupContent();
            datas['OrderPayment'] = this.OrderPayment.getBackupContent();
            datas['OrderAnnotation'] = this.OrderAnnotation.getBackupContent();
            datas['OrderItemCondiment'] = this.OrderItemCondiment.getBackupContent();
            datas['OrderPromotion'] = this.OrderPromotion.getBackupContent();
            datas['OrderObject'] = this.OrderObject.getBackupContent();

            var requestUrl = this.getHttpService().getRemoteServiceUrl('saveOrdersFromBackupFormat');
            var request_data = (GeckoJS.BaseObject.serialize(datas));
            //            dump('length = ' + request_data.length +'\n');

            var success = this.getHttpService().requestRemoteService('POST', requestUrl, request_data) || null ;

            //if fault , use Waning dialg and drop store .
            if (success) {
                this.removeBackupFile();
                this.OrderItem.removeBackupFile();
                this.OrderAddition.removeBackupFile();
                this.OrderPayment.removeBackupFile();
                this.OrderAnnotation.removeBackupFile();
                this.OrderItemCondiment.removeBackupFile();
                this.OrderPromotion.removeBackupFile();
                this.OrderObject.removeBackupFile();
            }
            return success;

        },


        /**
         * read order from local databases or remote services
         * 
         * @param {String} id   order's uuid
         * @param {Boolean} forceRemote    force use local database or remote services
         * @return {Object} object for transaction.data || OrderLock object for locked info
         */
        readOrder: function(id, forceRemote) {

            forceRemote = forceRemote || false;
            if (!id ) return null;

            var orderData = null;

            if (forceRemote) {
                var requestUrl = this.getHttpService().getRemoteServiceUrl('readOrderToBackupFormat') + '/' + id;
                orderData = this.getHttpService().requestRemoteService('GET', requestUrl) || false ;
            }else {
                orderData = this.find('first', {
                    conditions: "orders.id='"+id+"'",
                    recursive: 2
                }) || false;
            }

            if (!orderData) return null;

            // locked by other machine return lock info
            if (orderData.TableOrderLock) return orderData;

            return orderData;

        },

        /**
         * release order lock from webservices
         *
         * @param {String} id   order's uuid
         * @return {Boolean} success
         */
        releaseOrderLock: function(id) {
           if (!id) return false;
           
           var requestUrl = this.getHttpService().getRemoteServiceUrl('releaseOrderLock' + '/' + id);
           var result = this.getHttpService().requestRemoteService('GET', requestUrl) || false ;
           
           return result;
        },
        

        /**
         * Mapping Order to Transaction data
         */
        mappingOrderDataToTranData: function(orderData) {

            var data = {};

            // use unserialize first
            data = this.OrderObject.mappingOrderObjectsFieldsToTran(orderData, data);

            this.mappingOrderFieldsToTran(orderData, data);
            this.OrderItem.mappingOrderItemsFieldsToTran(orderData, data);
            this.OrderAddition.mappingOrderAdditionsFieldsToTran(orderData, data);
            this.OrderPayment.mappingOrderPaymentsFieldsToTran(orderData, data);
            this.OrderAnnotation.mappingOrderAnnotationsFieldsToTran(orderData, data);
            this.OrderItemCondiment.mappingOrderItemCondimentsFieldsToTran(orderData, data);
            this.OrderPromotion.mappingOrderPromotionsFieldsToTran(orderData, data);

//            this.log('DEBUG', 'readOrder '+ id + ': \n' + this.dump(data));

            return data;
            
        },

        /**
         * void order from local databases or remote services
         *
         * @param {String} id   order's uuid
         * @param {Boolean} forceRemote    force use local database or remote services
         * @return {Object} object for transaction.data || OrderLock object for locked info
         */
        voidOrder: function(id, data, forceRemote) {

            forceRemote = forceRemote || false;
            if (!id ) return false;
            var result = false;

            if (forceRemote) {

                var requestUrl = this.getHttpService().getRemoteServiceUrl('voidOrder') + '/' + id;
                var request_data = (GeckoJS.BaseObject.serialize(data));
                result = this.getHttpService().requestRemoteService('POST', requestUrl, request_data) || false ;

            }else {

                // update order
                this.id = id;
                result = this.save(data);

                // update refund payments
                for (let i in data.refundPayments) {
                      this.OrderPayment.create();
                      this.OrderPayment.save(data.refundPayments[i]);
                }
            }

            return result;

        },


        /**
         * get Order Id (uuid)
         *
         * @param {String} conditions
         * @param {Boolean} isRemote    use local database or remote services
         * @return {String} order's id  or null
         */
        getOrderId: function(conditions, isRemote) {

            isRemote = isRemote || false;
            if (!conditions) return null;

            var orderId = null;

            if (isRemote) {
                var requestUrl = this.getHttpService().getRemoteServiceUrl('getOrderId') ;
                orderId = this.getHttpService().requestRemoteService('POST', requestUrl, conditions) || null ;
            }else {
                let order = this.find('first', {
                    fields: 'id',
                    conditions: conditions,
                    recursive: 0
                }) || null;
                if(order) orderId = order.Order.id;
            }

            return orderId ;
        },


        /**
         * getOrdersSummary
         *
         * @param {String} conditions
         * @param {Boolean} isRemote    use local database or remote service
         * @return {String} order's id  or null
         */
        getOrdersSummary: function (conditions, isRemote) {

            isRemote = isRemote || false;
            if (!conditions) return null;

            var orders = [];

            if (isRemote) {
                var requestUrl = this.getHttpService().getRemoteServiceUrl('getOrdersSummary') ;
                result = this.getHttpService().requestRemoteService('POST', requestUrl, conditions) || null ;
                if (result) {
                    // orders = result;
                    orders = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(result)));
                }
            }else {
                let result = this.find('all', {
                    conditions: conditions,
                    recursive: 1
                }) || null;
                if(result) orders = result;
            }

            // this.log(this.dump(orders));
            return orders;
   
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

        mappingOrderFieldsToTran: function(orderData, data) {
            // process mapping
            for (var key in orderData.Order) {
                switch(key) {
                    case 'sequence':
                        data['seq'] = orderData.Order['sequence'];
                        break;
                    /*
                    case 'change':
                        data['remain'] =  orderData.Order['change'];
                        break;
                    */

                    case 'transaction_created':
                        data['created'] = orderData.Order['transaction_created'];
                        break;

                    case 'transaction_submitted':
                        data['modified'] = orderData.Order['transaction_submitted'];
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
                        data[key] = orderData.Order[key];
                        break;
                }
            }
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

                    // order items
                    if (!this.OrderItem.execute("DELETE FROM " + this.OrderItem.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderItem.lastError,
                            errstr: this.OrderItem.lastErrorString,
                            errmsg: 'An error was encountered while removing order items (error code ' + this.OrderItem.lastError + '): ' + this.OrderItem.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order item condiments
                    if (!this.OrderItemCondiment.execute("DELETE FROM " + this.OrderItemCondiment.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderItemCondiment.lastError,
                            errstr: this.OrderItemCondiment.lastErrorString,
                            errmsg: 'An error was encountered while removing order items (error code ' + this.OrderItemCondiment.lastError + '): ' + this.OrderItemCondiment.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order additions
                    if (!this.OrderAddition.execute("DELETE FROM " + this.OrderAddition.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderAddition.lastError,
                            errstr: this.OrderAddition.lastErrorString,
                            errmsg: 'An error was encountered while removing order additons (error code ' + this.OrderAddition.lastError + '): ' + this.OrderAddition.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order annotations
                    if (!this.OrderAnnotation.execute("DELETE FROM " + this.OrderAnnotation.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderAnnotation.lastError,
                            errstr: this.OrderAnnotation.lastErrorString,
                            errmsg: 'An error was encountered while removing order annotations (error code ' + this.OrderAnnotation.lastError + '): ' + this.OrderAnnotation.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order objects
                    if (!this.OrderObject.execute("DELETE FROM " + this.OrderObject.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderObject.lastError,
                            errstr: this.OrderObject.lastErrorString,
                            errmsg: 'An error was encountered while removing order objects (error code ' + this.OrderAddition.lastError + '): ' + this.OrderAddition.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order payments
                    if (!this.OrderPayment.execute("DELETE FROM " + this.OrderPayment.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderPayment.lastError,
                            errstr: this.OrderPayment.lastErrorString,
                            errmsg: 'An error was encountered while removing order payments (error code ' + this.OrderPayment.lastError + '): ' + this.OrderPayment.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order receipts
                    if (!this.OrderReceipt.execute("DELETE FROM " + this.OrderReceipt.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderReceipt.lastError,
                            errstr: this.OrderReceipt.lastErrorString,
                            errmsg: 'An error was encountered while removing order receipts (error code ' + this.OrderReceipt.lastError + '): ' + this.OrderReceipt.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order promotions
                    if (!this.OrderPromotion.execute("DELETE FROM " + this.OrderPromotion.table + " WHERE order_id = (SELECT id FROM orders WHERE "+ conditions +")")) {
                        throw {
                            errno: this.OrderPromotion.lastError,
                            errstr: this.OrderPromotion.lastErrorString,
                            errmsg: 'An error was encountered while removing order promotions (error code ' + this.OrderPromotion.lastError + '): ' + this.OrderPromotion.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    // order delete lastest
                    if (!this.execute("DELETE FROM " + this.table + " WHERE " + conditions)) {
                        throw {
                            errno: this.lastError,
                            errstr: this.lastErrorString,
                            errmsg: 'An error was encountered while removing orders (error code ' + this.lastError + '): ' + this.lastErrorString
                        }
                    }

                    // update progressbar...
                    GeckoJS.BaseObject.sleep(50);

                    if (!this.commit()) {
                        throw {
                            errno: this.lastError,
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
        }

    };

    var OrderModel = window.OrderModel =  AppModel.extend(__model__);
})();
