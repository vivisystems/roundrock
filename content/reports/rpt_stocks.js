( function() {
    include('chrome://viviecr/content/models/category.js');
    include('chrome://viviecr/content/models/product.js');
    include('chrome://viviecr/content/models/stock_record.js');
    include('chrome://viviecr/content/models/plugroup.js');

    // include controllers  and register itself
    include('chrome://viviecr/content/reports/controllers/rpt_stocks_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptStocks');

    };

    window.addEventListener('load', startup, false);

} )();


