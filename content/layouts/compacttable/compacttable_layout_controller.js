(function(){

    var __controller__ = {

        name: 'Layout',

        uses: ['TableSetting'],

        bannerSrcBase: '',
        defaultSrcBase: '',
        logoImageObj: null,
        _logoImageCounter: 0,
        components: ['OrderStatus'],
        tableSettings: null,
        keySettings: null,

        _keyprefix: 'vivipos.fec.settings.layout.compacttable.keys',
        _fnprefix: 'vivipos.fec.registry.function.programmable',

        initial: function() {
            
            this.resetLayout(true);

            // add event listener for SetClerk event
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onSetClerk', this.home, this);
            }

            // add event listener for table operations
            var guestCheck = GeckoJS.Controller.getInstanceByName('GuestCheck');
            if(guestCheck) {
                guestCheck.addEventListener('beforeSetAction', this.setTableAction, this);
            }

            var selectTable = GeckoJS.Controller.getInstanceByName('SelectTable');
            selectTable.setRegionMenuItem = function () {
                var regions = selectTable.Table.TableRegion.getTableRegions() || [];
                var regionObj = selectTable.getRegionMenuObj();

                // remove all child...
                while (regionObj.firstChild) {
                    regionObj.removeChild(regionObj.firstChild);
                }

                selectTable._regionName = [];
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', '0');
                menuitem.setAttribute('label', _('All Regions'));
                regionObj.appendChild(menuitem);
                selectTable._regionName.push(_('All Regions'));

                var index = 0;
                regions.forEach(function(data){
                    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                    // menuitem.setAttribute('value', data.id);
                    index++
                    menuitem.setAttribute('value', index);
                    menuitem.setAttribute('label', data.name);
                    regionObj.appendChild(menuitem);
                    this._regionName.push(data.name);
                }, this);

                selectTable._regionIndex = 0;
                document.getElementById('table_region').selectedIndex = this._regionIndex;

                var regionBox = document.getElementById('regBox');

                var btnAll = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                btnAll.setAttribute('label', 'All Regions');
                btnAll.setAttribute('id', 'Reg_0');
                btnAll.setAttribute('oncommand', '$do("setRegion", "ALL", "SelectTable");');
                regionBox.appendChild(btnAll);
                index = 0;
                regions.forEach(function(data){
                    var btn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                    // menuitem.setAttribute('value', data.id);
                    index++
                    btn.setAttribute('label', data.name);
                    btn.setAttribute('id', data.id);
                    btn.setAttribute('oncommand', '$do("setRegion", "' + data.id  +'", "SelectTable");');
                    regionBox.appendChild(btn);
                }, this);
            };

            var viewHelper  = selectTable.getTablesViewHelper();
           
            var orgRenderTableStatus = viewHelper.renderTableStatus;

            viewHelper.renderTableStatus = function(row, btn) {
                try{
                    orgRenderTableStatus.call(viewHelper, row, btn);
                    var subtotal = btn.num_subtotal;

                    if(subtotal > 999999) {
                        subtotal = (subtotal % 1000000 < 1000) ? (subtotal / 1000000).toFixed(0) + ('m') : (subtotal / 1000000).toFixed(2) + ('m');
                    } else if(subtotal > 999) {
                        subtotal = (subtotal % 1000 < 10) ? (subtotal / 1000).toFixed(0) + ('k') : (subtotal / 1000).toFixed(2) + ('k');
                    }

                    btn.subtotal = viewHelper.tableSettings.DisplayTotal ? ((btn.num_subtotal>0) ? (_("T#")+subtotal) : '') : '';

                    var sequence = btn.seq_no;

                    if(sequence.substr(0,2) == 'S#') {
                        sequence = sequence.substr(2, sequence.length - 2);
                        var sequence_length = GeckoJS.Configure.read('vivipos.fec.settings.SequenceNumberLength');
                        if(sequence.length > sequence_length) {
                            var date_end = sequence.length - sequence_length;
                            sequence = sequence.substr(date_end, sequence_length);
                        }
                    }

                    btn.seq_no = sequence;

                }catch(e){GeckoJS.BaseObject.log(e);}
            };

            // update logo image source
            var logoImageObj = document.getElementById('logoImage');
            if (logoImageObj) {
                this.logoSrc = this._getLogoSrc();
                this.logoImageObj = logoImageObj;

                logoImageObj.src = this.logoSrc;
            }

            // update express keys
            this.updateExpressKeys();
        },

        getKeySettings: function() {
            if (!this.keySettings) {
                let keys = [];
                let fns = GeckoJS.Configure.read(this._fnprefix) || [];
                let keyPrefs = GeckoJS.Configure.read(this._keyprefix) || [];
                let indices = GeckoJS.BaseObject.getKeys(keyPrefs);
                for (let index = 0; index < indices.length; index++) {
                    let i = indices[index];
                    let functionid = (keyPrefs[i] && keyPrefs[i].functionid) ? keyPrefs[i].functionid : '';
                    keys[i] = {
                        functionid: functionid,
                        command: (fns[functionid] && fns[functionid].command) ? fns[functionid].command : '',
                        label: (keyPrefs[i] && keyPrefs[i].label) ? keyPrefs[i].label : '',
                        access: (fns[functionid] && fns[functionid].access) ? fns[functionid].access : '',
                        controller: (fns[functionid] && fns[functionid].controller) ? fns[functionid].controller : '',
                        data: (keyPrefs[i] && keyPrefs[i].data) ? keyPrefs[i].data : ''
                    }
                }
                this.keySettings = keys;
            }
            return this.keySettings;
        },

        updateExpressKeys: function(keys) {
            if (keys) {
                this.keySettings = keys;
            }
            else {
                keys = this.getKeySettings();
            }
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let keyObj = document.getElementById('expressKey' + parseInt(i+1));
                if (key.functionid && (!key.access || this.Acl.isUserInRole(key.access))) {
                    keyObj.label = key.label;
                    keyObj.removeAttribute('disabled');
                }
                else {
                    keyObj.label = '';
                    keyObj.setAttribute('disabled', 'true');
                }
            }
        },

        invokeExpressKey: function(index) {
            let key = this.getKeySettings()[--index];

            if (key.linked && key.command && key.controller && (key.access == '' || this.Acl.isUserInRole(key.access))) {
                this.requestCommand(key.command, key.data, key.controller);
            }
        },
        
        /**
         * expandOverlayPanel
         */
        expandOverlayPanel: function() {
            
            var panel = $('#selectTablePanel')[0];

            var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            let top = 0+'px';
            let left = 0+'px';
            let width = screenwidth+'px';
            let height = screenheight+'px';

            $(panel.popupOverlay).css({
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    'z-index': 900
                });
        },

        /**
         * restoreOverlayPanel
         */
        restoreOverlayPanel: function() {

            var panel = $('#selectTablePanel')[0];

            var tableSettings = this.getTableSettings();

            let top = tableSettings.TableDockTop +'px';
            let left = tableSettings.TableDockLeft + 'px';
            let width = tableSettings.TableDockWidth + 'px';
            let height = tableSettings.TableDockHeight +'px';

            $(panel.popupOverlay).css({
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    'z-index': 900
                });
        },

        getTableSettings: function() {
            if(!this.tableSettings) {
                this.tableSettings = this.TableSetting.getTableSettings();
            }
            return this.tableSettings;
        },

        validateTableAction: function() {

        },

        setTableAction: function(evt) {
            let cart = GeckoJS.Controller.getInstanceByName('Cart');
            let txn = cart._getTransaction();
            if (cart.ifHavingOpenedOrder() && txn.data.recall) {
                // check txn is modified ?
                if (txn && txn.isModified()) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Table Operation'), _('Please close the transaction in progress first'));
                    cart._clearAndSubtotal();
                    evt.preventDefault();
                    return;
                }else {
                    // force cancel if order not modified.
                    cart.cancel(true);
                }
            }

            let action = evt.data;
            switch(action) {
                case 'selectTable':
                    this.hidePromptBox();
                    break;

                default:
                    this.showPromptBox();
                    break;
            }
        },

        showPromptBox: function() {
            // expand overlay panel to cover entire screen
            this.expandOverlayPanel();
            document.getElementById('prompt_box').hidden = false;
        },

        hidePromptBox: function() {
            this.restoreOverlayPanel();
            document.getElementById('prompt_box').hidden = true;
        },
        
        _getLogoSrc: function() {
            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
            var sDstDir = datapath + "/images/pluimages/";
            if (!sDstDir) sDstDir = '/data/images/pluimages/';
            sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

            return 'file://' + sDstDir + 'logo.png';
        },

        home: function() {
            var fnPanel = document.getElementById('functionpanel');
            if (fnPanel) fnPanel.home();
            this.updateExpressKeys();
        },

        toggleFunctionPanel: function (state) {
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var toggleBtn = document.getElementById('togglefunctionpanel');
            var clockinBtn = document.getElementById('clockin');
            var configBtn = document.getElementById('config');
            var vkbBtn = document.getElementById('vkb');
            var spacer = document.getElementById('spacer');
            var cartSidebar = document.getElementById('cartsidebar');
            var isHidden = fnPanelContainer.getAttribute('hidden') || 'false';
            var hidePanel = (state == null || state == '') ? (isHidden == 'false') : state;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.ShowToolbar') || false;

            if (hidePanel) {
                if (fnPanelContainer && (isHidden != 'true')) {
                    // relocate toolbar buttons to cartSidebar if showToolbar is on
                    if (cartSidebar) {
                        if (showToolbar) {
                            cartSidebar.appendChild(vkbBtn);
                            cartSidebar.appendChild(clockinBtn);
                            cartSidebar.appendChild(configBtn);
                        }
                        cartSidebar.appendChild(spacer);
                        cartSidebar.appendChild(toggleBtn);
                    }

                    fnPanelContainer.setAttribute('hidden', 'true');
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'true');
            }
            else {
                // if already visible then don't change
                if (fnPanelContainer && (isHidden == 'true')) {
                    // return toolbar buttons to toolbar

                    if (toolbar) {
                        if (showToolbar) {
                            if (vkbBtn) toolbar.appendChild(vkbBtn);
                            if (clockinBtn) toolbar.appendChild(clockinBtn);
                            if (configBtn) toolbar.appendChild(configBtn);
                        }
                        if (spacer) toolbar.appendChild(spacer);
                        if (toggleBtn) toolbar.appendChild(toggleBtn);
                    }

                    fnPanelContainer.setAttribute('hidden', 'false');
                    fnPanel.width = fnPanel.boxObject.width;
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'false');
            }
        },

        resizePanels: function (initial) {
            // resizing product/function panels
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var condPanel = document.getElementById('condimentscrollablepanel');

            var logoContainer = document.getElementById('logoPanelContainer');
            
            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            if (departmentRows == null) departmentRows = 3;

            var departmentCols = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols');
            if (departmentCols == null) departmentCols = 4;

            var departmentButtonHeight = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentButtonHeight');
            if (departmentButtonHeight == null) departmentButtonHeight = 50;

            var pluRows = GeckoJS.Configure.read('vivipos.fec.settings.PluRows');
            if (pluRows == null) pluRows = 4;

            var pluCols = GeckoJS.Configure.read('vivipos.fec.settings.PluCols');
            if (pluCols == null) pluCols = 4;

            var condRows = GeckoJS.Configure.read('vivipos.fec.settings.CondimentRows');
            if (condRows == null) condRows = 7;

            var condCols = GeckoJS.Configure.read('vivipos.fec.settings.CondimentCols');
            if (condCols == null) condCols = 4;

            var fnRows = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows');
            if (fnRows == null) fnRows = 3;

            var fnCols = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns');
            if (fnCols == null) fnCols = 4;

            var showPlugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');
            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.traditional.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideFPScrollbar');

            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.traditional.CropPLULabel') || false;

            var logoHeight = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoHeight');
            var logoWidth = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoWidth');
            if (isNaN(logoHeight)) logoHeight = 50;
            if (isNaN(logoWidth)) logoWidth = 50;

            if (logoHeight > 0 && logoContainer) {
                logoContainer.setAttribute('hidden', false);
                logoContainer.setAttribute('height', logoHeight);
                logoContainer.setAttribute('width', logoWidth);

                logoContainer.setAttribute('hidden', false);

                if (!this.logoSrc) this.logoSrc = this._getLogoSrc();
                if (!this.logoImageObj) this.logoImageObj = document.getElementById('logoImage');

                if (this.logoImageObj && this.logoSrc) {
                    this.logoImageObj.src = this.logoSrc + '?' + this._logoImageCounter++;
                    this.logoImageObj.setAttribute('height', logoHeight);
                    this.logoImageObj.setAttribute('width', logoWidth);
                }
            }
            else {
                logoContainer.setAttribute('hidden', true);
            }

            // not all layout supports fnHeight
            var fnHeight = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.height') || 200;

            if (cropPLULabel) pluPanel.setAttribute('crop', 'end');

            if (condPanel &&
                (initial ||
                 (condPanel.vivibuttonpanel.getAttribute('rows') != condRows) ||
                 (condPanel.vivibuttonpanel.getAttribute('cols') != condCols))) {
                condPanel.vivibuttonpanel.rows = condRows;
                condPanel.vivibuttonpanel.cols = condCols;

                condPanel.initGrid();

                if (!initial) {
                    // @hack irving
                    // make panel visible to let changes take effect
                    $.popupPanel('selectCondimentPanel', {});
                    $.hidePanel('selectCondimentPanel', {});
                    condPanel.vivibuttonpanel.resizeButtons();// this line bring about an error when initial is true.
                }
            }
            
            if (deptPanel &&
                (initial ||
                 (deptPanel.getAttribute('rows') != departmentRows) ||
                 (deptPanel.getAttribute('cols') != departmentCols) ||
                 (deptPanel.getAttribute('buttonHeight') != departmentButtonHeight) ||
                 (deptPanel.datasource.plugroupsFirst != showPlugroupsFirst) ||
                 (cropDeptLabel && (deptPanel.getAttribute('crop') != 'end')) ||
                 (!cropDeptLabel && (deptPanel.getAttribute('crop') == 'end')) ||
                 (deptPanel.getAttribute('hideScrollbar') != hideDeptScrollbar))) {

                deptPanel.setAttribute('rows', departmentRows);
                deptPanel.setAttribute('cols', departmentCols);
                deptPanel.setAttribute('buttonHeight', departmentButtonHeight);

                if (cropDeptLabel) deptPanel.setAttribute('crop', 'end');
                else deptPanel.removeAttribute('crop');

                if ((departmentRows > 0) && (departmentCols > 0) && (departmentButtonHeight > 0)) {
                    deptPanel.setAttribute('hideScrollbar', hideDeptScrollbar);
                    deptPanel.setAttribute('hidden', false);
                    deptPanel.initGrid();

                    deptPanel.datasource.refreshView();
                    deptPanel.vivibuttonpanel.refresh();
                }
                else {
                    deptPanel.setAttribute('hidden', true);
                }
            }

            if (pluPanel &&
                (initial ||
                 (pluPanel.getAttribute('rows') != pluRows) ||
                 (pluPanel.getAttribute('cols') != pluCols) ||
                 (cropPLULabel && (pluPanel.getAttribute('crop') != 'end')) ||
                 (!cropPLULabel && (pluPanel.getAttribute('crop') == 'end')) ||
                 (pluPanel.getAttribute('hideScrollbar') != hidePLUScrollbar))) {

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

            if (deptPanel) deptPanel.vivibuttonpanel.resizeButtons();
            if (pluPanel) pluPanel.vivibuttonpanel.resizeButtons();

            if (fnPanel && !fnPanelContainer.hidden) {
                fnPanel.setAttribute('hideScrollbar', hideFPScrollbar)
                fnPanel._showHideScrollbar(hideFPScrollbar);

                // check if rows/columns have changed
                var currentRows = fnPanel.rows;
                var currentColumns = fnPanel.columns;
                var currentHeight = fnPanel.height;

                if (initial || (currentRows != fnRows) ||
                    (currentColumns != fnCols) || (currentHeight != fnHeight)) {

                    // need to change layout, first retrieve h/vspacing

                    var hspacing = fnPanel.hspacing;
                    var vspacing = fnPanel.vspacing;

                    if (fnHeight && fnPanelContainer) {
                        fnPanelContainer.setAttribute('style', 'height: ' + fnHeight + 'px; max-height: ' + fnHeight + 'px; min-height: ' + fnHeight + 'px');
                        fnPanel.setAttribute('height', fnHeight);
                    }
                    fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                }
                fnPanel.width = fnPanel.boxObject.width;
            }
        },
        
        resetLayout: function (initial) {

            // not any layout templates support it
            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.layout.RegisterAtLeft') || false;
            var productPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.layout.traditional.ProductPanelOnTop') || false;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.ShowToolbar') || false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideBottomBox') || false;

            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.layout.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideSoldOutButtons') || false;
            
            var hbox = document.getElementById('mainPanel');
            var bottombox = document.getElementById('vivipos-bottombox');
            var productPanel = document.getElementById('rightPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');
            
            if (hbox) {
                hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
                hbox.setAttribute('class', registerAtLeft ? 'main-panel-left' : 'main-panel-right');
            }
            if (productPanel) productPanel.setAttribute('dir', productPanelOnTop ? 'reverse' : 'normal');

            if (deptPanel) deptPanel.setAttribute('dir', !registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', !registerAtLeft ? 'normal' : 'reverse');
            if (fnPanelContainer) fnPanelContainer.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (toolbar) {
                if (showToolbar) {
                    fnPanel.setAttribute('hidden', true);
                    fnPanel.width = 0;
                }
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
                fnPanel.removeAttribute('hidden');
            }
            if (cartList) cartList.setAttribute('dir', 'normal');
            if (checkTrackingStatus) {
                checkTrackingStatus.setAttribute('hidden', checkTrackingMode ? 'false' : 'true');
            }

            // cart display fields
            var defaults = cartList.getAttribute('defaultfields') || '';
            var cartFields = GeckoJS.Configure.read('vivipos.fec.settings.layout.CartDisplayFields') || defaults;
            var headers = cartList.getAttribute('headerlist') || '';
            var fields = cartList.getAttribute('fieldlist') || '';
            var headerArray = headers.split(',');
            var fieldArray = fields.split(',');
            var displayArray = cartFields.split(',');

            var selectedHeaders = '';
            var selectedFields = '';

            if (fieldArray.length > 0) {
                fieldArray.forEach(function(f, i) {
                    if (displayArray.indexOf(f) > -1) {
                        selectedHeaders += ((selectedHeaders == '' ? '' : ',') + headerArray[i]);
                        selectedFields += ((selectedFields == '' ? '' : ',') + fieldArray[i]);
                    }
                });
            }
            cartList.setAttribute('headers', selectedHeaders);
            cartList.setAttribute('fields', selectedFields);

            cartList.vivitree.initTreecols();
            
            // display sold out buttons
            if (soldOutCategory) soldOutCategory.setAttribute('hidden', hideSoldOutButtons ? 'true' : 'false');
            if (soldOutProduct) soldOutProduct.setAttribute('hidden', hideSoldOutButtons ? 'true' : 'false');

            this.resizePanels(initial);
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var layout = GeckoJS.Controller.getInstanceByName('Layout');
        if (layout) layout.initial();

    }, false);
})();