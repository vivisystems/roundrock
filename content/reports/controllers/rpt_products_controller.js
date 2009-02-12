(function(){

    /**
     * RptProducts Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    var gPrintSettingsAreGlobal = false;
    var gSavePrintSettings = false;

    GeckoJS.Controller.extend( {
        name: 'RptProducts',
        components: ['BrowserPrint', 'CsvExport'],
	
        _datas: null,

        execute: function() {
            var start = '';
            var end = '';
            var department = document.getElementById('department').value;

            var fields = [];

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
            // this.log(this.dump(prodDatas));

            prodDatas.forEach(function(o){
                if (datas[o.cate_no]) {
                    if (datas[o.cate_no].plu == null) {
                        datas[o.cate_no].plu = [];
                    }
                    datas[o.cate_no].plu.push(GREUtils.extend({}, o));
                }
            });

            this._datas = datas;

            var start = '';
            var end = '';
            var data = {
                head: {
                    title:_('Product List'),
                    start_date: start,
                    end_date: end
                },
                body: this._datas,
                foot: {
                    summary: 120
                }
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_products.tpl");

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
            this.BrowserPrint.setPaperSize(297, 210);
            this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/products.pdf");
        },

        exportCsv: function() {

            this.CsvExport.exportToCsv("/var/tmp/products.csv");

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

