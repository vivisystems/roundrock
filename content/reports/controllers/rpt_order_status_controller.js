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

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields = [
                            'orders.transaction_created',
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
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.terminal_no'
                         ];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status < 100";
                            
            var orderstatus = document.getElementById( 'orderstatus' ).value;
            if ( orderstatus != 'all' )
            	conditions += " AND orders.status = " + orderstatus;
                            
            var service_clerk = document.getElementById( 'service_clerk' ).value;
            if ( service_clerk != 'all' )
            	conditions += " AND orders.service_clerk_displayname = '" + service_clerk + "'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                //var groupby = 'orders.terminal_no,"Order.Date"';
            } else {
                //var groupby = '"Order.Date"';
            }
            var groupby = '';
            var orderby = 'orders.terminal_no, orders.status, orders.item_subtotal desc';//orders.transaction_created, orders.id';
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' ) {
				var desc = '';
				
				switch ( sortby ) {
					case 'terminal_no':
					case 'service_clerk_displayname':
					case 'status':
						break;
					case 'transaction_created':
					case 'sequence':
					case 'invoice_no':
					case 'item_subtotal':
					case 'tax_subtotal':
					case 'surcharge_subtotal':
					case 'discount_subtotal':
					case 'total':
						desc = ' desc';
						break;
				}
				
            	orderby = 'orders.' + sortby + desc;
            }
            
            var order = new OrderModel();
            
            var records = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1 } );
            
            var tax_subtotal = 0;
        	var item_subtotal = 0;
        	var total = 0;
        	var surcharge_subtotal = 0;
        	var discount_subtotal = 0;
            
            records.forEach( function( record ) {
            	delete record.Order;
            	
            	tax_subtotal += record.tax_subtotal;
		    	item_subtotal += record.item_subtotal;
		    	total += record.total;
		    	surcharge_subtotal += record.surcharge_subtotal;
		    	discount_subtotal += record.discount_subtotal;
            	
            	switch ( parseInt( record.status, 10 ) ) {
            		case 1:
            			record.status = 'Finalized';
            			break;
            		case 2:
            			record.status = 'Saved';
            			break;
            		case -1:
            			record.status = 'Canceled';
            			break;
            	}
            });

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            var initZero = parseFloat(0).toFixed(precision_prices);
            var footRecords = {
            	tax_subtotal: tax_subtotal,
            	item_subtotal: item_subtotal,
            	total: total,
            	surcharge_subtotal: surcharge_subtotal,
            	discount_subtotal: discount_subtotal
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
            
            function addMenuitem( dbModel, fields, order, group, menupopupId, valueField, labelField ) {
		        //set up the designated pop-up menulist.
		        var records = dbModel.find( 'all', { fields: fields, order: order, group: group } );
		        var menupopup = document.getElementById( menupopupId );

		        records.forEach( function( data ) {
		            var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
		            menuitem.setAttribute( 'value', data[ valueField ] );
		            menuitem.setAttribute( 'label', data[ labelField ] );
		            menupopup.appendChild( menuitem );
		        });
		    }
		    	    
		    addMenuitem( new OrderModel(), [ 'service_clerk_displayname' ],
		    			[ 'service_clerk_displayname' ], [ 'service_clerk_displayname' ], 'service_clerk_menupopup', 'service_clerk_displayname', 'service_clerk_displayname' );

            this._enableButton(false);
        }
    });
})();
