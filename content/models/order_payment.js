(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderPayment',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,


        mappingTranToOrderPaymentsFields: function(data) {

            var orderPayments = [];
            var i = 0;
            var len = GeckoJS.BaseObject.getKeys(data.trans_payments).length;
            
            for (var iid in data.trans_payments) {
                i++;
                let payment = data.trans_payments[iid];

                let orderPayment = GREUtils.extend({}, payment);

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

        mappingOrderPaymentsFieldsToTran: function(orderData, data) {

            var payments = {};

            data['trans_payments'] = payments;

            if (!orderData.OrderPayment || typeof orderData.OrderPayment == 'undefined') return payments;

            for (var idx in orderData.OrderPayment) {

                let payment = orderData.OrderPayment[idx];
                let paymentIndex = payment.id;

                payments[paymentIndex] = {
                    'id': payment.id,
                    'name': payment.name,
                    'amount': payment.amount,
                    'origin_amount': payment.origin_amount,
                    'memo1': payment.memo1,
                    'memo2': payment.memo2
                };
                
            }
            
            data['trans_payments'] = payments;

            return payments;
        },

        getRemoteServiceUrl: function(method) {

            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == '1' && this.syncSettings.table_active == '1') {

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

            // this.log('DEBUG', 'requestRemoteService url: ' + reqUrl + ', with method: ' + type);

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

        savePayment: function(data) {

            var async = false;
            var callback = null;

            var remoteUrl = this.getRemoteServiceUrl('savePayment');
            // var remoteUrl = this.getRemoteService('saveOrder');

            if(remoteUrl) {

                var response_data = this.requestRemoteService('POST', remoteUrl, data);

                if (!response_data) {
                    // save order fail...
                    this.log('ERROR',
                             'An error was encountered while saving payment (error code ' + this.lastError + '): ' + this.lastErrorString);
                    return false;
                }

                return true;


            }else {

                var r = this.save(data);
                if (!r) {
                    this.log('ERROR',
                             'An error was encountered while saving payment (error code ' + this.lastError + '): ' + this.lastErrorString);

                    //@db saveToBackup
                    r = this.saveToBackup(data);
                    if (r) {
                        this.log('ERROR', 'record saved to backup');
                    }
                    else {
                        this.log('ERROR',
                                 'record could not be saved to backup\n' + this.dump(data));
                    }
                }
                return r;
            }
            
        },

        saveLedgerPayment: function(data) {

            var async = false;
            var callback = null;

            var remoteUrl = this.getRemoteServiceUrl('saveLedgerPayment');
            // var remoteUrl = this.getRemoteService('saveOrder');

            if(remoteUrl) {

                var response_data = this.requestRemoteService('POST', remoteUrl, data);

                if (!response_data) {
                    // save order fail...
                    this.log('ERROR',
                             'An error was encountered while saving ledger payment (error code ' + this.lastError + '): ' + this.lastErrorString);

                    return false;
                }

                return true;


            }else {

                var r = this.save(data);
                if (!r) {
                    this.log('ERROR',
                             'An error was encountered while saving ledger payment (error code ' + this.lastError + '): ' + this.lastErrorString);

                    //@db saveToBackup
                    r = this.saveToBackup(data);
                    if (r) {
                        this.log('ERROR', 'record saved to backup');
                    }
                    else {
                        this.log('ERROR',
                                 'record could not be saved to backup\n' + this.dump(data));
                    }
                }
                return r;
            }
        }
    }
    var OrderPaymentModel = window.OrderPaymentModel =  AppModel.extend(__model__);

})();
