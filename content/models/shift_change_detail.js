( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var ShiftChangeDetailModel = window.ShiftChangeDetailModel = AppModel.extend({
        name: 'ShiftChangeDetail',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        belongsTo: ['ShiftChange'],

        behaviors: ['Sync', 'Training'],

        saveShiftChangeDetails: function(data) {

            var r = true;

            for (var i = 0; r && i < data.length; i++) {
                var o = data[i];
                var detail = {};
                detail['shift_change_id'] = o.shift_change_id;
                detail['type'] = o.type;
                detail['name'] = o.name;
                detail['change'] = o.change;
                detail['amount'] = o.amount;
                detail['excess_amount'] = o.excess_amount;
                detail['count'] = o.count;

                this.id = '';
                r = this.save(detail);

                if (!r) {
                    this.log('ERROR',
                             'An error was encountered while saving shift change detail (error code ' + this.lastError + '): ' + this.lastErrorString);

                    //@db saveToBackup
                    r = this.saveToBackup(detail);
                    if (r) {
                        this.log('ERROR', 'record saved to backup');
                    }
                    else {
                        this.log('ERROR',
                                 'record could not be saved to backup\n' + this.dump(detail));
                    }
                }
            }
            return r;
        }

    });
} )();
