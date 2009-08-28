(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    // declare Transaction Base Object / data encapsulate
    var __model__ = {

        name: 'Transaction',

        init: function(recoveryMode) {

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
                revalue_subtotal: 0,
                qty_subtotal: 0,
                tax_subtotal: 0,
                included_tax_subtotal: 0,
                surcharge_subtotal: 0,
                discount_subtotal: 0,
                payment_subtotal: 0,
                
                promotion_subtotal: 0,
                promotion_apply_items: null,
                promotion_matched_items: null,
                promotion_tax_subtotal: 0,
                promotion_included_tax_subtotal: 0,

                price_modifier: 1,    // used to modify item subtotals
                
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
                destination_prefix: '',

                table_no: '',
                check_no: '',

                no_of_customers: '',

                terminal_no: '',
                sale_period: '',
                shift_number: '',

                batchCount: 0,
                closed: false,

                created: '',
                modified: '',
                lastModifiedTime: ''
            };

            this.create(recoveryMode);


        },

        serialize: function() {
            return GeckoJS.BaseObject.serialize(this.data);
        },

        unserialize: function(data) {
            this.data = GeckoJS.BaseObject.unserialize(data);
            Transaction.events.dispatch('onUnserialize', this, this);
        },

        unserializeFromOrder: function(order_id) {
            var order = new OrderModel();
            this.data = order.unserializeOrder(order_id);

            if (this.data == null) {
                this.lastError = order.lastError;
                this.lastErrorString = order.lastErrorString;
                return false;
            }
            Transaction.events.dispatch('onUnserialize', this, this);
            return true;
        },

        buildOrderSequence: function(seq) {
            var sequenceNumberLength = GeckoJS.Configure.read('vivipos.fec.settings.SequenceNumberLength') || 4;
            var sequenceTrackSalePeriod = GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod') || false;

            if (seq != -1) {
                var newSeq = (seq+'');
                if (newSeq.length < sequenceNumberLength) {
                    newSeq = GeckoJS.String.padLeft(newSeq, sequenceNumberLength, '0');
                }
                if (sequenceTrackSalePeriod) {
                    var salePeriod = GeckoJS.Session.get('sale_period');
                    newSeq = new Date(salePeriod * 1000).toString('yyyyMMdd') + newSeq;
                }
                return newSeq;
            }
            else {
                return seq;
            }
        },

        create: function(recoveryMode) {

            recoveryMode = recoveryMode || false;

            var self = this;

            this.syncSettings = (new SyncSetting()).read();
            
            this.data.id = GeckoJS.String.uuid();

            this.data.terminal_no = GeckoJS.Session.get('terminal_no');

            if (!recoveryMode) {
                // SequenceModel will always return a value; even if an error occurred (return value of -1), we
                // should still allow create to proceed; it's up to the upper layer to decide how to handle
                // this error condition
                SequenceModel.getSequence('order_no', true, function(seq) {
                    self.data.seq = self.buildOrderSequence(seq);
                    GeckoJS.Session.set('vivipos_fec_order_sequence', self.data.seq);
                });
            }
            
            GeckoJS.Session.set('vivipos_fec_number_of_customers', this.no_of_customers);

            var user = new GeckoJS.AclComponent().getUserPrincipal();

            if ( user != null ) {
                this.data.service_clerk = user.username;
                this.data.service_clerk_displayname = user.description;
            }

            this.data.created = Math.round(new Date().getTime() / 1000 );

            if (Transaction.Tax == null) Transaction.Tax = new TaxComponent();

            if (Transaction.Number == null) Transaction.Number = GeckoJS.NumberHelper;

            // update rounding / precision data
            this.data.rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            this.data.rounding_taxes = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
            this.data.precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            this.data.precision_taxes = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionTaxes') || 0;
            this.data.decimals = GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.';
            this.data.thousands = GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',';

            this.data.autorevalue = GeckoJS.Configure.read('vivipos.fec.settings.AutoRevaluePrices') || false;
            this.data.revalueprices = GeckoJS.Configure.read('vivipos.fec.settings.RevaluePrices');

            this.recoveryMode = recoveryMode;

            // use CartController's Product Model. is a good way ?
            // XXXX
            var cartController = GeckoJS.Controller.getInstanceByName('Cart');
            if (cartController) {
                this.Product = cartController.Product;
            }else {
                this.Product = new ProductModel();
            }
            
            Transaction.events.dispatch('onCreate', this, this);
        },

        emptyView: function() {
            this.view.empty();
        },

        process: function(status, discard) {
            var self = this;

            // backup origin status if saveOrder error.
            var orgStatus = this.data.status;

            this.data.status = status;

            // force and waiting to get sequence
            if (self.data.seq.length == 0) {

                var timeoutGuardSec = self.syncSettings.timeout * 1000;
                //var timeoutGuardSec = 15000;
                var timeoutGuardNow = Date.now().getTime();

                // block ui until request finish or timeout
                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                while (self.data.seq.length == 0 && thread.hasPendingEvents()) {

                    if (Date.now().getTime() > (timeoutGuardNow+timeoutGuardSec)) break;
                    
                    thread.processNextEvent(true);
                }
                // dump('length = '+self.data.seq.length+' \n');
            }
            
            if (self.data.seq.length == 0) {
                // maybe from recovery
                self.data.seq = self.buildOrderSequence(SequenceModel.getSequence('order_no', false));
            }

            if (self.data.seq == '-1') {
                // can't get sequence
                this.data.status = orgStatus;
                return -3;
            }

            // set sale period and shift number
            var salePeriod = GeckoJS.Session.get('sale_period');
            var shiftNumber = GeckoJS.Session.get('shift_number');

            this.data.sale_period = salePeriod;
            this.data.shift_number = shiftNumber;

            // set branch and terminal info
            var terminalNo = GeckoJS.Session.get('terminal_no') || '';
            this.data.terminal_no = terminalNo;

            var store = GeckoJS.Session.get('storeContact');

            if (store) {
                this.data.branch = store.branch;
                this.data.branch_id = store.branch_id;
            }

            this.data.lastModifiedTime = this.data.modified;
            this.data.modified = Math.round(new Date().getTime() / 1000 );
                       
            // remove recovery file
            Transaction.removeRecoveryFile();

            if (!discard) {

                this.lockItems();
                
                // order save in main thread
                var order = new OrderModel();
                if (this.data.status == 1 && this.data.no_of_customers == '') {
                    this.data.no_of_customers = '1';
                }

                return order.saveOrder(this.data) ? 1 : -1;

            }
        },

        cancel: function() {

            // set status = -1
            var r = this.process(-1);

            //this.emptyView();

            return r;
        },

        isCancel: function() {
            return (this.data.status  == -1);
        },

        submit: function(status) {

            if (typeof(status) == 'undefined') status = 1;

            return this.process(status);

        },

        close: function() {
            this.data.closed = true;
        },

        isSubmit: function() {
            // return (this.data.status == 1);
            return (this.data.status > 0);
        },

        isStored: function() {
            return (this.data.recall == 2);
        },

        isClosed: function() {
            return this.data.closed;
        },


        updateCartView: function(prevRowCount, currentRowCount, cursorIndex) {

            this.view.data = this.data.display_sequences;
            this.view.rowCountChanged(prevRowCount, currentRowCount, cursorIndex);

            //GeckoJS.Session.set('vivipos_fec_number_of_items', this.getItemsCount());
            GeckoJS.Session.set('vivipos_fec_number_of_items', this.data.qty_subtotal);
            GeckoJS.Session.set('vivipos_fec_tax_total', this.formatTax(this.getRoundedTax(this.data.tax_subtotal)));
        },

        createItemDataObj: function(index, item, sellQty, sellPrice, parent_index) {

            var roundedPrice = sellPrice || 0;
            var priceModifier = item.manual_adjustment_only ? 1 : this.data.price_modifier;
            var roundedSubtotal = this.getRoundedPrice(sellQty*sellPrice*priceModifier) || 0;

            // retrieve category name from Session
            var categoriesByNo = GeckoJS.Session.get('categoriesByNo');
            if (categoriesByNo && categoriesByNo[item.cate_no]) {
                item.cate_name = categoriesByNo[item.cate_no].name;
            }
            // name,current_qty,current_price,current_subtotal
            var item2 = {
                type: 'item', // item or category
                id: item.id,
                no: item.no,
                barcode: item.barcode,
                name: item.name,
                alt_name1: item.alt_name1,
                alt_name2: item.alt_name2,
                cate_no: item.cate_no,
                cate_name: item.cate_name,

                index: index,
                sale_unit: item.sale_unit,
                scale_multiplier: item.scale_multiplier,
                scale_precision: item.scale_precision,
                stock_status: item.stock_status,
                age_verification: item.age_verification,
                parent_index: parent_index,
                link_group: item.link_group,

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
                hasMarker: false,

                stock_maintained: false,
                destination: GeckoJS.Session.get('vivipos_fec_order_destination'),
                
                price_modifier: priceModifier
            };
            return item2;
        },

        createDisplaySeq: function(index, item, type, level) {

            type = type || 'item';

            // _('Trans');
            var itemDisplay = {} ;
            var dispName;
            if (type == 'item') {
                itemDisplay = GREUtils.extend(itemDisplay, {
                    id: item.id,
                    no: item.no,
                    name: item.name,
                    destination: this.data.destination_prefix,
                    current_qty: item.current_qty,
                    current_price: item.current_price,
                    //current_subtotal: item.current_subtotal + item.current_condiment,
                    current_subtotal: item.current_subtotal,
                    current_tax: item.tax_name,
                    type: type,
                    index: index,
                    sale_unit: item.sale_unit || 'unit',
                    stock_status: item.stock_status,
                    age_verification: item.age_verification,
                    level: (level == null) ? 0 : level,
                    price_modifier: item.price_modifier

                });
            }else if (type == 'setitem') {
                itemDisplay = GREUtils.extend(itemDisplay, {
                    id: item.id,
                    no: item.no,
                    name: item.name,
                    current_qty: item.current_qty,
                    current_price: (item.current_price) == 0 ? '' : item.current_price,
                    //current_subtotal: item.current_subtotal + item.current_condiment,
                    current_subtotal: '',
                    current_tax: '',
                    type: type,
                    index: index,
                    stock_status: item.stock_status,
                    age_verification: item.age_verification,
                    level: (level == null) ? 1 : level,
                    price_modifier: item.price_modifier

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
                var dispName;
                var current_price = '';
                var current_qty = '';

                switch (item.name.toUpperCase()) {

                    case 'CREDITCARD':
                        dispName = _(item.memo1);
                        break;

                    case 'COUPON':
                        dispName = _(item.memo1);
                        break;

                    case 'GIFTCARD':
                        dispName = _(item.memo1);
                        break;

                    case 'CASH':
                        if (item.memo1 != null && item.origin_amount != null) {
                            dispName = _(item.memo1);
                            current_qty = item.origin_amount + 'X';
                            current_price = item.memo2;
                        }
                        else
                            dispName = _(item.name.toUpperCase());
                        break;

                    default:
                        dispName = _(item.name.toUpperCase());
                        break;

                }

                itemDisplay = GREUtils.extend(itemDisplay, {
                    id: '',
                    name: dispName,
                    current_qty: current_qty,
                    current_price: current_price,
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
                    itemDisplay.current_qty = this.formatTax(itemDisplay.current_qty);
                }
                else if (type == 'item' || type == 'setitem') {
                    if (item.sale_unit == 'unit') {
                        itemDisplay.current_qty += 'X';
                    }
                    else {
                        itemDisplay.current_qty += ' ' + item.sale_unit;
                    }
                }
            }
            return itemDisplay;
        },

        removeDisplaySeq: function(index, count) {

            count = count || 1;
            this.data.display_sequences.splice(index, count);
        },


        updateLastSellItem: function(item) {

            // save lastSellItem
            var lastSellItem = {
                id: item.id,
                sellPrice: item.current_price /*,
            sellQty: item.current_qty*/
            };

            GeckoJS.Session.set('cart_last_sell_item', lastSellItem);
        },

        checkSellPrice: function(item) {
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
        },

        appendItem: function(item){

            //var profileStart = (new Date()).getTime();

            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
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

            //this.log('DEBUG', 'dispatchEvent beforeAppendItem ' + this.dump(obj) );
            Transaction.events.dispatch('beforeAppendItem', obj, this);

            var itemIndex = GeckoJS.String.uuid();

            // create data object to push in items array
            var itemAdded = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);

            // push to items array
            this.data.items[itemIndex] = itemAdded;
            this.data.items_count++;
            var itemDisplay = this.createDisplaySeq(itemIndex, itemAdded, 'item');

            this.data.display_sequences.push(itemDisplay);

            // if product set, append individual items into transaction
            // create data object to push in items array
            var setitems = [];
            if (item.SetItem != null && item.SetItem.length > 0) {
                // invoke Product controller to get
                setitems = item.SetItem;
            }

            var self = this;
            setitems.forEach(function(setitem) {
                var setItemProductId = barcodesIndexes[setitem.preset_no];
                var setItemProduct = self.Product.getProductById(setItemProductId);

                //alert(setItemProductId + ':' + self.dump(setItemProduct));

                if (setItemProduct) {
                    var setItemQty = setitem.quantity * sellQty;
                    var setItemPrice = setitem.price;
                    var setItemIndex = GeckoJS.String.uuid();
                    var setItemAdded = self.createItemDataObj(setItemIndex, setItemProduct, setItemQty, setItemPrice, itemIndex);

                    self.data.items[setItemIndex] = setItemAdded;

                    var setItemDisplay = self.createDisplaySeq(setItemIndex, setItemAdded, 'setitem');

                    self.data.display_sequences.push(setItemDisplay);
                }
            });

            //this.log('DEBUG', 'dispatchEvent afterAppendItem ' + this.dump(itemAdded));
            Transaction.events.dispatch('afterAppendItem', itemAdded, this);

            var currentRowCount = this.data.display_sequences.length;

            this.calcItemSubtotal(itemAdded);

            this.calcPromotions();

            // only calc current item tax
            this.calcItemsTax(itemAdded);

            this.calcTotal();

            this.updateCartView(prevRowCount, currentRowCount, currentRowCount - 1);

            this.updateLastSellItem(itemAdded);

            //var profileEnd = (new Date()).getTime();
            //this.log('appendItem End ' + (profileEnd - profileStart));

            return itemAdded;
        },

        tagItemAt: function(index, tag){

            var prevRowCount = this.data.display_sequences.length;

            var itemTrans = this.getItemAt(index); // item in transaction
            var itemDisplay = this.getDisplaySeqAt(index); // item in transaction

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                return null; // TODO - shouldn't be here since cart has intercepted illegal operations
            }

            var currentTags = itemTrans.tags;
            if (currentTags == null || currentTags.length == 0) {
                currentTags = [tag];
            }
            else {
                var deleted = false;
                for (var i = 0; i < currentTags.length; i++) {
                    if (currentTags[i] == tag) {
                        currentTags.splice(i, 1);
                        deleted = true;
                        break;
                    }
                }
                if (!deleted) {
                    currentTags.push(tag);
                }
            }

            itemTrans.tags = currentTags;
            if (currentTags == null || currentTags.length == 0) {
                itemDisplay.tagged = false;
            }
            else {
                itemDisplay.tagged = true;
            }

            this.updateCartView(prevRowCount, prevRowCount, index);

            return itemTrans;
        },


        modifyItemAt: function(index, newSetItems){

            var prevRowCount = this.data.display_sequences.length;

            var itemTrans = this.getItemAt(index); // item in transaction
            var itemDisplay = this.getDisplaySeqAt(index); // item in transaction
            var itemIndex = itemDisplay.index;
            var itemModified = itemTrans;

            if (itemDisplay.type != 'item' && itemDisplay.type != 'condiment') {
                return null; // TODO - shouldn't be here since cart has intercepted illegal operations
            }

            var item = null;

            if(this.Product.isExists(itemTrans.id)) {
                item = GREUtils.extend({}, this.Product.getProductById(itemTrans.id));
            }else {
                item = GREUtils.extend({},itemTrans);
            }

            var sellQty = itemTrans.current_qty;
            var oldSellQty = itemTrans.current_qty;
            var sellPrice = itemTrans.current_price;
            var condimentPrice = 0;
            var setItems = [];
            var setItemEventData;

            if (newSetItems) {
                setItems = this.getSetItemsByIndex(itemTrans.index);
                setItemEventData = {
                    item: item,
                    oldSetItems: setItems,
                    newSetItems: newSetItems
                };
                Transaction.events.dispatch('beforeModifySetItems', setItemEventData, this);
            }
            else {
                // modify Qty & Price...if item is being modified
                if (itemDisplay.type == 'item') {
                    sellQty  = (GeckoJS.Session.get('cart_set_qty_value') != null) ? GeckoJS.Session.get('cart_set_qty_value') : sellQty;
                    if (sellQty == null) sellQty = 1;

                    if (itemTrans.current_qty < 0 && sellQty > 0) sellQty = 0 - sellQty;

                    sellPrice = (GeckoJS.Session.get('cart_set_price_value') != null)
                        ? GeckoJS.Session.get('cart_set_price_value')
                        : (GeckoJS.Session.get('cart_set_qty_value') != null) ? sellPrice : null;

                    sellPrice = this.calcSellPrice(sellPrice, sellQty, item);
                }
                else if (itemDisplay.type == 'condiment') {
                    condimentPrice = (GeckoJS.Session.get('cart_set_price_value') != null) ? GeckoJS.Session.get('cart_set_price_value') : itemDisplay.current_price;
                    var condimentItem = {
                        id: itemTrans.id,
                        name: itemDisplay.name,
                        current_subtotal: condimentPrice == 0 ? '' : condimentPrice
                    };
                    if ('open' in itemDisplay) {
                        condimentItem.open = itemDisplay.open;
                    }
                }
                var obj = {
                    sellPrice: sellPrice,
                    sellQty: sellQty,
                    item: item
                };

                //this.log('DEBUG', 'dispatchEvent beforeModifyItem ' + this.dump(obj) );
                Transaction.events.dispatch('beforeModifyItem', obj, this);
            }

            // case 1: modifying top level item
            if (itemDisplay.type == 'item') {

                if (newSetItems) {
                    // replace existing set items

                    var display_sequences = this.data.display_sequences;

                    for (var i = 0; i < setItems.length; i++) {
                        var oldSetItem = setItems[i];
                        var newSetItem = newSetItems[i];

                        // set item changed?
                        if (oldSetItem.no != newSetItem.preset_no) {

                            // save quantity
                            var oldQty = oldSetItem.current_qty;

                            // remove all modifiers associated with old set item
                            var removeCount = 1;
                            var setItemDispIndex = this.getDisplayIndexByIndex(oldSetItem.index);

                            // look down display sequence to find location of next item that is
                            // not a discount, surcharge, or memo

                            for (var j = setItemDispIndex + 1; j < display_sequences.length; j++) {
                                var checkItem = display_sequences[j];
                                if (checkItem.type =='memo' ||
                                    checkItem.type == 'condiment')
                                    removeCount++;
                                else
                                    break;
                            }
                            // remove display items
                            this.removeDisplaySeq(setItemDispIndex, removeCount);

                            // remove old set item from items array
                            delete(this.data.items[oldSetItem.index]);

                            // insert new set item
                            var setItemQty = oldQty;
                            var setItemPrice = newSetItem.price;
                            var setItemIndex = GeckoJS.String.uuid();
                            var setItemAdded = this.createItemDataObj(setItemIndex, newSetItem.item, setItemQty, setItemPrice, itemIndex);

                            this.data.items[setItemIndex] = setItemAdded;

                            var setItemDisplay = this.createDisplaySeq(setItemIndex, setItemAdded, 'setitem');

                            this.data.display_sequences.splice(setItemDispIndex, 0, setItemDisplay);

                            // leave cursor on last replaced set item
                            index = setItemDispIndex;
                        }
                    }
                    Transaction.events.dispatch('afterModifySetItems', setItemEventData, this);
                }
                else {
                    // create data object to push in items array
                    itemModified = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);
                    itemTrans.current_qty = itemModified.current_qty;
                    itemTrans.current_price = itemModified.current_price;
                    itemTrans.current_subtotal = itemModified.current_subtotal;
                    itemTrans.price_modifier = itemModified.price_modifier;
                    itemTrans.destination = itemModified.destination;
                    itemModified = itemTrans;

                    // update to items array
                    this.data.items[itemIndex]  = itemModified;

                    //this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
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

                        // inherit open state
                        if ('open' in condimentItem) {
                            condimentItemDisplay2.open = condimentItem.open;
                        }
                        
                        // update condiment display
                        this.data.display_sequences[index] = condimentItemDisplay2 ;

                        // update item condiment subtotal
                        //var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item the condiment is attached to
                        //targetDisplayItem.current_subtotal = itemDisplay2.current_subtotal;
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

                        // inherit open state
                        if ('open' in condimentItem) {
                            condimentItemDisplay2.open = condimentItem.open;
                        }

                        // update condiment display
                        this.data.display_sequences[index] = condimentItemDisplay2 ;

                        // update item condiment subtotal
                        //var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item the condiment is attached to
                        //targetDisplayItem.current_subtotal = itemDisplay2.current_subtotal;
                    }
                }
            }
            var currentRowCount = this.data.display_sequences.length;

            this.calcItemSubtotal(itemModified);

            this.calcPromotions();
            
            this.calcItemsTax(itemModified);

            this.calcTotal();

            this.updateCartView(prevRowCount, currentRowCount, index);

            this.updateLastSellItem(itemModified);

            return itemModified;
        },

        voidItemAt: function(index){

            // var startProfile = (new Date()).getTime();

            var prevRowCount = this.data.display_sequences.length;

            var itemTrans = this.getItemAt(index); // item in transaction
            var itemDisplay = this.getDisplaySeqAt(index); // item in display
            var itemIndex = itemDisplay.index;

            if (itemDisplay.type == 'item' && !itemTrans.hasMarker) {

                var item = null;
                if(this.Product.isExists(itemTrans.id)) {
                    item = GREUtils.extend({}, this.Product.getProductById(itemTrans.id));
                }else {
                    item = GREUtils.extend({},itemTrans);
                }

                //this.log('DEBUG', 'dispatchEvent beforeVoidItem ' + this.dump(item) );
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
                // not a discount, surcharge, memo, setitem, or condiment

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

                //this.log('DEBUG', 'dispatchEvent afterVoidItem ' + this.dump(itemRemoved) );
                Transaction.events.dispatch('afterVoidItem', itemRemoved, this);

                // remove
                this.removeDisplaySeq(index, removeCount);

                // recalc all
                this.calcPromotions();

                this.calcItemsTax(itemRemoved, true);
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

                    var targetItem = this.getItemAt(index, true);
                    var firstCondimentIndex = this.getFirstCondimentIndex(targetItem);
                    var firstCondimentDisplay = this.getDisplaySeqAt(firstCondimentIndex);

                    if (firstCondimentDisplay && !firstCondimentDisplay.open) {
                        targetItem.condiments = {};
                    }
                    else {
                        delete targetItem.condiments[itemDisplay.name];

                        if (firstCondimentDisplay && itemDisplay.name == firstCondimentDisplay.name) {
                            var secondCondimentIndex = this.getFirstCondimentIndex(targetItem, firstCondimentIndex + 1);
                            var secondCondimentDisplay = this.getDisplaySeqAt(secondCondimentIndex);

                            if (secondCondimentDisplay) secondCondimentDisplay.open = true;
                        }
                    }

                    // condiment may be linked to a set item
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
                            this.data.trans_discounts[displayItem.index].hasMarker = false;
                        }
                        else if (displayItem.type == 'trans_surcharge') {
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
                this.calcPromotions();

                this.calcItemsTax(itemTrans);
                
                //this.calcTotal();

            }

            var currentRowCount = this.data.display_sequences.length;

            //this.log('VoidItem6' +( (new Date()).getTime() - startProfile));
            this.calcTotal();

            //this.log('VoidItem7' +( (new Date()).getTime() - startProfile));
            this.updateCartView(prevRowCount, currentRowCount, index);
            //this.log('VoidItem' +( (new Date()).getTime() - startProfile));
            return itemRemoved;
        },

        calcItemSubtotal: function(item) {

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
                setmenu_subtotal += setitem.current_qty * setitem.current_price;
            });
            
            item.current_subtotal = this.getRoundedPrice((subtotal + setmenu_subtotal + condiment_subtotal) * item.price_modifier);
            itemDisplay.current_subtotal = this.formatPrice(item.current_subtotal);

            Transaction.events.dispatch('onCalcItemSubtotal', item, this);
        },

        _computeLimit: function(amount, rate, type) {
            if (type == '$') {
                return rate;
            }
            else if (type == '%') {
               return amount * rate / 100;
            }
            else
                return amount;
        },

        appendDiscount: function(index, discount){

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

                // rounding discount
                item.current_discount = this.getRoundedPrice(item.current_discount);

                // check if discount amount exceeds user item discount limit
                var user = GeckoJS.Session.get('user');
                var item_discount_limit = parseInt(user.item_discount_limit);
                if (item.current_subtotal > 0 && !isNaN(item_discount_limit) && item_discount_limit > 0) {
                    var item_discount_limit_amount = this._computeLimit(item.current_subtotal, item_discount_limit, user.item_discount_limit_type);
                    if (discount_amount > item_discount_limit_amount) {
                        NotifyUtils.warn(_('Discount amount [%S] may not exceed user item discount limit [%S]',
                                           [discount_amount, item_discount_limit_amount]));
                        return;
                    }
                }
            
                if (discount_amount > item.current_subtotal && item.current_subtotal > 0) {
                    // discount too much
                    NotifyUtils.warn(_('Discount amount [%S] may not exceed item amount [%S]',
                        [this.formatPrice(this.getRoundedPrice(discount_amount)),
                        item.current_subtotal]));
                    return;
                }
                item.current_discount = 0 - discount_amount;
                item.discount_name =  discount.name;
                item.discount_rate =  discount.amount;
                item.discount_type =  discount.type;
                item.hasDiscount = true;

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
                        NotifyUtils.warn(_('ATTENTION: return item(s) are present'));
                    }
                }

                var remainder = this.getRemainTotal();
                if (discountItem.discount_type == '$') {
                    discountItem.current_discount = discount.amount;
                }
                else {
                    // percentage order surcharge is pretax?
                    if (discount.pretax == null) discount.pretax = false;

                    if (discount.pretax) {
                        discountItem.current_discount = parseFloat(itemDisplay.current_price) * discountItem.discount_rate;
                    }
                    else {
                        discountItem.discount_name += '*';
                        discountItem.current_discount = remainder * discountItem.discount_rate;
                    }
                }
                if (discountItem.current_discount > remainder && remainder > 0) {
                    // discount too much
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
        },

        appendSurcharge: function(index, surcharge){

            var item = this.getItemAt(index);
            var itemDisplay = this.getDisplaySeqAt(index); // last seq
            var itemIndex = itemDisplay.index;
            var lastItemDispIndex;
            var surcharge_amount;
            var resultItem;

            var prevRowCount = this.data.display_sequences.length;

            var displayIndex = lastItemDispIndex;

            if (item && item.type == 'item') {

                if (surcharge.type == '$') {
                    surcharge_amount = surcharge.amount;
                }else {
                    surcharge_amount = item.current_subtotal * surcharge.amount;
                }

                // rounding surcharge
                surcharge_amount = this.getRoundedPrice(surcharge_amount);

                // check if discount amount exceeds user limit
                var user = GeckoJS.Session.get('user');
                var surcharge_limit = parseInt(user.item_surcharge_limit);
                if (item.current_subtotal > 0 && !isNaN(surcharge_limit) && surcharge_limit > 0) {
                    var surcharge_limit_amount = this._computeLimit(item.current_subtotal, surcharge_limit, user.item_surcharge_limit_type);
                    if (surcharge_amount > surcharge_limit_amount) {
                        NotifyUtils.warn(_('Surcharge amount [%S] may not exceed user item surcharge limit [%S]',
                                           [surcharge_amount, surcharge_limit_amount]));
                        return;
                    }
                }

                item.surcharge_name = surcharge.name;
                item.surcharge_rate = surcharge.amount;
                item.surcharge_type = surcharge.type;
                item.current_surcharge = surcharge_amount;
                item.hasSurcharge = true;

                // create data object to push in items array
                var newItemDisplay = this.createDisplaySeq(item.index, item, 'surcharge');

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(item.index)

                this.data.display_sequences.splice(++lastItemDispIndex,0,newItemDisplay);

                this.calcPromotions();

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
                        NotifyUtils.warn(_('ATTENTION: return item(s) are present'));
                    }
                }

                if (surchargeItem.surcharge_type == '$') {
                    surchargeItem.current_surcharge = this.getRoundedPrice(surcharge.amount);
                }else {
                    // percentage order surcharge is pretax?
                    if (surcharge.pretax == null) surcharge.pretax = false;
                    if (surcharge.pretax) {
                        surchargeItem.current_surcharge = this.getRoundedPrice(parseFloat(itemDisplay.current_price) * surchargeItem.surcharge_rate);
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

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex)

                this.data.display_sequences.splice(++lastItemDispIndex,0,newItemDisplay);

                this.calcPromotions();
                //this.calcItemsTax();

                resultItem = surchargeItem;
            }

            var currentRowCount = this.data.display_sequences.length;

            this.calcTotal();

            this.updateCartView(prevRowCount, currentRowCount, lastItemDispIndex);

            return resultItem;
        },


        shiftTax: function(index, taxIndex){

            var prevRowCount = this.data.display_sequences.length;

            var itemTrans = this.getItemAt(index); // item in transaction
            var itemDisplay = this.getDisplaySeqAt(index); // display item at cursor position
            var itemIndex = itemDisplay.index;
            var targetDisplayIndex = this.getDisplayIndexByIndex(itemIndex);   // display index of the item being shifted

            if (itemTrans == null || itemTrans.type != 'item') {
                return ; // this should not happen as cart has already checked for this possibility
            }

            //this.log('DEBUG', 'dispatchEvent beforeShiftTax ' + this.dump(itemTrans) );
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

            // this.log('DEBUG', 'dispatchEvent afterShiftTax ' + this.dump(itemModified) );
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
        },


        appendMarker: function(index, type){

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
        },

        appendCondiment: function(index, condiments, replace, replaceInPlace){

            var item = this.getItemAt(index, true);                           // item to add condiment to
            var targetItem = this.getItemAt(index);
            var itemDisplay = this.getDisplaySeqAt(index);              // display item at cursor position
            var itemIndex = itemDisplay.index;                          // itemIndex of item to add condiment to
            var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);   // display index of the item to add condiment to

            var prevRowCount = this.getDisplaySeqCount();
            var displayIndex = replace ? this.getDisplayIndexByIndex(itemIndex) : index;

            if (item.type == 'item') {
                
                if (condiments.length >0) {

                    if (replace && item.condiments != null && item.condiments != {}) {

                        // void all condiment items up to next item whose index is different from itemIndex
                        for (var i = displayIndex + 1; i < this.getDisplaySeqCount();) {
                            var displayItem = this.getDisplaySeqAt(i);
                            if (displayItem.index != itemIndex)
                                break;
                            if (displayItem.type == 'condiment') {
                                this.voidItemAt(i);
                            }
                            else {
                                i++;
                                displayIndex++;
                            }
                        }
                        prevRowCount = this.getDisplaySeqCount();

                        if (replace && replaceInPlace) displayIndex = index - 1;
                    }
                    condiments.forEach(function(condiment){
                        // this extra check is a workaround for the bug in XULRunner where an item may appear to be selected
                        // but is actually not
                        if (condiment) {
                            var condimentItem = {
                                id: item.id,
                                name: condiment.name,
                                price: condiment.price,
                                current_subtotal: condiment.price == 0 ? '' : condiment.price
                            };

                            if(item.condiments == null) item.condiments = {};

                            // check for duplicate condiment;
                            if (condiment.name in item.condiments) {
                                NotifyUtils.warn(_('Condiment [%S] already added to [%S]', [condiment.name, item.name]));
                            }
                            else {
                                //var newCondiment = GeckoJS.BaseObject.extend({}, condiment);
                                item.condiments[condiment.name] = condimentItem;

                                // update condiment display
                                var level = targetDisplayItem.type == 'setitem' ? 2 : null;
                                var condimentDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment', level);
                                this.data.display_sequences.splice(++displayIndex,0,condimentDisplay);
                            }
                        }
                    }, this);

                    if (replaceInPlace) displayIndex = index;
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

                this.calcPromotions();
                
                this.calcItemsTax(targetItem);
                this.calcTotal();
            }
            else {
                NotifyUtils.warn(_("Condiment may only be added to an item"));
            }

            var currentRowCount = this.data.display_sequences.length;

            this.updateCartView(prevRowCount, currentRowCount, displayIndex);

            return item;
        },

        expandCondiments: function(index) {
            var item = this.getItemAt(index, true);
            var itemDisplay = this.getDisplaySeqAt(index);

            if (item && itemDisplay && !itemDisplay.open) {

                // convert condiments into a form suitable for this.appendCondiment
                var condimentArray = [];

                for (var c in item.condiments) {
                    var condimentItem = {};
                    condimentItem.name = c;
                    condimentItem.price = item.condiments[c].price;

                    condimentArray.push(condimentItem);
                }

                // restore collapsedCondiments
                item.condiments = item.collapsedCondiments;
                this.appendCondiment(index, condimentArray, true, true);

                // update open state of first condiment item
                var firstCondiment = this.getDisplaySeqAt(index);
                if (firstCondiment) {
                    firstCondiment.open = true;
                }
            }
        },

        collapseCondiments: function(index) {
            var item = this.getItemAt(index, true);
            var itemDisplay = this.getDisplaySeqAt(index);

            if (item && item.condiments && itemDisplay && itemDisplay.open) {
                var condiments = GREUtils.extend({}, item.condiments);

                // construct new condiment display
                var condimentNames = '';
                var condimentSubtotal = 0;
                var condimentList = GeckoJS.BaseObject.getKeys(condiments);

                condimentList.forEach(function(c) {
                    condimentNames += (condimentNames == '') ? c : (',' + c);
                    condimentSubtotal += parseFloat(condiments[c].price) || 0;
                });

                var condimentItem = {
                    id: item.id,
                    name: condimentNames,
                    price: condimentSubtotal
                };
                this.appendCondiment(index, [condimentItem], true, true);

                // save collapsed condiment
                item.collapsedCondiments = item.condiments;

                // restore condiments
                item.condiments = condiments;

                // update open state of collapsed condiment item
                var collapsedCondiments = this.getDisplaySeqAt(index);
                if (collapsedCondiments) {
                    collapsedCondiments.open = false;
                }
            }
        },

        getFirstCondimentIndex: function(itemTrans, startIndex) {
            var dispIndex = this.getDisplayIndexByIndex(itemTrans.index);
            startIndex = parseInt(startIndex) || 0;

            if (dispIndex > -1) {
                for (var i = Math.max(dispIndex + 1, startIndex); i < this.getDisplaySeqCount(); i++) {
                    var displayItem = this.getDisplaySeqAt(i);
                    if (displayItem.type == 'condiment' && displayItem.index == itemTrans.index) {
                        return i;
                    }
                }
            }
            return -1;
        },

        appendMemo: function(index, memo){

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
        },


        appendPayment: function(type, amount, origin_amount, memo1, memo2){

            var prevRowCount = this.data.display_sequences.length;

            var paymentId =  GeckoJS.String.uuid();
            var paymentItem = {
                id: paymentId,
                name: type,
                amount: this.getRoundedPrice(amount),
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
        },

        getItemAt: function(index, nofollow){

            if (index < 0 || index >= this.data.display_sequences.length) return null;

            if (nofollow == null) nofollow = false;

            var itemDisplay = this.getDisplaySeqAt(index);
            var item = null;
            var itemIndex = itemDisplay.index;

            switch(itemDisplay.type) {
                case 'item':
                    item = this.data.items[itemIndex];
                    break;
                case 'setitem':
                    if (nofollow)
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
                    if (!nofollow && item != null && item.parent_index != null) {
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
        },

        lockItems: function(index) {
            var displayItems = this.data.display_sequences;
            var transItems = this.data.items;
            var paymentItems = this.data.trans_payments;
            var batch = ++this.data.batchCount;

            var batchItemCount = 0;
            var batchPaymentCount = 0;

            if (index == null) index = displayItems.length - 1;

            if (index > -1)
                displayItems[index].batchMarker = batch;

            // lock all display items up-to and including the item at position given by index
            for (var i = 0; i <= index; i++) {
                var dispItem = displayItems[i];
                if (!('batch' in dispItem)) {
                    dispItem['batch'] = batch;

                    // lock corresponding transaction item
                    if (dispItem.index != null) {
                        switch(dispItem.type) {
                            case 'item':
                            case 'setitem':
                                if (transItems[dispItem.index] != null) {
                                    transItems[dispItem.index].batch = batch;
                                    batchItemCount++;
                                }
                                break;

                            case 'payment':
                                if (paymentItems[dispItem.index] != null) {
                                    paymentItems[dispItem.index].batch = batch;
                                    batchPaymentCount++;
                                }
                                break;
                        }
                    }
                }
            }

            // set order lock index
            this.data.batchItemCount = batchItemCount;
            this.data.batchPaymentCount = batchPaymentCount;
        },

        isLocked: function(index) {
            var dispItem = this.getDisplaySeqAt(index);
            if (!dispItem) {
                return false;
            }
            else if ('batch' in dispItem) {
                return true;
            }
            else if (dispItem.type == 'condiment') {
                var item = this.getItemAt(index);
                return (item && 'batch' in item);
            }
            else {
                return false;
            }
        },

        isModified: function() {
            for (var i = this.getDisplaySeqCount() - 1; i >= 0; i--) {
                if (!this.isLocked(i)) return true;
            }
            return false;
        },

        hasItemsInBatch: function(batch) {
            if (batch == null) batch = this.data.batchCount;
            for (var index in this.data.items) {
                if (this.data.items[index].batch == batch) {
                    return true;
                }
            }
            return false;
        },

        hasPaymentsInBatch: function(batch) {
            if (batch == null) batch = this.data.batchCount;
            for (var index in this.data.trans_payments) {
                if (this.data.trans_payments[index].batch == batch) {
                    return true;
                }
            }
            return false;
        },

        getDisplaySeqCount: function(){
            return this.data.display_sequences.length;
        },

        getDisplayIndexByIndex: function(index) {
            for (var i =0 ; i < this.data.display_sequences.length; i++) {
                if (this.data.display_sequences[i].index == index) return i;
            }
            return -1;
        },

        getDisplaySeqAt: function(index){
            if (index < 0 || index >= this.data.display_sequences.length) return null;

            var itemDisplay = this.data.display_sequences[index];

            return itemDisplay;
        },

        getDisplaySeqByIndex: function(index){

            for (var i =0 ; i < this.data.display_sequences.length; i++) {
                var itemDisplay = this.data.display_sequences[i];
                if (itemDisplay.index == index) return itemDisplay;
            }
            return -1;
        },

        getLastDisplaySeqByIndex: function(index){

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
                    (itemDisplay.index != null && this.data.items[itemDisplay.index] != null && this.data.items[itemDisplay.index].parent_index == index)) {
                    lastIndex = i;
                }

            }
            return lastIndex ;
        },


        getItemDisplaySeqAt: function(index){
            if (index < 0 || index >= this.data.display_sequences.length) return null;

            var itemDisplay = this.data.display_sequences[index];

            if(itemDisplay.type == 'item') return itemDisplay;

            if (itemDisplay.index) {
                return this.getDisplaySeqByIndex(itemDisplay.index);
            }

            return itemDisplay;
        },

        getSetItemsByIndex: function(parent_index) {
            var setItems = [];

            for (var i = 0; i < this.getDisplaySeqCount(); i++) {
                var itemDisplay = this.getDisplaySeqAt(i);

                if (itemDisplay.type == 'setitem') {
                    var item = this.data.items[itemDisplay.index];
                    if (item && item.parent_index == parent_index) {
                        setItems.push(item);
                    }
                }
            }
            return setItems;
        },

        calcCondimentPrice: function() {

        },

        calcSellPrice: function(sellPrice, sellQty, item) {

            // get price by price level first
            sellPrice = this.getSellPriceByPriceLevel(sellPrice, sellQty, item);

            //  callback for other rules

            var obj = {
                sellPrice: sellPrice,
                sellQty: sellQty,
                item: item
            };

            //this.log('DEBUG', 'dispatchEvent onCalcSellPrice ' + this.dump(obj) );
            Transaction.events.dispatch('onCalcSellPrice', obj, this);

            // return final sellPrice
            return obj.sellPrice;
        },

        getSellPriceByPriceLevel: function(sellPrice, sellQty, item, notify) {

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

                    //this.log('DEBUG', 'dispatchEvent onPriceLevelError ' + this.dump(obj) );
                    Transaction.events.dispatch('onPriceLevelError', obj, this);

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

                    //this.log('DEBUG', 'dispatchEvent onPriceLevelError ' + this.dump(obj2) );
                    Transaction.events.dispatch('onPriceLevelError', obj2, this);

                    if (notify) NotifyUtils.warn(_('Price adjusted from [%S] to current LALO [%S]', [this.formatPrice(sellPrice), this.formatPrice(obj2.newPrice)]));

                    sellPrice = obj2.newPrice;
                }
            }
            return sellPrice;
        },

        getPriceLevelPrice: function(priceLevel, item) {
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
        },

        getPriceLevelHalo: function(priceLevel, item) {

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
        },

        getPriceLevelLalo: function(priceLevel, item) {

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
        },


        getItems: function() {
            return this.data.items;
        },


        getItemsCount: function() {
            return this.data.items_count;
        },

        getPayments: function() {
            return this.data.trans_payments;
        },

        calcPromotions:  function() {
            // this.log('dispatchEvent onCalcPromotions ' + this.dump(this));
            Transaction.events.dispatch('onCalcPromotions', this, this);
        },

        calcItemsTax:  function(calcItem, isRemove) {

            isRemove = isRemove || false;
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
                if (item.parent_index == null && !isRemove) {
                    var tax = Transaction.Tax.getTax(item.tax_name);
                    if(tax) {
                        item.tax_rate = tax.rate;
                        item.tax_type = tax.type;

                        var toTaxCharge = item.current_subtotal + item.current_discount + item.current_surcharge;
                        var taxChargeObj = Transaction.Tax.calcTaxAmount(item.tax_name, Math.abs(toTaxCharge), item.current_price, item.current_qty);

                        // @todo total only or summary ?
                        item.current_tax =  taxChargeObj[item.tax_name].charge;
                        item.included_tax = taxChargeObj[item.tax_name].included;
                    }else {
                        item.current_tax = 0;
                        item.included_tax = 0;
                    }

                    // rounding tax
                    // @don't round tax here - irving 4/28/2009
                    item.current_tax = this.getRoundedTax(item.current_tax);
                    item.included_tax = this.getRoundedTax(item.included_tax);
                    if (toTaxCharge < 0) item.current_tax = 0 - item.current_tax;
                }
            }

            //this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + items);
            Transaction.events.dispatch('onCalcItemsTax', items, this);
        },


        calcTotal: function() {

            //var profileStart = (new Date()).getTime();

            this.log('DEBUG', "onCalcTotal " + this.dump(this.data));
            Transaction.events.dispatch('onCalcTotal', this.data, this);

            var total=0, remain=0, item_subtotal=0, tax_subtotal=0, included_tax_subtotal=0, item_surcharge_subtotal=0, item_discount_subtotal=0, qty_subtotal=0;
            var trans_surcharge_subtotal=0, trans_discount_subtotal=0, payment_subtotal=0;
            var promotion_subtotal=0, promotion_tax_subtotal=0, promotion_included_tax_subtotal=0;

            // item subtotal and grouping
            this.data.items_summary = {}; // reset summary
            for(var itemIndex in this.data.items ) {
                var item = this.data.items[itemIndex];

                // don't include set items in calculations
                if (!item.parent_index) {
                    tax_subtotal += parseFloat(item.current_tax);
                    included_tax_subtotal += parseFloat(item.included_tax);

                    item_surcharge_subtotal += parseFloat(item.current_surcharge);
                    item_discount_subtotal += parseFloat(item.current_discount);
                    item_subtotal += parseFloat(item.current_subtotal);

                    qty_subtotal += (item.sale_unit == 'unit') ? item.current_qty : 1;
                }

                // summary it
                var item_id = item.id;
                var sumItem = GREUtils.extend({}, (this.data.items_summary[item_id] || {
                    id: item_id,
                    name: item.name,
                    qty_subtotal: 0,
                    subtotal: 0,
                    discount_subtotal: 0,
                    surcharge_subtotal: 0
                }));

                // include set items in quantity summation
                sumItem.qty_subtotal += (item.sale_unit == 'unit') ? item.current_qty : 1;

                if (!item.parent_index) {
                    sumItem.subtotal += parseFloat(item.current_subtotal);
                    sumItem.discount_subtotal += parseFloat(item.current_discount);
                    sumItem.surcharge_subtotal += parseFloat(item.current_surcharge);
                }
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

            promotion_subtotal = this.data.promotion_subtotal ;
            promotion_tax_subtotal = isNaN(parseInt(this.data.promotion_tax_subtotal)) ? 0 : parseInt(this.data.promotion_tax_subtotal);
            promotion_included_tax_subtotal = isNaN(parseInt(this.data.promotion_included_tax_subtotal)) ? 0 : parseInt(this.data.promotion_included_tax_subtotal);

            tax_subtotal -= promotion_tax_subtotal;
            included_tax_subtotal -= promotion_included_tax_subtotal;

            alert(item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal + promotion_subtotal);
            total = this.getRoundedPrice(item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal + promotion_subtotal);
            remain = total - payment_subtotal;

            // revalue
            if(this.data.autorevalue && this.data.revalueprices != 0) {
                if(total>=0) {
                    this.data.revalue_subtotal = 0 - parseFloat(total % this.data.revalueprices);
                }else {
                    this.data.revalue_subtotal = parseFloat((0 - total) % this.data.revalueprices);
                    if (this.data.revalue_subtotal != 0)
                        this.data.revalue_subtotal -= this.data.revalueprices;
                }
                total = total + this.data.revalue_subtotal;
                remain = total - payment_subtotal;
            }

            this.data.total = this.getRoundedPrice(total);
            this.data.remain = this.getRoundedPrice(remain);
            this.data.qty_subtotal = qty_subtotal;
            this.data.tax_subtotal = this.getRoundedTax(tax_subtotal);
            this.data.item_subtotal = this.getRoundedPrice(item_subtotal);
            this.data.included_tax_subtotal = this.getRoundedTax(included_tax_subtotal);
            this.data.item_surcharge_subtotal = this.getRoundedPrice(item_surcharge_subtotal);
            this.data.item_discount_subtotal = this.getRoundedPrice(item_discount_subtotal);
            this.data.trans_surcharge_subtotal = this.getRoundedPrice(trans_surcharge_subtotal);
            this.data.trans_discount_subtotal = this.getRoundedPrice(trans_discount_subtotal);
            this.data.payment_subtotal = this.getRoundedPrice(payment_subtotal);
            this.data.discount_subtotal = this.data.item_discount_subtotal + this.data.trans_discount_subtotal ;
            this.data.surcharge_subtotal = this.data.item_surcharge_subtotal + this.data.trans_surcharge_subtotal;

            this.data.promotion_subtotal = promotion_subtotal ;
            this.data.promotion_tax_subtotal = promotion_tax_subtotal;
            this.data.promotion_included_tax_subtotal = promotion_included_tax_subtotal;
            Transaction.events.dispatch('afterCalcTotal', this.data, this);

            Transaction.serializeToRecoveryFile(this);
            //var profileEnd = (new Date()).getTime();
            //this.log('afterCalcTotal End ' + (profileEnd - profileStart));

            this.log('DEBUG', "afterCalcTotal " + this.dump(this.data));
        },


        getTotal: function(format) {
            format = format || false;

            if (format) return this.formatPrice(this.data.total);

            return this.data.total;
        },

        getRemainTotal: function(format) {
            format = format || false;

            if (format) return this.formatPrice(this.data.remain);

            return this.data.remain;
        },

        getPaymentSubtotal: function(format) {
            format = format || false;

            if (format) return this.formatPrice(this.data.payment_subtotal);

            return this.data.payment_subtotal;
        },


        getRoundedPrice: function(price) {
            var roundedPrice = Transaction.Number.round(Math.abs(price), this.data.precision_prices, this.data.rounding_prices) || 0;
            if (price < 0) roundedPrice = 0 - roundedPrice;
            return roundedPrice;
        },


        getRoundedTax: function(tax) {
            var roundedTax = Transaction.Number.round(Math.abs(tax), this.data.precision_taxes, this.data.rounding_taxes) || 0;
            if (tax < 0) roundedTax = 0 - roundedTax;
            return roundedTax;
        },

        formatPrice: function(price) {
            var options = {
                decimals: this.data.decimals,
                thousands: this.data.thousands,
                places: ((this.data.precision_prices>0)?this.data.precision_prices:0)
            };
            // format display precision
            return Transaction.Number.format(price, options);
        },

        formatUnitPrice: function(price) {
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
        },

        formatTax: function(tax) {
            var options = {
                decimals: this.data.decimals,
                thousands: this.data.thousands,
                places: ((this.data.precision_taxes>0)?this.data.precision_taxes:0)
            };
            // format display precision
            return Transaction.Number.format(tax, options);
        }
    };


    var Transaction = window.Transaction = GeckoJS.BaseObject.extend('Transaction', __model__);

    /*
     *  static properties
     */
    Transaction.events = new GeckoJS.Event();

    Transaction.Tax =  null;

    Transaction.Number =  null;

    Transaction.worker =  null;

    Transaction.isRecoveryFileExists = function() {

        var filename = "/var/tmp/cart_transaction.txt";

        return GeckoJS.File.exists(filename);
    };

    Transaction.removeRecoveryFile = function() {

        var filename = "/var/tmp/cart_transaction.txt";

        GeckoJS.File.remove(filename);
    };

    Transaction.unserializeFromRecoveryFile = function() {

        var filename = "/var/tmp/cart_transaction.txt";

        // unserialize from fail recovery file
        var file = new GeckoJS.File(filename);

        if (!file.exists()) return false;

        var data = null;
        file.open("r");
        data = GeckoJS.BaseObject.unserialize(file.read());
        file.close();
        file.remove();
        delete file;
        
        return data;
    };

    Transaction.serializeToRecoveryFile = function(transaction) {
		if ( GeckoJS.Session.get( "isTraining" ) )
			return;
			
        var filename = "/var/tmp/cart_transaction.txt";

        // save serialize to fail recovery file
        var file = new GeckoJS.File(filename);
        file.open("w");
        file.write(transaction.serialize());
        file.close();
        delete file;
    };
})();
