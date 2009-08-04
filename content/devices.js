(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('initial', false, 'Devices');
        $do('load', null, 'Devices');

    };
    
    window.addEventListener('load', startup, false);

})();
