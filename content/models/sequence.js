(function() {

    var __class__ = {
        getSequence: function(key, async, callback) {
            return (new this).getSequence(key, async, callback);
        },

        resetSequence: function(key, value, async, callback) {
            return (new this).resetSequence(key, value, async, callback);
        }
    };

    var __model__ = {

        name: 'Sequence',
    
        autoRestoreFromBackup: true,

        timeout: 15,
        
        getRemoteServiceUrl: function(method) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == 1) {

                var hostname = this.syncSettings.sequence_hostname || 'localhost';

                if (hostname == 'localhost' || hostname == '127.0.0.1') return false;
                
                //  http://localhost:3000/sequences/getSequence/check_no
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

            this.log('DEBUG', 'requestRemoteService url: ' + reqUrl + ', with key: ' + key);

            // set this reference to self for callback
            var self = this;

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
                    self.log('WARN', 'requestRemoteService url: ' + reqUrl +'  timeout, call req.abort');
                    req.abort();
                }
                catch(e) {
                    self.log('ERROR', 'requestRemoteService timeout exception ' + e );
                }
            }, timeoutSec);

            /* Start Request with http basic authorization */
            var seq = -1;

            req.open('GET', reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                //dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            seq = result.value;
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            callback.call(this, seq);
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
                callback.call(this, seq);
            }
            return seq;
        
        },
    
        getSequence: function(key, async, callback) {
            key = key || "default";
            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var remoteUrl = this.getRemoteServiceUrl('getSequence');
            var seq = -1;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            if (remoteUrl && !isTraining) {
            
                seq = this.requestRemoteService(remoteUrl, key, null, async, callback);
                return seq;
            
            } else {

                seq = this.findByIndex('first', {
                    index: 'key',
                    value: key
                }) ||

                {
                    id: "",
                    key: key,
                    value: 0
                };

                seq.value++;
                this.id = seq.id;
                if (!this.save(seq) && !isTraining) {
                    this.saveToBackup(seq);
                }

                if (callback) {
                    callback.call(this, seq.value);
                }
                return seq.value;

            }

        },

        resetSequence: function(key, value, async, callback) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if (isTraining) return;

            key = key || "default";

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            if (value == null) {
                value = 0;
            }

            var remoteUrl = this.getRemoteServiceUrl('resetSequence');

            var seq = -1;
            if (remoteUrl) {
            
                seq = this.requestRemoteService(remoteUrl, key, value, async, callback);
                return seq;

            }else {
            
                seq = this.findByIndex('first', {
                    index: 'key',
                    value: key
                }) ||

                {
                    id: "",
                    key: key,
                    value: 0
                };
                seq.value = value;
                this.id = seq.id;
                if (!this.save(seq)) {
                    this.saveToBackup(seq);
                }

                if (callback) {
                    callback.call(this, seq.value);
                }
                return seq.value;
            }
        }
    }

    var SequenceModel = window.SequenceModel = GeckoJS.Model.extend(__class__, __model__);
    
})();
