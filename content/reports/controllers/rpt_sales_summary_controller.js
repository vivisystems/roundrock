(function(){

    /**
     * RptDailySales Controller
     */
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptSalesSummary',

        _mediaPath: null,
        _datas: null,
        _start: null,
        _end: null,
        _terminalNo: null,
        _periodtype: null,
        _shiftno: null,
        
        _fileName: 'rpt_sales_summary',

        _getConditions: function() {
            this._start = document.getElementById( 'start_date' ).value;
            this._end = document.getElementById( 'end_date' ).value;
            this._terminalNo = document.getElementById( 'terminal_no' ).value;
            this._periodtype = document.getElementById( 'period_type' ).value;
            this._shiftno = document.getElementById( 'shift_no' ).value;
        },
        
        _setConditions: function( start, end, terminalNo, periodtype, shiftno ) {
        	this._start = start;
        	this._end = end;
        	this._terminalNo = terminalNo;
            this._periodtype = periodtype;
            this._shiftno = shiftno;
        },
        
        setConditionsAnd_reportRecords: function( parameters ) {
        	this._setConditions( parameters.start, parameters.end, parameters.terminalNo, parameters.periodtype, parameters.shiftno );
        	this._set_reportData();
        },

        _hourlySales: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var fields = [
            				'orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."item_subtotal") AS "Order.HourGrossSales"',
                            // 'STRFTIME("%Y-%m-%d %H","orders"."transaction_created_format") AS "Order.Hour"',
                            'STRFTIME("%H",DATETIME("orders"."transaction_created", "unixepoch", "localtime")) AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."qty_subtotal") AS "Order.QtySubtotal"'
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._terminalNo.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                var groupby = 'orders.terminal_no,"Order.Hour"';
            } else {
                var groupby = '"Order.Hour"';
            }
            
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            var orderby = '"Order.Hour", orders.terminal_no, orders.' + this._periodtype;
            
            var data = {};
            data.summary = {};
            data.summary.Guests = 0;
            data.summary.OrderNum = 0;
            data.summary.HourGrossSales = 0.0;
            
            var order = new OrderModel();
            data.records = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1, limit: this._csvLimit } );

			data.records.forEach( function( record ) {
				data.summary.Guests += record.Guests;
				data.summary.OrderNum += record.OrderNum;
				data.summary.HourGrossSales += record.HourGrossSales;
			} );			
			
            return data;
        },

        _deptSalesBillboard: function(rows) {

            rows = parseInt(rows);
            if (isNaN(rows) || rows < 10) rows = 10;

            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = [
            				'orders.terminal_no',
                            'order_items.created',
                            'order_items.cate_no',
                            'order_items.cate_name',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.gross"',
                            'order_items.current_tax'
                        ];
                            
             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            var groupby = 'order_items.cate_no';
            var orderby = '"OrderItem.qty" DESC';
            
            var data = {};
            var summary = {};
            summary.qty = 0;
            summary.gross = 0.0;
			
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: rows } );
            
            var cate = new CategoryModel();
            var cate_records = cate.find( 'all', { fields: [ 'no', 'name' ] } );
            
            data.records.forEach( function( record ) {
            	summary.qty += record.qty;
            	summary.gross += record.gross;

                /*
            	cate_records.forEach( function ( cate_record ) {
            		if ( record.cate_no == cate_record.no ) {
            			record.cate_name = cate_record.name;
            			return;
            		}
            	} );
                */
            } );
            
            data.summary = summary;

            return data;
        },

        _prodSalesBillboard: function(rows) {

            rows = parseInt(rows);
            if (isNaN(rows) || rows < 10) rows = 10;

            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = [
            				'orders.terminal_no',
                    		'order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.gross"'
                         ];
                            
             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            var groupby = 'order_items.product_no';
            var orderby = '"OrderItem.qty" DESC';
            
            var data = {};
            data.summary = {};
            data.summary.qty = 0;
            data.summary.gross = 0.0;
			
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: rows } );
            
            data.records.forEach( function( record ) {
            	data.summary.qty += record.qty;
            	data.summary.gross += record.gross;
            } );

            return data;
        },

        _paymentList: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var fields = [
                            'order_payments.name',
                            'order_payments.memo1',
                            'sum( order_payments.change) as "OrderPayment.change"',
                            'sum( order_payments.amount) as "OrderPayment.amount"',
                            'sum( order_payments.origin_amount ) as "OrderPayment.origin_amount"'
                       	 ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._terminalNo.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                var groupby = 'orders.terminal_no, order_payments.name, order_payments.memo1';
                var orderby = 'orders.terminal_no, order_payments.name';
            } else {
                var groupby = 'order_payments.name, order_payments.memo1';
                var orderby = 'order_payments.name';
            }
            
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
            
            var data = {};
            var summary = {};
            summary.payment_total = 0;

            var orderPayment = new OrderPaymentModel();
            
            var records = orderPayment.find( 'all',{ fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: this._csvLimit } );
            
            var paymentList = {};
            var giftcardExcess;
            var cashChange = 0;
            var cashRecord;

            var Currencies = GeckoJS.Session.get('Currencies');
            var localCurrencySymbol = '';
            if (Currencies && Currencies.length > 0) {
                localCurrencySymbol = Currencies[0].currency_symbol;
            }
            records.forEach( function( record ) {

                var payment;
                if (!(record.name in paymentList)) {
            		payment = {
            			name: record.name,
            			total: 0.0,
            			detail: []
            		}
                    paymentList[ record.name ] = payment;
            	}

                payment = paymentList[ record.name ];

                if (record.name == 'giftcard') {
                    // check if we need to update giftcard excess record
                    if (record.amount != record.origin_amount) {
                        var excess = record.amount - record.origin_amount;
                        if (!giftcardExcess) {
                            giftcardExcess = {
                                name: 'giftcard',
                                memo1: _('(rpt)giftcard excess amount'),
                                amount: excess
                            };
                        }
                        else {
                            giftcardExcess.amount += excess;
                        }
                    }
                    record.amount = record.origin_amount;
                }

            	payment.total += record.amount;
            	payment.detail.push( record );
                cashChange += record.change;
            	            	
            	summary.payment_total += record.amount;

                if (record.name == 'cash') {
                    if (record.memo1) {
                        record.amount = record.origin_amount;
                    }
                    else {
                        record.memo1 = localCurrencySymbol;
                        cashRecord = record;
                    }
                }
            });

            if (giftcardExcess && paymentList[ 'giftcard' ]) {
                paymentList[ 'giftcard' ].detail.push(giftcardExcess);
                /*
                paymentList[ 'giftcard' ].total += giftcardExcess.amount;
                summary.payment_total += giftcardExcess.amount;
                */
            }

            // subtract cashChange from cashRecord, cash payment totals, and summary totals
            if (cashChange != 0) {
                if (!cashRecord) {
                    if (!('cash' in paymentList)) {
                        paymentList[ 'cash' ] = {
                            name: 'cash',
                            total: 0,
                            detail: []
                        };
                    }

                    // insert a detail record for local cash
                    cashRecord = {name: 'cash', memo1: localCurrencySymbol, amount: 0, change: 0};
                    paymentList[ 'cash' ].detail.push(cashRecord);
                }
                // subtract cashChange from cashRecord
                cashRecord.amount -= cashChange;

                // subtract cashChange from cash payment totals
                paymentList[ 'cash' ].total -= cashChange;

                // subtract cashChange from summary totals
                summary.payment_total -= cashChange;
            }

            paymentList = GeckoJS.BaseObject.getValues(paymentList);
            paymentList.sort(function(a, b) {
                return a['name'] > b['name'];
            });
            /*
            for (p in paymentList) {
                var payment = paymentList[p];
            	if ( payment.detail.length == 1 )
            		delete( payment.detail );
            }
            */
            data.records = paymentList;
            data.summary = summary;

            return data;
        },

        _salesSummary: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var fields = [
                            'SUM("orders"."total") AS "Order.NetSales"',
                            'SUM( "orders"."item_subtotal" ) AS "Order.GrossSales"',
                            'CAST( AVG("orders"."total") AS INTEGER ) AS "Order.AvgNetSales"',
                            'CAST( AVG("orders"."item_subtotal") AS INTEGER ) AS "Order.AvgGrossSales"',
                            'SUM( "orders"."discount_subtotal" ) AS "Order.DiscountSubtotal"',
                            'SUM( "orders"."surcharge_subtotal" ) AS "Order.SurchargeSubtotal"',
                            'SUM( "orders"."tax_subtotal" ) AS "Order.TaxSubtotal"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."qty_subtotal") AS "Order.QtySubtotal"',
                            'AVG("orders"."no_of_customers") AS "Order.AvgGuests"',
                            'AVG("orders"."qty_subtotal") AS "Order.AvgQtySubtotal"',
                            'SUM( "orders"."promotion_subtotal" ) AS "Order.PromotionSubtotal"',
                            'SUM( "orders"."revalue_subtotal" ) AS "Order.RevalueSubtotal"'
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            var groupby;

            var orderby = 'orders.terminal_no,orders.' + this._periodtype;

            var order = new OrderModel();
            var orderRecord = order.find( 'first', { fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 0, limit: this._csvLimit } );

            if (orderRecord) {
                if (orderRecord.Guests > 0) {
                    orderRecord.AvgNetSalesPerGuest = orderRecord.NetSales / orderRecord.Guests;
                    orderRecord.AvgGrossSalesPerGuest = orderRecord.GrossSales / orderRecord.Guests;
                }
                else {
                    orderRecord.AvgNetSalesPerGuest = 0;
                    orderRecord.AvgGrossSalesPerGuest = 0;
                }
            }
            // get the number of voided orders.
            var where = "status = -2";
            var periodType;
            if ( this._periodtype == 'sale_period' )
            	periodType = 'void_sale_period';
            else periodType = 'transaction_voided';
            	
            where += " and orders." + periodType + " >= '" + start +
                            "' and orders." + periodType + " <= '" + end + "'";
                            
            if ( this._shiftno.length > 0 )
            	where += " and orders.void_shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
            	
            var sql = 'select count( id ) as VoidedOrders from orders where ' + where;
            orderRecord.VoidedOrders = order.getDataSource().fetchAll( sql )[ 0 ].VoidedOrders;
            
            return orderRecord;
        },
        
        _taxSummary: function() {
        	// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            'order_items.tax_name',
                            'sum( order_items.included_tax ) as "included_tax"',
                            'sum( order_items.current_tax ) as "tax_subtotal"'
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
			
            var groupby = 'order_items.tax_name';
            var orderby = 'order_items.tax_name desc';
            
            var data = {};
            var summary = {};
            summary.addon_tax_total = 0;
            summary.included_tax_total = 0;
            var orderItem = new OrderItemModel();
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: this._csvLimit } );

            data.records.forEach( function( record ) {
            	summary.addon_tax_total += record.tax_subtotal;
            	summary.included_tax_total += record.included_tax;
            });
			
			data.summary = summary;
			
			return data;
		},

		_destinationSummary: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            'orders.destination as "Order.destination"',
                            'count( orders.id ) as "Order.num_trans"',
                            'sum( orders.item_subtotal ) as "Order.gross"'
                         ];

            var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1' AND orders.destination <> ''";

            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
			
            var groupby = 'orders.destination';
            var orderby = 'orders.destination';
            
            var order = new OrderModel();
            var datas = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: this._csvLimit } );

            datas.forEach(function(o) {
                if (o.num_trans > 0) {
                    o.gross_per_trans = o.gross / o.num_trans;
                }
                else {
                    o.gross_per_trans = 0.0;
                }
            });
            
            var records = {};
            records.data = datas;

			return records;
		},
		
		_promotionSummary: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );
            
            var fields = 	'promotion_id,' +
                            'name,' +
                            'discount_subtotal';
                        
            var conditions = 'orders.' + this._periodtype + '>="' + start +
                            '" and orders.' + this._periodtype + '<="' + end + '"' +
                            ' and orders.status = 1';
            
            if ( this._terminalNo.length > 0 )
                conditions += " and orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
            
            if ( this._shiftno.length > 0 )
            	conditions += " and orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
            
            var orderPromotionModel = new OrderPromotionModel();
  			var records = orderPromotionModel.find('all', {
                fields: fields,
                conditions: conditions,
                recursive:1,
                limit: this._csvLimit
            });
  			
  			var results = {};
  			var summary = {
  				matched_count: records.length,
  				discount_subtotal: 0
  			};
  			
  			records.forEach( function( record ) {
                if (!( record.promotion_id in results )) {
                    results[ record.promotion_id ] = {
                        name: record.name,
                        discount_subtotal: record.discount_subtotal,
                        matched_count: 1
                    }
  				}
                else {
                    results[record.promotion_id].discount_subtotal += record.discount_subtotal;
                    results[record.promotion_id].matched_count++;
                }
                summary.discount_subtotal += record.discount_subtotal;
  			} );

            results = GeckoJS.BaseObject.getValues(results);
  			results.sort( function( a, b ) {
  				a = a.discount_subtotal;
  				b = b.discount_subtotal;
  				
  				if ( a > b ) return 1;
  				if ( a < b ) return -1;
  				return 0;
  			} );

  			var data = {};
  			data.results = results;
  			data.summary = summary;
  			
			return data;
		},
		
		_discountSurchargeSummary: function( discountOrSurcharge ) {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            discountOrSurcharge + '_name',
                            'count( * ) as num_rows',
                            'sum( current_' + discountOrSurcharge +' ) as amount',
                         ];

            var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1' AND " + discountOrSurcharge + "_name <> ''";

            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
			
            var groupby = discountOrSurcharge + '_name';
            var orderby = 'amount desc';
            
            var orderItem = new OrderItemModel();
            var results = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: this._csvLimit } );
            
            var summary = {
            	num_rows: 0,
            	amount: 0
            };
            
            var data = [];
            
            results.forEach( function( result ) {
            	summary.num_rows += result.num_rows;
            	summary.amount += result.amount;
            	result.itemOrAddition = _( '(rpt)Item Discount/Surcharge' );
            	
            	data.push( result );
            } );
            
            var fields = [
                        	discountOrSurcharge + '_name',
                        	'count( * ) as num_rows',
                        	'sum( current_' + discountOrSurcharge + ' ) as amount',
                         ];
            
            var orderAddition = new OrderAdditionModel();
            results = orderAddition.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1, limit: this._csvLimit } );
            
            results.forEach( function( result ) {
            	summary.num_rows += result.num_rows;
            	summary.amount += result.amount;
            	result.itemOrAddition = _( '(rpt)Order Discount/Surcharge' );
            	
            	data.push( result );
            } );
            
            var records = {};
            records.data = data;
            records.summary = summary;

			return records;
		},
		
		_set_reportRecords: function() {
			
			this._getConditions();

            this._set_reportData();
		},
		
		_set_reportData: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
			
			var start_str = ( new Date( this._start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( this._end ) ).toString( 'yyyy/MM/dd HH:mm' );

			this._reportRecords.head.title = _( 'Sales Summary Report' );
			this._reportRecords.head.subtitle = _( '(rpt)(based on %S)', [_( '(rpt)' + this._periodtype ) ]);
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			
			this._reportRecords.body.hourly_sales = this._hourlySales();
			this._reportRecords.body.dept_sales = this._deptSalesBillboard();
			this._reportRecords.body.prod_sales = this._prodSalesBillboard();
			this._reportRecords.body.payment_list = this._paymentList();
			this._reportRecords.body.sales_summary = this._salesSummary();
			this._reportRecords.body.destination_summary = this._destinationSummary();
			this._reportRecords.body.tax_summary = this._taxSummary();
			this._reportRecords.body.discount_summary = this._discountSurchargeSummary( 'discount' );
			this._reportRecords.body.surcharge_summary = this._discountSurchargeSummary( 'surcharge' );
			this._reportRecords.body.promotion_summary = this._promotionSummary();
		},
		
		printSalesSummary: function( start, end, terminalNo, periodType, shiftNo ) {
			this._setConditions( start, end, terminalNo, periodType, shiftNo );
			this._set_reportData();
			this._setTemplateDataHead();
			
			var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
				.getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
			var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
			
			var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';
			
			var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
			
            rcp.printReport( 'report', tpl, this._reportRecords );
        },
        
        getProcessedTpl: function( start, end, terminalNo, periodType, shiftNo ) {
        	this._setConditions( start, end, terminalNo, periodType, shiftNo );
			this._set_reportData();
			this._setTemplateDataHead();
			
			var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
			
			return tpl.process( this._reportRecords );
        },

        exportCsv: function() {
            this._super(this, true);
        },

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy,mm,dd,0,0,0 ) ).getTime();
            var end = ( new Date( yy,mm,dd + 1,0,0,0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;

            this._enableButton( false );
        }
    };

    RptBaseController.extend(__controller__);
})();
