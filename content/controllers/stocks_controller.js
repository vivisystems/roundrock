( function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Stocks',

        uses: [ 'StockRecord', 'Product' ],

        _stocksByNo: {},
        _stocksById: {},

        _cartController: null,

        observer: null,
        
        initial: function() {

            // dump('initial Stocks \n');

            var self = this;
            
            if (this.StockRecord.isRemoteService()) {
                var hWin = this.showSyncingDialog();

                // synchronize mode
                this.StockRecord.syncAllStockRecords();

                if (hWin) {
                    hWin.close();
                    delete hWin;
                }

                if (this.StockRecord.lastStatus != 200) {
                    this._serverError(this.StockRecord.lastReadyState, this.StockRecord.lastStatus, this.StockRecord.getHostname());
                }
            }else {
                // synchronize mode
                this.StockRecord.syncAllStockRecords();
            }
            
            this.backgroundSyncing = false;

            // sync stockRecords if transaction create.
            if(Transaction) {
                // on Transaction object created
                Transaction.events.addListener('onCreate', function(evt) {
                    var recoveryMode = evt.data.recoveryMode;
                    if (!self.backgroundSyncing && !recoveryMode) {
                        self.backgroundSyncing = true;
                        self.StockRecord.syncAllStockRecords(true, function(lastModified) {
                            self.backgroundSyncing = false;
                        })
                    }
                });
            }

            // manager update  observer update
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['StockRecords'],

                observe: function(aSubject, aTopic, aData) {
                    if (aData == 'commitChanges') {
                        self.StockRecord.syncAllStockRecords();
                    }
                }
                
            }).register();

            // register Cart Controller 's stock method.
            var cartController = GeckoJS.Controller.getInstanceByName('Cart');
            if(cartController) {
                this._cartController = cartController;
                cartController.checkStock = function(action, qty, item, clearWarning) {
                    return self.checkStock(action, qty, item, clearWarning);
                };

                cartController.decStock = function(obj) {
                    return self.decStock(obj);
                };

            }

            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this.removeRecoveryDecDatas, this);
            }
        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
        },

        checkStock: function(action, qty, item, clearWarning) {
            
            if (clearWarning == null) clearWarning = true;
            var obj = {
                item: item
            };
            var diff = qty;
            var cart = this._cartController;
            var curTransaction = cart._getTransaction(true);
                     
            var min_stock = parseFloat(item.min_stock);
            var auto_maintain_stock = item.auto_maintain_stock;
            var product = this.Product.getProductById(item.id);
            if (product) {
                min_stock = parseFloat(product.min_stock);
                auto_maintain_stock = product.auto_maintain_stock;
            } else {
                auto_maintain_stock = false;
            }
            
            if (auto_maintain_stock) {
                // get the stock quantity;
                var stock = this.StockRecord.getStockById(item.no);
                if ( stock === false ) {
                    NotifyUtils.warn( _( 'Stock control is active for this item [%S] but stock information does not exist', [item.name] ) );
                    return true;
                }

                //this.log('checkStock: ' + item.name + '('+qty+') , stock = ' + stock);

                if (action != "addItem") {//modifyItem
                    diff = qty - item.current_qty;
                }

                var item_count = 0;
                var qtyIncreased = (diff > 0);
                
                try {
                    item_count = (curTransaction.data.items_summary[item.id]).qty_subtotal;
                } catch (e) {}

                if ((diff + item_count) > stock) {
                    if (qtyIncreased) { // always display warning
                        cart.dispatchEvent('onOutOfStock', obj);
                        cart.dispatchEvent('onWarning', _('OUT OF STOCK'));

                        NotifyUtils.warn(_('[%S] may be out of stock!', [item.name]));
                    }
                    
                    // allow over stock...
                    var allowoverstock = GeckoJS.Configure.read('vivipos.fec.settings.AllowOverStock') || false;
                    if (!allowoverstock) {
                        cart.clear();
                        return false;
                    } else {
                        item.stock_status = -1;
                    }
                } else if (min_stock > (stock - (diff + item_count))) {
                    //if (true || qtyIncreased) { // always display warning
                        cart.dispatchEvent('onLowStock', obj);
                        cart.dispatchEvent('onWarning', _('STOCK LOW'));

                        NotifyUtils.warn(_('[%S] low stock threshold reached!', [item.name]));
                    //}
                    item.stock_status = 0;
                } else {
                    // normal
                    if (clearWarning != false) cart.dispatchEvent('onWarning', '');
                    item.stock_status = 1;
                }
            } else {
                delete item.stock_status;
                if (clearWarning != false) cart.dispatchEvent('onWarning', '');
            }
            return true;
        },

        decStock: function( obj ) {
           
            var datas = [];
            var now = Math.ceil((new Date()).getTime()/1000);

            try {

                for ( var o in obj.items ) {
                    var ordItem = obj.items[ o ];
                    
                    var item = this.Product.getProductById(ordItem.id);
                    if ( !ordItem.stock_maintained && item && item.auto_maintain_stock ) {
                        
                        // if returning item, check if returns may be re-stocked
                        if (ordItem.current_qty > 0 || item.return_stock) {
                            datas.push({id: item.no+'', quantity: ordItem.current_qty, modified: now});
                        }

                        // stock had maintained
                        ordItem.stock_maintained = true;

                         // only check min stock from local cached ..
                        var stockQty = this.StockRecord.getStockById(item.no);
                        
                        if ( item.min_stock > stockQty ) {
                            // fire onLowStock event...
                            this.dispatchEvent( 'onLowStock', item );
                        }

                    }
                }

                var decDatas = this.getRecoveryDecDatas(datas);

                // only call model once to decrease stock records .
                if (decDatas && decDatas.length > 0) {

                    this.StockRecord.decreaseStockRecords(decDatas);

                    if (this.StockRecord.lastStatus != 200) {

                        this._serverError(this.StockRecord.lastReadyState, this.StockRecord.lastStatus, this.StockRecordhostname);

                        this.saveRecoveryDecDatas(decDatas);
                        
                        return false;

                    }else {

                        this.removeRecoveryDecDatas();
                        return true;

                    }

                }
            } catch ( e ) {

                this.log('ERROR', 'decStock error' +  e );
                return false;
                
            } 
            return true;
        },

        getRecoveryDecDatas: function(datas) {

            var recoveryFile = "/data/databases/backup/stock_dec_queue.js";

            if (!GeckoJS.File.exists(recoveryFile)) return datas;

            var d = GREUtils.JSON.decodeFromFile(recoveryFile);
            
            if (d && d.constructor.name == 'Array') {
                return datas.concat(d);
            }

            return datas;

        },

        saveRecoveryDecDatas: function(datas) {

            var recoveryFile = "/data/databases/backup/stock_dec_queue.js";

            GREUtils.JSON.encodeToFile(recoveryFile, datas);

            return true;

        },

        removeRecoveryDecDatas: function() {

            var recoveryFile = "/data/databases/backup/stock_dec_queue.js";

            if (GeckoJS.File.exists(recoveryFile)) {
                GeckoJS.File.remove(recoveryFile);
            }

            return true;

        },

        showSyncingDialog: function() {

            var width = 600;
            var height = 140;

            var aURL = 'chrome://viviecr/content/alert_stock_syncing.xul';
            var aName = _('Stock Syncing');
            var aArguments = {};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }

            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return alertWin;


        },


        _serverError: function(state, status, hostname) {
            this.log('ERROR', 'Stock Server error: ' + state + ' [' +  status + '] at ' + hostname);
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win,
                _('Stock Server Connection Error'),
                _('Failed to connect to stock services (error code %S). Please check the network connectivity to the terminal designated as the stock server [message #1701].',[status]));
        }

    };
    
    AppController.extend( __controller__ );

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('beforeInitial', function() {
                    main.requestCommand('initial', null, 'Stocks');
                });
            }

        }, false);

        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'Stocks');
            }

        }, false);

    }
    
} )();
