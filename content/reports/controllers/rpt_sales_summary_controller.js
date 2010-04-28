( function() {
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
        _breakout_setmenu: false,
        _fileName: 'rpt_sales_summary',

        _getConditions: function() {
            this._start = document.getElementById( 'start_date' ).value;
            this._end = document.getElementById( 'end_date' ).value;
            this._terminalNo = document.getElementById( 'terminal_no' ).value;
            this._periodtype = document.getElementById( 'period_type' ).value;
            this._shiftno = document.getElementById( 'shift_no' ).value;
            this._num_dept = document.getElementById( 'num_dept' ).value;
            this._num_product = document.getElementById( 'num_product' ).value;
            this._breakout_setmenu = document.getElementById( 'breakout_setmenu' ).checked;
        },
        
        _setConditions: function( start, end, terminalNo, periodtype, shiftno, num_dept, num_product, breakout_setmenu ) {
            this._start = start;
            this._end = end;
            this._terminalNo = terminalNo;
            this._periodtype = periodtype;
            this._shiftno = shiftno;
            this._num_dept = num_dept;
            this._num_product = num_product;
            this._breakout_setmenu = breakout_setmenu;
        },
        
        setConditionsAnd_reportRecords: function( parameters ) {
            parameters.num_dept = parameters.num_dept || 10;
            parameters.num_product = parameters.num_product || 10;
            parameters.breakout_setmenu = parameters.breakout_setmenu || false;

            document.getElementById( 'start_date' ).value = parameters.start;
            document.getElementById( 'end_date' ).value = parameters.end;
            document.getElementById( 'terminal_no' ).value = parameters.terminalNo;
            document.getElementById( 'period_type' ).value = parameters.periodtype;
            document.getElementById( 'shift_no' ).value = parameters.shiftno;
            document.getElementById( 'num_dept' ).value = parameters.num_dept;
            document.getElementById( 'num_product' ).value = parameters.num_product;
            document.getElementById( 'breakout_setmenu' ).checked = parameters.breakout_setmenu;
            
            this._setConditions( parameters.start, parameters.end, parameters.terminalNo, parameters.periodtype, parameters.shiftno, parameters.num_dept, parameters.num_product, parameters.breakout_setmenu );
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

            var groupby;

            if ( this._terminalNo.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                groupby = 'orders.terminal_no,"Order.Hour"';
            } else {
                groupby = '"Order.Hour"';
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
            data.records = order.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: -1,
                limit: this._csvLimit
            } );

            data.records.forEach( function( record ) {
                data.summary.Guests += record.Guests;
                data.summary.OrderNum += record.OrderNum;
                data.summary.HourGrossSales += record.HourGrossSales;
            } );

            /*insert zero sale*/
           var start_date = this._start ;

           var end_date =  this._end;

           while(start_date < end_date){

               var  showedHour = [];

               for(var index = 0; index < data.records.length ; index++ ){

                   showedHour.push( data.records[index].Hour );
               }

               var d = new Date(start_date);
               var hour = d.getHours();

              if( showedHour.indexOf(GeckoJS.String.padLeft(hour.toString(), 2, '0')) < 0){
                    data.records.push({
                    Hour: GeckoJS.String.padLeft(hour.toString(), 2, '0'),
                    Guests: 0,
                    OrderNum: 0,
                    HourGrossSales: 0
                    });
               }

               start_date = start_date + 3600000;
          }

          data.records.sort(function(a,b){
                   return a.Hour - b.Hour ;
          });
			
            return data;
        },

        _deptSalesBillboard: function(rows) {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
			
            rows = parseInt( rows );
            if ( isNaN( rows ) )
                rows = 10;
            
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = [
            'orders.terminal_no AS "Order.terminal_no"',
            'order_items.created',
            'order_items.cate_no',
            'order_items.cate_name',
            'order_items.product_no',
            'order_items.product_name',
            'SUM("order_items"."current_qty") as "qty"',
            'SUM("order_items"."current_subtotal") as "gross"',
            'order_items.current_tax'
            ];
                            
            var conditions = "orders." + this._periodtype + ">='" + start +
            "' AND orders." + this._periodtype + "<='" + end +
            "' AND orders.status='1'";

            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            if ( !this._breakout_setmenu )
                conditions += " AND (order_items.parent_index IS NULL OR order_items.parent_index = '')";
            
            var groupby = 'order_items.cate_no';
            var orderby = '"gross" DESC, "qty" DESC';
            
            var data = {};
            var summary = {};
            summary.qty = 0;
            summary.gross = 0.0;

            /*
            data.records = orderItem.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                recursive:1,
                order: orderby,
                limit: rows
            } );
            */
            data.records = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + rows);
            
            var data_obj = {};
            data.records.forEach( function( record ) {
                summary.qty += record.qty;
                summary.gross += record.gross;
            	
                data_obj[ record.cate_no ] = record;
            } );
            
            if ( data.records.length < rows ) {
                // append the depts without any transaction record.
                var cate = new CategoryModel();
                var cate_records = cate.find( 'all', {
                    fields: [ 'no', 'name' ],
                    order: 'no'
                } );
		        
                for ( var i = 0; i < rows - data.records.length; i++ ) {
                    var record = cate_records[ i ];
                    if ( !record )
                        break;
		     
                    if ( !( record.no in data_obj ) ) {
                        data_obj[ record.no ] = {
                            cate_no: record.no,
                            cate_name: record.name,
                            qty: 0,
                            gross:0
                        };
                    }
                }
            }
            
            data.records = data_obj;
            data.summary = summary;
            
            return data;
        },

        _prodSalesBillboard: function(rows) {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
			
            rows = parseInt( rows );
            if ( isNaN( rows ) )
                rows = 10;
            
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var orderItem = new OrderItemModel();

            var fields = [
            'orders.terminal_no AS "Order.terminal_no"',
            'order_items.created',
            'order_items.product_no',
            'order_items.product_name',
            'SUM("order_items"."current_qty") as "qty"',
            'SUM("order_items"."current_subtotal") as "gross"'
            ];
                            
            var conditions = "orders." + this._periodtype + ">='" + start +
            "' AND orders." + this._periodtype + "<='" + end +
            "' AND orders.status='1'";
                            
            if ( this._terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            if ( !this._breakout_setmenu )
                conditions += " AND (order_items.parent_index IS NULL OR order_items.parent_index = '')";
            
            var groupby = 'order_items.product_no';
            var orderby = '"gross" DESC, "qty" DESC';
            
            var data = {};
            data.summary = {};
            data.summary.qty = 0;
            data.summary.gross = 0.0;

            /*
            data.records = orderItem.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                recursive:1,
                order: orderby,
                limit: rows
            } );
            */
            data.records = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + rows);
            
            var data_obj = {};
            data.records.forEach( function( record ) {
                data.summary.qty += record.qty;
                data.summary.gross += record.gross;
            	
                data_obj[ record.product_no ] = record;
            } );
            
            if ( data.records.length < rows ) {
                // append the products without any transaction record.
                var product = new ProductModel();
                var product_records = product.find( 'all', {
                    fields: [ 'no', 'name' ],
                    order: 'no'
                } );
		        
                for ( var i = 0; i < rows - data.records.length; i++ ) {
                    var record = product_records[ i ];
                    if ( !record )
                        break;
		        		
                    if ( !( record.no in data_obj ) ) {
                        data_obj[ record.no ] = {
                            product_no: record.no,
                            product_name: record.name,
                            qty: 0,
                            gross:0
                        };
                    }
                }
            }
            
            data.records = data_obj;
            return data;
        },

        _paymentList: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var fields = [
            'order_payments.name',
            'order_payments.memo1',
            'sum( order_payments.change) as "change"',
            'sum( order_payments.amount) as "amount"',
            'sum( ifnull(((order_payments.order_items_count - 1) * order_payments.is_groupable + 1) * order_payments.origin_amount, 0)) as "origin_amount"',
            ];

            var conditions = "orders." + this._periodtype + ">='" + start +
            "' AND orders." + this._periodtype + "<='" + end +
            "' AND orders.status='1'";

            var groupby, orderby;

            if ( this._terminalNo.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                groupby = 'orders.terminal_no, order_payments.name, order_payments.memo1';
                orderby = 'orders.terminal_no, order_payments.name';
            } else {
                groupby = 'order_payments.name, order_payments.memo1';
                orderby = 'order_payments.name';
            }
            
            if ( this._shiftno.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
            
            var data = {};
            var summary = {};
            summary.payment_total = 0;

            var orderPayment = new OrderPaymentModel();
            /*
            var records = orderPayment.find( 'all',{
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: 1,
                limit: this._csvLimit
            } );
            */
            var records = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);
            
            var paymentList = {};
            var giftcardExcess;
            var cashChange = 0;
            var cashRecord;

            var Currencies = GeckoJS.Session.get('Currencies');
            var localCurrencySymbol = '';
            if (Currencies && Currencies.length > 0) {
                localCurrencySymbol = Currencies[0].currency || _('(rpt)cash');
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
                        let origin_amount = record.origin_amount;
                        var excess = record.origin_amount - record.amount;
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
                    if (record.memo1 == '' || record.memo1 == localCurrencySymbol) {
                        record.memo1 = localCurrencySymbol;
                        cashRecord = record;
                    }
                    else {
                        record.amount = record.origin_amount;
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
                    cashRecord = {
                        name: 'cash',
                        memo1: localCurrencySymbol,
                        amount: 0,
                        change: 0
                    };
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

        _groupablePayments: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            var start = parseInt( this._start / 1000, 10 );
            var end = parseInt( this._end / 1000, 10 );

            var fields = [
            'order_payments.name',
            'order_payments.memo1',
            'order_payments.origin_amount as "amount"',
            'sum( order_payments.order_items_count) as "count"',
            ];

            var conditions = "orders." + this._periodtype + ">='" + start +
            "' AND orders." + this._periodtype + "<='" + end +
            "' AND order_payments.is_groupable = 1" +
            " AND orders.status='1'";

            var groupby, orderby;

            if ( this._terminalNo.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                groupby = 'order_payments.name, order_payments.memo1, order_payments.origin_amount';
                orderby = 'order_payments.name, orders.terminal_no, order_payments.memo1, order_payments.origin_amount';
            } else {
                groupby = 'order_payments.name, order_payments.memo1, order_payments.origin_amount';
                orderby = 'order_payments.name, order_payments.memo1, order_payments.origin_amount';
            }

            if ( this._shiftno.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            var orderPayment = new OrderPaymentModel();
            var records = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

            var Currencies = GeckoJS.Session.get('Currencies');
            var localCurrencySymbol = '';
            if (Currencies && Currencies.length > 0) {
                localCurrencySymbol = Currencies[0].currency || _('(rpt)cash');
            }
            records.forEach( function( record ) {

                if (record.name == 'cash') {
                    if (record.memo1 == '' || record.memo1 == localCurrencySymbol) {
                        record.memo1 = localCurrencySymbol;
                    }
                }
            });

            return {records: records};
        },

        _salesSummary: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            let start = parseInt( this._start / 1000, 10 );
            let end = parseInt( this._end / 1000, 10 );

            var fields = [
                'SUM("orders"."total") AS "Order.NetSales"',
                'SUM( "orders"."item_subtotal" ) AS "Order.GrossSales"',
                'AVG("orders"."total") AS "Order.AvgNetSales"',
                'AVG("orders"."item_subtotal") AS "Order.AvgGrossSales"',
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
            var orderRecord = order.find( 'first', {
                fields: fields,
                conditions: conditions,
                group2: groupby,
                order: orderby,
                recursive: 0,
                limit: this._csvLimit
            } );

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
            // if breakout set menu, run another query on order items
            if (orderRecord && this._breakout_setmenu) {
                let qtySubtotal = 0;
                let orderItem = new OrderItemModel();

                let fields = [
                    'SUM("order_items"."current_qty") as "qty"',
                ];

                let record = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions);
                if (record && record[0]) {
                    qtySubtotal = record[0].qty;
                }
                
                orderRecord.QtySubtotal = qtySubtotal;
                if (orderRecord.OrderNum != 0) {
                    orderRecord.AvgQtySubtotal = qtySubtotal / orderRecord.OrderNum;
                }
            }

            // get the number of voided orders.
            var where = "status = -2";
            	
            where += " and orders." + this._periodtype + " >= '" + start +
            "' and orders." + this._periodtype + " <= '" + end + "'";
                            
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
            'order_item_taxes.tax_no',
            'order_item_taxes.tax_name',
            'sum( order_item_taxes.item_count ) as "item_count"',
            'sum( order_item_taxes.taxable_amount ) as "taxable_amount"',
            'sum( order_item_taxes.included_tax_subtotal ) as "included_tax"',
            'sum( order_item_taxes.tax_subtotal ) as "tax_subtotal"'
            ];

            var conditions = "orders." + this._periodtype + ">='" + start +
            "' AND orders." + this._periodtype + "<='" + end +
            "' AND orders.status='1'" +
            " AND order_item_taxes.order_item_id=''" +
            " AND order_item_taxes.promotion_id=''";

            if ( this._terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
                
            if ( this._shiftno.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";
			
            var groupby = 'order_item_taxes.tax_no,order_item_taxes.tax_name';
            var orderby = 'order_item_taxes.tax_name desc';
            
            var data = {};
            var summary = {
                addon_tax_total: 0,
                included_tax_total: 0
            };
            
            var orderItemTax = new OrderItemTaxModel();

            data.records = orderItemTax.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_item_taxes ON ("orders"."id" = "order_item_taxes"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

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
            var datas = order.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: 0,
                limit: this._csvLimit
            } );

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
            
            var fields = 	'order_promotions.promotion_id,' +
            'order_promotions.name,' +
            'order_promotions.discount_subtotal';
                        
            var conditions = 'orders.' + this._periodtype + '>="' + start +
            '" and orders.' + this._periodtype + '<="' + end + '"' +
            ' and orders.status = 1';
            
            if ( this._terminalNo.length > 0 )
                conditions += " and orders.terminal_no LIKE '" + this._queryStringPreprocessor( this._terminalNo ) + "%'";
            
            if ( this._shiftno.length > 0 )
                conditions += " and orders.shift_number = '" + this._queryStringPreprocessor( this._shiftno ) + "'";

            
            var orderPromotionModel = new OrderPromotionModel();

            /*
            var records = orderPromotionModel.find('all', {
                fields: fields,
                conditions: conditions,
                recursive:1,
                limit: this._csvLimit
            });
            */
           
            var records = orderPromotionModel.getDataSource().fetchAll('SELECT ' + fields + '  FROM orders INNER JOIN order_promotions ON ("orders"."id" = "order_promotions"."order_id" )  WHERE ' + conditions + ' LIMIT 0, ' + this._csvLimit);

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


            /*
            var results = orderItem.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: 1,
                limit: this._csvLimit
            } );
            */
            var results = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

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
            
            fields = [
            discountOrSurcharge + '_name',
            'count( * ) as num_rows',
            'sum( current_' + discountOrSurcharge + ' ) as amount',
            ];
            
            var orderAddition = new OrderAdditionModel();

            /*
            results = orderAddition.find( 'all', {
                fields: fields,
                conditions: conditions,
                group: groupby,
                order: orderby,
                recursive: 1,
                limit: this._csvLimit
            } );
            */
           results = orderAddition.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_additions ON ("orders"."id" = "order_additions"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

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

            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.salessummary.label' );
            this._reportRecords.head.subtitle = _( '(rpt)(based on %S)', [_( '(rpt)' + this._periodtype ) ]);
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;

            this._reportRecords.body.hourly_sales = this._hourlySales();
            this._reportRecords.body.dept_sales = this._deptSalesBillboard( this._num_dept || 10 );
            this._reportRecords.body.prod_sales = this._prodSalesBillboard( this._num_product || 10 );
            this._reportRecords.body.payment_list = this._paymentList();
            this._reportRecords.body.groupable_payments = this._groupablePayments();
            this._reportRecords.body.sales_summary = this._salesSummary();
            this._reportRecords.body.destination_summary = this._destinationSummary();
            this._reportRecords.body.tax_summary = this._taxSummary();
            this._reportRecords.body.discount_summary = this._discountSurchargeSummary( 'discount' );
            this._reportRecords.body.surcharge_summary = this._discountSurchargeSummary( 'surcharge' );
            this._reportRecords.body.promotion_summary = this._promotionSummary();

        },
		
        printSalesSummary: function( start, end, terminalNo, periodType, shiftNo, num_dept, num_product ) {
            this._setConditions( start, end, terminalNo, periodType, shiftNo, num_dept, num_product );
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
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
