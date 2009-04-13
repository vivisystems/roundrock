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

            //  http://localhost:3000/sequences/getSequence/check_no
            // check connection status
            this.url = this.syncSettings.protocol + '://' +
                        this.syncSettings.hostname + ':' +
                        this.syncSettings.port + '/' +
                        'sequences/' + method;

            this.username = 'vivipos';
            this.password = this.syncSettings.password ;

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

                    var req = new XMLHttpRequest();

                    req.mozBackgroundRequest = true;

                    /* Request Timeout guard */
                    /*
                    var timeout = null;
                    timeout = setTimeout(function() {
                        clearTimeout(timeout);
                        req.abort();
                    }, 15000);
                    */
                    /* Start Request with http basic authorization */
                    var seq = -1;
                    req.open('GET', reqUrl, false, username, password);
                    var onstatechange = function (aEvt) {
                        if (req.readyState == 4) {
                            if(req.status == 200) {
                                var result = GeckoJS.BaseObject.unserialize(req.responseText);
                                if (result.status == 'ok') {
                                    seq = result.value;
                                }else {
                                    seq = -1;
                                }
                            }else {
                                seq = -1;
                            }
                        }
                        delete req;
                    };

                    // req.onreadystatechange = onstatechange
                    req.send(null);
                    onstatechange();
                    return seq;
        
    },
    
    getSequence: function(key) {
        key = key || "default";

        var remoteUrl = this.getRemoteService('getSequence');
        var seq = -1; 

        if (remoteUrl) {
            
            seq = this.requestRemoteService(remoteUrl, key, null);
            return seq;
            
        }else {

            seq = this.findByIndex('first', {index: 'key', value: key}) ||
                      {id: "", key: key, value: 0};
            seq.value++;
            this.id = seq.id;
            this.save(seq);
            return seq.value;

        }

    },

    resetSequence: function(key, value) {
        key = key || "default";

	if (value == null) {value = 0;}

        var remoteUrl = this.getRemoteService('resetSequence');

        var seq = -1;
        if (remoteUrl) {
            
            seq = this.requestRemoteService(remoteUrl, key, value);
            return seq;

        }else {
            
            seq = this.findByIndex('first', {index: 'key', value: key}) ||
                      {id: "", key: key, value: 0};
            seq.value = value;
            this.id = seq.id;
            this.save(seq);
            return seq.value;

        }


    }
}
);
