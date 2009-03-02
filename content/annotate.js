(function(){

    include('chrome://viviecr/content/models/order_annotation.js');

    // include controllers  and register itself
    include('chrome://viviecr/content/controllers/annotation_controller.js');

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
        $do('loadViews', window.arguments[0].codes, 'Annotations');
    };

    window.addEventListener('load', startup, false);

})();


