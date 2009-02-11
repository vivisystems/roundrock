(function(){

    /**
     * RptDailySales Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptDailySales',
        components: ['BrowserPrint', 'CsvExport'],
        _datas: null,

        execute: function() {

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

//            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
//            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();
            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

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
                //var groupby = 'orders.terminal_no,"Order.Date"';
            } else {
                //var groupby = '"Order.Date"';
            }
            var groupby = 'order_payments.order_id,order_payments.name';
            var orderby = 'orders.terminal_no,orders.transaction_created,orders.id';

            // var order = new OrderModel();

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

                o.total = GeckoJS.NumberHelper.round(o.total, precision_prices, rounding_prices) || 0;
                if (old_oid != oid) footDatas.total += o.total;
                o.total = o.total.toFixed(precision_prices);

                o.surcharge_subtotal = GeckoJS.NumberHelper.round(o.surcharge_subtotal, precision_prices, rounding_prices) || 0;
                if (old_oid != oid) footDatas.surcharge_subtotal += o.surcharge_subtotal;
                o.surcharge_subtotal = o.surcharge_subtotal.toFixed(precision_prices);

                o.discount_subtotal = GeckoJS.NumberHelper.round(o.discount_subtotal, precision_prices, rounding_prices) || 0;
                if (old_oid != oid) footDatas.discount_subtotal += o.discount_subtotal;
                o.discount_subtotal = o.discount_subtotal.toFixed(precision_prices);

                o.payment_subtotal = GeckoJS.NumberHelper.round(o.payment_subtotal, precision_prices, rounding_prices) || 0;
                footDatas[o.payment_name] += o.payment_subtotal;
                o.payment_subtotal = o.payment_subtotal.toFixed(precision_prices);

                if (!repDatas[oid]) {
                    repDatas[oid] = GREUtils.extend({cash:0, creditcard: 0, coupon: 0}, o);
                }

                repDatas[oid][o.payment_name] = o.payment_subtotal;

                old_oid = oid;

            });

            this._datas = GeckoJS.BaseObject.getValues(repDatas);

            footDatas.total = footDatas.total.toFixed(precision_prices);
            footDatas.surcharge_subtotal = footDatas.surcharge_subtotal.toFixed(precision_prices);
            footDatas.discount_subtotal = footDatas.discount_subtotal.toFixed(precision_prices);
            footDatas.cash = footDatas.cash.toFixed(precision_prices);
            footDatas.creditcard = footDatas.creditcard.toFixed(precision_prices);
            footDatas.coupon = footDatas.coupon.toFixed(precision_prices);

            var data = {
                head: {
                    title:_('Daily Sales Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid
                },
                body: this._datas,
                foot: footDatas
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

        },

        exportPdf: function() {

            // this.execute();
            // this.print();

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(297, 210);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/daily_sales.pdf");
        },

        exportCsv: function() {
            
            this.CsvExport.exportToCsv("/var/tmp/daily_sales.csv");

        },

        load: function() {
            var self = this;
            this._selectedIndex = -1;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            
        }

    });


})();

