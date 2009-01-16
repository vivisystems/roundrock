(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/storecontact_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        $do('load', null, 'StoreContact');

        doSetOKCancel(
            function(){
                $do('save', null, 'StoreContact');
                return true;
            },
            function(){
                return true;
            }
            );

        document.getElementById('store').focus();
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

