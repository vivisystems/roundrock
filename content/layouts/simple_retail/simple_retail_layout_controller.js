(function(){

    var __controller__ = {

        name: 'Layout',

        bannerSrcBase: '',
        defaultSrcBase: '',
        bannerImageObj: null,
        _bannerImageCounter: 0,

        initial: function() {
            
            this.resetLayout(true);

            // update banner image source
            var bannerImageObj = document.getElementById('bannerImage');
            if (bannerImageObj) {
                var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
                var sDstDir = datapath + "/images/pluimages/";
                if (!sDstDir) sDstDir = '/data/images/pluimages/';
                sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

                this.bannerSrcBase = 'file://' + sDstDir + 'banner.png';
                this.bannerImageObj = bannerImageObj;
                
                bannerImageObj.src = this.bannerSrcBase;
            }
            
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

        resizePanels: function (initial) {

            // banner
            var mainPanel = document.getElementById('mainPanel');
            var bannerPanelContainer = document.getElementById('bannerPanelContainer');

            // resizing department panel
            var deptPanel = document.getElementById('catescrollablepanel');
            var deptPanelContainer = document.getElementById('categoryPanelContainer');
            
            // resizing function panel
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var condPanel = document.getElementById('condimentscrollablepanel');
            
            var departmentRows = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows');
            if (departmentRows == null) departmentRows = 3;

            var departmentCols = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols');
            if (departmentCols == null) departmentCols = 4;

            var departmentButtonHeight = GeckoJS.Configure.read('vivipos.fec.settings.DepartmentButtonHeight');
            if (departmentButtonHeight == null) departmentButtonHeight = 50;

            var condRows = GeckoJS.Configure.read('vivipos.fec.settings.CondimentRows');
            if (condRows == null) condRows = 7;

            var condCols = GeckoJS.Configure.read('vivipos.fec.settings.CondimentCols');
            if (condCols == null) condCols = 4;

            var fnRows = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.rows');
            if (fnRows == null) fnRows = 3;

            var fnCols = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.columns');
            if (fnCols == null) fnCols = 4;

            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideFPScrollbar');
            var showPlugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');
            var hideDeptScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideDeptScrollbar');

            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.CropDeptLabel') || false;

            var fnHeight = GeckoJS.Configure.read('vivipos.fec.settings.functionpanel.height');
            if (isNaN(fnHeight)) fnHeight = 200;

            var bannerHeight = GeckoJS.Configure.read('vivipos.fec.settings.layout.simple_retail.BannerHeight');
            if (isNaN(bannerHeight)) bannerHeight = 50;
            
            var bannerAtBottom = GeckoJS.Configure.read('vivipos.fec.settings.layout.simple_retail.BannerAtBottom') || false;

            if (bannerHeight > 0 && bannerPanelContainer) {
                bannerPanelContainer.setAttribute('hidden', false);
                bannerPanelContainer.setAttribute('height', bannerHeight);

                bannerPanelContainer.setAttribute('hidden', false);
                
                if (mainPanel) mainPanel.setAttribute('dir', bannerAtBottom ? 'reverse' : 'normal');
                
                if (this.bannerImageObj && this.bannerSrcBase) {
                    this.bannerImageObj.src = this.bannerSrcBase + '?' + this._bannerImageCounter++;
                }
            }
            else {
                bannerPanelContainer.setAttribute('hidden', true);
            }

            // increment no photo image counter
            this.requestCommand('incrementNoPhotoImgCounter', null, 'ProductImage');
            
            // refresh current product photo
            var cartTreeList = document.getElementById('cartList');

            if (cartTreeList) {
                this.requestCommand('updateImage', cartTreeList.selectedIndex, 'ProductImage');
            }

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

                    if (condRows > 0 && condCols > 0) {
                        condPanel.vivibuttonpanel.resizeButtons();// this line bring about an error when initial is true.
                    }
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
                    deptPanelContainer.setAttribute('hidden', false);
                    deptPanel.setAttribute('hideScrollbar', hideDeptScrollbar);
                    deptPanel.initGrid();
                    
                    deptPanel.datasource.refreshView();
                    deptPanel.vivibuttonpanel.refresh();

                    deptPanel.vivibuttonpanel.resizeButtons();
                }
                else {
                    deptPanelContainer.setAttribute('hidden', true);
                }
            }

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
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.ShowToolbar') || false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideBottomBox') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideSoldOutButtons') || false;

            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.layout.CheckTrackingMode') || false;
            
            var hbox = document.getElementById('mainBody');
            var bottombox = document.getElementById('vivipos-bottombox');
            var deptPanel = document.getElementById('catescrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var promotions_status = document.getElementById('promotions_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (promotions_status) promotions_status.promotions_tree.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal')
            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanelContainer) fnPanelContainer.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (toolbar) {
                if (showToolbar) {
                    fnPanel.setAttribute('hidden', true);
                    fnPanel.width = 0;
                }
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
                fnPanel.removeAttribute('hidden');
            }
            if (cartList) cartList.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
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
