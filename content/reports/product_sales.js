(function(){
    // include('chrome://viviecr/content/models/order.js');
    include('chrome://viviecr/content/models/order_item.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/product_sales_controller.js');
    include('chrome://viviecr/content/reports/template.js');

    // include('chrome://viviecr/content/seethrough_js/seethrough.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'ProductSales');

    };

    window.addEventListener('load', startup, false);

})();


