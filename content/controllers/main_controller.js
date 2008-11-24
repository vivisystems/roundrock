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
        pluPanelView: null,

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

        getCondiments: function (condgroup) {
            var condiments = null;
            var aURL = "chrome://viviecr/content/select_condiments.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=600,height=480";
            var inputObj = {
                condgroup: condgroup,
                condiments: condiments
            };

            window.openDialog(aURL, "select_condiments", features, inputObj);

            if (inputObj.ok && inputObj.condiments) {
                alert("Condiments:" + inputObj.condiments);

            }
            this.addMemo("Memo Test...");
        },

        addMemo: function (memo) {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:memo,
                input1:null
            };
            window.openDialog(aURL, "prompt_addmemo", features, "Add Memo", "Please input:", "Memo:", "", inputObj);

            if (inputObj.ok && inputObj.input0) {
                alert("Memo:" + inputObj.input0);
            }
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

            this.depPanelView =  new NSIDepartmentsView('catescrollablepanel');
            this.pluPanelView = new NSIPlusView('prodscrollablepanel');
            this.pluPanelView.setCatePanelView(this.depPanelView);
            this.pluPanelView.setCatePanelIndex(0);

        },

        changePluPanel: function(index) {

            this.pluPanelView.setCatePanelIndex(index);

        },

        clickPluPanel: function(index) {

            var product = this.pluPanelView.getCurrentIndexData(index);
            return this.requestCommand('addItem',product,'Cart');

        },

        pushQueue: function() {
            $do('pushQueue',$('#cartSimpleListBox')[0].selectedIndex,'Cart');
        
        },

        signOff: function () {
            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');

            var cart = GeckoJS.Session.get('cart');
            //GREUtils.log(GeckoJS.BaseObject.dump(cart));
            var itemCount = (cart == null) ? 0 : cart.getItemCount();

            var promptDiscardCart = (itemCount > 0 && !autoDiscardCart);
            var responseDiscardCart = 2;  // 0: queue, 1: discard, 2: cancel

            if (promptDiscardCart) {
                //TODO: need to check for access to queue orders
                if (autoDiscardQueue || mustEmptyQueue) {
                    if (!GREUtils.Dialog.confirm(null, 'Sign Off', 'Discard items that have been registered?')) return;
                    responseDiscardCart = 1;
                }
                else {
                    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                            .getService(Components.interfaces.nsIPromptService);
                    var check = {value: false};

                    var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                    var responseDiscardCart = prompts.confirmEx(null, "Sign Off", "What do you want to do with the registered items?",
                                                                flags, "Queue", "Discard", "", null, check);
                    if (responseDiscardCart == 2) return;
                }
            }
            else {
                responseDiscardCart = 1;
            }
            var orders = cart.orderQueue;
            var orderKeys = GeckoJS.BaseObject.getKeys(orders);
            var myOrders = [];
            var username = this.Acl.getUserPrincipal().username;

            var responseDiscardQueue = 1; // 0: keep; 1: discard'

            orderKeys.forEach(function (key) {
                var fields = key.split(':');
                var user = fields[fields.length - 1];
                if (username == user) myOrders.push(key);
                });

            var promptDiscardQueue = (!autoDiscardQueue && (responseDiscardCart != 0) && (myOrders.length > 0));

            if (promptDiscardQueue) {
                if (mustEmptyQueue) {
                    if (GREUtils.Dialog.confirm(null, "Sign Off", "You have one or more queued orders. Discard them?") == false) {
                        return;
                    }
                }
                else {
                    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                            .getService(Components.interfaces.nsIPromptService);
                    var check = {value: false};

                    var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                    var responseDiscardQueue= prompts.confirmEx(null, "Sign Off", "You have one or more queued orders. What do you want to do with them?",
                                                                flags, "Keep", "Discard", "", null, check);
                    if (responseDiscardQueue == 2) return;
                }
            }
            else if (responseDiscardCart == 0) { // queue order
                responseDiscardQueue = 0;
            }

            if (!promptDiscardCart && !promptDiscardQueue)
                if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you sure to sign off?") == false) {
                    return;
            }

            if (responseDiscardCart == 1) {
                 $do('clear', null, 'Cart');
            }
            else {
                this.pushQueue();
            }

            if (responseDiscardQueue == 1) {
                myOrders.forEach(function (key) {
                    cart.pullQueue(key);
                });
                delete cart.items;
                cart.items = [];
            }

            this.Acl.invalidate();
            this.ChangeUserDialog();
        // window.close();
        }

    });

})();

