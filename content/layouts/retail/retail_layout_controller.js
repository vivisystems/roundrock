(function(){
    
    var __controller__ = {

        name: 'Layout',
        
        initial: function() {
            
            this.resetLayout(true);

            // add event listener for SetClerk event
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onSetClerk', this.home, this);
            }
        },

        home: function() {
            var fnPanel = document.getElementById('functionpanel');
            if (fnPanel) fnPanel.home();
        },

        toggleFunctionPanel: function () {
            // noop for this layout
        },

        resizePanels: function (initial) {
            // resizing product/function panels
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');

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

            var fnRows = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows');
            if (fnRows == null) fnRows = 3;

            var fnCols = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns');
            if (fnCols == null) fnCols = 4;

            var showPlugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');
            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HideDeptScrollbar');
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HideFPScrollbar');
            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.CropPLULabel') || false;

            if (cropPLULabel) pluPanel.setAttribute('crop', 'end');

            if (deptPanel && (deptPanel.datasource.plugroupsFirst != showPlugroupsFirst)) {
                deptPanel.datasource.refreshView(false);
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

            if (fnPanel) {
                fnPanel.setAttribute('hideScrollbar', hideFPScrollbar)
                fnPanel._showHideScrollbar(hideFPScrollbar);

                // check if rows/columns have changed
                var currentRows = fnPanel.rows;
                var currentColumns = fnPanel.columns;

                if (initial || (currentRows != fnRows) ||
                    (currentColumns != fnCols)) {

                    // need to change layout, first retrieve h/vspacing

                    var hspacing = fnPanel.hspacing;
                    var vspacing = fnPanel.vspacing;

                    fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                }
            }
        },

        resetLayout: function (initial) {

            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HideSoldOutButtons') || false;
            var hideTag = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HideTagColumn') || false;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.ShowToolbar') || false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.layout.retail.HideBottomBox') || false;

            var bottombox = document.getElementById('vivipos-bottombox');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');

            if (toolbar) {
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
            }
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
        }
    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var layout = GeckoJS.Controller.getInstanceByName('Layout');
        if (layout) layout.initial();

    }, false);
})()
