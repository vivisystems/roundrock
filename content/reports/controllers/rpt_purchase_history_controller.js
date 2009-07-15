( function() {
    /**
     * Purchase History Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptPurchaseHistory',
        
        _fileName: "rpt_purchase_history",
        
        _setData: function( start, end, groupCondition, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var fields = [
                "ic.created",
                "ic.supplier",
                "ir.product_no",
                "ir.barcode",
                "( ir.new_quantity - ir.quantity ) AS quantity",
                "ir.price",
                "p.name"
            ];
            
            var conditions = "ic.created >= '" + start +
                "' AND ic.created <= '" + end + "'" +
                " AND ic.type = 'procure'";

            //var groupby = "ir.product_no, ic.supplier";

            var orderby = "ir.product_no, ic.supplier, ic.created DESC";
            
            var sql =
            	"SELECT " + fields.join( ", " ) + " FROM inventory_commitments ic JOIN inventory_records ir ON ( " +
            	"ic.id = ir.commitment_id ) JOIN products p ON ( ir.product_no = p.no ) WHERE " + conditions +
            	/*" GROUP BY " + groupby + */" ORDER BY " + orderby + " LIMIT " + limit + ";";
            var inventoryCommitmentModel = new InventoryCommitmentModel();
            var inventoryRecords = inventoryCommitmentModel.getDataSource().fetchAll( sql );
            
            function groupInventoryRecords( condition, object ) {// condition could be 'product' or 'supplier', while object could be products and suppliers.
                var oldSupplier = null;
                var oldProductNo = null;
                var averageQuantity;
                var averagePrice;
                var counter;
                for ( var i = 0; i <= inventoryRecords.length; i++ ) {
                    record = inventoryRecords[ i ] || {};// the empty object option is for the last record to be pushed into products[ oldProductNo ].records.
                    if ( oldSupplier != record.supplier || oldProductNo != record.product_no ) {
                        if ( i > 0 ) {
                            var arrayToBePushed = [];
                            if ( condition == "product" )
                                arrayToBePushed = object[ oldProductNo ].records;
                            else if ( condition == "supplier" )
                                arrayToBePushed = object[ oldSupplier ].records;
                            arrayToBePushed.push( {
                                fieldForGroupby: "",
                                barcode: _( "(rpt)Average Quantity" ),
                                quantity: averageQuantity / counter,
                                created: _( "(rpt)Average Price" ),
                                price: averagePrice / counter,
                                average_line: true
                            } );
                        }
                        
                        averageQuantity = record.quantity;
                        averagePrice = record.price;
                        counter = 1;
                        
                        if ( condition == "product" )
                            record.fieldForGroupby = record.supplier;
                        else if ( condition == "supplier" )
                            record.fieldForGroupby = record.product_no + " - " + record.name;
                            
                        oldSupplier = record.supplier;
                        oldProductNo = record.product_no;
                    } else {
                        record.fieldForGroupby = "";
                        averageQuantity += record.quantity;
                        averagePrice += record.price;
                        counter++;
                    }
                    
                    if ( record.product_no != undefined ) {// for i == inventoryRecords.length, it will be undefined.
                        var arrayToBePushed = [];
                        if ( condition == "product" )
                            arrayToBePushed = object[ record.product_no ].records;
                        else if ( condition == "supplier" )
                            arrayToBePushed = object[ record.supplier ].records;
                        
                        arrayToBePushed.push( record );
                    }
                }
            }
            
            // establish the object to feed the tpl.
            var tplRecords = {};
            if ( groupCondition == "product" ) {
                // prepare product records.
                var productModel = new ProductModel();
                var productRecords = productModel.find( "all", { fields: [ "no", "name" ], group: "no" } );
                var products = {};
                
                productRecords.forEach( function( record ) {
                    products[ record.no ] = {};
                    products[ record.no ].title = record.no + " - " + record.name;
                    products[ record.no ].records = [];
                } );
                
                groupInventoryRecords( "product", products );
                
                // eliminate the empty elements.
                for ( product in products ) {
                    if ( products[ product ].records.length == 0 )
                        delete products[ product ];
                };
                
                tplRecords.groupby = _( "(rpt)Supplier" );
                tplRecords.records = products;
            } else if ( groupCondition == "supplier" ) {
                // prepare supplier records.
                var inventoryCommitmentModel = new InventoryCommitmentModel();
                var supplierRecords = inventoryCommitmentModel.find( "all", { fields: [ "supplier" ], conditions: "type = 'procure'", group: "supplier" } );
                var suppliers = {};
                
                supplierRecords.forEach( function( record ) {
                    suppliers[ record.supplier ] = {};
                    suppliers[ record.supplier ].title = record.supplier;
                    suppliers[ record.supplier ].records = [];
                } );
                
                groupInventoryRecords( "supplier", suppliers );
            
                tplRecords.groupby = _( "(rpt)Product" );
                tplRecords.records = suppliers;
            }
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.purchasehistory.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            //this._reportRecords.head.terminal_no = terminalNo;
		    
            this._reportRecords.body = tplRecords;
        },

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var groupby = document.getElementById( 'groupby' ).value;

            this._setData( start, end, groupby, limit );
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
