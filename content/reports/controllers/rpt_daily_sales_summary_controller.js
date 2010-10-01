( function() {
    /**
     * RptDailySalesSummary Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptDailySalesSummary',
        
        _fileName: 'rpt_daily_sales_summary',

        _set_reportData: function( start, end, start_str, end_str, shiftNo, periodType, terminalNo, sortby, limit) {

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields = [
                            'sum(order_payments.amount - order_payments.change) as "payment_subtotal"',
                            'order_payments.name as "payment_name"',
                            'orders.transaction_created',
                            'strftime( "%Y-%m-%d", "orders"."' + periodType + '", "unixepoch", "localtime" ) AS "date"',
                            'orders.id',
                            //'orders.sequence',
                            'orders.status',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'orders.surcharge_subtotal',
                            'orders.discount_subtotal',
                            'orders.promotion_subtotal',
                            'orders.revalue_subtotal',
                            'orders.qty_subtotal',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            //'orders.invoice_no',
                            'orders.terminal_no'
                        ];

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end +
                            "' AND orders.status='1'";

            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
                
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            	
            var groupby = 'orders.id, payment_name';//order_payments.order_id';
            var orderby = 'orders.terminal_no, "date", orders.item_subtotal desc';//orders.transaction_created, orders.id';

            // var order = new OrderModel();

            // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var orderPayment = new OrderPaymentModel();

            orderPayment.useDbConfig = useDbConfig; // udpate dbconfig
         
            // var datas = order.find('all',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1});
            //var datas = orderPayment.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby, limit: this._csvLimit, recursive: 1});
            var datas = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders LEFT JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + limit);
            //var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            //var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            // prepare reporting data
            var repDatas = {};

            //var initZero = parseFloat(0).toFixed(precision_prices);

            var footDatas = {
            	tax_subtotal: 0,
            	item_subtotal: 0,
            	total: 0,
            	surcharge_subtotal: 0,
            	discount_subtotal: 0,
            	promotion_subtotal: 0,
            	revalue_subtotal: 0,
                payment: 0,
            	cash: 0,
            	check: 0,
            	creditcard: 0,
            	coupon: 0,
            	giftcard: 0,
                items: 0,
                guests: 0
            };
            
            var old_oid;
            var tmp_oid;


            var self = this;
            var terminal;
            var date;
            var old_terminal;
            var old_date;
            
            datas.forEach( function( data ) {

                data.Order = data;
                var oid = data.Order.id;
                var o = data.Order;

                o.Order = o;
                
                terminal = o.terminal_no;
                date = o.date;
                

                if ( terminal != old_terminal || date != old_date ) {
                    if ( !repDatas[ oid ] ) {
                        repDatas[ oid ] = GREUtils.extend( {}, o ); // {cash:0, creditcard: 0, coupon: 0}, o);
                    }
					
					if ( old_oid != oid ) {
		                repDatas[ oid ][ 'payment' ] = 0.0;
		                repDatas[ oid ][ 'cash' ] = 0.0;
		                repDatas[ oid ][ 'check' ] = 0.0;
		                repDatas[ oid ][ 'creditcard' ] = 0.0;
		                repDatas[ oid ][ 'coupon' ] = 0.0;
		                repDatas[ oid ][ 'giftcard' ] = 0.0;
		            }
		           
                    if (o.payment_name) repDatas[ oid ][ o.payment_name ] += o.payment_subtotal;
                    repDatas[ oid ][ 'payment' ] += o.payment_subtotal;

                    tmp_oid = oid;
                } else {
                
                    if (o.payment_name) repDatas[ tmp_oid ][ o.payment_name ] += o.payment_subtotal;
                    repDatas[ tmp_oid ][ 'payment' ] += o.payment_subtotal;
                    
                    if ( old_oid != oid ) {
		                repDatas[ tmp_oid ][ 'no_of_customers' ] += o.no_of_customers;
		                repDatas[ tmp_oid ][ 'qty_subtotal' ] += o.qty_subtotal;
		                repDatas[ tmp_oid ][ 'total' ] += o.total;
		                repDatas[ tmp_oid ][ 'surcharge_subtotal' ] += o.surcharge_subtotal;
		                repDatas[ tmp_oid ][ 'discount_subtotal' ] += o.discount_subtotal;
		                repDatas[ tmp_oid ][ 'promotion_subtotal' ] += o.promotion_subtotal;
		                repDatas[ tmp_oid ][ 'revalue_subtotal' ] += o.revalue_subtotal;
		                repDatas[ tmp_oid ][ 'tax_subtotal' ] += o.tax_subtotal;
		                repDatas[ tmp_oid ][ 'item_subtotal' ] += o.item_subtotal;
		            }
                }

                if ( old_oid != oid ) {
                	footDatas.total += o.total;
		            footDatas.surcharge_subtotal += o.surcharge_subtotal;
		            footDatas.discount_subtotal += o.discount_subtotal;
		            footDatas.promotion_subtotal += o.promotion_subtotal;
		            footDatas.revalue_subtotal += o.revalue_subtotal;
		            footDatas.tax_subtotal += o.tax_subtotal;
		            footDatas.item_subtotal += o.item_subtotal;
                    footDatas.items += o.qty_subtotal;
                    footDatas.guests += o.no_of_customers;
		        }
		        
                if (o.payment_name) footDatas[ o.payment_name ] += o.payment_subtotal;
                footDatas[ 'payment' ] += o.payment_subtotal;
              
                old_oid = oid;
                old_terminal = terminal;
                old_date = date;
            });
            
            var orderedData = [];
           	var counter = 0;
           	
           	for ( p in repDatas ) {
           		orderedData[ counter++ ] = GREUtils.extend( {}, repDatas[ p ] );
           	}
           	
            if ( sortby != 'all' ) {
		        function sortFunction( a, b ) {
		        	a = a[ sortby ];
		        	b = b[ sortby ];
		        	
		        	switch ( sortby ) {
		        		case 'terminal_no':
		        		case 'date':
		        		case 'discount_subtotal':
		        		case 'promotion_subtotal':
		        		case 'revalue_subtotal':
		        			if ( a > b ) return 1;
							if ( a < b ) return -1;
							return 0;
		        		case 'item_subtotal':
		        		case 'tax_subtotal':
		        		case 'surcharge_subtotal':
		        		case 'total':
		        		case 'cash':
		        		case 'check':
		        		case 'creditcard':
		        		case 'coupon':
		        		case 'giftcard':
		        			if ( a < b ) return 1;
							if ( a > b ) return -1;
							return 0;
		        	}
            	}
            	orderedData.sort( sortFunction );
            }
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.dailysalessummary.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
            
            this._reportRecords.body = GeckoJS.BaseObject.getValues( orderedData );
            
            this._reportRecords.foot.foot_datas = footDatas;
        },

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._csvLimit ; // this._stdLimit;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var terminalNo = document.getElementById('terminal_no').value;

            var periodType = document.getElementById( 'period_type' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;

            var sortby = document.getElementById( 'sortby' ).value;

            this._set_reportData( start, end, start_str, end_str, shiftNo, periodType, terminalNo, sortby, limit);
        },

        set_reportRecords: function( parameters ) {

            document.getElementById('start_date').value = parameters.start;
            document.getElementById('end_date').value = parameters.end;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            document.getElementById('terminal_no').value = parameters.terminalNo;

            document.getElementById( 'period_type' ).value = parameters.periodtype;
            document.getElementById( 'shift_no' ).value = parameters.shiftno;

            this._set_reportData( parameters.start, parameters.end, start_str, end_str, parameters.shiftno, parameters.periodtype, parameters.terminalNo, 'date', this._csvLimit);
        },
        
        exportPdf: function() {
            this._super( {
                paperSize: {
                    width: 297,
                    height: 210
                }
            } );
        },
        
        print: function() {
            this._super( {
                orientation: "landscape"
            } );
        },

        exportCsv: function() {
            this._super(this);
        },

        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
