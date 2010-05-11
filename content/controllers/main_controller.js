(function(){

    var __controller__ = {

        name: 'Main',

        uses: ['Product', 'Order', 'TableSetting'],

        components: ['Tax'],

        screenwidth: 800,
        screenheight: 600,
        depPanelView: null,
        pluPanelView: null,

        doRestart: false,
        doReboot: false,
        restartClock: false,

        _suspendLoadTest: false,
        _groupPath: [],
        _suspendOperation: false,
        _suspendKeyboardOperation: false,
        _suspendOpelrationFilter: null,
        _isTraining: false,
        _launchingControlPanel: false,

        _savedHotKeys: null,

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
            this.sleep(500);
            
            this.createPluPanel();

            if (alertWin) {
                alertWin.close();
                delete alertWin;
            }
            
            //this.requestCommand('initial', null, 'Pricelevel');
            this.requestCommand('initial', null, 'Cart');
            this.requestCommand('initial', null, 'CartQueue');

            var deptNode = document.getElementById('catescrollablepanel');
            deptNode.selectedIndex = 0;
            deptNode.selectedItems = [0];
            
            // observer restart topic
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['prepare-to-restart', 'prepare-to-reboot', 'restart-clock', 'addons-message-notification', 'TrainingMode' ],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'prepare-to-restart' || aData == 'addons-restart-app') {
                        self.doRestart = true;
                    } else if (aTopic == 'prepare-to-reboot') {
                        self.doReboot = true;
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
                            this.setClerk(true);
                        }

                        this.dispatchEvent('onInitial', null);

                        this.requestCommand('recovery', tranData, 'Cart');

                        recovered = true;
                    }
                    catch(e) {}
                }
            }

            // listen for onIdle event
            var idleController = GeckoJS.Controller.getInstanceByName('Idle');
            if (idleController) {
                idleController.addEventListener('onIdle', this.idleHandler, this);
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

        idleHandler: function(evt) {
            if ( !this._isTraining ) {
                var signOff = GeckoJS.Configure.read('vivipos.fec.settings.SignOffWhenIdle');
                if (signOff) {

                    // make sure top most window is Vivipos Main window
                    if (this.isMainWindowOnTop()) {

                        // block UI
                        let waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', _('Signing off idle user..'), 200);

                        this.signOff(true);

                        this.ChangeUserDialog();

                        if (waitPanel) waitPanel.hidePopup();
                    }
                }
            }
        },

        disableHotKeys: function(userDefinedOnly) {
            if (!userDefinedOnly) {
                let keys = document.getElementById('keyset_extensions');
                if (keys) {
                    keys.setAttribute('disabled', true);
                }
            }

            let hotkeys = document.getElementById('hotkeySets');
            if (hotkeys) {
                this._savedHotKeys = hotkeys.keys;
                hotkeys.keys = [];
            }
        },

        restoreHotKeys: function(userDefinedOnly) {
            if (!userDefinedOnly) {
                let keys = document.getElementById('keyset_extensions');
                if (keys) {
                    keys.removeAttribute('disabled');
                }
            }
            
            let hotkeys = document.getElementById('hotkeySets');
            if (hotkeys) {
                hotkeys.keys = this._savedHotKeys;
            }
        },
        
        isMainWindowOnTop: function() {
            // check if top most window is Vivipos Main window
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX >= 0) {

                // check if any vivipanel is open
                var panels = $("vivipanel") || [];

                for (let i = 0; i < panels.length; i++) {
                    if ((panels[i].state == 'open') && !(panels[i].getAttribute('noblock'))) {
                        return false;
                    }
                }
                return true;
            }

            return false;

        },

        closeAllPopupPanels: function() {
            var panels = $("vivipanel") || [];

            for (let i = 0; i < panels.length; i++) {
                if (panels[i].state == 'open') {
                    panels[i].hidePopup();
                }
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
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
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
            var aArguments = {
                image: imageFile,
                icon: thumbFile
            };

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

            this.postControlPanelProcessing();
        },

        ChangeUserDialog: function () {
            var aURL = 'chrome://viviecr/content/changeuser.xul';
            var aName = _('Change User');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=no,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);

            this.requestCommand('setClerk', null, 'Main');
        },

        ClockInOutDialog: function () {
            var aURL = 'chrome://viviecr/content/clockinout.xul';
            var aName = _('Clock In/Out');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures);
        },

        PLUSearchDialog: function (addtocart) {
            var buf = this._getKeypadController().getBuffer();
            this.requestCommand('clearBuffer', null, 'Keypad');

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
            var aArguments = {
                buffer: buf,
                item: item,
                select: addtocart
            };
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);
            if (aArguments.ok) {
                if (addtocart && aArguments.item) {
                    let pid = aArguments.item.id;
                    if (pid) {
                        let productsById = GeckoJS.Session.get('productsById');
                        let prod = productsById[pid];
                        if (prod) {
                            this.requestCommand('addItem',prod,'Cart');
                        }
                    }
                }
                return prod;
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
                var annotationText;

                if (codeList.length == 1 && codeList[0] != null && codeList[0] != '') {
                    annotationType = annotationController.getAnnotationType(codeList[0]);
                    annotationText = annotationController.getAnnotationText(codeList[0]);
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
                    multiline0: 2,
                    readonly0: readonly,
                    sequence: txn.data.seq,
                    numpad: true,
                    type: annotationType,
                    text: annotationText
                };
                
                var data = [
                    _('Add Annotation') + ' [' + txn.data.seq + ']',
                    '',
                    annotationType,
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
                var aArguments = {
                    order: txn.data,
                    codes: codeList,
                    sequence: txn.data.seq,
                    txn:txn
                };
                var aFeatures = "chrome,titlebar,toolbar,centerscreen,modal,width=" + this.screenwidth + ",height=" + this.screenheight;

                this.topmostWindow.openDialog(aURL, aName, aFeatures, aArguments);
            }
        },

        openControlPanel: function(target) {

            target = target || '';
            if(target.length == 0) return false;

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;


            let controlpanelsObjs = GeckoJS.Configure.read('vivipos.fec.settings.controlpanels') || {};
            let fns = {};

            for( key in  controlpanelsObjs){
                 for(keyFn in controlpanelsObjs[key]){
                     controlpanelsObjs[key][keyFn].father = key ;
                 }
               fns = jQuery.extend(fns, controlpanelsObjs[key]);
            }

            let isExists = false;
            let pref=null;
            let path=null;
            let label=null;
            let roles=null;
            let keyFull='';
            let l18nLabel = '';
            let waitPanel;

            for (let key in fns) {

                pref = fns[key];
                path = pref.path;
                label = pref.label;
                roles = pref.roles;
                keyFull = 'vivipos.fec.settings.controlpanels'+'.'+ pref.father + '.' + key;

                // get l18n label
                if (label.indexOf('chrome://') == 0) {
                    l18nLabel = GeckoJS.StringBundle.getPrefLocalizedString(keyFull+'.label') || key;
                }
                else {
                    l18nLabel = label;
                }

                if ( (key == target) || (l18nLabel == target) || (label == target) ) {
                    isExists = true;

                    break;
                }
            }

            if (!isExists) {
                // function does not exist
                NotifyUtils.warn(_('Control panel function [%S] does not exist',[target]));
                return false;
            }

            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;

            if (this.Acl.isUserInRole(roles) || roles =='') {
                try {
                    waitPanel = this._showWaitPanel('blockui_panel', '', '', 0);
                    window.openDialog(path, "ControlPanel_" + label, features, pref);

                    this.postControlPanelProcessing();
                }
                catch(e) {}
                finally {
                    waitPanel.hidePopup();
                    return true;
                }
            }else{
                NotifyUtils.warn(_('You are not authorized to access the [%S] control panel function',[l18nLabel]));
                return false;
            }
        },

        launchControlPanel: function(pref) {

            var width = this.screenwidth;
            var height = this.screenheight;

            var features = pref['features'] || "chrome,popup=no,titlebar=no,toolbar,centerscreen";
            features += ",modal,width=" + width + ",height=" + height;

            if (this._launchingControlPanel) {
            // nothings to do
            }else {
                try {
                    this._launchingControlPanel = true;
                    
                    if (pref['type'] == 'uri') {
                        if (this.topmostWindow) {
                            this.topmostWindow.openDialog(pref['path'], pref['label'], features);
                        }
                        else {
                            window.openDialog(pref['path'], pref['label'], features);
                        }

                    }
                    else if (pref['type'] == 'function') {
                        var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");
                        mainWindow.$do(pref['method'], pref['data'], pref['controller']);
                    }
                    else {
                        VirtualKeyboard.show();

                        var paths = pref['path'].split(' ');
                        var launchAp = paths[0];
                        var args = paths.slice(1);

                        var fileAp = new GeckoJS.File(launchAp);
                        fileAp.run(args, true);

                        VirtualKeyboard.hide();
                    }
                }
                catch (e) {
                }
                finally {
                    this._launchingControlPanel = false;
                }
            }
        },

        postControlPanelProcessing: function() {
            if (this.doReboot) {
                this.rebootMachine();
            }

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

        viewOrders: function (arg) {
            var aURL = 'chrome://viviecr/content/list_orders.xul';
            var aName = _('List Orders');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var aArguments = {
                value: this._getKeypadController().getBuffer()
            };

            switch(arg) {
                case 'table':
                    aArguments.index = 'table_no';
                    aArguments.criteria = _('(view)search by table number');
                    aArguments.fuzzy = false;
                    break;

                case 'check':
                    aArguments.index = 'check_no';
                    aArguments.criteria = _('(view)search by check number');
                    aArguments.fuzzy = false;
                    break;

                case 'sequence':
                default:
                    aArguments.index = 'sequence';
                    aArguments.criteria = _('(view)search by order sequence');
                    aArguments.fuzzy = true;
                    break;
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
                        // @irving - 9/23/09: if no price is given, check if the selected department
                        //                    contains visible products. If not, notify user of error;
                        //                    otherwise, switch to the selected department
                        if(!isNaN(price)) {
                            return this.requestCommand('addItem',dep,'Cart');
                        }
                        else if (this.pluPanelView.getProductCount(index, true) == 0) {
                            NotifyUtils.error(_('Price must be given to register sale of department [%S]', [dep.name]));
                            return;
                        }
                    }

                    // update catepanel's current selection
                    catepanel.selectedIndex = index;
                    catepanel.selectedItems = [index];

                    // change pluview panel
                    var clearBuf = GeckoJS.Configure.read("vivipos.fec.settings.ChangeDepartmentClearBuffer") || false;
                    if(clearBuf) this.requestCommand('clear',null,'Cart');
                    this.pluPanelView.setCatePanelIndex(index);
                    
                    // is this group linked to other departments/groups?
                    if (dep.link_department || dep.link_group) {
                        let categoryIndexes = [];
                        let plugroupIndexes = [];
                        let departmentIndexes = [];
                        let plugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');

                        if (dep.link_department) {
                            categoryIndexes = dep.link_department.split(',');
                        }

                        if (dep.link_group) {
                            plugroupIndexes = dep.link_group.split(',');
                        }
                        if (plugroupsFirst) {
                            departmentIndexes = plugroupIndexes.concat(categoryIndexes);
                        }
                        else {
                            departmentIndexes = categoryIndexes.concat(plugroupIndexes);
                        }

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

        setClerk: function (recovery) {
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
                        _('An error was encountered while retrieving employees (error code %S) [message #1001].', [userModel.lastError]));
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

                if (!recovery) {
                    if (this.dispatchEvent('beforeSignedOn', user)) {
                        this.dispatchEvent('signedOn', user);
                    }

                    this.dispatchEvent('afterSignedOn', user);
                }
            }
            else {
                GeckoJS.Session.clear('user');
            }

        },

        rebuildTaxTable: function () {
            // extract all items
            alert('begin');
            var now = (new Date()).getTime();
            var orderItemModel = new OrderItemModel();
            var orderItems = orderItemModel.find('all', {conditions: "parent_index IS NULL", limit: 3000000, recursive: 0});
            var orderItemTaxModel = new OrderItemTaxModel();

            orderItems.forEach(function(item) {
                delete item.parent_index;
            });
            
            var txn = new Transaction();
            txn.data.items = orderItems;
            txn.calcItemsTax();

            var orderItemTaxes = [];

            // map taxes for individual items
            for (let index in orderItems) {

                let item = orderItems[index];
                let iid = item.id;
                for (let taxno in item.tax_details) {

                    let taxDetails = item.tax_details[taxno];
                    let tax = item.tax_details[taxno].tax;

                    let orderItemTax = {};
                    orderItemTax['id'] = iid + taxno;
                    orderItemTax['order_id'] = item.order_id;
                    orderItemTax['order_item_id'] = iid;
                    orderItemTax['promotion_id'] = '';
                    orderItemTax['tax_no'] = tax.no;
                    orderItemTax['tax_name'] = tax.name;
                    orderItemTax['tax_type'] = tax.type;
                    orderItemTax['tax_rate'] = tax.rate;
                    orderItemTax['tax_rate_type'] = tax.rate_type;
                    orderItemTax['tax_threshold'] = tax.threshold;
                    orderItemTax['tax_subtotal'] = taxDetails.charge;
                    orderItemTax['included_tax_subtotal'] = taxDetails.included;
                    orderItemTax['taxable_amount'] = taxDetails.taxable;

                    orderItemTaxes.push(orderItemTax);
                }
            }

            let order_tax_details = {};
            for(var itemIndex in orderItems) {
                var item = orderItems[itemIndex];

                if (!(item.order_id in order_tax_details)) {
                    order_tax_details[item.order_id] = {};
                }
                let items_tax_details = order_tax_details[item.order_id];

                // don't include set items in calculations
                if (!item.parent_index) {
                    // summarize tax details
                    if (item.tax_details) {
                        for (var key in item.tax_details) {
                            let taxDetails = item.tax_details[key];

                            if (!(key in items_tax_details)) {
                                items_tax_details[key] = {
                                    tax: taxDetails.tax,
                                    tax_subtotal: 0,
                                    included_tax_subtotal: 0,
                                    item_count: 0,
                                    taxable_amount: 0
                                }
                            }

                            if (item.sale_unit == 'unit') {
                                items_tax_details[key].item_count += parseInt(item.current_qty);
                            }
                            else {
                                items_tax_details[key].item_count++;
                            }
                            items_tax_details[key].tax_subtotal += parseFloat(taxDetails.charge);
                            items_tax_details[key].included_tax_subtotal += parseFloat(taxDetails.included);
                            items_tax_details[key].taxable_amount += parseFloat(taxDetails.taxable);
                        }
                    }
                }
            }

            // map taxes for order
            for (let oid in order_tax_details) {
                let items_tax_details = order_tax_details[oid];
                for (let taxno in items_tax_details) {
                    let taxDetails = items_tax_details[taxno];
                    let tax = taxDetails.tax;

                    let orderTax = {};
                    orderTax['id'] = oid + taxno;
                    orderTax['order_id'] = oid;
                    orderTax['order_item_id'] = '';
                    orderTax['promotion_id'] = '';
                    orderTax['tax_no'] = tax.no;
                    orderTax['tax_name'] = tax.name;
                    orderTax['tax_type'] = tax.type;
                    orderTax['tax_rate'] = tax.rate;
                    orderTax['tax_rate_type'] = tax.rate_type;
                    orderTax['tax_threshold'] = tax.threshold;
                    orderTax['tax_subtotal'] = taxDetails.tax_subtotal;
                    orderTax['included_tax_subtotal'] = taxDetails.included_tax_subtotal;
                    orderTax['item_count'] = taxDetails.item_count;
                    orderTax['taxable_amount'] = taxDetails.taxable_amount;

                    orderItemTaxes.push(orderTax);
                }
            }

            var loaded = (new Date()).getTime();
            alert('preparing to write tax records: ' + orderItemTaxes.length + ' (' + (loaded - now) + ')');
            now = (new Date()).getTime();
            orderItemTaxModel.begin();
            orderItemTaxModel.execute('delete from order_item_taxes');
            orderItemTaxModel.saveAll(orderItemTaxes);
            orderItemTaxModel.commit();
            
            var end = (new Date()).getTime();
            alert('done (' + (end - loaded) + ')');
        },

        updateOptions: function () {
            // used by input_line_controller to listen for option updates
        },

        initialLogin: function () {

            var defaultUserID = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
            var defaultUser = '';

            if (defaultUserID) {
                var userModel = new UserModel();
                var defaultUserRecord = userModel.findById(defaultUserID);
                if (defaultUserRecord) defaultUser = defaultUserRecord.username;
            }
            if (defaultUser && defaultUser.length > 0) {
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

        quickUserSwitch: function (stop) {
            if ( this._isTraining ) {
                GREUtils.Dialog.alert(this.topmostWindow,
                    _('Training Mode'),
                    _('To use this funciton, please leave training mode first'));
                return;
            }

            var data = [
            _('Switch User'),
            _('Please enter password')
            ];

            var self = this;
            return $.popupPanel('promptPasswordPanel', data).next( function(evt){
                var result = evt.data;

                if (result.ok) {
                    // check if has buffer (password)
                    self.requestCommand('clear', null, 'Cart');

                    var password = result.input0;

                    if (self.Acl.securityCheckByPassword(password, true)) {
                        self.signOff(true);
                        self.Acl.securityCheckByPassword(password, false);

                        var user = self.Acl.getUserPrincipal();
                        if (user) {
                            self.setClerk();

                            OsdUtils.info(user.description + _(' logged in'));
                        }
                        else {
                            // should always succeed, but if not, pull up the change user dialog since we've already signed off
                            self.ChangeUserDialog();
                        }
                    }
                    else {
                        NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                    }
                }
            });

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
                    _('An error was encountered while retrieving employees (error code %S) [message #1002].', [userModel.lastError]));
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
                        _('An error was encountered while retrieving employees (error code %S) [message #1003].', [userModel.lastError]));
                    return;
                }

                if (users == null || users.length == 0) {
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

                        OsdUtils.info(user.description + _(' logged in'));
                    }
                    else {
                        this.ChangeUserDialog();
                    }
                }
                else {
                    NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                }
            }
            else {
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

            // if not in quickSignoff mode, don't sign off unless we are on the main screen
            if (!quickSignoff) {
                if (!this.isMainWindowOnTop()) {
                    return;
                }
            }

            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var cartQueue = GeckoJS.Controller.getInstanceByName('CartQueue');
            var cartEmpty = !cart.ifHavingOpenedOrder();
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
                            var check = {
                                value: false
                            };

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
                    var promptDiscardQueue = !autoDiscardQueue && (responseDiscardCart != 0) && cartQueue._hasUserQueue(principal);

                    if (promptDiscardQueue) {
                        if (mustEmptyQueue) {
                            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Sign Off'), _('You have one or more queued orders. Discard them?')) == false) {
                                return;
                            }
                        }
                        else {
                            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                            .getService(Components.interfaces.nsIPromptService);
                            var check = {
                                value: false
                            };

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

                if (!cartEmpty) {
                    if (responseDiscardCart == 1) {
                        $do('cancel', true, 'Cart');
                    }
                    else {
                        $do('pushQueue', null, 'CartQueue');
                        $do('cancel', true, 'Cart');
                    }
                }
                $do('clear', true, 'Cart');

                if (responseDiscardQueue == 1) {
                    cartQueue._removeUserQueue(principal);
                }

                this.Acl.invalidate();
            }
            else {
                $do('clear', null, 'Cart');
                if (!cartEmpty) $do('cancel', true, 'Cart');
            }

            if (this.dispatchEvent('signedOff', principal)) {

                Transaction.removeRecoveryFile();

                // close all poup panels
                this.closeAllPopupPanels();

                if (!quickSignoff) {
                    this.ChangeUserDialog();
                }
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
            if (this._isTraining) {
                GREUtils.Dialog.alert(this.topmostWindow, _('Training Mode'), _('This function is not available in training mode'));
                return;
            }

            if (GREUtils.Dialog.confirm(this.topmostWindow,
                _('Remove All Transaction Records'),
                _('This operation will remove all transaction records. Are you sure you want to proceed?'))) {
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                    _('Remove All Transaction Records'),
                    _('Data will not be recoverable once removed. It is strongly recommended that the system be backed up before truncating transaction records. Proceed with data removal?'))) {

                    var waitPanel = this._showWaitPanel('wait_panel', 'wait_caption', _('Removing all transaction records'), 500);

                    // dispatch beforeTruncateTxnRecords event
                    if (this.dispatchEvent('beforeTruncateTxnRecords', null)) {

                        try {
                            // remove txn recovery file
                            Transaction.removeRecoveryFile();

                            // remove backup file
                            var ds = GeckoJS.ConnectionManager.getDataSource('backup');
                            if (ds && ds.config && ds.config.path) {
                                let nsIFiles = GeckoJS.Dir.readDir(ds.config.path, {type: 'f'});
                                nsIFiles.forEach(function(nsIFile) {
                                    if (nsIFile.exists()) {
                                        GREUtils.File.remove(nsIFile);
                                    }
                                }, this);
                            }

                            // truncate order_queues
                            (new OrderQueueModel()).execute('delete from order_queues');

                            // truncate order related tables
                            var orderModel = new OrderModel();
                            var r = orderModel.execute('delete from orders');

                            r = (new OrderReceiptModel()).execute('delete from order_receipts') && r;
                            r = (new OrderPromotionModel()).execute('delete from order_promotions') && r;
                            r = (new OrderPaymentModel()).execute('delete from order_payments') && r;
                            r = (new OrderObjectModel()).execute('delete from order_objects') && r;
                            r = (new OrderItemModel()).execute('delete from order_items') && r;
                            r = (new OrderItemTaxModel()).execute('delete from order_item_taxes') && r;
                            r = (new OrderItemCondimentModel()).execute('delete from order_item_condiments') && r;
                            r = (new OrderAnnotationModel()).execute('delete from order_annotations') && r;
                            r = (new OrderAdditionModel()).execute('delete from order_additions') && r;

                            // truncate clockin/out timestamps
                            r = (new ClockStampModel()).execute('delete from clock_stamps') && r;

                            // truncate sync tables
                            r = orderModel.execute('delete from syncs') && r;
                            r = orderModel.execute('delete from sync_remote_machines') && r;

                            // reset sequence
                            SequenceModel.resetSequence('order_no');
                            SequenceModel.resetSequence('check_no');

                            if (!r) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('An error was encountered while attempting to remove all transaction records [message #1011].') + '\n\n' +
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
                    if (waitPanel) waitPanel.hidePopup();
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
                    if (this.dispatchEvent('beforeClearOrderData', retainDate)) {

                        var order = new OrderModel();
                        var conditions = "orders.transaction_submitted<='" + retainDate +
                        "' AND orders.status<='1'";

                        var r = order.restoreFromBackup();
                        if (!r) {
                            throw {
                                errno: order.lastError,
                                errstr: order.lastErrorString,
                                errmsg: _('An error was encountered while expiring backup sales activity logs (error code %S) [message #1004].', [order.lastError])
                            };
                        }

                        r = order.removeOrders(conditions);
                        if (!r) {
                            throw {
                                errno: order.lastError,
                                errstr: order.lastErrorString,
                                errmsg: _('An error was encountered while expiring sales activity logs (error code %S) [message #1005].', [order.lastError])
                            };
                        }

                        // remove clock stamps
                        var clockstamp = new ClockStampModel();
                        r = clockstamp.restoreFromBackup();
                        if (!r) {
                            throw {
                                errno: clockstamp.lastError,
                                errstr: clockstamp.lastErrorString,
                                errmsg: _('An error was encountered while expiring backup employee attendance records (error code %S) [message #1006].', [clockstamp.lastError])
                            };
                        }

                        r = clockstamp.execute('delete from clock_stamps where created <= ' + retainDate);
                        if (!r) {
                            throw {
                                errno: clockstamp.lastError,
                                errstr: clockstamp.lastErrorString,
                                errmsg: _('An error was encountered while expiring employee attendance records (error code %S) [message #1007].', [clockstamp.lastError])
                            };
                        }

                        // remove order queues
                        var orderQueue = new OrderQueueModel();
                        r = orderQueue.removeQueues(retainDate);
                        if (!r) {
                            throw {
                                errno: orderQueue.lastError,
                                errstr: orderQueue.lastErrorString,
                                errmsg: _('An error was encountered while expiring order queues (error code %S) [message #1008].', [orderQueue.lastError])
                            };
                        }
                    
                        // dispatch afterClearOrderData event
                        this.dispatchEvent('afterClearOrderData', retainDate);
                    }

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
            var isMaster = (new StockRecordModel()).isRemoteService() === false;
            var isTraining = GeckoJS.Session.get("isTraining");
            var inputObj = {};

            if (isMaster && !isTraining) {

                // get adjustment type first
                var aURL = 'chrome://viviecr/content/prompt_stockadjustment.xul';
                var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=450,height=580';

                // retrieve list of suppliers
                var inventoryCommitmentModel = new InventoryCommitmentModel();
                var suppliers = inventoryCommitmentModel.find('all', {
                    fields: ['supplier'],
                    group: 'supplier',
                    limit: 3000,
                    recursive: 0
                });
                if (inventoryCommitmentModel.lastError != 0) {
                    this._dbError(inventoryCommitmentModel.lastError, inventoryCommitmentModel.lastErrorString,
                        _('An error was encountered while retrieving stock adjustment records (error code %S) [message #1010].', [inventoryCommitmentModel.lastError]));
                    suppliers = null;
                }

                inputObj = {
                    commit: true,
                    suppliers: suppliers,
                    backend: backend
                };

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
            this.dispatchEvent('beforeReboot', null);
            this.rebootMachine();
        },

        shutdown: function() {
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('Shutdown'), _('Please confirm to shut down the terminal')) == false) {
                return;
            }
            this.dispatchEvent('beforeShutdown', null);
            this.shutdownMachine();
        },

        dispatch: function(arg) {
            var args = arg.split(',');
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
            var aArguments = {
                initialized: false,
                restart: false,
                restarted: false
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);
        },
        
        suspendLoadTest: function() {
            this._suspendLoadTest = true;
        },

        loadTest: function(params) {
            var paramList = [];
            if (params) paramList = params.split('|');
            var count = parseInt(paramList[0]) || 1;
            var items = parseInt(paramList[1]) || 1;
            var store = parseInt(paramList[2]) || 0;
            var resume = parseInt(paramList[3]) || 0;
            var noTable = parseInt(paramList[4]) || 0;

            // parse user input
            var buf = this._getKeypadController().getBuffer() || '';
            this.requestCommand('clearBuffer', null, 'Keypad');
            var userParams = buf.split('.');
            if (userParams.length > 0 && !isNaN(parseInt(userParams[0]))) {
                count = parseInt(userParams[0]) || 1;
            }
            if (userParams.length > 1 && !isNaN(parseInt(userParams[1]))) {
                items = parseInt(userParams[1]) || 1;
            }
            if (userParams.length > 2 && !isNaN(parseInt(userParams[2]))) {
                store = parseInt(userParams[2]) || 0;
            }
            if (userParams.length > 3 && !isNaN(parseInt(userParams[3]))) {
                resume = parseInt(userParams[3]) || 0;
            }
            if (userParams.length > 4 && !isNaN(parseInt(userParams[4]))) {
                noTable = parseInt(userParams[4]) || 0;
            }

            this.log('WARN', 'Load test parameters\n   count=[' + count + ']\n   items=[' + items + ']\n   store=[' + store + ']\n   resume=[' + resume + ']\n   noTable=[' + noTable + ']\n\n');

            var customers = GeckoJS.Session.get('customers') || [];
            var products = GeckoJS.Session.get('products') || [];
            var numProds = products.length;
            var numCustomers = customers.length;

            var guestCheckController = GeckoJS.Controller.getInstanceByName('GuestCheck');
            var checkSeq = 0;
            var tables = GeckoJS.Session.get('tables') || [];
            var numTables = tables.length;
            var currentTableIndex = parseInt(numTables * Math.random());    // randomize starting table

            var tableSettings = this.TableSetting.getTableSettings(true);
            var maxCheckNo = tableSettings.MaxCheckNo || 100;

            var customerController = GeckoJS.Controller.getInstanceByName('Customers');

            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var waitPanel;

            // check if open order exist
            if (cart.ifHavingOpenedOrder()) {
                if (GREUtils.Dialog.confirm(this.topmostWindow, _('Load Test'), _('Open order exists, discard the order and proceed with the load test?'))) {
                    cart.cancel(true);
                }
                else {
                    return;
                }
            }

            var progressBar = document.getElementById('interruptible_progress');
            progressBar.mode = 'determined';

            var actionButton = document.getElementById('interruptible_action');

            if (actionButton) {
                actionButton.setAttribute('label', 'Suspend');
                actionButton.setAttribute('oncommand', '$do("suspendLoadTest", null, "Main");');
            }
            
            var ordersOpened = 0;
            var ordersClosed = 0;
            if (resume && this.loadTestState != null) {
                ordersOpened = this.loadTestState.opened;
                ordersClosed = this.loadTestState.closed;
                this.loadTestState = null;
                progressBar.value = ordersClosed * 100 / count;
                waitPanel = this._showWaitPanel('interruptible_wait_panel', 'interruptible_wait_caption', 'Resume Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }
            else {
                progressBar.value = 0;
                waitPanel = this._showWaitPanel('interruptible_wait_panel', 'interruptible_wait_caption', 'Load Testing (' + count + ' orders with ' + items + ' items)', 1000);
            }

            var currentTableNo = -1;
            var doRecall = true;

            try {
                while (ordersOpened < count || ordersClosed < count) {

                    if (this._suspendLoadTest) {
                        this._suspendLoadTest = false;
                        this.loadTestState = {opened: ordersOpened, closed: ordersClosed}

                        break;
                    }

                    // create new order or recall?
                    doRecall = (ordersClosed < count) && (ordersOpened >= count || Math.random() < 0.5);

                    // select a table in sequence
                    if (!noTable && numTables > 0) {
                        let tries = 0;
                        while (tries < numTables) {
                            let table = tables[currentTableIndex++];
                            currentTableIndex %= numTables;
                            tries++;

                            if (doRecall || guestCheckController.isTableAvailable(table)) {
                                currentTableNo = table.table_no;
                                break;
                            }
                        }
                    }

                    this.log('WARN', 'table number [' + currentTableNo + '] doRecall [' + doRecall + '] orders opened [' + ordersOpened + ']');

                    // found table, let's get a transaction'
                    if (currentTableNo > -1 || noTable) {
                        let recalled = false;
                        let txn;

                        if (!noTable && doRecall) {
                            let conditions = 'orders.table_no="' + currentTableNo + '" AND orders.status=2';
                            var orders = this.Order.getOrdersSummary(conditions, true);

                            if (orders.length > 0) {

                                // recall order
                                let index = Math.floor(Math.random() * orders.length);
                                let orderId = orders[index].Order.id;

                                if (guestCheckController.recallOrder(orderId)) {
                                    txn = cart._getTransaction();
                                    if (txn && txn.data) {
                                        if (txn.data.status == 0) {
                                            recalled = true;
                                            this.log('WARN', 'order recalled [' + txn.data.seq + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                        }
                                        else {
                                            this.log('WARN', 'skipping closed order [' + txn.data.seq + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                            txn = null;
                                        }
                                    }
                                    else {
                                        this.log('WARN', 'empty order recalled for orderId ['+ orderId + ']');
                                    }
                                }
                            }
                        }

                        if (!recalled && ordersOpened < count) {

                            // create a new order
                            if (currentTableNo > -1) {
                                if (guestCheckController.newTable(currentTableNo)) {
                                    txn = cart._getTransaction();
                                }
                            }

                            if (customerController && numCustomers > 0) {
                                let cIndex = Math.floor(numCustomers * Math.random());
                                if (cIndex >= numCustomers) cIndex = numCustomers - 1;

                                let customer = customers[cIndex];
                                txn = cart._getTransaction(true);
                                customerController.processSetCustomerResult(txn, {
                                    ok: true,
                                    customer: customer
                                });
                            }

                            if (txn) {
                                ordersOpened++;
                                this.log('WARN', 'new order opened [' + txn.data.seq + '] count [' + ordersOpened + '] status [' + txn.data.status + ']');

                                if (!noTable) {
                                    // assign number of guests
                                    txn.setNumberOfCustomers(parseInt(5 * Math.random() + 1));

                                    // assign check number if not auto-assigned
                                    if (txn.data.check_no == '') {
                                        txn.setCheckNo(++checkSeq % maxCheckNo);
                                    }
                                }
                            }
                        }

                        if (txn) {
                            // get current number of items
                            let itemCount = txn.data.qty_subtotal;
                            let itemsToAdd = items - itemCount;
                            let doStore = false;

                            if (ordersClosed >= count) {
                                doStore = true;
                            }
                            else if (itemsToAdd > 0) {
                                if (noTable) {
                                    doStore = Math.random() < 0.25;
                                }
                                else {
                                    doStore = Math.random() < 0.75;
                                }
                                if (store && doStore) {
                                    itemsToAdd = Math.min(itemsToAdd, Math.ceil(items * Math.random()));
                                }
                            }

                            // add items
                            for (let j = 0; j < itemsToAdd; j++) {

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
                                let beforeQty = txn.data.qty_subtotal;
                                $do('addItem', item, 'Cart');

                                // delay
                                this.sleep(100);

                                let attempts = 0;
                                while (beforeQty >= txn.data.qty_subtotal && attempts++ < 3) {
                                    // wait for addItem to complete
                                    this.sleep(200);
                                }

                                if (attempts > 0) {
                                    if (beforeQty >= txn.data.qty_subtotal) {
                                        this.log('WARN', 'timed out waiting for addItem to complete [' + attempts + ']');
                                    }
                                    else {
                                        this.log('WARN', 'waited for addItem to complete [' + attempts + ']');
                                    }
                                }
                            }

                            this.sleep(1000);

                            if (doStore) {
                                $do('storeCheck', null, 'Cart');

                                if (noTable) {
                                    this.log('WARN', 'storing order [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                    progressBar.value = (++ordersClosed * 100) / count;
                                    this.log('WARN', 'order stored [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                            }
                            else if (txn.data.qty_subtotal >= items) {
                                this.log('WARN', 'closing order [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + '] qty [' + txn.data.qty_subtotal + ']');
                                $do('cash', ',1,', 'Cart');

                                // update progress bar for order closed
                                if (txn.data.status == 1 || noTable) {
                                    progressBar.value = (++ordersClosed * 100) / count;
                                    this.log('WARN', 'order closed [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                                else {
                                    this.log('WARN', 'order not closed [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + ']');
                                }
                            }
                            else {
                                this.log('WARN', 'order not closed pending additem queue [' + txn.data.seq + '] count [' + ordersClosed + '] status [' + txn.data.status + '] recall [' + txn.data.recall + '] qty [' + txn.data.qty_subtotal + ']');
                            }
                        }
                        else {
                            // did not find an available order on the current table; do a small delay and retry
                            this.sleep(100);
                        }
                    }
                    else {
                        // did not find an active table; do a small delay and retry
                        this.sleep(100);
                    }
                    // GC & delay
                    GREUtils.gc();
                }
            }
            catch(e) {
                this.log('ERROR', 'exception caught [' + e + ']');
                var exec = new GeckoJS.File('/tmp/vmstat.sh');
                if (exec.exists()) {
                    var r = exec.run([], true);
                    exec.close();
                    this.log('ERROR', 'vmstat captured to /tmp/vmstat');
                }
            }
            finally {
                waitPanel.hidePopup();
                progressBar.mode = 'undetermined';
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database exception: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                _('Data Operation Error'),
                errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        },

        FunctionCustomizerDialog: function() {

            // check if current user is superuser
            let user = this.Acl.getUserPrincipal();
            if (!user || user.username != 'superuser') return;

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

        },


        /**
         * openReport 
         */
        openReport: function(reportName) {

            reportName = reportName || '';
            if(reportName.length == 0) return false;

            // open report support query string
            var queryString = '';
            var tmps = reportName.split(',');
            if (tmps.length >1) {
                reportName = tmps[0];
                queryString = tmps[1];
            }

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            // use report name not report key
            var reports = GeckoJS.Configure.read('vivipos.fec.reportpanels') || {};
            
            let isExists = false;
            let pref=null;
            let path=null;
            let label=null;
            let roles=null;
            let keyFull='';
            let l10nLabel = '';

            for (let key in reports) {

                pref = reports[key];
                path = pref.path;
                label = pref.label;
                roles = pref.roles;
                keyFull = 'vivipos.fec.reportpanels' + '.' + key;

                // get l10n label
                if (label.indexOf('chrome://') == 0) {
                    l10nLabel = GeckoJS.StringBundle.getPrefLocalizedString(keyFull+'.label') || key;
                }
                else {
                    l10nLabel = label;
                }

                if ( (key == reportName) || (l10nLabel == reportName) || (label == reportName) ) {
                    isExists = true;

                    // check custom report label
                    // "( Custom )" will be followed by the label to indicate that the report is custom one.
                    var re = /([a-z0-9]+-){4}[a-z0-9]+/;// regular expression for recognizing uuid which is the key of a custom report.
                    if ( re.test( key ) )
                        l10nLabel = "( " + _( "custom" ) + " )" + l10nLabel;

                    break;
                }
            }

            if (!isExists) {
                // report does not exist
                NotifyUtils.warn(_('Report [%S] does not exist',[reportName]));
                return false;
            }

            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=" + width + ",height=" + height;

            if (this.Acl.isUserInRole(roles)) {
                if (queryString.length >0) path += '?' + queryString;
                window.openDialog(path, "Report_" + label, features, pref);
                return true;
            }else{
                NotifyUtils.warn(_('You are not authorized to access the [%S] report',[l10nLabel]));
                return false;
            }

        },


        /**
         * openUserInRoleDialog
         *
         * @param {String} role can use comma for multiple roles
         * @param {Boolean} ignoreSuperuser
         * @return {Object} user
         */
        openUserInRoleDialog: function (role, ignoreSuperuser){

            role = role || '';
            ignoreSuperuser = ignoreSuperuser || false;

            var self = this;

            var usersInRole = [];
            var groupRoles = {};
            var roles = role.split(",");

            var users = (new UserModel()).find('all', {recursive: 0});

            users.forEach(function(user) {

                if (ignoreSuperuser && user.username == 'superuser') return ;

                let group = user.group;
                let rolesInGroup = [];

                if (group && groupRoles[group]) {
                    rolesInGroup = groupRoles[group];
                }else if (group){
                    rolesInGroup = self.Acl.getRoleListInGroup(group);
                    groupRoles[group] = rolesInGroup;
                }else {
                    // not thing
                }

                let isInRole = false;

                roles.forEach(function(r){

                   if(r.length==0) {
                       isInRole = true;
                       return;
                   }

                   if (GeckoJS.Array.inArray(r, rolesInGroup) != -1) {
                       isInRole = true;
                       return ;
                   }
                });

                if (isInRole) {
                    usersInRole.push(user);
                }

            });

            var aURL = 'chrome://viviecr/content/prompt_select_user.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=640,height=500';
            var inputObj = {
                users: usersInRole,
                user: null,
                numpad:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select User'), aFeatures, _('Select User'), inputObj);

            if (inputObj.ok && inputObj.user) {
                inputObj.user.description =  inputObj.user.description || inputObj.user.displayname;
                return inputObj.user;
            }

            return null;
        }


    };

    GeckoJS.Controller.extend(__controller__);
})();
