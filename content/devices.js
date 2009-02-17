(function(){

    // include controller

    GeckoJS.include('chrome://viviecr/content/controllers/devices_controller.js');
    GeckoJS.include('chrome://viviecr/content/models/plugroup.js');
    GeckoJS.include('chrome://viviecr/content/helpers/nsi_plugroups_view.js');


    /**
     * Controller Startup
     */
    function startup() {

        $do('initial', false, 'Devices');
        $do('load', null, 'Devices');

        doSetOKCancel(
            function(){
                var data = {cancel: false};
                $do('save', data, 'Devices');
                return !data.cancel;
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();
