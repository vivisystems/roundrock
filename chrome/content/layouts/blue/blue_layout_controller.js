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
            var pluPanel = document.getElementById('prodscrollablepanel');
            var fnPanel = document.getElementById('functionpanel');
            var fnPanelContainer = document.getElementById('functionPanelContainer');
            var condPanel = document.getElementById('condimentscrollablepanel');
            
            var pluRows = 3;
            var pluCols = 4;

            var fnRows = 3;
            var fnCols = 5;

            var hidePLUScrollbar = true;
            var hideFPScrollbar = true;

            var condRows = GeckoJS.Configure.read('vivipos.fec.settings.CondimentRows');
            if (condRows == null) condRows = 7;

            var condCols = GeckoJS.Configure.read('vivipos.fec.settings.CondimentCols');
            if (condCols == null) condCols = 4;

            var cropPLULabel = GeckoJS.Configure.read('vivipos.fec.settings.layout.blue.CropPLULabel') || false;
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

                if (initial || (currentRows != fnRows) ||
                    (currentColumns != fnCols)) {

                    // need to change layout, first retrieve h/vspacing

                    var hspacing = 0;
                    var vspacing = 0;

                    fnPanel.setSize(fnRows, fnCols, hspacing, vspacing);
                }
                fnPanel.width = fnPanel.boxObject.width;
            }
        },
        
        resetLayout: function (initial) {
            
            // not any layout templates support it
            var showToolbar = false;
            var hideBottomBox = false;

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

    }, false);
    
})();
