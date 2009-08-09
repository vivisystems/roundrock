( function(){
    var inputObj = window.arguments[0];

    /**
     * Controller Startup
     */
    function startup() {

        $( '#plu' ).focus();

        function loadData() {
            $do( 'load', inputObj, 'StockRecords' );
        }
        setTimeout(loadData, 100 );

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
