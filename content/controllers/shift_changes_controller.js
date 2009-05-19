(function(){

    /**
     * ShiftChangesController
     */

    var __controller__ = {
        name: 'ShiftChanges',

        _listObj: null,
        _listDatas: null,

        initial: function() {
            // set current sales period and shift number
            this.updateSession();
            
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

        expireData: function(evt) {
            var model = new ShiftChangeModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                model.execute('delete from shift_changes where created <= ' + expireDate);
                model.execute('delete from shift_change_details where not exists (select 1 from shift_changes where shift_changes.id == shift_change_details.shift_change_id)');
            }
        },

        truncateData: function(evt) {
            var model = new ShiftChangeModel();
            model.execute('delete from shift_changes');
            model.execute('delete from shift_change_details');
            model.execute('delete from shift_markers');
        },

        load: function() {
            //
        },

        getShiftMarker: function() {
            var shiftMarkerModel = new ShiftMarkerModel();
            var shift = shiftMarkerModel.findByIndex('first', {
                index: 'terminal_no',
                value: GeckoJS.Session.get('terminal_no')
            });
            return shift;
        },

        getSalePeriod: function() {
            return GeckoJS.Session.get('sale_period');
        },

        getShiftNumber: function() {
            return GeckoJS.Session.get('shift_number');
        },

        getEndOfPeriod: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_period : null;
        },

        setEndOfPeriod: function() {
            this.setShift(this.getSalePeriod(), this.getShiftNumber(), true, true);
        },

        getEndOfShift: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_shift : null;
        },

        setEndOfShift: function() {
            this.setShift(this.getSalePeriod(), this.getShiftNumber(), false, true);
        },

        updateSession: function(currentShift) {
            var shiftNumber = '';
            var salePeriod = '';

            if (!currentShift) {
                currentShift = this.getShiftMarker();
            }

            if (currentShift) {
                shiftNumber = currentShift.shift_number;
                salePeriod = currentShift.sale_period;
            }
            GeckoJS.Session.set('current_shift', currentShift);
            GeckoJS.Session.set('shift_number', shiftNumber);
            GeckoJS.Session.set('sale_period', salePeriod);
            GeckoJS.Session.set('sale_period_string', salePeriod == '' ? '' : new Date(salePeriod * 1000).toLocaleDateString());
        },


        setShift: function(salePeriod, shiftNumber, endOfPeriod, endOfShift) {
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

            var shift = shiftMarkerModel.findByIndex('first', {
                index: 'terminal_no',
                value: GeckoJS.Session.get('terminal_no')
            });

            // update shift marker
            if (shift) {
                newShiftMarker.id = shift.id;
                shiftMarkerModel.id = shift.id;
            }
            newShiftMarker = shiftMarkerModel.save(newShiftMarker);

            // update shift
            this.updateSession(newShiftMarker);
        },

        // this is invoked right after initialLogin
        startShift: function() {

            // does sale period exist?
            var newSalePeriod;
            var newShiftNumber;
            var lastSalePeriod = this.getSalePeriod();
            var lastShiftNumber = this.getShiftNumber();
            var endOfPeriod = this.getEndOfPeriod();
            var endOfShift = this.getEndOfShift();
            var resetSequence = GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod');
            var isNewSalePeriod = false;

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
            }
            this.setShift(newSalePeriod, newShiftNumber, false, false);

            // reset sequence if necessary
            if (resetSequence && isNewSalePeriod) {
                // get sequence format and length
                var sequenceNumberLength = GeckoJS.Configure.read('vivipos.fec.settings.SequenceNumberLength') || 4;
                var newSequence = new Date(newSalePeriod * 1000).toString('yyyyMMdd') +
                                  GeckoJS.String.padLeft('0', sequenceNumberLength, '0');
                SequenceModel.resetSequence('order_no', parseInt(newSequence));
            }
            
            // display current shift / last shift information
            this.ShiftDialog(new Date(newSalePeriod * 1000).toLocaleDateString(), newShiftNumber,
                             lastSalePeriod == '' ? '' : new Date(lastSalePeriod * 1000).toLocaleDateString(), lastShiftNumber );

            this.dispatchEvent('onStartShift', {salePeriod: newSalePeriod, shift: newShiftNumber});
        },
        
        ShiftDialog: function (newSalePeriod, newShiftNumber, lastSalePeriod, lastShiftNumber) {
            var width = 400;
            var height = 300;
            var aURL = 'chrome://viviecr/content/alert_shift.xul';
            var aName = 'Shift Information';
            var aArguments = {current_sale_period: newSalePeriod,
                              current_shift_number: newShiftNumber,
                              last_sale_period: lastSalePeriod,
                              last_shift_number: lastShiftNumber};
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;
            var parent = GREUtils.Dialog.getMostRecentWindow();

            // if parent is the ViviPOS root window, set parent to null instead to make dialog center
            if (parent != null && parent.document.title.toLowerCase() == 'vivipos') parent = null;
            GREUtils.Dialog.openWindow(parent, aURL, aName, aFeatures, aArguments);
        },

        shiftChange: function() {
            var salePeriod = this.getSalePeriod();
            var shiftNumber = this.getShiftNumber();
            var terminal_no = GeckoJS.Session.get('terminal_no');
            var salePeriodLeadDays = GeckoJS.Configure.read('vivipos.fec.settings.MaxSalePeriodLeadDays') || 0;

            var orderPayment = new OrderPaymentModel();

            // check if sale period leads calendar date by more than allowed number of days
            var today = Date.today();
            var salePeriodDate = new Date(salePeriod * 1000);
            var canEndSalePeriod = this.Acl.isUserInRole('acl_close_sale_period') &&
                                   ((salePeriodDate - today) / (24 * 60 * 60 * 1000) + 1) <= salePeriodLeadDays;

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
                                                                    recursive: 0
                                                                   });
            //alert(this.dump(creditcardCouponDetails));
            ////this.log(this.dump(creditcardCouponDetails));

            // next, we collect payment totals for giftcard
            fields = ['order_payments.memo1 as "OrderPayment.name"',
                      'order_payments.name as "OrderPayment.type"',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM(order_payments.origin_amount) as "OrderPayment.amount"',
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
                                                            recursive: 0
                                                           });
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
                                                         recursive: 0
                                                        });

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
                                                             recursive: 0
                                                            });

            //alert(this.dump(localCashDetails));
            //this.log(this.dump(localCashDetails));

            // next, we collect payment totals for cash in foreign denominations
            fields = ['order_payments.memo1 as "OrderPayment.name"',
                      'order_payments.name as "OrderPayment.type"',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM(order_payments.origin_amount) as "OrderPayment.amount"',
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
                                                               recursive: 0
                                                              });

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
                                                          recursive: 0
                                                         });
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
                                                      recursive: 0
                                                     });
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
                                                          recursive: 0
                                                         });
            var cashReceived = (cashDetails && cashDetails.amount != null) ? cashDetails.amount : 0;

            // compute cash change given
            fields = ['SUM(order_payments.change) as "OrderPayment.cash_change"'];
            conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                         ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                         ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                         ' AND ((order_payments.name = "cash" AND NOT (order_payments.memo1 IS NULL)) OR (order_payments.name = "coupon") OR (order_payments.name = "check"))';
            var changeDetails = orderPayment.find('first', {fields: fields,
                                                            conditions: conditions,
                                                            recursive: 0
                                                           });

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
                                                           recursive: 0
                                                          });
            var paymentsReceived = (paymentTotal && paymentTotal.amount != null) ? paymentTotal.amount : 0;

            // compute deposits (payments with order status of 2
            conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                         ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                         ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                         ' AND order_payments.name != "ledger"' +
                         ' AND orders.status = 2';
            var depositTotal = orderPayment.find('first', {fields: fields,
                                                           conditions: conditions,
                                                           recursive: 1
                                                          });
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
                                                          recursive: 1
                                                         });
            var refunds = (refundTotal && refundTotal.amount != null) ? Math.abs(refundTotal.amount) : 0;
            
            // compute total sales revenue
            fields = ['SUM(orders.total) as "Order.amount"'];
            conditions = 'orders.status = 1 ' +
                         ' AND orders.sale_period = "' + salePeriod + '"' +
                         ' AND orders.shift_number = "' + shiftNumber + '"' +
                         ' AND orders.terminal_no = "' + terminal_no + '"';
            var salesTotal = orderModel.find('first', {fields: fields,
                                                       conditions: conditions,
                                                       recursive: 0
                                                      });

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
                                                              recursive: 0
                                                             });
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
                                                               recursive: 0
                                                              });
            var ledgerOutTotal = (ledgerOutBalance && ledgerOutBalance.amount != null) ? ledgerOutBalance.amount : 0;

            // compute excess giftcard payments
            fields = ['SUM(order_payments.origin_amount - order_payments.amount) as "OrderPayment.excess_amount"'];
            conditions = 'order_payments.sale_period = "' + salePeriod + '"' +
                         ' AND order_payments.shift_number = "' + shiftNumber + '"' +
                         ' AND order_payments.terminal_no = "' + terminal_no + '"' +
                         ' AND order_payments.name = "giftcard"';
            var giftcardTotal = orderPayment.find('first', {fields: fields,
                                                            conditions: conditions,
                                                            recursive: 0
                                                           });

            var giftcardExcess = (giftcardTotal && giftcardTotal.excess_amount != null) ? giftcardTotal.excess_amount : 0;

            // don't include destination details yet
            var shiftChangeDetails = creditcardCouponDetails.concat(giftcardDetails.concat(checkDetails.concat(localCashDetails.concat(foreignCashDetails.concat(ledgerDetails)))));
            shiftChangeDetails = new GeckoJS.ArrayQuery(shiftChangeDetails).orderBy('type asc, name asc');

            var aURL = 'chrome://viviecr/content/prompt_doshiftchange.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                shiftChangeDetails: shiftChangeDetails,
                cashNet: cashNet,
                balance: salesRevenue + ledgerInTotal + ledgerOutTotal  + deposits - refunds - credit,
                salesRevenue: salesRevenue,
                deposit: deposits,
                refund: refunds,
                credit: credit,
                ledgerInTotal: ledgerInTotal,
                ledgerOutTotal: ledgerOutTotal,
                giftcardExcess: giftcardExcess,
                canEndSalePeriod: canEndSalePeriod
            };

            window.openDialog(aURL, _('Shift Change'), features, inputObj);

            if (inputObj.ok) {
                // cancel current transaction
                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                if (cart) {
                    cart.cancel(true);
                }

                var currentShift = GeckoJS.Session.get('current_shift');
                var amt;

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
                        var ledgerEntry = {
                            type: entryType.type,
                            mode: entryType.mode,
                            description: inputObj.description,
                            amount: amt
                        }
                        ledgerController.saveLedgerEntry(ledgerEntry);

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
                    sale_period: this.getSalePeriod(),
                    shift_number: this.getShiftNumber(),
                    shiftChangeDetails: shiftChangeDetails
                };

                // do shift change
                var shiftChangeModel = new ShiftChangeModel();
                shiftChangeModel.saveShiftChange(shiftChangeRecord);

                var message;
                if (inputObj.end) {
                    // mark end of sale period
                    this.setEndOfPeriod();

                    // data cleanup
                    this.requestCommand('clearOrderData', null, 'Main');
                    
                    // offer options to power off or restart and to print shift and day reports
                    aURL = 'chrome://viviecr/content/prompt_end_of_period.xul';
                    features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=270';
                    var parms = {message: _('Sale Period [%S] is now closed', [new Date(currentShift.sale_period * 1000).toLocaleDateString()])};
                    window.openDialog(aURL, _('Sale Period Close'), features, parms);

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
                else {
                    // mark end of shift
                    this.setEndOfShift();

                    // @hack
                    // to make sure the ledger entry is saved to the right shift,
                    // we increment shift number by 1 in the Session and change it
                    // back right after saving the leger entry
                    if (amt > 0) {
                        // do cashdrawer money in
                        entryType = ledgerEntryTypeController.getDrawerChangeType('IN');
                        ledgerEntry = {
                            type: entryType.type,
                            mode: entryType.mode,
                            description: inputObj.description,
                            amount: amt
                        }
                        var shift = this.getShiftNumber();
                        GeckoJS.Session.set('shift_number', ++shift);
                        ledgerController.saveLedgerEntry(ledgerEntry);
                        GeckoJS.Session.set('shift_number', --shift);
                    }

                    // shift change notification and print option
                    aURL = 'chrome://viviecr/content/prompt_end_of_shift.xul';
                    features = 'chrome,titlebar,toolbar,centerscreen,modal,width=477,height=150';
                    message = _('Sale Period [%S] Shift [%S] is now closed', [new Date(currentShift.sale_period * 1000).toLocaleDateString(), currentShift.shift_number]);
                    window.openDialog(aURL, _('Shift Close'), features, message);

                    this.requestCommand('signOff', true, 'Main');
                    this.requestCommand('ChangeUserDialog', null, 'Main');
                }
            }
        },
        
        _showWaitPanel: function(panel, sleepTime) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        printShiftReport: function( all ) {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to print shift report?' ) ) )
        		return;

			var waitPanel = this._showWaitPanel( 'wait_panel', 1000 );
        	
        	try {
		        var reportController = GeckoJS.Controller.getInstanceByName( 'RptCashByClerk' );
		        var salePeriod = this.getSalePeriod() * 1000;
		        var terminalNo = GeckoJS.Session.get( 'terminal_no' );
		        
		        var shiftNumber = '';
				if ( !all )
					shiftNumber = this.getShiftNumber().toString();

		        reportController.printShiftChangeReport( salePeriod, salePeriod, shiftNumber, terminalNo );
		    } catch ( e ) {
		    } finally {
		    	if ( waitPanel ) waitPanel.hidePopup();
		    }
        },

        printDailySales: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to print daily sales report?' ) ) )
        		return;
        	
        	var waitPanel = this._showWaitPanel( 'wait_panel', 1000 );
        	
        	try {
		        var reportController = GeckoJS.Controller.getInstanceByName( 'RptSalesSummary' );
		        var salePeriod = this.getSalePeriod() * 1000;
		        var terminalNo = GeckoJS.Session.get( 'terminal_no' );

		        reportController.printSalesSummary( salePeriod, salePeriod, terminalNo, 'sale_period', '' );
		    } catch ( e ) {
		    } finally {
		    	if ( waitPanel ) waitPanel.hidePopup();
		    }
        },
        
        reviewShiftReport: function( all ) {
            var reportController = GeckoJS.Controller.getInstanceByName('RptCashByClerk');
            var salePeriod = this.getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get('terminal_no');

			var shiftNumber = '';
			if ( !all )
				shiftNumber = this.getShiftNumber().toString();
				
			var parameters = {
				start: salePeriod,
				end: salePeriod,
				shiftNo: shiftNumber,
				terminalNo: terminalNo
			};
		
			var waitPanel = this._showWaitPanel( 'wait_panel', 1000 );
			
			try {
				var processedTpl = reportController.getProcessedTpl( salePeriod, salePeriod, shiftNumber, terminalNo );
			} catch ( e ) {
			} finally {
				if ( waitPanel ) waitPanel.hidePopup();
			}					
		       
		    aURL = 'chrome://viviecr/content/rpt_cash_by_clerk.xul';
		    features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
		    window.openDialog( aURL, '', features, processedTpl, parameters );
        },

        reviewDailySales: function() {
            var reportController = GeckoJS.Controller.getInstanceByName( 'RptSalesSummary' );
            var salePeriod = this.getSalePeriod() * 1000;
            var terminalNo = GeckoJS.Session.get( 'terminal_no' );
            var periodType = 'sale_period';
            var shiftNo = '';
            
            var parameters = {
				start: salePeriod,
				end: salePeriod,
				periodtype: periodType,
				shiftno: shiftNo,
				machineid: terminalNo
			};

			var waitPanel = this._showWaitPanel( 'wait_panel', 1000 );
			
			try{
            	var processedTpl = reportController.getProcessedTpl( salePeriod, salePeriod, terminalNo, periodType, shiftNo );
            } catch ( e ) {
            } finally {
            	if ( waitPanel ) waitPanel.hidePopup();
            }
            
            aURL = 'chrome://viviecr/content/rpt_sales_summary.xul';
            features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            window.openDialog( aURL, '', features, processedTpl, parameters );
        },

        select: function(index){
            if (index >= 0) {
                var supplier = this._listDatas[index];
                this.requestCommand('view', supplier.id);
                this._listObj.selectedIndex = index;
            }
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
