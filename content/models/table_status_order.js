(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    /**
     * TableStatusOrder Model
     */
    var __model__ = {

        name: 'TableStatusOrder',

        useDbConfig: 'table',
        
        belongsTo: ['Table'],

        behaviors: ['Sync', 'Training']

    };

    var TableStatusOrderModel = window.TableStatusOrderModel = AppModel.extend(__model__);

})();
