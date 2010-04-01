( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var __model__ = {

        name: 'StockRecord',

        useDbConfig: 'inventory',

        belongsTo: [{
            name: 'Product',
            'primaryKey': 'no',
            'foreignKey': 'id'
        }],

        _cachedRecords: null,

        lastModified: 0,

        autoRestoreFromBackup: true,

        httpService: null,

        getHttpService: function() {

            try {
                if (!this.httpService) {
                    var syncSettings = SyncSetting.read();
                    this.httpService = new SyncbaseHttpService();
                    this.httpService.setSyncSettings(syncSettings);
                    this.httpService.setHostname(syncSettings.stock_hostname);
                    this.httpService.setController('stocks');
                    this.httpService.setForce(true);
                }
            }catch(e) {
                this.log('error ' + e);
            }

            return this.httpService;
        },

        getHostname: function() {
            return this.getHttpService().getHostname();
        },

        isRemoteService: function() {
            return !this.getHttpService().isLocalhost();
        },

        getLastModifiedRecords: function(lastModified) {
            
            lastModified = typeof lastModified == 'undefined' ? 0 : lastModified;
            
            // this.log('DEBUG', 'getLastModifiedRecords: ' + lastModified);

            // get local stock record to cached first.
            var stocks = this.getDataSource().fetchAll("SELECT id,quantity,modified FROM stock_records WHERE modified > " + lastModified);

            if (this.lastError != 0) {
                this.log('ERROR',
                    'An error was encountered while retrieving last modified record (error code ' + this.lastError + '): ' + this.lastErrorString);
                return;
            }

            if (stocks.length > 0) {

                stocks.forEach(function(d) {
                    this._cachedRecords[d.id] = d.quantity;
                    if ( parseInt(d.modified) >= this.lastModified) this.lastModified = parseInt(d.modified);
                }, this);

            }

        },

        syncAllStockRecords: function(async, callback) {
            //this.log('syncAllStockRecords');

            async = async || false;
            callback = callback || null;

            // initial cachedRecords
            if (this._cachedRecords == null) {
                // initial cached object;
                this._cachedRecords = {};
            }

            // set self for this reference
            var self = this;

            // get local stock records first
            this.getLastModifiedRecords(this.lastModified);

            // sync remote stock record to cached .

            if(this.isRemoteService()) {
                
                var remoteUrl = this.getHttpService().getRemoteServiceUrl('getLastModifiedRecords');
                var requestUrl = remoteUrl + '/' + this.lastModified;

                var cb = function(response_data/*remoteStocks*/) {

                    var remoteStocks;

                    self.lastReadyState = self.getHttpService().lastReadyState;
                    self.lastStatus = self.getHttpService().lastStatus;

                    if (response_data) {
                        try {
                            //
                            remoteStocks = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(response_data)));

                        }catch(e) {
                            self.lastStatus = 0;
                            remoteStocks = [];
                            this.log('ERROR', 'getLastModifiedRecords cant decode response '+e);
                        }

                        var lastModified = self.saveStockRecords(remoteStocks);

                        if (lastModified >= self.lastModified) {
                            self.lastModified = lastModified;
                        }
                    }

                    //self.log('DEBUG', 'cachedStockRecords: ' + self.dump(self._cachedRecords));

                    if(callback) {
                        callback.call(self, self.lastModified);
                    }
                };

                if (async) {
                    this.getHttpService().requestRemoteService('GET', requestUrl, null, async, cb) || null ;
                }else {
                    var remoteStockResults = this.getHttpService().requestRemoteService('GET', requestUrl, null, async, callback) || null ;
                    cb.call(self, remoteStockResults);
                }

            }else {

                this.lastReadyState = 4;
                this.lastStatus = 200;

                if(callback) {
                    callback.call(self, self.lastModified);
                }

            }

            return this._cachedRecords;
        },

        saveStockRecords: function(stocks) {

            if (!stocks) return -1;
            
            var lastModified = 0;

            // use native sql
            var sql = "" ;
            
            stocks.forEach( function(d) {

                try{

                    this._cachedRecords[d.id] = d.quantity;

                    d.created = d.modified;

                    if (d.modified >= lastModified) {
                        lastModified = d.modified;
                    }
                    var cols = GeckoJS.BaseObject.getKeys(d).join(', ');
                    var vals = this.escapeString(GeckoJS.BaseObject.getValues(d)).join("', '");
                    sql += "INSERT OR REPLACE INTO stock_records ("+cols+") values ('" + vals + "');\n";
                    
                }catch(e) {
                    this.log('ERROR', 'saveStockRecords stocks.forEach error ' + e );
                }
            }, this);

            if (sql.length > 0) {
                
                var sqlWithTransaction = 'BEGIN EXCLUSIVE; \n' + sql + 'COMMIT; ';

                var datasource = this.getDataSource();

                try {

                    datasource.connect();
                    datasource.executeSimpleSQL(sqlWithTransaction);

                }catch(e) {
                    
                    this.log('ERROR', 'saveStockRecords Error \n' + e );

                }
                
            }


            return lastModified;

        },

        getStockById: function(id) {

            var stock = false;

            if (this._cachedRecords) {
                // use cached

                if (typeof this._cachedRecords[id] != 'undefined') {

                    stock = parseFloat(this._cachedRecords[id]);

                }else {

                    // dont has stock record auto insert
                    stock = 0;
                    this.create();
                    this.save({
                        id: id,
                        quantity: 0
                    });
                }

            }else {

                var stockRecord = this.get( 'first', { 
                    conditions: "id = '" + id + "'"
                } );

                if ( stockRecord ) {

                    stock = parseFloat( stockRecord.quantity );
                    
                } else {

                    // dont has stock record auto insert
                    stock = 0;
                    this.create();
                    this.save({
                        id: id,
                        quantity: 0
                    });

                }

            }
            return stock;
        },

        decreaseStockRecords: function(datas) {

            var async = false;
            var callback = null;

            //this.log('DEBUG', 'decreaseStockRecords datas: ' + this.dump(datas));


            if(this.isRemoteService()) {

                var remoteUrl = this.getHttpService().getRemoteServiceUrl('decreaseStockRecords');
                var requestUrl = remoteUrl + '/' + this.lastModified;

                var request_data = GeckoJS.BaseObject.serialize(datas);
                var response_data = this.getHttpService().requestRemoteService('POST', requestUrl, request_data, async, callback) || null ;

                this.lastReadyState = this.getHttpService().lastReadyState;
                this.lastStatus = this.getHttpService().lastStatus;

                if (response_data) {
                    var remoteStocks;

                    try {
                        //
                        remoteStocks = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(response_data)));

                    }catch(e) {
                        this.lastStatus = 0;
                        this.log('ERROR', 'decreaseStockRecords cant decode response '+e);
                    }

                    var lastModified = this.saveStockRecords(remoteStocks);

                    if (lastModified >= this.lastModified) {
                        this.lastModified = lastModified;
                    }

                }

                
            }else {

                // use native sql
                var sql = "" ;
                var now = Math.ceil((new Date()).getTime()/1000);

                datas.forEach( function(d) {

                    try {
                        
                        this._cachedRecords[d.id] -= d.quantity;

                        d.modified = now;
                        if (d.quantity>0) {
                            sql += "UPDATE stock_records SET quantity=quantity-"+d.quantity+", modified='"+d.modified+"' WHERE id = '"+ d.id +"' ;\n";
                        }else {
                            sql += "UPDATE stock_records SET quantity=quantity+"+Math.abs(d.quantity)+", modified='"+d.modified+"' WHERE id = '"+ d.id +"' ;\n";
                        }

                    }catch(e) {
                        this.log('ERROR', 'decreaseStockRecords datas.forEach error ' + e );
                    }
                }, this);

                if (sql.length > 0) {
                    var sqlWithTransaction = 'BEGIN EXCLUSIVE; \n' + sql + 'COMMIT; ';

                    var datasource = this.getDataSource();

                    try {

                        datasource.connect();
                        datasource.executeSimpleSQL(sqlWithTransaction);

                    }catch(e) {

                        this.log('ERROR', 'decreaseStockRecords Error \n' + e );

                    }
                }

                this.lastReadyState = 4;
                this.lastStatus = 200;

                this.lastModified = now;

            }
            
        },

        insertNewRecords: function( products ) {

            if (!products || products.length <=0) return false;
            
            var r;
            var created , modified;
            created = modified = Math.ceil((new Date()).getTime()/1000);

            var sql = "" ;

            products.forEach(function( product ) {
                
                if (!product.no||product.no.length==0) return;

                sql += "INSERT INTO stock_records (id,barcode,warehouse,quantity,created,modified) VALUES (" +
                "'" + (product.no||'') + "', " +
                "'" + (product.barcode||'') + "', " +
                "'" + this.escapeString(product.warehouse||'')+ "', " +
                (product.quantity || 0) + ", " +
                created + ", " +
                modified + "); \n" ;
            });

            if (sql.length > 0) {
                var sqlWithTransaction = 'BEGIN EXCLUSIVE; \n' + sql + 'COMMIT; ';

                var datasource = this.getDataSource();

                try {

                    datasource.connect();
                    datasource.executeSimpleSQL(sqlWithTransaction);

                }catch(e) {

                    this.log('ERROR', 'insertNewRecords Error \n' + e );

                    return false;
                }
            }

            return true;           
           
        },
		
        set: function( stockRecord ) {
            if ( stockRecord ) {

                // id is product_no.
                this.id = stockRecord.id || '';

                var r = this.save(stockRecord);
                if (!r) {
                    this.log('ERROR',
                        'An error was encountered while saving stock record (error code ' + this.lastError + ': ' + this.lastErrorString);
                    
                    //@db saveToBackup
                    r = this.saveToBackup(stockRecord);
                    if (r) {
                        this.log('ERROR', 'record saved to backup');
                    }
                    else {
                        this.log('ERROR',
                            'record could not be saved to backup:' + '\n' + this.dump(stockRecord));
                    }
                }
                return r;
            }
            return true;
        },
		
        setAll: function(stockRecords, absolute) {
            
            if (stockRecords.length > 0) {
                var r;

                var created , modified;
                created = modified = Math.ceil((new Date()).getTime()/1000);

                var sql = "" ;

                stockRecords.forEach(function( stockRecord ) {
                    sql += "UPDATE stock_records SET warehouse='" + this.escapeString(stockRecord.warehouse||'') + "', " +
                    "quantity=" + (absolute ? stockRecord.quantity : "quantity + " + stockRecord.delta) + ", " +
                    "created=" + created + ", " +
                    "modified="  + modified + " " +
                    "WHERE id='" + stockRecord.id + "'; \n" ;
                });

                if (sql.length > 0) {
                    var sqlWithTransaction = 'BEGIN EXCLUSIVE; \n' + sql + 'COMMIT; ';

                    var datasource = this.getDataSource();

                    try {

                        datasource.connect();
                        datasource.executeSimpleSQL(sqlWithTransaction);

                    }catch(e) {

                        this.log('ERROR', 'setAll Error \n' + e );

                        return false;
                    }
                }
                return true;

            }
            return true;
        },
		
        get: function(type, params) {
            var r = this.find(type, params);
            if (this.lastError != 0) {
                this.log('ERROR',
                    'An error was encountered while retrieving stock records (error code ' + this.lastError + '): ' + this.lastErrorString);
            }
            return r;
        },
		
        getAll: function(type, params) {
            var r = this.find(type, params);
            if (this.lastError != 0) {
                this.log('ERROR',
                    'An error was encountered while retrieving stock records (error code ' + this.lastError + '): ' + this.lastErrorString);
            }
            return r;
        },
		
        getStockRecordByProductNo: function(product_no) {
            return this.get('first', {
                fields: ['quantity'],
                conditions: 'stock_records.id = "' + product_no + '"'
            } );
        }
    };
	
    var StockRecordModel = window.StockRecordModel = AppModel.extend( __model__ );
} )();
