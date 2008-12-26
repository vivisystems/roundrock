(function(){
    include('chrome://viviecr/content/models/order_payment.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/cash_by_clerks_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'CashByClerks');

    };

    window.addEventListener('load', startup, false);

})();


