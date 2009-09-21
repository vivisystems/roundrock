(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'LedgerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training']

    };

    var LedgerRecordModel = window.LedgerRecordModel = AppModel.extend(__model__);
    
})();
