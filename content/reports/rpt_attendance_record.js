(function(){
    include('chrome://viviecr/content/models/user.js');
    include('chrome://viviecr/content/models/clockstamp.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_attendance_record_controller.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'RptAttendanceRecord');

    };

    window.addEventListener('load', startup, false);

})();
