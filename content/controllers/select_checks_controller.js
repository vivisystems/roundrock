(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'SelectChecks',

        _inputObj: null,
        
        getCheckListObj: function() {
            return  document.getElementById('checkScrollablepanel');
        },


        getOrders: function() {
            return this._inputObj.orders || [];
        },
        
        getTableSettings: function() {
            return this._inputObj.tableSettings || {};
        },

        getInputObj: function() {
            return this._inputObj;
        },

        initial: function(inputObj) {

            this._inputObj = inputObj;
            
            var checkListObj = this.getCheckListObj();

            var checkListView = new NSIOrdersCheckListView(this.getOrders());
            checkListView.setTableSettings(this.getTableSettings());

            checkListObj.datasource = checkListView ;

        },

        displaySummary: function(index) {
            var inputObj = this.getInputObj();
            if (index <0 ) {
                inputObj.order_id = '';
                return ;
            }

            var orders = this.getOrders();
            var order = orders[index];

            if(!order) {
                inputObj.order_id = '';
                return ;
            }

            // process display text
            if (!order['displayText']) {

                var orderObject = this.unserializeOrderObject(order.OrderObject.object);
//                this.log(this.dump(orderObject));
                var displayStr = "";
                var options = {
                    decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint'),
                    thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter'),
                    places: GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices')
                };


                displayStr += _("SEQ") + ": " + order.Order.sequence + "\n\n";

                for (var i in orderObject.display_sequences) {
                    let dispItem = orderObject.display_sequences[i];

                    if(dispItem && dispItem['type'] == 'item') {
                         displayStr += GeckoJS.String.padLeft(dispItem['current_qty'], 6, ' ') + '  ' + dispItem['name'] + '\n';
                    }
                }

                // displayStr += "\n\nTL: " + data.remain;
                displayStr += "\n\n" + _("TAL") + ": " + GeckoJS.NumberHelper.format(order.Order.total, options);

                order['displayText'] = displayStr;
            }

            var itemlistObj = document.getElementById('itemlist');
            itemlistObj.setAttribute('value', order['displayText']);

            inputObj.order_id = order.Order.id;

        },

        destroy: function() {
            delete this._viewHelper;
        },

        unserializeOrderObject: function(txt) {
            var obj = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(txt)));
            return obj;
        }

    };

    var SelectChecksController = window.SelectChecksController =  AppController.extend(__controller__);

})();
