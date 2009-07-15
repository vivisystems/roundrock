(function(){
    include( 'chrome://viviecr/content/models/product.js' );
    include( 'chrome://viviecr/content/models/inventory_record.js' );
    include( 'chrome://viviecr/content/models/inventory_commitment.js' );

    // include controllers  and register itself
    include( 'chrome://viviecr/content/reports/controllers/rpt_purchase_history_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );

    /**
     * Controller Startup
     */
    function startup() {
        $do( 'load', null, 'RptPurchaseHistory' );
    };

    window.addEventListener( 'load', startup, false );
})();
