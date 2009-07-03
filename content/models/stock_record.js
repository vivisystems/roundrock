( function() {
    //GeckoJS.include( 'chrome://viviecr/content/models/inventory_record.js' );

    var __model__ = {
        name: 'StockRecord',
		
        useDbConfig: 'default',

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

                //dump('sequence services url ' + this.url + "\n");

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(url, key, value, async, callback) {

            var reqUrl = url + '/' + key;

            if (value != null) reqUrl += '/' + value;

            async = async || false;
            callback = (typeof callback == 'function') ?  callback : null;


            var username = this.username ;
            var password = this.password ;

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeout = null;
            timeout = setTimeout(function() {

                try {
                    req.abort();

                }
                catch(e) {
                // dump('timeout exception ' + e + "\n");
                }
            }, 15000);

            /* Start Request with http basic authorization */
            var seq = -1;

            req.open('GET', reqUrl, true/*, username, password*/);

            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                //dump( "onreadystatechange " + req.readyState  + ',,, ' + req.status + "\n");
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if (req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            seq = result.value;
                        }
                    }
                    // clear resources
                    if (async) {
                        // status 0 -- timeout
                        if (callback) {
                            callback.call(this, seq);
                        }
                        if (timeout) clearTimeout(timeout);
                        if (req) delete req;
                        if (reqStatus) delete reqStatus;
                    }
                }
            };

            var request_data = null;
            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
                req.send(request_data);

                if (!async) {
                    // block ui until request finish or timeout
                    var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                    while (!reqStatus.finish) {
                        thread.processNextEvent(true);
                    }
                }

            }catch(e) {
            // dump('send exception ' + e + "\n");
            }finally {

                if (!async) {
                    if (timeout) clearTimeout(timeout);
                    if (req) delete req;
                    if (reqStatus) delete reqStatus;
                }

            }
            if (callback && !async) {
                callback.call(this, seq);
            }
            return seq;

        },
        
        insertNewRecords: function( products ) {
            var stockRecords = [];
		    
            products.forEach( function( product ) {
                var stockRecord = {
                    id: '',
                    product_no: product.no,
                    barcode: product.barcode,
                    warehouse: product.warehouse,
                    quantity: product.quantity || 0
                };
                stockRecords.push( stockRecord );
            } );
			
            //this.begin();
            //this.delAll( '' );
            this.saveAll( stockRecords );
            //this.commit();
        },
		
        set: function( stockRecord ) {
            if ( stockRecord ) {
                this.id = stockRecord.id || '';
                var r = this.save( stockRecord );
                if ( !r ) {
                    this.log(
                        'ERROR',
                        _( 'An error was encountered while saving stock record (error code %S): %S', [ this.lastError, this.lastErrorString ] )
                    );
                    
                    throw {
                        errmsg: _( 'An error was encountered while saving stock record (error code %S): %S', [ this.lastError, this.lastErrorString ] )
                    };

                    //@db saveToBackup
                    r = this.saveToBackup( stockRecord );
                    if ( r ) {
                        this.log(
                            'ERROR',
                            _( 'record saved to backup' )
                        );
                    } else {
                        this.log(
                            'ERROR',
                            _( 'record could not be saved to backup: %S', [ '\n' + this.dump( data ) ] )
                        );
                        
                        throw {
                            errmsg: _( 'record could not be saved to backup: %S', [ '\n' + this.dump( data ) ] )
                        };
                    }
                }
                return r;
            }
        },
		
        setAll: function( stockRecords ) {
            if ( stockRecords.length > 0 ) {
                var r;
                for ( stockRecord in stockRecords ) {
                    r = this.set( stockRecords[ stockRecord ] );
					
                    if ( !r )
                        return r;
                }
            }
        },
		
        get: function( type, params ) {
            return this.find( type, params );
        },
		
        getAll: function( type, params) {
            return this.find( type, params );
        },
		
        getStockRecordByProductNo: function( product_no ) {
            return this.get( "first", {
                fields: [ "quantity" ],
                conditions: "product_no = '" + product_no + "'"
            } );
        }
    };
	
    var StockRecordModel = window.StockRecordModel = GeckoJS.Model.extend( __model__ );
} )();
