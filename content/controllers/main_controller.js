// test
(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Main',
        screenwidth: 800,
        screenheight: 600,
        depPanelView: null,
        productPanelView: null,

        initial: function() {

            this.checkClerk();
            this.createPluPanel();
            this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');
            this.requestCommand('initial', null, 'Vfd');

            // change log level
            GeckoJS.Log.getAppender('console').level = GeckoJS.Log.DEBUG;
            GeckoJS.Log.defaultClassLevel = GeckoJS.Log.DEBUG;

        },

        checkClerk: function () {

            var confs = GeckoJS.Configure.read('vivipos.fec.settings');

            // GREUtils.log(GeckoJS.BaseObject.dump(confs));
            if (confs.DefaultLogin) {
                this.Acl.securityCheck("achang", "1111")
            }

            var user = this.Acl.getUserPrincipal();

            if ( user == null) {
                $do('ChangeUserDialog', null, 'Main');
            } else {
                $('#clerk').val(user.username);
            }
        },

        SysConfigDialog: function () {
            var aURL = "chrome://viviecr/content/sysconfig.xul";
            var aName = "SysConfig";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        ControlPanelDialog: function () {
            var aURL = "chrome://viviecr/content/controlPanel.xul";
            var aName = "SysConfig";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },


        ChangeUserDialog: function () {
            var aURL = "chrome://viviecr/content/changeuser.xul";
            var aName = "ChangeUser";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        ClockInOutDialog: function () {
            var aURL = "chrome://viviecr/content/clockinout.xul";
            var aName = "Clock In/Out";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        PLUSearchDialog: function () {
            
            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = "PLUSearch";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = 410;
            var height = 760;
            //$do('load', null, 'Categories');
            GREUtils.Dialog.openDialog(window, aURL, aName, aArguments, posX, posY, width, height);
        },

        SelectQueueDialog: function () {
            
            var aURL = "chrome://viviecr/content/selectqueue.xul";
            var aName = "SelectQueue";
            var aArguments = "";
            var posX = (this.screenwidth - 640) / 2;
            var posY = (this.screenheight - 480) / 2;
            var width = 640;
            var height = 480;

            var args = {
                result: false,
                data: null
            };
            args.wrappedJSObject = args;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, args);
            
            if (args.result) {
                this.requestCommand('pushQueue',null,'Main');
                this.requestCommand('pullQueue',args.data, 'Cart');
            }

        },

        WizardDialog: function () {
            var aURL = "chrome://viviecr/content/firstuse.xul";
            var aName = "First Run";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        createPluPanel: function () {

            this.depPanelView =  new NSICategoriesView('catescrollablepanel');
            this.productPanelView = new NSIProductsView('prodscrollablepanel');
            this.productPanelView.setCatePanelView(this.depPanelView);
            this.productPanelView.setCatePanelIndex(0);

        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);

        },

        clickPluPanel: function(index) {

            var product = this.productPanelView.getCurrentIndexData(index);
            return this.requestCommand('addItem',product,'Cart');

        },

        pushQueue: function() {
            $do('pushQueue',$('#cartSimpleListBox')[0].selectedIndex,'Cart');
        
        },

        signOff: function () {
            if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you sure to sign off?") == false) {
                return;
            }
            
            this.pushQueue();
            this.Acl.invalidate();
            this.ChangeUserDialog();
        // window.close();
        }

    });

})();

