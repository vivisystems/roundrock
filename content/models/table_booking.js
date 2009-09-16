( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableBookingModel = window.TableBookingModel = AppModel.extend({
        
        name: 'TableBooking',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        behaviors: ['Sync', 'Training']
        
    });
} )();
