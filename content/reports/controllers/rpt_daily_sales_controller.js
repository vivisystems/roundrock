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

            var fields = ['orders.transaction_created',
                            'DATETIME("orders"."transaction_created", "unixepoch", "localtime") AS "Order.Date"',
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

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                var groupby = 'orders.terminal_no,"Order.Date"';
            } else {
                var groupby = '"Order.Date"';
            }

            var orderby = 'orders.terminal_no,orders.transaction_created';

            var order = new OrderModel();
            var datas = order.find('all',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1});

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            datas.forEach(function(o){
                
                o.total = GeckoJS.NumberHelper.round(o.total, precision_prices, rounding_prices) || 0;
                o.total = o.total.toFixed(precision_prices);
                o.surcharge_subtotal = GeckoJS.NumberHelper.round(o.surcharge_subtotal, precision_prices, rounding_prices) || 0;
                o.surcharge_subtotal = o.surcharge_subtotal.toFixed(precision_prices);
                o.discount_subtotal = GeckoJS.NumberHelper.round(o.discount_subtotal, precision_prices, rounding_prices) || 0;
                o.discount_subtotal = o.discount_subtotal.toFixed(precision_prices);

            });

            this._datas = datas;

            var data = {
                head: {
                    title:_('Daily Sales Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
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

            this.execute();
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

