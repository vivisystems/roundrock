(function(){

    /**
     * Class ViviPOS.JobsController
     */
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var __controller__ = {

        name: 'ViewOrder',

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
                order: 'branch_id, terminal_no, transaction_created desc, sequence',
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

            if (orders.length == 1) {
                menulist.selectedIndex = 0;
                this.displayOrder(orders[0].id);
            }
        },

        displayOrder: function (id) {

            // get browser content body
            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById( 'abody' );
            var print = document.getElementById('print');
            
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

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;

                print.setAttribute('disabled', false);
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();
