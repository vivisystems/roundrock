( function() {
    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptInventoryCommitments',
        
        _fileName: "rpt_inventory_commitments",
        
        _setData: function( start, end, periodType, shiftNo, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
                "inventory_commitments.type",
                "inventory_commitments.memo",
                "inventory_commitments.created",
                "inventory_commitments.supplier",
                "inventory_records.product_no",
                "inventory_records.barcode",
                "inventory_records.warehourse",
                "inventory_records.quantity",
                "inventory_records.new_quantity",
                "inventory_records.price",
                "inventory_records.clerk",
                "inventory_records.memo",
                "products.product_name"
            ];
            
            var conditions = "inventory_commitments.created >= '" + start +
                "' AND inventory_commitments.created <= '" + end + "'";

            var groupby = "";

            var orderby = "inventory_commitments.created";
            
            var sql = "SELECT " + fields.join( ", " ) + " FROM inventory_commitments ic JOIN inventory_records ir ON ( 
		    
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.inventorycommitments.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            //this._reportRecords.head.terminal_no = terminalNo;
		    
            this._reportRecords.body = records;
        },

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;

            this._setData( start, end, periodType, shiftNo, limit );
        },
        
        exportCsv: function() {
            this._super( this, true );
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
