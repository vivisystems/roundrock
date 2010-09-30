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

        saveShiftChangeDetails: function(master_id, data) {
            var r = true;
            for (var i = 0; r && i < data.length; i++) {
                var o = data[i];
                var detail = {};
                detail['shift_change_id'] = master_id;
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
        },
        
        clearExpireData: function(expireDate) {

            // try to attach history database
            var result = false;
            var isMoveToHistory = GeckoJS.Configure.read('vivipos.fec.settings.moveExpiredDataToHistory') || false;
            var attachedOrderHistory = isMoveToHistory ? this.attachOrderHistory() : false;

            if (!this.begin()) {
                this.log('ERROR', 'An error was encountered while preparing to remove expired shift change details (error code ' + this.lastError + '): ' + this.lastErrorString);
                if (attachedOrderHistory) {
                    this.detachOrderHistory();
                }               
                return false;
            }

            try {
                   
                if (attachedOrderHistory) {
                   // copy clockstamp to history
                   this.execute('INSERT OR REPLACE INTO order_history.shift_change_details SELECT * FROM shift_change_details where not exists (select 1 from shift_changes where shift_changes.id == shift_change_details.shift_change_id)');
                }
                                                                            
                r = this.execute('delete from shift_change_details where not exists (select 1 from shift_changes where shift_changes.id == shift_change_details.shift_change_id)');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while expiring shift change details (error code %S) .', [this.lastError])};
                }
                
                if (!this.commit()) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring shift change details (error code %S) .', [this.lastError])
                    };                           
                }                   
                result = true; 
                           
            }catch(e) {
                
                this.rollback();
                this.log('ERROR', e.errmsg);

                this.lastError = e.errno;
                this.lastErrorString = e.errstr;
               
                result = false;
                
            }finally {
                if (attachedOrderHistory) {
                    this.detachOrderHistory();
                }                
            }
            
            return result;
            
        }
        

    });
} )();
