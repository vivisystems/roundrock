(function(){

    /**
     */

    var __controller__ = {
        name: 'LedgerRecords',

        scaffold: true,
        
        uses: ['LedgerEntryType'],

        _listObj: null,
        _listDatas: null,
        _index: 0,

        initial: function () {

            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterClearOrderData', this.expireData, this);
                main.addEventListener('afterTruncateTxnRecords', this.truncateData, this);
            }
        },

        expireData: function(evt) {
            var model = new LedgerRecordModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                var r = model.execute('delete from ledger_records where created <= ' + expireDate);
                if (!r) {
                    // log error and notify user
                    this.dbError(model.lastError, model.lastErrorString,
                                 _('An error was encountered while expiring ledger activity logs (error code %S).', [model.lastError]));
                }
            }
        },

        truncateData: function(evt) {
            var model = new LedgerRecordModel();
            var r = model.execute('delete from ledger_records');
            if (!r) {
                // log error and notify user
                this.dbError(model.lastError, model.lastErrorString,
                             _('An error was encountered while removing all ledger activity logs (error code %S).', [model.lastError]));
            }
        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('entryscrollablepanel');
            }
            return this._listObj;
        },

        setLedgerEntry: function(data) {

            var shiftController = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            var salePeriod = shiftController.getSalePeriod();
            var shiftNumber = shiftController.getShiftNumber();

            var user = new GeckoJS.AclComponent().getUserPrincipal();
            data.service_clerk = (user) ? user.username : '';
            data.service_clerk_displayname = (user) ? user.description : '';

            data.id = '';

            data.terminal_no = GeckoJS.Session.get('terminal_no');
            data.sale_period = salePeriod;
            data.shift_number = shiftNumber;
        },

        saveLedgerEntry: function(inputObj, nonAtomic) {

            // create ledger entry object
            this.setLedgerEntry(inputObj);

            // save ledger entry
            var ledgerRecordModel = new LedgerRecordModel();

            if (!nonAtomic) {
                ledgerRecordModel.begin();
            }
            var r = ledgerRecordModel.save(inputObj);
            if (r) {
                r =  this.savePaymentEntry(inputObj);
            }

            if (r && !nonAtomic) {
                r = ledgerRecordModel.commit();
            }

            if (!r) {
                // log error and alert user
                var errNo = ledgerRecordModel.lastError;
                var errMsg = ledgerRecordModel.lastErrorString;

                if (!nonAtomic) ledgerRecordModel.rollback();

                this.dbError(errNo, errMsg,
                             _('An error was encountered while logging ledger activity (error code %S).', [errNo]));


                return false;
            }
            else {
                this.dispatchEvent('afterLedgerEntry', inputObj);
                return true;
            }
        },

        savePaymentEntry: function(ledgerEntry) {

            var data = {};

            if (ledgerEntry.mode == "IN") {
                data.total = ledgerEntry.amount;
            } else {
                data.total = ledgerEntry.amount * (-1);
            }

            // basic bookkeeping data
            data['order_id'] = ledgerEntry.id;
            data['amount'] = data.total;
            data['name'] = 'ledger'; // + payment type
            data['memo1'] = ledgerEntry.type; // ledger entry type
            data['memo2'] = ledgerEntry.description; // description
            data['change'] = 0;

            data['service_clerk'] = ledgerEntry.service_clerk;
            data['service_clerk_displayname'] = ledgerEntry.service_clerk_displayname;

            data['sale_period'] = ledgerEntry.sale_period;
            data['shift_number'] = ledgerEntry.shift_number;
            data['terminal_no'] = ledgerEntry.terminal_no;

            var orderPaymentModel = new OrderPaymentModel();
            var r = orderPaymentModel.save(data);
            if (!r) {
                // log error
                this.dbError(orderPaymentModel.lastError, orderPaymentModel.lastErrorString,
                             _('An error was encountered while logging ledger payment (error code %S).', [orderPaymentModel.lastError]));
            }
            return r;
        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {

            var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {}

            inputObj.entry_types = this.LedgerEntryType.find('all', {order: 'mode, type'});
            
            window.openDialog(aURL, _('Add Ledger Entry'), features, inputObj);

            if (inputObj.ok && inputObj.type != '' && !isNaN(inputObj.amount)) {

                $('#ledger_id').val('');

                GREUtils.extend(evt.data, inputObj);
                this.setLedgerEntry(evt.data);

                this.Scaffold.ScaffoldModel.begin();

            } else {
                evt.preventDefault();
            }
            
        },

        afterScaffoldAdd: function(evt) {
            // check if db error
            var model = this.Scaffold.ScaffoldModel;
            var r = !(parseInt(model.lastError) != 0);

            if (r) {
                // add payment record
                r = this.savePaymentEntry(evt.data);
            }

            if (r) {
                r = model.commit();
            }

            if (!r) {
                var errNo = model.lastError;
                var errMsg = model.lastErrorString;

                model.rollback();

                this.dbError(errNo, errMsg,
                             _('An error was encountered while logging ledger payment (error code %S).', [errNo]));
            }
            else {
                this._index = 0;
                this.load();

                //@todo OSD
                OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                               [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
            }
        },

        afterScaffoldIndex: function(evt) {

            // check db error
            var model = this.Scaffold.ScaffoldModel;
            if (parseInt(model.lastError) != 0) {
                this.dbError(model,
                             _('An error was encountered while retrieving ledger records (error code %S).', [model.lastError]));
            }
            else {
                this._listDatas = evt.data;
                var panelView =  new GeckoJS.NSITreeViewArray(evt.data);
                panelView.getCellValue= function(row, col) {

                    var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
                    var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
                    var text;
                    if (col.id == 'amount') {

                        // text = this.data[row].amount;
                        text = GeckoJS.NumberHelper.round(this.data[row].amount, precision_prices, rounding_prices) || 0;

                    }
                    else if (col.id == 'created') {
                        var date = new Date(this.data[row].created * 1000)
                        text = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                    }
                    else if (col.id == 'mode') {
                        text = _(this.data[row][col.id]);
                    }
                    else {
                        text = this.data[row][col.id];
                    }
                    return text;
                };

                this.getListObj().datasource = panelView;

                if (this._listDatas.length > 0) {
                    this.getListObj().selection.select(this._index);
                    this.getListObj().treeBoxObject.ensureRowIsVisible(this._index);
                }
                else {
                    this.getListObj().selection.select(-1);
                }
            }
        },

        load: function() {
            GeckoJS.FormHelper.reset('ledger_recordForm');

            var showtype = document.getElementById('show_type').value;

            var shiftController = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            var sale_period = shiftController.getSalePeriod();
            var shift_number = shiftController.getShiftNumber();

            var filter = 'sale_period=' + sale_period + ' AND shift_number=' + shift_number;

            if (showtype == 'IN') filter += ' AND mode="IN"';
            else if (showtype == 'OUT') filter += ' AND mode="OUT"';


            this.requestCommand('list', {
                conditions: filter,
                order: 'created desc',
                index: this._index
            });

            this.getListObj().treeBoxObject.ensureRowIsVisible(this._index);
        },

        select: function(index){
            if (index >= 0) {
                var record = this._listDatas[index];

                this.requestCommand('view', record.id);
            }
            
            this.getListObj().selection.select(index);
            this.getListObj().treeBoxObject.ensureRowIsVisible(index);
            this._index = index;
        },

        dbError: function(errNo, errMsg, alertStr) {
            this.log('ERROR', 'Database exception: ' + errMsg + ' [' +  errNo + ']');
            GREUtils.Dialog.alert(null,
                                  _('Data Operation Error'),
                                  alertStr + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }


    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'LedgerRecords');
                                      });

    }, false);


})();

