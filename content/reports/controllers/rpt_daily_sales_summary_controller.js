(function(){

    /**
     * RptDailySalesSummary Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    GeckoJS.Controller.extend( {
        name: 'RptDailySalesSummary',
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
                            //'orders.sequence',
                            'orders.status',
                            'sum( orders.total ) as "Order.total"',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'sum( orders.surcharge_subtotal ) as "Order.surcharge_subtotal"',
                            'sum( orders.discount_subtotal ) as "Order.discount_subtotal"',
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            //'orders.invoice_no',
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
            var groupby = 'order_payments.name, orders.terminal_no';//order_payments.order_id';';
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
            var tmp_oid;


            var self = this;
            var terminal;
            var old_terminal;
            
            datas.forEach(function(data){

                var oid = data.Order.id;
                var o = data.Order;

                o.Order = o;
                
                terminal = o.terminal_no;

                if ( terminal != old_terminal ) {
                    if (!repDatas[oid]) {
                        repDatas[oid] = GREUtils.extend({}, o); // {cash:0, creditcard: 0, coupon: 0}, o);
                    }

                    repDatas[oid][ 'cash' ] = 0.0;
                    repDatas[oid][ 'creditcard' ] = 0.0;
                    repDatas[oid][ 'coupon' ] = 0.0;
                    repDatas[oid][o.payment_name] += o.payment_subtotal;

                    tmp_oid = oid;
                } else {
                    repDatas[ tmp_oid ][ o.payment_name ] = o.payment_subtotal;
                    repDatas[ tmp_oid ][ 'total' ] += o.total;
                    repDatas[ tmp_oid ][ 'surcharge_subtotal' ] += o.surcharge_subtotal;
                    repDatas[ tmp_oid ][ 'discount_subtotal' ] += o.discount_subtotal;
                }

                if (old_oid != oid) footDatas.total += o.total;
                if (old_oid != oid) footDatas.surcharge_subtotal += o.surcharge_subtotal;
                if (old_oid != oid) footDatas.discount_subtotal += o.discount_subtotal;
                footDatas[o.payment_name] += o.payment_subtotal;
              
                old_oid = oid;
                old_terminal = terminal;
            });
            
            var orderedData = [];
           	var counter = 0;
           	
           	for ( p in repDatas ) {
           		orderedData[ counter++ ] = GREUtils.extend({}, repDatas[ p ] );
           	}
           	
            var sortby = document.getElementById( 'sortby' ).value;

            if ( sortby != 'all' ) {
		        function sortFunction( a, b ) {
		        	var a = a[ sortby ];
		        	var b = b[ sortby ];
				    if ( a > b ) return 1;
				    if ( a < b ) return -1;
				    return 0;
            	}
            	
            	orderedData.sort( sortFunction );
            }
            
            this._datas = GeckoJS.BaseObject.getValues(orderedData);

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

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_summary.tpl");

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

