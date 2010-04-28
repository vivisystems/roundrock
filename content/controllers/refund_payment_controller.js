(function(){


    var __controller__ = {

        name: 'RefundPayment',

        _originalPayments: [],
        _refundPayments: [],
        _refundTotal: 0,
        _paidTotal: 0,
        _precision: 0,
        _rounding: 0,
        _localCurrency: '',
        _decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.',
        _thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',',

        roundPrice: function(price) {
            var roundedPrice = GeckoJS.NumberHelper.round(Math.abs(price), this._precision, this._rounding);
            if (price < 0) roundedPrice = 0 - roundedPrice;

            return roundedPrice;
        },

        formatPrice: function(price, showZero) {
            if (parseFloat(price) == 0 && !showZero) {
                return '';
            }
            
            var options = {
                decimals: this._decimals,
                thousands: this._thousands,
                places: ((this._precision>0)?this._precision:0)
            };
            // format display precision
            return GeckoJS.NumberHelper.format(price, options);
        },

        load: function(data) {

            this._precision = data.precisionPrices;
            this._rounding = data.roundingPrices;

            let currencies = GeckoJS.Session.get('Currencies') || [];
            if (currencies && currencies[0] && currencies[0].currency && currencies[0].currency.length > 0) {
                this._localCurrency = currencies[0].currency;
            }
            else {
                this._localCurrency = '';
            }
            
            this._originalPayments = GeckoJS.Array.objectExtract(data.payments, '{s}') || [];
            var seq = 1;
            this._originalPayments.forEach(function(p) {
                p.seq = seq++;
                p.amount = p.amount - p.change;
                p.display_amount = this.formatPrice(p.amount);

                // if groupable, show count
                if (p.is_groupable) {
                    let text = p.order_items_count + 'X';
                    if (p.name == 'cash' && p.memo2 != '') {
                        p.display_origin_amount = text + p.origin_amount;
                    }
                    else {
                        p.display_origin_amount = text + this.formatPrice(p.origin_amount);
                    }
                }
                else if (p.name == 'giftcard') {
                    p.display_origin_amount = this.formatPrice(p.origin_amount);
                }
                else if (p.name == 'cash' && p.memo2 != '') {
                    p.display_origin_amount = p.origin_amount;
                }
                else {
                    p.display_origin_amount = '';
                }
            }, this);

            this._paidTotal = data.paidTotal;
            this._refundTotal = 0;
            document.getElementById('orderSeq').value = '[' + data.sequence + ']';

            document.getElementById('paymentscrollablepanel').datasource = this._originalPayments;
            document.getElementById('paidTotal').value = this.formatPrice(this._paidTotal);
            
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            document.getElementById('refund_amount').textbox.value = this.formatPrice(this.roundPrice(this._paidTotal));
            document.getElementById('refund_amount').textbox.select();

            if (data.autoRefundPayment) {
                this.updateAutoRefundPayments(data.autoRefundPaymentType);
            }

        },

        save: function(data) {
            data.refunds = this._refundPayments;
            data.refundTotal = this._refundTotal;
        },
        
        clonePayments: function() {
            var payments = [];
            var self = this;
            var total = 0;
            var hash = {};
            var seq = 0;

            this._originalPayments.forEach(function(p, i) {
                var newPayment = GREUtils.extend({}, p);

                if (p.name == 'giftcard') {
                    if (p.is_groupable) {
                        newPayment.amount = self.roundPrice(p.order_items_count * p.origin_amount);
                    }
                    else {
                        newPayment.amount = self.roundPrice(p.origin_amount);
                    }
                }
                else {
                    newPayment.amount = self.roundPrice(newPayment.amount);
                }

                // don't clone memo1 and memo2 for cash
                if (p.name == 'cash') {
                    newPayment.memo1 = self._localCurrency;
                    newPayment.memo2 = null;
                }
                total += newPayment.amount;
                if (!(newPayment.name in hash) || !(newPayment.memo1 in hash[newPayment.name])) {
                    if (!(newPayment.name in hash)) {
                        hash[newPayment.name] = {};
                    }
                    hash[newPayment.name][newPayment.memo1] = seq;
                    newPayment.seq = ++seq;
                    payments.push(newPayment);
                }
                else {
                    payments[hash[newPayment.name][newPayment.memo1]].amount += newPayment.amount;
                }
            });

            payments.forEach(function(p) {
                p.display_amount = self.formatPrice(p.amount);
            });

            this._refundPayments = payments;
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            this._refundTotal = total;
            document.getElementById('refundTotal').value = this.formatPrice(this._refundTotal);
        },

        clearRefundPayments: function() {
            this._refundPayments = [];
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            this._refundTotal = 0;
            document.getElementById('refundTotal').value = '';
        },

        addRefundPayment: function() {
           
            var inputObj = GeckoJS.FormHelper.serializeToObject('refundForm');
            var amount = parseFloat(inputObj.amount);
            var refundList = document.getElementById('refundscrollablepanel');

            if (isNaN(inputObj.amount) || amount <= 0) {
                NotifyUtils.warn(_('Refund payment amount must be a valid, positive number'));
            }
            else {

                this.checkPaymentType(inputObj);

                amount = this.roundPrice(amount);

                var newRefundPayment = {
                    seq: this._refundPayments.length + 1,
                    name: inputObj.type,
                    amount: amount,
                    display_amount: this.formatPrice(amount),
                    memo1: inputObj.memo1,
                    memo2: inputObj.memo2
                };
                
                this._refundPayments.push(newRefundPayment);
                refundList.treeBoxObject.rowCountChanged(this._refundPayments.length - 1, 1);
                refundList.treeBoxObject.ensureRowIsVisible(this._refundPayments.length - 1);

                refundList.selection.select(this._refundPayments.length - 1);

                this._refundTotal = this._refundTotal - - amount;
                document.getElementById('refundTotal').value = this.formatPrice(this._refundTotal);
            }
        },

        removePayment: function() {
            var refundList = document.getElementById('refundscrollablepanel');
            var selectedIndex = refundList.selectedIndex;
            var selectedItems = refundList.selectedItems;

            if (selectedIndex > -1 && selectedItems.length > 0) {
                this._refundTotal -= this._refundPayments[selectedIndex].amount;
                this._refundPayments.splice(selectedIndex, 1);

                for (var i = selectedIndex; i < this._refundPayments.length; i++) {
                    this._refundPayments[i].seq--;
                }

                if (selectedIndex >= this._refundPayments.length) {
                    selectedIndex = this._refundPayments.length - 1;
                }
                refundList.treeBoxObject.rowCountChanged(this._refundPayments.length + 1, -1);
                refundList.invalidate();
                refundList.treeBoxObject.ensureRowIsVisible(selectedIndex);
                refundList.selection.select(selectedIndex);

                document.getElementById('refundTotal').value = this.formatPrice(this._refundTotal);
            }
        },

        checkPaymentType: function(inputObj) {

            var currencies = GeckoJS.Session.get('Currencies');

            if (inputObj.type == 'cash' && inputObj.memo1.length <= 0 && currencies ) {
                inputObj.memo1 = currencies[0].currency;
            }

        },
        
        selectRefundPayment: function(index) {
            document.getElementById('btnMinus').setAttribute('disabled', index == -1);
        },

        updateAutoRefundPayments: function(autoRefundPaymentType) {
            
            autoRefundPaymentType = autoRefundPaymentType || 'auto';

            var refundList = document.getElementById('refundscrollablepanel');

            if (autoRefundPaymentType == 'auto') {

                this._originalPayments.forEach(function(p) {

                    if (p.amount <= 0) return ;

                    let newRefundPayment = {
                        seq: p.seq,
                        name: (autoRefundPaymentType == 'auto' ? p.name : autoRefundPaymentType),
                        amount: p.amount,
                        display_amount: p.display_amount,
                        memo1: p.memo1,
                        memo2: p.memo2
                    };

                    this._refundPayments.push(newRefundPayment);
                    this._refundTotal = this._refundTotal - - p.amount;


                }, this);


            }else {

                this._refundTotal = this._paidTotal;
                var seq = 1;

                var memo1 = "";
                var memo2 = null;

                if (autoRefundPaymentType == 'cash') {
                    memo1 = this._localCurrency;
                }

                let newRefundPayment = {
                    seq: seq++,
                    name: autoRefundPaymentType,
                    amount: this._refundTotal,
                    display_amount: this.formatPrice(this._refundTotal),
                    memo1: memo1,
                    memo2: memo2
                };

                this._refundPayments.push(newRefundPayment);

            }


            if (this._refundPayments.length >0) {

                refundList.datasource = this._refundPayments;
                refundList.selection.select(this._refundPayments.length - 1);

                document.getElementById('refundTotal').value = this.formatPrice(this._refundTotal);
            }
            
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
