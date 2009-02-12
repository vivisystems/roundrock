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

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'RptAttendanceRecord');

    };

    function toggleSize() {
        var splitter = document.getElementById('splitter_zoom');
        if (splitter.getAttribute("state") == "collapsed") {
            splitter.setAttribute("state", "open");
        } else {
            splitter.setAttribute("state", "collapsed");
        }
    }

    window.addEventListener('load', startup, false);

})();


