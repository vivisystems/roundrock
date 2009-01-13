(function(){

    // include controller

    GeckoJS.include('chrome://viviecr/content/controllers/devices_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('initial', null, 'Devices');
        $do('load', null, 'Devices');

        doSetOKCancel(
            function(){
                $do('save', null, 'Devices');
                return true;
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();
