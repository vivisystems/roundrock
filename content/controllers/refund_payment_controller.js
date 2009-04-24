(function(){

    /**
     * Print Controller
     */

    var __controller__ = {

        name: 'RefundPayment',

        _originalPayments: [],

        _refundPayments: [],

        _refundTotal: 0,

        _paidTotal: 0,

        load: function(data) {
            this._originalPayments = GeckoJS.Array.objectExtract(data.payments, '{s}');
            var seq = 1;
            this._originalPayments.forEach(function(p) {
                p.seq = seq++;
            });
            document.getElementById('paymentscrollablepanel').datasource = this._originalPayments;
            document.getElementById('paidTotal').value = this._paidTotal = data.paidTotal;
            
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            document.getElementById('amount').textbox.value = this._paidTotal;
            document.getElementById('amount').textbox.focus();

        },

        save: function(data) {
            data.refunds = this._refundPayments;
            data.refundTotal = this._refundTotal;
        },
        
        clonePayments: function() {
            var payments = [];
            this._originalPayments.forEach(function(p) {
                var newPayment = GREUtils.extend({}, p);
                payments.push(newPayment);
            });

            this._refundPayments = payments;
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            this._refundTotal = this._paidTotal;
            document.getElementById('refundTotal').value = this._refundTotal;
        },

        clearRefundPayments: function() {
            this._refundPayments = [];
            document.getElementById('refundscrollablepanel').datasource = this._refundPayments;

            this._refundTotal = 0;
            document.getElementById('refundTotal').value = '';
        },

        addRefundPayment: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('refundForm');
            var amount = parseInt(inputObj.amount);
            var refundList = document.getElementById('refundscrollablepanel');

            if (isNaN(amount) || amount == 0) {
                NotifyUtils.warn(_('Refund payment amount must be positive'));
            }
            else {
                var newRefundPayment = {
                    seq: this._refundPayments.length + 1,
                    name: inputObj.type,
                    amount: amount,
                    memo1: inputObj.memo1,
                    memo2: inputObj.memo2
                };
                this._refundPayments.push(newRefundPayment);
                refundList.treeBoxObject.rowCountChanged(this._refundPayments.length - 1, 1);
                refundList.treeBoxObject.ensureRowIsVisible(this._refundPayments.length - 1);

                refundList.selection.select(this._refundPayments.length - 1);

                this._refundTotal += amount;

                document.getElementById('refundTotal').value = this._refundTotal;
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
                
                document.getElementById('refundTotal').value = this._refundTotal;
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
