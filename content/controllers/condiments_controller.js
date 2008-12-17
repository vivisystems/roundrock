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
                order: 'name'
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
            document.getElementById('condiment_group_name').select();
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
                document.getElementById('modify_group').setAttribute('disabled',  true);
                document.getElementById('delete_group').setAttribute('disabled',  true);

                document.getElementById('add_condiment').setAttribute('disabled',  true);
                document.getElementById('modify_condiment').setAttribute('disabled',  true);
                document.getElementById('delete_condiment').setAttribute('disabled',  true);

                document.getElementById('condiment_group_name').setAttribute('disabled',  true);
                document.getElementById('condiment_name').setAttribute('disabled',  true);
                document.getElementById('condiment_price').setAttribute('disabled',  true);
            }
            else {
                document.getElementById('condiment_group_name').removeAttribute('disabled');

                // validate group name
                var group_name = document.getElementById('condiment_group_name').value.replace(/^\s*/, '').replace(/\s*$/, '');

                document.getElementById('modify_group').setAttribute('disabled',  group_name.length == 0);
                document.getElementById('delete_group').setAttribute('disabled',  false);

                document.getElementById('add_condiment').setAttribute('disabled',  false);

                if (this._selectedCondIndex == null || this._selectedCondIndex == -1) {
                    document.getElementById('condiment_name').setAttribute('disabled',  true);
                    document.getElementById('condiment_price').setAttribute('disabled',  true);

                    document.getElementById('modify_condiment').setAttribute('disabled',  true);
                    document.getElementById('delete_condiment').setAttribute('disabled',  true);
                }
                else {
                    document.getElementById('condiment_name').removeAttribute('disabled');
                    document.getElementById('condiment_price').removeAttribute('disabled');

                    // validate condiment name and price
                    var cond_name = document.getElementById('condiment_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                    var cond_price = document.getElementById('condiment_price').value.replace(/^\s*/, '').replace(/\s*$/, '');

                    if (cond_name.length > 0 && !isNaN(parseInt(cond_price))) {
                        document.getElementById('modify_condiment').removeAttribute('disabled');
                    }
                    else {
                        document.getElementById('modify_condiment').setAttribute('disabled',  true);
                    }
                    document.getElementById('delete_condiment').removeAttribute('disabled');
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
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';

            var inputObj = {input0:null, require0:true};

            window.openDialog(aURL,
                              _('Add New Condiment Group'),
                              features,
                              _('New Condiment Group'),
                              '',
                              _('Group Name'),
                              '',
                              inputObj);

            if (inputObj.ok && inputObj.input0) {
                var inputData = {name: inputObj.input0};
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.findByIndex('all', {
                    index: 'name',
                    value: inputData.name
                });
                if ((condGroups != null) && (condGroups.length > 0)) {
                    OsdUtils.warn(_('Condiment Group [%S] already exists.', [inputData.name]));
                    return;
                }

                try {
                    condGroupModel.save(inputData);

                    // retrieve newly created record
                    var groups = condGroupModel.findByIndex('all', {
                        index: 'name',
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

                        // @todo OSD
                        OsdUtils.info(_('Condiment Group [%S] added successfully', [inputData.name]));
                    }
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while adding Condiment Group [%S]\nThe group may not have been added successfully', [inputData.name]));
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
                    index: 'name',
                    value: inputData.name
                });
                if ((conds != null) && (conds.length > 0)) {
                    for (var i = 0; i < conds.length; i++) {
                        if (conds[i].id != condGroup.id) {
                            OsdUtils.warn(_('Condiment Group [%S] already exists', [inputData.name]));
                            return;
                        }
                    }
                }

                try {
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

                    // @todo OSD
                    OsdUtils.info(_('Condiment Group [%S] modified successfully', [inputData.name]));
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while modifying Condiment Group [%S]\nThe group may not have been modified successfully', [inputData.name]));
                }
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var condGroup = condGroups[this._selectedIndex];

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [condGroup.name]), _('Are you sure?'))) {
                var condGroupModel = new CondimentGroupModel();

                try {
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

                    var view = this._condGroupscrollablepanel.datasource;
                    view.data = groups;

                    var newIndex = this._selectedIndex;
                    if (newIndex >= groups.length) newIndex = groups.length - 1;
                    this.changeCondimentPanel(newIndex);
                    
                    // @todo OSD
                    OsdUtils.info(_('Condiment Group [%S] removed successfully', [condGroup.name]));
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while removing Condiment Group [%S]\nThe group may not have been removed successfully', [condGroup.name]));
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

            this.query('#condiment_name').val('');
            this.query('#condiment_price').val('');
            this.query('#condiment_button_color').val('default');
            this.query('#condiment_font_size').val('medium');
        },

        setInputCondData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('condimentForm', valObj);
        },

        addCond: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, input1:0,
                            require0:true, require1:true, numberOnly1:true};
            window.openDialog(aURL, _('Add New Condiment'), features, _('New Condiment'), '', _('Condiment Name'), _('Condiment Price'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                if (isNaN(inputObj.input1)) {
                    // @todo OSD
                    OsdUtils.warn(_('Condiment Price must be a number'));
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
                            OsdUtils.warn(_('Condiment [%S] already exists in this group', [inputData.name]));
                            return;
                        }
                    }
                }

                try {
                    condModel.save(inputData);
                    // retrieve newly created record
                    var conds = condModel.findByIndex('all', {
                        index: 'name',
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

                        GeckoJS.Session.set('condGroups', condGroups);

                        var view = this._condscrollablepanel.datasource;
                        view.data = condGroups[this._selectedIndex]['Condiment'];
                        this.clickCondimentPanel(view.data.length - 1);
                        // @todo OSD
                        OsdUtils.info(_('Condiment [%S] added successfully', [inputData.name]));
                    }
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while adding Condiment [%S]\nThe condiment may not have been added successfully', [inputData.name]));
                }
            }
        },

        modifyCond: function  () {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var cond = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];

            var inputData = this.getInputCondData();
            var condModel = new CondimentModel();

            // we will only make sure no duplicate names within the same group
            var conds = condGroups[this._selectedIndex]['Condiment'];
            if ((conds != null) && (conds.length > 0)) {
                for (var i = 0; i < conds.length; i++) {
                    if ((conds[i].name == inputData.name) && (i != this._selectedCondIndex)) {

                        // @todo OSD
                        OsdUtils.warn(_('Condiment [%S] already exists in this group', [inputData.name]));
                        return;
                    }
                }
            }

            inputData.id = cond.id;
            inputData.condiment_price = parseFloat(inputData.condiment_price);
            condModel.id = cond.id;

            try {
                condModel.save(inputData);

                GREUtils.extend(condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex], inputData);

                GeckoJS.Session.set('condGroups', condGroups);

                var view = this._condscrollablepanel.datasource;
                view.data = condGroups[this._selectedIndex]['Condiment'];
                this.clickCondimentPanel(this._selectedCondIndex);

                // @todo OSD
                OsdUtils.info(_('Condiment [%S] modified successfully', [inputData.name]));
            }
            catch (e) {
                // @todo OSD
                OsdUtils.error(_('An error occurred while modifying Condiment [%S]\nThe condiment may not have been modified successfully', [inputData.name]));
            }
        },

        removeCond: function() {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var condiment = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [condiment.name]), _('Are you sure?'))) {

                var condModel = new CondimentModel();

                try {
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

                    // @todo OSD
                    OsdUtils.info(_('Condiment [%S] removed successfully', [condiment.name]));
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while removing Condiment [%S]\nThe condiment may not have been removed successfully', [condiment.name]));
                }
            }
        }

    });

})();

