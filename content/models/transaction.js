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

                items_count: 0,

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
                modified: '',

                RoundingPrices: 'to-nearest-precision',
                PrecisionPrices: 0,
                RoundingTaxes: 'to-nearest-precision',
                PrecisionTaxes: 0

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

    // Transaction.Number =  null;

    Transaction.prototype.create = function() {

        this.data.id = GeckoJS.String.uuid();

        this.data.seq = ViviPOS.SequenceModel.getSequence('order');
        GeckoJS.Session.set('vivipos_fec_order_sequence', this.data.seq);
        
        var user = new GeckoJS.AclComponent().getUserPrincipal();

        if ( user != null ) {
            this.data.clerk = user.username;
        }

        this.data.created = new Date().toString('hh:mm:ss');

        if (Transaction.Tax == null) Transaction.Tax = new TaxComponent();

        if (Transaction.Number == null) Transaction.Number = GeckoJS.NumberHelper;
        
        if (Transaction.events == null) Transaction.events = new GeckoJS.Event();

        // update rounding / precision data
        this.data.RoundingPrices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        this.data.RoundingTaxes = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        this.data.PrecisionPrices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
        this.data.PrecisionTaxes = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionTaxes') || 0;
       
    };


    Transaction.prototype.emptyView = function() {
        this.view.empty();
    };


    Transaction.prototype.cancel = function() {
        this.data.status = -1;
        this.emptyView();
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


    Transaction.prototype.updateCartView = function(prevRowCount, currentRowCount, jumpToLast) {

        this.view.data = this.data.display_sequences;
        this.view.rowCountChanged(prevRowCount, currentRowCount, jumpToLast);

    },

    Transaction.prototype.createItemDataObj = function(index, item, sellQty, sellPrice) {

        var roundedPrice = this.getRoundedPrice(sellPrice) || 0;
        var roundedSubtotal = this.getRoundedPrice(sellQty*sellPrice) || 0;
        
        // name,current_qty,current_price,current_subtotal
        var item2 = {
            type: 'item', // item or category
            id: item.id,
            no: item.no,
            name: item.name,

            index: index,
            
            current_qty: sellQty,
            current_price: roundedPrice,
            current_subtotal: roundedSubtotal,

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
            current_Condiment: 0,

            memo: null,
            
            hasDiscount: false,
            hasSurcharge: false,
            hasMarker: false

        };

        return item2;
        
    };

    Transaction.prototype.createDisplaySeq = function(index, item, type) {

        type = type || 'item';

        var itemDisplay = {} ;

        if (type == 'item') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                no: item.no,
                name: item.name,
                current_qty: item.current_qty,
                current_price: item.current_price,
                current_subtotal: item.current_subtotal,
                current_tax: item.tax_name,
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'discount') {
            if (item.discount_name && item.discount_name.length > 0) {
                var dispName = '-' + item.discount_name;
            }
            else {
                var dispName = '-' + ((item.discount_type == '%') ? item.discount_rate*100 + '%' : '');
            }
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                no: item.no,
                name: dispName,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_discount,
                current_tax: '',
                type: type,
                index: index,
                level: 2
            });
        }else if (type == 'trans_discount') {
            if (item.discount_name && item.discount_name.length > 0) {
                var dispName = '-' + item.discount_name;
            }
            else {
                var dispName = '-' + ((item.discount_type == '%') ? item.discount_rate*100 + '%' : '');
            }
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: null,
                no: item.no,
                name: dispName,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_discount,
                current_tax: '',
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'surcharge') {
            var dispName = '+' + ((item.surcharge_type == '%') ? item.surcharge_rate*100 + '%' : '');
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                no: item.no,
                name: dispName,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_surcharge,
                current_tax: '',
                type: type,
                index: index,
                level: 2
            });
        }else if (type == 'trans_surcharge') {
            var dispName = '+' + ((item.surcharge_type == '%') ? item.surcharge_rate*100 + '%' : '');
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: null,
                no: item.no,
                name: dispName,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_surcharge,
                current_tax: '',
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'tray' || type == 'subtotal' || type == 'total') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: item.name,
                current_qty: '',
                current_price: '',
                current_subtotal: item.current_subtotal,
                current_tax: '',
                type: type,
                index: index,
                level: 0
            });
        }else if(type =='condiment' || type =='memo') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: item.name,
                current_qty: '',
                current_price: item.current_subtotal,
                current_subtotal: '',
                current_tax: '',
                type: type,
                index: index,
                level: 1
            });           
        }else if(type =='payment') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: item.name.toUpperCase(),
                current_qty: '',
                current_price: '',
                current_subtotal: item.amount,
                current_tax: '',
                type: type,
                index: index,
                level: 0
            });
        }

        // format display precision
        if(itemDisplay.current_subtotal != '' || itemDisplay.current_subtotal === 0) {
            itemDisplay.current_subtotal = this.formatPrice(itemDisplay.current_subtotal)
        }
        
        // format display precision
        if(itemDisplay.current_price != ''  || itemDisplay.current_price === 0 ) {
            itemDisplay.current_price = this.formatPrice(itemDisplay.current_price);
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
            sellPrice: item.current_price /*,
            sellQty: item.current_qty*/
        };

        GeckoJS.Session.set('cart_last_sell_item', lastSellItem);

    };


    Transaction.prototype.appendItem = function(item){

        var prevRowCount = this.data.display_sequences.length;

        var sellQty = null, sellPrice = null;

        var lastSellItem = GeckoJS.Session.get('cart_last_sell_item');
        if (lastSellItem != null) {
            if (lastSellItem.id == item.id) {
                // sellQty = lastSellItem.sellQty;
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

        var itemIndex = GeckoJS.String.uuid();

        // create data object to push in items array
        var itemAdded = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);

        // push to items array
        this.data.items[itemIndex] = itemAdded;
        this.data.items_count++;

        this.log('DEBUG', 'dispatchEvent afterAppendItem ' + this.dump(itemAdded));
        Transaction.events.dispatch('afterAppendItem', itemAdded, this);

        // create data object to push in items array
        var itemDisplay = this.createDisplaySeq(itemIndex, itemAdded, 'item');
        
        this.data.display_sequences.push(itemDisplay);

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount, true);

        this.updateLastSellItem(itemAdded);

        return itemAdded;
    };


    Transaction.prototype.modifyItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
        var itemIndex = itemDisplay.index;

        if (itemDisplay.type != 'item') return ; // TODO

        var item = null;
        if(GeckoJS.Session.get('productsById')[itemTrans.id]) {
            item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
        }else {
            item = GREUtils.extend({},itemTrans);
        }
        
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
        var itemModified = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);
        itemTrans.current_qty = itemModified.current_qty;
        itemTrans.current_price = itemModified.current_price;
        itemTrans.current_subtotal = itemModified.current_subtotal;
        itemModified = itemTrans;

        var condiments = itemModified.condiments;
        if (condiments) {

            var roundedPrice = this.getRoundedPrice(itemModified.current_price) || 0;
            var roundedSubtotal = this.getRoundedPrice(itemModified.current_qty*itemModified.current_price) || 0;
            var roundedCondiment = 0;

            for(var cn in itemTrans.condiments) {
                roundedCondiment += parseFloat(itemTrans.condiments[cn].price)*itemModified.current_qty;
            }

            roundedCondiment = this.getRoundedPrice(roundedCondiment);

            itemModified.current_Condiment = roundedCondiment;
            itemModified.current_subtotal = roundedSubtotal + roundedCondiment;
        }

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


            var item = null;
            if(GeckoJS.Session.get('productsById')[itemTrans.id]) {
                item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
            }else {
                item = GREUtils.extend({},itemTrans);
            }

            this.log('DEBUG', 'dispatchEvent beforeVoidItem ' + this.dump(item) );
            Transaction.events.dispatch('beforeVoidItem', item, this);

            // remove to items array
            var itemRemoved = itemTrans;
            delete(this.data.items[itemIndex]);
            this.data.items_count--;

            var removeCount = 1;

            if (itemRemoved.hasDiscount) removeCount++;
            if (itemRemoved.hasSurcharge) removeCount++;
            if (itemRemoved.memo != null) removeCount++;

            if (itemRemoved.condiments != null) {
                for (var cn in itemRemoved.condiments) {
                    removeCount++;
                }
            }

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
            if (itemDisplay.type == 'condiment') {
                delete itemTrans.condiments[itemDisplay.name];

                var roundedPrice = this.getRoundedPrice(itemTrans.current_price) || 0;
                var roundedSubtotal = this.getRoundedPrice(itemTrans.current_qty * itemTrans.current_price) || 0;
                var roundedCondiment = 0;

                for(var cn in itemTrans.condiments) {
                    roundedCondiment += parseFloat(itemTrans.condiments[cn].price) * itemTrans.current_qty;
                }

                roundedCondiment = this.getRoundedPrice(roundedCondiment);

                itemTrans.current_Condiment = roundedCondiment;
                itemTrans.current_subtotal = roundedSubtotal + roundedCondiment;

                var orgItemDisplay = this.getDisplaySeqByIndex(itemIndex);
                orgItemDisplay.current_subtotal =  this.formatPrice(itemTrans.current_subtotal);

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

            if(item.hasDiscount) {
                // already hasDiscount
                return;
            }

            
            item.discount_name =  discount.name || '' ;
            item.discount_rate =  discount.amount;
            item.discount_type =  discount.type;

            if (item.discount_type == '$') {
                item.current_discount = 0 - discount.amount;
                if (discount.amount > item.current_subtotal) {
                    // discount too much
                    return;
                }
            }else {
                item.current_discount = 0 - item.current_subtotal * item.discount_rate;
            }

            item.hasDiscount = true;

            // rounding discount
            item.current_discount = this.getRoundedPrice(item.current_discount);

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(itemIndex, item, 'discount');

            this.data.display_sequences.splice(index+1,0,itemDisplay);


        }else if (itemDisplay.type == 'subtotal'){

            var discountItem = {
                discount_name: '',
                discount_rate: discount.amount,
                discount_type: discount.type,
                current_discount: 0,
                hasMarker: false
            };

            if (discountItem.discount_type == '$') {
                discountItem.current_discount = 0 - discount.amount;
                if (discount.amount >  this.getRemainTotal()) {
                    // discount too much
                    return;
                }
            }else {
                discountItem.current_discount = 0 - this.getRemainTotal() * discountItem.discount_rate;
            }

            // rounding discount
            discountItem.current_discount = this.getRoundedPrice(discountItem.current_discount);

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


        var prevRowCount = this.data.display_sequences.length;


        if (itemDisplay.type == 'item') {

            // already hasSurcharge
            if(item.hasSurcharge) {

                return ;
            }
            item.surcharge_name = '';
            item.surcharge_rate =  surcharge.amount;
            item.surcharge_type =  surcharge.type;
            item.hasSurcharge = true;

            if (item.surcharge_type == '$') {
                item.current_surcharge = surcharge.amount;
            }else {
                item.current_surcharge = item.current_subtotal * item.surcharge_rate;
            }

            // rounding surcharge
            item.current_surcharge = this.getRoundedPrice(item.current_surcharge);


            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(itemIndex, item, 'surcharge');

            this.data.display_sequences.splice(index+1,0,itemDisplay);
            
        }else if (itemDisplay.type == 'subtotal'){

            var surchargeItem = {
                surcharge_name: '',
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

            // rounding surcharge
            surchargeItem.current_surcharge = this.getRoundedPrice(surchargeItem.current_surcharge);


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


    Transaction.prototype.shiftTax = function(index, taxIndex){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
        var itemIndex = itemDisplay.index;

        if (itemDisplay.type != 'item') return ; // TODO

        this.log('DEBUG', 'dispatchEvent beforeShiftTax ' + this.dump(itemTrans) );
        Transaction.events.dispatch('beforeShiftTax', itemTrans, this);


        var taxes = GeckoJS.Session.get('taxes');
        if(taxes == null) taxes = Transaction.Tax.getTaxList();

        if (taxIndex == null) {
            var oldTax = itemTrans.tax_name;
            for (var taxIndex=0; taxIndex<taxes.length; taxIndex++) {
                if(taxes[taxIndex].no ==oldTax) break;
            }
            taxIndex = ( (taxIndex+1) >= taxes.length ) ? 0 : (taxIndex+1);
        }
        var newTax = taxes[taxIndex];

        itemTrans.tax_name = newTax.no;
        // create data object to push in items array
        var itemModified = itemTrans ;

        // update to items array
        this.data.items[itemIndex]  = itemModified;

        this.log('DEBUG', 'dispatchEvent afterShiftTax ' + this.dump(itemModified) );
        Transaction.events.dispatch('afterShiftTax', itemModified, this);

        // create data object to push in items array
        var itemDisplay = this.createDisplaySeq(itemIndex, itemModified, 'item');

        // update
        this.data.display_sequences[index] = itemDisplay ;

        var currentRowCount = this.data.display_sequences.length;

        /*
        this.calcPromotions();
        */
        this.calcItemsTax();

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return itemModified;

    };


    Transaction.prototype.appendMarker = function(index, type){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        // create data object to push in items array
        var markerItem = {
            name: '** ' + type.toUpperCase(),
            current_subtotal: 0
        };
        
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

        this.updateCartView(prevRowCount, currentRowCount, true);

        return item;

    
    };

    Transaction.prototype.appendCondiment = function(index, condiments){
        
        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;

        var prevRowCount = this.data.display_sequences.length;

        if (item.type == 'item') {

            condiments.forEach(function(condiment){
                var condimentItem = {
                    id: item.id,
                    name: condiment.name,
                    current_subtotal: (this.getRoundedPrice(condiment.price) == 0) ? '' : this.formatPrice(this.getRoundedPrice(condiment.price))
                };

                if(item.condiments == null) item.condiments = {};

                item.condiments[condiment.name] = condiment;

                // up
                var itemDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment');

                var lastIndex = this.data.display_sequences.length - 1;
                this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

            }, this);

            if (condiments.length >0) {

                var roundedPrice = this.getRoundedPrice(item.current_price) || 0;
                var roundedSubtotal = this.getRoundedPrice(item.current_qty*item.current_price) || 0;
                var roundedCondiment = 0;

                for(var cn in item.condiments) {
                    roundedCondiment += parseFloat(item.condiments[cn].price)*item.current_qty;
                }

                roundedCondiment = this.getRoundedPrice(roundedCondiment);

                item.current_Condiment = roundedCondiment;
                item.current_subtotal = roundedSubtotal + roundedCondiment;

                itemDisplay.current_subtotal = this.formatPrice(item.current_subtotal);

                this.calcItemsTax();

                this.calcTotal();
            }

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

            var memoItem = {
                id: item.id,
                name: memo,
                current_subtotal: ''
            };

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
        
        var prevRowCount = this.data.display_sequences.length;

        var paymentId =  GeckoJS.String.uuid();
        var paymentItem = {
            id: paymentId,
            name: type,
            amount: amount,
            memo1: memo1,
            memo2: memo2
        };

        var itemDisplay = this.createDisplaySeq(paymentId, paymentItem, 'payment');

        var lastIndex = this.data.display_sequences.length - 1;
        this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

        this.data.trans_payments[paymentId] = paymentItem;

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount);

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

    Transaction.prototype.getDisplaySeqByIndex = function(index){

        for (var i =0 ; i < this.data.display_sequences.length; i++) {
            var itemDisplay = this.data.display_sequences[i];
            if (itemDisplay.index == index) return itemDisplay;
        }
        
    };

    Transaction.prototype.calcCondimentPrice = function() {

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

        if (sellPrice == null || typeof sellPrice  == 'undefined' || isNaN(sellPrice) ) sellPrice = priceLevelPrice;

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
            var price = parseFloat(item['price_level'+priceLevel]);
            if (!isNaN(price)) {
                return price;
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


    Transaction.prototype.getItems = function() {
        return this.data.items;
    };


    Transaction.prototype.getItemsCount = function() {
        return this.data.items_count;
    };

    Transaction.prototype.getPayments = function() {
        return this.data.trans_payments;
    };




    Transaction.prototype.calcPromotions =  function() {
        var obj = this.data;
        this.log('DEBUG', 'dispatchEvent onCalcPromotions ' + obj);
        Transaction.events.dispatch('onCalcPromotions', obj, this);
    };

    Transaction.prototype.calcItemsTax =  function() {
        var obj = this.data;

        // item subtotal
        for(var itemIndex in this.data.items ) {
            var item = this.data.items[itemIndex];

            /*
            tax_name: item.rate,
            tax_rate: null,
            tax_type: null,
            current_tax: 0,
            */



            var tax = Transaction.Tax.getTax(item.tax_name);
            if(tax) {
                item.tax_rate = tax.rate;
                item.tax_type = tax.type;

                var toTaxCharge = item.current_subtotal - item.current_discount + item.current_surcharge;
                
                var taxChargeObj = Transaction.Tax.calcTaxAmount(item.tax_name, toTaxCharge);

                // @todo total only or summary ?
                item.current_tax =  taxChargeObj[item.tax_name].charge;
            }else {
                item.current_tax = 0;
            }

            // rounding tax
            item.current_tax = this.getRoundedTax(item.current_tax);

        }

        this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + obj);
        Transaction.events.dispatch('onCalcItemsTax', obj, this);

    };


    Transaction.prototype.calcTotal = function() {
        
        this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.data);
        Transaction.events.dispatch('onCalcTotal', this.data, this);

        var total=0, remain=0, item_subtotal=0, tax_subtotal=0, surcharge_subtotal=0, discount_subtotal=0, payment_subtotal=0;

        // item subtotal
        for(var itemIndex in this.data.items ) {
            var item = this.data.items[itemIndex];

            tax_subtotal += parseFloat(item.current_tax);
            surcharge_subtotal += parseFloat(item.current_surcharge);
            discount_subtotal += parseFloat(item.current_discount);
            item_subtotal += parseFloat(item.current_subtotal);

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

        total = item_subtotal + tax_subtotal + surcharge_subtotal + discount_subtotal;
        remain = total - payment_subtotal;

        this.data.total = total;
        this.data.remain = remain;
        this.data.tax_subtotal = tax_subtotal;
        this.data.surcharge_subtotal = surcharge_subtotal;
        this.data.discount_subtotal = discount_subtotal ;
        this.data.payment_subtotal = payment_subtotal;

        Transaction.events.dispatch('afterCalcTotal', this.data, this);

        this.log('DEBUG', "afterCalcTotal " + this.dump(this.data));

    };


    Transaction.prototype.getTotal = function(format) {
        format = format || false;
        
        if (format) return this.formatPrice(this.data.total);

        return this.data.total;
    };

    Transaction.prototype.getRemainTotal = function(format) {
        format = format || false;

        if (format) return this.formatPrice(this.data.remain);

        return this.data.remain;
    };

    Transaction.prototype.getPaymentSubtotal = function(format) {
        format = format || false;

        if (format) return this.formatPrice(this.data.payment_subtotal);

        return this.data.payment_subtotal;
    };


    Transaction.prototype.getRoundedPrice = function(price) {
        var roundedPrice = Transaction.Number.round(price, this.data.PrecisionPrices, this.data.RoundingPrices) || 0;
        return roundedPrice;
    };


    Transaction.prototype.getRoundedTax = function(tax) {
        var roundedTax = Transaction.Number.round(tax, this.data.PrecisionTaxes, this.data.RoundingTaxes) || 0;
        return roundedTax;
    };

    Transaction.prototype.formatPrice = function(price) {
        var options = {
          places: ((this.data.PrecisionPrices>0)?this.data.PrecisionPrices:0)
        };
        // format display precision
        return Transaction.Number.format(price, options);
    };

})();