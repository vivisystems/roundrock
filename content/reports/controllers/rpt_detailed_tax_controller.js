( function() {
    /**
     * Detailed Tax Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptDetailedTax',
        
        _fileName: "rpt_detailed_tax",
        
        _setData: function( start, end, periodType, terminalNo, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var orderItem = new OrderItemModel();

            var sortby = document.getElementById( 'sortby' ).value;

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
            'orders.' + timeField + ' as "Order.time"',
            'orders.terminal_no as "Order.terminal_no"',
            'orders.sequence as "Order.sequence"',
            'orders.sale_period as "Order.sale_period"',
            'orders.shift_number as "Order.shift_number"',
            'orders.total as "Order.total"',
            'orders.invoice_no as "Order.invoice_no"',
            'orders.discount_subtotal as "Order.discount_subtotal"',
            'orders.surcharge_subtotal as "Order.surcharge_subtotal"',
            'orders.tax_subtotal as "Order.tax_subtotal"',
            'orders.included_tax_subtotal as "Order.included_tax_subtotal"',
            'orders.promotion_subtotal as "Order.promotion_subtotal"',
            'orders.revalue_subtotal as "Order.revalue_subtotal"',
            'orders.precision_prices as "Order.precision_prices"',
            'orders.rounding_prices as "Order.rounding_prices"',
            'orders.precision_taxes as "Order.precision_taxes"',
            'orders.rounding_taxes as "Order.rounding_taxes"',
            'order_items.order_id as "order_id"',
            'order_items.tax_name as "tax_name"',
            'order_items.tax_type as "tax_type"',
            'order_items.current_qty as "current_qty"',
            'order_items.current_price as "current_price"',
            'order_items.current_discount as "current_discount"',
            'order_items.current_surcharge as "current_surcharge"',
            '(order_items.current_subtotal + order_items.current_discount + order_items.current_surcharge) as "current_subtotal"',
            '(order_items.current_tax + order_items.included_tax) as "tax"'
            ];
                            
            var conditions = "orders." + periodType + ">='" + start +
            "' AND orders." + periodType + "<='" + end + "'" +
            " and orders.status = 1";
            
            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";

            var orderby = 'orders.' + timeField + ', orders.sequence';

            /*
            var datas = orderItem.find( 'all', {
                fields: fields,
                conditions: conditions,
                recursive:1,
                order: orderby,
                limit: limit
            } );*/

            var counts = orderItem.getDataSource().fetchAll('SELECT count(id) as rowCount from (SELECT distinct (orders.id) ' + '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + ')');
            var rowCount = counts[0].rowCount;

            var datas = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + ' ORDER BY ' + orderby + ' LIMIT 0, ' + limit);

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
            var taxComponentObj = new TaxComponent();
            var oid;
            var records = {};
            datas.forEach( function( data ) {
                oid = data.order_id;
                if (!( oid in records )) {
                    records[ oid ] = GREUtils.extend( {}, data );
                    records[ oid ][ 'surcharge_subtotal' ] = data.Order.surcharge_subtotal;
                    records[ oid ][ 'discount_subtotal' ] = data.Order.discount_subtotal;

                    /*
					taxList.forEach( function( tax ) {
						if ( tax.type != typeCombineTax )
							records[ oid ][ tax.no ] = {
                                tax_subtotal: 0,
                                item_subtotal: 0
                            }
					} );
					*/

                    summary.total += data.Order.total;
                    summary.tax_subtotal += data.Order.tax_subtotal;
                    summary.included_tax_subtotal += data.Order.included_tax_subtotal;
                    summary.surcharge_subtotal += data.Order.surcharge_subtotal;
                    summary.discount_subtotal += data.Order.discount_subtotal;
                    summary.promotion_subtotal += data.Order.promotion_subtotal;
                    summary.revalue_subtotal += data.Order.revalue_subtotal;
                }

                // back item discount/surcharge out of order discount/surcharge totals
                records[ oid ][ 'surcharge_subtotal' ] -= data.current_surcharge || 0;
                records[ oid ][ 'discount_subtotal' ] -= data.current_discount || 0;

                summary.surcharge_subtotal -= data.current_surcharge || 0;
                summary.discount_subtotal -= data.current_discount || 0;
                
                var taxObject = taxComponentObj.getTax( data.tax_name );
				
                if (!taxObject || taxObject.type != typeCombineTax ) {

                    // need to push tax into tax list if data.tax_name not in taxList
                    if (!(data.tax_name in taxesByName)) {
                        taxList.push({
                            no: data.tax_name,
                            name: data.tax_name
                            });
                        taxesByName[data.tax_name] = 1;
                    }

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

                        // need to push tax into tax list if cTax.no not in taxList
                        if (!(cTax.no in taxesByName)) {
                            taxList.push({
                                no: cTax.no,
                                name: cTax.tax_name
                                });
                            taxesByName[cTax.no] = 1;
                        }

                        var taxAmountObject = taxComponentObj.calcTaxAmount( cTax.no, data.current_subtotal, data.current_price, data.current_qty );
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
            if ( sortby != 'all' ) {
                records = GeckoJS.BaseObject.getValues(records);
                records.sort(
                    function ( a, b ) {
                        a = a[ sortby ];
                        b = b[ sortby ];

                        switch ( sortby ) {
                            case 'terminal_no':
                            case 'time':
                            case 'sequence':
                            case 'invoice_no':
                                if ( a > b ) return 1;
                                if ( a < b ) return -1;
                                return 0;
                            case 'total':
                                if ( a < b ) return 1;
                                if ( a > b ) return -1;
                                return 0;
                        }
                    }
                    );
            }
			
            this._reportRecords.head.title = _( 'Detailed Tax Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
            this._reportRecords.head.rowCount = rowCount;
			
            this._reportRecords.body = records;
			
            this._reportRecords.taxList = taxList;
			
            this._reportRecords.foot.summary = summary;
        },

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

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
        
        exportPdf: function() {
            this._super( {
                paperSize: {
                    width: 297,
                    height: 210
                }
            } );
        },
        
        print: function() {
            this._super( {
                orientation: "landscape"
            } );
        },

        load: function() {
            this._super();

            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;
        }
    };

    RptBaseController.extend( __controller__ );
} )();
