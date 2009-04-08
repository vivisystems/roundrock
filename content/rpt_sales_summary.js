( function() {
    include( 'chrome://viviecr/content/models/order.js' );
    include( 'chrome://viviecr/content/models/order_item.js' );
    include( 'chrome://viviecr/content/models/order_addition.js' );
    include( 'chrome://viviecr/content/models/order_payment.js' );
    include( 'chrome://viviecr/content/models/order_object.js' );
    include( 'chrome://viviecr/content/models/order_receipt.js' );
    include( 'chrome://viviecr/content/models/category.js' );
    include( 'chrome://viviecr/content/controllers/components/tax.js' );

    // include controllers  and register itself

    include( 'chrome://viviecr/content/reports/controllers/rpt_sales_summary_controller.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/browser_print.js' );
    include( 'chrome://viviecr/content/reports/controllers/components/csv_export.js' );

    /**
     * Controller Startup
     */
    function startup() {
		var processedTpl = window.arguments[ 0 ];
		var parameters = window.arguments[ 1 ];
		var printController = window.arguments[ 2 ];

        var bw = document.getElementById( 'preview_frame' );
        var doc = bw.contentWindow.document.getElementById( 'abody' );
        doc.innerHTML = processedTpl;
        
        $do('setConditionsAnd_datas', parameters, 'RptSalesSummary');
        $do('set_printController', printController, 'RptSalesSummary');
    };

    window.addEventListener( 'load', startup, false );

} )();
