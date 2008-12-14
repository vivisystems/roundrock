(function(){

    // include controllers  and register itself

    // GeckoJS.include('chrome://viviecr/content/controllers/stocks_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        $('#plu').focus();
        
        $do('load', null, 'Stocks');

    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        $('#plu').val('').focus();

    };

    window.addEventListener('load', startup, false);

})();


