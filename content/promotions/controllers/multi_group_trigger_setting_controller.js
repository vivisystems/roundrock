(function(){

    // key is in prefs 's registry key
    var key = 'multi_group';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'MultiGroupTriggerSetting',

        _pluGroups: [],
        
        /*
         * initial promotions rules for register
         */
        initial: function() {

            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.findByIndex('all', {
                index: 'routing',
                value: '0',
                order: 'display_order, name'
            });

            this._pluGroups = groups;

            this._pluGroupScrollablepanel1 = document.getElementById('groupscrollablepanel1');
            this._pluGroupScrollablepanel2 = document.getElementById('groupscrollablepanel2');

            this._pluGroupPanelView1 =  new NSIPluGroupsView(this._pluGroups);
            this._pluGroupPanelView2 =  new NSIPluGroupsView(this._pluGroups);

            this._pluGroupScrollablepanel1.datasource = this._pluGroupPanelView1;
            this._pluGroupScrollablepanel2.datasource = this._pluGroupPanelView2;

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('multiGroupForm');
            
            // set to sessions
            var settings = formData;

            var panelView1 = this._pluGroupPanelView1;
            var panelView2 = this._pluGroupPanelView2;

            settings.first_group = panelView1.getValue();
            settings.second_group = panelView2.getValue();
            
            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('multiGroupForm', item);

                this.updatePanelView(item);

            }else {
                this.Form.reset('multiGroupForm');
            }

        },

        updatePanelView: function(item) {

            var panelView1 = this._pluGroupPanelView1;
            var panelView2 = this._pluGroupPanelView2;

            if (item.first_group) panelView1.setValue(item.first_group);
            if (item.second_group) panelView2.setValue(item.second_group);
            
        }

    };

    GeckoJS.Controller.extend(__controller__);


    window.addEventListener('load', function() {
        $do('initial', null, 'MultiGroupTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'MultiGroupTriggerSetting');
    }, false);

})();