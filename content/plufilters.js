(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/plufilter_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Plufilters');

    };

    window.addEventListener('load', startup, false);

})();


