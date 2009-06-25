(function(){
    include('chrome://viviecr/content/models/cashdrawer_record.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_cash_drawer_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptCashDrawer');

    };

    window.addEventListener('load', startup, false);

})();


