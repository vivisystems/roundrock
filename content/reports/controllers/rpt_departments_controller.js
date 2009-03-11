(function(){

    /**
     * RptDepartments Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptDepartments',
        components: ['BrowserPrint', 'CsvExport', 'CheckMedia'],
        _datas: null,
        
        _fileName: "/rpt_departments",

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

            var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_departments/rpt_departments.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            this._enableButton(true);
            
            var splitter = document.getElementById('splitter_zoom');
            splitter.setAttribute("state", "collapsed");

            waitPanel.hidePopup();

        },

        exportPdf: function() {
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel');

                this.BrowserPrint.getPrintSettings();

                this.BrowserPrint.setPaperSizeUnit(1);
                this.BrowserPrint.setPaperSize(210, 297);
                // this.BrowserPrint.setPaperEdge(80, 80, 80, 80);
                // this.BrowserPrint.setPaperMargin(2, 2, 2, 2);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf(media_path + this._fileName);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_departments/rpt_departments_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile(media_path + this._fileName, datas, tpl);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

        },

        exportRcp: function() {
            try {
                this._enableButton(false);
                var waitPanel = this._showWaitPanel('wait_panel', 100);

                var path = GREUtils.File.chromeToPath("chrome://reports/locale/reports/tpl/rpt_departments/rpt_departments_rcp_80mm.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                // this.RcpExport.print(datas, tpl);
                var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
                rcp.printReport('report', tpl, datas);
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

        },

        load: function() {

            this._enableButton(false);
        }

    });

})();
