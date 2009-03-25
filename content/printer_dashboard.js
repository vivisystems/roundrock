(function(){

    /**
     * Controller Startup
     */
    function startup() {

    var devices = window.arguments[0];

        $do('load', devices, 'PrinterDashboard');

    };

    window.addEventListener('load', startup, false);

})();


