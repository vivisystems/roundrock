(function(){

    /**
     * RptCashByClerk Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptCashByClerk',
        components: ['BrowserPrint','CsvExport'],
	
        _datas: null,

        execute: function() {
            //
            this.load();

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

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

        },

        exportPdf: function() {

            // this.execute();
            // this.print();

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(210, 297);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/cash_by_clerk.pdf");
        },

        exportCsv: function() {
            
            this.CsvExport.exportToCsv("/var/tmp/cash_by_clerk.csv");

        },

        load: function() {
            var self = this;
            this._selectedIndex = -1;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();


        }

    });


})();

