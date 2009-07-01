(function() {

    var NSIDepartmentsView = window.NSIDepartmentsView = NSICategoriesView.extend({
        
        init: function(domId) {

            this._data = [];
            this.hideInvisible = true;
            this.plugroupsFirst = false;
            this._path = [];

            var plugroupModel = new PlugroupModel();
            var plugroups = plugroupModel.find('all', {order: 'display_order, name'});


            var visiblePlugroups = [], allPlugroups = [], plugroupsById= {};
            if (plugroups) plugroups.forEach(function(plugroup) {
                if(GeckoJS.String.parseBoolean(plugroup.visible)) visiblePlugroups.push(plugroup.id);
                allPlugroups.push(plugroup.id);

                plugroupsById[plugroup.id] = plugroup;
            }, this);
            
            GeckoJS.Session.set('visiblePlugroups', visiblePlugroups);
            GeckoJS.Session.set('allPlugroups', allPlugroups);
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
            this.refreshView(false);
            catescrollablepanel.datasource = this;
            

        },


        /*
         * registerEventListener override
         */
        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                // maybe controllPanel update categories session.
                // just refresh view , dont prepare categories array to session.
                if (evt.data.key == 'categoriesIndexesAll' || evt.data.key == 'visiblePlugroups' || evt.data.key == 'allPlugroups') {
                    self.refreshView(true);
                }
            });

        },


        refreshView: function(autoInvalidate) {

            autoInvalidate = autoInvalidate || false;
            this.plugroupsFirst = GeckoJS.Configure.read('vivipos.fec.settings.ShowPlugroupsFirst');
            
            var departmentsIndexes;
            if (this.hideInvisible) {
                if (this.plugroupsFirst)
                    departmentsIndexes = GeckoJS.Session.get('visiblePlugroups').concat(GeckoJS.Session.get('categoriesIndexes'));
                else
                    departmentsIndexes = GeckoJS.Session.get('categoriesIndexes').concat(GeckoJS.Session.get('visiblePlugroups'));
            }else {
                if (this.plugroupsFirst)
                    departmentsIndexes = GeckoJS.Session.get('allPlugroups').concat(GeckoJS.Session.get('categoriesIndexesAll'));
                else
                    departmentsIndexes = GeckoJS.Session.get('categoriesIndexesAll').concat(GeckoJS.Session.get('allPlugroups'));
            }
            this._data = departmentsIndexes;
            try {
                if (autoInvalidate) this.tree.invalidate();
            }catch(e) {}

        },

        navigateDown: function(departmentIndexes) {

            // for our protection, we limit depths to 20

            if (this._path.length < 20) {
                // push current department indexes on to stack
                this._path.push(this._data);

                // set given department indexes as the current set of departments
                this._data = departmentIndexes;

                this.tree.selectedIndex = -1;
                this.tree.selectedItems = [];
                this.tree.ensureIndexIsVisible(0);
                this.tree.invalidate();
            }
        },

        navigateUp: function() {
            // pop last set of departments
            var data = this._path.pop();

            this.tree.selectedIndex = -1;
            this.tree.selectedItems = [];

            if (data) {
                this._data = data;
                this.tree.ensureIndexIsVisible(0);
                this.tree.invalidate();
            }
            else {
                this.refreshView(true);
            }
        },

        navigateTop: function() {
            this._path = [];
            this.tree.selectedIndex = -1;
            this.tree.selectedItems = [];
            this.tree.ensureIndexIsVisible(0);

            this.refreshView(true);
        },

        getCurrentLevel: function() {
            return this._path.length;
        },
        
        getCurrentIndexData: function (row) {
            var id = this.data[row];
            var categories = GeckoJS.Session.get('categoriesById');
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

        /*
         * FrontEnd style
         */
        renderButton: function(row, btn) {
            
            var buttonColor = this.getCellValue(row,{
                id: 'button_color'
            });
            var buttonFontSize = this.getCellValue(row,{
                id: 'font_size'
            });
            // var $btn = $(btn);
            var classStr = '';

            if (buttonColor && btn) {
                classStr = buttonColor;
                //$btn.addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'font-' + buttonFontSize;
                //$btn.addClass('font-'+ buttonFontSize);
            }

            if (classStr.length > 0) {
                // $btn.addClass(classStr);
                btn.className += " " + classStr;
            }

            // force no list style image at dep
            //$btn.css('list-style-image', 'none');
            btn.style['list-style-image'] = 'none';

            // sold out?
            var soldout = this.getCellValue(row,{
                id: 'soldout'
            });
            if (soldout) {
                btn.label = _('Sold Out -') + ' ' + btn.label;
            }

        }
    });

})();
