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
            keypad.addEventListener("beforeAddBuffer", self.beforeAddBuffer);

            this.addEventListener("beforeAddItem", self.beforeAddItem);

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

        beforeAddItem: function (evt) {
            var item = evt.data;
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            // cart.log("Item:" + cart.dump(item));

            var sellQty = null, sellPrice = null;

            sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
            if (sellQty == null) sellQty = 1;

            sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

            if ( !cart._returnMode && item.auto_maintain_stock) {
                var obj = {
                    sellPrice: sellPrice,
                    sellQty: sellQty,
                    item: item
                };
                if (sellQty > item.stock) {
                    cart.log("***** low stock:" + sellQty + "," + item.stock);
                    cart.dispatchEvent('onLowStock', obj);
                    cart.clear();
                    evt.preventDefault();
                } else if (item.nin_stock > item.stock) {
                    cart.log("***** lower stock:" + item.min_stock + "," + item.stock);
                    cart.dispatchEvent('onLowerStock', obj);
                }
            }
        },
        /*
        decStock: function (obj) {
            this._productsById = GeckoJS.Session.get('productsById');
            this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            for (o in obj.items) {
                var ordItem = obj.items[o];
                var item = this.Product.findById(ordItem.id);
                if (item.auto_maintain_stock) {
                    item.stock = item.stock - ordItem.current_qty;

                    var product = new ProductModel();
                    product.save(item);
                    delete product;
                    // this.Product.save(item);

                    this.log("id2:" + item.id + ":" + item.name + ",,,stock:" + item.stock);

                    // fire onLowStock event...
                    if (item.min_stock > item.stock) {
                        this.dispatchEvent('onLowStock', item);
                    }

                    this.log("this._productsById:" + this.dump(this._productsById));
                    // update Session Data...
                    var evt = {data:item, justUpdate: true};
                    this.afterScaffoldEdit(evt);
                }
            }
        },
        */
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
                this._queuePool = {user: {}, data:{}};
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

            // this.dispatchEvent('beforeAddItem', item);
            if (this.dispatchEvent('beforeAddItem', item)) {

            if ( this._returnMode) {
                var qty = 0 - (GeckoJS.Session.get('cart_set_qty_value') || 1);
                GeckoJS.Session.set('cart_set_qty_value', qty);
            }

            var addedItem = curTransaction.appendItem(item);

            this.dispatchEvent('afterAddItem', addedItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.dispatchEvent('onAddItem', addedItem);

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
            this.subtotal();

            
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

            if(curTransaction == null) {
                this.dispatchEvent('onModifyItem', null);
                return; // fatal error ?
            }

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            if (itemTrans.type != 'item') {
                this.dispatchEvent('onModifyItemError', {});
                return;
            }

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge || itemTrans.hasMarker) {
                this.dispatchEvent('onModifyItemError', {});
                return;
            }


            if (GeckoJS.Session.get('cart_set_price_value') == null && GeckoJS.Session.get('cart_set_qty_value') == null && this._getKeypadController().getBuffer().length <= 0) {
                // @todo popup ??
                this.log('DEBUG', 'modifyItem but no qty / price set!! plu = ' + this.dump(itemTrans) );
                this.dispatchEvent('onModifyItemError', {});
                return ;
            }

            
            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                this.setPrice(buf);
                this._getKeypadController().clearBuffer();
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

            if(curTransaction == null) {
                this.dispatchEvent('onModifyQty', null);
                return; // fatal error ?
            }

            if(index <0) return;
            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            if (itemTrans.hasDiscount || itemTrans.hasSurcharge || itemTrans.hasMarker) {
                this.dispatchEvent('onmodifyQtyError', {});
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
            
        },

        returnItem: function(action) {

            this._returnMode = true;

        },

        voidItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.dispatchEvent('onVoidItem', null);
                return; // fatal error ?
            }

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                this.dispatchEvent('onVoidItemError', {});
                return;
            }

            var itemTrans = null;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            
            if (itemDisplay.type == 'subtotal' || itemDisplay.type == 'tray') {
                // @todo
                this.dispatchEvent('onVoidItemError', {});
                return ;
            }

            itemTrans = curTransaction.getItemAt(index);
            if (itemTrans) {
                if(itemTrans.hasMarker) {
                    // @todo
                    this.dispatchEvent('onVoidItemError', {});
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
            amount = amount || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                amount = buf;
                this._getKeypadController().clearBuffer();
            }

            if(amount === false) return;

            var discountAmount = "";

            if((amount+"").indexOf('$') == -1)  {
                discountAmount = amount + "$";
            }
            this.addDiscount(discountAmount);

        },

        addDiscountByPercentage: function(amount) {
            // shortcut
            amount = amount || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                amount = buf;
                this._getKeypadController().clearBuffer();
            }

            if(amount === false) return;

            var discountAmount = "";

            if((amount+"").indexOf('%') == -1)  {
                discountAmount = amount + "%";
            }
            this.addDiscount(discountAmount);

        },


        addDiscount: function(discountAmount, discountName) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddDiscount', null);
                return; // fatal error ?
            }

            if(index <0) return;

            discountAmount = discountAmount || false;
            discountName = discountName || '';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == 'item') {
                if (itemTrans.hasDiscount) {
                    this.log('already hasDiscount');
                    this.dispatchEvent('onAddDiscountError', {});
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('already hasMarker');
                    this.dispatchEvent('onAddDiscountError', {});
                    return;
                }
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                discountAmount = buf;
                this._getKeypadController().clearBuffer();
            }

            if(!discountAmount) {
                this.log('no discount value');
                this.dispatchEvent('onAddDiscountError', {});
                return;
            }
            
            var discountType = '%';
            
            // check percentage or fixed number
            if(discountAmount.indexOf('%') != -1) {
                // percentage
                discountType = '%';

                discountAmount = parseFloat(discountAmount.replace('%', '')) / 100;

            }else {
                // fixed number
                discountType = '$';

                discountAmount = parseFloat(discountAmount.replace('$', ''));

            }

            var discountItem = {type: discountType, name: discountName, amount: discountAmount};

            this.log('beforeAddDiscount ' + this.dump(discountItem) );
            this.dispatchEvent('beforeAddDiscount', discountItem);

            var discountedItem = curTransaction.appendDiscount(index, discountItem);

            this.log('afterAddDiscount ' + index + ","+ this.dump(discountItem) );
            this.dispatchEvent('afterAddDiscount', discountedItem);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();

        },

        addSurchargeByNumber: function(amount) {
            // shorcut
            amount = amount || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                amount = buf;
                this._getKeypadController().clearBuffer();
            }

            if(amount === false) return;

            var surchargeAmount = "";

            if((amount+"").indexOf('$') == -1)  {
                surchargeAmount = amount + "$";
            }
            this.addSurcharge(surchargeAmount);

        },

        addSurchargeByPercentage: function(amount) {
            // shortcut
            amount = amount || false;

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                amount = buf;
                this._getKeypadController().clearBuffer();
            }

            if(amount === false) return;
            
            var surchargeAmount = "";

            if((amount+"").indexOf('%') == -1)  {
                surchargeAmount = amount + "%";
            }
            this.addSurcharge(surchargeAmount);

        },



        addSurcharge: function(surchargeAmount) {



            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddSurcharge', null);
                return; // fatal error ?
            }

            if(index <0) return;

            surchargeAmount = surchargeAmount || false;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == 'item') {
                if (itemTrans.hasSurcharge) {
                    this.log('already hasSurcharge');
                    this.dispatchEvent('onAddSurchargeError', {});
                    return;
                }
                if (itemTrans.hasMarker) {
                    this.log('already hasMarker');
                    this.dispatchEvent('onAddSurchargeError', {});
                    return;
                }
            }

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                surchargeAmount = buf;
                this._getKeypadController().clearBuffer();
            }

            var surchargeType = '%';

            // check percentage or fixed number
            if(surchargeAmount.indexOf('%') != -1) {
                // percentage
                surchargeType = '%';

                surchargeAmount = parseFloat(surchargeAmount.replace('%', '')) / 100;

            }else {
                // fixed number
                surchargeType = '$';

                surchargeAmount = parseFloat(surchargeAmount.replace('$', ''));

            }

            var surchargeItem = {type: surchargeType, amount: surchargeAmount};

            this.dispatchEvent('beforeAddSurcharge', surchargeItem);

            var surchargedItem = curTransaction.appendSurcharge(index, surchargeItem);

            this.dispatchEvent('afterAddSurcharge', surchargedItem);

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this.subtotal();


        },

        addMarker: function(type) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddMarker', null);
                return; // fatal error ?
            }

            if(index <0) return;

            type = type || 'subtotal';

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == type) {
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

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onHouseBon', null);
                return; // fatal error ?
            }

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);
            var itemDisplay = curTransaction.getDisplaySeqAt(index);

            if (itemDisplay.type == 'item') {

                var discountAmount =  itemTrans.current_subtotal +'' + '$';
                this.addDiscount(discountAmount, 'House Bon');
            }

        },

        currencyConvert: function(convertIndex) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            var currencies = GeckoJS.Session.get('Currencies');

            if (buf.length>0 && currencies && currencies.length > convertIndex) {
                var amount = parseFloat(buf)
                // currency convert array
                var currency_rate = currencies[convertIndex].currency_exchange;
                var memo1 = currencies[convertIndex].currency + ":" + amount;
                var memo2 = "x" + currency_rate;
                amount = amount * currency_rate;
                this._getKeypadController().clearBuffer();
                
                this.addPayment('cash', amount, memo1, memo2);
            }
        },


        addPayment: function(type, amount, memo1, memo2) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                this.clear();
                this.dispatchEvent('onAddPayment', null);
                return; // fatal error ?
            }

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

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

            var paymentItem = {type: type, amount: amount};
            this.dispatchEvent('beforeAddPayment', paymentItem);

            var paymentedItem = curTransaction.appendPayment(type, amount, memo1, memo2);

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
            var statusStr = "";

            for(var idx in payments) {
                var payment = payments[idx];

                statusStr += payment.name + '  =  ' + payment.amount + '\n';
                statusStr += '    memo1: ' + (payment.memo1||"") + ' , memo2: ' + (payment.memo2||"") + '\n\n';
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
                return; // fatal error ?
            }

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            if (itemTrans.type != 'item') {
                this.dispatchEvent('onShiftTaxError', {});
                return;
            }

            if (itemTrans.hasMarker) {
                this.dispatchEvent('onShiftTaxError', {});
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

            // cancel cart but save
            var curTransaction = this._getTransaction();

            if(curTransaction == null) {
                
                this.dispatchEvent('onCancel', null);
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

            this.dispatchEvent('onSubmit', oldTransaction);
				
        },


        cash: function(amount) {

            // check if has buffer
            var buf = this._getKeypadController().getBuffer();
            if (buf.length>0) {
                if (!amount) amount = parseFloat(buf);
                this._getKeypadController().clearBuffer();
            }

            this.addPayment('cash', amount);

        },

        addCondiment: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) return; // fatal error ?

            if(index <0) return;

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                curTransaction = this._newTransaction();
            }

            if (plu.force_condiment) {
                   var condiments = this.getCondimentsDialog(plu.cond_group);

                   if (condiments) curTransaction.appendCondiment(index, condiments);
            }

        },

        addMemo: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(curTransaction == null) return; // fatal error ?

            if(index <0) return;

            // transaction is submit and close success
            if (curTransaction.isSubmit() || curTransaction.isCancel()) {
                curTransaction = this._newTransaction();
            }

            if (plu.force_memo) {
                   var memo = this.getMemoDialog(plu.memo);

                   if (memo) curTransaction.appendMemo(index, memo);
            }

        },


        getCondimentsDialog: function (condgroup) {

            var condGroups = GeckoJS.Session.get('condGroups');
            if (!condGroups) {
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all', {
                    order: "no"
                });
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

            condGroups.forEach(function(o) {
                i++;
                if (o.name == condgroup) {index = i}
            });

            if (typeof condGroups[index] == 'undefined') return null;
            
            var conds = condGroups[index]['Condiment'];

            var condiments = null;
            var aURL = "chrome://viviecr/content/select_condiments.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=600,height=480";
            var inputObj = {
                condgroup: condgroup,
                condsData: conds,
                condiments: condiments
            };

            window.openDialog(aURL, "select_condiments", features, inputObj);

            if (inputObj.ok && inputObj.condiments) {
                return inputObj.condiments;
            }else {
                return null;
            }
            
        },

        getMemoDialog: function (memo) {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:memo,
                input1:null
            };
            window.openDialog(aURL, "prompt_addmemo", features, "Add Memo", "Please input:", "Memo:", "", inputObj);

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

        pushQueue: function() {

            var curTransaction = this._getTransaction();

            if(curTransaction == null) return; // fatal error ?

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var user = this.Acl.getUserPrincipal();

            var count = curTransaction.getItemsCount();
            var key = "";
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
                        queues.push({key: key});
                    });
                }
            }
            else {
                for(var key in queuePool.data) {
                    queues.push({key: key});
                }
            }
            var aURL = "chrome://viviecr/content/select_queues.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=700,height=500";
            var inputObj = {
                queues: queues,
                queuePool: queuePool
            };

            window.openDialog(aURL, "select_queues", features, inputObj);

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
            this.pushQueue();

            var data = queuePool.data[key];

            // remove from list;
            this._removeQueueByKey(key);

            var curTransaction = new Transaction();
            curTransaction.data = data ;
            this._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);
            this.subtotal();

        }
	
	
    });

})();
