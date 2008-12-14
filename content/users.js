(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/users_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Users');

    };

    window.addEventListener('load', startup, false);

})();


