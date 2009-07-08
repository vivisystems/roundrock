(function(){

    var __controller__ = {

        name: 'PluSearch',
        
        _listObj: null,
        _listDatas: null,
        _filterDatas: null,

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return s.replace( re, '\'\'' );
        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plusearchscrollablepanel');
            }
            return this._listObj;
        },

        createFilterRows: function() {
            var i=0;
            var rows_filter = document.getElementById('rows_filter');
            var filterstr = GeckoJS.Configure.read('vivipos.fec.settings.PluFilters') || '[]';
            this._filterDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(filterstr));

            if (this._filterDatas.length <= 0) {

                var advance_search = document.getElementById('advance_search');
                advance_search.setAttribute('hidden', true);
                return ;
            }
            this._filterDatas.forEach(function(o){
                var index = parseInt(o.index);
                var len = parseInt(o.length);
                var row = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'xul:row');
                var filter_label = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'xul:label');
                var filter_textbox = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul','xul:textbox');
                var label = o.filtername + ' (' + index + '-' + (index + len - 1) + '):';
                filter_label.setAttribute('value', label);
                filter_textbox.setAttribute('id', 'filter_' + i++);
                filter_textbox.setAttribute('size', parseInt(o.length) + 2);
                filter_textbox.setAttribute('maxlength', o.length);
                row.appendChild(filter_label);
                row.appendChild(filter_textbox);
                rows_filter.appendChild(row);
            });
        },

        advSearch: function() {
            var lastItem = this._filterDatas[this._filterDatas.length - 1];
            var len = parseInt(lastItem.index) + parseInt(lastItem.length) - 1;
            var pattern = '';
            pattern = GeckoJS.String.padLeft(pattern, len, "_");
            var i=0;
            this._filterDatas.forEach(function(o){
                var f = document.getElementById('filter_' + i++).value;
                if (f.length > 0) {
                    var index = parseInt(o.index) - 1;
                    var len = parseInt(o.length);
                    var pat = new Array();
                        pat = pattern.split("");
                    for (var j=0; j < len; j++) {
                        pat[index + j] = f[j];
                    }
                    pattern = pat.join("");
                }
            });
            // this.load(pattern);
            this.searchPlu(pattern);
        },

        advClear: function() {
            //
            var i=0;
            this._filterDatas.forEach(function(o){
                document.getElementById('filter_' + i++).value = "";
            });
        },

        load: function(barcode) {
            var fields = [];
            var searchStr = this._queryStringPreprocessor(barcode);

            var conditions = "p.no like '%" + searchStr + "%' or p.barcode like '%" + searchStr + "%' or p.name like '%" + searchStr + "%'";
            var prodModel = new ProductModel();
            //var datas = prodModel.find('all',{fields: fields, conditions: conditions});
            var sql = "SELECT p.*, s.quantity AS stock FROM products p LEFT JOIN stock_records s ON ( p.no = s.id ) WHERE " + conditions + ";";
            var datas = prodModel.getDataSource().fetchAll( sql );
            
            this._listDatas = datas;
            this.getListObj().datasource = datas;
        },

        select: function(index) {
            //
            var data = this._listDatas[index];
            if (data) {
                GeckoJS.FormHelper.unserializeFromObject('productForm', data);
                // document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
                var inputObj = window.arguments[0];
                inputObj.item = data;
            }
        },

        setSelections: function() {
            //
            var selections = [];
            var tree = this.getListObj();
            var self = this;
            if (this._listDatas && tree) {
                var selectedItems = tree.selectedItems;

                selectedItems.forEach(function(index) {
                    var product = self._listDatas[index];
                    if (product) {
                        selections.push(product);
                    }
                });
            }
            if (window.arguments && window.arguments[0]) {
                window.arguments[0].selections = selections;
            }
        },

        searchPlu: function (barcode) {
            barcode = barcode.replace(/[_\xa0]+$/, '');
            if (barcode == "") return;

            this.load(barcode);
            
            if (this._listDatas.length <= 0) {
                // barcode notfound

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Product Search'),
                                      _('Product [%S] Not Found!', [barcode]));
            } else if (this._listDatas.length == 1) {
                var product = this._listDatas[0];
                
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
                // document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
                if (window.arguments && window.arguments[0]) {
                    window.arguments[0].item = product;
                }
            }else {
                // reset?
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();
