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

                total: 0,
                remain: 0,
                tax_subtotal: 0,
                surcharge_subtotal: 0,
                discount_subtotal: 0,
                payment_subtotal: 0,

                rounding_prices: 'to-nearest-precision',
                precision_prices: 0,
                rounding_taxes: 'to-nearest-precision',
                precision_taxes: 0,

                status: 0, // transcation status 0 = process  1 = submit , -1 = canceled

                service_clerk: '',
                service_clerk_displayname: '',

                proceeds_clerk: '',
                proceeds_clerk_displayname: '',

                // member id
                member: '',
                member_displayname: '',
                member_email: '',
                member_cellphone: '',

                invoice_type: '',
                invoice_title: '',
                invoice_no: '',

                destination: '',
                table_no: '',
                check_no: '',

                no_of_customers: 0,

                terminal_no: '',

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

    Transaction.Number =  null;

    Transaction.worker =  null;

    Transaction.prototype.create = function() {

        this.data.id = GeckoJS.String.uuid();

        this.data.seq = SequenceModel.getSequence('order_no');
        GeckoJS.Session.set('vivipos_fec_order_sequence', this.data.seq);
        
        var user = new GeckoJS.AclComponent().getUserPrincipal();

        if ( user != null ) {
            this.data.service_clerk = user.username;
        }

        this.data.created = new Date().getTime();

        if (Transaction.Tax == null) Transaction.Tax = new TaxComponent();

        if (Transaction.Number == null) Transaction.Number = GeckoJS.NumberHelper;
        
        if (Transaction.events == null) Transaction.events = new GeckoJS.Event();

        // update rounding / precision data
        this.data.rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        this.data.rounding_taxes = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        this.data.precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
        this.data.precision_taxes = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionTaxes') || 0;

        if (Transaction.worker == null) {
            Transaction.worker = new GeckoJS.Thread();
        }
        Transaction.worker._runnable = this;

        // @todo 
       
    };


    Transaction.prototype.emptyView = function() {
        this.view.empty();
    };


    Transaction.prototype.cancel = function() {
        this.data.status = -1;

        // save transaction to order / orderdetail ...
        this.data.modified = new Date().getTime();

        // use background save
        Transaction.worker.start();

        this.emptyView();
    };

    Transaction.prototype.isCancel = function() {
        return (this.data.status  == -1);
    };


    Transaction.prototype.submit = function() {
        this.data.status = 1;

        // save transaction to order / orderdetail ...
        this.data.modified = new Date().getTime();

        var user = new GeckoJS.AclComponent().getUserPrincipal();
        if ( user != null ) {
            this.data.proceeds_clerk = user.username;
        }

        // use backgroud to save
        Transaction.worker.start();

        // maintain stock...
        this.requestCommand('decStock', this.data, "Stocks");
        
    };

    Transaction.prototype.isSubmit = function() {
        return (this.data.status == 1);
    };


    Transaction.prototype.updateCartView = function(prevRowCount, currentRowCount, jumpToLast) {

        this.view.data = this.data.display_sequences;
        this.view.rowCountChanged(prevRowCount, currentRowCount, jumpToLast);
        
        GeckoJS.Session.set('vivipos_fec_number_of_items', this.getItemsCount());
        GeckoJS.Session.set('vivipos_fec_tax_total', this.formatTax(this.getRoundedTax(this.data.tax_subtotal)));

    },

    Transaction.prototype.createItemDataObj = function(index, item, sellQty, sellPrice) {

        var roundedPrice = this.getRoundedPrice(sellPrice) || 0;
        var roundedSubtotal = this.getRoundedPrice(sellQty*sellPrice) || 0;
        
        // name,current_qty,current_price,current_subtotal
        var item2 = {
            type: 'item', // item or category
            id: item.id,
            no: item.no,
            barcode: item.barcode,
            name: item.name,

            index: index,
            
            current_qty: sellQty,
            current_price: roundedPrice,
            current_subtotal: roundedSubtotal,

            tax_name: item.rate,
            tax_rate: '',
            tax_type: '',
            current_tax: 0,
            
            discount_name: '',
            discount_rate: '',
            discount_type: '',
            current_discount: 0,

            surcharge_name: '',
            surcharge_rate: '',
            surcharge_type: '',
            current_surcharge: 0,

            condiments: null,
            current_condiment: 0,

            memo: '',
            
            hasDiscount: false,
            hasSurcharge: false,
            hasMarker: false

        };

        return item2;
        
    };

    Transaction.prototype.createDisplaySeq = function(index, item, type) {

        type = type || 'item';

        _('Trans');
        var itemDisplay = {} ;
        var dispName;

        if (type == 'item') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                no: item.no,
                name: item.name,
                current_qty: item.current_qty,
                current_price: item.current_price,
                //current_subtotal: item.current_subtotal + item.current_condiment,
                current_subtotal: item.current_subtotal,
                current_tax: item.tax_name,
                type: type,
                index: index,
                level: 0
            });
        }else if (type == 'discount') {
            if (item.discount_name && item.discount_name.length > 0) {
                dispName = item.discount_name;
            }
            else {
                dispName = '-' + ((item.discount_type == '%') ? item.discount_rate*100 + '%' : '');
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
                dispName = item.discount_name;
            }
            else {
                dispName = '-' + ((item.discount_type == '%') ? item.discount_rate*100 + '%' : '');
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
            if (item.surcharge_name && item.surcharge_name.length > 0) {
                dispName = item.surcharge_name;
            }
            else {
                dispName = '+' + ((item.surcharge_type == '%') ? item.surcharge_rate*100 + '%' : '');
            }
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
            if (item.surcharge_name && item.surcharge_name.length > 0) {
                dispName = item.surcharge_name;
            }
            else {
                dispName = '+' + ((item.surcharge_type == '%') ? item.surcharge_rate*100 + '%' : '');
            }
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

        // only calc current item tax 
        this.calcItemsTax(itemAdded);

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

        if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
            return ; // TODO - shouldn't be here since cart has intercepted illegal operations
        }

        var item = null;
        if(GeckoJS.Session.get('productsById')[itemTrans.id]) {
            item = GREUtils.extend({}, GeckoJS.Session.get('productsById')[itemTrans.id]);
        }else {
            item = GREUtils.extend({},itemTrans);
        }
        
        var sellQty = itemTrans.current_qty;
        var sellPrice = itemTrans.current_price;
        var condimentPrice = 0;

        // modify Qty & Price...if item is being modified
        if (itemDisplay.type == 'item') {
            sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
            if (sellQty == null) sellQty = 1;

            sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

            sellPrice = this.calcSellPrice(sellPrice, sellQty, item);
        }
        else if (itemDisplay.type == 'condiment') {
            condimentPrice = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : itemDisplay.current_price;
            var condimentItem = {
                id: itemDisplay.id,
                name: itemDisplay.name,
                current_subtotal: (this.getRoundedPrice(condimentPrice) == 0) ? '' : this.formatPrice(this.getRoundedPrice(condimentPrice))
            };
        }
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

                // update condiment price before recalculating subtotal if modifying condiment
                if (itemTrans.condiments[cn].name == itemDisplay.name) {
                    itemTrans.condiments[cn].price = condimentPrice;
                }
                roundedCondiment += parseFloat(itemTrans.condiments[cn].price)*itemModified.current_qty;
            }

            roundedCondiment = this.getRoundedPrice(roundedCondiment);

            itemModified.current_condiment = roundedCondiment;
            itemModified.current_subtotal = roundedSubtotal + roundedCondiment;
        }

        // update to items array
        this.data.items[itemIndex]  = itemModified;

        this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
        Transaction.events.dispatch('afterModifyItem', itemModified, this);

        var itemDisplay2 = this.createDisplaySeq(itemIndex, itemModified, 'item');
        if (itemDisplay.type == 'item') {
            // create data object to push in items array
        
            // update
            this.data.display_sequences[index] = itemDisplay2 ;
        }
        else if (itemDisplay.type == 'condiment') {
            var condimentItemDisplay2 = this.createDisplaySeq(itemIndex, condimentItem, 'condiment');

            // update condiment display
            this.data.display_sequences[index] = condimentItemDisplay2 ;

            // update item subtotal
            var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item the condiment is attached to
            targetDisplayItem.current_subtotal = itemDisplay2.current_subtotal;
        }
        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        // only calc current item tax
        this.calcItemsTax(itemModified);

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
            var display_sequences = this.data.display_sequences;

            // look down display sequence to find location of next item that is
            // not a discount, surcharge, or memo

            for (var i = index + 1; i < display_sequences.length; i++) {
                var checkItem = display_sequences[i];
                if (checkItem.type == 'discount' ||
                    checkItem.type =='surcharge' ||
                    checkItem.type =='memo' ||
                    checkItem.type == 'condiment')
                    removeCount++;
                else
                    break;
            }

            this.log('DEBUG', 'dispatchEvent afterVoidItem ' + this.dump(itemRemoved) );
            Transaction.events.dispatch('afterVoidItem', itemRemoved, this);

            // remove
            this.removeDisplaySeq(index, removeCount);

            // recalc all
            this.calcPromotions();
            //this.calcItemsTax();


        }else {
            if (itemDisplay.type == 'memo' ) {
                itemTrans.memo= "";
            }

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
                var subtotal = this.getDisplaySeqAt(itemDisplay.subtotal_index);
                subtotal.hasDiscount = false;
                delete this.data.trans_discounts[itemIndex];
            }
            if (itemDisplay.type == 'trans_surcharge') {
                var subtotal = this.getDisplaySeqAt(itemDisplay.subtotal_index);
                subtotal.hasSurcharge = false;
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

                itemTrans.current_condiment = roundedCondiment;
                itemTrans.current_subtotal = roundedSubtotal + roundedCondiment;

                var orgItemDisplay = this.getDisplaySeqByIndex(itemIndex);
                orgItemDisplay.current_subtotal =  this.formatPrice(itemTrans.current_subtotal);

            }
            if (itemDisplay.type == 'payment') {
                // make sure payment has not been subtotalled
                var displayItems = this.data.display_sequences;
                for (var i = index + 1; i < displayItems.length; i++) {
                    var itemType = displayItems[i].type;
                    if (itemType == 'subtotal' ||
                        itemType == 'tray' ||
                        itemType == 'total') {
                        //@todo OSD
                        OsdUtils.warn(_('Cannot VOID a payment that has been subtotaled'));
                    }
                }
                // remove payment record
                delete this.data.trans_payments[itemIndex];
            }
            if (itemDisplay.type == 'subtotal' ||
                itemDisplay.type == 'total' ||
                itemDisplay.type == 'tray') {

                // reset hasMarker flag on preceding items until marker is encountered
                var displayItems = this.data.display_sequences;
                var transItems = this.getItems();
                for (var i = index - 1; i >= 0; i--) {
                    var displayItem = displayItems[i];
                    alert('checking entry [' + GeckoJS.BaseObject.dump(displayItem) + ']');
                    if (displayItem.type == 'item') {
                        var transItem = transItems[displayItem.index];
                        alert('found item [' + GeckoJS.BaseObject.dump(transItem) + ']');
                        if (transItem) transItem.hasMarker = false;
                    }
                    else if (displayItem.type == 'subtotal' ||
                             displayItem.type == 'total' ||
                             displayItem.type == 'tray') {
                        break;
                    }
                }
            }

            this.removeDisplaySeq(index, 1);

            // recalc all
            // this.calcPromotions();
            this.calcItemsTax(itemTrans);
            this.calcTotal();

        }

        var currentRowCount = this.data.display_sequences.length;

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return itemRemoved;


    };


    Transaction.prototype.appendDiscount = function(index, discount){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;
        var lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex);
        var discount_amount;

        var prevRowCount = this.data.display_sequences.length;

        if (item && item.type == 'item') {

            if (discount.type == '$') {
                discount_amount = discount.amount;
            }
            else {
                discount_amount = item.current_subtotal * discount.amount;
            }
            if (discount_amount > item.current_subtotal) {
                // discount too much
                //@todo OSD
                OsdUtils.warn(_('Discount amount [%S] may not exceed item amout [%S]',
                                [this.formatPrice(this.getRoundedPrice(discount_amount)),
                                 itemDisplay.current_subtotal]));
                return;
            }
            item.current_discount = 0 - discount.amount;
            item.discount_name =  discount.name;
            item.discount_rate =  discount.amount;
            item.discount_type =  discount.type;

            item.hasDiscount = true;

            // rounding discount
            item.current_discount = this.getRoundedPrice(item.current_discount);

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(itemIndex, item, 'discount');

            this.data.display_sequences.splice(lastItemDispIndex+1,0,itemDisplay);

            this.calcPromotions();
            this.calcItemsTax(item);


        }else if (itemDisplay.type == 'subtotal'){

            var discountItem = {
                discount_name: discount.name,
                discount_rate: discount.amount,
                discount_type: discount.type,
                current_discount: 0,
                hasMarker: false
            };
            // compute remaining total before any refunds

            var checkitems = this.data.display_sequences;
            var remainder = this.getRemainTotal();
            for (var i = 0; i < checkitems.length; i++) {
                var checkitem = checkitems[i];
                if (checkitem.type == 'item' && checkitem.current_qty < 0)
                    remainder -= checkitem.current_subtotal;
            }
            //remainder -= this.data.tax_subtotal;
            
            if (discountItem.discount_type == '$') {
                discount_amount = discount.amount;
            }
            else {
                discount_amount = this.getRemainTotal() * discountItem.discount_rate;
            }
            if (discount_amount >  remainder) {
                // discount too much
                //@todo OSD
                OsdUtils.warn(_('Discount amount [%S] may not exceed remaining balance before refunds [%S]',
                                [this.formatPrice(this.getRoundedPrice(discount_amount)),
                                 this.formatPrice(this.getRoundedPrice(remainder))]));
                return;
            }
            
            // rounding discount
            discountItem.current_discount = this.getRoundedPrice(0 - discount_amount);

            var discountIndex = GeckoJS.String.uuid();
            this.data.trans_discounts[discountIndex] = discountItem;

            // mark subtotal as having surcharge applied
            itemDisplay.hasDiscount = true;

            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(discountIndex, discountItem, 'trans_discount');
            newItemDisplay.subtotal_index = index;

            this.data.display_sequences.splice(lastItemDispIndex+1,0,newItemDisplay);

            this.calcPromotions();
            
            // this.calcItemsTax();


        }

        var currentRowCount = this.data.display_sequences.length;

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return item;

    };

    Transaction.prototype.appendSurcharge = function(index, surcharge){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;
        var lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex);

        var prevRowCount = this.data.display_sequences.length;

        if (item && item.type == 'item') {

            item.surcharge_name = surcharge.name;
            item.surcharge_rate =  surcharge.amount;
            item.surcharge_type =  surcharge.type;
            item.hasSurcharge = true;

            if (item.surcharge_type == '$') {
                item.current_surcharge = surcharge.amount;
            }else {
                item.current_surcharge = item.current_subtotal * item.surcharge_rate;
            }

            // rounding surcharge
            item.current_surcharge = this.getRoundedPrice(Math.abs(item.current_surcharge));


            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(itemIndex, item, 'surcharge');

            this.data.display_sequences.splice(lastItemDispIndex+1,0,newItemDisplay);

            //this.calcPromotions();

            this.calcItemsTax(item);


        }else if (itemDisplay.type == 'subtotal'){

            var surchargeItem = {
                surcharge_name: surcharge.name,
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

            // mark subtotal as having surcharge applied
            itemDisplay.hasSurcharge = true;
            
            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(surchargeIndex, surchargeItem, 'trans_surcharge');
            newItemDisplay.subtotal_index = index;

            this.data.display_sequences.splice(index+1,0,newItemDisplay);

            this.calcPromotions();
            //this.calcItemsTax();


        }
        
        var currentRowCount = this.data.display_sequences.length;

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount);

        return item;

    };


    Transaction.prototype.shiftTax = function(index, taxIndex){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // display item at cursor position
        var itemIndex = itemDisplay.index;
        var targetDisplayIndex = this.getDisplayIndexByIndex(itemIndex);   // display index of the item being shifted

        if (itemTrans == null || itemTrans.type != 'item') {
            return ; // this should not happen as cart has already checked for this possibility
        }

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
        this.data.display_sequences[targetDisplayIndex] = itemDisplay ;

        var currentRowCount = this.data.display_sequences.length;

        /*
        this.calcPromotions();
        */
        // only calc current item tax
        this.calcItemsTax(itemModified);

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
        
        var item = this.getItemAt(index);                           // item to add condiment to
        var itemDisplay = this.getDisplaySeqAt(index);              // display item at cursor position
        var itemIndex = itemDisplay.index;                          // itemIndex of item to add condiment to
        var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item to add condiment to

        var prevRowCount = this.data.display_sequences.length;

        if (item.type == 'item') {

            if (condiments.length >0) {

                condiments.forEach(function(condiment){

                    // this extra check is a workaround for the bug in XULRunner where an item may appear to be selected
                    // but is actually not
                    if (condiment) {
                        var condimentItem = {
                            id: item.id,
                            name: condiment.name,
                            current_subtotal: (this.getRoundedPrice(condiment.price) == 0) ? '' : this.formatPrice(this.getRoundedPrice(condiment.price))
                        };

                        if(item.condiments == null) item.condiments = {};

                        // check for duplicate condiment;
                        if (condiment.name in item.condiments) {
                            //@todo OSD
                            OsdUtils.warn(_('Condiment [%S] already added to [%S]', [condiment.name, item.name]));
                        }
                        else {
                            item.condiments[condiment.name] = condiment;

                            // up
                            var condimentDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment');
                            this.data.display_sequences.splice(index+1,0,condimentDisplay);

                            var roundedPrice = this.getRoundedPrice(item.current_price) || 0;
                            var roundedSubtotal = this.getRoundedPrice(item.current_qty*item.current_price) || 0;
                            var roundedCondiment = 0;

                            for(var cn in item.condiments) {
                                roundedCondiment += parseFloat(item.condiments[cn].price)*item.current_qty;
                            }

                            roundedCondiment = this.getRoundedPrice(roundedCondiment);

                            item.current_condiment = roundedCondiment;
                            item.current_subtotal = roundedSubtotal + roundedCondiment;

                            // update cartlist 's itemDisplay
                            targetDisplayItem.current_subtotal = this.formatPrice(item.current_subtotal);

                            // item subtotal to condition ??
                            if(false) {
                                condimentDisplay.current_subtotal = this.formatPrice(item.current_subtotal);
                            }
                        }
                    }
                }, this);

            }
            this.calcItemsTax(item);
            this.calcTotal();
        }
        else {
            //@todo OSD
            OsdUtils.warn(_("Condiment may only be added to an item"));
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

            var newItemDisplay = this.createDisplaySeq(itemIndex, memoItem, 'memo');

            this.data.display_sequences.splice(index+1,0,newItemDisplay);

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

        this.updateCartView(prevRowCount, currentRowCount, true);

        this.calcTotal();

    };

    Transaction.prototype.getItemAt = function(index){
        
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        var itemDisplay = this.getDisplaySeqAt(index);
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


    Transaction.prototype.getDisplaySeqCount = function(){
        return this.data.display_sequences.length;
    };

    Transaction.prototype.getDisplayIndexByIndex = function(index) {
        for (var i =0 ; i < this.data.display_sequences.length; i++) {
            if (this.data.display_sequences[i].index == index) return i;
        }
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

    Transaction.prototype.getLastDisplaySeqByIndex = function(index){

        var lastIndex = -1;
        for (var i =0 ; i < this.data.display_sequences.length; i++) {
            var itemDisplay = this.data.display_sequences[i];
            if (itemDisplay.index == index) {
                lastIndex = i;
            }
        }

        return lastIndex ;
    };


    Transaction.prototype.getItemDisplaySeqAt = function(index){
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        var itemDisplay = this.data.display_sequences[index];

        if(itemDisplay.type == 'item') return itemDisplay;

        if (itemDisplay.index) {
            return this.getDisplaySeqByIndex(itemDisplay.index);
        }

        return itemDisplay;
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

        var user = (new GeckoJS.AclComponent()).getUserPrincipal();
        var canOverrideHalo = user ? (GeckoJS.Array.inArray('acl_override_halo', user.Roles) != -1) : false;
        var canOverrideLalo = user ? (GeckoJS.Array.inArray('acl_override_lalo', user.Roles) != -1) : false;

        var priceLevelPrice = this.getPriceLevelPrice(priceLevel, item);
        var priceLevelHalo = this.getPriceLevelHalo(priceLevel, item);
        var priceLevelLalo = this.getPriceLevelLalo(priceLevel, item);

        if (sellPrice == null || typeof sellPrice  == 'undefined' || isNaN(sellPrice) ) sellPrice = priceLevelPrice;
        
        if(priceLevelHalo > 0 && sellPrice > priceLevelHalo && !canOverrideHalo) {

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

            //@todo OSD
            OsdUtils.warn(_('Price adjusted from [%S] to current HALO [%S]', [this.formatPrice(sellPrice), this.formatPrice(obj.newPrice)]));
            
            sellPrice = obj.newPrice;
        }

        if(priceLevelLalo > 0 && sellPrice < priceLevelLalo && !canOverrideLalo) {

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

            //@todo OSD
            OsdUtils.warn(_('Price adjusted from [%S] to current LALO [%S]', [this.formatPrice(sellPrice), this.formatPrice(obj2.newPrice)]));

            sellPrice = obj2.newPrice;
        }

        return sellPrice;

    };

    Transaction.prototype.getPriceLevelPrice = function(priceLevel, item) {
        var price = null;

        if (typeof item['level_enable'+priceLevel] !='undefined' && item['level_enable'+priceLevel]){
            if (!isNaN(parseFloat(item['price_level'+priceLevel]))) {
                price = parseFloat(item['price_level'+priceLevel]);
            }
        }
        if (price == null || isNaN(price)) {
            if (typeof item['price_level1'] !='undefined'){
                price = parseFloat(item['price_level1']);
            }
        }
        return price;

    };

    Transaction.prototype.getPriceLevelHalo = function(priceLevel, item) {
        
        var price = null;
        if (typeof item['level_enable'+priceLevel] !='undefined' && item['level_enable'+priceLevel]){
            if (!isNaN(parseFloat(item['halo'+priceLevel]))) {
                price = parseFloat(item['halo'+priceLevel]);
            }
        }
        if (price == null || isNaN(price)) {
            if (typeof item['halo1'] !='undefined'){
                price = parseFloat(item['halo1']);
            }
        }
        return price;

    };

    Transaction.prototype.getPriceLevelLalo = function(priceLevel, item) {

        var price = null;
        if (typeof item['level_enable'+priceLevel] !='undefined' && item['level_enable'+priceLevel]){
            if (!isNaN(parseFloat(item['lalo'+priceLevel]))) {
                price = parseFloat(item['lalo'+priceLevel]);
            }
        }
        if (price == null || isNaN(price)) {
            if (typeof item['lalo1'] !='undefined'){
                price = parseFloat(item['lalo1']);
            }
        }
        return price;

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

    Transaction.prototype.calcItemsTax =  function(calcItem) {

        // for performance issue
        var items;
        if (calcItem) items = [calcItem];
        else items = this.data.items;


        // item subtotal
        for(var itemIndex in items ) {
            var item = items[itemIndex];

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

                var toTaxCharge = item.current_subtotal + item.current_discount + item.current_surcharge;
                var taxChargeObj = Transaction.Tax.calcTaxAmount(item.tax_name, toTaxCharge);

                // @todo total only or summary ?
                item.current_tax =  taxChargeObj[item.tax_name].charge;
            }else {
                item.current_tax = 0;
            }

            // rounding tax
            item.current_tax = this.getRoundedTax(item.current_tax);

        }

        this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + items);
        Transaction.events.dispatch('onCalcItemsTax', items, this);

    };


    Transaction.prototype.calcTotal = function() {
        
        this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.dump(this.data));
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

        //this.log('DEBUG', "afterCalcTotal " + this.dump(this.data));

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
        var roundedPrice = Transaction.Number.round(price, this.data.precision_prices, this.data.rounding_prices) || 0;
        return roundedPrice;
    };


    Transaction.prototype.getRoundedTax = function(tax) {
        var roundedTax = Transaction.Number.round(tax, this.data.precision_taxes, this.data.rounding_taxes) || 0;
        return roundedTax;
    };

    Transaction.prototype.formatPrice = function(price) {
        var options = {
          places: ((this.data.precision_prices>0)?this.data.precision_prices:0)
        };
        // format display precision
        return Transaction.Number.format(price, options);
    };


    Transaction.prototype.formatTax = function(tax) {
        var options = {
          places: ((this.data.precision_taxes>0)?this.data.precision_taxes:0)
        };
        // format display precision
        return Transaction.Number.format(tax, options);
    };


    // nsirunnable run
    Transaction.prototype.run = function() {
        var order = new OrderModel();
        order.saveOrder(this.data);
    };

    // nsirunnable run
    Transaction.prototype.QueryInterface = function(iid) {
        if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
            return this;
        }
        throw Components.results.NS_ERROR_NO_INTERFACE;
    };


})();
