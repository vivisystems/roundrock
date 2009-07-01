( function() {
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/order_addition.js' );
    include( 'chrome://viviecr/content/models/order_payment.js' );
    include( 'chrome://viviecr/content/models/order_object.js' );
    include( 'chrome://viviecr/content/models/order_receipt.js' );
    include( 'chrome://viviecr/content/models/category.js' );
    include( 'chrome://viviecr/content/controllers/components/tax.js' );
    include( 'chrome://viviecr/content/models/order_promotion.js' );
    include( 'chrome://viviecr/content/models/promotion.js' );
    include( 'chrome://viviecr/content/models/product.js' );

    // include controllers  and register itself
	include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/rpt_sales_summary_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );

    /**
     * Controller Startup
     */
    function startup() {

        $do( 'load', null, 'RptSalesSummary' );

    };

    window.addEventListener( 'load', startup, false );

} )();
