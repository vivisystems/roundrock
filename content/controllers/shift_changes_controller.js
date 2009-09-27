(function(){

    var __controller__ = {

        uses: ['ShiftMarker'],

        name: 'ShiftChanges',

        _listObj: null,
        _listDatas: null,
        _limit: 3000000,

        initial: function() {
            // set current sales period and shift number
            var currentShift = this._updateSession();
            
            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            // add event listener for main controller events
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onSetClerk', this.startShift, this);
                main.addEventListener('afterClearOrderData', this.expireData, this);
                main.addEventListener('afterTruncateTxnRecords', this.truncateData, this);
            }

            // add event listener for cart controller events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('newTransaction', this.retrieveClusterSalePeriod, this);
                cart.addEventListener('beforeSubmit', this.verifyClusterSalePeriod, this);
                cart.addEventListener('beforeLedgerEntry', this.verifyClusterSalePeriod, this);
            }

            if (currentShift != null && currentShift.sale_period == -1) {
                // warn if sale period cannot be retrieved
                GREUtils.Dialog.alert(null,
                                      _('Shift Change'),
                                      _('Failed to determine current sale period. ')
                                      + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
            }
        },

        _getShiftMarker: function() {
            var shift = GeckoJS.Session.get('current_shift');
            if (!shift) {
                shift = this.ShiftMarker.getMarker();
                if (parseInt(this.ShiftMarker.lastError) != 0) {
                    this._dbError(this.ShiftMarker.lastError, this.ShiftMarker.lastErrorString,
                                  _('An error was encountered while retrieving shift change configuration (error code %S).', [this.ShiftMarker.lastError]));
                    return null;
                }

                if (shift) {
                    //this.log('DEBUG', 'saving shift into session: ' + this.dump(shift));
                    GeckoJS.Session.set('current_shift', shift);
                }
            }
            return shift;
        },

        _getEndOfShift: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_shift : false;
        },

        _getCashEntry: function() {
            var shift = GeckoJS.Session.get('current_shift');
            if (shift) {
                var entry = shift.end_of_shift_cash;
                if (entry != null) {
                    entry = GeckoJS.BaseObject.unserialize(entry);
                }
                return entry;
            }
            else
                return false;
        },

        _getEndOfPeriod: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_period : false;
        },

        _setEndOfShift: function(cashEntry) {
            return this._setShift(this._getSalePeriod(), this._getShiftNumber(), false, true, cashEntry);
        },

        _setEndOfPeriod: function(cashEntry) {
            return this._setShift(this._getSalePeriod(), this._getShiftNumber(), true, true, cashEntry);
        },

        _updateSession: function(currentShift) {
            var shiftNumber = '';
            var salePeriod = '';
            var salePeriodStr;

            if (!currentShift) {
                currentShift = this._getShiftMarker();
            }

            if (currentShift) {
                shiftNumber = currentShift.shift_number;
                salePeriod = currentShift.sale_period;

                if (shiftNumber != '') shiftNumber = parseInt(shiftNumber);
                if (salePeriod != '') salePeriod = parseInt(salePeriod);
            }

            if (salePeriod == '') {
                salePeriodStr = '';
            }
            else if (salePeriod < 0) {
                salePeriodStr = '-1';
            }
            else {
                salePeriodStr = new Date(salePeriod * 1000).toLocaleDateString();
            }

            // only store valid shift marker into session
            if (salePeriod != -1 && salePeriod != '') {
                GeckoJS.Session.set('current_shift', currentShift);
                //this.log('DEBUG', 'updating session: ' + this.dump(currentShift));
            }
            GeckoJS.Session.set('shift_number', shiftNumber);
            GeckoJS.Session.set('sale_period', salePeriod);
            GeckoJS.Session.set('sale_period_string', salePeriodStr);

            return currentShift;
        },

        _setShift: function(salePeriod, shiftNumber, endOfPeriod, endOfShift, cashEntry) {

            shiftNumber = parseInt(shiftNumber);
            salePeriod = parseInt(salePeriod);
            var cashEntryData = (cashEntry == null ? '' : GeckoJS.BaseObject.serialize(cashEntry));
            
            var newShiftMarker = {
                terminal_no: GeckoJS.Session.get('terminal_no'),
                sale_period: salePeriod,
                shift_number: shiftNumber,
                end_of_period: endOfPeriod,
                end_of_shift: endOfShift,
                end_of_shift_cash: cashEntryData
            };

            var shift = this._getShiftMarker();

            // update shift marker if it already exists
            if (shift) {
                newShiftMarker.id = shift.id;
                this.ShiftMarker.id = shift.id;
            }
            var r = this.ShiftMarker.saveMarker(newShiftMarker);
            if (!r) {
                this._dbError(this.ShiftMarker.lastError, this.ShiftMarker.lastErrorString,
                              _('An error was encountered while updating shift change configuration (error code %S) [message #1402].', [this.ShiftMarker.lastError]));
            }
            else {
                // update shift
                this._updateSession(r);
            }
            return r;
        },

        _ShiftDialog: function (newSalePeriod, newShiftNumber, lastSalePeriod, lastShiftNumber) {
            var width = 450;
            var height = 350;
            var aURL = 'chrome://viviecr/content/alert_shift.xul';
            var aName = _('Shift Information');
            var aArguments = {current_sale_period: newSalePeriod,
                              current_shift_number: newShiftNumber,
                              last_sale_period: lastSalePeriod,
                              last_shift_number: lastShiftNumber,
                              GeckoJS: GeckoJS,
                              GREUtils: GREUtils};
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);
        },

        _DrawerChangeDialog: function() {

            // open drawer first
            var cashdrawerController = GeckoJS.Controller.getInstanceByName('CashDrawer');
            cashdrawerController.openDrawerForShiftChange();

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=500,height=500';
            var title = _('Verify Drawer Change');
            var inputObj = {
                input0:null, require0:true, disablecancelbtn:true, numberOnly0: true, numpad: true,
                useraction: function() {cashdrawerController.openDrawerForShiftChange();},
                useractionLabel: _('Open Drawer')
            };
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            GREUtils.Dialog.openWindow(win, aURL, title, aFeatures, title, '', _('Enter amount of cash in drawer'), '', inputObj);

            return inputObj.input0;
        },

        _getSalePeriod: function() {
            var shift = GeckoJS.Session.get('current_shift');
            if (shift) {
                return shift.sale_period;
            }
            else
                return '';
        },

        _getShiftNumber: function() {
            var shift = GeckoJS.Session.get('current_shift');
            if (shift) {
                return shift.shift_number;
            }
            else
                return '';
        },

        // remove expired shift change
        expireData: function(evt) {
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                try {
                    var model = new ShiftChangeModel();
                    var r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup shift change records (error code %S) [message #1403].', [model.lastError])};
                    }

                    r = model.execute('delete from shift_changes where created <= ' + expireDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring shift change records (error code %S) [message #1404].', [model.lastError])};
                    }

                    model = new ShiftChangeDetailModel();
                    r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup shift change details (error code %S) [message #1405].', [model.lastError])};
                    }

                    r = model.execute('delete from shift_change_details where not exists (select 1 from shift_changes where shift_changes.id == shift_change_details.shift_change_id)') && r;
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring shift change details (error code %S) [message #1406].', [model.lastError])};
                    }
                }
                catch(e) {
                    this._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },

        // remove all shift change data
        truncateData: function(evt) {
            try {
                var model = new ShiftChangeModel();
                var r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all shift change records (error code %S) [message #1407].', [model.lastError])};
                }

                model = new ShiftChangeDetailModel();
                r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all shift change details (error code %S) [message #1408].', [model.lastError])};
                }

                r = this.ShiftMarker.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing shift change marker (error code %S) [message #1409].', [model.lastError])};
                }
                r = SequenceModel.removeSequence('sale_period');
            }
            catch(e) {
                this._dbError(e.errno, e.errstr, e.errmsg);
            }
        },

        // this is invoked right after initialLogin
        startShift: function() {
            // does sale period exist?
            var newSalePeriod;
            var newShiftNumber;
            var lastSalePeriod = this._getSalePeriod();
            var lastShiftNumber = this._getShiftNumber();
            var endOfPeriod = this._getEndOfPeriod();
            var endOfShift = this._getEndOfShift();
            var cashEntry = this._getCashEntry();
            var clusterSalePeriod = this.ShiftMarker.getClusterSalePeriod();
            var disableShiftChange = GeckoJS.Configure.read('vivipos.fec.settings.DisableShiftChange');
            var updateShiftMarker = true;
            
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            
            // check if cluster sale period is available
            if (clusterSalePeriod == -1) {
                GREUtils.Dialog.alert(win,
                    _('Shift Change Error'),
                    _('Failed to start shift because current sale period could not be determined. Please check the network connectivity to the terminal designated as the sale period master and sign in again after the issue has been resolved.'));

                this._updateSession({sale_period: -1,
                                     shift_number: '',
                                     end_of_period: false,
                                     end_of_shift: false});

                return;
            }
            else if (!isNaN(parseInt(clusterSalePeriod))) {
                newSalePeriod = clusterSalePeriod;
            }

            //this.log('DEBUG', 'cluster SP: ' + clusterSalePeriod + ', new SP: ' + newSalePeriod);
            // no last shift?
            if (lastSalePeriod == '') {
                // insert new sale period with today's date;
                if (newSalePeriod == null) {
                    newSalePeriod = new Date().clearTime() / 1000;
                }
                newShiftNumber = 1;
                //this.log('DEBUG', 'no last SP, new SP: ' + newSalePeriod);
            }

            // is last shift the end of the last sale period?
            // if newSalePeriod is the same as last sale period, treat end of sale period as end of shift
            else if (endOfPeriod && (newSalePeriod != lastSalePeriod)) {

                if (newSalePeriod == null) {
                    // set current sale period to the greater of
                    // today's date and last sale period + 1 day
                    var today = new Date().clearTime();
                    var lastSalePeriodPlusOne = new Date(lastSalePeriod * 1000).add({days: 1}).clearTime();
                    if (lastSalePeriod == '' || (today > lastSalePeriodPlusOne)) {
                        newSalePeriod = today;
                    }
                    else {
                        newSalePeriod = lastSalePeriodPlusOne;
                    }
                    newSalePeriod = newSalePeriod.getTime() / 1000;
                }
                newShiftNumber = 1;
                //this.log('DEBUG', 'last SP closed, new SP: ' + newSalePeriod);
            }
            // has last shift ended?
            else {
                if (disableShiftChange) {
                    newShiftNumber = lastShiftNumber;
                    if (newSalePeriod == null || lastSalePeriod == newSalePeriod) updateShiftMarker = false;
                    //this.log('DEBUG', 'shift change disabled, sale period changed: ' + updateShiftMarker);
                }
                else {
                    if (newSalePeriod != null && newSalePeriod != lastSalePeriod && lastSalePeriod != -1) {
                        // check if sale period has changed
                        // if changed, put up warning to close sale period immediately and
                        // continue with previous shift

                        GREUtils.Dialog.alert(win,
                            _('Shift Change Warning'),
                            _("This terminal's sale period [%S (%S)] appears to be out of sync with the cluster sale period [%S (%S)]. Please close the sale period on this terminal immediately to avoid recording transactions in the wrong sale period.",
                              [new Date(lastSalePeriod * 1000).toLocaleDateString(), lastSalePeriod, new Date(newSalePeriod * 1000).toLocaleDateString(), newSalePeriod]));
                        updateShiftMarker = false;
                        newSalePeriod = lastSalePeriod;
                        newShiftNumber = lastShiftNumber;
                    }
                    else {

                        if (endOfShift) {

                            newSalePeriod = lastSalePeriod;

                            if (isNaN(parseInt(lastShiftNumber))) {
                                lastShiftNumber = 1;
                            }
                            else {
                                newShiftNumber = lastShiftNumber + 1;
                            }
                            //this.log('DEBUG', 'last shift closed, new SP: ' + newSalePeriod + ', new Shift: ' + newShiftNumber);
                        }
                        // continue last shift
                        else {
                            newSalePeriod = lastSalePeriod;
                            if (isNaN(parseInt(lastShiftNumber))) {
                                lastShiftNumber = 1;
                            }
                            else {
                                newShiftNumber = lastShiftNumber;
                            }

                            updateShiftMarker = false;
                            //this.log('DEBUG', 'continue last shift, new SP: ' + newSalePeriod + ', new Shift: ' + newShiftNumber);
                        }
                    }
                }
            }

            if (updateShiftMarker) {
                //this.log('DEBUG', 'updating shift marker ');

                // since either shift or sale period has changed, let's check
                // if there is pending ledger IN entry to be recorded

                var warnOnChangeDiscrepancy = false;
                if (cashEntry && !isNaN(cashEntry.amount) && parseFloat(cashEntry.amount) > 0) {
                    var ledgerMemo = '';

                    // prompt user to enter cash drawer amount
                    var userAmount = this._DrawerChangeDialog();
                    var recordedAmount = parseFloat(cashEntry.amount);
                    var deltaEntry;
                    
                    userAmount = parseFloat(userAmount);
                    if (isNaN(userAmount)) userAmount = 0;

                    // alert user if declared cash amount is different from recorded amount
                    ledgerMemo = _('Drawer change on record [%S], user reported change [%S]', [recordedAmount, userAmount]);
                    var mode;
                    var amount;
                    if (userAmount > recordedAmount) {
                        mode = 'IN';
                        amount = userAmount - recordedAmount;
                    }
                    else {
                        mode = 'OUT';
                        amount = recordedAmount - userAmount;
                    }
                    if (userAmount != recordedAmount) {
                        deltaEntry = {
                            type: _('(Ledger Type)Drawer Change Discrepancy'),
                            mode: mode,
                            description: ledgerMemo,
                            amount: amount,
                            sale_period: newSalePeriod,
                            shift_number: newShiftNumber,
                            nodraweraction: true
                        };

                        warnOnChangeDiscrepancy = _('IMPORTANT!') + '\n\n' +
                                                   _('Cash reported [%S]', [userAmount]) + '\n' +
                                                   _('Cash recorded from last shift [%S]', [recordedAmount]) + '\n\n' +
                                                   _('Please report the discrepancy to your supervisor immediately!');
                    }

                    // record ledger entry
                    cashEntry.sale_period = newSalePeriod;
                    cashEntry.shift_number = newShiftNumber;

                    var ledgerController = GeckoJS.Controller.getInstanceByName('LedgerRecords');
                    if (!ledgerController.saveLedgerEntry(cashEntry)) return;
                    if (deltaEntry && !ledgerController.saveLedgerEntry(deltaEntry)) return;
                }

                //this.log('DEBUG', 'drawer change verified');

                this._setShift(newSalePeriod, newShiftNumber, false, false);
            }

            if (warnOnChangeDiscrepancy) {
                var win = this.topmostWindow;
                if (win.document.documentElement.id == 'viviposMainWindow'
                    && win.document.documentElement.boxObject.screenX < 0) {
                    win = null;
                }
                GREUtils.Dialog.alert(win, _('Drawer Change Error'), warnOnChangeDiscrepancy);
            }

            if (!disableShiftChange) {
                // display current shift / last shift information
                this._ShiftDialog((newSalePeriod > 0) ? new Date(newSalePeriod * 1000).toLocaleDateString() : newSalePeriod, newShiftNumber,
                                  (lastSalePeriod == '') ? '' : new Date(lastSalePeriod * 1000).toLocaleDateString(), lastShiftNumber);
            }

            this.dispatchEvent('onStartShift', {salePeriod: newSalePeriod, shift: newShiftNumber});
        },
        
        shiftChange: function() {
            if (GeckoJS.Session.get('isTraining')) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Shift Change'),
                                      _('Shift change is disabled in training mode'));
                return;
            }
            // block UI until DB access is completed
            this._blockUI('blockui_panel', 'common_wait', _('Saving Order'), 1);

            var salePeriod = this._getSalePeriod();
            var shiftNumber = this._getShiftNumber();
            var terminal_no = GeckoJS.Session.get('terminal_no');
            var salePeriodLeadDays = GeckoJS.Configure.read('vivipos.fec.settings.MaxSalePeriodLeadDays') || 1;
            var resetSequence = GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod');
            var allowChangeWhenEndPeriod = GeckoJS.Configure.read('vivipos.fec.settings.AllowChangeWhenEndPeriod');
            
            var inputObj = {ok: false};

            var orderPayment = new OrderPaymentModel();

            // check if sale period leads calendar date by more than allowed number of days
            var today = Date.today();
            var salePeriodDate = new Date(salePeriod * 1000);
            var canEndSalePeriod = this.Acl.isUserInRole('acl_end_sale_period') &&
                                   ((salePeriodDate - today) / (24 * 60 * 60 * 1000) + 1) <= salePeriodLeadDays;

            var doEndOfShift = false;
            var doEndOfPeriod = false;
            var message;

            // catch database select errors
            try {
                // first, we collect payment totals for credit cards and coupons
                var fields = ['order_payments.memo1 as "OrderPayment.name"',
                              'order_payments.name as "OrderPayment.type"',
                              'COUNT(order_payments.name) as "OrderPayment.count"',
                              'SUM(order_payments.amount) as "OrderPayment.amount"',
                              'SUM(order_payments.change) as "OrderPayment.change"'];
                var conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                                 ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                                 ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                                 ' AND (order_payments.name = "creditcard" OR order_payments.name = "coupon")';
                var groupby = 'order_payments.memo1, order_payments.name';
                var orderby = 'order_payments.memo1, order_payments.name';
                var creditcardCouponDetails = orderPayment.find('all', {fields: fields,
                                                                        conditions: conditions,
                                                                        group: groupby,
                                                                        order: orderby,
                                                                        recursive: 0,
                                                                        limit: this._limit
                                                                       });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving credit card and coupon payment records (error code %S) [message #1410].', [orderPayment.lastError])};

                //alert(this.dump(creditcardCouponDetails));
                //this.log(this.dump(creditcardCouponDetails));

                // next, we collect payment totals for giftcard
                fields = ['order_payments.memo1 as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.amount) as "OrderPayment.amount"',
                          'SUM(order_payments.origin_amount) as "OrderPayment.origin_amount"',
                          'SUM(order_payments.origin_amount - order_payments.amount) as "OrderPayment.excess_amount"'];  // used to store excess giftcard payment amount
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "giftcard"';
                groupby = 'order_payments.memo1, order_payments.name';
                orderby = 'order_payments.memo1, order_payments.name';
                var giftcardDetails = orderPayment.find('all', {fields: fields,
                                                                conditions: conditions,
                                                                group: groupby,
                                                                order: orderby,
                                                                recursive: 0,
                                                                limit: this._limit
                                                               });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving giftcard payment records (error code %S) [message #1411].', [orderPayment.lastError])};

                //alert(this.dump(giftcardDetails));
                //this.log(this.dump(giftcardDetails));

                // next, we collect payment totals for personal checks
                fields = ['order_payments.memo1 as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.origin_amount) as "OrderPayment.amount"',
                          'SUM(order_payments.change) as "OrderPayment.change"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "check"';
                groupby = 'order_payments.memo1, order_payments.name';
                orderby = 'order_payments.memo1, order_payments.name';
                var checkDetails = orderPayment.find('all', {fields: fields,
                                                             conditions: conditions,
                                                             group: groupby,
                                                             order: orderby,
                                                             recursive: 0,
                                                             limit: this._limit
                                                            });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving check payment records (error code %S) [message #1412].', [orderPayment.lastError])};

                //alert(this.dump(checkDetails));
                //this.log(this.dump(checkDetails));

                // next, we collect payment totals for cash in local denominations
                fields = ['"" as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.amount - order_payments.change) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "cash" AND order_payments.memo1 IS NULL';
                groupby = 'order_payments.memo1, order_payments.name';
                orderby = 'order_payments.memo1, order_payments.name';
                var localCashDetails = orderPayment.find('all', {fields: fields,
                                                                 conditions: conditions,
                                                                 group: groupby,
                                                                 order: orderby,
                                                                 recursive: 0,
                                                                 limit: this._limit
                                                                });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving cash payment records (error code %S) [message #1413].', [orderPayment.lastError])};

                //alert(this.dump(localCashDetails));
                //this.log(this.dump(localCashDetails));

                // next, we collect payment totals for the payments registered by pressing the function button with a fixed value.
                fields = ['order_payments.amount as "OrderPayment.name"',
                          '( "   - " || order_payments.name ) as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.amount) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "cash" AND order_payments.memo1 IS NULL AND order_payments.is_groupable = "1"';
                groupby = 'order_payments.amount, order_payments.name';
                orderby = 'order_payments.amount, order_payments.name';
                var valueFixedCashPayment = orderPayment.find('all', {fields: fields,
                                                                 conditions: conditions,
                                                                 group: groupby,
                                                                 order: orderby,
                                                                 recursive: 0,
                                                                 limit: this._limit
                                                                });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving value-fixed cash payment records (error code %S) [message #1414].', [orderPayment.lastError])};

                //alert(this.dump(valueFixedCashPayment));
                //this.log(this.dump(valueFixedCashPayment));


                // next, we collect payment totals for cash in foreign denominations
                fields = ['order_payments.memo1 as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.amount) as "OrderPayment.amount"',
                          'SUM(order_payments.origin_amount) as "OrderPayment.origin_amount"',
                          'SUM(order_payments.change) as "OrderPayment.change"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "cash" AND NOT (order_payments.memo1 IS NULL)';
                groupby = 'order_payments.memo1, order_payments.name';
                orderby = 'order_payments.memo1, order_payments.name';
                var foreignCashDetails = orderPayment.find('all', {fields: fields,
                                                                   conditions: conditions,
                                                                   group: groupby,
                                                                   order: orderby,
                                                                   recursive: 0,
                                                                   limit: this._limit
                                                                  });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving foreign cash payment records (error code %S) [message #1415].', [orderPayment.lastError])};

                //alert(this.dump(foreignCashDetails));
                //this.log(this.dump(foreignCashDetails));

                // next, we collect payment totals from ledger entries
                fields = ['order_payments.memo1 as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM(order_payments.amount) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "ledger"';
                groupby = 'order_payments.memo1, order_payments.name';
                orderby = 'order_payments.memo1, order_payments.name';
                var ledgerDetails = orderPayment.find('all', {fields: fields,
                                                              conditions: conditions,
                                                              group: groupby,
                                                              order: orderby,
                                                              recursive: 0,
                                                              limit: this._limit
                                                             });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while retrieving ledger payment records (error code %S) [message #1416].', [orderPayment.lastError])};

                //alert(this.dump(ledgerDetails));
                //this.log(this.dump(ledgerDetails));

                // lastly, we collect payment totals from destination entries
                fields = ['orders.destination as "Order.name"',
                          '\'destination\' as "Order.type"',
                          'COUNT(orders.destination) as "Order.count"',
                          'SUM(orders.total) as "Order.amount"'];
                conditions = 'sale_period = "' + salePeriod + '"' +
                             ' AND shift_number = "' + shiftNumber + '"' +
                             ' AND terminal_no = "' + terminal_no + '"' +
                             ' AND destination is NOT NULL' +
                             ' AND status = "1"';
                groupby = 'orders.destination';
                orderby = 'orders.destination';
                var orderModel = new OrderModel();
                var destDetails = orderModel.find('all', {fields: fields,
                                                          conditions: conditions,
                                                          group: groupby,
                                                          order: orderby,
                                                          recursive: 0,
                                                          limit: this._limit
                                                         });
                if (parseInt(orderModel.lastError) != 0)
                    throw {errno: orderModel.lastError,
                           errstr: orderModel.lastErrorString,
                           errmsg: _('An error was encountered while retrieving orders by destinations (error code %S) [message #1417].', [orderModel.lastError])};

                //alert(this.dump(destDetails));
                //this.log(this.dump(ledgerDetails));

                // local cash amount = cash amount - cash change from cash, check, and coupon

                // compute cash received from sale and ledger
                fields = ['SUM(order_payments.amount - order_payments.change) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND ((order_payments.name = "cash" AND order_payments.memo1 IS NULL) OR (order_payments.name = "ledger"))';
                var cashDetails = orderPayment.find('first', {fields: fields,
                                                              conditions: conditions,
                                                              recursive: 0,
                                                              limit: this._limit
                                                             });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing cash and ledger sums (error code %S) [message #1418].', [orderPayment.lastError])};

                var cashReceived = (cashDetails && cashDetails.amount != null) ? cashDetails.amount : 0;

                // compute cash change given
                fields = ['SUM(order_payments.change) as "OrderPayment.cash_change"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND ((order_payments.name = "cash" AND NOT (order_payments.memo1 IS NULL)) OR (order_payments.name = "coupon") OR (order_payments.name = "check"))';
                var changeDetails = orderPayment.find('first', {fields: fields,
                                                                conditions: conditions,
                                                                recursive: 0,
                                                                limit: this._limit
                                                               });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing amount of cash change given out (error code %S) [message #1419].', [orderPayment.lastError])};

                var cashGiven = (changeDetails && changeDetails.cash_change != null) ? changeDetails.cash_change : 0;

                var cashNet = cashReceived - cashGiven;

                // compute total payments
                fields = ['SUM(order_payments.amount - order_payments.change) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name != "ledger"';
                var paymentTotal = orderPayment.find('first', {fields: fields,
                                                               conditions: conditions,
                                                               recursive: 0,
                                                               limit: this._limit
                                                              });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing total payments received (error code %S) [message #1420].', [orderPayment.lastError])};

                var paymentsReceived = (paymentTotal && paymentTotal.amount != null) ? paymentTotal.amount : 0;

                // compute deposits (payments with order status of 2
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name != "ledger"' +
                             ' AND orders.status = 2';
                var depositTotal = orderPayment.find('first', {fields: fields,
                                                               conditions: conditions,
                                                               recursive: 1,
                                                               limit: this._limit
                                                              });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing depoits received (error code %S) [message #1421].', [orderPayment.lastError])};

                var deposits = (depositTotal && depositTotal.amount != null) ? depositTotal.amount : 0;

                // compute refunds (payments with order status of -2 and from previous sale period/shift
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name != "ledger"' +
                             ' AND orders.status = -2' +
                             ' AND (orders.sale_period != "' + salePeriod + '" OR orders.shift_number != "' + shiftNumber + '")';
                var refundTotal = orderPayment.find('first', {fields: fields,
                                                              conditions: conditions,
                                                              recursive: 1,
                                                              limit: this._limit
                                                             });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing refunds given out (error code %S) [message #1422].', [orderPayment.lastError])};

                var refunds = (refundTotal && refundTotal.amount != null) ? Math.abs(refundTotal.amount) : 0;

                // compute total sales revenue
                fields = ['SUM(orders.total) as "Order.amount"'];
                conditions = 'orders.status = 1 ' +
                             ' AND orders.sale_period = "' + salePeriod + '"' +
                             ' AND orders.shift_number = "' + shiftNumber + '"' +
                             ' AND orders.terminal_no = "' + terminal_no + '"';
                var salesTotal = orderModel.find('first', {fields: fields,
                                                           conditions: conditions,
                                                           recursive: 0,
                                                           limit: this._limit
                                                          });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing sales revenue (error code %S) [message #1423].', [orderPayment.lastError])};

                var salesRevenue = (salesTotal && salesTotal.amount != null) ? salesTotal.amount : 0;
                var credit = salesRevenue - (paymentsReceived - deposits + refunds);

                // compute ledger IN balance
                fields = ['SUM(order_payments.amount - order_payments.change) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "ledger"' +
                             ' AND order_payments.amount > 0';
                var ledgerInBalance = orderPayment.find('first', {fields: fields,
                                                                  conditions: conditions,
                                                                  recursive: 0,
                                                                  limit: this._limit
                                                                 });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing ledger cash received (error code %S) [message #1424].', [orderPayment.lastError])};

                var ledgerInTotal = (ledgerInBalance && ledgerInBalance.amount != null) ? ledgerInBalance.amount : 0;

                // compute ledger OUT balance
                fields = ['SUM(order_payments.amount - order_payments.change) as "OrderPayment.amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "ledger"' +
                             ' AND order_payments.amount < 0';
                var ledgerOutBalance = orderPayment.find('first', {fields: fields,
                                                                   conditions: conditions,
                                                                   recursive: 0,
                                                                   limit: this._limit
                                                                  });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing ledger cash paid (error code %S) [message #1425].', [orderPayment.lastError])};

                var ledgerOutTotal = (ledgerOutBalance && ledgerOutBalance.amount != null) ? ledgerOutBalance.amount : 0;

                // compute excess giftcard payments
                fields = ['SUM(order_payments.origin_amount - order_payments.amount) as "OrderPayment.excess_amount"'];
                conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                             ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                             ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                             ' AND order_payments.name = "giftcard"';
                var giftcardTotal = orderPayment.find('first', {fields: fields,
                                                                conditions: conditions,
                                                                recursive: 0,
                                                                limit: this._limit
                                                               });
                if (parseInt(orderPayment.lastError) != 0)
                    throw {errno: orderPayment.lastError,
                           errstr: orderPayment.lastErrorString,
                           errmsg: _('An error was encountered while computing excess giftcard payments (error code %S) [message #1426].', [orderPayment.lastError])};

                var giftcardExcess = (giftcardTotal && giftcardTotal.excess_amount != null) ? giftcardTotal.excess_amount : 0;

                // don't include destination details yet
                var shiftChangeDetails = creditcardCouponDetails.concat(giftcardDetails.concat(checkDetails.concat(localCashDetails.concat(valueFixedCashPayment.concat(foreignCashDetails.concat(ledgerDetails))))));
                //shiftChangeDetails = new GeckoJS.ArrayQuery(shiftChangeDetails).orderBy('type asc, name asc');

                var aURL;
                var features;

                var requireCashDeclaration = GeckoJS.Configure.read('vivipos.fec.settings.RequireCashDeclaration');
                var defaultChangeInDrawer = GeckoJS.Configure.read('vivipos.fec.settings.DefaultChangeInDrawer');

                if ( requireCashDeclaration ) {
                    aURL = 'chrome://viviecr/content/prompt_doshiftchangeblindly.xul';
                    features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=450';
                }
                else {
                    aURL = 'chrome://viviecr/content/prompt_doshiftchange.xul';
                    features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
                }

                inputObj = {
                    shiftChangeDetails: shiftChangeDetails,
                    cashNet: cashNet,
                    balance: salesRevenue + ledgerInTotal + ledgerOutTotal  + deposits - refunds - credit + giftcardExcess,
                    salesRevenue: salesRevenue,
                    deposit: deposits,
                    refund: refunds,
                    credit: credit,
                    ledgerInTotal: ledgerInTotal,
                    ledgerOutTotal: ledgerOutTotal,
                    giftcardExcess: giftcardExcess,
                    canEndSalePeriod: canEndSalePeriod,
                    defaultChangeInDrawer: defaultChangeInDrawer,
                    allowChangeWhenEndPeriod: allowChangeWhenEndPeriod
                };
                
                this._unblockUI('blockui_panel');

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Shift Change'), features, inputObj);
            }
            catch(e) {
                this._dbError(e.errno, e.errstr, e.errmsg);
                this._unblockUI('blockui_panel');
                return;
            }
            
            if (inputObj.ok) {

                // cancel current transaction
                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                if (cart) {
                    cart.cancel(true);
                }

                var currentShift = GeckoJS.Session.get('current_shift');
                var amt;

                var shiftChangeModel = new ShiftChangeModel();
                var moneyOutLedgerEntry;
                var moneyInLedgerEntry;

                if (inputObj.end && !allowChangeWhenEndPeriod) {
                    amt = 0;
                }
                else {
                    amt = parseFloat(inputObj.amount);

                    if (isNaN(amt)) {
                        NotifyUtils.warn(_('Invalid cash drawer change amount [%S]', [amt]));
                        return;
                    }
                    else if (amt < 0) {
                        NotifyUtils.warn(_('You may not leave negative amount of cash in the cashdrawer'));
                        return;
                    }
                    else if (amt > 0) {
                        var ledgerController = GeckoJS.Controller.getInstanceByName('LedgerRecords');
                        var ledgerEntryTypeController = GeckoJS.Controller.getInstanceByName('LedgerEntryTypes');

                        // do cashdrawer money out
                        var entryType = ledgerEntryTypeController.getDrawerChangeType('OUT');
                        moneyOutLedgerEntry = {
                            type: entryType.type,
                            mode: entryType.mode,
                            description: inputObj.description,
                            amount: amt,
                            sale_period: salePeriod,
                            shift_number: shiftNumber,
                            nodraweraction: true
                        };
                        
                        entryType = ledgerEntryTypeController.getDrawerChangeType('IN');
                        moneyInLedgerEntry = {
                            type: entryType.type,
                            mode: entryType.mode,
                            description: inputObj.description,
                            amount: amt,
                            nodraweraction: true
                        };

                        // append to shiftChangeDetails
                        var newChangeDetail = {type: 'ledger',
                                               name: moneyOutLedgerEntry.type,
                                               amount: 0 - amt,
                                               count: 1};

                        // look through shiftChangeDetails and add amount and count to entry of the same type/name
                        var found = false;
                        for (var i = 0; i < shiftChangeDetails.length; i++) {
                            var record = shiftChangeDetails[i];
                            if (record.type == newChangeDetail.type && record.name == newChangeDetail.name) {
                                found = true;
                                record.amount += newChangeDetail.amount;
                                record.count++;
                                break;
                            }
                        }
                        if (!found) {
                            shiftChangeDetails.push(newChangeDetail);
                        }
                    }
                }

                // append destination details to shift change details so it gets stored to db
                shiftChangeDetails = destDetails.concat(shiftChangeDetails);

                // update shiftChangeDetails and record shift change to database
                var shiftChangeRecord = {
                    starttime: currentShift.modified,
                    endtime: parseFloat(new Date().getTime() / 1000).toFixed(0),
                    cash: inputObj.cashNet - amt,
                    balance: inputObj.balance - amt,
                    sales: inputObj.salesRevenue,
                    deposit: inputObj.deposit,
                    refund: inputObj.refund,
                    credit: inputObj.credit,
                    ledger_out: inputObj.ledgerOutTotal - amt,
                    ledger_in: inputObj.ledgerInTotal,
                    excess: inputObj.giftcardExcess,
                    note: inputObj.description,
                    terminal_no: GeckoJS.Session.get('terminal_no'),
                    sale_period: this._getSalePeriod(),
                    shift_number: this._getShiftNumber(),
                    shiftChangeDetails: shiftChangeDetails,
                    reported_cash: inputObj.reportedCash
                };

                if (!shiftChangeModel.saveShiftChange(shiftChangeRecord)) {
                    this._dbError(shiftChangeModel.lastError, shiftChangeModel.lastErrorString,
                                  _('An error was encountered while saving shift change record; shift may not have been closed properly [message #1427]..'));
                    return;
                }

                if (inputObj.end) {

                    // check stored order policy, apply if appropriate
                    let policy = GeckoJS.Configure.read('vivipos.fec.settings.StoredOrderWhenEndPeriod') || 'none';
                    //let storedOrders = orderModel.getCheckList();
                    let storedOrders = [];

                    if (parseInt(orderModel.lastError) != 0) {
                        this._dbError(orderModel.lastError, orderModel.lastErrorString,
                            _('An error was encountered while retrieving order records (error code %S) [message #1428].', [orderModel.lastError]));
                        return;
                    }

                    if (storedOrders && storedOrders.length > 0) {
                        if (policy == 'alert') {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Change'),
                                _('Note: one or more orders are still open.'));
                        }
                        else if (policy == 'force') {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Change'),
                                _('You may not end the current sale period while orders are still open.'));
                            return;
                        }
                    }

                    // closing sale period, check if we need to advance cluster sale period
                    var handleSalePeriod = this.ShiftMarker.isSalePeriodHandler();
                    //this.log('DEBUG', 'sale period handler? ' + handleSalePeriod);
                    if (handleSalePeriod) {
                        // @note irving 2009-09-11
                        //
                        // we shall attempt to reset order sequence first; if reset fails, then we terminate the updateShiftMarker process.
                        // this allows the user to re-attempt sequence resets without advancing shift markers unnecessarily

                        // reset sequence if necessary
                        if (resetSequence) {

                            // get sequence format and length
                            if (SequenceModel.resetSequence('order_no', 0) == -1) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Shift Change Error'),
                                    _('Failed to close sale period because cluster sequence number could not be reset. Please check the network connectivity to the terminal designated as the sale period master.'));
                                return;
                            }
                        }

                        var newSalePeriod;
                        var lastSalePeriodPlusOne = new Date(salePeriod * 1000).add({days: 1}).clearTime();

                        if (salePeriod == '' || (today > lastSalePeriodPlusOne)) {
                            newSalePeriod = today;
                        }
                        else {
                            newSalePeriod = lastSalePeriodPlusOne;
                        }
                        var newSalePeriodTime = newSalePeriod.getTime() / 1000;
                        //this.log('DEBUG', 'advancing sale period to ' + newSalePeriodTime + ':' + newSalePeriod);

                        var r = this.ShiftMarker.advanceClusterSalePeriod(newSalePeriodTime);
                        if (!r) {
                            SequenceModel.resetLocalSequence('sale_period', newSalePeriodTime);
                        }
                        else if (r == -1) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Change Error'),
                                _('Failed to close sale period because cluster sale period could not be updated. Please check the network connectivity to the terminal designated as the sale period master.'));
                            return;
                        }
                    }
                    
                    // save money out ledger entry
                    if (moneyOutLedgerEntry)
                        if (!ledgerController.saveLedgerEntry(moneyOutLedgerEntry)) return;
                    
                    // mark end of sale period locally
                    if (!this._setEndOfPeriod(moneyInLedgerEntry)) return;

                    doEndOfPeriod = true;
                }
                else {
                    // check stored order policy, apply if appropriate
                    let policy = GeckoJS.Configure.read('vivipos.fec.settings.StoredOrderWhenShiftChange') || 'none';
                    //let storedOrders = orderModel.getCheckList();
                    let storedOrders = [];

                    if (parseInt(orderModel.lastError) != 0) {
                        this._dbError(orderModel.lastError, orderModel.lastErrorString,
                            _('An error was encountered while retrieving order records (error code %S) [message #1428].', [orderModel.lastError]));
                        return;
                    }

                    if (storedOrders && storedOrders.length > 0) {
                        if (policy == 'alert') {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Change'),
                                _('Note: one or more orders are still open.'));
                        }
                        else if (policy == 'force') {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Change'),
                                _('You may not close the current shift while orders are still open.'));
                            return;
                        }
                    }

                    // mark end of shift
                    if (!this._setEndOfShift(moneyInLedgerEntry)) return;

                    doEndOfShift = true;

                    // save money out ledger entry
                    if (moneyOutLedgerEntry)
                        if (!ledgerController.saveLedgerEntry(moneyOutLedgerEntry)) return;
                }
            }

            if (doEndOfPeriod) {

                // data cleanup
                this.requestCommand('clearOrderData', null, 'Main');
                this.requestCommand('clearOrderObjects', null, 'Main');                

                // offer options to power off or restart and to print shift and day reports
                var aURL = 'chrome://viviecr/content/prompt_end_of_period.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=300';
                var parms = {message: _('Sale Period [%S] is now closed', [new Date(currentShift.sale_period * 1000).toLocaleDateString()])};
                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Sale Period Close'), features, parms);

                // power off or restart
                if (parms.poweroff) {
                    // power off
                    this.requestCommand('shutdownMachine', null, 'Main');
                }
                else {
                    // @irving 2009-03-25
                    // we now restart after closing sale period
                    try {
                        GREUtils.restartApplication();
                    }
                    catch(e) {
                        // sign off and return to login screen if restart fails
                        // login
                        this.requestCommand('signOff', true, 'Main');
                        this.requestCommand('ChangeUserDialog', null, 'Main');
                    }
                }
            }
            else if (doEndOfShift) {

                // shift change notification and print option
                var aURL = 'chrome://viviecr/content/prompt_end_of_shift.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=200';
                var message = _('Sale Period [%S] Shift [%S] is now closed', [new Date(currentShift.sale_period * 1000).toLocaleDateString(), currentShift.shift_number]);
                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Shift Close'), features, message);

                this.requestCommand('signOff', true, 'Main');
                this.requestCommand('ChangeUserDialog', null, 'Main');
            }
        },
        
        printShiftReport: function( all ) {
        	if ( !GREUtils.Dialog.confirm(this.topmostWindow, '', _( 'Are you sure you want to print shift report?' ) ) )
        		return;

            var reportController = GeckoJS.Controller.getInstanceByName('RptCashByClerk');
            var salePeriod = this._getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get( 'terminal_no' );

            var shiftNumber = '';
            if ( !all )
                shiftNumber = this._getShiftNumber().toString();

            reportController.printShiftChangeReport( salePeriod, salePeriod, shiftNumber, terminalNo );
        },

        printDailySales: function() {
        	if ( !GREUtils.Dialog.confirm(this.topmostWindow, '', _( 'Are you sure you want to print daily sales report?' ) ) )
        		return;
        	
            var reportController = GeckoJS.Controller.getInstanceByName( 'RptSalesSummary' );
            var salePeriod = this._getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get( 'terminal_no' );

            reportController.printSalesSummary( salePeriod, salePeriod, terminalNo, 'sale_period', '' );
        },
        
        reviewShiftReport: function( all ) {
            var salePeriod = this._getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get('terminal_no');

			var shiftNumber = '';
			if ( !all )
				shiftNumber = this._getShiftNumber().toString();
				
			var parameters = {
				start: salePeriod,
				end: salePeriod,
				shiftNo: shiftNumber,
				terminalNo: terminalNo
			};
		
            //var processedTpl = reportController.getProcessedTpl( salePeriod, salePeriod, shiftNumber, terminalNo );
		    
		    var aURL = 'chrome://viviecr/content/rpt_cash_by_clerk.xul';
		    var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
		    GREUtils.Dialog.openWindow(this.topmostWindow, aURL, '', features, parameters);//processedTpl, parameters);
        },

        reviewDailySales: function() {
            var salePeriod = this._getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get( 'terminal_no' );
            var periodType = 'sale_period';
            var shiftNo = '';
            
            var parameters = {
				start: salePeriod,
				end: salePeriod,
				periodtype: periodType,
				shiftno: shiftNo,
				terminalNo: terminalNo
			};

            //var processedTpl = reportController.getProcessedTpl( salePeriod, salePeriod, terminalNo, periodType, shiftNo );
            
            var aURL = 'chrome://viviecr/content/rpt_sales_summary.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, '', features, parameters);//processedTpl, parameters);
        },

        select: function(index){
            if (index >= 0) {
                var supplier = this._listDatas[index];
                this.requestCommand('view', supplier.id);
                this._listObj.selectedIndex = index;
            }
        },

        retrieveClusterSalePeriod: function(evt) {
            //this.log('DEBUG', 'triggered on event ' + evt.type);

            var txn = evt.data;
            if (!txn) return;

            var checkSalePeriod = GeckoJS.Configure.read('vivipos.fec.settings.CheckSalePeriod') || false;
            if (checkSalePeriod) {
                var r = this.ShiftMarker.getClusterSalePeriod(true, function(sp) {
                    txn.data.cluster_sp = sp;
                });

                if (!r) {
                    // sale period is local
                    txn.data.cluster_sp = null;
                }
            }
        },

        verifyClusterSalePeriod: function(evt) {

            //this.log('DEBUG', 'triggered on event ' + evt.type);

            // check if sale period is in sync with cluster sale period
            var checkSalePeriod = GeckoJS.Configure.read('vivipos.fec.settings.CheckSalePeriod') || false;
            if (checkSalePeriod) {

                var txn;
                if (evt.type == 'beforeLedgerEntry') {
                    txn = {data: {cluster_sp: -1}};
                }
                else {
                    txn = evt.data.txn;
                }

                // force and waiting to get cluster sale period
                if (typeof txn.data.cluster_sp == 'undefined') {

                    var timeoutGuardSec = txn.syncSettings.timeout * 1000;
                    var timeoutGuardNow = Date.now().getTime();

                    // block ui until request finish or timeout
                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (typeof txn.data.cluster_sp == 'undefined' && thread.hasPendingEvents()) {

                        if (Date.now().getTime() > (timeoutGuardNow+timeoutGuardSec)) {
                            txn.data.cluster_sp = -1;
                            break;
                        }

                        thread.processNextEvent(true);
                    }
                    // dump('length = '+self.data.seq.length+' \n');
                }

                if ('cluster_sp' in txn.data) {

                    // try again if previous attempt failed due to network/server issues
                    if (txn.data.cluster_sp == -1) {
                        txn.data.cluster_sp = this.ShiftMarker.getClusterSalePeriod();
                    }

                    var clusterSalePeriod = txn.data.cluster_sp;
                    var currentSalePeriod = GeckoJS.Session.get('sale_period');

                    //this.log('DEBUG', 'cluster SP: ' + clusterSalePeriod + ', local SP: ' + currentSalePeriod);
                    if (clusterSalePeriod) {
                        if (clusterSalePeriod == -1) {
                            evt.preventDefault();
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Shift Error'),
                                _('Failed to verify current sale period. Please check the network connectivity to the terminal designated as the sale period master. You are strongly advised to resolve this issue before executing any further transactions on this terminal.'));
                        }
                        else if (clusterSalePeriod != currentSalePeriod) {
                            var disableShiftChange = GeckoJS.Configure.read('vivipos.fec.settings.DisableShiftChange');
                            if (disableShiftChange) {
                                // update current shift silently
                                var shift_marker = this._getShiftMarker();
                                if (shift_marker) {
                                    shift_marker.sale_period = clusterSalePeriod;
                                }
                                else {
                                    shift_marker = {
                                        sale_period: -1,
                                        shift_number: ''
                                    };
                                    evt.preventDefault();
                                    GREUtils.Dialog.alert(this.topmostWindow,
                                        _('Shift Error'),
                                        _('Failed to verify current sale period. Please check the network connectivity to the terminal designated as the sale period master. You are strongly advised to resolve this issue before executing any further transactions on this terminal.'));
                                }
                                this._updateSession(shift_marker);
                            }
                            else {
                                evt.preventDefault();
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Shift Warning'),
                                    _("This terminal's sale period [%S (%S)] appears to be out of sync with the cluster sale period [%S (%S)]. Please close the sale period on this terminal immediately to avoid recording transactions in the wrong sale period.",
                                      [new Date(currentSalePeriod * 1000).toLocaleDateString(), currentSalePeriod, new Date(clusterSalePeriod * 1000).toLocaleDateString(), clusterSalePeriod]));
                            }
                        }
                        else {
                            //this.log('DEBUG', 'sale period verified for event: ' + evt.type);
                        }
                    }
                }
            }
            
            // verify that a valid shift marker exists
            var shift = GeckoJS.Session.get('current_shift');
            if (!shift) {
                evt.preventDefault();
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Shift Error'),
                    _('A valid sale period has not been set for this terminal. Please resolve this issue before executing any further transactions on this terminal.'));
            }
        },

        _blockUI: function(panel, caption, title, sleepTime) {

            sleepTime = typeof sleepTime =='undefined' ?  0 : sleepTime;
            var waitPanel = document.getElementById(panel);
            var waitCaption = document.getElementById(caption);

            if (waitCaption) waitCaption.setAttribute("label", title);

            waitPanel.openPopupAtScreen(0, 0);

            if (sleepTime > 0) this.sleep(sleepTime);
            return waitPanel;

        },

        _unblockUI: function(panel) {

            var waitPanel = document.getElementById(panel);

            waitPanel.hidePopup();
            return waitPanel;

        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', errmsg + '\nDatabase Error [' +  errno + ']: [' + errstr + ']');
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'ShiftChanges');
                                      });

    }, false);

})();
