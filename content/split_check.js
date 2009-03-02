(function(){
    include('chrome://viviecr/content/models/product.js');
    include('chrome://viviecr/content/models/plugroup.js');
    include('chrome://viviecr/content/models/sequence.js');
    include('chrome://viviecr/content/models/transaction.js');

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


