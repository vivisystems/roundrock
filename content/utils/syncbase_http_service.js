(function() {

    var __class__ = {

        name: 'SyncbaseHttpService',

        syncSettings: null,

        username: false,
        password: false,

        hostname: '',
        controller: '',
        action: '',

        timeout: 30,

        lastReadyState: 0,

        lastStatus: 0,

        init: function() {
            
        },

        getSyncSettings: function() {

            if (!this.syncSettings) {
                this.syncSettings = (new SyncSetting()).read();
            }

            return this.syncSettings;
        },

        getUsername: function() {
            return (this.username || 'vivipos');
        },

        setUsername: function(username) {
            this.username = username || false;
        },

        getPassword: function() {
            return (this.password || this.getSyncSettings().password || '123456');
        },

        setPassword: function(password) {
            this.password = password || false;
        },

        getProtocol: function() {

            var protocol = this.getSyncSettings().protocol || 'http';

            return protocol;
            
        },

        getPort: function() {

            var port = this.getSyncSettings().port || '80';

            return port;

        },

        getHostname: function() {
            return this.hostname;
        },

        setHostname: function(hostname) {
            this.hostname = hostname || '';
        },

        getController: function() {
            return this.controller;
        },

        setController: function(controller) {
            this.controller = controller || '';
        },

        getAction: function() {
            return this.action;
        },

        setAction: function(action) {
            this.action = action || '';
        },

        isRemoteService: function() {
            this.syncSettings = this.getSyncSettings();
            var hostname = this.getHostname();

            if (!this.syncSettings || this.syncSettings.active == '0' || hostname == 'localhost' || hostname == '127.0.0.1') {
                // local service
                return false;
            }

            return true;

        },

        
        setAuthorizationHeader: function(req) {

            var username = this.getUsername() ;
            var password = this.getPassword() ;

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));
        },

        getRemoteServiceUrl: function(action) {

            if (!this.isRemoteService()) return false;
            
            this.syncSettings = this.getSyncSettings();
            var hostname = this.getHostname();
            var protocol = this.getProtocol();
            var port = this.getPort();
            var controller = this.getController();

            var url = protocol + '://' +
                      hostname + ':' +
                      port + '/' +
                      controller + '/' +
                      action;
            return url;

        },

        parseResponseText: function(text) {
            
            // always json format
            var fn = JSON.parse || GeckoJS.BaseObject.unserialize ;
            return fn.call(this, text);

        },

        encodeRequestData: function(data) {
            
            // use encodeComponentURI
            return encodeURIComponent(data)
           
        },

        requestRemoteService: function(method, url, data, async, callback) {

            var reqUrl = url ;
            method = method || 'GET';

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            dump( 'requestRemoteService url: ' + reqUrl + ', with method: ' + method);

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
            var timeout = setTimeout(function() {

                try {
                    self.log('WARN', 'requestRemoteService  timeout, call req.abort');
                    req.abort();
                }
                catch(e) {
                    self.log('ERROR', 'requestRemoteService timeout exception ' + e );
                }
            }, timeoutSec);


            /* Start Request with http basic authorization */
            var datas = null;

            req.open(method, reqUrl, true);

            // dump('request url: ' + reqUrl + '\n');

            // set vivipos web service basic authorization
            this.setAuthorizationHeader(req);

            // set readystatechange handler
            req.onreadystatechange = function (aEvt) {
                dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                self.lastReadyState = req.readyState;
                self.lastStatus = req.status;

                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        try {
                            dump('responseText = ' + req.responseText + '\n');
                            var result = self.parseResponseText(req.responseText);
                            dump('result = ' + result + '\n');
                            if (result.status == 'ok') {
                                datas = result.response_data;
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
                            try{
                                callback.call(this, datas);
                            }catch(e) {
                            }
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
                request_data = 'request_data=' + self.encodeRequestData(data);
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
                try{
                    callback.call(this, datas);
                }catch(e) {
                }
                
            }
            return datas;

        }

    };

    var SyncbaseHttpService = window.SyncbaseHttpService = GeckoJS.BaseObject.extend('SyncbaseHttpService', __class__);

})() ;
