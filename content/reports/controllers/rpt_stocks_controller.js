(function(){

    /**
     * RptStocks Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptStocks',
        components: ['BrowserPrint', 'CsvExport'],
        
        _datas: null,

        _showWaitPanel: function(panel) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            this.sleep(1500);
            return waitPanel;
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

            var department = document.getElementById('department').value;

            var fields = ['cate_no', 'no','name','stock','min_stock'];

            var conditions = null;

            if (department != "all") {
                var cate = new CategoryModel();
                var cateDatas = cate.find('all', {
                    fields: ['no','name'],
                    conditions: "categories.no LIKE '" + department + "%'"
                    });
            } else {
                var cate = new CategoryModel();
                var cateDatas = cate.find('all', {
                    fields: ['no','name']
                    });                
            }

            var self = this;
            var datas = [];
            cateDatas.forEach(function(o){
                datas[o.no] = {
                    no:o.no,
                    name:o.name
                    };
            });

            var groupby;

            var orderby = 'products.cate_no,products.no';

            var prod = new ProductModel();
            var prodDatas = prod.find('all', { fields: fields, conditions: conditions, order: orderby });

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

            var data = {
                head: {
                    title:_('Product Stock List'),
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: datas,
                foot: {
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/inventory.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            var result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            waitPanel.hidePopup();

        },

        exportPdf: function() {

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(297, 210);
            // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/stocks.pdf");
        },

        exportCsv: function() {
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_stocks_csv.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            this.CsvExport.printToFile("/var/tmp/stocks.csv", datas, tpl);

        },

        exportRcp: function() {
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_stocks_rcp.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            // this.RcpExport.print(datas, tpl);
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
            rcp.printReport('report', tpl, datas);

        },

        load: function() {
            var cate = new CategoryModel();
            var cateDatas = cate.find('all', {
                fields: ['no','name']
                });
            var dpt = document.getElementById('department_menupopup');

            cateDatas.forEach(function(data){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', data.no);
                menuitem.setAttribute('label', data.no + "-" + data.name);
                dpt.appendChild(menuitem);
            });
        }

    });


})();

