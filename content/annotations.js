(function(){

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $do('loadCodes', null, 'Annotations');

    };

    window.addEventListener('load', startup, false);

})();


