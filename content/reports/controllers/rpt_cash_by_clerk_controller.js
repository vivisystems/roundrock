(function(){

    /**
     * RptCashByClerk Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptCashByClerk',
        components: ['BrowserPrint','CsvExport', 'CheckMedia'],
	
        _datas: null,
        
        _fileName: "/rpt_cash_by_clerk",

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
        
        _set_datas: function( start, end, periodType, shiftNo, terminalNo ) {
        
        	var storeContact = GeckoJS.Session.get('storeContact');
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }
            
        	var d = new Date();
            d.setTime( start );
            var start_str = d.toString( 'yyyy/MM/dd HH:mm' );
            d.setTime( end );
            var end_str = d.toString( 'yyyy/MM/dd HH:mm' );

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = [];
            var conditions = "shift_changes." + periodType + ">='" + start +
                            "' AND shift_changes." + periodType + "<='" + end +
                            "'";
            
            if ( shiftNo.length > 0 )
            	conditions += " and shift_changes.shift_number = " + shiftNo;
            
            if (terminalNo.length > 0)
                conditions += " AND shift_changes.terminal_no LIKE '" + terminalNo + "%'";

            var groupby;

            var orderby = 'shift_changes.terminal_no, shift_changes.' + periodType;

            var shiftChange = new ShiftChangeModel();
            var datas = shiftChange.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2 } );

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            datas.forEach(function(o){
                var d = new Date();
                d.setTime( o.starttime * 1000 ); // multiplying one thousand so that the time can be in the millisecond scale.
                o.starttime = d.toString('yy/MM/dd HH:mm');
                d.setTime( o.endtime * 1000 );
                o.endtime = d.toString('yy/MM/dd HH:mm');
                
                d.setTime( o.sale_period * 1000 );
                o.sale_period = d.toString( 'yyyy/MM/dd' );

                o.balance = GeckoJS.NumberHelper.round(o.balance, precision_prices, rounding_prices) || 0;
                o.balance = o.balance.toFixed(precision_prices);

				if ( o.ShiftChangeDetail ) {
		            o.ShiftChangeDetail.forEach(function(k){
		                k.amount = GeckoJS.NumberHelper.round(k.amount, precision_prices, rounding_prices) || 0;
		                k.amount = k.amount.toFixed(precision_prices);
               		 });
               	}
            });
            
            var data = {
                head: {
                    title:_('Shift Change Report'),
                    start_time: start_str,
                    end_time: end_str,
                    machine_id: terminalNo,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: datas,
                foot: {
                	gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }
            
            this._datas = data;
        },
        
        printShiftChangeReport: function( start, end, periodType, shiftNo, terminalNo, printController ) {
        	// the parameters 'start' and 'end' are both thirteen-digit integer.
        	
        	this._set_datas( start, end, periodType, shiftNo, terminalNo );

            var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_cash_by_clerk/rpt_cash_by_clerk_rcp_80mm.tpl");
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
            
			//tpl.process( this._datas );
            //var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
            //rcp.printReport('report', tpl, this._datas);
            printController.printReport('report', tpl, this._datas);
        },

        execute: function() {

            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            
            var periodType = document.getElementById( 'period_type' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;

            var machineid = document.getElementById('machine_id').value;
            
            this._set_datas( start, end, periodType, shiftNo, machineid );

            var path = GREUtils.File.chromeToPath( "chrome://reports/locale/reports/tpl/rpt_cash_by_clerk/rpt_cash_by_clerk.tpl" );

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var result = tpl.process( this._datas );

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            this._enableButton(true);
            
            var splitter = document.getElementById('splitter_zoom');
            splitter.setAttribute("state", "collapsed");

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
	            this.BrowserPrint.setPaperSize(210, 297);
	            // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

	            this.BrowserPrint.getWebBrowserPrint('preview_frame');
	            this.BrowserPrint.printToPdf( media_path + this._fileName );
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

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_cash_by_clerk/rpt_cash_by_clerk_csv.tpl");

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

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_cash_by_clerk/rpt_cash_by_clerk_rcp_80mm.tpl");

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