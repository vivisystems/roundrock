(function(){

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $do('load', window.arguments[0], 'PackageBuilder');

    };

    window.addEventListener('load', startup, false);

})();


