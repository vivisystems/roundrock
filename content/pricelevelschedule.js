(function(){

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/pricelevelschedule_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'PriceLevelSchedule');

    };

    window.addEventListener('load', startup, false);

})();


