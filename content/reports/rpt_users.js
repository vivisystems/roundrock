(function(){
    
    include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_users_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptUsers');

    };

    window.addEventListener('load', startup, false);

})();


