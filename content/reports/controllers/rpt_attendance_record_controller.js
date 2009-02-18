(function(){

    /**
     * RptAttendanceRecord Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptAttendanceRecord',
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

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = ['clock_stamps.created',
                            'clock_stamps.modified',
                            'DATETIME("clock_stamps"."created", "unixepoch", "localtime") AS "ClockStamp.InTime"',
                            'DATETIME("clock_stamps"."modified", "unixepoch", "localtime") AS "ClockStamp.OutTime"',
                            'ABS("clock_stamps"."modified" - "clock_stamps"."created") AS "ClockStamp.Spans"',
                            'TIME(ABS("clock_stamps"."modified" - "clock_stamps"."created"), "unixepoch") AS "ClockStamp.SpanTime"',
                            'clock_stamps.username',
                            'clock_stamps.job'];

            var conditions = "clock_stamps.created>='" + start +
                            "' AND clock_stamps.created<='" + end +
                            "'";

            var groupby = 'clock_stamps.username';
            var orderby = 'clock_stamps.username,clock_stamps.created';

            var clockStamp = new ClockStampModel();
            var datas = clockStamp.find('all',{fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1});

            /*
            var user = new UserModel();
            var users = user.find('all', {
                fields: ['username','displayname','group']
                });
            */

            // prepare report datas
            var clockStamps = {};
            
            var old_user;
            var total_spans;
            datas.forEach(function(o){
                if (!clockStamps[o.username]) {
                    clockStamps[o.username] = {};
                    clockStamps[o.username].username = o.username;
                    clockStamps[o.username].total_spans = 0;
                    clockStamps[o.username].clockStamps = [];
                }
                clockStamps[o.username].clockStamps.push(GREUtils.extend({}, o));
                clockStamps[o.username].total_spans += o.Spans;
                clockStamps[o.username].total_spantime = GeckoJS.String.padLeft(parseInt(clockStamps[o.username].total_spans / 60 / 60),2) + ":" +
                                                            GeckoJS.String.padLeft(parseInt((clockStamps[o.username].total_spans / 60) % 60),2) + ":" +
                                                            GeckoJS.String.padLeft(parseInt(clockStamps[o.username].total_spans % 60),2);
            });

            var data = {
                head: {
                    title:_('Attendance Record Report'),
                    start_time: start_str,
                    end_time: end_str,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: GeckoJS.BaseObject.getValues(clockStamps),
                foot: {
                    gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

            this._datas = data;

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_attendance_record.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            var result = tpl.process(data);

            var bw = document.getElementById('preview_frame');
            var doc = bw.contentWindow.document.getElementById('abody');

            doc.innerHTML = result;

            waitPanel.hidePopup();

        },

        exportPdf: function() {

            // this.execute();
            // this.print();

            this.BrowserPrint.getPrintSettings();
            this.BrowserPrint.setPaperSizeUnit(1);
            this.BrowserPrint.setPaperSize(297, 210);
            // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

            this.BrowserPrint.getWebBrowserPrint('preview_frame');
            this.BrowserPrint.printToPdf("/var/tmp/attendance_record.pdf");
        },

        exportCsv: function() {

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_attendance_record_csv.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            this.CsvExport.printToFile("/var/tmp/attendance_record.csv", datas, tpl);

        },

        exportRcp: function() {
            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_attendance_record_rcp.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            var datas;
            datas = this._datas;

            // this.RcpExport.print(datas, tpl);
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName('Print');
            rcp.printReport('report', tpl, datas);

        },

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;
            
        }

    });


})();

