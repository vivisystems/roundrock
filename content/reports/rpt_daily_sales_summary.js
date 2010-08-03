(function(){
    include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_item.js');
    include('chrome://viviecr/content/models/order_addition.js');
    include('chrome://viviecr/content/models/order_payment.js');
    include('chrome://viviecr/content/models/order_object.js');
    include('chrome://viviecr/content/models/order_receipt.js');

    // include controllers  and register itself
    include('chrome://viviecr/content/reports/controllers/rpt_daily_sales_summary_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

            $do('load', null, 'RptDailySalesSummary');       
    };

    window.addEventListener('load', startup, false);

})();


