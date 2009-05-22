(function(){

    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptProductSales',
        
        _fileName: "rpt_product_sales",
        
        _setData: function( start, end, periodType, shiftNo, sortby, terminalNo, department, empty_department, noSalesProduct, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var orderItem = new OrderItemModel();

            var fields = [
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.gross"',
                            'SUM("order_items"."current_subtotal" + "order_items"."current_discount" + "order_items"."current_surcharge") as "OrderItem.net"',
                            'order_items.cate_no',
                            'order_items.cate_name'
                         ];
                            
            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'" +
                            " AND orders.status = 1";
            
            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
            
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";

            var groupby = "order_items.product_no";

            var orderby = '';

            switch(sortby) {
                case 'product_no':
                case 'product_name':
                    orderby = sortby;
                    break;

                case 'avg_price':
                case 'qty':
                case 'gross':
                case 'net':
                    orderby = '"OrderItem.' + sortby + '" desc';
                    break;
            }
            
            // prepare category stuff.
            var deptCondition = '';
            if ( department != 'all' ) {
            	conditions += " AND order_items.cate_no = '" + this._queryStringPreprocessor( department ) + "'";
            	deptCondition = "no = '" + this._queryStringPreprocessor( department ) + "'";
            }
            
	        var categoryModel = new CategoryModel();
	        var categoryRecords = categoryModel.find( 'all', {
	            fields: [ 'no', 'name' ],
	            conditions: deptCondition,
	            order: 'no',
                limit: this._csvLimit
	        } );
	        
	        var categories = {};
	        
	        categoryRecords.forEach( function( categoryRecord ) {
	        	categories[ categoryRecord.no ] = {
	        		no: categoryRecord.no,
	        		name: categoryRecord.name,
	        		orderItems: [],
                    prodByNo: {},
	        		summary: {
	        			qty: 0,
	        			gross: 0.0,
	        			net: 0.0
	        		}
	        	}
	        } );
            var orderItemRecords = orderItem.find( 'all',{ fields: fields, conditions: conditions, group: groupby, recursive: 1, order: orderby, limit: this._csvLimit } );

            orderItemRecords.forEach( function( record ) {
            	delete record.OrderItem;
                if (record['qty'] > 0)
                    record[ 'avg_price' ] = record[ 'gross' ] / record[ 'qty' ];
                else
                    record[ 'avg_price' ] = 0.0;

                if (!(record.cate_no in categories)) {
                    categories[ record.cate_no ] = {
                        no: record.cate_no,
                        name: record.cate_name,
                        orderItems: [ record ],
                        summary: {qty: record.qty, gross: record.gross, net: record.net},
                        prodByNo: {}
                    };
                }
                else {
                    categories[ record.cate_no ].orderItems.push( record );
                    categories[ record.cate_no ].summary.qty += record.qty;
                    categories[ record.cate_no ].summary.gross += record.gross;
                    categories[ record.cate_no ].summary.net += record.net;
                }
                categories[ record.cate_no ].prodByNo[ record.product_no ] = 1;
            } );
            
            // insert the zero sales products.
            if ( noSalesProduct == 'show' ) {
		        var productModel = new ProductModel();
		        var allProducts = productModel.find('all', {limit: 3000000});
		        
		        allProducts.forEach( function( p ) {
                    if (!(p.cate_no in categories)) {
                        categories[ p.cate_no ] = {
                            no: p.cate_no,
                            name: p.cate_no + ' - ' + _('Obsolete'),
                            orderItems: [ p ],
                            summary: {qty: 0, gross: 0.0, net: 0.0},
                            prodByNo: {}
                        };
                        categories[ p.cate_no ].prodByNo[ p.no ] = 1;
                    }
                    else if (!(p.no in categories[ p.cate_no ].prodByNo)) {
                        categories[ p.cate_no ].orderItems.push( {
                            product_no: p.no,
                            product_name: p.name,
                            avg_price: 0.0,
                            qty: 0,
                            gross: 0.0,
                            net: 0.0
                        } );
                    }
                });
		    }
            
            // hide the no sales department if users want it that way.
            if ( empty_department == 'hide' ) {
		        for ( var category in categories ) {
		        	if ( categories[ category ].summary.qty == 0 )
		        		delete categories[ category ];
		        }
		    }
		    
		    // for sorting.
		    if ( sortby != 'all' ) {
		    	for ( var category in categories ) {
		    		categories[ category ].orderItems.sort(
						function ( a, b ) {
							a = a[ sortby ];
							b = b[ sortby ];

							switch ( sortby ) {
								case 'avg_price':
								case 'qty':
								case 'gross':
                                case 'net':
									if ( a < b ) return 1;
									if ( a > b ) return -1;
									return 0;
								case 'product_no':
								case 'product_name':
									if ( a > b ) return 1;
									if ( a < b ) return -1;
									return 0;
							}
						}
					);
				}
			}
		    
		    this._reportRecords.head.title = _( 'Product Sales Report' );
		    this._reportRecords.head.start_time = start_str;
		    this._reportRecords.head.end_time = end_str;
		    this._reportRecords.head.terminal_no = terminalNo;
		    
		    this._reportRecords.body = categories;
		},

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var waitPanel = this._showWaitPanel( 'wait_panel' );

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var terminalNo = document.getElementById( 'terminal_no' ).value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var department = document.getElementById( 'department' ).value;
            var empty_department = document.getElementById( 'empty_department' ).value;
            var noSalesProduct = document.getElementById( 'no_sales_product' ).value;

			this._setData( start, end, periodType, shiftNo, sortby, terminalNo, department, empty_department, noSalesProduct, limit );
        },
        
        exportCsv: function() {
            this._super(this, true);
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
            
            // setup the department menu.
            var cate = new CategoryModel();
            var cateRecords = cate.find( 'all', {
                fields: [ 'no', 'name' ]
                } );
            var dpt = document.getElementById( 'department_menupopup' );

            cateRecords.forEach( function( data ){
                var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
                menuitem.setAttribute( 'value', data.no );
                menuitem.setAttribute( 'label', data.no + "-" + data.name );
                dpt.appendChild( menuitem );
            });

            this._enableButton( false );
        }
    };

    RptBaseController.extend(__controller__);
})();
