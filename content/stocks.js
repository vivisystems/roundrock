(function(){

    // include controllers  and register itself

    // GeckoJS.include('chrome://viviecr/content/controllers/stocks_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        // $('#ekeyBtn')[0].addEventListener('command', searchPlu, true);
        $('#plu').focus();
        
        $do('load', null, 'Stocks');

    };

    /**
     * Clear  box
     */
    function clearTextBox() {

//        $('#plu').val('');
        var focused = document.commandDispatcher.focusedElement;
        focused.value = '';

    };

    window.addEventListener('load', startup, false);

})();


