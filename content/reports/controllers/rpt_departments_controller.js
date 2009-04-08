(function(){

    /**
     * RptDepartments Controller
     */

    RptBaseController.extend( {
        name: 'RptDepartments',
        
        _fileName: 'rpt_departments',
        
        _set_reportRecords: function() {
        	var sortby = document.getElementById( 'sortby' ).value;
        	var orderby = 'no';
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
