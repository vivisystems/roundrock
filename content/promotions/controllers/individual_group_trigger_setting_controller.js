(function(){

    // key is in prefs 's registry key
    var key = 'individual_group';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'IndividualGroupTriggerSetting',

        _pluGroups: [],
        
        _pluGroupScrollablepanel: null,
        
        _data: [],

        /*
         * initial promotions rules for register
         */
        initial: function() {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;


            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.findByIndex('all', {
                index: 'routing',
                value: '0',
                order: 'display_order, name'
            });

            this._pluGroups = groups;

            this._pluGroupScrollablepanel = document.getElementById('groupscrollablepanel');
            this._pluGroupPanelView =  new NSIPluGroupsView(this._pluGroups);
            this._pluGroupScrollablepanel.datasource = this._pluGroupPanelView;

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('individualGroupForm');
            
            // process formData to settings          
            // set to sessions
            var settings = formData;

            // add department to data
            var panelObj = this._pluGroupScrollablepanel;

            var selectedIndexes = panelObj.selectedItems;
            var pluGroups = this._pluGroups;
            var data = [] ;

            selectedIndexes.forEach(function(idx){

                data.push({id: pluGroups[idx]['id'], name: pluGroups[idx]['name']});

            }, this);

            this._data = data;

            settings.data = this._data;

            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('individualGroupForm', item);

                // update product
                this._data = item.data || [];
                this.updatePanelView();


            }else {
                this.Form.reset('individualGroupForm');
            }

        },

        updatePanelView: function() {

            var panelObj = this._pluGroupScrollablepanel;
            var panelView = this._pluGroupPanelView;
            
            var selectedItemsStr = GeckoJS.Array.objectExtract(this._data, '{n}.id');
            var selectedItems = [];

            var dataIdIndex = panelView.data;

            selectedItemsStr.forEach(function(id){
                var index = GeckoJS.Array.inArray(id, dataIdIndex);
                if (index != -1) selectedItems.push(index);
            });
            
            // panel.selectedItems = ;
            panelObj.selectedIndex = -1;
            panelObj.selectedItems = selectedItems;
        }

    };

    GeckoJS.Controller.extend(__controller__);


    window.addEventListener('load', function() {
        $do('initial', null, 'IndividualGroupTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'IndividualGroupTriggerSetting');
    }, false);

})();
