var options;

(function(){
    var inputObj = window.arguments[0];
    var shiftChangeDetails = inputObj.shiftChangeDetails;
    var balance = inputObj.balance;
    var giftcardExcess = inputObj.giftcardExcess;
    var salesRevenue = inputObj.salesRevenue;
    var ledgerInTotal = inputObj.ledgerInTotal;
    var ledgerOutTotal = inputObj.ledgerOutTotal;
    var cashNet = inputObj.cashNet;
    var canEndSalePeriod = inputObj.canEndSalePeriod;

    options = inputObj;

    /**
     * Controller Startup
     */
    function startup() {
        // set ledger entry types
        window.viewDetailHelper = new GeckoJS.NSITreeViewArray(shiftChangeDetails);
        window.viewDetailHelper.getCellValue= function(row, col) {
            
            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            var text;
            if (col.id == "type") {
                text = _(this.data[row].type);
            }
            else if (col.id == "amount" || col.id == 'excess_amount' || col.id == 'change') {

                var amt = this.data[row][col.id];
                try {
                    if (amt == null || amt == '' || parseFloat(this.data[row][col.id]) == 0) {
                        return '';
                    }
                }
                catch (e) {}
                // text = this.data[row].amount;
                text = GeckoJS.NumberHelper.round(this.data[row][col.id], precision_prices, rounding_prices) || 0;
                text = GeckoJS.NumberHelper.format(text, {places: precision_prices});
            } else {
                text = this.data[row][col.id];
            }
            return text;
        };
        
        document.getElementById('shiftscrollablepanel').datasource = window.viewDetailHelper ;
        document.getElementById('cash').value = cashNet;
        document.getElementById('balance').value = balance;
        document.getElementById('sales').value = salesRevenue;
        document.getElementById('ledger_in').value = ledgerInTotal;
        document.getElementById('ledger_out').value = ledgerOutTotal;
        document.getElementById('excess').value = giftcardExcess;
        
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearTextBox, false);
        document.getElementById('amount').select();
        
        document.getElementById('close').disabled = !canEndSalePeriod;
        
        doSetOKCancel(

            function(){

                inputObj.description = document.getElementById('description').value;
                // inputObj.type = document.getElementById('type').value;
                inputObj.type = 'IN';
                inputObj.amount = parseFloat(document.getElementById('amount').value);

                // if (!isNaN(inputObj.amount) && (index >= 0)) {
                if (!isNaN(inputObj.amount)) {
                    inputObj.ok = true;
                    return true;
                } else if (isNaN(inputObj.amount)) {
                    inputObj.amount = 0;
                    inputObj.topic = '';
                    inputObj.ok = true;
                    return true;
                } else {
                    NotifyUtils.warn(_('data incomplete!'));
                }
            },

            function(){
                inputObj.ok = false;
                return true;
            }
            );

    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    };

    
    window.addEventListener('load', startup, false);

})();

function confirmEndSalePeriod() {
    var amount = parseFloat(document.getElementById('amount').value);
    if (!isNaN(amount) && amount != 0) {
        GREUtils.Dialog.alert(window, _('confirm end sale period'), _('Change may not be left in the drawer at the end of sale period'));
        return false;
    }
    else {
        if (GREUtils.Dialog.confirm(window, _('confirm end sale period'), _('Please confirm end of sale period'))) {
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
    var amount = parseFloat(document.getElementById('amount').value);
    if (!isNaN(amount) && amount < 0) {
        GREUtils.Dialog.alert(window, _('confirm shift change'), _('Drawer change may not be negative'));
        return false;
    }
    else {
        options.end = false;
        if (GREUtils.Dialog.confirm(window, _('confirm shift change'), _('Please confirm shift change'))) {
            return true;
        }
        else {
            return false;
        }
    }
}

function validateInput() {
    var okButton = document.getElementById('ok');
    var amount = GeckoJS.String.trim(document.getElementById('amount').value);

    okButton.setAttribute('disabled', amount == '' || isNaN(amount) || amount > options.cashNet);
}
