(function(){

    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptProductSales',
        
        _fileName: "rpt_product_sales",
        
        _setData: function( start, end, periodType, shiftNo, sortBy, terminalNo, department, empty_department ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var orderItem = new OrderItemModel();

            var fields = [
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.cate_no'
                         ];
                            
            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'";
            
            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + terminalNo + "%'";
            
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = " + shiftNo;

            var groupby = 'order_items.product_no';
            var orderby = '"OrderItem.total" desc';
            
            // prepare category stuff.
            var deptCondition = '';
            if ( department != 'all' ) {
            	conditions += " AND order_items.cate_no = '" + department + "'";
            	deptCondition = 'no = "' + department + '"';
            }
            
	        var categoryModel = new CategoryModel();
	        var categoryRecords = categoryModel.find( 'all', {
	            fields: [ 'no', 'name' ],
	            conditions: deptCondition,
	            order: 'no'
	        } );
	        
	        var categories = {};
	        
	        categoryRecords.forEach( function( categoryRecord ) {
	        	categories[ categoryRecord.no ] = {
	        		no: categoryRecord.no,
	        		name: categoryRecord.name,
	        		orderItems: [],
	        		summary: {
	        			qty: 0.0,
	        			total: 0.0
	        		}
	        	}
	        } );

            var orderItemRecords = orderItem.find( 'all',{ fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby } );

            orderItemRecords.forEach( function( record ) {
            	delete record.OrderItem;
				record[ 'avg_price' ] = record[ 'total' ] / record[ 'qty' ];
				
                categories[ record.cate_no ].orderItems.push( record );
                categories[ record.cate_no ].summary.qty += record.qty;
                categories[ record.cate_no ].summary.total += record.total;
            } );
            
            // insert the zero sales products.
            var noSalesProduct = document.getElementById( 'no_sales_product' ).value;
            if ( noSalesProduct == 'show' ) {
		        var productModel = new ProductModel();
		        var sql = 'attach database "/data/databases/vivipos_order.sqlite" as vivipos_order;';
		        productModel.execute( sql );
		        sql = 'select no, name, cate_no from products where no not in ( select distinct product_no from vivipos_order.order_items ) order by no;';
		        var zeroSalesProducts = productModel.getDataSource().fetchAll( sql );
		        sql = 'detach database vivipos_order;';
		        productModel.execute( sql );
		        
		        zeroSalesProducts.forEach( function( zeroSalesProducts ) {
		        	categories[ zeroSalesProducts.cate_no ].orderItems.push( {
		        		product_no: zeroSalesProducts.no,
		        		product_name: zeroSalesProducts.name,
		        		avg_price: 0,
		        		qty: 0,
		        		total: 0
		        	} );
		        } );
		    }
            
            // hide the no sales department if users want it that way.
            if ( empty_department == 'hide' ) {
		        for ( var category in categories ) {
		        	if ( categories[ category ].orderItems.length == 0 )
		        		delete categories[ category ];
		        }
		    }
		    
		    // for sorting.
		    if ( sortBy != 'all' ) {
		    	for ( var category in categories ) {
		    		categories[ category ].orderItems.sort(
						function ( a, b ) {
							a = a[ sortBy ];
							b = b[ sortBy ];
						
							switch ( sortBy ) {
								case 'product_no':
								case 'product_name':
									if ( a > b ) return 1;
									if ( a < b ) return -1;
									return 0;
								case 'avg_price':
								case 'qty':
								case 'total':
									if ( a < b ) return 1;
									if ( a > b ) return -1;
									return 0;
							}
						}
					);
				}
			}
		    
		    this._reportRecords.head.title = _( 'Product Sales Report' );
		    this._reportRecords.head.start_time = start_str;
		    this._reportRecords.head.end_time = end_str;
		    this._reportRecords.head.machine_id = terminalNo;
		    
		    this._reportRecords.body = categories;
		},

        _set_reportRecords: function() {
            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var machineid = document.getElementById('machine_id').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var department = document.getElementById( 'department' ).value;
            var empty_department = document.getElementById( 'empty_department' ).value;

			this._setData( start, end, periodType, shiftNo, sortby, machineid, department, empty_department );
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
            
            // setup the department menu.
            var cate = new CategoryModel();
            var cateRecords = cate.find('all', {
                fields: ['no','name']
                });
            var dpt = document.getElementById( 'department_menupopup' );

            cateRecords.forEach( function( data ){
                var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
                menuitem.setAttribute( 'value', data.no );
                menuitem.setAttribute( 'label', data.no + "-" + data.name );
                dpt.appendChild( menuitem );
            });

            this._enableButton( false );
        }
    });
})();
