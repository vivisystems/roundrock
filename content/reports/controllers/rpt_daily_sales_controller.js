(function(){

    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptDailySales',
        
        _fileName: 'rpt_daily_sales',

        _set_reportRecords: function() {
            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

//            var start_str = document.getElementById( 'start_date' ).datetimeValue.toLocaleString();
//            var end_str = document.getElementById( 'end_date' ).datetimeValue.toLocaleString();
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
                            'sum(order_payments.amount) as "Order.payment_subtotal"',
                            'order_payments.name as "Order.payment_name"',
                            'orders.' + periodType + ' as "Order.time"',
                            //'DATETIME("orders"."' + periodType + '", "unixepoch", "localtime") AS "Order.Date"',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.change',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.service_clerk_displayname',
                            'orders.proceeds_clerk_displayname',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'orders.surcharge_subtotal',
                            'orders.discount_subtotal',
                            'orders.promotion_subtotal',
                            'orders.revalue_subtotal',
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.terminal_no'
                         ];

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end +
                            "' AND orders.status=1";
                            
            var service_clerk = document.getElementById( 'service_clerk' ).value;
            if ( service_clerk != 'all' )
            	conditions += " AND orders.service_clerk_displayname = '" + this._queryStringPreprocessor( service_clerk ) + "'";

			var proceeds_clerk = document.getElementById( 'proceeds_clerk' ).value;
			if ( proceeds_clerk != 'all' )
				conditions += " AND orders.proceeds_clerk_displayname = '" + this._queryStringPreprocessor( proceeds_clerk ) + "'";

            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                
            var groupby = 'order_payments.order_id, order_payments.name';
            var orderby = 'orders.item_subtotal desc';//orders.transaction_created, orders.id';
            
            //var order = new OrderModel();

            var orderPayment = new OrderPaymentModel();
            
            //var datas = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2 } );
            var datas = orderPayment.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );

            //var rounding_prices = GeckoJS.Configure.read( 'vivipos.fec.settings.RoundingPrices' ) || 'to-nearest-precision';
            //var precision_prices = GeckoJS.Configure.read( 'vivipos.fec.settings.PrecisionPrices' ) || 0;

            //prepare reporting data
            var repDatas = {};

            //var initZero = parseFloat( 0 ).toFixed( precision_prices );

            var footDatas = {
            	tax_subtotal: 0,
            	item_subtotal: 0,
            	total: 0,
            	surcharge_subtotal: 0,
            	discount_subtotal: 0,
            	promotion_subtotal: 0,
            	revalue_subtotal: 0,
            	cash: 0,
            	check: 0,
            	creditcard: 0,
            	coupon: 0,
            	giftcard: 0
            };
            
            var old_oid;

            datas.forEach( function( data ) {

                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

                if ( !repDatas[ oid ] ) {
                    repDatas[ oid ] = GREUtils.extend( {}, o ); // {cash:0, creditcard: 0, coupon: 0}, o);
                }
				
				if ( old_oid != oid ) {
					repDatas[ oid ][ 'cash' ] = 0.0;
					repDatas[ oid ][ 'check' ] = 0.0;
					repDatas[ oid ][ 'creditcard' ] = 0.0;
					repDatas[ oid ][ 'coupon' ] = 0.0;
					repDatas[ oid ][ 'giftcard' ] = 0.0;
					
					//for setting up footdata
					footDatas.total += o.total;
		            footDatas.surcharge_subtotal += o.surcharge_subtotal;
		            footDatas.discount_subtotal += o.discount_subtotal;
		            footDatas.promotion_subtotal += o.promotion_subtotal;
		            footDatas.revalue_subtotal += o.revalue_subtotal;
		            footDatas.tax_subtotal += o.tax_subtotal;
		            footDatas.item_subtotal += o.item_subtotal;
				}
				
				if ( o.payment_name == 'cash' ) {
					repDatas[ oid ][o.payment_name] += o.payment_subtotal - o.change;
					footDatas[ o.payment_name ] += o.payment_subtotal - o.change;
				} else {
		            repDatas[ oid ][ o.payment_name ] += o.payment_subtotal;
					footDatas[ o.payment_name ] += o.payment_subtotal;
				}

                old_oid = oid;
            });

            this._datas = GeckoJS.BaseObject.getValues( repDatas );
            
            if ( sortby != 'all' ) {
            	this._datas.sort(
            		function ( a, b ) {
            			a = a[ sortby ];
            			b = b[ sortby ];
            			
            			switch ( sortby ) {
            				case 'terminal_no':
            				case 'service_clerk_displayname':
            				case 'proceeds_clerk_displayname':
            				case 'time':
            				case 'discount_subtotal':
            				case 'promotion_subtotal':
            				case 'revalue_subtotal':
            					if ( a > b ) return 1;
				    			if ( a < b ) return -1;
				    			return 0;
            				case 'sequence':
            				case 'invoice_no':
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
            	);
            }
            
            this._reportRecords.head.title = _( 'Daily Sales Report' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.terminal_no = terminal_no;
			
			this._reportRecords.body = GeckoJS.BaseObject.getValues( this._datas );
			
			this._reportRecords.foot.foot_datas = footDatas;
        },
        
        execute: function() {
        	this._super();
        	this._registerOpenOrderDialog();
        },
        
        /*exportPdf: function() {
        	this._super( {
        		paperSize: {
        			width: 297,
        			height: 210
        		}
        	} );
        },*/

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;
		    	    
		    this._addMenuitem( new OrderModel(), [ 'service_clerk_displayname' ], 'status = 1',
		    			'service_clerk_displayname', 'service_clerk_displayname', 'service_clerk_menupopup', 'service_clerk_displayname', 'service_clerk_displayname' );
		    			
		    this._addMenuitem( new OrderModel(), [ 'proceeds_clerk_displayname' ], 'status = 1',
		    			'proceeds_clerk_displayname', 'proceeds_clerk_displayname', 'proceeds_clerk_menupopup', 'proceeds_clerk_displayname', 'proceeds_clerk_displayname' );

            this._enableButton( false );
        }
    });
})();
