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
				this.save( stockRecord );
			}
		},
		
		setAll: function( stockRecords ) {
			if ( stockRecords.length > 0 ) {
				for ( stockRecord in stockRecords )
					this.set( stockRecords[ stockRecord ] );
			}
		},
		
		get: function( type, params ) {
			return this.find( type, params );
		},
		
		getAll: function( type, params) {
			return this.find( type, params );
		}
	};
	
	var StockRecordModel = window.StockRecordModel = GeckoJS.Model.extend( __model__ );
} )();
