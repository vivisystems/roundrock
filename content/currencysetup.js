(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/currencysetup_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);

        $do('load', null, 'CurrencySetup');

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


