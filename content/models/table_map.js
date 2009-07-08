(function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    /**
     * TableMap Model
     */
    var __model__ = {

        name: 'TableMap',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        // hasMany: ['TableBooking', 'TableOrder'],
        // hasMany: [{name: 'TableBooking', 'primaryKey': 'table_no', 'foreignKey': 'table_no'}],
        // hasOne: [{name: 'TableBooking', 'foreignKey': 'table_id'}, {name: 'TableOrder', 'foreignKey': 'table_status_id'}],

        behaviors: ['Sync'], // for local use when connect master fail...

        saveStatus: function(statusObj) {
            this.save(statusObj);

            var tableOrderObj = {

            }
            var tableOrderModel = new TableOrderModel();
            tableOrderModel.save(statusObj);
        }

    };

    var TableMapModel = window.TableMapModel = AppModel.extend(__model__);

})();
