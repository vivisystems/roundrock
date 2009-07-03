(function(){

    var __controller__ = {

        name: 'Cart',

        components: ['Tax', 'GuestCheck', 'Barcode'],
        
        _cartView: null,
        _queuePool: null,
        _queueFile: "/var/tmp/cart_queue.txt",
        _queueSession: "cart_queue_pool",
        _defaultQueueFile: "/var/tmp/cart_queue.txt",
        _defaultQueueSession: "cart_queue_pool",
        _trainingQueueFile: "/var/tmp/training_cart_queue.txt",
        _trainingQueueSession: "training_cart_queue_pool",
        _returnMode: false,
        _returnPersist: false,

        beforeFilter: function(evt) {
            var cmd = evt.data;
            if (cmd != 'cancel') {
                this._lastCancelInvoke = false;
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

            // var curTransaction = this._getTransaction();
            // curTransaction.events.addListener('beforeAppendItem', obj, this);
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            // catch changes to price level and store it in txn.data
            var events = GeckoJS.Session.getInstance().events;
            if (events) {
                events.addListener('change', this.sessionHandler, this);
                events.addListener('remove', this.sessionHandler, this);
                events.addListener('clear', this.sessionHandler, this);
            }
            
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

        sessionHandler: function(evt) {
            var txn = this._getTransaction();
            if (txn == null || txn.data == null || txn.isSubmit() || txn.isCancel())
                return;

            var key;
            switch(evt.type) {
                case 'change':
                    key = evt.getData().key;
                    if (key == 'vivipos_fec_price_level') {
                        txn.data.price_level = evt.getData().value;
                        Transaction.serializeToRecoveryFile(txn);
                    }
                    break;

                case 'remove':
                    key = evt.getData().key;
                    if (key == 'vivipos_fec_price_level') {
                        delete txn.data.price_level;
                    }
                    break;

                case 'remove':
                    delete txn.data.price_level;
                    break;
            }
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
                GeckoJS.Session.remove('current_transaction');
                return ;
            }
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
            
            try {
                var curTransaction = new Transaction();
            }catch(e) {}
            
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
        
        ifHavingOpenedOrder: function() {
            var curTransaction = this._getTransaction();

            if( curTransaction && !curTransaction.isSubmit() && !curTransaction.isCancel() )
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

        checkStock: function() {
            // not implemented here
            return true;
        },

        decStock: function() {
            // not implemented here
            return true;
        },

        tagItem: function(tag) {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot tag the selected item'));

                this.clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                this.clearAndSubtotal();
                return;
            }

            if(index <0) {
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

            if (tag == null || tag.length == 0) {
                NotifyUtils.warn(_('Cannot tag the selected item with an empty tag'));

                this.clearAndSubtotal();
                return;
            }

            var itemTrans = curTransaction.getItemAt(index, true);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                NotifyUtils.warn(_('Cannot tag the selected item [%S]', [itemDisplay.name]));

                this.clearAndSubtotal();
                return;
            }

            if (this.dispatchEvent('beforeTagItem', {
                item: itemTrans,
                itemDisplay: itemDisplay
            })) {
                var taggedItem = curTransaction.tagItemAt(index, tag);

                this.dispatchEvent('afterTagItem', [taggedItem, itemDisplay]);
            }
            this.clearAndSubtotal();
        },

        returnCartItem: function() {
            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            var exit = false;

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

            var itemTrans = curTransaction.getItemAt(index, true);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);
            
            if (!exit && itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                NotifyUtils.warn(_('The selected item [%S] is not a product and cannot be returned', [itemDisplay.name]));

                exit = true;
            }

            // locate product
            if (!exit) {
                var productsById = GeckoJS.Session.get('productsById');
                var plu;
                if (productsById) {
                    plu = productsById[itemTrans.id];
                }

                if (!plu) {
                    // sale department?
                    var categoriesByNo = GeckoJS.Session.get('categoriesByNo');
                    plu = categoriesByNo[itemTrans.no];
                }
            }

            if (!exit) {
                if (plu) {
                    var currentReturnMode = this._returnMode;
                    this._returnMode = true;

                    // determine price:
                    // 1. if manually entered into keypad buffer, use that price
                    // 2. otherwise, use price from selected cart item
                    var buf = this._getKeypadController().getBuffer(true);
                    if (!buf) {
                        this.setPrice(itemTrans.current_price);
                    }

                    this.addItem(plu);

                    this._returnMode = currentReturnMode;
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Memory Error'),
                        _('Failed to locate product [%S]. Please restart machine immediately to ensure proper operation', [itemDisplay.name]));
                    exit = true;
                }
            }

            if (exit) {
                this._getKeypadController().clearBuffer();
                this._clearAndSubtotal();
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

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                curTransaction = this._newTransaction();
            }
            
            // check if has buffer
            if (buf.length>0) {
                this.setPrice(buf);
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
                    this._setItemSelectionDialog(curTransaction, item);
                    return;
                }

                if (this._returnMode) {
                    var qty = 0 - (GeckoJS.Session.get('cart_set_qty_value') || 1);
                    GeckoJS.Session.set('cart_set_qty_value', qty);
                }
                var addedItem = curTransaction.appendItem(item);
                var doSIS = plu.single && curTransaction.data.items_count == 1 && !this._returnMode;

                this.dispatchEvent('onAddItem', addedItem);

                this.dispatchEvent('afterAddItem', addedItem);

                var self = this;
                var cart = this._getCartlist();
                
                // wrap with chain method
                next( function() {

                    if (addedItem.id == plu.id && !self._returnMode) {

                        currentIndex = curTransaction.getDisplayIndexByIndex(addedItem.index);
                        return next( function() {

                            if (plu.force_condiment) {
                                var condGroupsByPLU = GeckoJS.Session.get('condGroupsByPLU');
                                var conds = condGroupsByPLU[plu.cond_group]['Condiments'];

                                if (conds.length > 0) {
                                    // need to move cursor to addedItem
                                    cart.selection.select(currentIndex);

                                    return self.addCondiment(plu, null, doSIS);
                                }
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
                        self._addPayment('cash');
                        self.dispatchEvent('onWarning', _('SINGLE ITEM SALE'));
                    }
                    else {
                        self._clearAndSubtotal();
                    }

                });

            }
            else {
                this._clearAndSubtotal();
            }
        //this._getCartlist().refresh();
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

                    barcode = pluno;
                }

            }

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

                NotifyUtils.warn(_('Product number/barcode [%S] not found', [barcode]));
            }else {
                var id = barcodesIndexes[barcode];
                var product = productsById[id];
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

            // if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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
                this.dispatchEvent('onModifyItemError', {});

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

            if (itemDisplay.type == 'condiment') {

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
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has been subtotaled', [itemTrans.name]));

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
            
            // check if zero preset price is allowed
            var positivePriceRequired = GeckoJS.Configure.read('vivipos.fec.settings.PositivePriceRequired') || false;

            if (positivePriceRequired && curTransaction != null) {
                if (curTransaction.checkSellPrice(itemTrans) <= 0) {
                    NotifyUtils.warn(_('Product [%S] may not be modified with a price of [%S]!', [itemTrans.name, curTransaction.formatPrice(0)]));

                    this._clearAndSubtotal();
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
            this._clearAndSubtotal();
			
        },
	

        modifyQty: function(action, delta) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge || itemTrans.hasMarker) {
                NotifyUtils.warn(_('Cannot modify; selected item [%S] has discount or surcharge applied', [itemDisplay.name]));

                this._clearAndSubtotal();
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
                NotifyUtils.warn(_('Quantity may not be less than 1'));
                this._clearAndSubtotal();
            }
        },

        _clearAndSubtotal: function() {
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();
        },

        returnItem: function(cancel) {

            if (cancel || this._returnMode) {
                if (!cancel) {
                    if (this._returnPersist) {
                        this._returnPersist = false;
                        this._getKeypadController().clearBuffer();
                        this.clearAndSubtotal();
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

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            this._cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            this._addDiscount(discountAmount, '$', discountName, false);
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

            this._cancelReturn();

            if ((discountAmount == null || discountAmount == '') && buf.length>0) {
                discountAmount = buf;
            }

            if (discountName == null || discountName == '') {
                discountName = '-' + discountAmount + '%';
            }

            this._addDiscount(discountAmount, '%', discountName, pretax);
        },


        addPretaxDiscountByPercentage: function(args) {
            this.addDiscountByPercentage(args, true);
        },


        _addDiscount: function(discountAmount, discountType, discountName, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            if(index <0) {
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

            if (pretax && itemDisplay.type != 'subtotal') {
                NotifyUtils.warn(_('Pretax discount can only be registered against subtotals'));

                this._clearAndSubtotal();
                return;
            }

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
                    NotifyUtils.warn(_('Cannot apply discount to [%S]. It is not the last registered item', [itemDisplay.name]));

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
                amount: discountAmount,
                pretax: (pretax == null) ? false : pretax
            };
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItem = curTransaction.appendDiscount(index, discountItem);

            this.dispatchEvent('afterAddDiscount', discountedItem);

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
            var buf = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            if ((surchargeAmount != null || surchargeAmount != '') && buf.length>0) {
                surchargeAmount = buf;
            }

            this._addSurcharge(surchargeAmount, '$', surchargeName, false);
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

            this._cancelReturn();

            if ((surchargeAmount == null || surchargeAmount == '') && buf.length>0) {
                surchargeAmount = buf;
            }

            if (surchargeName == null || surchargeName == '') {
                surchargeName = '+' + surchargeAmount + '%';
            }

            this._addSurcharge(surchargeAmount, '%', surchargeName, false);
        },


        addPretaxSurchargeByPercentage: function(args) {
            this.addSurchargeByPercentage(args, true);
        },


        _addSurcharge: function(surchargeAmount, surchargeType, name, pretax) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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
            
            if (pretax && itemDisplay.type != 'subtotal') {
                NotifyUtils.warn(_('Pretax surcharge can only be registered against subtotals'));

                this._clearAndSubtotal();
                return;
            }
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
                amount: surchargeAmount,
                pretax: (pretax == null) ? false : pretax
            };
            this.dispatchEvent('beforeAddSurcharge', surchargeItem);

            var surchargedItem = curTransaction.appendSurcharge(index, surchargeItem);

            this.dispatchEvent('afterAddSurcharge', surchargedItem);

            this._clearAndSubtotal();
        },


        addMarker: function(type) {
            type = type || _('subtotal');

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            if (itemDisplay.type == type) {
                this._clearAndSubtotal();
                return;
            }

            this.dispatchEvent('beforeAddMarker', type);

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

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

        currencyConvert: function(convertCode) {

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

            // check if order is open
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
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
                this._addPayment('cash', amount, origin_amount, memo1, memo2);
            }
            else {
                if (buf.length==0) {
                    NotifyUtils.warn(_('Please enter an amount first'));
                }
                else if (currencies == null || currencies.length <= convertIndex) {
                    NotifyUtils.warn(_('Please configure the selected currency entry first [%S]', [convertIndex]));
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

        creditCard: function(args) {

            var argList = [];
            if (args != null && args != '') {
                argList = args.split(',');
            }

            var type = argList[0];
            var silent = argList[1];

            if (type == null) type = '';

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            var payment = parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();
            
            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                // payment refund
                if (false && payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));

                    this._clearAndSubtotal();
                    return;
                }

            }
            else {
                if (balance <= 0) {
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this._clearAndSubtotal();
                    return;
                }

                if (payment == 0 || isNaN(payment)) {
                    payment = balance;
                }

                if (payment > balance) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Credit Card Payment Error'),
                        _('Credit card payment may not exceed remaining balance'));

                    this._clearAndSubtotal();
                    return;
                }
            }

            if (silent && type != '') {
                this._addPayment('creditcard', payment, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this._getCreditCardDialog(data).next(function(evt) {

                    var result = evt.data;

                    if (result.ok) {
                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';
                        self._addPayment('creditcard', payment, payment, memo1, memo2);
                    }
                    else {
                        self._clearAndSubtotal();
                    }
                });
            }
            return;

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
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            var payment = (amount != null) ? amount : parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                // payment refund
                if (false && payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));

                    this._clearAndSubtotal();
                    return;
                }

            }
            else {
                if (balance <= 0) {
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this._clearAndSubtotal();
                    return;
                }

                if (payment == null || payment == 0 || isNaN(payment)) {
                    payment = balance;
                }
            }

            if (silent && type != '') {
                this._addPayment('coupon', payment, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this._getCouponDialog(data).next(function(evt){

                    var result = evt.data;

                    if(result.ok) {

                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';

                        self._addPayment('coupon', payment, payment, memo1, memo2);

                    }
                    else {
                        self._clearAndSubtotal();
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
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            var payment = (amount != null) ? amount : parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                // payment refund
                if (false && payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));

                    this._clearAndSubtotal();
                    return;
                }

            }
            else {
                if (balance <= 0) {
                    this.clear();

                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this._clearAndSubtotal();
                    return;
                }

                if (payment == 0 || isNaN(payment)) {
                    payment = balance;
                }

                if (payment > balance) {
                    if (GREUtils.Dialog.confirm(this.topmostWindow,
                        _('confirm giftcard payment'),
                        _('Change of [%S] will NOT be given for this type of payment. Proceed?',
                            [curTransaction.formatPrice(payment - balance)])) == false) {

                        this._clearAndSubtotal();
                        return;
                    }
                }
                else {
                    balance = payment;
                }
            }
            if (silent && type != '') {
                this._addPayment('giftcard', balance, payment, type, '');
            }
            else {
                var data = {
                    type: type,
                    payment: curTransaction.formatPrice(payment)
                };

                var self = this;

                return this._getGiftcardDialog(data).next(function(evt){

                    var result = evt.data;

                    if(result.ok) {

                        var memo1 = result.input0 || '';
                        var memo2 = result.input1 || '';

                        self._addPayment('giftcard', balance, payment, memo1, memo2);

                    }
                    else {
                        self._clearAndSubtotal();
                    }
                });
            }
        },

        check: function(type) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();

            // check if order is open
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot register payments'));

                this._clearAndSubtotal();
                return;
            }

            var payment = parseFloat(buf);
            var balance = curTransaction.getRemainTotal();
            var paid = curTransaction.getPaymentSubtotal();

            if (this._returnMode) {
                if (payment == null || payment == 0 || isNaN(payment)) {
                    // if amount no given, set amount to amount paid
                    payment = paid;
                }

                // payment refund
                if (false && payment > paid) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed amount paid [%S]',
                        [curTransaction.formatPrice(payment), curTransaction.formatPrice(paid)]));

                    this._clearAndSubtotal();
                    return;
                }

            }
            else {
                if (balance <= 0) {
                    NotifyUtils.warn(_('No payments accepted when balance is zero or negative'));

                    this._clearAndSubtotal();
                    return;
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
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Check Payment Error'),
                            _('Check Cashing limit of [%S] exceeded', [curTransaction.formatPrice(limit)]));

                        this._clearAndSubtotal();
                        return;
                    }
                }
            }

            var data = {
                type: type,
                payment: curTransaction.formatPrice(payment)
            };

            var self = this;

            return this._getCheckDialog(data).next(function(evt){

                var result = evt.data;

                if(result.ok) {

                    var memo1 = result.input0 || '';
                    var memo2 = result.input1 || '';

                    self._addPayment('check', payment, payment, memo1, memo2);

                }
                else {
                    self._clearAndSubtotal();
                }
            });

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
                    _('An error was encountered while retrieving ledger entry types (error code %s)', [ledgerEntryTypeModel.lastError]));
                this._clearAndSubtotal();
                return;
            }

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

                    // amount must be given on input line
                    var amount = parseFloat(buf);
                    if (isNaN(amount)) {
                        NotifyUtils.warn(_('Please enter an amount first'));
                        this._clearAndSubtotal();
                        return;
                    }

                    inputObj.ok = true;
                    inputObj.description = '';
                    inputObj.type = inputObj.entry_types[i].type;
                    inputObj.mode = inputObj.entry_types[i].mode;
                    inputObj.amount = amount;
                    inputObj.display_name = userDisplayName;
                }
                else {
                    NotifyUtils.warn(_('Specified ledger entry type [%S] is not defined', [entryType]));
                    this._clearAndSubtotal();
                    return;
                }
            }
            else {
                var aURL = 'chrome://viviecr/content/prompt_add_ledger_entry.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';

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

        _addPayment: function(type, amount, origin_amount, memo1, memo2) {

            var curTransaction = this._getTransaction();
            var returnMode = this._returnMode;

            this._cancelReturn();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            var paymentsTypes = GeckoJS.BaseObject.getKeys(curTransaction.getPayments());

            if (returnMode) {
                // payment refund
                var err = false;
                if (false && paymentsTypes.length == 0) {
                    NotifyUtils.warn(_('No payment has been made; cannot register refund payment'));
                    err = true;
                }

                if (amount == null || amount == 0 || isNaN(amount)) {
                    // if amount no given, set amount to amount paid
                    amount = curTransaction.getPaymentSubtotal();
                }

                // payment refund
                if (!err && amount > curTransaction.getPaymentSubtotal()) {
                    NotifyUtils.warn(_('Refund amount [%S] may not exceed payment amount [%S]',
                        [curTransaction.formatPrice(amount), curTransaction.formatPrice(curTransaction.getPaymentSubtotal())]));
                    err = true;
                }

                if (err) {
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
            //this._getCartlist().refresh();
            }
            
            type = type || 'cash';
            amount = amount || false;

            if(!amount) {
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
                origin_amount: origin_amount,
                transaction: curTransaction
            };
            
            var beforeResult = this.dispatchEvent('beforeAddPayment', paymentItem);

            if (beforeResult) {
                var paymentedItem = curTransaction.appendPayment(type, amount, origin_amount, memo1, memo2);

                paymentedItem.seq = curTransaction.data.seq;

                this.dispatchEvent('afterAddPayment', paymentedItem);

                this._getCartlist().refresh();
                if (curTransaction.getRemainTotal() <= 0) {
                    if (!this.submit()) {
                        // remove last payment
                        this.voidItem();
                    }
                }else {
                    this._clearAndSubtotal();
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

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
            
            return $.popupPanel('paymentDetailsPanel', dialog_data);

        },

        readScale: function(number) {
            this._getKeypadController().clearBuffer();

            number = parseInt(number);
            if (isNaN(number) || number < 1 || number > 2) {
                number = null;
            }

            var scaleController = GeckoJS.Controller.getInstanceByName('Scale');
            if (scaleController) {
                var qty = scaleController.readScale(number);

                if (qty == null) {
                    NotifyUtils.warn(_('Failed to read from scale'))
                }
                else if (qty <= 0) {
                    NotifyUtils.warn(_('Illegal weight [%S] returned from scale', [qty]));
                }
                else {
                    this.setQty(qty);
                }
            }
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

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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
            if (itemTrans == null || itemTrans.type != 'item') {
                var displayItem = curTransaction.getDisplaySeqAt(index);
                NotifyUtils.warn(_('This operation cannot be performed on [%S]', [displayItem.name]));

                this._clearAndSubtotal();
                return;
            }

            if (itemTrans.hasMarker) {
                NotifyUtils.warn(_('Cannot modify an item that has been subtotaled'));

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

            this.dispatchEvent('afterShiftTax', modifiedItem);

            this._clearAndSubtotal();

        },

        clear: function() {
            
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn(true);

            if(curTransaction == null) {
                this.dispatchEvent('onClear', null);
                return;
            }
            this.dispatchEvent('onClear', curTransaction);

            if (!this.ifHavingOpenedOrder()) {
                this._cartView.empty();
                GeckoJS.Session.remove('current_transaction');
                return ;
            }

        },

        cancel: function(forceCancel) {

            this._getKeypadController().clearBuffer();
            this._cancelReturn(true);

            // cancel cart but save
            var curTransaction = this._getTransaction();
            if (!this.ifHavingOpenedOrder()) {
                
                this.clear();

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
                //GREUtils.Sound.play('chrome://viviecr/content/sounds/beep.wav');
                }catch(e) {                  
                }
                // prevent onCancel event dispatch
                this.dispatchedEvents['onCancel'] = true;
                this._lastCancelInvoke = now;
                return ;
            }
            this._lastCancelInvoke = now;

            this.dispatchEvent('beforeCancel', curTransaction);
            
            // if the order has been stored, then it cannot be cancelled; it must be voided instead
            if (curTransaction.data.recall == 2) {
                
                // determine if new items have been added
                if (!curTransaction.isModified() || forceCancel ||
                    GREUtils.Dialog.confirm(this.topmostWindow,
                        _('confirm cancel'),
                        _('Are you sure you want to discard changes made to this order?'))) {
                    curTransaction.process(-1, true);
                    this._cartView.empty();

                    this.clear();
                }
                else {
                    this.dispatchEvent('onCancel', curTransaction);
                }
            }
            else {
                curTransaction.cancel();
            }
            
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
            this._cancelReturn();
            
            //if (oldTransaction == null || oldTransaction.isCancel() || oldTransaction.isSubmit()) {
            if (oldTransaction == null) {
                this.dispatchEvent('onGetSubtotal', null);
            }
            else {
                if (!oldTransaction.isCancel() && !oldTransaction.isSubmit()) {
                    Transaction.serializeToRecoveryFile(oldTransaction);
                }
                this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
        },


        submit: function(status) {

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            var oldTransaction = this._getTransaction();
            
            if(oldTransaction == null) return false;

            //var submitStatus = parseInt(oldTransaction.submit(status));
            //return;

            // make sure the order has not yet been voided or submitted
            var orderModel = new OrderModel();
            var existingOrder = orderModel.findById(oldTransaction.data.id, 0, "id,status");
            if (parseInt(orderModel.lastError) != 0) {
                this._dbError(orderModel.lastError, orderModel.lastErrorString,
                    _('An error was encountered while retrieving transaction record (error code %S).', [orderModel.lastError]));
                return false;
            }

            if (existingOrder && existingOrder.status != 2) {
                oldTransaction.data.status = existingOrder.status;
                var statusStr;
                switch(parseInt(existingOrder.status)) {
                    case 1:
                        statusStr = _('completed');
                        break;

                    case 2:
                        statusStr = _('stored');
                        break;

                    case -1:
                        statusStr = _('cancelled');
                        break;

                    case -2:
                        statusStr = _('voided');
                        break;

                    default:
                        statusStr = existingOrder.status;
                        break;
                }
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Order Finalization'),
                    _('Current order is no longer available for finalization (status = %S)', [statusStr]));
                return false;
            }
            if (status == null) status = 1;
            if (status == 1 && oldTransaction.getRemainTotal() > 0) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Order Finalization'),
                    _('Current order has non-zero balance and may not be closed'));
                return false;
            }

            if (status == 1) {
                var user = GeckoJS.Session.get('user');
                var adjustment_amount = oldTransaction.data.trans_discount_subtotal + oldTransaction.data.trans_surcharge_subtotal +
                                        oldTransaction.data.item_discount_subtotal + oldTransaction.data.item_surcharge_subtotal;
                if (adjustment_amount > 0) {
                    // check if order surcharge exceed user limit
                    var surcharge_limit = parseInt(user.order_surcharge_limit);
                    if (!isNaN(surcharge_limit) && surcharge_limit > 0) {
                        var surcharge_limit_amount = oldTransaction._computeLimit(oldTransaction.data.item_subtotal, surcharge_limit, user.order_surcharge_limit_type);
                        if (adjustment_amount > surcharge_limit_amount) {
                            NotifyUtils.warn(_('Total surcharge [%S] may not exceed user order surcharge limit [%S]',
                                               [adjustment_amount, surcharge_limit_amount]));
                            return false;
                        }
                    }
                }
                else if (adjustment_amount < 0) {
                    // check if order discount exceed user limit
                    adjustment_amount = 0 - adjustment_amount;
                    var discount_limit = parseInt(user.order_discount_limit);
                    if (!isNaN(discount_limit) && discount_limit > 0) {
                        var discount_limit_amount = oldTransaction._computeLimit(oldTransaction.data.item_subtotal, discount_limit, user.order_discount_limit_type);
                        if (adjustment_amount > discount_limit_amount) {
                            NotifyUtils.warn(_('Total discount [%S] may not exceed user order discount limit [%S]',
                                               [adjustment_amount, discount_limit_amount]));
                            return false;
                        }
                    }
                }
            }

            if (this.dispatchEvent('beforeSubmit', {
                status: status,
                txn: oldTransaction
            })) {
            
                oldTransaction.lockItems();

                // save order unless the order is being finalized (i.e. status == 1)
                if (status == 1) {
                    var user = this.Acl.getUserPrincipal();
                    if ( user != null ) {
                        oldTransaction.data.proceeds_clerk = user.username;
                        oldTransaction.data.proceeds_clerk_displayname = user.description;
                    }

                    // check and dec stock
                    this.decStock(oldTransaction.data);

                }

                

                var submitStatus = parseInt(oldTransaction.submit(status));
                /*
                 *   1: success
                 *   null: input data is null
                 *   -1: save fail, save to backup
                 *   -2: remove fail
                 */
                if (submitStatus == -2) {

                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Submit Fail'),
                        _('Current order is not saved successfully, please try again...'));
                    return false;
                }

                oldTransaction.data.status = status;
                this.dispatchEvent('afterSubmit', oldTransaction);

                // sleep to allow UI events to update
                //this.sleep(100);

                //this.dispatchEvent('onClear', 0.00);
                this._getKeypadController().clearBuffer();
                this._cancelReturn(true);

                // clear register screen if needed
                if (GeckoJS.Configure.read('vivipos.fec.settings.ClearCartAfterFinalization')) {
                    this._cartView.empty();
                }

                if (status != 2) {
                    if (status != 1) this.clearWarning();
                    this.dispatchEvent('onSubmit', oldTransaction);
                }
                else {
                    this.dispatchEvent('onGetSubtotal', oldTransaction);
                }
            }
            else {
                this.dispatchEvent('onGetSubtotal', oldTransaction);
            }
            return true;
        },


        // pre-finalize the order by closing it
        preFinalize: function(args) {
        	
            var curTransaction = this._getTransaction();

            //if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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

            if (!this.dispatchEvent('beforePreFinalize', curTransaction)) {
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
                                if (!('annotations' in curTransaction.data)) {
                                    curTransaction.data.annotations = {};
                                }
                                curTransaction.data.annotations[ annotationType ] = result.input0;
                            }

                            curTransaction.close();
                            self.submit(2);
                            self.dispatchEvent('onWarning', _('PRE-FINALIZED'));

                            // dispatch onSubmit event here manually since submit() won't do it for us
                            self.dispatchEvent('onSubmit', curTransaction);

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
            this.dispatchEvent('onSubmit', curTransaction);

            NotifyUtils.warn(_('Order# [%S] has been pre-finalized', [curTransaction.data.seq]));

            this.dispatchEvent('afterPreFinalize', curTransaction);
        },

        cash: function(amount) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer(true);
            this._getKeypadController().clearBuffer();
            
            if (buf.length>0) {
                if (!amount) amount = parseFloat(buf);
            }

            this._addPayment('cash', amount);
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

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
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
                var productsById = GeckoJS.Session.get('productsById');
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
                //condimentItem = GREUtils.extend({}, productsById[cartItem.id]);
                condimentItem = productsById[setItem.id];

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
            if (condimentItem) {
                if(!condimentItem.cond_group && !immediateMode){
                    NotifyUtils.warn(_('No Condiment group associated with item [%S]', [condimentItem.name]));

                    this._clearAndSubtotal();
                    return d;
                }
                else if (immediateMode && condiments) {
                    this._appendCondiments(condiments, false);
                }
                else {
                    return this._getCondimentsDialog(condimentItem.cond_group, condiments);
                }
                
            }
            return d;

        },

        _getCondimentsDialog: function (condgroup, condiments) {

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
                var condNames = condiments.map(function(c) {
                    return c.name
                });
                for (var i = 0; i < conds.length; i++) {
                    if (condNames.indexOf(conds[i].name) > -1) {
                        selectedItems.push(i);
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
            var self = this;
            return $.popupPanel('selectCondimentPanel', dialog_data).next(function(evt){
                var selectedCondiments = evt.data.condiments;
                if (selectedCondiments.length > 0) {
                    self._appendCondiments(selectedCondiments.concat(additionalItems), true);
                }
                else {
                    this._clearAndSubtotal();
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
            this._clearAndSubtotal();
        },

        addMemo: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            this._getKeypadController().clearBuffer();
            this._cancelReturn();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
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
                this._getMemoDialog(memoItem ? memoItem.memo : '');
            }
            else {
                memo = GeckoJS.String.trim(plu);
                curTransaction.appendMemo(index, memo);
                this._clearAndSubtotal();
            }           
            return d;

        },


        voidSale: function(id) {
            
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            if (!id) return false;

            // load data
            var orderModel = new OrderModel();
            var order = orderModel.findById(id, 2);
            if (parseInt(orderModel.lastError) != 0) {
                this._dbError(orderModel.lastError, orderModel.lastErrorString,
                    _('An error was encountered while retrieving order payment records (error code %S).', [orderModel.lastError]));
                return false;
            }

            if (!order) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Void Sale'),
                    _('Failed to void: the selected order no longer exists'));
                return false;
            }

            if (order.status < 1) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Void Sale'),
                    _('Failed to void: the selected order is not stored or finalized'));
                return false;
            }

            // allow operator to register refund payments
            var aURL = 'chrome://viviecr/content/refund_payment.xul';
            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

            var inputObj = {
                payments: order.OrderPayment,
                paidTotal: order.payment_subtotal - order.change,
                sequence: order.sequence,
                roundingPrices: order.rounding_prices,
                precisionPrices: order.precision_prices
            };
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Payment Refund'), features, inputObj);

            if (inputObj.ok) {
                if (this.dispatchEvent('beforeVoidSale', order)) {

                    var user = new GeckoJS.AclComponent().getUserPrincipal();

                    // get sale period and shift number
                    var salePeriod = GeckoJS.Session.get('sale_period');
                    var shiftNumber = GeckoJS.Session.get('shift_number');

                    var terminalNo = GeckoJS.Session.get('terminal_no');

                    var paymentModel = new OrderPaymentModel();
                    var refundTotal = 0;

                    // insert refund payments
                    try {
                        alert('before void sale begin');
                        var r = paymentModel.begin();
                        if (!r) {
                            throw {
                                errno: paymentModel.lastError,
                                errstr: paymentModel.lastErrorString,
                                errmsg: 'An error was encountered while preparing to void sale; order is not voided.'
                            };
                        }
                    
                        for (var i = 0; r && i < inputObj.refunds.length; i++) {
                            var payment = inputObj.refunds[i];

                            // reverse amount, origin_amount, change
                            payment.id = '';
                            payment.order_id = order.id;
                            payment.amount = - payment.amount;
                            payment.origin_amount = payment.amount;
                            payment.change = 0;

                            // update proceeds_clerk
                            if (user != null) {
                                payment.proceeds_clerk = user.username;
                                payment.proceeds_clerk_displayname = user.description;
                            }

                            payment.sale_period = salePeriod;
                            payment.shift_number = shiftNumber;
                            payment.terminal_no = terminalNo;

                            // save payment record
                            alert('before saving refund payment');
                            r = paymentModel.save(payment);
                            if (!r) {
                                throw {
                                    errno: paymentModel.lastError,
                                    errstr: paymentModel.lastErrorString,
                                    errmsg: 'An error was encountered while saving refund payment; order is not voided.'
                                };
                            }

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
                        order.transaction_voided = (new Date()).getTime() / 1000;
                        order.void_sale_period = salePeriod;
                        order.void_shift_number = shiftNumber;

                        orderModel.id = order.id;
                        alert('before updating order status');
                        r = orderModel.save(order);
                        if (!r) {
                            throw {
                                errno: paymentModel.lastError,
                                errstr: paymentModel.lastErrorString,
                                errmsg: 'An error was encountered while updating order status; order is not voided.'
                            };
                        }

                        for (var o in order.OrderItem) {

                            // look up corresponding product and set the product id into the item; also reverse quantity
                            var item = order.OrderItem[o];
                            var productId = barcodesIndexes[item.product_no];

                            item.current_qty = - item.current_qty;
                            item.id = productId;
                        }
                        order.items = order.OrderItem;

                        // restore stock
//                        var stockController = GeckoJS.Controller.getInstanceByName( 'StockRecords' );
//                        alert('before updating stock level');
                        r = this.decStock(order);
                        if (!r) {
                            throw {
                                errno: paymentModel.lastError,
                                errstr: paymentModel.lastErrorString,
                                errmsg: 'An error was encountered while updating stock level; order is not voided.'
                            };
                        }

//                        alert('before committing');
                        r = paymentModel.commit();
                        if (!r) {
                            throw {
                                errno: paymentModel.lastError,
                                errstr: paymentModel.lastErrorString,
                                errmsg: 'An error was encountered while voiding sale; order is not voided.'
                            };
                        }

                        this.dispatchEvent('afterVoidSale', order);

                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Void Sale'),
                            _('Transaction [%S] successfully voided', [order.sequence]));

                        return true;
                    }
                    catch(e) {
                        paymentModel.rollback();

                        this._dbError(e.errno, e.errstr, e.errmsg);
                    }
                }
            }
            return false;
        },

        _getMemoDialog: function (memo) {

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
                self._clearAndSubtotal();

            });

        },
        
        startTraining: function( isTraining ) {
            if ( isTraining ) {
                this._queueFile = this._trainingQueueFile;
                this._queueSession = this._trainingQueueSession;

                this.clear();
            } else {
                // discard cart content
                this.cancel(true);
                
                GeckoJS.Session.remove( this._queueSession );
                this._queueFile = this._defaultQueueFile;
                this._queueSession = this._defaultQueueSession;

                // clear screen
                this.subtotal();
            }
        },

        removeQueueRecoveryFile: function() {
            
            // unserialize from fail recovery file
            var file = new GeckoJS.File(this._queueFile);

            if (!file.exists()) return false;

            file.remove();
        },

        serializeQueueToRecoveryFile: function(queue) {

            // save serialize to fail recovery file
            var file = new GeckoJS.File(this._queueFile);
            file.open("w");
            file.write(GeckoJS.BaseObject.serialize(queue));
            file.close();
            delete file;

        },

        unserializeQueueFromRecoveryFile: function() {
            
            // unserialize from fail recovery file
            var file = new GeckoJS.File(this._queueFile);

            if (!file.exists()) return false;

            var data = null;
            file.open("r");
            data = GeckoJS.BaseObject.unserialize(file.read());
            file.close();
            // file.remove();
            delete file;

            this._queuePool = data;
            GeckoJS.Session.set(this._queueSession, this._queuePool);

        },

        _getQueuePool: function() {

            this._queuePool = GeckoJS.Session.get(this._queueSession);
            if (this._queuePool == null) {
                this._queuePool = {
                    user: {},
                    data:{}
                };
                GeckoJS.Session.set(this._queueSession, this._queuePool);
            }

            return this._queuePool;
            
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

            /*if (!user) return false;

            var queuePool = this._getQueuePool();

            var username = user.username;

            if(!queuePool.user[username] || queuePool.user[username].constructor.name != 'Array') {
                return ;
            }*/
            
            if ( !this._hasUserQueue( user ) )
                return;

            var removeCount = 0;
            var queuePool = this._getQueuePool();
            var username = user.username;

            queuePool.user[username].forEach(function(key){

                // just delete queue
                if(queuePool.data[key]) delete queuePool.data[key];

                removeCount++;
                
            }, this);

            delete queuePool.user[username];

            this.serializeQueueToRecoveryFile(queuePool);

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
            this.serializeQueueToRecoveryFile(queuePool);
        },

        pushQueue: function(nowarning) {
            
            var curTransaction = this._getTransaction();

            //if(curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
            if( !this.ifHavingOpenedOrder() ) {
                if (!nowarning) {
                    NotifyUtils.warn(_('No order to queue'));
                    this._clearAndSubtotal();
                }
                return;
            }

            if (curTransaction.data.recall == 2) {
                if (!nowarning) {
                    NotifyUtils.warn(_('Cannot queue the recalled order!!'));
                    this._clearAndSubtotal();
                }
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

                this.serializeQueueToRecoveryFile(queuePool);

                Transaction.removeRecoveryFile();
            }
            else {
                if (!nowarning) {
                    NotifyUtils.warn(_('Order is not queued because it is empty'));
                    this._clearAndSubtotal();
                }
                return;
            }
        
        },

        _getQueueIdDialog: function() {

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

            return this._getQueueIdDialog().next(function(evt){

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

                self._clearAndSubtotal();

                self.serializeQueueToRecoveryFile(queuePool);

                self.dispatchEvent('afterPullQueue', curTransaction);
            });

        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id;

            var curTransaction = new Transaction();
            curTransaction.unserializeFromOrder(order_id);

            if (curTransaction.data == null) {
                NotifyUtils.error(_('The order object does not exist [%S]', [order_id]));

                return false;
            }

            if (curTransaction.data.status == 2) {
                // set order status to process (0)
                curTransaction.data.status = 0;

                curTransaction.data.recall = 2;
            }

            this._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);
            this._clearAndSubtotal();

            return true;

        },

        newCheck: function(autoCheckNo) {

            if (autoCheckNo)
                var no = '';
            else {
                var no = this._getKeypadController().getBuffer();
                this._getKeypadController().clearBuffer();
                this._cancelReturn();
            }
            var curTransaction = null;

            var r = -1;
            if (no.length == 0) {
                r = this.GuestCheck.getNewCheckNo();
            } else {
                r = this.GuestCheck.check(no);
            }

            this._clearAndSubtotal();
        },

        newTable: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction = this._getTransaction();

            /*
            if (curTransaction) {
                if (curTransaction.data.status == 0 && curTransaction.data.items_count != 0 && curTransaction.data.recall !=2) {
                    NotifyUtils.warn(_('This order must be stored first'));
                    return;
                }
            }
            */

            var r = -1;
            if (no.length == 0) {
                r = this.GuestCheck.getNewTableNo();
            } else {
                r = this.GuestCheck.table(no);
            }
            if (r > 0) {
                this._clearAndSubtotal();
            }
        },

        recallOrder: function() {
        	
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            return this.GuestCheck.recallByOrderNo(no);
        },

        recallTable: function() {
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            return this.GuestCheck.recallByTableNo(no);
        },

        recallCheck: function() {
        	
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            return this.GuestCheck.recallByCheckNo(no);
        },

        storeCheck: function() {
        
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
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
                this.GuestCheck.store();

                this.dispatchEvent('onStore', curTransaction);

                this._getCartlist().refresh();
            }
            else {
                NotifyUtils.warn(_('No change to store'));
            }
        },

        guestNum: function(num) {
            if (num)
                var no = num;
            else {
                var no = this._getKeypadController().getBuffer();
                this._getKeypadController().clearBuffer();
                this._cancelReturn();
            }
            
            var curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));

                this._clearAndSubtotal();
                return;
            }

            if (curTransaction == null) {
                curTransaction = this._getTransaction(true);
                if (curTransaction == null) {
                    NotifyUtils.warn(_('fatal error!!'));
                    this._clearAndSubtotal();
                    return;
                }
            }

            var r = this.GuestCheck.guest(no);
            // curTransaction.data.no_of_customers = r;

            this._clearAndSubtotal();
        },

        mergeCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                this._clearAndSubtotal();
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

            this._cancelReturn();

            var curTransaction;
            
            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
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

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
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
                rec
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.transferToTableNo(no);
        },

        recovery: function(data) {

            if(data) {
                var transaction = new Transaction();
                transaction.data = data ;
                
                this._setTransactionToView(transaction);
                transaction.updateCartView(-1, -1);

                // restore price level
                var priceLevel = data.price_level;
                if (priceLevel) {
                    $do('change', priceLevel, 'Pricelevel');
                }
                this._clearAndSubtotal();
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Data Operation Error'),
                errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        },
        
        destroy: function() {
            this.observer.unregister();
        }
    };

    GeckoJS.Controller.extend(__controller__);
})();
