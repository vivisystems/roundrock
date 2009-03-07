(function(){

    /**
     * ShiftChangesController
     */

    GeckoJS.Controller.extend( {
        name: 'ShiftChanges',

        _listObj: null,
        _listDatas: null,

        initial: function() {
            // set current sales period and shift number
            this.updateSession();

            this.startShift();
        },

        load: function(data) {
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

        getStartTime: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.created : null;
        },

        getEndOfPeriod: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_period : null;
        },

        getEndOfShift: function() {
            var shift = GeckoJS.Session.get('current_shift');
            return (shift) ? shift.end_of_shift : null;
        },

        updateSession: function(currentShift) {
            var shiftNumber = '';
            var salePeriod = '';
            var endOfPeriod = false;
            var starttime = '';

            if (!currentShift)
                currentShift = this.getShiftMarker();

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
            
            if (shift) {
                newShiftMarker.id = shift.id;
                shiftMarkerModel.id = shift.id;
            }
            shiftMarkerModel.save(newShiftMarker);

            this.updateSession(newShiftMarker);
        },

        // this is invoked right after initialLogin
        startShift: function() {

            // track sale period?
            if (GeckoJS.Configure.read('vivipos.fec.settings.TrackSalePeriod')) {

                // does sale period exist?
                var newSalePeriod;
                var newShiftNumber;
                var lastSalePeriod = this.getSalePeriod();
                var lastShiftNumber = this.getShiftNumber();
                var endOfPeriod = this.getEndOfPeriod();
                var endOfShift = this.getEndOfShift();

                // no last shift?
                if (lastSalePeriod == '') {
                    // insert new sale period with today's date;
                    newSalePeriod = new Date().clearTime();
                    newShiftNumber = 1;
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
                }
                // has last shift ended?
                else if (endOfShift) {
                    newShiftNumber = lastShiftNumber + 1;
                }
                // continue last shift
                else {
                    newSalePeriod = lastSalePeriod;
                    newShiftNumber = lastShiftNumber;
                }
                this.setShift(newSalePeriod, newShiftNumber, false, false);

                // display current shift / last shift information

                this.ShiftDialog(new Date(newSalePeriod * 1000).toLocaleDateString(), newShiftNumber,
                                 lastSalePeriod == '' ? '' : new Date(lastSalePeriod * 1000).toLocaleDateString(), lastShiftNumber );
            }
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
            var aFeatures = 'chrome,dialog,modal,centerwindow,dependent=yes,resize=no,width=' + width + ',height=' + height;
            GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures, aArguments);
        },

        shiftChange: function(endOfPeriod) {
            //
            var salePeriod = this.getSalePeriod();
            var shiftNumber = this.getShiftNumber();
            var starttime = this.getStartTime();
            var endtime = new Date();
            var terminal_no = GeckoJS.Session.get('terminal_no');
            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            var orderPayment = new OrderPaymentModel();

            // first, we collect payment totals for credit cards, coupons, and giftcard
            var fields = ['order_payments.modified',
                          'order_payments.memo1 as "OrderPayment.name"',
                          'order_payments.name as "OrderPayment.type"',
                          'COUNT(order_payments.name) as "OrderPayment.count"',
                          'SUM("order_payments"."origin_amount" - "order_payments"."change") as "OrderPayment.origin_amount"',
                          'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            var conditions = "orders.sale_period = " + salePeriod +
                             " AND orders.shift_number = " + shiftNumber +
                             " AND orders.terminal_no = '" + terminal_no + "'" +
                             " AND (order_payments.name = 'creditcard' OR order_payments.name = 'coupon' OR order_payments.name = 'giftcard')";
            var groupby = 'order_payments.memo1';
            var orderby = 'order_payments.memo1, "OrderPayment.type"';
            var creditCardCouponDetails = orderPayment.find('all', {fields: fields,
                                                                    conditions: conditions,
                                                                    group: groupby,
                                                                    order: orderby,
                                                                    recursive: 1
                                                                   });
            alert(this.dump(creditCardCouponDetails));
            this.log(this.dump(creditCardCouponDetails));

            // next, we collect payment totals for personal checks
            fields = ['order_payments.modified',
                      'order_payments.name',
                      'order_payments.name as "OrderPayment.type"',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM("order_payments"."origin_amount" - "order_payments"."change") as "OrderPayment.origin_amount"',
                      'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            conditions = "orders.sale_period = " + salePeriod +
                         " AND orders.shift_number = " + shiftNumber +
                         " AND orders.terminal_no = '" + terminal_no + "'" +
                         " AND order_payments.name = 'check'";
            groupby = 'order_payments.name';
            var checkDetails = orderPayment.find('all', {fields: fields,
                                                         conditions: conditions,
                                                         group: groupby,
                                                         order: orderby,
                                                         recursive: 1
                                                        });

            alert(this.dump(checkDetails));
            this.log(this.dump(checkDetails));

            // next, we collect payment totals for cash in local denominations
            fields = ['order_payments.modified',
                      'order_payments.name',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM("order_payments"."origin_amount" - "order_payments"."change") as "OrderPayment.origin_amount"',
                      'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            conditions = "orders.sale_period = " + salePeriod +
                         " AND orders.shift_number = " + shiftNumber +
                         " AND orders.terminal_no = '" + terminal_no + "'" +
                         " AND order_payments.name = 'cash' AND order_payments.memo1 is NULL";
            groupby = 'order_payments.name';
            var localCashDetails = orderPayment.find('all', {fields: fields,
                                                             conditions: conditions,
                                                             group: groupby,
                                                             order: orderby,
                                                             recursive: 1
                                                            });

            alert(this.dump(localCashDetails));
            this.log(this.dump(localCashDetails));

            // next, we collect payment totals for cash in foreign denominations
            fields = ['order_payments.modified',
                      'order_payments.memo1 as "OrderPayment.name"',
                      'order_payments.name as "OrderPayment.type"',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM("order_payments"."origin_amount") as "OrderPayment.amount"',
                      'SUM(- "order_payments"."change") as "OrderPayment.origin_amount"'];
            conditions = "orders.sale_period = " + salePeriod +
                         " AND orders.shift_number = " + shiftNumber +
                         " AND orders.terminal_no = '" + terminal_no + "'" +
                         " AND order_payments.name = 'cash' AND NOT (order_payments.memo1 is NULL)";
            orderby = 'order_payments.memo1, "OrderPayment.type"';
            var foreignCashDetails = orderPayment.find('all', {fields: fields,
                                                               conditions: conditions,
                                                               group: groupby,
                                                               order: orderby,
                                                               recursive: 1
                                                              });

            alert(this.dump(foreignCashDetails));
            this.log(this.dump(foreignCashDetails));
return;
            // lastly, we collect payment totals from ledger entries
            fields = ['order_payments.modified',
                      'order_payments.memo1 as "OrderPayment.name"',
                      'order_payments.name as "OrderPayment.type"',
                      'COUNT(order_payments.name) as "OrderPayment.count"',
                      'SUM("order_payments"."origin_amount" - "order_payments"."change") as "OrderPayment.origin_amount"',
                      'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            conditions = "orders.sale_period = " + salePeriod +
                         " AND orders.shift_number = " + shiftNumber +
                         " AND orders.terminal_no = '" + terminal_no + "'" +
                         " AND order_payments.name = 'ledger'";
            groupby = 'order_payments.memo1';
            orderby = 'order_payments.memo1, "OrderPayment.type"';
            var ledgerDetails = orderPayment.find('all', {fields: fields,
                                                          conditions: conditions,
                                                          group: groupby,
                                                          order: orderby,
                                                          recursive: 1
                                                         });
            alert(this.dump(ledgerDetails));
            this.log(this.dump(ledgerDetails));

            return;
            
            // computer cash amount
            var amount = orderPayment.find('first', {
                fields: ['SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'],
                conditions: conditions
            });
            
            var clerk = '';
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
            }
            
            var data = {
                starttime: starttime,
                endtime: endtime,
                amount: amount.amount,
                clerk: clerk,
                note: '',
                detail: detail
            }

            var aURL = 'chrome://viviecr/content/prompt_doshiftchange.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=450';
            var inputObj = {
                shiftchange:data
            };

            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            inputObj.entry_types = ledgerEntryTypeModel.find('all');

            window.openDialog(aURL, _('Shift Change'), features, inputObj);

            var amt = parseFloat(inputObj.amount);
            if (inputObj.ok) {
                data.note = inputObj.description;

                if (amt < 0) {
                    NotifyUtils.warn(_('You may not leave negative amount of cash in the cashdrawer'));
                    return;
                }
                else if (amt > 0) {
                    inputObj.type = 'OUT';
                    inputObj.topic = '**** WHAT TXN TYPE TO USE??? ****';
                    this.requestCommand('accounting', inputObj, 'Cart');

                    data.amount = data.amount - amt;
                    data.detail.push({name:inputObj.topic, memo1: 'OUT', amount: amt * (-1)});

                }
                data.endtime = (new Date()).getTime() / 1000;

                // do shift change
                var shiftChangeModel = new ShiftChangeModel();
                shiftChangeModel.saveShiftChange(data);

                if (!endOfPeriod) {
                    shiftNumber++;
                }
                this.setShift(salePeriod, shiftNumber, endOfPeriod);

                if (amt > 0) {
                    inputObj.type = "IN";
                    this.requestCommand('accounting', inputObj, 'Cart');
                }

                NotifyUtils.info(_('shift change completed'));
            }
        },

        select: function(index){
            if (index >= 0) {
                var supplier = this._listDatas[index];
                this.requestCommand('view', supplier.id);
                this._listObj.selectedIndex = index;
            }
        }

    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitialLogin', function() {
                                            main.requestCommand('initial', null, 'ShiftChanges');
                                      });

    }, false);

})();

