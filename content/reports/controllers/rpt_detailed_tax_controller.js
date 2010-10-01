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
            
            // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var orderModel = new OrderModel();

            orderModel.useDbConfig = useDbConfig; // udpate dbconfig

            var sortby = document.getElementById( 'sortby' ).value;

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
                'orders.id',
                'orders.' + timeField + ' as "Order.time"',
                'orders.terminal_no as "Order.terminal_no"',
                'orders.sequence as "Order.sequence"',
                'orders.sale_period as "Order.sale_period"',
                'orders.shift_number as "Order.shift_number"',
                'orders.total as "Order.total"',
                'orders.item_subtotal as "Order.item_subtotal"',
                'orders.invoice_no as "Order.invoice_no"',
                'orders.surcharge_subtotal as "Order.surcharge_subtotal"',
                'orders.item_surcharge_subtotal as "Order.item_surcharge_subtotal"',
                'orders.trans_surcharge_subtotal as "Order.trans_surcharge_subtotal"',
                'orders.discount_subtotal as "Order.discount_subtotal"',
                'orders.item_discount_subtotal as "Order.item_discount_subtotal"',
                'orders.trans_discount_subtotal as "Order.trans_discount_subtotal"',
                'orders.tax_subtotal as "Order.tax_subtotal"',
                'orders.included_tax_subtotal as "Order.included_tax_subtotal"',
                'orders.promotion_subtotal as "Order.promotion_subtotal"',
                'orders.revalue_subtotal as "Order.revalue_subtotal"',
                'orders.precision_prices as "Order.precision_prices"',
                'orders.rounding_prices as "Order.rounding_prices"',
                'orders.precision_taxes as "Order.precision_taxes"',
                'orders.rounding_taxes as "Order.rounding_taxes"',
                'order_item_taxes.tax_no as "Tax.tax_no"',
                'order_item_taxes.tax_name as "Tax.tax_name"',
                'order_item_taxes.tax_type as "Tax.tax_type"',
                'order_item_taxes.tax_subtotal as "Tax.tax_subtotal"',
                'order_item_taxes.included_tax_subtotal as "Tax.included_tax_subtotal"',
                'order_item_taxes.taxable_amount as "Tax.taxable_amount"'
            ];
                            
            var conditions = "orders." + periodType + ">='" + start +
            "' AND orders." + periodType + "<='" + end + "'" +
            " and orders.status = 1";
            
            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";

            var rowCount = orderModel.find('count', {
                fields: 'id',
                conditions: conditions,
                recursive: 0
            });
            
            var orders = orderModel.getDataSource().fetchAll('SELECT ' + fields + ' FROM orders JOIN order_item_taxes on order_item_taxes.order_id = orders.id WHERE ' + conditions + ' AND order_item_taxes.promotion_id = "" AND order_item_taxes.order_item_id = "" LIMIT 0, '+ limit);
            
            var summary = {
                total: 0,
                item_subtotal: 0,
                tax_subtotal: 0,
                included_tax_subtotal: 0,
                surcharge_subtotal: 0,
                trans_surcharge_subtotal: 0,
                item_surcharge_subtotal: 0,
                discount_subtotal: 0,
                trans_discount_subtotal: 0,
                item_discount_subtotal: 0,
                promotion_subtotal: 0,
                revalue_subtotal: 0,
                taxes: {}
            };
            // summarize orders
            var records = {};
            var taxList = [];
            var taxesByNo = {};

            orders.forEach( function( data ) {
                var oid = data.id;
                if (!(oid in records)) {
                    records[ oid ] = GREUtils.extend( {}, data );
                    records[ oid ][ 'surcharge_subtotal' ] = data.Order.surcharge_subtotal;
                    records[ oid ][ 'discount_subtotal' ] = data.Order.discount_subtotal;
                    records[ oid ][ 'taxes' ] = {};
                
                    summary.total += data.Order.total;
                    summary.item_subtotal += data.Order.item_subtotal;
                    summary.tax_subtotal += data.Order.tax_subtotal;
                    summary.included_tax_subtotal += data.Order.included_tax_subtotal;
                    summary.surcharge_subtotal += data.Order.surcharge_subtotal;
                    summary.item_surcharge_subtotal += data.Order.item_surcharge_subtotal;
                    summary.trans_surcharge_subtotal += data.Order.trans_surcharge_subtotal;
                    summary.discount_subtotal += data.Order.discount_subtotal;
                    summary.item_discount_subtotal += data.Order.item_discount_subtotal;
                    summary.trans_discount_subtotal += data.Order.trans_discount_subtotal;
                    summary.promotion_subtotal += data.Order.promotion_subtotal;
                    summary.revalue_subtotal += data.Order.revalue_subtotal;
                }

                let tax_amount, tax = data.Tax;
                if (tax.tax_type == 'INCLUDED') {
                    tax_amount = tax.included_tax_subtotal;
                }
                else {
                    tax_amount = tax.tax_subtotal;
                }

                records[ oid ][ 'taxes' ][ tax.tax_no ] = {
                    tax_subtotal: tax_amount,
                    item_subtotal: tax.taxable_amount
                }

                // tax summary
                if (!(tax.tax_no in summary.taxes)) {
                    summary.taxes[tax.tax_no] = {
                        tax_subtotal: tax_amount,
                        item_subtotal: tax.taxable_amount
                    }
                }
                else {
                    summary.taxes[tax.tax_no].tax_subtotal += tax_amount;
                    summary.taxes[tax.tax_no].item_subtotal += tax.taxable_amount;
                }

                // add to tax list
                if (!(tax.tax_no in taxesByNo)) {
                    taxList.push({
                        no: tax.tax_no,
                        name: tax.tax_name
                    });
                    taxesByNo[tax.tax_no] = 1;
                }
            }, this);
            
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
			
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.detailedtaxreport.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;
            this._reportRecords.foot.rowCount = rowCount;
            
            this._reportRecords.body = records;
			
            this._reportRecords.taxList = taxList;
			
            this._reportRecords.foot.summary = summary;
/*
            this.log('DEBUG', 'order records: ' + this.dump(records));
            this.log('DEBUG', 'tax list: ' + this.dump(taxList));
            this.log('DEBUG', 'tax summary: ' + this.dump(summary));
*/
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
        }
    };

    RptBaseController.extend( __controller__ );
} )();
