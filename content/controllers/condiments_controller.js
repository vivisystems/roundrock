(function(){

    /**
     * Class ViviPOS.CondimentsController
     */
    GeckoJS.Controller.extend( {

        name: 'Condiments',
        helpers: ['Form'],
        _selectedIndex: null,
        _selectedCondIndex: null,

        createCondimentPanel: function () {
            
            var condGroups;
            var condGroupModel = new CondimentGroupModel();
            condGroups = condGroupModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('condGroups', condGroups);

            // bind condiments data
            // var condPanelView =  new GeckoJS.NSITreeViewArray(condiments);
            var condPanelView =  new NSICondGroupsView(condGroups);
            var condscrollablepanel = document.getElementById('condimentscrollablepanel');
            condscrollablepanel.datasource = condPanelView;


            // bind condiment data
//            if (condiments.length > 0) {
//               var firstCondNo = condiments[0]['no'];
//            }

        },

        changeCondimentPanel: function(index) {

            var condGroups = GeckoJS.Session.get('condGroups');
            var conds = condGroups[index]['Condiment'];

            this._selectedIndex = index;
            this.setInputData(condGroups[index]);

            var condPanelView =  new NSICondimentsView(conds);
            var condscrollablepanel = document.getElementById('detailscrollablepanel');
            condscrollablepanel.datasource = condPanelView;

        },

        clickCondimentPanel: function(index) {
            var condGroups = GeckoJS.Session.get('condGroups');
            var conds = condGroups[this._selectedIndex]['Condiment'];
            this._selectedCondIndex = index;
            this.setInputCondData(conds[index]);
        },

        getInputData: function () {

            return GeckoJS.FormHelper.serializeToObject('condGroupForm');

        },

        resetInputData: function () {

            this.query('#condiment_group_no').val('');
            this.query('#condiment_group_name').val('');
            // this.query('#condiment_group_button_color').val('os');
            // this.query('#condiment_group_font_size').val('medium');

        },

        setInputData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('condGroupForm', valObj);
            this.query('#condiment_group_id').val(valObj.id);
        },

        add: function  () {
            var inputData = this.getInputData();
            var inputCondData = this.getInputCondData();
            var condGroupModel = new CondimentGroupModel();
            condGroupModel.save(inputData);

            var condGroups = condGroupModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('condGroups', condGroups);

            this.resetInputData();
        },

        modify: function  () {
            var inputData = this.getInputData();
            var condGroupModel = new CondimentGroupModel();

            if(this._selectedIndex >= 0) {

                var condGroups = GeckoJS.Session.get('condGroups');
                var condGroup = condGroups[this._selectedIndex];

                inputData.id = condGroup.id;
                condGroupModel.id = condGroup.id;
                condGroupModel.save(inputData);

                var condGroups = condGroupModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('condGroups', condGroups);
            }
        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var condGroupModel = new CondimentGroupModel();
                if(this._selectedIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condGroup = condGroups[this._selectedIndex];
                    condGroupModel.del(condGroup.id);

                    var condGroups = condGroupModel.find('all', {
                        order: "no"
                    });
                    GeckoJS.Session.add('condGroups', condGroups);
                }
            }
        },

        getInputCondData: function () {

            var valObj = GeckoJS.FormHelper.serializeToObject('condimentForm');
            valObj.font_size  = this.query('#condiment_font_size').val();
            valObj.button_color  = this.query('#condiment_button_color').val();
            return valObj;
        },

        resetInputCondData: function () {

            this.query('#condiment_no').val('');
            this.query('#condiment_name').val('');
            this.query('#condiment_button_color').val('os');
            this.query('#condiment_font_size').val('medium');
        },

        setInputCondData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('condimentForm', valObj);
        },

        addCond: function  () {
            var inputData = this.getInputData();
            var inputCondData = this.getInputCondData();
            var condModel = new CondimentModel();
            condModel.save(inputCondData);

            var condGroupModel = new CondimentGroupModel();
            var condGroups = condGroupModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('condGroups', condGroups);

            // this.resetInputCondData();
        },

        modifyCond: function  () {
            var inputData = this.getInputCondData();
            var condModel = new CondimentModel();

            if(this._selectedCondIndex >= 0) {

                var condGroups = GeckoJS.Session.get('condGroups');
                var cond = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];
                inputData.id = cond.id;
                condModel.id = cond.id;
                condModel.save(inputData);

                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('condGroups', condGroups);
            }
        },

        removeCond: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var condModel = new CondimentModel();
                if(this._selectedCondIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condiment = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];
                    condModel.del(condiment.id);

                    var condGroups;
                    var condGroupModel = new CondimentGroupModel();
                    condGroups = condGroupModel.find('all', {
                        order: "no"
                    });
                    GeckoJS.Session.add('condGroups', condGroups);
                }
            }
        },

    });

})();

