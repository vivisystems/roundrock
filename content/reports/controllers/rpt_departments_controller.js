( function() {
    /**
     * RptDepartments Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptDepartments',
        
        _fileName: 'rpt_departments',
        
        _set_reportRecords: function( limit ) {

            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

        	var sortby = document.getElementById( 'sortby' ).value;
        	var orderby = sortby;
        	if ( sortby != 'all' )
        		orderby = sortby;
            
            var cate = new CategoryModel();
            var cateRecords = cate.find( 'all', {
                fields: [ 'no', 'name' ], order: orderby, limit: limit
            } );

            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.departmentlist.label' );
            this._reportRecords.body = cateRecords;
        },

        exportCsv: function() {
            this._super( this );
        }
    };

    RptBaseController.extend( __controller__ );
} )();
