(function() {
    
    // declare Transaction Base Object / data encapulate
    var Transaction = window.Transaction = GeckoJS.BaseObject.extend('Transaction', {

        name: 'Transaction',

        init: function() {

            this.view = null,

            this.data = {

                id: '',
                
                seq: '',

                display_sequences: [],

                items: {},

                items_summary: {},

                trans_discounts: {},
                trans_surcharges: {},

                trans_payments: {},

                markers: [],

                status: 0,

                clerk: '',
                member: '',

                total: 0,
                remain: 0,
                tax_subtotal: 0,
                surcharge_subtotal: 0,
                discount_subtotal: 0,
                payment_subtotal: 0,

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


    Transaction.prototype.submit = function() {
        this.data.status = 1;
        // save transaction to order / orderdetail ...

        // empty ?
        
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
            type: 'item', // item or category
            id: item.id,
            name: item.name,
            
            current_qty: sellQty,
            current_price: sellPrice,
            current_subtotal: (sellQty*sellPrice),

            tax_name: item.rate,
            tax_rate: null,
            tax_type: null,
            current_tax: 0,
            
            discount_name: null,
            discount_rate: null,
            discount_type: null,
            current_discount: 0,

            surcharge_name: null,
            surcharge_rate: null,
            surcharge_type: null,
            current_surcharge: 0,

            condiments: null,
            memo: null,
            
            hasTax: false,
            hasDiscount: false,
            hasSurcharge: false,
            hasMarker: false

        });
        
        return item2;
        
    };

    Transaction.prototype.createDisplaySeq = function(index, item, type) {

        type = type || 'item';

        var itemDisplay = {} ;

        if (type == 'item') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                name: item.name,
                current_qty: item.current_qty,
                current_price: item.current_price,
                current_subtotal: item.current_subtotal,
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'discount') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                name: item.discount_type + '-',
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_discount,
                type: type,
                index: index,
                level: 2
            });
        }else if (type == 'trans_discount') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: null,
                name: item.discount_type + '-',
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_discount,
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'surcharge') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                name: item.surcharge_type + '+',
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_surcharge,
                type: type,
                index: index,
                level: 2
            });
        }else if (type == 'trans_surcharge') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: null,
                name: item.surcharge_type + '+',
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_surcharge,
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'tray' || type == 'subtotal') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: item.name,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_subtotal,
                type: type,
                index: index,
                level: 0
            });
        }else if(type =='condiment' || type =='memo') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: item.name,
                current_qty: '',
                current_price: '',
                current_subtotal: '',
                type: type,
                index: index,
                level: 1
            });           
        }

        return itemDisplay;

    };

    Transaction.prototype.removeDisplaySeq = function(index, count) {

        count = count || 1;
        this.data.display_sequences.splice(index, count);

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
        var itemIndex = GeckoJS.String.uuid();

        // push to items array
        this.data.items[itemIndex] = itemAdded;

        this.log('DEBUG', 'dispatchEvent afterAppendItem ' + this.dump(itemAdded));
        Transaction.events.dispatch('afterAppendItem', itemAdded, this);

        // create data object to push in items array
        var itemDisplay = this.createDisplaySeq(itemIndex, itemAdded, 'item');
        
        this.data.display_sequences.push(itemDisplay);

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        this.updateLastSellItem(itemAdded);

        return itemAdded;
    };


    Transaction.prototype.modifyItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
        var itemIndex = itemDisplay.index;

        if (itemDisplay.type != 'item') return ; // TODO

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
        this.data.items[itemIndex]  = itemModified;

        this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
        Transaction.events.dispatch('afterModifyItem', itemModified, this);

        // create data object to push in items array
        var itemDisplay = this.createDisplaySeq(itemIndex, itemModified, 'item');
        // update
        this.data.display_sequences[index] = itemDisplay ;

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        this.updateLastSellItem(itemModified);

        return itemModified;
        
    };


    Transaction.prototype.voidItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
        var itemIndex = itemDisplay.index;

        if (itemDisplay.type == 'item' && !itemTrans.hasMarker) {

            var item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
            this.log('DEBUG', 'dispatchEvent beforeVoidItem ' + this.dump(item) );
            Transaction.events.dispatch('beforeVoidItem', item, this);

            // remove to items array
            var itemRemoved = itemTrans;
            delete(this.data.items[itemIndex]);

            var removeCount = 1;

            if (itemRemoved.hasDiscount) removeCount++;
            if (itemRemoved.hasSurcharge) removeCount++;

            this.log('DEBUG', 'dispatchEvent afterVoidItem ' + this.dump(itemRemoved) );
            Transaction.events.dispatch('afterVoidItem', itemRemoved, this);

            // remove
            this.removeDisplaySeq(index, removeCount);

        }else {

            // discount or surcharge
            if (itemDisplay.type == 'discount' && !itemTrans.hasMarker) {
                itemTrans.discount_name= null;
                itemTrans.discount_rate= null;
                itemTrans.discount_type= null;
                itemTrans.current_discount= 0;
                itemTrans.hasDiscount= false;
            }

            if (itemDisplay.type == 'surcharge' && !itemTrans.hasMarker) {
                itemTrans.surcharge_name= null;
                itemTrans.surcharge_rate= null;
                itemTrans.surcharge_type= null;
                itemTrans.current_surcharge= 0;
                itemTrans.hasSurcharge= false;
            }

            if (itemDisplay.type == 'trans_discount' && !itemTrans.hasMarker ) {
                delete this.data.trans_discounts[itemIndex];
            }
            if (itemDisplay.type == 'trans_surcharge') {
                delete this.data.trans_surcharges[itemIndex];
            }


            this.removeDisplaySeq(index, 1);
        }

        var currentRowCount = this.data.display_sequences.length;

        // recalc all

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return itemRemoved;


    };


    Transaction.prototype.appendDiscount = function(index, discount){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        if (itemDisplay.type == 'item') {

            item.discount_name = 'open';
            item.discount_rate =  discount.amount;
            item.discount_type =  discount.type;
            item.hasDiscount = true;

            if (item.discount_type == '$') {
                item.current_discount = 0 - discount.amount;
            }else {
                item.current_discount = 0 - item.current_subtotal * item.discount_rate;
            }

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(itemIndex, item, 'discount');

            this.data.display_sequences.splice(index+1,0,itemDisplay);


        }else if (itemDisplay.type == 'subtotal'){

            var discountItem = { discount_name: 'open',
                                 discount_rate: discount.amount,
                                 discount_type: discount.type,
                                 current_discount: 0,
                                 hasMarker: false };

            if (discountItem.discount_type == '$') {
                discountItem.current_discount = 0 - discount.amount;
            }else {
                discountItem.current_discount = 0 - this.getRemainTotal() * discountItem.discount_rate;
            }

            var discountIndex = GeckoJS.String.uuid();
            this.data.trans_discounts[discountIndex] = discountItem;

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(discountIndex, discountItem, 'trans_discount');

            this.data.display_sequences.splice(index+1,0,itemDisplay);

        }


        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return item;

    };

    Transaction.prototype.appendSurcharge = function(index, surcharge){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;

        if(item.hasSurcharge) return ;

        var prevRowCount = this.data.display_sequences.length;


        if (itemDisplay.type == 'item') {

            item.surcharge_name = 'open';
            item.surcharge_rate =  surcharge.amount;
            item.surcharge_type =  surcharge.type;
            item.hasSurcharge = true;

            if (item.surcharge_type == '$') {
                item.current_surcharge = surcharge.amount;
            }else {
                item.current_surcharge = item.current_subtotal * item.surcharge_rate;
            }

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(itemIndex, item, 'surcharge');

            this.data.display_sequences.splice(index+1,0,itemDisplay);
            
        }else if (itemDisplay.type == 'subtotal'){

            var surchargeItem = { surcharge_name: 'open',
                                 surcharge_rate: surcharge.amount,
                                 surcharge_type: surcharge.type,
                                 current_surcharge: 0,
                                 hasMarker: false
                                 };

            if (surchargeItem.surcharge_type == '$') {
                surchargeItem.current_surcharge = surcharge.amount;
            }else {
                surchargeItem.current_surcharge = this.getRemainTotal() * surchargeItem.surcharge_rate;
            }

            var surchargeIndex = GeckoJS.String.uuid();
            this.data.trans_surcharges[surchargeIndex] = surchargeItem;

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(surchargeIndex, surchargeItem, 'trans_surcharge');

            this.data.display_sequences.splice(index+1,0,itemDisplay);

        }
        
        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return item;

    };


    Transaction.prototype.appendTax = function(item){

    };

    Transaction.prototype.appendMarker = function(index, type){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        // create data object to push in items array
        var markerItem = {name: '** ' + type.toUpperCase(), current_subtotal: 0};
        
        var remain = this.getRemainTotal();
        
        var subtotal = 0;
        if (type == 'tray') {
            var preSubtotal = this.data.markers[this.data.markers.length-1] || 0;
            markerItem.current_subtotal = remain - preSubtotal;

            this.data.markers.push(markerItem.current_subtotal+0);
        }else {
            markerItem.current_subtotal = remain;
        }

        // item hasMarker 
        for(var itemIndex in this.data.items ) {
            var item = this.data.items[itemIndex];

            item.hasMarker  = true;
        }

        // trans_discounts
        for(var disIndex in this.data.trans_discounts ) {
            var disItem = this.data.trans_discounts[disIndex];
            disItem.hasMarker  = true;
        }

        // trans_surcharges
        for(var surIndex in this.data.trans_surcharges ) {
            var surItem = this.data.trans_surcharges[surIndex];
            surItem.hasMarker  = true;
        }

        var itemDisplay = this.createDisplaySeq(index, markerItem, type);

        var lastIndex = this.data.display_sequences.length - 1;
        this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

        var currentRowCount = this.data.display_sequences.length;



        this.updateCartView(prevRowCount, currentRowCount);

        return item;

    
    };

    Transaction.prototype.appendCondiment = function(index, condiments){
        
        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        if (item.type == 'item') {
            
            var condimentItem = {id: item.id, name: condiments};

            item.condiments = condiments;
            
            var itemDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment');

            var lastIndex = this.data.display_sequences.length - 1;
            this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

        }

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount);

        return item;


    };


    Transaction.prototype.appendMemo = function(index, memo){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        if (item.type == 'item') {

            var memoItem = {id: item.id, name: memo};

            item.memo = memo;

            var itemDisplay = this.createDisplaySeq(itemIndex, memoItem, 'memo');

            var lastIndex = this.data.display_sequences.length - 1;
            this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

        }

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount);

        return item;


    };


    Transaction.prototype.appendPayment = function(type, amount, memo1, memo2){

        var paymentId =  GeckoJS.String.uuid();
        var paymentItem = {id: paymentId, name: type, amount: amount, memo1: memo1, memo2: memo2};

        this.data.trans_payments[paymentId] = paymentItem;

        this.calcTotal();

    };

    Transaction.prototype.getItemAt = function(index){
        
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        var itemDisplay = this.data.display_sequences[index];
        var item = null;
        var itemIndex = itemDisplay.index;


        switch(itemDisplay.type) {
            case 'item':
                item = this.data.items[itemIndex];
                break;
            case 'discount':
                item = this.data.items[itemIndex];
                break;
            case 'surcharge':
                item = this.data.items[itemIndex];
                break;

            case 'condiment':
            case 'memo':
                item = this.data.items[itemIndex];
                break;

            case 'trans_discount':
                item = this.data.trans_discounts[itemIndex];
                break;
            case 'trans_surcharge':
                item = this.data.trans_surcharges[itemIndex];
                break;

        }

        return item;
        
    };


    Transaction.prototype.getDisplaySeqAt = function(index){
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        var itemDisplay = this.data.display_sequences[index];

        return itemDisplay;
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


    Transaction.prototype.calcTotal = function() {
        
        this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.data);
        Transaction.events.dispatch('onCalcTotal', this.data, this);

        var total=0, remain=0, tax_subtotal=0, surcharge_subtotal=0, discount_subtotal=0, payment_subtotal=0;

        // item subtotal
        for(var itemIndex in this.data.items ) {
            var item = this.data.items[itemIndex];

            tax_subtotal += parseFloat(item.current_tax);
            surcharge_subtotal += parseFloat(item.current_surcharge);
            discount_subtotal += parseFloat(item.current_discount);
            total += parseFloat(item.current_subtotal);

        }

        // trans subtotal
        for(var transDisIndex in this.data.trans_discounts ) {
            var disItem = this.data.trans_discounts[transDisIndex];
            discount_subtotal += parseFloat(disItem.current_discount);
        }

        for(var transSurIndex in this.data.trans_surcharges ) {
            var surItem = this.data.trans_surcharges[transSurIndex];
            surcharge_subtotal += parseFloat(surItem.current_surcharge);
        }

        for(var payIndex in this.data.trans_payments ) {
            var payItem = this.data.trans_payments[payIndex];
            payment_subtotal += parseFloat(payItem.amount);
        }

       
        remain = total + tax_subtotal + surcharge_subtotal + discount_subtotal - payment_subtotal;

        this.data.total = total;
        this.data.remain = remain;
        this.data.tax_subtotal = tax_subtotal;
        this.data.surcharge_subtotal = surcharge_subtotal;
        this.data.discount_subtotal = discount_subtotal ;
        this.data.payment_subtotal = payment_subtotal;

    };


    Transaction.prototype.getTotal = function() {
        return this.data.total;
    };

    Transaction.prototype.getRemainTotal = function() {
        return this.data.remain;
    };

})();