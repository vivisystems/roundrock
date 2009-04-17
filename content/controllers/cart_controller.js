(function(){

    /**
     * Class ViviPOS.CartController
     */

    var __controller__ = {
        name: 'Cart',
        components: ['Tax', 'GuestCheck'],
        _cartView: null,
        _queuePool: null,
        _returnMode: false,

        initial: function() {
            
            if (this._cartView == null ) {
                this._cartView = new NSICartView('cartList');
            }

            var self = this;
            var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
            keypad.addEventListener('beforeAddBuffer', self.beforeAddBuffer);

            this.addEventListener('beforeAddItem', self.beforeAddItem);
            this.addEventListener('beforeVoidItem', self.clearWarning);
            this.addEventListener('beforeModifyItem', self.beforeModifyItem);


            // var curTransaction = this._getTransaction();
            // curTransaction.events.addListener('beforeAppendItem', obj, this);
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

        },

        suspend: function () {
            this._suspended = true;
        },

        resume: function () {
            this._suspended = false;
        },

        beforeAddBuffer: function () {

            var self = this;
            
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var curTransaction = cart._getTransaction();
            if (curTransaction == null) return;
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {

                if (cart._cartView.tree) {
                    cart.dispatchEvent('onClear', curTransaction);
                    cart._cartView.empty();
                }
                return ;
            }
        },

        checkStock: function(action, qty, item, clearWarning) {
            if (clearWarning == null) clearWarning = true;
            var obj = {
                item: item
            };
            var diff = qty;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var min_stock = parseFloat(item.min_stock);
            var stock = parseFloat(item.stock);
            var auto_maintain_stock = item.auto_maintain_stock;

            if (action != "addItem") {
                var productsById = GeckoJS.Session.get('productsById');
                var product = productsById[item.id];
                if (product) {
                    stock = parseFloat(product.stock);
                    min_stock = parseFloat(product.min_stock);
                    auto_maintain_stock = product.auto_maintain_stock;
                    diff = qty - item.current_qty;
                }
                else {
                    auto_maintain_stock = false;
                }
            }
            if (auto_maintain_stock) {

                var item_count = 0;
                var curTransaction = cart._getTransaction(true);
                var qtyIncreased = (diff > 0);
                
                try {
                    item_count = (curTransaction.data.items_summary[item.id]).qty_subtotal;
                } catch (e) {}

                if ((diff + item_count) > stock) {
                    if (true || qtyIncreased) { // always display warning
                        cart.dispatchEvent('onLowStock', obj);
                        cart.dispatchEvent('onWarning', _('OUT OF STOCK'));
                        //@todo add OSD?
                        NotifyUtils.warn(_('[%S] may be out of stock!', [item.name]));
                    }
                    
                    // allow over stock...
                    var allowoverstock = GeckoJS.Configure.read('vivipos.fec.settings.AllowOverStock') || false;
                    if (!allowoverstock) {
                        cart.clear();
                        return false;
                    }
                    else {
                        item.stock_status = -1;
                    }
                } else if (min_stock > (stock - (diff + item_count))) {
                    if (true || qtyIncreased) { // always display warning
                        cart.dispatchEvent('onLowerStock', obj);
                        cart.dispatchEvent('onWarning', _('STOCK LOW'));

                        //@todo add OSD?
                        NotifyUtils.warn(_('[%S] low stock threshold reached!', [item.name]));
                    }
                    item.stock_status = 0;
                } else {
                    // normal
                    if (clearWarning != false) cart.dispatchEvent('onWarning', '');
                    item.stock_status = 1;
                }
            }
            else {
                if (clearWarning != false) cart.dispatchEvent('onWarning', '');
            }
            return true;

        },

        clearWarning: function (evt) {
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.dispatchEvent('onWarning', '');
        },

        beforeAddItem: function (evt) {
            var item = evt.data;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var setItemsStockStatus = 1;
            var setItemsAgeVerificationRequired = 0;
            var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired');
            var setItemSelectionRequired = false;
            var curTransaction = this._getTransaction();

            // cart.log('Item:' + cart.dump(item));

            var sellQty = null, sellPrice = null;

            // check if user is allowed to register open price
            if (GeckoJS.Session.get('cart_set_price_value') != null && !this.Acl.isUserInRole('acl_register_open_price')) {
                GeckoJS.Session.remove('cart_set_price_value');
                NotifyUtils.warn(_('Not authorized to register open price'));
            }

            sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
            if (sellQty == null) sellQty = 1;

            sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

            // check if zero preset price is allowed
            // @todo
            if (positivePriceRequired && curTransaction != null) {
                sellPrice = curTransaction.checkSellPrice(item)
                if (sellPrice <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be registered with a price of [%S]!', [item.name, curTransaction.formatPrice(sellPrice)]));
                    evt.preventDefault();
                    return;
                }
            }

            // retrieve set items only if SetItem is set
            var setItems = [];
            if (item.SetItem != null && item.SetItem.length > 0) {
                setItems = item.SetItem;
                for (var i = 0; i < setItems.length; i++) {
                    var productId = barcodesIndexes[setItems[i].preset_no];
                    var product = productsById[productId];
                    if (product && product.age_verification) {
                        setItemsAgeVerificationRequired = 1;
                        break;
                    }
                }
            }
            // check stock status...
            //
            // first check main item
            if (!cart._returnMode)
                if (!cart.checkStock("addItem", sellQty, item)) evt.preventDefault();
                
            // if set items are present, check each one individually
            setItems.forEach(function(setitem) {
                var productId = barcodesIndexes[setitem.preset_no];
                var product = productsById[productId];
                if (product) {
                    if (!cart._returnMode && !cart.checkStock('addItem', sellQty * setitem.quantity, product, false)) {

                        // is group available?
                        if (setitem.linkgroup_id) {
                            setItemSelectionRequired = true;
                        }
                        else {
                            evt.preventDefault();
                            return;
                        }
                    }
                    if (product.stock_status != null && product.stock_status != 1)
                        setItemsStockStatus = product.stock_status;
                }
                else if (setitem.linkgroup_id) {
                    setItemSelectionRequired = true;
                }
            });
            //
            // @irving: 4/9/2009 no reason to disallow return of product sets;
            /*
            else {
                // we don't allow return of product sets
                if (setItems.length > 0 ) {
                    //@todo OSD
                    NotifyUtils.warn(_('Return of product sets [%S] not allowed!', [item.name]));
                    evt.preventDefault();
                }
            }
            */

            // check if age verification required
            if ( !evt._cancel) {
                if (!cart._returnMode && (item.age_verification || setItemsAgeVerificationRequired)) {
                    var obj = { 
                        item: item
                    };

                    cart.dispatchEvent('onAgeVerification', obj);
                    cart.dispatchEvent('onWarning', _('VERIFY AGE'));

                    var requireAck = GeckoJS.Configure.read('vivipos.fec.settings.AgeVerificationAck')

                    if (requireAck) {
                        if (GREUtils.Dialog.confirm(null, _('confirm age'), _('Is customer of age for purchase of [%S]?', [item.name])) == false) {
                            evt.preventDefault();
                            return;
                        }
                    }
                    else {
                        //@todo OSD
                        NotifyUtils.warn(_('Verify Customer Age for Purchase of [%S]!', [item.name]));
                    }
                }
                else {
                    // clear warning if no stock warning
                    if ((item.stock_status == null || item.stock_status == 1) && setItemsStockStatus == 1) {
                        cart.dispatchEvent('onWarning', '');
                    }
                }
                evt.data.setItemSelectionRequired = setItemSelectionRequired;
            }
        },

        beforeModifyItem: function(evt) {

            var itemDisplay = evt.data.itemDisplay;
            var itemTrans = evt.data.item;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            // check if stock is lower or over
            if (itemDisplay.type == 'item') {
                var qty = null;
                qty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : qty;
                if (qty > 0 && !cart.checkStock("modifyItem", qty, itemTrans)) {
                    evt.preventDefault();
                    return false;
                }

                // need to retrieve set items and check stock level individually
                var setItems = cart._getTransaction().getSetItemsByIndex(itemTrans.index);
                var oldQty = itemTrans.current_qty;

                setItems.forEach(function(setitem) {
                    if (!cart.checkStock('modifyItem', qty * setitem.current_qty / oldQty, setitem, false)) {
                        evt.preventDefault();
                        return;
                    }
                });
            }

        },

        _newTransaction: function() {
            var curTransaction = new Transaction();
            this._setTransactionToView(curTransaction);

            // check pricelevel schedule
            this.requestCommand('schedule', null, 'Pricelevel');

            // dispatch event
            this.dispatchEvent('newTransaction', {});
            
            return curTransaction;
        },

        _getTransaction: function(autoCreate) {

            autoCreate = autoCreate || false;

            var curTransaction = GeckoJS.Session.get('current_transaction');

            // null 
            if (curTransaction == null){
                if(autoCreate) return this._newTransaction();
                return null;
            }

            // has submit
            if (curTransaction.isSubmit() && autoCreate ) return this._newTransaction();
            return curTransaction;
        },

        _setTransactionToView: function(transaction) {

            this._cartView.setTransaction(transaction);
            GeckoJS.Session.set('current_transaction', transaction);
            GeckoJS.Session.remove('cart_last_sell_item');
        //GeckoJS.Session.remove('cart_set_price_value');
        //GeckoJS.Session.remove('cart_set_qty_value');
        },
	
        _getCartlist: function() {
            return document.getElementById('cartList');
        },

        _getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },

        _getQueuePool: function() {

            this._queuePool = GeckoJS.Session.get('cart_queue_pool');
            if (this._queuePool == null) {
                this._queuePool = {
                    user: {},
                    data:{}
                };
                GeckoJS.Session.set('cart_queue_pool', this._queuePool);
            }
            return this._queuePool;
            
        },

        tagItem: function(tag) {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot tag the selected item'));

                this.subtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this.subtotal();
                return;
            }

            if (tag == null || tag.length == 0) {
                //@todo OSD
                NotifyUtils.warn(_('Cannot tag the selected item with an empty tag'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index, true);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                this.dispatchEvent('onTagItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot tag the selected item [%S]', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            if (this.dispatchEvent('beforeTagItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var taggedItem = curTransaction.tagItemAt(index, tag);

                this.dispatchEvent('afterTagItem', [taggedItem, itemDisplay]);
            }
        },

        addItem: function(plu) {

            if (this._suspended) return;

            var currentIndex = this._cartView.getSelectedIndex();
            var item = GREUtils.extend({}, plu);

            // not valid plu item.
            if (typeof item != 'object' || typeof item.id == 'undefined') {
                return;
            }

            var curTransaction = this._getTransaction(true);

            if(curTransaction == null) {
                return; // fatal error ?
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and new items may not be added'));

                this.subtotal();
                return;
            }

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                curTransaction = this._newTransaction();
            }
            
            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                this.setPrice(buf);
                this._getKeypadController().clearBuffer();
            }

            // if we are not in return mode, check if new item is the same as current item. if they are the same,
            // collapse it into the current item if no surcharge/discount/marker has
            // been applied to the current item and price/tax status are the same
            
            if (curTransaction && !this._returnMode) {
                if (!curTransaction.isLocked(currentIndex)) {
                    var currentItem = curTransaction.getItemAt(currentIndex);
                    var currentItemDisplay = curTransaction.getDisplaySeqAt(currentIndex);

                    var price = GeckoJS.Session.get('cart_set_price_value');
                    var qty = GeckoJS.Session.get('cart_set_qty_value');

                    if (qty == null) qty = 1;

                    if (currentItemDisplay && currentItemDisplay.type == 'item') {
                        if (currentItem.no == plu.no &&
                            !currentItem.hasDiscount &&
                            !currentItem.hasSurcharge &&
                            !currentItem.hasMarker &&
                            ((price == null) || (currentItem.current_price == price)) &&
                            currentItem.tax_name == plu.rate) {

                            this.modifyQty('plus', qty);
                            return;
                        }
                    }
                }
            }

            if (this.dispatchEvent('beforeAddItem', item)) {
                // check if set item selection is needed
                if (item.setItemSelectionRequired) {
                    this.setItemSelectionDialog(curTransaction, item);
                    return;
                }

                if (this._returnMode) {
                    var qty = 0 - (GeckoJS.Session.get('cart_set_qty_value') || 1);
                    GeckoJS.Session.set('cart_set_qty_value', qty);
                }

                var addedItem = curTransaction.appendItem(item);
                var doSIS = plu.single && curTransaction.data.items_count == 1 && !this._returnMode;

                this.dispatchEvent('onAddItem', addedItem);

                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.dispatchEvent('afterAddItem', addedItem);

                var self = this;
                var cart = this._getCartlist();
                
                // wrap with chain method
                next( function() {

                    if (addedItem.id == plu.id && !self._returnMode) {

                        currentIndex = curTransaction.getDisplayIndexByIndex(addedItem.index);
                        return next( function() {

                            if (plu.force_condiment) {

                                // need to move cursor to addedItem
                                cart.selection.select(currentIndex);

                                return self.addCondiment(plu, null, doSIS);
                            }

                        }).next( function() {
				 
                            if (plu.force_memo) {

                                // need to move cursor to addedItem
                                cart.selection.select(currentIndex);

                                return self.addMemo(plu);
                            }

                        });
                        
                    }

                } ).next( function() {

                    // single item sale?
                    if (doSIS) {
                        self.addPayment('cash');
                        self.dispatchEvent('onWarning', _('SINGLE ITEM SALE'));
                    }
                    else {
                        self.subtotal();
                    }

                });

            }
            else {
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');
                
                this.subtotal();
            }
            //this._getCartlist().refresh();
        },
	
        setItemSelectionDialog: function (txn, item) {

            // start at first set item where preset_no == null and linkgroup_id != null
            var startIndex = 0;
            var pluset = item.SetItem;
            for (var i = 0; i < pluset.length; i++) {
                var entry = pluset[i];

                if (entry.linkgroup_id != null && entry.linkgroup_id != '') {
                    startIndex = i;
                    break;
                }
            }

            pluset.forEach(function(setitem) {
               setitem.product_no = '';
            });
            
            var dialog_data = {
                pluset: pluset,
                name: item.name,
                start: startIndex
            };
            var self = this;
            return $.popupPanel('selectSetItemPanel', dialog_data).next(function(evt){

                if (evt.data.ok) {
                    var plusetData = evt.data.plusetData;

                    self.log('DEBUG', 'product set selections: ' + self.dump(plusetData));

                    let plu = item;
                    var setitems = [];

                    plusetData.forEach(function(setitem) {

                        var qty = setitem.setitem.quantity;
                        var selected_no = setitem.product.no;
                        var preset_no = setitem.setitem.preset_no;
                        var priceDiff = 0;

                        if (preset_no != selected_no) {

                            // compute price differential
                            var sellPrice = txn.calcSellPrice(null, qty, setitem.product);

                            priceDiff = sellPrice - setitem.setitem.baseprice;
                            if (priceDiff < 0 && !setitem.setitem.reduction) {
                                priceDiff = 0;
                            }
                        }

                        var newItem = {
                            preset_no: setitem.product.no,
                            quantity: setitem.setitem.quantity,
                            price: priceDiff
                        };

                        setitems.push(newItem);
                    });
                    plu.SetItem = setitems;

                    self.log('DEBUG', 'virtual product set: ' + self.dump(plu));
                    self.addItem(plu);
                }
                else {
                    this.log('DEBUG', 'product set cancelled');
                }
            });

        },

        setItemModifyDialog: function (txn, item, itemDisplay) {
            // construct virtual set item from cart content

            // get cart set items
            var setItems = txn.getSetItemsByIndex(item.index);
            var plusetDispIndex = txn.getDisplayIndexByIndex(item.index);

            // get product set definition
            var productsById = GeckoJS.Session.get('productsById');
            var product = productsById[item.id];

            // assign each cart set item into product set
            var pluset = product.SetItem;

            var startIndex = 0;
            for (var i = 0; i < pluset.length; i++) {
                pluset[i].product_no = setItems[i].no;
                if (setItems[i].no == itemDisplay.no) {
                    startIndex = i;
                }
            }
            var dialog_data = {
                pluset: pluset,
                name: item.name,
                start: startIndex
            };
            var self = this;
            return $.popupPanel('selectSetItemPanel', dialog_data).next(function(evt){
                if (evt.data.ok) {
                    var plusetData = evt.data.plusetData;
                    self.log('DEBUG', 'product set selections: ' + self.dump(plusetData));

                    var newItems = [];

                    plusetData.forEach(function(setitem) {

                        var qty = setitem.setitem.quantity;
                        var selected_no = setitem.product.no;
                        var preset_no = setitem.setitem.preset_no;
                        var priceDiff = 0;
                        let item = setitem.product;

                        if (preset_no != selected_no) {

                            // compute price differential
                            var sellPrice = txn.calcSellPrice(null, qty, setitem.product);

                            priceDiff = sellPrice - setitem.setitem.baseprice;
                            if (priceDiff < 0 && !setitem.setitem.reduction) {
                                priceDiff = 0;
                            }
                        }

                        var newItem = {
                            item: item,
                            preset_no: setitem.product.no,
                            quantity: setitem.setitem.quantity,
                            price: priceDiff
                        };

                        newItems.push(newItem);
                    });

                    self.log('DEBUG', 'virtual product set: ' + self.dump(newItems));

                    // check if set items have changed
                    var changed = false;

                    // loop through set items to determine if individual set items need to be swapped
                    var removedSetItems = [];
                    var outOfStock = false;
                    for (var i = 0; i < setItems.length; i++) {
                        var oldSetItem = setItems[i];
                        var newSetItem = newItems[i];

                        if (oldSetItem.no != newSetItem.preset_no) {

                            changed = true;

                            // store swapped out item
                            removedSetItems.push(oldSetItem);

                            // back out stock of swapped out item
                            txn.data.items_summary[oldSetItem.id].qty_subtotal -= oldSetItem.current_qty;

                            // check stock of swapped in item
                            if (!self.checkStock('addItem', oldSetItem.current_qty, newSetItem.item, 0)) {
                                outOfStock = true;
                            }
                        }
                    }

                    // restore stock of swapped out items
                    removedSetItems.forEach(function(item) {
                        txn.data.items_summary[item.id].qty_subtotal += item.current_qty;
                    });
                    
                    if (outOfStock) {
                        return;
                    }
                    // void then add
                    if (changed) {
                        txn.modifyItemAt(plusetDispIndex, newItems);

                        self.clearAndSubtotal();
                    }

                }
                else {
                    self.log('DEBUG', 'product set cancelled');
                }
            });
        },

        addItemByBarcode: function(barcode) {

            if (barcode == null || barcode.length == 0) return;
            
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            var event = { 
                error: false,
                barcode: barcode,
                product: null
            };
            
            if (!barcodesIndexes || !barcodesIndexes[barcode]) {
                // barcode notfound
                event.error = true;

                //@todo OSD
                NotifyUtils.warn(_('Product scan code not found [%S]', [barcode]));
            }else {
                var id = barcodesIndexes[barcode];
                var product = productsById[id];
                event.product = product;
            }
            this.dispatchEvent('beforeItemByBarcode', event);
            
            if (!event.error) {
                this.addItem(product);
            }
            else {
                this.subtotal();
            }
            this.dispatchEvent('afterItemByBarcode', event);
        },
	
        modifyItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
            }

            // check whether price or quantity or both are being modified
            var newPrice = GeckoJS.Session.get('cart_set_price_value');
            var newQuantity = GeckoJS.Session.get('cart_set_qty_value');

            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify the selected item'));

                this.clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.clearAndSubtotal();
                return;
            }

            if (index < 0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this.clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
                this.dispatchEvent('onModifyItemError', {});

                if (itemDisplay.type == 'setitem') {

                    // disallow quantity/price modification on set items
                    if (newQuantity != null || newPrice != null) {
                        //@todo OSD
                        NotifyUtils.warn(_('Price/quantity of product set item [%S] may not be modified', [itemDisplay.name]));

                        this.clearAndSubtotal();
                        return;
                    }
                }
                else {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify the selected item [%S]', [itemDisplay.name]));

                    this.clearAndSubtotal();
                    return;
                }
            }

            if (itemDisplay.type == 'condiment') {

                // check if condiment is open
                if ('open' in itemDisplay && !itemDisplay.open) {

                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify condiments when collapsed'));

                    this.clearAndSubtotal();
                    return;
                }

                // check if quantity is entered
                if (newQuantity != null) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify condiment quantity'));

                    this.clearAndSubtotal();
                    return ;
                }
                
                // check if price is entered
                if (buf.length <= 0) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify condiment price; no price entered'));

                    this.clearAndSubtotal();
                    return ;
                }

                // check if user is allowed to modify condiment price
                if (!this.Acl.isUserInRole('acl_modify_condiment_price')) {

                    //@todo OSD
                    NotifyUtils.warn(_('Not authorized to modify condiment price'));

                    this.clearAndSubtotal();
                    return;
                }
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemTrans.name]));

                this.clearAndSubtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemTrans.name]));

                this.clearAndSubtotal();
                return;
            }
