(function(){

    /**
     * Product Sales Controller
     */

    GeckoJS.Controller.extend( {
        name: 'ProductSales',
        components: ['BrowserPrint', 'CsvExport', 'CheckMedia'],
	
        _datas: null,

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

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            // var department = document.getElementById('department').value;
            var machineid = document.getElementById('machine_id').value;

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            // var department = document.getElementById('department').value;
            var department = '';
            
            var orderItem = new OrderItemModel();

            var fields = ['orders.terminal_no',
                    'order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
            var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end + "'";

            if (department.length > 0) {
                conditions += " AND order_items.cate_no='" + department + "'";
            }
            
            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
            }

            var groupby = 'order_items.product_no';
            var orderby = 'order_items.product_no';

            var datas = orderItem.find('all',{fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby});
this.log( this.dump( datas ) );
			var sortby = document.getElementById( 'sortby' ).value;
			if ( sortby != 'all' ) {
				datas.sort(
					function ( a, b ) {
						if ( a[ sortby ] > b[ sortby ] ) return 1;
						if ( a[ sortby ] < b[ sortby ] ) return -1;
						return 0;
					}
				);
			}

            this._datas = datas;

// this.log(this.dump(datas));

            var qty = 0;
            var summary = 0;
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            var options = {
                places: ((precision_prices>0)?precision_prices:0)
            };

            datas.forEach(function(o){
                qty = qty + o.qty;
                summary = summary + o.total;
                o.total = GeckoJS.NumberHelper.format(o.total, options);
            });

            this.qty = qty;
            this.summary = GeckoJS.NumberHelper.format(summary, options);

            var data = {
                head: {title:_('Product Sales Report'), start_date: start_str, end_date: end_str, department: department, machine_id: machineid},
                body: this._datas,
                foot: {qty: this.qty ,summary: this.summary},
                printedtime: (new Date()).toLocaleString()
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/product_sales.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);
            
            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            this._enableButton(true);

            waitPanel.hidePopup();
        },

        exportPdf: function() {
        
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('export_report');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel');

                this.BrowserPrint.getPrintSettings();
                this.BrowserPrint.setPaperSizeUnit(1);
                this.BrowserPrint.setPaperSize(297, 210);
                this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf(media_path + "/product_sales.pdf");
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('export_report');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_product_sales_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.File.readAllBytes(file);
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile(media_path + "/product_sales.csv", datas, tpl);


            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                waitPanel.hidePopup();
            }
        },

        exportRcp: function() {
            try {
                this._enableButton(false);
                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_product_sales_rcp.tpl");

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

