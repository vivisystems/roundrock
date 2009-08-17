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

        timeout: 15,
        _orderLastTime: 0,

        getRemoteServiceUrl2: function(method,force_remote) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == 1 && this.syncSettings.table_active) {

                // var hostname = this.syncSettings.table_hostname || 'localhost';
                var hostname = this.syncSettings.hostname || 'localhost';
                if ((hostname == 'localhost' || hostname == '127.0.0.1') && !force_remote) return false;

                //  http://localhost:3000/sequences/getSequence/check_no
                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'orders/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                //dump('table services url ' + this.url + "\n");

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService2: function(method, url, value) {

            var reqUrl = url ;

            var username = this.username ;
            var password = this.password ;

            this.log('DEBUG', 'requestRemoteService2 url: ' + reqUrl + ', with method: ' + method);

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeoutSec = this.timeout * 1000;
            var timeout = null;
            timeout = setTimeout(function() {
                try {
                    req.abort();

                }catch(e) {
                    // dump('timeout exception ' + e + "\n");
                }
            }, timeoutSec);

            /* Start Request with http basic authorization */
            var data = [];

            req.open(method, reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if(req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            data = result.value;
                        }
                    }
                }
            };

            // req.onreadystatechange = onstatechange
            var request_data = null;
            if(method == 'POST') {
                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                req.setRequestHeader("Content-length", "request_data=".length + value.length);
                req.setRequestHeader("Connection", "close");
                request_data = "request_data="+value;
            }

            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);

                // block ui until request finish or timeout
                var now = Date.now().getTime();

                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;

                while (!reqStatus.finish) {

                    if (Date.now().getTime() > (now+timeoutSec)) break;

                    thread.processNextEvent(true);
                }


            }catch(e) {
                data = [];
                // dump('send exception ' + e + "\n");
            }finally {
                if(timeout) clearTimeout(timeout);
                if(req)                 delete req;
                if (reqStatus) delete reqStatus;
            }

            return data;

        },

        getRemoteServiceUrl: function(method) {

            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == 1 && this.syncSettings.table_active) {

                var hostname = this.syncSettings.hostname || 'localhost';

                if (hostname == 'localhost' || hostname == '127.0.0.1') return false;

                //  http://localhost:3000/stocks/checkStock/
                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'orders/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(type, url, data, async, callback) {

            var reqUrl = url ;
            type = type || 'GET';

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var username = this.username ;
            var password = this.password ;

            this.log('DEBUG', 'requestRemoteService url: ' + reqUrl + ', with method: ' + type);

            // set this reference to self for callback
            var self = this;
            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeoutSec = this.syncSettings.timeout * 1000;
            var timeout = null;
            timeout = setTimeout(function() {

                try {
                    self.log('WARN', 'requestRemoteService url: ' + reqUrl +'  timeout, call req.abort');
                    req.abort();
                }
                catch(e) {
                    self.log('ERROR', 'requestRemoteService timeout exception ' + e );
                }
            }, timeoutSec);

            /* Start Request with http basic authorization */
            var datas = null;

            req.open(type, reqUrl, true/*, username, password*/);

            // dump('request url: ' + reqUrl + '\n');

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                // dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                self.lastReadyState = req.readyState;
                self.lastStatus = req.status;

                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        try {
                            var result = GeckoJS.BaseObject.unserialize(req.responseText);

                            if (result.status == 'ok') {
                                // datas = result.response_data;
                                datas = result.value;
                            }
                        }catch(e) {
                            self.log('ERROR', 'requestRemoteService decode error ' + e );
                            dump('decode error ' + e ) ;
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            callback.call(this, datas);
                        }
                        if (timeout) clearTimeout(timeout);
                        if (req) delete req;
                        if (reqStatus) delete reqStatus;
                    }
                }
            };

            var request_data = null;
            if (data) {
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                request_data = 'request_data=' + encodeURIComponent(GeckoJS.BaseObject.serialize(data));
            }

            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);

                if (!async) {
                    // block ui until request finish or timeout

                    var now = Date.now().getTime();

                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (!reqStatus.finish) {

                        if (Date.now().getTime() > (now+timeoutSec)) break;

                        thread.processNextEvent(true);
                    }
                }

            }catch(e) {
                this.log('ERROR', 'requestRemoteService req.send error ' + e );
            }finally {

                if (!async) {
                    if (timeout) clearTimeout(timeout);
                    if (req) delete req;
                    if (reqStatus) delete reqStatus;
                }

            }
            if (callback && !async) {
                callback.call(this, datas);
            }
            return datas;

        },

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


            var async = false;
            var callback = null;

            //this.log('DEBUG', 'decreaseStockRecords datas: ' + this.dump(datas));

            var remoteUrl = this.getRemoteServiceUrl('saveOrder');
            // var remoteUrl = this.getRemoteService('saveOrder');

            if(remoteUrl) {

                var datas = {
                    Order              : this.mappingTranToOrderFields(data),
                    OrderItem          : this.mappingTranToOrderItemsFields(data),
                    OrderAddition      : this.mappingTranToOrderAdditionsFields(data),
                    OrderPayment       : this.mappingTranToOrderPaymentsFields(data),
                    OrderAnnotation    : this.mappingTranToOrderAnnotationsFields(data),
                    OrderItemCondiment : this.mappingTranToOrderItemCondimentsFields(data),
                    OrderPromotion     : this.mappingTranToOrderPromotionsFields(data),
                    OrderObject        : this.mappingTranToOrderObjectFields(data)

                }

                // var response_data = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(datas));
                var response_data = this.requestRemoteService('POST', remoteUrl, datas);

                if (!response_data) {
                    // save order fail...
                    return false;
                }

                return true;


            }else {

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

                    var KeepEachTransaction = GeckoJS.Configure.read( "vivipos.fec.settings.KeepEachTransaction" );
                    if (data.status == 2 || ( data.status == 1 && KeepEachTransaction ) ) {// We save the object of a finalized order to DB for the sake of reprinting checks.

                        data.checksum = GREUtils.CryptoHash.md5(checksum);

                        if (!this.serializeOrder(data)) {
                            throw 'OrderObject';
                        }
                        this.log(data.id + ': ' + data.checksum);
                    }
                    return true;

                } catch(e) {
                    this.log(
                        'ERROR',
                        'record could not be saved to backup [' + e + ']\n' + this.dump(data)
                    );
                }

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

            var async = false;
            var callback = null;

            var remoteUrl = this.getRemoteServiceUrl('updateOrderMaster');

            if(remoteUrl) {

                var response_data = this.requestRemoteService('POST', remoteUrl, data);

                if (!response_data) {
                    // save order fail...
                    this.log('ERROR',
                             'An error was encountered while updating order master (error code ' + this.lastError + '): ' + this.lastErrorString);

                    return false;
                }

                return true;


            }else {

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
            }
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

        mappingTranToOrderObjectFields: function(data) {

            var orderObj = {};
            orderObj['id'] = data.id;
            orderObj['order_id'] = data.id;
            orderObj['object'] = data;

            return orderObj;

        },

        serializeOrder: function (data) {

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

            var remoteUrl = this.getRemoteServiceUrl2('unserializeOrder');
            var orderObject = null;

            if (remoteUrl) {
                try {
                    // orders = this.requestRemoteService('GET', remoteUrl + "/" + cond, null);
                    var requestUrl = remoteUrl + "/" + order_id + '/' + this.syncSettings.machine_id;
                    orderObject = this.requestRemoteService2('GET',requestUrl, null);
                    this.log(this.dump(orderObject));

                    // locked by remote machined
                    if(orderObject.LockedByMachineId) {
                        this.datasource.lastError = 98;
                        this.datasource.lastErrorString = orderObject.LockedByMachineId;
                    }

/*
                    //@todo
                    order.forEach(function(o){
                        var item = GREUtils.extend({}, o.Order);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                    });
*/
                    this._connected = true;
                }catch(e) {
                    orderObject = {};
                    this._connected = false;

                }

            }else {

                try {
                    orderObject = this.OrderObject.find('first', {
                        conditions:"order_id='"+order_id+"'"
                    });

                }catch(e) {
                    dump(e);
                }
            }

            if(orderObject && orderObject['OrderObject']) {
                // return GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(orderObject.object));
                return GeckoJS.BaseObject.unserialize(orderObject['OrderObject'].object);
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

        _convertOrderDataType: function(orderObj) {

            this.OrderItem.convertDataTypes( orderObj.OrderItem);
            this.OrderAddition.convertDataTypes( orderObj.OrderAddition);
            if (orderObj.OrderAddition.length == 0) delete orderObj.OrderAddition;
            this.OrderPayment.convertDataTypes( orderObj.OrderPayment);
            if (orderObj.OrderPayment.length == 0) delete orderObj.OrderPayment;
            this.OrderAnnotation.convertDataTypes( orderObj.OrderAnnotation);
            if (orderObj.OrderAnnotation.length == 0) delete orderObj.OrderAnnotation;
            this.OrderItemCondiment.convertDataTypes( orderObj.OrderItemCondiment);
            if (orderObj.OrderItemCondiment.length == 0) delete orderObj.OrderItemCondiment;
            this.OrderPromotion.convertDataTypes( orderObj.OrderPromotion);
            if (orderObj.OrderPromotion.length == 0) delete orderObj.OrderPromotion;

            return this.convertDataTypes( orderObj.Order);
        },

        getCheckList: function(key, no, lastModified) {
            //
            var self = this;

            if (!lastModified) lastModified = this._orderLastTime;
            if (!key) key = "AllCheck";

            var order = new OrderModel();
            var conditions = null;

            switch (key) {
                case 'CheckNo':
                    conditions = "Order.check_no='" + no + "'";
                    break;
                case 'TableNo':
                    conditions = "Order.table_no='" + no + "'";
                    break;
                case 'AllCheck':
                    conditions = "'2'='2'";
                    break;
                case 'OrderNo':
                    conditions = "Order.sequence='" + no + "'";
                    break;
                case 'OrderId':
                    conditions = "Order.id='" + no + "'";
                    break;
            }

            if (lastModified) {
                conditions += " AND Order.modified > " + lastModified;
            } else if (key != 'OrderId') {
                conditions += " AND Order.status='2'";
            }
            
            var remoteUrl = this.getRemoteServiceUrl2('getCheckList');
            var orders = null;

            if (remoteUrl) {
                try {
                    var cond = encodeURIComponent(conditions);
                    // orders = this.requestRemoteService('GET', remoteUrl + "/" + cond, null);
                    var response_data = this.requestRemoteService2('GET', remoteUrl + "/" + cond, null);
                    // orders = order.convertDataTypes( response_data.Order);
                    orders = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(response_data)));;

                    //@todo
                    orders.forEach(function(o){

                        var item = self._convertOrderDataType(o);

                        for (var key in item) {
                            o[key] = item[key];
                        }

                    });

                    this._connected = true;
                }catch(e) {
                    orders = [];
                    this._connected = false;

                }

            }else {

                var self = this;

                switch (key) {
                    case 'CheckNo':
                        conditions = "orders.check_no='" + no + "'";
                        break;
                    case 'TableNo':
                        conditions = "orders.table_no='" + no + "'";
                        break;
                    case 'AllCheck':
                        conditions = "'2'='2'";
                        break;
                    case 'OrderNo':
                        conditions = "orders.sequence='" + no + "'";
                        break;
                    case 'OrderId':
                        conditions = "orders.id='" + no + "'";
                        break;
                }

                if (lastModified) {
                    conditions += " AND orders.modified > " + lastModified;
                } else if (key != 'OrderId') {
                    conditions += " AND orders.status='2'";
                }

                var fields = null;

                orders = order.find('all', {fields: fields, conditions: conditions, recursive: 2});
            }

            if (orders && orders.length > 0)
            this._orderLastTime = orders[orders.length - 1].modified;

            delete (order);
            return orders;
        },

        getOrderChecksum: function(id) {
            if (!id) return ""; // return "" is id not specify
return true;
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
