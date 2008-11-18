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

        GeckoJS.Configure.loadPreferences("vivipos.fec.settings");

        var defaultLogin = GeckoJS.Configure.read('vivipos.fec.settings.DefaultLogin');
        var acl = new GeckoJS.AclComponent();

        if (defaultLogin) {
            var userModel = new ViviPOS.UserModel();
            var users = userModel.findByIndex('all', {
                index: "defaultuser",
                value: 'true'
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
        $do('createPluPanel', null, "Main");

        // ViviPOS.VfdController.appendController();
        var self = ViviPOS.VfdController.getInstance();
        var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
        var cart = GeckoJS.Controller.getInstanceByName('Cart');
        // hook keypadcontroller
        if(keypad) {

            keypad.addEventListener('onAddBuffer', function(evt) {
                self.onAddBuffer(evt);
            });
        }
        if(cart) {
            cart.addEventListener('onSetQty', function(evt) {
                self.onSetQty(evt);
            });
            cart.addEventListener('onClear', function(evt) {
                self.onClear(evt);
            });

            cart.addEventListener('afterAddItem', function(evt) {
                self.afterAddItem(evt);
            });

            cart.addEventListener('onGetSubtotal', function(evt) {
                self.onGetSubtotal(evt);
            });

            cart.addEventListener('onSubmit', function(evt) {
                self.onSubmit(evt);
            });

        }
    };

    window.addEventListener('load', startup, false);


})();
