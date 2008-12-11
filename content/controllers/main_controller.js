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

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            this.createPluPanel();
            this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');

            this.resetLayout(true);
            this.initialLogin();

            var deptNode = document.getElementById('catescrollablepanel');
            deptNode.selectedIndex = 0;
            deptNode.selectedItems = [0];
            
            // change log level
            GeckoJS.Log.getAppender('console').level = GeckoJS.Log.ERROR;
            GeckoJS.Log.defaultClassLevel = GeckoJS.Log.ERROR;

        },

        _getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
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
            var width = 800;
            var height = 600;
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

            this.depPanelView = new NSIDepartmentsView('catescrollablepanel');
            this.pluPanelView = new NSIPlusView('prodscrollablepanel');
            this.pluPanelView.setCatePanelView(this.depPanelView);
            this.pluPanelView.setCatePanelIndex(0);

        },

        changePluPanel: function(index) {

            // depPanel click
            // change cate or sale it
            var dep = this.depPanelView.getCurrentIndexData(index);
            if (typeof dep.no != 'undefined' && dep.cansale)  {
                // department not group
                var buf = this._getKeypadController().getBuffer();
                if(GeckoJS.Session.get('cart_set_qty_value') != null || buf.length > 0  ) {
                    return this.requestCommand('addItem',dep,'Cart');
                }
            }
            
            // change pluview panel
            var clearBuf = GeckoJS.Configure.read("vivipos.fec.settings.ChangeDepartmentClearBuffer") || false;
            if(clearBuf) this.requestCommand('clear',null,'Cart');
            
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
                var userModel = new UserModel();

                var userRecord = userModel.findByIndex('all', {
                    index: "username",
                    value: user.username
                });

                var priceLevelSet = false;

                if (userRecord && userRecord.length > 0) {
                    var userPriceLevel = parseInt(userRecord[0].default_price_level);
                    var canOverride = (GeckoJS.Array.inArray('acl_user_override_default_price_level', user.Roles) != -1);

                    if (userPriceLevel && !isNaN(userPriceLevel) && userPriceLevel > 0 && userPriceLevel < 10 && canOverride) {
                        $do('change', userPriceLevel, 'Pricelevel');
                        GeckoJS.Session.set('default_price_level', userPriceLevel);
                        priceLevelSet = true;
                    }
                }
                if (!priceLevelSet) {
                    var systemDefaultPriceLevel = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel'));
                    if (!isNaN(systemDefaultPriceLevel) && systemDefaultPriceLevel > 0 && systemDefaultPriceLevel < 10) {
                        //$do('change', systemDefaultPriceLevel, 'Pricelevel');
                        GeckoJS.Session.set('default_price_level', systemDefaultPriceLevel);
                    }
                    $do('changeToCurrentLevel', null, 'Pricelevel');
                }
            }
        },

        toggleNumPad: function (state, initial) {
            var numPad = document.getElementById('numpad');
            var toolbar = document.getElementById('toolbar');
            var toggleBtn = document.getElementById('toggleNumPad');
            var clockinBtn = document.getElementById('clockin');
            var optionsBtn = document.getElementById('options');
            var spacer = document.getElementById('spacer');
            var cartSidebar = document.getElementById('cartsidebar');
            var isHidden = numPad.getAttribute('hidden') || 'false';
            var hideNumPad = (state == null) ? (isHidden == 'false') : state;
            var toggled = false;

            if (hideNumPad) {
                if (numPad && (isHidden != 'true')) {
                // relocate clockinBtn and optionsBtn to cartSidebar
                    if (clockinBtn) clockinBtn.parentNode.removeChild(clockinBtn);
                    if (optionsBtn) optionsBtn.parentNode.removeChild(optionsBtn);

                    if (cartSidebar) {
                        cartSidebar.appendChild(clockinBtn);
                        cartSidebar.appendChild(optionsBtn);
                    }

                    if (numPad) numPad.setAttribute('hidden', 'true');
                    toggled = true;
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'true');
            }
            else {
                // if already visible then don't change
                if (numPad && (isHidden == 'true')) {
                    // relocate clockinBtn and optionsBtn to toolbar
                    if (clockinBtn) clockinBtn.parentNode.removeChild(clockinBtn);
                    if (optionsBtn) optionsBtn.parentNode.removeChild(optionsBtn);

                    if (toolbar) {
                        if (toggleBtn) toolbar.removeChild(toggleBtn);
                        if (spacer) toolbar.removeChild(spacer);
                        if (clockinBtn) toolbar.appendChild(clockinBtn);
                        if (optionsBtn) toolbar.appendChild(optionsBtn);
                        if (spacer) toolbar.appendChild(spacer);
                        if (toggleBtn) toolbar.appendChild(toggleBtn);
                    }

                    if (numPad) numPad.setAttribute('hidden', 'false');
                    toggled = true;
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'false');
            }
            GeckoJS.Configure.write('vivipos.fec.settings.HideNumPad', hideNumPad);

            if (toggled) this.resizeLeftPanel(initial);
            return toggled;
        },

        resizeLeftPanel: function (initial) {
            // resizing product/function panels
            var rightPanel = document.getElementById('rightPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var btmBox = document.getElementById('vivipos-bottombox');

            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            var departmentCols = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols');
            var pluRows = GeckoJS.Configure.read('vivipos.fec.settings.PluRows');
            var pluCols = GeckoJS.Configure.read('vivipos.fec.settings.PluCols');
            var fnRows = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows');
            var fnCols = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns');
            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideFPScrollbar');
            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.CropPLULabel') || false;

            // first check if rows and columns have changed

            var rowsLeft = this.maxButtonRows;
            if (departmentRows > rowsLeft) {
                departmentRows = rowsLeft;
            }
            rowsLeft -= departmentRows;

            if (cropPLULabel) pluPanel.setAttribute('crop', 'end');

            if (initial ||
                (deptPanel.getAttribute('rows') != departmentRows) ||
                (deptPanel.getAttribute('cols') != departmentCols) ||
                (cropDeptLabel && (deptPanel.getAttribute('crop') != 'end')) ||
                (!cropDeptLabel && (deptPanel.getAttribute('crop') == 'end')) ||
                (deptPanel.getAttribute('hideScrollbar') != hideDeptScrollbar)) {
                deptPanel.setAttribute('rows', departmentRows);
                deptPanel.setAttribute('cols', departmentCols);
                if (cropDeptLabel) deptPanel.setAttribute('crop', 'end');
                else deptPanel.removeAttribute('crop');
                if ((departmentRows > 0) && (departmentCols > 0)) {
                    deptPanel.setAttribute('hideScrollbar', hideDeptScrollbar);
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

            if (initial ||
                (pluPanel.getAttribute('rows') != pluRows) ||
                (pluPanel.getAttribute('cols') != pluCols) ||
                (cropPLULabel && (pluPanel.getAttribute('crop') != 'end')) ||
                (!cropPLULabel && (pluPanel.getAttribute('crop') == 'end')) ||
                (pluPanel.getAttribute('hideScrollbar') != hidePLUScrollbar)) {
                pluPanel.setAttribute('rows', pluRows);
                pluPanel.setAttribute('cols', pluCols);
                if (cropPLULabel) pluPanel.setAttribute('crop', 'end');
                else pluPanel.removeAttribute('crop');
                if ((pluRows > 0) && (pluCols > 0)) {
                    pluPanel.setAttribute('hideScrollbar', hidePLUScrollbar);
                    pluPanel.setAttribute('hidden', false);
                    pluPanel.initGrid();
                    pluPanel.vivibuttonpanel.refresh();
                }
                else {
                    pluPanel.setAttribute('hidden', true);
                }
            }

            if (fnPanel) {
                var totalHeight = deptPanel.boxObject.height - (- pluPanel.boxObject.height);
                var fnWidth = this.screenwidth - rightPanel.boxObject.width - 5;
                var fnHeight = this.screenheight - totalHeight - btmBox.boxObject.height - 5;

                if (fnHeight < 1) {
                    fnPanel.setAttribute('height', 0);
                    fnPanel.hide();
                }
                else {
                    fnPanel.setAttribute('hideScrollbar', hideFPScrollbar);

                    // check if rows/columns have changed
                    var currentRows = fnPanel.rows;
                    var currentColumns = fnPanel.columns;

                    if ((currentRows != fnRows) || (currentColumns != fnCols)) {
                        // need to change layout, first retrieve h/vspacing

                        var hspacing = fnPanel.hspacing;
                        var vspacing = fnPanel.vspacing;

                        fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                    }

                    fnPanel.show();
                    fnPanel.setAttribute('height', fnHeight);
                    fnPanel.setAttribute('width', fnWidth);
                }
            }

        },
        
        resetLayout: function (initial) {

            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.RegisterAtLeft');
            var functionPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.FunctionPanelOnTop');
            var PLUbeforeDept = GeckoJS.Configure.read('vivipos.fec.settings.DeptBeforePLU');
            var hideNumPad = GeckoJS.Configure.read('vivipos.fec.settings.HideNumPad');

            var hbox = document.getElementById('mainPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var toolbarPanel = document.getElementById('numberpadPanelContainer');
            var leftPanel = document.getElementById('leftPanel');
            var productPanel = document.getElementById('productPanel');
            var cartList = document.getElementById('cartList');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanel) fnPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (toolbarPanel) toolbarPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (cartList) cartList.setAttribute('dir', registerAtLeft ? 'reverse': 'normal');
            
            if (leftPanel) leftPanel.setAttribute('dir', functionPanelOnTop ? 'reverse' : 'normal');
            if (productPanel) productPanel.setAttribute('dir', PLUbeforeDept ? 'reverse' : 'normal');

            // fudge to make functionPanelOnTop work even if rightPanel is taller than the screen
            leftPanel.setAttribute('pack', functionPanelOnTop ? 'end' : 'start');

            // toggleNumPad() returns true if it invoked resizeLeftPanel()
            if (!this.toggleNumPad(hideNumPad, initial)) {
                this.resizeLeftPanel(initial);
            }
        },
        
        initialLogin: function () {

            var defaultLogin = GeckoJS.Configure.read('vivipos.fec.settings.DefaultLogin');
            var defaultUser = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
            var acl = new GeckoJS.AclComponent();

            if (defaultLogin) {
                var userModel = new UserModel();
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

        quickUserSwitch: function (newUser) {
            // check if has buffer (password)
            var buf = this._getKeypadController().getBuffer();
            this.requestCommand('clear', null, 'Cart');
            
            //GREUtils.log('[SWITCH]: new user <' + newUser + '> password <' + buf + '>');
            if (buf.length>0) {
                if (this.Acl.securityCheck(newUser, buf, true)) {
                    var aclUser = this.Acl.getUserPrincipal();
                    var aclUsername = aclUser ? aclUser.username : '';
                    // is newUser same as existing user?
                    if (newUser == aclUsername) {
                        return;
                    }

                    // sign out existing user

                    this.signOff(true);
                    this.signIn({username:newUser, password:buf});
                    if (this.Acl.getUserPrincipal()) {
                        this.setClerk();
                    }
                }
                else {
                    // illegal password
                }
            }
        },

        signOff: function (quickSignoff) {
            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');
            var shiftReportOnSignOff = GeckoJS.Configure.read('vivipos.fec.settings.shiftreportonsignoff');
            var shiftReportOnQuickSwitch = GeckoJS.Configure.read('vivipos.fec.settings.shiftreportonquickswitch');

            var principal = this.Acl.getUserPrincipal();
            if (principal) {
                var canQueueOrder = quickSignoff || (GeckoJS.Array.inArray('acl_queue_order', principal.Roles) != -1);
                var txn = GeckoJS.Session.get('current_transaction');

                if (!quickSignoff) {
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
                }
                else {

                    // quick sign-off, don't prompt, just queue order
                    responseDiscardCart = 0;
                    responseDiscardQueue = 0;
                }

                // @todo
                // print shift report
                if ((shiftReportOnSignOff && !quickSignoff) || (shiftReportOnQuickSwitch && quickSignoff)) {
                    alert('print shift report');
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
            if (!quickSignoff) this.ChangeUserDialog();
        },

        dispatch: function(arg) {

            var args = arg.split('|');

            this.requestCommand(args[0], args[1], args[2]) ;
            
        }


    });

})();

