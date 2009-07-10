( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var OrderObjectModel = window.OrderObjectModel =  AppModel.extend({
        name: 'OrderObject',

        useDbConfig: 'order',
        
        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training']
    });
} )();
