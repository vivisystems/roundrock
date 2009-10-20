(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {
    
        name: 'OrderQueue',

        useDbConfig: 'order',

        autoRestoreFromBackup: false,

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname); // XXX table or order services ??
                    this.httpService.setController('order_queues');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('ERROR', 'Error getHttpService', e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },
        
        isLocalhost: function() {
            return this.getHttpService().isLocalhost();
        },


        pushQueue: function(username, id, data) {

            if (!data || !username || !id ) return true;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            let mode = isTraining ? 0 : 1;

            var datas = {
                user: username,
                id: id,
                mode: mode,
                status: 1
            };
            
            if (data.seq) datas.seq = data.seq;
            if (data.items) datas.summary = this.buildQueueSummary(data);

            datas.object = btoa(GREUtils.Gzip.deflate(GeckoJS.BaseObject.serialize(data)));

            var requestUrl = this.getHttpService().getRemoteServiceUrl('pushQueue');
            var request_data = (GeckoJS.BaseObject.serialize(datas));

            var success = this.getHttpService().requestRemoteService('POST', requestUrl, request_data) || false ;

            return success;

        },

        popQueue: function(id) {
            
            if (!id ) return null;

            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            let mode = isTraining ? 0 : 1;

            var requestUrl = this.getHttpService().getRemoteServiceUrl('popQueue') + '/' + id + '/' + mode;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl) || null ;

            var data = null;

            if (result) {
                try {
                    data = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(result)));
                }catch(e) {
                    data = null;
                }
            }

            return data;

            
        },


        getQueueSummaries: function(username) {

            username = (username+'').length == 0 ? '__ALL__' : username ;
            
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;

            let mode = isTraining ? 0 : 1;

            var requestUrl = this.getHttpService().getRemoteServiceUrl('getQueueSummaries') + '/' + username + '/' + mode;

            var result = this.getHttpService().requestRemoteService('GET', requestUrl) || false ;

            return result;

        },

        removeUserQueue: function(username) {

            var requestUrl = this.getHttpService().getRemoteServiceUrl('removeUserQueue') + '/' + username;

            var count = this.getHttpService().requestRemoteService('GET', requestUrl ) || 0 ;

            return count;
            
        },

        hasUserQueue: function(username) {

            var requestUrl = this.getHttpService().getRemoteServiceUrl('getUserQueueCount') + '/' + username;

            var count = this.getHttpService().requestRemoteService('GET', requestUrl ) || 0 ;

            return count > 0;
            
        },

        buildQueueSummary: function(queueData) {
            
            var displayStr = "";

            displayStr += _("SEQ") + ": " + queueData.seq + "\n\n";

            var limit = 10, cc= 0;

            for(var txid in queueData.items) {
                var item = queueData.items[txid];
                displayStr += item.name + ' x ' + item.current_qty + '\n';
                cc++;
                if (cc>limit) break;
            }

            if (cc>limit) displayStr += "   ......   \n" ;

            displayStr += "\n\n" + _("TAL") + ": " + queueData.remain;

            return displayStr;
        },

        removeQueues: function(retainDate) {

            return this.execute("DELETE FROM " + this.table + " WHERE created <= " + retainDate);
            
        }


    };
    var OrderQueueModel = window.OrderQueueModel = AppModel.extend(__model__);

} )();
