( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var __model__ = {
        
        name: 'ShiftChange',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,
        
        hasMany: ['ShiftChangeDetail'],

        behaviors: ['Sync', 'Training'],

        removeShiftChange: function(terminal_no, sale_period, shift_number) {
            var masterRecords = this.find('all', {fields: 'id',
                                                  conditions: 'terminal_no = "' + terminal_no + '" and sale_period = ' + sale_period + ' and shift_number = ' + shift_number,
                                                  recursive: 2,
                                                  limit: 300000});
            if (masterRecords && masterRecords.length > 0) {
                masterRecords.forEach(function(rec) {
                    this.del(rec.id);

                    if (rec.ShiftChangeDetail) {
                        rec.ShiftChangeDetail.forEach(function(d) {
                            this.ShiftChangeDetail.del(d.id);
                        }, this);
                    }
                }, this);
            }
        },

        saveShiftChange: function(data) {
            if(!data) return true;

            // need to remove existing shift change information with the same terminal, sale period, and shift number
            this.removeShiftChange(data.terminal_no, data.sale_period, data.shift_number);

            var s;
            var r = this.saveShiftChangeMaster(data);
            if (r) {
                s = this.ShiftChangeDetail.saveShiftChangeDetails(this.id, data.shiftChangeDetails);
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
            var r = this.save(data);

            if (!r) {
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
        },
        
        clearExpireData: function(expireDate) {

            // try to attach history database
            var result = false;
            var isMoveToHistory = GeckoJS.Configure.read('vivipos.fec.settings.moveExpiredDataToHistory') || false;
            var attachedOrderHistory = isMoveToHistory ? this.attachOrderHistory() : false;

            if (!this.begin()) {
                this.log('ERROR', 'An error was encountered while preparing to remove expired shift change records (error code ' + this.lastError + '): ' + this.lastErrorString);
                if (attachedOrderHistory) {
                    this.detachOrderHistory();
                }               
                return false;
            }

            try {
                   
                if (attachedOrderHistory) {
                   // copy clockstamp to history
                   this.execute('INSERT OR REPLACE INTO order_history.shift_changes SELECT * FROM shift_changes where created <= ' + expireDate);
                }
                                                                            
                r = this.execute('delete from shift_changes where created <= ' + expireDate);
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while expiring shift change records (error code %S) .', [this.lastError])};
                }
                
                if (!this.commit()) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring shift change records (error code %S) .', [this.lastError])
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
        

    };

    var ShiftChangeModel = window.ShiftChangeModel = AppModel.extend( __model__ );
} )();
