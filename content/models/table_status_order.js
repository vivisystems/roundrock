(function() {

    /**
     * TableStatusOrder Model
     */
    var __model__ = {

        name: 'TableStatusOrder',

        useDbConfig: 'table',
        
        belongsTo: ['Table'],

        behaviors: ['Sync']

    };

    var TableStatusOrderModel = window.TableStatusOrderModel = GeckoJS.Model.extend(__model__);

})();
