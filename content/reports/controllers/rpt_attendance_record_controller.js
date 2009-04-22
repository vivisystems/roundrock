(function(){

    /**
     * RptAttendanceRecord Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptAttendanceRecord',
        
        _fileName: "rpt_attendance_record",

        _set_reportRecords: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
            				'clock_stamps.created',
                            'clock_stamps.modified',
                            'DATETIME("clock_stamps"."created", "unixepoch", "localtime") AS "ClockStamp.InTime"',
                            'DATETIME("clock_stamps"."modified", "unixepoch", "localtime") AS "ClockStamp.OutTime"',
                            'ABS("clock_stamps"."modified" - "clock_stamps"."created") AS "ClockStamp.Spans"',
                            'strftime("%d %H:%M:%S", ABS("clock_stamps"."modified" - "clock_stamps"."created"), "unixepoch") AS "ClockStamp.SpanTime"',
                            'clock_stamps.username',
                            'clock_stamps.job',
                            'clockin_time',
                            'clockout_time',
                            'displayname'
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
            var orderby = 'clock_stamps.username, "' + sortby + '"';

            var clockStamp = new ClockStampModel();
            var datas = clockStamp.find( 'all', { fields: fields, conditions: conditions, group2: groupby, order: orderby, recursive: 1 } );

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
                    clockStamps[o.username].username = o.displayname;
                    clockStamps[o.username].total_spans = 0;
                    clockStamps[o.username].clockStamps = [];
                }
                
                // refine SpanTime by decreasing the day part by one.
                var num_day = parseInt( o.SpanTime[ 0 ] + o.SpanTime[ 1 ], 10 );
                num_day--;
                o.SpanTime = '' + parseInt( num_day / 10, 10 ) + num_day % 10 + o.SpanTime.substr( 2 );
                
                clockStamps[o.username].clockStamps.push(GREUtils.extend({}, o));
                clockStamps[o.username].total_spans += o.Spans;
                clockStamps[o.username].total_spantime = 	GeckoJS.String.padLeft(parseInt(clockStamps[o.username].total_spans / 24 / 60 / 60),2) + " " +
                											GeckoJS.String.padLeft(parseInt(clockStamps[o.username].total_spans / 60 / 60) % 24,2) + ":" +
                                                            GeckoJS.String.padLeft(parseInt((clockStamps[o.username].total_spans / 60) % 60),2) + ":" +
                                                            GeckoJS.String.padLeft(parseInt(clockStamps[o.username].total_spans % 60),2);
            });
            
            this._reportRecords.head.title = _( 'Attendance Record Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            
            this._reportRecords.body = GeckoJS.BaseObject.getValues(clockStamps);
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
		    
		    this._addMenuitem( new ClockStampModel(), [ 'displayname' ], '', 'displayname', 'displayname', 'user_menupopup', 'displayname', 'displayname' );
            
            this._addMenuitem( new ClockStampModel(), [ 'job' ], '', 'job', 'job', 'job_menupopup', 'job', 'job' );

            this._enableButton(false);
        }
    });
})();