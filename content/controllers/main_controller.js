
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
            
            var buf = this._getKeypadController().getBuffer();
            this.requestCommand('clear', null, 'Cart');
            var item;
            var txn = GeckoJS.Session.get('current_transaction');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart && txn) {
                var index = cart._cartView.getSelectedIndex();
                item = txn.getItemAt(index);
            }

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = "PLUSearch";
            var aArguments = {buffer: buf, item: item};
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            //$do('load', null, 'Categories');

            GREUtils.Dialog.openDialog(window, aURL, aName, aArguments, posX, posY, width, height);
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
                    prodpanel.invalidate(index);
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
            this.dispatchEvent('onSetClerk', userRecord);
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

        _showWaitPanel: function(panel, caption, title, sleepTime) {
            
            var waitPanel = document.getElementById(panel);
            var waitCaption = document.getElementById(caption);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            if (waitCaption) waitCaption.setAttribute("label", title);

            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        clearOrderData: function(days) {
            // the number of days to retain
            var retainDays = days || GeckoJS.Configure.read('vivipos.fec.settings.OrderRetainDays') || 0;

            if (retainDays > 0) {
                var waitPanel = this._showWaitPanel('wait_panel', 'common_wait', _('Removing old data...'), 1000);

                try {
                    var retainDate = Date.today().addDays(retainDays * -1).getTime() / 1000;

                    var order = new OrderModel();
                    var conditions = "orders.transaction_submitted<='" + retainDate +
                                     "' AND orders.status<='1'";
                    order.removeOrders(conditions);
                    delete order;

                } catch (e) {}
                finally {
                    waitPanel.hidePopup();
                }
            }
        },

        dispatch: function(arg) {

            var args = arg.split('|');

            //this.requestCommand(args[0], args[1], args[2]) ;
            var printer = GeckoJS.Controller.getInstanceByName('Print');
            if (printer) {
                printer.printReport('narrow', 'This is a narrow report [0x0C]');
            }
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


    });

})();

