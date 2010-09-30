(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

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
                             'record could not be saved to backup:' + '\n' + this.dump(data));
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
                this.log('ERROR', 'An error was encountered while preparing to remove expired cashdrawer activity logs (error code ' + this.lastError + '): ' + this.lastErrorString);
                if (attachedOrderHistory) {
                    this.detachOrderHistory();
                }               
                return false;
            }

            try {
                   
                if (attachedOrderHistory) {
                   // copy clockstamp to history
                   this.execute("INSERT OR REPLACE INTO order_history." + this.table + " SELECT * FROM " + this.table + " WHERE created <= " + expireDate);
                }                                                            
                r = this.execute('delete from cashdrawer_records where created <= ' + expireDate);
                if (!r) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring cashdrawer activity logs (error code %S) .', [this.lastError])
                    };
                }
            
                if (!this.commit()) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring cashdrawer activity logs (error code %S) .', [this.lastError])
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

        
    }

    var CashdrawerRecordModel = window.CashdrawerRecordModel = AppModel.extend(__model__);

})();
