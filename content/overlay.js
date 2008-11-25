(function(){

    /**
     * Controller Startup
     */
    function startup() {

        var firstRun = GREUtils.Pref.getPref('vivipos.fec.firstrun');

        if(firstRun) {
            var aURL = "chrome://viviecr/content/firstuse.xul";
            var aName = "First Run";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = 800;
            var height = 600;
            GREUtils.Dialog.openDialog(aURL, aName, aArguments, posX, posY, width, height);
        }else {
            // app start
            // load product and category

        }

        $do('initial', null, "Main");
    };

    window.addEventListener('load', startup, false);


})();
