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

                terminal_no: GeckoJS.Session.get('terminal_id'),

                created: '',
                modified: ''

            };

            this.create();


        },

        serialize: function() {
            // @todo 
            return GeckoJS.BaseObject.serialize(this.data);
        },

        unserialize: function(data) {
        // @todo
            this.data = GeckoJS.BaseObject.unserialize(data);
        },

        unserializeFromOrder: function(order_id) {
            var order = new OrderModel();
            this.data = order.unserializeOrder(order_id);
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
            this.data.service_clerk_displayname = user.description;
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
        this.data.decimals = GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.';
        this.data.thousands = GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',';

        if (Transaction.worker == null) {
          //  Transaction.worker = new GeckoJS.Thread();

          Transaction.worker = GREUtils.Thread.getMainThread();
        }
        //Transaction.worker._runnable = this;

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
        //Transaction.worker.start();
        Transaction.worker.dispatch(this, Transaction.worker.DISPATCH_NORMAL);

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
            this.data.proceeds_clerk_displayname = user.description;
        }

        // use backgroud to save
        //Transaction.worker.start();
        Transaction.worker.dispatch(this, Transaction.worker.DISPATCH_NORMAL);

        // maintain stock...
        this.requestCommand('decStock', this.data, "Stocks");
        
    };

    Transaction.prototype.isSubmit = function() {
        return (this.data.status == 1);
    };


    Transaction.prototype.updateCartView = function(prevRowCount, currentRowCount, cursorIndex) {

        this.view.data = this.data.display_sequences;
        this.view.rowCountChanged(prevRowCount, currentRowCount, cursorIndex);
        
        GeckoJS.Session.set('vivipos_fec_number_of_items', this.getItemsCount());
        GeckoJS.Session.set('vivipos_fec_tax_total', this.formatTax(this.getRoundedTax(this.data.tax_subtotal)));

    },

    Transaction.prototype.createItemDataObj = function(index, item, sellQty, sellPrice, parent_index) {

        var roundedPrice = sellPrice || 0;
        var roundedSubtotal = this.getRoundedPrice(sellQty*sellPrice) || 0;
        
        // name,current_qty,current_price,current_subtotal
        var item2 = {
            type: 'item', // item or category
            id: item.id,
            no: item.no,
            barcode: item.barcode,
            name: item.name,
            cate_no: item.cate_no,

            index: index,
            stock_status: item.stock_status,
            age_verification: item.age_verification,
            parent_index: parent_index,
            
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

    Transaction.prototype.createDisplaySeq = function(index, item, type, level) {

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
                stock_status: item.stock_status,
                age_verification: item.age_verification,
                level: (level == null) ? 0 : level
            });
        }else if (type == 'setitem') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: item.id,
                no: item.no,
                name: item.name,
                current_qty: item.current_qty,
                current_price: '',
                //current_subtotal: item.current_subtotal + item.current_condiment,
                current_subtotal: '',
                current_tax: '',
                type: type,
                index: index,
                stock_status: item.stock_status,
                age_verification: item.age_verification,
                level: (level == null) ? 1 : level
            });
        }else if (type == 'discount') {
            if (item.discount_name && item.discount_name.length > 0) {
                dispName = _(item.discount_name);
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
                level: (level == null) ? 2 : level
            });
        }else if (type == 'trans_discount') {
            if (item.discount_name != null && item.discount_name.length > 0) {
                dispName = _(item.discount_name);
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
                level: (level == null) ? 0 : level
            });
        }else if (type == 'surcharge') {
            if (item.surcharge_name && item.surcharge_name.length > 0) {
                dispName = _(item.surcharge_name);
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
                level: (level == null) ? 2 : level
            });
        }else if (type == 'trans_surcharge') {
            if (item.surcharge_name && item.surcharge_name.length > 0) {
                dispName = _(item.surcharge_name);
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
                level: (level == null) ? 0 : level
            });
        }else if (type == 'tray' || type == 'subtotal' || type == 'total') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: _(item.name),
                current_qty: item.current_tax,
                current_price: item.current_price,
                current_subtotal: item.current_subtotal,
                current_tax: '',
                type: type,
                index: index,
                level: (level == null) ? 0 : level
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
                level: (level == null) ? 1 : level
            });           
        }else if(type =='payment') {
            itemDisplay = GREUtils.extend(itemDisplay, {
                id: '',
                name: _(item.name.toUpperCase()),
                current_qty: '',
                current_price: '',
                current_subtotal: item.amount,
                current_tax: '',
                type: type,
                index: index,
                level: (level == null) ? 0 : level
            });
        }
        // format display precision
        if(itemDisplay.current_subtotal != '' || itemDisplay.current_subtotal === 0) {
            itemDisplay.current_subtotal = this.formatPrice(itemDisplay.current_subtotal)
        }
        
        // format display precision - don't round unit price
        if(itemDisplay.current_price != ''  || itemDisplay.current_price === 0 ) {
            if (type == 'total' || type == 'subtotal') {
                itemDisplay.current_price = this.formatPrice(itemDisplay.current_price);
            }
            else {
                itemDisplay.current_price = this.formatUnitPrice(itemDisplay.current_price);
            }
        }
        
        // tax amount is displayed in the current_qty field for readability
        if(itemDisplay.current_qty != ''  || itemDisplay.current_qty === 0 ) {
            if (type == 'total' || type == 'subtotal') {
                itemDisplay.current_qty = this.formatTax(itemDisplay.current_qty) + 'T';
            }
            else if (type == 'item' || type == 'setitem') {
                itemDisplay.current_qty += 'X';
            }
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

    Transaction.prototype.checkSellPrice = function(item) {
        var sellQty = item.current_qty, sellPrice = item.current_price;

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

        sellPrice = this.getSellPriceByPriceLevel(sellPrice, sellQty, item, false);
        return sellPrice;
    };

    Transaction.prototype.appendItem = function(item){

        var productsById = GeckoJS.Session.get('productsById');
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
        var itemDisplay = this.createDisplaySeq(itemIndex, itemAdded, 'item');
        
        this.data.display_sequences.push(itemDisplay);

        // if set menu, append individual items into transaction
        // create data object to push in items array
        var setmenus = [];
        if (item.setmenu != null && item.setmenu.length > 0) {
            // invoke Product controller to get
            setmenus = GeckoJS.Controller.getInstanceByName('Plus')._setMenuFromString(item);
        }

        var self = this;
        setmenus.forEach(function(setitem) {
            var setItemProduct = productsById[setitem.item_id];
            var setItemQty = setitem.quantity * sellQty;
            var setItemIndex = GeckoJS.String.uuid();
            var setItemAdded = self.createItemDataObj(setItemIndex, setItemProduct, setItemQty, 0, itemIndex);

            self.data.items[setItemIndex] = setItemAdded;

            var setItemDisplay = self.createDisplaySeq(setItemIndex, setItemAdded, 'setitem');

            self.data.display_sequences.push(setItemDisplay);
        });

        this.log('DEBUG', 'dispatchEvent afterAppendItem ' + this.dump(itemAdded));
        Transaction.events.dispatch('afterAppendItem', itemAdded, this);

        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        // only calc current item tax 
        this.calcItemsTax(itemAdded);

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount, currentRowCount - 1);

        this.updateLastSellItem(itemAdded);

        return itemAdded;
    };


    Transaction.prototype.modifyItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
        var itemIndex = itemDisplay.index;
        var productsById = GeckoJS.Session.get('productsById');

        if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
            return ; // TODO - shouldn't be here since cart has intercepted illegal operations
        }

        var item = null;
        if(productsById[itemTrans.id]) {
            item = GREUtils.extend({}, productsById[itemTrans.id]);
        }else {
            item = GREUtils.extend({},itemTrans);
        }
        
        var sellQty = itemTrans.current_qty;
        var oldSellQty = itemTrans.current_qty;
        var sellPrice = itemTrans.current_price;
        var condimentPrice = 0;
        var setItems = [];

        // modify Qty & Price...if item is being modified
        if (itemDisplay.type == 'item') {
            sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
            if (sellQty == null) sellQty = 1;

            if (itemTrans.current_qty < 0 && sellQty > 0) sellQty = 0 - sellQty;

            sellPrice  = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : sellPrice;

            sellPrice = this.calcSellPrice(sellPrice, sellQty, item);
        }
        else if (itemDisplay.type == 'condiment') {
            condimentPrice = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : itemDisplay.current_price;
            var condimentItem = {
                id: itemDisplay.id,
                name: itemDisplay.name,
                current_subtotal: condimentPrice == 0 ? '' : condimentPrice
            };
        }
        var obj = {
            sellPrice: sellPrice,
            sellQty: sellQty,
            item: item
        };

        this.log('DEBUG', 'dispatchEvent beforeModifyItem ' + this.dump(obj) );
        Transaction.events.dispatch('beforeModifyItem', obj, this);
        // case 1: modifying top level item
        if (itemDisplay.type == 'item') {
            // create data object to push in items array
            var itemModified = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);
            itemTrans.current_qty = itemModified.current_qty;
            itemTrans.current_price = itemModified.current_price;
            itemTrans.current_subtotal = itemModified.current_subtotal;
            itemModified = itemTrans;

            // update to items array
            this.data.items[itemIndex]  = itemModified;

            this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
            Transaction.events.dispatch('afterModifyItem', itemModified, this);

            var itemDisplay2 = this.createDisplaySeq(itemIndex, itemModified, 'item');

            // create data object to push in items array
        
            // update display
            this.data.display_sequences[index] = itemDisplay2 ;

            // update set item counts and condiment subtotals if quantity has changed
            if (itemModified.current_qty != oldSellQty) {
                var self = this;
                setItems = this.getSetItemsByIndex(itemModified.index);

                setItems.forEach(function(setitem) {
                    var setItemDisplayIndex =  self.getDisplayIndexByIndex(setitem.index);

                    setitem.current_qty = setitem.current_qty * itemModified.current_qty / oldSellQty;

                    // sum condiments
                    var condiment_subtotal = 0;
                    for(var cn in setitem.condiments) {
                        condiment_subtotal += parseFloat(setitem.condiments[cn].price) * setitem.current_qty;
                    }
                    setitem.current_condiment = condiment_subtotal;

                    var setItemDisplay = self.createDisplaySeq(setitem.index, setitem, 'setitem');

                    self.data.display_sequences[setItemDisplayIndex] = setItemDisplay;
                });
            }
        }
        else if (itemDisplay.type == 'condiment') {
            var targetItem = this.data.items[itemIndex];
            // case 2: modifying top level condiment
            if (targetItem.parent_index == null) {

                var condiments = itemTrans.condiments;

                if (condiments) {
                    for(var cn in itemTrans.condiments) {
                        // update condiment price before recalculating subtotal if modifying condiment
                        if (itemTrans.condiments[cn].name == itemDisplay.name) {
                            itemTrans.condiments[cn].price = condimentPrice;
                        }
                    }

                    var condimentItemDisplay2 = this.createDisplaySeq(itemIndex, condimentItem, 'condiment');

                    // update condiment display
                    this.data.display_sequences[index] = condimentItemDisplay2 ;

                    // update item condiment subtotal
                    //var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item the condiment is attached to
                    //targetDisplayItem.current_subtotal = itemDisplay2.current_subtotal;
                    var itemModified = itemTrans;
                }
            }
            // case 3: modifying set item condiment
            else {
                if (targetItem.condiments) {
                    for(var cn in targetItem.condiments) {
                        // update condiment price before recalculating subtotal if modifying condiment
                        if (targetItem.condiments[cn].name == itemDisplay.name) {
                            targetItem.condiments[cn].price = condimentPrice;
                        }
                    }
                    // sum condiments
                    var condiment_subtotal = 0;
                    for(var cn in targetItem.condiments) {
                        condiment_subtotal += parseFloat(targetItem.condiments[cn].price) * targetItem.current_qty;
                    }

                    targetItem.current_condiment = condiment_subtotal;

                    var condimentItemDisplay2 = this.createDisplaySeq(itemIndex, condimentItem, 'condiment', 2);

                    // update condiment display
                    this.data.display_sequences[index] = condimentItemDisplay2 ;

                    // update item condiment subtotal
                    //var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item the condiment is attached to
                    //targetDisplayItem.current_subtotal = itemDisplay2.current_subtotal;
                    itemModified = itemTrans;
                }
            }
        }
        var currentRowCount = this.data.display_sequences.length;

        this.calcPromotions();

        this.calcItemSubtotal(itemModified);
        this.calcItemsTax(itemModified);

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount, index);

        this.updateLastSellItem(itemModified);

        return itemModified;
        
    };


    Transaction.prototype.voidItemAt = function(index){

        var prevRowCount = this.data.display_sequences.length;

        var itemTrans = this.getItemAt(index); // item in transaction
        var itemDisplay = this.getDisplaySeqAt(index); // item in display
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

            // remove from items array
            var itemRemoved = itemTrans;
            delete(this.data.items[itemIndex]);
            this.data.items_count--;

            // remove set items from items array
            var setItems = this.getSetItemsByIndex(itemIndex);
            var self = this;
            setItems.forEach(function(setitem) {
                delete(self.data.items[setitem.index]);
            });
            
            var removeCount = 1;
            var display_sequences = this.data.display_sequences;

            // look down display sequence to find location of next item that is
            // not a discount, surcharge, or memo

            for (var i = index + 1; i < display_sequences.length; i++) {
                var checkItem = display_sequences[i];
                if (checkItem.type == 'discount' ||
                    checkItem.type =='surcharge' ||
                    checkItem.type =='setitem' ||
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
                if (itemTrans) itemTrans.memo= "";
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
                // condiment may be linked to a set item
                var targetItem = this.getItemAt(index, true);
                delete targetItem.condiments[itemDisplay.name];

                // if item is a set item, compute condiment subtotals
                if (targetItem.parent_index != null) {
                    var condiment_subtotal = 0;

                    // sum condiments
                    for(var cn in targetItem.condiments) {
                        condiment_subtotal += parseFloat(targetItem.condiments[cn].price) * targetItem.current_qty;
                    }

                    targetItem.current_condiment = condiment_subtotal;
                }
                this.calcItemSubtotal(itemTrans);

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
                        NotifyUtils.warn(_('Cannot VOID a payment that has been subtotaled'));

                        return;
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
                    if (displayItem.type == 'item') {
                        var transItem = transItems[displayItem.index];
                        if (transItem) transItem.hasMarker = false;
                    }
                    else if (displayItem.type == 'trans_discount') {
                        this.log('adjustment display item: ' + GeckoJS.BaseObject.dump(displayItem));
                        this.log('adjustment item: ' + GeckoJS.BaseObject.dump(this.data.trans_discounts[displayItem.index]));
                        this.data.trans_discount[displayItem.index].hasMarker = false;
                    }
                    else if (displayItem.type == 'trans_surcharge') {
                        this.log('adjustment display item: ' + GeckoJS.BaseObject.dump(displayItem));
                        this.log('adjustment item: ' + GeckoJS.BaseObject.dump(this.data.trans_surcharges[displayItem.index]));
                        this.data.trans_surcharges[displayItem.index].hasMarker = false;
                    }
                    else if (displayItem.type == 'subtotal' ||
                             displayItem.type == 'total' ||
                             displayItem.type == 'tray') {
                        break;
                    }
                }

                if (itemDisplay.type == 'tray') {
                    this.data.markers.length--;
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

        this.updateCartView(prevRowCount, currentRowCount, index);

        return itemRemoved;


    };

    Transaction.prototype.calcItemSubtotal = function(item) {
        var subtotal = item.current_qty * item.current_price || 0;
        var condiment_subtotal = 0;
        var setmenu_subtotal = 0;

        // sum condiments
        for(var cn in item.condiments) {
            condiment_subtotal += parseFloat(item.condiments[cn].price) * item.current_qty;
        }

        item.current_condiment = condiment_subtotal;

        // sum set item subtotals

        var setItems = this.getSetItemsByIndex(item.index);
        var itemDisplay = this.getDisplaySeqByIndex(item.index);

        setItems.forEach(function(setitem) {
           condiment_subtotal += setitem.current_condiment;
        });
        item.current_subtotal = this.getRoundedPrice(subtotal + condiment_subtotal);
        itemDisplay.current_subtotal = this.formatPrice(item.current_subtotal);
    };

    Transaction.prototype.appendDiscount = function(index, discount){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;
        var lastItemDispIndex;
        var discount_amount;
        var resultItem;

        var prevRowCount = this.data.display_sequences.length;

        if (item && item.type == 'item') {

            if (discount.type == '$') {
                discount_amount = discount.amount;
            }
            else {
                discount_amount = item.current_subtotal * discount.amount;
            }
            if (discount_amount > item.current_subtotal && item.current_subtotal > 0) {
                // discount too much
                //@todo OSD
                NotifyUtils.warn(_('Discount amount [%S] may not exceed item amout [%S]',
                                 [this.formatPrice(this.getRoundedPrice(discount_amount)),
                                 item.current_subtotal]));
                return;
            }
            item.current_discount = 0 - discount_amount;
            item.discount_name =  discount.name;
            item.discount_rate =  discount.amount;
            item.discount_type =  discount.type;
            item.hasDiscount = true;

            // rounding discount
            item.current_discount = this.getRoundedPrice(item.current_discount);

            // create data object to push in items array
            var itemDisplay = this.createDisplaySeq(item.index, item, 'discount');

            // find the display index of the last entry associated with the item
            lastItemDispIndex = this.getLastDisplaySeqByIndex(item.index)

            this.data.display_sequences.splice(++lastItemDispIndex,0,itemDisplay);

            this.calcPromotions();
            this.calcItemsTax(item);

            resultItem = item;

        }else if (itemDisplay.type == 'subtotal'){

            var discountItem = {
                discount_name: discount.name,
                discount_rate: discount.amount,
                discount_type: discount.type,
                hasMarker: false
            };
            // warn if refunds are present
            for (var checkItemIndex in this.data.items ) {
                var checkitem = this.data.items[checkItemIndex];
                if (checkitem.type == 'item' && checkitem.current_qty < 0) {
                    //@todo OSD
                    NotifyUtils.warn(_('ATTENTION: return item(s) are present'));
                }
            }

            var remainder = this.getRemainTotal();
            if (discountItem.discount_type == '$') {
                discountItem.current_discount = discount.amount;
            }
            else {
                //@todo
                // percentage order surcharge is pretax?
                if (discount.pretax == null) discount.pretax = false;

                if (discount.pretax) {
                    discountItem.current_discount = (remainder - this.data.tax_subtotal) * discountItem.discount_rate;
                }
                else {
                    discountItem.discount_name += '*';
                    discountItem.current_discount = remainder * discountItem.discount_rate;
                }
            }
            if (discountItem.current_discount > remainder && remainder > 0) {
                // discount too much
                //@todo OSD
                NotifyUtils.warn(_('Discount amount [%S] may not exceed remaining balance [%S]',
                                   [this.formatPrice(this.getRoundedPrice(discountItem.current_discount)),
                                 remainder]));
                return;
            }
            discountItem.current_discount = this.getRoundedPrice(0 - discountItem.current_discount);
            
            var discountIndex = GeckoJS.String.uuid();
            this.data.trans_discounts[discountIndex] = discountItem;

            // mark subtotal as having surcharge applied
            itemDisplay.hasDiscount = true;

            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(discountIndex, discountItem, 'trans_discount');
            newItemDisplay.subtotal_index = index;

            // find the display index of the last entry associated with the item
            lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex)

            this.data.display_sequences.splice(++lastItemDispIndex,0,newItemDisplay);

            this.calcPromotions();
            
            // this.calcItemsTax();

            resultItem = discountItem;
        }

        var currentRowCount = this.data.display_sequences.length;

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount, lastItemDispIndex);

        return resultItem;

    };

    Transaction.prototype.appendSurcharge = function(index, surcharge){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index); // last seq
        var itemIndex = itemDisplay.index;
        var lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex);
        var resultItem;

        var prevRowCount = this.data.display_sequences.length;

        var displayIndex = lastItemDispIndex;

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
            item.current_surcharge = this.getRoundedPrice(item.current_surcharge);


            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(item.index, item, 'surcharge');

            this.data.display_sequences.splice(++displayIndex,0,newItemDisplay);

            //this.calcPromotions();

            this.calcItemsTax(item);

            resultItem = item;

        }else if (itemDisplay.type == 'subtotal'){

            var surchargeItem = {
                surcharge_name: surcharge.name,
                surcharge_rate: surcharge.amount,
                surcharge_type: surcharge.type,
                hasMarker: false
            };

            // warn if refunds are present

            for (var checkItemIndex in this.data.items ) {
                var checkitem = this.data.items[checkItemIndex];
                if (checkitem.type == 'item' && checkitem.current_qty < 0) {
                    //@todo OSD
                    NotifyUtils.warn(_('ATTENTION: return item(s) are present'));
                }
            }

            if (surchargeItem.surcharge_type == '$') {
                surchargeItem.current_surcharge = this.getRoundedPrice(surcharge.amount);
            }else {
                //@todo
                // percentage order surcharge is pretax?
                if (surcharge.pretax == null) surcharge.pretax = false;
                if (surcharge.pretax) {
                    surchargeItem.current_surcharge = this.getRoundedPrice((this.getRemainTotal() - this.data.tax_subtotal) * surchargeItem.surcharge_rate);
                }
                else {
                    surchargeItem.surcharge_name += '*';
                    surchargeItem.current_surcharge = this.getRoundedPrice(this.getRemainTotal() * surchargeItem.surcharge_rate);
                }
            }

            var surchargeIndex = GeckoJS.String.uuid();
            this.data.trans_surcharges[surchargeIndex] = surchargeItem;

            // mark subtotal as having surcharge applied
            itemDisplay.hasSurcharge = true;
            
            // create data object to push in items array
            var newItemDisplay = this.createDisplaySeq(surchargeIndex, surchargeItem, 'trans_surcharge');
            newItemDisplay.subtotal_index = index;

            this.data.display_sequences.splice(++displayIndex,0,newItemDisplay);

            this.calcPromotions();
            //this.calcItemsTax();

            resultItem = surchargeItem;
        }
        
        var currentRowCount = this.data.display_sequences.length;

        this.calcTotal();

        this.updateCartView(prevRowCount, currentRowCount, displayIndex);

        return resultItem;

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

        this.updateCartView(prevRowCount, currentRowCount, index);

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
            type: type
        };
        
        var remain = this.getRemainTotal();
        
        var subtotal = 0;
        if (type == 'tray') {
            var preSubtotal = this.data.markers[this.data.markers.length-1] || 0;
            markerItem.current_subtotal = remain - preSubtotal;
            markerItem.current_tax = '';
            markerItem.current_price = '';

            this.data.markers.push(remain);
        }else {
            markerItem.current_tax = this.data.tax_subtotal;
            markerItem.current_subtotal = remain;
            markerItem.current_price = remain - markerItem.current_tax;
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

        this.updateCartView(prevRowCount, currentRowCount, currentRowCount - 1);

        return markerItem;

    
    };

    Transaction.prototype.appendCondiment = function(index, condiments){
        
        var item = this.getItemAt(index, true);                           // item to add condiment to
        var targetItem = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);              // display item at cursor position
        var itemIndex = itemDisplay.index;                          // itemIndex of item to add condiment to
        var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item to add condiment to

        var prevRowCount = this.data.display_sequences.length;

        var displayIndex = index;

        if (item.type == 'item') {

            if (condiments.length >0) {

                condiments.forEach(function(condiment){
                    // this extra check is a workaround for the bug in XULRunner where an item may appear to be selected
                    // but is actually not
                    if (condiment) {
                        var condimentItem = {
                            id: item.id,
                            name: condiment.name,
                            current_subtotal: condiment.price == 0 ? '' : condiment.price
                        };

                        if(item.condiments == null) item.condiments = {};

                        // check for duplicate condiment;
                        if (condiment.name in item.condiments) {
                            //@todo OSD
                            NotifyUtils.warn(_('Condiment [%S] already added to [%S]', [condiment.name, item.name]));
                        }
                        else {
                            var newCondiment = GeckoJS.BaseObject.extend(condiment, {});
                            item.condiments[condiment.name] = newCondiment;

                            // update condiment display
                            var level = targetDisplayItem.type == 'setitem' ? 2 : null;
                            var condimentDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment', level);
                            this.data.display_sequences.splice(index+1,0,condimentDisplay);

                            displayIndex++;
                        }
                    }
                }, this);

            }

            // if item is a set item, compute condiment subtotals
            if (item.parent_index != null) {
                var condiment_subtotal = 0;

                // sum condiments
                for(var cn in item.condiments) {
                    condiment_subtotal += parseFloat(item.condiments[cn].price) * item.current_qty;
                }

                item.current_condiment = condiment_subtotal;
            }
            
            this.calcItemSubtotal(targetItem);
            this.calcItemsTax(targetItem);
            this.calcTotal();
        }
        else {
            //@todo OSD
            NotifyUtils.warn(_("Condiment may only be added to an item"));
        }

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount, displayIndex);

        return item;


    };


    Transaction.prototype.appendMemo = function(index, memo){

        var item = this.getItemAt(index);
        var itemDisplay = this.getDisplaySeqAt(index);
        var itemIndex = itemDisplay.index;
        var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item to add memo to

        var prevRowCount = this.data.display_sequences.length;

        var memoItem = {
            id: (item) ? item.id : '',
            name: memo,
            current_subtotal: ''
        };


        if (item) {
            item.memo = memo;
        }
        var level = targetDisplayItem.type == 'setitem' ? 2 : null;
        var newItemDisplay = this.createDisplaySeq(itemIndex, memoItem, 'memo', level);

        this.data.display_sequences.splice(index+1,0,newItemDisplay);

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount, index + 1);

        return item;


    };


    Transaction.prototype.appendPayment = function(type, amount, origin_amount, memo1, memo2){
        
        var prevRowCount = this.data.display_sequences.length;

        var paymentId =  GeckoJS.String.uuid();
        var paymentItem = {
            id: paymentId,
            name: type,
            amount: amount,
            origin_amount: origin_amount,
            memo1: memo1,
            memo2: memo2
        };

        var itemDisplay = this.createDisplaySeq(paymentId, paymentItem, 'payment');

        var lastIndex = this.data.display_sequences.length - 1;
        this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

        this.data.trans_payments[paymentId] = paymentItem;

        var currentRowCount = this.data.display_sequences.length;

        this.updateCartView(prevRowCount, currentRowCount, currentRowCount - 1);

        this.calcTotal();

        return paymentItem;
    };

    Transaction.prototype.getItemAt = function(index, inclusive){
        
        if (index < 0 || index >= this.data.display_sequences.length) return null;

        if (inclusive == null) inclusive = false;

        var itemDisplay = this.getDisplaySeqAt(index);
        var item = null;
        var itemIndex = itemDisplay.index;

        switch(itemDisplay.type) {
            case 'item':
                item = this.data.items[itemIndex];
                break;
            case 'setitem':
                if (inclusive)
                    item = this.data.items[itemIndex];
                else {
                    var parent_index = this.data.items[itemIndex].parent_index;
                    item = this.data.items[parent_index];
                }
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
                if (!inclusive && item != null && item.parent_index != null) {
                    item = this.data.items[item.parent_index];
                }
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
            else if (itemDisplay.type == 'setitem' &&
                     this.data.items[itemDisplay.index].parent_index == index) {
                lastIndex = i;
            }
            else if ((itemDisplay.type == 'condiment' || itemDisplay.type == 'memo') &&
                     (this.data.items[itemDisplay.index].parent_index == index)) {
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

    Transaction.prototype.getSetItemsByIndex = function(parent_index) {
        var setItems = [];
        for (var itemIndex in this.data.items) {
            var item = this.data.items[itemIndex];

            if (item.parent_index == parent_index)
                setItems.push(item);
        }
        return setItems;
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

    Transaction.prototype.getSellPriceByPriceLevel = function(sellPrice, sellQty, item, notify) {

        if (notify == null) notify = true;

        var priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');

        //var user = (new GeckoJS.AclComponent()).getUserPrincipal();
        //var canOverrideHalo = user ? (GeckoJS.Array.inArray('acl_override_halo', user.Roles) != -1) : false;
        //var canOverrideLalo = user ? (GeckoJS.Array.inArray('acl_override_lalo', user.Roles) != -1) : false;
        var mainController = GeckoJS.Controller.getInstanceByName('Main');
        var canOverrideHalo = mainController.Acl.isUserInRole('acl_override_halo');
        var canOverrideLalo = mainController.Acl.isUserInRole('acl_override_lalo');

        var priceLevelPrice = this.getPriceLevelPrice(priceLevel, item);
        var priceLevelHalo = this.getPriceLevelHalo(priceLevel, item);
        var priceLevelLalo = this.getPriceLevelLalo(priceLevel, item);

        if (sellPrice == null || typeof sellPrice  == 'undefined' || isNaN(sellPrice) ) sellPrice = priceLevelPrice;
        
        if(priceLevelHalo > 0 && sellPrice > priceLevelHalo) {

            if (canOverrideHalo) {
                if (notify) NotifyUtils.warn(_('Price HALO [%S] overridden on [%S]', [this.formatPrice(priceLevelHalo), item.name]));
            }
            else {
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
                if (notify) NotifyUtils.warn(_('Price adjusted from [%S] to current HALO [%S]', [this.formatPrice(sellPrice), this.formatPrice(obj.newPrice)]));

                sellPrice = obj.newPrice;
            }
        }

        if(priceLevelLalo > 0 && sellPrice < priceLevelLalo) {

            if (canOverrideLalo) {
                if (notify) NotifyUtils.warn(_('Price LALO [%S] overridden on [%S]', [this.formatPrice(priceLevelLalo), item.name]));
            }
            else {
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
                if (notify) NotifyUtils.warn(_('Price adjusted from [%S] to current LALO [%S]', [this.formatPrice(sellPrice), this.formatPrice(obj2.newPrice)]));

                sellPrice = obj2.newPrice;
            }
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
            if (item.parent_index == null) {
                var tax = Transaction.Tax.getTax(item.tax_name);
                if(tax) {
                    item.tax_rate = tax.rate;
                    item.tax_type = tax.type;

                    var toTaxCharge = item.current_subtotal + item.current_discount + item.current_surcharge;
                    var taxChargeObj = Transaction.Tax.calcTaxAmount(item.tax_name, Math.abs(toTaxCharge));

                    // @todo total only or summary ?
                    item.current_tax =  taxChargeObj[item.tax_name].charge;
                }else {
                    item.current_tax = 0;
                }

                // rounding tax
                item.current_tax = this.getRoundedTax(item.current_tax);
                if (toTaxCharge < 0) item.current_tax = 0 - item.current_tax;
            }
        }

        this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + items);
        Transaction.events.dispatch('onCalcItemsTax', items, this);

    };


    Transaction.prototype.calcTotal = function() {
        
        this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.dump(this.data));
        Transaction.events.dispatch('onCalcTotal', this.data, this);

        var total=0, remain=0, item_subtotal=0, tax_subtotal=0, item_surcharge_subtotal=0, item_discount_subtotal=0;
        var trans_surcharge_subtotal=0, trans_discount_subtotal=0, payment_subtotal=0;

        // item subtotal and grouping
        this.data.items_summary = {}; // reset summary
        for(var itemIndex in this.data.items ) {
            var item = this.data.items[itemIndex];
            tax_subtotal += parseFloat(item.current_tax);
            item_surcharge_subtotal += parseFloat(item.current_surcharge);
            item_discount_subtotal += parseFloat(item.current_discount);
            item_subtotal += parseFloat(item.current_subtotal);

            // summary it
            var item_id = item.id;
            let sumItem = this.data.items_summary[item_id] || {id: item_id, name: item.name,
                          qty_subtotal: 0, subtotal: 0, discount_subtotal: 0, surcharge_subtotal: 0};

            sumItem.qty_subtotal += item.current_qty;
            sumItem.subtotal += parseFloat(item.current_subtotal);
            sumItem.discount_subtotal += parseFloat(item.current_discount);
            sumItem.surcharge_subtotal += parseFloat(item.current_surcharge);

            this.data.items_summary[item_id] = sumItem;
        }

        // trans subtotal
        for(var transDisIndex in this.data.trans_discounts ) {
            var disItem = this.data.trans_discounts[transDisIndex];
            trans_discount_subtotal += parseFloat(disItem.current_discount);
        }

        for(var transSurIndex in this.data.trans_surcharges ) {
            var surItem = this.data.trans_surcharges[transSurIndex];
            trans_surcharge_subtotal += parseFloat(surItem.current_surcharge);
        }

        for(var payIndex in this.data.trans_payments ) {
            var payItem = this.data.trans_payments[payIndex];
            payment_subtotal += parseFloat(payItem.amount);
        }

        total = item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal;
        remain = total - payment_subtotal;

        this.data.total = this.getRoundedPrice(total);
        this.data.remain = remain;
        this.data.tax_subtotal = tax_subtotal;
        this.data.item_surcharge_subtotal = item_surcharge_subtotal;
        this.data.item_discount_subtotal = item_discount_subtotal;
        this.data.trans_surcharge_subtotal = trans_surcharge_subtotal;
        this.data.trans_discount_subtotal = trans_discount_subtotal ;
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
        var roundedPrice = Transaction.Number.round(Math.abs(price), this.data.precision_prices, this.data.rounding_prices) || 0;
        if (price < 0) roundedPrice = 0 - roundedPrice;
        return roundedPrice;
    };


    Transaction.prototype.getRoundedTax = function(tax) {
        var roundedTax = Transaction.Number.round(Math.abs(tax), this.data.precision_taxes, this.data.rounding_taxes) || 0;
        if (tax < 0) roundedTax = 0 - roundedTax;
        return roundedTax;
    };

    Transaction.prototype.formatPrice = function(price) {
        var options = {
          decimals: this.data.decimals,
          thousands: this.data.thousands,
          places: ((this.data.precision_prices>0)?this.data.precision_prices:0)
        };
        // format display precision
        return Transaction.Number.format(price, options);
    };

    Transaction.prototype.formatUnitPrice = function(price) {
        var priceStr = price + '';
        var dpIndex = priceStr.lastIndexOf('.');
        var places = 0;
        if (dpIndex > -1) {
            places = priceStr.length - dpIndex - 1;
        }
        var options = {
          decimals: this.data.decimals,
          thousands: this.data.thousands,
          places: Math.max(places, ((this.data.precision_prices>0)?this.data.precision_prices:0))
        };
        // format display precision
        return Transaction.Number.format(price, options);
    };

    Transaction.prototype.formatTax = function(tax) {
        var options = {
          decimals: this.data.decimals,
          thousands: this.data.thousands,
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
