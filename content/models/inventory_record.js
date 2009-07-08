( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

	var __model__ = {
         
		name: 'InventoryRecord',
		
		useDbConfig: 'default',
		
		belongsTo: [ 'InventoryCommitment' ],
		
		set: function( inventoryRecord ) {
			if ( inventoryRecord ) {
				this.id = '';
				this.save( inventoryRecord );
			}
		},
		
		setAll: function( inventoryRecords ) {
			if ( inventoryRecords.length > 0 ) {
				this.begin();
				for ( inventoryRecord in inventoryRecords ) {
					var record = {};
					for ( field in inventoryRecords[ inventoryRecord ] ) {
						if ( field != 'id' )
							record[ field ] = inventoryRecords[ inventoryRecord ][ field ];
					}
					this.set( record );
				}
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
	
	var InventoryRecordModel = window.InventoryRecordModel = AppModel.extend( __model__ );
} )();
