// test
(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Main',
        screenwidth: 800,
        screenheight: 600,
        maxButtonRows: 10,
        depPanelView: null,
        pluPanelView: null,

        initial: function() {

            this.initialLogin();
            this.createPluPanel();
            this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');
            this.requestCommand('initial', null, 'Vfd');

            this.resetLayout();

            // change log level
            GeckoJS.Log.getAppender('console').level = GeckoJS.Log.DEBUG;
            GeckoJS.Log.defaultClassLevel = GeckoJS.Log.DEBUG;

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

        signIn: function(user) {
            return this.Acl.securityCheck(user.username, user.password);
        },

        setClerk: function () {
            var user = this.Acl.getUserPrincipal();

            if (user) {
                // perform user login initialization
                // -> set price level
                //    - if user has role 'vivipos_fec_acl_override_system_price_level', use user default price level
                var userPriceLevel = user.default_price_level;
                var canOverride = (GeckoJS.Array.inArray('vivipos_fec_acl_override_system_price_level', user.Roles) != -1);

                if (userPriceLevel && canOverride) {
                    $do('change', userPriceLevel, 'Pricelevel');
                }
            }
        },

        resetLayout: function () {
            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.RegisterAtLeft');
            var functionPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.FunctionPanelOnTop');
            var PLUbeforeDept = GeckoJS.Configure.read('vivipos.fec.settings.DeptBeforePLU');
            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideFPScrollbar');
            
            var hbox = document.getElementById('mainPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var toolbarPanel = document.getElementById('toolbarPanel');
            var leftPanel = document.getElementById('leftPanel');
            var productPanel = document.getElementById('productPanel');
            var btmBox = document.getElementById('vivipos-bottombox');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanel) fnPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (toolbarPanel) toolbarPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            
            if (leftPanel) leftPanel.setAttribute('dir', functionPanelOnTop ? 'reverse' : 'normal');
            if (productPanel) productPanel.setAttribute('dir', PLUbeforeDept ? 'reverse' : 'normal');
            
            // fudge to make functionPanelOnTop work
            leftPanel.setAttribute('pack', functionPanelOnTop ? 'end' : 'start');
            
            if (deptPanel) deptPanel.setAttribute('hideScrollbar', hideDeptScrollbar);
            if (pluPanel) pluPanel.setAttribute('hideScrollbar', hidePLUScrollbar);
            if (fnPanel) fnPanel.setAttribute('hideScrollbar', hideFPScrollbar);

            // resizing product/function panels
            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            var departmentCols = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols');
            var pluRows = GeckoJS.Configure.read('vivipos.fec.settings.PluRows');
            var pluCols = GeckoJS.Configure.read('vivipos.fec.settings.PluCols');

            // first check if rows and columns have changed

            var rowsLeft = this.maxButtonRows;
            if (departmentRows > rowsLeft) {
                departmentRows = rowsLeft;
            }
            rowsLeft -= departmentRows;

            if ((deptPanel.getAttribute('rows') != departmentRows) ||
                (deptPanel.getAttribute('cols') != departmentCols)) {
                deptPanel.setAttribute('rows', departmentRows);
                deptPanel.setAttribute('cols', departmentCols);
                if ((departmentRows > 0) && (departmentCols > 0)) {
                    deptPanel.setAttribute('hidden', false);
                    deptPanel.initGrid();
                    deptPanel.vivibuttonpanel.refresh();
                }
                else {
                    deptPanel.setAttribute('hidden', true);
                }
            }
            
            if (pluRows > rowsLeft) {
                pluRows = rowsLeft;
            }
            rowsLeft -= pluRows;
            
            if ((pluPanel.getAttribute('rows') != pluRows) ||
                (pluPanel.getAttribute('cols') != pluCols)) {
                pluPanel.setAttribute('rows', pluRows);
                pluPanel.setAttribute('cols', pluCols);
                if ((pluRows > 0) && (pluCols > 0)) {
                    pluPanel.setAttribute('hidden', false);
                    pluPanel.initGrid();
                    pluPanel.vivibuttonpanel.refresh();
                }
                else {
                    pluPanel.setAttribute('hidden', true);
                }
            }

            var totalHeight = deptPanel.boxObject.height - (- pluPanel.boxObject.height);
            var fnHeight = this.screenheight - totalHeight - btmBox.boxObject.height;
            if (fnHeight < 1) {
                fnPanel.setAttribute('height', 0);
                fnPanel.hide();
            }
            else {
                fnPanel.show();
                fnPanel.setAttribute('height', fnHeight);
            }
        },
        
        initialLogin: function () {

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
                    this.signIn(users[0]);
                }
            }

            if (acl.getUserPrincipal()) {
                this.setClerk();
            }
            else {
                this.ChangeUserDialog();
            }
        },
        
        signOff: function () {
            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');

            var principal = this.Acl.getUserPrincipal();
            if (principal) {
                var canQueueOrder = (GeckoJS.Array.inArray('vivipos_fec_acl_queue_order', principal.Roles) != -1);
                var txn = GeckoJS.Session.get('current_transaction');

                var promptDiscardCart = (txn != null) && (!txn.isSubmit()) && (txn.getItemsCount() > 0) && (!autoDiscardCart);
                var responseDiscardCart = 2;  // 0: queue, 1: discard, 2: cancel

                if (promptDiscardCart) {
                    if (autoDiscardQueue || mustEmptyQueue || !canQueueOrder) {
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
                var responseDiscardQueue = 1; // 0: keep; 1: discard'
                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                var promptDiscardQueue = !autoDiscardQueue && (responseDiscardCart != 0) && cart._hasUserQueue(principal);

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

                        var responseDiscardQueue = prompts.confirmEx(null, "Sign Off", "You have one or more queued orders. What do you want to do with them?",
                                                                    flags, "Keep", "Discard", "", null, check);
                        if (responseDiscardQueue == 2) return;
                    }
                }
                else if (responseDiscardCart == 0) { // queue order
                    responseDiscardQueue = 0;
                }

                if (!promptDiscardCart && !promptDiscardQueue)
                    if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you ready to sign off?") == false) {
                        return;
                }

                if (responseDiscardCart == 1) {
                    $do('cancel', null, 'Cart');
                    $do('clear', null, 'Cart');
                }
                else {
                    $do('pushQueue', null, 'Cart');
                    $do('clear', null, 'Cart');
                }

                if (responseDiscardQueue == 1) {
                    cart._removeUserQueue(principal);
                }

                this.Acl.invalidate();
            }
            else {
                $do('cancel', null, 'Cart');
                $do('clear', null, 'Cart');
            }
            this.ChangeUserDialog();
        }

    });

})();

