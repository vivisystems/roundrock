( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var OrderAdditionModel = window.OrderAdditionModel =  AppModel.extend({
        name: 'OrderAddition',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true
    });
} )();
