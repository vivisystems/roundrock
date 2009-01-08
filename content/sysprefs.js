(function(){
   
    // include controllers  and register itself
    include('chrome://viviecr/content/controllers/plufilters_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        GeckoJS.Configure.loadPreferences('vivipos.fec.settings');
        var rt = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        var rp = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        var defaultUser = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
        var defaultTaxStatus = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');

        var rpNode = document.getElementById('roundingprices');
        if (rpNode) rpNode.value = rp;
        
        var rtNode = document.getElementById('roundingtaxes');
        if (rtNode) rtNode.value = rt;
        
        $do('initUser', defaultUser, 'Users');
        $do('initTaxStatus', defaultTaxStatus, 'Taxes');

        $do('load', null, 'Plufilters');

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
        document.getElementById('prefwin').width=width;
        document.getElementById('prefwin').height=height;
    };
    

    window.addEventListener('load', startup, false);

})();

function closePreferences() {
    opener.opener.$do('resetLayout', null, 'Main');
    $do('setDefaultUser', null, 'Users');
    $do('setDefaultTaxStatus', null, 'Taxes');
}
