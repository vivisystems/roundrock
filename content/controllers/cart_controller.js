(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Cart',
        components: ['Tax'],
        _cartObj: null,
        _key: '',
        _priceLevel: 0,
	
        getCart: function() {
            return GeckoJS.Session.get('cart');
        },
	
        getCartlistObj: function() {
            if(this._cartObj == null) this._cartObj = document.getElementById("cartSimpleListBox");
            return  this._cartObj;
        },

        getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },

        getSellPrice: function(data) {
            switch (this._priceLevel) {
                case 0: return data.sell_price; break;
                case 1: return data.sell_price1; break;
                case 2: return data.sell_price2; break;
            }
        },

        getHALOPrice: function(data) {
            switch (this._priceLevel) {
                case 0: return data.sell_halo; break;
                case 1: return data.sell_halo1; break;
                case 2: return data.sell_halo2; break;
            }
        },

        addItem: function() {
            // var item = this.data;
            // clone
            var item = GREUtils.extend({}, this.data);
		
            var cart = this.getCart();
		
            // check if has buffer
            var buf = this.getKeypadController().getBuffer();
            if (buf.length>0) {
                this.setPrice(buf);
                this.getKeypadController().clearBuffer();
            }

            // modify Qty & Price...
            item.sell_qty = cart.getQty();
            var sell_price = this.getSellPrice(item);
            var halo_price = this.getHALOPrice(item);

            item.sell_price = cart.getPrice(sell_price);
this.log("halo =" + halo_price + ", sell =" + item.sell_price);
            if(halo_price > 0) {
                if (item.sell_price > halo_price) item.sell_price = halo_price;
            }

            this.dispatchEvent('beforeAddItem', item);
		
            var addedItem = cart.addItem(item);
		
            this.dispatchEvent('afterAddItem', addedItem);
			
            this.getCartlistObj().addItem(addedItem);
		
            // fire getSubtotal Event
            this.getSubtotal();
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
		
		
            var barcodes = GeckoJS.Session.get('barcodes');
            var item = barcodes[barcode];
            // get item from barcode ??
            if(item) {
                this.data = item;
                //			this.log('found barcode ' + barcode);
                this.addItem();
            }

        },
	
        modifyItem: function() {
            var index = this.data;
            if(index <0) return;

            var cart = this.getCart();
            var item = cart.getItem(index);
		
            this.dispatchEvent('beforeModifyItem', item);
		
            // check if has buffer
            var buf = this.getKeypadController().getBuffer();
            if (buf.length>0) {
                this.setPrice(buf);
                this.getKeypadController().clearBuffer();
            }
		
            item.sell_qty = cart.getQty(item.sell_qty);
            var sell_price = this.getSellPrice(item);
            var halo_price = this.getHALOPrice(item);
            item.sell_price = cart.getPrice(sell_price);
            
            if(halo_price) {
                if (item.sell_price > halo_price) item.sell_price = halo_price;
            }
            
            var updatedItem = cart.updateItem(index, item);
		
            this.dispatchEvent('afterRemoveItem', updatedItem);
			
            // update XUL UI
            this.getCartlistObj().updateItemAt(index, updatedItem);
		
            // fire getSubtotal Event
            this.getSubtotal();
		
		
        },
	
        removeItem: function() {
            var index = this.data;
            if(index <0) return;

            var cart = this.getCart();
		
            var item = cart.getItem(index);
		
            this.dispatchEvent('beforeRemoveItem', item);
		
            var removedItem = cart.removeItem(index);
		
            this.dispatchEvent('afterRemoveItem', removedItem);
			
            // update XUL UI
            this.getCartlistObj().removeItemAt(index);
		
            // fire getSubtotal Event
            this.getSubtotal();
		
        },
	
        setQty: function(qty) {
            var qty0 = parseFloat(qty);
            this.getCart().setQty(qty0);
            this.dispatchEvent('onSetQty', qty0);
		
        },
	
        setPrice: function(price) {
            var newprice = parseFloat(price);
            this.getCart().setPrice(newprice);
            this.dispatchEvent('onSetPrice', newprice);
        },
	
        clear: function() {
            this.getCart().clear();
            this.getCartlistObj().resetData();
            this.dispatchEvent('onClear', 0.0);
            this.getKeypadController().clearBuffer();
        },
	
        cancel: function() {
            // cancel cart but save
	
            this.getCart().clear();
            this.getCartlistObj().resetData();
            this.dispatchEvent('onClear', 0.00);
            this.getKeypadController().clearBuffer();
        },
	
        getSubtotal: function() {
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
                var orderModel = new ViviPOS.OrderModel();
			
                orderModel.saveOrder(data);

                var orderDetailModel = new ViviPOS.OrderDetailModel();
                var productModel = new ViviPOS.ProductModel();

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

        priceLevel: function() {
            this._priceLevel = (this._priceLevel++ < 2) ? (this._priceLevel) : 0;
            var lbl = this.query('#shiftPriceStatus');
            switch (this._priceLevel) {
                case 0: lbl.val("S1"); break;
                case 1: lbl.val("S2"); break;
                case 2: lbl.val("S3"); break;
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



    /**
     * Controller Startup
     */
    function startup() {
	
        // ViviPOS.CartController.appendController();
	
        if(!GeckoJS.Session.has('cart')) {
            GeckoJS.Session.add('cart', new ViviPOS.CartModel());
        }
    }

    window.addEventListener('load', startup, false);

})();
