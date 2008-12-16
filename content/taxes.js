(function(){

/**
 * Controller Startup
 */
    function startup() {
        $do('createAddonTaxList', null, 'Taxes');

        $do('load', null, 'Taxes');

    };

    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    };

    window.addEventListener('load', startup, false);


})();


