( function() {

	 var __model__ = {
         
		name: 'InventoryRecord',
		
		useDbConfig: 'default',
		
		belongsTo: [ 'InventoryCommitment' ],
		
        autoRestoreFromBackup: true,

		set: function( inventoryRecord ) {
			if ( inventoryRecord ) {
				this.id = '';
				var r = this.save( inventoryRecord );
                if (!r) {
                    this.log('ERROR',
                             'An error was encountered while saving inventory record (error code ' + this.lastError + ': ' + this.lastErrorString);

                    //@db saveToBackup
                    r = this.saveToBackup(inventoryRecord);
                    if (r) {
                        this.log('ERROR', 'record saved to backup');
                    }
                    else {
                        this.log('ERROR',
                                 'record could not be saved to backup:' + '\n' + this.dump(inventoryRecord));
                    }
                }
                return r;
			}
            return true;
		},
		
		setAll: function( inventoryRecords ) {
			if ( inventoryRecords.length > 0 ) {
				this.begin();
				for (var inventoryRecord in inventoryRecords ) {
					var record = {};
					for (var field in inventoryRecords[ inventoryRecord ] ) {
						if (field != 'id')
							record[field] = inventoryRecords[inventoryRecord][field];
					}
					this.set(record);
				}
				this.commit();
			}
		},
		
		get: function( type, params ) {
            var r = this.find(type, params);
            if (this.lastError != 0) {
                this.log('ERROR',
                         'An error was encountered while retrieving inventory records (error code ' + this.lastError + '): ' + this.lastErrorString);
            }
            return r;
		},
		
		getAll: function( type, params) {
            var r = this.find(type, params);
            if (this.lastError != 0) {
                this.log('ERROR',
                         'An error was encountered while retrieving inventory records (error code ' + this.lastError + '): ' + this.lastErrorString);
            }
            return r;
		}
	};
	
	var InventoryRecordModel = window.InventoryRecordModel = GeckoJS.Model.extend( __model__ );
} )();
