( function() {

	 var __model__ = {
		name: 'StockAdjustment',
		
		useDbConfig: 'default',
		
		set: function( adjustment ) {
			if ( adjustment ) {
				this.save( adjustment );
			}
		},
		
		setAll: function( adjustments ) {
			if ( adjustments.length > 0 ) {
				this.begin();
				for ( adjustment in adjustments )
					this.set( adjustments[ adjustment ] );
				this.commit();
			}
		},
		
		get: function( type, params ) {
			return this.find( type, params );
		},
		
		getAll: function( type, params) {
			return this.find( type, params );
		}
	};
	
	var StockAdjustmentModel = window.StockAdjustmentModel = GeckoJS.Model.extend( __model__ );
} )();
