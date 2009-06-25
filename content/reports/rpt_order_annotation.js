(function(){
    include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_item.js');
    include('chrome://viviecr/content/models/order_annotation.js');

    // include controllers  and register itself
    include('chrome://viviecr/content/reports/controllers/rpt_order_annotation_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptOrderAnnotation');

    };

    window.addEventListener('load', startup, false);

})();


