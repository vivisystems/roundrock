
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

        doRestart: false,
        restartClock: false,
    
        initial: function() {


            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            GeckoJS.Session.set('screenwidth', this.screenwidth);
            GeckoJS.Session.set('screenheight', this.screenheight);

            this.createPluPanel();
            this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');
            this.requestCommand('initial', null, 'CurrencySetup');

            this.resetLayout(true);

            var deptNode = document.getElementById('catescrollablepanel');
            deptNode.selectedIndex = 0;
            deptNode.selectedItems = [0];
            
            // change log level
            GeckoJS.Log.getAppender('console').level = GeckoJS.Log.ERROR;
            GeckoJS.Log.defaultClassLevel = GeckoJS.Log.ERROR;

//            GeckoJS.Log.getAppender('console').level = GeckoJS.Log.TRACE;
//            GeckoJS.Log.defaultClassLevel = GeckoJS.Log.TRACE;
//
//            GeckoJS.Log.getLoggerForClass('DatasourceSQL').level = GeckoJS.Log.TRACE;
//            GeckoJS.Log.getLoggerForClass('DatasourceSQLite').level = GeckoJS.Log.TRACE;

            var self = this;
            
            // observer restart topic
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['prepare-to-restart', 'restart-clock'],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'prepare-to-restart')
                        self.doRestart = true;

                    else if (aTopic == 'restart-clock')
                        self.restartClock = true;
                }
            }).register();

            GeckoJS.Observer.notify(null, 'render', this);

            // since initialLogin may potentially block, let's invoke onInitial to initialize controllers
            // ourselves

            this.dispatchEvent('onInitial', null);

            this.initialLogin();
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

            if (this.doRestart) {
                try {
                    GREUtils.restartApplication();
                } catch(err) {
                }
            }
            if (this.restartClock) {
                try {
                    $('#clock')[0].stopClock();
                    $('#clock')[0].startClock();
                } catch(err) {
                }
            }

        },


        ChangeUserDialog: function () {
            var aURL = "chrome://viviecr/content/changeuser.xul";
            var aName = "ChangeUser";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=no,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
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
            var width = this.screenwidth;
            var height = this.screenheight;
            //$do('load', null, 'Categories');
            GREUtils.Dialog.openDialog(window, aURL, aName, aArguments, posX, posY, width, height);
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
            var catepanel = document.getElementById('catescrollablepanel');
            if (dep) {
                var soldOutButton = document.getElementById('catescrollablepanel-soldout');
                if (soldOutButton && soldOutButton.checkState) {

                    if (dep.soldout) {
                        dep.soldout = false;
                    }
                    else {
                        dep.soldout = true;
                    }
                    soldOutButton.checkState = 0;
                    soldOutButton.checked = false;
                    catepanel.selectedItems = [];
                    catepanel.selectedIndex = -1;
                }
                else if (dep.soldout) {
                    catepanel.selectedItems = [];
                    catepanel.selectedIndex = -1;
                    return;
                }
                else {
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
                }
            }
        },

        clickPluPanel: function(index) {
            var product = this.pluPanelView.getCurrentIndexData(index);

            // check whether the panel is in sold-out mode
            if (product) {
                var prodpanel = document.getElementById('prodscrollablepanel');
                var soldOutButton = document.getElementById('prodscrollablepanel-soldout');
                if (soldOutButton && soldOutButton.checkState) {

                    if (product.soldout) {
                        product.soldout = false;
                    }
                    else {
                        product.soldout = true;
                    }
                    soldOutButton.checkState = 0;
                    soldOutButton.checked = false;
                    prodpanel.vivibuttonpanel.invalidate();
                }
                else if (!product.soldout) {
                    return this.requestCommand('addItem',product,'Cart');
                }
            }
        },

        setClerk: function () {
            var user = this.Acl.getUserPrincipal();
            if (user) {
                // perform user login initialization
                // -> set price level
                //    - if user has role 'vivipos_fec_acl_override_system_price_level', use user default price level
                var userModel = new UserModel();

                var userRecord = userModel.findByIndex('first', {
                    index: "username",
                    value: user.username
                });

                var priceLevelSet = false;

                if (userRecord) {
                    // first, store user data in session

                    GeckoJS.Session.set('user', userRecord);
                    
                    var userPriceLevel = parseInt(userRecord.default_price_level);
                    //var canOverride = (GeckoJS.Array.inArray('acl_user_override_default_price_level', user.Roles) != -1);
                    var canOverride = this.Acl.isUserInRole('acl_user_override_default_price_level');

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

                var fnPanel = document.getElementById('functionPanel');
                if (fnPanel) fnPanel.home();
            }
            else {
                GeckoJS.Session.clear('user');
            }
        },

	updateOptions: function () {
	    this.resetLayout();
	},

        toggleNumPad: function (state, initial) {
            var numPad = document.getElementById('numpad');
            var toolbar = document.getElementById('toolbar');
            var toggleBtn = document.getElementById('toggleNumPad');
            var fixedRow = document.getElementById('fixedbtnrow');
            var clockinBtn = document.getElementById('clockin');
            var optionsBtn = document.getElementById('options');
            var vkbBtn = document.getElementById('vkb');
            var spacer = document.getElementById('spacer');
            var cartSidebar = document.getElementById('cartsidebar');
            var isHidden = numPad.getAttribute('hidden') || 'false';
            var hideNumPad = (state == null) ? (isHidden == 'false') : state;
            var toggled = false;

            if (hideNumPad) {
                if (numPad && (isHidden != 'true')) {
                // relocate clockinBtn and optionsBtn to cartSidebar
                    if (vkbBtn) vkbBtn.parentNode.removeChild(vkbBtn);
                    if (clockinBtn) clockinBtn.parentNode.removeChild(clockinBtn);
                    if (optionsBtn) optionsBtn.parentNode.removeChild(optionsBtn);

                    if (cartSidebar) {
                        cartSidebar.appendChild(vkbBtn);
                        cartSidebar.appendChild(clockinBtn);
                        cartSidebar.appendChild(optionsBtn);
                    }

                    if (numPad) numPad.setAttribute('hidden', 'true');
                    toggled = true;
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'true');
                fixedRow.selectedIndex = 1;
            }
            else {
                // if already visible then don't change
                if (numPad && (isHidden == 'true')) {
                    // relocate clockinBtn and optionsBtn to toolbar
                    if (vkbBtn) vkbBtn.parentNode.removeChild(vkbBtn);
                    if (clockinBtn) clockinBtn.parentNode.removeChild(clockinBtn);
                    if (optionsBtn) optionsBtn.parentNode.removeChild(optionsBtn);

                    if (toolbar) {
                        if (toggleBtn) toolbar.removeChild(toggleBtn);
                        if (spacer) toolbar.removeChild(spacer);
                        if (vkbBtn) toolbar.appendChild(vkbBtn);
                        if (clockinBtn) toolbar.appendChild(clockinBtn);
                        if (optionsBtn) toolbar.appendChild(optionsBtn);
                        if (spacer) toolbar.appendChild(spacer);
                        if (toggleBtn) toolbar.appendChild(toggleBtn);
                    }

                    if (numPad) numPad.setAttribute('hidden', 'false');
                    toggled = true;
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'false');
                fixedRow.selectedIndex = 0;
            }

            if (initial) this.resizeLeftPanel(initial);
            return toggled;
        },

        resizeLeftPanel: function (initial) {
            // resizing product/function panels
            var rightPanel = document.getElementById('rightPanel');
            var leftPanel = document.getElementById('leftPanel');
            var panelSpacer = document.getElementById('panelSpacer');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            //var condimentPanel = document.getElementById('condimentscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var btmBox = document.getElementById('vivipos-bottombox');
            //var pluAndCondimentDeck = document.getElementById('pluAndCondimentDeck');

            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            if (departmentRows == null) departmentRows = 3;

            var departmentCols = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols');
            if (departmentCols == null) departmentCols = 4;

            var departmentButtonHeight = GeckoJS.Configure.read('vivipos.fec.settings.Department.Button.Height');
            if (departmentButtonHeight == null) departmentButtonHeight = 50;

            var pluRows = GeckoJS.Configure.read('vivipos.fec.settings.PluRows');
            if (pluRows == null) pluRows = 4;

            var pluCols = GeckoJS.Configure.read('vivipos.fec.settings.PluCols');
            if (pluCols == null) pluCols = 4;

            var pluButtonHeight = GeckoJS.Configure.read('vivipos.fec.settings.Plu.Button.Height');
            if (pluButtonHeight == null) pluButtonHeight = 50;
            var fnRows = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows');
            if (fnRows == null) fnRows = 3;

            var fnCols = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns');
            if (fnCols == null) fnCols = 4;

            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideFPScrollbar');
            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.CropPLULabel') || false;

            // sanity check on department and plu panel heights
            var deptHeight = departmentRows * departmentButtonHeight;
            var pluHeight = pluRows * pluButtonHeight;
            
            if (cropPLULabel) pluPanel.setAttribute('crop', 'end');

            if (initial ||
                (deptPanel.getAttribute('rows') != departmentRows) ||
                (deptPanel.getAttribute('cols') != departmentCols) ||
                (deptPanel.getAttribute('buttonHeight') != departmentButtonHeight) ||
                (cropDeptLabel && (deptPanel.getAttribute('crop') != 'end')) ||
                (!cropDeptLabel && (deptPanel.getAttribute('crop') == 'end')) ||
                (deptPanel.getAttribute('hideScrollbar') != hideDeptScrollbar)) {
                deptPanel.setAttribute('rows', departmentRows);
                deptPanel.setAttribute('cols', departmentCols);
                deptPanel.setAttribute('buttonHeight', departmentButtonHeight);
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
                //if (pluAndCondimentDeck) pluAndCondimentDeck.style.height = '0px';
            }

            if (initial ||
                (pluPanel.getAttribute('rows') != pluRows) ||
                (pluPanel.getAttribute('cols') != pluCols) ||
                (pluPanel.getAttribute('buttonHeight') != pluButtonHeight) ||
                (cropPLULabel && (pluPanel.getAttribute('crop') != 'end')) ||
                (!cropPLULabel && (pluPanel.getAttribute('crop') == 'end')) ||
                (pluPanel.getAttribute('hideScrollbar') != hidePLUScrollbar)) {
                pluPanel.setAttribute('rows', pluRows);
                pluPanel.setAttribute('cols', pluCols);
                pluPanel.setAttribute('buttonHeight', pluButtonHeight);

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

            if (deptPanel) deptPanel.vivibuttonpanel.resizeButtons();
            if (pluPanel) pluPanel.vivibuttonpanel.resizeButtons();

            if (fnPanel) {
                var totalHeight = deptPanel.boxObject.height - (- pluPanel.boxObject.height);
                var panelSpacerWidth = (panelSpacer) ? panelSpacer.boxObject.width : 0;
                var fnWidth = this.screenwidth - rightPanel.boxObject.width - panelSpacerWidth - 0;

                var fnHeight = this.screenheight - totalHeight - btmBox.boxObject.height - 4;
                if (fnHeight < 1 || fnRows == 0 || fnCols == 0) {
                    fnPanel.setAttribute('height', 0);
                    fnPanel.hide();
                }
                else {
                    fnPanel.show();
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

                    fnPanel.setAttribute('height', fnHeight);
                    fnPanel.setAttribute('width', fnWidth);
                }
            }

        },
        
        resetLayout: function (initial) {
            
            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.RegisterAtLeft') || false;
            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.HideSoldOutButtons') || false;
            var hideTag = GeckoJS.Configure.read('vivipos.fec.settings.HideTagColumn') || false;
            var hideNumPad = false;
            
            var hbox = document.getElementById('mainPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var toolbarPanel = document.getElementById('numberpadPanelContainer');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanel) fnPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (toolbarPanel) toolbarPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (cartList) cartList.setAttribute('dir', registerAtLeft ? 'reverse': 'normal');
            if (checkTrackingStatus) {
                checkTrackingStatus.setAttribute('hidden', checkTrackingMode ? 'false' : 'true');
            }
            // display tag field
            var headers = cartList.getAttribute('headers');
            var fields = cartList.getAttribute('fields');
            if (hideTag) {
                if (headers.split(',').length == 6) {
                    headers = headers.substring(headers.indexOf(',') + 1);
                    fields = fields.substring(fields.indexOf(',') + 1);
                    cartList.setAttribute('headers', headers);
                    cartList.setAttribute('fields', fields);

                    cartList.vivitree.initTreecols();
                }
            }
            else {
                if (headers.split(',').length == 5) {
                    headers = '"",' + headers;
                    fields = 'tag,' + fields;
                    cartList.setAttribute('headers', headers);
                    cartList.setAttribute('fields', fields);

                    cartList.vivitree.initTreecols();
                }
            }
            // display sold out buttons
            if (soldOutCategory) soldOutCategory.setAttribute('hidden', hideSoldOutButtons ? 'true' : 'false');
            if (soldOutProduct) soldOutProduct.setAttribute('hidden', hideSoldOutButtons ? 'true' : 'false');

            // toggleNumPad() returns true if it invoked resizeLeftPanel()
            if (!this.toggleNumPad(hideNumPad, initial)) {
                this.resizeLeftPanel(initial);
            }
        },
        
        initialLogin: function () {

            var defaultLogin = GeckoJS.Configure.read('vivipos.fec.settings.DefaultLogin');
            var defaultUserID = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
            var defaultUser = '';

            //@todo work-around Object reference bug - fixed
            //var roles= this.Acl.getGroupList();

            if (defaultUserID) {
                var userModel = new UserModel();
                var defaultUserRecord = userModel.findById(defaultUserID);
                if (defaultUserRecord) defaultUser = defaultUserRecord.username;
            }
            
            if (defaultLogin && defaultUser && defaultUser.length > 0) {
                this.Acl.securityCheck(defaultUser, 'dummy', false, true);
            }

            // check if default user successfully logged in
            if (this.Acl.getUserPrincipal()) {
                this.setClerk();
            }
            else {
                this.ChangeUserDialog();
            }
        },

        clear: function () {
            this.quickUserSwitch(true);
        },

        enter: function () {
            this.quickUserSwitch();
        },

        quickUserSwitch: function (stop) {
            if (stop || this.suspendButton) {
                this.requestCommand('setTarget', 'Cart', 'Keypad');

                // re-enable buttons
                GeckoJS.Observer.notify(null, 'button-state-resume', this.target);
                this.suspendButton = false;

                // resume cart
                this.requestCommand('resume', null, 'Cart');

                // check if has buffer (password)
                var buf = this._getKeypadController().getBuffer().replace(/^\s*/, '').replace(/\s*$/, '');
                this.requestCommand('clear', null, 'Cart');

                var success = true;
                // success is indicated by where txn is set to current transaction
                if (stop != true && stop != 'true' && buf.length > 0) {

                    if (this.Acl.securityCheckByPassword(buf, true)) {
                        this.signOff(true);
                        this.Acl.securityCheckByPassword(buf, false);

                        var user = this.Acl.getUserPrincipal();
                        if (user) {
                            this.setClerk();

                            //@todo quick user switch successful
                            OsdUtils.info(user.description + _(' logged in'));
                        }
                        else {
                            // should always succeed, but if not, pull up the change user dialog since we've already signed off
                            this.ChangeUserDialog();
                        }
                    }
                    else {
                        success = false;
                    }
                }
                this.dispatchEvent('onExitPassword', success);
                if (success) {
                    //GeckoJS.Controller.getInstanceByName('Cart').subtotal();
                }
                else if (!stop && buf.length > 0) {
                    // @todo OSD
                    NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                }
            }
            else {
                this.requestCommand('clear', null, 'Cart');
                this.requestCommand('setTarget', 'Main', 'Keypad');

                // suspend cart
                this.requestCommand('suspend', null, 'Cart');

                // suspend all buttons
                GeckoJS.Observer.notify(null, 'button-state-suspend', this.target);
                this.suspendButton = true;

                // generate onEnterPassword event
                this.dispatchEvent('onEnterPassword', null);
            }

        },

        silentUserSwitch: function (newUser) {
            // check if buffer (password) is empty
            var buf = this._getKeypadController().getBuffer().replace(/^\s*/, '').replace(/\s*$/, '');
            this.requestCommand('clear', null, 'Cart');
            
            //GREUtils.log('[SWITCH]: new user <' + newUser + '> password <' + buf + '>');

            // we allow newUser to be either username or displayname
            var userModel = new UserModel();
            var users = userModel.findByIndex('all', {
                index: 'username',
                value: newUser
            });
            if (users == null || users.length == 0) {
                // no match found by username, let's try display name
                users = userModel.findByIndex('all', {
                    index: 'displayname',
                    value: newUser
                });

                if (users == null || users.length == 0) {
                    //@todo silent user switch successful
                    NotifyUtils.error(_('User [%S] does not exist!', [newUser]));
                    return;
                }
                else {
                    newUser = users[0].username;
                }
            }
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
                    this.Acl.securityCheck(newUser, buf);

                    var user = this.Acl.getUserPrincipal();
                    if (user) {
                        this.setClerk();

                        //@todo silent user switch successful
                        OsdUtils.info(user.description + _(' logged in'));
                    }
                    else {
                        this.ChangeUserDialog();
                    }
                }
                else {
                    // @todo error message for login failure
                    NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                }
            }
            else {
                // @todo no password
                NotifyUtils.warn(_('Please enter passcode first.'));
            }
        },

        signOff: function (quickSignoff) {
            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');
            var shiftReportOnSignOff = GeckoJS.Configure.read('vivipos.fec.settings.shiftreportonsignoff');
            var shiftReportOnQuickSwitch = GeckoJS.Configure.read('vivipos.fec.settings.shiftreportonquickswitch');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var txn = GeckoJS.Session.get('current_transaction');
            var cartEmpty = (txn == null) || (txn.isSubmit()) || (txn.getItemsCount() <= 0);
            var principal = this.Acl.getUserPrincipal();

            if (principal) {
                var canQueueOrder = quickSignoff || (GeckoJS.Array.inArray('acl_queue_order', principal.Roles) != -1);

                if (!quickSignoff) {
                    var promptDiscardCart = !cartEmpty && (!autoDiscardCart);
                    var responseDiscardCart = 2;  // 0: queue, 1: discard, 2: cancel

                    if (promptDiscardCart) {
                        if (autoDiscardQueue || mustEmptyQueue || !canQueueOrder) {
                            if (!GREUtils.Dialog.confirm(null, _('Sign Off'), _('Discard items that have been registered?'))) return;
                            responseDiscardCart = 1;
                        }
                        else {
                            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                                    .getService(Components.interfaces.nsIPromptService);
                            var check = {value: false};

                            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                        prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                            var responseDiscardCart = prompts.confirmEx(null, _('Sign Off'), _('What do you want to do with the registered items?'),
                                                                        flags, _('Queue'), _('Discard'), "", null, check);
                            if (responseDiscardCart == 2) return;
                        }
                    }
                    else {
                        responseDiscardCart = 1;
                    }
                    var responseDiscardQueue = 1; // 0: keep; 1: discard'
                    var promptDiscardQueue = !autoDiscardQueue && (responseDiscardCart != 0) && cart._hasUserQueue(principal);

                    if (promptDiscardQueue) {
                        if (mustEmptyQueue) {
                            if (GREUtils.Dialog.confirm(null, _('Sign Off'), _('You have one or more queued orders. Discard them?')) == false) {
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

                            var responseDiscardQueue = prompts.confirmEx(null, _('Sign Off'), _('You have one or more queued orders. What do you want to do with them?'),
                                                                        flags, _('Keep'), _('Discard'), "", null, check);
                            if (responseDiscardQueue == 2) return;
                        }
                    }
                    else if (responseDiscardCart == 0) { // queue order
                        responseDiscardQueue = 0;
                    }

                    if (!promptDiscardCart && !promptDiscardQueue)
                        if (GREUtils.Dialog.confirm(null, _('confirm sign-off'), _('Are you ready to sign off?')) == false) {
                            return;
                    }
                }
                else {

                    // quick sign-off, don't prompt, just queue order
                    responseDiscardCart = (autoDiscardCart) ? 1 : 0;
                    responseDiscardQueue = (autoDiscardQueue || mustEmptyQueue) ? 1 : 0;
                }

                // @todo
                // print shift report
                if ((shiftReportOnSignOff && !quickSignoff) || (shiftReportOnQuickSwitch && quickSignoff)) {
                }

                if (!cartEmpty) {
                    if (responseDiscardCart == 1) {
                        $do('cancel', null, 'Cart');
                    }
                    else {
                        $do('pushQueue', null, 'Cart');
                    }
                }
                $do('clear', null, 'Cart');

                if (responseDiscardQueue == 1) {
                    cart._removeUserQueue(principal);
                }

                this.Acl.invalidate();
            }
            else {
                $do('clear', null, 'Cart');
                if (!cartEmpty) $do('cancel', null, 'Cart');
            }

            if (!quickSignoff) {
                this.clear();
                this.ChangeUserDialog();
            }
        },

        dispatch: function(arg) {

            var args = arg.split('|');

            //this.requestCommand(args[0], args[1], args[2]) ;
            var printer = GeckoJS.Controller.getInstanceByName('Print');
            if (printer) {
                printer.printReport('narrow', 'This is a narrow report [0x0C]');
            }
        }


    });

})();
