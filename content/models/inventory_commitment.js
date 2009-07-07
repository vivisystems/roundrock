( function() {

	 var __model__ = {
         
		name: 'InventoryCommitment',
		
		useDbConfig: 'default',
		
		hasMany: [ 'InventoryRecord' ],
		
		set: function( inventoryCommitment ) {
			if ( inventoryCommitment ) {
				this.id = '';
				this.save( inventoryCommitment );
			}
		},
		
		get: function( type, params ) {
			return this.find( type, params );
		}
	};
	
	var InventoryCommitmentModel = window.InventoryCommitmentModel = GeckoJS.Model.extend( __model__ );
} )();