/*
            if (itemDisplay.type == 'item' && GeckoJS.Session.get('cart_set_price_value') == null && GeckoJS.Session.get('cart_set_qty_value') == null && buf.length <= 0) {
                // @todo popup ??
                this.log('DEBUG', 'modifyItem but no qty / price set!! plu = ' + this.dump(itemTrans) );
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; no price or quantity entered'));
                return ;
            }
*/
            if (itemDisplay.type == 'condiment' && buf.length <= 0 ) {
                // @todo popup ??
            }

            if (itemDisplay.type == 'setitem') {
                this.setItemModifyDialog(curTransaction, itemTrans, itemDisplay);
                return;
            }
            
            var modifyPrice = (newPrice != null && newPrice != itemTrans.current_price);
            var modifyQuantity = (newQuantity != null && newQuantity != itemTrans.current_qty);
            
            if (modifyPrice && !this.Acl.isUserInRole('acl_modify_price')) {
                NotifyUtils.warn(_('Not authorized to modify price'));

                this.clearAndSubtotal();
                return;
            }

            if (modifyQuantity && !this.Acl.isUserInRole('acl_modify_quantity')) {
                NotifyUtils.warn(_('Not authorized to modify quantity'));

                this.clearAndSubtotal();
                return;
            }
            
            // check if zero preset price is allowed
            // @todo
            var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired') || false;

            if (positivePriceRequired && curTransaction != null) {
                if (curTransaction.checkSellPrice(itemTrans) <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be modified with a price of [%S]!', [itemTrans.name, curTransaction.formatPrice(0)]));

                    this.clearAndSubtotal();
                    return;
                }
            }

            if (this.dispatchEvent('beforeModifyItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var modifiedItem = curTransaction.modifyItemAt(index);

                this.dispatchEvent('afterModifyItem', [modifiedItem, itemDisplay]);
            }
            this.clearAndSubtotal();
			
        },
	

        modifyQty: function(action, delta) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify the selected item'));

                this.subtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item') {
                this.dispatchEvent('onModifyItemError', {});

                if (itemDisplay.type == 'setitem') {
                    //@todo OSD
                    NotifyUtils.warn(_('Quantity of product set item [%S] may not be modified', [itemDisplay.name]));
                }
                else if (itemDisplay.type == 'condiment') {
                    //@todo OSD
                    NotifyUtils.warn(_('Quantity of condiment [%S] may not be modified', [itemDisplay.name]));
                }
                else {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify quantity of selected item [%S]', [itemDisplay.name]));
                }

                this.subtotal();
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge || itemTrans.hasMarker) {
                this.dispatchEvent('onmodifyQtyError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            var qty = itemTrans.current_qty;
            var newQty = Math.abs(qty + 0);
            if (delta == null || isNaN(delta)) {
                delta = 1;
            }
            switch(action) {
                case 'plus':
                    newQty = newQty+delta;
                    break;
                case 'minus':
                    newQty = (newQty - delta > 0) ? (newQty - delta) : newQty;
                    break;
            }
            if (qty < 0) newQty = 0 - newQty;
            if (newQty != qty) {
                GeckoJS.Session.set('cart_set_qty_value', newQty);
                this.modifyItem();
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Quantity may not be less than 1'));

                this.subtotal();
                return;
            }
            
        },

        clearAndSubtotal: function() {
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
        },

        returnItem: function(cancel) {

            if (cancel || this._returnMode) {
                if (this._returnMode && !cancel) {
                    this._getKeypadController().clearBuffer();
                    this.subtotal();
                }
                if (this._returnMode) {
                    this._returnMode = false;
                    this.clearWarning();
                }
            }
            else {
                this._returnMode = true;
                this.dispatchEvent('onReturnStatus', null);
            }
        },

        cancelReturn: function() {
            this.returnItem(true);
        },

        voidItem: function() {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this.cancelReturn();
            this._getKeypadController().clearBuffer();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot void'));

                this.subtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be voided'));

                this.subtotal();
                return;
            }

            var itemTrans = null;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == 'subtotal' || itemDisplay.type == 'tray' || itemDisplay.type == 'total') {

                // allow voiding of markers only if they are the last item in cart
                var cartLength = curTransaction.data.display_sequences.length;
                if (index < cartLength - 1) {
                    this.dispatchEvent('onVoidItemError', {});

                    // @todo OSD
                    NotifyUtils.warn(_('Cannot VOID the selected item [%S]. It is not the last registered item', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
            }
            else if (itemDisplay.type == 'setitem') {
                // @todo OSD
                NotifyUtils.warn(_('The select item [%S] is a member of a product set and cannot be VOIDed individually', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            itemTrans = curTransaction.getItemAt(index);
            if (itemTrans) {

                // has item been marked?
                if(itemDisplay.type != 'memo' && itemTrans.hasMarker) {
                    // @todo OSD
                    this.dispatchEvent('onVoidItemError', {});
                    NotifyUtils.warn(_('Cannot VOID an entry that has been subtotaled'));

                    this.subtotal();
                    return;
                }

                // if voiding condiment, make sure item does not have discounts applied
                if(itemDisplay.type == 'condiment' && parseFloat(itemDisplay.current_price) > 0) {
                    if (itemTrans.hasDiscount) {
                        NotifyUtils.warn(_('Please void discount on item [%S] first', [itemTrans.name]));

                        this.subtotal();
                        return;
                    }
                    else if (itemTrans.hasSurcharge) {
                        NotifyUtils.warn(_('Please void surcharge on item [%S] first', [itemTrans.name]));

                        this.subtotal();
                        return;
                    }
                }
            }

            this.dispatchEvent('beforeVoidItem', itemTrans);
            var voidedItem = curTransaction.voidItemAt(index);
            this.dispatchEvent('afterVoidItem', [voidedItem, itemDisplay]);

            this.subtotal();


        },

        addDiscountByNumber: function(args) {
            // args is a list of up to 2 comma separated arguments: amount, label
            var discountAmount;
            var discountName = '-'

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) discountAmount = argList[0];
                if (argList.length > 1) discountName = argList[1];
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            this.addDiscount(discountAmount, '$', discountName, false);
        },

        addDiscountByPercentage: function(args, pretax) {
            // args is a list of up to 2 comma separated arguments: amount, label
            var discountAmount;
            var discountName;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) discountAmount = argList[0];
                if (argList.length > 1) discountName = argList[1];
            }

            if (pretax == null) pretax = false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            if (discountName == null || discountName == '') {
                discountName = '-' + discountAmount + '%';
            }

            this.addDiscount(discountAmount, '%', discountName, pretax);
        },


        addPretaxDiscountByPercentage: function(args) {
            this.addDiscountByPercentage(args, true);
        },


        addDiscount: function(discountAmount, discountType, discountName, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add discount'));

                this.subtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and discount may not be registered'));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item'));
                
                this.subtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Discount may not be registered against stored items'));

                this.subtotal();
                return;
            }

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (pretax && itemDisplay.type != 'subtotal') {
                // @todo OSD
                NotifyUtils.warn(_('Pretax discount can only be registered against subtotals'));

                this.subtotal();
                return;
            }

            if (itemTrans != null && itemTrans.type == 'item') {
                if (itemTrans.hasDiscount) {
                    this.log('DEBUG', 'already hasDiscount');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));

                    this.subtotal();
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    this.log('DEBUG', 'already hasSurcharge');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));

                    this.subtotal();
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('DEBUG', 'already hasMarker');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                    this.subtotal();
                    return;
                }
            /*
                if (itemTrans.current_qty < 0) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot register discount on return items'));
                    return;
                }
                */
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
                else if (index < cartLength - 1) {
                    this.dispatchEvent('onAddDiscountError', {});

                    // @todo OSD
                    NotifyUtils.warn(_('Cannot apply discount to [%S]. It is not the last registered item', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Discount may not be applied to [%S]', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            if (discountAmount == null || isNaN(discountAmount) || !discountAmount) {
                if (discountType == '$') {
                    // @todo OSD
                    NotifyUtils.warn(_('Please enter the discount amount'));
                }
                else {
                    NotifyUtils.warn(_('Please enter the discount percentage'));
                }

                this.dispatchEvent('onAddDiscountError', {});

                this.subtotal();
                return;
            }
            
            // check percentage or fixed number
            if(discountType == '%') {
                // percentage
                discountAmount = parseFloat(discountAmount) / 100;
            }else {
                // fixed number
                discountAmount = parseFloat(discountAmount);

            }

            var discountItem = {
                type: discountType,
                name: discountName,
                amount: discountAmount,
                pretax: (pretax == null) ? false : pretax
            };

            this.log('DEBUG', 'beforeAddDiscount ' + this.dump(discountItem) );
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItem = curTransaction.appendDiscount(index, discountItem);

            this.log('DEBUG', 'afterAddDiscount ' + index + ','+ this.dump(discountItem) );
            this.dispatchEvent('afterAddDiscount', discountedItem);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
        },

        addSurchargeByNumber: function(args) {
            // args is a list of up to 2 comma separated arguments: amount, label
            var surchargeAmount;
            var surchargeName = '+'

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) surchargeAmount = argList[0];
                if (argList.length > 1) surchargeName = argList[1];
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if ((surchargeAmount != null || surchargeAmount != '') && buf.length>0) {
                surchargeAmount = buf;
            }

            this.addSurcharge(surchargeAmount, '$', surchargeName, false);
        },

        addSurchargeByPercentage: function(args, pretax) {
            // args is a list of up to 2 comma separated arguments: amount, label
            var surchargeAmount;
            var surchargeName;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) surchargeAmount = argList[0];
                if (argList.length > 1) surchargeName = argList[1];
            }

            if (pretax == null) pretax = false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if ((surchargeAmount == null || surchargeAmount == '') && buf.length>0) {
                surchargeAmount = buf;
            }

            if (surchargeName == null || surchargeName == '') {
                surchargeName = '+' + surchargeAmount + '%';
            }

            this.addSurcharge(surchargeAmount, '%', surchargeName, false);
        },


        addPretaxSurchargeByPercentage: function(args) {
            this.addSurchargeByPercentage(args, true);
        },



        addSurcharge: function(surchargeAmount, surchargeType, name, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));

                this.subtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and surcharge may not be registered'));

                this.subtotal();
                return;
            }

            if(index < 0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Surcharge may not be registered against stored items'));

                this.subtotal();
                return;
            }

            surchargeAmount = surchargeAmount || false;

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);
            
            if (pretax && itemDisplay.type != 'subtotal') {
                // @todo OSD
                NotifyUtils.warn(_('Pretax surcharge can only be registered against subtotals'));

                this.subtotal();
                return;
            }
            if (itemTrans != null && itemTrans.type == 'item') {

                if (itemTrans.hasDiscount) {
                    this.log('DEBUG', 'already hasDiscount');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));

                    this.subtotal();
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    this.log('DEBUG', 'already hasSurcharge');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));

                    this.subtotal();
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('DEBUG', 'already hasMarker');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                    this.subtotal();
                    return;
                }
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
                else if (index < cartLength - 1) {
                    this.dispatchEvent('onAddSurchargeError', {});

                    // @todo OSD
                    NotifyUtils.warn(_('Cannot apply surcharge to [%S]. It is not the last registered item', [itemDisplay.name]));

                    this.subtotal();
                    return;
                }
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Surcharge may not be applied to [%S]', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            if (surchargeAmount == null || isNaN(surchargeAmount) || !surchargeAmount) {
                if (surchargeType == '$') {
                    // @todo OSD
                    NotifyUtils.warn(_('Please enter the surcharge amount'));
                }
                else {
                    NotifyUtils.warn(_('Please enter the surcharge percentage'));
                }

                this.dispatchEvent('onAddSurchargeError', {});

                this.subtotal();
                return;
            }

            // check percentage or fixed number
            if(surchargeType == '%') {
                // percentage
                surchargeAmount = parseFloat(surchargeAmount) / 100;

            }else {
                // fixed number
                surchargeAmount = parseFloat(surchargeAmount);

            }
            var surchargeItem = {
                name: name,
                type: surchargeType,
                amount: surchargeAmount,
                pretax: (pretax == null) ? false : pretax
            };
            this.dispatchEvent('beforeAddSurcharge', surchargeItem);

            var surchargedItem = curTransaction.appendSurcharge(index, surchargeItem);

            this.dispatchEvent('afterAddSurcharge', surchargedItem);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();


        },

        addMarker: function(type) {
            type = type || _('subtotal');

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add %s', [type]));

                this.subtotal();
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot add %s', [type]));

                this.subtotal();
                return;
            }

            var dspSeqCount = curTransaction.getDisplaySeqCount();

            var index = dspSeqCount-1;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == type) {
                if (type == 'subtotal')
                    this.subtotal();
                else
                    this.dispatchEvent('onAddMarkerError', {});
            
                return;
            }

            this.dispatchEvent('beforeAddMarker', type);

            var markerItem = curTransaction.appendMarker(index, type);
            
            this.dispatchEvent('afterAddMarker', markerItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
        },


        houseBon: function(name) {

            if (name == null || name.length == 0) name = _('House Bon');
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();
            
            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                this.clear();
                this.dispatchEvent('onHouseBon', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register %s', [name]));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemTrans != null && itemTrans.type == 'item') {

                var discountAmount =  itemTrans.current_subtotal;
                this.addDiscount(discountAmount, '$', name);
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('House Bon may not be applied to [%S]', [itemDisplay.name]));

                this.subtotal();
                return;
            }

        },

        currencyConvert: function(convertCode) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            var currencies = GeckoJS.Session.get('Currencies');
            var convertIndex = -1;

            // locate currency index from convertCode
            if (currencies) {
                for (var i = 0; i < currencies.length; i++) {
                    if (currencies[i].currency.length > 0 && currencies[i].currency == convertCode) {
                        convertIndex = i;
                        break;
                    }
                }
            }

            if (convertIndex < 0) {
                //@todo OSD
                NotifyUtils.warn(_('The selected currency [%S] has not been configured', [convertCode]));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return;
            }

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (buf.length>0 && currencies && currencies.length > convertIndex) {
                var amount = parseFloat(buf);
                var origin_amount = amount;
                // currency convert array
                var currency_rate = currencies[convertIndex].currency_exchange;
                var memo1 = currencies[convertIndex].currency;
                var memo2 = currency_rate;
                amount = amount * currency_rate;
                this._getKeypadController().clearBuffer();
                this.addPayment('cash', amount, origin_amount, memo1, memo2);
            }
            else {
                if (buf.length==0) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please enter an amount first'));
                }
                else if (currencies == null || currencies.length <= convertIndex) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please configure the selected currency entry first [%S]', [convertIndex]));
                }
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return;
            }
        },

        getCreditCardDialog: function (data) {

            var self = this;

            var inputObj = {
                input0: data.type,
                input1:null
            };

            var dialog_data = [
            _('Credit Card Remark'),
            _('Payment') + ' [' + data.payment + ']',
            _('Card Type'),
            _('Card Remark'),
            inputObj
            ];

            return $.popupPanel('creditcardRemarkPanel', dialog_data);
            
        },

        getCouponDialog: function (data) {
            
            var self = this;

            var inputObj = {
                input0: data.type,
                input1:null
            };

            var dialog_data = [
            _('Coupon Remark'),
            _('Payment') + ' [' + data.payment + ']',
            _('Coupon Type'),
            _('Coupon Remark'),
            inputObj
            ];

            return $.popupPanel('couponRemarkPanel', dialog_data);

        },

        getGiftcardDialog: function (data) {

            var self = this;

            var inputObj = {
                input0: data.type,
                input1:null
            };

            var dialog_data = [
            _('Giftcard Remark'),
            _('Payment') + ' [' + data.payment + ']',
            _('Giftcard Type'),
            _('Giftcard Remark'),
            inputObj
            ];

            return $.popupPanel('couponRemarkPanel', dialog_data);

        },

        getCheckDialog: function (data) {

            var self = this;

            var inputObj = {
                input0: data.type,
                input1:null
            };

            var dialog_data = [
            _('Check Remark'),
            _('Payment') + ' [' + data.payment + ']',
            _('Check Type'),
            _('Check Remark'),
            inputObj
            ];

            return $.popupPanel('couponRemarkPanel', dialog_data);

        },

        creditCard: function(args) {

            var argList = [];
            if (args != null && args != '') {
                argList = args.split(',');
            }

            var type = argList[0];
            var silent = argList[1];

            if (type == null) type = '';

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this.subtotal();
                return; // fatal error ?
            }

            var payment = parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();
            
            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                if (payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));

                    this.subtotal();
                    return; // fatal error ?
                }

            }
            else {
                if (balance <= 0) {
                    this.clear();

                    // @todo OSD
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this.subtotal();
                    return; // fatal error ?
                }

                if (payment == 0 || isNaN(payment)) {
                    //@todo OSD
                    //NotifyUtils.warn(_('Please enter an amount first'));
                    //return;
                    payment = balance;
                }

                if (payment > balance) {
                    // @todo OSD
                    GREUtils.Dialog.alert(window,
                        _('Credit Card Payment Error'),
                        _('Credit card payment may not exceed remaining balance'));
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
                    return; // fatal error ?
                }
            }

            if (silent && type != '') {
                this.addPayment('creditcard', payment, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this.getCreditCardDialog(data).next(function(evt) {

                    var result = evt.data;

                    if (result.ok) {
                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';
                        self.addPayment('creditcard', payment, payment, memo1, memo2);
                    }
                    else {
                        self.subtotal();
                    }
                });
            }

        },

        coupon: function(args) {

            // args should be a list of up to 2 comma-separated parameters: type, amount
            var type = '';
            var amount;
            var silent = false;
            if (args != null && args != '') {
                var argList = args.split(',');
                type = argList[0];
                if (type == null) type = ''
                if (argList[1] != null && argList[1] != '' && !isNaN(argList[1])) amount = parseFloat(argList[1]);
                silent = argList[2];
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            var payment = (amount != null) ? amount : parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                if (payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
                    return; // fatal error ?
                }

            }
            else {
                if (balance <= 0) {
                    this.clear();

                    // @todo OSD
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this.subtotal();
                    return; // fatal error ?
                }

                if (payment == null || payment == 0 || isNaN(payment)) {
                    payment = balance;
                }
            }

            if (silent && type != '') {
                this.addPayment('coupon', payment, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this.getCouponDialog(data).next(function(evt){

                    var result = evt.data;

                    if(result.ok) {

                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';

                        self.addPayment('coupon', payment, payment, memo1, memo2);

                    }
                    else {
                        self.subtotal();
                    }
                });
            }
        },

        giftcard: function(args) {

            // args should be a list of up to 2 comma-separated parameters: type, amount
            var type = '';
            var amount;
            var silent = false;
            if (args != null && args != '') {
                var argList = args.split(',');
                type = argList[0];
                if (type == null) type = '';
                if (argList[1] != null && argList[1] != '' && !isNaN(argList[1])) amount = parseFloat(argList[1]);
                silent = argList[2];
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            var payment = (amount != null) ? amount : parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                if (payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
                    return; // fatal error ?
                }

            }
            else {
                if (balance <= 0) {
                    this.clear();

                    // @todo OSD
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this.subtotal();
                    return; // fatal error ?
                }

                if (payment == 0 || isNaN(payment)) {
                    payment = balance;
                }

                if (payment > balance) {
                    if (GREUtils.Dialog.confirm(null,
                        _('confirm giftcard payment'),
                        _('Change of [%S] will NOT be given for this type of payment. Proceed?',
                            [curTransaction.formatPrice(payment - balance)])) == false) {
                        GeckoJS.Session.remove('cart_set_price_value');
                        GeckoJS.Session.remove('cart_set_qty_value');

                        this.subtotal();
                        return; // fatal error ?
                    }
                }
                else {
                    balance = payment;
                }
            }
            if (silent && type != '') {
                this.addPayment('giftcard', balance, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this.getGiftcardDialog(data).next(function(evt){

                    var result = evt.data;

                    if(result.ok) {

                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';

                        self.addPayment('giftcard', balance, payment, memo1, memo2);

                    }
                    else {
                        self.subtotal();
                    }
                });
            }
        },

        check: function(type) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            var payment = parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                if (payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
                    return; // fatal error ?
                }

            }
            else {
                if (balance <= 0) {
                    this.clear();

                    // @todo OSD
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this.subtotal();
                    return; // fatal error ?
                }

                if (payment == null || payment == 0 || isNaN(payment)) {
                    payment = balance;
                }

                if (payment > balance) {

                    // check user's check cashing limit
                    var user = GeckoJS.Session.get('user');
                    var limit = 0;
                    if (user) {
                        limit = user.max_cash_check;
                    }
                    if (isNaN(limit)) limit = 0;

                    if (payment - balance > limit) {
                        // @todo OSD
                        GREUtils.Dialog.alert(window,
                            _('Check Payment Error'),
                            _('Check Cashing limit of [%S] exceeded', [curTransaction.formatPrice(limit)]));
                        GeckoJS.Session.remove('cart_set_price_value');
                        GeckoJS.Session.remove('cart_set_qty_value');

                        this.subtotal();
                        return; // fatal error ?
                    }
                }
            }

            var data = {
                type: type,
                payment: curTransaction.formatPrice(payment)
            };

            var self = this;

            return this.getCheckDialog(data).next(function(evt){

                var result = evt.data;

                if(result.ok) {

                    var memo1 = result.input0 || '';
                    var memo2 = result.input1 || '';

                    self.addPayment('check', payment, payment, memo1, memo2);

                }
                else {
                    self.subtotal();
                }
            });

        },

        ledgerEntry: function(inputObj) {

            var data = {};
            data.ledgerPayment = {};

            if (!inputObj) {
                var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
                inputObj = {}

                var ledgerEntryTypeModel = new LedgerEntryTypeModel();
                inputObj.entry_types = ledgerEntryTypeModel.find('all', {order: 'mode, type'});

                window.openDialog(aURL, _('Add New Ledger Entry'), features, inputObj);
            }

            if (!inputObj.ok) {
                return;
            }
            var ledgerController = GeckoJS.Controller.getInstanceByName('LedgerRecords');
            ledgerController.saveLedgerEntry(inputObj);

            // @todo OSD
            OsdUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                               [inputObj.type + (inputObj.description ? ' (' + inputObj.description + ')' : ''), inputObj.amount]))
        },

        addPayment: function(type, amount, origin_amount, memo1, memo2) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();
            var returnMode = this._returnMode;

            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            var paymentsTypes = GeckoJS.BaseObject.getKeys(curTransaction.getPayments());

            if (returnMode) {
                var err = false;
                if (paymentsTypes.length == 0) {
                    NotifyUtils.warn(_('No payment has been made; cannot register refund payment'));
                    err = true;
                }

                if (amount == null || amount == 0 || isNaN(amount)) {
                    // if amount no given, set amount to amount paid
                    amount = curTransaction.getPaymentSubtotal();
                }

                if (!err && amount > curTransaction.getPaymentSubtotal()) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed payment amount [%S]',
                        [curTransaction.formatPrice(amount), curTransaction.formatPrice(curTransaction.getPaymentSubtotal())]));
                    err = true;
                }

                if (err) {
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
                    return; // fatal error ?
                }
            }

            // add a total marker if no new items have been added since last total/subtotal marker
            // in other words, check if any item has hasMarker = false
            var transItems = curTransaction.getItems();
            var allMarked = true;
            for (var itemId in transItems) {
                if (!(allMarked = transItems[itemId].hasMarker)) {
                    break;
                }
            }
            if (!allMarked) {
                this.addMarker('total');
                //this._getCartlist().refresh();
            }
            
            type = type || 'cash';
            amount = amount || false;

            if(!amount) {
                // @todo default totalamount ?
                amount = curTransaction.getRemainTotal();
                if (amount < 0) amount = 0;
            }

            origin_amount = typeof origin_amount == 'undefined' ? amount : origin_amount;

            if (returnMode) {
                origin_amount = 0 - origin_amount;
                amount = 0 - amount;
            }

            var paymentItem = {
                type: type,
                amount: amount,
                origin_amount: origin_amount
            };
            
            this.dispatchEvent('beforeAddPayment', paymentItem);
            var paymentedItem = curTransaction.appendPayment(type, amount, origin_amount, memo1, memo2);

            paymentedItem.seq = curTransaction.data.seq;

            this.dispatchEvent('afterAddPayment', paymentedItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            // @todo auto submit ??
            this._getCartlist().refresh();
            if (curTransaction.getRemainTotal() <= 0) {
                this.submit();
            }else {
                this.subtotal();
            }
        },


        showPaymentStatus: function() {

            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                return; // fatal error ?
            }

            // if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var payments = curTransaction.getPayments();
            for (var key in payments) {
                var payment = payments[key];
                payment.amount = curTransaction.formatPrice(payment.amount);
                payment.name = _(payment.name.toUpperCase());
                payment.origin_amount = curTransaction.formatPrice(payment.origin_amount);
            }
            
            var dialog_data = [
            _('Payment Details'),
            payments
            ];

            return $.popupPanel('paymentDetailsPanel', dialog_data);

        },


        setQty: function(qty) {

            var qty0 = parseInt(qty, 10);
            GeckoJS.Session.set('cart_set_qty_value', qty0);
            this.dispatchEvent('onSetQty', qty0);
		
        },
	
        setPrice: function(price) {

            var newprice = parseFloat(price);
            GeckoJS.Session.set('cart_set_price_value', newprice);
            this.dispatchEvent('onSetPrice', newprice);

        },

        shiftTax: function(taxNo) {

            taxNo = taxNo || false;
          
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.clear();

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot shift tax'));

                this.subtotal();
                return; // fatal error ?
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and tax status may not be changed'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return; // fatal error ?
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Tax status may not be changed on stored items'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            if (itemTrans == null || itemTrans.type != 'item') {
                this.dispatchEvent('onShiftTaxError', {});
                //@todo OSD
                var displayItem = curTransaction.getDisplaySeqAt(index);
                NotifyUtils.warn(_('This operation cannot be performed on [%S]', [displayItem.name]));

                this.subtotal();
                return; // fatal error ?
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onShiftTaxError', {});
                //@todo OSD
                NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                this.subtotal();
                return; // fatal error ?
            }

            this.dispatchEvent('beforeShiftTax', itemTrans);


            if(taxNo && taxNo != 0 && taxNo != null) {
                var taxes = GeckoJS.Session.get('taxes');
                if(taxes == null) taxes = this.Tax.getTaxList();


                for (var taxIndex=0; taxIndex<taxes.length; taxIndex++) {
                    if(taxes[taxIndex].no == taxNo) break;
                }
                if(taxIndex == taxes.length) {
                    // not found
                    this.dispatchEvent('onShiftTaxError', {});
                    //@todo OSD
                    NotifyUtils.error(_('The tax status indicated does not exist [%S]', [taxNo]));

                    this.subtotal();
                    return; // fatal error ?
                }
            }


            var modifiedItem = curTransaction.shiftTax(index, taxIndex);

            this.dispatchEvent('afterShiftTax', modifiedItem);

            this.subtotal();

        },

        clear: function() {
            
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                this.dispatchEvent('onClear', null);
                return; // fatal error ?
            }

            this.dispatchEvent('onClear', curTransaction);

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this._cartView.empty();
                return ;
            }

        },

        cancel: function() {

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            // cancel cart but save
            var curTransaction = this._getTransaction();
            if(curTransaction == null) {
                
                this.clear();
                //@todo OSD - don't notify'
                //NotifyUtils.warn(_('Not an open order; nothing to cancel'));
                return; // fatal error ?
            }

            this.dispatchEvent('beforeCancel', curTransaction);
            
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this._cartView.empty();
                return ;
            }

            // if the order has been stored, then it cannot be cancelled; it must be voided instead
            if (curTransaction.data.recall == 2) {
                
                // determine if new items have been added
                if (!curTransaction.isModified() ||
                    GREUtils.Dialog.confirm(null, _('confirm cancel'),
                        _('Are you sure you want to discard changes made to this order?'))) {
                    curTransaction.process(-1, true);
                    this._cartView.empty();
                    this.dispatchEvent('onCancel', null);
                }
                else {
                    this.dispatchEvent('onCancel', curTransaction);
                    return;
                }
            }
            else {
                curTransaction.cancel();
            }
            
            // @todo save oldTransaction to log ??

            GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            if (curTransaction.data.recall != 2) {
                this.dispatchEvent('afterCancel', curTransaction);
            }
            this.dispatchEvent('onCancel', curTransaction);
        },
	
        subtotal: function() {
            var oldTransaction = this._getTransaction();
            this.cancelReturn();
            
            if (oldTransaction == null || oldTransaction.isCancel() || oldTransaction.isSubmit()) {
                this.dispatchEvent('onGetSubtotal', null);
            }
            else {
                this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
        },


        submit: function(status) {

            var oldTransaction = this._getTransaction();
            
            if(oldTransaction == null) return; // fatal error ?

            if (status == null) status = 1;
            if (status == 1 && oldTransaction.getRemainTotal() > 0) return;

            if (this.dispatchEvent('beforeSubmit', {status: status, txn: oldTransaction})) {
            
                oldTransaction.lockItems();

                // save order unless the order is being finalized (i.e. status == 1)
                if (status != 1) oldTransaction.submit(status);
                oldTransaction.data.status = status;
                this.dispatchEvent('afterSubmit', oldTransaction);

                // sleep to allow UI events to update
                //this.sleep(100);

                // GeckoJS.Session.remove('current_transaction');
                GeckoJS.Session.remove('cart_last_sell_item');
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                //this.dispatchEvent('onClear', 0.00);
                this._getKeypadController().clearBuffer();
                this.cancelReturn();

                // clear register screen if needed
                if (GeckoJS.Configure.read('vivipos.fec.settings.ClearCartAfterFinalization')) {
                    this._cartView.empty();
                }

                if (status != 2) {
                    if (status != 1) this.dispatchEvent('onWarning', '');
                    this.dispatchEvent('onSubmit', oldTransaction);
                }
                else
                    this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
            else {
                this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
        },


        // pre-finalize the order by closing it
        preFinalize: function(args) {
            var curTransaction = this._getTransaction();

            if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                NotifyUtils.warn(_('Not an open order; cannot pre-finalize order'));
                return;
            }

            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('The order is already pre-finalized'));
                return;
            }

            if (curTransaction.getItemsCount() == 0) {
                NotifyUtils.warn(_('The order is empty; cannot pre-finalize order'));
                return;
            }

            if (!this.dispatchEvent('beforePreFinalize', curTransaction)) {
                return;
            }

            // if destination is given, items in cart are first validated to make sure
            // their destinations match the given destination
            if (args != null && args != '') {
                
                var argList = args.split(',');
                var dest = argList[0];

                if (dest) {
                    if (curTransaction.data.destination != dest) {
                        if (GREUtils.Dialog.confirm(null, _('confirm destination'),
                                                    _('The order destination is different from [%S], proceed with pre-finalization?', [dest])) == false) {
                            return;
                        }
                    }

                    var mismatch = false;
                    var items = curTransaction.getItems();
                    for (var index in items) {
                        if (items[index].destination != dest) {
                            mismatch = true;
                            break;
                        }
                    }

                    if (mismatch) {
                        if (GREUtils.Dialog.confirm(null, _('confirm destination'),
                                                    _('Destinations other than [%S] found in the order, proceed with pre-finalization?', [dest])) == false) {
                            return;
                        }
                    }
                    curTransaction.data.destination = dest;
                }
                // prompts for additional annotation(s) (such as ID of deliver person)
                // if a single annotationType is specified, prompt using memo-style UI
                // if more than one annotationTypes are specified, prompt using full UI

                if (argList.length > 1) {
                    var annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
                    var annotationType;

                    if (argList.length == 2 && argList[1] != null && argList[1] != '') {
                        annotationType = annotationController.getAnnotationType(argList[1]);
                    }

                    // only one annotationType is specified and is not null, use memo-style UI
                    if (argList.length == 2 && annotationType != null && annotationType != '') {
                        var inputObj = {
                            input0: '',
                            require0:false,
                            multiline0: true
                        };

                        var data = [
                            _('Add Annotation'),
                            '',
                            _(annotationType),
                            '',
                            inputObj
                        ];

                        var self = this;
                        return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                            var result = evt.data;

                            if (result.ok && result.input0) {
                                if ('annotations' in curTransaction.data) {
                                    curTransaction.data.annotations.push({type: annotationType, text: result.input0});
                                }
                                else {
                                    curTransaction.data.annotations = [{type: annotationType, text: result.input0}];
                                }

                                // save annotation in db
                                annotationController.annotate(curTransaction.data.id, annotationType, result.input0);
                            }

                            curTransaction.close();
                            self.submit(2);
                            self.dispatchEvent('onWarning', _('PRE-FINALIZED'));

                            // dispatch onSubmit event here manually since submit() won't do it for us
                            self.dispatchEvent('onSubmit', curTransaction);

                            // @todo OSD
                            NotifyUtils.warn(_('Order# [%S] has been pre-finalized', [curTransaction.data.seq]));

                            this.dispatchEvent('afterPreFinalize', curTransaction);
                        });
                    }
                    else {
                        // multiple annotations are requested, use full UI
                        argList.splice(0, 1);
                        $do('AnnotateDialog', argList.join(','), 'Main');
                    }
                }

                // lastly, close the transaction and store the order to generate the
                // appropriate printouts
            }
            curTransaction.close();
            this.submit(2);
            this.dispatchEvent('onWarning', _('PRE-FINALIZED'));

            // dispatch onSubmit event here manually since submit() won't do it for us
            this.dispatchEvent('onSubmit', curTransaction);

            // @todo OSD
            NotifyUtils.warn(_('Order# [%S] has been pre-finalized', [curTransaction.data.seq]));

            this.dispatchEvent('afterPreFinalize', curTransaction);
        },

        cash: function(amount) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();
            
            if (buf.length>0) {
                if (!amount) amount = parseFloat(buf);
            }

            this.addPayment('cash', amount);
        },

        insertCondiment: function(params) {
            var argList = params.split(',');
            var condArray = [];

            if (argList.length > 0) {
                argList.forEach(function(arg) {
                    var parmList = arg.split('|');
                    var condName = parmList[0];
                    var condPrice = parmList[1] || 0;

                    if (condName != '' && !isNaN(condPrice)) {
                        condArray.push({name: condName, price: condPrice});
                    }
                });
            }

            if (condArray.length > 0) {
                this.addCondiment(null, condArray, true);
            }
        },

        addCondiment: function(plu, condiments, immediateMode) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add condiment'));
                return; // fatal error ?
            }

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                if (plu) {
                    curTransaction = this._newTransaction();
                }
                else {
                    //@todo OSD
                    NotifyUtils.warn(_('Not an open order; cannot add condiment'));
                    return;
                }
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this.subtotal();
                return;
            }

            var condimentItem = null;
            
            if (plu && plu.force_condiment) {
                condimentItem = plu;
            }else {
                var productsById = GeckoJS.Session.get('productsById');
                var cartItem = curTransaction.getItemAt(index);
                var setItem = curTransaction.getItemAt(index, true);
                if (cartItem == null || (cartItem.type != 'item' && cartItem.type != 'setitem')) {
                    var displayItem = curTransaction.getDisplaySeqAt(index);
                    //@todo OSD
                    NotifyUtils.warn(_('Condiments may not be added to [%S]', [displayItem.name]));
                    return;
                }
/*
                if (cartItem.current_qty < 0) {
                    var displayItem = curTransaction.getDisplaySeqAt(index);
                    //@todo OSD
                    NotifyUtils.warn(_('Condiments may not be added to a return item [%S]', [displayItem.name]));
                    return;
                }
*/
                if (cartItem.hasMarker) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot add condiments to an item that has been subtotaled'));
                    return;
                }
                if (cartItem.hasDiscount) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please void discount on item [%S] first', [cartItem.name]));
                    return;
                }
                if (cartItem.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please void surcharge on item [%S] first', [cartItem.name]));
                    return;
                }
                // xxxx why clone it ??
                //condimentItem = GREUtils.extend({}, productsById[cartItem.id]);
                condimentItem = productsById[setItem.id];

                // extract cartItem's selected condiments, if any
                if (setItem.condiments != null) {
                    for (var c in setItem.condiments) {
                        if (condiments == null) {
                            condiments = {};
                        }
                        condiments[c] = setItem.condiments[c];
                    }
                }
            }

            var d = new Deferred();
            if (condimentItem) {
                if(!condimentItem.cond_group && !immediateMode){
                    //@todo OSD
                    NotifyUtils.warn(_('No Condiment group associated with item [%S]', [condimentItem.name]));
                    return d;
                }
                else if (immediateMode && condiments) {
				    this._appendCondiments(condiments, false);
                }
                else {
                    return this.getCondimentsDialog(condimentItem.cond_group, condiments);
                }
                
            }

            return d;

        },

        getCondimentsDialog: function (condgroup, condiments) {

            var condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
            // not initial , initial again!
            if (!condGroupsByPLU) {
                try {
                    this.log('DEBUG', 'initital Condiments from Cart Controller ');
                    GeckoJS.Controller.getInstanceByName('Condiments').initial();
                    condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
                }catch(e) {}
            }

            var selectedItems = [];
            var conds = condGroupsByPLU[condgroup]['Condiments'];
            if (condiments == null) {
                //@irving filter out sold out condiments
                selectedItems = condGroupsByPLU[condgroup]['PresetItems'].filter(function(c) {return !conds[c].soldout});
            }else {
                // check item selected condiments
                var condNames = GeckoJS.BaseObject.getKeys(condiments);
                for (var i = 0; i < conds.length; i++) {
                    if (condNames.indexOf(conds[i].name) > -1) {
                        selectedItems.push(i);
                    }
                }
            }
            
            var dialog_data = {
                conds: conds,
                selectedItems: selectedItems,
                hideSoldout: GeckoJS.Configure.read('vivipos.fec.settings.HideSoldOutButtons') || false
            };
            var self = this;
            return $.popupPanel('selectCondimentPanel', dialog_data).next(function(evt){
                var selectedCondiments = evt.data.condiments;
                if (selectedCondiments.length > 0) {
                    self._appendCondiments(selectedCondiments, true);
                }

            });

        },

        _appendCondiments: function(selectedCondiments, replace) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction != null && index >=0) {

                // self.log(self.dump(curTransaction.data));

                var item = curTransaction.getItemAt(index, true);
                if (item) {

                    // expand condiments if collapsed

                    // get first condiment display item
                    var condDisplayIndex = curTransaction.getFirstCondimentIndex(item);
                    var condDisplayItem = curTransaction.getDisplaySeqAt(condDisplayIndex);
                    var collapseCondiments;

                    if (condDisplayItem && condDisplayItem.open) {
                        collapseCondiments = false;
                    }
                    else if (condDisplayItem) {
                        collapseCondiments = true;
                        curTransaction.expandCondiments(condDisplayIndex);
                    }
                    else {
                        collapseCondiments = GeckoJS.Configure.read('vivipos.fec.settings.collapse.condiments');
                    }

                    curTransaction.appendCondiment(index, selectedCondiments, replace);

                    condDisplayIndex = curTransaction.getFirstCondimentIndex(item);
                    condDisplayItem = curTransaction.getDisplaySeqAt(condDisplayIndex);
                    condDisplayItem.open = true;
                        
                    if (collapseCondiments) {
                        curTransaction.collapseCondiments(condDisplayIndex);

	                this._getCartlist().scrollToRow(0);			
	                this._getCartlist().treeBoxObject.ensureRowIsVisible(condDisplayIndex);			
                    }
                    this.dispatchEvent('afterAddCondiment', selectedCondiments);
                }
            }

            this.subtotal();
        },


        addMemo: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                NotifyUtils.warn(_('Not an open order; cannot add memo'));
                return; // fatal error ?
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this.subtotal();
                return;
            }

            var memoItem = null;
            
            if (typeof plu == 'object' && plu.force_memo) {
                memoItem = plu;
            }else {
                if (plu != null) plu = GeckoJS.String.trim(plu);
                var productsById = GeckoJS.Session.get('productsById');
                var cartItem = curTransaction.getItemAt(index);
                if (cartItem != null && cartItem.type == 'item') {
                    //xxxx why clone it? so we don't change the default memo
                    memoItem = GREUtils.extend({}, productsById[cartItem.id]);
                //memoItem = productsById[cartItem.id];
                }
                if (memoItem && plu != null && plu != '') memoItem.memo = plu;
            }

            var d = new Deferred();

            var memo;
            if (typeof plu == 'object' || plu == null || plu == '') {
                return this.getMemoDialog(memoItem ? memoItem.memo : '');
            }
            else {
                memo = GeckoJS.String.trim(plu);
                if (memo) curTransaction.appendMemo(index, memo);
            }           

            return d;

        },


        getAnnotationDialog: function (type) {

            var self = this;

            var inputObj = {
                input0: '',
                require0:false
            };

            var data = [
            _('Add Annotation'),
            '',
            _(type),
            '',
            inputObj
            ];

            return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                var result = evt.data;

                if (result.ok && result.input0) {
                    return result.input0;
                }
                else {
                    return null;
                }

            });

        },


        getMemoDialog: function (memo) {

            var self = this;

            var inputObj = {
                input0: memo,
                require0:false
            };

            var data = [
            _('Add Memo'),
            '',
            _('Memo'),
            '',
            inputObj
            ];

            return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                var result = evt.data;
                
                if (result.ok && result.input0) {

                    var index = self._cartView.getSelectedIndex();
                    var curTransaction = self._getTransaction();

                    if(curTransaction != null && index >=0) {

                        curTransaction.appendMemo(index, result.input0);
                    }

                }

            });

        },


        _hasUserQueue: function(user) {

            if (!user) return false;

            var queuePool = this._getQueuePool();

            var username = user.username;
            
            if(!queuePool.user[username] || queuePool.user[username].constructor.name != 'Array') {
                return false;
            } else {
                return (queuePool.user[username].length >0);
            }
           
        },

        _removeUserQueue: function(user) {

            if (!user) return false;

            var queuePool = this._getQueuePool();

            var username = user.username;

            if(!queuePool.user[username] || queuePool.user[username].constructor.name != 'Array') {
                return ;
            }

            var removeCount = 0;

            queuePool.user[username].forEach(function(key){

                // just delete queue
                if(queuePool.data[key]) delete queuePool.data[key];

                removeCount++;
                
            }, this);

            delete queuePool.user[username];

            return removeCount;

        },

        _removeQueueByKey: function(key) {

            var queuePool = this._getQueuePool();

            if (queuePool.data[key]) delete queuePool.data[key];
            
            for (var user in queuePool.user) {
                var userQueues = queuePool.user[user];

                var idx = GeckoJS.Array.inArray(key, userQueues);

                if (idx != -1) {
                    userQueues.splice(idx, 1);
                }
            }
            
        },

        pushQueue: function(nowarning) {
            
            var curTransaction = this._getTransaction();

            if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                //@todo OSD
                if (!nowarning) NotifyUtils.warn(_('No order to queue'));
                return; // fatal error ?
            }

            if (curTransaction.data.recall == 2) {
                if (!nowarning) NotifyUtils.warn(_('Cannot queue the recalled order!!'));
                return;
            }
            var user = this.Acl.getUserPrincipal();

            var count = curTransaction.getItemsCount();
            var key = '';
            var queuePool = this._getQueuePool();

            if (count > 0) {
                key = new Date().toString('hh:mm:ss') + ':' + user.username;
                
                // queue
                queuePool.data[key] = curTransaction.data;

                // update user queue status
                if(!queuePool.user[user.username]) queuePool.user[user.username] = [];
                queuePool.user[user.username].push(key);

                // only empty view ,
                // next added item will auto create new transaction
                curTransaction.emptyView();

                this._getKeypadController().clearBuffer();

                this.dispatchEvent('onQueue', curTransaction);

                GeckoJS.Session.remove('current_transaction');
                GeckoJS.Session.remove('cart_last_sell_item');
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

            }
            else {
                if (!nowarning) NotifyUtils.warn(_('Order is not queued because it is empty'));
                return;
            }
        
        },

        getQueueIdDialog: function () {

            var queuePool = this._getQueuePool();
            var queues = [];
            var confs = GeckoJS.Configure.read('vivipos.fec.settings');

            // check private queue
            if (confs.PrivateQueue) {
                var user = this.Acl.getUserPrincipal();
                if (user && user.username && queuePool.user[user.username]) {
                    queuePool.user[user.username].forEach(function(key) {
                        queues.push({
                            key: key
                        });
                    });
                }
            }
            else {
                for(var key in queuePool.data) {
                    queues.push({
                        key: key
                    });
                }
            }

            var dialog_data = {
                queues: queues,
                queuePool: queuePool
            };

            return $.popupPanel('selectQueuesPanel', dialog_data);

        },

        pullQueue: function(data) {

            var self = this;

            return this.getQueueIdDialog().next(function(evt){

                var result = evt.data;

                if (!result.ok) return;

                var key = result.key;
                var queuePool = self._getQueuePool();

                // if has transaction push queue
                self.pushQueue(true);

                var data = queuePool.data[key];

                // remove from list;
                self._removeQueueByKey(key);

                var curTransaction = new Transaction();
                curTransaction.data = data ;

                self._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);

                self.subtotal();

                self.dispatchEvent('afterPullQueue', curTransaction);
            });

        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id;

            var curTransaction = new Transaction();
            curTransaction.unserializeFromOrder(order_id);

            if (curTransaction.data.status == 2) {
                // set order status to process (0)
                curTransaction.data.status = 0;

                curTransaction.data.recall = 2;
            }

            this._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);
            this.subtotal();

        },

        newCheck: function() {
this.log("newCheck...");
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction = null;

            var r = -1;
            if (no.length == 0) {
                r = this.GuestCheck.getNewCheckNo();
            } else {
                r = this.GuestCheck.check(no);
            }
this.log("after newCheck..." + r);

            this.subtotal();
        },

        newTable: function() {
this.log("newTable...");
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction = null;

            var r = -1;
            if (no.length == 0) {
                r = this.GuestCheck.getNewTableNo();
            } else {
                r = this.GuestCheck.table(no);
            }
this.log("after newTable..." + r);

            this.subtotal();
        },

        recallOrder: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();
