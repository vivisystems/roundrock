( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var JournalModel = window.JournalModel = AppModel.extend({
        name: 'Journal',
        useDbConfig: 'journal',
        table: 'journal'
    });
} )();
