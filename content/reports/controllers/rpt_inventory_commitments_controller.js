( function() {
    /**
     * Inventory Commitment Controller
     */
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptInventoryCommitments',
        
        _fileName: "rpt_inventory_commitments",
        
        _setData: function( start, end, type, warehouse, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
                "ic.id",
                "ic.type",
                "ic.memo AS commitment_memo",
                "ic.created",
                "ic.clerk",
                "ic.supplier",
                "ir.product_no",
                "ir.barcode",
                "ir.warehouse",
                "ir.value",
                "ir.price",
                "ir.value * ir.price AS subtotal",
                "ir.memo",
                "p.name"
            ];
            
            var conditions = "ic.created >= '" + start +
                "' AND ic.created <= '" + end + "'";
                
            if ( type != "all" )
                conditions += " AND ic.type = '" + type + "'";
                
            if ( warehouse.length > 0 )
                conditions += " AND warehouse LIKE '%" + warehouse + "%'";

            var groupby = "";

            var orderby = "ic.created DESC";
            
            var inventoryCommitmentModel = new InventoryCommitmentModel();
            
            // attach vivipos.sqlite to use product table.
            var productModel = new ProductModel();
            var productDB = productModel.getDataSource().path + '/' + productModel.getDataSource().database;
            var sql = "ATTACH '" + productDB + "' AS vivipos;";
            inventoryCommitmentModel.execute( sql );
            
            // Calculate the number of rows in the database.
            sql =
                "SELECT COUNT( ic.id ) numRows FROM inventory_commitments ic JOIN inventory_records ir ON ( " +
            	"ic.id = ir.commitment_id ) JOIN products p ON ( ir.product_no = p.no ) WHERE " + conditions +
            	" ORDER BY " + orderby + ";";
            var numRows = inventoryCommitmentModel.getDataSource().fetchAll( sql );
            numRows = numRows[ 0 ].numRows;
            
            var sql =
            	"SELECT " + fields.join( ", " ) + " FROM inventory_commitments ic JOIN inventory_records ir ON ( " +
            	"ic.id = ir.commitment_id ) JOIN products p ON ( ir.product_no = p.no ) WHERE " + conditions +
            	" ORDER BY " + orderby + " LIMIT " + limit + ";";
            var records = inventoryCommitmentModel.getDataSource().fetchAll( sql );
            
            // detach the file.
            sql = "DETACH vivipos;";
            inventoryCommitmentModel.execute( sql );

            var inventoryCommitments = {};
            var old_id = null;
            var currentCommit;
            records.forEach( function( record ) {
                var id = record.id;
                if ( id != old_id ) {
                    currentCommit = inventoryCommitments[ id ] = {
                        created: record.created,
                        type: record.type,
                        clerk: record.clerk,
                        commitment_memo: record.commitment_memo,
                        products: [],
                        subtotal: record.value * record.price,
                        summary: {
                            value: 0,
                            subtotal: 0
                        }
                    };
                    old_id = id;
                }
                
                currentCommit.summary.value += record.value;
                currentCommit.summary.subtotal += record.subtotal;
                    
                currentCommit.products.push( record );
            } );
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.inventorycommitments.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            //this._reportRecords.head.terminal_no = terminalNo;
            
            this._reportRecords.rowLimitExcess = numRows > limit;
		    
            this._reportRecords.body = inventoryCommitments;
        },

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var type = document.getElementById( 'type' ).value;
            
            var warehouse = document.getElementById( 'warehouse' ).value;

            this._setData( start, end, type, warehouse, limit );
        },
        
        exportCsv: function() {
            this._super( this );
        },

        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();
