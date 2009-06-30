(function(){
    include('chrome://viviecr/content/models/order.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_hourly_sales_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptHourlySales');

    };

    window.addEventListener('load', startup, false);

})();


