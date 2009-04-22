(function(){
    include('chrome://viviecr/content/models/shift_change.js');
    include('chrome://viviecr/content/models/shift_change_detail.js');

    // include controllers  and register itself
    include('chrome://viviecr/content/reports/controllers/rpt_cash_by_clerk_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {
		var processedTpl = window.arguments[ 0 ];
		var parameters = window.arguments[ 1 ];
		
		var bw = document.getElementById( 'preview_frame' );
        var doc = bw.contentWindow.document.getElementById( 'abody' );
        doc.innerHTML = processedTpl;
        
        $do( 'set_reportRecords', parameters, 'RptCashByClerk' );
    };

    window.addEventListener('load', startup, false);

})();