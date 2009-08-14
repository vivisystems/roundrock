(function(){

    var __controller__ = {

        name: 'ShiftChanges',

        _listObj: null,
        _listDatas: null,
        _limit: 3000000,

        initial: function() {
            // set current sales period and shift number
            this._updateSession();
            
            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            // add event listener for onUpdateOptions events
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onSetClerk', this.startShift, this);
                main.addEventListener('afterClearOrderData', this.expireData, this);
                main.addEventListener('afterTruncateTxnRecords', this.truncateData, this);
            }
        },

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return s.replace( re, '\'\'' );
        },

        _getShiftMarker: function() {
            shift = GeckoJS.Session.get('current_shift');
            if (!shift) {
                var shiftMarkerModel = new ShiftMarkerModel();
                var terminalNo = GeckoJS.Session.get('terminal_no');
                var shift = shiftMarkerModel.find('first', {
                    conditions: "terminal_no = '" + this._queryStringPreprocessor(terminalNo) +  "'",
                    recursive: 0
                });
                if (parseInt(shiftMarkerModel.lastError) != 0) {
                    this._dbError(shiftMarkerModel.lastError, shiftMarkerModel.lastErrorString,
                                  _('An error was encountered while retrieving shift change configuration (error code %S).', [shiftMarkerModel.lastError]));
                    return;
                }
            }
            GeckoJS.Session.set('current_shift', shift);
            return shift;
        },

        _getEndOfShift: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_shift : false;
        },

        _getEndOfPeriod: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_period : false;
        },

        _setEndOfShift: function() {
            return this._setShift(this._getSalePeriod(), this._getShiftNumber(), false, true);
        },

        _setEndOfPeriod: function() {
            return this._setShift(this._getSalePeriod(), this._getShiftNumber(), true, true);
        },

        _updateSession: function(currentShift) {
            var shiftNumber = '';
            var salePeriod = '';

            if (!currentShift) {
                currentShift = this._getShiftMarker();
            }

            if (currentShift) {
                shiftNumber = currentShift.shift_number;
                salePeriod = currentShift.sale_period;
            }
            GeckoJS.Session.set('current_shift', currentShift);
            GeckoJS.Session.set('shift_number', shiftNumber);
            GeckoJS.Session.set('sale_period', salePeriod);
            GeckoJS.Session.set('sale_period_string',
                                salePeriod == '' ? '' : new Date(salePeriod * 1000).toLocaleDateString());
        },

        _setShift: function(salePeriod, shiftNumber, endOfPeriod, endOfShift) {
            var shiftMarkerModel = new ShiftMarkerModel();

            shiftNumber = parseInt(shiftNumber);
            salePeriod = parseInt(salePeriod);
            
            var newShiftMarker = {
                terminal_no: GeckoJS.Session.get('terminal_no'),
                sale_period: salePeriod,
                shift_number: shiftNumber,
                end_of_period: endOfPeriod,
                end_of_shift: endOfShift
            };

            var shift = this._getShiftMarker();

            // update shift marker if it already exists
            if (shift) {
                newShiftMarker.id = shift.id;
                shiftMarkerModel.id = shift.id;
            }
            var r = shiftMarkerModel.saveMarker(newShiftMarker);
            if (!r) {
                this._dbError(shiftMarkerModel.lastError, shiftMarkerModel.lastErrorString,
                              _('An error was encountered while updating shift change configuration (error code %S).', [shiftMarkerModel.lastError]));
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
                              last_shift_number: lastShiftNumber};
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow' && (typeof win.width) == 'undefined')
                win = null;
            GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);
        },

        _getSalePeriod: function() {
            return GeckoJS.Session.get('sale_period');
        },

        _getShiftNumber: function() {
            return GeckoJS.Session.get('shift_number');
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
                               errmsg: _('An error was encountered while expiring backup shift change records (error code %S).', [model.lastError])};
                    }

                    r = model.execute('delete from shift_changes where created <= ' + expireDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring shift change records (error code %S).', [model.lastError])};
                    }

                    model = new ShiftChangeDetailModel();
                    r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup shift change details (error code %S).', [model.lastError])};
                    }

                    r = model.execute('delete from shift_change_details where not exists (select 1 from shift_changes where shift_changes.id == shift_change_details.shift_change_id)') && r;
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring shift change details (error code %S).', [model.lastError])};
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
                           errmsg: _('An error was encountered while removing all shift change records (error code %S).', [model.lastError])};
                }

                model = new ShiftChangeDetailModel();
                r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all shift change details (error code %S).', [model.lastError])};
                }

                model = new ShiftMarkerModel();
                r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: ('An error was encountered while removing shift change marker (error code %S).', [model.lastError])};
                }
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
            var resetSequence = GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod');
            var isNewSalePeriod = false;
            var updateShiftMarker = true;
            
            // no last shift?
            if (lastSalePeriod == '') {
                // insert new sale period with today's date;
                newSalePeriod = new Date().clearTime() / 1000;
                newShiftNumber = 1;

                isNewSalePeriod = true;
            }

            // is last shift the end of the last sale period
            else if (endOfPeriod) {

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
                newShiftNumber = 1;

                isNewSalePeriod = true;
            }
            // has last shift ended?
            else if (endOfShift) {
                newSalePeriod = lastSalePeriod;
                newShiftNumber = lastShiftNumber + 1;
            }
            // continue last shift
            else {
                newSalePeriod = lastSalePeriod;
                newShiftNumber = lastShiftNumber;

                updateShiftMarker = false;
            }

            // need to catch exceptions
            if (updateShiftMarker) {
                if (this._setShift(newSalePeriod, newShiftNumber, false, false)) {

                    // reset sequence if necessary
                    if (resetSequence && isNewSalePeriod) {

                        // get sequence format and length
                        SequenceModel.resetSequence('order_no', 0);
                    }
                }
            }
            // display current shift / last shift information
            this._ShiftDialog(new Date(newSalePeriod * 1000).toLocaleDateString(), newShiftNumber,
                              lastSalePeriod == '' ? '' : new Date(lastSalePeriod * 1000).toLocaleDateString(), lastShiftNumber );

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
                           errmsg: _('An error was encountered while retrieving credit card and coupon payment records (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while retrieving giftcard payment records (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while retrieving check payment records (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while retrieving cash payment records (error code %S)', [orderPayment.lastError])};

                //alert(this.dump(localCashDetails));
                //this.log(this.dump(localCashDetails));

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
                           errmsg: _('An error was encountered while retrieving foreign cash payment records (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while retrieving ledger payment records (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while retrieving orders by destinations (error code %S)', [orderModel.lastError])};

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
                           errmsg: _('An error was encountered while computing cash and ledger sums (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing amount of cash change given out (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing total payments received (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing depoits received (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing refunds given out (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing sales revenue (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing ledger cash received (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing ledger cash paid (error code %S)', [orderPayment.lastError])};

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
                           errmsg: _('An error was encountered while computing excess giftcard payments (error code %S)', [orderPayment.lastError])};

                var giftcardExcess = (giftcardTotal && giftcardTotal.excess_amount != null) ? giftcardTotal.excess_amount : 0;

                // don't include destination details yet
                var shiftChangeDetails = creditcardCouponDetails.concat(giftcardDetails.concat(checkDetails.concat(localCashDetails.concat(foreignCashDetails.concat(ledgerDetails)))));
                shiftChangeDetails = new GeckoJS.ArrayQuery(shiftChangeDetails).orderBy('type asc, name asc');

                var aURL = 'chrome://viviecr/content/prompt_doshiftchange.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;

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
                    canEndSalePeriod: canEndSalePeriod
                };
                
                this._unblockUI('blockui_panel');

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Shift Change'), features, inputObj);
            }
            catch(e) {
                this._dbError(e.errno, e.errstr, e.errmsg);
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

                if (inputObj.end) {
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
                            shift_number: shiftNumber
                        };
                        entryType = ledgerEntryTypeController.getDrawerChangeType('IN');

                        moneyInLedgerEntry = {
                            type: entryType.type,
                            mode: entryType.mode,
                            description: inputObj.description,
                            amount: amt,
                            sale_period: salePeriod,
                            shift_number: parseInt(shiftNumber) + 1
                        };

                        // append to shiftChangeDetails
                        var newChangeDetail = {type: 'ledger',
                                               name: entryType.type,
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
                    shiftChangeDetails: shiftChangeDetails
                };

                if (!shiftChangeModel.saveShiftChange(shiftChangeRecord)) {
                    this._dbError(shiftChangeModel.lastError, shiftChangeModel.lastErrorString,
                                  _('An error was encountered while saving shift change record; shift may not have been closed properly.'));
                    return;
                }

                // save money out ledger entry
                if (moneyOutLedgerEntry)
                    if (!ledgerController.saveLedgerEntry(moneyOutLedgerEntry)) return;

                if (inputObj.end) {

                    // mark end of sale period
                    if (!this._setEndOfPeriod()) return;

                    doEndOfPeriod = true;
                }
                else {
                    // mark end of shift
                    if (!this._setEndOfShift()) return;

                    doEndOfShift = true;

                    if (moneyInLedgerEntry)
                        if (!ledgerController.saveLedgerEntry(moneyInLedgerEntry)) return;
                }
            }

            if (doEndOfPeriod) {
                // data cleanup
                this.requestCommand('clearOrderData', null, 'Main');

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
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
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
