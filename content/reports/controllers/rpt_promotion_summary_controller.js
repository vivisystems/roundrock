(function(){

    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptPromotionSummary',
        
        _fileName: "rpt_promotion_summary",
        
        _setData: function( start, end, periodType, shiftNo, sortBy, terminalNo, promotion, emptyPromotion ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = 	'strftime( "%Y-%m-%d", o.' + periodType + ', "unixepoch", "localtime" ) as date, ' +
            				'sum( o.total ) as total, ' +
            				'sum( op.discount_subtotal ) as promotion_subtotal, ' +
            				'op.promotion_id as promotion_id, ' +
            				'count( op.id ) as matched_count, ' +
            				'sum( op.matched_items_qty ) as matched_items_qty, ' +
            				'sum( op.matched_items_subtotal ) as matched_items_subtotal';
                            
            var conditions = "o." + periodType + ">='" + start +
                            "' and o." + periodType + "<='" + end + "' and o.status = 1";
            
            if (terminalNo.length > 0)
                conditions += " and o.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
            
            if ( shiftNo.length > 0 )
            	conditions += " and o.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            	
            if ( promotion != 'all' )
            	conditions += " and op.promotion_id = '" + this._queryStringPreprocessor( promotion ) + "'";

            var groupby = 'date, op.promotion_id, op.order_id';
            var orderby = 'date, op.promotion_id, op.order_id';
			
			var subquery = 	'select ' + fields + ' from order_promotions op join orders o on op.order_id = o.id' +
            				' where ' + conditions + ' group by ' + groupby + ' order by ' + orderby;
            				
            var s_fields =  's.date as date, ' +
            				'sum( s.total ) as total, ' +
            				'sum( s.promotion_subtotal ) as promotion_subtotal, ' +
            				's.promotion_id as promotion_id, ' +
            				'sum( s.matched_count ) as matched_count, ' +
            				'sum( s.matched_items_qty ) as matched_items_qty, ' +
            				'sum( s.matched_items_subtotal ) as matched_items_subtotal, ' +
            				'count( s.promotion_id ) as order_count';
            
            var s_orderby = sortBy;				
            // for sorting.
		    if ( sortBy != 'all' && sortBy != 'date' ) {
		    	switch ( sortBy ) {
					case 'total':
					case 'order_count':
					case 'promotion_subtotal':
					case 'matched_count':
					case 'matched_items_qty':
					case 'matched_items_subtotal':
						s_orderby += ' desc';
				}
			}
            				
            var sql = 'select ' + s_fields + ' from ( ' + subquery + ' ) as s group by s.date, s.promotion_id order by ' + s_orderby + ';';
           	
            var orderModel = new OrderModel();
  			var records = orderModel.getDataSource().fetchAll( sql );
  			
  			var promotionModel = new PromotionModel();
  			sql = 'select id, name, code from promotions group by id;';
  			var promotionIds = promotionModel.getDataSource().fetchAll( sql );
  			var results = {};
  			promotionIds.forEach( function( promotionId ) {
  				results[ promotionId.id ] = {
  					name: promotionId.name,
  					code: promotionId.code,
  					entries: [],
  					summary: {
  						total: 0,
  						order_count: 0,
  						promotion_subtotal: 0,
  						matched_count: 0,
  						matched_amount: 0,
  						matched_items_qty: 0,
  						matched_items_subtotal: 0
  					}
  				}
  			} );
  			
  			//var old_date = null;
  			//var old_promotion_id = null;
  			//var _self = this;
  			records.forEach( function( record ) {
  				//record.order_count = 1;
  				
  				//if ( record.date != old_date || record.promotion_id != old_promotion_id ) {
  				results[ record.promotion_id ].entries.push( record );
  				/*} else {
	  				var index = results[ record.promotion_id ].entries.length - 1;
	  				var entry = results[ record.promotion_id ].entries[ index ];
	  				
	  				entry[ 'order_count' ]++;
	  				
	  				for ( r in entry ) {
	  					if ( r != 'date' && r !='order_count' )
	  						entry[ r ] += record[ r ];
	  				}
	  			}*/
  				
  				for ( s in results[ record.promotion_id ].summary )
  					results[ record.promotion_id ].summary[ s ] += record[ s ];
  					
  				//old_date = record.date;
  				//old_promotion_id = record.promotion_id;
  			} );
  			
  			if ( emptyPromotion == 'hide' ) {
  				for ( id in results ) {
  					if ( results[ id ].entries.length == 0 )
  						delete results[ id ];
  				}
  			}

		    this._reportRecords.head.title = _( 'Promotion Summary Report' );
		    this._reportRecords.head.start_time = start_str;
		    this._reportRecords.head.end_time = end_str;
		    this._reportRecords.head.machine_id = terminalNo;
		    
		    this._reportRecords.body = results;
		},

        _set_reportRecords: function() {
            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var machineid = document.getElementById('machine_id').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var promotion = document.getElementById( 'promotion' ).value;
            var empty_promotion = document.getElementById( 'empty_promotion' ).value;

			this._setData( start, end, periodType, shiftNo, sortby, machineid, promotion, empty_promotion );
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
            
            // setup the promotion menu.
            this._addMenuitem( new PromotionModel(), [ 'name', 'id' ], '', 'name', 'id', 'promotion_menupopup', 'id', 'name' );

            this._enableButton( false );
        }
    };
    
    RptBaseController.extend( __controller__ );
})();
