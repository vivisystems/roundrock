(function(){
    include('chrome://viviecr/content/models/order_payment.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/cash_by_clerks_controller.js');
    include('chrome://viviecr/content/reports/template.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'CashByClerks');

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


