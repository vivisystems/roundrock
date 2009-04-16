(function(){

    /**
     * RptDailySalesSummary Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptOrderAnnotation',
        
        _fileName: 'rpt_order_annotation',

        _set_reportRecords: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var machineid = document.getElementById('machine_id').value;
            
            var periodType = document.getElementById( 'period_type' ).value;
            
            var annotationType = document.getElementById( 'annotation_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields =    'orders.' + periodType + ' as time,' +
                            'orders.id,' +
                            'orders.sequence,' +
                            'orders.tax_subtotal,' +
                            'orders.item_subtotal,' +
                            'orders.total,' +
                            'orders.surcharge_subtotal,' +
                            'orders.discount_subtotal,' +
                            'orders.terminal_no,' +
                            'order_annotations.type,' +
                            'order_annotations.text';

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'";

            if (machineid.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            
            if ( annotationType != 'all' )
            	conditions += " and order_annotations.type = '" + annotationType + "'";
            
            if ( sortby != 'all' ) {
		       switch ( sortby ) {
	        		case 'item_subtotal':
	        		case 'tax_subtotal':
	        		case 'surcharge_subtotal':
	        		case 'discount_subtotal':
	        		case 'total':
	        			'orders.' + sortby + ' desc';
	        			break;
	        		case 'text':
	        			'order_annotations.' + sortby;
	        			break;
	        	}
            }
            
            var orderby = sortby;

            var order = new OrderModel();
			var sql = 'select ' + fields + ' from orders join order_annotations on orders.id = order_annotations.order_id where ' + conditions + ' order by ' + orderby + ';';
			var orderRecords = order.getDataSource().fetchAll( sql );
			
			conditions = '';
			if ( annotationType != 'all' )
				conditions = ' where type = "' + annotationType + '"';
			var orderAnnotation = new OrderAnnotationModel();
			sql = 'select distinct type from order_annotations' + conditions + ';';
			var orderAnnotationRecords = orderAnnotation.getDataSource().fetchAll( sql );
			
			var records = {};
			orderAnnotationRecords.forEach( function( orderAnnotationRecord ) {
				records[ orderAnnotationRecord.type ] = {
					orders: [],
					summary: {
						item_subtotal: 0.0,
						tax_subtotal: 0.0,
						surcharge_subtotal: 0.0,
						discount_subtotal: 0.0,
						total: 0.0
					}
				};
			} );
			
			orderRecords.forEach( function( orderRecord ) {
				records[ orderRecord.type ].orders.push( orderRecord );
				
				records[ orderRecord.type ].summary.item_subtotal += orderRecord.item_subtotal;
				records[ orderRecord.type ].summary.tax_subtotal += orderRecord.tax_subtotal;
				records[ orderRecord.type ].summary.surcharge_subtotal += orderRecord.surcharge_subtotal;
				records[ orderRecord.type ].summary.discount_subtotal += orderRecord.discount_subtotal;
				records[ orderRecord.type ].summary.total += orderRecord.total;
			} );
            
            this._reportRecords.head.title = _( 'Order Annotation Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.machine_id = machineid;
            
            this._reportRecords.body = records;
        },
        
        execute: function() {
        	this._super();
        	
        	function orderDialog( orderID ) {
		        var aURL = 'chrome://viviecr/content/view_order.xul';
		        var aName = _( 'Order Details' );
		        var aArguments = { index: 'id', value: orderID };
		        var posX = 0;
		        var posY = 0;
		        var width = GeckoJS.Session.get( 'screenwidth' );
		        var height = GeckoJS.Session.get( 'screenheight' );
		        
		        GREUtils.Dialog.openWindow( window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, aArguments );
		    }
        	
        	var div = document.getElementById( 'preview_frame' ).contentWindow.document.getElementById( 'docbody' );
        	
        	div.addEventListener( 'click', function( event ) {
        		if ( event.originalTarget.parentNode.id && event.originalTarget.parentNode.tagName == 'TR' )
					orderDialog( event.originalTarget.parentNode.id );
			}, true );
        	
        	/*if ( table.hasChildNodes ) {
        		var children = table.getElementsByTagName( 'tr' );
        		
		    	for ( var i = 0; i < children.length; i++ ) {
		    		if ( children[ i ].id ) {
						children[ i ].addEventListener( 'click', function( event ) {
							orderDialog( event.currentTarget.id );
						}, true );
					}
		    	}
		    }*/
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
