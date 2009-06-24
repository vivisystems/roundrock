(function(){

    // include controllers  and register itself

    // GeckoJS.include( 'chrome://viviecr/content/controllers/stock_records_controller.js' );

    /**
     * Controller Startup
     */
    function startup() {
        //$( '#clearBtn' )[ 0 ].addEventListener( 'command', clearTextBox, false );
        $( '#plu' ).focus();

        $do( 'load', null, 'StockRecords' );
    };

    /**
     * Clear  box
     */
    function clearTextBox() {
        // $( '#plu' ).val( '' ).focus();
        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';
    };

    window.addEventListener( 'load', startup, false );
})();