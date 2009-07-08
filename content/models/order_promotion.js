( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var OrderPromotionModel = window.OrderPromotionModel =  AppModel.extend({
        name: 'OrderPromotion',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true
    });
} )();
