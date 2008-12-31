(function(){
    // GeckoJS.include('chrome://viviecr/content/models/job.js');

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/accounts_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Accounts');

    };

    window.addEventListener('load', startup, false);

})();


