(function(){
    GeckoJS.include('chrome://viviecr/content/models/job.js');

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/jobs_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $("#simpleListBoxJob").bind('select', function(evt) {
            $do('select', evt, 'Jobs');
        });
        $do('load', null, 'Jobs');


    };

    window.addEventListener('load', startup, false);

})();


