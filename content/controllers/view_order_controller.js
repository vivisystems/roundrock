(function(){

    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var __controller__ = {

        name: 'ViewOrder',

        template: 'order_template',
        _orderId: null,
        _orderData: null,
        _orders: [],
        _index: -1,
        _locked: false,

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return (s == null || s.length == 0) ? '' : s.replace( re, '\'\'' );
        },

        load: function(inputObj) {

            // store global data
            this._orders = inputObj.orders;
            this._index = inputObj.position;

            this.displayOrder(this._orders[this._index].id);
        },

        prevOrder: function() {
            if (this._index > 0) {
                this.displayOrder(this._orders[--this._index].id);
            }
        },

        nextOrder: function() {
            if (this._index < this._orders.length) {
                this.displayOrder(this._orders[++this._index].id);
            }
        },

        displayOrder: function (id) {

            if (!id) return;
            
            // get browser content body
            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById( 'abody' );
            var print = document.getElementById('print');
            var report = document.getElementById('report');
            var orderObj = document.getElementById('order');
            
            var orderModel = new OrderModel();
            var order = orderModel.findById(id, 2);
            if (parseInt(orderModel.lastError) != 0) {
                this._dbError(orderModel.lastError, orderModel.lastErrorString,
                              _('An error was encountered while retrieving details of the selected order (error code %S) [message #1901].', [orderModel.lastError]));
                return;
            }
            
            if (order) {
                // display order status
                var branch = (order.branch == null || order.branch == '') ? ((order.branch_id == null || order.branch_id == '') ? '' : order.branch_id)
                                                                          : order.branch + ((order.branch_id == null || order.branch_id == '') ? '' : ' (' + order.branch_id + ')');
                var location = (branch == null || branch == '') ? order.terminal_no : (branch + ' [' + order.terminal_no + ']');
                var statusStr = '';
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

                orderObj.value = order.sequence + ' [' + statusStr + '] ' + location;

                // load template
                var path = GREUtils.File.chromeToPath('chrome://viviecr/content/tpl/' + this.template + '.tpl');
                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

                var data = {};
                data.order = order;
                data.sequence = order.sequence;

                this._orderData = data;

                var result = tpl.process(data);

                if (doc) {
                    doc.innerHTML = result;

                    report.setAttribute('disabled', false);
                    if (order.status == -2 || order.status == 1) {
                        print.setAttribute('disabled', false);
                    }
                }

                this._orderId = id;
            }
            else {
                orderObj.value = _('Order not found');
            }
            this.validateForm(order);
        },

        exportRcp: function() {
            if ( !GREUtils.Dialog.confirm(this.topmostWindow, '', _( 'Are you sure you want to print this order?' ) ) )
                return;

            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );

            var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/tpl/' + this.template + '_' + paperSize + '.tpl');

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

            rcp.printReport( 'report', tpl, this._orderData );
        },

        reprintReceipt: function() {
            if ( !GREUtils.Dialog.confirm(this.topmostWindow, '', _( 'Are you sure you want to issue a receipt copy for this order?' ) ) )
                return;

            let orderModel = new OrderModel();
            let orderData = orderModel.readOrder(this._orderId, true); // recall use master service's datas.

            if (!orderData) {
                NotifyUtils.error(_('This order object does not exist [%S]', [this._orderId]));
                return false;
            }

            if (orderData.Order.status != 1 && orderData.Order.status != -2) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Reprint Receipt'),
                                      _('Only completed and voided orders may be reprinted'));
                return false;
            }

            let data = orderModel.mappingOrderDataToTranData(orderData);

            this.log('DEBUG', this.dump(orderData));
            this.log('DEBUG', this.dump(data));

            var txn = new Transaction(true);
            txn.data  = data;

            // temporarily remove customer from Session
            let customer = GeckoJS.Session.get('current_customer');
            if (customer) {
                GeckoJS.Session.remove('current_customer');
            }

            let mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            let rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );

            rcp.issueReceiptCopy(null, txn);

            // restore customer
            if (customer) {
                GeckoJS.Session.set('current_customer', customer);
            }
        },

        voidSale: function() {

            var id = this._orderId;

            if (!id) return;

            // invoke Cart.voidSale in main window
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                                                    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var cartController = mainWindow.GeckoJS.Controller.getInstanceByName('Cart');
            if (cartController.voidSale(id)) {
                this.displayOrder(id);
            }
        },

        validateForm: function(order) {
            var nextbtn = document.getElementById('next');
            var prevbtn = document.getElementById('prev');
            var voidBtn = document.getElementById('void');
            var isTraining = GeckoJS.Session.get('isTraining');

            // enable void sale button only if order has status of 1 or 2
            if (isTraining || !order || order.status < 1 || !this.Acl.isUserInRole('acl_void_transactions'))
                voidBtn.setAttribute('hidden', true);
            else
                voidBtn.removeAttribute('hidden');

            if (nextbtn) {
                if (this._index == this._orders.length - 1) {
                    nextbtn.setAttribute('disabled', true);
                }
                else {
                    nextbtn.removeAttribute('disabled');
                }
            }

            if (prevbtn) {
                if (this._index == 0) {
                    prevbtn.setAttribute('disabled', true);
                }
                else {
                    prevbtn.removeAttribute('disabled');
                }
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };

    GeckoJS.Controller.extend(__controller__);
})();
