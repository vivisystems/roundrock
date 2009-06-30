(function(){

    var __controller__ = {

        name: 'Layout',

        _layout: {},
        _selectedLayout: '',

        loadOverlay: function() {

            var selectedLayout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            var layouts = GeckoJS.Configure.read('vivipos.fec.registry.layouts') || {};

            var layoutOverlayUri = 'chrome://viviecr/content/layouts/traditional.xul';

            if (layouts[selectedLayout]) {
                layoutOverlayUri = layouts[selectedLayout]['overlay_uri'] || layoutOverlayUri;
            }

            //GREUtils.log('selectedLayout = ' + selectedLayout + ', overlay_uri = ' + layoutOverlayUri);

            var observer = {
                observe : function (subject, topic, data) {
                    if (topic == 'xul-overlay-merged') {
                        // load functional panels;
                        document.loadOverlay('chrome://viviecr/content/bootstrap_mainscreen_overlays.xul', null);
                    }
                }
            };

            try {
                document.loadOverlay(layoutOverlayUri, observer);
            }catch(e) {
                if (layoutOverlayUri != 'chrome://viviecr/content/layouts/traditional.xul') {
                    // try load default
                    document.loadOverlay('chrome://viviecr/content/layouts/traditional.xul', observer);
                }
            }
            
        },
    
        initial: function() {
            
            var selectedLayout = GeckoJS.Configure.read('vivipos.fec.general.layouts.selectedLayout') || 'traditional';
            var layouts = GeckoJS.Configure.read('vivipos.fec.registry.layouts') || {};

            this._selectedLayout = selectedLayout;
            this._layout = layouts[selectedLayout];

            this.resetLayout(true);

            // add event listener for onUpdateOptions events
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                //main.addEventListener('onUpdateOptions', this.handleUpdateOptions, this);
                main.addEventListener('onSetClerk', this.home, this);
            }
        },

        home: function() {
            var fnPanel = document.getElementById('functionpanel');
            if (fnPanel) fnPanel.home();
        },

        toggleFunctionPanel: function (state) {
            var fnPanel = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var toggleBtn = document.getElementById('togglefunctionpanel');
            var clockinBtn = document.getElementById('clockin');
            var configBtn = document.getElementById('config');
            var vkbBtn = document.getElementById('vkb');
            var spacer = document.getElementById('spacer');
            var cartSidebar = document.getElementById('cartsidebar');
            var isHidden = fnPanel.getAttribute('hidden') || 'false';
            var hidePanel = (state == null || state == '') ? (isHidden == 'false') : state;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.ShowToolbar') || false;

            if (hidePanel) {
                if (fnPanel && (isHidden != 'true')) {
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

                    fnPanel.setAttribute('hidden', 'true');
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'true');
            }
            else {
                // if already visible then don't change
                if (fnPanel && (isHidden == 'true')) {
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

                    fnPanel.setAttribute('hidden', 'false');
                }
                if (toggleBtn) toggleBtn.setAttribute('state', 'false');
            }
        },

        resizePanels: function (disabled_features, initial) {
            // resizing product/function panels
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var condPanel = document.getElementById('condimentscrollablepanel');
            
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

            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.HideFPScrollbar');
            var showPlugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');
            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.CropPLULabel') || false;

            // not all layout supports fnHeight
            var fnHeight = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.height') || 200;
            if (GeckoJS.Array.inArray("fnheightFeature", disabled_features) != -1) fnHeight = 0;

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
                    condPanel.vivibuttonpanel.resizeButtons();// this line bring about an error when initial is true.
                    $.popupPanel('selectCondimentPanel', {});
                    $.hidePanel('selectCondimentPanel', {});
                }
            }
/*
            if (deptPanel && (deptPanel.datasource.plugroupsFirst != showPlugroupsFirst)) {
                deptPanel.datasource.refreshView(false);
            }
*/
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

                    // @hack to allow vivibuttons to be fully instantiated
                    this.sleep(100);
                    
                    deptPanel.datasource.refreshView(true);
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
                    
                    // @hack to allow vivibuttons to be fully instantiated
                    this.sleep(100);
                    
                    pluPanel.vivibuttonpanel.refresh();
                }
                else {
                    pluPanel.setAttribute('hidden', true);
                }

            }

            if (deptPanel) deptPanel.vivibuttonpanel.resizeButtons();
            if (pluPanel) pluPanel.vivibuttonpanel.resizeButtons();

            if (fnPanel) {
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
                    //fnPanel.setAttribute('width', fnWidth);
                }
            }
        },
        
        resetLayout: function (initial) {
            var layout = this._layout ;
            var disabled_features = layout ? (layout['disabled_features'] || "").split(",") : [];

            // not any layout templates support it
            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.RegisterAtLeft') || false;
            if (GeckoJS.Array.inArray("RegisterAtLeft", disabled_features) != -1) registerAtLeft = false;

            var productPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.ProductPanelOnTop') || false;
            if (GeckoJS.Array.inArray("ProductPanelOnTop", disabled_features) != -1) productPanelOnTop = false;

            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.HideSoldOutButtons') || false;
            var hideTag = GeckoJS.Configure.read('vivipos.fec.settings.HideTagColumn') || false;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.ShowToolbar') || false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.HideBottomBox') || false;
            
            var hbox = document.getElementById('mainPanel');
            var bottombox = document.getElementById('vivipos-bottombox');
            var productPanel = document.getElementById('productPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var toolbarPanel = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (productPanel) productPanel.setAttribute('dir', productPanelOnTop ? 'reverse' : 'normal');

            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanel) fnPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (toolbarPanel) {
                toolbarPanel.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            }
            if (toolbar) {
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
            }
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

            this.resizePanels(disabled_features, initial);
        },

        handleUpdateOptions: function(evt) {
            this.resetLayout(false);
        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('ViviposStartup', function() {
        // trip, invoke directly
        __controller__.loadOverlay.apply(__controller__);

    }, false);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
            main.requestCommand('initial', null, 'Layout');
        });

    }, false);
})();

