(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/currencysetup_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
       
        $do('load', null, 'CurrencySetup');

        doSetOKCancel(
            function(){
                $do('save', null, 'CurrencySetup');
                return true;
            },
            function(){
                return true;
            }
            );

        $('#currency_exchange_1').focus();

        calCurrency(0, 1, 1);
    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        var focused = document.commandDispatcher.focusedElement;
        focused.value = '';

    };

    window.addEventListener('load', startup, false);

})();

/**
 * Clear Calculate Fields
 */
function clearField(no) {
    var i;
    var currency_input_id;
    var currency_result_id;
    for (i=1; i <= 5; i++ ) {
        currency_input_id = 'currency_input_' + i;
        currency_result_id = 'currency_result_' + i;

        if (i != no) {
            document.getElementById(currency_input_id).value = '';
            document.getElementById(currency_result_id).value = '';
        }
    }

}

/**
 * Convert Currency
 */
function calCurrency(no, input_id, result_id) {
    clearField(no);

    var exchange_id = 'currency_exchange_' + no;
    var input_id = 'currency_input_' + no;
    var result_id = 'currency_result_' + no;
    var exchange = document.getElementById(exchange_id).value;
    var input = document.getElementById(input_id).value;
    var precision = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 2;

    var result = GeckoJS.NumberHelper.format(exchange * input, {places: precision});
    document.getElementById(result_id).value = result;
}

