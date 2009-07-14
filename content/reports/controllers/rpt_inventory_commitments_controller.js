( function() {
    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptInventoryCommitments',
        
        _fileName: "rpt_inventory_commitments",
        
        _setData: function( start, end, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
                "ic.type",
                "ic.memo",
                "ic.created",
                "ic.supplier",
                "ir.product_no",
                "ir.barcode",
                "ir.warehouse",
                "ir.quantity",
                "ir.new_quantity",
                "ir.price",
                "ir.clerk",
                "ir.memo",
                "p.name"
            ];
            
            var conditions = "ic.created >= '" + start +
                "' AND ic.created <= '" + end + "'";

            var groupby = "";

            var orderby = "ic.created";
            
            var sql =
            	"SELECT " + fields.join( ", " ) + " FROM inventory_commitments ic JOIN inventory_records ir ON ( " +
            	"ic.id = ir.commitment_id ) JOIN products p ON ( ir.product_no = p.no ) WHERE " + conditions +
            	" ORDER BY " + orderby + " LIMIT " + limit + ";";
            var inventoryCommitmentModel = new InventoryCommitmentModel();
            var records = inventoryCommitmentModel.getDataSource().fetchAll( sql );
            
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

            this._setData( start, end, limit );
        },
        
        exportCsv: function() {
            this._super( this, true );
        },

        load: function() {
            this._super();
            
            var today = new Date();
            var yy = today.getYear() + 1900;InventoryCommitmentModel
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
