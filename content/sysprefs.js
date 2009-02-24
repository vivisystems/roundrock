(function(){
   
    // include controllers  and register itself
    include('chrome://viviecr/content/controllers/plufilters_controller.js');
    include('chrome://viviecr/content/controllers/destination_controller.js');

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
        $do('load', null, 'Destinations');
        //$do('load', null, 'Sound');

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
        document.getElementById('prefwin').width=width;
        document.getElementById('prefwin').height=height;
        document.getElementById('prefwin').dlgbuttons="accept,help";
    };
    

    window.addEventListener('load', startup, false);

    window.addEventListener('dialogextra1', function(){
        VirtualKeyboard.toggle();
    }, false);


})();

function closePreferences() {
    try {
        // change button height
	var main = opener.opener.GeckoJS.Controller.getInstanceByName('Main');
       	main.requestCommand('updateOptions', null, 'Main');

        $do('setDefaultUser', null, 'Users');
        $do('setDefaultTaxStatus', null, 'Taxes');
    }
    catch(e) {};
}

function setVolume(volume, silent) {
    if (silent == null) silent = true;
    $do('setVolume', [volume * 10, silent], 'Sound');
}
