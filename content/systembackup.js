(function(){

    // include controllers  and register itself

    include('chrome://viviecr/content/fecposutils.js');
    include('chrome://viviecr/content/controllers/systembackup_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'SystemBackup');

    };

    window.addEventListener('load', startup, false);

})();

