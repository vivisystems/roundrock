(function(){

    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptDailySalesDetail',
        
        _fileName: 'rpt_daily_sales_detail',
        
        _enableButton: function( enable ) {
        	this._super( enable );
        	
            var disabled = !enable;
            $( '#previous_page' ).attr( 'disabled', disabled );
            $( '#next_page' ).attr( 'disabled', disabled );
        },

        _set_reportRecords: function() {
            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            
            var machineid = document.getElementById( 'machine_id' ).value;
            var sequenceNo = document.getElementById( 'sequence_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields =	'orders.id, ' +
            				'orders.' + periodType + ' as time, ' +
                            'orders.sequence, ' +
                            'orders.total, ' +
                            'orders.tax_subtotal, ' +
                            'orders.item_subtotal, ' +
                            'orders.discount_subtotal, ' +
                            'orders.promotion_subtotal, ' +
                            'orders.revalue_subtotal, ' +
                            'orders.surcharge_subtotal, ' +
                            'orders.items_count, ' +
                            'orders.no_of_customers, ' +
                            'orders.terminal_no, ' +
                            'order_items.product_no, ' +
                            'order_items.product_name, ' +
                            'order_items.current_qty, ' +
                            'order_items.current_price, ' +
                            'order_items.current_subtotal, ' +
                            'order_items.current_discount, ' +
                            'order_items.current_surcharge, ' +
                            'order_items.tax_name';
                            
            var tables = 'orders left join order_items on orders.id = order_items.order_id';

            var conditions = "orders." + periodType + " >= '" + start +
                            "' and orders." + periodType + " <= '" + end +
                            "' and orders.status = '1'";

            if ( machineid.length > 0 )
                conditions += " and orders.terminal_no like '" + this._queryStringPreprocessor( machineid ) + "%'";
                
            if ( shiftNo.length > 0 ) 
            	conditions += " and orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
          
            if ( sequenceNo.length > 0 )
            	conditions += " and orders.sequence like '" + this._queryStringPreprocessor( sequenceNo ) + "%'";

            var orderby = 'orders.item_subtotal desc';//orders.transaction_created';
            
            if ( sortby != 'all' ) {
            	var desc = "";
            	
            	switch ( sortby ) {
            		case 'terminal_no':
            		case periodType:
            		case 'discount_subtotal':
            		case 'promotion_subtotal':
            		case 'revalue_subtotal':
            			break;
            		case 'item_subtotal':
            		case 'tax_subtotal':
            		case 'surcharge_subtotal':
            		case 'total':
            		case 'no_of_customers':
            		case 'items_count':
            			desc = ' desc';
            	}
            	
            	orderby = sortby + desc;
            }
            	
            var limit = this._recordLimit + ' offset ' + this._recordOffset;
            	
            var sql = 'select ' + fields + ' from ' + tables + ' where ' + conditions + ' order by ' + orderby + ' limit ' + limit + ';';

            var order = new OrderModel();

			var results = order.getDataSource().fetchAll( sql );
			
			// prompt for the last data row.
			if ( results.length == 0 )
				alert( _( 'No datum!' ) );

			var summary = {
				item_subtotal: 0,
				tax_subtotal: 0,
				surcharge_subtotal: 0,
				discount_subtotal: 0,
				promotion_subtotal: 0,
				revalue_subtotal: 0,
				payment: 0
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
					record.items_count = result.items_count;
					record.no_of_customers = result.no_of_customers;
					record.terminal_no = result.terminal_no;
					record.id = result.id;
					
					record.Order.time = result.time;
					
					summary.item_subtotal += result.item_subtotal;
					summary.tax_subtotal += result.tax_subtotal;
					summary.surcharge_subtotal += result.surcharge_subtotal;
					summary.discount_subtotal += result.discount_subtotal;
					summary.promotion_subtotal += result.promotion_subtotal;
					summary.revalue_subtotal += result.revalue_subtotal;
					summary.payment += result.total;
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
			
			this._reportRecords.head.title = _( 'Daily Sales Report - Detail' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.machine_id = machineid;
			
			this._reportRecords.body = records;
			
			this._reportRecords.foot.foot_datas = summary;
        },
        
        execute: function() {
        	this._super();
        	this._registerOpenOrderDialog();
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

            this._enableButton(false);            
        }
    });
})();
