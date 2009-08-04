(function(){

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/components/barcode.js');
    GeckoJS.include('chrome://viviecr/content/controllers/nonplu_setting_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        
        $do('load', null, 'NonpluSetting');

    };

    window.addEventListener('load', startup, false);

})();
