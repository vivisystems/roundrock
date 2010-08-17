(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Plufilters',
	
        _listObj: null,
        _listDatas: [],
        _selectedIndex: -1,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plufilterscrollablepanel');
            }
            return this._listObj;
        },

        load: function () {

            if (this._listDatas.length <= 0) {
                var datas = GeckoJS.Configure.read('vivipos.fec.settings.PluFilters');
                if (datas != null) this._listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._listDatas.length <= 0) this._listDatas = [];
            }

            this.getListObj().datasource = this._listDatas;
            this._selectedIndex = -1;

            var index = this.getListObj().selectedIndex;
            if (index == -1 && this._listDatas.length > 0) index = 0;
            this.select(index);
            this.getListObj().treeBoxObject.ensureRowIsVisible(index);
            
            this.validateForm();
        },

        addFilter: function(){

            if (!this.confirmChangeFilter()) {
                return;
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Filter'), aFeatures,
                                       _('New Filter'), '', _('Filter Name'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                var filterName = inputObj.input0.replace('\'', '"', 'g');

                var dupNames = new GeckoJS.ArrayQuery(this._listDatas).filter('filtername = \'' + filterName + '\'');

                if (dupNames.length > 0) {
                    
                    NotifyUtils.warn(_('Filter [%S] already exists', [filterName]));
                    return;
                }

                this._listDatas.push({filtername: filterName, index: 1, length: 1});

                this.saveFilters();

                // loop through tihs._listDatas to find the newly added destination and select it
                var index = 0;
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].filtername == filterName) {
                        this.select(index);
                        break;
                    }
                }

                OsdUtils.info(_('Filter [%S] added successfully', [filterName]));
            }
        },

        modifyFilter: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('filterForm');
            var index = this.getListObj().selectedIndex;
            if (index > -1) {
                if (inputObj.filtername != null && inputObj.filtername.length > 0) {
                    this._listDatas[index].index = inputObj.index;
                    this._listDatas[index].length = inputObj.length;

                    this.saveFilters();

                    var filterName = this._listDatas[index].filtername;

                    OsdUtils.info(_('Filter [%S] modified successfully', [filterName]));

                    return true;
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Filter name must not be empty'));

                    return false;
                }
            }
            return true;
        },

        deleteFilter: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var filterName = this._listDatas[index].filtername;

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete filter [%S]', [filterName]), _('Are you sure you want to delete product filter [%S]?', [filterName]))) {
                    return;
                }

                this._listDatas.splice(index, 1);
                this.saveFilters();

                OsdUtils.info(_('Filter [%S] removed successfully', [filterName]));

                index = this.getListObj().selectedIndex;
                if (index >= this._listDatas.length) index = this._listDatas.length - 1;
                this.select(index);
            }
        },

        saveFilters: function() {
            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('filtername asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            GeckoJS.Configure.write('vivipos.fec.settings.PluFilters', datastr);

            this.load();
        },

        validateForm: function() {

            var modifyBtn = document.getElementById('modify_filter');
            var deleteBtn = document.getElementById('delete_filter');

            var filterIndexTextbox = document.getElementById('filter_index');
            var filterLengthTextbox = document.getElementById('filter_length');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                deleteBtn.setAttribute('disabled', false);
                filterIndexTextbox.removeAttribute('disabled');
                filterLengthTextbox.removeAttribute('disabled');

                var filterIndex = filterIndexTextbox.value;
                var filterLength = filterLengthTextbox.value;

                if (filterLength != '' && !isNaN(filterLength) && filterLength > 0 &&
                    filterIndex != '' && !isNaN(filterIndex) && filterIndex > 0) {
                    modifyBtn.setAttribute('disabled', false);
                }
                else {
                    modifyBtn.setAttribute('disabled', true);
                }
            } else {
                deleteBtn.setAttribute('disabled', true);
                modifyBtn.setAttribute('disabled', true);
                filterIndexTextbox.setAttribute('disabled', true);
                filterLengthTextbox.setAttribute('disabled', true);
            }
        },
	
        select: function(index){
            
            if (index == this._selectedIndex) return;
            
            if (!this.confirmChangeFilter(index)) {
                this.getListObj().selection.select(this._selectedIndex);
                return;
            }

            this._selectedIndex = index;
            
            this.getListObj().selection.select(index);
            if (index > -1) {
                var inputObj = this._listDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('filterForm', inputObj);
            }
            else {
                GeckoJS.FormHelper.reset('filterForm');
            }

            this.validateForm();
        },
	
        exit: function() {
            // check if filter form has been modified
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('filterForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current product filter. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.modifyFilter()) return;
                }
            }
            window.close();
        },

        confirmChangeFilter: function(index) {
            // check if filter form have been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('filterForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current product filter. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        }

    };
    
    AppController.extend(__controller__);

})();

