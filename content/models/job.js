( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var JobModel = window.JobModel = AppModel.extend({
        name: 'Job'    
    });
} )();
