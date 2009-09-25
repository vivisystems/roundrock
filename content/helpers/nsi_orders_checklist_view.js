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

            // data.Order data.OrderObject 
            var data = this.data[row];

            var tableSettings = this.getTableSettings();

            var seq = data.Order.sequence || '';
            var check_no = data.Order.check_no || '';
            var table_no = data.Order.table_no || '';

            var guest_num = data.Order.no_of_customers || '0';

            var subtotal = data.Order.total || '0';
            var clerk = data.Order.service_clerk_displayname || '';

            var transaction_created = data.Order.transaction_created * 1000 || (new Date()).getTime();

            var capacity = _("G#") + guest_num;

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
            btn.booking = seq ;
            btn.check_no = tableSettings.DisplayCheckNo ? check_no : '';
            btn.subtotal = /*tableSettings.DisplayTotal ? */ (subtotal || '');
            btn.capacity = tableSettings.DisplayCapacity ? capacity : '';
            btn.clerk = clerk;
            btn.period = (new Date(transaction_created)).toString("HH:mm");

            return;
        }

    });

})();

