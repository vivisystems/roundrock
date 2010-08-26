(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'LedgerEntryTypes',

        scaffold: true,

        _listObj: null,
        _listDatas: null,
        _selectedIndex: -1,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('typescrollablepanel');
            }
            return this._listObj;
        },

        /*
        beforeScaffold: function(evt) {
            
        },
        */
        beforeScaffoldAdd: function(evt) {

            var ledgerType = evt.data;
            ledgerType.id = '';

            if (!this.confirmChangeLedgerEntryType()) {
                evt.preventDefault();
                return;
            }
            
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true,
                            radioItems: [{label: _('(ledgerEntryType)IN'), value: 'IN'},
                                         {label: _('(ledgerEntryType)OUT'), value: 'OUT', selected: true}]};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Product Group'), aFeatures,
                                       _('New Ledger Entry Type'), '', _('Ledger Entry Type'), '', inputObj);
                                       
            if (inputObj.ok && inputObj.input0) {
                ledgerType.type = inputObj.input0;
                ledgerType.mode = inputObj.radio;
                ledgerType.drawer_change = false;
            } else {
                evt.preventDefault();
                return ;
            }

            // check for empty transaction type
            var type = GeckoJS.String.trim(ledgerType.type);
            if (type == '') {
                NotifyUtils.warn(_('Transaction type must not be empty'));
                evt.preventDefault();
            }
            else {
                // check for duplicate transaction type
                var dupType = false;
                for (var i = 0; i < this._listDatas.length; i++) {
                    if (this._listDatas[i].type == type) {
                        dupType = true;
                        break;
                    }
                }

                if (dupType) {
                    NotifyUtils.warn(_('Transaction type [%S] already exists', [type]));
                    evt.preventDefault();
                }
            }
        },

        afterScaffoldAdd: function(evt) {
            if (evt.data.id != '') {
                this.load();

                // locate index of newly added type
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].id == evt.data.id) {
                        break;
                    }
                }
                if (index == this._listDatas.length) {
                    index = -1;
                }
                this.select(index);

                OsdUtils.info(_('Transaction type [%S] and mode [%S] successfully added',
                               [evt.data.type, _(evt.data.mode)]))
            }
        },

        beforeScaffoldEdit: function(evt) {

            var ledgerType = evt.data;
            var type = ledgerType.type;
            
            // check for duplicate transaction type
            var dupType = false;
            for (var i = 0; i < this._listDatas.length; i++) {
                if (this._listDatas[i].id != ledgerType.id && this._listDatas[i].type == type) {
                    dupType = true;
                    break;
                }
            }

            if (dupType) {
                NotifyUtils.warn(_('Transaction type [%S] already exists', [type]));
                evt.preventDefault();
                ledgerType.id = '';
            }
            else {
                // check if used for drawer change; if yes, then set other transaction types of the same mode to no
                if (evt.data.drawer_change) {
                    this.clearDrawerChange(evt.data.mode);
                }
            }
        },

        afterScaffoldEdit: function(evt) {
            if (evt.data.id) {
                this.load();

                // locate index of modified type
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].id == evt.data.id) {
                        break;
                    }
                }
                if (index == this._listDatas.length) {
                    index = -1;
                }
                this.select(index);

                OsdUtils.info(_('Transaction type [%S] and mode [%S] successfully updated',
                               [evt.data.type, _(evt.data.mode)]))
            }
        },

        beforeScaffoldDelete: function(evt) {
            if (evt.data.id) {
                if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S (%S)', [evt.data.type, _(evt.data.mode)]), _('Are you sure?')) == false) {
                    evt.preventDefault();
                }
            }
            else {
                evt.preventDefault();
            }
        },

        afterScaffoldDelete: function(evt) {
            if (this._selectedIndex == this._listDatas.length - 1) {
                this._selectedIndex--;
            }
            
            this.load();

            OsdUtils.info(_('Transaction type [%S] and mode [%S] successfully deleted',
                           [evt.data.type, _(evt.data.mode)]))
        },

        afterScaffoldIndex: function(evt) {
            this._listDatas = evt.data;
            var panelView =  new GeckoJS.NSITreeViewArray(evt.data);

            panelView.getCellValue= function(row, col) {

                var text;
                if (col.id == 'mode') {
                    text = _('(ledgerEntryType)' + this.data[row][col.id]);
                }
                else {
                    text = this.data[row][col.id];
                }
                return text;
            };
            this.getListObj().datasource = panelView;

            if (this._listDatas.length > 0) {
                this.getListObj().selection.select(this._selectedIndex);
                this.getListObj().treeBoxObject.ensureRowIsVisible(this._selectedIndex);
            }
            else
                this.getListObj().selection.select(-1);

            this.validateForm();
        },

        load: function() {
            GeckoJS.FormHelper.reset('ledger_entry_typeForm');
            this.requestCommand('list', {order: 'mode, type', index: this._selectedIndex});
            this.getListObj().treeBoxObject.ensureRowIsVisible(this._selectedIndex);
        },

        select: function(index){
            if (index == this._selectedIndex && index != -1) return;

            if (!this.confirmChangeLedgerEntryType(index)) {
                this.getListObj().selection.select(this._selectedIndex);
                return;
            }

            this._selectedIndex = index;
            var entry_type = this._listDatas[index];
            if ( index > -1 ) // if index is -1, then entry_type will be null.
                this.requestCommand('view', entry_type.id);
            
            this.getListObj().selection.select(index);
            this.getListObj().treeBoxObject.ensureRowIsVisible(index);
            this._selectedIndex = index;
            
            this.validateForm();
        },

        clearDrawerChange: function(mode) {
            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            var records = ledgerEntryTypeModel.find('all', {conditions: 'drawer_change = "1" and mode = "' + mode + '"'});

            records.forEach(function(record) {
                                ledgerEntryTypeModel.id = record.id;
                                record.drawer_change = false;
                                ledgerEntryTypeModel.save(record);
                            });
        },

        getDrawerChangeType: function(mode) {
            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            var entryType = ledgerEntryTypeModel.find('first', {conditions: 'drawer_change = "1" and mode = "'+ mode + '"',
                                                                order: 'type'});

            if (entryType) {
                return entryType;
            }
            else {
                if (mode == 'IN') {
                    return {type: _('Drawer Change IN'), mode: 'IN', drawer_change: true};
                }
                else {
                    return {type: _('Drawer Change OUT'), mode: 'OUT', drawer_change: true};
                }
            }
        },

        confirmChangeLedgerEntryType: function(index) {
            // check if ledger entry type form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('ledger_entry_typeForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current ledger entry type. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        exit: function() {
            // check if ledger entry type form has been modified
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('ledger_entry_typeForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current ledger entry type. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.requestCommand('update', null, 'LedgerEntryTypes');
                }
            }
            window.close();
        },

        validateForm: function() {
            var index = this.getListObj().selectedIndex;
            var modBtn = document.getElementById('modify_entry_type');
            var delBtn = document.getElementById('delete_entry_type');

            var type = GeckoJS.String.trim(document.getElementById('entry_type').value);

            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        }


    };

    AppController.extend(__controller__);

})();

