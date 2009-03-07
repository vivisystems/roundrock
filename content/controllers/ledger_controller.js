(function(){

    /**
     */

    GeckoJS.Controller.extend( {
        name: 'LedgerRecords',
        scaffold: true,
        uses: ['LedgerEntryType'],

        _listObj: null,
        _listDatas: null,

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
            inputObj.id = ledgerRecordModel.save(inputObj);

            // save payment entry
            this.savePaymentEntry(inputObj);
        },

        savePaymentEntry: function(ledgerEntry) {

            var data = {};

            if (ledgerEntry.mode == "IN") {
                data.total = ledgerEntry.amount;
                data.status = 101; // Accounting IN
            } else {
                data.total = ledgerEntry.amount * (-1);
                data.status = 102; // Accounting OUT
            }

            // basic bookkeeping data
            data.ledgerPayment['amount'] = data.total;
            data.ledgerPayment['name'] = 'ledger'; // + payment type
            data.ledgerPayment['memo1'] = ledgerEntry.type; // ledger entry type
            data.ledgerPayment['memo2'] = ledgerEntry.description; // description
            data.ledgerPayment['change'] = 0;

            data.ledgerPayment['service_clerk'] = ledgerEntry.service_clerk;
            data.ledgerPayment['service_clerk_displayname'] = ledgerEntry.service_clerk_displayname;

            data.ledgerPayment['sale_period'] = ledgerEntry.sale_period;
            data.ledgerPayment['shift_number'] = ledgerEntry.shift_number;
            data.ledgerPayment['terminal_no'] = ledgerEntry.terminal_no;

            var order = new OrderModel();
            order.saveLedgerEntry(data);

            return data;

        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {

            var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {}
            
            inputObj.entry_types = this.LedgerEntryType.find('all');

            window.openDialog(aURL, _('Add Ledger Entry'), features, inputObj);

            if (inputObj.ok) {

                $('#ledger_id').val('');

                this.setLedgerEntry(evt.inputObj, inputObj);
            } else {
                evt.preventDefault();
            }
            
        },

        afterScaffoldAdd: function(evt) {
            // add payment record
            this.savePaymentEntry(evt.data);
        },

        createPaymentForLedger: function(data) {

        },

        beforeScaffoldSave: function(evt) {
            //alert(this.dump(evt));

        },

        afterScaffoldSave: function(evt) {
            this.load(evt.data);
        },

        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?')) == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function() {
            this.load();
        },


        afterScaffoldIndex: function(evt) {
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
                else if (col.id == 'entry_mode') {
                    text = _(this.data[row][col.id]);
                }
                else {
                    text = this.data[row][col.id];
                }
                return text;
            };

            this.getListObj().datasource = panelView;

            if (this._listDatas.length > 0)
                this.getListObj().vivitree.selection.select(0);
            else
                this.getListObj().vivitree.selection.clear();
        },

        load: function() {
            var showtype = document.getElementById('show_type').value;

            var shiftController = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            var sale_period = shiftController.getSalePeriod();
            var shift_number = shiftController.getShiftNumber();

            var filter = 'sale_period=' + sale_period + ' AND shift_number=' + shift_number;

            if (showtype == 'IN') filter += ' AND entry_mode="IN"';
            else if (showtype == 'OUT') filter += ' AND entry_mode="OUT"';

            this.requestCommand('list', {
                conditions: filter,
                index: 0
            });
        },

        select: function(index){
            if (index >= 0) {
                var record = this._listDatas[index];

                this.requestCommand('view', record.id);
                this._listObj.selectedIndex = index;
            }
        }

    });


})();

