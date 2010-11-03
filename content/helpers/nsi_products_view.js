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

            // register listener for refresh event
            this.tree.addEventListener('render', this.refreshCallback, true);

            // register eventListener
            this.registerEventListener();

        },

        bindingPanel: function(domId) {
            
            var prodscrollablepanel = document.getElementById(domId);
            prodscrollablepanel.datasource = this;

            if(this._cateView) this.setCatePanelIndex(this._currentCateIndex);

        },

        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'products') {
                    if(self._cateView) self.setCatePanelIndex(self._currentCateIndex);
                }
            });
            
        },

        refreshCallback: function(evt) {
            var node = evt.originalTarget;
            if (node) {
                var buttons = node.buttons || [];
                buttons.forEach(function(btn) {
                    btn.vivibuttonImage.removeAttribute('style');
                })
            }
        },

        updateProducts: function(force_reload) {

            force_reload =  force_reload || false;

            this._data = [];

            var products = GeckoJS.Session.get('products');
            var productsById = GeckoJS.Session.get('productsById');
            
            if (products == null || force_reload) {
                
                // find all product and update session.
                // only minimal datas
                products = this.Product.getProducts();

            }

            if (productsById == null || force_reload) {
                this.Product.prepareProductsSession(products);
            }

        },

        setCatePanelView: function(cateView) {
            this._cateView = cateView;
        },

        setCatePanelIndex: function(index) {

            this._currentCateIndex = index;

            var cate = this._cateView.getCurrentIndexData(index);

            if(! cate) return;
            
            var productsIndexesByCate;
           
            if (this.hideInvisible) {
                if(typeof cate['no'] == 'undefined') {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByLinkGroup');
                    this._data = productsIndexesByCate[cate.id] || [];
                }else {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
                    this._data = productsIndexesByCate[cate.no] || [];
                }

            }else {
                if(typeof cate['no'] == 'undefined') {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                    this._data = productsIndexesByCate[cate.id] || [];
                }else {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
                    this._data = productsIndexesByCate[cate.no] || [];
                }
            }
            try {
                this.tree.invalidate();
            }catch(e) {
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

            var productsById = GeckoJS.Session.get('productsById');
            
            var sResult;
            var id;
            var key;
            var product = null;

            try {

                key = col.id;
                id = this.data[row];
                if (id == "") return "";
                
                product = productsById[id];

                if (typeof product[key] == 'undefined' && key != 'unavailable' && key != 'soldout' && product._full_object_ == false ) {
                    product = this.Product.getProductById(id);
                }
                sResult= product[key];
                
                //this.log('DEBUG', row +","+col +", id = " + id +", result = " +  sResult);
            }
            catch (e) {
                return "";
            }
            return sResult;

        },

        getImageSrc: function(row, col) {

            var cachedKey = 'pluimages' ;
            var colKey = col.id;
            var pid = this.data[row];

            if (pid == "") return null;

            var productsById = GeckoJS.Session.get('productsById');

            //var product = this.Product.getProductById(pid);
            var product = productsById[pid];

            if(!product) return null;

            if (product[cachedKey] === false ) return null;

            var aDstFile = false;

            if (product[cachedKey]) {
                aDstFile = product[cachedKey];
                return 'file://' + aDstFile;
                
            }else {
                var val = product[colKey];
                var sPluDir = GeckoJS.Session.get('pluimage_directory');

                aDstFile = sPluDir + encodeURIComponent(val) + ".png";

                if (GREUtils.File.exists(aDstFile)) {
                    product[cachedKey] = aDstFile + '?' + product['imageCounter'];
                    return 'file://' + product[cachedKey];
                }else {
                    product[cachedKey] = false;
                    return null;
                }
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
            var styleStr = '';

            if (buttonColor && btn) {
                classStr = buttonColor;
                //$(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'font-' + buttonFontSize;
                //$(btn).addClass('font-'+ buttonFontSize);
            }
            // display text and/or icon?
            var display_mode = this.getCellValue(row,{
                id: 'display_mode'
            });

            if (display_mode == 2) {
                // text only
                classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-image';
            }
            else {
                var imageSrc = this.getImageSrc(row,{id: 'no'});
                var imageExists = (imageSrc != null);

                if (imageExists) {
                    if (display_mode == 1) {
                        // dynamically set image size to that of the button
                        classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-label';
                    }
                    // remove image source
                    btn.vivibuttonImage.removeAttribute('src');
                    btn.vivibuttonImage.setAttribute('flex', '1');

                    // set fully scaled product image using border image
                    styleStr = 'width:' + btn.clientWidth + 'px; min-width:' + btn.clientWidth + 'px;' +
                               '-moz-border-image: url(' + imageSrc + ') 0;';
                }
                else {
                    classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-image';
                }
            }

            if (classStr.length > 0) {
                btn.className += " " + classStr;
            }

            // set image size explicitly
            if (styleStr.length > 0) {
                btn.vivibuttonImage.setAttribute('style', styleStr);
            }
            else {
                btn.vivibuttonImage.removeAttribute('style');
            }
        }

    });

})();

