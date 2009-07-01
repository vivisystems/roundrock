( function() {

	 var __model__ = {
		name: 'InventoryRecord',
		
		useDbConfig: 'default',
		
		set: function( inventoryRecord ) {
			if ( inventoryRecord ) {
				this.id = '';
				this.save( inventoryRecord );
			}
		},
		
		setAll: function( inventoryRecords ) {
			if ( inventoryRecords.length > 0 ) {
				var timestamp = Math.round( ( new Date() ) / 1000 , 10 );// uesd to recognize records which are in the same batch.
				this.begin();
				for ( inventoryRecord in inventoryRecords ) {
					inventoryRecords[ inventoryRecord ].timestamp = timestamp;
					
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
	
	var InventoryRecordModel = window.InventoryRecordModel = GeckoJS.Model.extend( __model__ );
} )();
