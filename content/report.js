(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');
    GeckoJS.include('chrome://viviecr/content/models/order.js');
    GeckoJS.include('chrome://viviecr/content/models/order_detail.js');


    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/report_orders_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $("#simpleListBoxReport1")[0].addEventListener('select', function(evt) {
            $do('select', evt, 'ReportOrders');
        }, false);

        $do('load', null, 'ReportOrders');

        $("#simpleListBoxReport1")[0].selectedIndex = 0;
        // $("#simpleListBoxReport1detail")[0].selectedIndex = 0;

        $("#simpleListBoxReport2")[0].selectedIndex = 0;
        $("#simpleListBoxReport3")[0].selectedIndex = 0;

    };

    window.addEventListener('load', startup, false);

})();


