(function() {

    var NSICategoriesView = window.NSICategoriesView = GeckoJS.NSITreeViewArray.extend({
        
        init: function(data) {

            this.showHidden = false;
                        
            if (GeckoJS.Session.get('categories') == null) {
                var cateModel = new CategoryModel();
                var categories = cateModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('categories', categories);

            }

            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                if (evt.data.key == 'categories') {
                    self.updateCategories();
                    self.refreshView();
                }
            });

            var catescrollablepanel = document.getElementById(data);
            catescrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows'));
            catescrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols'));
            catescrollablepanel.initGrid();
            catescrollablepanel.datasource = this;
            
            this.updateCategories();
            this.refreshView();


        },

        updateCategories: function() {
            var categories = GeckoJS.Session.get('categories');
            var byId ={}, indexCate = [], indexCateAll = [];

            categories.forEach(function(category) {

                if (category.id.length > 0) {
                    byId[category.id] = category;
                }
                
                if(category.visible) indexCate.push(category.id);
                indexCateAll.push(category.id);
                
            });

            GeckoJS.Session.add('categiesById', byId);
            GeckoJS.Session.add('categiesIndexes', indexCate);
            GeckoJS.Session.add('categiesIndexesAll', indexCateAll);

            this.log(this.dump(GeckoJS.Session.get('categiesById')));
            this.log(this.dump(GeckoJS.Session.get('categiesIndexes')));
            this.log(this.dump(GeckoJS.Session.get('categiesIndexesAll')));

        },

        refreshView: function() {


            var categiesIndexes;

            if (this.showHidden) {
                categiesIndexes = GeckoJS.Session.get('categiesIndexesAll');
            }else {
                categiesIndexes = GeckoJS.Session.get('categiesIndexes');
            }
            this._data = categiesIndexes;

            try {
                this.tree.invalidate();
            }catch(e) {}

        },

        toggle: function() {
            this.showHidden = !this.showHidden;

            this.refreshView();
        },

        getCurrentIndexData: function (row) {
            var id = this.data[row];
            var categories = GeckoJS.Session.get('categiesById');
            
            return categories[id];
        },

        getCellValue: function(row, col) {
            
            // this.log(row +","+col);
            var categories = GeckoJS.Session.get('categiesById');

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

            var aImageFile = "chrome://viviecr/content/skin/cateimages" + "/" + val + ".png" /*+ "?"+ Math.random()*/;

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
                $(btn).addClass('button-'+ buttonColor);
            }
            if (buttonFontSize && btn) {
                $(btn).addClass('font-'+ buttonFontSize);
            }

        }
    });

})();
