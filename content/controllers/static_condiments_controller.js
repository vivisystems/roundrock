(function(){

    var window = this;
    
    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'StaticCondiments',

        uses: ['Product'], 
        
        _cartController: null,
        _condGroupId: '',
        _condsData: null,
        _defaultGroupId: '',
        _defaultCondsData: null,

        getCartController: function() {
            if (this._cartController == null) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this._cartController;
        },
        
        initialLayout: function() {

            var updated = false;
            var panelCols = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.cols') || 5;
            var panelRows = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.rows') || 0;
            var btnHeight = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.btnheight') || 40;

            var panelHideScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.hideScrollbar') || false;
            var panelReverseScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.reverseScrollbar') || false;
            var supportSoldout = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.support_soldout') || false;

            var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');

            var relation_element = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.relation_element') || 'cartlistPanelContainer';
            var relation_direction = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.relation_direction') || 'after';

            // rows or cols == 0 hidden
            if (panelCols == 0 || panelRows == 0 || btnHeight == 0) {
                $('#staticCondimentsPanelContainer').hide();
                return;
            }else {
                $('#staticCondimentsPanelContainer').show();
            }

            if (document.getElementById(relation_element)) {
                if (relation_direction == 'after') $('#staticCondimentsPanelContainer').insertAfter('#'+relation_element);
                else $('#staticCondimentsPanelContainer').insertBefore('#'+relation_element);
            }          

            if (!condimentscrollablepanel.vivibuttonpanel) {
                return;
            }
            
            if (supportSoldout) {
                $('#staticCondimentsPanel-soldout').show();
            }else {
                $('#staticCondimentsPanel-soldout').hide();
            }

            if (condimentscrollablepanel.getAttribute('hideScrollbar') != panelHideScrollbar) {
                    condimentscrollablepanel.setAttribute('hideScrollbar', panelHideScrollbar);
            }


            /* always initGrid
            if ( (condimentscrollablepanel.vivibuttonpanel.getAttribute('rows') != panelRows) ||
                (condimentscrollablepanel.vivibuttonpanel.getAttribute('cols') != panelCols) ||
                (condimentscrollablepanel.getAttribute('buttonHeight') != btnHeight)    ) {
            */
                condimentscrollablepanel.vivibuttonpanel.rows = panelRows;
                condimentscrollablepanel.vivibuttonpanel.cols = panelCols;
                condimentscrollablepanel.setAttribute('buttonHeight', btnHeight);

                condimentscrollablepanel.initGrid();
                condimentscrollablepanel.vivibuttonpanel.resizeButtons();

                updated = true;
            /*
            }
            */
                
            if (condimentscrollablepanel) condimentscrollablepanel.setAttribute('dir', panelReverseScrollbar ? 'reverse': 'normal');


            if (updated) {
                condimentscrollablepanel.vivibuttonpanel.invalidate();
                condimentscrollablepanel.scrollToRow(0);
            }

        },

        initialData: function(condGroup) {

            var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');

            if (!condimentscrollablepanel.vivibuttonpanel) return;

            var selectedCondGroup = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.condiment_group') || condGroup || '';

            var condGroupsById = GeckoJS.Session.get('condGroupsById') || {};

            var viewHelper = new NSICondimentsView();
            viewHelper.supportSoldout = true;
            condimentscrollablepanel.datasource = viewHelper ;
            condimentscrollablepanel.selectedItems = [] ;

            var condsData = [];
            var condGroupId = "";
            if (selectedCondGroup) {
                var cgs = selectedCondGroup.split(',');
                cgs.forEach( function(cgid) {
                    if (condGroupsById[cgid]) condsData = condsData.concat(condGroupsById[cgid].Condiment);
                });
                condGroupId = selectedCondGroup;
            }else {
                // if nonselect use first one
                for (var cc in condGroupsById) {
                    condsData = condsData.concat(condGroupsById[cc].Condiment);
                    condGroupId = cc;
                    break;
                }
            }

            this._defaultCondsData = condsData.concat([]);
            this._defaultGroupId = condGroupId;

            this._condGroupId = condGroupId ;
            this._condsData = condsData;

            condimentscrollablepanel.datasource = this._condsData ;
            condimentscrollablepanel.vivibuttonpanel.invalidate();
            condimentscrollablepanel.scrollToRow(0);

        },

        registerInitial: function() {

            var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');

	    if (!condimentscrollablepanel) return;

            var self = this;

            // initial layout
            this.initialLayout();

            // initial data
            this.initialData();

            // register eventListener when sysprefs updated
            // add event listener for onUpdateOptions events
            var mainController = GeckoJS.Controller.getInstanceByName('Main');
            if(mainController) {
                mainController.addEventListener('onUpdateOptions', this.updateLayout, this);
            }

            var cartController = GeckoJS.Controller.getInstanceByName('Cart');
            if(cartController) {
                cartController.addEventListener('afterAddItem', this.afterAddItem, this);
            }

            var cartTreeList = this._cartTreeList = document.getElementById('cartList');
            if (cartTreeList) {
                cartTreeList.addEventListener('select', function(event) {
                    self.selectCartItem(cartController, event.target.selectedIndex);
                }, true);
            }

            condimentscrollablepanel.addEventListener('command', function(event) {
                self.condimentClick(event);
            }, false);

            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'condGroupsById') {
                    self.updateLayout();
                }
            });


        },

        selectCartItem: function(cart, index) {
            
            var event = {};
            var item = cart.getItemAt(index);
            if (item) {
                event.data = {id: item.id};
            }
            else {
                event.data = {id: null};
            }
            this.afterAddItem(event);
        },

        afterAddItem: function(event) {

            // link to plu ?
            var linkto_plu = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.linkto_plu') || false;

            if (!linkto_plu) return;

            var pluId = event.data.id ;

            var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');
            var plu = this.Product.getProductById(pluId);
            if (plu) {

                var condGroup = plu['cond_group'];

                var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');
                var condGroupsById = GeckoJS.Session.get('condGroupsById');

                var condsData = [];
                var condGroupId = "";

                if (condGroup && !plu['force_condiment']) {

                    if (this._condGroupId == condGroup ) return;

                    var cgs = condGroup.split(',');
                    cgs.forEach( function(cgid) {
                        if (condGroupsById[cgid]) condsData = condsData.concat(condGroupsById[cgid].Condiment);
                    });

                    if (condsData.length > 0) {
                        condGroupId = condGroup;

                        this._condGroupId = condGroupId;
                        this._condsData = condsData;
                    }
                    else {
                        if (this._condGroupId == this._defaultGroupId ) return;

                        // set to default
                        this._condGroupId = this._defaultGroupId;
                        this._condsData = this._defaultCondsData;
                    }

                }else {

                    if (this._condGroupId == this._defaultGroupId ) return;

                    // set to default
                    this._condGroupId = this._defaultGroupId;
                    this._condsData = this._defaultCondsData;
                }
            }
            else {
                if (this._condGroupId == this._defaultGroupId ) return;
                
                // set to default
                this._condGroupId = this._defaultGroupId;
                this._condsData = this._defaultCondsData;
            }
            condimentscrollablepanel.datasource = this._condsData ;
            condimentscrollablepanel.vivibuttonpanel.invalidate();
            condimentscrollablepanel.scrollToRow(0);

        },

        updateLayout: function() {

            // fire by prefs changed
            this.initialLayout();

            // initial data
            this.initialData();

        },


        condimentClick: function(evt) {

                // get sold out state
                var soldOutBtn =  $('#staticCondimentsPanel-soldout')[0];
                var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');
                var condIndex = condimentscrollablepanel.selectedIndex;
                var condiment = this._condsData[condIndex];


                var soldout = soldOutBtn.checkState;
                if (soldout) {
                    soldOutBtn.checked = false;
                    condimentscrollablepanel.datasource.soldoutActive = 0;
                }

                // get condiment state
                if (condIndex > -1) {
                    if (soldout || condiment.soldout) {
                        if (soldout) {
                            condiment.soldout = !condiment.soldout;
                            condimentscrollablepanel.invalidate();
                        }
                        return;
                    }
                }

            var cartController = this.getCartController();

            if (cartController && !condiment.soldout) {

                cartController.addCondiment(null, [condiment], true);
            }
        },


        initial: function () {

            var panelCols = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.cols') || 5;
            var panelRows = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.rows') || 0;
            var btnHeight = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.btnheight') || 40;
            var selectedCondGroup = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.condiment_group') || '';
            var panelHideScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.hideScrollbar') || false;
            var panelReverseScrollbar = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.reverseScrollbar') || false;
            var supportSoldout = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.support_soldout') || false;
            var linktoPlu = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.linkto_plu') || false;

            var relation_element = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.relation_element') || 'cartlistPanelContainer';
            var relation_direction = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.relation_direction') || 'after';

            var condGroups = GeckoJS.Session.get('condGroups');

            // re-order condGroups to put selected condiment groups in front
            var startIndex = 0;
            var selectedCondGroupArray = [];
            var sortedCondGroupArray = [];
            if (GeckoJS.String.trim(selectedCondGroup).length > 0) {
                var selectedCondGroupArray = selectedCondGroup.split(',');
                startIndex = selectedCondGroupArray.length;
            }

            condGroups.forEach(function(cg) {
                var index = selectedCondGroupArray.indexOf(cg.id);
                if (index == -1) {
                    sortedCondGroupArray[startIndex++] = cg;
                }
                else {
                    sortedCondGroupArray[index] = cg;
                }
            }, this);

            sortedCondGroupArray = sortedCondGroupArray.filter(function(cg) {return cg});
            
            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupPanelView = new NSICondGroupsView(sortedCondGroupArray);
            condimentscrollablepanel.datasource = condGroupPanelView;
            
            $('#condcols').val(panelCols);
            $('#condrows').val(panelRows);
            $('#btnheight').val(btnHeight);

            // populate panel menus
            var menu = $('#relation_elment')[0];
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");
            var panels = mainWindow.$('box[panel]');
            for (var i = 0; i < panels.length; i++) {
                menu.appendItem(panels[i].getAttribute('panel'), panels[i].getAttribute('id'));
            };

            $('#relation_elment').val(relation_element);
            $('#relation_direction').val(relation_direction);

            $('#hideScrollbar')[0].checked = panelHideScrollbar;
            $('#reverseScrollbar')[0].checked = panelReverseScrollbar;

            $('#supportSoldout')[0].checked = supportSoldout;
            $('#linktoPlu')[0].checked = linktoPlu;

            condimentscrollablepanel.value = selectedCondGroup;

            // initialize form's original value
            var formObj = GeckoJS.FormHelper.serializeToObject('staticCondimentForm');
            GeckoJS.FormHelper.unserializeFromObject('staticCondimentForm', formObj);
        },

        reorderCondimentGroup: function() {
            // re-arrange condiment groups
            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupsById = GeckoJS.Session.get('condGroupsById');

            // build list of selection orders by group id
            var selectedGroups = condimentscrollablepanel.value.split(',');
            var count = 0;
            var selectedGroupsById = {};
            var selectedItems = [];
            for (var i = 0; i < selectedGroups.length; i++) {
                if (condGroupsById[selectedGroups[i]]) {
                    selectedGroupsById[selectedGroups[i]] = count;
                    selectedItems.push(count++);
                }
            }

            // split cond groups into two arrays
            var selectedList = [];
            var notSelectedList = [];

            for (var key in condGroupsById) {
                // if group is selected, we order it by its position in cond_group
                if (key in selectedGroupsById) {
                    selectedList[selectedGroupsById[key]] = condGroupsById[key];
                }

                // otherwise, the group is ordered by its position in condGroupsById
                else {
                    notSelectedList.push(condGroupsById[key]);
                }
            }

            // update condGroup view with ordered condiment group array
            var condGroupView = condimentscrollablepanel.datasource;
            condGroupView.data = selectedList.concat(notSelectedList);
            condimentscrollablepanel.selectedItems = selectedItems;
            condimentscrollablepanel.refresh();
        },

        save: function() {

            var panelCols = $('#condcols').val();
            var panelRows = $('#condrows').val();
            var btnHeight = $('#btnheight').val();
            var panelHideScrollbar = $('#hideScrollbar')[0].checked;
            var panelReverseScrollbar = $('#reverseScrollbar')[0].checked;
            var supportSoldout = $('#supportSoldout')[0].checked;
            var linktoPlu = $('#linktoPlu')[0].checked;

            var relation_element = $('#relation_elment').val();
            var relation_direction = $('#relation_direction').val();

            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            
            var selectedCondGroup = condimentscrollablepanel.value;

            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.cols', panelCols);
            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.rows', panelRows);
            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.btnheight', btnHeight);
            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.condiment_group', selectedCondGroup);
            
            try {
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.hideScrollbar', panelHideScrollbar);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.reverseScrollbar', panelReverseScrollbar);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.support_soldout', supportSoldout);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.linkto_plu', linktoPlu);
            }catch(e) {
                // old string setting exists
                GeckoJS.Configure.remove("vivipos.fec.settings.static_condiments.hideScrollbar");
                GeckoJS.Configure.remove("vivipos.fec.settings.static_condiments.reverseScrollbar");
                GeckoJS.Configure.remove("vivipos.fec.settings.static_condiments.support_soldout");
                GeckoJS.Configure.remove("vivipos.fec.settings.static_condiments.linkto_plu");
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.hideScrollbar', panelHideScrollbar);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.reverseScrollbar', panelReverseScrollbar);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.support_soldout', supportSoldout);
                GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.linkto_plu', linktoPlu);
            }

            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.relation_element', relation_element);
            GeckoJS.Configure.write('vivipos.fec.settings.static_condiments.relation_direction', relation_direction);

            // change button height
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

            var registeredController = mainWindow.GeckoJS.Controller.getInstanceByName('StaticCondiments');
            registeredController.requestCommand('updateLayout', null, 'StaticCondiments');

            // initialize form's original value
            var formObj = GeckoJS.FormHelper.serializeToObject('staticCondimentForm');
            GeckoJS.FormHelper.unserializeFromObject('staticCondimentForm', formObj);

            OsdUtils.info(_('Condiment stock settings saved'));
        },

        exit: function() {
            if (GeckoJS.FormHelper.isFormModified('staticCondimentForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to condiment dock settings. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.save();
                }
            }
            window.close();
        }
    };

    AppController.extend(__controller__);

})();
