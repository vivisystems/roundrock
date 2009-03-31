(function(){

    /**
     * RptDailySales Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptDailySalesDetail',
        components: ['BrowserPrint', 'CsvExport', 'CheckMedia'],
        _datas: null,
        
        _fileName: "/rpt_daily_sales_detail",

        _showWaitPanel: function(panel, sleepTime) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        _enableButton: function(enable) {
            var disabled = !enable;
            $('#export_pdf').attr('disabled', disabled);
            $('#export_csv').attr('disabled', disabled);
            $('#export_rcp').attr('disabled', disabled);
        },

        execute: function() {
            var waitPanel = this._showWaitPanel( 'wait_panel' );

            var storeContact = GeckoJS.Session.get( 'storeContact' );
            var clerk = '';
            var clerk_displayname = '';
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }
            
            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            
            var machineid = document.getElementById( 'machine_id' ).value;

            start = parseInt( start / 1000 );
            end = parseInt( end / 1000 );

            var fields =	'orders.id, ' +
            				'DATETIME( orders.transaction_created, "unixepoch", "localtime" ) as time, ' +
                            'orders.sequence, ' +
                            'orders.total, ' +
                            'orders.tax_subtotal, ' +
                            'orders.item_subtotal, ' +
                            'orders.discount_subtotal, ' +
                            'orders.surcharge_subtotal, ' +
                            'orders.items_count, ' +
                            'orders.no_of_customers, ' +
                            'orders.terminal_no, ' +
                            'order_items.product_no, ' +
                            'order_items.product_name, ' +
                            'order_items.current_qty, ' +
                            'order_items.current_price, ' +
                            'order_items.current_subtotal';
                            
            var tables = 'orders left join order_items on orders.id = order_items.order_id';

            var conditions = "orders.transaction_created >= '" + start +
                            "' and orders.transaction_created <= '" + end +
                            "' and orders.status = '1'";

            if ( machineid.length > 0 )
                conditions += " and orders.terminal_no like '" + machineid + "%'";

            var orderby = 'orders.terminal_no, orders.item_subtotal desc';//orders.transaction_created';
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' ) {
            	var desc = "";
            	
            	switch ( sortby ) {
            		case 'terminal_no':
            			break;
            		case 'transaction_created':
            		case 'item_subtotal':
            		case 'tax_subtotal':
            		case 'surcharge_subtotal':
            		case 'discount_subtotal':
            		case 'total':
            		case 'no_of_customers':
            		case 'items_count':
            			desc = ' desc';
            	}
            	
            	orderby = 'orders.' + sortby + desc;
            }
            	
            var limit = 5000;
            	
            var sql = 'select ' + fields + ' from ' + tables + ' where ' + conditions + ' order by ' + orderby + ' limit ' + limit + ';';

            var order = new OrderModel();

			var results = order.getDataSource().fetchAll( sql );

			var summary = {
				item_subtotal: 0,
				tax_subtotal: 0,
				surcharge_subtotal: 0,
				discount_subtotal: 0,
				payment: 0
			};

			// re-synthesis the data retrieved from DB to fit the structure that .tpl files use.
			var records = [];
			var oid;
			var record;
			var isFirstRow = true;
			
			results.forEach( function( result ) {
			
				if ( oid != result.id ) {
					if ( isFirstRow ) isFirstRow = false;
					else records.push( record );
					
					record = {};
					record.OrderItem = [];
					record.Order = {};
				
					record.total = result.total;
					record.sequence = result.sequence;
					record.tax_subtotal = result.tax_subtotal;
					record.item_subtotal = result.item_subtotal;
					record.discount_subtotal = result.discount_subtotal;
					record.surcharge_subtotal = result.surcharge_subtotal;
					record.items_count = result.items_count;
					record.no_of_customers = result.no_of_customers;
					record.terminal_no = result.terminal_no;
					
					record.Order.time = result.time;
					
					summary.item_subtotal += result.item_subtotal;
					summary.tax_subtotal += result.tax_subtotal;
					summary.surcharge_subtotal += result.surcharge_subtotal;
					summary.discount_subtotal += result.discount_subtotal;
					summary.payment += result.total;
				}
				
				var item = {};

				item.product_no = result.product_no;
				item.product_name = result.product_name;
				item.current_qty = result.current_qty;
				item.current_price = result.current_price;
				item.current_subtotal = result.current_subtotal;
					
				record.OrderItem.push( item );
				
				oid = result.id;
			} );
			// trap the last order.	
			if ( record ) records.push( record );
			
            var data = {
                head: {
                    title:_( 'Daily Sales Report - Detail' ),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: records,
                foot: {
                	foot_datas: summary,
                	gen_time: ( new Date() ).toString( 'yyyy/MM/dd HH:mm:ss' )
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/rpt_daily_sales_detail/rpt_daily_sales_detail.tpl' );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            result = tpl.process(data);

            var bw = document.getElementById( 'preview_frame' );
            var doc = bw.contentWindow.document.getElementById( 'abody' );

            doc.innerHTML = result;

            this._enableButton( true );
            
            // initialize the splitter.
            var splitter = document.getElementById( 'splitter_zoom' );
            splitter.setAttribute( 'state', 'collapsed' );

            waitPanel.hidePopup();

        },

        exportPdf: function() {
			if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel' );

                this.BrowserPrint.getPrintSettings();
                this.BrowserPrint.setPaperSizeUnit(1);
                this.BrowserPrint.setPaperSize( 297, 210 );
                // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf(media_path + this._fileName);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export CSV copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_detail/rpt_daily_sales_detail_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile(media_path + this._fileName, datas, tpl);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

        },

        exportRcp: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to print this report?' ) ) )
        		return;
        		
            try {
                this._enableButton(false);
                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_daily_sales_detail/rpt_daily_sales_detail_rcp_80mm.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                // this.RcpExport.print(datas, tpl);
                var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
                rcp.printReport('report', tpl, datas);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
               		waitPanel.hidePopup();
            }
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

            this._enableButton(false);            
        }
    });
})();
