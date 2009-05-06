(function(){

    /**
     * StaticCondiments Controller
     */
    var window = this;
    
    var __controller__ = {

        name: 'StaticCondiments',
        _cartController: null,
        _condGroupId: "",
        _condsData: null,
        _defaultGroupId: "",
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
                $(condimentscrollablepanel).hide();
                return 0;
            }else {
                $(condimentscrollablepanel).show();
            }

            if (document.getElementById(relation_element)) {
                if (relation_direction == 'after') $('#staticCondimentsPanelContainer').insertAfter('#'+relation_element);
                else $('#staticCondimentsPanelContainer').insertBefore('#'+relation_element);
            }          

            if (supportSoldout) {
                $('#staticCondimentsPanel-soldout').show();
            }else {
                $('#staticCondimentsPanel-soldout').hide();
            }

            if (condimentscrollablepanel.getAttribute('hideScrollbar') != panelHideScrollbar) {
                    condimentscrollablepanel.setAttribute('hideScrollbar', panelHideScrollbar);
            }


            if ( (condimentscrollablepanel.vivibuttonpanel.getAttribute('rows') != panelRows) ||
                (condimentscrollablepanel.vivibuttonpanel.getAttribute('cols') != panelCols) ||
                (condimentscrollablepanel.getAttribute('buttonHeight') != btnHeight)    ) {

                condimentscrollablepanel.vivibuttonpanel.rows = panelRows;
                condimentscrollablepanel.vivibuttonpanel.cols = panelCols;
                condimentscrollablepanel.setAttribute('buttonHeight', btnHeight);

                condimentscrollablepanel.initGrid();
                condimentscrollablepanel.vivibuttonpanel.resizeButtons();

                updated = true;

            }

                
            if (condimentscrollablepanel) condimentscrollablepanel.setAttribute('dir', panelReverseScrollbar ? 'reverse': 'normal');


            if (updated) {
                condimentscrollablepanel.vivibuttonpanel.invalidate();
                condimentscrollablepanel.scrollToRow(0);
            }

        },

        initialData: function(condGroup) {

            var selectedCondGroup = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.condiment_group') || condGroup || '';

            var condimentscrollablepanel = document.getElementById('staticCondimentsPanel');

            var condGroupsById = GeckoJS.Session.get('condGroupsById');

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
                for (cc in condGroupsById) {
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

            var self = this;

            condimentscrollablepanel.addEventListener('command', function(event) {
                self.condimentClick(event);
            }, false);

            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'condGroupsById') {
                    self.updateLayout();
                }
            });


        },


        afterAddItem: function(event) {

            // link to plu ?
            var linkto_plu = GeckoJS.Configure.read('vivipos.fec.settings.static_condiments.linkto_plu') || false;

            if (!linkto_plu) return;

            var pluId = event.data.id ;

            var productsById = GeckoJS.Session.get('productsById');
            var plu = productsById[pluId];
            if (!productsById || !plu) return;

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

                condGroupId = condGroup;

                this._condGroupId = condGroupId;
                this._condsData = condsData;

            }else {
                
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

            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupPanelView = new NSICondGroupsView(condGroups);
            condimentscrollablepanel.datasource = condGroupPanelView;

            $('#condcols').val(panelCols);
            $('#condrows').val(panelRows);
            $('#btnheight').val(btnHeight);
            

            $('#relation_elment').val(relation_element);
            $('#relation_direction').val(relation_direction);

            $('#hideScrollbar')[0].checked = panelHideScrollbar;
            $('#reverseScrollbar')[0].checked = panelReverseScrollbar;

            $('#supportSoldout')[0].checked = supportSoldout;
            $('#linktoPlu')[0].checked = linktoPlu;

            condimentscrollablepanel.value = selectedCondGroup;

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

            window.close();
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
