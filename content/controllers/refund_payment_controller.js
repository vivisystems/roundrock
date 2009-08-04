(function(){


    var __controller__ = {

        name: 'RefundPayment',

        _originalPayments: [],
        _refundPayments: [],
        _refundTotal: 0,
        _paidTotal: 0,
        _precision: 0,
        _rounding: 0,
        _decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.',
        _thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',',

        roundPrice: function(price) {
            var roundedPrice = GeckoJS.NumberHelper.round(Math.abs(price), this._precision, this._rounding);
            if (price < 0) roundedPrice = 0 - roundedPrice;

            return roundedPrice;
        },

        formatPrice: function(price) {
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

            this._originalPayments = GeckoJS.Array.objectExtract(data.payments, '{s}') || [];
            
            var seq = 1;
            this._originalPayments.forEach(function(p) {
                p.seq = seq++;
                p.amount = p.amount - p.change;
                p.display_amount = this.formatPrice(p.amount);
                p.display_origin_amount = this.formatPrice(p.origin_amount);
            }, this);

            this._paidTotal = data.paidTotal;

            document.getElementById('orderSeq').value = '[' + data.sequence + ']';

            document.getElementById('paymentscrollablepanel').datasource = this._originalPayments;
            document.getElementById('paidTotal').value = this.formatPrice(this._paidTotal);
            
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            document.getElementById('refund_amount').textbox.value = this.formatPrice(this.roundPrice(this._paidTotal));
            document.getElementById('refund_amount').textbox.select();

        },

        save: function(data) {
            data.refunds = this._refundPayments;
            data.refundTotal = this._refundTotal;
        },
        
        clonePayments: function() {
            var payments = [];
            var self = this;
            this._originalPayments.forEach(function(p) {
                var newPayment = GREUtils.extend({}, p);
                newPayment.amount = self.roundPrice(newPayment.amount);
                newPayment.display_amount = self.formatPrice(newPayment.amount);
                payments.push(newPayment);
            });

            this._refundPayments = payments;
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            this._refundTotal = this._paidTotal;
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

        selectRefundPayment: function(index) {
            document.getElementById('btnMinus').setAttribute('disabled', index == -1);
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
