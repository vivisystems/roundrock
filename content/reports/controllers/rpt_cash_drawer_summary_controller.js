( function() {
    /**
     * Cash Drawer Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptCashDrawerSummary',
        
        _fileName: 'rpt_cash_drawer_summary',

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
                            'clerk_displayname',
                            'terminal_no',
                            'event_type',
                            'count( event_type ) as num_occurrences'
                         ];
                        
            var conditions = "created >= '" + start +
                            "' AND created <= '" + end + "'";

            if ( terminal_no.length > 0 )
                conditions += " AND terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";

            var groupby = "clerk_displayname, terminal_no, event_type";
            var orderby = sortby + " desc";
            
            if ( sortby != 'all' ) {
            	var orderby = sortby;
                
                if (sortby == 'num_occurrences') {
                    orderby += ' DESC';
                }
            }
            else {
                var orderby = 'clerk_displayname, terminal_no, event_type';
            }
            var datas = cashDrawer.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive: 1, order: orderby, limit: limit } );
            
            var footData = cashDrawer.find( 'first', {
            											fields: 'count( event_type ) as total_num_occurrences',
            											conditions: conditions,
            											recursive: -1
            										 } );
            										 
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.cashdrawersummary.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            
            this._reportRecords.body = datas;
            
            this._reportRecords.foot.foot_data = footData;
        },

        exportCsv: function() {
            this._super(this);
        },

        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
