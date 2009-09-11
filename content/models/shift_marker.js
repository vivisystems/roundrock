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
            return s.replace( re, '\'\'' );
        },

        getRemoteServiceUrl: function(method) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == '1') {

                var hostname = this.syncSettings.sale_period_hostname || 'localhost';

                if (hostname.toLowerCase() == 'localhost' || hostname == '127.0.0.1') return false;

                if (method == 'advanceSalePeriod' && this.syncSettings.advance_sale_period != '0') return false;
                
                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'saleperiod/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(reqUrl, async, callback) {

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;


            var username = this.username ;
            var password = this.password ;

            this.log('DEBUG', 'requestRemoteService url: ' + reqUrl);

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
                callback.call(this, sp);
            }
            return sp;
        },

        isSalePeriodHandler: function() {
            if (this.getRemoteServiceUrl('getSalePeriod')) {
                return this.getRemoteServiceUrl('advanceSalePeriod');
            }
            else {
                // sale period handled locally
                return true;
            }
        },

        getMarker: function(async, callback) {

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var remoteUrl = this.getRemoteServiceUrl('getSalePeriod');
            var sp;

            // get remote sale period, if needed
            if (remoteUrl) {
                sp = this.requestRemoteService(remoteUrl, async, callback);
            }
            
            var terminalNo = GeckoJS.Session.get('terminal_no');

            // get local shift marker
            var shift = this.find('first', {
                conditions: "terminal_no = '" + this._queryStringPreprocessor(terminalNo) +  "'",
                recursive: 0
            });

            if (remoteUrl) {
                if (!shift) {
                    // no local shift marker, create one
                    shift = {shift_number: 1,
                             end_of_shift: false
                            };
                }
                //@testing begin
                else if (false) {
                    alert('sp from remote: ' + sp + ', replaced with ' + shift.sale_period);
                    sp = shift.sale_period;
                }
                //@testing end
                // if sale period has changed, reset shift number to 1
                if (sp < 0) {
                    shift.shift_number = '';
                    shift.end_of_shift = false;
                }
                else if (sp != shift.sale_period) {
                    shift.shift_number = 1;
                    shift.end_of_shift = false;
                }
                shift.sale_period = sp;
                shift.end_of_period = false;
            }
            return shift;
        },

        saveMarker: function(data, async, callback) {

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var remoteUrl = this.getRemoteServiceUrl('advanceSalePeriod');
            
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
            else {

                // if closing sale period, check if we need to advance sale period
                if (data.end_of_period && remoteUrl) {
                    var sp = this.requestRemoteService(remoteUrl, async, callback);
                    if (sp == -1) {
                        this.log('ERROR',
                                 'An error was encountered while advancing remote sale period');
                        this.datasource.lastError = -301;
                        this.datasource.lastErrorString = _('An error was encountered while advancing remote sale period');
                        return;
                    }
                }
            }
            return r;
        }
    }
    
    var ShiftMarkerModel = window.ShiftMarkerModel = AppModel.extend(__model__);

})();
