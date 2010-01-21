(function(){

    // key is in prefs 's registry key
    var key = 'individual_dept';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'IndividualDeptTriggerSetting',

        _data: [],

        /*
         * initial promotions rules for register
         */
        initial: function() {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;


            this._deptscrollablepanel = document.getElementById('deptscrollablepanel');
            this._deptPanelView =  new NSICategoriesView('deptscrollablepanel');

            // populate destination list
            var destListObj = document.getElementById('destinationList');
            var destinations = GeckoJS.Session.get('destinations');
            destinations.forEach(function(d) {
               destListObj.appendItem(d.name, d.name, null);
            });

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('individualDeptForm');
            // process formData to settings          
            // set to sessions
            var settings = formData;

            // add department to data
            var panelObj = this._deptscrollablepanel ;
            var panelView = this._deptPanelView;

            var selectedIndexes = panelObj.selectedItems;
            var dataIndex = panelView.data;

            var categoriesById = GeckoJS.Session.get('categoriesById');

            var data = [] ;

            selectedIndexes.forEach(function(idx){

                var deptId = dataIndex[idx];
                var dept = categoriesById[deptId];
                data.push({id: deptId, name: dept['name'], no: dept['no']});

            }, this);

            this._data = data;

            settings.data = this._data;

            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('individualDeptForm', item);

                // update product
                this._data = item.data || [];
                this.updatePanelView();


            }else {
                this.Form.reset('individualDeptForm');
            }

        },

        updatePanelView: function() {

            var panelObj = this._deptscrollablepanel ;
            var panelView = this._deptPanelView;
            
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
        $do('initial', null, 'IndividualDeptTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'IndividualDeptTriggerSetting');
    }, false);

})();
