(function(){

    /**
     * Class ViviPOS.ProductSalesController
     */

var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

var gPrintSettingsAreGlobal = false;
var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'Inventories',
	
        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datascrollablepanel');
                // this._productsById = GeckoJS.Session.get('productsById');
                // this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        list: function() {
            /*
            var productModel = new ProductModel();
            var products = productModel.find('all', {
                order: 'no'
            });
            this._listDatas = products;
            */
        },

  showPageSetup: function ()
  {
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

/*
SetPrintSettings: function() {
// -- advanced features
factory.printing.SetMarginMeasure(2) // measure margins in inches
factory.SetPageRange(false, 1, 3) // need pages from 1 to 3
factory.printing.printer = "HP DeskJet 870C"
factory.printing.copies = 2
factory.printing.collate = true
factory.printing.paperSize = "A4"
factory.printing.paperSource = "Manual feed"

// -- basic features
factory.printing.header = "This is MeadCo"
factory.printing.footer = "Advanced Printing by ScriptX"
factory.printing.portrait = false
factory.printing.leftMargin = 1.0
factory.printing.topMargin = 1.0
factory.printing.rightMargin = 1.0
factory.printing.bottomMargin = 1.0
},
*/

  /*
  print: function (aWindow)
  {
    var webBrowserPrint = this.getWebBrowserPrint(aWindow);
    var printSettings = this.getPrintSettings();
    try {
      webBrowserPrint.print(printSettings, null);
      if (gPrintSettingsAreGlobal && gSavePrintSettings) {
        var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
                              .getService(Components.interfaces.nsIPrintSettingsService);
        PSSVC.savePrintSettingsToPrefs(printSettings, true,
                                       printSettings.kInitSaveAll);
        PSSVC.savePrintSettingsToPrefs(printSettings, false,
                                       printSettings.kInitSavePrinterName);
      }
    } catch (e) {
      // Pressing cancel is expressed as an NS_ERROR_ABORT return value,
      // causing an exception to be thrown which we catch here.
      // Unfortunately this will also consume helpful failures, so add a
      // dump("print: "+e+"\n"); // if you need to debug
    }
  },
  */

  print: function ()
  {
      // this.showPageSetup();
      // alert('Print...');

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

    alert("width:" + printSettings.paperWidth +
          ", Height:" + printSettings.paperHeight +
          ", Left:" + printSettings.edgeLeft +
          ", Right:" + printSettings.edgeRight +
          ", Top:" + printSettings.edgeTop +
          ", Bottom:" + printSettings.edgeBottom +
            "");

    //297,210

    printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;
    //printSettings.paperName = 'na_letter';
    //alert("height:" + printSettings.paperHeight);
    //alert("width:" + printSettings.paperWidth);

    //alert("printToFile:" + printSettings.printToFile);
    var path = "/var/tmp/ttn_b6.pdf";
    printSettings.printToFile = true;
    printSettings.toFileName = path;
    printSettings.printSilent = true;
    

    alert(printSettings.paperName);
    //printSettings.paperName = 'na_letter';
    //alert(printSettings.paperName);

    try {
      webBrowserPrint.print(printSettings, null);
      /*
      if (gPrintSettingsAreGlobal && gSavePrintSettings) {
        var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
                              .getService(Components.interfaces.nsIPrintSettingsService);
        PSSVC.savePrintSettingsToPrefs(printSettings, true,
                                       printSettings.kInitSaveAll);
        PSSVC.savePrintSettingsToPrefs(printSettings, false,
                                       printSettings.kInitSavePrinterName);
      }
      */
    } catch (e) {
      // Pressing cancel is expressed as an NS_ERROR_ABORT return value,
      // causing an exception to be thrown which we catch here.
      // Unfortunately this will also consume helpful failures, so add a
      // dump("print: "+e+"\n"); // if you need to debug
    }
  },

  /*
  getWebBrowserPrint: function (aWindow)
  {
    var contentWindow = aWindow || window.content;
    return contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIWebBrowserPrint);
  },
  */
  getWebBrowserPrint: function ()
  {
      var doc = document.getElementById('preview_frame');
      var _content = doc.contentWindow;
    return _content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebBrowserPrint);
  },

  /*
  getPrintSettings: function ()
  {
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
  */

  getPrintSettings: function ()
  {
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

        testprintPDF: function() {

// printOptions = printService.QueryInterface(Components.interfaces.nsIPrintOptions);

            var doc = document.getElementById('preview_frame');
            // var webBrowserPrint = window.content.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            var webBrowserPrint = doc.contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
            .getInterface(Components.interfaces.nsIWebBrowserPrint);
            var PSSVC = Components.classes["@mozilla.org/gfx/printsettings-service;1"]
            .getService(Components.interfaces.nsIPrintSettingsService);
            var printSettings = PSSVC.newPrintSettings;

            var path = "/var/tmp/tt.pdf";
            printSettings.printToFile = true;
            printSettings.toFileName = path;
            printSettings.printSilent = true;
            printSettings.showPrintProgress = true;
            printSettings.shrinkToFit = false;

            alert(printSettings.isInitializedFromPrefs);
            alert(printSettings.printerName);
            alert(printSettings.paperName);

            // printSettings.startPageRange = 1;
            // printSettings.endPageRange = 3;
            // printSettings.scaling = 1;
            printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;

            // webBrowserPrint.print(printSettings, null);

        },

        execute: function() {
            //
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var data = {
                head: {title:_('Inventories Report'), start_date: start, end_date: end},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/inventory.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');
            /*
            var iframeDoc = bw.contentDocument;
            iframeDoc.open();
            iframeDoc.write(result);
            iframeDoc.close();
            */
/*
            for (var i=0; i< 5; i++) {
                result = result + result;
            }
*/
            // alert('render ok.');
            doc.innerHTML = result;

            //this.log(result);
            //alert(result);
            // this.testprintPDF();
            this.print();

            //alert(doc);
            //doc.write(result);

/*
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var ran = Math.random();
            var url = "chrome://viviecr/content/reports/product_sales_template.xul?start_date=2008-12&i=" + ran;
            // var url = "chrome://viviecr/content/reports/product_sales_template.xul";

            var path = "/home/achang/workspace/vivipos_app/content/reports/product_sales.xml";

            var self = this;
            var xml = '';
            xml = '<product_sales>\n';
            xml = xml + '<filter start_date="' + start + '" end_date="' + end + '"/>\n';
            // self.log(self.dump(this._datas));
            this._datas.forEach(function(o){
                // var str = '<data product_no="' + o.product_no + '" product_name="' + o.product_name + '" qty="' + o.qty + '" total="' + o.total + '"/>\n';
                // self.log(self.dump(o));
                var str = '';
                    for (key in o) {
                        str = str + ' ' + key + '="' + o[key] + '"';
                    }
                str = '<data' + str + '/>\n';
                xml = xml + str;
            });

            xml = xml + '</product_sales>';
            // alert(xml);

            var parser = new DOMParser();
            var dom = parser.parseFromString(xml, "text/xml");

            document.getElementById('preview').builder.datasource = dom;
            document.getElementById('preview').builder.rebuild();

            document.getElementById('product_sales_datas').builder.datasource = dom;
            document.getElementById('product_sales_datas').builder.rebuild();
            // document.getElementById('preview').setAttribute('src', url);
            // document.getElementById('preview').setAttribute('datasources', 'product_sales.xml');
*/

        },

        exportCsv: function() {
            
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();
            
            var department = document.getElementById('department').value;

            var data = {
                head: {title:_('Inventories Report'), start_date: start_str, end_date: end_str, department: department},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/inventory.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            
            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

/*
            var iframe = document.getElementById('preview');

            // iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
            iframe.contentDocument.getElementById("abody").innerHTML = result;
//            iframe.document.open();
//            iframe.document.write(result);
//            iframe.document.close();
this.log(this.dump(result));

            // var aURL = "chrome://viviecr/content/jstemplate/jstemplate.xul";
            var aURL = "chrome://viviecr/content/reports/product_sales_template.xul";
            var aName = "testjstemplate";
            var aArguments = "";
            var width = 800;
            var height = 600;
            var posX = 0;
            var posY = 0;
            //var width = this.screenwidth;
            //var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
*/
        },

        load: function() {
            this._selectedIndex = -1;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var department = document.getElementById('department').value;
            department = '';
            var cate = new CategoryModel();
            var cateDatas = cate.find('all', {fields: ['no','name']});
// this.log(this.dump(cateDatas));
            var self = this;
            var datas = [];
            cateDatas.forEach(function(o){
                datas[o.no] = {no:o.no, name:o.name};
            });

            var prod = new ProductModel();
            var prodDatas = prod.find('all', {fields: ['cate_no', 'no','name','stock','min_stock'], order:'cate_no'});
// this.log(this.dump(prodDatas));
            prodDatas.forEach(function(o){
                if (datas[o.cate_no]) {
                    if (datas[o.cate_no].plu == null) {
                        datas[o.cate_no].plu = [];
                    }
                    datas[o.cate_no].plu.push( {cate_no:o.cate_no, no:o.no, name:o.name, stock:o.stock, min_stock:o.min_stock});
                }
            });

// this.log(this.dump(datas));
/*
            var fields = ['order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
            if (department.length > 0) {
                var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end +
                            "' AND order_items.cate_no='" + department + "'";
            } else {
                var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end + "'";
            }
            var groupby = 'order_items.product_no';
            var orderby = 'order_items.product_no';
            
            var datas = orderItem.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby});
*/
            this._datas = datas;
            //this._panelView = new GeckoJS.NSITreeViewArray(this._datas);
            //this.getListObj().datasource = this._panelView;
        }

    });


})();

