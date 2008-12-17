(function(){

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/pricelevelschedule_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
//        $("#simpleListBoxSchedule")[0].addEventListener('select', function(evt) {
//            $do('select', evt, 'PriceLevelSchedule');
//        }, false);

        $do('load', null, 'PriceLevelSchedule');

    };

    window.addEventListener('load', startup, false);

})();


