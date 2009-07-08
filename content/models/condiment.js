( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var CondimentModel = window.CondimentModel = AppModel.extend({
        name: 'Condiment',
        belongsTo: ['CondimentGroup']
    });
} )();
