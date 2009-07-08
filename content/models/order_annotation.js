( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var OrderAnnotationModel = window.OrderAnnotationModel =  AppModel.extend({
        name: 'OrderAnnotation',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true
    });
} )();
