(function(){

    var __controller__ = {
        name: 'Plugroups',
        scaffold: true,
        uses: [],
        _listObj: null,
        _listView: null,

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
                this.Scaffold.params = {order: 'display_order, name'};
            }
        },

        beforeScaffoldAdd: function(evt) {

            var plugroup = evt.data;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, require0:true};

            this._plugroupAdded = false;

            window.openDialog(aURL, _('Add New Product Group'), features, _('New Product Group'), '', _('Group Name'), '', inputObj);
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
                //@todo OSD
                NotifyUtils.warn(_('Duplicate Product Group name [%S]; Product Group not added.', [plugroup.name]));
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
                this.requestCommand('list', {order: 'display_order, name'});

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

                // @todo OSD
                OsdUtils.info(_('Product Group [%S] added successfully', [evt.data.name]));
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

                    // @todo OSD
                    NotifyUtils.warn(_('Duplicate Product Group name [%S]; Product group not modified.', [evt.data.name]));
                }
            }
        },

        afterScaffoldEdit: function(evt) {

            if (this._plugroupModified) {
                var panel = this.getListObj();

                var index = this.updateSession('modify', evt.data.id);
            
                this.requestCommand('list', {index: index, order: 'display_order, name'});

                panel.selectedIndex = index;
                panel.selectedItems = [index];

                // @todo OSD
                OsdUtils.info(_('Job [%S] modified successfully', [evt.data.name]));
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
            var device = opener.opener.GeckoJS.Controller.getInstanceByName('Devices');
            
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
            else if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [name]), _('Are you sure?')) == false) {
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

            this.requestCommand('list', {index: index, order: 'display_order, name'});

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

            // @todo OSD
            OsdUtils.info(_('Product Group [%S] removed successfully', [evt.data.name]));
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

        //
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
            var panel = this.getListObj();

            this.requestCommand('list', {index: -1, order: 'display_order, name'});

            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('plugroupForm');

            this.validateForm();
        },

        select: function(){

            var panel = this.getListObj();
            var index = panel.selectedIndex;

            if (index == -1) {
                GeckoJS.FormHelper.reset('plugroupForm');
            }
            else {
                this.requestCommand('list', {index: index, order: 'display_order, name'});
            }

            document.getElementById('plugroup_name').focus();
        },

        updateSession: function(mode, id) {
            var index = -1;
            var plugroupModel = new PlugroupModel();

            var plugroups = plugroupModel.find('all', {
                order: 'display_order, name'
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
            return index;
        },

        validateForm: function() {

            var nameTextbox = document.getElementById('plugroup_name');
            var modBtn = document.getElementById('modify_plugroup');
            var delBtn = document.getElementById('delete_plugroup');
            var visibleCheckbox = document.getElementById('visible');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {

                var name = nameTextbox.value.replace(/^\s*/, '').replace(/\s*$/, '');
                nameTextbox.removeAttribute('disabled');
                modBtn.setAttribute('disabled', name.length < 1);
                delBtn.setAttribute('disabled', false);
                visibleCheckbox.setAttribute('disabled', false);
            }
            else {
                nameTextbox.setAttribute('disabled', true);
                modBtn.setAttribute('disabled', true);
                delBtn.setAttribute('disabled', true);
                visibleCheckbox.setAttribute('disabled', true);
            }
        }
	
    };

    GeckoJS.Controller.extend(__controller__);

})();
