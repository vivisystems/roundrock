(function() {

    /**
     * TableOrder Model
     */
    var __model__ = {

        name: 'TableOrder',

        useDbConfig: 'table',
        
        belongsTo: ['TableStatus'],

        behaviors: ['Sync']

    };

    var TableOrderModel = window.TableOrderModel = GeckoJS.Model.extend(__model__);

})();
