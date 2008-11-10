GREUtils.define('ViviPOS.CartModel');
ViviPOS.CartModel = GeckoJS.Model.extend({
    name: 'Cart',
	
	items: [],
	itemSubTotal: 0,
	
	itemTaxSubTotal: 0,
	
	taxes: [],
	
	payments: [],
	
	discounts: [],
	
	
	tmpQty: -1,	
	tmpPrice: -1,
	
	orderQueue: {},
        
	getItems: function() {
		return 	this.items;
	},
	
	getItemCount: function() {
		return 	this.items.length;
	},
	
	setQty: function(newqty) {
		this.tmpQty = newqty >= 0 ? newqty : -1; 
	},
	
	getQty: function(oldqty) {
		oldqty = oldqty || 1;
		return (this.tmpQty<0) ? oldqty : this.tmpQty;
	},
	
	setPrice: function(newprice) {
		
		this.tmpPrice = newprice >= 0 ? newprice : -1;
	},
	
	getPrice: function(oldprice) {
		oldprice = oldprice || 0;
		return this.tmpPrice < 0 ? oldprice : this.tmpPrice;  
	},
	
	clear: function() {
		delete this.items;
		delete this.payments;
		delete this.discounts;
		delete this.taxes;
		
		this.items = [];
		this.payments = [];
		this.discounts = [];
		this.taxes = [];

		this.itemSubTotal = 0;
		this.itemTaxSubTotal = 0;
	},
	
	addItem: function(item){

		//item.sell_qty = this.getQty();
		//item.sell_price = this.getPrice(item.sell_price);
		
		//item.sell_qty = item.qty;
		//item.sell_price = item.price;
		item.sell_subtotal = item.sell_price * item.sell_qty;
//this.log('item:' + this.dump(item));
		// add to items
		this.items.push(item);
		
		this.itemSubTotal += item.sell_subtotal;

        

		item.tax = item.tax || 0;

        var tc = new GeckoJS.TaxComponent();
        item.tax = tc.getTax(item.rate).rate / 100;
        
		// tax
        // this.itemTaxSubTotal += parseFloat(item.sell_subtotal * item.tax) ;
        // this.log('item.rate:' + item.rate + ',,,subtotal:' + item.sell_subtotal + ',,,=' +  this.dump( tc.calcTaxAmount(item.rate, item.sell_subtotal)));
        this.itemTaxSubTotal += parseFloat(tc.calcTaxAmount(item.rate, item.sell_subtotal)) ;
        delete tc;
		
		// reset
		this.setPrice(-1);
		this.setQty(-1);
		
		return item;
	},
	
	getItem: function(index) {
		return this.items[index];
	},
	
	removeItem: function(index) {

		var item = this.items.splice(index, 1)[0];
		
		this.itemSubTotal -= parseFloat(item.sell_subtotal);
		item.tax = item.tax || 0;

        var tc = new GeckoJS.TaxComponent();
        item.tax = tc.getTax(item.rate).rate / 100;
        delete tc;
		// tax
		// this.itemTaxSubTotal -= parseFloat(item.sell_subtotal * item.tax) ;
        this.itemTaxSubTotal += parseFloat(tc.calcTaxAmount(item.rate, item.sell_subtotal)) ;
		
		return item;
	},

	updateItem: function(index, item) {

		var oldItem = this.getItem(index);
		
		this.itemSubTotal -= parseFloat(oldItem.sell_subtotal);
		oldItem.tax = oldItem.tax || 0;

        var tc = new GeckoJS.TaxComponent();
        oldItem.tax = tc.getTax(oldItem.rate).rate / 100;
        delete tc;
		// tax
		// this.itemTaxSubTotal -= parseFloat(oldItem.sell_subtotal * item.tax) ;
        this.itemTaxSubTotal += parseFloat(tc.calcTaxAmount(item.rate, item.sell_subtotal)) ;
		
		// update new item
		item.sell_subtotal = item.sell_price * item.sell_qty;
		
		// add to items
		this.items[index] = item;
		
		this.itemSubTotal += parseFloat(item.sell_subtotal);
		
		item.tax = item.tax || 0;

        var tc = new GeckoJS.TaxComponent();
        item.tax = tc.getTax(item.rate).rate / 100;
        delete tc;
		// tax
		// this.itemTaxSubTotal += parseFloat(item.sell_subtotal * item.tax) ;
        this.itemTaxSubTotal += parseFloat(tc.calcTaxAmount(item.rate, item.sell_subtotal)) ;
		
		// reset
		this.setPrice(-1);
		this.setQty(-1);
		
		return item;
	},
	
	getSubtotal: function() {
        this.itemSubTotal = this.itemSubTotal || 0;
		return parseFloat(this.itemSubTotal).toFixed(0);
	},
	
	getTaxSubtotal: function() {
        this.itemTaxSubTotal = this.itemTaxSubTotal || 0;
        return parseFloat(this.itemTaxSubTotal).toFixed(0);
	},
	
	getAmount: function() {
		var subtotal = parseFloat(this.getSubtotal());
		var tax = parseFloat(this.getTaxSubtotal());

		var payment = parseFloat(this.getPaymentSubtotal());
		var discount = parseFloat(this.getDiscountSubtotal());
		// this.log(typeof subtotal + ',,,' + typeof tax + ',,,' + typeof discount + ',,,' + typeof payment + ' = ' + (subtotal + tax - discount - payment));
		return parseFloat(subtotal + tax - discount - payment).toFixed(0);
        // return (subtotal + tax - discount - payment);
		
	},
	
	addPayment: function(type, amount) {
		var payment = {type: type, amount: amount};
		
		this.payments.push(payment);
		
	},
	
	getPaymentSubtotal: function(){
		
		var subtotal = 0;
		this.payments.forEach(function(o) {
			subtotal += parseFloat(o.amount || 0);
		});

        return parseFloat(subtotal).toFixed(0);
        // return subtotal;
	},

	addDiscount: function(type, amount) {
		var discount = {type: type, amount: amount};
		
		this.discounts.push(discount);
		
	},
	
	getDiscountSubtotal: function(){
		
		var subtotal = 0;
		this.discounts.forEach(function(o) {
			subtotal += parseFloat(o.amount || 0);
		});
		// return subtotal;
        return parseFloat(subtotal).toFixed(0);
	},

    addTax: function(type, amount) {
		var tax = {type: type, amount: amount};

		this.taxes.push(tax);

	},

	getTaxSubtotal: function(){

		var subtotal = 0;
		this.taxes.forEach(function(o) {
			subtotal += parseFloat(o.amount || 0);
		});
		// return subtotal;
        return parseFloat(subtotal).toFixed(0);
	},
        
        pushQueue: function(key) {
            // alert('push:' + key);
            var s = GeckoJS.Array.objectExtract(this.items, '{n}.name').join("\n");
            //this.items.forEach(function(o) { s = s + o.name + '\n';});
            
            this.orderQueue[key] = {
                no: key,
                items: this.items.slice(),
                taxes: this.taxes.slice(),
		payments: this.payments.slice(),
                discounts: this.discounts.slice(),
                itemlist: s
            };
            
            this.clear();
            // alert(s);
            // this.log(GeckoJS.BaseObject.dump(this.orderQueue));
        },

        pullQueue: function(key) {
            // name = "aaaa";
            // alert('pull:' + key);
            var queue = this.orderQueue[key];
            var self = this;
            queue.items.forEach(function(o){
               self.addItem(o);
            });
            this.taxes = queue.taxes;
            this.payments = queue.payments;
            this.discounts = queue.discounts;
            delete this.orderQueue[key];
            delete queue;
        }

});