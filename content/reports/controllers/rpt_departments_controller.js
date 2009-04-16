(function(){

    /**
     * RptDepartments Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptDepartments',
        
        _fileName: 'rpt_departments',
        
        _set_reportRecords: function() {
        	var sortby = document.getElementById( 'sortby' ).value;
        	var orderby = sortby;
        	if ( sortby != 'all' )
        		orderby = sortby;
            
            var cate = new CategoryModel();
            var cateRecords = cate.find( 'all', {
                fields: [ 'no', 'name' ], order: orderby
            });

            this._reportRecords.head.title = _( 'Department List' );
            this._reportRecords.body = cateRecords;
        }
    } );
})();
