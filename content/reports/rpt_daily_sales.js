(function(){
    include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_item.js');
    include('chrome://viviecr/content/models/order_addition.js');
    include('chrome://viviecr/content/models/order_payment.js');
    include('chrome://viviecr/content/models/order_object.js');
    include('chrome://viviecr/content/models/order_receipt.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_daily_sales_controller.js');
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'RptDailySales');

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


