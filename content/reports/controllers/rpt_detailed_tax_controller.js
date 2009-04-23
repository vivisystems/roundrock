(function(){

    /**
     * Detailed Tax Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptDetailedTax',
        
        _fileName: "rpt_detailed_tax",
        
        _setData: function( start, end, periodType, terminalNo ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);
            
            var orderItem = new OrderItemModel();

            var fields = [
            				'orders.' + periodType + ' as "Order.time"',
            				'orders.sequence',
            				'orders.total',
            				'orders.tax_subtotal',
            				'orders.included_tax_subtotal',
            				'orders.promotion_subtotal',
            				'order_items.order_id',
            				'order_items.tax_name',
            				'order_items.tax_type',
            				'order_items.current_subtotal',
            				'order_items.current_qty',
            				'order_items.current_price',
                            'SUM("order_items"."current_tax") + SUM("order_items"."included_tax") as "OrderItem.tax"'
                         ];
                            
            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'" +
                            " and orders.status = 1";
            
            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + terminalNo + "%'";

            var groupby = 'order_items.order_id, order_items.tax_name, order_items.tax_type';
            var orderby = 'orders.sequence';

            var datas = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby } );
            
            var orderAdditions = new OrderAdditionModel();
            
            var orderAdditionRecords = orderAdditions.find( 'all',
            	{ fields: [ 'order_id', 'sum( current_surcharge ) as surcharge_subtotal', 'sum( current_discount ) as discount_subtotal' ], group: 'order_id', recursive: 0 } );

			var typeCombineTax = 'COMBINE';
			var taxList = [];
			TaxComponent.prototype.getTaxList().forEach( function( tax ) {
				if ( tax.type != typeCombineTax )
					taxList.push( tax );
			} );

			var summary = {
				total: 0,
				tax_subtotal: 0,
				included_tax_subtotal: 0,
				surcharge_subtotal: 0,
				discount_subtotal: 0,
				promotion_subtotal: 0
			};
			
			taxList.forEach( function( tax ) {
				if ( tax.type != typeCombineTax )
					summary[ tax.no ] = 0;
			} );

			var oid;
			records = {};
			datas.forEach( function( data ) {
				if ( data.order_id != oid ) {
					oid = data.order_id;
					records[ oid ] = GREUtils.extend( {}, data );
					records[ oid ][ 'surcharge_subtotal' ] = 0;
					records[ oid ][ 'discount_subtotal' ] = 0;

					taxList.forEach( function( tax ) {
						if ( tax.type != typeCombineTax )
							records[ oid ][ tax.no ] = 0;
					} );
					
					orderAdditionRecords.forEach( function( orderAdditionRecord ) {
						if ( orderAdditionRecord.order_id == data.order_id ) {
							records[ oid ][ 'surcharge_subtotal' ] += orderAdditionRecord.surcharge_subtotal;
							records[ oid ][ 'discount_subtotal' ] += orderAdditionRecord.discount_subtotal;
						}
					} );
					
					summary.total += data.Order.total;
					summary.tax_subtotal += data.Order.tax_subtotal;
					summary.included_tax_subtotal += data.Order.included_tax_subtotal;
					summary.surcharge_subtotal += records[ oid ][ 'surcharge_subtotal' ];
					summary.discount_subtotal += records[ oid ][ 'discount_subtotal' ];
					summary.promotion_subtotal += data.Order.promotion_subtotal;
				}
				
				var taxObject = TaxComponent.prototype.getTax( data.tax_name );
				
				if ( taxObject.type != typeCombineTax ) {
					records[ oid ][ data.tax_name ] += data.tax;
					summary[ data.tax_name ] += data.tax;
				} else {// break down the combined tax.
					taxObject.CombineTax.forEach( function( cTax ) {
						taxAmountObject = TaxComponent.prototype.calcTaxAmount( cTax.no, data.current_subtotal, data.current_price, data.current_qty );
						taxAmount = taxAmountObject[ cTax.no ].charge + taxAmountObject[ cTax.no ].included;
						records[ oid ][ cTax.no ] += taxAmount;
						summary[ cTax.no ] += taxAmount;
					} );
				}
			} );
			
			this._reportRecords.head.title = _( 'Detailed Tax Report' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.machine_id = terminalNo;
			
			this._reportRecords.body = records;
			
			this._reportRecords.taxList = taxList;
			
			this._reportRecords.foot.summary = summary;
		},

        _set_reportRecords: function() {
            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var machineid = document.getElementById('machine_id').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;

			this._setData( start, end, periodType, machineid );
        },
        
        /*exportPdf: function() {
        	this._super( {
        		paperSize: {
        			width: 297,
        			height: 210
        		}
        	} );
        },*/

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
