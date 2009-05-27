(function(){
    include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_item.js');
    include('chrome://viviecr/content/models/order_addition.js');
    include('chrome://viviecr/content/models/order_payment.js');
    include('chrome://viviecr/content/models/order_object.js');
    include('chrome://viviecr/content/models/order_receipt.js');
    include('chrome://customers/content/models/customer.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_detailed_customer_transaction_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'RptDetailedCustomerTransaction');

    };

    function toggleSize() {
        var splitter = document.getElementById('splitter_zoom');
        if (splitter.getAttribute("state") == "collapsed") {
            splitter.setAttribute("state", "open");
        } else {
            splitter.setAttribute("state", "collapsed");
        }
    }

    window.addEventListener('load', startup, false);

})();
