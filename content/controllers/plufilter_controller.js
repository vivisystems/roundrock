(function(){

    var __controller__ = {

        name: 'Plufilters',
	
        _listObj: null,
        _listDatas: [],

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
            this.getListObj().treeBoxObject.ensureRowIsVisible(this.getListObj().selectedIndex);
            
            this.validateForm();
        },

        addFilter: function(){
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
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Filter name must not be empty'));
                }
            }
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
                deleteBtn.removeAttribute('disabled');
                filterIndexTextbox.removeAttribute('disabled');
                filterLengthTextbox.removeAttribute('disabled');

                var filterIndex = filterIndexTextbox.value;
                var filterLength = filterLengthTextbox.value;

                if (filterLength != '' && !isNaN(filterLength) && filterLength > 0 &&
                    filterIndex != '' && !isNaN(filterIndex) && filterIndex > 0) {
                    modifyBtn.removeAttribute('disabled');
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
            this.getListObj().selection.select(index);
            if (index > -1) {
                var inputObj = this._listDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('filterForm', inputObj);

            }
            else {
                GeckoJS.FormHelper.reset('filterForm');
            }

            this.validateForm();
        }
	
    };
    
    GeckoJS.Controller.extend(__controller__);

})();

