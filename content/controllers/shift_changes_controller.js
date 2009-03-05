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

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('supplierscrollablepanel');
            }
            return this._listObj;
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
            return GeckoJS.Session.get('shift_starttime');
        },

        getEndOfPeriod: function() {
            return GeckoJS.Session.get('end_of_period');
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
                endOfPeriod = currentShift.end_of_period;
                starttime = currentShift.starttime;
            }
            GeckoJS.Session.set('shift_number', shiftNumber);
            GeckoJS.Session.set('shift_starttime', starttime);
            GeckoJS.Session.set('sale_period', salePeriod);
            GeckoJS.Session.set('end_of_period', endOfPeriod);
            GeckoJS.Session.set('sale_period_string', salePeriod == '' ? '' : new Date(salePeriod * 1000).toLocaleDateString());
        },


        setShift: function(salePeriod, shiftNumber, endOfPeriod) {
            var shiftMarkerModel = new ShiftMarkerModel();

            var newShiftMarker = {
                terminal_no: GeckoJS.Session.get('terminal_no'),
                sale_period: salePeriod,
                shift_number: shiftNumber,
                end_of_period: endOfPeriod
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

                // no last shift?
                if (lastSalePeriod == '') {
                    // insert new sale period with today's date;
                    newSalePeriod = new Date().clearTime();
                    newShiftNumber = 1;

                    this.setShift(newSalePeriod, newShiftNumber, false);
                }

                // is last shift the end of the last sale period
                else if (endOfPeriod) {

                    // set current sale period to the greater of
                    // today's date and last sale period + 1 day
                    var today = new Date().clearTime();
                    var lastSalePeriodPlusOne = lastSalePeriod.add({days: 1}).clearTime();
                    if (lastSalePeriod == '' || (today > lastSalePeriodPlusOne)) {
                        newSalePeriod = today;
                    }
                    else {
                        newSalePeriod = lastSalePeriodPlusOne;
                    }

                    newShiftNumber = 1;
                    
                    this.setShift(newSalePeriod, newShiftNumber, false);
                }
                // continue last shift
                else {
                    newSalePeriod = lastSalePeriod;
                    newShiftNumber = lastShiftNumber;
                }

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
            
            var fields = ['order_payments.modified',
                            'order_payments.name',
                            'order_payments.memo1',
                            'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            var conditions = "orders.sale_period = " + salePeriod + " AND orders.shift_number = " + shiftNumber + " AND orders.terminal_no = '" + terminal_no + "'";
            var groupby = '"order_payments"."name" , "order_payments"."memo1"';
            var orderby = 'order_payments.name';
            var orderPayment = new OrderPaymentModel();
            var detail = orderPayment.find('all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: 1
            });
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

            var aURL = "chrome://viviecr/content/prompt_doshiftchange.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=500,height=450";
            var inputObj = {
                input0:null,
                input1:null,
                topics:null,
                shiftchange:data
            };

            var accountTopic = new AccountTopicModel();
            inputObj.topics = accountTopic.find('all');

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

