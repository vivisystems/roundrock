(function(){

    // key is in prefs 's registry key
    var key = 'multi_dept';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'MultiDeptTriggerSetting',

        _pluGroups: [],
        
        /*
         * initial promotions rules for register
         */
        initial: function() {

            this._deptscrollablepanel1 = document.getElementById('deptscrollablepanel1');
            this._deptPanelView1 =  new NSICategoriesView('deptscrollablepanel1');

            this._deptscrollablepanel2 = document.getElementById('deptscrollablepanel2');
            this._deptPanelView2 =  new NSICategoriesView('deptscrollablepanel2');

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('multiDeptForm');
            
            // set to sessions
            var settings = formData;

            var panelView1 = this._deptPanelView1;
            var panelView2 = this._deptPanelView2;

            var categories = GeckoJS.Session.get('categoriesById');

            var firstCategory = categories[panelView1.getValue()];
            var secondCategory = categories[panelView2.getValue()];

            if (firstCategory.id == secondCategory.id) {
                NotifyUtils.warn(_('First Department and Second Department Can not be the same.'));
                return ;
            }

            settings.first_id = firstCategory.id;
            settings.first_no = firstCategory.no;
            settings.second_id = secondCategory.id;
            settings.second_no = secondCategory.no;

            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('multiDeptForm', item);

                this.updatePanelView(item);

            }else {
                this.Form.reset('multiDeptForm');
            }

        },

        updatePanelView: function(item) {

            var panelView1 = this._deptPanelView1;
            var panelView2 = this._deptPanelView2;

            if (item.first_id) panelView1.setValue(item.first_id);
            if (item.second_id) panelView2.setValue(item.second_id);
            
        }

    };

    GeckoJS.Controller.extend(__controller__);


    window.addEventListener('load', function() {
        $do('initial', null, 'MultiDeptTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'MultiDeptTriggerSetting');
    }, false);

})();
