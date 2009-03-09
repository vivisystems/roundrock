(function(){

    /**
     */

    GeckoJS.Controller.extend( {
        name: 'LedgerRecords',
        scaffold: true,
        uses: ['LedgerEntryType'],

        _listObj: null,
        _listDatas: null,
        _index: 0,

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

            // save payment entry
            inputObj.payment_id = this.savePaymentEntry(inputObj).id;
            
            // save ledger entry
            var ledgerRecordModel = new LedgerRecordModel();
            inputObj.id = ledgerRecordModel.save(inputObj);
        },

        savePaymentEntry: function(ledgerEntry) {

            var data = {};

            if (ledgerEntry.mode == "IN") {
                data.total = ledgerEntry.amount;
            } else {
                data.total = ledgerEntry.amount * (-1);
            }

            // basic bookkeeping data
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

            var order = new OrderModel();
            return order.saveLedgerEntry(data);
        },

        deletePaymentEntry: function(ledgerEntry) {
            var order = new OrderModel();
            order.deleteLedgerEntry(ledgerEntry.payment_id);
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

                // add payment record
                evt.data.payment_id = this.savePaymentEntry(evt.data).id;
            } else {
                evt.preventDefault();
            }
            
        },

        afterScaffoldAdd: function(evt) {
            if (evt.data.id != '') {
                this._index = 0;
                this.load();

                //@todo OSD
                OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                               [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
            }
        },

        beforeScaffoldEdit: function(evt) {
            //alert(this.dump(evt));

        },

        afterScaffoldEdit: function(evt) {
            if (evt.data.id) {
                this.load();

                //@todo OSD
                OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully updated',
                               [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
            }
        },

        beforeScaffoldDelete: function(evt) {
            if (evt.data.id) {
                if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?')) == false) {
                    evt.preventDefault();
                }
                else {
                    this.deletePaymentEntry(evt.data);
                }
            }
            else {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function(evt) {
            if (this._index == this._listDatas.length - 1) {
                this._index--;
            }
            this.load();

            //@todo OSD
            OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully deleted from the ledger',
                           [evt.data.type + (evt.data.description ? ' (' + evt.data.description + ')' : ''), evt.data.amount]))
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
            }
            else {
                this.getListObj().selection.select(-1);
            }

            this.validateForm();
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
        },

        select: function(index){
            if (index >= 0) {
                var record = this._listDatas[index];

                this.requestCommand('view', record.id);
            }
            
            this.getListObj().selection.select(index);
            this._index = index;

            this.validateForm();
        },

        validateForm: function() {
            var index = this.getListObj().selectedIndex;
            var modBtn = document.getElementById('modify_entry');
            var delBtn = document.getElementById('delete_entry');

            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        }

    });


})();

