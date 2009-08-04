(function(){

    var __controller__ = {

        name: 'MergeCheck',

        _sourceCheck: null,
        _targetCheck: null,
        _sourceItems: [],
        _targetItems: [],
        _mergedCheck: {},
        _tableStatusModel: null,

        _getTableStatusModel: function() {
            if (this._tableStatusModel == null) {

                var cart = this.getCartController();
                this._tableStatusModel = cart.GuestCheck._tableStatusModel;

            }
            return this._tableStatusModel;
        },

        getCartController: function() {
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            this._cart = mainWindow.GeckoJS.Controller.getInstanceByName( 'Cart' );
            return this._cart;
        },

        reverse: function() {
            
            this.load();
        },
        
        getRoundedPrice: function(price, precision_prices, rounding_prices) {
            var roundedPrice = GeckoJS.NumberHelper.round(Math.abs(price), precision_prices, rounding_prices) || 0;
            if (price < 0) roundedPrice = 0 - roundedPrice;
            return roundedPrice;
        },
        
        getRoundedTax: function(tax, precision_taxes, rounding_taxes) {
            var roundedTax = GeckoJS.NumberHelper.round(Math.abs(tax), precision_taxes, rounding_taxes) || 0;
            if (tax < 0) roundedTax = 0 - roundedTax;
            return roundedTax;
        },

        calcTotal: function(data) {

            // this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.dump(data));

            var total=0, remain=0, item_subtotal=0, tax_subtotal=0, included_tax_subtotal=0, item_surcharge_subtotal=0, item_discount_subtotal=0, qty_subtotal=0;
            var trans_surcharge_subtotal=0, trans_discount_subtotal=0, payment_subtotal=0, promotion_subtotal=0;

            // item subtotal and grouping
            data.items_count = 0;
            data.items_summary = {}; // reset summary
            for(var itemIndex in data.items ) {
                var item = data.items[itemIndex];

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
                var sumItem = GREUtils.extend({}, (data.items_summary[item_id] || {
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
                data.items_summary[item_id] = sumItem;

                data.items_count++;
            }

            // trans subtotal
            for(var transDisIndex in data.trans_discounts ) {
                var disItem = data.trans_discounts[transDisIndex];
                trans_discount_subtotal += parseFloat(disItem.current_discount);
            }

            for(var transSurIndex in data.trans_surcharges ) {
                var surItem = data.trans_surcharges[transSurIndex];
                trans_surcharge_subtotal += parseFloat(surItem.current_surcharge);
            }

            for(var payIndex in data.trans_payments ) {
                var payItem = data.trans_payments[payIndex];
                payment_subtotal += parseFloat(payItem.amount);
            }

            promotion_subtotal = data.promotion_subtotal ;

            total = item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal;
            remain = total - payment_subtotal;

            // revalue
            if(data.autorevalue && data.revalueprices != 0) {
                if(total>=0) {
                    data.revalue_subtotal = 0 - parseFloat(total % data.revalueprices);
                }else {
                    data.revalue_subtotal = parseFloat((0 - total) % data.revalueprices);
                    if (data.revalue_subtotal != 0)
                        data.revalue_subtotal -= data.revalueprices;
                }
                total = total + data.revalue_subtotal;
                remain = total - payment_subtotal;
            }

            data.total = this.getRoundedPrice(total, data.precision_prices, data.rounding_prices);
            data.remain = this.getRoundedPrice(remain, data.precision_prices, data.rounding_prices);
            data.qty_subtotal = qty_subtotal;
            data.tax_subtotal = this.getRoundedTax(tax_subtotal, data.precision_taxes, data.rounding_taxes);
            data.item_subtotal = this.getRoundedPrice(item_subtotal, data.precision_prices, data.rounding_prices);
            data.included_tax_subtotal = this.getRoundedTax(included_tax_subtotal, data.precision_prices, data.rounding_prices);
            data.item_surcharge_subtotal = this.getRoundedPrice(item_surcharge_subtotal, data.precision_prices, data.rounding_prices);
            data.item_discount_subtotal = this.getRoundedPrice(item_discount_subtotal, data.precision_prices, data.rounding_prices);
            data.trans_surcharge_subtotal = this.getRoundedPrice(trans_surcharge_subtotal, data.precision_prices, data.rounding_prices);
            data.trans_discount_subtotal = this.getRoundedPrice(trans_discount_subtotal, data.precision_prices, data.rounding_prices);
            data.payment_subtotal = this.getRoundedPrice(payment_subtotal, data.precision_prices, data.rounding_prices);

            data.discount_subtotal = data.item_discount_subtotal + data.trans_discount_subtotal ;
            data.surcharge_subtotal = data.item_surcharge_subtotal + data.trans_surcharge_subtotal;

            // @todo individual setting...
            data.status = 2;
            // data.check_no = ?;
            // data.no_of_customers = 0;
            data.lockIndex = data.display_sequences.length;
            // data.batchCount = ?;
            // data.closed = ?;
            // data.batchItemCount = ?;
            // data.batchPaymentCount = ?;
            // data.recall = ?;

        },

        mergeItems: function() {

            var self = this;
            // clone targetCheck to mergedCheck...
            for (var key in self._targetCheck) {
                if (self._targetCheck[key] == null) {
                    self._mergedCheck[key] = self._targetCheck[key];
                }
                else if (typeof(self._targetCheck[key]) == 'object' && self._targetCheck[key].constructor.name == 'Array' ) {
                    self._mergedCheck[key] = [];
                    self._mergedCheck[key] = GeckoJS.Array.merge(self._mergedCheck[key], self._targetCheck[key]);
                }
                else if (typeof(self._targetCheck[key]) == "object") {
                    self._mergedCheck[key] = {};
                    for (var key2 in self._targetCheck[key]) {
                        self._mergedCheck[key][key2] = self._targetCheck[key][key2];
                    }
                } else {
                    self._mergedCheck[key] = self._targetCheck[key];
                }
            }

            // merge sourceCheck to mergedCheck...
            for (var key in this._sourceCheck) {
                if (self._sourceCheck[key] == null) {
                    self._mergedCheck[key] = self._sourceCheck[key];
                }
                else if (typeof(this._sourceCheck[key]) == 'object' && this._sourceCheck[key].constructor.name == 'Array' ) {
                    this._mergedCheck[key] = GeckoJS.Array.merge(this._mergedCheck[key], this._sourceCheck[key]);
                }
                else if (typeof(this._sourceCheck[key]) == "object") {
                    for (var key2 in this._sourceCheck[key]) {
                        this._mergedCheck[key][key2] = this._sourceCheck[key][key2];
                    }
                } else {
                    //
                }
            }

            this.calcTotal(this._mergedCheck);

            // misc
            var mergedGuestNo = this._mergedCheck.no_of_customers;
            var sourcGuestNo = this._sourceCheck.no_of_customers;
            this._mergedCheck.no_of_customers = Math.round(parseInt(mergedGuestNo) + parseInt(sourcGuestNo));


            var panelView = new GeckoJS.NSITreeViewArray([]);
            document.getElementById('sourcecheckscrollablepanel').datasource = panelView;

            this._mergedItems = GeckoJS.BaseObject.getValues(this._mergedCheck.items);
            var panelView2 = new GeckoJS.NSITreeViewArray(this._mergedItems);
            document.getElementById('targetcheckscrollablepanel').datasource = panelView2;

            return this._mergedItems;

        },

        confirm: function(paythis) {

            // var datasource = document.getElementById('sourcecheckscrollablepanel').datasource;
            var rows = document.getElementById('sourcecheckscrollablepanel').rowCount;

            if (rows > 0) {
                // not yet merged...
                return;
            }

            var order = new OrderModel();

            // @todo set source check's status to -3 ==> transfered check'
            this._sourceCheck.status = -3;
            // lastMidifiedTime
            this._sourceCheck.lastModifiedTime = this._sourceCheck.modified;
            this._sourceCheck.modified = Math.round(new Date().getTime() / 1000 );
            order.saveOrder(this._sourceCheck);
            this._getTableStatusModel().addCheck(this._sourceCheck);

            // save merged check...
            // lastMidifiedTime
            this._mergedCheck.lastModifiedTime = this._mergedCheck.modified;
            this._mergedCheck.modified = Math.round(new Date().getTime() / 1000 );
            order.saveOrder(this._mergedCheck);
            this.getCartController().dispatchEvent('onMergeCheck', {view:{}, data:this._mergedCheck});

            // update table status
            this._getTableStatusModel().addCheck(this._mergedCheck);

            // use sequence number if check number not set
            if (this._sourceCheck.check_no == '' || this._mergedCheck.check_no == '') {
                NotifyUtils.info(_('Order# [%S] has been merged into Order# [%S]', [this._sourceCheck.seq, this._mergedCheck.seq]));
            }
            else {
                NotifyUtils.info(_('Check# [%S] has been merged into Check# [%S]', [this._sourceCheck.check_no, this._mergedCheck.check_no]));
            }

            var inputObj = window.arguments[0];
            inputObj.ok = true;
            inputObj.id = this._mergedCheck.id;
            inputObj.check_no = this._mergedCheck.check_no;
            inputObj.payit = paythis;

            window.close();
        },

        cancel: function() {

            window.close();
        },

        load: function() {
            //

            var inputObj = window.arguments[0];

            this._targetCheck = inputObj.targetCheck;
            this._sourceCheck = inputObj.sourceCheck;

            document.getElementById('source_check_no').value = this._sourceCheck.check_no;
            document.getElementById('source_table_no').value = this._sourceCheck.table_no;

            document.getElementById('target_check_no').value = this._targetCheck.check_no;
            document.getElementById('target_table_no').value = this._targetCheck.table_no;

            this._sourceItems = GeckoJS.BaseObject.getValues(this._sourceCheck.items);
            this._targetItems = GeckoJS.BaseObject.getValues(this._targetCheck.items);

            var panelView = new GeckoJS.NSITreeViewArray(this._sourceItems);
            document.getElementById('sourcecheckscrollablepanel').datasource = panelView;

            var panelView2 = new GeckoJS.NSITreeViewArray(this._targetItems);
            document.getElementById('targetcheckscrollablepanel').datasource = panelView2;

        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

