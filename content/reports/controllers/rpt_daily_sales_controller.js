(function(){

    /**
     * RptDailySales Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    GeckoJS.Controller.extend( {
        name: 'RptDailySales',
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

            var storeContact = GeckoJS.Session.get('storeContact');
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }

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

            var data = {
                head: {
                    title:_('Daily Sales Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: GeckoJS.BaseObject.getValues(repDatas),
                foot: {
                    foot_datas: footDatas,
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales.tpl");

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
            this.BrowserPrint.setPaperSize(297, 210);
            // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/daily_sales.pdf");
        },

        exportCsv: function() {

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_csv.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            this.CsvExport.printToFile("/var/tmp/daily_sales.csv", datas, tpl);

        },

        exportRcp: function() {
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_rcp.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            // this.RcpExport.print(datas, tpl);
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
            rcp.printReport('report', tpl, datas);

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

