(function(){

    /**
     * RptCashByClerk Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptCashByClerk',
        components: ['BrowserPrint','CsvExport', 'CheckMedia'],
	
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
            //
            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

//            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
//            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();
            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var machineid = document.getElementById('machine_id').value;

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = [];
            var conditions = "shift_changes.created>='" + start +
                            "' AND shift_changes.created<='" + end +
                            "'";
            
            if (machineid.length > 0) {
                conditions += " AND shift_changes.terminal_no LIKE '" + machineid + "%'";
            } else {
                //
            }
            

            var groupby;

            var orderby = 'shift_changes.terminal_no,shift_changes.created';

            var shiftChange = new ShiftChangeModel();
            var datas = shiftChange.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2});

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;


            datas.forEach(function(o){
                var d = new Date();
                d.setTime(o.starttime * 1000);
                o.starttime = d.toString('yyyy/MM/dd HH:mm');
                d.setTime(o.endtime * 1000);
                o.endtime = d.toString('yyyy/MM/dd HH:mm');

                o.amount = GeckoJS.NumberHelper.round(o.amount, precision_prices, rounding_prices) || 0;
                o.amount = o.amount.toFixed(precision_prices);

                o.ShiftChangeDetail.forEach(function(k){
                    k.amount = GeckoJS.NumberHelper.round(k.amount, precision_prices, rounding_prices) || 0;
                    k.amount = k.amount.toFixed(precision_prices);
                });
            });

            this._datas = datas;

            var data = {
                head: {
                    title:_('Closed Cash Report'),
                    start_date: start,
                    end_date: end,
                    machine_id: machineid
                },
                body: this._datas,
                foot: {
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_cash_by_clerk.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            var result = tpl.process(data);

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
                this.BrowserPrint.setPaperSize(210, 297);
                // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf(media_path + "/cash_by_clerk.pdf");
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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_cash_by_clerk_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.File.readAllBytes(file);
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile(media_path + "/cash_by_clerk.csv", datas, tpl);


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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_cash_by_clerk_rcp.tpl");

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

