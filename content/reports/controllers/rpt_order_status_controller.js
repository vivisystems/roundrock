(function(){

    /**
     * RptOrderStatus Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptOrderStatus',
        
        _fileName: "rpt_order_status",

        _set_reportRecords: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            
            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var machineid = document.getElementById('machine_id').value;
            var periodType = document.getElementById( 'period_type' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields = [
                            'orders.' + periodType + ' as "Order.time"',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.change',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.service_clerk_displayname',
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
                            "' AND orders.status < 100";
                            
            var orderstatus = document.getElementById( 'orderstatus' ).value;
            if ( orderstatus != 'all' )
            	conditions += " AND orders.status = " + orderstatus;
                            
            var service_clerk = document.getElementById( 'service_clerk' ).value;
            if ( service_clerk != 'all' )
            	conditions += " AND orders.service_clerk_displayname = '" + this._queryStringPreprocessor( service_clerk ) + "'";

			if ( shiftNo.length > 0 )
				conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
				
            if (machineid.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( machineid ) + "%'";
                
            var groupby = '';
            var orderby = 'orders.terminal_no, orders.status, orders.item_subtotal desc';
            
            if ( sortby != 'all' ) {
				var desc = '';
				
				switch ( sortby ) {
					case 'terminal_no':
					case 'service_clerk_displayname':
					case 'status':
					case 'time':
					case 'discount_subtotal':
					case 'promotion_subtotal':
					case 'revalue_subtotal':
						break;
					case 'sequence':
					case 'invoice_no':
					case 'item_subtotal':
					case 'tax_subtotal':
					case 'surcharge_subtotal':
					case 'total':
						desc = ' desc';
						break;
				}
				
            	orderby = sortby + desc;
            }
            
            var order = new OrderModel();
            
            var records = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1 } );
            
            var tax_subtotal = 0;
        	var item_subtotal = 0;
        	var total = 0;
        	var surcharge_subtotal = 0;
        	var discount_subtotal = 0;
        	var promotion_subtotal = 0;
        	var revalue_subtotal = 0;
            
            records.forEach( function( record ) {
            	delete record.Order;
            	
            	tax_subtotal += record.tax_subtotal;
		    	item_subtotal += record.item_subtotal;
		    	total += record.total;
		    	surcharge_subtotal += record.surcharge_subtotal;
		    	discount_subtotal += record.discount_subtotal;
		    	promotion_subtotal += record.promotion_subtotal;
		    	revalue_subtotal += record.revalue_subtotal;
            	
            	switch ( parseInt( record.status, 10 ) ) {
            		case 1:
            			record.status = _( 'Finalized' );
            			break;
            		case 2:
            			record.status = _( 'Saved' );
            			break;
            		case -1:
            			record.status = _( 'Canceled' );
            			break;
            		case -2:
            			record.status = _( 'Voided' );
            			break;
            	}
            });

            //var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            //var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            //var initZero = parseFloat(0).toFixed(precision_prices);
            var footRecords = {
            	tax_subtotal: tax_subtotal,
            	item_subtotal: item_subtotal,
            	total: total,
            	surcharge_subtotal: surcharge_subtotal,
            	discount_subtotal: discount_subtotal,
            	promotion_subtotal: promotion_subtotal,
            	revalue_subtotal: revalue_subtotal
            };
            
            this._reportRecords.head.titile = _( 'Order Status Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.machine_id = machineid;
            
            this._reportRecords.body = records;
            
            this._reportRecords.foot.foot_datas = footRecords;
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
		    	    
		    this._addMenuitem( new OrderModel(), [ 'service_clerk_displayname' ], "",
		    			'service_clerk_displayname', 'service_clerk_displayname', 'service_clerk_menupopup', 'service_clerk_displayname', 'service_clerk_displayname' );

            this._enableButton(false);
        }
    });
})();
