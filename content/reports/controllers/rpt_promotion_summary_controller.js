( function() {
    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        
        name: 'RptPromotionSummary',
        
        _fileName: "rpt_promotion_summary",
        
        _setData: function( start, end, periodType, shiftNo, sortBy, terminalNo, promotion, emptyPromotion, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = 'strftime( "%Y-%m-%d", o.' + periodType + ', "unixepoch", "localtime" ) as date, ' +
                         'sum( o.item_subtotal ) as gross, ' +
                         'sum( op.discount_subtotal ) as promotion_subtotal, ' +
                         'op.promotion_id as promotion_id, ' +
                         'op.name as promotion_name, ' +
                         'op.code as promotion_code, ' +
                         'sum( op.current_tax ) as tax_subtotal, ' +
                         'sum( op.included_tax ) as included_tax_subtotal, ' +
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
			
            var subquery = 	'SELECT ' + fields + ' FROM orders o INNER JOIN order_promotions op ON (o.id= op.order_id) ' +
            ' WHERE ' + conditions + ' GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT -1';
            				
            var s_fields = 's.date as date, ' +
                           'sum( s.gross ) as gross, ' +
                           'sum( s.promotion_subtotal ) as promotion_subtotal, ' +
                           's.promotion_id as promotion_id, ' +
                           's.promotion_name as promotion_name, ' +
                           's.promotion_code as promotion_code, ' +
                           'sum( 0 - s.tax_subtotal ) as tax_subtotal, ' +
                           'sum( 0 - s.included_tax_subtotal ) as included_tax_subtotal, ' +
                           'sum( s.matched_count ) as matched_count, ' +
                           'sum( s.matched_items_qty ) as matched_items_qty, ' +
                           'sum( s.matched_items_subtotal ) as matched_items_subtotal, ' +
                           'count( s.promotion_id ) as order_count';
            
            var s_orderby = sortBy;				
            // for sorting.
            if ( sortBy != 'all' && sortBy != 'date' ) {
                switch ( sortBy ) {
                    case 'gross':
                    case 'order_count':
                    case 'matched_count':
                    case 'matched_items_qty':
                    case 'matched_items_subtotal':
                        s_orderby += ' desc';
                        break;
                    case 'promotion_subtotal':
                        break;
                }
            }
            				
            var sql = 'select ' + s_fields + ' from ( ' + subquery + ' ) as s group by s.date, s.promotion_id order by ' + s_orderby + ' limit -1;';

            // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var orderModel = new OrderModel();

            orderModel.useDbConfig = useDbConfig; // udpate dbconfig

            var records = orderModel.getDataSource().fetchAll( sql );
            			
            var promotionModel = new PromotionModel();

            //sql = 'select id, name, code from promotions group by id order by name limit -1;';
            var promotionIds = promotionModel.find('all', {
                fields: ['id', 'name', 'code'],
                order: 'name, code',
                group: 'id',
                limit: this._csvLimit
            });
            var results = {};
            promotionIds.forEach( function( promotionId ) {
                results[ promotionId.id ] = {
                    name: promotionId.name,
                    code: promotionId.code,
                    entries: [],
                    summary: {
                        gross: 0,
                        order_count: 0,
                        promotion_subtotal: 0,
                        tax_subtotal: 0,
                        included_tax_subtotal: 0,
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
  				
                if ( record.promotion_id in results) {
                    results[ record.promotion_id ].entries.push( record );
                }
                else {
                    results[ record.promotion_id ] = {
                        name: record.promotion_name + ' - ' + _('Obsolete'),
                        code: record.promotion_code + ' - ' + _('Obsolete'),
                        entries: [ record ],
                        summary: {
                            gross: 0,
                            order_count: 0,
                            promotion_subtotal: 0,
                            tax_subtotal: 0,
                            included_tax_subtotal: 0,
                            matched_count: 0,
                            matched_amount: 0,
                            matched_items_qty: 0,
                            matched_items_subtotal: 0
                        }
                    }
                }
  				
                for ( s in results[ record.promotion_id ].summary )
                    results[ record.promotion_id ].summary[ s ] += record[ s ];
            } );
  			
            if ( emptyPromotion == 'hide' ) {
                for ( id in results ) {
                    if ( results[ id ].entries.length == 0 )
                        delete results[ id ];
                }
            }

            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.promotionsummary.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
		    
            this._reportRecords.body = results;
        },

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var terminalNo = document.getElementById('terminal_no').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var promotion = document.getElementById( 'promotion' ).value;
            var empty_promotion = document.getElementById( 'empty_promotion' ).value;

            this._setData( start, end, periodType, shiftNo, sortby, terminalNo, promotion, empty_promotion );
        },
        
        exportCsv: function() {
            this._super(this, true);
        },

        load: function() {
            this._super();
            
            // setup the promotion menu.
            this._addMenuitem( new PromotionModel(), [ 'name', 'id' ], '', 'name', 'id', 'promotion_menupopup', 'id', 'name' );
        }
    };
    
    RptBaseController.extend( __controller__ );
} )();
