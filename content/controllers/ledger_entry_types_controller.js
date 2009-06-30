(function(){

    var __controller__ = {

        name: 'LedgerEntryTypes',

        scaffold: true,

        _listObj: null,
        _listDatas: null,
        _index: 0,

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
            // check for empty transaction type
            var type = GeckoJS.String.trim(evt.data.type);
            if (type == '') {
                NotifyUtils.warn(_('Transaction type must not be empty'));
                evt.preventDefault();
            }
            else {
                // check for duplicate transaction type
                var newType = type.replace('\'', '"', 'g');
                var dupType = new GeckoJS.ArrayQuery(this._listDatas).filter('type = \'' + newType + '\'');

                evt.data.id = '';

                if (dupType.length > 0) {
                    NotifyUtils.warn(_('Transaction type [%S] already exists', [newType]));
                    evt.preventDefault();
                }
                else {
                    // check if used for drawer change; if yes, then set other transaction types of the same mode to no
                    if (evt.data.drawer_change == 'Y') {
                        this.clearDrawerChange(evt.data.mode);
                    }
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
            // check if used for drawer change; if yes, then set other transaction types of the same mode to no
            if (evt.data.drawer_change == 'Y') {
                this.clearDrawerChange(evt.data.mode);
            }
        },

        afterScaffoldEdit: function(evt) {
            if (evt.data.id) {
                this.load();

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
            if (this._index == this._listDatas.length - 1) {
                this._index--;
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
                else if (col.id == 'drawer_change') {
                    text = _('(ledgerEntryType)' + this.data[row][col.id]);
                }
                else {
                    text = this.data[row][col.id];
                }
                return text;
            };
            this.getListObj().datasource = panelView;

            if (this._listDatas.length > 0) {
                this.getListObj().selection.select(this._index);
                this.getListObj().treeBoxObject.ensureRowIsVisible(this._index);
            }
            else
                this.getListObj().selection.select(-1);

            this.validateForm();
        },

        load: function() {
            GeckoJS.FormHelper.reset('ledger_entry_typeForm');
            this.requestCommand('list', {order: 'mode, type', index: this._index});
            this.getListObj().treeBoxObject.ensureRowIsVisible(this._index);
        },

        select: function(index){
            if (index >= 0) {
                var entry_type = this._listDatas[index];
                this.requestCommand('view', entry_type.id);
            }
            
            this.getListObj().selection.select(index);
            this.getListObj().treeBoxObject.ensureRowIsVisible(index);
            this._index = index;
            
            this.validateForm();
        },

        clearDrawerChange: function(mode) {
            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            var records = ledgerEntryTypeModel.find('all', {conditions: 'drawer_change = "Y" and mode = "' + mode + '"'});

            records.forEach(function(record) {
                                ledgerEntryTypeModel.id = record.id;
                                record.drawer_change = 'N';
                                ledgerEntryTypeModel.save(record);
                            });
        },

        getDrawerChangeType: function(mode) {
            var ledgerEntryTypeModel = new LedgerEntryTypeModel();
            var entryType = ledgerEntryTypeModel.find('first', {conditions: 'drawer_change = "Y" and mode = "'+ mode + '"',
                                                                order: 'type'});

            if (entryType) {
                return entryType;
            }
            else {
                if (mode == 'IN') {
                    return {type: _('Drawer Change IN'), mode: 'IN', drawer_change: 'Y'};
                }
                else {
                    return {type: _('Drawer Change OUT'), mode: 'OUT', drawer_change: 'Y'};
                }
            }
        },

        validateForm: function() {
            var index = this.getListObj().selectedIndex;
            var addBtn = document.getElementById('add_entry_type');
            var modBtn = document.getElementById('modify_entry_type');
            var delBtn = document.getElementById('delete_entry_type');

            var type = GeckoJS.String.trim(document.getElementById('entry_type').value);

            addBtn.setAttribute('disabled', type == '');
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        }


    };

    GeckoJS.Controller.extend(__controller__);

})();

