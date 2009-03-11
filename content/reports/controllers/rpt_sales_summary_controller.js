(function(){

    /**
     * RptDailySales Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptSalesSummary',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],

        _mediaPath: null,
        _datas: null,
        _start: null,
        _end: null,
        _machineid: null,
        _periodtype: null,
        
        _fileName: "/rpt_sales_summary",

        _showWaitPanel: function(panel, sleepTime) {
            var waitPanel = document.getElementById( panel );
            var width = GeckoJS.Configure.read( "vivipos.fec.mainscreen.width" ) || 800;
            var height = GeckoJS.Configure.read( "vivipos.fec.mainscreen.height" ) || 600;
            waitPanel.sizeTo( 360, 120 );
            var x = ( width - 360 ) / 2;
            var y = ( height - 240 ) / 2;
            waitPanel.openPopupAtScreen( x, y );

            // release CPU for progressbar ...
            if ( !sleepTime ) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        _enableButton: function( enable ) {
            var disabled = !enable;
            $( '#export_pdf' ).attr( 'disabled', disabled );
            $( '#export_csv' ).attr( 'disabled', disabled );
            $( '#export_rcp' ).attr( 'disabled', disabled );
        },

        _getConditions: function() {
            this._start = document.getElementById( 'start_date' ).value;
            this._end = document.getElementById( 'end_date' ).value;
            this._machineid = document.getElementById( 'machine_id' ).value;
            this._periodtype = document.getElementById( 'period_type' ).value;
        },
        
        _setConditions: function( start, end, machineid ) {
        	this._start = start;
        	this._end = end;
        	this._machineid = machineid;
        },

        _hourlySales: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );

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
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );

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

            var groupby = 'order_items.cate_no';
            var orderby = '"OrderItem.qty" DESC';
            
            var data = {};
            var summary = {};
            summary.qty = 0;
            summary.total = 0.0;
			
			var num_rows_to_get = data.num_rows_to_get = 10;
            data.records = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby, limit: num_rows_to_get } );
            
            data.records.forEach( function( record ) {
            	summary.qty += record.qty;
            	summary.total += record.total;
            } );
            
            data.summary = summary;

            return data;
        },

        _prodSalesBillboard: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );

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
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );

            var fields = [
                            'order_payments.name',
                            'sum( order_payments.amount ) as "OrderPayment.amount"',
                            'sum( order_payments.change ) as "OrderPayment.change"',
                       	 ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._machineid.length > 0 ) {
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
                var groupby = 'orders.terminal_no,order_payments.name';
                var orderby = 'orders.terminal_no,order_payments.name';
            } else {
                var groupby = 'order_payments.name';
                var orderby = 'order_payments.name';
            }
            
            var data = {};
            var summary = {};
            summary.payment_total = 0;
            summary.change_total = 0;

            var orderPayment = new OrderPaymentModel();
            
            data.records = orderPayment.find( 'all',{ fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );
            
            data.records.forEach( function( record ) {
            	summary.payment_total += record.amount;
            	summary.change_total += record.change;
            });
            
            data.summary = summary;

            return data;
        },

        _SalesSummary: function() {
            // Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );

            var fields = ['orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
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
                            'AVG("orders"."items_count") AS "Order.AvgItemsCount"',
                        ];

             var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";
                            
            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";

            var groupby;

            var orderby = 'orders.terminal_no,orders.' + this._periodtype;

            var order = new OrderModel();
            var datas = order.find( 'first', { fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: -1 } );

            return datas;
        },
        
        _taxSummary: function() {
        	// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );
            
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
            	
            	record.rate_type = TaxComponent.prototype.getTax( record.tax_name ).rate_type;
            });
			
			data.summary = summary;
			
			return data;
		},

		_destinationSummary: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
            start = parseInt( this._start / 1000 );
            end = parseInt( this._end / 1000 );
            
            var fields = [
                            'orders.destination as "Order.destination"',
                            'count( orders.id ) as "Order.num_trans"',
                            'sum( orders.total ) as "Order.total"'
                        ];

            var conditions = "orders." + this._periodtype + ">='" + start +
                            "' AND orders." + this._periodtype + "<='" + end +
                            "' AND orders.status='1'";

            if ( this._machineid.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._machineid + "%'";
			
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
		
		_set_datas: function() {
			// Before invoking, be sure that the private attributes are initialized by methods _getConditions or _setConditioins.
			
			var storeContact = GeckoJS.Session.get( 'storeContact' );
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }

            var start_str = ( new Date( this._start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( this._end ) ).toString( 'yyyy/MM/dd HH:mm' );

            var data = {
                head: {
                    title: _( 'Sales Summary Report' ),
                    subtitle: '( based on ' + _( this._periodtype ) + ' )',
                    start_time: start_str,
                    end_time: end_str,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: {
                    hourly_sales: this._hourlySales(),
                    dept_sales: this._deptSalesBillboard(),
                    prod_sales: this._prodSalesBillboard(),
                    payment_list: this._paymentList(),
                    sales_summary: this._SalesSummary(),
                    destination_summary: this._destinationSummary(),
                    tax_summary: this._taxSummary()
                },
                foot: {
                    gen_time: ( new Date() ).toString( 'yyyy/MM/dd HH:mm:ss' )
                }
            }

            this._datas = data;
		},
		
		printSalesSummary: function( start, end, terminalNo, periodType ) {
			
			this._setConditions( start, end, terminalNo, periodType );
			this._set_datas();
			
			var path = GREUtils.File.chromeToPath( "chrome://reports/locale/reports/tpl/rpt_sales_summary/rpt_sales_summary_rcp_80mm.tpl" );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
			
			tpl.process( this._datas );
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName( 'Print' );
            rcp.printReport( 'report', tpl, this._datas );
        },
		
        execute: function() {
            var waitPanel = this._showWaitPanel('wait_panel');

            this._getConditions();
            
            this._set_datas();
            
            var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_sales_summary/rpt_sales_summary.tpl");

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

            var result = tpl.process( this._datas );

            var bw = document.getElementById( 'preview_frame' );
            var doc = bw.contentWindow.document.getElementById( 'abody' );

            doc.innerHTML = result;

            this._enableButton( true );
            
            // initialize the splitter.
            var splitter = document.getElementById( 'splitter_zoom' );
            splitter.setAttribute( "state", "collapsed" );

            waitPanel.hidePopup();

        },

        exportPdf: function() {

            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( 'report_export' );
                
                if (!media_path){
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel' );

                this.BrowserPrint.getPrintSettings();

                this.BrowserPrint.setPaperSizeUnit( 1 );
                this.BrowserPrint.setPaperSize( 210, 297 );
                this.BrowserPrint.setPaperEdge( 0, 0, 0, 0 );
                this.BrowserPrint.setPaperMargin( 0, 0, 0, 0 );

                this.BrowserPrint.getWebBrowserPrint( 'preview_frame' );
                this.BrowserPrint.printToPdf( media_path + this._fileName );
      
            } catch (e) {
                //
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( 'report_export' );
                if (!media_path){
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel', 100 );

                var path = GREUtils.File.chromeToPath( "chrome://reports/locale/reports/tpl/rpt_sales_summary/rpt_sales_summary_csv.tpl" );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile( media_path + this._fileName, datas, tpl );

            } catch ( e ) {
                //
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

        },

        exportRcp: function() {
            try {
                this._enableButton( false );
                var waitPanel = this._showWaitPanel( 'wait_panel', 100 );

                var path = GREUtils.File.chromeToPath( "chrome://reports/locale/reports/tpl/rpt_sales_summary/rpt_sales_summary_rcp_80mm.tpl" );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                var datas;
                datas = this._datas;

                // this.RcpExport.print( datas, tpl );
                var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName( 'Print' );
                rcp.printReport( 'report', tpl, datas );
            } catch ( e ) {
                //
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

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
