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
            var hidePLUScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.brown.HidePLUScrollbar');
            var hideFPScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideFPScrollbar');

            var cropDeptLabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.CropDeptLabel') || false;
            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.brown.CropPLULabel') || false;

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
            
            if (deptPanel) {
                if (initial ||
                    (deptPanel.getAttribute('rows') != departmentRows) ||
                    (deptPanel.getAttribute('cols') != departmentCols) ||
                    (deptPanel.getAttribute('buttonHeight') != departmentButtonHeight) ||
                    (deptPanel.datasource.plugroupsFirst != showPlugroupsFirst) ||
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

                        deptPanel.datasource.refreshView();
                        deptPanel.vivibuttonpanel.refresh();
                    }
                    else {
                        deptPanel.setAttribute('hidden', true);
                    }
                }

                if (departmentRows > 0 && departmentCols > 0 && departmentButtonHeight > 0) {
                    deptPanel.vivibuttonpanel.resizeButtons();
                }
            }

            if (pluPanel) {
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
            var productPanelOnTop = GeckoJS.Configure.read('vivipos.fec.settings.layout.brown.ProductPanelOnTop') || false;
            var showToolbar = GeckoJS.Configure.read('vivipos.fec.settings.layout.ShowToolbar') || false;
            var hideBottomBox = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideBottomBox') || false;

            var checkTrackingMode = GeckoJS.Configure.read('vivipos.fec.settings.layout.CheckTrackingMode') || false;
            var hideSoldOutButtons = GeckoJS.Configure.read('vivipos.fec.settings.layout.HideSoldOutButtons') || false;
            
            var hbox = document.getElementById('mainPanel');
            var bottombox = document.getElementById('vivipos-bottombox');
            var productPanel = document.getElementById('leftPanel');
            var deptPanel = document.getElementById('catescrollablepanel');
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var toolbar = document.getElementById('toolbar');
            var cartList = document.getElementById('cartList');
            var checkTrackingStatus = document.getElementById('vivipos_fec_check_tracking_status');
            var soldOutCategory = document.getElementById('catescrollablepanel-soldout');
            var soldOutProduct = document.getElementById('prodscrollablepanel-soldout');
            var now = new Date();
            var labDate = document.getElementById('labDate');
            var labTime = document.getElementById('labTime');

            if (hideBottomBox) bottombox.setAttribute('hidden', 'true');
            else bottombox.removeAttribute('hidden');
            
            if (hbox) hbox.setAttribute('dir', registerAtLeft ? 'reverse' : 'normal');
            if (productPanel) productPanel.setAttribute('dir', productPanelOnTop ? 'reverse' : 'normal');

            if (deptPanel) deptPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (pluPanel) pluPanel.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (fnPanelContainer) fnPanelContainer.setAttribute('dir', registerAtLeft ? 'normal' : 'reverse');
            if (toolbar) {
                if (showToolbar) {
                    fnPanel.setAttribute('hidden', true);
                    fnPanel.width = 0;
                }
                toolbar.setAttribute('hidden', showToolbar ? 'false' : 'true');
                fnPanel.removeAttribute('hidden');
            }
            if (cartList) cartList.setAttribute('dir', registerAtLeft ? 'reverse': 'normal');
            if (checkTrackingStatus) {
                checkTrackingStatus.setAttribute('hidden', checkTrackingMode ? 'false' : 'true');
            }
            if (labDate) labDate.setAttribute('value', now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate());
            if (labTime) labTime.setAttribute('value', (now.getHours() >= 12 ? now.getHours() - 12 : now.getHours()) + ':' + now.getMinutes() + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM'));

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

        if(document.getElementById('viviposMainWindow').getAttribute('height') == 600) {
            var boxFunction = document.getElementById('boxFunction');
            var functionPanelContainer = document.getElementById('functionPanelContainer');
            boxFunction.appendChild(functionPanelContainer);
        }

        $('#btnUp').click(function() {
            $('#cartList').each(function() {
                this._scrollButtonUp.click();
            });
        });

        $('#btnDown').click(function() {
            $('#cartList').each(function() {
                this._scrollButtonDown.click();
            });
        });

        $('#labUser').each(function() {
            var session = GeckoJS.Session.getInstance();
            var user = session.get('User');
            this.value = '服務員: ' + (user.description.length > 0 ? user.description : user.username);
        });
    }, false);

    this.cartevents = GeckoJS.Controller.getInstanceByName('Cart').events;
    this.keypadevents = GeckoJS.Controller.getInstanceByName('Keypad').events;

    this.cartevents.addListener('onGetSubtotal', function(evt) {
        var transaction = evt.data;
        if (transaction) {
            var labOrderSequence = document.getElementById('labOrderSequence');
            var labTotal1 = document.getElementById('labTotal1');
            var labTotal2 = document.getElementById('labTotal2');
            var labPayment = document.getElementById('labPayment');
            var labCharge = document.getElementById('labCharge');
            labOrderSequence.value = '發票序號:' + GeckoJS.Session.get('vivipos_fec_order_sequence');
            labTotal1.value = '$ ' + transaction.getTotal(true);
            labTotal2.value = labTotal1.value;
            labPayment.value = '$ ' + transaction.getPaymentSubtotal(true);
            labCharge.value = '$ 0';
            if (transaction.data != null && transaction.data.status == 1) {
                labCharge.value = '$ ' + (0 - transaction.getRemainTotal(false));
            }
        }
    }, this);
    
    this.cartevents.addListener('afterSubmit', function(evt) {
        var transaction = evt.data;
        var labTotal1 = document.getElementById('labTotal1');
        var labTotal2 = document.getElementById('labTotal2');
        var labPayment = document.getElementById('labPayment');
        var labCharge = document.getElementById('labCharge');
        if (transaction.data != null && transaction.data.status == 1) {
            labTotal1.value = '$ ' + transaction.getTotal(true);
            labTotal2.value = labTotal1.value;
            labPayment.value = '$ ' + transaction.getPaymentSubtotal(true);
            labCharge.value = '$ ' + (0 - transaction.getRemainTotal(false));
        }
    }, this);

    this.keypadevents.addListener('onAddBuffer', function(evt) {
        $('[anonid=input]').val(evt.data);
    }, this);

    setInterval(function() {
        var labDateTime = document.getElementById('labDateTime');
        var now = new Date();
        labDateTime.setAttribute('value', now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM') + ' ' + (now.getHours() > 12 ? now.getHours() - 12 : now.getHours()) + ':' + now.getMinutes() + ':' + now.getSeconds());
    }, 1000);

})();
