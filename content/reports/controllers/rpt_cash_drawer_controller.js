( function() {
    /**
     * Cash Drawer Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptCashDrawer',
        
        _fileName: 'rpt_cash_drawer',

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

			var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
            
            var cashDrawer = new CashdrawerRecordModel();

            var fields = [
            				'terminal_no',
                    		'drawer_no',
                            'clerk_displayname',
                            'created',
                            'event_type',
                            'sequence',
                            'payment_type',
                            'amount'
                        ];
                        
            var conditions = "created>='" + start +
                            "' AND created<='" + end + "'";
            
            if ( terminal_no.length > 0 )
                conditions += " AND terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";

            var groupby = "";
            var orderby = sortby;
            
            if ( sortby != 'all' )
            	var orderby = sortby + ', created';
            else {
                var orderby = 'terminal_no, created';
            }

            var rowCount = cashDrawer.find( 'count', {fields: fields, conditions: conditions, group: groupby, recursive: -1} );

            var datas = cashDrawer.find( 'all', {fields: fields, conditions: conditions, group: groupby, recursive: 1, order: orderby, limit: limit} );
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.cashdrawerreport.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminal_no;
            this._reportRecords.head.rowCount = rowCount;
            
            this._reportRecords.body = datas;
        },

        exportCsv: function() {
            this._super(this);
        },

        execute: function() {
        	this._super();

            this._registerOpenOrderDialog('sequence');
        },

        load: function() {
            this._super();

            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;
        }
    };

    RptBaseController.extend( __controller__ );
} )();
