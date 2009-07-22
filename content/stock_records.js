( function(){
    /**
     * Controller Startup
     */
    function startup() {
        $( '#plu' ).focus();

        var data = {cancel: false};
        $do( 'load', data, 'StockRecords' );

        doSetOKCancel(
            function(){
                var data = {cancel: false};
                $do('exitCheck', data, 'StockRecords');

                return !data.cancel;
            },
            function(){
                return true;
            }
        );

        if (data.cancel) doCancelButton();
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
