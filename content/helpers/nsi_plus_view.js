(function(){

    /**
     * PLUs View is support for mainscreen registration use.
     **/
    var NSIPlusView = window.NSIPlusView = NSIProductsView.extend( {
        
        init: function(domId) {

            this._data = [];
            this.hideUnvisible = true;
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


        setCatePanelIndex: function(index) {

            this._currentCateIndex = index;

            var cate = this._cateView.getCurrentIndexData(index);

            if(! cate) return;

            var productsIndexesByCate;

            if (this.hideUnvisible) {
                if(typeof cate['no'] == 'undefined') {
                    // group
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByLinkGroup');
                    this._data = productsIndexesByCate[cate.id] || [];
                }else {
                    productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
                    this._data = productsIndexesByCate[cate.no] || [];
                }
                
            }else {
                productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCateAll');
                this._data = productsIndexesByCate[cate.no] || productsIndexesByCate[cate.id] || [];
            }

            try {
                this.tree.invalidate();
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

            if (buttonColor && btn) {
                $(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

            // display icon only?
            var prod_no = this.getCellValue(row,{
                id: 'name'
            });

            var icon_only = this.getCellValue(row,{
                id: 'icon_only'
            });
            var imageExists = (this.getImageSrc(row,{id: 'no'}) != null);

            if (imageExists) {
                if (icon_only) {
                    $(btn).addClass('nolabelbtn largeimagebtn');
                }
            }
            else {
                $(btn).addClass('noimagebtn');
            }
        }

    });

})();

