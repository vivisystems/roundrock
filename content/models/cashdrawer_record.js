var CashdrawerRecordModel = window.CashdrawerRecordModel = GeckoJS.Model.extend({
    name: 'CashdrawerRecord',

    useDbConfig: 'order',

    autoRestoreFromBackup: true,
    
    behaviors: ['Sync', 'Training1'],

    saveAccessRecord: function(record) {
        var r = this.save(record);
        if (!r) {
            //@db saveToBackup
            this.saveToBackup(record);

            // log error
            this.log('ERROR',
                     _('An error was encountered while logging cashdrawer activity (error code %S); record saved to backup %S',
                       [this.lastError, '\n' + this.dump(record)]));
        }

    }
});
