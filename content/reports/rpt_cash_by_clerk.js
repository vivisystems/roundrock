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

        var parameters = window.arguments[ 0 ];

        if (parameters && parameters.setparms) {
            $do( 'set_reportRecords', parameters, 'RptCashByClerk' );
            $do( '_setTemplateDataHead', null, 'RptCashByClerk' );
            $do( '_setTemplateDataFoot', null, 'RptCashByClerk' );
            $do( '_set_queryForm', null, 'RptCashByClerk' );
            $do( '_exploit_reportRecords', null, 'RptCashByClerk' );
            $do( 'toggleSize', null, 'RptCashByClerk' );
        }
        else {
            $do('load', null, 'RptCashByClerk');
        }

    };

    window.addEventListener('load', startup, false);

})();


