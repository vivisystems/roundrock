(function(){
    /**
     * Tables View is support for controll panel  maintaince use.
     **/
    var NSIOrdersCheckListView = window.NSIOrdersCheckListView = GeckoJS.NSITreeViewArray.extend( {

        name: 'NSIOrdersCheckListView',

        tableSettings: null,

        init: function(data) {

            this._data = data || [];
        },

        setTableSettings: function(settings) {
            this.tableSettings = settings;
        },

        getTableSettings: function() {
            return this.tableSettings;            
        },

        getCellText: function(row,col) {
           let orderCol = col.id;
           let value = "";
           switch(orderCol) {
               default:
                   if(this.data[row]['Order']) {
                       value = this.data[row]['Order'][orderCol];
                   }
                   break;
           }
           return value;
        },

        renderButton: function(row, btn) {
            if (!this.data[row]) return;

            var options = {
                decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint'),
                thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter'),
                places: GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices')
            };

            // data.Order data.OrderObject 
            var data = this.data[row];

            var seq = data.Order.sequence || '';
            var check_no = data.Order.check_no || '';
            var table_no = data.Order.table_no || '';

            var subtotal = GeckoJS.NumberHelper.format((data.Order.total || '0'), options);
            var clerk = data.Order.service_clerk_displayname || '';

            var transaction_created = data.Order.transaction_created * 1000 || (new Date()).getTime();

            if (check_no != "") check_no = _("C#") + check_no;

            if (seq != "") {
                seq = _("S#") + seq;
                subtotal = _("T#") + subtotal;
                btn.setPeriodStatus(0);
            } else {
                btn.setPeriodStatus(0);
                btn.setCapacityStatus(0);
            }

            btn.table_no = table_no ;
            btn.checks = "";
            btn.seq_no = /*tableSettings.DisplaySeqNo ? */ (seq || '');
            btn.booking = "";
            btn.check_no = /*tableSettings.DisplayCheckNo ?*/ (check_no || '');
            btn.subtotal = /*tableSettings.DisplayTotal ? */ (subtotal || '');
            btn.capacity = ""; //tableSettings.DisplayCapacity ? capacity : '';
            btn.clerk = clerk;
            btn.period = (new Date(transaction_created)).toString("HH:mm");

            return;
        }

    });

})();

