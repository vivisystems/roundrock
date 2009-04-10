(function(){

    /**
     * RptUsers Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptUsers',
        
        _fileName: "rpt_users",

        _set_reportRecords: function() {
			var sortby = document.getElementById( 'sortby' ).value;
            var orderby = 'username';
            if ( sortby != 'all' )
            	orderby = '"' + sortby + '"'; // doing so for the 'group' is a keyword.

            var users = new UserModel();
            var userRecords = users.find( 'all', { order: orderby } );

			this._reportRecords.head.title = _( 'User List' );
			this._reportRecords.body = userRecords;
        }
    });
})();
