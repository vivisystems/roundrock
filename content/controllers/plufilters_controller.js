(function(){

    GeckoJS.Controller.extend( {
        name: 'Plufilters',
	
        _listObj: null,
        _listDatas: [],

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plufilterscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            if (this._listDatas.length <= 0) {
                var datas = document.getElementById('pref_plufilters').value;
                this._listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._listDatas.length <= 0) this._listDatas = [];
            }

            this.getListObj().datasource = this._listDatas;

            this.validateForm();
        },

        addFilter: function(){
            var filterName = document.getElementById('filter_name').value;
            var filterIndex = document.getElementById('filter_index').value;
            var filterLength = document.getElementById('filter_length').value;
            
            this._listDatas.push({filtername: filterName, index: filterIndex, length: filterLength});

            document.getElementById('filter_name').value = '';
            document.getElementById('filter_index').value = 0;
            document.getElementById('filter_length').value = 0;

            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('index asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            document.getElementById('pref_plufilters').value = datastr;

            // @todo OSD
            OsdUtils.info(_('Filter [%S] added successfully', [filterName]));

            this.load();
        },

        removeFilter: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                this._listDatas.splice(index, 1);
                var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('index asc');
                var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

                document.getElementById('pref_plufilters').value = datastr;

                // @todo OSD
                OsdUtils.info(_('Filter removed successfully', []));

                this.load();
            }
        },

        validateForm: function() {

            var addBtn = document.getElementById('add_filter');
            var removeBtn = document.getElementById('remove_filter');

            var filterName = document.getElementById('filter_name').value;
            var filterIndex = document.getElementById('filter_index').value;
            var filterLength = document.getElementById('filter_length').value;

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                removeBtn.setAttribute('disabled', false);
            } else {
                removeBtn.setAttribute('disabled', true);
            }

            if (filterName.length > 0 && filterIndex > 0 && filterLength > 0) {
                addBtn.setAttribute('disabled', false);
            } else {
                addBtn.setAttribute('disabled', true);
            }
        },
	
        select: function(){
            this.validateForm();
        }
	
    });

})();

