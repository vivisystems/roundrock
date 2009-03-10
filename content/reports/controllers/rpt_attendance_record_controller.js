(function(){

    /**
     * RptAttendanceRecord Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptAttendanceRecord',
        components: ['BrowserPrint', 'CsvExport', 'CheckMedia'],
        _datas: null,
        
        _fileName: "/rpt_attendance_record",

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

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            start = parseInt(start / 1000);
            end = parseInt(end / 1000);

            var fields = [
            				'clock_stamps.created',
                            'clock_stamps.modified',
                            'DATETIME("clock_stamps"."created", "unixepoch", "localtime") AS "ClockStamp.InTime"',
                            'DATETIME("clock_stamps"."modified", "unixepoch", "localtime") AS "ClockStamp.OutTime"',
                            'ABS("clock_stamps"."modified" - "clock_stamps"."created") AS "ClockStamp.Spans"',
                            'TIME(ABS("clock_stamps"."modified" - "clock_stamps"."created"), "unixepoch") AS "ClockStamp.SpanTime"',
                            'clock_stamps.username',
                            'clock_stamps.job'
                        ];

            var conditions = "clock_stamps.created>='" + start +
                            "' AND clock_stamps.created<='" + end +
                            "'";
                            
            var userName = document.getElementById( 'user' ) .value;
            if ( userName != 'all' )
            	conditions += " AND clock_stamps.username = '" + userName + "'";
            	
           	var jobTitle = document.getElementById( 'job' ).value;
           	if ( jobTitle != 'all' )
           		conditions += " AND clock_stamps.job = '" + jobTitle + "'";

            var groupby = 'clock_stamps.username';
            var orderby = 'clock_stamps.username,clock_stamps.created';

            var clockStamp = new ClockStampModel();
            var datas = clockStamp.find( 'all', { fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1 } );

            /*
            var user = new UserModel();
            var users = user.find('all', {
                fields: ['username','displayname','group']
                });
            */
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' ) {
		        datas.sort(
				    function( a, b ) {
				    	a = a[ sortby ];
				    	b = b[ sortby ];
				    	if ( a > b ) return 1;
				    	if ( a < b ) return -1;
				    	return 0;
				    }
		        );
		    }

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

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/Chinese/rpt_attendance_record.tpl");

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
                // this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf( media_path + this._fileName );
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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_attendance_record_csv.tpl");

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

                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/tpl_58mm/rpt_attendance_record_rcp.tpl");

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
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;
            
            function addMenuitem( dbModel, fields, order, group, menupopupId, valueField, labelField ) {
		        //set up the designated pop-up menulist.
		        var records = dbModel.find( 'all', { fields: fields, order: order, group: group } );
		        var menupopup = document.getElementById( menupopupId );

		        records.forEach( function( data ) {
		            var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
		            menuitem.setAttribute( 'value', data[ valueField ] );
		            menuitem.setAttribute( 'label', data[ labelField ] );
		            menupopup.appendChild( menuitem );
		        });
		    }
		    
		    addMenuitem( new ClockStampModel(), [ 'username' ], [ 'username' ], [ 'username' ], 'user_menupopup', 'username', 'username' );
            
            addMenuitem( new ClockStampModel(), [ 'job' ], [ 'job' ], [ 'job' ], 'job_menupopup', 'job', 'job' );

            this._enableButton(false);
        }
        
    });
    
})();
