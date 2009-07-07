( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var OrderItemModel = window.OrderItemModel =  AppModel.extend({
        name: 'OrderItem',

        useDbConfig: 'order',

        belongsTo: ['Order'],
        
        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true
    });
} )();
