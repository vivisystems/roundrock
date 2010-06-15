(function(){

    var __controller__ = {

        name: 'Cart',

        components: ['Tax', 'Barcode', 'CartUtils'],

        uses: ['Product'],

        _cartView: null,
        _inDialog: false,
        _returnMode: false,
        _returnCode: '',
        _returnPersist: false,
        _blockNextAction: false,
        _decStockBackUp: null,
        _lastSaleOrderId: null,

        _pendingAddItemEvents: [],

        beforeFilter: function(evt) {

            var cmd = evt.data;
            if (cmd != 'cancel') {
                this._lastCancelInvoke = false;
            }

            switch(cmd) {
                case 'addItem':
                    if (this._blockNextAction) {
                        // internal
                        this._pendingAddItemEvents.push(this._data);
                        evt.preventDefault();
                        return false;
                    }
                    break;

                default:
                    this._pendingAddItemEvents = [];
                    break;
            }
            return true;
        },

        initial: function() {

            if (this._cartView == null ) {
                this._cartView = new NSICartView('cartList');
            }

            var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
            keypad.addEventListener('beforeAddBuffer', this.beforeAddBuffer);

            this.addEventListener('beforeAddItem', this.beforeAddItem);
            this.addEventListener('beforeVoidItem', this.clearWarning);
            this.addEventListener('beforeModifyItem', this.beforeModifyItem);
            this.addEventListener('onVoidSaleSuccess', this.addItemFormVoidOrder);

            // var curTransaction = this._getTransaction();
            // curTransaction.events.addListener('beforeAppendItem', obj, this);
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            GeckoJS.Session.remove('cart_set_qty_unit');
            GeckoJS.Session.remove('cart_set_qty_display');

            // catch changes to price level and store it in txn.data
            var events = GeckoJS.Session.getInstance().events;
            if (events) {
                events.addListener('change', this.sessionHandler, this);
                events.addListener('remove', this.sessionHandler, this);
                events.addListener('clear', this.sessionHandler, this);
            }

            // catch main controller's updateOptions event
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('onUpdateOptions', this.updateCartOptions, this);
            }

            // initialize cart options
            this.updateCartOptions();

            // add Observer for startTrainingMode event.
            var self = this;
            this.observer = GeckoJS.Observer.newInstance( {
                topics: [ "TrainingMode" ],

                observe: function( aSubject, aTopic, aData ) {
                    if ( aData == "start" ) {
                        self.startTraining( true );
                    } else if ( aData == "exit" ) {
                        self.startTraining( false );
                    }
                }
            } ).register();
        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
        },


        updateCartOptions: function() {
            let cartList = this._getCartlist();
            if (cartList) {
                let scrollMode = GeckoJS.Configure.read('vivipos.fec.settings.CartScrollMode') || 'cursor-line';
                let mode, unit;
                switch(scrollMode) {
                    case 'cursor-line':
                        mode = 'cursor';
                        unit = 'line';
                        break;

                    case 'view-page':
                        mode = 'view';
                        unit = 'page';
                        break;

                    default:
                        mode = 'cursor';
                        unit = 'line';
                        break;
                }
                cartList.setAttribute('scrollMode', mode);
                cartList.setAttribute('scrollUnit', unit);
            }
        },

        sessionHandler: function(evt) {
            var txn = this._getTransaction();
            if (!this.ifHavingOpenedOrder())
                return;

            var key;
            switch(evt.type) {
                case 'change':
                    key = evt.getData().key;
                    if (key == 'vivipos_fec_price_level') {
                        if (txn.data.price_level != evt.getData().value) {
                            txn.data.price_level = evt.getData().value;
                            Transaction.serializeToRecoveryFile(txn);
                        }
                    }
                    else if (key == 'defaultTaxNo') {
                        if (txn.data.default_taxno != evt.getData().value) {
                            txn.data.default_taxno = evt.getData().value;
                            Transaction.serializeToRecoveryFile(txn);
                        };
                    }
                    break;

                case 'remove':
                    key = evt.getData().key;
                    if (key == 'vivipos_fec_price_level') {
                        if ('price_level' in txn.data) {
                            delete txn.data.price_level;
                            Transaction.serializeToRecoveryFile(txn);
                        }
                    }
                    else if (key == 'defaultTaxNo') {
                        if ('defaultTaxNo' in txn.data) {
                            delete txn.data.default_taxno;
                            Transaction.serializeToRecoveryFile(txn);
                        }
                    }
                    break;
            }
        },

        beforeAddBuffer: function () {

            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var curTransaction = cart._getTransaction();
            if (curTransaction == null) return;
            if (!cart.ifHavingOpenedOrder()) {

                if (cart._cartView.tree) {
                    cart.dispatchEvent('onClear', curTransaction);
                    //cart._cartView.empty();
                    cart.cartViewEmpty();
                }
                GeckoJS.Session.remove('current_transaction');
                return ;
            }
        },

        cartViewEmpty: function() {
            this._cartView.empty();
            this.dispatchEvent('onCartViewEmpty', null);
        },

        clearWarning: function (evt) {
            // clear warning only if not in refund all mode
            if (!this._returnPersist) {
                this.dispatchEvent('onWarning', '');
            }
            else {
                this.dispatchEvent('onReturnAll', null);
            }
        },

        beforeAddItem: function (evt) {
            var item = evt.data;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
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
            if (positivePriceRequired && curTransaction != null) {
                sellPrice = curTransaction.checkSellPrice(item)
                if (sellPrice <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be registered with a zero or negative price [%S]!', [item.name, curTransaction.formatPrice(sellPrice)]));
                    evt.preventDefault();
                    return;
                }
            }

            // quantity must be greater than zero
            if (sellQty <= 0) {
                NotifyUtils.warn(_('Quantity must be greater than zero'));
                evt.preventDefault();
                return;
            }

            // retrieve set items only if SetItem is set
            var setItems = [];
            if (item.SetItem != null && item.SetItem.length > 0) {
                setItems = item.SetItem;
                for (var i = 0; i < setItems.length; i++) {
                    var productId = barcodesIndexes[setItems[i].preset_no];
                    var product = this.Product.getProductById(productId);
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
                var product = this.Product.getProductById(productId);
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
            }, this);
            //
            // @irving: 4/9/2009 no reason to disallow return of product sets;
            /*
            else {
                // we don't allow return of product sets
                if (setItems.length > 0 ) {
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
                        if (GREUtils.Dialog.confirm(this.topmostWindow,
                            _('confirm age'),
                            _('Is customer of age for purchase of [%S]?', [item.name])) == false) {
                            evt.preventDefault();
                            return;
                        }
                    }
                    else {
                        NotifyUtils.warn(_('Verify Customer Age for Purchase of [%S]!', [item.name]));
                    }
                }
                else {
                    // clear warning if no stock warning
                    if ((item.stock_status == null || item.stock_status == 1) && setItemsStockStatus == 1) {
                        if (!this._returnMode)
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

            // dispatch event
            if (!this.dispatchEvent('beforeNewTransaction', null)) {
                return;
            };

            try {
                var curTransaction = new Transaction();
            }catch(e) {}

            this._setTransactionToView(curTransaction);

            // clear return mode
            this.returnItem(true);
            
            // clear warning
            this.clearWarning();
            
            // check pricelevel schedule
            this.requestCommand('schedule', null, 'Pricelevel');

            // set default tax
            var defaultTaxId = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            var defaultTax = this.Tax.getTaxById(defaultTaxId);

            if (defaultTax) GeckoJS.Session.set('defaultTaxNo', defaultTax.no);
            else GeckoJS.Session.remove('defaultTaxNo');

            // dispatch event
            this.dispatchEvent('newTransaction', curTransaction);

            return curTransaction;
        },

        _getTransaction: function(autoCreate) {

            autoCreate = autoCreate || false;

            var curTransaction = GeckoJS.Session.get('current_transaction');


            // null
            if (curTransaction == null){
                if(autoCreate) return this._newTransaction();
                return null;
            }else if (autoCreate && (curTransaction.isCancel() || curTransaction.isVoided() || curTransaction.isSubmit())) {
                return this._newTransaction();
            }    

            return curTransaction;
        },

        ifHavingOpenedOrder: function() {
            var curTransaction = this._getTransaction();

            if( curTransaction && !curTransaction.isSubmit() && !curTransaction.isCancel() && !curTransaction.isVoided())
                return true;
            return false;
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

        _isItemInScaleDepartment: function(item) {
            // retrieve category by cate_no
            if (item.cate_no != null) {
                var categoriesByNo = GeckoJS.Session.get('categoriesByNo');
                if (categoriesByNo && categoriesByNo[item.cate_no] && categoriesByNo[item.cate_no].scale) {
                    return categoriesByNo[item.cate_no];
                }
            }
            return;
        },

        checkStock: function() {
            // not implemented here
            return true;
        },

        decStock: function() {
            // not implemented here
            return true;
        },

        getItemAt: function(index) {
            var item;
            if (this.ifHavingOpenedOrder()) {
                var curTransaction = this._getTransaction();
                if (curTransaction) {
                    item = curTransaction.getItemAt(index, true);
                }
            }
            return item;
        },

        tagItem: function(tag) {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot tag the selected item'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if (tag == null || tag.length == 0) {
                tag = buf;
                if (tag == null || tag.length == 0) {
                    NotifyUtils.warn(_('Cannot tag the selected item with an empty tag'));

                    this._clearAndSubtotal();
                    return;
                }
            }

            var itemTrans = curTransaction.getItemAt(index, true);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                NotifyUtils.warn(_('Cannot tag the selected item [%S]', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (this.dispatchEvent('beforeTagItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var taggedItem = curTransaction.tagItemAt(index, tag);

                this.dispatchEvent('afterTagItem', [taggedItem, itemDisplay]);
            }
            this._clearAndSubtotal();
        },

        labelItem: function(label) {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot label the selected item'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be re-labeled'));

                this._clearAndSubtotal();
                return;
            }

            if (buf != null && buf.length > 0) {
                label = buf;
            }

            var itemTrans = curTransaction.getItemAt(index, true);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                NotifyUtils.warn(_('Cannot label the selected item [%S]', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (this.dispatchEvent('beforeLabelItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var labelledItem = curTransaction.labelItemAt(index, label);

                this.dispatchEvent('afterLabelItem', [labelledItem, itemDisplay]);
            }
            this._clearAndSubtotal();
        },

        getReturnableCount: function(txn, item) {
            let count = 0;
            let items = txn.data.items;
            let dispItems = txn.data.display_sequences;
            dispItems.forEach(function(dispItem) {
                if (dispItem.id == item.id) {
                    let currentItem = items[dispItem.index];

                    if ((currentItem.current_qty > 0) || (currentItem.current_qty < 0 && dispItem.returned)) {
                        count += currentItem.current_qty;
                    }
                }
            }, this);

            return count;
        },

        /**
         * return cart item at cursor index.
         *
         * if annotation code exists , auto add memo.
         *
         * @param {String} code    Annotation code
         */
        returnCartItem: function(code) {

            code = code || '';
            
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();
            var itemTrans;
            var itemDisplay;

            var exit = false;

            this._getKeypadController().clearBuffer();

            if(!this.ifHavingOpenedOrder()) {
                NotifyUtils.warn(_('Not an open order; cannot return the selected item'));

                exit = true;
            }

            // check if transaction is closed
            if (!exit && curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be returned'));

                exit = true;
            }

            if(!exit && index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                exit = true;
            }

            if (!exit) {
                itemTrans = curTransaction.getItemAt(index);
                itemDisplay = curTransaction.getDisplaySeqAt(index);

                if (!exit && itemDisplay.type != 'item') {
                    NotifyUtils.warn(_('The selected item [%S] is not a product and cannot be returned', [itemDisplay.name]));

                    exit = true;
                }
            }

            if (!exit) {

                let qty = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : null;

                if (qty == null) {
                    qty = Math.abs(itemTrans.current_qty);
                }

                if (itemTrans.current_qty < 0) {
                    this.modifyQty('plus', qty);
                    exit = true;
                }
                else {
                    let returnableCount = this.getReturnableCount(curTransaction, itemTrans);
                    if (qty > returnableCount) {
                        NotifyUtils.warn(_('You may not return more [%S] than you have registered', [itemDisplay.name]));
                    }
                    else {
                        curTransaction.returnItemAtIndex(index, qty);

                        // auto add memo
                        if (code) {

                            var self = this;
                            // don't dispatch right now
                            exit = false;
                            return this.addMemo(code).next(function(){
                                self.dispatchEvent('afterReturnCartItem', curTransaction);
                            });
                        }
                    }
                    exit = true;
                }
            }

            if (exit) {
                this._clearAndSubtotal();
                this.dispatchEvent('afterReturnCartItem', curTransaction);
            }
        },

        addItem: function(plu) {

            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            var currentIndex = this._cartView.getSelectedIndex();
            var item = GREUtils.extend({}, plu);
            var curTransaction = this._getTransaction(true);

            if(curTransaction == null) {
                this._clearAndSubtotal();
                return;
            }

            // not valid plu item.
            if (typeof item != 'object' || typeof item.id == 'undefined') {
                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and new items may not be added'));

                this._clearAndSubtotal();
                return;
            }

            // check if product is sold out (if not returning item)
            if (!this._returnMode && item.soldout) {
                NotifyUtils.warn(_('The item [%S] (%S) is sold out', [item.name, item.no]));

                this._clearAndSubtotal();
                return;
            }

            // transaction is submit and close success
            if( !this.ifHavingOpenedOrder() ) {
                curTransaction = this._newTransaction();
            }

            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
            }

            // if product tax is not defined, use Session defaultTax if available
            if (!item.rate) {
                var defaultTaxNo = GeckoJS.Session.get('defaultTaxNo');
                if (defaultTaxNo) item.rate = defaultTaxNo;
            }

            // check if scale item
            if (item.scale) {
                // if qty not manually set, read from scale
                if (GeckoJS.Session.get('cart_set_qty_value') == null) {
                    if (!this.readScale(null, item.tare)) {
                        return;
                    }
                }
            }
            else if (item.cate_no) {
                var dep = this._isItemInScaleDepartment(item);
                if (dep != null) {

                    // use department's unit of sale if product's not set
                    if (item.sale_unit == 'unit') {
                        item.sale_unit  = dep.sale_unit;
                    }
                    // if qty not manually set, read from scale
                    if (GeckoJS.Session.get('cart_set_qty_value') == null) {
                        if (!this.readScale(null, item.tare)) return;
                    }
                }
            }

            let qtyFromInput = true;
            var qty = GeckoJS.Session.get('cart_set_qty_value');
            var unit = GeckoJS.Session.get('cart_set_qty_unit');
            var qty_display = GeckoJS.Session.get('cart_set_qty_display') || null;
            if (qty == null) {
                qty = 1;
                qtyFromInput = false;
            }

            if (unit != null && unit != '') {

                // for now (1.2.0.x), since departments don't have scale multipler and precision, we use fixed values for them
                // @TODO 1.2.0.x
                if (!('cate_no' in item)) {
                    item.scale_multipler = 1;
                    item.scale_precision = 2;
                }

                let orgQty = parseFloat(qty).toFixed(item.scale_precision);
                qty = this.setQty(this.CartUtils.convertWeight(qty, unit, item.sale_unit, item.scale_multiplier, item.scale_precision));
                if (qty != orgQty) {
                    GeckoJS.Session.remove('cart_set_qty_display');
                    qty_display = null;
                }
            }

            // if item's unit of sale is individually, we convert qty to integer
            if (item.sale_unit == 'unit') {
                qty = this.setQty(qty, true);
            }

            // if we are not in return mode, check if new item is the same as current item. if they are the same,
            // collapse it into the current item if no surcharge/discount/marker has
            // been applied to the current item and price/tax status are the same

            if (curTransaction) {
                if (!curTransaction.isLocked(currentIndex)) {
                    var currentItem = curTransaction.getItemAt(currentIndex);
                    var currentItemDisplay = curTransaction.getDisplaySeqAt(currentIndex);
                    var price = GeckoJS.Session.get('cart_set_price_value');
                    var destination = GeckoJS.Session.get('vivipos_fec_order_destination');
                    if (currentItemDisplay && currentItemDisplay.type == 'item') {
                        if (!qtyFromInput &&
                            ((('cate_no' in plu) && currentItem.no != '' && currentItem.no == plu.no) ||
                            (!('cate_no' in plu) && currentItem.no == '' && currentItem.cate_no == plu.no)) &&
                            !currentItem.hasDiscount &&
                            !currentItem.hasSurcharge &&
                            !currentItem.hasMarker &&
                            currentItem.destination == destination &&
                            ((price == null) || (currentItem.current_price == price)) &&
                            ((currentItem.current_qty > 0 && !this._returnMode) ||
                                currentItem.current_qty < 0 && !currentItemDisplay.returned && this._returnMode) &&
                            currentItem.tax_name == item.rate) {

                            // need to clear quantity source so scale multipler is not applied again
                            GeckoJS.Session.remove('cart_set_qty_unit');
                            GeckoJS.Session.remove('cart_set_qty_display');
                            this.modifyQty('plus', qty);

                            return;
                        }
                    }
                }
            }

            // if item is a sale department, check if price is set
            if (!('cate_no' in item)) {
                if (GeckoJS.Session.get('cart_set_price_value') == null) {
                    NotifyUtils.error(_('Price must be given to register sale of department [%S]', [item.name]));
                    this._clearAndSubtotal();

                    return;
                }
                item.cate_no = item.no;
                item.no = '';
            }


            if (this.dispatchEvent('beforeAddItem', item)) {
                // check if set item selection is needed
                if (item.setItemSelectionRequired) {
                    this._setItemSelectionDialog(curTransaction, item);

                    return;
                }

                if (this._returnMode) {
                    var newqty = 0 - (qty || 1);
                    GeckoJS.Session.set('cart_set_qty_value', newqty);
                }
                var addedItem = curTransaction.appendItem(item);
                var doSIS = plu.single && curTransaction.data.items_count == 1 && !this._returnMode;

                this.dispatchEvent('onAddItem', addedItem);

                this.dispatchEvent('afterAddItem', addedItem);

                var self = this;
                var cart = this._getCartlist();

                this._blockNextAction = true;
                next( function() {
                    if (addedItem.id == plu.id && !self._returnMode) {

                        currentIndex = curTransaction.getDisplayIndexByIndex(addedItem.index);
                        return next( function() {

                            if (plu.force_memo) {

                                // need to move cursor to addedItem
                                cart.selection.select(currentIndex);

                                return self.addMemo(plu);
                            }

                        }).next( function() {

                            if (plu.force_condiment) {
                                var condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
                                var conds = condGroupsByPLU[plu.cond_group]['Condiments'];

                                if (conds.length > 0) {
                                    // need to move cursor to addedItem
                                    cart.selection.select(currentIndex);

                                    return self.addCondiment(plu, null, doSIS);
                                }
                            }

                        });

                    }else if (addedItem.id == plu.id && self._returnMode && self._returnCode) {

                        // force memo from annotation code
                        return self.addMemo(self._returnCode);

                    }

                } ).next( function() {
                    
                    // single item sale?
                    if (doSIS && !self._returnMode) {
                        self._addPayment('cash', null, null, null, null, false, true);
                        self.dispatchEvent('onWarning', _('SINGLE ITEM SALE'));
                    }
                    else {
                        self._clearAndSubtotal();
                    }

                    self._blockNextAction = false;

                    // has pendingAddItemEvents ??
                    while (!self._blockNextAction && self._pendingAddItemEvents.length >0) {
                        let data = self._pendingAddItemEvents.splice(0,1)[0];
                        self.requestCommand('addItem', data, 'Cart');
                    }

                });

            }
            else {
                this._clearAndSubtotal();
            }
                
        },

        _setItemSelectionDialog: function (txn, item) {

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
                start: startIndex,
                mode: 'add'
            };
            var self = this;
            return $.popupPanel('selectSetItemPanel', dialog_data).next(function(evt){

                if (evt.data.ok) {
                    var plusetData = evt.data.plusetData;

                    let plu = item;
                    // @temp
                    //var plu = item;
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

                    self.addItem(plu);
                }
                else {
                    self._clearAndSubtotal();
                }
            });

        },

        _setItemModifyDialog: function (txn, item, itemDisplay) {
            // construct virtual set item from cart content

            // get cart set items
            var setItems = txn.getSetItemsByIndex(item.index);
            var plusetDispIndex = txn.getDisplayIndexByIndex(item.index);

            // get product set definition
            var product = this.Product.getProductById(item.id);

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
                start: startIndex,
                mode: 'modify'
            };
            var self = this;
            return $.popupPanel('selectSetItemPanel', dialog_data).next(function(evt){
                if (evt.data.ok) {
                    var plusetData = evt.data.plusetData;

                    var newItems = [];

                    plusetData.forEach(function(setitem) {

                        var qty = setitem.setitem.quantity;
                        var selected_no = setitem.product.no;
                        var preset_no = setitem.setitem.preset_no;
                        var priceDiff = 0;
                        let item = setitem.product;
                        //@temp
                        //var item = setitem.product;

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
                        self._clearAndSubtotal();
                        return;
                    }
                    // void then add
                    if (changed) {
                        txn.modifyItemAt(plusetDispIndex, newItems);
                    }
                }
                self._clearAndSubtotal();
            });
        },

        addItemByBarcode: function(barcode) {

            if (barcode == null || barcode.length == 0) {
                NotifyUtils.warn(_('Product number/barcode not provided'));
                return;
            }

            // preprocess barcode for extension usage...
            var event = {
                barcode: barcode
            }
            if (!this.dispatchEvent('barcodeFired', event)) {
                return;
            }
            // NON-PLU13
            var identifier = this.Barcode.getNONPLU13Identifier(barcode);
            if (identifier) {

                var identifiers = GeckoJS.Session.get('NonPluIdentifiers');
                var identifierIndex = GeckoJS.Session.get('NonPluIdentifierIndex');

                var index = identifierIndex[identifier];

                var identifierObj = identifiers[index];

                if (identifierObj && identifierObj.active) {
                    var check_digit = identifierObj.use_price_check_digit ? 1 : 0;
                    var pluno = barcode.substr(2, identifierObj.length_of_field1);

                    var field2 = barcode.substr(2 + parseInt(identifierObj.length_of_field1) + check_digit, identifierObj.length_of_field2) / Math.pow(10, identifierObj.decimal_point_of_field2);

                    // for extension usage...
                    event = {
                        identifier: identifier,
                        identifierObj: identifierObj,
                        barcode: barcode,
                        pluno: pluno,
                        field2: field2
                    }
                    if (!this.dispatchEvent('nonPluFired', event)) {
                        return;
                    }

                    barcode = pluno;
                }

            }

            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            var event = {
                error: false,
                barcode: barcode,
                product: null
            };

            var barcodeLearning = GeckoJS.Configure.read('vivipos.fec.settings.BarcodeLearningPLUGroup') || 'none';

            if (!barcodesIndexes || !barcodesIndexes[barcode]) {
                // barcode notfound
                var error = false;

                if(barcodeLearning == 'none') {
                    error = true;
                } else {
                    if(!this.dispatchEvent('beforeBarcodeLearning', event)) {
                        error = true;
                    } else {
                        var id = barcodesIndexes[barcode];
                        var product = this.Product.getProductById(id);
                        if(product) {
                            event.product = product;
                        } else {
                            event.error = true;
                        }

                    }
                }

                if(error) {
                    event.error = true;

                    NotifyUtils.warn(_('Product number/barcode [%S] not found', [barcode]));
                }
            }else {
                var id = barcodesIndexes[barcode];
                var product = this.Product.getProductById(id);
                event.product = product;
            }
            this.dispatchEvent('beforeItemByBarcode', event);

            if (!event.error) {

                // NON-PLU13
                // modify price / quantity
                if (identifier && identifierObj.active) {
                    if (identifierObj.content_of_field2 == 0) {
                        this.setPrice(field2);
                    } else {
                        this.setQty(field2);
                    }
                }

                this.addItem(product);
            }
            else {
                this.subtotal();
            }
            this.dispatchEvent('afterItemByBarcode', event);
        },

        addDeptByNumber: function(deptno) {

            if (deptno != null && deptno.length > 0) {

                var depts = GeckoJS.Session.get('categoriesByNo');
                var dept = depts[deptno];

                if (dept) {
                    if (dept.cansale) {
                        return this.addItem(dept);
                    }
                    else {
                        NotifyUtils.warn(_('Department [%S] (%S) is not a sale department',
                            [dept.name, deptno]));
                    }
                }
                else {
                    NotifyUtils.warn(_('[%S] is not a valid department number', [deptno]));
                }
            }
            else {
                var self = this;
                var dialog_data = {
                    type: 'saleable-department'
                };

                self._inDialog = true;

                return $.popupPanel('selectDepartmentPanel', dialog_data).next(function(evt){

                    self._inDialog = false;
                    let deptId = evt.data.selected;
                    if (deptId) {
                        let deptsById = GeckoJS.Session.get('categoriesById');
                        let dept = deptsById[deptId];
                        if (dept) {
                            return self.addItem(dept);
                        }
                    }
                });

            }
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            this._clearAndSubtotal();
        },

        modifyItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
            }

            // check whether price or quantity or both are being modified
            var newPrice = GeckoJS.Session.get('cart_set_price_value');
            var newQuantity = GeckoJS.Session.get('cart_set_qty_value');

            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot modify the selected item'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if (index < 0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {

                if (itemDisplay.type == 'setitem') {

                    // disallow quantity/price modification on set items
                    if (newQuantity != null || newPrice != null) {
                        NotifyUtils.warn(_('Price/quantity of product set item [%S] may not be modified', [itemDisplay.name]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
                else {
                    NotifyUtils.warn(_('Cannot modify the selected item [%S]', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
            }

            if (itemDisplay.type == 'item') {
                // convert newQuantity to proper magnitude if item is scale item and multiplier is non-zero
                var unit = GeckoJS.Session.get('cart_set_qty_unit');
                if (unit != null && unit != '') {
                    newQuantity = this.setQty(this.CartUtils.convertWeight(newQuantity, unit, itemTrans.sale_unit, itemTrans.scale_multiplier, itemTrans.scale_precision));
                }
                // convert newQuantity to whole numbers if unit of sale is 'unit'
                if (itemTrans.sale_unit == 'unit' && newQuantity != null) {
                    newQuantity = this.setQty(newQuantity, true);
                }
            }
            else if (itemDisplay.type == 'condiment') {

                // check if condiment is open
                var parentItem = curTransaction.getItemAt(index, true);
                if ('open' in itemDisplay && !itemDisplay.open && GeckoJS.BaseObject.getKeys(parentItem.condiments).length > 1) {
                    NotifyUtils.warn(_('Cannot modify condiments when collapsed'));

                    this._clearAndSubtotal();
                    return;
                }

                // check if quantity is entered
                if (newQuantity != null) {
                    NotifyUtils.warn(_('Cannot modify condiment quantity'));

                    this._clearAndSubtotal();
                    return ;
                }

                // check if price is entered
                if (buf.length <= 0) {
                    NotifyUtils.warn(_('Cannot modify condiment price; no price entered'));

                    this._clearAndSubtotal();
                    return ;
                }

                // check if user is allowed to modify condiment price
                if (!this.Acl.isUserInRole('acl_modify_condiment_price')) {
                    NotifyUtils.warn(_('Not authorized to modify condiment price'));

                    this._clearAndSubtotal();
                    return;
                }
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge) {
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemTrans.name]));

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (itemDisplay.type == 'setitem') {
                this._setItemModifyDialog(curTransaction, itemTrans, itemDisplay);
                return;
            }

            var modifyPrice = (newPrice != null && newPrice != itemTrans.current_price);
            var modifyQuantity = (newQuantity != null && newQuantity != itemTrans.current_qty);

            if (modifyPrice && !this.Acl.isUserInRole('acl_modify_price')) {
                NotifyUtils.warn(_('Not authorized to modify price'));

                this._clearAndSubtotal();
                return;
            }

            if (modifyQuantity && !this.Acl.isUserInRole('acl_modify_quantity')) {
                NotifyUtils.warn(_('Not authorized to modify quantity'));

                this._clearAndSubtotal();
                return;
            }

            if (modifyQuantity) {
                if (newQuantity == 0 || newQuantity < 0 && itemTrans.current_qty > 0) {
                    NotifyUtils.warn(_('Quantity must be greater than zero'));

                    this._clearAndSubtotal();
                    return;
                }
            }

            // check if zero preset price is allowed if item is type 'item''
            if (itemDisplay.type == 'item') {
                var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired') || false;

                if (positivePriceRequired && curTransaction != null) {
                    if (curTransaction.checkSellPrice(itemTrans) <= 0) {
                        NotifyUtils.warn(_('Product [%S] may not be modified with a price of [%S]!', [itemTrans.name, curTransaction.formatPrice(0)]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }
            if (this.dispatchEvent('beforeModifyItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var modifiedItem = curTransaction.modifyItemAt(index);
                var modifiedItemDisplay = curTransaction.getDisplaySeqAt(index);

                this.dispatchEvent('afterModifyItem', [modifiedItem, modifiedItemDisplay]);
            }
            this._clearAndSubtotal();

        },


        modifyQty: function(action, delta) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot modify the selected item'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item') {
                this.dispatchEvent('onModifyItemError', {});

                if (itemDisplay.type == 'setitem') {
                    NotifyUtils.warn(_('Quantity of product set item [%S] may not be modified', [itemDisplay.name]));
                }
                else if (itemDisplay.type == 'condiment') {
                    NotifyUtils.warn(_('Quantity of condiment [%S] may not be modified', [itemDisplay.name]));
                }
                else {
                    NotifyUtils.warn(_('Cannot modify quantity of selected item [%S]', [itemDisplay.name]));
                }

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge) {
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            var qty = itemTrans.current_qty;
            var newQty = Math.abs(qty);
            if (delta == null || isNaN(delta)) {
                delta = 1;
            }

            switch(action) {
                case 'plus':
                    newQty = parseFloat(newQty + delta);

                    break;
                case 'minus':
                    newQty = (newQty - delta > 0) ? (newQty - delta) : newQty;
                    break;
            }
            if (qty < 0) newQty = 0 - newQty;
            if (itemTrans.sale_unit == 'unit' || itemDisplay.type == 'payment') {
                newQty = parseInt(newQty);
            }
            else {
                // @hack: irving
                // to get around JS's arithmetic precision imperfections,
                // we record'the precisions of qty and delta, and
                // convert newQty to the higher precision of the two,
                var qtyPrecision = this._getPrecision(qty);
                var deltaPrecision = this._getPrecision(delta);
                newQty = newQty.toFixed( qtyPrecision > deltaPrecision ? qtyPrecision : deltaPrecision);
            }

            // check if changing quantity causes violation of return policy
            var returnableCount = this.getReturnableCount(curTransaction, itemTrans);
            if (newQty < qty) {
                if ((qty > 0 || itemDisplay.returned) && qty - newQty > returnableCount) {
                    NotifyUtils.warn(_('Cannot modify; doing so would have caused the quantity of [%S] returned to be more than the quantity registered', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
            }

            if (newQty != qty) {
                GeckoJS.Session.set('cart_set_qty_value', newQty);
                this.modifyItem();
            }
            else {
                NotifyUtils.warn(_('Quantity must be greater than zero'));
                this._clearAndSubtotal();
            }
        },

        _getPrecision: function(val) {
            var index = (val+'').indexOf('.');
            if (index == -1) return 0;
            else return ((val+'').length - index - 1);
        },

        _clearAndSubtotal: function() {
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            GeckoJS.Session.remove('cart_set_qty_unit');
            GeckoJS.Session.remove('cart_set_qty_display');

            this.subtotal();
        },

        returnItem: function(cancel) {

            // overloading cancel
            if (typeof cancel == 'string') {
                this._returnCode = cancel +'';
                cancel = undefined;
            }

            if (cancel || this._returnMode) {
                if (!cancel) {
                    if (this._returnPersist) {
                        this._returnPersist = false;
                        this._getKeypadController().clearBuffer();
                        this._clearAndSubtotal();
                    }
                    else {
                        this._returnPersist = true;
                        this.dispatchEvent('onReturnAll', null);
                    }
                }
                else {
                    this._returnPersist = false;
                }
                if (this._returnMode && !this._returnPersist) {
                    this._returnMode = false;
                    this.clearWarning();
                }
            }
            else {
                var curTransaction = this._getTransaction(true);
                this._returnMode = true;
                this.dispatchEvent('onReturnSingle', null);
            }
        },

        _cancelReturn: function(force) {
            if (!this._returnPersist || force)
                this.returnItem(true);
        },

        voidItem: function() {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot void'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be voided'));

                this._clearAndSubtotal();
                return;
            }

            var itemTrans = null;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == 'subtotal' || itemDisplay.type == 'tray' || itemDisplay.type == 'total') {

                // allow voiding of markers only if they are the last item in cart
                var cartLength = curTransaction.data.display_sequences.length;
                if (index < cartLength - 1) {
                    NotifyUtils.warn(_('Cannot VOID the selected item [%S]. It is not the last registered item', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
            }
            else if (itemDisplay.type == 'setitem') {
                NotifyUtils.warn(_('The select item [%S] is a member of a product set and cannot be VOIDed individually', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            itemTrans = curTransaction.getItemAt(index);
            if (itemTrans) {

                // has item been marked?
                if(itemDisplay.type != 'memo' && itemTrans.hasMarker) {
                    NotifyUtils.warn(_('Cannot VOID an entry that has been subtotaled'));

                    this._clearAndSubtotal();
                    return;
                }

                // if voiding condiment, make sure item does not have discounts applied
                if(itemDisplay.type == 'condiment' && parseFloat(itemDisplay.current_price) > 0) {
                    if (itemTrans.hasDiscount) {
                        NotifyUtils.warn(_('Please void discount on item [%S] first', [itemTrans.name]));

                        this._clearAndSubtotal();
                        return;
                    }
                    else if (itemTrans.hasSurcharge) {
                        NotifyUtils.warn(_('Please void surcharge on item [%S] first', [itemTrans.name]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }
            this.dispatchEvent('beforeVoidItem', itemTrans);
            var voidedItem = curTransaction.voidItemAt(index);
            this.dispatchEvent('afterVoidItem', [voidedItem, itemDisplay]);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();


        },

        addDiscountByNumber: function(args) {
            // args is a list of up to 5 comma separated arguments:
            // - amount
            // - label
            // - skipCondiment
            // - respect non discountable property
            // - back out payments when computing discount basis
            var discountAmount;
            var discountName = '-';
            var skipCondiments = false;
            var respectNonDiscountable = false;
            var useBalanceBeforePayments = false;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) discountAmount = argList[0];
                if (argList.length > 1) discountName = argList[1];
                if (argList.length > 2) skipCondiments = GeckoJS.String.parseBoolean(argList[2]);
                if (argList.length > 3) respectNonDiscountable = GeckoJS.String.parseBoolean(argList[3]);
                if (argList.length > 4) useBalanceBeforePayments = GeckoJS.String.parseBoolean(argList[4]);
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            this._addDiscount(discountAmount, '$', discountName, skipCondiments, respectNonDiscountable, useBalanceBeforePayments);
        },

        addDiscountByPercentage: function(args) {
            // args is a list of up to 5 comma separated arguments:
            // - amount
            // - label
            // - skipCondiment
            // - respect non discountable property
            // - back out payments when computing discount basis
            var discountAmount;
            var discountName;
            var skipCondiments = false;
            var respectNonDiscountable = false;
            var useBalanceBeforePayments = false;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) discountAmount = argList[0];
                if (argList.length > 1) discountName = argList[1];
                if (argList.length > 2) skipCondiments = GeckoJS.String.parseBoolean(argList[2]);
                if (argList.length > 3) respectNonDiscountable = GeckoJS.String.parseBoolean(argList[3]);
                if (argList.length > 4) useBalanceBeforePayments = GeckoJS.String.parseBoolean(argList[4]);
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            if (discountName == null || discountName == '') {
                discountName = '-' + discountAmount + '%';
            }

            this._addDiscount(discountAmount, '%', discountName, skipCondiments, respectNonDiscountable, useBalanceBeforePayments);
        },

        addMassDiscountByPercentage: function(args) {
            var discountAmount;
            var discountName;

            if(args !=null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) discountAmount = argList[0];
                if (argList.length > 1) discountName = argList[1];
            }

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            if (discountName == null || discountName == '') {
                discountName = '-' + discountAmount + '%';
            }

            this._addMassDiscount(discountAmount, discountName);
        },


        _addDiscount: function(discountAmount, discountType, discountName, skipCondiments, respectNonDiscountable, useBalanceBeforePayments) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add discount'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and discount may not be registered'));

                this._clearAndSubtotal();
                return;
            }

            if(index < 0) {
                NotifyUtils.warn(_('Please select an item'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Discount may not be registered against stored items'));

                this._clearAndSubtotal();
                return;
            }

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemTrans != null && itemTrans.type == 'item') {
                if (itemTrans.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (itemTrans.hasMarker) {
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                    this._clearAndSubtotal();
                    return;
                }
                let non_discountable = this.Product.isNonDiscountable(itemTrans.id, false);

                if (non_discountable) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Discount Error'),
                        _('Product [%S] is non-discountable', [itemTrans.name]));
                    return;
                }
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    NotifyUtils.warn(_('Surcharge has been already been registered on subtotal [%S]', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on subtotal [%S]', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
                else if (index < cartLength - 1) {
                    NotifyUtils.warn(_('Cannot apply discount to subtotal [%S]. It is not the last registered entry', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
            }
            else {
                NotifyUtils.warn(_('Discount may not be applied to [%S]', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (discountAmount == null || isNaN(discountAmount) || !discountAmount) {
                if (discountType == '$') {
                    NotifyUtils.warn(_('Please enter the discount amount'));
                }
                else {
                    NotifyUtils.warn(_('Please enter the discount percentage'));
                }

                this._clearAndSubtotal();
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
                amount: discountAmount
            };
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItem = curTransaction.appendDiscount(index, discountItem, skipCondiments, respectNonDiscountable, useBalanceBeforePayments);

            this.dispatchEvent('afterAddDiscount', discountedItem);

            this._clearAndSubtotal();
        },

        _addMassDiscount: function(discountAmount, discountName) {
            var curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add discount'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and discount may not be registered'));

                this._clearAndSubtotal();
                return;
            }

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            if (discountAmount == null || isNaN(discountAmount) || !discountAmount) {
                NotifyUtils.warn(_('Please enter the discount percentage'));
                this._clearAndSubtotal();
                return;
            }

            discountAmount = parseFloat(discountAmount) / 100;

            var discountItem = {
                type: '%',
                name: discountName,
                amount: discountAmount

            };
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItems = curTransaction.appendMassDiscount(discountItem);

            this.dispatchEvent('afterAddDiscount', discountedItems);

            if (!discountedItems || discountedItems.length == 0) {
                NotifyUtils.warn(_('No applicable item to discount'));
            }
            this._clearAndSubtotal();
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
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((surchargeAmount != null || surchargeAmount != '') && buf.length>0) {
                surchargeAmount = buf;
            }

            this._addSurcharge(surchargeAmount, '$', surchargeName);
        },

        addSurchargeByPercentage: function(args) {
            // args is a list of up to 5 comma separated arguments:
            // - amount
            // - label
            // - skipCondiment
            // - respect non surchargeable property
            // - back out payments when computing discount basis
            var surchargeAmount;
            var surchargeName;
            var skipCondiments = false;
            var respectNonDiscountable = false;
            var useBalanceBeforePayments = false;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) surchargeAmount = argList[0];
                if (argList.length > 1) surchargeName = argList[1];
                if (argList.length > 2) skipCondiments = GeckoJS.String.parseBoolean(argList[2]);
                if (argList.length > 3) respectNonDiscountable = GeckoJS.String.parseBoolean(argList[3]);
                if (argList.length > 4) useBalanceBeforePayments = GeckoJS.String.parseBoolean(argList[4]);
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((surchargeAmount == null || surchargeAmount == '') && buf.length>0) {
                surchargeAmount = buf;
            }

            if (surchargeName == null || surchargeName == '') {
                surchargeName = '+' + surchargeAmount + '%';
            }

            this._addSurcharge(surchargeAmount, '%', surchargeName, skipCondiments, respectNonDiscountable, useBalanceBeforePayments);
        },


        addMassSurchargeByPercentage: function(args) {
            var surchargeAmount;
            var surchargeName;

            if (args != null && args != '') {
                var argList = args.split(',');
                if (argList.length > 0) surchargeAmount = argList[0];
                if (argList.length > 1) surchargeName = argList[1];
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((surchargeAmount == null || surchargeAmount == '') && buf.length>0) {
                surchargeAmount = buf;
            }

            if (surchargeName == null || surchargeName == '') {
                surchargeName = '+' + surchargeAmount + '%';
            }

            this._addMassSurcharge(surchargeAmount, surchargeName);
        },


        _addSurcharge: function(surchargeAmount, surchargeType, name, skipCondiments, respectNonDiscountable, useBalanceBeforePayments) {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and surcharge may not be registered'));

                this._clearAndSubtotal();
                return;
            }

            if(index < 0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Surcharge may not be registered against stored items'));

                this._clearAndSubtotal();
                return;
            }

            surchargeAmount = surchargeAmount || false;

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemTrans != null && itemTrans.type == 'item') {

                if (itemTrans.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemTrans.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (itemTrans.hasSurcharge) {
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemTrans.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (itemTrans.hasMarker) {
                    NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                    this._clearAndSubtotal();
                    return;
                }
                let non_surchargeable = this.Product.isNonSurchargeable(itemTrans.id, false);

                if (non_surchargeable) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Surcharge Error'),
                        _('Product [%S] is non-surchargeable', [itemTrans.name]));
                    return;
                }
            }
            else if (itemDisplay.type == 'subtotal') {
                var cartLength = curTransaction.data.display_sequences.length;
                if (itemDisplay.hasSurcharge) {
                    NotifyUtils.warn(_('Surcharge has been already been registered on item [%S]', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
                else if (itemDisplay.hasDiscount) {
                    NotifyUtils.warn(_('Discount has been already been registered on item [%S]', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
                else if (index < cartLength - 1) {
                    NotifyUtils.warn(_('Cannot apply surcharge to [%S]. It is not the last registered item', [itemDisplay.name]));

                    this._clearAndSubtotal();
                    return;
                }
            }
            else {
                NotifyUtils.warn(_('Surcharge may not be applied to [%S]', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            if (surchargeAmount == null || isNaN(surchargeAmount) || !surchargeAmount) {
                if (surchargeType == '$') {
                    NotifyUtils.warn(_('Please enter the surcharge amount'));
                }
                else {
                    NotifyUtils.warn(_('Please enter the surcharge percentage'));
                }
                this._clearAndSubtotal();
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
                amount: surchargeAmount
            };
            this.dispatchEvent('beforeAddSurcharge', surchargeItem);

            var surchargedItem = curTransaction.appendSurcharge(index, surchargeItem, skipCondiments, respectNonDiscountable, useBalanceBeforePayments);

            this.dispatchEvent('afterAddSurcharge', surchargedItem);

            this._clearAndSubtotal();
        },

        _addMassSurcharge: function(surchargeAmount, name) {
            var curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add surcharge'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and surcharge may not be registered'));

                this._clearAndSubtotal();
                return;
            }

            surchargeAmount = surchargeAmount || false;

            if (surchargeAmount == null || isNaN(surchargeAmount) || !surchargeAmount) {
                NotifyUtils.warn(_('Please enter the surcharge percentage'));
                this._clearAndSubtotal();
                return;
            }

            surchargeAmount = parseFloat(surchargeAmount) / 100;
            var surchargeItem = {
                type: '%',
                name: name,
                amount: surchargeAmount
            };
            this.dispatchEvent('beforeAddSurcharge', surchargeItem);

            var surchargedItems = curTransaction.appendMassSurcharge(surchargeItem);

            this.dispatchEvent('afterAddSurcharge', surchargedItems);

            if (!surchargedItems || surchargedItems.length == 0) {
                NotifyUtils.warn(_('No applicable item to add surcharge'));
            }
            this._clearAndSubtotal();
        },

        addMarker: function(type) {
            type = type || 'subtotal';

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add %S', [type]));

                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot add %S', [type]));

                this._clearAndSubtotal();
                return;
            }

            var dspSeqCount = curTransaction.getDisplaySeqCount();

            var index = dspSeqCount-1;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            this.dispatchEvent('beforeAddMarker', type);

            if (itemDisplay.type == type) {
                this._clearAndSubtotal();
                this.dispatchEvent('afterAddMarker', type);
                return;
            }

            var markerItem = curTransaction.appendMarker(index, type);

            this.dispatchEvent('afterAddMarker', markerItem);

            this._clearAndSubtotal();
        },


        houseBon: function(name) {

            if (name == null || name.length == 0) name = _('House Bon');
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register %S', [name]));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemTrans != null && itemTrans.type == 'item') {

                var discountAmount =  itemTrans.current_subtotal;
                this._addDiscount(discountAmount, '$', name);
            }
            else {
                NotifyUtils.warn(_('House Bon may not be applied to [%S]', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

        },

        /*
         * currencyConvert accepts up to 4 parameters:
         *
         * - convertCode
         * - amount
         * - finalize
         * - groupable
         *
         * if amount is 0, then the user must manually enter an amount
         *
         */
        currencyConvert: function(args) {

            // args is a list of up to 4 parameters: convertCode, amount, finalize, groupable
            if (args == null) args = '';
            var argArray = String(args).split(',');
            var convertCode = argArray[0];
            var amount = argArray[1];
            var finalize = argArray[2] || false;
            var groupable = argArray[3] || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
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
                NotifyUtils.warn(_('The selected currency [%S] has not been configured', [convertCode]));

                this._clearAndSubtotal();
                return;
            }

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            // determine if payment amount if from argument list or from buffer
            let payment;

            // if amount is not defined, is '0', or amount is not a valid number, set payment to buffer
            if (amount == null || amount == '' || amount == '0' || isNaN(amount)) {

                // payment not groupable if no preset amount given
                groupable = false;

                payment = buf;
            }
            else {
                payment = amount;
            }

            // validate payment amount
            if (payment != null && payment != '') {
                if (isNaN(payment)) {
                    NotifyUtils.warn(_('Invalid payment amount [%S]', [payment]));

                    this._clearAndSubtotal();
                    return;
                }
                else {
                    if (parseFloat(payment) <= 0) {
                        NotifyUtils.warn(_('Invalid payment amount [%S]. Payment amount must be positive', [curTransaction.formatPrice(payment)]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }
            else if (this._returnMode) {
                NotifyUtils.warn(_('Please enter the amount to refund'));

                this._clearAndSubtotal();
                return;
            }

            if (payment != null && payment != '' && currencies && currencies.length > convertIndex) {
                // currency convert array
                let currency = currencies[convertIndex].currency;
                let currency_rate = currencies[convertIndex].currency_exchange;
                let memo1 = currency;
                let memo2 = currency_rate;
                let origin_amount = payment;
                let amount = parseFloat(payment) * currency_rate;
                this._addPayment('cash', amount, origin_amount, memo1, memo2, groupable, finalize);
            }
            else {
                if (buf.length==0) {
                    NotifyUtils.warn(_('Please enter an amount first'));
                }
                else if (currencies == null || currencies.length <= convertIndex) {
                    NotifyUtils.warn(_('Please configure the currency entry first [%S]', [convertIndex]));
                }
                this._clearAndSubtotal();
                return;
            }
        },

        _getCreditCardDialog: function (data) {

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

        _getCouponDialog: function (data) {

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

        _getGiftcardDialog: function (data) {

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

        _getCheckDialog: function (data) {

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

        addNonCashPayment: function(type, args) {
            // args should be a list of up to 5 comma-separated parameters: subtype, amount, silent, finalize, groupable
            let subtype = '';
            let amount;
            let silent = false;
            let finalize = false;
            let groupable = false;

            if (args != null && args != '') {
                let argList = args.split(',');
                subtype = argList[0];
                if (subtype == null) subtype = '';
                if (argList[1] != null && argList[1] != '') amount = argList[1];
                silent = argList[2] || false;
                finalize = argList[3] || false;
                groupable = argList[4] || false;
            }

            // check if has buffer
            let buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if order is open
            let curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            let qty = 1;
            if (groupable) {
                qty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? parseInt(GeckoJS.Session.get('cart_set_qty_value')) : 1;
                if (isNaN(qty) || qty < 1) qty = 1;
            }

            // determine if payment amount if from argument list or from buffer
            let payment;
            let balance = curTransaction.getRemainTotal();

            // if amount is not defined, is '0', or amount is not a valid number, set payment to buffer
            if (amount == null || amount == '' || amount == '0') {

                // payment not groupable if no preset amount given
                groupable = false;

                // if amount is '0', then we force the payment amount to be read from buffer'
                if (amount == '0' && balance > 0 && (buf == null || buf == '')) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Payment Warning'),
                                          _('Tender entry is compulsory for this payment type, please enter an amount first'));
                    this._clearAndSubtotal();
                    return;
                }
                payment = buf;
            }
            else {
                payment = amount;
            }

            let paid = curTransaction.getPaymentSubtotal();

            // validate payment amount
            if (payment != null && payment != '') {
                if (isNaN(payment)) {
                    NotifyUtils.warn(_('Invalid payment amount [%S]', [payment]));

                    this._clearAndSubtotal();
                    return;
                }
                else {
                    payment = parseFloat(payment);
                    if (payment <= 0) {
                        NotifyUtils.warn(_('Invalid payment amount [%S]. Payment amount must be positive', [curTransaction.formatPrice(payment)]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }
            else if (this._returnMode) {
                NotifyUtils.warn(_('Please enter the amount to refund'));

                this._clearAndSubtotal();
                return;
            }
            else if (balance < 0) {
                NotifyUtils.warn(_('Please enter the tender amount'));

                this._clearAndSubtotal();
                return;
            }

            // refunding payment; amount being refunded must not exceed amount paid
            if (this._returnMode) {
                let total = curTransaction.getTotal();
                let maxRefund = (total >= 0 ? paid : (paid - total));
                if (payment > maxRefund) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(maxRefund)]));

                    this._clearAndSubtotal();
                    return;
                }

            }
            else {
                // if payment is still undefined, set it to current balance
                if (payment == null || payment == 0 || isNaN(payment)) {
                    payment = balance;
                }
            }

            let self = this;
            switch(type) {
                case 'creditcard':
                    if (!this._returnMode) {
                        if (balance <= 0) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Credit Card Payment Error'),
                                _('Credit card payment not permitted when no balance is due'));

                            this._clearAndSubtotal();
                            return;
                        }

                        if (payment > balance) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Credit Card Payment Error'),
                                _('Credit card payment may not exceed remaining balance'));

                            this._clearAndSubtotal();
                            return;
                        }
                    }

                    if (silent && subtype != '') {
                        // credit card payments not groupable
                        this._addPayment('creditcard', payment, null, subtype, '', false, finalize);
                    }
                    else {
                        let data = {
                            type: subtype,
                            payment: curTransaction.formatPrice(payment)
                        };


                        return this._getCreditCardDialog(data).next(function(evt) {

                            let result = evt.data;

                            if (result.ok) {
                                let memo1 = result.input0 || '';
                                let memo2 = result.input1 || '';
                                self._addPayment('creditcard', payment, null, memo1, memo2, false, finalize);
                            }
                            else {
                                self._clearAndSubtotal();
                            }
                        });
                    }
                    return;

                case 'coupon':
                    if (balance <= 0) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Coupon Payment Error'),
                            _('Coupon payment not permitted when no balance is due'));

                        this._clearAndSubtotal();
                        return;
                    }

                    if (silent && subtype != '') {
                        this._addPayment('coupon', payment, amount, subtype, '', groupable, finalize);
                    }
                    else {
                        let data = {
                            type: subtype,
                            payment: curTransaction.formatPrice(payment)
                        };

                        return this._getCouponDialog(data).next(function(evt){

                            let result = evt.data;

                            if (result.ok) {

                                let memo1 = result.input0 || '';
                                let memo2 = result.input1 || '';

                                self._addPayment('coupon', payment, amount, memo1, memo2, groupable, finalize);

                            }
                            else {
                                self._clearAndSubtotal();
                            }
                        });
                    }
                    break;

                case 'giftcard':
                    let total = payment * qty;
                    if (!this._returnMode) {
                        if (balance <= 0) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Giftcard Payment Error'),
                                _('Giftcard payment not permitted when no balance is due'));

                            this._clearAndSubtotal();
                            return;
                        }

                        if (total > balance) {
                            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                _('confirm giftcard payment'),
                                _('Change of [%S] will NOT be given for this type of payment. Proceed?',
                                    [curTransaction.formatPrice(total - balance)])) == false) {

                                this._clearAndSubtotal();
                                return;
                            }
                        }
                        else {
                            balance = total;
                        }
                    }
                    else {
                        balance = total;
                    }

                    if (silent && subtype != '') {
                        this._addPayment('giftcard', balance, payment, subtype, '', groupable, finalize);
                    }
                    else {
                        let data = {
                            type: subtype,
                            payment: curTransaction.formatPrice(payment)
                        };

                        return this._getGiftcardDialog(data).next(function(evt){

                            let result = evt.data;

                            if (result.ok) {

                                let memo1 = result.input0 || '';
                                let memo2 = result.input1 || '';

                                self._addPayment('giftcard', balance, payment, memo1, memo2, groupable, finalize);

                            }
                            else {
                                self._clearAndSubtotal();
                            }
                        });
                    }
                    break;

                case 'check':
                    if (!this._returnMode && payment > balance) {

                        // check user's check cashing limit
                        let user = GeckoJS.Session.get('user');
                        let limit = 0;
                        if (user) {
                            limit = user.max_cash_check;
                        }
                        if (isNaN(limit)) limit = 0;

                        // we need to collect total check payment amount
                        let payments = curTransaction.getPayments();
                        let totalCheckPayment = 0;
                        for (key in payments) {
                            let entry = payments[key];
                            if (entry.name == 'check') {
                                totalCheckPayment += entry.amount;
                            }
                        }
                        let balanceBeforeCheckPayment = totalCheckPayment + balance;

                        if (balanceBeforeCheckPayment >= 0) {
                            if (payment - balance > limit) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Check Payment Error'),
                                    _('Cashing check for [%S] will exceed your limit of [%S]', [curTransaction.formatPrice(payment - balance), curTransaction.formatPrice(limit)]));

                                this._clearAndSubtotal();
                                return;
                            }
                        }
                        else {
                            if (newCheckTotal > limit) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Check Payment Error'),
                                    _('Cashing check for [%S] will exceed your limit of [%S]', [curTransaction.formatPrice(newCheckTotal), curTransaction.formatPrice(limit)]));

                                this._clearAndSubtotal();
                                return;
                            }
                        }
                    }

                    if (silent && subtype != '') {
                        this._addPayment('check', payment, null, subtype, '', false, finalize);
                    }
                    else {
                        let data = {
                            type: subtype || '',
                            payment: curTransaction.formatPrice(payment)
                        };

                        return this._getCheckDialog(data).next(function(evt){

                            let result = evt.data;

                            if (result.ok) {

                                let memo1 = result.input0 || '';
                                let memo2 = result.input1 || '';

                                self._addPayment('check', payment, null, memo1, memo2, false, finalize);

                            }
                            else {
                                self._clearAndSubtotal();
                            }
                        });
                    }
                    break;
            }
        },

        creditCard: function(args) {
            this.addNonCashPayment('creditcard', args);
        },

        coupon: function(args) {
            this.addNonCashPayment('coupon', args);
        },

        giftcard: function(args) {
            this.addNonCashPayment('giftcard', args);
        },

        check: function(args) {
            this.addNonCashPayment('check', args);
        },

        // data fields:
        // 1. entry type
        // 2. receipt printer number
        //
        // if receipt printer number is not specified, receipt is not printed
        ledgerEntry: function(data) {

            var inputObj = {};
            var entryType;
            var printer;

            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            // make sure we are not in the middle of an order
            if (this.ifHavingOpenedOrder()) {
                NotifyUtils.warn(_('Please complete or cancel transaction first'));

                this._clearAndSubtotal();
                return;
            }

            // parse input data
            if (data && data.length > 0) {
                var args = data.split(',');
                entryType = args[0];
                printer = parseInt(args[1]);
            }

            // get ledger entry types
            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            inputObj.entry_types = ledgerEntryTypeModel.find('all', {
                order: 'mode, type'
            });
            if (ledgerEntryTypeModel.lastError) {
                this._dbError(ledgerEntryTypeModel.lastError, ledgerEntryTypeModel.lastErrorString,
                    _('An error was encountered while retrieving ledger entry types (error code %s) [message #106].', [ledgerEntryTypeModel.lastError]));
                this._clearAndSubtotal();
                return;
            }

            var beforeResult = this.dispatchEvent('beforeLedgerEntry', null);
            if (!beforeResult) {
                this._clearAndSubtotal();
                return;
            }

            // amount must be given on input line
            var amount = parseFloat(buf);

            // if entry type is given, make sure it is defined, and retrieve its mode
            if (entryType) {
                var found = false;;
                for (var i = 0; i < inputObj.entry_types.length; i++) {
                    if (inputObj.entry_types[i].type == entryType) {
                        found = true;
                        break;
                    }
                }

                if (found) {
                    var user = this.Acl.getUserPrincipal();
                    var userDisplayName = user ? user.description : _('unknown user');

                    inputObj.ok = true;
                    inputObj.description = '';
                    inputObj.type = inputObj.entry_types[i].type;
                    inputObj.mode = inputObj.entry_types[i].mode;
                    inputObj.amount = isNaN(amount) ? null : amount;
                    inputObj.display_name = userDisplayName;
                    inputObj.entry_types = [inputObj.entry_types[i]];
                }
                else {
                    NotifyUtils.warn(_('Specified ledger entry type [%S] is not defined', [entryType]));
                    this._clearAndSubtotal();
                    return;
                }
            }

            if (!entryType || inputObj.amount == null) {
                var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
                var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
                var screenheight = GeckoJS.Session.get('screenheight') || 600;
                var features = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Ledger Entry'), features, inputObj);
            }

            if (!inputObj.ok) {
                this._clearAndSubtotal();
                return;
            }

            var ledgerController = GeckoJS.Controller.getInstanceByName('LedgerRecords');
            if (!ledgerController || !ledgerController.saveLedgerEntry(inputObj)) {
                return;
            }

            // check inputObj.id for result
            if (inputObj.id) {
                if (printer == 1 || printer == 2) {
                    var printController = GeckoJS.Controller.getInstanceByName('Print');
                    printController.printLedgerReceipt(inputObj, printer);
                }
                NotifyUtils.info(_('Transaction [%S] for amount of [%S] successfully logged to the ledger',
                    [inputObj.type + (inputObj.description ? ' (' + inputObj.description + ')' : ''), inputObj.amount]))
            }
            else {
                NotifyUtils.error(_('Failed to log transaction [%S] for amount of [%S] to the ledger',
                    [inputObj.type + (inputObj.description ? ' (' + inputObj.description + ')' : ''), inputObj.amount]))
            }
            this._clearAndSubtotal();
        },

        _addPayment: function(type, amount, origin_amount, memo1, memo2, isGroupable, forceFinalize) {

            var curTransaction = this._getTransaction();
            var returnMode = this._returnMode;

            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            if (amount != null && amount != '') {
                if (isNaN(amount)) {
                    NotifyUtils.warn(_('Invalid payment amount [%S]', [amount]));

                    this._clearAndSubtotal();
                    return;
                }
                else {
                    amount = parseFloat(amount);
                    if (amount <= 0) {
                        NotifyUtils.warn(_('Invalid payment amount [%S]. Payment amount must be positive', [curTransaction.formatPrice(amount)]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }
            else if (returnMode) {
                NotifyUtils.warn(_('Please enter the amount to refund'));

                this._clearAndSubtotal();
                return;
            }

            var qty = 1;
            if (isGroupable) {
                qty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? parseInt(GeckoJS.Session.get('cart_set_qty_value')) : 1;
                if (isNaN(qty) || qty < 1) qty = 1;
            }

            if (amount == null || amount == '' || amount == 0 || isNaN(amount)) {
                // if amount no given, set amount to amount paid, and qty to 1
                qty = 1;
                if (returnMode) {
                    amount = curTransaction.getPaymentSubtotal();
                }
                else {
                    amount = curTransaction.getRemainTotal();
                }
                if (amount < 0) amount = 0;
            }

            if (returnMode) {
                // payment refund
                let total = curTransaction.getTotal();
                let paid = curTransaction.getPaymentSubtotal();
                let maxRefund = (total >= 0 ? paid : (paid - total));

                if (amount > maxRefund) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed [%S]',
                        [curTransaction.formatPrice(amount), curTransaction.formatPrice(maxRefund)]));

                    this._clearAndSubtotal();
                    return;
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
            }

            type = type || 'cash';

            origin_amount = typeof origin_amount == 'undefined' ? amount : origin_amount;

            if (returnMode) {
                if (type == 'giftcard') amount = 0 - amount;
                qty = 0 - qty;
                if (!isGroupable) origin_amount = 0 - origin_amount;
            }

            var paymentItem = {
                type: type,
                amount: amount,
                origin_amount: origin_amount,
                transaction: curTransaction,
                memo1: memo1,
                memo2: memo2,
                is_groupable: isGroupable,
                current_qty: qty
            };
            
            var paymentTxnItem;

            if (amount != 0 || curTransaction.getRemainTotal() < 0) {
                var beforeResult = this.dispatchEvent('beforeAddPayment', paymentItem);
                if (beforeResult) {
                    // check if paymentItem can be merged with current item
                    let merged = false;
                    if (isGroupable) {
                        let currentIndex = this._cartView.getSelectedIndex();
                        if (!curTransaction.isLocked(currentIndex)) {
                            let currentItem = curTransaction.getItemAt(currentIndex);
                            let currentItemDisplay = curTransaction.getDisplaySeqAt(currentIndex);
                            if (currentItemDisplay && currentItemDisplay.type == 'payment'
                                && !currentItem.hasMarker
                                && currentItem.is_groupable
                                && currentItem.name == type
                                && currentItem.memo1 == memo1
                                && currentItem.origin_amount == origin_amount
                                && (currentItem.current_qty > 0 && !returnMode ||
                                    currentItem.current_qty < 0 && returnMode)) {
                                merged = true;
                                curTransaction.modifyPaymentQty(currentItemDisplay, currentItem, amount, qty);

                                this._getCartlist().refresh();

                            }
                        }
                    }

                    if (!merged) {
                        paymentTxnItem = curTransaction.appendPayment(type, amount, origin_amount, memo1, memo2, qty, isGroupable);
                        paymentTxnItem.seq = curTransaction.data.seq;
                        paymentTxnItem.order_id = curTransaction.data.id;
                    }
                }

                this.dispatchEvent('afterAddPayment', paymentTxnItem);
            }
            
            let noAutoFinalize = GeckoJS.Configure.read('vivipos.fec.settings.DisableAutoFinalize') || false;
            if (curTransaction.getRemainTotal() <= 0 && (forceFinalize || !noAutoFinalize)) {
                if (!this.submit() && !curTransaction.isSubmit() && paymentTxnItem) {
                    // remove last payment
                    let lastItem = curTransaction.data.display_sequences[curTransaction.data.display_sequences.length-1];
                    if (lastItem.index == paymentTxnItem.id) this.voidItem();
                }
            }else {
                this._clearAndSubtotal();
            }
        },

        showPaymentStatus: function() {

            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                NotifyUtils.warn(_('No order for which to show payment status'));
                this._clearAndSubtotal();
                return;
            }

            var payments = curTransaction.getPayments();
            var paymentList = [];
            for (var key in payments) {
                // clone a copy of payment
                var payment = GREUtils.extend({}, payments[key]);
                payment.amount = curTransaction.formatPrice(payment.amount);
                if (payment.is_groupable) {
                    let text = payment.current_qty + 'X';
                    if (payment.name == 'cash' && payment.memo2 != '') {
                        payment.origin_amount = text + payment.origin_amount;
                    }
                    else {
                        payment.origin_amount = text + curTransaction.formatPrice(payment.origin_amount);
                    }
                }
                else if (payment.name == 'giftcard') {
                    payment.origin_amount = curTransaction.formatPrice(payment.origin_amount);
                }
                else if (payment.name == 'cash' && payment.memo2) {
                    payment.origin_amount = payment.origin_amount;
                }
                else {
                    payment.origin_amount = '';
                }

                payment.name = _('(rpt)' + payment.name);
                paymentList.push(payment);
            }

            var dialog_data = [
            _('Payment Details'),
            paymentList
            ];

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            GeckoJS.Session.remove('cart_set_qty_unit');
            GeckoJS.Session.remove('cart_set_qty_display');

            return $.popupPanel('paymentDetailsPanel', dialog_data);

        },

        readScale: function(number, tare) {
            this._getKeypadController().clearBuffer();

            number = parseInt(number);
            if (isNaN(number) || number < 1 || number > 2) {
                number = null;
            }

            tare = parseFloat(tare);
            if (isNaN(tare)) tare = 0;

            var scaleController = GeckoJS.Controller.getInstanceByName('Scale');
            if (scaleController) {
                var weight = scaleController.readScale(number);

                if (weight == -1) {
                // configuration error; alert already posted; do nothing here
                }
                else if (weight == null) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Scale'), _('No reading from scale; please make sure scale is powered on and properly connected'));
                }
                else if (weight.value == null) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Scale'), _('No stable reading from scale; please remove and re-place item securely on the scale'));
                }
                else {
                    var qty = parseFloat(weight.value);
                    if (!isNaN(qty)) qty -= tare;

                    if (isNaN(qty) || qty <= 0) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Scale'),
                            _('Invalid scale reading [%S]; please remove and re-place item securely on the scale.', [weight.value]));
                    }
                    else {
                        this.setQty(qty, false, weight.unit, true);
                        if (weight.display) GeckoJS.Session.set('cart_set_qty_display', weight.display);
                        
                        NotifyUtils.info(_('Weight read from scale') + ' :' + (weight.display?weight.display:qty) + ' ' + weight.unit);
                        GREUtils.Sound.play('chrome://viviecr/content/sounds/beep1.wav');
                        return true;
                    }
                }
            }
            return false;
        },

        setQty: function(qty, force_int, unit, show) {

            var qty0;

            if (force_int)
                qty0 = parseInt(qty, 10);
            else
                qty0 = parseFloat(qty);

            if (isNaN(qty0)) qty0 = 1;
            GeckoJS.Session.set('cart_set_qty_value', qty0);
            if (unit) GeckoJS.Session.set('cart_set_qty_unit', unit);

            if (show) this.dispatchEvent('onSetQty', qty0);

            return qty0;
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

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot shift tax'));

                this._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and tax status may not be changed'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Tax status may not be changed on stored items'));

                this._clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index);
            var displayItem = curTransaction.getDisplaySeqAt(index);
            if (displayItem == null || displayItem.type != 'item') {
                NotifyUtils.warn(_('This operation cannot be performed on [%S]', [displayItem.name]));

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasDiscount) {
                NotifyUtils.warn(_('Please void discount on item [%S] first', [itemTrans.name]));

                this._clearAndSubtotal();
                return;
            }
            
            if (itemTrans.hasSurcharge) {
                NotifyUtils.warn(_('Please void surcharge on item [%S] first', [itemTrans.name]));

                this._clearAndSubtotal();
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
                    NotifyUtils.error(_('The tax status indicated does not exist [%S]', [taxNo]));

                    this._clearAndSubtotal();
                    return;
                }
            }


            var modifiedItem = curTransaction.shiftTax(index, taxIndex);

            if (modifiedItem) {
                this.dispatchEvent('afterShiftTax', modifiedItem);
            }
            else {
                NotifyUtils.error(_('Cannot shift tax; no tax configuration found'));
            }

            this._clearAndSubtotal();

        },

        clear: function() {

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            GeckoJS.Session.remove('cart_set_qty_unit');
            GeckoJS.Session.remove('cart_set_qty_display');

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn(true);

            if(curTransaction == null) {
                this.dispatchEvent('onClear', null);
                return;
            }
            this.dispatchEvent('onClear', curTransaction);

            if (!this.ifHavingOpenedOrder()) {
                GeckoJS.Session.remove('current_transaction');
                this.cartViewEmpty();
                this.subtotal();
            }

        },

        cancel: function(forceCancel) {

            var orderModel = new OrderModel();

            this._getKeypadController().clearBuffer();
            this._cancelReturn(true);

            var curTransaction = this._getTransaction();
            if (!curTransaction) {
                this.clear();
                return;
            }

            if (!this.ifHavingOpenedOrder()) {

                if (curTransaction.data.recall == 2) orderModel.releaseOrderLock(curTransaction.data.id);

                this.clear();

                this.dispatchEvent('onCancelSuccess', null);

                // let dispatcher don't auto dispatch onCancel
                this.dispatchedEvents['onCancel'] = true;

                return;
            }

            //  cancel requires confirmation with twice click
            var now  = (new Date()).getTime();
            if( !forceCancel && (!this._lastCancelInvoke || ( (now - this._lastCancelInvoke) > 3000)) ) {
                try{

                    var quiet = GeckoJS.Configure.read('vivipos.fec.settings.quietcancel') || false;
                    if(!quiet) GREUtils.Sound.play('chrome://viviecr/content/sounds/beep.wav');

                }catch(e) {
                }

                // prevent onCancel event dispatch
                this.dispatchedEvents['onCancel'] = true;
                this._lastCancelInvoke = now;
                return ;
            }
            this._lastCancelInvoke = now;

            this.dispatchEvent('beforeCancel', curTransaction);

            var waitPanel;
            var ret;

            try {
                // if the order has been stored, then it cannot be cancelled; it must be voided instead
                if (curTransaction.data.recall == 2) {

                    // determine if new items have been added
                    if (!curTransaction.isModified() || forceCancel ||
                        GREUtils.Dialog.confirm(this.topmostWindow,
                            _('confirm cancel'),
                            _('Are you sure you want to discard changes made to this order?'))) {

                        // blockUI when cancelling...
                        waitPanel = this._blockUI('blockui_panel', 'common_wait', _('Cancelling Order'), 0);

                        ret = curTransaction.cancel(true);

                        // unblockUI
                        this._unblockUI(waitPanel);

                        if (ret != 1) {
                            // error on cancel
                            this.log('ERROR', 'Failed to cancel and discard order [' + curTransaction.data.id + '] sequence [' + curTransaction.data.seq + '] forceCancel [' + forceCancel + ']');
                        }
                        
                        if (ret == -1) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('Failed to cancel order due to data operation error [message #102].'));
                            return;
                        }
                        else if (ret == -3) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('Failed to cancel order because a valid sequence number cannot be obtained. Please check the network connectivity to the terminal designated as the order sequence server [message #103].'));
                            return;
                        }
                        else {
                            orderModel.releaseOrderLock(curTransaction.data.id);
                        }
                        this.dispatchEvent('onClear', curTransaction);
                    }
                    else {
                        return;
                    }
                }
                else {
                    // normal cancel, commit to databases.

                    // blockUI when cancelling...
                    waitPanel = this._blockUI('blockui_panel', 'common_wait', _('Cancelling Order'), 0);
                    
                    ret = curTransaction.cancel();

                    // unblockUI
                    this._unblockUI(waitPanel);

                    if (ret != 1) {
                        // error on cancel
                        this.log('ERROR', 'Failed to cancel order [' + curTransaction.data.id + '] sequence [' + curTransaction.data.seq + '] forceCancel [' + forceCancel + ']');
                    }

                    if (ret == -1) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Data Operation Error'),
                            _('Failed to cancel order due to data operation error [message #102].'));
                        return;
                    }
                    else if (ret == -3) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Data Operation Error'),
                            _('Failed to cancel order because a valid sequence number cannot be obtained. Please check the network connectivity to the terminal designated as the order sequence server [message #103].'));
                        return;
                    }
                    else {
                        this.dispatchEvent('afterCancel', curTransaction);
                    }
                    
                }

            }catch(e) {
                this.log('ERROR', 'Exception on cancel order [' + curTransaction.data.id + '] sequence [' + curTransaction.data.seq + '] forceCancel [' + forceCancel + '] exception [' + e + ']');

                if (waitPanel) {
                    // unblockUI
                    this._unblockUI(waitPanel);
                }
                return;
            }
            
            this.cartViewEmpty();
            //@irving 10-09-2009; don't clear after cancel'
            //this.clear();
            //
            // cancel success and commit
            this.dispatchEvent('onCancelSuccess', curTransaction);

            this.dispatchEvent('onCancel', curTransaction);
        },

        subtotal: function() {
            var oldTransaction = this._getTransaction();
            this._cancelReturn();

            if (oldTransaction == null) {
                this.dispatchEvent('onGetSubtotal', null);
            }
            else {
                if (this.ifHavingOpenedOrder()) {
                    Transaction.serializeToRecoveryFile(oldTransaction);
                }
                this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
        },


        submit: function(status) {

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            GeckoJS.Session.remove('cart_set_qty_unit');
            GeckoJS.Session.remove('cart_set_qty_display');

            var oldTransaction = this._getTransaction();

            if(oldTransaction == null) return false;

            if (status == null) status = 1;
            if (status == 1 && oldTransaction.getRemainTotal() > 0) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Order Finalization'),
                    _('Current order has non-zero balance and may not be closed'));
                return false;
            }

            if (status == 1) {

                // dispatch PrepareFinalization event to make required adjustments
                if (!this.dispatchEvent('PrepareFinalization', oldTransaction)) {
                    this.dispatchEvent('onGetSubtotal', oldTransaction);
                    return false;
                };

                var user = GeckoJS.Session.get('user');
                var adjustment_amount = oldTransaction.data.trans_discount_subtotal + oldTransaction.data.trans_surcharge_subtotal +
                oldTransaction.data.item_discount_subtotal + oldTransaction.data.item_surcharge_subtotal;
                if (adjustment_amount > 0) {
                    // check if order surcharge exceed user limit
                    var surcharge_limit = parseFloat(user.order_surcharge_limit);
                    if (!isNaN(surcharge_limit) && surcharge_limit > 0) {
                        var surcharge_limit_amount = oldTransaction._computeLimit(oldTransaction.data.item_subtotal, surcharge_limit, user.order_surcharge_limit_type);
                        if (adjustment_amount > surcharge_limit_amount) {
                            NotifyUtils.warn(_('Total surcharge [%S] may not exceed user order surcharge limit [%S]',
                                [oldTransaction.formatPrice(adjustment_amount),
                                oldTransaction.formatPrice(surcharge_limit_amount)]));
                            return false;
                        }
                    }
                }
                else if (adjustment_amount < 0) {
                    // check if order discount exceed user limit
                    adjustment_amount = 0 - adjustment_amount;
                    var discount_limit = parseFloat(user.order_discount_limit);
                    if (!isNaN(discount_limit) && discount_limit > 0) {
                        var discount_limit_amount = oldTransaction._computeLimit(oldTransaction.data.item_subtotal, discount_limit, user.order_discount_limit_type);
                        if (adjustment_amount > discount_limit_amount) {
                            NotifyUtils.warn(_('Total discount [%S] may not exceed user order discount limit [%S]',
                                [oldTransaction.formatPrice(adjustment_amount),
                                oldTransaction.formatPrice(discount_limit_amount)]));
                            return false;
                        }
                    }

                }
            }

            // blockUI when saving...
            var waitPanel = this._blockUI('blockui_panel', 'common_wait', _('Saving Order'), 0);

            if (this.dispatchEvent('beforeSubmit', {
                status: status,
                txn: oldTransaction
            })) {

                // save order unless the order is being finalized (i.e. status == 1)
                if (status == 1 || status == 2) {
                    var user = this.Acl.getUserPrincipal();
                    if ( user != null && status == 1) {
                        oldTransaction.data.proceeds_clerk = user.username;
                        oldTransaction.data.proceeds_clerk_displayname = user.description;
                    }

                    // check and dec stock
                    this.decStock(oldTransaction.data);
                }

                var submitStatus = -99; // initial value
                
                try {
                    // save transaction to order databases.
                    submitStatus = parseInt(oldTransaction.submit(status));

                    /*
                     *   1: success
                     *   null: input data is null
                     *   -1: save to backup failed
                     *   -3: can't get sequence .
                     */
                    if (submitStatus != 1) {
                        if (submitStatus == -1 || submitStatus == -3 ) {

                            if (submitStatus == -3) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('This order could not be saved because a valid sequence number cannot be obtained. Please check the network connectivity to the terminal designated as the order sequence master [message #112].'));
                            }
                            else {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('Failed to save order. Please contact technical support for assistance immediately [message #111].'));
                            }
                        }
                    }
                    else {
                        // assign data status
                        oldTransaction.data.status = status;

                        this._getKeypadController().clearBuffer();
                        //this._cancelReturn(true);

                        // dispatch event for devices or extensions.
                        this.dispatchEvent('afterSubmit', oldTransaction);
                    }
                }catch(e) {
                    // error on submit
                    this.log('ERROR', 'Exception on submit order [' + oldTransaction.data.id + '] sequence [' + oldTransaction.data.seq + '] status [' + status + '] exception [' + e + ']');

                }finally{

                    if (submitStatus == -99 || submitStatus == -3 || submitStatus == -1) {
                        // error on submit
                        this.log('ERROR', 'Failed to submit order [' + oldTransaction.data.id + '] sequence [' + oldTransaction.data.seq + '] status [' + status + '] return code [' + submitStatus + ']');

                        // unblockUI
                        this._unblockUI(waitPanel);
                        return false;
                    }
                    
                    // finally commit the submit , and write transaction to databases(or to remote databases).
                    var commitStatus = -99 ;
                    
                    try {
                        // commit order data to local databases or remote.
                        commitStatus = oldTransaction.commit(status);
                            // determine if local or remote
                        if (commitStatus == -1) {

                            this.log('ERROR', 'Failed to commit order [' + oldTransaction.data.id + '] sequence [' + oldTransaction.data.seq + '] status [' + status + '] return code [' + commitStatus + ']');

                            let orderModel = new OrderModel();
                            if ((status == 2 || oldTransaction.data.recall == 2) && !orderModel.isLocalhost()) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server. You can store the check again after network connectivity has been restored [message #105].'));
                            }
                            else {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('This order could not be committed. Please contact technical support for assistance immediately [message #113].'));
                            }
                            this.dispatchEvent('commitOrderError', commitStatus);
                            this.dispatchEvent('onGetSubtotal', oldTransaction);
                            this.dispatchEvent('onWarning', _('DATA ERROR'));
                            this._unblockUI(waitPanel);
                            return false;
                        }

                        if (status != 2) {
                            if (status != 1) this.clearWarning();
                            if (status == 1) {
                                this._lastSaleOrderId = oldTransaction.data.id;
                            }
                            this.dispatchEvent('onSubmit', oldTransaction);
                        }
                        else {
                            this.dispatchEvent('onGetSubtotal', oldTransaction);
                        }
                    }catch(e) {
                        // error on commit
                        this.log('ERROR', 'Exception on commit order [' + oldTransaction.data.id + '] sequence [' + oldTransaction.data.seq + '] status [' + status + '] exception [' + e + ']');
                        return false;
                    }
                }

                // clear register screen if needed
                if (GeckoJS.Configure.read('vivipos.fec.settings.ClearCartAfterFinalization')) {
                    //this._cartView.empty();
                    this.cartViewEmpty();
                }

                this._unblockUI(waitPanel);

                // dispatch success event
                this.dispatchEvent('onSubmitSuccess', oldTransaction);

            }
            else {
                this.dispatchEvent('onGetSubtotal', oldTransaction);

                // unblockUI
                this._unblockUI(waitPanel);
                return false;
            }
            return true;
        },


        // pre-finalize the order by closing it
        preFinalize: function(args) {

            var curTransaction = this._getTransaction();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot pre-finalize order'));
                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('The order is already pre-finalized'));
                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.getItemsCount() == 0) {
                NotifyUtils.warn(_('The order is empty; cannot pre-finalize order'));
                this._clearAndSubtotal();
                return;
            }

            if (!this.dispatchEvent('PrepareFinalization', curTransaction)) {
                this._clearAndSubtotal();
                return;
            }

            // if destination is given, items in cart are first validated to make sure
            // their destinations match the given destination
            if (args != null && args != '') {

                var argList = args.split(',');
                var dest = argList[0];

                if (dest) {
                    if (curTransaction.data.destination != dest) {
                        if (GREUtils.Dialog.confirm(this.topmostWindow,
                            _('confirm destination'),
                            _('The order destination is different from [%S], proceed with pre-finalization?', [dest])) == false) {
                            this._clearAndSubtotal();
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
                        if (GREUtils.Dialog.confirm(this.topmostWindow,
                            _('confirm destination'),
                            _('Destinations other than [%S] found in the order, proceed with pre-finalization?', [dest])) == false) {
                            this._clearAndSubtotal();
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
                            multiline0: 4
                        };

                        var data = [
                        _('Add Annotation') + ' [' + curTransaction.data.seq + ']',
                        '',
                        annotationType,
                        '',
                        inputObj
                        ];

                        var self = this;
                        return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                            var result = evt.data;

                            if (result.ok && result.input0) {
                                if (!('annotations' in curTransaction.data)) {
                                    curTransaction.data.annotations = {};
                                }
                                curTransaction.data.annotations[ annotationType ] = result.input0;
                            }

                            curTransaction.close();
                            self.submit(2);
                            self.dispatchEvent('onWarning', _('PRE-FINALIZED'));

                            // dispatch onSubmit event here manually since submit() won't do it for us
                            this.dispatchEvent('onStore', curTransaction);

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
                this._cancelReturn(true);
            }

            // lastly, close the transaction and store the order to generate the
            // appropriate printouts

            curTransaction.close();
            this.submit(2);
            this.dispatchEvent('onWarning', _('PRE-FINALIZED'));

            // dispatch onSubmit event here manually since submit() won't do it for us
            this.dispatchEvent('onStore', curTransaction);

            NotifyUtils.warn(_('Order# [%S] has been pre-finalized', [curTransaction.data.seq]));

            this.dispatchEvent('afterPreFinalize', curTransaction);
        },


        /*
         * cash accepts up to 3 parameters:
         *a
         * - amount
         * - finalize
         * - groupable
         *
         * if amount is 0, then the user must manually enter an amount
         *
         */

        cash: function(args) {
            if (args == null) args = '';
            var argArray = String(args).split(',');
            var amount = argArray[0];
            var finalize = argArray[1] || false;
            var groupable = argArray[2] || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            let payment;

            // if amount is not defined, is '0', or amount is not a valid number, set payment to buffer
            if (amount == null || amount == '' || amount == '0' || isNaN(amount)) {

                // payment not groupable if no preset amount given
                groupable = false;
                
                payment = buf;
            }
            else {
                payment = amount;
            }

            // if amount is 0, verify that buffer is not empty and contains a valid number
            if (amount == '0') {

                // skip this validation if amount due is negative
                let curTransaction = this._getTransaction();
                if (this.ifHavingOpenedOrder() && curTransaction.getRemainTotal() > 0) {
                    if (payment == null || payment == '') {
                        GREUtils.Dialog.alert(this.topmostWindow,
                                              _('Payment Warning'),
                                              _('Tender entry is compulsory for this payment type, please enter an amount first'));
                        this._clearAndSubtotal();
                        return;
                    }
                }
            }

            let currencies = GeckoJS.Session.get('Currencies') || [];
            if (currencies && currencies[0] && currencies[0].currency && currencies[0].currency.length > 0) {
                memo1 = currencies[0].currency;
            }
            else {
                memo1 = '';
            }
            this._addPayment('cash', payment, payment, memo1, null, groupable, finalize);
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
                        condArray.push({
                            name: condName,
                            price: condPrice
                        });
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
            this._cancelReturn();

            if(curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; cannot add condiment'));

                this._clearAndSubtotal();
                return;
            }

            if (!this.ifHavingOpenedOrder()) {
                if (plu) {
                    curTransaction = this._newTransaction();
                }
                else {
                    NotifyUtils.warn(_('Not an open order; cannot add condiment'));

                    this._clearAndSubtotal();
                    return;
                }
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            var condimentItem = null;

            if (plu && plu.force_condiment) {
                condimentItem = plu;
            }else {
                var cartItem = curTransaction.getItemAt(index);
                var setItem = curTransaction.getItemAt(index, true);
                if (cartItem == null || (cartItem.type != 'item' && cartItem.type != 'setitem')) {
                    var displayItem = curTransaction.getDisplaySeqAt(index);

                    NotifyUtils.warn(_('Condiments may not be added to [%S]', [displayItem.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (cartItem.hasMarker) {
                    NotifyUtils.warn(_('Cannot add condiments to an item that has been subtotaled'));

                    this._clearAndSubtotal();
                    return;
                }
                if (cartItem.hasDiscount) {
                    NotifyUtils.warn(_('Please void discount on item [%S] first', [cartItem.name]));

                    this._clearAndSubtotal();
                    return;
                }
                if (cartItem.hasSurcharge) {
                    NotifyUtils.warn(_('Please void surcharge on item [%S] first', [cartItem.name]));

                    this._clearAndSubtotal();
                    return;
                }
                // xxxx why clone it ??
                condimentItem = this.Product.getProductById(setItem.id);
                
                // extract cartItem's selected condiments, if any
                if (!immediateMode && setItem.condiments != null) {
                    for (var c in setItem.condiments) {
                        if (condiments == null) {
                            condiments = [];
                        }
                        condiments.push(setItem.condiments[c]);
                    }
                }
            }

            var d = new Deferred();
            if (immediateMode && condiments) {
                this._appendCondiments(condiments, false);
            }
            else if (condimentItem) {
                if(!condimentItem.cond_group && !immediateMode){
                    NotifyUtils.warn(_('No Condiment group associated with item [%S]', [condimentItem.name]));

                    this._clearAndSubtotal();
                    return d;
                }
                else {
                    return this._getCondimentsDialog(condimentItem.cond_group, condiments);
                }

            }
            return d;

        },

        _getCondimentsDialog: function (condgroup, condiments) {

            var self = this;

            // make sure we've completed previous addItem() call
            if (this._inDialog) return;

            var condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
            // not initial , initial again!
            if (!condGroupsByPLU) {
                try {
                    GeckoJS.Controller.getInstanceByName('Condiments').initial();
                    condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
                }catch(e) {}
            }

            var selectedItems = [];
            var additionalItems = [];
            var conds = condGroupsByPLU[condgroup]['Condiments'];
            if (condiments == null) {
                //@irving filter out sold out condiments
                selectedItems = condGroupsByPLU[condgroup]['PresetItems'].filter(function(c) {
                    return !conds[c].soldout
                });
            }else {
                // check item selected condiments
                //var condNames = GeckoJS.BaseObject.getKeys(condiments);
                var condNames = conds.map(function(c) {
                    return c.name
                });
                for (var i = 0; i < condiments.length; i++) {
                    var found = condNames.indexOf(condiments[i].name);
                    if (found > -1) {
                        selectedItems.push(found);
                    }
                    else {
                        additionalItems.push(condiments[i]);
                    }
                }
            }
            var dialog_data = {
                conds: conds,
                selectedItems: selectedItems,
                hideSoldout: GeckoJS.Configure.read('vivipos.fec.settings.HideSoldOutButtons') || false
            };

            self._inDialog = true;

            return $.popupPanel('selectCondimentPanel', dialog_data).next(function(evt){

                self._inDialog = false;
                
                var selectedCondiments = evt.data.condiments;
                self._appendCondiments(selectedCondiments.concat(additionalItems), true);
            });

        },

        _appendCondiments: function(selectedCondiments, replace) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction != null && index >=0) {

                // self.log(self.dump(curTransaction.data));

                var item = curTransaction.getItemAt(index, true);
                if (item) {

                    if (!replace && item.condiments) {
                        //  ensure that single selection behavior is not violated
                        var condGroupCache = {};
                        var condGroupsById = GeckoJS.Session.get('condGroupsById');
                        var filteredCondiments = [];

                        selectedCondiments.forEach(function(cond) {

                            if (condGroupCache[cond.condiment_group_id] == null) {
                                // check if this condiment group is single selection and has already been selected
                                var condGroup = condGroupsById[cond.condiment_group_id];
                                if (!condGroup || condGroup.seltype != 'single') {
                                    condGroupCache[cond.condiment_group_id] = false;
                                }
                                else {
                                    // group is single selection, check if selection exists
                                    var groupCondiments = condGroup.Condiment;
                                    var exists = false;
                                    for (var i = 0; i < groupCondiments.length; i++) {
                                        if (groupCondiments[i].name in item.condiments) {
                                            exists = condGroup.name;
                                            break;
                                        }
                                    }
                                    condGroupCache[cond.condiment_group_id] = exists;
                                }

                            }

                            if (condGroupCache[cond.condiment_group_id]) {
                                NotifyUtils.warn(_('Condiment [%S] not added because another condiment from same group [%S] already exists',
                                    [cond.name, condGroupCache[cond.condiment_group_id]]));
                            }
                            else {
                                filteredCondiments.push(cond);
                            }
                        }, this);

                        selectedCondiments = filteredCondiments;
                    }

                    // get first condiment display item
                    var condDisplayIndex = curTransaction.getFirstCondimentIndex(item);
                    var condDisplayItem = curTransaction.getDisplaySeqAt(condDisplayIndex);
                    var collapseCondiments;

                    if (condDisplayItem && condDisplayItem.open) {
                        collapseCondiments = false;
                    }
                    else if (condDisplayItem) {
                        collapseCondiments = true;
                    }
                    else {
                        collapseCondiments = GeckoJS.Configure.read('vivipos.fec.settings.collapse.condiments');
                    }

                    curTransaction.appendCondiment(index, selectedCondiments, replace, collapseCondiments);

                    this.dispatchEvent('afterAddCondiment', selectedCondiments);
                }
            }
            this._clearAndSubtotal();
        },

        addMemo: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot add memo'));

                this._clearAndSubtotal();
                return;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                this._clearAndSubtotal();
                return;
            }

            // check if the current item is locked
            if (curTransaction.isLocked(index)) {
                NotifyUtils.warn(_('Stored items may not be modified'));

                this._clearAndSubtotal();
                return;
            }

            var memoItem = null;

            if (typeof plu == 'object' && plu.force_memo) {
                memoItem = plu;
            }else {
                if (!plu) plu = buf;
                if (plu != null) plu = GeckoJS.String.trim(plu);
                
                var cartItem = curTransaction.getItemAt(index);
                if (cartItem != null && cartItem.type == 'item') {
                    //xxxx why clone it? so we don't change the default memo
                    memoItem = GREUtils.extend({}, this.Product.getProductById(cartItem.id));
                }
                if (memoItem && plu != null && plu != '') memoItem.memo = plu;
            }

            // if plu is string, check annotation code == plu ?

            var memo;
            if (typeof plu == 'object' || plu == null || plu == '') {
                return this._getMemoDialog(memoItem ? memoItem.memo : '');
            }else if (typeof plu == 'string') {
                var annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
                var annotationType = annotationController.getAnnotationType(plu);
                var annotationText = annotationController.getAnnotationText(plu);
                
                if (annotationText) {
                    return this._getMemoDialog(plu);
                }else {
                    memo = annotationType ? annotationType : GeckoJS.String.trim(plu);
                    curTransaction.appendMemo(index, memo);
                    this._clearAndSubtotal();
                }

            }else {
                memo = GeckoJS.String.trim(plu);
                curTransaction.appendMemo(index, memo);
                this._clearAndSubtotal();
            }

        },

        scrollByLines: function(data) {
            var val = parseInt(data);
            var cart = this._getCartlist();

            if (!isNaN(val)) {
                var mode = 'absolute';
                if (data[0] == '+' || data[0] == '-')
                    mode = 'relative';

                var newIndex;
                var index = cart.selectedIndex;
                if (index < 0) index = 0;

                if (mode == 'absolute') {
                    newIndex = val - 1;
                }
                else if (mode == 'relative') {
                    newIndex = index + val;
                }
                if (newIndex >= cart.rowCount) newIndex = cart.rowCount - 1;
                if (newIndex < 0) {
                    if (cart.rowCount > 0) newIndex = 0;
                    else newIndex = -1;
                }
                cart.selection.select(newIndex);
                cart.ensureRowIsVisible(cart.selectedIndex);
            }
        },

        /**
         * void current transaction
         */
        voidSale: function(autoRefund) {

            autoRefund = autoRefund || '';
            var autoTmp = autoRefund.split(',');
            var autoRefundPayment = GeckoJS.String.parseBoolean(autoTmp[0] || false);
            var autoRefundPaymentType = autoTmp[1] || 'auto';

            autoRefundPaymentType = autoRefundPaymentType.toLowerCase();

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            // check if current transaction is already voided
            if (!curTransaction) {
                NotifyUtils.warn(_('No order to void'));
                return;
            }

            if (curTransaction.isCancel() || curTransaction.isVoided()) {
                NotifyUtils.warn(_('The order has already been cancelled or voided'));
                return;
            }

            // check if current transaction has been stored or completed
            if (curTransaction.data.recall != 1 && curTransaction.data.recall != 2 &&
                curTransaction.data.status != 1 && curTransaction.data.status != 2) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Void Sale'),
                    _('This operation may only be applied to stored and completed transactions'));
                return;
            }

            // check if transaction has been modified
            if (curTransaction.isModified() &&
                !GREUtils.Dialog.confirm(this.topmostWindow,
                    _('Confirm Void'),
                    _('You have made changes to this order; are you sure you want to void the order?'))) {
                return;
            }
            if (this._voidSaleById(curTransaction.data.id, autoRefundPayment, autoRefundPaymentType)) {
                Transaction.removeRecoveryFile();
                curTransaction.data.status = -2;
                this.dispatchEvent('onWarning', _('SALE VOIDED'));
                // remove current transaction from session
                //GeckoJS.Session.remove('current_transaction');
                // dispatch onVoidSaleSuccess event
                curTransaction.alertVoidSales = autoTmp[2] || '0';
                this.dispatchEvent('onVoidSaleSuccess', curTransaction);
            }
            else {
                this.dispatchEvent('onWarning', _('SALE NOT VOIDED'));
            }
        },


        /**
         * void sale by order id
         *
         * @irving: 10/5/2009
         *
         * this method is always invoked from within the cart; the order to be voided
         * needs to be recalled into the cart
         *
         */
        _voidSaleById: function(id, autoRefundPayment, autoRefundPaymentType) {

            autoRefundPayment = GeckoJS.String.parseBoolean(autoRefundPayment || false);
            autoRefundPaymentType = autoRefundPaymentType || 'auto';
            
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            if (!id) return false;

            // load data
            var orderModel = new OrderModel();

            let orderData = orderModel.findById(id);
            if (parseInt(orderModel.lastError) != 0) {
                this._dbError(orderModel.lastError, orderModel.lastErrorString,
                    _('An error was encountered while retrieving order record (error code %s) [message #107].', [orderModel.lastError]));
                return false;
            }

            // blockUI when access remote service
            var waitPanel = this._blockUI('blockui_panel', 'common_wait', _('Retrieving Order'), 0);
            let remoteOrderData = orderModel.readOrder(id, true); // recall use master service's datas.

            this._unblockUI(waitPanel);

            // make sure the order still exists
            if (!orderData && !remoteOrderData) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Void Sale'),
                    _('Failed to void; the selected order no longer exists'));
                orderModel.releaseOrderLock(id);
                return false;
            }

            var orderStatus;
            if (remoteOrderData) {
                if (remoteOrderData.TableOrderLock) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Void Sale'),
                        _('This order is already locked by other terminal. [%S,%S]',  [remoteOrderData.TableOrderLock.machine_id, remoteOrderData.TableOrderLock.machine_addr]));
                    return false;
                }
                orderStatus = remoteOrderData.Order.status;

                if (orderData) {

                    // make sure remote order has same status and is not more recent than local order
                    if (orderData.Order.status != remoteOrderData.Order.status) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Void Sale'),
                            _('Failed to void; the status of the selected order has been changed by another terminal'));
                        orderModel.releaseOrderLock(id);
                        return false;
                    }
                    else if (orderData.Order.modified < remoteOrderData.Order.modified) {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Void Sale'),
                            _('Failed to void; the selected order has been modified by another terminal'));
                        orderModel.releaseOrderLock(id);
                        return false;
                    }
                }
            }
            else {
                orderStatus = orderData.Order.status;
            }

            if (orderStatus < 1) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Void Sale'),
                    _('Failed to void; the selected order is not stored or finalized'));
                orderModel.releaseOrderLock(id);
                return false;
            }

            // allow operator to register refund payments
            var aURL = 'chrome://viviecr/content/refund_payment.xul';
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var features = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + screenwidth + ',height=' + screenheight;

            var inputObj = {
                payments: orderData.OrderPayment,
                paidTotal: orderData.Order.payment_subtotal - orderData.Order.change,
                sequence: orderData.Order.sequence,
                roundingPrices: orderData.Order.rounding_prices,
                precisionPrices: orderData.Order.precision_prices,
                autoRefundPayment: autoRefundPayment,
                autoRefundPaymentType: autoRefundPaymentType
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Payment Refund'), features, inputObj);

            // blockUI when saving...
            waitPanel = this._blockUI('blockui_panel', 'common_wait', _('Voiding Order'), 0);

            if (inputObj.ok) {

                if (this.dispatchEvent('beforeVoidSale', orderData)) {

                    var user = new GeckoJS.AclComponent().getUserPrincipal();

                    // get sale period and shift number
                    var salePeriod = GeckoJS.Session.get('sale_period');
                    var shiftNumber = GeckoJS.Session.get('shift_number');

                    var terminalNo = GeckoJS.Session.get('terminal_no');

                    var refundTotal = 0;

                    var r = true;

                    try {
                        // insert refund payments
                        var order = GREUtils.extend({}, orderData.Order);
                        order['items'] = [];
                        order['refundPayments'] = [];
                        
                        for (var i = 0; r && i < inputObj.refunds.length; i++) {
                            var payment = inputObj.refunds[i];

                            // need to assign uuid to ensure that payments share the same uuid locally and remotely
                            payment.id = GeckoJS.String.uuid();

                            // reverse amount, origin_amount, change
                            payment.order_id = orderData.Order.id;
                            payment.amount = - payment.amount;
                            payment.origin_amount = payment.amount;
                            payment.change = 0;

                            // update proceeds_clerk
                            if (user != null) {
                                payment.proceeds_clerk = user.username;
                                payment.proceeds_clerk_displayname = user.description;
                            }

                            // @irving for backward compatibility, don't set memo1 if it's empty
                            if (payment.memo1 == '') delete payment.memo1;

                            payment.sale_period = salePeriod;
                            payment.shift_number = shiftNumber;
                            payment.terminal_no = terminalNo;

                            // save payment record
                            order['refundPayments'].push(payment);

                            refundTotal += payment.amount;
                        }
                        // update order status to voided
                        order.status = -2;

                        // update payment subtotal
                        order.payment_subtotal += refundTotal;

                        // update void clerk, time, sale period and shift number
                        if (user) {
                            order.void_clerk = user.username;
                            order.void_clerk_displayname = user.description;
                        }
                        order.transaction_voided = Math.round((new Date()).getTime() / 1000);
                        order.void_sale_period = salePeriod;
                        order.void_shift_number = shiftNumber;

                        for (var o in orderData.OrderItem) {

                            // look up corresponding product and set the product id into the item; also reverse quantity
                            var item = orderData.OrderItem[o];
                            var productId = barcodesIndexes[item.product_no];

                            item.current_qty = - item.current_qty;
                            item.id = productId;
                            delete item.stock_maintained;

                            order.items.push(item);

                        }

                        // call remote service to void Order
                        r = orderModel.voidOrder(id, order, true); // force remote service
                        if (!r) {
                            throw {
                                errno: 109,
                                errstr: 'Failed to update order to voided status',
                                errmsg: _('An error was encountered while changing order status to voided [message #109].')
                            };
                        }

                        // restore stock
                        r = this.decStock(order);
                        if (!r) {
                            throw {
                                errno: 110,
                                errstr: 'Failed to update stock level while voiding sale',
                                errmsg: _('An error was encountered while updating stock level [message #110].')
                            };
                        }

                        this.dispatchEvent('afterVoidSale', order);

                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Void Sale'),
                            _('Transaction [%S] successfully voided', [order.sequence]));

                        this._unblockUI(waitPanel);
                        return true;
                    }
                    catch(e) {
                        this._dbError(e.errno, e.errstr, e.errmsg);
                    }
                }
            }
            orderModel.releaseOrderLock(id);
            
            this._unblockUI(waitPanel);

            return false;
        },
        
        /*
         * @author: Slash.tu             2010/04/02
         * @event: this.dispatchEvent('onVoidSaleSuccess', curTransaction);
         *
         * Pop a dialog, users decide if additem from transaction(void sale)
         */
        addItemFormVoidOrder: function(evt){

             let alertVoidSales = evt.data.alertVoidSales;


             if( alertVoidSales != '0' && alertVoidSales != '1' && alertVoidSales != '2'){

                 GREUtils.Dialog.alert(this.topmostWindow,
                            'Void Sale',
                            'Void Sales Function - the 3rd parameter is invalid');
                 return;
             }
                 

             if( alertVoidSales == '2')
                  return;

             if( alertVoidSales == '0'){

                 if (!GREUtils.Dialog.confirm(this.topmostWindow,
                        _('confirm additem form void sale'),
                        _('Would you like to add items to cart from the voided order ?'))) {
                        return;
                    }
             }

             let transaction = evt.data;            

             this.dispatchEvent('onUnlockRecallOrderByNewId', curTransaction);
             
             let curTransaction = this._createNewTransaction(transaction);            

             curTransaction.calcPromotions();
             curTransaction.calcTotal();

             this.dispatchEvent('onGetSubtotal', curTransaction);

             this.dispatchEvent('afterUnlockRecallOrderByNewId', curTransaction);

             this._setTransactionToView(curTransaction);
             //   this.returnItem(true);
             this._clearAndSubtotal();

             this.dispatchEvent('onWarning', 'OPEN ORDER');

             curTransaction.updateCartView(-1, -1);          
        },

        /*Create a new transaction that data is assigned by data of input old transaction*/
        _createNewTransaction: function( oldTrans ){

            let curTransaction = new Transaction(false);

             let id = curTransaction.data.id
             let check_no = curTransaction.data.check_no;
             let seq = curTransaction.data.seq;
             let seq_original = curTransaction.data.seq_original;

             curTransaction.data  = oldTrans.data;

             curTransaction.data.id = id;
             curTransaction.data.check_no = check_no;
             curTransaction.data.seq = seq;
             curTransaction.data.seq_original = seq_original;

             curTransaction.data.close = false ;
             
             /*delete all display sequences batch property*/
             curTransaction.data.display_sequences.forEach(function(item){

                 delete item.batch;
             });

             /*delete all items hasMark property*/
             for( id in curTransaction.data.items){
                 curTransaction.data.items[id].hasMarker = false;
                 curTransaction.data.items[id].created = Math.round(new Date().getTime() / 1000 );
             }

             /* change transaction status*/
             curTransaction.data.status = 0;

             /*keeps item and condiment in the order, others are removed*/
             for(var i = 0 ; i< curTransaction.data.display_sequences.length ; i++){

                  var stuff = curTransaction.data.display_sequences[i];

                  stuff.created = Math.round(new Date().getTime() / 1000 );

                  if(stuff.type != 'item' && stuff.type != 'condiment'){
                      curTransaction.data.display_sequences.splice(i, 1);
                      i--;
                  }
             }

             let subtotal = curTransaction.data.payment_subtotal ;

             /*initialize transaction */
             curTransaction.data.remain = 0;
             curTransaction.data.total = 0;
             curTransaction.data.payment_subtotal = 0;
             curTransaction.data.average_price = 0;
             curTransaction.data.item_subtotal = 0;
             curTransaction.data.batchCount = 0;
             
             delete curTransaction.data.batchItemCount;
             delete curTransaction.data.batchPaymentCount;
             curTransaction.data.trans_payments = {};

             /* reset time*/
             curTransaction.data.created = Math.round(new Date().getTime() / 1000 );
             curTransaction.data.modified = Math.round(new Date().getTime() / 1000 );
             curTransaction.data.transaction_created =  Math.round(new Date().getTime() / 1000 );
             delete curTransaction.data.transaction_submitted;

             /*reset clerk*/
             var user = this.Acl.getUserPrincipal();
             curTransaction.data.proceeds_clerk = user.username;
             curTransaction.data.proceeds_clerk_displayname = user.description;

             var salePeriod = GeckoJS.Session.get('sale_period');
             var shiftNumber = GeckoJS.Session.get('shift_number');

             curTransaction.data.sale_period = salePeriod;
             curTransaction.data.shift_number = shiftNumber;

             // set branch and terminal info
            var terminalNo = GeckoJS.Session.get('terminal_no') || '';
            curTransaction.data.terminal_no = terminalNo;

            var store = GeckoJS.Session.get('storeContact');

            if (store) {
                curTransaction.data.branch = store.branch;
                curTransaction.data.branch_id = store.branch_id;
            }
              
             return curTransaction;
        },

        _getMemoDialog: function (memo) {

            // make sure we've completed previous addItem() call
            if (this._inDialog) return;

            var self = this;

            var annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
            var annotationType = memo ? annotationController.getAnnotationType(memo) : false ;
            var annotationText = annotationType ? annotationController.getAnnotationText(memo) : false ;
            var annotationTypes = annotationController.getAllAnnotationTypes();
            
            // if memo is annotation code
            if (annotationText) {
                annotationTypes = [] ;
                var texts = annotationText.split('|');
                texts.forEach(function(t){
                    annotationTypes.push({type: t, text: t});
                });
                memo = '';
            }
            else if (annotationType) {
                memo = annotationType;
            }

            var inputObj = {
                input0: memo || '',
                require0: false,
                annotations: annotationTypes
            };

            var data = [
            _('Add Memo'),
            '',
            _('Memo'),
            '',
            inputObj
            ];

            self._inDialog = true;

            return $.popupPanel('promptAddMemoPanel', data).next( function(evt){

                self._inDialog = false;

                var result = evt.data;

                if (result.ok && result.input0) {

                    var index = self._cartView.getSelectedIndex();
                    var curTransaction = self._getTransaction();

                    if(curTransaction != null && index >=0) {

                        curTransaction.appendMemo(index, result.input0);
                    }
                }
                self._clearAndSubtotal();

            });

        },

        recallLastSale: function(printer) {
            if (this._lastSaleOrderId == null) {
                //voi attempt to locate last sale from db
                var orderModel = new OrderModel();
                var terminalNo = GeckoJS.Session.get('terminal_no');

                var lastOrder = orderModel.find('first', {conditions: 'terminal_no = "' + terminalNo + '" AND (status = 1 OR status = -2)',
                                                          order: 'transaction_submitted DESC, sequence DESC'});

                if (lastOrder) {
                    this._lastSaleOrderId = lastOrder.id;
                }
            }
            
            if (this._lastSaleOrderId) {
                $do('recallOrder', this._lastSaleOrderId, 'GuestCheck');

                var txn = this._getTransaction();
                if (txn.data.id == this._lastSaleOrderId) {
                // print receipt if printer is specified
                    if (printer != null && printer != '') {
                        var printController = GeckoJS.Controller.getInstanceByName('Print');

                        if (printController) {
                            printController.printReceipts(txn, printer, false, false, true);
                        }
                    }
                    this.dispatchEvent('onWarning', _('LAST SALE RECALLED'));
                }
            }
            else {
                NotifyUtils.warn(_('No sale found'));
            }
        },

        startTraining: function( isTraining ) {
            if ( isTraining ) {

                // We are not going to maintain stock in training mode.
                this._decStockBackUp = this.decStock;
                this.decStock = function() {
                    return true;
                };

                this.clear();
            } else {
                // discard cart content
                this.cancel(true);

                // Use the default stock-maintaining method.
                this.decStock = this._decStockBackUp;

                // clear screen
                this.subtotal();
            }
        },

        recovery: function(data) {

            if(data) {
                var transaction = new Transaction(true);
                transaction.data = data ;

                this._setTransactionToView(transaction);
                transaction.updateCartView(-1, -1);

                // restore price level
                var priceLevel = data.price_level;
                if (priceLevel) {
                    $do('change', priceLevel, 'Pricelevel');
                }

                // restore default tax no
                var defaultTaxNo = data.default_taxno;
                if (defaultTaxNo) {
                    GeckoJS.Session.set('defaultTaxNo', defaultTaxNo);
                }
                this._clearAndSubtotal();
            }
        },

        /**
         * use cart queue controller
         */
        pushQueue: function(nowarning) {
            this.requestCommand('pushQueue', nowarning, 'CartQueue');
        },

        /**
         * use cart queue controller
         */
        pullQueue: function(data) {
            this.requestCommand('pullQueue', data, 'CartQueue');
        },


        /**
         * use guest_check controller
         */
        guestNum: function(num) {
            return this.requestCommand('guestNum', num, 'GuestCheck');
        },

        /**
         * use guest_check controller
         */
        recallCheck: function() {
            return this.requestCommand('recallCheck', null, 'GuestCheck');
        },

        /**
         * use guest_check controller
         */
        recallOrder: function() {
            return this.requestCommand('recallOrder', null, 'GuestCheck');
        },

        /**
         * use guest_check controller
         */
        storeCheck: function() {
            return this.requestCommand('storeCheck', null, 'GuestCheck');
        },

        /**
         * use guest_check controller
         */
        splitCheck: function() {
            return this.requestCommand('splitCheck', null, 'GuestCheck');
        },
        
        /**
         * use guest_check controller
         */
        mergeCheck: function() {
            return this.requestCommand('mergeCheck', null, 'GuestCheck');
        },
        
        /**
         * use cartutils implement
         */
        _dbError: function(errno, errstr, errmsg) {
            this.CartUtils.dbError(errno, errstr, errmsg);
        },

        /**
         * use cartutils implement
         */
        _blockUI: function(panel, caption, title, sleepTime) {
            return this.CartUtils.blockUI(panel, caption, title, sleepTime);
        },

        /**
         * use cartutils implement
         */
        _unblockUI: function(panel) {
            return this.CartUtils.unblockUI(panel);
        }

    };

    GeckoJS.Controller.extend(__controller__);
})();
