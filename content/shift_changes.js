(function(){
    include('chrome://viviecr/content/models/shift_change.js');
    include('chrome://viviecr/content/models/shift_change_detail.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/shift_changes_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'ShiftChanges');

    };

    window.addEventListener('load', startup, false);

})();


