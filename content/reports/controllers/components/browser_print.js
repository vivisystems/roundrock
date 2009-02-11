(function() {

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    var BrowserPrintComponent = window.BrowserPrintComponent = GeckoJS.Component.extend({

    /**
     * Component BrowserPrint
     */

        name: 'BrowserPrint',
        _printSettings: null,
        _webBrowserPrint: null,

        initial: function () {
            // @todo :
            alert('BrowserPrint initial...');
        },

        showPageSetup: function () {
            try {
                var printSettings = this.getPrintSettings();
                var PRINTPROMPTSVC = Components.classes["@mozilla.org/embedcomp/printingprompt-service;1"]
                .getService(Components.interfaces.nsIPrintingPromptService);
                PRINTPROMPTSVC.showPageSetup(window, printSettings, null);
                if (gSavePrintSettings) {
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

        /*
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
        */

        printToPdf: function(pdfFileName) {
            if (!pdfFileName) {
                // need filename
                return;
            }

            try {
                this._printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;

                this._printSettings.printToFile = true;
                this._printSettings.toFileName = pdfFileName;
                this._printSettings.printSilent = true;

                this._webBrowserPrint.print(this._printSettings, null);

            } catch (e) {

            }
        },
       
        setPaperSizeUnit: function(paperSizeUnit) {
            this._printSettings.paperSizeUnit = 1; //kPaperSizeMillimeters;
        },

        setPaperSize: function(paperWidth, paperHeight) {
            this._printSettings.paperHeight = paperHeight;
            this._printSettings.paperWidth = paperWidth;

        },

        setPaperEdge: function(edgeLeft, edgeRight, edgeTop, edgeBottom) {
            this._printSettings.edgeLeft = edgeLeft;
            this._printSettings.edgeRight = edgeRight;
            this._printSettings.edgeTop = edgeTop;
            this._printSettings.edgeBottom = edgeBottom;

        },

        getWebBrowserPrint: function (content) {
            
            var _content;
            if (typeof content == "string") {
                try {
                _content = document.getElementById(content).contentWindow;
                }
                catch (e) {}
            } else if (typeof content == "object") {
                _content = content;
            }
            if (!_content) {
                _content = window.contentWindow;
            }
            this._webBrowserPrint = _content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebBrowserPrint);
            return this._webBrowserPrint;
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

            this._printSettings = printSettings;

            return printSettings;
        }

    });

})();
