    var options;

(function(){
    var caption0 = window.arguments[0];
    var text0 = window.arguments[1];
    var title0  = window.arguments[2];
    var title1  = window.arguments[3];
    var inputObj = window.arguments[4];

    /**
     *  Startup
     */
    function startup() {

        document.getElementById('dialog-caption').setAttribute("label", title0);
        document.getElementById('payment_label').value = _('Payment in %S',[title0])
        document.getElementById('amount_label').value = _('Converted Amount in %S',[title0])
        document.getElementById('origin_amount').value = inputObj.origin_amount;
        document.getElementById('amount').value = inputObj.amount;
        document.getElementById('payment').value=inputObj.amount;
        document.getElementById('payment').select();
        doSetOKCancel(
            function(){
                inputObj.input0 = document.getElementById('payment').value;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );
        validateInput() ;
    };

    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    };

    window.addEventListener('load', startup, false);

    // make inputObj globally available
    options = inputObj;
})();


function clearFocusedElement(target) {
    var focused;
    if (target) {
        focused = document.getElementById(target);
    }
    if (!focused) focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'textbox') focused.value = '';
}

function validateInput() {

    var input0 = document.getElementById('payment').value || '';
    var trimmed0 = GeckoJS.String.trim(input0);
    var validated = false;
    if (trimmed0.length > 0) 
        validated = true;
    
    validated = validated && trimmed0.replace(/[0-9.]*/, '').length == 0;

    document.getElementById('ok').setAttribute('disabled', !validated);
}