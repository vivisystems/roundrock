(function(){

    /**
     * Class PluSearch
     */

    GeckoJS.Controller.extend( {
        name: 'PluSearch',
        _listObj: null,
        _listDatas: null,
        _filterDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('pluscrollablepanel');
            }
            return this._listObj;
        },

        createFilterRows: function() {
            var self = this;
            var i=0;
            var rows_filter = document.getElementById('rows_filter');
            var filterstr = GeckoJS.Configure.read("vivipos.fec.settings.PluFilters") || "[]";
            this._filterDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(filterstr));
            this._filterDatas.forEach(function(o){
                var index = parseInt(o.index);
                var len = parseInt(o.length);
                var row = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:row");
                var filter_label = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:label");
                var filter_textbox = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:textbox");
                var label = o.filtername + " (" + index + "-" + (index + len - 1) + "):";
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
            var self = this;
            var lastItem = this._filterDatas[this._filterDatas.length - 1];
            var len = parseInt(lastItem.index) + parseInt(lastItem.length) - 1;
            var pattern = "";
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
            var conditions = "products.no like '" + barcode + "%' or products.barcode like '" + barcode + "%'";
            var prodModel = new ProductModel();
            var datas = prodModel.find('all',{fields: fields, conditions: conditions});
            this._listDatas = datas;
            this.getListObj().datasource = datas;
        },

        select: function(index) {
            //
            var barcode = this._listDatas[index].no;
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                // @todo OSD?
                alert(_('Product [%S] Not Found!', [barcode]));
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
                // document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
            }
        },

        searchPlu: function (barcode) {
            $('#plu').val('').focus();

            barcode = barcode.replace(/[_\xa0]+$/, '');
            if (barcode == "") return;

            this.load(barcode);

            if (this._listDatas.length <= 0) {
                // barcode notfound
                // @todo OSD?
                alert(_('Product [%S] Not Found!', [barcode]));
            } else if (this._listDatas.length == 1) {
                var product = this._listDatas[0];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
                // document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
            }else {
                // reset?
            }

        }
    });

})();
