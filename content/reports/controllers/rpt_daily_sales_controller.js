( function() {
    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptDailySales',
        
        _fileName: 'rpt_daily_sales',

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            //var start_str = document.getElementById( 'start_date' ).datetimeValue.toLocaleString();
            //var end_str = document.getElementById( 'end_date' ).datetimeValue.toLocaleString();
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
                'sum(order_payments.amount - order_payments.change) as "payment_subtotal"',
                'order_payments.name as "payment_name"',
                'orders.' + timeField + ' as "time"',
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
                'orders.terminal_no'
            ];

            var conditions = "orders." + periodType + ">='" + start +
            "' AND orders." + periodType + "<='" + end +
            "' AND orders.status=1";
                            
            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                
            var groupby = 'orders.id, order_payments.name';
            var orderby = 'orders.' +  timeField;
            
            //var order = new OrderModel();
            var orderPayment = new OrderPaymentModel();

            var counts = orderPayment.getDataSource().fetchAll('SELECT count(id) as rowCount from (SELECT distinct (orders.id) ' + '  FROM orders INNER JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby +')');
            var rowCount = counts[0].rowCount;

            var datas = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + limit);

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
                payment: 0,
                cash: 0,
                check: 0,
                creditcard: 0,
                coupon: 0,
                giftcard: 0,
                guests: 0,
                items: 0,
                rowCount: rowCount
            };
            
            var old_oid;

            datas.forEach( function( data ) {

                data.Order = data;
                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

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
					
                    //for setting up footdata
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
				
                repDatas[ oid ][o.payment_name] += o.payment_subtotal;
                repDatas[ oid ][ 'payment' ] += o.payment_subtotal;
                footDatas[ o.payment_name ] += o.payment_subtotal;
                footDatas[ 'payment' ] += o.payment_subtotal;

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
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.dailysales.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminal_no;
			
            this._reportRecords.body = GeckoJS.BaseObject.getValues( this._datas );

            this._reportRecords.foot.foot_datas = footDatas;
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
        
        print: function() {
            this._super( {
                orientation: "landscape"
            } );
        },
        
        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
