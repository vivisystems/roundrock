(function(){

    /**
     * RptDailySales Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptDailySalesDetail',
        components: ['BrowserPrint', 'CsvExport'],
        _datas: null,

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

        execute: function() {
            var waitPanel = this._showWaitPanel('wait_panel');
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
                            'DATETIME("orders"."transaction_created", "unixepoch", "localtime") AS "Order.Time"',
                            'orders.sequence',
                            'orders.status',
                            'orders.total',
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.terminal_no'
                        ];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            } else {
                //
            }

            var groupby = null;
            var orderby = 'orders.terminal_no,orders.transaction_created';

            var order = new OrderModel();
            var datas = order.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2});

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            if (datas) {
                datas.forEach(function(o){

                    o.total = GeckoJS.NumberHelper.round(o.total, precision_prices, rounding_prices) || 0;
                    o.total = o.total.toFixed(precision_prices);

                    o.OrderItem.forEach(function(k){
                        k.current_price = GeckoJS.NumberHelper.round(k.current_price, precision_prices, rounding_prices) || 0;
                        k.current_price = k.current_price.toFixed(precision_prices);
                        k.current_subtotal = GeckoJS.NumberHelper.round(k.current_subtotal, precision_prices, rounding_prices) || 0;
                        k.current_subtotal = k.current_subtotal.toFixed(precision_prices);
                    });
                });
            }

            this._datas = datas;

            var data = {
                head: {
                    title:_('Daily Sales Report - Detail'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_detail.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            waitPanel.hidePopup();

        },

        exportPdf: function() {

            // this.execute();
            // this.print();

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(210, 297);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/daily_sales_detail.pdf");
        },

        exportCsv: function() {
            
            this.CsvExport.exportToCsv("/var/tmp/daily_sales_detail.csv");

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

