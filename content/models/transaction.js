(function() {
    
    // declare Transaction Base Object / data encapulate
    var Transaction = window.Transaction = GeckoJS.BaseObject.extend('Transaction', {

        name: 'Transaction',

        init: function() {

            this.view = null,

            this.data = {

                id: '',
                
                seq: '',

                current_type: 'item', // lists of item / subtotal, ca

                display_sequences: [],

                items: [],

                items_summary: {},

                items_discount: [],

                items_surcharge: [],

                items_tax: [],

                trans_discounts: [],

                trans_surcharges: [],

                //        subtotals: [],

                trans_payments: [],

                trans_coupons: [],

                markers: [],

                status: 0,

                clerk: '',

                created: '',

                modified: ''
            };


        },

        serialize: function() {
            // @todo 
            return "";
        },

        unserialize: function(data) {
            // @todo
            
        }

    });

    Transaction.Tax =  null;

    Transaction.prototype.create = function() {

        this.data.id = GeckoJS.String.uuid();

        this.data.seq = ViviPOS.SequenceModel.getSequence('order');
        GeckoJS.Session.set('vivipos_fec_order_sequence', this.data.seq);
        
        var user = new GeckoJS.AclComponent().getUserPrincipal();

        if ( user != null ) {
            this.data.clerk = user.username;
        }

        this.data.created = new Date().toString('hh:mm:ss');

        if (Transaction.Tax == null) Transaction.Tax = new GeckoJS.TaxComponent();
        
        if (Transaction.events == null) Transaction.events = new GeckoJS.Event();

       
    };


    Transaction.prototype.cancel = function() {
        this.data.status = -1;
        this.view.empty();
    };

    Transaction.prototype.isCancel = function() {
        return (this.data.status  == -1);
    };

    Transaction.prototype.success = function() {
        this.data.status = 1;
    };

    Transaction.prototype.isSubmit = function() {
        return (this.data.status == 1);
    };


    Transaction.prototype.updateCartView = function(prevRowCount, currentRowCount) {

        this.view.data = this.data.display_sequences;
        this.view.rowCountChanged(prevRowCount, currentRowCount);

    },

    Transaction.prototype.createItemDataObj = function(item, sellQty, sellPrice) {

        // name,current_qty,current_price,current_subtotal
        var item2 = GREUtils.extend({}, {
            type: 'item',
            id: item.id,
            name: item.name,
            current_qty: sellQty,
            current_price: sellPrice,
            current_subtotal: (sellQty*sellPrice),
            tax: item.rate,
            hasDiscount: false,
            //hasPromotion: false,
            hasSurcharge: false,
            hasMarker: false
            //hasTax: false,
        });
        
        return item2;
        
    };

    Transaction.prototype.createDisplayObj = function(item, sellQty, sellPrice, index) {
        
        var itemDisplay = GREUtils.extend({}, {
            name: item.name,
            current_qty: sellQty,
            current_price: sellPrice,
            current_subtotal: (sellQty*sellPrice),
            type: 'item',
            index: index,
            level: 0
        });
        return itemDisplay;

    };

    Transaction.prototype.updateLastSellItem = function(item) {

        // save lastSellItem
        var lastSellItem = {
            id: item.id,
            sellPrice: item.current_price,
            sellQty: item.current_qty
        };

        GeckoJS.Session.set('cart_last_sell_item', lastSellItem);

    };


    Transaction.prototype.appendItem = function(item){

        var prevRowCount = this.data.display_sequences.length;

        var sellQty = null, sellPrice = null;

        var lastSellItem = GeckoJS.Session.get('cart_last_sell_item');
        if (lastSellItem != null) {
            if (lastSellItem.id == item.id) {
                sellQty = lastSellItem.sellQty;
                sellPrice = lastSellItem.sellPrice;
            }
        }
        // modify Qty & Price...
        sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
        if (sellQty == null) sellQty = 1;

        sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

        sellPrice = this.calcSellPrice(sellPrice, sellQty, item);

        var obj = {
            sellPrice: sellPrice,
            sellQty: sellQty,
            item: item
        };

        this.log('DEBUG', 'dispatchEvent beforeAppendItem ' + this.dump(obj) );
        Transaction.events.dispatch('beforeAppendItem', obj, this);

        // create data object to push in items array
        var itemAdded = this.createItemDataObj(item, sellQty, sellPrice);

        // push to items array
        this.data.items.push(itemAdded);

        this.log('DEBUG', 'dispatchEvent afterAppendItem ' + this.dump(itemAdded));
        Transaction.events.dispatch('afterAppendItem', itemAdded, this);

        var lastItemIdx = this.data.items.length-1;
        this.data.current_type = itemAdded.type;

        // create data object to push in items array
        var itemDisplay = this.createDisplayObj(itemAdded, sellQty, sellPrice, lastItemIdx);

        this.data.display_sequences.push(itemDisplay);

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.updateCartView(prevRowCount, currentRowCount);

        this.updateLastSellItem(itemAdded);

        return itemAdded;
    };


    Transaction.prototype.modifyItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        if (itemTrans.type != 'item') return ; // TODO

        var item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
        
        var sellQty = itemTrans.current_qty;
        var sellPrice = itemTrans.current_price;

        // modify Qty & Price...
        sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
        if (sellQty == null) sellQty = 1;

        sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

        sellPrice = this.calcSellPrice(sellPrice, sellQty, item);

        var obj = {
            sellPrice: sellPrice,
            sellQty: sellQty,
            item: item
        };

        this.log('DEBUG', 'dispatchEvent beforeModifyItem ' + this.dump(obj) );
        Transaction.events.dispatch('beforeModifyItem', obj, this);

        // create data object to push in items array
        var itemModified = this.createItemDataObj(item, sellQty, sellPrice);

        // update to items array
        this.data.items[index]  = itemModified;

        this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
        Transaction.events.dispatch('afterModifyItem', itemModified, this);

        var lastItemIdx = index;
        this.data.current_type = itemModified.type;

        // create data object to push in items array
        var itemDisplay = this.createDisplayObj(itemModified, sellQty, sellPrice, lastItemIdx);

        // update
        this.data.display_sequences[index] = itemDisplay ;

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.updateCartView(prevRowCount, currentRowCount);

        this.updateLastSellItem(itemModified);

        return itemModified;
        
    };


    Transaction.prototype.voidItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        if (itemTrans.type != 'item') return ; // TODO

        var item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
        
        this.log('DEBUG', 'dispatchEvent beforeVoidItem ' + this.dump(item) );
        Transaction.events.dispatch('beforeVoidItem', item, this);

        // remove to items array
        var itemRemoved = this.data.items.splice(index,1);

        this.log('DEBUG', 'dispatchEvent afterVoidItem ' + this.dump(itemRemoved) );
        Transaction.events.dispatch('afterVoidItem', itemRemoved, this);

        // remove 
        this.data.display_sequences.splice(index,1);

        this.data.current_type = this.data.display_sequences[this.data.display_sequences.length -1] ? this.data.display_sequences[this.data.display_sequences.length -1].type : 'item';

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.updateCartView(prevRowCount, currentRowCount);

        this.updateLastSellItem(itemRemoved);

        return itemRemoved;


    };


    Transaction.prototype.appendDiscount = function(item){

    };

    Transaction.prototype.appendSurcharge = function(item){

    };


    Transaction.prototype.appendTax = function(item){

    };


    Transaction.prototype.getItemAt = function(index){
        
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        var itemDisplay = this.data.display_sequences[index];
        var item = null;
        switch(itemDisplay.type) {
            case 'item':
                item = this.data.items[index];
                break;
        }

        return item;
    };


    Transaction.prototype.calcSellPrice =  function(sellPrice, sellQty, item) {

        // get price by price level first
        sellPrice = this.getSellPriceByPriceLevel(sellPrice, sellQty, item);

        //  callback for other rules

        var obj = {
            sellPrice: sellPrice,
            sellQty: sellQty,
            item: item
        };

        this.log('DEBUG', 'dispatchEvent onCalcSellPrice ' + this.dump(obj) );
        Transaction.events.dispatch('onCalcSellPrice', obj, this);

        // return final sellPrice
        return obj.sellPrice;
        
    };

    Transaction.prototype.getSellPriceByPriceLevel = function(sellPrice, sellQty, item) {

        var priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');

        var priceLevelPrice = this.getPriceLevelPrice(priceLevel, item);
        var priceLevelHalo = this.getPriceLevelHalo(priceLevel, item);
        var priceLevelLalo = this.getPriceLevelLalo(priceLevel, item);

        if (sellPrice == null) sellPrice = priceLevelPrice;

        if(priceLevelHalo > 0 && sellPrice > priceLevelHalo) {

            var obj = {
                error: 'halo',
                newPrice: priceLevelHalo,
                sellPrice: sellPrice,
                priceLevelPrice: priceLevelPrice,
                priceLevelHalo: priceLevelHalo,
                priceLevelLalo: priceLevelLalo
            };

            this.log('DEBUG', 'dispatchEvent onPriceLevelError ' + this.dump(obj) );
            Transaction.events.dispatch('onPriceLevelError', obj, this);
            
            sellPrice = obj.newPrice;
        }

        if(priceLevelLalo > 0 && sellPrice < priceLevelLalo) {

            var obj2 = {
                error: 'lalo',
                newPrice: priceLevelLalo,
                sellPrice: sellPrice,
                priceLevelPrice: priceLevelPrice,
                priceLevelHalo: priceLevelHalo,
                priceLevelLalo: priceLevelLalo
            };

            this.log('DEBUG', 'dispatchEvent onPriceLevelError ' + this.dump(obj2) );
            Transaction.events.dispatch('onPriceLevelError', obj2, this);

            sellPrice = obj2.newPrice;
        }

        return sellPrice;

    };

    Transaction.prototype.getPriceLevelPrice = function(priceLevel, item) {
        
        if (typeof item['price_level'+priceLevel] !='undefined'){
            if (item['price_level'+priceLevel].length > 0) {
                return parseFloat(item['price_level'+priceLevel]);
            }
        }
        return parseFloat(item['price_level']);

    };

    Transaction.prototype.getPriceLevelHalo = function(priceLevel, item) {
        
        if (typeof item['halo'+priceLevel] !='undefined') {
            if(item['halo'+priceLevel].length > 0) {
                return parseFloat(item['halo'+priceLevel]);
            }
        }
        return parseFloat(item['halo']);

    };

    Transaction.prototype.getPriceLevelLalo = function(priceLevel, item) {

        if (typeof item['lalo'+priceLevel] !='undefined') {
            if(item['lalo'+priceLevel].length > 0) {
                return parseFloat(item['lalo'+priceLevel]);
            }
        }
        return parseFloat(item['lalo']);

    };


    Transaction.prototype.calcPromotions =  function() {
        var obj = this.data;
        this.log('DEBUG', 'dispatchEvent onCalcPromotions ' + obj);
        Transaction.events.dispatch('onCalcPromotions', obj, this);
    };

    Transaction.prototype.calcItemsTax =  function() {
        var obj = this.data;
        this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + obj);
        Transaction.events.dispatch('onCalcItemsTax', obj, this);

    };


    Transaction.prototype.getSubtotal = function() {

        var obj = this.data;

        var discount = this.getCart().getDiscountSubtotal();
        var tax = this.getCart().getTaxSubtotal();
        this.query('#disAmount').val(discount);
        this.query('#taxAmount').val(tax);

        this.log('DEBUG', 'dispatchEvent onGetSubtotal ' + obj);
        this.dispatchEvent('onGetSubtotal', this.getCart().getAmount());
    };


})();