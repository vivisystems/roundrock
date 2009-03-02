(function(){
    GeckoJS.include('chrome://viviecr/content/models/product.js');
    GeckoJS.include('chrome://viviecr/content/models/plugroup.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/split_check_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'SplitCheck');

    };

    window.addEventListener('load', startup, false);

})();


