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

        var defaultLogin = GeckoJS.Configure.read('vivipos.fec.settings.DefaultLogin');
        var defaultUser = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
        var acl = new GeckoJS.AclComponent();

        if (defaultLogin) {
            var userModel = new ViviPOS.UserModel();
            var users = userModel.findByIndex('all', {
                index: "id",
                value: defaultUser
            });
            // we will only pick the first default user if there are more than one
            if (users && (users.length > 0)) {
                $do('signIn', users[0], 'Main');
            }
        }

        if (acl.getUserPrincipal()) {
            $do('setClerk', null, 'Main');
        }
        else {
            $do('ChangeUserDialog', null, 'Main');
        }
            
        $do('resetLayout', null, 'Main');
    };

    window.addEventListener('load', startup, false);


})();
