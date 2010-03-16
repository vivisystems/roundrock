(function(){

    /**
     * PLUs View is support for mainscreen registration use.
     **/
    var NSIPlusView = window.NSIPlusView = NSIProductsView.extend( {
        
        init: function(domId) {

            this._data = [];
            this.hideInvisible = true;
            this._cateView = false;
            this._currentCateIndex = 0;

            // call parent init
            this._super(domId);

        },

        /*
         * binding panel override
         */
        bindingPanel: function(domId) {
            
            var prodscrollablepanel = document.getElementById(domId);
            prodscrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.PluRows'));
            prodscrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.PluCols'));
            prodscrollablepanel.initGrid();
            prodscrollablepanel.datasource = this;

            if(this._cateView) this.setCatePanelIndex(this._currentCateIndex);

            this._prodscrollablepanel = prodscrollablepanel;

        },

        /*
         * registerEventListener override
         */
        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                // maybe controllPanel update product session.
                // just refresh view , dont prepare product array to session.
                if (evt.data.key == 'productsIndexesByCateAll') {
                    if(self._cateView) self.setCatePanelIndex(self._currentCateIndex);
                }
            });

        },

        getProductCount: function(catindex, visibleOnly) {
            var cate = this._cateView.getCurrentIndexData(catindex);

            if(!cate) return 0;

            var categories, products;

            if (visibleOnly) {
                if(typeof cate['no'] == 'undefined') {
                    // group
                    categories = GeckoJS.Session.get('productsIndexesByLinkGroup');
                    products = categories[cate.id] || [];
                }else {
                    categories = GeckoJS.Session.get('productsIndexesByCate');
                    products = categories[cate.no] || [];
                }
            }else {

                if(typeof cate['no'] == 'undefined') {
                    // group
                    categories = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                    products = categories[cate.id] || [];
                }else {
                    categories = GeckoJS.Session.get('productsIndexesByCateAll');
                    products = categories[cate.no] || [];
                }
            }
            return products.length;
        },

        setCatePanelIndex: function(index) {

            this._currentCateIndex = index;

            var cate = this._cateView.getCurrentIndexData(index);

            if(! cate) return;

            var productsIndexesByCate;

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
            }
            try {
                //we cheat here, invoke vivibutton directly to reset to first page and refresh the buttons
                this._prodscrollablepanel.vivibuttonpanel.startOffset = 0;
                this._prodscrollablepanel.selectedIndex = 0;
                this._prodscrollablepanel.vivibuttonpanel.invalidate();
            }catch(e) {}

        },

        /**
         * FrontEnd style
         */
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

            // is this product unavailable?
            var unavailable = this.getCellValue(row,{
                id: 'unavailable'
            });

            // if empty buttons
            if( this.data[row] == "") unavailable = true;

            if (unavailable) {
                btn.disabled = true;
            }

            // sold out?
            var soldout = this.getCellValue(row,{
                id: 'soldout'
            });
            if (soldout) {
                btn.label = _('Sold Out -') + ' ' + btn.label;
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
                var imageExists = (this.getImageSrc(row,{id: 'no'}) != null);
                GREUtils.log('button size: ' + btn.clientWidth + 'x' + btn.clientHeight);

                if (imageExists) {
                    if (display_mode == 1) {
                        // dynamically set image size to that of the button
                        classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-label';
                        styleStr = 'width:' + btn.clientWidth + 'px; height:' + btn.clientHeight + 'px;';
                    }
                    else {
                        var btnlabel = btn.vivibuttonLabel;
                        styleStr = 'width:' + (btn.clientWidth * 0.95) + 'px; height:' + Math.max(btn.clientHeight * 0.9 - btnlabel.clientHeight, 0) + 'px;';
                        GREUtils.log('button label [' + btn.label + '] height [' + btnlabel.clientHeight + ']');
                    }
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

