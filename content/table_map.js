(function(){

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/table_map_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'TableMap');

    };

    window.addEventListener('load', startup, false);

})();


