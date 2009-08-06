(function() {
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/order_addition.js' );
    include( 'chrome://viviecr/content/controllers/components/tax.js' );

    // include controllers  and register itself

    include( 'chrome://viviecr/content/reports/controllers/rpt_detailed_tax_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );

    /**
     * Controller Startup
     */
    function startup() {

        $do( 'load', null, 'RptDetailedTax' );

    };

    window.addEventListener( 'load', startup, false );

} )();