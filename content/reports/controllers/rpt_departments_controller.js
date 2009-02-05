(function(){

    /**
     * RptDepartments Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptDepartments',
	
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

            var path = "/var/tmp/departments.pdf";
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

            var start = '';
            var end = '';
            var department = '';

            var data = {
                head: {
                    title:_('Department List'),
                    start_date: start,
                    end_date: end
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_departments.tpl");

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

            var start = '';
            var end = '';
            var department = '';

            var data = {
                head: {
                    title:_('Department List'),
                    start_date: start_str,
                    end_date: end_str,
                    department: department
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_departments.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            
            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

        },

        load: function() {
            this._selectedIndex = -1;

            var start = '';
            var end = '';
            var department = '';
            var cate = new CategoryModel();
            var cateDatas = cate.find('all', {
                fields: ['no','name']
                });
            // this.log(this.dump(cateDatas));
            var self = this;
            var datas = [];
            cateDatas.forEach(function(o){
                datas[o.no] = {
                    no:o.no,
                    name:o.name
                    };
            });

            var prod = new ProductModel();
            var prodDatas = prod.find('all', {
                fields: ['cate_no', 'no','name','stock','min_stock'],
                order:'cate_no'
            });
            // this.log(this.dump(prodDatas));
            prodDatas.forEach(function(o){
                if (datas[o.cate_no]) {
                    if (datas[o.cate_no].plu == null) {
                        datas[o.cate_no].plu = [];
                    }
                    datas[o.cate_no].plu.push( {
                        cate_no:o.cate_no,
                        no:o.no,
                        name:o.name,
                        stock:o.stock,
                        min_stock:o.min_stock
                        });
                }
            });

            this._datas = datas;

        }

    });

})();

