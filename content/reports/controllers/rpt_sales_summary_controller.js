(function(){

    /**
     * RptDailySales Controller
     */
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptSalesSummary',

        _mediaPath: null,
        _datas: null,
        _start: null,
        _end: null,
        _machineid: null,
        _periodtype: null,
        _shiftno: null,
        
        _fileName: "rpt_sales_summary",

        _getConditions: function() {
            this._start = document.getElementById( 'start_date' ).value;
            this._end = document.getElementById( 'end_date' ).value;
            this._machineid = document.getElementById( 'machine_id' ).value;
            this._periodtype = document.getElementById( 'period_type' ).value;
            this._shiftno = document.getElementById( 'shift_no' ).value;
        },
        
        _setConditions: function( start, end, machineid, periodtype, shiftno ) {
        	this._start = start;
        	this._end = end;
        	this._machineid = machineid;
            this._periodtype = periodtype;
            this._shiftno = shiftno;
        },
        
        setConditionsAnd_reportRecords: function( parameters ) {
        	this._setConditions( parameters.start, parameters.end, parameters.machineid, parameters.periodtype, parameters.shiftno );
        	this._set_reportData();
        },

        _hourlySales: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var fields = ['orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.HourTotal"',
                            // 'STRFTIME("%Y-%m-%d %H","orders"."transaction_created_format") AS "Order.Hour"',
                            'STRFTIME("%H",DATETIME("orders"."transaction_created", "unixepoch", "localtime")) AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"'];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._machineid.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                var groupby = 'orders.terminal_no,"Order.Hour"';
            } else {
                var groupby = '"Order.Hour"';
            }
            
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;

            var orderby = '"Order.Hour", orders.terminal_no, orders.' + this._periodtype;
            
            var data = {};
            data.summary = {};
            data.summary.Guests = 0;
            data.summary.OrderNum = 0;
            data.summary.HourTotal = 0.0;
            
            var order = new OrderModel();
            data.records = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1 } );

			data.records.forEach( function( record ) {
				data.summary.Guests += record.Guests;
				data.summary.OrderNum += record.OrderNum;
				data.summary.HourTotal += record.HourTotal;
			} );			
			
            return data;
        },

        _deptSalesBillboard: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = ['orders.terminal_no',
                            'order_items.created',
                            'order_items.cate_no',
                            'order_items.cate_name',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
                            
             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end + "'";

            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;

            var groupby = 'order_items.cate_no';
            var orderby = '"OrderItem.qty" DESC';
            
            var data = {};
            var summary = {};
            summary.qty = 0;
            summary.total = 0.0;
			
			var num_rows_to_get = data.num_rows_to_get = 10;
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: num_rows_to_get } );
            
            var cate = new CategoryModel();
            var cate_records = cate.find( 'all', { fields: [ 'no', 'name' ] } );
            
            data.records.forEach( function( record ) {
            	summary.qty += record.qty;
            	summary.total += record.total;
            	
            	cate_records.forEach( function ( cate_record ) {
            		if ( record.cate_no == cate_record.no ) {
            			record.cate_name = cate_record.name;
            			return;
            		}
            	} );
            } );
            
            data.summary = summary;

            return data;
        },

        _prodSalesBillboard: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = ['orders.terminal_no',
                    		'order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
                            
             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end + "'";
                            
            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;

            var groupby = 'order_items.product_no';
            var orderby = '"OrderItem.qty" DESC';
            
            var data = {};
            data.summary = {};
            data.summary.qty = 0;
            data.summary.total = 0.0;
			
			var num_rows_to_get = data.num_rows_to_get = 10;
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: num_rows_to_get } );
            
            data.records.forEach( function( record ) {
            	data.summary.qty += record.qty;
            	data.summary.total += record.total;
            } );

            return data;
        },

        _paymentList: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var fields = [
                            'order_payments.name',
                            'order_payments.memo1',
                            'sum( order_payments.amount ) as "OrderPayment.amount"',
                            'sum( order_payments.change ) as "OrderPayment.change"'
                       	 ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._machineid.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                var groupby = 'orders.terminal_no, order_payments.name, order_payments.memo1';
                var orderby = 'orders.terminal_no, order_payments.name';
            } else {
                var groupby = 'order_payments.name, order_payments.memo1';
                var orderby = 'order_payments.name';
            }
            
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;
            
            var data = {};
            var summary = {};
            summary.payment_total = 0;
            summary.change_total = 0;

            var orderPayment = new OrderPaymentModel();
            
            var records = orderPayment.find( 'all',{ fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );
            
            var paymentList = [];
            var name;
            var payment;
            records.forEach( function( record ) {
            	if ( record.name != name ) {
            		if ( payment )
            			paymentList.push( payment );
            		
            		payment = {
            			name: record.name,
            			total: 0,
            			detail: []
            		}
            		
            		name = record.name;
            	} 
            	
            	payment.total += record.amount - record.change;
            	payment.detail.push( record );
            	            	
            	summary.payment_total += record.amount;
            	summary.change_total += record.change;
            });
            
            if ( payment )
            	paymentList.push( payment );
            	
            paymentList.forEach( function( payment ) {
            	if ( payment.detail.length == 1 )
            		delete( payment.detail );
            } );
            
            data.records = paymentList;
            data.summary = summary;

            return data;
        },

        _salesSummary: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );

            var fields = [
                            'SUM("orders"."total") AS "Order.Total"',
                            'SUM( "orders"."item_subtotal" ) AS "Order.ItemSubtotal"',
                            'SUM( "orders"."discount_subtotal" ) AS "Order.DiscountSubtotal"',
                            'SUM( "orders"."surcharge_subtotal" ) AS "Order.SurchargeSubtotal"',
                            'SUM( "orders"."tax_subtotal" ) AS "Order.TaxSubtotal"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"',
                            'AVG("orders"."total") AS "Order.AvgTotal"',
                            'AVG("orders"."no_of_customers") AS "Order.AvgGuests"',
                            'AVG("orders"."items_count") AS "Order.AvgItemsCount"'
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;

            var groupby;

            var orderby = 'orders.terminal_no,orders.' + this._periodtype;

            var order = new OrderModel();
            var orderRecords = order.find( 'first', { fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 0 } );
            
            // get the number of sold items.
            var sql = "select sum( current_qty ) as qty from order_items join orders on orders.id = order_items.order_id where " + conditions;
            var orderItem = new OrderItemModel();
            var orderItemRecords = orderItem.getDataSource().fetchAll( sql );
            
            orderRecords.ItemsCount = orderItemRecords[ 0 ].qty;

            return orderRecords;
        },
        
        _taxSummary: function() {
        	// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            'order_items.tax_name',
                            'order_items.tax_rate',
                            'order_items.tax_type',
                            'sum( order_items.included_tax ) as "included_tax"',
                            'sum( order_items.current_tax ) as "tax_subtotal"'
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._machineid.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;
			
            var groupby = 'order_items.tax_name, order_items.tax_rate, order_items.tax_type';
            var orderby = 'tax_subtotal desc';
            
            var data = {};
            var summary = {};
            summary.tax_total = 0;
            
            var orderItem = new OrderItemModel();
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );

            data.records.forEach( function( record ) {
            	summary.tax_total += record.tax_subtotal;
            	
            	if ( record.included_tax )
            		record.tax_subtotal += record.included_tax;
            	
            	var rate_type = TaxComponent.prototype.getTax( record.tax_name ).rate_type;
            	
            	if ( !record.tax_rate || record.tax_rate == '' ) 
            		record.tax_rate = 0;
            		
            	if ( record.tax_rate == 0 )
            		rate_type = '';
            	
            	if ( rate_type == '%' )
            		record.tax_rate += rate_type;
            	else record.tax_rate = rate_type + record.tax_rate;
            });
			
			data.summary = summary;
			
			return data;
		},

		_destinationSummary: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            'orders.destination as "Order.destination"',
                            'count( orders.id ) as "Order.num_trans"',
                            'sum( orders.total ) as "Order.total"'
                        ];

            var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1' AND orders.destination <> ''";

            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;
			
            var groupby = 'orders.destination';
            var orderby = 'orders.destination';
            
            var order = new OrderModel();
            var datas = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );
            
            // calculate the number of the transaction.
            var total_trans = order.find( 'first', { fields: 'count( orders.id ) as num', conditions: conditions, recursive: 1 } ).num;
            
            var records = {};
            records.total_trans = total_trans;
            records.data = datas;

			return records;
		},
		
		_discountSurchargeSummary: function( discountOrSurcharge ) {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000, 10 );
            end = parseInt( this._end / 1000, 10 );
            
            var fields = [
                            discountOrSurcharge + '_name',
                            'count( * ) as num_rows',
                            'sum( current_' + discountOrSurcharge +' ) as amount',
                        ];

            var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1' AND " + discountOrSurcharge + "_name <> ''";

            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                
            if ( this._shiftno.length > 0 )
            	conditions += " AND orders.shift_number = " + this._shiftno;
			
            var groupby = discountOrSurcharge + '_name';
            var orderby = 'amount desc';
            
            var orderItem = new OrderItemModel();
            var results = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );
            
            var summary = {
            	num_rows: 0,
            	amount: 0
            };
            
            var data = [];
            
            results.forEach( function( result ) {
            	summary.num_rows += result.num_rows;
            	summary.amount += result.amount;
            	result.itemOrAddition = _( 'item' );
            	
            	data.push( result );
            } );
            
            var fields = [
                        discountOrSurcharge + '_name',
                        'count( * ) as num_rows',
                        'sum( current_' + discountOrSurcharge + ' ) as amount',
                         ];
            
            var orderAddition = new OrderAdditionModel();
            results = orderAddition.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );
            
            results.forEach( function( result ) {
            	summary.num_rows += result.num_rows;
            	summary.amount += result.amount;
            	result.itemOrAddition = _( 'order' );
            	
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

			this._reportRecords.head.subtitle = '( based on ' + _( this._periodtype ) + ' )';
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
    });
})();
