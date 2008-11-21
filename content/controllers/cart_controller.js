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
            GeckoJS.Session.remove('cart_set_price_value');
            GeckoJS.Session.remove('cart_set_qty_value');
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
            if (typeof item != 'object' || item.id.length <= 0) return;

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

        // fire getSubtotal Event ?????????????
        // subtotal mean subtotal marker ?
        // this.getSubtotal();
        },
	
        addItemByBarcode: function() {
            var barcode = this.data || "";
            var cart = this.getCart();
		
            // check if has buffer
            var buf = this.getKeypadController().getBuffer();
            if (buf.length>0) {
                barcode += buf;
                this.getKeypadController().clearBuffer();
            }
		

            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            
            var item = null;
            var barcodeIdx = barcodesIndexes[barcode];
            if (barcodeIdx) {
                var products = GeckoJS.Session.get('products');
                item = products[barcodeIdx];
            }
            // get item from barcode ??
            if(item) {
                this.data = item;
                //			this.log('found barcode ' + barcode);
                this.addItem();
            }

        },
	
        modifyItem: function() {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(index <0) return;

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            if (itemTrans.type != 'item') {
                return;
            }

            if (GeckoJS.Session.get('cart_set_price_value') == null && GeckoJS.Session.get('cart_set_qty_value') == null && this._getKeypadController().getBuffer().length <= 0) {
                // @todo popup ??
                this.log('DEBUG', 'modifyItem but no qty / price set!! plu = ' + this.dump(itemTrans) );
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
			
        },
	

        modifyQty: function(action) {

            var index = this._cartView.getSelectedIndex();
            var curTransaction = this._getTransaction();

            if(index <0) return;
            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

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

            if (curTransaction.isSubmit() || curTransaction.isCancel()) return;

            var itemTrans = curTransaction.getItemAt(index);

            if (itemTrans.type != 'item') {
                // @todo 
                return ;
            }

            this.dispatchEvent('beforeVoidItem', itemTrans);

            var voidedItem = curTransaction.voidItemAt(index);

            this.dispatchEvent('afterVoidItem', voidedItem);


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

            this.dispatchEvent('onClear', 0.0);
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

            this.dispatchEvent('onClear', 0.00);
            this._getKeypadController().clearBuffer();

            this.dispatchEvent('onCancel', oldTransaction);
            
        },
	
        subtotal: function() {

            var discount = this.getCart().getDiscountSubtotal();
            var tax = this.getCart().getTaxSubtotal();
            this.query('#disAmount').val(discount);
            this.query('#taxAmount').val(tax);
            this.dispatchEvent('onGetSubtotal', this.getCart().getAmount());
            
        },


        submit: function() {
		
            var cart = this.getCart();
            var amount = cart.getAmount();
		
            if (amount <= 0) {
			
                // save
                var subtotal = parseFloat(cart.getSubtotal());
                var tax = parseFloat(cart.getTaxSubtotal());
                var payment = parseFloat(cart.getPaymentSubtotal());
                var discount = parseFloat(cart.getDiscountSubtotal());
                var total = subtotal + tax - discount;
                var data = {
                    total: total,
                    subtotal: subtotal,
                    tax: tax,
                    payment: payment,
                    discount: discount,
                    amount: (0-amount)
                };
                data.items = cart.getItems().slice();
				
                this.clear();
			
                // save data to order model
                var orderModel = new OrderModel();
			
                orderModel.saveOrder(data);

                var orderDetailModel = new OrderDetailModel();
                var productModel = new ProductModel();

                data.items.forEach(function(o) {
                    orderDetailModel.create();
                    o.order_id = orderModel.id;
                    orderDetailModel.save(o);
                                
                });
			
                this.dispatchEvent('onSave', data);
			
			
                // finally
                this.dispatchEvent('onSubmit', data);
			
			
            }
				
        },
	
        quickCash: function() {

            var cart = this.getCart();
            var amount = cart.getAmount();
            cart.addPayment('cash', amount);
            this.getKeypadController().clearBuffer();
            this.cash();
		
        },

        cash: function() {

            var cart = this.getCart();
		
            if(cart.getItemCount() <=0) {
                // opendrawer ???
			
                return;
            }
            // check if has buffer
            var buf = this.getKeypadController().getBuffer();
            if (buf.length>0) {
                cart.addPayment('cash', buf);
                this.getKeypadController().clearBuffer();
            }
		
            var amount = cart.getAmount();
		
            if (amount <= 0) {
                // auto submit
                this.submit();
            } else {
                this.getKeypadController().clearBuffer();
            }

        },

        openDiscount: function() {

            var cart = this.getCart();

            if(cart.getItemCount() <=0)	return;

            var buff = this.getKeypadController().getBuffer();
            if (buff.length == 0) return;
            this.getKeypadController().clearBuffer();

            var subtotal = cart.getSubtotal();
            // var discountPercent = this.data.discount ;
            var discountPercent = buff / 100 ;

            var discount = subtotal * discountPercent;

            cart.addDiscount('openDiscount', discount);

            // fire getSubtotal Event
            this.getSubtotal();

            // this.log('Open Discount:' + this.dump(this.getCart().getDiscountSubtotal()));
            this.log('Open Discount:' + this.dump(this.getCart().discounts));

        },

        addDiscount: function() {

            var cart = this.getCart();
		
            if(cart.getItemCount() <=0)	return;
		
            var subtotal = cart.getSubtotal();
            var discountPercent = this.data.discount ;
		
            var discount = subtotal * discountPercent;
		
            cart.addDiscount('member', discount);

            // fire getSubtotal Event
            this.getSubtotal();

        },

        openTax: function() {

            var cart = this.getCart();

            if(cart.getItemCount() <=0)	return;

            var buff = this.getKeypadController().getBuffer();
            if (buff.length == 0) return;
            this.getKeypadController().clearBuffer();

            var subtotal = cart.getSubtotal();
            // var discountPercent = this.data.discount ;
            var taxPercent = buff / 100 ;

            var tax = subtotal * taxPercent;

            cart.addTax('openTax', tax);

            // fire getSubtotal Event
            this.getSubtotal();

            // this.log('Open Discount:' + this.dump(this.getCart().getDiscountSubtotal()));
            this.log('Open Tax:' + this.dump(this.getCart().taxes));

        },

        addTax: function() {

            var cart = this.getCart();

            if(cart.getItemCount() <=0)	return;

            var subtotal = cart.getSubtotal();
            var taxes = this.Tax.getTax(valObj.name);
            var taxPercent = this.data.discount ;
            var tax = this.Tax.calcTaxAmount(taxes.rate, isubtotal)
            cart.addTax(valObj.name, tax);

            // fire getSubtotal Event
            this.getSubtotal();

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
