(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/import_export_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'ImportExport');

    };

    window.addEventListener('load', startup, false);

})();


