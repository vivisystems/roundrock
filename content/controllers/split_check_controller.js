(function(){

    /**
     * Class SplitCheckController
     */
    GeckoJS.Controller.extend( {

        name: 'SplitCheck',
        _sourceCheck: null,
        _sourceItems: [],
        _usedCheckNo: null,

        _splitItems: [],
        _index: 0,
        _splitedIndex: 0,
        
        checkOrd: function() {
            alert('checkOrd');
        },

        _getNewCheckNo: function() {
            var i = 1;
            var ar = [];
            this._splitItems.forEach(function(o){
                ar.push(o.check_no);
            });

            while (i <= 200) {

                if(this._usedCheckNo["" + i] != 1) {

                    if (GeckoJS.Array.inArray(""+i, ar) < 0) {
                        break;
                    }
                }
                
                i++;
            }

            return "" + i;
        },

        splitItems: function() {
            var self = this;

            // this._splitItems = [];
            var selectedItems = document.getElementById('sourcecheckscrollablepanel').vivitree.selectedItems;

            var spliteditems = [];
            var d = 0;
            selectedItems.forEach(function(o){
                spliteditems.push(self._sourceItems[o - d]);
                self._sourceItems.splice(o - d, 1);
                d++;
            });

            var checkNo = this._getNewCheckNo();

            var check_no = checkNo;
            var table_no = this._sourceCheck.table_no;
            var cnt = this._splitItems.push({
                name: 'Check ' + this._index,
                check_no: check_no,
                table_no: table_no,
                items:spliteditems
            });
            this._index++;

            var panelView = new GeckoJS.NSITreeViewArray(this._sourceItems);
            document.getElementById('sourcecheckscrollablepanel').datasource = panelView;

            var panelView2 = new GeckoJS.NSITreeViewArray(this._splitItems[cnt - 1].items);
            document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;

            var panelView3 = new GeckoJS.NSITreeViewArray(this._splitItems);
            document.getElementById('splitedscrollablepanel').datasource = panelView3;
            document.getElementById('splitedscrollablepanel').vivitree.selection.select( cnt - 1);
            this.selectSplitedCheck( cnt - 1);

        },

        selectMain: function(index) {
            var numRanges = document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.getRangeCount();

            var selected = !this._sourceItems[index].selected;
            this._sourceItems[index].selected = selected;
            
            if (this._sourceItems.length > 0) {
                var parentIndex = this._sourceItems[index].parent_index;
                if (parentIndex) {
                    var i=0;
                    this._sourceItems.forEach(function(o){
                        if ((o.parent_index == parentIndex) || (o.index == parentIndex)) {
                            if (selected) {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                                o.selected = true;
                            } else {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                                o.selected = false;
                            }
                        } else {
                            if (o.selected) {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                            } else {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                            }
                        }
                        i++;
                    });
                } else {
                    var i=0;

                    var itemIndex = this._sourceItems[index].index;
                    this._sourceItems.forEach(function(o){
                        if ((o.parent_index == itemIndex)) {
                            if (selected) {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                                o.selected = true;
                            } else {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                                o.selected = false;
                            }
                        } else {
                            if (o.selected) {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.rangedSelect(i,i,true);
                            } else {
                                document.getElementById('sourcecheckscrollablepanel').vivitree.view.selection.clearRange(i,i,true);
                            }
                        }
                        i++;
                    });
                }
            }
        },

        selectSplitedCheck: function(index) {
            //
            this._splitedIndex = index;
            if (this._splitItems.length > 0) {
                var panelView2 = new GeckoJS.NSITreeViewArray(this._splitItems[index].items);
                document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;

                document.getElementById('splited_check_no').value = this._splitItems[index].check_no;
                document.getElementById('splited_table_no').value = this._splitItems[index].table_no;

            }
        },

        reverse: function() {
            //
            var self = this;
            var index = document.getElementById('splitedscrollablepanel').selectedIndex;
            var reverseitems = this._splitItems[index].items;
            reverseitems.forEach(function(o){
                self._sourceItems.push(o);
            });
            this._splitItems.splice(index, 1);
            var cnt = this._splitItems.length;


            var panelView = new GeckoJS.NSITreeViewArray(this._sourceItems);
            document.getElementById('sourcecheckscrollablepanel').datasource = panelView;

            if (cnt > 0) {
                var panelView2 = new GeckoJS.NSITreeViewArray(this._splitItems[0].items);
                document.getElementById('splitedcheckscrollablepanel').datasource = panelView2;

                var panelView3 = new GeckoJS.NSITreeViewArray(this._splitItems);
                document.getElementById('splitedscrollablepanel').datasource = panelView3;
                document.getElementById('splitedscrollablepanel').vivitree.selection.select(0);
            } else {
                document.getElementById('splitedcheckscrollablepanel').datasource = [];
                document.getElementById('splitedscrollablepanel').datasource = [];
            }
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

            this.log('DEBUG', 'dispatchEvent onCalcTotal ' + this.dump(data));

            var total=0, remain=0, item_subtotal=0, tax_subtotal=0, included_tax_subtotal=0, item_surcharge_subtotal=0, item_discount_subtotal=0;
            var trans_surcharge_subtotal=0, trans_discount_subtotal=0, payment_subtotal=0;

            // item subtotal and grouping
            data.items_count = 0;
            data.items_summary = {}; // reset summary
            for(var itemIndex in data.items ) {
                var item = data.items[itemIndex];

                tax_subtotal += parseFloat(item.current_tax);
                included_tax_subtotal += parseFloat(item.included_tax);

                item_surcharge_subtotal += parseFloat(item.current_surcharge);
                item_discount_subtotal += parseFloat(item.current_discount);
                item_subtotal += parseFloat(item.current_subtotal);

                // summary it
                var item_id = item.id;
                let sumItem = data.items_summary[item_id] || {id: item_id, name: item.name,
                    qty_subtotal: 0, subtotal: 0, discount_subtotal: 0, surcharge_subtotal: 0};

                sumItem.qty_subtotal += item.current_qty;
                sumItem.subtotal += parseFloat(item.current_subtotal);
                sumItem.discount_subtotal += parseFloat(item.current_discount);
                sumItem.surcharge_subtotal += parseFloat(item.current_surcharge);

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

            total = item_subtotal + tax_subtotal + item_surcharge_subtotal + item_discount_subtotal + trans_surcharge_subtotal + trans_discount_subtotal;
            remain = total - payment_subtotal;

            data.total = this.getRoundedPrice(total, data.precision_prices, data.rounding_prices);
            data.remain = this.getRoundedPrice(remain, data.precision_prices, data.rounding_prices);
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
            data.no_of_customers = 0;
            data.lockIndex = data.display_sequences.length;
            // data.batchCount = ?;
            // data.closed = ?;
            // data.batchItemCount = ?;
            // data.batchPaymentCount = ?;
            // data.recall = ?;

        },

        _genOrigOrder: function() {
            //
            var self = this;
            var order = {};

            // gen order object from items
            for (var key in self._sourceCheck) {
                if (typeof(self._sourceCheck[key]) == 'object' && self._sourceCheck[key].constructor.name == 'Array' ) {
                    order[key] = [];
                }
                else if (typeof(self._sourceCheck[key]) == "object") {
                    order[key] = {};
                } else {
                    order[key] = self._sourceCheck[key];
                }
            }

            // merge display_sequences and items
            this._sourceItems.forEach(function(item){
                // items
                order.items[item.index] = GeckoJS.BaseObject.clone(self._sourceCheck.items[item.index]);

                // display_sequences
                self._sourceCheck.display_sequences.forEach(function(disp){
                    if (disp.index == item.index) {
                        var dd = GeckoJS.BaseObject.clone(disp);
                        order.display_sequences.push(dd);
                    }
                });

                // trans_discounts object
                // trans_surcharges object
                // trans_payments object
                // markers array

            });

            order.id = self._sourceCheck.id;
            order.seq = self._sourceCheck.seq;
            self.calcTotal(order);

            return order;
        },

        _genOrders: function() {
            //
            var self = this;
            var orders = [];
            var cnt = this._splitItems.length;

            this._splitItems.forEach(function(o){

                var order = {};

                // gen order object from items
                for (var key in self._sourceCheck) {
                    if (typeof(self._sourceCheck[key]) == 'object' && self._sourceCheck[key].constructor.name == 'Array' ) {
                        order[key] = [];
                    }
                    else if (typeof(self._sourceCheck[key]) == "object") {
                        order[key] = {};
                    } else {
                        order[key] = self._sourceCheck[key];
                    }
                }

                // merge display_sequences and items
                o.items.forEach(function(item){
                    // items
                    order.items[item.index] = GeckoJS.BaseObject.clone(self._sourceCheck.items[item.index]);

                    // display_sequences
                    self._sourceCheck.display_sequences.forEach(function(disp){
                        if (disp.index == item.index) {
                            var dd = GeckoJS.BaseObject.clone(disp);
                            order.display_sequences.push(dd);
                        }
                    });

                    // trans_discounts object
                    // trans_surcharges object
                    // trans_payments object
                    // markers array

                });

                order.id = GeckoJS.String.uuid();
                order.seq = SequenceModel.getSequence('order_no');
                order.check_no = o.check_no;
                order.table_no = o.table_no;

                self.calcTotal(order);
                
                orders.push(order);

            });

            return orders;
            
        },

        _saveOrders: function(index) {

            var self = this;
            // var items = this._splitItems[0].items;

            var origData = this._genOrigOrder();
            var order = new OrderModel();
            order.saveOrder(origData);
            order.serializeOrder(origData);

            var orders = this._genOrders();

            var check_no_list = [];

            orders.forEach(function(data){

                // save order
                var order = new OrderModel();
                // order.saveOrder(data);
                order.saveOrderMaster(data);

                check_no_list.push(data.check_no);
                // save order items...
                // order.saveOrderItems(data);
                var r;
                var orderItems  = order.mappingTranToOrderItemsFields(data);
                var orderItem = new OrderItemModel();
                orderItem.begin();
                orderItems.forEach(function(item){
                    // update items order_id
                    orderItem.id = item.id;
                    r = orderItem.save(item);
                });
                orderItem.commit();

                // save order object
                order.serializeOrder(data);
            });
            
            
            
            // @todo OSD
            NotifyUtils.warn(_('The Check# %S has been splited to Check# %S!!', [this._sourceCheck.check_no, check_no_list.join(',')]));

            if (index)
                return orders[this._splitedIndex];
            else
                return origData;
        },

        conform: function() {
            var retOrder = this._saveOrders();
            var inputObj = window.arguments[0];
            inputObj.ok = true;
            inputObj.id = retOrder.id;
            inputObj.check_no = retOrder.check_no;

            window.close();
        },

        cancel: function() {
            var inputObj = window.arguments[0];
            inputObj.ok = false;
            window.close();
        },

        paythis: function() {

            var retOrder = this._saveOrders(this._splitedIndex);
            var inputObj = window.arguments[0];
            inputObj.ok = true;
            inputObj.id = retOrder.id;
            inputObj.check_no = retOrder.check_no;

            window.close();
        },

        load: function() {

            var inputObj = window.arguments[0];

            this._usedCheckNo = inputObj.usedCheckNo;

            this._sourceCheck = inputObj.sourceCheck;

            document.getElementById('source_check_no').value = this._sourceCheck.check_no;
            document.getElementById('source_table_no').value = this._sourceCheck.table_no;

            this._sourceItems = GeckoJS.BaseObject.getValues(this._sourceCheck.items);
            this._sourceItems.forEach(function(o){
                o.selected = false;
            });

            var panelView = new GeckoJS.NSITreeViewArray(this._sourceItems);
            document.getElementById('sourcecheckscrollablepanel').datasource = panelView;

        }

    });

})();

