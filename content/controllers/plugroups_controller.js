(function(){

    /**
     * Class TempleteController
     */

    GeckoJS.Controller.extend( {
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

        /*
        beforeScaffold: function(evt) {
            
        },
        */

        beforeScaffoldAdd: function(evt) {

            var plugroup = evt.data;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {input0:null, require0:true};

            this._plugroupAdded = false;

            window.openDialog(aURL, 'prompt_additem', features, _('New PLU Group'), '', _('Group Name:'), '', inputObj);
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
                alert(_('Duplicate PLU Group name (%S); PLU Group not added.', [plugroup.name]));
                evt.preventDefault();
                return ;
            }
            var newgroup = GeckoJS.FormHelper.serializeToObject('plugroupForm');
            newgroup.name = plugroup.name;
            newgroup.id = '';
            GREUtils.extend(evt.data, newgroup);

            this._plugroupAdded = true;
        },

        afterScaffoldAdd: function(evt) {
            // if new PLU group exists, set selectedIndex to last item

            if (this._plugroupAdded) {
                var panel = this.getListObj();
                var data = panel.datasource.data;
                var newIndex = data.length;

                this.requestCommand('list', newIndex);

                panel.selectedIndex = newIndex;
                panel.selectedItems = [newIndex];

                this.validateForm();

                document.getElementById('plugroup_name').focus();
            }

        },

        beforeScaffoldEdit: function(evt) {
            var inputObj = GeckoJS.FormHelper.serializeToObject('plugroupForm', false);

            GREUtils.extend(evt.data, inputObj);

        },

        afterScaffoldEdit: function(evt) {

            var panel = this.getListObj();
            var index = panel.selectedIndex;

            this.requestCommand('list', index);

            panel.selectedIndex = index;
            panel.selectedItems = [index];
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
            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?')) == false) {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function() {

            var panel = this.getListObj();
            var view = panel.datasource;
            var index = panel.selectedIndex;

            if (index >= view.data.length - 1) {
                index = view.data.length - 2;
            }

            this.requestCommand('list', index);

            panel.selectedIndex = index;
            panel.selectedItems = [index];

            this.validateForm();
        },

        afterScaffoldIndex: function(evt) {
            var panel = this.getListObj();
            var panelView = this._listView;

            if (this._listView == null) {
                var panelView =  new GeckoJS.NSITreeViewArray(evt.data);

                panelView.renderButton = function(row, btn) {
                    var buttonColor = this.getCellValue(row, {
                        id: 'button_color'
                    });
                    var buttonFontSize = this.getCellValue(row, {
                        id: 'font_size'
                    });
                    if (buttonColor && btn) {
                        $(btn).addClass('button-' + buttonColor);
                    }
                    if (buttonFontSize && btn) {
                        $(btn).addClass('font-' + buttonFontSize);
                    }
                }
                this._listView = panelView;
                panel.datasource = panelView;
            }
            panelView.data = evt.data;

            this.validateForm();
        },

        load: function () {

            var panel = this.getListObj();

            this.requestCommand('list', -1);

            panel.selectedItems = [-1];
            panel.selectedIndex = -1;

            GeckoJS.FormHelper.reset('plugroupForm');

            this.validateForm();
        },

        select: function(){

            var panel = this.getListObj();
            var index = panel.selectedIndex;

            this.requestCommand('list', index);
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
	
    });


})();
