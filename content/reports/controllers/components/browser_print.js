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
        
        execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(param, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
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
        
        showPrintDialog: function() {
        	try {
        		if (!this._printSettings)
        			this.getPrintSettings();
        		
		    	this._webBrowserPrint.print( this._printSettings, null );
			} catch (e) {
			}
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

            if (!this._printSettings) this.getPrintSettings();

            try {
                this._printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;

                this._printSettings.printToFile = true;
                this._printSettings.toFileName = pdfFileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + ".pdf";
                this._printSettings.printSilent = true;

                this._webBrowserPrint.print(this._printSettings, null);
                
                // sync to media...
                this.execute("/bin/sync", []);
            } catch (e) {

            }
        },
       
        setPaperSizeUnit: function(paperSizeUnit) {

            if (!this._printSettings) this.getPrintSettings();
            this._printSettings.paperSizeUnit = 1; //kPaperSizeMillimeters;
        },

        setPaperSize: function(paperWidth, paperHeight) {

            if (!this._printSettings) this.getPrintSettings();
            this._printSettings.paperHeight = paperHeight;
            this._printSettings.paperWidth = paperWidth;

        },

        setPaperMargin: function(marginLeft, marginRight, marginTop, marginBottom) {

            if (!this._printSettings) this.getPrintSettings();
            this._printSettings.marginTop = marginTop;
            this._printSettings.marginLeft = marginLeft;
            this._printSettings.marginRight = marginRight;
            this._printSettings.marginBottom = marginBottom;
            
//            this._printSettings.setMarginTop(marginTop);
//            this._printSettings.setMarginLeft(marginLeft);
//            this._printSettings.setMarginRight(marginRight);
//            this._printSettings.setMarginBottom(marginBottom);

        },
        
        setPaperHeader: function( headerStrLeft, headerStrRight ) {
        	// set to default value if the parameter is null.
        	if (!this._printSettings) this.getPrintSettings();
        	
        	this._printSettings.headerStrRight = headerStrRight || 'Generated by VIVIPOS';
        	
        	this._printSettings.headerStrLeft = headerStrLeft || 'Firich Enterprises Co.,Ltd.';
        },

        setPaperEdge: function(edgeLeft, edgeRight, edgeTop, edgeBottom) {

            if (!this._printSettings) this.getPrintSettings();
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
            } else if (typeof content == "object") {printSettings.paperSizeUnit = 1; //kPaperSizeMillimeters;
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

                    // do not set default...
                    // this.setPrinterDefaultsForSelectedPrinter(PSSVC, printSettings);
                } else {
                    printSettings = PSSVC.newPrintSettings;
                }
            } catch (e) {
                dump("getPrintSettings: "+e+"\n");
            }

            printSettings.showPrintProgress = true;
            printSettings.printSilent = false;
            
            printSettings.paperSizeUnit = Components.interfaces.nsIPrintSettings.kPaperSizeMillimeters;
            
            printSettings.headerStrRight = 'Generated by VIVIPOS';
            printSettings.headerStrLeft = 'Firich Enterprises Co.,Ltd.';
            
            printSettings.shrinkToFit = true;
            printSettings.printToFile = true;
            
            printSettings.edgeLeft = 0;
            printSettings.edgeRight = 0;
            printSettings.edgeTop = 0;
            printSettings.edgeBottom = 0;
            
            printSettings.marginTop = 0.2;
            printSettings.marginLeft = 0;
            printSettings.marginRight = 0;
            printSettings.marginBottom = 0.2;
            
            printSettings.paperHeight = 297;// the size of A4 paper in milli-meter.
            printSettings.paperWidth = 210;
            
            this._printSettings = printSettings;

            return printSettings;
        }

    });

})();
