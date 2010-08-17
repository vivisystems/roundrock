(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Plugroups',

        scaffold: true,

        _listObj: null,
        _listView: null,
        _selectedIndex: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('groupscrollablepanel');
            }
            return this._listObj;
        },

        getInputDefault: function () {
            var valObj = {};
            this.query('[form=plugroupForm]').each(function() {
                var n = this.name || this.getAttribute('name');
                if (!n) return;
                var v = this.getAttribute('default');

                if (typeof v != 'undefined') {
                    valObj[n] = v;
                }
            });
            return valObj;

        },

        beforeScaffold: function(evt) {
            if (evt.data == 'index') {
                this.Scaffold.params = {order: 'display_order, name COLLATE NOCASE'};
            }
        },

        beforeScaffoldAdd: function(evt) {

            if (!this.confirmChangePlugroup()) {
                evt.preventDefault();
                return;
            }

            var plugroup = evt.data;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true};

            this._plugroupAdded = false;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Product Group'), aFeatures, _('New Product Group'), '', _('Group Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {
                plugroup.id = '';
                plugroup.name = inputObj.input0;
            } else {
                evt.preventDefault();
                return ;
            }

            var plugroupModel = new PlugroupModel();

            var plugroups = plugroupModel.findByIndex('all', {
                index: 'name',
                value: plugroup.name
            });

            if (plugroups != null && plugroups.length > 0) {
                
                NotifyUtils.warn(_('Duplicate product group name [%S]; Product group not added.', [plugroup.name]));
                evt.preventDefault();
                return ;
            }
            var newgroup = this.getInputDefault();
            newgroup.name = plugroup.name;
            newgroup.id = '';
            GREUtils.extend(evt.data, newgroup);

            this._plugroupAdded = true;
        },

        afterScaffoldAdd: function(evt) {
            // if new Product group exists, set selectedIndex to last item

            if (this._plugroupAdded) {
                this.requestCommand('list', {order: 'display_order, name COLLATE NOCASE'});

                var groupID = evt.data.id;
                var panel = this.getListObj();
                var data = panel.datasource.data;
                
                var newIndex = -1;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id == groupID) {
                        newIndex = i;
                        break;
                    }
                }
                panel.selectedIndex = newIndex;
                panel.selectedItems = [newIndex];
                panel.ensureIndexIsVisible(newIndex);

                this.updateSession('add', groupID);

                this.select();
                this.validateForm();

                document.getElementById('plugroup_name').focus();

                OsdUtils.info(_('Product group [%S] added successfully', [evt.data.name]));
            }

        },

        beforeScaffoldEdit: function(evt) {

            // check if modified to a duplicate Product group name
            var plugroupModel = new PlugroupModel();

            var plugroups = plugroupModel.findByIndex('all', {
                index: "name",
                value: evt.data.name.replace(/^\s*/, '').replace(/\s*$/, '')
            });

            this._plugroupModified = true;
            if (plugroups != null && plugroups.length > 0) {
                if ((plugroups.length > 1) || (plugroups[0].id != $('#plugroup_id').val())) {
                    evt.preventDefault();
                    this._plugroupModified = false;

                    NotifyUtils.warn(_('Duplicate product group name [%S]; Product group not modified.', [evt.data.name]));
                }
            }
        },

        afterScaffoldEdit: function(evt) {

            if (this._plugroupModified) {
                var panel = this.getListObj();

                var index = this.updateSession('modify', evt.data.id);
            
                this.requestCommand('list', {index: index, order: 'display_order, name COLLATE NOCASE'});

                panel.selectedIndex = index;
                panel.selectedItems = [index];

                this._selectedIndex = index;

                OsdUtils.info(_('Product group [%S] modified successfully', [evt.data.name]));
            }
        },

        /*
        beforeScaffoldSave: function(evt) {

        },
        */

        /*
        afterScaffoldSave: function(evt) {
        
        },
        */

        beforeScaffoldDelete: function(evt) {
            var panel = this.getListObj();
            var view = panel.datasource;
            var name = view.data[panel.selectedIndex].name;
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
            .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var device = mainWindow.GeckoJS.Controller.getInstanceByName('Devices');
            
            if (this.hasTaggedProducts(evt.data.id)) {
                NotifyUtils.error(_('[%S] has one or more products and may not be deleted', [name]));
                evt.preventDefault();
            }
            else if (this.hasTaggedProductSets(evt.data.id)) {
                NotifyUtils.error(_('[%S] belongs to one or more product sets and may not be deleted', [name]));
                evt.preventDefault();
            }
            else if (device != null && device.isGroupLinked(evt.data.id)) {
                NotifyUtils.error(_('[%S] has been linked to one or more check printers and may not be deleted', [name]));
                evt.preventDefault();
            }
            else if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [name]), _('Are you sure?')) == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function(evt) {

            var panel = this.getListObj();
            var view = panel.datasource;
            var index = panel.selectedIndex;

            if (index >= view.data.length - 1) {
                index = view.data.length - 2;
            }

            this.requestCommand('list', {index: index, order: 'display_order, name COLLATE NOCASE'});

            if (index > -1) {
                panel.selectedIndex = index;
                panel.selectedItems = [index];
            }
            else {
                panel.selectedIndex = index;
                panel.selectedItems = [];
                GeckoJS.FormHelper.reset('plugroupForm');
            }

            this.updateSession('delete', evt.data.id);

            this.validateForm();

            OsdUtils.info(_('Product group [%S] removed successfully', [evt.data.name]));
        },

        afterScaffoldIndex: function(evt) {
            var panel = this.getListObj();
            var panelView = this._listView;

            if (panelView == null) {
                panelView =  new GeckoJS.NSITreeViewArray(evt.data);

                panelView.renderButton = function(row, btn) {
                    var buttonColor = this.getCellValue(row, {
                        id: 'button_color'
                    });
                    var buttonFontSize = this.getCellValue(row, {
                        id: 'font_size'
                    });
                    if (buttonColor && btn) {
                        $(btn).addClass(buttonColor);
                    }
                    if (buttonFontSize && btn) {
                        $(btn).addClass('font-' + buttonFontSize);
                    }
                }
                this._listView = panelView;
                panel.datasource = panelView;
            }
            panelView.data = evt.data;
            panel.refresh();

            this.validateForm();
        },

        afterScaffoldView: function(evt) {
            var panel = this.getListObj();
            this._selectedIndex = panel.selectedIndex;
        },

        hasTaggedProducts: function (plugroupId) {
            var productModel = new ProductModel();
            var taggedProducts = productModel.find('all', {
                conditions: 'link_group like "%' + plugroupId + '%"'
            });
            return (taggedProducts && taggedProducts.length > 0);
        },

        hasTaggedProductSets: function (plugroupId) {
            var setItemModel = new SetItemModel();
            var taggedProductSets = setItemModel.find('all', {
                conditions: 'linkgroup_id = "' + plugroupId + '"'
            });
            return (taggedProductSets && taggedProductSets.length > 0);
        },

        load: function () {
            // populate plugroup panel
            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all', {
                order: 'display_order, name COLLATE NOCASE'
            } );

            var plugroupscrollablepanel = document.getElementById('plugroupscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            plugroupscrollablepanel.datasource = plugroupPanelView;

            // populate department panel
            var depPanelView = new NSICategoriesView('depscrollablepanel');

            var panel = this.getListObj();

            this.requestCommand('list', {index: -1, order: 'display_order, name COLLATE NOCASE'});

            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('plugroupForm');

            this.validateForm();
        },

        select: function() {

            var panel = this.getListObj();
            var index = panel.selectedIndex;

            if (index == this._selectedIndex) return;
            
            if (!this.confirmChangePlugroup(index)) {
                panel.selectedItems = [this._selectedIndex];
                panel.selectedIndex = this._selectedIndex;
                return;
            }

            this._selectedIndex = index;
            if (index == -1) {
                GeckoJS.FormHelper.reset('plugroupForm');
            }
            else {
                this.requestCommand('list', {index: index, order: 'display_order, name COLLATE NOCASE'});
            }

            this.validateForm();
            
            document.getElementById('plugroup_name').focus();
        },

        updateSession: function(mode, id) {
            
            var index = -1;
            var plugroupModel = new PlugroupModel();

            var plugroups = plugroupModel.find('all', {
                order: 'display_order, name COLLATE NOCASE'
            });

            var visiblePlugroups = [];
            var allPlugroups = [];
            plugroups.forEach(function(plugroup) {
                if (plugroup.visible) visiblePlugroups.push(plugroup.id);
                allPlugroups.push(plugroup.id);
            });

            var plugroupsById = GeckoJS.Session.get('plugroupsById');

            var targetPlugroup = plugroupModel.findById(id);

            switch(mode) {

                case 'add':
                case 'modify':

                    for (var i = 0; i < plugroups.length; i++) {
                        if (plugroups[i].id == id) {
                            index = i;
                            break;
                        }
                    }
                    plugroupsById[id] = targetPlugroup;
                    break;

                case 'remove':
                    if (this._selectedIndex >= plugroups.length) index = plugroups.length - 1;
                    else index = this._selectedIndex;

                    delete(plugroupsById[id]);
                    
                    break;
            }
            GeckoJS.Session.set('plugroupsById', plugroupsById);
            GeckoJS.Session.set('visiblePlugroups', visiblePlugroups);
            GeckoJS.Session.set('allPlugroups', allPlugroups);

            // refresh plugroup panel
            var plugroupscrollablepanel = document.getElementById('plugroupscrollablepanel');
            plugroupscrollablepanel.datasource.data = plugroups;
            plugroupscrollablepanel.refresh();
            
            return index;
        },

        confirmChangePlugroup: function(index) {
            // check if plugroup form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('plugroupForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current product group. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        exit: function() {
            // check if user form has been modified
            if (this._selectedIndex != -1&& GeckoJS.FormHelper.isFormModified('plugroupForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current product group. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.requestCommand('update', null, 'Plugroups');
                }
            }
            window.close();
        },

        validateForm: function() {

            var nameTextbox = document.getElementById('plugroup_name');
            var dispOrderTextbox = document.getElementById('display_order');
            var modBtn = document.getElementById('modify_plugroup');
            var delBtn = document.getElementById('delete_plugroup');
            var visibleCheckbox = document.getElementById('visible');
            var routingCheckbox = document.getElementById('routing');
            var colorpicker = document.getElementById('plugroup_button_color');
            var fontsizepicker = document.getElementById('plugroup_font_size');
            var nondiscountableCheckbox = document.getElementById('non_discountable');
            var nonsurchargeableCheckbox = document.getElementById('non_surchargeable');

            var tab1 = document.getElementById('tab1');
            var tab2 = document.getElementById('tab2');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {

                var name = nameTextbox.value.replace(/^\s*/, '').replace(/\s*$/, '');
                nameTextbox.removeAttribute('disabled');
                dispOrderTextbox.removeAttribute('disabled');
                modBtn.setAttribute('disabled', name.length < 1);
                delBtn.setAttribute('disabled', false);
                colorpicker.setAttribute('disabled', false);
                fontsizepicker.setAttribute('disabled', false);
                visibleCheckbox.setAttribute('disabled', false);
                routingCheckbox.setAttribute('disabled', false);
                nondiscountableCheckbox.setAttribute('disabled', false);
                nonsurchargeableCheckbox.setAttribute('disabled', false);

                tab1.removeAttribute('disabled');
                tab2.removeAttribute('disabled');
            }
            else {
                nameTextbox.setAttribute('disabled', true);
                dispOrderTextbox.setAttribute('disabled', true);
                modBtn.setAttribute('disabled', true);
                delBtn.setAttribute('disabled', true);
                visibleCheckbox.setAttribute('disabled', true);
                routingCheckbox.setAttribute('disabled', true);
                colorpicker.setAttribute('disabled', true);
                fontsizepicker.setAttribute('disabled', true);
                nondiscountableCheckbox.setAttribute('disabled', true);
                nonsurchargeableCheckbox.setAttribute('disabled', true);
                tab1.setAttribute('disabled', true);
                tab2.setAttribute('disabled', true);
            }
        }
	
    };

    AppController.extend(__controller__);

})();
