(function(){

    /**
     * Detailed Tax Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptDetailedTax',
        
        _fileName: "rpt_detailed_tax",
        
        _setData: function( start, end, periodType, terminalNo, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var orderItem = new OrderItemModel();

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
            				'orders.' + timeField + ' as "Order.time"',
                            'orders.terminal_no',
            				'orders.sequence',
                            'orders.sale_period',
                            'orders.shift_number',
            				'orders.total',
                            'orders.invoice_no',
            				'orders.tax_subtotal',
            				'orders.included_tax_subtotal',
            				'orders.promotion_subtotal',
            				'orders.revalue_subtotal',
                            'orders.precision_prices',
                            'orders.rounding_prices',
                            'orders.precision_taxes',
                            'orders.rounding_taxes',
            				'order_items.order_id',
            				'order_items.tax_name',
            				'order_items.tax_type',
            				'order_items.current_subtotal',
            				'order_items.current_qty',
            				'order_items.current_price',
                            'SUM("order_items"."current_subtotal" + "order_items"."current_discount" + "order_items"."current_surcharge") as "OrderItem.current_subtotal"',
                            'SUM("order_items"."current_tax") + SUM("order_items"."included_tax") as "OrderItem.tax"'
                         ];
                            
            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'" +
                            " and orders.status = 1";
            
            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";

            var groupby = 'order_items.order_id, order_items.tax_name, order_items.tax_type';
            var orderby = 'orders.' + timeField + ', orders.sequence';

            var datas = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: limit } );

            var orderAdditions = new OrderAdditionModel();
            
            var orderAdditionRecords = orderAdditions.find( 'all',
            	{ fields: [ 'order_id', 'sum( current_surcharge ) as surcharge_subtotal', 'sum( current_discount ) as discount_subtotal' ], group: 'order_id', recursive: 0 } );

			var typeCombineTax = 'COMBINE';
			var taxList = [];
            var taxesByName = {};
            /*
			TaxComponent.prototype.getTaxList().forEach( function( tax ) {
				if ( tax.type != typeCombineTax ) {
					taxList.push( tax );
                    taxesByName[tax.name] = tax;
                }
			} );
            */

			var summary = {
				total: 0,
				tax_subtotal: 0,
				included_tax_subtotal: 0,
				surcharge_subtotal: 0,
				discount_subtotal: 0,
				promotion_subtotal: 0,
				revalue_subtotal: 0
			};
			/*
			taxList.forEach( function( tax ) {
				if ( tax.type != typeCombineTax )
					summary[ tax.no ] = {
                        tax_subtotal: 0,
                        item_subtotal: 0
                    }
			} );
            */
           
			var oid;
			var records = {};
			datas.forEach( function( data ) {
				if (!( data.order_id in records )) {
					oid = data.order_id;
					records[ oid ] = GREUtils.extend( {}, data );
					records[ oid ][ 'surcharge_subtotal' ] = 0;
					records[ oid ][ 'discount_subtotal' ] = 0;

                    /*
					taxList.forEach( function( tax ) {
						if ( tax.type != typeCombineTax )
							records[ oid ][ tax.no ] = {
                                tax_subtotal: 0,
                                item_subtotal: 0
                            }
					} );
					*/

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
					summary.revalue_subtotal += data.Order.revalue_subtotal;
				}


                // need to push tax into tax list if data.tax_name not in taxList
                if (!(data.tax_name in taxesByName)) {
                    taxList.push({no: data.tax_name, name: data.tax_name});
                    taxesByName[data.tax_name] = 1;
                }
				var taxObject = TaxComponent.prototype.getTax( data.tax_name );
				
				if (!taxObject || taxObject.type != typeCombineTax ) {
                    if (records[ oid ]) {
                        if (data.tax_name in records[oid]) {
                            records[ oid ][ data.tax_name ].tax_subtotal += data.tax;
                            records[ oid ][ data.tax_name ].item_subtotal += data.current_subtotal;
                        }
                        else {
                            records[ oid ][ data.tax_name ] = {
                                tax_subtotal: data.tax,
                                item_subtotal: data.current_subtotal
                            }
                        }
                    }
                    if (data.tax_name in summary) {
                        summary[ data.tax_name ].tax_subtotal += data.tax;
                        summary[ data.tax_name ].item_subtotal += data.current_subtotal;
                    }
                    else {
                        summary[ data.tax_name ] = {
                            tax_subtotal: data.tax,
                            item_subtotal: data.current_subtotal
                        }
                    }
				} else {// break down the combined tax.
					taxObject.CombineTax.forEach( function( cTax ) {
						var taxAmountObject = TaxComponent.prototype.calcTaxAmount( cTax.no, data.current_subtotal, data.current_price, data.current_qty );
						var taxAmount = taxAmountObject[ cTax.no ].charge + taxAmountObject[ cTax.no ].included;
                        if (cTax.no in records[ oid ] ) {
                            records[ oid ][ cTax.no ].tax_subtotal += taxAmount;
                            records[ oid ][ cTax.no ].item_subtotal += data.current_subtotal;
                        }
                        else {
                            records[ oid ][ cTax.no ] = {
                                tax_subtotal: taxAmount,
                                item_subtotal: data.current_subtotal
                            }
                        }
                        if (cTax.no in summary) {
                            summary[ cTax.no ].tax_subtotal += taxAmount;
                            summary[ cTax.no ].item_subtotal += data.current_subtotal;
                        }
                        else {
                            summary[ cTax.no ] = {
                                tax_subtotal: taxAmount,
                                item_subtotal: data.current_subtotal
                            }
                        }
					} );
				}
			} );
			
			this._reportRecords.head.title = _( 'Detailed Tax Report' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.terminal_no = terminalNo;
			
			this._reportRecords.body = records;
			
			this._reportRecords.taxList = taxList;
			
			this._reportRecords.foot.summary = summary;
		},

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var terminalNo = document.getElementById('terminal_no').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;

			this._setData( start, end, periodType, terminalNo, limit );
        },
        
        exportCsv: function() {
            this._super(this);
        },

        execute: function() {
        	this._super();
        	this._registerOpenOrderDialog();
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
