(function() {

    var NSIDepartmentsView = window.NSIDepartmentsView = NSICategoriesView.extend({
        
        init: function(domId) {

            this._data = [];
            this.hideUnvisible = true;

            // call parent init
            this._super(domId);

        },

        /*
         * binding panel override
         */
        bindingPanel: function(domId) {

            var catescrollablepanel = document.getElementById(domId);
            catescrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows'));
            catescrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols'));
            catescrollablepanel.initGrid();
            catescrollablepanel.datasource = this;
            this.refreshView();

        },

        /*
         * registerEventListener override
         */
        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                // maybe controllPanel update categories session.
                // just refresh view , dont prepare categories array to session.
                if (evt.data.key == 'categories') {
                    self.refreshView();
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
