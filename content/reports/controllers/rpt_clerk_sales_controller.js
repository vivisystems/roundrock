(function(){

    /**
     * RptClerkSales Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptClerkSales',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],
        _datas: null,
        
        _fileName: "/rpt_clerk_sales",

       _showWaitPanel: function( panel, sleepTime ) {
            var waitPanel = document.getElementById( panel );
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo( 360, 120 );
            var x = ( width - 360 ) / 2;
            var y = ( height - 240 ) / 2;
            waitPanel.openPopupAtScreen( x, y );

            // release CPU for progressbar ...
            if ( !sleepTime ) {
              sleepTime = 1000;
            }
            this.sleep( sleepTime );
            return waitPanel;
        },

        _enableButton: function( enable ) {
            var disabled = !enable;
            $( '#export_pdf' ).attr( 'disabled', disabled );
            $( '#export_csv' ).attr( 'disabled', disabled );
            $( '#export_rcp' ).attr( 'disabled', disabled );
        },

        execute: function() {
            var waitPanel = this._showWaitPanel( 'wait_panel' );

            var storeContact = GeckoJS.Session.get( 'storeContact' );
            var clerk = "";
            var clerk_displayname = "";
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
            
            // find out all designated clerks.
            var clerk_type = document.getElementById( 'clerk_type' ).value;
            var orderModel = new OrderModel();
            
            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status=1";

            if (machineid.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            
            var clerks = orderModel.find( 'all', { fields: [ clerk_type + ' AS "Order.name"' ], conditions: conditions, group: [ clerk_type ] } );
            
            // retrieve all corresponding sales records.
            var fields = [
                            'sum(order_payments.amount) as "Order.payment_subtotal"',
                            'order_payments.name as "Order.payment_name"',
                            'orders.transaction_created',
                            //'DATETIME("orders"."transaction_created", "unixepoch", "localtime") AS "Order.Date"',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.change',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.service_clerk_displayname',
                            'orders.proceeds_clerk_displayname',
                            'orders.rounding_prices',
                            'orders.precision_prices',
                            'orders.surcharge_subtotal',
                            'orders.discount_subtotal',
                            'orders.items_count',
                            'orders.check_no',
                            'orders.table_no',
                            'orders.no_of_customers',
                            'orders.invoice_no',
                            'orders.terminal_no'
                         ];
                
            var groupby = 'order_payments.order_id, order_payments.name';
            var orderby = 'orders.terminal_no, orders.total desc';//orders.transaction_created, orders.id';

            var orderPayment = new OrderPaymentModel();

            var datas = orderPayment.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 1 } );

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            //prepare reporting data
            var repDatas = {};

            var initZero = parseFloat(0).toFixed(precision_prices);
            //
            clerks.forEach( function( clerk ) {
            	delete clerk.Order;
            	
            	if ( clerk_type == 'service_clerk_displayname' )
   					clerk.associated_clerk = 'Proceeds Clerk';
   				else clerk.associated_clerk = 'Service Clerk';
   				
            	clerk.orders = [];
            	clerk.summary = {
		        	tax_subtotal: 0,
		        	item_subtotal: 0,
		        	total: 0,
		        	surcharge_subtotal: 0,
		        	discount_subtotal: 0,
		        	cash: 0,
		        	check: 0,
		        	creditcard: 0,
		        	coupon: 0,
		        	giftcard: 0
		        };
            } );
            
            var old_oid;

            datas.forEach(function(data){

                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

                if (!repDatas[oid]) {
                    repDatas[oid] = GREUtils.extend({}, o); // { cash:0, creditcard: 0, coupon: 0 }, o );
                }
				
				if ( old_oid != oid ) {
					repDatas[ oid ][ 'cash' ] = 0.0;
					repDatas[ oid ][ 'check' ] = 0.0;
					repDatas[ oid ][ 'creditcard' ] = 0.0;
					repDatas[ oid ][ 'coupon' ] = 0.0;
					repDatas[ oid ][ 'giftcard' ] = 0.0;
				}
				
				if ( o.payment_name == 'cash' ) {
					repDatas[ oid ][o.payment_name] += o.payment_subtotal - o.change;
				} else {
		            repDatas[ oid ][ o.payment_name ] += o.payment_subtotal;
				}

                old_oid = oid;
            });
            
            this._datas = GeckoJS.BaseObject.getValues(repDatas);
            
            var sortby = document.getElementById( 'sortby' ).value;
            
            if ( sortby == 'associated_clerk_displayname' ) {
		        if ( clerk_type == 'service_clerk_displayname' )
					sortby = 'proceeds_clerk_displayname';
				else sortby = 'service_clerk_displayname';
			}
           				
            if ( sortby != 'all' ) {
            	this._datas.sort(
            		function ( a, b ) {
            			a = a[ sortby ];
            			b = b[ sortby ];
            			
            			switch ( sortby ) {
            				
            				case 'terminal_no':
            				case 'associated_clerk_displayname':
            					if ( a > b ) return 1;
				    			if ( a < b ) return -1;
				    			return 0;
				    		case 'transaction_created':
				    		case 'sequence':
				    		case 'invoice_no':
				    		case 'item_subtotal':
				    		case 'tax_subtotal':
				    		case 'surcharge_subtotal':
				    		case 'discount_subtotal':
				    		case 'total':
				    		case 'cash':
				    		case 'check':
				    		case 'creditcard':
				    		case 'coupon':
				    		case 'giftcard':
            					if ( a < b ) return 1;
				    			if ( a > b ) return -1;
				    			return 0;
					    }
					    
            			
            		}
            	);
            }
            
           	this._datas.forEach( function( data ) {
           		clerks.forEach( function( clerk ) {
           			if ( clerk.name == data[ clerk_type ] ) {
           				delete data.Order ;
           				
           				clerk.orders.push( data );
           				
           				clerk.summary.tax_subtotal += data[ 'tax_subtotal' ];
           				clerk.summary.item_subtotal += data[ 'item_subtotal' ];
           				clerk.summary.total += data[ 'total' ];
           				clerk.summary.surcharge_subtotal += data[ 'surcharge_subtotal' ];
           				clerk.summary.discount_subtotal += data[ 'discount_subtotal' ];
           				clerk.summary.cash += data[ 'cash' ];
           				clerk.summary.check += data[ 'check' ];
           				clerk.summary.creditcard += data[ 'creditcard' ];
           				clerk.summary.coupon += data[ 'coupon' ];
           				clerk.summary.giftcard += data[ 'giftcard' ];
           			}
           		});
           	});

			if ( clerk_type == 'service_clerk_displayname' )
				reportTitle = 'Service Clerk Sales Report';
			else reportTitle = 'Proceeds Clerk Sales Report';
   				
            var data = {
                head: {
                    title: reportTitle,
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: clerks,
                foot: {
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_clerk_sales/rpt_clerk_sales.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            this._enableButton(true);
            
            var splitter = document.getElementById( 'splitter_zoom' );
            splitter.setAttribute( "state", "collapsed" );

            waitPanel.hidePopup();

        },

        exportPdf: function() {
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel');

                this.BrowserPrint.getPrintSettings();
                this.BrowserPrint.setPaperSizeUnit(1);
                this.BrowserPrint.setPaperSize(297, 210);
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
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_clerk_sales/rpt_clerk_sales_csv.tpl");

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
            try {
                this._enableButton(false);
                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_clerk_sales/rpt_clerk_sales_rcp_80mm.tpl");

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

            document.getElementById( 'start_date' ).value = start;
            document.getElementById ('end_date' ).value = end;
        
            this._enableButton( false );
            
        }

    });


})();
