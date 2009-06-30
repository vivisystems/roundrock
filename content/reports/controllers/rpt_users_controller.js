( function() {
    /**
     * RptUsers Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptUsers',
        
        _fileName: "rpt_users",

        _set_reportRecords: function(limit) {
			var sortby = document.getElementById( 'sortby' ).value;
            var orderby = sortby;
            if ( sortby != 'all' )
            	orderby = '"' + sortby + '"'; // doing so for the 'group' is a keyword.

            var users = new UserModel();
            var userRecords = users.find( 'all', { order: orderby, limit: limit } );

			this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.userlist.label' );
			this._reportRecords.body = userRecords;
        },

        exportCsv: function() {
            this._super(this);
        }
    };

    RptBaseController.extend( __controller__ );
} )();
