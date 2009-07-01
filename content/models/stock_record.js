( function() {
	 //GeckoJS.include( 'chrome://viviecr/content/models/inventory_record.js' );

	 var __model__ = {
		name: 'StockRecord',
		
		useDbConfig: 'default',
		
		/**
		 * This method resets the stock_records table with products in 'products' parameter.
		 *
		 * @param products comprise products used to initialize the stock_records table, and it has to be in the form of
		 * an array containing objects in which the id of each products can be found.
		 */
		reset: function( products ) {
			var stockRecords = [];
		    
			products.forEach( function( product ) {
				var stockRecord = {
					id: '',
					product_no: product.no,
					barcode: product.barcode,
					warehouse: 'warehouse',
					quantity: 0
				};
				stockRecords.push( stockRecord );
			} );
			
			this.begin();
			this.delAll( '' );
			this.saveAll( stockRecords );
			this.commit();
		},
		
		set: function( stockRecord ) {
			if ( stockRecord ) {
				this.id = stockRecord.id || '';
				var r = this.save( stockRecord );
				if ( !r ) {
                    this.log(
                        'ERROR',
                        _( 'An error was encountered while saving stock record (error code %S): %S', [ this.lastError, this.lastErrorString ] )
                    );

                    //@db saveToBackup
                    r = this.saveToBackup( stockRecord );
                    if ( r ) {
                        this.log(
                            'ERROR',
                            _( 'record saved to backup' )
                        );
                    } else {
                        this.log(
                            'ERROR',
                            _( 'record could not be saved to backup: %S', [ '\n' + this.dump( data ) ] )
                        );
                    }
                }
                return r;
			}
		},
		
		setAll: function( stockRecords ) {
			if ( stockRecords.length > 0 ) {
			    var r;
				for ( stockRecord in stockRecords ) {
					r = this.set( stockRecords[ stockRecord ] );
					
					if ( !r )
					    return r;
			    }
			}
		},
		
		get: function( type, params ) {
			return this.find( type, params );
		},
		
		getAll: function( type, params) {
			return this.find( type, params );
		},
		
		getStockRecordByProductNo: function( product_no ) {
		    return this.get( "first", {
		        fields: [ "quantity" ],
		        conditions: "product_no = '" + product_no + "'"
		    } );
		}
	};
	
	var StockRecordModel = window.StockRecordModel = GeckoJS.Model.extend( __model__ );
} )();
