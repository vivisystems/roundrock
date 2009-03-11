(function(){

    /**
     * RptOrderStatus Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptOrderStatus',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],
        _datas: null,
        
        _fileName: "/rpt_order_status",

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
            var waitPanel = this._showWaitPanel('wait_panel');

            var storeContact = GeckoJS.Session.get('storeContact');
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            
            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var machineid = document.getElementById('machine_id').value;

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = [
                            'orders.transaction_created',
                            'orders.id',
                            'orders.sequence',
                            'orders.status',
                            'orders.change',
                            'orders.tax_subtotal',
                            'orders.item_subtotal',
                            'orders.total',
                            'orders.service_clerk_displayname',
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

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status < 100";
                            
            var orderstatus = document.getElementById( 'orderstatus' ).value;
            if ( orderstatus != 'all' )
            	conditions += " AND orders.status = " + orderstatus;
                            
            var service_clerk = document.getElementById( 'service_clerk' ).value;
            if ( service_clerk != 'all' )
            	conditions += " AND orders.service_clerk_displayname = '" + service_clerk + "'";

            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                //var groupby = 'orders.terminal_no,"Order.Date"';
            } else {
                //var groupby = '"Order.Date"';
            }
            var groupby = '';
            var orderby = 'orders.terminal_no, orders.transaction_created, orders.id';
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' )
            	orderby = 'orders.' + sortby;
            
            var order = new OrderModel();
            
            var datas = order.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1 } );
            
            var tax_subtotal = 0;
        	var item_subtotal = 0;
        	var total = 0;
        	var surcharge_subtotal = 0;
        	var discount_subtotal = 0;
            
            datas.forEach( function( data ) {
            	delete data.Order;
            	
            	tax_subtotal += data.tax_subtotal;
		    	item_subtotal += data.item_subtotal;
		    	total += data.total;
		    	surcharge_subtotal += data.surcharge_subtotal;
		    	discount_subtotal += data.discount_subtotal;
            	
            	switch ( parseInt( data.status ) ) {
            		case 1:
            			data.status = 'Finalized';
            			break;
            		case 2:
            			data.status = 'Saved';
            			break;
            		case -1:
            			data.status = 'Canceled';
            			break;
            	}
            });

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            var initZero = parseFloat(0).toFixed(precision_prices);
            var footDatas = {
            	tax_subtotal: tax_subtotal,
            	item_subtotal: item_subtotal,
            	total: total,
            	surcharge_subtotal: surcharge_subtotal,
            	discount_subtotal: discount_subtotal,
            };

            var data = {
                head: {
                    title:_('Order Status Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: machineid,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: datas,
                foot: {
                    foot_datas: footDatas,
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_order_status.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_order_status_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.File.readAllBytes(file);
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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_order_status_rcp.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.File.readAllBytes(file);
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
            
            function addMenuitem( dbModel, fields, order, group, menupopupId, valueField, labelField ) {
		        //set up the designated pop-up menulist.
		        var records = dbModel.find( 'all', { fields: fields, order: order, group: group } );
		        var menupopup = document.getElementById( menupopupId );

		        records.forEach( function( data ) {
		            var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
		            menuitem.setAttribute( 'value', data[ valueField ] );
		            menuitem.setAttribute( 'label', data[ labelField ] );
		            menupopup.appendChild( menuitem );
		        });
		    }
		    	    
		    addMenuitem( new OrderModel(), [ 'service_clerk_displayname' ],
		    			[ 'service_clerk_displayname' ], [ 'service_clerk_displayname' ], 'service_clerk_menupopup', 'service_clerk_displayname', 'service_clerk_displayname' );

            this._enableButton(false);
            
        }

    });


})();
