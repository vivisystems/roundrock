(function(){

    // include models
    include('chrome://viviecr/content/models/table.js');
    include('chrome://viviecr/content/models/table_region.js');
    include('chrome://viviecr/content/models/table_booking.js');
    include('chrome://viviecr/content/models/table_statuse.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/table_man_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'TableMan');

    };

    window.addEventListener('load', startup, false);

})();


