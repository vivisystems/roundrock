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

            this.Product = new ProductModel();

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
                // only minimal datas
                products = this.Product.getProductsWithSession();
            }
            
            this.Product.prepareProductCached(products);


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
                
                // alert('error' + e);
            }

            
        },

        toggle: function() {
            this.hideInvisible = !this.hideInvisible;
            this.setCatePanelIndex(this._currentCateIndex);
        },


        getCurrentIndexData: function (row) {
            
            var id = this.data[row];

            return this.Product.getProductById(id);
            
        },

        getCellValue: function(row, col) {
            
            // this.log(row +","+col);

            var sResult;
            var id;
            var key;

            try {

                key = col.id;
                id = this.data[row];
                if (id == "") return "";

                var product = this.Product.getProductById(id);
                sResult= product[key];
                this.log('DEBUG', row +","+col +", id = " + id +", result = " +  sResult);
            }
            catch (e) {
                return "";
            }
            return sResult;

        },

        getImageSrcq: function(row, col) {

            var cachedKey = 'pluimages' ;
            var colKey = col.id;
            var pid = this.data[row];

            if (pid == "") return null;

            var product = this.Product.getProductById(pid);

            if(!product) return null;
            if (product[cachedKey] === false ) return null;

            var aDstFile = false;

            if (product[cachedKey]) {

                aDstFile = product[cachedKey];
                return 'file://' + aDstFile ;
                
            }else {

                var val = productproduct[colKey];
                // var val = this.getCellValue(row, col);
                var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                var sPluDir = datapath + "/images/pluimages/";
                if (!sPluDir) sPluDir = '/data/images/pluimages/';
                sPluDir = (sPluDir + '/').replace(/\/+/g,'/');

                aDstFile = sPluDir + val + ".png";

                if (GREUtils.File.exists(aDstFile)) {
                    product[cachedKey] = aDstFile;
                    return 'file://' + aDstFile  /*+ "?"+ Math.random()*/;

                }else {
                    product[cachedKey] = false;
                    return null;
                }
            }

            // this.log('DEBUG', 'getImageSrc = ' + aDstFile);
            
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
                //$(btn).addClass(classStr);
                btn.className += ' ' +  classStr;
            }
        }

    });

})();

