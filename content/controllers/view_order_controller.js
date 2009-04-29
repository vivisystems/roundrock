(function(){

    /**
     * Class ViviPOS.JobsController
     */
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var __controller__ = {

        name: 'ViewOrder',

        _orderId: null,

        load: function(inputObj) {

            // load matching order(s)
            var conditions = '';
            if (inputObj.index == 'id') {
                conditions = 'id = "' + inputObj.value + '"';
            }
            else {
                conditions = inputObj.index + ' like "%' + inputObj.value + '%"';
            }
            var localOnly = GeckoJS.Configure.read('vivipos.fec.settings.ViewLocalOrdersOnly') || false;
            
            if (localOnly) {
                conditions += ' AND terminal_no = "' + GeckoJS.Session.get('terminal_no') + '"';
            }

            var orderModel = new OrderModel();
            var orders = orderModel.find('all', {
                fields: ['id', 'sequence', 'terminal_no', 'branch', 'branch_id'],
                conditions: conditions,
                order: 'transaction_created desc, branch_id, terminal_no, sequence',
                limit: 50,
                recursive: 0
            });

            // list orders
            var menulist = document.getElementById('orderlist');
            orders.forEach(function(order) {
                var branch = (order.branch == null || order.branch == '') ? ((order.branch_id == null || order.branch_id == '') ? '' : order.branch_id)
                                                                          : order.branch + ((order.branch_id == null || order.branch_id == '') ? '' : ' (' + order.branch_id + ')');
                var location = (branch == null || branch == '') ? order.terminal_no : (branch + ' [' + order.terminal_no + ']');
                menulist.appendItem(order.sequence + ' ' + location, order.id, '');
            });

            // disable void sale button initially
            var voidBtn = document.getElementById('void');
            voidBtn.setAttribute('disabled', true);
            
            if (orders.length == 1) {
                this.displayOrder(orders[0].id);
            }
            else if (orders.length == 0) {
                menulist.appendItem(_('No orders matching [%S] found', [inputObj.value]), '', '');
            }
            else {
                if (inputObj.value) {
                    menulist.insertItemAt(0, _('[%S] orders matching [%S]', [orders.length, inputObj.value]), '');
                }
                else {
                    menulist.insertItemAt(0, _('[%S] orders returned', [orders.length]), '');
                }
            }
            menulist.selectedIndex = 0;
        },

        displayOrder: function (id) {

            if (!id) return;
            
            // get browser content body
            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById( 'abody' );
            var print = document.getElementById('print');
            var voidBtn = document.getElementById('void');
            
            // load data
            var orderModel = new OrderModel();
            var order = orderModel.findById(id, 2);

            // load template
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_template.tpl');
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {};
            data.order = order;
            data.sequence = order.sequence;

            this.log(this.dump(order));
            
            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;

                print.setAttribute('disabled', false);
            }

            this._orderId = id;

            // enable void sale button only if order has status of 1 or 2
            voidBtn.setAttribute('disabled', !order || order.status < 1 || !this.Acl.isUserInRole('acl_void_transactions'));
        },

        voidSale: function() {

            var id = this._orderId;

            if (!id) return;

            // invoke Cart.voidSale in main window
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                                                    .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var cartController = mainWindow.GeckoJS.Controller.getInstanceByName('Cart');
            cartController.requestCommand('voidSale', id, 'Cart');

            this.displayOrder(id);
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();
