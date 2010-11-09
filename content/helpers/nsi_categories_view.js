(function() {

    var NSICategoriesView = window.NSICategoriesView = GeckoJS.NSITreeViewArray.extend({
        
        init: function(domId) {

            this._data = [];
            this.hideInvisible = this.hideInvisible || false;

            var categories = GeckoJS.Session.get('categories');
            if (categories == null)
                this.updateCategories();

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
                    order: "display_order, name COLLATE NOCASE"
                });
                if (categories && categories.length > 0) GeckoJS.Session.add('categories', categories);

            }
            var byId ={}, byNo = {}, indexCate = [], indexCateAll = [], saleable = [];

            if (categories) categories.forEach(function(category) {

                if (category.id.length > 0) {
                    byId[category.id] = category;
                }

                if (category.no.length > 0) {
                    byNo[category.no] = category;
                }

                if (category.cansale) {
                    saleable.push(category.id);
                }

                if(GeckoJS.String.parseBoolean(category.visible)) indexCate.push(category.id);
                indexCateAll.push(category.id);
                
            });

            // sort saleable departments by display_order, department name
            saleable.sort(function(a, b) {
                if (a.display_order == b.display_order) {
                    if (a.name < b.name) return -1;
                    else if (a.name == b.name) return 0;
                    else return 1;
                }
                else {
                    return a.display_order - b.display_order;
                }
            });

            GeckoJS.Session.add('categoriesById', byId);
            GeckoJS.Session.add('categoriesByNo', byNo);
            GeckoJS.Session.add('categoriesSaleable', saleable);
            GeckoJS.Session.add('categoriesIndexes', indexCate);
            GeckoJS.Session.add('categoriesIndexesAll', indexCateAll);

            this._categoriesById = byId;

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

        getValue: function() {

            var selectedItems = this.tree.selectedItems.sort(function(a,b) {return a - b});
            var selectedItemsStr = [];
            var data = this._data;
            selectedItems.forEach(function(idx){
                selectedItemsStr.push(data[idx]);
            });

            return selectedItemsStr.join(',');
        },

        setValue: function(items) {

            var selectedItemsStr = items.split(',');
            var selectedItems = [];

            var dataIdIndex = GeckoJS.Array.objectExtract(this._data, '{n}.id');

            selectedItemsStr.forEach(function(id){
                var index = GeckoJS.Array.inArray(id, dataIdIndex);
                if (index != -1) selectedItems.push(index);
            });
            this.tree.selectedItems = selectedItems;

        },

        getCurrentIndexData: function (row) {
            var id = this.data[row];
            var categories = GeckoJS.Session.get('categoriesById');
            
            return categories[id];
        },

        getCellValue: function(row, col) {
            
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
            var sPluDir = GeckoJS.Session.get('pluimage_directory');
            // category/department prefix dep_
            var sFilename = (val+"").replace(/[\/\\.:\*\s<>?|]+/g, '_');
            var aDstFile = sPluDir + "dep_" + sFilename + ".png";
            if (GREUtils.File.exists(aDstFile)) {
                return 'file://' + aDstFile;

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

            var classStr = '';
            if (buttonColor && btn) {
                classStr = buttonColor;
                //$(btn).addClass(buttonColor);
            }
            if (buttonFontSize && btn) {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'font-' + buttonFontSize;
                //$(btn).addClass('font-'+ buttonFontSize);
            }

            // check image exists?
            var imageSrc = this.getImageSrc(row,{id: 'no'});
            var imageExists = (imageSrc != null);

            if (imageExists) {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-label';
            }else {
                classStr += ((classStr.length > 0) ? ' ' : '') + 'button-no-image';
            }
            
            if (classStr.length > 0) {
                // $(btn).addClass(classStr);
                btn.className += " " + classStr;
            }

        }
    });

})();
