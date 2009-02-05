(function(){

    /**
     * RptProducts Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptCashByClerk',
	
        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _datas: null,

        showPageSetup: function () {
            try {
                var printSettings = this.getPrintSettings();
                alert("setup:" + printSettings.paperName);
                var PRINTPROMPTSVC = Components.classes["@mozilla.org/embedcomp/printingprompt-service;1"]
                .getService(Components.interfaces.nsIPrintingPromptService);
                PRINTPROMPTSVC.showPageSetup(window, printSettings, null);
                alert("setup:" + printSettings.paperName);
                if (gSavePrintSettings) {
                    // Page Setup data is a "native" setting on the Mac
                    var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
                    .getService(Components.interfaces.nsIPrintSettingsService);
                    PSSVC.savePrintSettingsToPrefs(printSettings, true, printSettings.kInitSaveNativeData);
                }
            } catch (e) {
                dump("showPageSetup "+e+"\n");
                return false;
            }
            return true;
        },

        print: function () {

            var webBrowserPrint = this.getWebBrowserPrint();
            var printSettings = this.getPrintSettings();

            printSettings.paperSizeUnit = 1; //kPaperSizeMillimeters;
    
            // letter
            printSettings.paperHeight = 279;
            printSettings.paperWidth = 216;

            // a4
            printSettings.paperHeight = 288;
            printSettings.paperWidth = 210;

            printSettings.edgeLeft = 60;
            printSettings.edgeRight = 60;
            printSettings.edgeTop = 60;
            printSettings.edgeBottom = 60;

            printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;

            var path = "/var/tmp/cash_by_clerk.pdf";
            printSettings.printToFile = true;
            printSettings.toFileName = path;
            printSettings.printSilent = true;
    
            try {
                webBrowserPrint.print(printSettings, null);

            } catch (e) {

            }
        },

        getWebBrowserPrint: function () {
            var doc = document.getElementById('preview_frame');
            var _content = doc.contentWindow;
            return _content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebBrowserPrint);
        },

        getPrintSettings: function () {
            var pref = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefBranch);
            if (pref) {
                gPrintSettingsAreGlobal = pref.getBoolPref("print.use_global_printsettings", false);
                gSavePrintSettings = pref.getBoolPref("print.save_print_settings", false);
            }

            var printSettings;
            try {
                var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
                .getService(Components.interfaces.nsIPrintSettingsService);
                if (gPrintSettingsAreGlobal) {
                    printSettings = PSSVC.globalPrintSettings;
                    this.setPrinterDefaultsForSelectedPrinter(PSSVC, printSettings);
                } else {
                    printSettings = PSSVC.newPrintSettings;
                }
            } catch (e) {
                dump("getPrintSettings: "+e+"\n");
            }
            return printSettings;
        },

        execute: function() {
            //
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            var data = {
                head: {
                    title:_('Closed Cash Report'),
                    start_date: start,
                    end_date: end
                },
                body: this._datas,
                foot: {
                    summary: 120
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

            this.execute();
            this.print();
        },

        exportCsv: function() {
            
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            var data = {
                head: {
                    title:_('Product List'),
                    start_date: start_str,
                    end_date: end_str,
                    department: 'department'
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_cash_by_clerk.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            
            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

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
            
            var shiftChange = new ShiftChangeModel();
            var datas = shiftChange.find('all', {
                fields: []
                });

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            // text = GeckoJS.NumberHelper.round(this.data[row].amount, precision_prices, rounding_prices) || 0;

            datas.forEach(function(o){
                var d = new Date();
                d.setTime(o.starttime);
                o.starttime = d.toString('yyyy/MM/dd HH:mm');
                d.setTime(o.endtime);
                o.endtime = d.toString('yyyy/MM/dd HH:mm');

                o.amount = GeckoJS.NumberHelper.round(o.amount, precision_prices, rounding_prices) || 0;
                o.amount = o.amount.toFixed(precision_prices);

                o.ShiftChangeDetail.forEach(function(k){
                    k.amount = GeckoJS.NumberHelper.round(k.amount, precision_prices, rounding_prices) || 0;
                    k.amount = k.amount.toFixed(precision_prices);
                });
            });
            // this.log(this.dump(datas));

            this._datas = datas;
        }

    });


})();

