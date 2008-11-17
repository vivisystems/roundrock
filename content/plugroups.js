(function(){
    GeckoJS.include('chrome://viviecr/content/models/plugroup.js');

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/plugroups_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $("#simpleListBoxGroup").bind('select', function(evt) {
            $do('select', evt, 'Plugroups');
        });
        $do('load', null, 'Plugroups');


    };

    window.addEventListener('load', startup, false);

})();


