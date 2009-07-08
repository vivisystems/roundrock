( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var PlugroupModel = window.PlugroupModel = AppModel.extend({
        name: 'Plugroup'
    });
} )();
