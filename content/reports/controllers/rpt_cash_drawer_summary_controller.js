(function(){

    /**
     * Cash Drawer Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptCashDrawerSummary',
        
        _fileName: 'rpt_cash_drawer_summary',

        _set_reportRecords: function() {
            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var cashDrawer = new CashdrawerRecordModel();

            var fields = [
                            'clerk_displayname',
                            'event_type',
                            'count( event_type ) as num_events'
                         ];
                        
            var conditions = "created >= '" + start +
                            "' AND created <= '" + end + "'";

            var groupby = 'clerk_displayname, event_type';
            var orderby = sortby + ' desc';
            
            if ( sortby != 'all' )
            	var orderby = sortby;

            var datas = cashDrawer.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby } );
            
            var footData = cashDrawer.find( 'first', {
            											fields: 'count( event_type ) as total_num_events',
            											conditions: conditions,
            											recursive: -1
            										 } );
            										 
            this._reportRecords.head.title = _( 'Cash Drawer Summary Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            
            this._reportRecords.body = datas;
            
            this._reportRecords.foot.foot_data = footData;
        },

        load: function() {

            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;

            this._enableButton( false );
        }
    });
})();
