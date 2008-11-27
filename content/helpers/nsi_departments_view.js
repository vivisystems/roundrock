(function() {

    var NSIDepartmentsView = window.NSIDepartmentsView = NSICategoriesView.extend({
        
        init: function(domId) {

            this._data = [];
            this.hideUnvisible = true;

            var plugroupModel = new PlugroupModel();
            var plugroups = plugroupModel.find('all');


            var visiblePluGroups = [], plugroupsById= {};
            plugroups.forEach(function(plugroup) {
                if(GeckoJS.String.parseBoolean(plugroup.visible)) visiblePluGroups.push(plugroup.id);

                plugroupsById[plugroup.id] = plugroup;
            }, this);
            
            this.visiblePluGroups = visiblePluGroups;
            GeckoJS.Session.set('plugroupsById', plugroupsById);

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
                if (evt.data.key == 'categiesIndexesAll') {
                    self.refreshView();
                }
            });

        },

        refreshView: function() {

            var departmentsIndexes;

            if (this.hideUnvisible) {
                departmentsIndexes = GeckoJS.Session.get('categiesIndexes').concat(this.visiblePluGroups);
            }else {
                departmentsIndexes = GeckoJS.Session.get('categiesIndexesAll');
            }
            this._data = departmentsIndexes;

            try {
                this.tree.invalidate();
            }catch(e) {}

        },


        getCurrentIndexData: function (row) {
            var id = this.data[row];
            var categories = GeckoJS.Session.get('categiesById');
            var plugroupsById = GeckoJS.Session.get('plugroupsById');

            if (typeof categories[id] == 'undefined') {
                // try plugroup
                return plugroupsById[id];
            }
            return categories[id];
        },

        getCellValue: function(row, col) {

            // this.log(row +","+col);

            var category = this.getCurrentIndexData(row);

            var sResult;
            var key;

            try {
                key = col.id;
                sResult= category[key];
            }
            catch (e) {
                return "";
            }
            return sResult;

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
