( function() {

    var __controller__ = {

        name: 'Stocks',

        uses: [ 'Product', 'StockRecord' ],

        syncSettings: null,
        
        _stocksByNo: {},
        _stocksById: {},

        _cartController: null,
        
        initial: function() {
            dump('stocks initial \n');

            this.syncSettings = (new SyncSetting()).read();
            
            var productsById = GeckoJS.Session.get('productsById');

            // register Cart Controller 's stock method.
            var cartController = GeckoJS.Controller.getInstanceByName('Cart');
            if(cartController) {
                this._cartController = cartController;
                var self = this;
                cartController.checkStock = function(action, qty, item, clearWarning) {
                    return self.checkStock(action, qty, item, clearWarning);
                };

                cartController.decStock = function(obj) {
                    return self.decStock(obj);
                };

            }

            // register cart'controller 's checkStock / decStock method.


        },

        destroy: function() {
            dump('stocks destroy \n');
        },

        checkStock: function(action, qty, item, clearWarning) {
            if (clearWarning == null) clearWarning = true;
            var obj = {
                item: item
            };
            var diff = qty;
            var cart = this._cartController;
            var curTransaction = cart._getTransaction(true);
            
            this.log('checkStock: ' + item.name + '('+qty+')');
            
            var min_stock = parseFloat(item.min_stock);
            var auto_maintain_stock = item.auto_maintain_stock;
            var productsById = GeckoJS.Session.get('productsById');
            var product = productsById[item.id];
            if (product) {
                min_stock = parseFloat(product.min_stock);
                auto_maintain_stock = product.auto_maintain_stock;
            } else {
                auto_maintain_stock = false;
            }
            
            if (auto_maintain_stock) {
                // get the stock quantity;
                var stock = null;
                var stockRecordModel = new StockRecordModel();
                var stockRecord = stockRecordModel.get( 'first', { conditions: "product_no = '" + item.no + "'" } );
                if ( stockRecord ) {
                    stock = parseFloat( stockRecord.quantity );
                } else {
                    NotifyUtils.warn( _( 'The stock record seems not existent!' ) );
                    return false;
                }

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
            //this._productsById = GeckoJS.Session.get( 'productsById' );
            //this._barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );

            this.log('decStock: ');
            try {
                for ( var o in obj.items ) {
                    var ordItem = obj.items[ o ];
                    var item = this.Product.findById( ordItem.id );
                    if ( item && item.auto_maintain_stock && !ordItem.stock_maintained ) {
                        // renew the stock record.
                        var stockRecordModel = new StockRecordModel();
                        var stockRecord = stockRecordModel.get( 'first', {
                            conditions: "product_no = '" + item.no + "'"
                        } );
                        stockRecord.quantity -= ordItem.current_qty;
                        stockRecordModel.set( stockRecord );
                        
                        // stock had maintained
                        ordItem.stock_maintained = true;

                        // fire onLowStock event...
                        if ( item.min_stock > stockRecord.quantity ) {
                            this.dispatchEvent( 'onLowStock', item );
                        }
                        
                        delete stockRecordModel;
                    }
                }
            } catch ( e ) {
                dump( e );
                return false;
            } 
            return true;
        }
    };
    
    GeckoJS.Controller.extend( __controller__ );

    // mainWindow register promotions rules
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onInitial', function() {
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
