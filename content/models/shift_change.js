( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var ShiftChangeModel = window.ShiftChangeModel = AppModel.extend({
        name: 'ShiftChange',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,
        
        hasMany: ['ShiftChangeDetail'],

        behaviors: ['Sync', 'Training'],
        
        saveShiftChange: function(data) {
            if(!data) return true;

            var s;
            var r = this.saveShiftChangeMaster(data);
            if (r) {
                s = this.ShiftChangeDetail.saveShiftChangeDetails(data);
                if (s) {
                    return r;
                }
                else {
                    this.lastError = this.ShiftChangeDetail.lastError;
                    this.lastErrorString = this.ShiftChangeDetail.lastErrorString;
                    return s;
                }
            }
            else {
                return r;
            }
        },

        saveShiftChangeMaster: function(data) {

            this.id = '';
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            var r = this.save(data);

            if (!r && !isTraining) {
                this.log('ERROR',
                         'An error was encountered while saving shift change record (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR',
                             'record could not be saved to backup\n' + this.dump(data));
                }
            }
            return r;
        }

    });
} )();
