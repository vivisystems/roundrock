( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

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
	
	var InventoryCommitmentModel = window.InventoryCommitmentModel = AppModel.extend( __model__ );
} )();
