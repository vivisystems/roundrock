(function(){

    /**
     * RptDepartments Controller
     */

    var  XUL_NS = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";

    GeckoJS.Controller.extend( {
        name: 'RptDepartments',
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
            
            var sortby = document.getElementById( 'sortby' ).value;
        	var orderby = 'no';
        	if ( sortby != 'all' )
        		orderby = sortby;
            
            var cate = new CategoryModel();
            var datas = cate.find('all', {
                fields: ['no','name'], order: orderby
                });
        	
            var self = this;

            var data = {
                head: {
                    title:_('Department List'),
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: datas,
                foot: {
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_departments.tpl");

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
            this.BrowserPrint.setPaperSize(210, 297);
            // this.BrowserPrint.setPaperEdge(80, 80, 80, 80);
            // this.BrowserPrint.setPaperMargin(2, 2, 2, 2);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/departments.pdf");
        },

        exportCsv: function() {
            
//            var columns = ['no', 'name'];
//            var headers = ['No', 'Name'];
//            this.CsvExport.exportToCsv("/var/tmp/departments2.csv", headers, columns, this._datas.body);

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_departments_csv.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            this.CsvExport.printToFile("/var/tmp/departments.csv", datas, tpl);

        },

        exportRcp: function() {
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_departments_rcp.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            // this.RcpExport.print(datas, tpl);
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
            rcp.printReport('report', tpl, datas);

        },

        load: function() {
        }

    });

})();
