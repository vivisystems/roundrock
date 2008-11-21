(function(){

    var NSIProductsView = window.NSIProductsView = GeckoJS.NSITreeViewArray.extend( {
        
        init: function(data) {

            this.showHidden = false;
            this._cateView = false;
            this._currentCateIndex = 0;

            if (GeckoJS.Session.get('products') == null) {
                var prodModel = new ProductModel();
                var products = prodModel.find('all', {
                    order: "cate_no"
                });

                GeckoJS.Session.add('products', products);
            }

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'products') {
                    self.updateProducts();
                    if(self._cateView) self.setCatePanelIndex(self._currentCateIndex);
                }
            });

            var prodscrollablepanel = document.getElementById(data);
            prodscrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.PluRows'));
            prodscrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.PluCols'));
            prodscrollablepanel.initGrid();
            prodscrollablepanel.datasource = this;

            this.updateProducts();
            if(this._cateView) this.setCatePanelIndex(this._currentCateIndex);


        },

        updateProducts: function() {

            this._data = [];
            var products = GeckoJS.Session.get('products');
            var byId ={}, indexCate = {}, indexCateAll={}, indexBarcode = {};
            
            products.forEach(function(product) {
                if (product.id.length > 0) {
                    byId[product.id] = product;
                }
                if (product.barcode.length > 0) {
                    indexBarcode[product.barcode] = product.id;
                }
                if (product.no.length > 0 && (product.barcode != product.no) ) {
                    indexBarcode[product.no] = product.id;
                }
                if (product.cate_no.length > 0) {
                    if (typeof indexCate[product.cate_no] == 'undefined') {
                        indexCate[product.cate_no] = [];
                        indexCateAll[product.cate_no] = [];
                    }
                    if(GeckoJS.String.parseBoolean(product.visible)) indexCate[product.cate_no].push(product.id);
                    indexCateAll[product.cate_no].push(product.id);
                }
            });

            GeckoJS.Session.add('productsById', byId);
            GeckoJS.Session.add('barcodesIndexes', indexBarcode);
            GeckoJS.Session.add('productsIndexesByCate', indexCate);
            GeckoJS.Session.add('productsIndexesByCateAll', indexCateAll);

            /*
            this.log(this.dump(GeckoJS.Session.get('productsById')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCate')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCateAll')));
            this.log(this.dump(GeckoJS.Session.get('barcodesIndexes')));
            */
            
        },

        setCatePanelView: function(cateView) {
            this._cateView = cateView;
        },

        setCatePanelIndex: function(index) {

            this._currentCateIndex = index;

            var cate = this._cateView.getCurrentIndexData(index);

            if(! cate) return;
            
            var productsIndexesByCate;

            if (this.showHidden) {
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
            }else {
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
            }
            this._data = productsIndexesByCate[cate.no];

            try {
                this.tree.invalidate();
            }catch(e) {}

            
        },

        toggle: function() {
            this.showHidden = !this.showHidden;
            this.setCatePanelIndex(this._currentCateIndex);
        },


        getCurrentIndexData: function (row) {
            
            var id = this.data[row];
            var products = GeckoJS.Session.get('productsById');
            
            return products[id];
        },

        getCellValue: function(row, col) {
            
            // this.log(row +","+col);
            var products = GeckoJS.Session.get('productsById');

            var sResult;
            var id;
            var key;

            try {
                key = col.id;
                id = this.data[row];
                sResult= products[id][key];
            }
            catch (e) {
                return "";
            }
            return sResult;

        },

        getImageSrc: function(row, col) {
            
            var val = this.getCellValue(row, col);
            //this.log('getImageSrc = ' + row + ", " +col.id + "," + val);

            var aImageFile = "chrome://viviecr/content/skin/pluimages" + "/" + val + ".png" /*+ "?"+ Math.random()*/;
            if (GREUtils.File.exists(GREUtils.File.chromeToPath(aImageFile))) {
                return aImageFile;

            }else {
                return null;
            }
        },

        renderButton: function(row, btn) {

            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });

            if (buttonColor && btn) {
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }
        }

    });

})();

