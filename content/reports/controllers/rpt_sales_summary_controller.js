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
        _datas: null,

        execute: function() {
            //

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            // datetime(1233660482, 'unixepoch', 'localtime')
            /*
            var fields = ['orders.transaction_created',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.HourTotal"',
                            'STRFTIME("%Y-%m-%d %H","orders"."transaction_created_format") AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"'];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";

            var groupby = '"Order.Hour"';
            var orderby = 'orders.transaction_created';
            */

            var fields = ['orders.transaction_created',
                            'orders.sequence',
                            'orders.status',
                            'orders.total',
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

            var groupby = '"Order.Day"';
            var orderby = 'orders.transaction_created';

            var order = new OrderModel();
            var datas = order.find('all',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1});
            // var datas = order.execute(sql);
this.log(this.dump(datas));

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            // text = GeckoJS.NumberHelper.round(this.data[row].amount, precision_prices, rounding_prices) || 0;

            datas.forEach(function(o){
                var d = new Date();
                d.setTime(o.starttime);
                o.starttime = d.toString('yyyy/MM/dd HH:mm');
                d.setTime(o.endtime);
                o.endtime = d.toString('yyyy/MM/dd HH:mm');

                o.total = GeckoJS.NumberHelper.round(o.total, precision_prices, rounding_prices) || 0;
                o.total = o.total.toFixed(precision_prices);
                o.surcharge_subtotal = GeckoJS.NumberHelper.round(o.surcharge_subtotal, precision_prices, rounding_prices) || 0;
                o.surcharge_subtotal = o.surcharge_subtotal.toFixed(precision_prices);
                o.discount_subtotal = GeckoJS.NumberHelper.round(o.discount_subtotal, precision_prices, rounding_prices) || 0;
                o.discount_subtotal = o.discount_subtotal.toFixed(precision_prices);

            });

            // this.log(this.dump(datas));

            this._datas = datas;

            var data = {
                head: {
                    title:_('Sales Summary Report'),
                    start_date: start,
                    end_date: end
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_sales_summary.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

        },

        exportPdf: function() {

            this.execute();
            // this.print();

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(297, 210);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/sales_summary.pdf");
        },

        exportCsv: function() {
            this.CsvExport.exportToCsv("/var/tmp/sales_summary.csv");
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

