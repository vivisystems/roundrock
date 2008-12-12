(function(){

    /**
     * Class ViviPOS.CondimentsController
     *
     * @todo need to make sure current selection is visible - need ensureVisible from viviscrollablebuttonpanel
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

            this._condscrollablepanel = document.getElementById('detailscrollablepanel');

            this.resetInputData();
            this.resetInputCondData();

            this.validateForm();
        },

        changeCondimentPanel: function(index) {

            var condGroups = GeckoJS.Session.get('condGroups');
            if (condGroups) {
                if (index >= condGroups.length) index = condGroups.length - 1;
            }
            else {
                index = -1;
            }

            var conds;
            if (condGroups && (index != null) && (index > -1) && condGroups.length > index)
                conds = condGroups[index]['Condiment'];
            
            this._condGroupscrollablepanel.selectedIndex = index;
            this._condGroupscrollablepanel.selectedItems = [index];

            this._selectedIndex = index;
            if (index >= 0 && condGroups.length > index)
                this.setInputData(condGroups[index]);
            else {
                this.resetInputData();
                this._selectedIndex = -1;
            }

            var condPanelView =  new NSICondimentsView(conds);
            this._condscrollablepanel.datasource = condPanelView;

            this.resetInputCondData();
            this._selectedCondIndex = -1;

            this.validateForm();

            document.getElementById('condiment_group_name').focus();
        },

        clickCondimentPanel: function(index) {

            var condGroups = GeckoJS.Session.get('condGroups');
            var conds = [];
            if (condGroups) {
                if (this._selectedIndex >= 0 && this._selectedIndex < condGroups.length) {
                    conds = condGroups[this._selectedIndex]['Condiment'];
                    if (conds) {
                        if (index > conds.length) index = conds.length - 1;
                    }
                    else {
                        index = -1;
                    }
                }
                else {
                    index = -1;
                }
            }
            else {
                index = -1;
            }

            this._selectedCondIndex = index;

            this._condscrollablepanel.selectedIndex = index;
            this._condscrollablepanel.selectedItems = [index];

            //alert('[CLICK] ' + 'index: ' + index + ':' + GeckoJS.BaseObject.dump(condGroups));
            //alert('[COND] ' + GeckoJS.BaseObject.dump(conds));
            if (conds) {
                this.setInputCondData(conds[index]);
            }

            this.validateForm();
            
            document.getElementById('condiment_name').focus();
        },

        validateForm: function () {

            // update button & text field states
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                document.getElementById('modify_group').disabled = true;
                document.getElementById('delete_group').disabled = true;

                document.getElementById('add_condiment').disabled = true;
                document.getElementById('modify_condiment').disabled = true;
                document.getElementById('delete_condiment').disabled = true;

                document.getElementById('condiment_group_name').disabled = true;
                document.getElementById('condiment_name').disabled = true;
                document.getElementById('condiment_price').disabled = true;
            }
            else {
                document.getElementById('condiment_group_name').disabled = false;

                // validate group name
                var group_name = document.getElementById('condiment_group_name').value.replace(/^\s*/, '').replace(/\s*$/, '');

                document.getElementById('modify_group').disabled = group_name.length == 0;
                document.getElementById('delete_group').disabled = false;

                document.getElementById('add_condiment').disabled = false;

                if (this._selectedCondIndex == null || this._selectedCondIndex == -1) {
                    document.getElementById('condiment_name').disabled = true;
                    document.getElementById('condiment_price').disabled = true;

                    document.getElementById('modify_condiment').disabled = true;
                    document.getElementById('delete_condiment').disabled = true;
                }
                else {
                    document.getElementById('condiment_name').disabled = false;
                    document.getElementById('condiment_price').disabled = false;

                    // validate condiment name and price
                    var cond_name = document.getElementById('condiment_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                    var cond_price = document.getElementById('condiment_price').value.replace(/^\s*/, '').replace(/\s*$/, '');

                    if (cond_name.length > 0 && !isNaN(parseInt(cond_price))) {
                        document.getElementById('modify_condiment').disabled = false;
                    }
                    else {
                        document.getElementById('modify_condiment').disabled = true;
                    }
                    document.getElementById('delete_condiment').disabled = false;
                }
            }
        },

        getInputData: function () {

            return GeckoJS.FormHelper.serializeToObject('condGroupForm');

        },

        resetInputData: function () {

            this.query('#condiment_group_name').val('');
            this.query('#condiment_group_id').val('');

        },

        setInputData: function (valObj) {
            //GeckoJS.FormHelper.unserializeFromObject('condGroupForm', valObj);
            this.query('#condiment_group_id').val(valObj.id);
            this.query('#condiment_group_name').val(valObj.name);
        },

        add: function  () {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";

            var inputObj = {input0:null, require0:true};

            window.openDialog(aURL,
                              'prompt_additem',
                              features,
                              _('New Condiment Group:'),
                              '',
                              _('Group Name:'),
                              '',
                              inputObj);

            if (inputObj.ok && inputObj.input0) {
                var inputData = {name: inputObj.input0};
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((condGroups != null) && (condGroups.length > 0)) {
                    alert(_('The group (%S) already exists..', [inputData.name]));
                    return;
                }
                
                condGroupModel.save(inputData);

                // retrieve newly created record
                var groups = condGroupModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((groups != null) && (groups.length > 0)) {

                    var condGroups = GeckoJS.Session.get('condGroups');
                    condGroups.push(groups[0]);

                    //alert('[ADD]: record ' + GeckoJS.BaseObject.dump(groups));
                    //alert('[ADD]: array ' + GeckoJS.BaseObject.dump(condGroups));

                    GeckoJS.Session.set('condGroups', condGroups);

                    var view = this._condGroupscrollablepanel.datasource;
                    view.data = condGroups;
                    this.changeCondimentPanel(condGroups.length - 1);
                }
            }
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            if(this._selectedIndex >= 0) {

                var inputData = this.getInputData();
                var condGroupModel = new CondimentGroupModel();

                var condGroups = GeckoJS.Session.get('condGroups');
                var condGroup = condGroups[this._selectedIndex];

                /// check if the name already exists and belongs to another condiment group
                var conds = condGroupModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((conds != null) && (conds.length > 0)) {
                    for (var i = 0; i < conds.length; i++) {
                        if (conds[i].id != condGroup.id) {
                            alert(_('The group (%S) already exists..', [inputData.name]));
                            return;
                        }
                    }
                }

                inputData.id = condGroup.id;
                condGroupModel.id = condGroup.id;
                condGroupModel.save(inputData);

                GREUtils.extend(condGroups[this._selectedIndex], inputData);
                //alert('[MODIFY]: record ' + GeckoJS.BaseObject.dump(inputData));
                //alert('[MODIFY]: array ' + GeckoJS.BaseObject.dump(condGroups));
                GeckoJS.Session.set('condGroups', condGroups);

                var view = this._condGroupscrollablepanel.datasource;
                view.data = condGroups;

                this.changeCondimentPanel(this._selectedIndex);
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?'))) {
                var condGroupModel = new CondimentGroupModel();
                if(this._selectedIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condGroup = condGroups[this._selectedIndex];

                    // cascading delete
                    condGroupModel.del(condGroup.id);

                    var condimentModel = new CondimentModel();
                    if (condGroup.condiment && condGroup.condiment.length > 0)
                        condGroup.forEach(function(cond) {
                            condimentModel.del(cond.id);
                        });

                    // collect remaining condiment groups
                    var groups = [];
                    for (var i = 0; i < condGroups.length; i++) {
                        if (i != this._selectedIndex) {
                            groups.push(condGroups[i]);
                        }
                    }
                    GeckoJS.Session.set('condGroups', groups);

                    //alert('[DELETE]: record ' + GeckoJS.BaseObject.dump(condGroup));
                    //alert('[DELETE]: array ' + GeckoJS.BaseObject.dump(groups));

                    var view = this._condGroupscrollablepanel.datasource;
                    view.data = groups;

                    var newIndex = this._selectedIndex;
                    if (newIndex >= groups.length) newIndex = groups.length - 1;
                    this.changeCondimentPanel(newIndex);
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
            this.query('#condiment_price').val('');
            this.query('#condiment_button_color').val('default');
            this.query('#condiment_font_size').val('medium');
        },

        setInputCondData: function (valObj) {
            GeckoJS.FormHelper.reset('condimentForm');
            GeckoJS.FormHelper.unserializeFromObject('condimentForm', valObj);
        },

        addCond: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, input1:0, require0:true, require1:true};
            window.openDialog(aURL, 'prompt_additem', features, _('New Condiment:'), '', _('Condiment Name'), _('Condiment Price'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                if (isNaN(inputObj.input1)) {
                    alert(_('Condiment Price must be a number'));
                    return;
                }

                var inputData = this.getInputCondData();
                var condGroups = GeckoJS.Session.get('condGroups');

                inputData.id = null;
                inputData.name = inputObj.input0;
                inputData.price = inputObj.input1;
                inputData.condiment_group_id = this.query('#condiment_group_id').val();

                var condModel = new CondimentModel();

                // we will only make sure no duplicate names within the same group
                var conds = condGroups[this._selectedIndex]['Condiment'];
                if ((conds != null) && (conds.length > 0)) {
                    for (var i = 0; i < conds.length; i++) {
                        if (conds[i].name == inputData.name) {
                            alert(_('The condiment (%S) already exists in this group...', [inputData.name]));
                            return;
                        }
                    }
                }

                condModel.save(inputData);
                // retrieve newly created record
                var conds = condModel.findByIndex('all', {
                    index: "name",
                    value: inputData.name
                });
                if ((conds != null) && (conds.length > 0)) {

                    // since we allow duplicate condiment names across different condiment groups, make sure
                    // we are retrieving the right record
                    for (var i = 0; i < conds.length; i++) {
                        if (conds[i].condiment_group_id == inputData.condiment_group_id) {
                            if (condGroups[this._selectedIndex]['Condiment'])
                                condGroups[this._selectedIndex]['Condiment'].push(conds[i]);
                            else
                                condGroups[this._selectedIndex]['Condiment'] = [conds[i]];
                            break;
                        }
                    }

                    //alert('[ADD]: record ' + GeckoJS.BaseObject.dump(conds[0]));
                    //alert('[ADD]: array ' + GeckoJS.BaseObject.dump(condGroups));

                    GeckoJS.Session.set('condGroups', condGroups);

                    var view = this._condscrollablepanel.datasource;
                    view.data = condGroups[this._selectedIndex]['Condiment'];
                    this.clickCondimentPanel(view.data.length - 1);
                }
            }
        },

        modifyCond: function  () {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            if(this._selectedCondIndex >= 0) {

                var condGroups = GeckoJS.Session.get('condGroups');
                var cond = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];

                var inputData = this.getInputCondData();
                var condModel = new CondimentModel();
                
                // we will only make sure no duplicate names within the same group
                var conds = condGroups[this._selectedIndex]['Condiment'];
                if ((conds != null) && (conds.length > 0)) {
                    for (var i = 0; i < conds.length; i++) {
                        if ((conds[i].name == inputData.name) && (i != this._selectedCondIndex)) {
                            alert(_('The condiment (%S) already exists in this group...', [inputData.name]));
                            return;
                        }
                    }
                }

                inputData.id = cond.id;
                condModel.id = cond.id;

                condModel.save(inputData);

                GREUtils.extend(condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex], inputData);
                //alert('[MODIFY]: record ' + GeckoJS.BaseObject.dump(inputData));
                //alert('[MODIFY]: array ' + GeckoJS.BaseObject.dump(condGroups[this._selectedIndex]['Condiment']));

                GeckoJS.Session.set('condGroups', condGroups);

                var view = this._condscrollablepanel.datasource;
                view.data = condGroups[this._selectedIndex]['Condiment'];
                this.clickCondimentPanel(this._selectedCondIndex);
            }
        },

        removeCond: function() {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?'))) {
                var condModel = new CondimentModel();
                if(this._selectedCondIndex >= 0) {
                    var condGroups = GeckoJS.Session.get('condGroups');
                    var condiment = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];
                    //alert('[DELETE]: condiment id <'+ condiment.id + '>');
                    condModel.del(condiment.id);

                    // collect remaining condiments
                    var conds = [];
                    for (var i = 0; i < condGroups[this._selectedIndex]['Condiment'].length; i++) {
                        if (i != this._selectedCondIndex) {
                            conds.push(condGroups[this._selectedIndex]['Condiment'][i]);
                        }
                    }
                    condGroups[this._selectedIndex]['Condiment'] = conds;
                    GeckoJS.Session.set('condGroups', condGroups);

                    var view = this._condscrollablepanel.datasource;
                    view.data = conds;

                    var newIndex = this._selectedCondIndex;
                    if (newIndex >= conds.length) newIndex = conds.length - 1;
                    this.clickCondimentPanel(newIndex);

                }
            }
        },

    });

})();

