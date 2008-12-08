(function(){

    /**
     * Class ViviPOS.CondimentsController
     */
    GeckoJS.Controller.extend( {

        name: 'Condiments',
        helpers: ['Form'],
        _selectedIndex: null,
        _selectedCondIndex: null,
        _condGroupscrollablepanel: null,
        _condscrollablepanel: null,

        createCondimentPanel: function () {
            
            var condGroups;
            var condGroupModel = new CondimentGroupModel();
            condGroups = condGroupModel.find('all', {
                order: "name"
            });
            GeckoJS.Session.add('condGroups', condGroups);

            // bind condiments data
            var condPanelView =  new GeckoJS.NSITreeViewArray(condGroups);
            // var condPanelView =  new NSICondGroupsView(condGroups);
            this._condGroupscrollablepanel = document.getElementById('condimentscrollablepanel');
            this._condGroupscrollablepanel.datasource = condPanelView;

            this.resetInputData();
            this.resetInputCondData();
            /*
            if (condGroups && condGroups.length > 0) {
                this._condGroupscrollablepanel.selectedIndex = 0;
                this._condGroupscrollablepanel.selectedItems = [0];

                this.changeCondimentPanel(0);
            }
            */
            // bind condiment data
//            if (condiments.length > 0) {
//               var firstCondNo = condiments[0]['no'];
//            }

        },

        changeCondimentPanel: function(index) {

            var condGroups = GeckoJS.Session.get('condGroups');
            var conds;
            if (condGroups && (index != null) && (index > -1) && condGroups.length > index)
                conds = condGroups[index]['Condiment'];

            this._selectedIndex = index;
            if (index >= 0 && condGroups.length > index)
                this.setInputData(condGroups[index]);

            var condPanelView =  new NSICondimentsView(conds);
            var condscrollablepanel = document.getElementById('detailscrollablepanel');
            condscrollablepanel.datasource = condPanelView;

            this.resetInputCondData();
            this._selectedCondIndex = -1;
        },

        clickCondimentPanel: function(index) {
            this._selectedCondIndex = index;
            var condGroups = GeckoJS.Session.get('condGroups');
            var conds = condGroups[this._selectedIndex]['Condiment'];
            if (conds) this.setInputCondData(conds[index]);
        },

        getInputData: function () {

            return GeckoJS.FormHelper.serializeToObject('condGroupForm');

        },

        resetInputData: function () {

            // this.query('#condiment_group_no').val('');
            // $('#condiment_group_no').val('');
            this.query('#condiment_group_name').val('');
            this.query('#condiment_group_id').val('');
            this.query('#condiment_button_color').val('default');
            this.query('#condiment_font_size').val('medium');

        },

        setInputData: function (valObj) {
            //GeckoJS.FormHelper.unserializeFromObject('condGroupForm', valObj);
            this.query('#condiment_group_id').val(valObj.id);
            this.query('#condiment_group_name').val(valObj.name);
        },

        add: function  () {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";

            var inputObj = {input0:null,input1:null};

            window.openDialog(aURL, "prompt_additem", features, "New Condiment Group", "Please input:", "Name", "", inputObj);

            if (inputObj.ok && inputObj.input0) {
                var inputData = {name: inputObj.input0};
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((condGroups != null) && (condGroups.length > 0)) {
                    alert("The Group (" + inputData.name + ") is exist..");
                    return;
                }
                
                condGroupModel.save(inputData);

                var condGroups = condGroupModel.find('all', {
                    order: "name"
                });
                GeckoJS.Session.add('condGroups', condGroups);

                var condPanelView =  new NSICondGroupsView(condGroups);
                this._condscrollablepanel = document.getElementById('condimentscrollablepanel');
                this._condscrollablepanel.datasource = condPanelView;

                
            }
            this.resetInputData();
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var inputData = this.getInputData();
            var condGroupModel = new CondimentGroupModel();

            if(this._selectedIndex >= 0) {

                var condGroups = GeckoJS.Session.get('condGroups');
                var condGroup = condGroups[this._selectedIndex];

                inputData.id = condGroup.id;
                condGroupModel.id = condGroup.id;
                condGroupModel.save(inputData);

                var condGroups = condGroupModel.find('all', {
                    order: "name"
                });
                GeckoJS.Session.add('condGroups', condGroups);

                var condPanelView =  new NSICondGroupsView(condGroups);
                var condscrollablepanel = document.getElementById('condimentscrollablepanel');
                condscrollablepanel.datasource = condPanelView;
            }
            this.resetInputData();
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var condGroupModel = new CondimentGroupModel();
                if(this._selectedIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condGroup = condGroups[this._selectedIndex];
                    condGroupModel.del(condGroup.id);

                    var condGroups = condGroupModel.find('all', {
                        order: "name"
                    });
                    GeckoJS.Session.add('condGroups', condGroups);

                    var condPanelView =  new NSICondGroupsView(condGroups);
                    var condscrollablepanel = document.getElementById('condimentscrollablepanel');
                    condscrollablepanel.datasource = condPanelView;
                }
            }
        },

        getInputCondData: function () {

            var valObj = GeckoJS.FormHelper.serializeToObject('condimentForm');
            /*
            valObj.font_size  = this.query('#condiment_font_size').val();
            valObj.button_color  = this.query('#condiment_button_color').val();
            */
            return valObj;
        },

        resetInputCondData: function () {

            //GeckoJS.FormHelper.reset('condimentForm');
            this.query('#condiment_name').val('');
            this.query('#condiment_button_color').val('default');
            this.query('#condiment_font_size').val('medium');
        },

        setInputCondData: function (valObj) {
            GeckoJS.FormHelper.reset('condimentForm');
            GeckoJS.FormHelper.unserializeFromObject('condimentForm', valObj);
        },

        addCond: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {input0:null, input1:0};
            window.openDialog(aURL, "prompt_additem", features, "New Condiment", "Please input:", "Name", "Price", inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var inputData = this.getInputCondData();
                inputData.name = inputObj.input0;
                inputData.price = inputObj.input1;
                inputData.condiment_group_id = this.query('#condiment_group_id').val();

                var condModel = new CondimentModel();
                var conds = condModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((conds != null) && (conds.length > 0)) {
                    alert("The Condiment (" + inputData.name + ") already exists..");
                    return;
                }

                condModel.save(inputData);

                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.find('all', {
                    order: "name"
                });
                GeckoJS.Session.add('condGroups', condGroups);

                this.changeCondimentPanel(this._selectedIndex);
                //this.clickCondimentPanel(this._selectedCondIndex);

            }
        },

        modifyCond: function  () {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;
            
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
                    order: "name"
                });
                GeckoJS.Session.add('condGroups', condGroups);
                
                this.changeCondimentPanel(this._selectedIndex);

                // this._condscrollablepanel.datasource
            }
        },

        removeCond: function() {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var condModel = new CondimentModel();
                if(this._selectedCondIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condiment = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];
                    condModel.del(condiment.id);

                    var condGroups;
                    var condGroupModel = new CondimentGroupModel();
                    condGroups = condGroupModel.find('all', {
                        order: "name"
                    });
                    GeckoJS.Session.add('condGroups', condGroups);
                    this.changeCondimentPanel(this._selectedIndex);
                }
            }
        },

    });

})();

