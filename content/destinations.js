(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/destination_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', true, 'Destinations');

    };

    window.addEventListener('load', startup, false);

})();


