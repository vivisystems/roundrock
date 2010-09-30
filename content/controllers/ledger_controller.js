(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

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

        _setLedgerEntry: function(data) {

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

        _createPaymentEntry: function(ledgerEntry) {

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

            return data;
        },

        expireData: function(evt) {
            var model = new LedgerRecordModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                try {
                    var r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup ledger activity logs (error code %S) [messages #801].', [model.lastError])};
                    }

                    r = model.clearExpireData(expireDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring ledger activity logs (error code %S) [messages #802].', [model.lastError])};
                    }

                    model = new LedgerReceiptModel();
                    r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup ledger receipts (error code %S) [messages #803].', [model.lastError])};
                    }

                    r = model.clearExpireData(expireDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring ledger receipts (error code %S) [messages #804].', [model.lastError])}
                    }
                }
                catch(e) {
                    this._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },

        truncateData: function(evt) {
            var model = new LedgerRecordModel();
            try {
                var r = model.restoreFromBackup();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all backup ledger activity logs (error code %S) [messages #805].', [model.lastError])};
                }

                r = model.execute('delete from ledger_records');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all ledger activity logs (error code %S) [messages #806].', [model.lastError])};
                }

                model = new LedgerReceiptModel();
                r = model.restoreFromBackup();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all backup ledger receipts (error code %S) [messages #807].', [model.lastError])};
                }

                r = model.execute('delete from ledger_receipts');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while revmoing all ledger receipts (error code %S) [messages #808].', [model.lastError])}
                }
            }
            catch(e) {
                model.rollback();
                this._dbError(e.errno, e.errstr, e.errmsg);
            }
        },

        // @return true if successful; false otherwise
        saveLedgerEntry: function(inputObj) {
            // create ledger entry object
            this._setLedgerEntry(inputObj);

            // save ledger entry
            var model = new LedgerRecordModel();
            model.create();
            var r = model.save(inputObj);
            if (!r) {
                // failed to save record to db/backup
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while saving ledger entry (error code %S) [messages #809].', [model.lastError]));
                return false;
            }
            inputObj.id = r.id;
            
            var paymentRecord = this._createPaymentEntry(r);
            model = new OrderPaymentModel();
            model.create();
            r = model.save(paymentRecord);

            if (!r) {
                // failed to save record to db/backup
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while saving ledger payment records (error code %S) [messages #810].', [model.lastError]));
                return false;
            }
            else {
                this.dispatchEvent('afterLedgerEntry', inputObj);
                return true;
            }
        },

        addLedgerEntryFromForm: function() {

            var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var features = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {}

            inputObj.entry_types = this.LedgerEntryType.find('all', {order: 'mode, type'});
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add Ledger Entry'), features, inputObj);

            if (inputObj.ok && inputObj.type != '' && !isNaN(inputObj.amount)) {

                if (this.saveLedgerEntry(inputObj)) {
                    OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                                   [inputObj.type + (inputObj.description ? ' (' + inputObj.description + ')' : ''), inputObj.amount]))
                    this.load();
                }
                else {
                    NotifyUtils.error(_('Failed to log transaction [%S] for amount of [%S] to the ledger',
                                      [inputObj.type + (inputObj.description ? ' (' + inputObj.description + ')' : ''), inputObj.amount]))
                }
            }
            
        },

        afterScaffoldIndex: function(evt) {

            // check db error
            var model = this.Scaffold.ScaffoldModel;
            if (parseInt(model.lastError) != 0) {
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while retrieving ledger records (error code %S) [messages #811].', [model.lastError]));
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
            if (mainWindow) {
                var cashdrawer = mainWindow.GeckoJS.Controller.getInstanceByName( 'CashDrawer' );
                if (cashdrawer) {
                    cashdrawer.openDrawerForLedgerEntry();
                }
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

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }


    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'LedgerRecords');
                                      });

    }, false);

})();

