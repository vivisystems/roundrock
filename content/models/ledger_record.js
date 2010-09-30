(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'LedgerRecord',

        useDbConfig: 'order',

        autoRestoreFromBackup: true,

        behaviors: ['Sync', 'Training'],
        
        
        clearExpireData: function(expireDate) {

            // try to attach history database
            var result = false;
            var isMoveToHistory = GeckoJS.Configure.read('vivipos.fec.settings.moveExpiredDataToHistory') || false;
            var attachedOrderHistory = isMoveToHistory ? this.attachOrderHistory() : false;

            if (!this.begin()) {
                this.log('ERROR', 'An error was encountered while preparing to remove expired ledger activity logs (error code ' + this.lastError + '): ' + this.lastErrorString);
                if (attachedOrderHistory) {
                    this.detachOrderHistory();
                }               
                return false;
            }

            try {
                   
                if (attachedOrderHistory) {
                   // copy clockstamp to history
                   this.execute('INSERT OR REPLACE INTO order_history.order_payments SELECT * FROM order_payments where order_id IN (select id from ledger_records where created <= ' + expireDate + ')');
                   this.execute('INSERT OR REPLACE INTO order_history.ledger_records SELECT * FROM ledger_records where created <= ' + expireDate);
                }
                                                                            
                r = this.execute('delete from order_payments where order_id IN (select id from ledger_records where created <= ' + expireDate + ')');
                if (!r) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring ledger payment records (error code %S) .', [this.lastError])
                    };
                }

                r = this.execute('delete from ledger_records where created <= ' + expireDate);
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while expiring ledger activity logs (error code %S) .', [this.lastError])};
                }
                
                if (!this.commit()) {
                    throw {
                        errno: this.lastError,
                        errstr: this.lastErrorString,
                        errmsg: _('An error was encountered while expiring ledger activity logs (error code %S) .', [this.lastError])
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

    var LedgerRecordModel = window.LedgerRecordModel = AppModel.extend(__model__);
    
})();
