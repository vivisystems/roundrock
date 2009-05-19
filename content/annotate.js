(function(){

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        doSetOKCancel(
            function(){
                return true;
            },
            function(){
                return true;
            }
            );

        // store order id in form
        document.getElementById('order_id').value = window.arguments[0].order_id;
        document.getElementById('sequence').value = '[' + window.arguments[0].sequence + ']';
        $do('loadViews', window.arguments[0].codes, 'Annotations');
    };

    window.addEventListener('load', startup, false);

})();


