(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'LedgerRecords');
        $do('load', null, 'LedgerEntryTypes');

    };

    window.addEventListener('load', startup, false);

})();

function clearFocusedElement() {
    var focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input') focused.value = '';
}

