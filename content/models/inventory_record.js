( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {
         
        name: 'InventoryRecord',
		
        useDbConfig: 'inventory',
		
        belongsTo: [ 'InventoryCommitment' ],
		
        autoRestoreFromBackup: true,

        set: function( inventoryRecord ) {
            if ( inventoryRecord ) {
                this.id = '';
                var r = this.save( inventoryRecord );
                if ( !r ) {
                    this.log( 'ERROR',
                        'An error was encountered while saving inventory record (error code ' + this.lastError + ': ' + this.lastErrorString );

                    //@db saveToBackup
                    r = this.saveToBackup( inventoryRecord );
                    if ( r ) {
                        this.log( 'ERROR', 'record saved to backup' );
                    }
                    else {
                        this.log( 'ERROR',
                            'record could not be saved to backup:' + '\n' + this.dump( inventoryRecord ) );
                    }
                }
                return r;
            }
            return true;
        },
		
        setAll: function( inventoryRecords, absolute ) {

            if ( inventoryRecords.length > 0 ) {

                var created , modified;
                created = modified = Math.ceil(Date.now().getTime()/1000);

                var sql = "BEGIN; \n" ;

                inventoryRecords.forEach(function( inventoryRecord ) {
                    var data = {};
                    data['id'] = GeckoJS.String.uuid();
                    data['created'] = data['modified'] = modified;
                    data['commitment_id'] = inventoryRecord['commitment_id'];
                    data['product_no'] = inventoryRecord['product_no'] || '';
                    data['barcode'] = inventoryRecord['barcode'] || '';
                    data['warehouse'] = inventoryRecord['warehouse'] || '';
                    data['value'] = inventoryRecord['value'];
                    data['memo'] = inventoryRecord['memo'] || '';
                    data['price'] = inventoryRecord['price'] || null;

                    var fields = GeckoJS.BaseObject.getKeys(data).join(', ');
                    var values = "'" + GeckoJS.BaseObject.getValues(data).join("', '") + "'";

                    sql += "INSERT INTO inventory_records ("+fields+") VALUES ("+values+") ; \n" ;
                });

                sql+= "COMMIT; ";

                var datasource = this.getDataSource();

                try {
                    datasource.connect();
                    if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);
                }catch(e) {
                    this.log( 'ERROR', 'ERROR TO setAll \n'+ e );
                    return false;
                }

                return true;
                /*
                for (var inventoryRecord in inventoryRecords ) {
                    var record = {};
                    for (var field in inventoryRecords[ inventoryRecord ] ) {
                        if (field != 'id')
                            record[field] = inventoryRecords[inventoryRecord][field];
                    }
                    r = this.set(record);
                    if (!r) break;
                }*/
            }
            return false;
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
	
    var InventoryRecordModel = window.InventoryRecordModel = AppModel.extend( __model__ );
} )();
