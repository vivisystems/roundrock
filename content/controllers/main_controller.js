(function(){

    /**
     * Class ViviPOS.MainController
     */
    var __controller__ = {

        name: 'Main',
        screenwidth: 800,
        screenheight: 600,
        depPanelView: null,
        pluPanelView: null,

        doRestart: false,
        restartClock: false,

        _suspendLoadTest: false,
        _groupPath: [],
    
        initial: function() {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            GeckoJS.Session.set('screenwidth', this.screenwidth);
            GeckoJS.Session.set('screenheight', this.screenheight);

            // patch

            this.createPluPanel();
            //this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');

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
                topics: ['prepare-to-restart', 'restart-clock', 'addons-message-notification' ],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'prepare-to-restart' || aData == 'addons-restart-app')
                        self.doRestart = true;

                    else if (aTopic == 'restart-clock')
                        self.restartClock = true;
                }
            }).register();

            GeckoJS.Observer.notify(null, 'render', this);

            // since initialLogin may potentially block, let's invoke afterInitial to initialize controllers
            // ourselves

            this.dispatchEvent('afterInitial', null);

            this.requestCommand('initialLogin', null, 'Main');
        },

        destroy: function() {
            this.observer.unregister();
        },

        _getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },


        ControlPanelDialog: function () {
            var aURL = 'chrome://viviecr/content/controlPanel.xul';
            var aName = _('Control Panel');
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, 'chrome,dialog,modal,dependent=yes,resize=no,top=' + posX + ',left=' + posY + ',width=' + width + ',height=' + height, "");

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
            var aName = _('Change User');
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=no,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        ClockInOutDialog: function () {
            var aURL = "chrome://viviecr/content/clockinout.xul";
            var aName = _('Clock In/Out');
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },


        PLUSearchDialog: function (addtocart) {
            //
            var buf = this._getKeypadController().getBuffer();

            var item;
            var txn = GeckoJS.Session.get('current_transaction');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart && txn) {
                var index = cart._cartView.getSelectedIndex();
                item = txn.getItemAt(index, true);
            }

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');
            var aArguments = {buffer: buf, item: item};
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=" + width + ",height=" + height, aArguments);
            if (aArguments.ok) {
                if (addtocart && aArguments.item) {
                    this.requestCommand('addItem',aArguments.item,'Cart');
                }
                return aArguments.item;
            }
            else
                this.requestCommand('subtotal', null, 'Cart');
        },

        printerDashboard: function () {
            var aURL = 'chrome://viviecr/content/printer_dashboard.xul';
            var width = this.screenwidth * .6;
            var height = this.screenheight * .8;

            var deviceController = GeckoJS.Controller.getInstanceByName('Devices');
            var devices = deviceController ? deviceController.getSelectedDevices() : [];
            GREUtils.Dialog.openWindow(window, aURL, _('Printer Dashboard'), 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height, devices);
        },

        AnnotateDialog: function (codes) {

            var buf = this._getKeypadController().getBuffer();
            this.requestCommand('clear', null, 'Cart');

            var txn = GeckoJS.Session.get('current_transaction');
            if (txn == null || txn.data == null || txn.data.id == null || txn.data.id == '') {
                NotifyUtils.warn(_('No order to add/view annotations'));
                return;
            }

            // retrieve annotation type if a single code is given
            var codeList = [];
            if (codes != null && codes != '') {

                if (txn.isSubmit() || txn.isCancel()) {
                    NotifyUtils.warn('Order is not open; annotations may not be added');
                    return;
                }

                codeList = codes.split(',');

                var annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
                var annotationType;

                if (codeList.length == 1 && codeList[0] != null && codeList[0] != '') {
                    annotationType = annotationController.getAnnotationType(codeList[0]);
                }
            }

            // only one annotationType is specified and is not null, use memo-style UI
            if (codeList.length == 1 && annotationType != null && annotationType != '') {
                var existingAnnotation = annotationController.retrieveAnnotation(txn.data.id, annotationType);
                var readonly = false;
                if (!this.Acl.isUserInRole('acl_modify_annotations')) {
                    // no privilege to modify annotation, we must make sure we don't
                    // overwrite existing annotation of the same type
                    if (existingAnnotation != '') {
                        readonly = true;
                    }
                }
                
                var text;
                if (buf != null && buf != '') {
                    text = buf;
                }
                else {
                    text = existingAnnotation;
                }

                var inputObj = {
                    input0: text,
                    require0: false,
                    multiline0: true,
                    readonly0: readonly
                };
                
                var data = [
                    _('Add Annotation'),
                    '',
                    _(annotationType),
                    '',
                    inputObj
                ];

                return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                    var result = evt.data;

                    if (result.ok && result.input0) {
                        if ('annotations' in txn.data) {
                            txn.data.annotations.push({type: annotationType, text: result.input0});
                        }
                        else {
                            txn.data.annotations = [{type: annotationType, text: result.input0}];
                        }

                        // save annotation in db
                        annotationController.annotate(txn.data.id, annotationType, result.input0);
                    }
                });
            }
            else {
                var aURL = "chrome://viviecr/content/annotate.xul";
                var aName = "Annotate";
                var aArguments = {order_id: txn.data.id, codes: codeList};
                var aFeatures = "chrome,titlebar,toolbar,centerscreen,modal,width=" + this.screenwidth + ",height=" + this.screenheight;

                window.openDialog(aURL, aName, aFeatures, aArguments);
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

        orderDialog: function () {
            var aURL = 'chrome://viviecr/content/view_order.xul';
            var aName = _('Order Details');
            var aArguments = {index: 'sequence', value: this._getKeypadController().getBuffer()};
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            
            //this._getKeypadController().clearBuffer();
            this.requestCommand('clearBuffer', null, 'Keypad');
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, aArguments);
            this.requestCommand('subtotal', null, 'Cart');
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

            // we first update catepanel's current selection
            if (catepanel.selectedIndex != index) {
                catepanel.selectedIndex = index;
                catepanel.selectedItems = [index];
            }
            
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
                    
                    catepanel.invalidate(index);
                }
                else if (dep.soldout) {
                    catepanel.selectedItems = [];
                    catepanel.selectedIndex = -1;

                    catepanel.invalidate(index);
                    return;
                }
                else {
                    if (typeof dep.no != 'undefined' && dep.cansale)  {
                        // department not group
                        var buf = this._getKeypadController().getBuffer();
                        if(GeckoJS.Session.get('cart_set_qty_value') != null || buf.length > 0  ) {
                            dep.cate_no = dep.no;
                            return this.requestCommand('addItem',dep,'Cart');
                        }
                    }

                    // change pluview panel
                    var clearBuf = GeckoJS.Configure.read("vivipos.fec.settings.ChangeDepartmentClearBuffer") || false;
                    if(clearBuf) this.requestCommand('clear',null,'Cart');
                    this.pluPanelView.setCatePanelIndex(index);
                    
                    // is this group linked to other departments/groups?
                    if (dep.link_department || dep.link_group) {
                        var categoryIndexes = [];
                        var plugroupIndexes = [];

                        if (dep.link_department) {
                            categoryIndexes = dep.link_department.split(',');
                        }

                        if (dep.link_group) {
                            plugroupIndexes = dep.link_group.split(',');
                        }
                        var departmentIndexes = categoryIndexes.concat(plugroupIndexes)

                        this.depPanelView.navigateDown(departmentIndexes);

                        document.getElementById('catescrollablepanel-top').hidden = false;
                    }
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
                    prodpanel.invalidate(index);
                }
                else if (!product.soldout) {
                    this.requestCommand('addItem',product,'Cart');

                    // return to top level if necessary
                    var returnToTop = GeckoJS.Configure.read('vivipos.fec.settings.department.pops.to.top');
                    var currentLevel = this.depPanelView.getCurrentLevel();

                    if (returnToTop && currentLevel > 0) {
                        this.depPanelView.navigateTop();
                        document.getElementById('catescrollablepanel-top').hidden = true;
                    }
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
                this.requestCommand('setClerk', null, 'Main');
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

        _showWaitPanel: function(panel, caption, title, sleepTime) {
            
            var waitPanel = document.getElementById(panel);
            var waitCaption = document.getElementById(caption);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            if (waitCaption) waitCaption.setAttribute("label", title);

            waitPanel.sizeTo(600, 120);
            var x = (width - 600) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        clearOrderData: function(days, pack) {
            // the number of days to retain

            var retainDays = days || GeckoJS.Configure.read('vivipos.fec.settings.OrderRetainDays') || 0;
            var weeklyPack = GeckoJS.Configure.read('vivipos.fec.settings.OrderWeeklyPack') || -1;

            if (retainDays > 0) {
                var oldLimit = GREUtils.Pref.getPref('dom.max_chrome_script_run_time');
                GREUtils.Pref.setPref('dom.max_chrome_script_run_time', 120 * 60);

                var waitPanel = this._showWaitPanel('wait_panel', 'common_wait', _('Removing old data...'), 1000);

                try {
                    var retainDate = Date.today().addDays(retainDays * -1).getTime() / 1000;

                    // dispatch beforeClearOrderData event
                    this.dispatchEvent('beforeClearOrderData', retainDate);

                    var order = new OrderModel();
                    var conditions = "orders.transaction_submitted<='" + retainDate +
                                     "' AND orders.status<='1'";

                    order.removeOrders(conditions);

                    // dispatch beforeClearOrderData event
                    this.dispatchEvent('afterClearOrderData', retainDate);

                    // if pack order data...
                    var today = (new Date()).getDay();

                    if (pack || (weeklyPack == today)) {
                        order.execute("VACUUM");
                    }

                    // dispatch afterPackOrderData event
                    this.dispatchEvent('afterPackOrderData', retainDate);

                    delete order;

                } catch (e) {}
                finally {
                    GREUtils.Pref.setPref('dom.max_chrome_script_run_time', oldLimit);
                    waitPanel.hidePopup();
                }


            }
        },

        reboot: function() {
            if (GREUtils.Dialog.confirm(null, _('Reboot'), _('Please confirm to reboot the terminal')) == false) {
                return;
            }
            this.rebootMachine();
        },

        shutdown: function() {
            if (GREUtils.Dialog.confirm(null, _('Shutdown'), _('Please confirm to shut down the terminal')) == false) {
                return;
            }
            this.shutdownMachine();
        },

        dispatch: function(arg) {
            var args = arg.split('|');

            $do(args[0], args[1], args[2]) ;
            /*
            var printer = GeckoJS.Controller.getInstanceByName('Print');
            if (printer) {
                printer.printReport('narrow', 'This is a narrow report [0x0C]');
            }
            */
        },

        shutdownMachine: function() {
            try {
                goShutdownMachine();
            }catch(e) {
            }
        },

        rebootMachine: function() {
            try {
                goRebootMachine();
            }catch(e) {
            }
        },

        suspendLoadTest: function(data) {
            this._suspendLoadTest = true;
        },

        loadTest: function(params) {
            var paramList = [];
            if (params) paramList = params.split(',');
            var count = parseInt(paramList[0]) || 1;
            var items = parseInt(paramList[1]) || 1;
            var resume = parseInt(paramList[2]) || 0;
            var customers = GeckoJS.Session.get('customers') || [];
            var products = GeckoJS.Session.get('products') || [];
            var numProds = products.length;
            var numCustomers = customers.length;
            
            var customerController = GeckoJS.Controller.getInstanceByName('Customers');
            
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var startIndex = 0;
            var waitPanel;

            var progressBar = document.getElementById('progress');
            progressBar.mode = 'determined';

            if (resume && this.loadTestState != null) {
                startIndex = this.loadTestState;
                this.loadTestState = null;
                progressBar.value = startIndex * 100 / count;
                waitPanel = this._showWaitPanel('wait_panel', 'common_wait', 'Resume Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }
            else {
                progressBar.value = 0;
                waitPanel = this._showWaitPanel('wait_panel', 'common_wait', 'Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }

            //this.sleep(100);
            
            for (var i = startIndex; i < count; i++) {

                if (this._suspendLoadTest) {
                    this._suspendLoadTest = false;
                    this.loadTestState = i;
                    
                    break;
                }

                // select a member
                if (customerController && numCustomers > 0) {
                    var cIndex = Math.floor(numCustomers * Math.random());
                    if (cIndex >= numCustomers) cIndex = numCustomers - 1;
                    
                    var customer = customers[cIndex];
                    var txn = cart._getTransaction(true);
                    customerController.processSetCustomerResult(txn, {ok: true, customer: customer});
                }

                for (var j = 0; j < items; j++) {

                    // select an item with no condiments from product list
                    var pindex = Math.floor(numProds * Math.random());
                    if (pindex >= numProds) pindex = numProds - 1;
                    
                    var item = products[pindex];
                    if (item.force_condiment) {
                        item.force_condiment = false;
                    }
                    if (item.force_memo) {
                        item.force_memo = false;
                    }

                    // add to cart
                    cart.addItem(item);

                    // delay
                    this.sleep(100 + 100 * Math.random());
                }
                // finalize order with cash
                cart.cash();

                // update progress bar
                progressBar.value = (i + 1) * 100 / count;

                // GC & delay
                GREUtils.gc();
                this.sleep(300 + 100 * Math.random());
            }

            waitPanel.hidePopup();
            progressBar.mode = 'undetermined';
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
