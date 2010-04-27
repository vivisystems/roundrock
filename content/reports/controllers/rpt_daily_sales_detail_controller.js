( function() {
    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptDailySalesDetail',
        
        _fileName: 'rpt_daily_sales_detail',
        
        _enableButton: function( enable ) {
            this._super( enable );
        	
            var disabled = !enable;
            $( '#previous_page' ).attr( 'disabled', disabled );
            $( '#next_page' ).attr( 'disabled', disabled );
        },

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            
            var terminalNo = document.getElementById( 'terminal_no' ).value;
            var sequenceNo = document.getElementById( 'sequence_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields =	'orders.id, ' +
                'orders.' + timeField + ' as time, ' +
                'orders.sequence, ' +
                'orders.total, ' +
                'orders.tax_subtotal, ' +
                'orders.item_subtotal, ' +
                'orders.discount_subtotal, ' +
                'orders.promotion_subtotal, ' +
                'orders.revalue_subtotal, ' +
                'orders.surcharge_subtotal, ' +
                'orders.qty_subtotal, ' +
                'orders.no_of_customers, ' +
                'orders.invoice_no, ' +
                'orders.sale_period, ' +
                'orders.shift_number, ' +
                'orders.rounding_prices, ' +
                'orders.precision_prices, ' +
                'orders.rounding_taxes, ' +
                'orders.precision_taxes, ' +
                'orders.surcharge_subtotal, ' +
                'orders.terminal_no, ' +
                'order_items.product_no, ' +
                'order_items.product_name, ' +
                'order_items.current_qty, ' +
                'order_items.current_price, ' +
                'order_items.current_subtotal, ' +
                'order_items.current_discount, ' +
                'order_items.current_surcharge, ' +
                'order_items.tax_name';
                            
            var tables = 'orders INNER JOIN order_items on orders.id = order_items.order_id';

            var conditions = "orders." + periodType + " >= '" + start +
                "' and orders." + periodType + " <= '" + end +
                "' and orders.status = '1'";

            if ( terminalNo.length > 0 )
                conditions += " and orders.terminal_no like '" + this._queryStringPreprocessor( terminalNo ) + "%'";
                
            if ( shiftNo.length > 0 ) 
                conditions += " and orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
          
            if ( sequenceNo.length > 0 )
                conditions += " and orders.sequence like '" + this._queryStringPreprocessor( sequenceNo ) + "%'";

            var orderby = 'orders.' +  timeField;
            
            if ( sortby != 'all' ) {
                var desc = "";
            	
                switch ( sortby ) {
                    case 'terminal_no':
                    case periodType:
                    case 'discount_subtotal':
                    case 'promotion_subtotal':
                    case 'revalue_subtotal':
                        orderby = sortby + ', ' + periodType;
                        break;
                    case 'item_subtotal':
                    case 'tax_subtotal':
                    case 'surcharge_subtotal':
                    case 'total':
                    case 'no_of_customers':
                    case 'qty_subtotal':
                        orderby = sortby + ' desc';
                        break;
                }
            }
            	
            //var limit = this._recordLimit + ' offset ' + this._recordOffset;
            	
            var sql = 'SELECT ' + fields + ' FROM ' + tables + ' WHERE ' + conditions + ' ORDER BY ' + orderby + ' LIMIT ' + limit + ';';

            var order = new OrderModel();

            var counts = order.getDataSource().fetchAll('SELECT count(id) as rowCount from (SELECT distinct (orders.id) ' + '  FROM '+ tables +' WHERE ' + conditions +')');
            var rowCount = counts[0].rowCount;

            var results = order.getDataSource().fetchAll( sql );
			
            var summary = {
                item_subtotal: 0,
                tax_subtotal: 0,
                surcharge_subtotal: 0,
                discount_subtotal: 0,
                promotion_subtotal: 0,
                revalue_subtotal: 0,
                payment: 0,
                guests: 0,
                items: 0,
                rowCount: rowCount
            };

            // re-synthesis the data retrieved from DB to fit the structure that .tpl files use.
            var records = [];
            var oid;
            var record;
            var isFirstRow = true;
			
            results.forEach( function( result ) {
			
                if ( oid != result.id ) {
                    if ( isFirstRow ) isFirstRow = false;
                    else records.push( record );
					
                    record = {};
                    record.OrderItem = [];
                    record.Order = {};
				
                    record.total = result.total;
                    record.sequence = result.sequence;
                    record.tax_subtotal = result.tax_subtotal;
                    record.item_subtotal = result.item_subtotal;
                    record.discount_subtotal = result.discount_subtotal;
                    record.promotion_subtotal = result.promotion_subtotal;
                    record.revalue_subtotal = result.revalue_subtotal;
                    record.surcharge_subtotal = result.surcharge_subtotal;
                    record.invoice_no = result.invoice_no;
                    record.qty_subtotal = result.qty_subtotal;
                    record.no_of_customers = result.no_of_customers;
                    record.terminal_no = result.terminal_no;
                    record.sale_period = result.sale_period;
                    record.shift_number = result.shift_number;
                    record.id = result.id;
					
                    record.Order.time = result.time;
					
                    summary.item_subtotal += result.item_subtotal;
                    summary.tax_subtotal += result.tax_subtotal;
                    summary.surcharge_subtotal += result.surcharge_subtotal;
                    summary.discount_subtotal += result.discount_subtotal;
                    summary.promotion_subtotal += result.promotion_subtotal;
                    summary.revalue_subtotal += result.revalue_subtotal;
                    summary.payment += result.total;
                    summary.guests += result.no_of_customers;
                    summary.items += result.qty_subtotal;
                }
				
                var item = {};

                item.product_no = result.product_no;
                item.product_name = result.product_name;
                item.current_qty = result.current_qty;
                item.current_price = result.current_price;
                item.current_subtotal = result.current_subtotal;
                item.current_discount = result.current_discount;
                item.current_surcharge = result.current_surcharge;
                item.tax_name = result.tax_name;
					
                record.OrderItem.push( item );
				
                oid = result.id;
            } );
            // trap the last order.
            if ( record ) records.push( record );
			
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.dailysalesdetail.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
			
            this._reportRecords.body = records;
			
            this._reportRecords.foot.foot_datas = summary;
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
            this._super( this );
        },

        execute: function() {
            this._super();
            this._registerOpenOrderDialog();
        },
        
        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
