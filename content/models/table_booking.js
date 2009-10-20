( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableBookingModel = window.TableBookingModel = AppModel.extend({
        
        name: 'TableBooking',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        behaviors: ['Training'],

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setController('table_bookings');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        },


        getTableBookings: function(startTime, endTime) {

            var bookings = [] ;
            
            var remoteUrl = this.getHttpService().getRemoteServiceUrl('getTableBookings');
            var requestUrl = remoteUrl + '/' + startTime + '/' + endTime ;
            bookings = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || [] ;

            return bookings;
            
        },

        getAllTables: function() {

            var tables = [] ;

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('getAllTables');
            var requestUrl = remoteUrl ;
            tables = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;

            return tables;
        },
        
        getAvailableTables: function(startTime, partySize, bookingId) {

            var tables = [] ;
            
            var remoteUrl = this.getHttpService().getRemoteServiceUrl('getAvailableTables');
            var requestUrl = remoteUrl + '/' + startTime + '/' + partySize + '/' + bookingId;
            tables = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;

            return tables;
        },

        addTableBooking: function(data) {
            
            var remoteUrl = this.getHttpService().getRemoteServiceUrl('addTableBooking');
            var requestUrl = remoteUrl;
            var result = this.getHttpService().requestRemoteService('POST', requestUrl, data, false, null) || null ;

            return result;
        },

        updateTableBooking: function(id, data) {

            var remoteUrl = this.getHttpService().getRemoteServiceUrl('updateTableBooking');
            var requestUrl = remoteUrl + '/' + id;
            var result = this.getHttpService().requestRemoteService('POST', requestUrl, data, false, null) || null ;

            return result;
        },

        removeTableBooking: function(id) {
            
            var remoteUrl = this.getHttpService().getRemoteServiceUrl('removeTableBooking');
            var requestUrl = remoteUrl + '/' + id;
            var result = this.getHttpService().requestRemoteService('GET', requestUrl, null, false, null) || null ;
            
            return result;
        }

        
    });
} )();
