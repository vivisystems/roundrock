
(function(){

    /**
     * Layout Controller
     */
    var __controller__ = {

        name: 'Layout',
    
        initial: function() {

            this.resetLayout(true);

            // add event listener for onUpdateOptions events
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onUpdateOptions', this.handleUpdateOptions, this);
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
            var optionsBtn = document.getElementById('options');
            var vkbBtn = document.getElementById('vkb');
            var spacer = document.getElementById('spacer');
            var cartSidebar = document.getElementById('cartsidebar');
            var isHidden = fnPanel.getAttribute('hidden') || 'false';
            var hidePanel = (state == null) ? (isHidden == 'false') : state;

            if (hidePanel) {
                if (fnPanel && (isHidden != 'true')) {
                    // relocate toolbar buttons to cartSidebar
                    if (cartSidebar) {
                        cartSidebar.appendChild(vkbBtn);
                        cartSidebar.appendChild(clockinBtn);
                        cartSidebar.appendChild(optionsBtn);
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
                        if (vkbBtn) toolbar.appendChild(vkbBtn);
                        if (clockinBtn) toolbar.appendChild(clockinBtn);
                        if (optionsBtn) toolbar.appendChild(optionsBtn);
                        if (spacer) toolbar.appendChild(spacer);
                        if (toggleBtn) toolbar.appendChild(toggleBtn);
                    }

                    fnPanel.setAttribute('hidden', 'false');
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
            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.CropPLULabel') || false;
            var fnHeight = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.height') || 200;

            if (cropPLULabel) pluPanel.setAttribute('crop', 'end');

            if (initial ||
                (condPanel.vivibuttonpanel.getAttribute('rows') != condRows) ||
                (condPanel.vivibuttonpanel.getAttribute('cols') != condCols)) {
                condPanel.vivibuttonpanel.rows = condRows;
                condPanel.vivibuttonpanel.cols = condCols;

                condPanel.initGrid();
                condPanel.vivibuttonpanel.resizeButtons();

                if (!initial) {
                    // @hack irving
                    // make panel visible to let changes take effect
                    $.popupPanel('selectCondimentPanel', {});
                    $.hidePanel('selectCondimentPanel', {});
                }
            }
            
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

                if ((departmentRows > 0) && (departmentCols > 0) && (departmentButtonHeight > 0)) {
                    deptPanel.setAttribute('hideScrollbar', hideDeptScrollbar);
                    deptPanel.setAttribute('hidden', false);
                    deptPanel.initGrid();

                    // @hack to allow vivibuttons to be fully instantiated
                    this.sleep(100);

                    deptPanel.vivibuttonpanel.refresh();
                }
                else {
                    deptPanel.setAttribute('hidden', true);
                }
            }

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

                // check if rows/columns have changed
                var currentRows = fnPanel.rows;
                var currentColumns = fnPanel.columns;
                var currentHeight = fnPanel.height;

                if (initial || (currentRows != fnRows) ||
                    (currentColumns != fnCols) || (currentHeight != fnHeight)) {

                    // need to change layout, first retrieve h/vspacing

                    var hspacing = fnPanel.hspacing;
                    var vspacing = fnPanel.vspacing;

                    fnPanelContainer.setAttribute('style', 'height: ' + fnHeight + 'px; max-height: ' + fnHeight + 'px; min-height: ' + fnHeight + 'px');
                    fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                    fnPanel.setAttribute('height', fnHeight);
                    //fnPanel.setAttribute('width', fnWidth);
                }
            }
        },
        
        resetLayout: function (initial) {
            var registerAtLeft = GeckoJS.Configure.read('vivipos.fec.settings.RegisterAtLeft') || false;
            var productPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.ProductPanelOnTop') || false;
            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.HideSoldOutButtons') || false;
            var hideTag = GeckoJS.Configure.read('vivipos.fec.settings.HideTagColumn') || false;
            
            var hbox = document.getElementById('mainPanel');
            var productPanel = document.getElementById('productPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionPanel');
            var toolbarPanel = document.getElementById('functionPanelContainer');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (productPanel) productPanel.setAttribute('dir', productPanelOnTop ? 'reverse' : 'normal');
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

            this.resizePanels(initial);
        },

        handleUpdateOptions: function(evt) {
            this.resetLayout(false);
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Layout');
                                      });

    }, false);
})();

