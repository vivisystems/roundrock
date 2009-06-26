(function(){
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/promotion.js' );
    include( 'chrome://viviecr/content/models/order_promotion.js' );

    // include controllers  and register itself

    include( 'chrome://viviecr/content/reports/controllers/rpt_promotion_summary_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );

    /**
     * Controller Startup
     */
    function startup() {

        $do( 'load', null, 'RptPromotionSummary' );

    };

    window.addEventListener( 'load', startup, false );
})();


