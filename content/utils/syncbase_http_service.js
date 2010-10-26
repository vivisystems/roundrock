(function() {

    /**
     * PHP Sync Base Http WebService .(PURE Javascript function)
     *
     * Use: Basic authorization
     *
     * Request params: request_data
     * Response param: response_data
     * 
     */

    var __class__ = function() {

        this.name = 'SyncbaseHttpService'
    };

    __class__.prototype = {

        syncSettings: false,

        machineId: '',
        username: '',
        password: '',

        protocol: 'http',
        port: 80,      
        hostname: 'localhost',
        controller: '',
        action: '',
        active: 0,
        timeout: 60,
        force: false,

        lastReadyState: 0,
        lastStatus: 0,
        lastResponseStatus: '',
        lastResponseCode: 0,

        init: function() {
            
        },

        getSyncSettings: function() {
            return this.syncSettings || {};
        },

        setSyncSettings: function(syncSettings) {
            // using syncSettings to setup default
            if (typeof syncSettings == 'object') {

                this.syncSettings = syncSettings ;

                // this.setUsername(syncSettings.username); always vivipos
                this.setMachineId(syncSettings.machine_id);
                this.setPassword(syncSettings.password);
                this.setProtocol(syncSettings.protocol);
                this.setHostname(syncSettings.hostname);
                this.setPort(syncSettings.port);
                this.setActive(syncSettings.active);
                this.setTimeout(syncSettings.timeout);
            }

        },

        getMachineId: function() {
            return (this.machineId || 'vivipos');
        },

        setMachineId: function(machineId) {
            this.machineId = machineId || '';
        },

        getUsername: function() {
            return (this.username || 'vivipos');
        },

        setUsername: function(username) {
            this.username = username || 'vivipos';
        },

        getPassword: function() {
            return (this.password || '123456');
        },

        setPassword: function(password) {
            this.password = password || '';
        },

        getProtocol: function() {
            return (this.protocol || 'http');
        },

        setProtocol: function(protocol) {
            this.protocol = protocol || 'http';
        },

        getHostname: function() {
            return this.hostname;
        },

        setHostname: function(hostname) {
            this.hostname = hostname || 'localhost';
        },

        getPort: function() {
            return (this.port || 80);
        },

        setPort: function(port) {
            this.port = isNaN(parseInt(port)) ? 80 : parseInt(port);
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

        isActive: function() {
            return ( parseInt(this.active) != 0 );
        },

        setActive: function(active) {
            this.active = parseInt(active);
        },

        isForce: function() {
           return this.force; 
        },

        setForce: function(force) {
            this.force = (force || false);
        },

        isLocalhost: function() {
            var hostname = this.getHostname();
            return (hostname == 'localhost' || hostname == '127.0.0.1');
        },

        getTimeout: function() {
            return (this.timeout || 60);
        },

        setTimeout: function(timeout) {
            this.timeout = parseInt(timeout);
        },

        isRemoteService: function() {
            if ((!this.isActive() || this.isLocalhost()) && !this.isForce()) {
                return false;
            }
            return true;
        },

        
        setAuthorizationHeader: function(req) {

            var username = this.getUsername() ;
            var password = this.getPassword() ;
            var machineId = this.getMachineId();

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));
            req.setRequestHeader('X-Vivipos-Machine-Id', machineId);
        },

        getRemoteServiceUrl: function(action, force) {

            force = force || false;

            if (!this.isRemoteService() && !force) return false;
            
            var hostname = this.getHostname();
            var protocol = this.getProtocol();
            var port = (this.isLocalhost() ? '80' : this.getPort());
            var controller = this.getController();

            if (hostname.indexOf(':') != -1) {
                var tmpArray = hostname.split(':');
                hostname = tmpArray[0];
                port = tmpArray[1];
            }    

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

            let result = '';
            // use encodeComponentURI
            if (typeof data == 'object') {
                result = JSON.stringify(data);
            }else {
                result = encodeURIComponent(data) ;
            }
            return result;
           
        },

        requestRemoteService: function(method, url, data, async, callback, raw) {

            var reqUrl = url ;
            method = method || 'GET';

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            // set this reference to self for callback
            var self = this;

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeoutSec = this.getTimeout() * 1000;
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
            
            // Set header so the called script knows that it's an XMLHttpRequest
            req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            
            // set vivipos web service basic authorization
            this.setAuthorizationHeader(req);

            // reset status 
            self.lastReadyState = 0;
            self.lastStatus = 0;
            self.resultStatus = '';
            self.lastResponseStatus = '';
            self.lastResponseCode = 0;

            // set readystatechange handler
            req.onreadystatechange = function (aEvt) {

                self.lastReadyState = req.readyState;
                self.lastStatus = req.status;

                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        try {
                            if (raw) {
                                // set last status
                                self.lastResponseStatus = 'ok';
                                self.lastResponseCode = 200;

                                datas = req.responseText;
                            }
                            else {
                                var result = self.parseResponseText(req.responseText);

                                // set last status
                                self.lastResponseStatus = result.status;
                                self.lastResponseCode = result.code;

                                // set response data
                                if (result.status == 'ok') {
                                    datas = result.response_data;
                                }
                            }
                        }catch(e) {
                            self.log('ERROR', 'requestRemoteService decode error', e);
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            try{
                                callback.call(this, datas);
                            }catch(e) {
                                self.log('ERROR', 'callback error ', e);
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
                    
                    var now = (new Date()).getTime();

                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (!reqStatus.finish) {

                        if ((new Date()).getTime() > (now+timeoutSec)) break;
                        
                        thread.processNextEvent(true);
                    }
                }

            }catch(e) {
                this.log('ERROR', 'requestRemoteService req.send error ', e);
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
                    this.log('ERROR', 'callback error ', e);
                }
                
            }
            return datas;

        },

        log: function(level, message, exception) {

            // using GeckoJS class logger
            if (GeckoJS && GeckoJS.BaseObject) {
                GeckoJS.BaseObject.log(this.name, level, message, exception);
            }else {
                // using window.dump
                dump((new Date()).toString() + ':' + ' ['+ level +'] ' + message + '\n');
            }
            
        }

    };

    var SyncbaseHttpService = window.SyncbaseHttpService = __class__;
        //GeckoJS.BaseObject.extend('SyncbaseHttpService', __class__);

})() ;
