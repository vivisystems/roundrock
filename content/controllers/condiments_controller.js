(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Condiments',

        helpers: ['Form'],
        
        _selectedIndex: -1,
        _selectedCondIndex: -1,
        _condGroupscrollablepanel: null,
        _condscrollablepanel: null,

        initial: function () {
            
            if (GeckoJS.Session.get('condGroups') == null) {

                var condGroups;
                var condGroupModel = new CondimentGroupModel();
                condGroups = condGroupModel.find('all', {
                    order: 'name',
                    recursive: 2
                });

                GeckoJS.Session.set('condGroups', condGroups);
                
                this.updateCondimentsSession();

                this.registerEventListener();
            }

        },

        updateCondimentsSession: function() {

            var condGroups = GeckoJS.Session.get('condGroups');

            var condCols = GeckoJS.Configure.read('vivipos.fec.settings.CondimentCols') || 4;

            var condGroupsById = {};

            condGroups.forEach(function(condGroup){

                var cgId = condGroup.id;

                var condimentGroup = condGroup['CondimentGroup'] || {};
                condimentGroup['Condiment'] = [];

                if(condGroup['Condiment']) {
                    condGroup['Condiment'].forEach(function(condiment) {
                        condiment['seltype'] = condGroup.seltype;
                        condimentGroup['Condiment'].push(condiment);
                    });
                }
                condGroupsById[cgId] = condimentGroup;

            }, this);

            GeckoJS.Session.set('condGroupsById', condGroupsById);
            
            var condGroupsByPLU = {};

            // preprocess condiments for faster
            var products = GeckoJS.Session.get('products');
            if (products) {

                products.forEach(function(product) {

                    if(!product['cond_group'] || product['cond_group'].length == 0) return false;
                    if (condGroupsByPLU[product['cond_group']]) return false;

                    var condgroup = product['cond_group'];
                    var itemCondGroups = condgroup.split(',');

                    var selectCondiments = [];
                    var selectedItems = [];
                    var prevCondGroup = null;

                    itemCondGroups.forEach(function(itemCondGroup){

                        if(!condGroupsById[itemCondGroup]) return false;

                        // condiments group with newline 
                        if (prevCondGroup && prevCondGroup.newline) {
                            var numEmptyBtns = ((selectCondiments.length % condCols) >0) ? (condCols - (selectCondiments.length % condCols) ) : 0;
                            for (var ii=0; ii < numEmptyBtns; ii++) {
                                selectCondiments.push({id: ""});
                            }                           
                        }
                        prevCondGroup = condGroupsById[itemCondGroup];
                        selectCondiments = selectCondiments.concat(prevCondGroup['Condiment']);
                        

                    });

                    for(var i = 0 ; i < selectCondiments.length; i++ ) {
                        if(selectCondiments[i]['preset']) selectedItems.push(i);
                    }

                    condGroupsByPLU[condgroup] = {
                        'Condiments': selectCondiments,
                        'PresetItems': selectedItems
                    };

                }, this);
            }
            GeckoJS.Session.set('condGroupsByPLU', condGroupsByPLU);
            // self.log('condGroupsByPLU ' + self.dump(condGroupsByPLU));
             
        },


        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'condGroups' || evt.data.key == 'productsIndexesByCateAll') {
                    self.updateCondimentsSession();
                }
            });

        },



        createCondimentPanel: function () {

            var condGroups = GeckoJS.Session.get('condGroups');

            // bind condiments data
            var condPanelView =  new GeckoJS.NSITreeViewArray(condGroups);
            this._condGroupscrollablepanel = document.getElementById('condimentscrollablepanel');
            this._condGroupscrollablepanel.datasource = condPanelView;

            this._condscrollablepanel = document.getElementById('detailscrollablepanel');

            this.resetInputData();
            this.resetInputCondData();

            this.changeCondimentPanel(-1);

            this.validateForm();
        },

        exit: function() {
            // check if condiment group and condiment forms have been modified
            if ((this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('condGroupForm')) ||
                (this._selectedCondIndex != -1 && GeckoJS.FormHelper.isFormModified('condimentForm'))) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current condiment group and/or condiment.  Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (this._selectedCondIndex != -1 && GeckoJS.FormHelper.isFormModified('condimentForm')) {
                        this.modifyCond();
                    }
                    if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('condGroupForm')) {
                        this.modify();
                    }
                }
            }
            window.close();
        },

        confirmChangeCondGroup: function(index) {
            // check if condiment group and condiment forms have been modified
            if ((this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex)) && GeckoJS.FormHelper.isFormModified('condGroupForm')) ||
                (this._selectedCondIndex != -1 && GeckoJS.FormHelper.isFormModified('condimentForm'))) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current condiment group and/or condiment. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        changeCondimentPanel: function(index) {

            if (this._selectedIndex == index) return;
            
            var condGroups = GeckoJS.Session.get('condGroups');
            if (condGroups) {
                if (index >= condGroups.length) index = condGroups.length - 1;
            }
            else {
                index = -1;
            }

            if (!this.confirmChangeCondGroup(index)) {
                this._condGroupscrollablepanel.selectedItems = [this._selectedIndex];
                this._condGroupscrollablepanel.selectedIndex = this._selectedIndex;
                return;
            }

            var conds;
            if (condGroups && (index != null) && (index > -1) && condGroups.length > index)
                conds = condGroups[index]['Condiment'];

            this._condGroupscrollablepanel.selectedIndex = index;
            this._condGroupscrollablepanel.selectedItems = [index];
            this._condGroupscrollablepanel.ensureIndexIsVisible(index);

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

        confirmChangeCondiment: function(index) {
            // changing to a new condiment?
            if (this._selectedCondIndex != -1 && (index == null || (index != -1 && index != this._selectedCondIndex))) {
                // check if condiment group and condiment forms have been modified
                if (GeckoJS.FormHelper.isFormModified('condimentForm')) {
                    if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                                 _('Discard Changes'),
                                                 _('You have made changes to the current condiment condiment. Are you sure you want to discard the changes?'))) {
                        return false;
                    }
                }
            }
            return true;
        },

        clickCondimentPanel: function(index) {

            if (this._selectedCondIndex == index) return;
            
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

            if (!this.confirmChangeCondiment(index)) {
                this._condscrollablepanel.selectedItems = [this._selectedCondIndex];
                this._condscrollablepanel.selectedIndex = this._selectedCondIndex;
                return;
            }

            this._selectedCondIndex = index;

            this._condscrollablepanel.selectedIndex = index;
            this._condscrollablepanel.selectedItems = [index];
            this._condscrollablepanel.ensureIndexIsVisible(index);

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
                document.getElementById('condiment_preset').setAttribute('disabled',  true);

                document.getElementById('condiment_button_color').setAttribute('disabled',  true);
                document.getElementById('condiment_font_size').setAttribute('disabled',  true);
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
                    document.getElementById('condiment_preset').setAttribute('disabled',  true);

                    document.getElementById('modify_condiment').setAttribute('disabled',  true);
                    document.getElementById('delete_condiment').setAttribute('disabled',  true);

                    document.getElementById('condiment_button_color').setAttribute('disabled',  true);
                    document.getElementById('condiment_font_size').setAttribute('disabled',  true);
                }
                else {
                    document.getElementById('condiment_name').removeAttribute('disabled');
                    document.getElementById('condiment_price').removeAttribute('disabled');
                    document.getElementById('condiment_preset').setAttribute('disabled', false);

                    document.getElementById('condiment_button_color').setAttribute('disabled',  false);
                    document.getElementById('condiment_font_size').setAttribute('disabled',  false);

                    // validate condiment name and price
                    var cond_name = document.getElementById('condiment_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                    var cond_price = document.getElementById('condiment_price').value.replace(/^\s*/, '').replace(/\s*$/, '');
                    if (cond_name.length > 0 && !isNaN(parseFloat(cond_price))) {
                        document.getElementById('modify_condiment').setAttribute('disabled', false);
                    }
                    else {
                        document.getElementById('modify_condiment').setAttribute('disabled',  true);
                    }
                    document.getElementById('delete_condiment').setAttribute('disabled', false);
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
            GeckoJS.FormHelper.unserializeFromObject('condGroupForm', valObj);
        },

        add: function  () {
            if (!this.confirmChangeCondGroup()) {
                this._condGroupscrollablepanel.selectedItems = [this._selectedIndex];
                return;
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';

            var inputObj = {
                input0:null,
                require0:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Condiment Group'), features,
                                       _('New Condiment Group'), '', _('Group Name'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                var inputData = {
                    name: inputObj.input0,
                    seltype: 'single',
                    newline: false
                };
                var condGroupModel = new CondimentGroupModel();
                var condGroups = condGroupModel.findByIndex('all', {
                    index: 'name',
                    value: inputData.name
                });
                if ((condGroups != null) && (condGroups.length > 0)) {
                    NotifyUtils.warn(_('Condiment Group [%S] already exists.', [inputData.name]));
                    return;
                }

                try {
                    var condgroupSaved = condGroupModel.save(inputData);
                    condgroupSaved['CondimentGroup'] = GREUtils.extend({}, condgroupSaved);

                    var condGroups = GeckoJS.Session.get('condGroups') || [];

                    condGroups.push(condgroupSaved);

                    GeckoJS.Session.set('condGroups', condGroups);

                    var view = this._condGroupscrollablepanel.datasource;
                    view.data = condGroups;

                    //this._condGroupscrollablepanel.refresh();

                    this._selectedIndex = -1;
                    this._selectedCondIndex = -1;
                    this.changeCondimentPanel(condGroups.length - 1);

                    OsdUtils.info(_('Condiment Group [%S] added successfully', [inputData.name]));
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while adding Condiment Group [%S]. The group may not have been added successfully', [inputData.name]));
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
                            NotifyUtils.warn(_('Condiment Group [%S] already exists', [inputData.name]));
                            return;
                        }
                    }
                }

                try {
                    inputData.id = condGroup.id;
                    condGroupModel.id = condGroup.id;
                    var condgroupSaved = condGroupModel.save(inputData);
                    condgroupSaved['CondimentGroup'] = GREUtils.extend({}, condgroupSaved);

                    GREUtils.extend(condGroups[this._selectedIndex], condgroupSaved);
                    GeckoJS.Session.set('condGroups', condGroups);

                    var view = this._condGroupscrollablepanel.datasource;
                    view.data = condGroups;
                    this._condGroupscrollablepanel.refresh();

                    GeckoJS.FormHelper.unserializeFromObject('condGroupForm', inputData);
                    OsdUtils.info(_('Condiment Group [%S] modified successfully', [inputData.name]));
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while modifying Condiment Group [%S]. The group may not have been modified successfully', [inputData.name]));
                }
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var condGroup = condGroups[this._selectedIndex];

            // check if condiment group has been assigned to products
            var linked = false;
            var products = GeckoJS.Session.get('products');
            if(products){
                for (var i = 0; i < products.length; i++) {
                    if (products[i].cond_group && products[i].cond_group.indexOf(condGroup.id) != -1) {
                        linked = true;
                        break;
                    }
                }
            }
            if (linked) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('confirm delete %S', [condGroup.name]),
                                             _('This condiment group is linked to one or more products. Are you sure you want to delete it?'))) {
                    return;
                }
            }
            else {
                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [condGroup.name]), _('Are you sure?'))) {
                    return;
                }
            }

            var condGroupModel = new CondimentGroupModel();
            var condimentModel = new CondimentModel();

            try {
                // cascading delete
                condGroupModel.removeCondimentGroup(condGroup.id);

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
                this._condGroupscrollablepanel.refresh();

                var newIndex = this._selectedIndex;
                if (newIndex >= groups.length) newIndex = groups.length - 1;
                this.changeCondimentPanel(newIndex);

                OsdUtils.info(_('Condiment Group [%S] removed successfully', [condGroup.name]));
            }
            catch (e) {
                NotifyUtils.error(_('An error occurred while removing Condiment Group [%S]. The group may not have been removed successfully', [condGroup.name]));
            }
        },

        getInputCondDefault: function () {
            var valObj = {};
            this.query('[form=condimentForm]').each(function() {
                var n = this.name || this.getAttribute('name');
                if (!n) return;
                var v = this.getAttribute('default');

                if (typeof v != 'undefined') {
                    valObj[n] = v;
                }
            });
            return valObj;

        },

        getInputCondData: function () {

            return GeckoJS.FormHelper.serializeToObject('condimentForm');
        },

        resetInputCondData: function () {

            this.query('#condiment_name').val('');
            this.query('#condiment_price').val('');
            this.query('#condiment_button_color').val('condiment-button-color-default');
            this.query('#condiment_font_size').val('medium');
        },

        setInputCondData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('condimentForm', valObj);
        },

        addCond: function  () {
            if (this._selectedIndex == null || this._selectedIndex < 0) return;

            if (!this.confirmChangeCondiment()) {
                this._condscrollablepanel.selectedItems = [this._selectedCondIndex];
                return;
            }
            
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=550';
            var inputObj = {
                input0:null,
                input1:0,
                require0:true,
                require1:true,
                numberOnly1:true,
                numpad:'input1'
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Condiment'), features,
                                       _('New Condiment'), '', _('Condiment Name'), _('Condiment Price'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                if (isNaN(inputObj.input1)) {
                    NotifyUtils.warn(_('Condiment Price must be a number'));
                    return;
                }

                var inputData = this.getInputCondDefault();
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
                            NotifyUtils.warn(_('Condiment [%S] already exists in this group', [inputData.name]));
                            return;
                        }
                    }
                }

                try {
                    condModel.save(inputData);
                    // retrieve newly created record
                    var conds = condModel.findByIndex('all', {
                        index: 'name',
                        value: inputData.name,
                        recursive: 0
                    });
                    if ((conds != null) && (conds.length > 0)) {

                        // since we allow duplicate condiment names across different condiment groups, make sure
                        // we are retrieving the right record

                        for (var i = 0; i < conds.length; i++) {
                            if (conds[i].condiment_group_id == inputData.condiment_group_id) {
                                if (condGroups[this._selectedIndex]['Condiment'])
                                    condGroups[this._selectedIndex]['Condiment'].push(conds[i]['Condiment']);
                                else
                                    condGroups[this._selectedIndex]['Condiment'] = [conds[i]['Condiment']];
                                break;
                            }
                        }

                        GeckoJS.Session.set('condGroups', condGroups);

                        var view = this._condscrollablepanel.datasource;
                        view.data = condGroups[this._selectedIndex]['Condiment'];
                        
                        this._selectedCondIndex = -1;
                        this.clickCondimentPanel(view.data.length - 1);
                        OsdUtils.info(_('Condiment [%S] added successfully', [inputData.name]));
                    }
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while adding Condiment [%S]. The condiment may not have been added successfully', [inputData.name]));
                }
            }
        },

        modifyCond: function  () {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var condGroup = condGroups[this._selectedIndex];
            var cond = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];

            var inputData = this.getInputCondData();
            var condModel = new CondimentModel();

            // we will only make sure no duplicate names within the same group
            var conds = condGroups[this._selectedIndex]['Condiment'];
            if ((conds != null) && (conds.length > 0)) {
                for (var i = 0; i < conds.length; i++) {
                    if ((conds[i].name == inputData.name) && (i != this._selectedCondIndex)) {

                        NotifyUtils.warn(_('Condiment [%S] already exists in this group', [inputData.name]));
                        return;
                    }
                }
            }

            inputData.id = cond.id;
            inputData.price = parseFloat(inputData.price);
            inputData.price = isNaN(inputData.price) ? 0 : inputData.price;
            condModel.id = cond.id;

            try {
                condModel.save(inputData);

                GREUtils.extend(condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex], inputData);

                // check seltype is single , dont' preset else in the same condiment group
                if (inputData.preset && condGroup.seltype == 'single') {

                    var cm = new CondimentModel();
                    var presetConds = cm.find('all', {
                        conditions: "preset=1 AND condiment_group_id = '" + condGroup.id + "' AND id !='"+cond.id+"'",
                        recursive: 0
                    });

                    presetConds.forEach(function(updateCond) {
                        cm.id = updateCond.id;
                        cm.save({
                            preset: false
                        });
                    });

                    if (presetConds.length >0) {
                        // update session
                        condGroups[this._selectedIndex]['Condiment'] = GeckoJS.Array.objectExtract(cm.find('all', {
                            conditions: "condiment_group_id ='"+condGroup.id+"'",
                            recursive: 0
                        }),
                        '{n}.Condiment');
                    }

                }

                GeckoJS.Session.set('condGroups', condGroups);

                var view = this._condscrollablepanel.datasource;
                view.data = condGroups[this._selectedIndex]['Condiment'];

                GeckoJS.FormHelper.unserializeFromObject('condimentForm', inputData);
                this._condscrollablepanel.refresh();
                //this.clickCondimentPanel(this._selectedCondIndex);

                OsdUtils.info(_('Condiment [%S] modified successfully', [inputData.name]));
            }
            catch (e) {
                NotifyUtils.error(_('An error occurred while modifying Condiment [%S]. The condiment may not have been modified successfully', [inputData.name]));
            }
        },

        removeCond: function() {
            if (this._selectedCondIndex == null || this._selectedCondIndex < 0) return;

            var condGroups = GeckoJS.Session.get('condGroups');
            var condiment = condGroups[this._selectedIndex]['Condiment'][this._selectedCondIndex];

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [condiment.name]), _('Are you sure?'))) {

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

                    OsdUtils.info(_('Condiment [%S] removed successfully', [condiment.name]));
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while removing Condiment [%S]. The condiment may not have been removed successfully', [condiment.name]));
                }
            }
        }

    };

    // inherit controller
    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
            main.requestCommand('initial', null, 'Condiments');
        });
        if(main) main.addEventListener('onUpdateOptions', function() {
            main.requestCommand('updateCondimentsSession', null, 'Condiments');
        });
    }, false);

})();
