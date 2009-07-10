( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var __model__ = {

        name: 'StockRecord',

        useDbConfig: 'default',

        belongsTo: [{name: 'Product', 'primaryKey': 'no', 'foreignKey': 'id'}],

        _cachedRecords: null,

        syncSettings: null,

        lastModified: 0,

        timeout: 30,

        autoRestoreFromBackup: true,

        getRemoteServiceUrl: function(method) {

            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == 1) {

                var hostname = this.syncSettings.stock_hostname || 'localhost';

                if (hostname == 'localhost' || hostname == '127.0.0.1') return false;

                //  http://localhost:3000/stocks/checkStock/
                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'stocks/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(type, url, data, async, callback) {

            var reqUrl = url ;
            type = type || 'GET';

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;

            var username = this.username ;
            var password = this.password ;

            this.log('DEBUG', 'requestRemoteService url: ' + reqUrl + ', with method: ' + type);

            // set this reference to self for callback
            var self = this;
            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeoutSec = this.timeout * 1000;
            var timeout = null;
            timeout = setTimeout(function() {

                try {
                    self.log('WARN', 'requestRemoteService url: ' + reqUrl +'  timeout, call req.abort');
                    req.abort();
                }
                catch(e) {
                    self.log('ERROR', 'requestRemoteService timeout exception ' + e );
                }
            }, timeoutSec);

            /* Start Request with http basic authorization */
            var datas = [];

            req.open(type, reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                //dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            datas = result.response_data;
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            callback.call(this, datas);
                        }
                        if (timeout) clearTimeout(timeout);
                        if (req) delete req;
                        if (reqStatus) delete reqStatus;
                    }
                }
            };

            var request_data = null;
            if (data) {
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');                 
                request_data = 'request_data=' + encodeURIComponent(GeckoJS.BaseObject.serialize(data));
            }
            
            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);

                if (!async) {
                    // block ui until request finish or timeout
                    
                    var now = Date.now().getTime();

                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (!reqStatus.finish) {

                        if (Date.now().getTime() > (now+timeoutSec)) break;
                        
                        thread.processNextEvent(true);
                    }
                }

            }catch(e) {
                this.log('ERROR', 'requestRemoteService req.send error ' + e );
            }finally {

                if (!async) {
                    if (timeout) clearTimeout(timeout);
                    if (req) delete req;
                    if (reqStatus) delete reqStatus;
                }

            }
            if (callback && !async) {
                callback.call(this, datas);
            }
            return datas;

        },

        getLastModifiedRecords: function(lastModified) {
            
            lastModified = typeof lastModified == 'undefined' ? 0 : lastModified;
            
            this.log('DEBUG', 'getLastModifiedRecords: ' + lastModified);

            // get local stock record to cached first.
            var stocks = this.find('all', {
                'fields': 'id,quantity,modified',
                'recursive':0,
                'conditions': 'modified > ' + lastModified
            });

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

            async = async || false;
            callback = callback || null;

            // initial cachedRecords
            if (this._cachedRecords == null) {
                // initial cached object;
                this._cachedRecords = {};
            }

            // get local stock records first
            this.getLastModifiedRecords(this.lastModified);

            // sync remote stock record to cached .
            var remoteUrl = this.getRemoteServiceUrl('getLastModifiedRecords');

            if(remoteUrl) {
                
                var requestUrl = remoteUrl + '/' + this.lastModified;
                var self = this;

                var cb = function(remoteStocks) {

                    var lastModified = self.saveStockRecords(remoteStocks);

                    if (lastModified >= self.lastModified) {
                        self.lastModified = lastModified;
                    }

                    self.log('DEBUG', 'cachedStockRecords: ' + self.dump(self._cachedRecords));

                    if(callback) {
                        callback.call(self, self.lastModified);
                    }
                };

                if (async) {
                    this.requestRemoteService('GET', requestUrl, null, async, cb);
                }else {
                    var remoteStockResults = this.requestRemoteService('GET', requestUrl, null, async, callback);
                    cb.call(self, remoteStockResults);
                }

            }

            return this._cachedRecords;
        },

        saveStockRecords: function(stocks) {

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
                    var vals = GeckoJS.BaseObject.getValues(d).join("', '");
                    sql += "INSERT OR REPLACE INTO stock_records ("+cols+") values ('" + vals + "');\n";
                    
                }catch(e) {
                    this.log('ERROR', 'saveStockRecords stocks.forEach error ' + e );
                }
            }, this);

            if (sql.length > 0) {
                
                var sqlWithTransaction = 'BEGIN ; \n' + sql + 'COMMIT; ';

                var datasource = this.getDataSource();

                try {

                    datasource.connect();
                    if(sqlWithTransaction && datasource.conn) datasource.conn.executeSimpleSQL(sqlWithTransaction);

                }catch(e) {
                    this.log(sqlWithTransaction +",,"+ e);
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
                    this.save({id: id, quantity: 0});
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
                    this.save({id: id, quantity: 0});

                }

            }
            return stock;
        },

        decreaseStockRecords: function(datas) {

            var async = false;
            var callback = null;

            this.log('DEBUG', 'decreaseStockRecords datas: ' + this.dump(datas));

            var remoteUrl = this.getRemoteServiceUrl('decreaseStockRecords');

            if(remoteUrl) {

                var requestUrl = remoteUrl + '/' + this.lastModified;
                
                var remoteStocks = this.requestRemoteService('POST', requestUrl, datas, async, callback);

                var lastModified = this.saveStockRecords(remoteStocks);

                if (lastModified >= this.lastModified) {
                    this.lastModified = lastModified;
                }

                
            }else {

                // use native sql
                var sql = "" ;
                var now = Math.ceil(Date.now().getTime()/1000);

                datas.forEach( function(d) {

                    try {
                        
                        this._cachedRecords[d.id] -= d.quantity;

                        d.modified = now;
                        sql += "UPDATE stock_records SET quantity=quantity-"+d.quantity+", modified='"+d.modified+"' WHERE id = '"+ d.id +"' ;\n";

                    }catch(e) {
                        this.log('ERROR', 'decreaseStockRecords datas.forEach error ' + e );
                    }
                }, this);

                if (sql.length > 0) {
                    var sqlWithTransaction = 'BEGIN ; \n' + sql + 'COMMIT; ';

                    var datasource = this.getDataSource();

                    try {

                        datasource.connect();
                        if(sqlWithTransaction && datasource.conn) datasource.conn.executeSimpleSQL(sqlWithTransaction);

                    }catch(e) {
                        this.log(sqlWithTransaction +",,"+ e);
                    }
                }

                this.lastModified = now;

            }
            
        },

        insertNewRecords: function( products ) {
            var r;
            products.forEach(function( product ) {
                var stockRecord = {
                    id: product.no,
                    barcode: product.barcode,
                    warehouse: product.warehouse,
                    quantity: product.quantity || 0
                };
                r = this.set(stockRecord);
                if (!r) {
                    return r;
                }
            }, this);
            
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
		
        setAll: function(stockRecords) {
            if (stockRecords.length > 0) {
                var r;
                for (var stockRecord in stockRecords) {
                    r = this.set(stockRecords[ stockRecord ]);
					
                    if (!r)
                        return r;
                }
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
