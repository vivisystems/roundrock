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
                    this.dbError(model,
                                 _('An error was encountered while expiring ledger activity logs (error code %S)', [model.lastError]));
                }
            }
        },

        truncateData: function(evt) {
            var model = new LedgerRecordModel();
            var r = model.execute('delete from ledger_records');
            if (!r) {
                // log error and notify user
                this.dbError(model,
                             _('An error was encountered while expiring ledger activity logs (error code %S)', [model.lastError]));
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

        saveLedgerEntry: function(inputObj) {

            // create ledger entry object
            this.setLedgerEntry(inputObj);

            // save ledger entry
            var ledgerRecordModel = new LedgerRecordModel();
            inputObj = ledgerRecordModel.save(inputObj);
            if (!inputObj) {
                // log error and alert user
                this.dbError(ledgerRecordModel,
                             _('An error was encountered while logging ledger activity (error code %S)', [ledgerRecordModel.lastError]));
                return false;
            }

            // save payment entry
            this.savePaymentEntry(inputObj);

            this.dispatchEvent('afterLedgerEntry', inputObj);
            return true;
        },

        // save ledger payment record to db
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
            if (ledgerEntry.id) {
                var paymentEntry = orderPaymentModel.find('first', {
                    conditions: 'order_id = "' + ledgerEntry.id + '"'
                })
            }
            var r = orderPaymentModel.save(data);
            if (!r) {
                //@db saveToBackup
                //orderPaymentModel.saveToBackup(data);
                
                // log error
                this.log('ERROR',
                         _('An error was encountered while logging ledger payment (error code %S) - %S',
                           [orderPaymentModel.lastError, orderPaymentModel.lastErrorString]));
            }
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

            } else {
                evt.preventDefault();
            }
            
        },

        afterScaffoldAdd: function(evt) {
            // check if db error
            var model = this.Scaffold.ScaffoldModel;
            if (model.lastError) {
                this.dbError(model,
                             _('An error was encountered while logging ledger entry (error code %S)', [model.lastError]));
                NotifyUtils.error(_('Failed to add ledger entry'));
            }
            else {
                // add payment record
                this.savePaymentEntry(evt.data);
                
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
            if (model.lastError) {
                this.dbError(model,
                             _('An error was encountered while retrieving ledger records (error code %S)', [model.lastError]));
                NotifyUtils.error(_('Failed to retrieve ledger records'));
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

        dbError: function(model, alertStr) {
            this.log('ERROR', 'Database exception: ' + model.lastErrorString + ' [' +  model.lastError + ']');
            GREUtils.Dialog.alert(window,
                                  _('Data Operation Error'),
                                  alertStr);
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