// recall order
            return this.GuestCheck.recallByOrderNo(no);
        },

        recallTable: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            return this.GuestCheck.recallByTableNo(no);
        },

        recallCheck: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            return this.GuestCheck.recallByCheckNo(no);
        },

        storeCheck: function() {
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return; // fatal error ?
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var r = -1;
            var modified = curTransaction.isModified();
            if (modified) {
                r = this.GuestCheck.store();
                this.dispatchEvent('onStore', curTransaction);

                this._getCartlist().refresh();
            }
            else {
                NotifyUtils.warn(_('No change to store'));
            }
        },

        guestNum: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return; // fatal error ?
            }

            if (curTransaction == null) {
                curTransaction = this._getTransaction(true);
                if (curTransaction == null) {
                    NotifyUtils.warn(_('fatal error!!'));
                    return; // fatal error ?
                }
            }

            var r = this.GuestCheck.guest(no);
            curTransaction.data.no_of_customers = no;

            this.subtotal();
        },

        mergeCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return; // fatal error ?
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
                // r = this.GuestCheck.store();
                // this.dispatchEvent('onStore', curTransaction);
            }

            // r = this.GuestCheck.transferToCheckNo(no);
            var r = this.GuestCheck.mergeOrder(no, curTransaction.data);
        },

        splitCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction;
            
            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return; // fatal error ?
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
                // r = this.GuestCheck.store();
                // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.splitOrder(no, curTransaction.data);
        },

        transferTable: function(){
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return; // fatal error ?
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
                // r = this.GuestCheck.store();
                // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.transferToTableNo(no);
        }
        
    };

    GeckoJS.Controller.extend(__controller__);
})();
