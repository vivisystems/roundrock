( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

	var __model__ = {
         
		name: 'InventoryCommitment',
		
		useDbConfig: 'inventory',
		
		hasMany: [ 'InventoryRecord' ],

        autoRestoreFromBackup: true,
		
		set: function( inventoryCommitment ) {

            var r = this.save( inventoryCommitment );

            if ( !r ) {
                this.log( 'ERROR',
                          'An error was encountered while saving stock adjustment record (error code ' + this.lastError + '): ' + this.lastErrorString );

                //@db saveToBackup
                r = this.saveToBackup( inventoryCommitment );
                if (r) {
                    this.log( 'ERROR', 'record saved to backup' );
                }
                else {
                    this.log( 'ERROR',
                              'record could not be saved to backup:' + '\n' + this.dump( inventoryCommitment ) );
                }
            }
            return r;
		},
		
		get: function( type, params ) {
			return this.find( type, params );
		}
	};
	
	var InventoryCommitmentModel = window.InventoryCommitmentModel = AppModel.extend( __model__ );
} )();
