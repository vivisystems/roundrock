(function(){

    /**
     * Cash Drawer Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptCashDrawer',
        
        _fileName: 'rpt_cash_drawer',

        _set_reportRecords: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

			var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            // var department = document.getElementById('department').value;
            var machineid = document.getElementById( 'machine_id' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);
            
            var cashDrawer = new CashdrawerRecordModel();

            var fields = [
            				'terminal_no',
                    		'drawer_no',
                            'clerk_displayname',
                            'DATETIME( "created", "unixepoch", "localtime" ) AS "created"',
                            'event_type'
                        ];
                        
            var conditions = "created>='" + start +
                            "' AND created<='" + end + "'";
            
            if ( machineid.length > 0 ) {
                conditions += " AND terminal_no LIKE '" + machineid + "%'";
            }

            var groupby = '';
            var orderby = 'terminal_no';
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' )
            	var orderby = sortby;

            var datas = cashDrawer.find( 'all', {fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby} );
            
            this._reportRecords.head.title = _( 'Cash Drawer Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.machine_id = machineid;
            
            this._reportRecords.body = datas;
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

            this._enableButton(false);
        }
    });
})();
