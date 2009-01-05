(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Cart',
        components: ['Tax'],
        _cartView: null,
        _queuePool: null,
        _returnMode: false,

        initial: function() {
            
            if (this._cartView == null ) {
                this._cartView = new NSICartView('cartList');
            }

            self = this;
            var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
            keypad.addEventListener('beforeAddBuffer', self.beforeAddBuffer);

            this.addEventListener('beforeAddItem', self.beforeAddItem);

            // var curTransaction = this._getTransaction();
            // curTransaction.events.addListener('beforeAppendItem', obj, this);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

        },

        beforeAddBuffer: function () {

            self = this;
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

        checkStock: function(action, qty, item) {
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

                if (!auto_maintain_stock) return true;

                var item_count = 0;
                var curTransaction = cart._getTransaction(true);
                try {
                    item_count = (curTransaction.data.items_summary[item.id]).qty_subtotal;
                } catch (e) {};

                if ((diff + item_count) > stock) {
                    cart.dispatchEvent('onLowStock', obj);
                    cart.dispatchEvent('onWarning', _('OUT OF STOCK'));
                    //@todo add OSD?
                    NotifyUtils.warn(_('[%S] may be out of stock!', [item.name]));

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
                    cart.dispatchEvent('onLowerStock', obj);
                    cart.dispatchEvent('onWarning', _('STOCK LOW'));

                    //@todo add OSD?
                    NotifyUtils.warn(_('[%S] low stock threshold reached!', [item.name]));
                    item.stock_status = 0;
                } else {
                    // normal
                    cart.dispatchEvent('onWarning', '');
                    item.stock_status = 1;
                }
                return true;

        },

        beforeAddItem: function (evt) {
            var item = evt.data;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            // cart.log('Item:' + cart.dump(item));

            var sellQty = null, sellPrice = null;

            sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
            if (sellQty == null) sellQty = 1;

            sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

            // check stock status...
            if ( !cart._returnMode) {
                if (!cart.checkStock("addItem", sellQty, item)) evt.preventDefault();
            }

            // check if age verification required
            if ( !evt._cancel) {
                if (item.age_verification) {
                    var obj = { item: item };

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
            }
        },
        
        _newTransaction: function() {
            var curTransaction = new Transaction();
            curTransaction.create();
            this._setTransactionToView(curTransaction);

            // check pricelevel schedule
            this.requestCommand('schedule', null, 'Pricelevel');

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

            if (this.dispatchEvent('beforeAddItem', item)) {
                if ( this._returnMode) {
                    var qty = 0 - (GeckoJS.Session.get('cart_set_qty_value') || 1);
                    GeckoJS.Session.set('cart_set_qty_value', qty);
                }

                var addedItem = curTransaction.appendItem(item);

                this.dispatchEvent('onAddItem', addedItem);

                GeckoJS.Session.remove('cart_set_price_value');
                GeckoJS.Session.remove('cart_set_qty_value');

                this.dispatchEvent('afterAddItem', addedItem);

                if (addedItem.id == plu.id && !this._returnMode) {
                    if (plu.force_condiment) {
                        this.addCondiment(plu);
                    }
                    if (plu.force_memo) {
                        this.addMemo(plu);
                    }
                }
            }

            // fire getSubtotal Event ?????????????
            this._returnMode = false;

            // single item sale?
            if (plu.single && curTransaction.data.items_count == 1) {
                this.dispatchEvent('onWarning', _('SINGLE ITEM SALE'));
                this.addPayment('cash');
            }
            else {
                this.subtotal();
            }
            
        },
	
        addItemByBarcode: function(barcode) {
            
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
            this.dispatchEvent('afterItemByBarcode', event);
        },
	
        modifyItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            if(curTransaction == null) {
                this.dispatchEvent('onModifyItem', null);

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));
                return; // fatal error ?
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify selected item [%S]', [itemDisplay.name]));
                return;
            }

            if (itemDisplay.type == 'condiment' && !this.Acl.isUserInRole('acl_modify_condiment_price')) {
                //@todo OSD
                NotifyUtils.warn(_('Not authorized to modify condiment price'));
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));
                return;
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemDisplay.name]));
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
                NotifyUtils.warn(_('Cannot modify condiment; no price entered'));
                return ;
            }

            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
            }

            // check if stock is lower or over
            if (itemDisplay.type == 'item') {
                var qty = null;
                qty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : qty;
                if (!this.checkStock("modifyItem", qty, itemTrans)) {
                    return ;
                }
            }

            this.dispatchEvent('beforeModifyItem', itemTrans);

            var modifiedItem = curTransaction.modifyItemAt(index);

            this.dispatchEvent('afterModifyItem', modifiedItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
			
        },
	

        modifyQty: function(action) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            if(curTransaction == null) {
                this.dispatchEvent('onModifyQty', null);

                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));
                return; // fatal error ?
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot modify'));
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item') {
                this.dispatchEvent('onModifyItemError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify selected item [%S]', [itemDisplay.name]));
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge || itemTrans.hasMarker) {
                this.dispatchEvent('onmodifyQtyError', {});

                //@todo OSD
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));
                return;
            }

            var qty = itemTrans.current_qty;
            var newQty = qty + 0;
            
            switch(action) {
                case 'plus':
                    newQty = (qty+1);
                    break;
                case 'minus':
                    newQty = ((qty-1) >0) ? (qty-1) : qty;
                    break;
            }
            if (newQty != qty) {
                this.setQty(newQty);
                this.modifyItem();
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Quantity may not be less than 1'));
            }
            
        },

        returnItem: function(cancel) {

            if (cancel || this._returnMode) {
                if (this._returnMode && !cancel) {
                    this._getKeypadController().clearBuffer();
                    this.subtotal();
                }
                this._returnMode = false;
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
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.dispatchEvent('onVoidItemError', {});
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot VOID'));
                return;
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));
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
                    return ;
                }
            }

            itemTrans = curTransaction.getItemAt(index);
            if (itemTrans) {
                if(itemTrans.hasMarker) {
                    // @todo OSD
                    this.dispatchEvent('onVoidItemError', {});
                    NotifyUtils.warn(_('Cannot VOID an item that has been subtotaled'));
                    return ;
                }
            }

            this.dispatchEvent('beforeVoidItem', itemTrans);

            var voidedItem = curTransaction.voidItemAt(index);

            this.dispatchEvent('afterVoidItem', voidedItem);

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

            if (!discountAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the discount amount'));
                return;
            }
            else {
                this.addDiscount(discountAmount, '$', '-');
            }
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

            if (!discountAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the discount percentage first'));
                return;
            }
            else {
                this.addDiscount(discountAmount, '%', '-' + discountAmount + '%', false);
            }
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

            if (!discountAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the discount percentage'));
                return;
            }
            else {
                this.addDiscount(discountAmount, '%', '-' + discountAmount + '%', true);
            }
        },


        addDiscount: function(discountAmount, discountType, discountName, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddDiscount', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add discount'));
                return; // fatal error ?
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item'));
                
                return;
            }

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (pretax && itemDisplay.type != 'subtotal') {
                // @todo OSD
                NotifyUtils.warn(_('Pretax discount can only be registered against subtotals'));
                return;
            }

            if (itemTrans != null && itemTrans.type == 'item') {
                if (itemTrans.hasDiscount) {
                    this.log('already hasDiscount');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    this.log('already hasSurcharge');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('already hasMarker');
                    this.dispatchEvent('onAddDiscountError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));
                    return;
                }
                if (itemTrans.current_qty < 0) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot register discount on return items'));
                    return;
                }
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemDisplay.name]));
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemDisplay.name]));
                    return;
                }
                else if (index < cartLength - 1) {
                    this.dispatchEvent('onAddDiscountError', {});

                    // @todo OSD
                    NotifyUtils.warn(_('Cannot apply discount to [%S]. It is not the last registered item', [itemDisplay.name]));
                    return ;
                }
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Discount may not be added to [%S]', [itemDisplay.name]));
                return;
            }

            if(!discountAmount) {
                this.dispatchEvent('onAddDiscountError', {});

                //@todo OSD
                NotifyUtils.warn(_('Please enter the discount amount or percentage'));
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

            this.log('beforeAddDiscount ' + this.dump(discountItem) );
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItem = curTransaction.appendDiscount(index, discountItem);

            this.log('afterAddDiscount ' + index + ','+ this.dump(discountItem) );
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

            if (!surchargeAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the surcharge amount first'));
                return;
            }
            else {
                this.addSurcharge(surchargeAmount, '$', '+', false);
            }
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

            if (!surchargeAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the surcharge percentage'));
                return;
            }
            else {
                this.addSurcharge(surchargeAmount, '%', '+' + surchargeAmount + '%', false);
            }
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

            if (!surchargeAmount) {
                // @todo OSD
                NotifyUtils.warn(_('Please enter the surcharge percentage'));
                return;
            }
            else {
                this.addSurcharge(surchargeAmount, '%', '+' + surchargeAmount + '%', true);
            }
        },



        addSurcharge: function(surchargeAmount, type, name, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddSurcharge', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));
                return; // fatal error ?
            }

            if(index < 0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            surchargeAmount = surchargeAmount || false;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);
            
            if (pretax && itemDisplay.type != 'subtotal') {
                // @todo OSD
                NotifyUtils.warn(_('Pretax surcharge can only be registered against subtotals'));
                return;
            }
            if (itemTrans != null && itemTrans.type == 'item') {

                if (itemTrans.hasDiscount) {
                    this.log('already hasDiscount');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    this.log('already hasSurcharge');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('already hasMarker');
                    this.dispatchEvent('onAddSurchargeError', {});

                    //@todo OSD
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));
                    return;
                }
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemDisplay.name]));
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemDisplay.name]));
                    return;
                }
                else if (index < cartLength - 1) {
                    this.dispatchEvent('onAddSurchargeError', {});

                    // @todo OSD
                    NotifyUtils.warn(_('Cannot apply surcharge to [%S]. It is not the last registered item', [itemDisplay.name]));
                    return ;
                }
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('Surcharge may not be added to [%S]', [itemDisplay.name]));
                return;
            }

            // check percentage or fixed number
            if(type == '%') {
                // percentage
                surchargeAmount = parseFloat(surchargeAmount) / 100;

            }else {
                // fixed number
                surchargeAmount = parseFloat(surchargeAmount);

            }
            var surchargeItem = {
                name: name,
                type: type,
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
                return; // fatal error ?
            }

            //if(index <0) return;

            type = type || 'subtotal';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                NotifyUtils.warn(_('Not an open order; operation invalid'));
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; operation invalid'));
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
        },


        houseBon: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();
            
            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onHouseBon', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register House Bon'));
                return; // fatal error ?
            }

            if(index <0) {
                // @todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register House Bon'));
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemTrans != null && itemTrans.type == 'item') {

                var discountAmount =  itemTrans.current_subtotal;
                this.addDiscount(discountAmount, '$', 'House Bon');
            }
            else {
                //@todo OSD
                NotifyUtils.warn(_('House Bon may not be applied to [%S]', [itemDisplay.name]));
                return;
            }

        },

        currencyConvert: function(convertCode) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();
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
                return;
            }

            if (buf.length>0 && currencies && currencies.length > convertIndex) {
                var amount = parseFloat(buf);
                var origin_amount = amount;
                // currency convert array
                var currency_rate = currencies[convertIndex].currency_exchange;
                var memo1 = currencies[convertIndex].currency + ':' + amount;
                var memo2 = 'x' + currency_rate;
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

            }
        },

        getCreditCardDialog: function (data) {
            var aURL = 'chrome://viviecr/content/creditcard_remark.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=400';
            var inputObj = {
                input0:data.type,
                input1:null
            };
            window.openDialog(aURL, _('Credit Card Remark'), features, _('Credit Card Remark'), _('Payment') + ' [' + data.payment + ']',
                _('Card Type'), _('Card Remark'), inputObj);

            if (inputObj.ok) {
                return inputObj;
            }else {
                return null;
            }
        },

        getGiftCardDialog: function (data) {
            var aURL = 'chrome://viviecr/content/giftcard_remark.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=400';
            var inputObj = {
                input0:data.type,
                input1:null
            };
            window.openDialog(aURL, _('Gift Card Remark'), features, _('Gift Card Remark'), _('Payment') + ' [' + data.payment + ']',
                _('Card Type'), _('Card Remark'), inputObj);

            if (inputObj.ok) {
                return inputObj;
            }else {
                return null;
            }
        },

        creditCard: function(mark) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return;
            }
            
            var payment = parseFloat(buf);
            if (payment == 0 || isNaN(payment)) {
                //@todo OSD
                //NotifyUtils.warn(_('Please enter an amount first'));
                //return;
                payment = curTransaction.getRemainTotal(true);
            }
            var data = {
                type: mark,
                payment: payment
            };
            var inputObj = this.getCreditCardDialog(data);
            if (inputObj) {
                var memo1 = inputObj.input0 || '';
                var memo2 = inputObj.input1 || '';
                this.addPayment('creditcard', payment, payment, memo1, memo2);
            }
            //this.clear();

        },

        giftCard: function(mark) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this.cancelReturn();

            // check if order is open
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return;
            }

            var payment = parseFloat(buf);
            if (payment == 0 || isNaN(payment)) {
                //@todo OSD
                //NotifyUtils.warn(_('Please enter an amount first'));
                //return;
                payment = curTransaction.getRemainTotal(true);
            }
            var data = {
                type: mark,
                payment: payment
            };
            var inputObj = this.getGiftCardDialog(data);
            if (inputObj) {
                var memo1 = inputObj.input0 || '';
                var memo2 = inputObj.input1 || '';
                this.addPayment('giftcard', payment, payment, memo1, memo2);
            }
            //this.clear();

        },

        addPayment: function(type, amount, origin_amount, memo1, memo2) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);

                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return; // fatal error ?
            }

            //if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot register payments'));
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot register payments'));
                return;
            }

            // check if first time payment
            var paymentsTypes = GeckoJS.BaseObject.getKeys(curTransaction.getPayments());
            if (paymentsTypes.length == 0) {
                this.addMarker('total');
            }

            type = type || 'cash';
            amount = amount || false;

            if(!amount) {
                // @todo default totalamount ?
                amount = curTransaction.getRemainTotal();
            }

            origin_amount = typeof origin_amount == 'undefined' ? amount : origin_amount;

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
            var statusStr = '';

            for(var idx in payments) {
                var payment = payments[idx];

                statusStr += payment.name + '  =  ' + payment.amount + '\n';
                statusStr += '    memo1: ' + (payment.memo1||'') + ' , memo2: ' + (payment.memo2||'') + '\n\n';
            }

            alert(statusStr);
        },


        setQty: function(qty) {

            var qty0 = parseInt(qty);
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
                return; // fatal error ?
            }

            if(index <0) {
                //@todo OSD
                NotifyUtils.warn(_('Please select an item first'));
                return;
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; cannot shift tax'));
                return; // fatal error ?
            }

            var itemTrans = curTransaction.getItemAt(index);
            if (itemTrans == null || itemTrans.type != 'item') {
                this.dispatchEvent('onShiftTaxError', {});
                //@todo OSD
                var displayItem = curTransaction.getDisplaySeqAt(index);
                NotifyUtils.warn(_('This operation cannot be performed on [%S]', [displayItem.name]));
                return;
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onShiftTaxError', {});
                //@todo OSD
                NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));
                return;
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
                    return;
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
                //@todo OSD
                NotifyUtils.warn(_('Not an open order; nothing to cancel'));
                return; // fatal error ?
            }

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this._cartView.empty();
                return ;
            }

            curTransaction.cancel();
            // @todo save oldTransaction to log ??

            GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.dispatchEvent('onCancel', curTransaction);
            
        },
	
        subtotal: function() {

            var oldTransaction = this._getTransaction();
            this.cancelReturn();

            this.dispatchEvent('onGetSubtotal', oldTransaction);
            
        },


        submit: function() {

            // cancel cart but save
            var oldTransaction = this._getTransaction();
            
            if(oldTransaction == null) return; // fatal error ?

            if (oldTransaction.getRemainTotal() > 0) return;
            oldTransaction.submit();

            // GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            //this.dispatchEvent('onClear', 0.00);
            this._getKeypadController().clearBuffer();
            this.cancelReturn();

            this.dispatchEvent('onSubmit', oldTransaction);
				
        },


        cash: function(amount) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();
            this.cancelReturn();
            
            if (buf.length>0) {
                if (!amount) amount = parseFloat(buf);
            }

            this.addPayment('cash', amount);

        },

        addCondiment: function(plu) {

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
                if (cartItem == null || cartItem.type != 'item') {
                    var displayItem = curTransaction.getDisplaySeqAt(index);
                    //@todo OSD
                    NotifyUtils.warn(_('Condiments may not be added to [%S]', [displayItem.name]));
                    return;
                }
                if (cartItem.hasMarker) {
                    //@todo OSD
                    NotifyUtils.warn(_('Cannot add condiments to an item that has been subtotaled'));
                    return;
                }
                if (cartItem.hasDiscount) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please void discount on item first'));
                    return;
                }
                if (cartItem.hasSurcharge) {
                    //@todo OSD
                    NotifyUtils.warn(_('Please void surcharge on item first'));
                    return;
                }
                // xxxx why clone it ??
                //condimentItem = GREUtils.extend({}, productsById[cartItem.id]);
                condimentItem = productsById[cartItem.id];
            }

            if (condimentItem) {
                if(!condimentItem.cond_group){
                    //@todo OSD
                    NotifyUtils.warn(_('No Condiment group associated with item [%S]', [condimentItem.name]));
                    return;
                }
                else {
                    var condiments = this.getCondimentsDialog(condimentItem.cond_group);
                    if (condiments) curTransaction.appendCondiment(index, condiments);
                }
                
            }
            this.subtotal();

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
            
            if (plu && plu.force_memo) {
                memoItem = plu;
            }else {
                var productsById = GeckoJS.Session.get('productsById');
                var cartItem = curTransaction.getItemAt(index);
                if (cartItem && cartItem.type == 'item') {
                    //xxxx why clone it?
                    //memoItem = GREUtils.extend({}, productsById[cartItem.id]);
                    memoItem = productsById[cartItem.id];
                }
            }

            var memo = this.getMemoDialog(memoItem ? memoItem.memo : '');
            if (memo) curTransaction.appendMemo(index, memo);

        },


        getCondimentsDialog: function (condgroup) {

            var condGroups = GeckoJS.Session.get('condGroups');
            if (!condGroups) {
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all');
                GeckoJS.Session.add('condGroups', condGroups);
                condGroups = GeckoJS.Session.get('condGroups');
            /*
                var idx = 0;
                condGroups.forEach(function(o) {
                    o
                });
                */
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

            var condiments = null;
            var aURL = 'chrome://viviecr/content/select_condiments.xul';
            var features = 'chrome,modal,width=600,height=480';
            var inputObj = {
                condgroup: condgroup,
                condsData: conds,
                condiments: condiments
            };

            window.openDialog(aURL, 'select_condiments', features, inputObj);

            if (inputObj.ok && inputObj.condiments) {
                return inputObj.condiments;
            }else {
                return null;
            }
            
        },

        getMemoDialog: function (memo) {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            //var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var features = 'chrome,modal,width=500,height=380';
            var inputObj = {
                input0:memo,require0:false
            };
            window.openDialog(aURL, _('Add New Memo'), features, _('Add Memo'), '', _('Memo'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }else {
                return null;
            }
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
                if (warn) NotifyUtils.warn(_('No open order to push'));
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
            var aURL = 'chrome://viviecr/content/select_queues.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                queues: queues,
                queuePool: queuePool
            };

            window.openDialog(aURL, 'select_queues', features, inputObj);

            if (inputObj.ok && inputObj.index) {
                var idx = inputObj.index;
                return queues[idx].key;
            }else {
                return null;
            }
        },

        pullQueue: function(data) {

            var key = this.getQueueIdDialog();
            var queuePool = this._getQueuePool();


            if(!key) return;

            // if has transaction push queue
            this.pushQueue(false);

            var data = queuePool.data[key];

            // remove from list;
            this._removeQueueByKey(key);

            var curTransaction = new Transaction();
            curTransaction.data = data ;
            this._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);
            this.subtotal();

        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id || '04de7be5-9969-4756-8852-6f6eed2301a8';

            var curTransaction = new Transaction();
            curTransaction.unserializeFromOrder(order_id);
            this._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);
            this.subtotal();

        }
	
	
    });

})();
