( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableRegionModel = window.TableRegionModel = AppModel.extend({
        name: 'TableRegion',

        useDbConfig: 'table',

    //    hasMany: ['Table'],

        behaviors: ['Sync', 'Training']
    });
} )();
