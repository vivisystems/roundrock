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
        
        belongsTo: ['TableStatus'],

        behaviors: ['Sync']

    };

    var TableOrderModel = window.TableOrderModel = AppModel.extend(__model__);

})();
