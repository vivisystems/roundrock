( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var __model__ = {
        name: 'Journal',

        useDbConfig: 'journal',

        autoRestoreFromBackup: true,
        
        table: 'journal',

        saveJournal: function(data) {
            var r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving journal entry (error code ' + this.lastError + '): ' + this.lastErrorString);

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
    };

    var JournalModel = window.JournalModel = AppModel.extend(__model__);
    
} )();
