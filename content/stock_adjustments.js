(function(){

    // include controllers  and register itself

    // GeckoJS.include( 'chrome://viviecr/content/controllers/stock_adjustments_controller.js' );

    /**
     * Controller Startup
     */
    function startup() {
        //$( '#clearBtn' )[ 0 ].addEventListener( 'command', clearTextBox, false );
        $( '#plu' ).focus();

        $do( 'load', null, 'StockAdjustments' );
    };

    /**
     * Clear  box
     */
    function clearTextBox() {
        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';
    };

    window.addEventListener( 'load', startup, false );
})();
