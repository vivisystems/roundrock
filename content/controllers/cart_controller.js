(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Cart',
        components: ['Tax', 'GuestCheck'],
        _cartView: null,
        _queuePool: null,
        _returnMode: false,
        _pluPanel: null,

        initial: function() {
            
            if (this._cartView == null ) {
                this._cartView = new NSICartView('cartList');
            }

            if (this._pluPanel == null) {
                this._pluPanel = document.getElementById('prodscrollablepanel');
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
                stock = parseFloat(product.stock);
                min_stock = parseFloat(product.min_stock);
                auto_maintain_stock = product.auto_maintain_stock;
                diff = qty - item.current_qty;
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
            var setItemsStockStatus = 1;
            var setItemsAgeVerificationRequired = 0;
            var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired');

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
            var txn = cart._getTransaction();
            if (positivePriceRequired && txn != null) {
                if (txn.checkSellPrice(item) <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be registered with a price of [%S]!', [item.name, txn.formatPrice(0)]));
                    evt.preventDefault();
                    return;
                }
            }

            // retrieve set menu items only if setmenu is set
            var setItems = [];
            if (item.setmenu != null && item.setmenu.length > 0) {
                // invoke Product controller to get
                setItems = GeckoJS.Controller.getInstanceByName('Plus')._setMenuFromString(item);
                for (var i = 0; i < setItems.length; i++) {
                    var product = productsById[setItems[i].item_id];
                    if (product && product.age_verification) {
                        setItemsAgeVerificationRequired = 1;
                        break;
                    }
                }
            }
            // check stock status...
            if ( !cart._returnMode) {
                // first check main item
                if (!cart.checkStock("addItem", sellQty, item)) evt.preventDefault();
                
                // if set items are present, check each one individually
                setItems.forEach(function(setitem) {
                    var product = productsById[setitem.item_id];
                    if (product) {
                        if (!cart.checkStock('addItem', sellQty * setitem.quantity, product, false)) {
                            evt.preventDefault();
                            return;
                        }
                        if (product.stock_status != null && product.stock_status != 1)
                            setItemsStockStatus = product.stock_status;
                    }
                });
            }
            else {
                // we don't allow return of set menus'
                if (setItems.length > 0 ) {
                    //@todo OSD
                    NotifyUtils.warn(_('Return of product sets [%S] not allowed!', [item.name]));
                    evt.preventDefault();
                }
            }

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
            }
        },

        beforeModifyItem: function(evt) {

            var itemDisplay = evt.data.itemDisplay;
            var itemTrans = evt.data.item;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var curTransaction = cart.transaction;

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

        addItem: function(plu) {


            var f = document.getElementById('functionPanelContainer');
            var v = document.getElementById('productPanelContainer');
            var n = document.getElementById('multinumberpad');
            //f.appendChild(v);

            if (this._suspended) return;
            
            var item = GREUtils.extend({}, plu);

            // not valid plu item.
            if (typeof item != 'object' || typeof item.id == 'undefined') {
                this.dispatchEvent('onAddItemError', {});
                return;
            }

            var curTransaction = this._getTransaction(true);

            if(curTransaction == null) {
                this.dispatchEvent('onAddItem', null);
                return; // fatal error ?
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

            // check if new item is the same as current item. if they are the same,
            // collapse it into the current item if no surcharge/discount/marker has
            // been applied to the current item and price/tax status are the same
            
            if (curTransaction) {
                var index = this._cartView.getSelectedIndex();
                var currentItem = curTransaction.getItemAt(index);
                var currentItemDisplay = curTransaction.getDisplaySeqAt(index);

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

            if (this.dispatchEvent('beforeAddItem', item)) {
                if ( this._returnMode) {
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

                // wrap with chain method
                next( function() {

                    if (addedItem.id == plu.id && !self._returnMode) {

                        return next( function() {

                            if (plu.force_condiment) {
                                return self.addCondiment(plu, null, doSIS);
                            }

                        }).next( function() {
				 
                            if (plu.force_memo) {
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

            this.cancelReturn();

            if(curTransaction == null) {
                this.dispatchEvent('onModifyItemError', null);

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify selected item [%S]', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            // check if user is allowed to modify condiment
            if (itemDisplay.type == 'condiment' && !this.Acl.isUserInRole('acl_modify_condiment_price')) {
                //@todo OSD
                NotifyUtils.warn(_('Not authorized to modify condiment'));

                this.subtotal();
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemDisplay.name]));

                this.subtotal();
                return;
            }

            if (itemDisplay.type == 'item' && GeckoJS.Session.get('cart_set_price_value') == null && GeckoJS.Session.get('cart_set_qty_value') == null && buf.length <= 0) {
                // @todo popup ??
                this.log('DEBUG', 'modifyItem but no qty / price set!! plu = ' + this.dump(itemTrans) );
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; no price or quantity entered'));
                return ;
            }

            if (itemDisplay.type == 'condiment' && buf.length <= 0 ) {
                // @todo popup ??
                this.log('DEBUG', 'modify condiment but price not set!! plu = ' + this.dump(itemTrans) );
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify condiment price; no price entered'));
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return ;
            }

            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
            }

            // check whether price or quantity or both are being modified
            var newPrice = GeckoJS.Session.get('cart_set_price_value');
            var newQuantity = GeckoJS.Session.get('cart_set_qty_value');
            var modifyPrice = false;
            var modifyQuantity = false;
            var modifyPrice = (newPrice != null && newPrice != itemTrans.current_price);
            var modifyQuantity = (newQuantity != null && newQuantity != itemTrans.current_qty);
            
            if (modifyPrice && !this.Acl.isUserInRole('acl_modify_price')) {
                NotifyUtils.warn(_('Not authorized to modify price'));

                this.subtotal();
                return;
            }

            if (modifyQuantity && !this.Acl.isUserInRole('acl_modify_quantity')) {
                NotifyUtils.warn(_('Not authorized to modify quantity'));

                this.subtotal();
                return;
            }
            
            // check if zero preset price is allowed
            // @todo
            var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired') || false;

            if (positivePriceRequired && curTransaction != null) {
                if (curTransaction.checkSellPrice(itemTrans) <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be modified with a price of [%S]!', [itemTrans.name, curTransaction.formatPrice(0)]));
                    GeckoJS.Session.remove('cart_set_price_value');
                    GeckoJS.Session.remove('cart_set_qty_value');

                    this.subtotal();
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
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
			
        },
	

        modifyQty: function(action, delta) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            if(curTransaction == null) {
                this.dispatchEvent('onModifyQty', null);

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));

                this.subtotal();
                return;
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));

                this.subtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item') {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify selected item [%S]', [itemDisplay.name]));

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
                this.setQty(newQty);
                this.modifyItem();
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Quantity may not be less than 1'));

                this.subtotal();
                return;
            }
            
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

            if(curTransaction == null) {
                this.dispatchEvent('onVoidItem', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot VOID'));

                this.subtotal();
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.dispatchEvent('onVoidItemError', {});
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot VOID'));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

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
                if(itemTrans.hasMarker) {
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

        addDiscountByNumber: function(amount) {
            // shorcut
            var discountAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!discountAmount && buf.length>0) {
                discountAmount = buf;
            }

            this.addDiscount(discountAmount, '$', '-');
        },

        addDiscountByPercentage: function(amount) {
            // shortcut
            var discountAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!discountAmount && buf.length>0) {
                discountAmount = buf;
            }

            this.addDiscount(discountAmount, '%', '-' + discountAmount + '%', false);
        },


        addPretaxDiscountByPercentage: function(amount) {
            // shortcut
            var discountAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!discountAmount && buf.length>0) {
                discountAmount = buf;
            }

            this.addDiscount(discountAmount, '%', '-' + discountAmount + '%', true);
        },


        addDiscount: function(discountAmount, discountType, discountName, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddDiscount', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add discount'));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item'));
                
                this.subtotal();
                return;
            }

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add discount'));

                this.subtotal();
                return;
            }

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

        addSurchargeByNumber: function(amount) {
            // shorcut
            var surchargeAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!surchargeAmount && buf.length>0) {
                surchargeAmount = buf;
            }

            this.addSurcharge(surchargeAmount, '$', '+', false);
        },

        addSurchargeByPercentage: function(amount) {
            // shortcut
            var surchargeAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!surchargeAmount && buf.length>0) {
                surchargeAmount = buf;
            }

            this.addSurcharge(surchargeAmount, '%', '+' + surchargeAmount + '%', false);
        },


        addPretaxSurchargeByPercentage: function(amount) {
            // shortcut
            var surchargeAmount = (amount == '') ? false : amount;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if (!surchargeAmount && buf.length>0) {
                surchargeAmount = buf;
            }

            this.addSurcharge(surchargeAmount, '%', '+' + surchargeAmount + '%', true);
        },



        addSurcharge: function(surchargeAmount, surchargeType, name, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddSurcharge', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));

                this.subtotal();
                return;
            }

            if(index < 0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            surchargeAmount = surchargeAmount || false;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));

                this.subtotal();
                return;
            }

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

            //var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddMarker', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; operation invalid'));

                this.subtotal();
                return;
            }

            //if(index <0) return;

            type = type || 'subtotal';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                NotifyUtils.warn(_('Not an open order; operation invalid'));

                this.subtotal();
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; operation invalid'));

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

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onHouseBon', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register House Bon'));

                this.subtotal();
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register House Bon'));

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

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return;
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

        creditCard: function(mark) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            var data = {
                type: mark,
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

            });

        },

        coupon: function(type) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            var payment = parseFloat(buf);
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
                if (payment == null || payment == 0 || isNaN(payment)) {
                    payment = curTransaction.getRemainTotal();
                }
            }
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
            });

        },

        giftcard: function(type) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
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
            }

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
            });

        },

        check: function(type) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
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
            });

        },

        accounting: function(inputObj) {
            // @todo Accounting IN/OUT

            var data = {};
            data.accountPayment = {};

            if (!inputObj) {
                var aURL = "chrome://viviecr/content/prompt_addaccount.xul";
                var features = "chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500";
                var inputObj = {
                    input0:null,
                    input1:null,
                    topics:null
                };

                var accountTopic = new AccountTopicModel();
                inputObj.topics = accountTopic.find('all');

                window.openDialog(aURL, "prompt_addaccount", features, inputObj);
            }

            if (!inputObj.ok) {
                return;
            }

            if (inputObj.type == "IN") {
                data.total = inputObj.amount;
                data.status = 101; // Accounting IN
            } else {
                data.total = inputObj.amount * (-1);
                data.status = 102; // Accounting OUT
            }
            
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                data.service_clerk = user.username;
            }

            data.accountPayment['order_items_count'] = 1;
            data.accountPayment['order_total'] = data.total;
            data.accountPayment['amount'] = data.total;
            data.accountPayment['name'] = 'accounting'; // + payment type
            data.accountPayment['memo1'] = inputObj.topic + "-" + _(inputObj.type); // + topic + topic type
            data.accountPayment['memo2'] = inputObj.description; // description
            data.accountPayment['change'] = 0;

            data.accountPayment['service_clerk'] = data.service_clerk;
            // data.orderPayment['proceeds_clerk'] = data.proceeds_clerk;
            // data.orderPayment['service_clerk_displayname'] = data.service_clerk_displayname;
            // data.orderPayment['proceeds_clerk_displayname'] = data.proceeds_clerk_displayname;

            var order = new OrderModel();
            order.saveAccounting(data);

            return data;
        },

        addPayment: function(type, amount, origin_amount, memo1, memo2) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            if (this._returnMode) {
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

            if (paymentsTypes.length == 0) {
                this.addMarker('total');
            }
            type = type || 'cash';
            amount = amount || false;

            if(!amount) {
                // @todo default totalamount ?
                amount = curTransaction.getRemainTotal();
                if (amount < 0) amount = 0;
            }

            origin_amount = typeof origin_amount == 'undefined' ? amount : origin_amount;

            if (this._returnMode) {
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

            this.dispatchEvent('afterAddPayment', paymentedItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            // @todo auto submit ??
            if (curTransaction.getRemainTotal() <= 0) {
                this.submit();
            }else {
                this.subtotal();
            }

        },


        showPaymentStatus: function() {

            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.dispatchEvent('onShowPaymentStatus', null);
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

            if(curTransaction == null) {
                this.dispatchEvent('onShiftTax', null);
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot shift tax'));

                this.subtotal();
                return; // fatal error ?
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));

                this.subtotal();
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot shift tax'));

                this.subtotal();
                return; // fatal error ?
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
                
                this.dispatchEvent('onCancel', null);
                //@todo OSD - don't notify'
                //NotifyUtils.warn(_('Not an open order; nothing to cancel'));
                return; // fatal error ?
            }

            this.dispatchEvent('beforeCancel', curTransaction);
            
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this._cartView.empty();
                return ;
            }

            // if the order has been stored, then check if the customer is owed any refund
            var orderModel = new OrderModel();
            var order = orderModel.findById(curTransaction.data.id);
            if (order != null && order.status == 2) {
                var payment = curTransaction.getPaymentSubtotal();
                if (payment == 0) {
                    if (GREUtils.Dialog.confirm(null, _('confirm cancel'), _('Do you really want to cancel this stored order?')) == false) {
                        this.subtotal();
                        return;
                    }
                }
                else if (payment > 0) {
                    if (GREUtils.Dialog.confirm(null, _('confirm cancel'),
                                                _('A total payment of [%S] has been received on this order, do you really want to cancel it without refunding the customer?', [curTransaction.formatPrice(payment)])) == false) {
                        this.subtotal();
                        return;
                    }
                }
                else {
                    if (GREUtils.Dialog.confirm(null, _('confirm cancel'),
                                                _('A total credit of [%S] has been given on this order, do you really want to cancel it?', [curTransaction.formatPrice(payment)])) == false) {
                        this.subtotal();
                        return;
                    }
                }
            }

            curTransaction.cancel();
            // @todo save oldTransaction to log ??

            GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.dispatchEvent('afterCancel', curTransaction);
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

            // cancel cart but save
            var oldTransaction = this._getTransaction();
            
            if(oldTransaction == null) return; // fatal error ?

            if (status == 1 && oldTransaction.getRemainTotal() > 0) return;

            this.dispatchEvent('beforeSubmit', oldTransaction);
            
            // save order unless the order is being finalized (i.e. status == 1)
            if (status != 1) oldTransaction.submit(status);
            oldTransaction.status = status;

            this.dispatchEvent('afterSubmit', oldTransaction);

            // sleep to allow UI events to update
            this.sleep(100);
            
            // GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            //this.dispatchEvent('onClear', 0.00);
            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if (status != 2) {
                this.dispatchEvent('onWarning', '');
                this.dispatchEvent('onSubmit', oldTransaction);
            }
            else
                this.dispatchEvent('onGetSubtotal', oldTransaction);
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

        addCondiment: function(plu, condiments, forceModal) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add condiment'));
                return; // fatal error ?
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
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
                if (cartItem.current_qty < 0) {
                    var displayItem = curTransaction.getDisplaySeqAt(index);
                    //@todo OSD
                    NotifyUtils.warn(_('Condiments may not be added to a return item [%S]', [displayItem.name]));
                    return;
                }
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
            }

            var d = new Deferred();
            if (condimentItem) {
                if(!condimentItem.cond_group){
                    //@todo OSD
                    NotifyUtils.warn(_('No Condiment group associated with item [%S]', [condimentItem.name]));
                    return d;
                }
                else {
                    return this.getCondimentsDialog(condimentItem.cond_group, condiments, forceModal);
                }
                
            }

            return d

        },

        getCondimentsDialog: function (condgroup, condiments, forceModal) {

            if (condiments == null) {
                var condGroups = GeckoJS.Session.get('condGroups');
                if (!condGroups) {
                    var condGroupModel = new CondimentGroupModel();
                    var condGroups = condGroupModel.find('all', {
                        recursive: 2
                    });
                    GeckoJS.Session.add('condGroups', condGroups);
                    condGroups = GeckoJS.Session.get('condGroups');
                }

                var i = -1;
                var index = -1;

                for each (var o in condGroups) {
                    //condGroups.forEach(function(o) {
                    i++;
                    if (o.id == condgroup) {
                        index = i
                        break;
                    }
                }

                if (typeof condGroups[index] == 'undefined') return null;

                var conds = condGroups[index]['Condiment'];
                var selectedItems = [];

                if (conds != null) {
                    for (var i = 0; i < conds.length; i++) {
                        if (conds[i].preset) selectedItems.push(i);
                    }
                }
            }

            var dialog_data = {conds: conds, selectedItems: selectedItems};

            var self = this;
            return $.popupPanel('selectCondimentPanel', dialog_data).next(function(evt){
                var selectedCondiments = evt.data;
                if (selectedCondiments.length > 0) {
				
                    var index = self._cartView.getSelectedIndex();
                    var curTransaction = self._getTransaction();

                    if(curTransaction != null && index >=0) {
                        curTransaction.appendCondiment(index, selectedCondiments);
                        self.dispatchEvent('afterAddCondiment', selectedCondiments);
                    }
				    
                    self.subtotal();
                }

            });

        },


        addMemo: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; cannot add memo'));
                return; // fatal error ?
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                NotifyUtils.warn(_('Not an open order; cannot add memo'));
                return; // fatal error ?
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

        pushQueue: function(warn) {

            if (warn == null) warn = true;

            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                //@todo OSD
                if (warn) NotifyUtils.warn(_('No open order to push'));
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                if (warn) NotifyUtils.warn(_('No open order to queue'));
                return;
            }

            if (curTransaction.data.recall == 2) {
                if (warn) NotifyUtils.warn(_('Can not queue the recalled order!!'));
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
                if (warn) NotifyUtils.warn(_('Order is not queued because it is empty'));
                return;
            }
        
        },

        getQueueIdDialog: function () {

            var queuePool = this._getQueuePool();
            var queues = [];
            var confs = GeckoJS.Configure.read('vivipos.fec.settings');
            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

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
                self.pushQueue(false);

                var data = queuePool.data[key];

                // remove from list;
                self._removeQueueByKey(key);

                var curTransaction = new Transaction();
                curTransaction.data = data ;

                self._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);

                self.subtotal();

            });

        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id || '04de7be5-9969-4756-8852-6f6eed2301a8';

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

        guestCheck: function(action) {
            // check if has buffer
            
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            var curTransaction = this._getTransaction(true);

            if(curTransaction == null) {
                // this.dispatchEvent('onAddItem', null);
                NotifyUtils.warn(_('fatal error!!'));
                return; // fatal error ?
            }

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                curTransaction = this._newTransaction();
            }

            var param = action.split('|');
            var action = param[0];
            var param2 = param[1];

            var no = buf;

            var r = -1;

            switch(action) {
                case 'newCheck':
                    if (buf.length == 0) {
                        r = this.GuestCheck.getNewCheckNo();
                    } else {
                        r = this.GuestCheck.check(no);
                    }

                    if (r >= 0) {
                        curTransaction.data.check_no = r;
                    } else {
                        NotifyUtils.warn(_('Check# %S is exist!!', [no]));
                    }
                    break;
                case 'releaseCheck':
                    r = this.GuestCheck.releaseCheckNo(no);
                    break;
                case 'newTable':
                    if (buf.length == 0) {
                        r = this.GuestCheck.getNewTableNo();
                    } else {
                        r = this.GuestCheck.table(no);
                    }

                    if (r >= 0) {
                        curTransaction.data.table_no = r;
                    } else {
                        NotifyUtils.warn(_('Table# %S is exist!!', [no]));
                    }
                    break;
                case 'guest':
                    r = this.GuestCheck.guest(no);
                    curTransaction.data.no_of_customers = no;
                    break;
                case 'destination':
                    r = this.GuestCheck.destination(param2);
                    curTransaction.data.destination = param2;
                    break;
                case 'store':
                    if (curTransaction.data.status == 1) {
                        NotifyUtils.warn(_('This order has been submited!!'));
                    } else {
                        r = this.GuestCheck.store(curTransaction.data.items_count);
                    }
                    break;
                case 'recallSequence':
                    r = this.GuestCheck.recallByOrderNo(no);
                case 'recallCheck':
                    r = this.GuestCheck.recallByCheckNo(no);
                    break;
                case 'recallTable':
                    r = this.GuestCheck.recallByTableNo(no);
                    break;
            }
            // @irving: comment out the subtotal() call 02-16-09
            //this.subtotal();
            
            return;
        }
    });
})();