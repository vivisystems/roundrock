(function(){

    var __controller__ = {

        name: 'Main',

        uses: ['Product'],

        screenwidth: 800,
        screenheight: 600,
        depPanelView: null,
        pluPanelView: null,

        doRestart: false,
        restartClock: false,

        _suspendLoadTest: false,
        _groupPath: [],
        _suspendOperation: false,
        _suspendKeyboardOperation: false,
        _suspendOperationFilter: null,
        _isTraining: false,
    
        initial: function(firstrun) {
            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            if (firstrun) GeckoJS.Session.set('firstrun', firstrun);
            GeckoJS.Session.set('screenwidth', this.screenwidth);
            GeckoJS.Session.set('screenheight', this.screenheight);

            // initial product image paths
            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            var sPluDir = datapath + "/images/pluimages/";
            sPluDir = (sPluDir + '/').replace(/\/+/g,'/');

            var sOrigDir = datapath + "/images/original/";
            sOrigDir = (sOrigDir + '/').replace(/\/+/g,'/');

            GeckoJS.Session.set('original_directory', sOrigDir);
            GeckoJS.Session.set('pluimage_directory', sPluDir);

            // set up event listener to intercept all controller events
            var self = this;
            this._suspendOperationFilter = function(evt) {
                self.filterOperations(evt);
            };

            // put up waiting dialog
            var alertWin = this.showAlertDialog();
            this.sleep(1000);
            
            this.createPluPanel();

            if (alertWin) {
                alertWin.close();
                delete alertWin;
            }
            
            //this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');

            var deptNode = document.getElementById('catescrollablepanel');
            deptNode.selectedIndex = 0;
            deptNode.selectedItems = [0];
            
            // observer restart topic
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['prepare-to-restart', 'restart-clock', 'addons-message-notification', 'TrainingMode' ],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'prepare-to-restart' || aData == 'addons-restart-app') {
                        self.doRestart = true;
                    } else if (aTopic == 'restart-clock') {
                        self.restartClock = true;
                    } else if ( aTopic == 'TrainingMode' ) {
                        if ( aData == "start" ) {
                        	self._isTraining = true;
                        } else if ( aData == "exit" ) {
                        	self._isTraining = false;
                        }
                    }
                }
            }).register();

            this.dispatchEvent('beforeInitial', null);

            GeckoJS.Observer.notify(null, 'render', this);

            // since initialLogin may potentially block, let's invoke afterInitial to initialize controllers
            // ourselves

            this.dispatchEvent('afterInitial', null);

            // recover queued orders
            this.requestCommand('unserializeQueueFromRecoveryFile', null, 'Cart');

            // check transaction fail
            var recovered = false;
            if(Transaction.isRecoveryFileExists()) {

                var tranData = Transaction.unserializeFromRecoveryFile();

                if (tranData) {
                    try {
                        var serviceClerk = tranData.service_clerk;
                        // force login
                        this.Acl.securityCheck(serviceClerk, 'dummy', false, true);

                        // check if successfully logged in
                        if (this.Acl.getUserPrincipal()) {
                            // prevent onSetClerk event dispatch
                            this.dispatchedEvents['onSetClerk'] = true;
                            this.requestCommand('setClerk', null, 'Main');
                        }

                        this.dispatchEvent('onInitial', null);

                        this.requestCommand('recovery', tranData, 'Cart');

                        recovered = true;
                    }
                    catch(e) {}
                }
            }

            if (!recovered) {
                this.requestCommand('initialLogin', null, 'Main');
            }
            
        },

        restart: function() {
                try {
                    GREUtils.restartApplication();
                }
                catch(err) {
                }
        },

        showAlertDialog: function() {

            var width = 600;
            var height = 120;

            var aURL = 'chrome://viviecr/content/alert_product_initialization.xul';
            var aName = _('Product Initialization');
            var aArguments = {};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow' && (typeof win.width) == 'undefined')
                win = null;

            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return alertWin;
        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
        },

        _getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },

        filterOperations: function(evt) {
            if (this._suspendOperation && (this._suspendKeyboardOperation || evt.data.name != 'Keypad')) {
                evt.preventDefault();
            }
        },

        suspendOperation: function(all) {
            this._suspendOperation = true;
            if (all) {
                this._suspendKeyboardOpereation = true;
            }
        },

        resumeOperation: function() {
            this._suspendOperation = this._suspendKeyboardOperation = false;
        },

        PackageBuilderDialog: function() {

            // check if .packagebuilder exists
            var procPath = GeckoJS.Configure.read('ProfD');
            var builderMarker = new GeckoJS.File(procPath + '/.pkgbuilder');
            if (!builderMarker.exists()) return;

            // check for access privilege
            if (!this.Acl.isUserInRole('acl_internal_access')) {
                return;
            }

            // block UI
            var waitPanel = this._showWaitPanel('blockui_panel', '', '', 0);

            // invoke external script to capture screen image
            var uuid = GeckoJS.String.uuid();
            var dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            var captureScript = dataPath + '/scripts/capture_screen.sh';
            var imageFile = '/tmp/' + uuid + '.png';
            var thumbFile = '/tmp/' + uuid + '-thumbnail.png';
            var imageGeometry = this.screenwidth + 'x' + this.screenheight;
            var thumbGeometry = '160x120';

            var exec = new GeckoJS.File(captureScript);
            r = exec.run([imageFile, thumbFile, imageGeometry, thumbGeometry], true);
            exec.close();

            var aURL = 'chrome://viviecr/content/package_builder.xul';
            var aName = _('Package Builder');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {image: imageFile, icon: thumbFile };

            if (waitPanel) waitPanel.hidePopup();
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);

            GREUtils.File.remove(imageFile);
            GREUtils.File.remove(thumbFile);
        },

        ControlPanelDialog: function () {
        	if (GeckoJS.Session.get( "isTraining" )) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Training Mode'), _('Control Panel is disabled during training.'));
        		return;
        	}

            // check for access privilege
            if (!this.Acl.isUserInRole('acl_open_control_panel')) {
                NotifyUtils.warn(_('You are not authorized to access the control panel'));
                return;
            }
        		
            var aURL = 'chrome://viviecr/content/controlPanel.xul';
            var aName = _('Control Panel');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);

            if (this.doRestart) {
                this.restart();
            }

            if (this.restartClock) {
                try {
                    $('#clock')[0].stopClock();
                    $('#clock')[0].startClock();
                }
                catch(err) {
                }
            }

        },

        ChangeUserDialog: function () {
            var aURL = 'chrome://viviecr/content/changeuser.xul';
            var aName = _('Change User');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=no,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);
        },

        ClockInOutDialog: function () {
            var aURL = 'chrome://viviecr/content/clockinout.xul';
            var aName = _('Clock In/Out');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);
        },

        PLUSearchDialog: function (addtocart) {
            var buf = this._getKeypadController().getBuffer();

            var item;
            var txn = GeckoJS.Session.get('current_transaction');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart && txn) {
                var index = cart._cartView.getSelectedIndex();
                item = txn.getItemAt(index, true);
            }

            var aURL = 'chrome://viviecr/content/plusearch.xul';
            var aName = _('Product Search');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {buffer: buf, item: item, select: addtocart};
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);
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
            var width = this.screenwidth * .6;
            var height = this.screenheight * .8;
            var aURL = 'chrome://viviecr/content/printer_dashboard.xul';
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var deviceController = GeckoJS.Controller.getInstanceByName('Devices');
            var devices = deviceController ? deviceController.getSelectedDevices() : [];
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Printer Dashboard'), aFeatures, devices);
        },

        AnnotateDialog: function (codes) {

            var buf = this._getKeypadController().getBuffer();
            this.requestCommand('clearBuffer', null, 'Keypad');

            var txn = GeckoJS.Session.get('current_transaction');
            if (txn == null || txn.isCancel() || txn.isSubmit()) {
                NotifyUtils.warn(_('No order to add/view annotations'));
                return;
            }

            // retrieve annotation type if a single code is given
            var codeList = [];
            if (codes != null && codes != '') {

                codeList = codes.split(',');

                var annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
                var annotationType;

                if (codeList.length == 1 && codeList[0] != null && codeList[0] != '') {
                    annotationType = annotationController.getAnnotationType(codeList[0]);
                }
            }

            // only one annotationType is specified and is not null, use memo-style UI
            if (codeList.length == 1 && annotationType != null && annotationType != '') {
                var existingAnnotation = ('annotations' in txn.data) ? txn.data.annotations [ annotationType ] : '';

                if (existingAnnotation == undefined) {
                    existingAnnotation = '';
                }
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
                    multiline0: 4,
                    readonly0: readonly,
                    sequence: txn.data.seq,
                    numpad: true
                };
                
                var data = [
                    _('Add Annotation') + ' [' + txn.data.seq + ']',
                    '',
                    _(annotationType),
                    '',
                    inputObj
                ];

                return $.popupPanel('promptAdditemPanel', data).next( function(evt){
                    var result = evt.data;

                    if (result.ok) {
                        if (!('annotations' in txn.data)) {
                            txn.data.annotations = {};
                        }
                        if (result.input0.length > 0)
                            txn.data.annotations[ annotationType ] = result.input0;
                        else
                            delete txn.data.annotations[ annotationType ];

                        Transaction.serializeToRecoveryFile(txn);
                    }
                });
            }
            else {
                var aURL = 'chrome://viviecr/content/annotate.xul';
                var aName = _('Annotate Order');
                var aArguments = {order: txn.data, codes: codeList, sequence: txn.data.seq, txn:txn};
                var aFeatures = "chrome,titlebar,toolbar,centerscreen,modal,width=" + this.screenwidth + ",height=" + this.screenheight;

                this.topmostWindow.openDialog(aURL, aName, aFeatures, aArguments);
            }
        },

        viewOrders: function () {
            var aURL = 'chrome://viviecr/content/list_orders.xul';
            var aName = _('List Orders');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {value: this._getKeypadController().getBuffer()};

            var searchByTableNo = GeckoJS.Configure.read('vivipos.fec.settings.SearchOrderByTableNo');

            if (searchByTableNo) {
                aArguments.index = 'table_no';
                aArguments.criteria = _('(view)search by table number');
                aArguments.fuzzy = false;
            }
            else {
                aArguments.index = 'sequence';
                aArguments.criteria = _('(view)search by order sequence');
                aArguments.fuzzy = true;
            }
            //this._getKeypadController().clearBuffer();
            this.requestCommand('clearBuffer', null, 'Keypad');
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);
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
                        var price = parseFloat(buf);

                        // make sure we have a price
                        // @irving - 7/6/09: this check is moved to cart.addItem
                        //if(!isNaN(price)) {
                            dep.cate_no = dep.no;
                            return this.requestCommand('addItem',dep,'Cart');
                        /*
                        }
                        else {
                            NotifyUtils.error(_('Price must be given to register sale of department [%S]', [dep.name]));
                            return;
                        }
                        */
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
                //    - if user has role 'acl_change_price_level', use user default price level
                var userModel = new UserModel();

                var userRecord = userModel.findByIndex('first', {
                    index: "username",
                    value: user.username
                });

                if (parseInt(userModel.lastError) != 0) {
                    this._dbError(userModel.lastError, userModel.lastErrorString,
                                  _('An error was encountered while retrieving employees (error code %S).', [userModel.lastError]));
                    return;
                }

                var priceLevelSet = false;

                if (userRecord) {
                    // first, store user data in session

                    GeckoJS.Session.set('user', userRecord);
                    
                    var userPriceLevel = parseInt(userRecord.default_price_level);
                    //var canOverride = (GeckoJS.Array.inArray('acl_change_price_level', user.Roles) != -1);
                    var canOverride = this.Acl.isUserInRole('acl_change_price_level');

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
            // used by input_line_controller to listen for option updates
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
            if ( this._isTraining ) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Training Mode'),
                                      _('To use this funciton, please leave training mode first'));
                return;
            }

            if (stop || this._suspendOperation) {
                this.requestCommand('setTarget', 'Cart', 'Keypad');

                this._suspendOperation = false;
                this._getKeypadController().setNumberOnly(false);
                GeckoJS.Dispatcher.removeEventListener('beforeDispatch', this._suspendOperationFilter);
                
                // check if has buffer (password)
                var buf = this._getKeypadController().getBuffer().replace(/^\s*/, '').replace(/\s*$/, '');
                this.requestCommand('clear', null, 'Cart');

                var success = true;

                // dispatch onExitPassword for onscreenvfd
                this.dispatchEvent('onExitPassword');

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
                if (!success) {
                    if (!stop && buf.length > 0) {
                        
                        NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                    }
                }
            }
            else {
                this.requestCommand('clear', null, 'Cart');
                this.requestCommand('setTarget', 'Main', 'Keypad');

                this.dispatchEvent('onEnterPassword');

                this._suspendOperation = true;
                this._getKeypadController().setNumberOnly(true);
                GeckoJS.Dispatcher.addEventListener('beforeDispatch', this._suspendOperationFilter);
            }
        },

        silentUserSwitch: function (newUser) {
            if ( this._isTraining ) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Training Mode'),
                                      _('To use this funciton, please leave training mode first'));
                return;
            }
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

            if (parseInt(userModel.lastError) != 0) {
                this._dbError(userModel.lastError, userModel.lastErrorString,
                              _('An error was encountered while retrieving employees (error code %S).', [userModel.lastError]));
                return;
            }
            
            if (users == null || users.length == 0) {
                // no match found by username, let's try display name
                users = userModel.findByIndex('all', {
                    index: 'displayname',
                    value: newUser
                });

                if (parseInt(userModel.lastError) != 0) {
                    this._dbError(userModel.lastError, userModel.lastErrorString,
                                  _('An error was encountered while retrieving employees (error code %S).', [userModel.lastError]));
                    return;
                }

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
            if ( this._isTraining ) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Training Mode'),
                                      _('To use this funciton, please leave training mode first'));
                return;
            }
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
                            if (!GREUtils.Dialog.confirm(this.topmostWindow, _('Sign Off'), _('Discard items that have been registered?'))) return;
                            responseDiscardCart = 1;
                        }
                        else {
                            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                                    .getService(Components.interfaces.nsIPromptService);
                            var check = {value: false};

                            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                        prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                            var responseDiscardCart = prompts.confirmEx(this.topmostWindow,
                                                                        _('Sign Off'),
                                                                        _('What do you want to do with the registered items?'),
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
                            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Sign Off'), _('You have one or more queued orders. Discard them?')) == false) {
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

                            var responseDiscardQueue = prompts.confirmEx(this.topmostWindow,
                                                                         _('Sign Off'),
                                                                         _('You have one or more queued orders. What do you want to do with them?'),
                                                                         flags, _('Keep'), _('Discard'), "", null, check);
                            if (responseDiscardQueue == 2) return;
                        }
                    }
                    else if (responseDiscardCart == 0) { // queue order
                        responseDiscardQueue = 0;
                    }

                    if (!promptDiscardCart && !promptDiscardQueue)
                        if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm sign-off'), _('Are you ready to sign off?')) == false) {
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
                        $do('cancel', true, 'Cart');
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
                if (!cartEmpty) $do('cancel', true, 'Cart');
            }

            if (!quickSignoff) {
                this.clear();
                this.ChangeUserDialog();
            }
        },

        toggleVirtualKeyboard: function() {
            VirtualKeyboard.toggle();
        },

        _showWaitPanel: function(panel, caption, title, sleepTime, hide) {
            
            var waitPanel = document.getElementById(panel);
            var waitCaption = document.getElementById(caption);
            var progressbar = document.getElementById('progress');
            
            if (waitCaption) waitCaption.setAttribute("label", title);

            if (progressbar) {
                if (hide) progressbar.setAttribute('hidden', true);
                else progressbar.removeAttribute('hidden');
            }

            /*
            waitPanel.sizeTo(600, 120);
            */
            waitPanel.openPopupAtScreen(0, 0);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        truncateTxnRecords: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                                        _('Remove All Transaction Records'),
                                        _('This operation will remove all transaction records. Are you sure you want to proceed?'))) {
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Remove All Transaction Records'),
                                            _('Data will not be recoverable once removed. It is strongly recommended that the system be backed up before truncating transaction records. Proceed with data removal?'))) {

                    var waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', _('Removing all transaction records'), 500);

                    // dispatch beforeTruncateTxnRecords event
                    this.dispatchEvent('beforeTruncateTxnRecords', null);

                    try {
                        // remove txn recovery file
                        Transaction.removeRecoveryFile();

                        // remove cart queue recovery file
                        var cart = GeckoJS.Controller.getInstanceByName('Cart');
                        if (cart) {
                            cart.removeQueueRecoveryFile();
                        }

                        // truncate order related tables
                        var orderModel = new OrderModel();
                        var r = orderModel.truncate();
                        
                        r = (new OrderReceiptModel()).truncate() && r;
                        r = (new OrderPromotionModel()).truncate() && r;
                        r = (new OrderPaymentModel()).truncate() && r;
                        r = (new OrderObjectModel()).truncate() && r;
                        r = (new OrderItemModel()).truncate() && r;
                        r = (new OrderItemCondimentModel()).truncate() && r;
                        r = (new OrderAnnotationModel()).truncate() && r;
                        r = (new OrderAdditionModel()).truncate() && r;

                        // truncate clockin/out timestamps
                        r = (new ClockStampModel()).truncate() && r;

                        // truncate sync tables
                        r = orderModel.execute('delete from syncs') && r;
                        r = orderModel.execute('delete from sync_remote_machines') && r;

                        // reset sequence
                        SequenceModel.resetSequence('order_no');

                        if (!r) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                                  _('Data Operation Error'),
                                                  _('An error was encountered while attempting to remove all transaction records.') + '\n' +
                                                  _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
                        }
                        else {
                            // dispatch afterTruncateTxnRecords event
                            this.dispatchEvent('afterTruncateTxnRecords', null);
                        }

                        // pack order db
                        orderModel.execute('VACUUM');
                        
                    } catch (e) {}
                    finally {
                        waitPanel.hidePopup();
                    }

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Remove All Transaction Records'),
                                          _('Removal completed. Application will now restart'));

                    try {
                        GREUtils.restartApplication();
                    } catch(err) {
                    }

                }
            }
        },

        clearOrderData: function(days, pack) {
            // the number of days to retain

            var retainDays = days || GeckoJS.Configure.read('vivipos.fec.settings.OrderRetainDays') || 0;
            var weeklyPack = GeckoJS.Configure.read('vivipos.fec.settings.OrderWeeklyPack') || -1;

            if (retainDays > 0) {

                var waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', _('Removing expired transaction records'), 500);

                try {
                    var retainDate = Date.today().addDays(retainDays * -1).getTime() / 1000;

                    // dispatch beforeClearOrderData event
                    this.dispatchEvent('beforeClearOrderData', retainDate);

                    var order = new OrderModel();
                    var conditions = "orders.transaction_submitted<='" + retainDate +
                                     "' AND orders.status<='1'";

                    var r = order.restoreFromBackup();
                    if (!r) {
                        throw {errno: order.lastError,
                               errstr: order.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup sales activity logs (error code %S).', [order.lastError])};
                    }

                    r = order.removeOrders(conditions);
                    if (!r) {
                        throw {errno: order.lastError,
                               errstr: order.lastErrorString,
                               errmsg: _('An error was encountered while expiring sales activity logs (error code %S).', [order.lastError])};
                    }

                    // remove clock stamps
                    var clockstamp = new ClockStampModel();
                    r = clockstamp.restoreFromBackup();
                    if (!r) {
                        throw {errno: clockstamp.lastError,
                               errstr: clockstamp.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup employee attendance records (error code %S).', [clockstamp.lastError])};
                    }

                    r = clockstamp.execute('delete from clock_stamps where created <= ' + retainDate);
                    if (!r) {
                        throw {errno: clockstamp.lastError,
                               errstr: clockstamp.lastErrorString,
                               errmsg: _('An error was encountered while expiring employee attendance records (error code %S).', [clockstamp.lastError])};
                    }

                    // dispatch afterClearOrderData event
                    this.dispatchEvent('afterClearOrderData', retainDate);

                    // if pack order data...
                    var today = (new Date()).getDay();

                    if (pack || (weeklyPack == today)) {
                        order.execute("VACUUM");

                        // dispatch afterPackOrderData event
                        this.dispatchEvent('afterPackOrderData', retainDate);
                    }

                    delete order;

                } catch (e) {
                    this._dbError(e.errno, e.errstr, e.errmsg);
                }
                finally {
                    waitPanel.hidePopup();
                }
            }
        },
        
        stockAdjustment: function (backend) {
            var isMaster = (new StockRecordModel()).getRemoteServiceUrl('auth') === false;
            var isTraining = GeckoJS.Session.get("isTraining");
            var inputObj = {};

            if (isMaster && !isTraining) {

                // get adjustment type first
                var aURL = 'chrome://viviecr/content/prompt_stockadjustment.xul';
                var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=450,height=580';

                // retrieve list of suppliers
                var inventoryCommitmentModel = new InventoryCommitmentModel();
                var suppliers = inventoryCommitmentModel.find('all', {fields: ['supplier'],
                                                                      group: 'supplier',
                                                                      limit: 3000,
                                                                      recursive: 0});
                if (inventoryCommitmentModel.lastError != 0) {
                    this._dbError(inventoryCommitmentModel.lastError, inventoryCommitmentModel.lastErrorString,
                                  _('An error was encountered while retrieving stock adjustment records (error code %S).', [inventoryCommitmentModel.lastError]));
                    suppliers = null;
                }

                inputObj = {commit: true, suppliers: suppliers, backend: backend};

                GREUtils.Dialog.openWindow(
                    this.topmostWindow,
                    aURL,
                    _('Stock Adjustment'),
                    aFeatures,
                    inputObj
               );

               if (!inputObj.ok || inputObj.reason == '') return;
            }
            
            var aURL = 'chrome://viviecr/content/stock_records.xul';
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _( 'Adjust Stock' ), aFeatures, inputObj);
        },

        reboot: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Reboot'), _('Please confirm to reboot the terminal')) == false) {
                return;
            }
            this.rebootMachine();
        },

        shutdown: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Shutdown'), _('Please confirm to shut down the terminal')) == false) {
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

        wizardTest: function() {
            var aURL = 'chrome://viviecr/content/wizard_first.xul';
            var aName = _('VIVIPOS Setup');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {initialized: false, restart: false, restarted: false};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);
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
                waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', 'Resume Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }
            else {
                progressBar.value = 0;
                waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', 'Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
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
                    
                    var item = this.Product.getProductById(products[pindex].id);
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
                this.sleep(1000 + 1000 * Math.random());
            }

            waitPanel.hidePopup();
            progressBar.mode = 'undetermined';
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database exception: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        },

        FunctionCustomizerDialog: function() {

            // check if .funcmanager exists
            var procPath = GeckoJS.Configure.read('ProfD');
            var builderMarker = new GeckoJS.File(procPath + '/.fncustomizer');
            if (!builderMarker.exists()) return;

            // check for access privilege
            if (!this.Acl.isUserInRole('acl_internal_access')) {
                return;
            }

            var aURL = 'chrome://viviecr/content/function_customizer.xul';
            var aName = _('Function Customizer');
            var aFeatures = 'chrome,dialog,modal=no,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);

        }


    };

    GeckoJS.Controller.extend(__controller__);
})();
