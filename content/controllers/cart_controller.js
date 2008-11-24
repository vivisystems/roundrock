(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Cart',
        components: ['Tax'],
        _key: '',
        _cartView: null,

        initial: function() {
            
            if (this._cartView == null ) {
                this._cartView = new NSICartView('cartList');
            }

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

        },

        _newTransaction: function() {
            var curTransaction = new Transaction();
            curTransaction.create();
            this._setTransactionToView(curTransaction);
            return curTransaction;
        },

        _getTransaction: function() {
            var curTransaction = GeckoJS.Session.get('current_transaction');
            if (curTransaction == null) return this._newTransaction();
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

        addItem: function(plu) {

            var item = GREUtils.extend({}, plu);

            // not valid plu item.
            if (typeof item != 'object' || typeof item.id == 'undefined') {
                this.dispatchEvent('onAddItemError', {});
                return;
            }

            var curTransaction = this._getTransaction();

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

            this.dispatchEvent('beforeAddItem', item);
            
            var addedItem = curTransaction.appendItem(item);

            this.dispatchEvent('afterAddItem', addedItem);

            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            if (addedItem.id == plu.id) {
                if (plu.force_condiment) {
                    this.addCondiment(plu);
                }
                if (plu.force_memo) {
                    this.addMemo(plu);
                }
            }
            

            // fire getSubtotal Event ?????????????
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
            
            if (!barcodesIndexes[barcode]) {
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


        voidItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

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

        addDiscount: function(discountAmount) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(index <0) return;

            discountAmount = discountAmount || false;

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

                discountAmount = parseFloat(discountAmount.replace('%', ''));

            }else {
                // fixed number
                discountType = '$';

                discountAmount = parseFloat(discountAmount.replace('$', ''));

            }

            var discountItem = {type: discountType, amount: discountAmount};

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


        addSurcharge: function(surchargeAmount) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

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

                surchargeAmount = parseFloat(surchargeAmount.replace('%', ''));

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

        addPayment: function(type, amount) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            type = type || 'cash';
            amount = amount || false;

            if(!amount) {
                // @todo default totalamount ?
                amount = curTransaction.getRemainTotal();
            }

            var paymentItem = {type: type, amount: amount};
            this.dispatchEvent('beforeAddPayment', paymentItem);

            var paymentedItem = curTransaction.appendPayment(type, amount);

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


        addTax: function() {


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
	
        clear: function() {

            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            var oldTransaction = this._getTransaction();
            
            this.dispatchEvent('onClear', oldTransaction);
            this._getKeypadController().clearBuffer();

        },
	
        cancel: function() {
            
            // cancel cart but save
            var oldTransaction = this._getTransaction();
            oldTransaction.cancel();
            // @todo save oldTransaction to log ??

            GeckoJS.Session.remove('current_transaction');
            GeckoJS.Session.remove('cart_last_sell_item');
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');

            this._getKeypadController().clearBuffer();

            this.dispatchEvent('onCancel', oldTransaction);
            
        },
	
        subtotal: function() {

            var oldTransaction = this._getTransaction();

            this.dispatchEvent('onGetSubtotal', oldTransaction);
            
        },


        submit: function() {

            // cancel cart but save
            var oldTransaction = this._getTransaction();
            if (oldTransaction.getRemainTotal() > 0) return;
            oldTransaction.submit();

            GeckoJS.Session.remove('current_transaction');
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
                amount = parseFloat(buf);
                this._getKeypadController().clearBuffer();
            }

            this.addPayment('cash', amount);

        },

        addCondiment: function(plu) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

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
            var condiments = null;
            var aURL = "chrome://viviecr/content/select_condiments.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=600,height=480";
            var inputObj = {
                condgroup: condgroup,
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


        pushQueue: function() {

            var user = this.Acl.getUserPrincipal();
            var cart = this.getCart();
            if (cart.items.length > 0) {
                this._key = new Date().toString('hh:mm:ss') + ':' + user.username;
                cart.pushQueue(this._key);
                this.clear();
            }
        // alert('push...');
        },

        pullQueue: function(data) {
            
            var cart = this.getCart();
            var listObj = this.getCartlistObj();
            
            cart.pullQueue(data.no);
            
            cart.items.forEach(function(o){
                listObj.addItem(o);
                
            });
            // fire getSubtotal Event
            this.getSubtotal();
        // alert('pull...');
        }
	
	
    });

})();
