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
        },

        getLocalSequence: function(key) {
            return (new this).getLocalSequence(key);
        },

        resetLocalSequence: function(key, value) {
            return (new this).resetLocalSequence(key, value);
        },

        removeSequence: function(key) {
            return (new this).removeSequence(key);
        }
    };

    var __model__ = {

        name: 'Sequence',
    
        autoRestoreFromBackup: true,

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.sequence_hostname);
                    this.httpService.setController('sequences');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }
            
            return this.httpService;
        },
        
        isRemoteService: function() {
            return !this.getHttpService().isLocalhost();
        },
        
        getSequence: function(key, async, callback) {
            
            key = key || "default";
            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var isRemote = this.isRemoteService();
            var seq = -1;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            if (isRemote && !isTraining) {

                var remoteUrl = this.getHttpService().getRemoteServiceUrl('getSequence');
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

        setSequence: function(key, value) {
            key = key || "default";
            value = value || 0;
            
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            // discard training mode.
            if (isTraining) return true;

            var result = false;
            var isRemote = this.isRemoteService();

            if (isRemote) {

                var remoteUrl = this.getHttpService().getRemoteServiceUrl('setSequence');
                remoteUrl += '/'+key+'/'+value;
                result = this.getHttpService().requestRemoteService('GET', remoteUrl) || false ;

            } else {
                result = this.setLocalSequence(key, value);
            }
            return result;

        },

        setSequenceMaxValue: function(key, value) {
            
             key = key || "default";
            value = value || 0;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            // discard training mode.
            if (isTraining) return true;

            var result = false;
            var isRemote = this.isRemoteService();

            if (isRemote) {

                var remoteUrl = this.getHttpService().getRemoteServiceUrl('setSequenceMaxValue');
                remoteUrl += '/'+key+'/'+value;
                result = this.getHttpService().requestRemoteService('GET', remoteUrl) || false ;

            } else {
                result = this.setLocalSequenceMaxValue(key, value);
            }
            return result;

           
        },

        getLocalSequence: function(keys ) {
            
            var arKeys = keys.split(',');
            var result = [] ;

            this.begin();

            arKeys.forEach(function(key) {

                let seq = this.findByIndex('first', {
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

                result.push(seq.value);

            }, this);

            this.commit();

            return result.join(',');

        },


        getTraningSequence: function(key) {
            
            // training mode not update seq to real database.
            var seq = GeckoJS.Session.get( "TRAINING_" + key) || {
                value: 0
            };
            seq.value++;
            GeckoJS.Session.set( "TRAINING_" + key, seq);
            
            return seq.value;
            
        },


        setLocalSequence: function(key, value) {

            this.begin();
            
            let seq = this.findByIndex('first', {
                index: 'key',
                value: key
            }) || {
                id: "",
                key: key,
                value: 0,
                max_value: 0
            };
            seq.value = value;

            let result = true;
            this.id = seq.id;
            result = this.save(seq);

            this.commit();

            return result;

        },

        setLocalSequenceMaxValue: function(key, value) {

            this.begin();
            
            let seq = this.findByIndex('first', {
                index: 'key',
                value: key
            }) || {
                id: "",
                key: key,
                value: 0,
                max_value: 0
            };
            seq.max_value = value;

            let result = true;
            this.id = seq.id;
            result = this.save(seq);

            this.commit();

            return result;

        },

        resetSequence: function(key, value, async, callback) {

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if (isTraining) return 1;

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
            
                seq = this.resetLocalSequence(key, value);

		if (seq != -1) {
		    if (callback) {
			callback.call(this, seq.value);
		    }
		    return seq.value;
		}
		else {
		    return seq;
		}
            }
        },

        removeSequence: function(key) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if (isTraining) return;

            key = key || "default";

            this.begin();

            var seq = this.findByIndex('first', {
                index: 'key',
                value: key
            });
            var r;
            if (seq) {
                r = this.del(seq.id);
            }
            this.commit();
            return r;
        },

        resetLocalSequence: function(key, value) {

	    var seq;
	    var r;

            if (this.begin()) {

            	var seq = this.findByIndex('first', {
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
		if (this.save(seq) || this.saveToBackup(seq)) {
		    if (this.commit()) {
			return seq;
		    }
		}
		this.rollback();
	    }
	    return -1;
        }
    }

    var SequenceModel = window.SequenceModel = AppModel.extend(__class__, __model__);
    
})();
