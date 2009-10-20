(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    /**
     * TableOrder Model
     */
    var __model__ = {

        name: 'TableOrder',

        useDbConfig: 'table',

        behaviors: ['Training'],

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.table_hostname);
                    this.httpService.setController('table_orders');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        isRemoteService: function() {
            return this.getHttpService().isRemoteService();
        }

    };

    var TableOrderModel = window.TableOrderModel = AppModel.extend(__model__);

})();
