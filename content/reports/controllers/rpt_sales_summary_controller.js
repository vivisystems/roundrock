(function(){

    /**
     * RptDailySales Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptSalesSummary',
        components: ['BrowserPrint', 'CsvExport'],

        _mediaPath: null,
        _datas: null,
        _start: null,
        _end: null,
        _machineid: null,

        _showWaitPanel: function(panel) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            this.sleep(1500);
            return waitPanel;
        },

        _getConditions: function() {
            this._start = document.getElementById('start_date').value;
            this._end = document.getElementById('end_date').value;
            this._machineid = document.getElementById('machine_id').value;
        },

        _hourlySales: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var machineid = document.getElementById('machine_id').value;
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = ['orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.HourTotal"',
                            // 'STRFTIME("%Y-%m-%d %H","orders"."transaction_created_format") AS "Order.Hour"',
                            'STRFTIME("%Y-%m-%d %H",DATETIME("orders"."transaction_created", "unixepoch", "localtime")) AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"'];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";
            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                var groupby = 'orders.terminal_no,"Order.Hour"';
            } else {
                var groupby = '"Order.Hour"';
            }


            var orderby = 'orders.terminal_no,orders.transaction_created';

            var order = new OrderModel();
            var datas = order.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1});

            var HourTotal = 0;
            var OrderNum = 0;
            var Guests = 0;
            var ItemsCount = 0;

            datas.forEach(function(o){
                HourTotal += o.HourTotal;
                OrderNum += o.OrderNum;
                Guests += o.Guests;
                ItemsCount += o.ItemsCount;

            });

            return datas;
        },

        _deptSalesBillboard: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var machineid = document.getElementById('machine_id').value;
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var orderItem = new OrderItemModel();

            var fields = ['orders.terminal_no',
                            'order_items.created',
                            'order_items.cate_no',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
            var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end + "'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            }

            var groupby = 'order_items.cate_no';
            var orderby = '"OrderItem.qty" DESC';

            var datas = orderItem.find('all',{fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: 10});

            return datas;
        },

        _prodSalesBillboard: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var machineid = document.getElementById('machine_id').value;
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var orderItem = new OrderItemModel();

            var fields = ['orders.terminal_no',
                    'order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
            var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end + "'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            }

            var groupby = 'order_items.product_no';
            var orderby = '"OrderItem.qty" DESC';

            var datas = orderItem.find('all',{fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: 20});

            return datas;
        },

        _paymentList: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var machineid = document.getElementById('machine_id').value;
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = [
                            'sum(order_payments.amount) as "Order.payment_subtotal"',
                            'order_payments.name as "Order.payment_name"',
                            'orders.transaction_created',
                            //'DATETIME("orders"."transaction_created", "unixepoch", "localtime") AS "Order.Date"',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.total',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'orders.surcharge_subtotal',
                            'orders.discount_subtotal',
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.terminal_no'];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                var groupby = 'orders.terminal_no,order_payments.name';
                var orderby = 'orders.terminal_no,order_payments.name';
            } else {
                var groupby = 'order_payments.name';
                var orderby = 'order_payments.name';
            }

            var orderPayment = new OrderPaymentModel();
            // var datas = order.find('all',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1});
            var datas = orderPayment.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1});

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            // prepare reporting data
            var repDatas = {};

            var initZero = parseFloat(0).toFixed(precision_prices);

            var footDatas = {total: 0, surcharge_subtotal: 0,discount_subtotal: 0, cash: 0, creditcard: 0, coupon: 0};
            var old_oid;

            datas.forEach(function(data){

                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

                if (!repDatas[oid]) {
                    repDatas[oid] = GREUtils.extend({}, o); // {cash:0, creditcard: 0, coupon: 0}, o);
                }

                repDatas[oid][o.payment_name] = o.payment_subtotal;

                if (old_oid != oid) footDatas.total += o.total;
                if (old_oid != oid) footDatas.surcharge_subtotal += o.surcharge_subtotal;
                if (old_oid != oid) footDatas.discount_subtotal += o.discount_subtotal;
                footDatas[o.payment_name] += o.payment_subtotal;
                old_oid = oid;

            });

            var datas = GeckoJS.BaseObject.getValues(repDatas);

            return datas;
        },

        _SalesSummary: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var machineid = document.getElementById('machine_id').value;
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = ['orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.Total"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"',
                            'AVG("orders"."total") AS "Order.AvgTotal"',
                            'AVG("orders"."no_of_customers") AS "Order.AvgGuests"',
                            'AVG("orders"."items_count") AS "Order.AvgItemsCount"',
                        ];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";
            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            } else {
            }

            var groupby;

            var orderby = 'orders.terminal_no,orders.transaction_created';

            var order = new OrderModel();
            var datas = order.find('first',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: -1});

            return datas;
        },

        execute: function() {
            var waitPanel = this._showWaitPanel('wait_panel');
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            // this._datas = datas;

            var data = {
                head: {
                    title:_('Sales Summary Report'),
                    start_time: start_str,
                    end_time: end_str
                },
                body: {
                    hourly_sales: this._hourlySales(),
                    dept_sales: this._deptSalesBillboard(),
                    prod_sales: this._prodSalesBillboard(),
                    payment_list: this._paymentList(),
                    sales_summary: this._SalesSummary()
                },
                foot: {
                    //
                }
            }
// this.log(this.dump(data));
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_sales_summary.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            waitPanel.hidePopup();

        },

        exportPdf: function() {

            this.BrowserPrint.getPrintSettings();

            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(210, 297);
            // this.BrowserPrint.setPaperEdge(80, 80, 80, 80);
            // this.BrowserPrint.setPaperMargin(2, 2, 2, 2);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/sales_summary.pdf");
        },

        exportCsv: function() {

            var columns = ['terminal_no', 'HourTotal', 'Hour', 'OrderNum', 'Guests', 'ItemsCount'];
            var headers = ['TerminalNo', 'HourTotal', 'Hour', 'OrderNum', 'Guests', 'ItemsCount'];
            var datas;
            datas = this._hourlySales();

            this.CsvExport.exportToCsv("/var/tmp/sales_summary.csv", headers, columns, datas);
        },

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;

        }

    });


})();

