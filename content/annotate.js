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
        document.getElementById('sequence').value = '[' + window.arguments[0].sequence + ']';
        $do('loadViews', window.arguments[0], 'Annotations');
    };

    window.addEventListener('load', startup, false);

})();


