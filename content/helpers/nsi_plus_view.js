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
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }
        }

    });

})();

