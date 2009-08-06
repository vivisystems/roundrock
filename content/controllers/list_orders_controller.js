(function(){

    /**
     * Class ViviPOS.JobsController
     */
    var __controller__ = {

        name: 'ListOrders',

        _inputData: null,

        _orders: [],

        _decimal: '.',

        _thousands: ',',

        _index: -1,
        
        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return s.replace( re, '\'\'' );
        },

        _formatPrice: function(price) {
            var options = {
                decimals: this._decimal,
                thousands: this._thousands,
                places: ((this._precision_prices>0)?this._precision_prices:0)
            };
            // format display precision
            return GeckoJS.NumberHelper.format(price, options);
        },

        load: function(inputObj) {

            this._inputData = inputObj;

            // load matching order(s)
            var conditions = '';
            var indices = inputObj.index.split(',');
            for (var i = 0; i < indices.length; i++) {
                if (inputObj.fuzzy) {
                    conditions += (conditions == '' ? '' : ' OR ') + '(' + indices[i] + " like '%" + this._queryStringPreprocessor(inputObj.value) + "%')";
                }
                else {
                    conditions += (conditions == '' ? '' : ' OR ') + '(' + indices[i] + " = '" + this._queryStringPreprocessor(inputObj.value) + "')";
                }
            }

            var localOnly = GeckoJS.Configure.read('vivipos.fec.settings.ViewLocalOrdersOnly') || false;
            
            if (localOnly) {
                conditions += " AND terminal_no = '" + this._queryStringPreprocessor(GeckoJS.Session.get('terminal_no')) + "'";
            }

            var orderModel = new OrderModel();
            var orders = orderModel.find('all', {
                fields: ['id',
                         'sequence',
                         'terminal_no',
                         'branch',
                         'branch_id',
                         'STRFTIME("%Y-%m-%d %H:%M",DATETIME("orders"."transaction_created", "unixepoch", "localtime")) as "Order.transaction_submitted"',
                         'status',
                         'precision_prices',
                         'total',
                         'qty_subtotal'],
                conditions: conditions,
                limit: 300,
                order: 'transaction_submitted desc',
                recursive: 0
            });
            if (parseInt(orderModel.lastError) != 0) {
                this._dbError(orderModel.lastError, orderModel.lastErrorString,
                              _('An error was encountered while retrieving list of matching orders (error code %S).', [orderModel.lastError]));
                return;
            }

            var tree = document.getElementById('orderscrollablepanel');
            var headers =         _('(view)submitted')
                          + ',' + _('(view)order sequence')
                          + ',' + _('(view)order status')
                          + ',' + _('(view)total')
                          + ',' + _('(view)items');
            var fields = 'transaction_submitted,sequence,status_str,total,qty_subtotal';
            if (!localOnly) {
                headers = _('(view)branch') + ',' + _('(view)terminal') + ',' + headers;
                fields = 'branch,terminal_no,' + fields;
            }

            tree.fields = fields;
            tree.headers = headers;

            tree.initTreecols();

            this._decimal = GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.';
            this._thousands = GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',';

            // list orders
            orders.forEach(function(order) {
                var statusStr = order.status;
                switch(parseInt(order.status)) {
                    case -2:
                        statusStr = _('(view)voided');
                        break;

                    case -1:
                        statusStr = _('(view)cancelled');
                        break;

                    case 1:
                        statusStr = _('(view)completed');
                        break;

                    case 2:
                        statusStr = _('(view)stored');
                        break;
                }
                order.status_str = statusStr;

                this._precision_prices = order.precision_prices;
                order.total = this._formatPrice(order.total);
            }, this);

            tree.datasource = orders;

            this._orders = orders;

            // search criteria
            var searchByLabelObj = document.getElementById('searchby');
            if (searchByLabelObj) {
                searchByLabelObj.value = inputObj.criteria;
            }
            
            // search for
            var searchForLabelObj = document.getElementById('searchfor');
            if (searchForLabelObj) {
                searchForLabelObj.value = '[' + inputObj.value + ']';
            }

            // record count
            var countLabelObj = document.getElementById('count');
            if (countLabelObj) {
                countLabelObj.value = orders.length;
            }
            
            // disable details button initially
            var detailsBtn = document.getElementById('details');
            detailsBtn.setAttribute('disabled', true);
        },

        validateForm: function(index) {
            var detailsBtn = document.getElementById('details');
            if (index > -1) {
                detailsBtn.setAttribute('disabled', false);
                this._index = index;
            }
            else {
                detailsBtn.setAttribute('disabled', true);
                this._index = -1;
            }
        },

        orderDetails: function() {

            var orderId;

            if (this._index > -1) {
                orderId = this._orders[this._index].id;
            }
            var aURL = 'chrome://viviecr/content/view_order.xul';
            var aName = _('Order Details');
            var aArguments = {index: 'id', value: orderId, orders: this._orders, position: this._index};
            var posX = 0;
            var posY = 0;
            var width = GeckoJS.Session.get('screenwidth');
            var height = GeckoJS.Session.get('screenheight');

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, aArguments);

            // reload list
            this.load(this._inputData);

            this.validateForm(this._index);
        },
        
        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();