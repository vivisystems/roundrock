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

        _getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('entryscrollablepanel');
            }
            return this._listObj;
        },

        expireData: function(evt) {
            var model = new LedgerRecordModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                try {
                    var r = model.begin();
                    if (r) {
                        r = model.execute('delete from ledger_records where created <= ' + expireDate);
                        if (!r) {
                            throw {errno: model.lastError,
                                   errstr: model.lastErrorString,
                                   errmsg: _('An error was encountered while expiring ledger activity logs (error code %S).', [model.lastError])};
                        }

                        model = new LedgerReceiptModel();
                        r = model.execute('delete from ledger_receipts where created <= ' + expireDate);
                        if (!r) {
                            throw {errno: model.lastError,
                                   errstr: model.lastErrorString,
                                   errmsg: _('An error was encountered while expiring ledger receipts (error code %S).', [model.lastError])}
                        }
                    }
                    else {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while preparing to expire ledger data (error code %S).', [model.lastError])}
                    }
                    model.commit();
                }
                catch(e) {
                    model.rollback();
                    this.dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },

        truncateData: function(evt) {
            var model = new LedgerRecordModel();
            try {
                var r = model.begin();
                if (r) {
                    r = model.execute('delete from ledger_records');
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while removing all ledger activity logs (error code %S).', [model.lastError])};
                    }

                    model = new LedgerReceiptModel();
                    r = model.execute('delete from ledger_receipts');
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while revmoing all ledger receipts (error code %S).', [model.lastError])}
                    }
                }
                else {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while preparing to remove all ledger data (error code %S).', [model.lastError])}
                }
                model.commit();
            }
            catch(e) {
                model.rollback();
                this.dbError(e.errno, e.errstr, e.errmsg);
            }
        },

        setLedgerEntry: function(data) {

            var salePeriod = GeckoJS.Session.get('sale_period');
            var shiftNumber = GeckoJS.Session.get('shift_number');

            var user = new GeckoJS.AclComponent().getUserPrincipal();
            data.service_clerk = (user) ? user.username : '';
            data.service_clerk_displayname = (user) ? user.description : '';

            data.id = '';

            data.terminal_no = GeckoJS.Session.get('terminal_no');
            if (!('sale_period' in data)) data.sale_period = salePeriod;
            if (!('shift_number' in data)) data.shift_number = shiftNumber;
        },

        saveLedgerEntry: function(inputObj) {
            // create ledger entry object
            this.setLedgerEntry(inputObj);

            // save ledger entry
            var ledgerRecordModel = new LedgerRecordModel();

            //ledgerRecordModel.saveToBackup(inputObj);
            ledgerRecordModel.saveLedgerEntry(inputObj);
            inputObj.ledger_id = inputObj.id;
            this.savePaymentEntry(inputObj);

            this.dispatchEvent('afterLedgerEntry', inputObj);
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
            orderPaymentModel.saveLedgerPayment(data);
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
            if (evt.data.id) {
                // add payment record
                this.savePaymentEntry(evt.data);
                this._index = 0;

                //@todo OSD
                OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                               [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
                this.load();
            }
            else {
                //@todo OSD
                NotifyUtils.error(_('Failed to log transaction [%S] for amount of [%S] to the ledger',
                                 [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
            }
        },

        afterScaffoldIndex: function(evt) {

            // check db error
            var model = this.Scaffold.ScaffoldModel;
            if (parseInt(model.lastError) != 0) {
                this.dbError(model.lastError, model.lastErrorString,
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

                this._getListObj().datasource = panelView;

                if (this._listDatas.length > 0) {
                    this._getListObj().selection.select(this._index);
                    this._getListObj().treeBoxObject.ensureRowIsVisible(this._index);
                }
                else {
                    this._getListObj().selection.select(-1);
                }
            }
        },

        openDrawerForLedgerEntry: function() {

            // retrieve handle to cashdrawer controller
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var cashdrawer = mainWindow.GeckoJS.Controller.getInstanceByName( 'CashDrawer' );
            if (cashdrawer) {
                this.requestCommand('openDrawerForLedgerEntry', null, cashdrawer);
            }
        },

        load: function() {
            GeckoJS.FormHelper.reset('ledger_recordForm');

            var showtype = document.getElementById('show_type').value;

            var salePeriod = GeckoJS.Session.get('sale_period');
            var shiftNumber = GeckoJS.Session.get('shift_number');

            var filter = 'sale_period=' + salePeriod + ' AND shift_number=' + shiftNumber;

            if (showtype == 'IN') filter += ' AND mode="IN"';
            else if (showtype == 'OUT') filter += ' AND mode="OUT"';


            this.requestCommand('list', {
                conditions: filter,
                order: 'created desc',
                index: this._index
            });

            this._getListObj().treeBoxObject.ensureRowIsVisible(this._index);
        },

        select: function(index){
            if (index >= 0) {
                var record = this._listDatas[index];

                this.requestCommand('view', record.id);
            }
            
            this._getListObj().selection.select(index);
            this._getListObj().treeBoxObject.ensureRowIsVisible(index);
            this._index = index;
        },

        dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database exception: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(window,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
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

