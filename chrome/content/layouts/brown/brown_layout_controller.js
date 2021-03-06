(function(){

    var __controller__ = {

        name: 'Layout',

        returnStatusObj: null,

        initial: function() {
            
            this.resetLayout(true);

            // add event listener for SetClerk event
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('onSetClerk', this.home, this);
            }

            // add event listener for return mode events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            this.returnStatusObj = document.getElementById('returnStatus');

            if (cart && this.returnStatusObj) {
                cart.addEventListener('onReturnSingle', this.onReturnSingle, this);
                cart.addEventListener('onReturnAll', this.onReturnAll, this);
                cart.addEventListener('onReturnCleared', this.onReturnCleared, this);
            }

            // dynamically register control panel for fixed function panel
            var prefService = Components.classes["@mozilla.org/preferences-service;1"]  
                                            .getService(Components.interfaces.nsIPrefService);  
            var branch = prefService.getDefaultBranch("");
            branch.setCharPref("vivipos.fec.settings.controlpanels.config.fixedfunctionpanel.icon", "chrome://viviecr/skin/icons/icon_functionpnl.png");
            branch.setCharPref("vivipos.fec.settings.controlpanels.config.fixedfunctionpanel.label", "chrome://roundrock/locale/messages.properties");
            branch.setCharPref("vivipos.fec.settings.controlpanels.config.fixedfunctionpanel.path", "chrome://roundrock/content/layouts/brown/fixedfuncpanelecrprefs.xul");
            branch.setCharPref("vivipos.fec.settings.controlpanels.config.fixedfunctionpanel.roles", "acl_manage_function_panel");
        },

        onReturnSingle: function() {
            this.returnStatusObj.value = _('Return Single');
        },

        onReturnAll: function() {
            this.returnStatusObj.value = _('Return All');
        },

        onReturnCleared: function() {
            this.returnStatusObj.value = '';
        },

        home: function() {
            var fnPanel = document.getElementById('functionpanel');
            if (fnPanel) fnPanel.home();
        },

        resizePanels: function (initial) {
            
            // resizing product/function panels
            var deptPanel = document.getElementById('catescrollablepanel');
            var deptPanelContainer = document.getElementById('categoryPanelContainer');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var pluPanelContainer = document.getElementById('productPanelContainer');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var fixedFnPanel = document.getElementById('fixedFunctionpanel');
            var condPanel = document.getElementById('condimentscrollablepanel');

            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            if (departmentRows == null) departmentRows = 3;

            var departmentCols = 5;

            var pluCols = 5;

            // pluRows + departmentRows = 5, pluRows >= 0, departmentRows >= 0
            if (departmentRows < 0) departmentRows = 0;
            if (departmentRows > 5) departmentRows = 5;

            var pluRows = 5 - departmentRows;
            
            var fnRows = 3;
            var fnCols = 6;

            if (GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows') != fnRows) {
                GeckoJS.Configure.write('vivipos.fec.settings.functionpanel.rows', fnRows);
            }
            if (GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns') != fnCols) {
                GeckoJS.Configure.write('vivipos.fec.settings.functionpanel.columns', fnCols);
            }

            var fixedFnRows = 4;
            var fixedFnCols = 6;
            
            if (GeckoJS.Configure.read('vivipos.fec.settings.fixedfunctionpanel.rows') != fixedFnRows) {
                GeckoJS.Configure.write('vivipos.fec.settings.fixedfunctionpanel.rows', fixedFnRows);
            }
            if (GeckoJS.Configure.read('vivipos.fec.settings.fixedfunctionpanel.columns') != fixedFnCols) {
                GeckoJS.Configure.write('vivipos.fec.settings.fixedfunctionpanel.columns', fixedFnCols);
            }
            
            var hideDeptScrollbar = true;
            var hidePLUScrollbar = true;
            var hideFPScrollbar = true;
            var showPlugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');

            var condRows = GeckoJS.Configure.read('vivipos.fec.settings.CondimentRows');
            if (condRows == null) condRows = 7;

            var condCols = GeckoJS.Configure.read('vivipos.fec.settings.CondimentCols');
            if (condCols == null) condCols = 4;

            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.blue.CropPLULabel') || false;

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

            if (deptPanel && !deptPanelContainer.hidden) {
                if (initial ||
                    (deptPanel.getAttribute('rows') != departmentRows) ||
                    (deptPanel.getAttribute('cols') != departmentCols) ||
                    (deptPanel.datasource.plugroupsFirst != showPlugroupsFirst) ||
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

                        deptPanel.datasource.refreshView();
                        deptPanel.vivibuttonpanel.refresh();
                    }
                    else {
                        deptPanel.setAttribute('hidden', true);
                    }
                }

                if (departmentRows > 0 && departmentCols > 0) {
                    deptPanel.vivibuttonpanel.resizeButtons();
                }
            }

            if (pluPanel && !pluPanelContainer.hidden) {
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
                
                if (pluRows > 0 && pluCols > 0) {
                    pluPanel.vivibuttonpanel.resizeButtons();
                }
            }
            
            if (fnPanel && !fnPanelContainer.hidden) {
                fnPanel.setAttribute('hideScrollbar', hideFPScrollbar)
                fnPanel._showHideScrollbar(hideFPScrollbar);

                // check if rows/columns have changed
                let currentRows = fnPanel.rows;
                let currentColumns = fnPanel.columns;

                if (initial || (currentRows != fnRows) ||
                    (currentColumns != fnCols)) {

                    // need to change layout, first retrieve h/vspacing

                    let hspacing = fnPanel.hspacing;
                    let vspacing = fnPanel.vspacing;

                    fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                }
                fnPanel.width = fnPanel.boxObject.width;
            }

            if (fixedFnPanel) {
                fixedFnPanel.setAttribute('hideScrollbar', hideFPScrollbar)
                fixedFnPanel._showHideScrollbar(hideFPScrollbar);

                // check if rows/columns have changed
                let currentRows = fixedFnPanel.rows;
                let currentColumns = fixedFnPanel.columns;

                if (initial || (currentRows != fixedFnRows) ||
                    (currentColumns != fixedFnCols)) {

                    // need to change layout, first retrieve h/vspacing

                    let hspacing = fixedFnPanel.hspacing;
                    let vspacing = fixedFnPanel.vspacing;

                    fixedFnPanel.setSize(fixedFnRows, fixedFnCols, hspacing, vspacing);
                }
                fixedFnPanel.width = fixedFnPanel.boxObject.width;
            }
        },
        
        resetLayout: function (initial) {
            // not any layout templates support it
            var showToolbar = false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideBottomBox');

            var bottombox = document.getElementById('vivipos-bottombox');
            var fnPanel = document.getElementById('functionpanel');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');
            

            if (toolbar) {
                if (showToolbar) {
                    fnPanel.setAttribute('hidden', true);
                    fnPanel.width = 0;
                }
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
                fnPanel.removeAttribute('hidden');
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
