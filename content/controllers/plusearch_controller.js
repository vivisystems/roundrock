(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'PluSearch',
        
        _listObj: null,
        _listDatas: null,
        _filterDatas: null,
        _categoriesByNo: {},
        _categoryIndexByNo: {},
        _selectedIndex: -1,
        _selCateIndex: -1,

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return (s == null || s.length == 0) ? '' : s.replace( re, '\'\'' );
        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plusearchscrollablepanel');
            }
            return this._listObj;
        },

        createNavigationPanel: function () {
            // construct categoryByNo lookup table
            var categories = GeckoJS.Session.get('categories') || [];
            for (var i = 0; i < categories.length; i++) {
                this._categoriesByNo['' + categories[i].no] = categories[i];
                this._categoryIndexByNo['' + categories[i].no] = i;
            };

            // NSIDepartmentsView use rows and columns from preferences, so let's
            // save rows and columns attribute values here and restore them later
            var catpanel = document.getElementById('catescrollablepanel');
            var rows = catpanel.getAttribute('rows');
            var cols = catpanel.getAttribute('cols');

            this.catePanelView =  new NSIDepartmentsView('catescrollablepanel');

            // restore department panel rows and columns here
            catpanel.setAttribute('rows', rows);
            catpanel.setAttribute('cols', cols);
            catpanel.initGrid();

            var prodpanel = document.getElementById('prodscrollablepanel');
            rows = prodpanel.getAttribute('rows');
            cols = prodpanel.getAttribute('cols');

            this.productPanelView = new NSIPlusView('prodscrollablepanel');

            // restore department panel rows and columns here
            prodpanel.setAttribute('rows', rows);
            prodpanel.setAttribute('cols', cols);
            prodpanel.initGrid();

            this.catePanelView.hideInvisible = false;
            this.catePanelView.refreshView(true);

            this.productPanelView.hideInvisible = false;
            this.productPanelView.updateProducts();

            this.productPanelView.setCatePanelView(this.catePanelView);

            catpanel.selectedIndex = -1;
            catpanel.selectedItems = [];
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
                var filter_textbox = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul','xul:vivitextbox');
                var label = o.filtername + ' (' + index + '-' + (index + len - 1) + ')';
                filter_label.setAttribute('id', 'filter_label_' + i);
                filter_label.setAttribute('value', label);
                filter_textbox.setAttribute('id', 'filter_' + i++);
                filter_textbox.setAttribute('size', parseInt(o.length) + 2);
                filter_textbox.setAttribute('maxlength', o.length);
                filter_textbox.setAttribute('numpadClass', 'numpad');
                filter_textbox.setAttribute('fixedbtnClass', 'button-fixed');
                filter_textbox.setAttribute('popupKeypad', 'true');
                filter_textbox.setAttribute('keypad', 'numpad');
                row.appendChild(filter_label);
                row.appendChild(filter_textbox);
                rows_filter.appendChild(row);
            });
        },

        advSearch: function(nofillform) {
            var lastItem = this._filterDatas[this._filterDatas.length - 1];
            var len = parseInt(lastItem.index) + parseInt(lastItem.length) - 1;
            var pattern = '';
            var searchMessage = '';
            pattern = GeckoJS.String.padLeft(pattern, len, "_");
            var i=0;
            this._filterDatas.forEach(function(o){
                var f = GeckoJS.String.trim(document.getElementById('filter_' + i++).value);
                if (f.length > 0) {
                    var index = parseInt(o.index) - 1;
                    var len = parseInt(o.length);
                    var pat = new Array();
                        pat = pattern.split("");
                    for (var j=0; j < len; j++) {
                        pat[index + j] = f[j];
                    }
                    pattern = pat.join("");
                    searchMessage += ('    ' + o.filtername + '=' + f + '\n');
                }
            });
            this.searchPlu(pattern, searchMessage, nofillform, true);
        },

        advClear: function() {
            //
            var i=0;
            this._filterDatas.forEach(function(o){
                document.getElementById('filter_' + i++).value = "";
            });
        },

        changePluPanel: function(index) {
            if (this._selCateIndex == index) {
                return;
            }

            this.productPanelView.setCatePanelIndex(index);
            this._selCateIndex = index;

            this.clickPluPanel(-1);
        },

        clickPluPanel: function(index) {
            let data = this.productPanelView.getCurrentIndexData(index);
            if (data) {
                document.getElementById('plu').value = (data.no || '');
                if (data.no && data.no.length > 0) {
                    this.searchPlu(data.no, false, false, true);
                }
            }
            else {
                let prodpanel = document.getElementById('prodscrollablepanel');
                prodpanel.selectedItems = [];
            }
        },

        load: function(barcode, advanced) {
            var fields = [];
            var searchStr = this._queryStringPreprocessor(barcode);

            var conditions = "products.no like '" + searchStr + (advanced ? "%'" : ("%' or products.barcode like '" + searchStr + "%' or products.name like '%" + searchStr + "%'"));
            var prodModel = new ProductModel();
            var datas = prodModel.find('all',{fields: fields, conditions: conditions, recursive: 1});

            datas.forEach(function(product) {
                // for rendering stock quantity.
                var stockRecordModel = new StockRecordModel();
                var stockRecord = stockRecordModel.getStockRecordByProductNo( product.no );
                if (stockRecord) {
                    product.stock = stockRecord.quantity;
                } else {
                    product.stock = 0;
                }
            }, this);
            this._listDatas = datas;
            this.getListObj().datasource = datas;

        },

        select: function(index) {
            //
            var data = this._listDatas ? this._listDatas[index] : null;
            this.selectProduct(data);
        },

        selectProduct: function(data) {
            if (data) {
                GeckoJS.FormHelper.unserializeFromObject('productForm', data);
                // document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
                var inputObj = window.arguments[0];
                inputObj.item = data;

                var saleUnitMenu = document.getElementById('sale_unit');
                if (saleUnitMenu.selectedIndex == -1 && data.sale_unit != '') {
                    saleUnitMenu.insertItemAt(0, data.sale_unit, data.sale_unit);
                    saleUnitMenu.value = data.sale_unit;
                }
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

        searchPlu: function (barcode, advanced, nofillform, noswitchtab) {
            
            if (!noswitchtab) document.getElementById('mode_tabbox').selectedIndex = 1;
            
            barcode = barcode.replace(/[_\xa0]+$/, '');
            if (barcode == "") return;

            // reset form & list
            this.getListObj().selection.clearSelection();
            GeckoJS.FormHelper.reset('productForm');

            this.load(barcode, advanced);
            
            if (this._listDatas.length <= 0) {
                // barcode notfound

                if (advanced) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Product Search'),
                                          _('No products found with conditions') + ':\n\n' + advanced);
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Product Search'),
                                          _('Product [%S] Not Found!', [barcode]));
                }
            } else if (this._listDatas.length == 1) {
                var product = this._listDatas[0];
                
                if (!nofillform) this.select(0);
                if (window.arguments && window.arguments[0]) {
                    window.arguments[0].item = product;
                }

                // dispatch event
                this.dispatchEvent('selectPlu', {index: 0, product: product});
            }else {
                // reset?
            }

        },

        // this function performs a search without populating product form
        searchPlu2: function(barcode) {
            this.searchPlu(barcode, null, true, true);
        }
        
    };

    AppController.extend(__controller__);

})();
