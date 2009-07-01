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
                         'An error was encountered while saving cashdrawer activity (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup: %S' + '\n' + this.dump(data));
                }
            }
            return r;
        }
    }

    var CashdrawerRecordModel = window.CashdrawerRecordModel = GeckoJS.Model.extend(__model__);

})();
