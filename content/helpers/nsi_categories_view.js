(function() {

    var NSICategoriesView = window.NSICategoriesView = GeckoJS.NSITreeViewArray.extend({
        
        init: function(domId) {

            this._data = [];
            this.hideInvisible = this.hideInvisible || false;

            if (GeckoJS.Session.get('categories') == null) {
                this.updateCategories();
            }

            // binding dom
            this.bindingPanel(domId);

            // register eventListener
            this.registerEventListener();

        },

        bindingPanel: function(domId) {

            var catescrollablepanel = document.getElementById(domId);
            //catescrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows'));
            //catescrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols'));
            //catescrollablepanel.initGrid();
            catescrollablepanel.datasource = this;
            this.refreshView();

        },

        registerEventListener: function() {

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'categories') {
                    self.updateCategories();
                    self.refreshView();
                }
            });

        },


        updateCategories: function() {
            var categories = GeckoJS.Session.get('categories');

            if (categories == null) {
                // find all categories and update session.
                var cateModel = new CategoryModel();
                categories = cateModel.find('all', {
                    order: "display_order, name"
                });
                if (categories && categories.length > 0) GeckoJS.Session.add('categories', categories);

            }
            var byId ={}, indexCate = [], indexCateAll = [];

            if (categories) categories.forEach(function(category) {

                if (category.id.length > 0) {
                    byId[category.id] = category;
                }

                if(GeckoJS.String.parseBoolean(category.visible)) indexCate.push(category.id);
                indexCateAll.push(category.id);
                
            });

            GeckoJS.Session.add('categoriesById', byId);
            GeckoJS.Session.add('categoriesIndexes', indexCate);
            GeckoJS.Session.add('categoriesIndexesAll', indexCateAll);

        },

        refreshView: function() {

            var categoriesIndexes;

            if (this.hideInvisible) {
                categoriesIndexes = GeckoJS.Session.get('categoriesIndexes');
            }else {
                categoriesIndexes = GeckoJS.Session.get('categoriesIndexesAll');
            }
            this._data = categoriesIndexes;
            try {
                this.tree.invalidate();
            }
            catch(e) {}

        },

        toggle: function() {
            this.hideInvisible = !this.hideInvisible;

            this.refreshView();
        },

        getCurrentIndexData: function (row) {
            var id = this.data[row];
            var categories = GeckoJS.Session.get('categoriesById');
            
            return categories[id];
        },

        getCellValue: function(row, col) {
            
            // this.log(row +","+col);
            var categories = GeckoJS.Session.get('categoriesById');

            var sResult;
            var id;
            var key;

            try {
                key = col.id;
                id = this.data[row];
                sResult= categories[id][key];
            }
            catch (e) {
                return "";
            }
            return sResult;

        },


        getImageSrc: function(row, col) {
            var val = this.getCellValue(row, col);

            var aImageFile = "chrome://viviecr/skin/cateimages" + "/" + val + ".png" /*+ "?"+ Math.random()*/;

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
                $(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        }
    });

})();
