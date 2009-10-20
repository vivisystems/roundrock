var options;

(function(){
    var inputObj = window.arguments[0];
    var canEndSalePeriod = inputObj.canEndSalePeriod;
    var defaultChangeInDrawer = inputObj.defaultChangeInDrawer;

    options = inputObj;

    /**
     * Controller Startup
     */
    function startup() {
        document.getElementById('cancel').setAttribute('disabled', false);

        if (defaultChangeInDrawer != null && !isNaN(defaultChangeInDrawer))
            document.getElementById('drawer_amount').value = parseFloat(defaultChangeInDrawer);

        document.getElementById('reportedcash').textbox.select();

        document.getElementById('close').disabled = !canEndSalePeriod;

        doSetOKCancel(

            function(){
                inputObj.description = document.getElementById('description').value;
                // inputObj.type = document.getElementById('type').value;
                inputObj.type = 'IN';
                inputObj.amount = parseFloat(document.getElementById('drawer_amount').value);
                
                inputObj.reportedCash = parseFloat(document.getElementById('reportedcash').value);

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
    var reportedcash = parseFloat(document.getElementById('reportedcash').value);
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
                _('Please note that one or more orders are still open'));
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
    else if (reportedcash < amount) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Drawer change may not exceed declared cash'));
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
    var reportedcash = parseFloat(document.getElementById('reportedcash').value);
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
                _('Please note one or more orders are still open'));
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
    else if (reportedcash < amount) {
        GREUtils.Dialog.alert(topwin, _('confirm end sale period'), _('Drawer change may not exceed declared cash'));
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
