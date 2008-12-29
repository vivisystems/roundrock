(function(){
    GeckoJS.include('chrome://viviecr/content/models/job.js');
    GeckoJS.include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/jobs_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Jobs');

    };

    window.addEventListener('load', startup, false);

})();


