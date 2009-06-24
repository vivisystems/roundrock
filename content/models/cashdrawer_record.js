(function() {

    var __model__ = {
        
        name: 'CashdrawerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],

        saveAccessRecord: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         _('An error was encountered while saving cashdrawer activity (error code %S): %S', [this.lastError, this.lastErrorString]));

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', _('record saved to backup'));
                }
                else {
                    this.log('ERROR',
                             _('record could not be saved to backup: %S', ['\n' + this.dump(data)]));
                }
            }
            return r;
        }
    }

    var CashdrawerRecordModel = window.CashdrawerRecordModel = GeckoJS.Model.extend(__model__);

})();
