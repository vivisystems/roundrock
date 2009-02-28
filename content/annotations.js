(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/annotation_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $do('loadCodes', null, 'Annotations');

    };

    window.addEventListener('load', startup, false);

})();


