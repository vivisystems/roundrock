(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'ShiftMarker',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return (s == null || s.length == 0) ? '' : s.replace( re, '\'\'' );
        },

        getRemoteServiceUrl: function(method) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == '1') {

                var hostname = this.syncSettings.sale_period_hostname || 'localhost';

                if (hostname.toLowerCase() == 'localhost' || hostname == '127.0.0.1') return false;

                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'sequences/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(url, key, value, async, callback) {

            var reqUrl = url + '/' + key;

            if (value != null) reqUrl += '/' + value;

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;


            var username = this.username ;
            var password = this.password ;

            //this.log('DEBUG', 'requestRemoteService url: ' + reqUrl + ', with key: ' + key);

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
            //var timeoutSec = this.timeout * 1000;
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
            var sp = -1;

            req.open('GET', reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                //dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            sp = result.value;
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            callback.call(this, sp);
                        }
                        if (timeout) clearTimeout(timeout);
                        if (req) delete req;
                        if (reqStatus) delete reqStatus;
                    }
                }
            };

            var request_data = null;
            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);

                if (!async) {
                    // block ui until request finish or timeout

                    var now = (new Date()).getTime();

                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (!reqStatus.finish) {

                        if ((new Date()).getTime() > (now+timeoutSec)) break;

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
                callback.call(this, sp);
            }
            return sp;
        },

        isSalePeriodHandler: function() {
            if (this.getRemoteServiceUrl('getDateSequence')) {
                return this.syncSettings.advance_sale_period == '1';
            }
            else {
                // sale period handled locally
                return true;
            }
        },

        getClusterSalePeriod: function(async, callback) {

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var remoteUrl = this.getRemoteServiceUrl('getDateSequence');

            //this.log('DEBUG', 'retrieving cluster sale period: ' + remoteUrl);
            
            // get sale period from remote service
            if (remoteUrl) {
                var sp = this.requestRemoteService(remoteUrl, 'sale_period', null, async, callback);
                //this.log('DEBUG', 'cluster sale period retrieved: ' + sp);
                return sp;
            }
            else {
                return false;
            }
        },

        advanceClusterSalePeriod: function(newSalePeriod) {
            var remoteUrl = this.getRemoteServiceUrl('setSequence');
            if (remoteUrl) {
                return this.requestRemoteService(remoteUrl, 'sale_period', newSalePeriod);
            }
            else {
                return false;
            }
        },

        getMarker: function() {

            var terminalNo = GeckoJS.Session.get('terminal_no');

            // get local shift marker
            var shift = this.find('first', {
                conditions: "terminal_no = '" + this._queryStringPreprocessor(terminalNo) +  "'",
                recursive: 0
            });

            return shift;
        },

        saveMarker: function(data) {

            // always retrieve marker first
            var marker = this.getMarker();
            if (parseInt(this.lastError) != 0) {
                this.log('ERROR',
                         'An error was encountered while retrieving shift marker id (error code ' + this.lastError + '): ' + this.lastErrorString);
                return false;
            }

            if (marker) {
                this.id = data.id = marker.id;
            }

            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving shift marker (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup' + this.dump(data));
                }
            }
            return r;
        }
    }
    
    var ShiftMarkerModel = window.ShiftMarkerModel = AppModel.extend(__model__);

})();
