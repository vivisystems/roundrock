(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    // declare Transaction Base Object / data encapsulate
    var __model__ = {

        name: 'Transaction',

        init: function(recoveryMode, backgroundMode) {

            this.backgroundMode = backgroundMode || false;

            this.view = null,

            this.data = {

                id: '',

                seq: '',

                display_sequences: [],

                /*
                 * order_items,
                 * summary cant recalc from items
                 */
                items: {},
                items_count: 0,
                items_summary: {},

                /*
                 * order_additions
                 */
                trans_discounts: {},
                trans_surcharges: {},

                /*
                 * order_payments
                 */
                split_payments: false,
                trans_payments: {},

                /*
                 * marker only exists in memory
                 */
                markers: [],

                /*
                 * order_promotions
                 */
                promotion_apply_items: [],
                promotion_matched_items: [],
                promotion_subtotal: 0,
                promotion_tax_subtotal: 0,
                promotion_included_tax_subtotal: 0,

                /*
                 * calculate fields
                 */
                total: 0,
                remain: 0,
                revalue_subtotal: 0,
                qty_subtotal: 0,
                tax_subtotal: 0,
                included_tax_subtotal: 0,
                surcharge_subtotal: 0,
                trans_surcharge_subtotal: 0,
                item_surcharge_subtotal: 0,
                discount_subtotal: 0,
                trans_discount_subtotal: 0,
                item_discount_subtotal: 0,
                payment_subtotal: 0,

                price_modifier: 1,    // used to modify item subtotals

                rounding_prices: 'to-nearest-precision',
                precision_prices: 0,
                rounding_taxes: 'to-nearest-precision',
                precision_taxes: 0,

                status: 0, // transcation status 0 = process  1 = submit , -1 = cancelled

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
                table_name: '',
                table_region_name: '',
                check_no: '',

                no_of_customers: '',

                terminal_no: '',
                sale_period: '',
                shift_number: '',

                batchCount: 0,
                closed: false,

                recall: 0,

                created: '',
                modified: '',
                lastModifiedTime: '',

                inherited_order_id: '',
                inherited_desc: ''

            };

            this.create(recoveryMode);


        },

        setBackgroundMode: function(backgroundMode) {
            this.backgroundMode = backgroundMode || false;
        },


        /**
         * Transaction Serialization , only for recovery.
         */
        serialize: function() {
            return GeckoJS.BaseObject.serialize(this.data);
        },

        /**
         * Transaction unserialization , only for recovery.
         */
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
            var salePeriod = '';

            if (seq != -1) {
                var newSeq = (seq+'');
                if (newSeq.length < sequenceNumberLength) {
                    newSeq = GeckoJS.String.padLeft(newSeq, sequenceNumberLength, '0');
                }
                if (sequenceTrackSalePeriod) {
                    salePeriod = GeckoJS.Session.get('sale_period');
                    newSeq = ((salePeriod == -1 || salePeriod == 0) ? '' : (new Date(salePeriod * 1000).toString('yyyyMMdd'))) + newSeq;
                }
                return [salePeriod, newSeq];
            }
            else {
                return [salePeriod, seq];
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

                let requireCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo');
                var seqKey = 'order_no';
                if(requireCheckNo) seqKey +=',check_no';

                SequenceModel.getSequence(seqKey, true, function(seq) {
                    let arKeys = seqKey.split(',');
                    let arSeqs = String(seq).split(',');
                    let order_no = -1 ;
                    let check_no = -1 ;

                    if (arSeqs.length == 1) {
                        order_no = seq || -1 ;
                    }else {
                        order_no = parseInt(arSeqs[0]) || -1 ;
                        check_no = parseInt(arSeqs[1]) || -1 ;
                    }

                    let seqData = self.buildOrderSequence(order_no);
                    
                    self.data.seq_original = seq;
                    self.data.seq_sp = seqData[0];
                    self.data.seq = seqData[1];

                    if(!self.backgroundMode) GeckoJS.Session.set('vivipos_fec_order_sequence', self.data.seq);

                    // update checkno
                    if (check_no != -1 ) {
                        self.setCheckNo(check_no);
                    }
                });
            }

            if(!this.backgroundMode) {
                GeckoJS.Session.set('vivipos_fec_number_of_customers', this.no_of_customers || '');
            }

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
            this.data.revaluefactor = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.RevalueFactor'));

            if (isNaN(this.data.revaluefactor)) {
                this.data.revaluefactor = 0;
            }

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

            discard = discard || false;

            // backup origin status if saveOrder error.
            var orgStatus = this.data.status;

            this.data.status = status;

            // force and waiting to get sequence
            if (self.data.seq.length == 0) {

                var timeoutGuardSec = self.syncSettings.timeout * 1000;
                //var timeoutGuardSec = 15000;
                var timeoutGuardNow = (new Date()).getTime();

                // block ui until request finish or timeout
                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                while (self.data.seq.length == 0 && thread.hasPendingEvents()) {

                    if ((new Date()).getTime() > (timeoutGuardNow+timeoutGuardSec)) break;

                    thread.processNextEvent(true);
                }
            // dump('length = '+self.data.seq.length+' \n');
            }

            let requireCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo');
            var seqKey = 'order_no';
            if(requireCheckNo) seqKey +=',check_no';

            if (self.data.seq.length == 0 || self.data.seq == -1) {
                // maybe from recovery
                self.log('WARN', 're-requesting sequence number for order [' + self.data.id + ']');
                let seq = SequenceModel.getSequence(seqKey, false);
                let arSeqs = String(seq).split(',');
                let order_no = -1 ;
                let check_no = -1 ;

                if (arSeqs.length == 1) {
                    order_no = seq || -1 ;
                }else {
                    order_no = parseInt(arSeqs[0]) || -1 ;
                    check_no = parseInt(arSeqs[1]) || -1 ;
                }

                let seqData = self.buildOrderSequence(order_no);
                self.data.seq_original = order_no;
                self.data.seq_sp = seqData[0];
                self.data.seq = seqData[1];
                
                if(!self.backgroundMode) GeckoJS.Session.set('vivipos_fec_order_sequence', self.data.seq);

                // update checkno
                if (check_no != -1 ) {
                    self.setCheckNo(check_no);
                }
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

                // lockItems and update batch
                this.lockItems();

                // order save in main thread
                var order = new OrderModel();
                if (this.data.status == 1 && this.data.no_of_customers == '') {
                    this.data.no_of_customers = '1';
                }

                if (order.saveOrder(this.data)) {
                    return 1;
                }
                else {
                    this.data.status = orgStatus;
                    this.unlockItems();
                    return -1;
                }

            }
            else {
                return 1;
            }
        },

        /**
         * commit order from backup to REAL Database.
         * @param {Number} status   order status
         */
        commit: function(status) {

            var order = new OrderModel();
            return order.commitSaveOrder(this.data) ? 1 : -1;

        },

        /**
         * cancel or discard cancel.
         *
         * @param {Boolean} discard
         */
        cancel: function(discard) {

            // set status = -1
            var r = this.process(-1, discard);

            if (r == 1 && !discard) {
                r = this.commit(-1);
            }
            return r;
        },

        isCancel: function() {
            return (this.data.status  == -1) || (this.data.status == -3);
        },

        isVoided: function() {
            return (this.data.status  == -2);
        },

        /**
         * Submit Transaction to Order databases.
         *
         * @param {Number} status   0 = Transaction in Memory
         *                          1 = Success Order and finished payment.
         *                          2 = Store Order
         *                          -1 = Cancelled Order
         * @return {Number} submited status.
         */
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

            if(this.backgroundMode) return ;

            var showAveragePrice = GeckoJS.Configure.read('vivipos.fec.settings.layout.ShowAveragePrice') || false;
            this.view.data = this.data.display_sequences;
            this.view.rowCountChanged(prevRowCount, currentRowCount, cursorIndex);
            
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_number_of_items', this.data.qty_subtotal  + ((this.data.average_price == null || !showAveragePrice) ? '' : ('  /  ' + this.formatPrice(this.getRoundedPrice(this.data.average_price)))));
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_tax_total', this.formatTax(this.getRoundedTax(this.data.tax_subtotal)));
        },

        getItemPriceLevel: function(item, sellPrice) {

            let plevel = '-';
            // if item is a product, check price level
            if (item.no != null && item.no.length > 0) {
                let priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');

                // check 1 - is sellPrice equal to product's price at current price level
                if (item['level_enable' + priceLevel] && (sellPrice == item['price_level' + priceLevel])) {
                    plevel = priceLevel;
                }
                else {
                    // scan all enabled price levels to find a match
                    for (let i = 1; i < 10; i++) {
                        if (item['level_enable' + i] && (sellPrice == item['price_level' + i])) {
                            plevel = i;
                            break;
                        }
                    }
                }
            }
            return plevel;
        },

        createItemDataObj: function(index, item, sellQty, sellPrice, parent_index) {

            var roundedPrice = this.getRoundedNumber(sellPrice || 0);
            var priceModifier = item.manual_adjustment_only ? 1 : this.data.price_modifier;
            var roundedSubtotal = this.getRoundedPrice(sellQty*sellPrice*priceModifier) || 0;

            // retrieve category name from Session
            var categoriesByNo = GeckoJS.Session.get('categoriesByNo');
            if (categoriesByNo && categoriesByNo[item.cate_no]) {
                item.cate_name = categoriesByNo[item.cate_no].name;
            }

            var price_level = this.getItemPriceLevel(item, sellPrice);
            
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
                price_level: price_level,
                
                price_modifier: priceModifier,

                non_discountable: item.non_discountable,
                non_surchargeable: item.non_surchargeable,

                created: Math.round(new Date().getTime() / 1000 ),

                seat_no: (GeckoJS.Session.get('vivipos_fec_current_table_seat') || '')
            };

            return item2;
        },

        createDisplaySeq: function(index, item, type, level) {

            type = type || 'item';

            var itemDisplay = {} ;
            var dispName;
            if (type == 'item') {

                // using item's destination to set destination_prefix not from global
                var destinationsByName = GeckoJS.Session.get('destinationsByName');
                var itemDest = item.destination || this.data.destination;
                var itemDestPrefix = (destinationsByName[itemDest] ? (destinationsByName[itemDest]['prefix']||"") + " " : this.data.destination_prefix );

                itemDisplay = GREUtils.extend(itemDisplay, {
                    id: item.id,
                    no: item.no,
                    name: item.name,
                    alt_name1: item.alt_name1,
                    alt_name2: item.alt_name2,
                    destination: itemDestPrefix,
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
                    price_level: item.price_level,
                    price_modifier: item.price_modifier,
                    label: '',
                    seat_no: item.seat_no
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
                    parent_index: item.parent_index,
                    stock_status: item.stock_status,
                    age_verification: item.age_verification,
                    level: (level == null) ? 1 : level,
                    price_modifier: item.price_modifier

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
                    level: (level == null) ? 2 : level
                });
            }else if (type == 'trans_discount') {
                if (item.discount_name != null && item.discount_name.length > 0) {
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
                    level: (level == null) ? 0 : level
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
                    level: (level == null) ? 2 : level
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
                let current_price = '';
                let current_qty = '';

                if (item.is_groupable) {
                    current_qty = item.current_qty + 'X';
                }
                switch (item.name.toUpperCase()) {

                    case 'CREDITCARD':
                        dispName = item.memo1 || _('(cart)CREDITCARD');
                        break;

                    case 'CHECK':
                        dispName = item.memo1 || _('(cart)CHECK');
                        break;

                    case 'COUPON':
                        dispName = item.memo1 || _('(cart)COUPON');
                        if (item.is_groupable) {
                            dispName += ' ' + item.origin_amount;
                        }
                        break;

                    case 'GIFTCARD':
                        dispName = item.memo1 || _('(cart)GIFTCARD');
                        if (item.is_groupable) {
                            dispName += ' ' + item.origin_amount;
                        }
                        break;

                    case 'CASH':
                        if (item.is_groupable || (item.memo2 != '' && item.memo2 != null)) {
                            // groupable local cash
                            dispName = item.memo1 + this.formatPrice(item.origin_amount);
                        }
                        else {
                            dispName = _('(cart)CASH');
                        }
                        break;

                    default:
                        dispName = item.memo1;
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

                        if (item.current_qty_display) {
                            itemDisplay.current_qty = item.current_qty_display + item.sale_unit;
                        }else {
                            itemDisplay.current_qty += item.sale_unit;
                        }
                        
                    }
                }
            }

            if (item.created) itemDisplay.created = item.created;
            
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

            if(!this.backgroundMode) GeckoJS.Session.set('cart_last_sell_item', lastSellItem);
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

            var sellQty = null, sellPrice = null, sellQtyDisplay = null;

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

            sellQtyDisplay  = (GeckoJS.Session.get('cart_set_qty_display') != null) ? GeckoJS.Session.get('cart_set_qty_display') : sellQtyDisplay;

            var obj = {
                sellPrice: sellPrice,
                sellQty: sellQty,
                sellQtyDisplay: sellQtyDisplay,
                item: item
            };

            //this.log('DEBUG', 'dispatchEvent beforeAppendItem ' + this.dump(obj) );
            Transaction.events.dispatch('beforeAppendItem', obj, this);

            var itemIndex = GeckoJS.String.uuid();

            // create data object to push in items array
            var itemAdded = this.createItemDataObj(itemIndex, item, sellQty, sellPrice);

            if(sellQtyDisplay) itemAdded.current_qty_display = sellQtyDisplay;

            // push to items array
            this.data.items[itemIndex] = itemAdded;
            this.data.items_count++;
            var itemDisplay = this.createDisplaySeq(itemIndex, itemAdded, 'item');

            this.data.display_sequences.push(itemDisplay);

            // if product set, append individual items into transaction
            // create data object to push in items array
            var setitems = [];
            if (item.SetItem != null && item.SetItem.length > 0) {
                setitems = item.SetItem;
                itemAdded.has_setitems = true;
            }

            var self = this;
            setitems.forEach(function(setitem) {
                var setItemProductId = barcodesIndexes[setitem.preset_no];
                var setItemProduct = self.Product.getProductById(setItemProductId);

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


        labelItemAt: function(index, label){

            var prevRowCount = this.data.display_sequences.length;

            var itemTrans = this.getItemAt(index); // item in transaction
            var itemDisplay = this.getDisplaySeqAt(index); // item in transaction

            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {
                return null; // TODO - shouldn't be here since cart has intercepted illegal operations
            }

            itemDisplay.label = label;

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
            var prod = this.Product.getProductById(itemTrans.id);
            if (prod) {
                item = GREUtils.extend({}, prod);
            }else {
                item = GREUtils.extend({},itemTrans);
            }
            // need to use registered tax status
            item.rate = itemTrans.tax_name;

            var sellQty = itemTrans.current_qty;
            var oldSellQty = itemTrans.current_qty;
            var sellPrice = itemTrans.current_price;
            var priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');
            var oldPriceLevel = itemTrans.price_level;
            var condimentPrice = 0;
            var setItems = [];
            var setItemEventData;
            var sellQtyDisplay = null;

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

                    if (GeckoJS.Session.get('cart_set_price_value') != null) {
                        sellPrice = GeckoJS.Session.get('cart_set_price_value');
                    }else {
                        if ((sellQty == oldSellQty) && (oldPriceLevel != priceLevel)) {
                            // user want to shift price level
                            sellPrice = null;
                        }else {
                            sellPrice = itemTrans.current_price;
                        }
                    }
                    sellPrice = this.calcSellPrice(sellPrice, sellQty, item);

                    sellQtyDisplay  = (GeckoJS.Session.get('cart_set_qty_display') != null) ? GeckoJS.Session.get('cart_set_qty_display') : sellQtyDisplay;
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
                    itemTrans.price_level = itemModified.price_level;
                    itemTrans.destination = itemModified.destination;
                    itemTrans.seat_no = itemModified.seat_no;
                    itemTrans.tax_name = itemModified.tax_name;
                    itemModified = itemTrans;

                    if (sellQtyDisplay) itemModified.current_qty_display = sellQtyDisplay;

                    // update to items array
                    this.data.items[itemIndex]  = itemModified;

                    var itemDisplay2 = this.createDisplaySeq(itemIndex, itemModified, 'item');
                    itemDisplay2.tags = itemDisplay.tags;
                    itemDisplay2.label = itemDisplay.label;
                    itemDisplay2.returned = itemDisplay.returned;
                    
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
                            let qty = setitem.current_qty;
                            if (setitem.sale_unit != 'unit') {
                                if (qty > 0) {
                                    qty = 1;
                                }
                                else if (qty < 0) {
                                    qty = -1;
                                }
                                else {
                                    qty = 0;
                                }
                            }
                            for(var cn in setitem.condiments) {
                                condiment_subtotal += parseFloat(setitem.condiments[cn].price) * qty;
                            }
                            setitem.current_condiment = condiment_subtotal;

                            var setItemDisplay = self.createDisplaySeq(setitem.index, setitem, 'setitem');

                            self.data.display_sequences[setItemDisplayIndex] = setItemDisplay;
                        });
                    }

                    //this.log('DEBUG', 'dispatchEvent afterModifyItem ' + this.dump(itemModified) );
                    Transaction.events.dispatch('afterModifyItem', itemModified, this);

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
                        let qty = targetItem.current_qty;
                        if (targetItem.sale_unit != 'unit') {
                            if (qty > 0) {
                                qty = 1;
                            }
                            else if (qty < 0) {
                                qty = -1;
                            }
                            else {
                                qty = 0;
                            }
                        }
                        for(var cn in targetItem.condiments) {
                            condiment_subtotal += parseFloat(targetItem.condiments[cn].price) * qty;
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
                        let qty = targetItem.current_qty;
                        if (targetItem.sale_unit != 'unit') {
                            if (qty > 0) {
                                qty = 1;
                            }
                            else if (qty < 0) {
                                qty = -1;
                            }
                            else {
                                qty = 0;
                            }
                        }
                        for(var cn in targetItem.condiments) {
                            condiment_subtotal += parseFloat(targetItem.condiments[cn].price) * qty;
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
                        else if (displayItem.type == 'payment') {
                            this.data.trans_payments[displayItem.index].hasMarker = false;
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
            let qty = item.current_qty;
            if (item.sale_unit != 'unit') {
                if (qty > 0) {
                    qty = 1;
                }
                else if (qty < 0) {
                    qty = -1;
                }
                else {
                    qty = 0;
                }
            }
            for(var cn in item.condiments) {
                condiment_subtotal += parseFloat(item.condiments[cn].price) * qty;
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
            if (!item.parent_index) itemDisplay.current_subtotal = this.formatPrice(item.current_subtotal);

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

        _computeIncludedFixedTaxes: function(item) {
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'computing included fixed taxes: ' + this.dump(item));
            var taxes = 0;
            for (var taxno in item.tax_details) {
                let taxDetails = item.tax_details[taxno];
                let tax = taxDetails.tax;
                if (tax.type == 'INCLUDED' && tax.rate_type == '$') {
                    taxes += taxDetails.included;
                }
            }
            return taxes;
        },

        appendDiscount: function(index, discount, skipCondiments, respectNonDiscountable, useBalanceBeforePayments){
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
                    let fixedTaxes = this._computeIncludedFixedTaxes(item);
                    discount_amount = (item.current_subtotal - fixedTaxes - (skipCondiments ? item.current_condiment : 0)) * discount.amount;
                }

                // rounding discount
                discount_amount = this.getRoundedPrice(discount_amount);

                // check if discount amount exceeds user item discount limit
                var user = GeckoJS.Session.get('user');
                var item_discount_limit = parseFloat(user.item_discount_limit);
                if (item.current_subtotal > 0 && !isNaN(item_discount_limit) && item_discount_limit > 0) {
                    var item_discount_limit_amount = this._computeLimit(item.current_subtotal, item_discount_limit, user.item_discount_limit_type);
                    if (discount_amount > item_discount_limit_amount) {
                        NotifyUtils.warn(_('Discount amount [%S] may not exceed user item discount limit [%S]',
                            [this.formatPrice(discount_amount),
                            this.formatPrice(item_discount_limit_amount)]));
                        return;
                    }
                }

                if (discount_amount > item.current_subtotal && item.current_subtotal > 0) {
                    // discount too much
                    NotifyUtils.warn(_('Discount amount [%S] may not exceed item amount [%S]',
                        [this.formatPrice(discount_amount),
                        this.formatPrice(item.current_subtotal)]));

                    return;
                }

                item.current_discount = 0 - discount_amount;
                item.discount_name =  discount.name;
                item.discount_rate =  discount.amount;
                item.discount_type =  discount.type;
                item.hasDiscount = true;

                // create data object to push in items array
                let discountDisplay = this.createDisplaySeq(item.index, item, 'discount');

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(item.index)

                this.data.display_sequences.splice(++lastItemDispIndex,0,discountDisplay);

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
                        NotifyUtils.warn(_('Please note that return item(s) are present'));
                        break;
                    }
                }

                let basis = this.data.item_subtotal + this.data.tax_subtotal + this.data.item_surcharge_subtotal
                            + this.data.item_discount_subtotal + this.data.trans_surcharge_subtotal + this.data.trans_discount_subtotal
                            + this.data.promotion_subtotal;

                // loop through each item
                for (let iid in this.data.items) {
                    let item = this.data.items[iid];
                    if (respectNonDiscountable && this.Product.isNonDiscountable(item.id, false)) {
                        basis = basis - item.current_subtotal - item.current_tax;
                    }
                    else if (skipCondiments) {
                        basis -= item.current_condiment;
                    }
                }

                if (!useBalanceBeforePayments) {
                    basis -= this.data.payment_subtotal;
                }
                if (basis < 0) basis = 0;

                if (discountItem.discount_type == '$') {
                    basis = this.getRoundedPrice(basis);
                    if (discount.amount > basis) {
                        NotifyUtils.warn(_('Discount amount [%S] may not exceed discountable sale [%S]',
                                           [this.formatPrice(discount.amount), this.formatPrice(basis)]));
                        return;
                    }
                    discountItem.current_discount = discount.amount;
                }
                else {
                    discountItem.discount_name += '*';
                    discountItem.current_discount = basis * discountItem.discount_rate;
                }

                discountItem.current_discount = this.getRoundedPrice(discountItem.current_discount);

                discountItem.current_discount = 0 - discountItem.current_discount;

                var discountIndex = GeckoJS.String.uuid();
                this.data.trans_discounts[discountIndex] = discountItem;

                // mark subtotal as having surcharge applied
                itemDisplay.hasDiscount = true;

                // create data object to push in items array
                let discountDisplay = this.createDisplaySeq(discountIndex, discountItem, 'trans_discount');
                discountDisplay.subtotal_index = index;

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex);

                this.data.display_sequences.splice(++lastItemDispIndex,0,discountDisplay);

                this.calcPromotions();

                // this.calcItemsTax();

                resultItem = discountItem;
            }

            var currentRowCount = this.data.display_sequences.length;

            this.calcTotal();

            this.updateCartView(prevRowCount, currentRowCount, lastItemDispIndex);

            return resultItem;
        },

        appendMassDiscount: function(discount) {

            var resultItems = [];
            var transItems = this.data.items;
            var productModel = new ProductModel();

            for(var index in transItems) {
                if (index != null) {
                    var item = transItems[index];
                    var non_discountable = productModel.isNonDiscountable(item.id, false);
                    if(item.type == 'item' && item.parent_index == null && non_discountable == false
                        && item.hasDiscount == false && item.hasSurcharge == false && item.hasMarker == false) {

                        let displayIndex = this.getDisplayIndexByIndex(index);
                        let result = this.appendDiscount(displayIndex, discount);
                        if (result) {
                            resultItems.push(result);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            return resultItems;
        },

        appendSurcharge: function(index, surcharge, skipCondiments, respectNonDiscountable, useBalanceBeforePayments){

            var item = this.getItemAt(index);
            var itemDisplay = this.getDisplaySeqAt(index); // last seq
            var itemIndex = itemDisplay.index;
            var lastItemDispIndex;
            var surcharge_amount;
            var resultItem;

            var prevRowCount = this.data.display_sequences.length;

            if (item && item.type == 'item') {

                if (surcharge.type == '$') {
                    surcharge_amount = surcharge.amount;
                }else {
                    let fixedTaxes = this._computeIncludedFixedTaxes(item);
                    surcharge_amount = (item.current_subtotal - fixedTaxes) * surcharge.amount;
                }

                // rounding surcharge
                surcharge_amount = this.getRoundedPrice(surcharge_amount);

                // check if discount amount exceeds user limit
                var user = GeckoJS.Session.get('user');
                var surcharge_limit = parseFloat(user.item_surcharge_limit);
                if (item.current_subtotal > 0 && !isNaN(surcharge_limit) && surcharge_limit > 0) {
                    var surcharge_limit_amount = this._computeLimit(item.current_subtotal, surcharge_limit, user.item_surcharge_limit_type);
                    if (surcharge_amount > surcharge_limit_amount) {
                        NotifyUtils.warn(_('Surcharge amount [%S] may not exceed user item surcharge limit [%S]',
                            [this.formatPrice(surcharge_amount),
                            this.formatPrice(surcharge_limit_amount)]));
                        return;
                    }
                }

                item.surcharge_name = surcharge.name;
                item.surcharge_rate = surcharge.amount;
                item.surcharge_type = surcharge.type;
                item.current_surcharge = surcharge_amount;
                item.hasSurcharge = true;

                // create data object to push in items array
                var surchargeDisplay = this.createDisplaySeq(item.index, item, 'surcharge');

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(item.index)

                this.data.display_sequences.splice(++lastItemDispIndex,0,surchargeDisplay);

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
                        NotifyUtils.warn(_('Please note that return item(s) are present'));
                        break;
                    }
                }

                if (surchargeItem.surcharge_type == '$') {
                    surchargeItem.current_surcharge = this.getRoundedPrice(surcharge.amount);
                }else {
                    let basis = this.data.item_subtotal + this.data.tax_subtotal + this.data.item_surcharge_subtotal
                                + this.data.item_discount_subtotal + this.data.trans_surcharge_subtotal + this.data.trans_discount_subtotal
                                + this.data.promotion_subtotal;

                    // loop through each item
                    for (let iid in this.data.items) {
                        let item = this.data.items[iid];
                        if (respectNonDiscountable && this.Product.isNonSurchargeable(item.id, false)) {
                            basis = basis - item.current_subtotal - item.current_tax;
                        }
                        else if (skipCondiments) {
                            basis -= item.current_condiment;
                        }
                    }

                    if (!useBalanceBeforePayments) {
                        basis -= this.data.payment_subtotal;
                    }
                    if (basis < 0) basis = 0;

                    surchargeItem.surcharge_name += '*';
                    surchargeItem.current_surcharge = this.getRoundedPrice(basis * surchargeItem.surcharge_rate);
                }

                var surchargeIndex = GeckoJS.String.uuid();
                this.data.trans_surcharges[surchargeIndex] = surchargeItem;

                // mark subtotal as having surcharge applied
                itemDisplay.hasSurcharge = true;

                // create data object to push in items array
                let surchargeDisplay = this.createDisplaySeq(surchargeIndex, surchargeItem, 'trans_surcharge');
                surchargeDisplay.subtotal_index = index;

                // find the display index of the last entry associated with the item
                lastItemDispIndex = this.getLastDisplaySeqByIndex(itemIndex)

                this.data.display_sequences.splice(++lastItemDispIndex,0,surchargeDisplay);

                this.calcPromotions();
                //this.calcItemsTax();

                resultItem = surchargeItem;
            }

            var currentRowCount = this.data.display_sequences.length;

            this.calcTotal();

            this.updateCartView(prevRowCount, currentRowCount, lastItemDispIndex);

            return resultItem;
        },

        appendMassSurcharge: function(surcharge) {

            var resultItems = [];
            var transItems = this.data.items;
            var productModel = new ProductModel();

            for(var index in transItems) {
                if (index != null) {
                    var item = transItems[index];
                    var non_surchargeable = productModel.isNonSurchargeable(item.id, false);
                    if (item.type == 'item' && item.parent_index == null && non_surchargeable == false
                        && item.hasSurcharge == false && item.hasDiscount == false && item.hasMarker == false) {


                        let displayIndex = this.getDisplayIndexByIndex(index);
                        let result = this.appendSurcharge(displayIndex, surcharge);
                        if (result) {
                            resultItems.push(result);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
            return resultItems;
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

            if (taxes.length > 0) {
                if (taxIndex == null) {
                    var oldTax = itemTrans.tax_name;
                    for (var taxIndex=0; taxIndex<taxes.length; taxIndex++) {
                        if(taxes[taxIndex].no ==oldTax) break;
                    }
                    taxIndex = ( (taxIndex+1) >= taxes.length ) ? 0 : (taxIndex+1);
                }
                var newTax = null;
                try {
                    // deep clone using uneval/eval object  GECKO ONLY
                    newTax = eval(uneval(taxes[taxIndex]));
                }catch(e) {
                    newTax = GREUtils.extend({}, taxes[taxIndex]);
                }

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
            }
            else {
                return null;
            }
        },


        appendMarker: function(index, type){

            var item = this.getItemAt(index);
            var itemDisplay = this.getDisplaySeqAt(index);

            var prevRowCount = this.data.display_sequences.length;

            // create data object to push in items array
            var markerItem = {
                name: '** ' + type.toUpperCase(),
                type: type
            };

            var remain = this.getRemainTotal() - this.data.revalue_subtotal;
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

            // trans_payments
            for(var payIndex in this.data.trans_payments ) {
                var payItem = this.data.trans_payments[payIndex];
                payItem.hasMarker  = true;
            }
            
            var itemDisplay = this.createDisplaySeq(index, markerItem, type);

            var lastIndex = this.data.display_sequences.length - 1;
            this.data.display_sequences.splice(lastIndex+1,0,itemDisplay);

            var currentRowCount = this.data.display_sequences.length;

            this.updateCartView(prevRowCount, currentRowCount, currentRowCount - 1);

            return markerItem;
        },

        appendCondiment: function(index, condiments, replace, collapsed, skipSetOpen, leaveCursor) {
            
            var item = this.getItemAt(index, true);                             // item to add condiment to
            var targetItem = this.getItemAt(index);
            var itemDisplay = this.getDisplaySeqAt(index);                      // display item at cursor position
            var itemIndex = itemDisplay.index;                                  // itemIndex of item to add condiment to
            var targetDisplayItem = this.getDisplaySeqByIndex(itemIndex);       // display item of the item to add condiment to
            var targetDisplayIndex = this.getDisplayIndexByIndex(itemIndex);    // display index of the item to add condiment to

            var prevRowCount = this.getDisplaySeqCount();
            var displayIndex = replace ? this.getDisplayIndexByIndex(itemIndex) : index;
            
            if (item.type == 'item') {

                let removedCount = 0;
                let addedCount = 0;
                let prevRowCount = this.getDisplaySeqCount();

                if (replace && item.condiments != null && item.condiments != {}) {

                    // void all condiment items up to next item whose index is different from itemIndex
                    for (let i = displayIndex + 1; i < this.getDisplaySeqCount();) {
                        let displayItem = this.getDisplaySeqAt(i);
                        if (displayItem.index != itemIndex)
                            break;
                        if (displayItem.type == 'condiment') {
                            this.removeDisplaySeq(i, 1);
                            removedCount++;
                        }
                        else {
                            i++;
                        }
                    }
                    delete item.condiments;
                }
                else {
                    // move cursor to last item modifier
                    for (; displayIndex < this.getDisplaySeqCount() - 1; displayIndex++) {
                        // peek ahead at next entry to see if it belongs to the current item
                        let displayItem = this.getDisplaySeqAt(displayIndex + 1);
                        if (displayItem.index != itemIndex)
                            break;
                    }
                }

                if (condiments.length >0) {

                    let first = true;
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
                                item.condiments[condiment.name] = condimentItem;

                                // update condiment display if not collapsed
                                if (!collapsed) {
                                    var level = targetDisplayItem.type == 'setitem' ? 2 : null;
                                    var condimentDisplay = this.createDisplaySeq(itemIndex, condimentItem, 'condiment', level);

                                    // set first condiment item as open
                                    if (first && !skipSetOpen) {
                                        first = false;
                                        condimentDisplay.open = true;
                                    }
                                    this.data.display_sequences.splice(++displayIndex,0,condimentDisplay);

                                    addedCount++;
                                }
                            }
                        }
                    }, this);
                }

                if (collapsed) {
                    this.updateCartView(prevRowCount, prevRowCount - removedCount, leaveCursor ? index : displayIndex);

                    this.collapseCondiments(targetDisplayIndex, true);
                }

                // if item is a set item, compute condiment subtotals
                if (item.parent_index != null) {
                    var condiment_subtotal = 0;

                    // sum condiments
                    let qty = item.current_qty;
                    if (item.sale_unit != 'unit') {
                        if (qty > 0) {
                            qty = 1;
                        }
                        else if (qty < 0) {
                            qty = -1;
                        }
                        else {
                            qty = 0;
                        }
                    }
                    for(var cn in item.condiments) {
                        condiment_subtotal += parseFloat(item.condiments[cn].price) * qty;
                    }

                    item.current_condiment = condiment_subtotal;
                }

                this.calcItemSubtotal(targetItem);

                this.calcPromotions();

                this.calcItemsTax(targetItem);
                this.calcTotal();

                // update row count if not collapsed
                if (!collapsed) {
                    let currentRowCount = prevRowCount - removedCount + addedCount;
                    this.updateCartView(prevRowCount, currentRowCount, leaveCursor ? index : displayIndex);
                }
            }
            else {
                NotifyUtils.warn(_("Condiment may only be added to an item"));
            }

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
                this.appendCondiment(index, condimentArray, true, false, false, true);

                // update open state of first condiment item
                var firstCondiment = this.getDisplaySeqAt(index);
                if (firstCondiment) {
                    firstCondiment.open = true;
                }

                // update batch and batchMarker, if necessary
                if ('batch' in itemDisplay) {
                    var c;
                    var batchMarker = itemDisplay.batchMarker;
                    
                    let batch = itemDisplay.batch;
                    for (let i = index; i < index + condimentArray.length; i++) {
                        c = this.getDisplaySeqAt(i);
                        c.batch = batch;
                    }

                    if (batchMarker && c) c.batchMarker = batchMarker;
                }
            }
        },

        constructCollapsedCondiments: function(item) {
            var condiments = item.condiments;

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
            return condimentItem;
        },

        collapseCondiments: function(index, update) {
            var item = this.getItemAt(index, true);
            var itemDisplay = this.getDisplaySeqAt(index);

            if (item && item.condiments && (itemDisplay && itemDisplay.open || update)) {
                // get batch & batchMarker from last condiment item
                let lastCondimentDispItem, batch, batchMarker;
                for (let i = index; i < this.getDisplaySeqCount(); i++) {
                    var displayItem = this.getDisplaySeqAt(i);
                    if (displayItem.index != item.index)
                        break;
                    if (displayItem.type == 'condiment') {
                        lastCondimentDispItem = displayItem;
                    }
                }
                if (lastCondimentDispItem) {
                    batch = lastCondimentDispItem.batch;
                    batchMarker = lastCondimentDispItem.batchMarker;
                }

                // make a copy of existing condiments and saving it for later use
                var condiments = GREUtils.extend({}, item.condiments);

                // construct new condiment display
                var condimentItem = this.constructCollapsedCondiments(item);
                this.appendCondiment(index, [condimentItem], true, false, true);

                // save collapsed condiment
                item.collapsedCondiments = item.condiments;

                // restore condiments
                item.condiments = condiments;

                // update open state of collapsed condiment item
                var collapsedCondiments = this.getDisplaySeqAt(index);
                if (collapsedCondiments) {
                    collapsedCondiments.open = false;

                    if (batch != null) collapsedCondiments.batch = batch;
                    if (batchMarker != null) collapsedCondiments.batchMarker = batchMarker;
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

            var level = 0;

            if (item) {
                item.memo = memo;
                if (targetDisplayItem.type == 'setitem')
                    level = 2;
                else
                    level = 1;
            }
            
            var newItemDisplay = this.createDisplaySeq(itemIndex, memoItem, 'memo', level);

            this.data.display_sequences.splice(index+1,0,newItemDisplay);

            var currentRowCount = this.data.display_sequences.length;

            this.updateCartView(prevRowCount, currentRowCount, index + 1);

            return item;
        },


        appendPayment: function(type, amount, origin_amount, memo1, memo2, qty, isGroupable){

            var prevRowCount = this.data.display_sequences.length;
            
            var paymentId =  GeckoJS.String.uuid();
            
            var paymentItem = {
                id: paymentId,
                type: 'payment',
                name: type,
                amount: this.getRoundedPrice((type == 'giftcard') ? amount : qty * amount),
                origin_amount: origin_amount,
                memo1: memo1,
                memo2: memo2,
                is_groupable: isGroupable,
                current_qty: qty
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

        modifyPaymentQty: function(paymentDisplay, paymentItem, amount, qty) {
            if (paymentItem.is_groupable) {
                paymentItem.amount += qty * amount;
                paymentItem.current_qty += qty;

                newPaymentDisplay = this.createDisplaySeq(paymentItem.index, paymentItem, 'payment');
                GREUtils.extend(paymentDisplay, newPaymentDisplay);

                this.calcTotal();
            }
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

                case 'mass_discount':
                    item = this.data.items[itemIndex];
                    break;

                case 'payment':
                    item = this.data.trans_payments[itemIndex];

            }
            return item;
        },

        returnItemAtIndex: function(index, qty) {
            var displayItems = this.data.display_sequences;
            var transItems = this.data.items;

            var ptr = index;
            var itemDisplay = displayItems[ptr++];

            if (itemDisplay.type == 'item') {

                var prevRowCount = displayItems.length;

                var origQty;
                var origItemIndex = itemDisplay.index;
                var newItem;
                var newItemIndex;
                var newDispIndex;
                var lastItemDispIndex;
                var lastItem;
                var discount;
                var surcharge;

                // scan through display sequence and replicate related display and order items
                while (itemDisplay && (itemDisplay.index == origItemIndex ||
                                       itemDisplay.parent_index == origItemIndex ||
                                       (transItems[itemDisplay.index] && transItems[itemDisplay.index].parent_index == origItemIndex))) {

                    switch(itemDisplay.type) {
                        case 'item':
                            let origItem = transItems[itemDisplay.index];
                            origQty = origItem.current_qty;

                            // replicate original item
                            newItem = GREUtils.extend({}, origItem);

                            // store discount & surcharge information
                            if (newItem.hasDiscount) {
                                discount = {name: newItem.discount_name,
                                            amount: newItem.discount_rate,
                                            type: newItem.discount_type};
                            }
                            else {
                                discount = null;
                            }

                            if (newItem.hasSurcharge) {
                                surcharge = {name: newItem.surcharge_name,
                                             amount: newItem.surcharge_rate,
                                             type: newItem.surcharge_type};
                            }
                            else {
                                surcharge = null;
                            }

                            // update various fields
                            newItemIndex = newItem['index'] = GeckoJS.String.uuid();
                            newItem['current_qty'] = -qty;
                            newItem['stock_maintained'] = false;
                            newItem['discount_name'] = '';
                            newItem['discount_rate'] = '';
                            newItem['discount_type'] = '';
                            newItem['current_discount'] = 0;
                            newItem['surcharge_name'] = '';
                            newItem['surcharge_rate'] = '';
                            newItem['surcharge_type'] = '';
                            newItem['current_surcharge'] = 0;
                            newItem['hasDiscount'] = false;
                            newItem['hasSurcharge'] = false;
                            newItem['hasMarker'] = false;
                            newItem['condiments'] = GREUtils.extend({}, origItem['condiments']);
                            newItem['collapsedCondiments'] = GREUtils.extend({}, origItem['collapsedCondiments']);

                            delete newItem['stock_status'];
                            delete newItem['tax_details'];

                            transItems[newItemIndex] = newItem;
                            this.data.items_count++;

                            // replicate display sequence
                            let newDispItem = this.createDisplaySeq(newItemIndex, newItem, itemDisplay.type, itemDisplay.level);
                            newDispItem['returned'] = true;
                            displayItems.push(newDispItem);

                            lastItemDispIndex = newDispIndex = displayItems.length - 1;
                            lastItem = newItem;

                            this.calcItemSubtotal(newItem);
                            this.calcItemsTax(newItem);

                            break;

                        case 'setitem':
                            let origSetItem = transItems[itemDisplay.index];

                            // replicate original set item
                            let newSetItem = GREUtils.extend({}, origSetItem);

                            // update various fields
                            let newSetItemIndex = GeckoJS.String.uuid();
                            newSetItem['index'] = newSetItemIndex;
                            newSetItem['current_qty'] = - origSetItem['current_qty'] * qty / origQty;
                            newSetItem['stock_maintained'] = false;
                            newSetItem['parent_index'] = newItemIndex;

                            newSetItem['condiments'] = GREUtils.extend({}, origSetItem['condiments']);
                            newSetItem['collapsedCondiments'] = GREUtils.extend({}, origSetItem['collapsedCondiments']);

                            delete newSetItem['stock_status'];
                            delete newSetItem['tax_details'];

                            transItems[newSetItemIndex] = newSetItem;

                            // replicate display sequence
                            let newDispSetItem = this.createDisplaySeq(newSetItemIndex, newSetItem, itemDisplay.type, itemDisplay.level);
                            newDispSetItem['returned'] = true;
                            displayItems.push(newDispSetItem);

                            lastItemDispIndex = displayItems.length - 1;
                            lastItem = newSetItem;

                            break;

                        case 'memo':
                            this.appendMemo(lastItemDispIndex, itemDisplay.name);
                            prevRowCount++;
                            break;

                        case 'condiment':
                            // only update display items here
                            let newCondDisp = GREUtils.extend({}, itemDisplay)
                            newCondDisp.index = lastItem.index;
                            displayItems.push(newCondDisp);

                            this.calcItemSubtotal(lastItem);
                            break;

                        case 'discount':
                            // use stored discount
                            if (discount) {
                                this.calcItemSubtotal(newItem);
                                this.calcItemsTax(newItem);
                                this.appendDiscount(lastItemDispIndex, discount);
                                prevRowCount++;
                            }
                            break;

                        case 'surcharge':
                            // use stored surcharge
                            if (surcharge) {
                                this.calcItemSubtotal(newItem);
                                this.calcItemsTax(newItem);
                                this.appendSurcharge(lastItemDispIndex, surcharge);
                                prevRowCount++;
                            }
                            break;
                    }

                    itemDisplay = displayItems[ptr++];
                }

                this.calcItemSubtotal(newItem);
                this.calcItemsTax(newItem);
                this.calcPromotions();
                this.calcTotal();
                
                this.updateCartView(prevRowCount, displayItems.length, newDispIndex);
            }
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

        unlockItems: function(index) {
            // unlock items in current batch
            var displayItems = this.data.display_sequences;
            var transItems = this.data.items;
            var paymentItems = this.data.trans_payments;
            var batch = this.data.batchCount--;

            if (index == null) index = displayItems.length - 1;

            if (index > -1)
                delete displayItems[index].batchMarker;

            // lock all display items up-to and including the item at position given by index
            for (var i = 0; i <= index; i++) {
                var dispItem = displayItems[i];
                if (('batch' in dispItem && dispItem['batch'] == batch)) {
                    delete dispItem['batch'];

                    // lock corresponding transaction item
                    if (dispItem.index != null) {
                        switch(dispItem.type) {
                            case 'item':
                            case 'setitem':
                                if (transItems[dispItem.index] != null) {
                                    delete transItems[dispItem.index].batch;
                                }
                                break;

                            case 'payment':
                                if (paymentItems[dispItem.index] != null) {
                                    delete paymentItems[dispItem.index].batch;
                                }
                                break;
                        }
                    }
                }
            }

            // set order lock index
            delete this.data.batchItemCount;
            delete this.data.batchPaymentCount;
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
                var parentItem = this.getItemAt(index);
                var dispParentItem = this.getDisplaySeqByIndex(parentItem.index);
                return (dispParentItem && 'batch' in dispParentItem);
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
            for (let i in this.data.display_sequences) {
                let displayItem = this.data.display_sequences[i];
                if (displayItem.type == 'payment' && displayItem.batch == batch) {
                    return true;
                }
            }
            return false;
        },

        getPaymentsInBatch: function(batch) {
            let paymentList = [];

            if (batch == null) batch = this.data.batchCount;
            this.data.display_sequences.forEach(function(displayItem) {
                if (displayItem.type == 'payment' && displayItem.batch == batch) {
                    paymentList.push(this.data.trans_payments[displayItem.index]);
                }
            }, this);
            return paymentList;
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

                if (item.parent_index == null && !isRemove) {
                    var tax = Transaction.Tax.getTax(item.tax_name);
                    if(tax) {
                        item.tax_rate = tax.rate;
                        item.tax_type = tax.type;

                        var toTaxCharge = item.current_subtotal + item.current_discount + item.current_surcharge;
                        var taxChargeObj = Transaction.Tax.calcTaxAmount(item.tax_name, Math.abs(toTaxCharge), Math.abs(item.current_price), Math.abs(item.current_qty), this.data.precision_taxes, this.data.rounding_taxes);

                        // rounding tax
                        item.current_tax =  this.getRoundedTax(taxChargeObj[item.tax_name].charge);
                        item.included_tax = this.getRoundedTax(taxChargeObj[item.tax_name].included);

                        if (taxChargeObj[item.tax_name].combine) {
                            item.tax_details = taxChargeObj[item.tax_name].combine;

                            // round individual tax components
                            var includedCTaxes = [];
                            var addonCTaxes = [];

                            for (var key in item.tax_details) {
                                var cTaxObj = item.tax_details[key];
                                if (cTaxObj.tax.type == 'INCLUDED') {
                                    includedCTaxes.push(cTaxObj);
                                }
                                else {
                                    addonCTaxes.push(cTaxObj);
                                }
                            };
                            // process add-on taxes
                            if (addonCTaxes.length > 0) {
                                var addonSum = 0;
                                for (var i = 0; i < addonCTaxes.length - 1; i++) {
                                    addonCTaxes[i].charge = this.getRoundedTax(addonCTaxes[i].charge);
                                    addonSum += addonCTaxes[i].charge;
                                }

                                addonCTaxes[i].charge = this.getRoundedTax(item.current_tax - addonSum);
                            }

                            // process included taxes
                            if (includedCTaxes.length > 0) {
                                var includedSum = 0;
                                for (var j = 0; j < includedCTaxes.length - 1; j++) {
                                    includedCTaxes[j].included = this.getRoundedTax(includedCTaxes[j].included);
                                    includedSum += includedCTaxes[j].included;
                                }

                                includedCTaxes[j].included = this.getRoundedTax(item.included_tax - includedSum);
                            }
                        }
                        else {
                            item.tax_details = {};
                            item.tax_details[item.tax_name] = {
                                charge: item.current_tax,
                                included: item.included_tax,
                                taxable: taxChargeObj[item.tax_name].taxable,
                                tax: tax
                            };
                        }
                    }else {
                        item.current_tax = 0;
                        item.included_tax = 0;
                    }

                    if (toTaxCharge < 0) {
                        item.current_tax = 0 - item.current_tax;
                        item.included_tax = 0 - item.included_tax;

                        // process component taxes, if any
                        for (var key in item.tax_details) {
                            var cTaxObj = item.tax_details[key];
                            cTaxObj.charge = 0 - cTaxObj.charge;
                            cTaxObj.included = 0 - cTaxObj.included;
                            cTaxObj.taxable = 0 - cTaxObj.taxable;
                        };
                    }
                }
            //this.log('DEBUG', 'item details: ' + this.dump(item));
            }

            //this.log('DEBUG', 'dispatchEvent onCalcItemsTax ' + items);
            Transaction.events.dispatch('onCalcItemsTax', items, this);
        },

        calcRevalue: function(total, policy, factor) {

            //this.log('DEBUG', 'total,policy,factor: ' + total + ',' + policy + ',' + factor);
            var revalue_subtotal = 0;
            var roundedTotal;

            switch(policy) {
                case 'round-down-to-factor':
                    if(factor > 0) {
                        if(total>=0) {
                            revalue_subtotal = 0 - parseFloat(total % factor);
                        }else {
                            revalue_subtotal = parseFloat((0 - total) % factor);
                        }
                    }
                    break;

                case 'round-up-to-factor':
                    if(factor > 0) {
                        if(total>=0) {
                            revalue_subtotal = parseFloat(total % factor);
                            if (revalue_subtotal != 0)
                                revalue_subtotal = factor - revalue_subtotal;
                        }else {
                            revalue_subtotal = parseFloat((0 - total) % factor);
                            if (revalue_subtotal != 0)
                                revalue_subtotal -= factor;
                        }
                    }
                    break;

                case 'round-to-nearest-factor':
                    if(factor > 0) {
                        let low = parseFloat(this.getRoundedNumber(Math.abs(total)) % factor);
                        let high = factor - low;

                        if (high >= low) {
                            revalue_subtotal = (total >= 0) ? -low : low;
                        }
                        else {
                            revalue_subtotal = (total >= 0) ? high : -high;
                        }
                    }
                    break;

                case 'round-to-5-cents':
                    roundedTotal = Transaction.Number.round(this.getRoundedNumber(Math.abs(total)), 3, 'to-nearest-half');
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;
                    
                case 'round-to-5-cents-down':
                    var x = this.getRoundedNumber(Math.abs(total) * 100);
                    var roundedTotal = (x - (x % 5))/100;
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;

                case 'round-to-10-cents-up':
                    roundedTotal = Transaction.Number.round(this.getRoundedNumber(Math.abs(total)), 2, 'to-nearest-nickel');
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;

                case 'round-to-10-cents-down':
                    var x = Math.abs(total) * 10;
                    var y = parseInt(x);
                    var r = x - y;
                    if (r > 0.5) {
                        roundedTotal = ++y / 10
                    }
                    else {
                        roundedTotal = y / 10;
                    }
                    revalue_subtotal = (total > 0) ? (roundedTotal - total) : (- total - roundedTotal);
                    break;

                case 'round-to-25-cents':
                    roundedTotal = Transaction.Number.round(this.getRoundedNumber(Math.abs(total)), 2, 'to-nearest-quarter');
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;

                case 'round-to-50-cents':
                    roundedTotal = Transaction.Number.round(this.getRoundedNumber(Math.abs(total)), 2, 'to-nearest-half');
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;

                case 'round-to-50-cents-down':
                    var x = this.getRoundedNumber(Math.abs(total) * 10);
                    var roundedTotal = (x - (x % 5))/10;
                    if (total < 0) roundedTotal = 0 - roundedTotal;
                    revalue_subtotal = roundedTotal - total;
                    break;

                case 'none':
                default:
                    revalue_subtotal = 0;
                    break;
            }
            return this.getRoundedNumber(revalue_subtotal);
        },

        calcTotal: function() {
            //var profileStart = (new Date()).getTime();

            //this.log('DEBUG', "onCalcTotal " + this.dump(this.data));
            Transaction.events.dispatch('onCalcTotal', this.data, this);

            var total=0, remain=0, item_subtotal=0, tax_subtotal=0, included_tax_subtotal=0, item_surcharge_subtotal=0, item_discount_subtotal=0, qty_subtotal=0;
            var trans_surcharge_subtotal=0, trans_discount_subtotal=0, payment_subtotal=0;
            var promotion_subtotal=0, promotion_tax_subtotal=0, promotion_included_tax_subtotal=0;

            // item subtotal and grouping
            this.data.items_summary = {}; // reset summary
            this.data.items_tax_details = {};
            for(var itemIndex in this.data.items ) {
                var item = this.data.items[itemIndex];

                // don't include set items in calculations
                if (!item.parent_index) {
                    tax_subtotal += parseFloat(item.current_tax);
                    included_tax_subtotal += parseFloat(item.included_tax);

                    item_surcharge_subtotal += parseFloat(item.current_surcharge);
                    item_discount_subtotal += parseFloat(item.current_discount);
                    item_subtotal += parseFloat(item.current_subtotal);

                    qty_subtotal += item.current_qty;

                    // summarize tax details
                    if (item.tax_details) {
                        for (var key in item.tax_details) {
                            let taxDetails = item.tax_details[key];

                            if (!(key in this.data.items_tax_details)) {
                                this.data.items_tax_details[key] = {
                                    tax: taxDetails.tax,
                                    tax_subtotal: 0,
                                    included_tax_subtotal: 0,
                                    item_count: 0,
                                    taxable_amount: 0
                                }
                            }

                            if (item.sale_unit == 'unit') {
                                this.data.items_tax_details[key].item_count += parseInt(item.current_qty);
                            }
                            else {
                                this.data.items_tax_details[key].item_count++;
                            }
                            this.data.items_tax_details[key].tax_subtotal += parseFloat(taxDetails.charge);
                            this.data.items_tax_details[key].included_tax_subtotal += parseFloat(taxDetails.included);
                            this.data.items_tax_details[key].taxable_amount += parseFloat(taxDetails.taxable);
                        }
                    }
                }

                // summary it
                var item_id = item.id;
                var sumItem = GREUtils.extend({}, (this.data.items_summary[item_id] || {
                    id: item_id,
                    name: item.name,
                    no: item.no,
                    barcode: item.barcode,
                    cate_no: item.cate_no,
                    cate_name: item.cate_name,
                    sale_unit: item.sale_unit,
                    last_tax_name: item.tax_name,
                    last_tax_rate: item.tax_rate,
                    last_tax_type: item.tax_type,
                    avg_price: 0,
                    qty_subtotal: 0,
                    subtotal: 0,
                    discount_subtotal: 0,
                    surcharge_subtotal: 0,
                    tax_subtotal: 0,
                    included_tax_subtotal: 0
                }));

                // include set items in quantity summation
                sumItem.qty_subtotal += (item.sale_unit == 'unit') ? item.current_qty : 1;

                if (!item.parent_index) {
                    sumItem.subtotal += parseFloat(item.current_subtotal);
                    sumItem.discount_subtotal += parseFloat(item.current_discount);
                    sumItem.surcharge_subtotal += parseFloat(item.current_surcharge);
                    sumItem.tax_subtotal += parseFloat(item.current_tax);
                    sumItem.included_tax_subtotal += parseFloat(item.included_tax);
                }
                // calc avg_price
                sumItem.avg_price = this.getRoundedPrice(sumItem.subtotal / sumItem.qty_subtotal);
                // update last tax
                sumItem.last_tax_name = item.tax_name;
                sumItem.last_tax_rate = item.tax_rate;
                sumItem.last_tax_type = item.tax_type;

                this.data.items_summary[item_id] = sumItem;
            }

            // trans subtotal
            for(var transDisIndex in this.data.trans_discounts ) {
                var disItem = this.data.trans_discounts[transDisIndex];
                trans_discount_subtotal += parseFloat(disItem.current_discount);
            }
            trans_discount_subtotal = this.getRoundedNumber(trans_discount_subtotal);

            for(var transSurIndex in this.data.trans_surcharges ) {
                var surItem = this.data.trans_surcharges[transSurIndex];
                trans_surcharge_subtotal += parseFloat(surItem.current_surcharge);
            }
            trans_surcharge_subtotal = this.getRoundedNumber(trans_surcharge_subtotal);

            for(var payIndex in this.data.trans_payments ) {
                var payItem = this.data.trans_payments[payIndex];
                payment_subtotal += parseFloat(payItem.amount);
            }
            payment_subtotal = this.getRoundedNumber(payment_subtotal);

            promotion_subtotal = this.data.promotion_subtotal ;
            promotion_tax_subtotal = isNaN(parseFloat(this.data.promotion_tax_subtotal)) ? 0 : parseFloat(this.data.promotion_tax_subtotal);
            promotion_included_tax_subtotal = isNaN(parseFloat(this.data.promotion_included_tax_subtotal)) ? 0 : parseFloat(this.data.promotion_included_tax_subtotal);

            // group promotion taxes
            this.data.promotions_tax_details = {};
            for(var promoIndex in this.data.promotion_apply_items ) {
                let item = this.data.promotion_apply_items[promoIndex];

                // summarize tax details
                if (item.tax_details) {
                    for (var key in item.tax_details) {
                        let taxDetails = item.tax_details[key];

                        if (!(key in this.data.promotions_tax_details)) {
                            this.data.promotions_tax_details[key] = {
                                tax: taxDetails.tax,
                                tax_subtotal: 0,
                                included_tax_subtotal: 0,
                                taxable_amount: 0
                            }
                        }

                        this.data.promotions_tax_details[key].tax_subtotal += parseFloat(taxDetails.charge);
                        this.data.promotions_tax_details[key].included_tax_subtotal += parseFloat(taxDetails.included);
                        this.data.promotions_tax_details[key].taxable_amount += parseFloat(taxDetails.taxable);

                    }
                }
            }

            // deduct promotion tax totals from item tax totals
            for (var key in this.data.promotions_tax_details) {
                if (key in this.data.items_tax_details) {
                    this.data.items_tax_details[key].tax_subtotal -= this.data.promotions_tax_details[key].tax_subtotal;
                    this.data.items_tax_details[key].included_tax_subtotal -= this.data.promotions_tax_details[key].included_tax_subtotal;
                    this.data.items_tax_details[key].taxable_amount -= this.data.promotions_tax_details[key].taxable_amount;
                }
                else {
                    this.data.items_tax_details[key] = {
                        tax_subtotal: 0 - this.data.promotions_tax_details[key].tax_subtotal,
                        included_tax_subtotal: 0 - this.data.promotions_tax_details[key].included_tax_subtotal,
                        taxable_amount: 0 - this.data.promotions_tax_details[key].taxable_amount,
                        tax: this.data.promotions_tax_details[key].tax
                    }
                }
            }
            
            tax_subtotal -= promotion_tax_subtotal;
            included_tax_subtotal -= promotion_included_tax_subtotal;

            total = this.getRoundedPrice(item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal + promotion_subtotal);
            remain = total - payment_subtotal;

            this.data.revalue_subtotal = this.getRoundedPrice(this.calcRevalue(total, this.data.autorevalue, this.data.revaluefactor));
            total = total + this.data.revalue_subtotal;
            remain = total - payment_subtotal;

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
            this.data.average_price = (qty_subtotal == 0) ? null : this.getRoundedPrice((total - this.data.revalue_subtotal) / qty_subtotal);

            this.data.promotion_subtotal = promotion_subtotal ;
            this.data.promotion_tax_subtotal = promotion_tax_subtotal;
            this.data.promotion_included_tax_subtotal = promotion_included_tax_subtotal;
            Transaction.events.dispatch('afterCalcTotal', this.data, this);

            Transaction.serializeToRecoveryFile(this);
            //var profileEnd = (new Date()).getTime();
            //this.log('afterCalcTotal End ' + (profileEnd - profileStart));

            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', "afterCalcTotal " + this.dump(this.data));
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


        getRoundedNumber: function(num, precision) {
            precision = precision || Math.max(this.data.precision_taxes, this.data.precision_prices);
            var result = Math.round(num*Math.pow(10,(precision+1)))/Math.pow(10,(precision+1));
            return result;
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
        },

        getNumberOfCustomers: function() {
            return this.data.no_of_customers || '';
        },

        setNumberOfCustomers: function(num) {
            num = isNaN(parseInt(num)) ? ('') : (parseInt(num)+'');
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_number_of_customers', num);
            this.data.no_of_customers = num;
        },

        getTableNo: function() {
            return this.data.table_no || '';
        },

        setTableNo: function(tableNo) {
            tableNo = tableNo ? (parseInt(tableNo)+'') : '';
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_table_number', tableNo);
            this.data.table_no = tableNo;
        },

        getTableName: function() {
            return this.data.table_name || '';
        },

        setTableName: function(tableName) {
            tableName = tableName || '';
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_table_name', tableName);
            this.data.table_name = tableName;
        },

        getTableRegionName: function() {
            return this.data.table_region_name || '';
        },

        setTableRegionName: function(tableRegionName) {
            tableRegionName = tableRegionName || '';
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_table_region_name', tableRegionName);
            this.data.table_region_name = tableRegionName;
        },

        getCheckNo: function() {
            return this.data.check_no || '';
        },

        setCheckNo: function(checkNo) {
            checkNo = isNaN(parseInt(checkNo)) ? (-1 +'') : (parseInt(checkNo)+'');
            if(!this.backgroundMode) GeckoJS.Session.set('vivipos_fec_check_number', checkNo);
            this.data.check_no = checkNo;
        },

        setSplitPayments: function(splitPayment) {
            this.data.split_payments = splitPayment || false;
        },

        isSplitPayments: function() {
            return (this.data.split_payments || false);
        },


        /**
         * moveItem from source transaction by index
         *
         * @param {Object} source   source transaction object
         * @param {Number} index    index of source transaction display sequences
         */
        _moveItem: function(source, index) {

            var selectedItemDisplay = source.getDisplaySeqAt(index); // display item at cursor position
            var selectedItemIndex = selectedItemDisplay.index;
            var displaySeqCount = source.getDisplaySeqCount();

            var removeIndexes = {};
            var removeCount = 0;

            // move items by for-loop display_sequences
            for (let i=index; i<displaySeqCount;i++) {

                let itemDisplay = source.getDisplaySeqAt(i);
                let itemIndex = itemDisplay.index;
                let itemParentIndex = itemDisplay.parent_index;
                let itemType = itemDisplay.type;
                let displayLevel = itemDisplay.level;
                let item = source.data.items[itemIndex];
                let parentItem = null;
                if (itemParentIndex) {
                    parentItem = source.data.items[itemParentIndex];
                }

                if (selectedItemIndex == itemIndex || selectedItemIndex == itemParentIndex || (itemType != 'item' && itemType != 'setitem' && displayLevel > 0)) {
                    
                    if (itemIndex && !removeIndexes[itemIndex]) {
                        removeIndexes[itemIndex] = itemIndex;
                        this.data.items[itemIndex] = item;
                    }

                    this.data.display_sequences.push(itemDisplay);
                    removeCount++;
                }else {
                    break;
                }
            }

            this.data.items_count += GeckoJS.BaseObject.getKeys(removeIndexes).length;
            source.data.items_count -= GeckoJS.BaseObject.getKeys(removeIndexes).length;

            for(let j in removeIndexes) {
                let idx = removeIndexes[j];
                delete source.data.items[idx] ;
            }
            source.removeDisplaySeq(index, removeCount);

            
        },


        /**
         * CloneItem from source transaction by index and remove source qty
         *
         * @param {Object} source   source transaction object
         * @param {Number} index    index of source transaction display sequences
         * @param {Number} qty    quantity of source transaction
         */
        _cloneItem: function(source, index, qty) {
            
            var selectedItemDisplay = source.getDisplaySeqAt(index); // display item at cursor position
            var selectedItemIndex = selectedItemDisplay.index;
            var displaySeqCount = source.getDisplaySeqCount();

            var removeIndexes = {};

            // move items by for-loop display_sequences
            for (let i=index; i<displaySeqCount;i++) {

                let itemDisplay = source.getDisplaySeqAt(i);
                let itemIndex = itemDisplay.index;
                let itemParentIndex = itemDisplay.parent_index;
                let itemType = itemDisplay.type;
                let displayLevel = itemDisplay.level;
                let item = source.data.items[itemIndex];
                let parentItem = null;
                if (itemParentIndex) {
                    parentItem = source.data.items[itemParentIndex];
                }
                let newItemIndex = GeckoJS.String.uuid();
                let newParentIndex = null;
                let newParentItem = null;

                let orgItem = null;
                let newItem = null;
                let priceModifier = (item? item.price_modifier : null);

                if (selectedItemIndex == itemIndex || selectedItemIndex == itemParentIndex || (itemType != 'item' && itemType != 'setitem' && displayLevel > 0)) {


                    if (itemIndex && !removeIndexes[itemIndex]) {
                        // items

                        removeIndexes[itemIndex] = newItemIndex;

                        // remove all item discount/surcharge and markers
                        let emptyData = {
                            /*
                            discount_name: '',
                            discount_rate: '',
                            discount_type: '',
                            current_discount: 0,

                            surcharge_name: '',
                            surcharge_rate: '',
                            surcharge_type: '',
                            current_surcharge: 0,

                            hasDiscount: false,
                            hasSurcharge: false,
                            */
                            hasMarker: false
                        };

                        orgItem = GREUtils.extend({}, item, emptyData);
                        newItem = GREUtils.extend({}, item, emptyData);

                        if (itemParentIndex) {
                            // setitem
                            newParentIndex = removeIndexes[itemParentIndex];
                            newParentItem = this.data.items[newParentIndex];

                            orgItem.org_qty = item.current_qty;
                            orgItem.current_qty = (item.current_qty * (parentItem.current_qty/parentItem.org_qty));
                            orgItem.current_subtotal = this.getRoundedPrice(orgItem.current_qty*item.current_price*priceModifier) || 0;
                            
                            newItem.org_qty = item.current_qty;
                            newItem.current_qty = orgItem.org_qty - orgItem.current_qty;
                            newItem.current_subtotal = this.getRoundedPrice(newItem.current_qty*item.current_price*priceModifier) || 0;

                            newItem.parent_index = newParentIndex;
                            
                        }else {
                            // item
                            orgItem.org_qty = item.current_qty;
                            orgItem.current_qty = (item.current_qty-qty);
                            orgItem.current_subtotal = this.getRoundedPrice(orgItem.current_qty*item.current_price*priceModifier) || 0;

                            newItem.org_qty = item.current_qty;
                            newItem.current_qty = qty;
                            newItem.current_subtotal = this.getRoundedPrice(qty*item.current_price*priceModifier) || 0;

                            // check Discount/Surcharge
                            if (orgItem.hasDiscount) {
                                let orgDiscount = orgItem.current_discount;
                                orgItem.current_discount = this.getRoundedPrice( orgItem.current_discount * ( orgItem.current_qty / orgItem.org_qty));
                                newItem.current_discount = orgDiscount - orgItem.current_discount;
                            }
                            if (orgItem.hasSurcharge) {
                                let orgSurcharge = orgItem.current_surcharge;
                                orgItem.current_surcharge = this.getRoundedPrice( orgItem.current_surcharge * ( orgItem.current_qty / orgItem.org_qty));
                                newItem.current_surcharge = orgSurcharge - orgItem.current_surcharge;
                            }
                        }

                        newItem.index = newItemIndex;
                        this.data.items[newItemIndex] = newItem;
                        source.data.items[itemIndex] = orgItem;

                        // only calc current item
                        this.calcItemSubtotal(newItem);
                        this.calcItemsTax(newItem);
                        source.calcItemSubtotal(orgItem);
                        source.calcItemsTax(orgItem);

                        let newItemDisplay = this.createDisplaySeq(newItemIndex, newItem, itemDisplay.type);
                        let orgItemDisplay = this.createDisplaySeq(itemIndex, orgItem, itemDisplay.type);

                        this.data.display_sequences.push(newItemDisplay);
                        source.data.display_sequences[i] = orgItemDisplay;

                    } else{
                        // condiment or other in display_sequences

                        newItemIndex = removeIndexes[itemIndex];
                        if(newItemIndex) {
                            let newItem = this.data.items[newItemIndex];
                            let newItemDisplay = this.createDisplaySeq(newItemIndex, newItem, itemDisplay.type);
                            this.data.display_sequences.push(newItemDisplay);
                        }
                        source.data.display_sequences[i] = this.createDisplaySeq(itemIndex, item, itemDisplay.type);
                        
                    }
                    
                }else {
                    // not selected item , break for loop
                    break;
                }
            }
            this.data.items_count += GeckoJS.BaseObject.getKeys(removeIndexes).length;

     
        },
        
        /**
         * move and clone item from source transaction by index of display_sequences
         * 
         * @param {Object} source   source transaction
         * @param {Number} index    index of display_sequences
         * @param {Number} qty      qty
         */
        moveCloneItem: function(source, index, qty) {
            
            if (qty <= 0) return;
            
            var itemTrans = source.getItemAt(index); // item in transaction
            var itemDisplay = source.getDisplaySeqAt(index); // display item at cursor position
            var sourceQty = itemTrans.current_qty;
            var mode = (qty == sourceQty) ? 'move' : 'clone';

            switch(mode) {
                case 'move':
                    this._moveItem(source, index);
                    break;
                case 'clone':
                    this._cloneItem(source, index, qty);
                    break;
            }

            // recalc items
            this.calcTotal();
            source.calcTotal();
            
        },

        /**
         * move and clone all items from source transaction
         * 
         * @param {Object} source       source transaction
         */
        moveCloneAllItems: function(source) {
            
            for(let i=0; i < source.data.display_sequences.length; i++) {
                let data = source.data.display_sequences[i] ;
                let type = data.type;

                // only process item , any assoc items will auto move.
                if (type == 'item'){

                    this._moveItem(source, i);
                    i--;

                }
            }
            this.calcTotal();
            source.calcTotal();
        },

        cloneAllItems: function(source) {

            for(let i=0; i < source.data.display_sequences.length; i++) {
                let data = source.data.display_sequences[i] ;
                let type = data.type;

                // only process item , any assoc items will auto move.
              if (type == 'item'){

                    this._cloneItem(source, i, source.data.items[data.index].current_qty);

                }

            }
            this.calcTotal();
            source.calcTotal();
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
