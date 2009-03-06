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

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {

            var shiftController = GeckoJS.Controller.getInstanceByName('ShiftChanges');

            var sale_period = shiftController.getSalePeriod();
            var shift_number = shiftController.getShiftNumber();

            var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {}
            
            inputObj.entry_types = this.LedgerEntryType.find('all');

            window.openDialog(aURL, _('Add Ledger Entry'), features, inputObj);

            if (inputObj.ok) {

                $('#ledger_id').val('');
                evt.data.id = '';
                evt.data.entry_type = inputObj.type;
                evt.data.description = inputObj.description;
                evt.data.entry_mode = inputObj.mode;
                evt.data.amount = inputObj.amount;
                evt.data.terminal_no = GeckoJS.Session.get('terminal_no');
                evt.data.shift_number = shift_number;
                evt.data.sale_period = sale_period;
            } else {
                evt.preventDefault();
            }
            
        },

        /*
        afterScaffoldAdd: function(evt) {

        },
        */

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

