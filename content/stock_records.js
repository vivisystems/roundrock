( function(){
    /**
     * Controller Startup
     */
    function startup() {
        $( '#plu' ).focus();

        $do( 'load', null, 'StockRecords' );

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
