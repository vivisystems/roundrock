( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var LedgerEntryTypeModel = window.LedgerEntryTypeModel = AppModel.extend({
        name: 'LedgerEntryType',
    });
} )();
