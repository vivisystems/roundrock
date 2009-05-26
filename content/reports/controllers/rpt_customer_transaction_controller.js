(function(){

    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptCustomerTransaction',
        
        _fileName: 'rpt_customer_transaction',

        _set_reportRecords: function( limit ) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var customer_id_start = document.getElementById( 'customer_id_start' ).value;
            var customer_id_end = document.getElementById( 'customer_id_end' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if ( periodType == 'sale_period' ) {
                timeField = 'transaction_submitted';
            }
            var fields = [
                            'sum(order_payments.amount - order_payments.change) as "Order.payment_subtotal"',
                            'order_payments.name as "Order.payment_name"',
                            'orders.' + timeField + ' as "Order.time"',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.service_clerk_displayname',
                            'orders.proceeds_clerk_displayname',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'orders.rounding_taxes',
                            'orders.precision_taxes',
                            'orders.surcharge_subtotal',
                            'orders.discount_subtotal',
                            'orders.promotion_subtotal',
                            'orders.revalue_subtotal',
                            'orders.qty_subtotal',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.sale_period',
                            'orders.shift_number',
                            'orders.terminal_no',
                            'orders.member'
                         ];

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end +
                            "' AND orders.status=1 AND member <> ''";
                            
            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            	
            if ( customer_id_start.length > 0 )
            	conditions += " AND orders.member >= '" + this._queryStringPreprocessor( customer_id_start ) + "'";
            	
            if ( customer_id_end.length > 0 )
            	conditions += " AND orders.member <= '" + this._queryStringPreprocessor( customer_id_end ) + "'";
                
            var groupby = 'order_payments.order_id, order_payments.name';
            var orderby = 'orders.' +  timeField;

            var orderPayment = new OrderPaymentModel();
            
            var datas = orderPayment.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: limit } );

            var repDatas = {};
            
            var old_oid;

            datas.forEach( function( data ) {

                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

                if ( !repDatas[ oid ] ) {
                    repDatas[ oid ] = GREUtils.extend( {}, o );
                }
				
				if ( old_oid != oid ) {
					repDatas[ oid ][ 'payment' ] = 0.0;
					repDatas[ oid ][ 'cash' ] = 0.0;
					repDatas[ oid ][ 'check' ] = 0.0;
					repDatas[ oid ][ 'creditcard' ] = 0.0;
					repDatas[ oid ][ 'coupon' ] = 0.0;
					repDatas[ oid ][ 'giftcard' ] = 0.0;
				}
				
                repDatas[ oid ][o.payment_name] += o.payment_subtotal;
                repDatas[ oid ][ 'payment' ] += o.payment_subtotal;

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
            				case 'sequence':
            				case 'invoice_no':
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
            	);
            }
            
            // classify the order records according to member info.
            var customerModel = new CustomerModel();
            var customers = customerModel.find( "all", {
            	fields: [ 'customer_id', 'name' ], group: "customer_id", order: "customer_id desc", recursive: 0
            } );
            
            var orderModel = new OrderModel();
            var members = orderModel.find( "all", {
            	fields: [ 'member as "Order.customer_id"', 'member_displayname as "Order.name"' ], conditions: conditions, group: "member", order: "member desc", recursive: 0
            } );
            
            var consumers = [];
            while ( customers.length || members.length ) {
            	var customer = customers[ 0 ] ? customers[ 0 ].customer_id : "";
            	var member = members[ 0 ] ? members[ 0 ].customer_id : "";
            	
            	if ( customer > member ) {
            		consumers.unshift( customers.shift() );
            	} else if ( customer == member ) {
            		consumers.unshift( customers.shift() );
            		members.shift();
            	} else {
            		consumers.unshift( members.shift() );
            	}
            	
            	consumers[ 0 ].orders = [];
            	consumers[ 0 ].summary = {
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
		            no_of_customers: 0,
		            qty_subtotal: 0
		        };
            }
            
            customers = {};
            consumers.forEach( function( consumer ) {
            	customers[ consumer.customer_id ] = consumer;
            } );
            
            this._datas.forEach( function( d ) {
            	customers[ d.member ].orders.push( d );
            	
            	for ( attr in customers[ d.member ].summary ) {
            		customers[ d.member ].summary[ attr ] += d[ attr ];
            	}
            } );
            
            this._reportRecords.head.title = _( 'Customer Transaction Report' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.terminal_no = terminal_no;
			
			this._reportRecords.body = customers;
        },
        
        exportCsv: function() {
            this._super(this);
        },

        execute: function() {
        	this._super();
        	this._registerOpenOrderDialog();
        },
        
        exportPdf: function() {
        	this._super( {
        		paperSize: {
        			width: 297,
        			height: 210
        		}
        	} );
        },

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;
		    	    
            this._enableButton( false );
        }
    };

    RptBaseController.extend( __controller__ );
})();
