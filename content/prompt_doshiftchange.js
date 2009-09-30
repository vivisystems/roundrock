var options;

(function(){
    var inputObj = window.arguments[0];
    var shiftChangeDetails = inputObj.shiftChangeDetails;
    var balance = inputObj.balance;
    var giftcardExcess = inputObj.giftcardExcess;
    var salesRevenue = inputObj.salesRevenue;
    var deposit = inputObj.deposit;
    var refund = inputObj.refund;
    var credit = inputObj.credit;
    var ledgerInTotal = inputObj.ledgerInTotal;
    var ledgerOutTotal = inputObj.ledgerOutTotal;
    var cashNet = inputObj.cashNet;
    var canEndSalePeriod = inputObj.canEndSalePeriod;
    var defaultChangeInDrawer = inputObj.defaultChangeInDrawer;

    options = inputObj;

    /**
     * Controller Startup
     */
    function startup() {
        // set ledger entry types
        var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
        
        window.viewDetailHelper = new GeckoJS.NSITreeViewArray(shiftChangeDetails);
        window.viewDetailHelper.getCellValue= function(row, col) {
            
            var text;
            if (col.id == "type") {
                text = _(this.data[row].type);
            }
            else if (col.id == "amount" || col.id == 'excess_amount' || col.id == 'change') {

                var amt = this.data[row][col.id];
                if (col.id != "amount") {
                    try {
                        if (amt == null || amt == '' || parseFloat(this.data[row][col.id]) == 0) {
                            return '';
                        }
                    }
                    catch (e) {}
                }
                // text = this.data[row].amount;
                text = GeckoJS.NumberHelper.round(this.data[row][col.id], precision_prices, rounding_prices) || 0;
                text = GeckoJS.NumberHelper.format(text, {places: precision_prices});
            } else {
                text = this.data[row][col.id];
            }
            return text;
        };
        
        document.getElementById('shiftscrollablepanel').datasource = window.viewDetailHelper ;
        document.getElementById('cash').value = cashNet.toFixed(precision_prices);
        document.getElementById('balance').value = balance.toFixed(precision_prices);
        document.getElementById('sales').value = salesRevenue.toFixed(precision_prices);
        document.getElementById('deposit').value = deposit.toFixed(precision_prices);
        document.getElementById('refund').value = refund.toFixed(precision_prices);
        document.getElementById('credit').value = credit.toFixed(precision_prices);
        document.getElementById('ledger_in').value = ledgerInTotal.toFixed(precision_prices);
        document.getElementById('ledger_out').value = ledgerOutTotal.toFixed(precision_prices);
        document.getElementById('excess').value = giftcardExcess.toFixed(precision_prices);
        
        document.getElementById('cancel').setAttribute('disabled', false);

        if (defaultChangeInDrawer != null && !isNaN(defaultChangeInDrawer))
            document.getElementById('drawer_amount').value = parseFloat(defaultChangeInDrawer);

        document.getElementById('drawer_amount').textbox.select();

        document.getElementById('close').disabled = !canEndSalePeriod;

        doSetOKCancel(

            function(){
                inputObj.description = document.getElementById('description').value;
                // inputObj.type = document.getElementById('type').value;
                inputObj.type = 'IN';
                inputObj.amount = parseFloat(document.getElementById('drawer_amount').value);

                if (!isNaN(inputObj.amount)) {
                    inputObj.ok = true;
                    return true;
                } else if (isNaN(inputObj.amount)) {
                    inputObj.amount = 0;
                    inputObj.topic = '';
                    inputObj.ok = true;
                    return true;
                }
            },

            function(){
                inputObj.ok = false;
                return true;
            }
        );

    };

    window.addEventListener('load', startup, false);

})();

function confirmEndSalePeriod() {
    var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);
    var amount = parseFloat(document.getElementById('drawer_amount').value);
    var allowChangeWhenEndPeriod = options.allowChangeWhenEndPeriod;

    // first check for transaction in cart
    if (options.transactionOpen) {
        GREUtils.Dialog.alert(this.topmostWindow,
            _('Shift Change'),
            _('You may not end the current sale period while there are registered items in the cart'));
        return;
    }

    // next check for stored orders
    if (options.storedOrderCount > 0) {
        if (options.closePeriodPolicy == 'alert') {
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Shift Change'),
                _('Alert! one or more orders are still open'));
        }
        else if (options.closePeriodPolicy == 'force') {
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Shift Change'),
                _('You may not end the current sale period while orders are still open'));
            return;
        }
    }

    if (!isNaN(amount) && amount != 0 && !allowChangeWhenEndPeriod) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Change may not be left in the drawer at the end of sale period'));
        return false;
    }
    else if (!isNaN(amount) && amount < 0) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Drawer change may not be negative'));
        return false;
    }
    else if (options.cashNet < amount) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Drawer change may not exceed available cash'));
        return false;
    }
    else {
        if (GREUtils.Dialog.confirm(topwin, _('confirm end sale period'), _('Please confirm end of sale period'))) {
            options.end = true;
            return true;
        }
        else {
            options.end = false;
            return false;
        }
    }
}

function confirmEndShift() {
    var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);
    var amount = parseFloat(document.getElementById('drawer_amount').value);

    // first check for transaction in cart
    if (options.transactionOpen) {
        GREUtils.Dialog.alert(this.topmostWindow,
            _('Shift Change'),
            _('You may not end the current shift while there are registered items in the cart'));
        return;
    }

    // next check for stored orders
    if (options.storedOrderCount > 0) {
        if (options.shiftChangePolicy == 'alert') {
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Shift Change'),
                _('Alert! one or more orders are still open'));
        }
        else if (options.shiftChangePolicy == 'force') {
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Shift Change'),
                _('You may not close the current shift while orders are still open'));
            return false;
        }
    }

    if (!isNaN(amount) && amount < 0) {
        GREUtils.Dialog.alert(topwin, _('confirm shift change'), _('Drawer change may not be negative'));
        return false;
    }
    else if (options.cashNet < amount) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Drawer change may not exceed available cash'));
        return false;
    }
    else {
        options.end = false;
        if (GREUtils.Dialog.confirm(topwin, _('confirm shift change'), _('Please confirm shift change'))) {
            return true;
        }
        else {
            return false;
        }
    }
}
