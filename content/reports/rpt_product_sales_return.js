(function(){
	include( 'chrome://viviecr/content/models/category.js' );
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/product.js' );

    // include controllers  and register itself

    include( 'chrome://viviecr/content/reports/controllers/rpt_product_sales_return_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );

    /**
     * Controller Startup
     */
    function startup() {

            $do( 'load', null, 'RptProductSalesReturn' );       
    };

    window.addEventListener( 'load', startup, false );

})();


