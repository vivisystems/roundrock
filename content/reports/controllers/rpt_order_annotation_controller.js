(function(){

    /**
     * RptDailySalesSummary Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptOrderAnnotation',
        
        _fileName: 'rpt_order_annotation',

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var terminalNo = document.getElementById('terminal_no').value;
            
            var periodType = document.getElementById( 'period_type' ).value;
            var shiftNo = document.getElementById( 'shift_no' );
            
            var annotationType = document.getElementById( 'annotation_type' ).value;
            var orderstatus = document.getElementById( 'orderstatus' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields =    'orders.' + timeField + ' as time,' +
                            'orders.id,' +
                            'orders.service_clerk_displayname,' +
                            'orders.proceeds_clerk_displayname,' +
                            'orders.sequence,' +
                            'orders.status,' +
                            'orders.sale_period,' +
                            'orders.shift_number,' +
                            'orders.tax_subtotal,' +
                            'orders.item_subtotal,' +
                            'orders.total,' +
                            'orders.surcharge_subtotal,' +
                            'orders.discount_subtotal,' +
                            'orders.promotion_subtotal,' +
                            'orders.revalue_subtotal,' +
                            'orders.payment_subtotal - orders.change as payment,' +
                            'orders.terminal_no,' +
                            'order_annotations.type,' +
                            'order_annotations.text,' +
                            'orders.rounding_prices,' +
                            'orders.precision_prices,' +
                            'orders.rounding_taxes,' +
                            'orders.precision_taxes'

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'";

            if ( orderstatus != 'all' )
            	conditions += " AND orders.status = " + orderstatus;

            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
                
            if ( shiftNo.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            
            if ( annotationType != 'all' )
            	conditions += " and order_annotations.type = '" + this._queryStringPreprocessor( annotationType ) + "'";

            var orderby = 'order_annotations.type';
            if ( sortby != 'all' ) {
                switch ( sortby ) {
                    case 'time':
                        orderby += ', orders.' + timeField;
                        break;
                    case 'sequence':
                    case 'status':
                    case 'terminal_no':
                        orderby += ', orders.' + sortby;
	        			break;

	        		case 'item_subtotal':
	        		case 'tax_subtotal':
	        		case 'surcharge_subtotal':
	        		case 'discount_subtotal':
	        		case 'promotion_subtotal':
	        		case 'revalue_subtotal':
	        		case 'total':
                        orderby += ', orders.' + sortby + ' desc';
                        break;

	        		case 'text':
                        orderby += ', order_annotations.text';
	        			break;
	        	}
            }
            
            var order = new OrderModel();
			var sql = 'select ' + fields + ' from orders join order_annotations on orders.id = order_annotations.order_id where ' + conditions + ' order by ' + orderby + ';';
			var orderRecords = order.getDataSource().fetchAll( sql );
			
			var records = {};
			
			orderRecords.forEach( function( orderRecord ) {

                if (orderRecord.type) {
                    if (!(orderRecord.type in records)) {
                        records[ orderRecord.type ] = {
                            orders: [],
                            summary: {
                                item_subtotal: 0.0,
                                tax_subtotal: 0.0,
                                surcharge_subtotal: 0.0,
                                discount_subtotal: 0.0,
                                promotion_subtotal: 0.0,
                                revalue_subtotal: 0.0,
                                total: 0.0,
                                payment: 0.0
                            }
                        }
                    }
                }
            	switch ( parseInt( orderRecord.status, 10 ) ) {
            		case 1:
            			orderRecord.status = _( '(rpt)completed' );
            			break;
            		case 2:
            			orderRecord.status = _( '(rpt)stored' );
            			break;
            		case -1:
            			orderRecord.status = _( '(rpt)canceled' );
            			break;
            		case -2:
            			orderRecord.status = _( '(rpt)voided' );
            			break;
            	}
				records[ orderRecord.type ].orders.push( orderRecord );
				
				records[ orderRecord.type ].summary.item_subtotal += orderRecord.item_subtotal;
				records[ orderRecord.type ].summary.tax_subtotal += orderRecord.tax_subtotal;
				records[ orderRecord.type ].summary.surcharge_subtotal += orderRecord.surcharge_subtotal;
				records[ orderRecord.type ].summary.discount_subtotal += orderRecord.discount_subtotal;
				records[ orderRecord.type ].summary.promotion_subtotal += orderRecord.promotion_subtotal;
				records[ orderRecord.type ].summary.revalue_subtotal += orderRecord.revalue_subtotal;
				records[ orderRecord.type ].summary.total += orderRecord.total;
				records[ orderRecord.type ].summary.payment += orderRecord.payment;
			} );
            
            this._reportRecords.head.title = _( 'Order Annotation Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
            
            this._reportRecords.body = records;
        },
        
        execute: function() {
        	this._super();
        	this._registerOpenOrderDialog();
        },

        exportCsv: function() {
            this._super(this);
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
            
            this._addMenuitem( new OrderAnnotationModel(), [ 'type' ], '', 'type', 'type', 'annotationtype_menupopup', 'type', 'type' );

            this._enableButton(false);
        }
    };
    
    RptBaseController.extend( __controller__ );
})();
