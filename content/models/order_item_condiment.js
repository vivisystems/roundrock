( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var OrderItemCondimentModel = window.OrderItemCondimentModel =  AppModel.extend({
        name: 'OrderItemCondiment',

        useDbConfig: 'order',

        belongsTo: ['Order'],
        
        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true
    });
} )();
