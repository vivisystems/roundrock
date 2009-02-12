(function(){

    /**
     * RptHourlySales Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptHourlySales',
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

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            this._datas = datas;
            var HourTotal = 0;
            var OrderNum = 0;
            var Guests = 0;
            var ItemsCount = 0;

            datas.forEach(function(o){
                HourTotal += o.HourTotal;
                OrderNum += o.OrderNum;
                Guests += o.Guests;
                ItemsCount += o.ItemsCount;

                o.HourTotal = GeckoJS.NumberHelper.round(o.HourTotal, precision_prices, rounding_prices) || 0;
                o.HourTotal = o.HourTotal.toFixed(precision_prices);
            });

            HourTotal = GeckoJS.NumberHelper.round(HourTotal, precision_prices, rounding_prices) || 0;
            HourTotal = HourTotal.toFixed(precision_prices);

            var data = {
                head: {
                    title:_('Hourly Sales Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid
                },
                body: this._datas,
                foot: {
                    HourTotal: HourTotal,
                    OrderNum : OrderNum,
                    Guests   : Guests,
                    ItemsCount: ItemsCount
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_hourly_sales.tpl");

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
            this.BrowserPrint.setPaperSize(210, 297);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/hourly_sales.pdf");
        },

        exportCsv: function() {
            
            this.CsvExport.exportToCsv("/var/tmp/hourly_sales.csv");

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

