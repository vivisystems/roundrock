( function() {
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/order_item_tax.js' );
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

        var parameters = window.arguments[ 0 ];

        if (parameters && parameters.setparms) {
            $do( 'setConditionsAnd_reportRecords', parameters, 'RptSalesSummary' );
            $do( '_setTemplateDataHead', null, 'RptSalesSummary' );
            $do( '_setTemplateDataFoot', null, 'RptSalesSummary' );
            $do( '_exploit_reportRecords', null, 'RptSalesSummary' );
            $do( 'toggleSize', null, 'RptSalesSummary' );
        }
        else {
             $do( 'load', null, 'RptSalesSummary' );
        }
    };

    window.addEventListener( 'load', startup, false );

} )();
