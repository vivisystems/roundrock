(function(){
    /**
     * Products View is support for controll panel  maintaince use.
     **/
    var NSIProductsView = window.NSIProductsView = GeckoJS.NSITreeViewArray.extend( {
        
        init: function(domId) {

            this._data = [];
            this.hideInvisible = this.hideInvisible || false;
            this._cateView = false;
            this._currentCateIndex = 0;

            if (GeckoJS.Session.get('products') == null) {
                this.updateProducts();
            }

            // binding dom
            this.bindingPanel(domId);

            // register eventListener
            this.registerEventListener();

        },

        bindingPanel: function(domId) {
            
            var prodscrollablepanel = document.getElementById(domId);
            //prodscrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.PluRows'));
            //prodscrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.PluCols'));
            //prodscrollablepanel.initGrid();
            prodscrollablepanel.datasource = this;

            if(this._cateView) this.setCatePanelIndex(this._currentCateIndex);

        },

        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'products') {
                    //self.updateProducts();
                    if(self._cateView) self.setCatePanelIndex(self._currentCateIndex);
                }
            });
            
        },

        updateProducts: function() {

            this._data = [];
            var products = GeckoJS.Session.get('products');

            if (products == null) {
                // find all product and update session.
                var prodModel = new ProductModel();
                products = prodModel.find('all', {
                    order: "cate_no"
                });

                if (products && products.length > 0) GeckoJS.Session.add('products', products);
            }

            var byId ={}, indexCate = {}, indexCateAll={}, indexLinkGroup = {}, indexLinkGroupAll={}, indexBarcode = {};
            
            if (products) products.forEach(function(product) {
                if (product.barcode == null) {
                    product.barcode = "";
                }

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
                    indexCateAll[(product.cate_no+"")].push((product.id+""));
                    if(GeckoJS.String.parseBoolean(product.visible)) indexCate[(product.cate_no+"")].push((product.id+""));
                }

                if (product.link_group && product.link_group.length > 0) {
                    var groups = product.link_group.split(',');

                    groups.forEach(function(group) {

                        if (typeof indexLinkGroup[group] == 'undefined') {
                            indexLinkGroup[group] = [];
                            indexLinkGroupAll[group] = [];
                        }
                        indexLinkGroupAll[(group+"")].push((product.id+""));
                        if(GeckoJS.String.parseBoolean(product.visible)) indexLinkGroup[(group+"")].push((product.id+""));
                        
                    });
                }
            });

            GeckoJS.Session.add('productsById', byId);
            GeckoJS.Session.add('barcodesIndexes', indexBarcode);
            GeckoJS.Session.add('productsIndexesByCate', indexCate);
            GeckoJS.Session.add('productsIndexesByCateAll', indexCateAll);
            GeckoJS.Session.add('productsIndexesByLinkGroup', indexLinkGroup);
            GeckoJS.Session.add('productsIndexesByLinkGroupAll', indexLinkGroupAll);

            /*
            this.log(this.dump(GeckoJS.Session.get('productsById')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCate')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCateAll')));
            this.log(this.dump(GeckoJS.Session.get('barcodesIndexes')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByLinkGroup')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByLinkGroupAll')));
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
            /*
            if (this.hideInvisible) {
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
            }else {
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
            }
            
            this._data = productsIndexesByCate[cate.no] || [];
            */
           
            if (this.hideInvisible) {
                if(typeof cate['no'] == 'undefined') {
                    // group
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByLinkGroup');
                    this._data = productsIndexesByCate[cate.id] || [];
                }else {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
                    this._data = productsIndexesByCate[cate.no] || [];
                }

            }else {
                if(typeof cate['no'] == 'undefined') {
                    // group
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                    this._data = productsIndexesByCate[cate.id] || [];
                }else {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
                    this._data = productsIndexesByCate[cate.no] || [];
                }
                /*
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
                this._data = productsIndexesByCate[cate.no] || productsIndexesByCate[cate.id] || [];
                */
            }

            try {
                this.tree.invalidate();
            }catch(e) {
                
                alert('error' + e);
            }

            
        },

        toggle: function() {
            this.hideInvisible = !this.hideInvisible;
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

                this.log('DEBUG', row +","+col +", id = " + id +", result = " +  sResult);
            }
            catch (e) {
                return "";
            }
            return sResult;

        },

        getImageSrc: function(row, col) {
            
            var val = this.getCellValue(row, col);
            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/data';
            var sPluDir = datapath + "/images/pluimages/";
            if (!sPluDir) sPluDir = '/data/images/pluimages/';
            sPluDir = (sPluDir + '/').replace(/\/+/g,'/');
            var aDstFile = sPluDir + val + ".png";
            if (GREUtils.File.exists(aDstFile)) {
                return 'file://' + aDstFile  /*+ "?"+ Math.random()*/;

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

            var classStr = '';

            if (buttonColor && btn) {
                classStr = buttonColor;
                //$(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'font-' + buttonFontSize;
                //$(btn).addClass('font-'+ buttonFontSize);
            }
            // display icon only?
            var icon_only = this.getCellValue(row,{
                id: 'icon_only'
            });
            var imageExists = (this.getImageSrc(row,{id: 'no'}) != null);

            if (imageExists) {
                if (icon_only) {
                    classStr += ((classStr.length > 0) ? ' ' : '') + 'nolabelbtn largeimagebtn';
                    //$(btn).addClass('nolabelbtn largeimagebtn');
                }
            }
            else {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'noimagebtn';
                //$(btn).addClass('noimagebtn');
            }
            if (classStr.length > 0) {
                $(btn).addClass(classStr);
            }
        }

    });

})();

