(function() {

    var SequenceModel = window.SequenceModel = GeckoJS.Model.extend(
    {
    
        getSequence: function(key) {
            return (new this).getSequence(key);
        },

        resetSequence: function(key, value) {
            return (new this).resetSequence(key, value);
        }
    }
    ,
    {
        name: 'Sequence',

        getRemoteService: function(method) {
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

                //dump('sequence services url ' + this.url + "\n");

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(url, key, value) {

            var reqUrl = url + '/' + key;

            if (value != null) reqUrl += '/' + value;

            var username = this.username ;
            var password = this.password ;

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeout = null;
            timeout = setTimeout(function() {
                try {
                    req.abort();

                }catch(e) {
                    // dump('timeout exception ' + e + "\n");
                }
            }, 15000);

            /* Start Request with http basic authorization */
            var seq = -1;

            req.open('GET', reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                // dump( "onreadystatechange " + req.readyState  + "\n");
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if(req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            seq = result.value;
                        }
                    }
                }
            };

            var request_data = null;
            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);
                
                // block ui until request finish or timeout
                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                while(!reqStatus.finish) {
                    thread.processNextEvent(true);
                }

            }catch(e) {
                // dump('send exception ' + e + "\n");
            }finally {
                if(timeout) clearTimeout(timeout);
                if(req)                 delete req;
                if (reqStatus) delete reqStatus;
            }
            return seq;
        
        },
    
        getSequence: function(key) {
            key = key || "default";

            var remoteUrl = this.getRemoteService('getSequence');
            var seq = -1;

            var isTraining = GeckoJS.Session.get( "isTraining" );

            if (remoteUrl && !isTraining) {
            
                seq = this.requestRemoteService(remoteUrl, key, null);
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

				if ( isTraining )
					return seq.value;

                seq.value++;
                this.id = seq.id;
                this.save(seq);
                return seq.value;

            }

        },

        resetSequence: function(key, value) {
            var isTraining = GeckoJS.Session.get( "isTraining" );
            if (isTraining) return;

            key = key || "default";

            if (value == null) {
                value = 0;
            }

            var remoteUrl = this.getRemoteService('resetSequence');

            var seq = -1;
            if (remoteUrl) {
            
                seq = this.requestRemoteService(remoteUrl, key, value);
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
                this.save(seq);
                return seq.value;
            }
        }
    }
    );
})();
