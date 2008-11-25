(function(){
   
    // include controllers  and register itself
    // GeckoJS.include('chrome://viviecr/content/controllers/sysprefs_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        GeckoJS.Configure.loadPreferences('vivipos.fec.settings');
        var rt = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        var rp = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        var defaultUser = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');

        var rpNode = document.getElementById('roundingprices');
        if (rpNode) rpNode.value = rp;
        
        var rtNode = document.getElementById('roundingtaxes');
        if (rtNode) rtNode.value = rt;
        
        $do('initUser', defaultUser, 'Users');

    };
    

    window.addEventListener('load', startup, false);

})();


