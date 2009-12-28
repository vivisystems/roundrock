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

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = this.syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.sale_period_hostname);
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

        isSalePeriodHandler: function() {
            if (this.isRemoteService()) {
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
            
            // get sale period from remote service
            if(this.isRemoteService()) {
                
                var remoteUrl = this.getHttpService().getRemoteServiceUrl('getDateSequence') + '/' + 'sale_period';
                //this.log('DEBUG', 'retrieving cluster sale period: ' + remoteUrl);
                var sp = this.getHttpService().requestRemoteService('GET', remoteUrl, null, async, callback);
                //this.log('DEBUG', 'cluster sale period retrieved: ' + sp);
                return sp;
                
            } else {
                return false;
            }
        },

        advanceClusterSalePeriod: function(newSalePeriod) {
            
            if(this.isRemoteService()) {
                var remoteUrl = this.getHttpService().getRemoteServiceUrl('setSequence') + '/' + 'sale_period' + '/' + newSalePeriod ;
                return this.getHttpService().requestRemoteService('GET',remoteUrl);
            } else {
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
