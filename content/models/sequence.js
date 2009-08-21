(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

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

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    this.httpService = new SyncbaseHttpService();
                    var syncSettings = this.httpService.getSyncSettings();
                    this.httpService.setHostname(syncSettings.sequence_hostname);
                    this.httpService.setController('sequences');
                }
            }catch(e) {
                this.log('error ' + e);
            }
            
            return this.httpService;
        },
        
   
        getSequence: function(key, async, callback) {
            
            key = key || "default";
            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('getSequence');
            var seq = -1;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            if (remoteUrl && !isTraining) {

                remoteUrl += '/'+key;
                seq = this.getHttpService().requestRemoteService('GET', remoteUrl, null, async, callback) || -1 ;

                return seq ;
            
            } else {

                if (isTraining) {
                    seq = this.getTraningSequence(key);
                }else {
                    seq = this.getLocalSequence(key);
                }

                if (callback) {
                    return callback.call(this, seq);
                }
                return seq;

            }

        },

        getLocalSequence: function(key ) {

            var seq = this.findByIndex('first', {
                index: 'key',
                value: key
            }) || {
                id: "",
                key: key,
                value: 0,
                max_value: 0
            };

            seq.value++;

            if (seq.max_value != 0 && seq.value > seq.max_value ) {
                seq.value = 1;
            }

            this.id = seq.id;
            if (!this.save(seq)) {
                this.saveToBackup(seq);
            }

            return seq.value;

        },


        getTraningSequence: function(key) {
            
            // training mode not update seq to real database.
            var seq = GeckoJS.Session.get( "TRAINING_" + key) || {value: 0};
            seq.value++;
            GeckoJS.Session.set( "TRAINING_" + key, seq);
            
            return seq.value;
            
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

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('resetSequence');

            // always reset localhost databases 2009.08.20 irving/frank
            remoteUrl = false;

            var seq = -1;
            if (remoteUrl) {
            
                remoteUrl += '/'+key + '/' + value;
                seq = this.getHttpService().requestRemoteService('GET', remoteUrl, null, async, callback) || -1 ;

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

    var SequenceModel = window.SequenceModel = AppModel.extend(__class__, __model__);
    
})();
