( function() {
    /**
     * RptOrderStatus Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptOrderStatus',
        
        _fileName: "rpt_order_status",

        _set_reportRecords: function( limit ) {

            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;
            
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            
            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var terminalNo = document.getElementById('terminal_no').value;
            var periodType = document.getElementById( 'period_type' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;

            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var timeField = periodType;
            if (periodType == 'sale_period' || periodType == 'void_sale_period' || periodType == 'void_time') {
                timeField = 'transaction_submitted';
            }
            var fields = [
            'orders.' + timeField + ' as "Order.time"',
            'orders.id',
            'orders.sequence',
            'orders.status',
            'orders.change',
            'orders.tax_subtotal',
            'orders.item_subtotal',
            'orders.total',
            'orders.service_clerk_displayname',
            'orders.proceeds_clerk_displayname',
            'orders.surcharge_subtotal',
            'orders.discount_subtotal',
            'orders.promotion_subtotal',
            'orders.revalue_subtotal',
            'orders.payment_subtotal - orders.change as "Order.payment"',
            'orders.check_no',
            'orders.table_no',
            'orders.no_of_customers',
            'orders.invoice_no',
            'orders.invoice_count',
            'orders.sale_period',
            'orders.shift_number',
            'orders.void_sale_period',
            'orders.void_shift_number',
            'orders.transaction_voided',
            'orders.void_clerk_displayname',
            'orders.terminal_no',
            'orders.rounding_prices',
            'orders.precision_prices',
            'orders.rounding_taxes',
            'orders.precision_taxes'
            ];

            var conditions = "orders." + periodType + ">='" + start +
            "' AND orders." + periodType + "<='" + end + "'";
                            
            var orderstatus = document.getElementById( 'orderstatus' ).value;
            if ( orderstatus != 'all' )
                conditions += " AND orders.status = " + orderstatus;
                            
            if ( shiftNo.length > 0 ) {
                if (periodType == 'void_sale_period') {
                    conditions += " AND orders.void_shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                }
                else {
                    conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                }
            }
				
            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
                
            var orderby = 'orders.terminal_no, orders.status, orders.item_subtotal desc';
            if ( sortby != 'all' ) {
                switch ( sortby ) {
                    case 'terminal_no':
                    case 'sequence':
                    case 'invoice_no':
                    case 'status':
                        orderby = sortby;
                        break;

                    case 'time':
                        orderby = timeField;
                        break;
                    case 'discount_subtotal':
                    case 'promotion_subtotal':
                    case 'revalue_subtotal':
                    case 'item_subtotal':
                    case 'payment_subtotal':
                    case 'tax_subtotal':
                    case 'surcharge_subtotal':
                    case 'total':
                        orderby = sortby + ' desc';
                        break;
                }
            }

            // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var order = new OrderModel();

            order.useDbConfig = useDbConfig; // udpate dbconfig

            var rowCount = order.find( 'count', {
                fields: fields,
                conditions: conditions,
                recursive: -1
            } );

            var records = order.find( 'all', { 
                fields: fields,
                conditions: conditions,
                order: orderby,
                recursive: -1,
                limit: limit
            } );

            var tax_subtotal = 0;
            var item_subtotal = 0;
            var total = 0;
            var surcharge_subtotal = 0;
            var discount_subtotal = 0;
            var promotion_subtotal = 0;
            var revalue_subtotal = 0;
            var payment_subtotal = 0;
            
            records.forEach( function( record ) {
                delete record.Order;

                tax_subtotal += record.tax_subtotal;
                item_subtotal += record.item_subtotal;
                total += record.total;
                payment_subtotal += record.payment;
                surcharge_subtotal += record.surcharge_subtotal;
                discount_subtotal += record.discount_subtotal;
                promotion_subtotal += record.promotion_subtotal;
                revalue_subtotal += record.revalue_subtotal;

                record.status_str = this.statusToString(record.status);
            }, this);

            var footRecords = {
                tax_subtotal: tax_subtotal,
                item_subtotal: item_subtotal,
                total: total,
                surcharge_subtotal: surcharge_subtotal,
                discount_subtotal: discount_subtotal,
                promotion_subtotal: promotion_subtotal,
                revalue_subtotal: revalue_subtotal,
                payment_subtotal: payment_subtotal,
                rowCount: rowCount
            };
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.orderstatus.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
            
            this._reportRecords.body = records;
            
            this._reportRecords.foot.foot_datas = footRecords;
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
        
        exportCsv: function() {
            this._super(this);
        },
        
        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
